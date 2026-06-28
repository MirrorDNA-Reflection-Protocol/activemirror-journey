#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import json
import re
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from html import unescape
from pathlib import Path
from typing import Any, Iterable, Mapping


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST_PATH = Path("docs/contracts/active_mirror_truth_manifest.json")

PASSING_VERIFICATION_STATES = {"source_backed", "receipt_backed", "verified"}

CLAIM_PATTERNS: list[tuple[str, str, str]] = [
    ("verified_word", r"\bverif(?:y|ied|ies|ication)\b", "Verified-language requires a scoped manifest."),
    ("proof_claim", r"\b(?:proof|receipt|evidence|provenance|source(?:d| record| scope| ref| refs| binding))\b", "Proof/source claims require source or receipt binding."),
    ("absolute_claim", r"\b(?:every|always|never|nothing|guarantee(?:s|d)?|exactly)\b", "Absolute public claims require explicit scope."),
    ("privacy_claim", r"\b(?:private(?: mirror| workspace| context| ai| memory| place)?|privacy|local-only|local only|local-first|local first|owned by you|belongs to you|stays yours|your data|your consent)\b", "Privacy/ownership claims require source or contract binding."),
    ("security_claim", r"\b(?:secure|security|secret|secrets|safe|safely|boundary|boundaries|consent gate|approval boundary)\b", "Safety/security claims require source or policy binding."),
    ("sovereignty_claim", r"\b(?:sovereign|sovereignty|native to your hardware|cloud is optional|no cloud|do not ingest|don't ingest)\b", "Sovereignty/cloud claims require source or architecture binding."),
]

NUMERIC_CLAIM = re.compile(
    r"\b(?:\d+\s*(?:days?|repos?|repo|models?|routes?|services?|agents?|percent|%)|"
    r"\d{1,3}(?:,\d{3})+|\$\s*\d+(?:\.\d+)?(?:\s*[kmbt])?)\b",
    re.IGNORECASE,
)

HTML_BLOCK_RE = re.compile(r"(?is)<(script|style|svg)[^>]*>.*?</\1>")
HTML_COMMENT_RE = re.compile(r"(?is)<!--.*?-->")
HTML_TAG_RE = re.compile(r"(?s)<[^>]+>")
META_CONTENT_RE = re.compile(r"""content=(["'])(.*?)\1""", re.IGNORECASE)
JS_STRING_RE = re.compile(r"""(["'`])((?:\\.|(?!\1).)*)\1""")
JSX_EXPR_RE = re.compile(r"\{[^{}]*\}")


@dataclass(frozen=True)
class TextFragment:
    path: Path
    line: int
    text: str


def _now() -> str:
    return datetime.now(UTC).isoformat()


def _repo_relative(path: Path, repo_root: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError:
        return path.resolve().as_posix()


def _manifest_path(repo_root: Path, manifest_path: Path | None) -> Path:
    path = manifest_path or DEFAULT_MANIFEST_PATH
    return path if path.is_absolute() else repo_root / path


def _read_manifest(repo_root: Path, manifest_path: Path | None) -> dict[str, Any]:
    path = _manifest_path(repo_root, manifest_path)
    if not path.is_file():
        return {
            "schema_version": "active_mirror.truth_manifest.v1",
            "policy": {
                "volunteer_bad_news": True,
                "verified_word_requires_scoped_manifest": True,
                "public_success_claim_requires_source": True,
            },
            "checked_surface_globs": [],
            "skipped_surface_globs": [],
            "claim_bindings": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def _is_skipped(path: Path, repo_root: Path, skipped_globs: Iterable[Mapping[str, Any]]) -> bool:
    rel = _repo_relative(path, repo_root)
    for row in skipped_globs:
        pattern = str(row.get("glob") or "")
        if pattern and fnmatch.fnmatch(rel, pattern):
            return True
    return False


def _surface_paths(repo_root: Path, globs: Iterable[str], skipped_globs: Iterable[Mapping[str, Any]]) -> list[Path]:
    paths: set[Path] = set()
    for pattern in globs:
        paths.update(p for p in repo_root.glob(pattern) if p.is_file() and not _is_skipped(p, repo_root, skipped_globs))
    return sorted(paths)


def _clean_text(value: str) -> str:
    return " ".join(unescape(value).replace("\\n", " ").replace("\\t", " ").split())


def _is_non_claim_fragment(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return True
    if stripped.startswith(("#", ".", "/", "http://", "https://")):
        return True
    if re.fullmatch(r"[A-Za-z0-9_./:-]+", stripped):
        return True
    if stripped.lower() in {"source", "receipt", "proof", "privacy", "private", "terms", "saved", "open chat"}:
        return True
    if stripped.startswith(("import ", "export ", "const ", "let ", "var ", "function ", "return ", "className=", "aria-")):
        return True
    if re.search(r"\b(?:test|pattern|intent|source|status|route|page|surface|key|id|label|title|copy|body|text|helper|className|style)\s*[:=]", stripped):
        return True
    if _looks_like_style_or_code(stripped):
        return True
    if "Private Limited" in stripped:
        return True
    return False


def _looks_like_style_or_code(text: str) -> bool:
    stripped = text.strip()
    if any(token in stripped for token in ("rgba(", "radial-gradient", "linear-gradient", "shadow-[", "bg-[", "rounded-[", "max-w-[", "min-h-[", "safe-area-inset")):
        return True
    tokens = stripped.split()
    if len(tokens) >= 3:
        class_like = sum(
            1
            for token in tokens
            if re.search(r"(?:^|:)(?:bg|text|border|rounded|shadow|ring|px|py|p|m|mt|mb|mx|my|gap|grid|flex|items|justify|w|h|min|max|opacity|transition|hover|sm|md|lg|xl)-", token)
            or "[" in token
            or "/" in token
        )
        if class_like / len(tokens) >= 0.45:
            return True
    punctuation = sum(1 for char in stripped if char in "{}[]()=;<>")
    if len(stripped) > 20 and punctuation / max(len(stripped), 1) >= 0.18:
        return True
    return False


def _html_fragments(path: Path) -> list[TextFragment]:
    text = path.read_text(encoding="utf-8", errors="replace")
    text = HTML_BLOCK_RE.sub(" ", text)
    text = HTML_COMMENT_RE.sub(" ", text)
    fragments: list[TextFragment] = []
    for line_no, raw in enumerate(text.splitlines(), start=1):
        meta_values = [match.group(2) for match in META_CONTENT_RE.finditer(raw)]
        stripped = "" if meta_values else _clean_text(HTML_TAG_RE.sub(" ", raw))
        for candidate in [*meta_values, stripped]:
            cleaned = _clean_text(candidate)
            if cleaned and not _is_non_claim_fragment(cleaned):
                fragments.append(TextFragment(path=path, line=line_no, text=cleaned))
    return fragments


def _jsx_text_fragment(raw: str) -> str:
    without_tags = HTML_TAG_RE.sub(" ", raw)
    without_expr = JSX_EXPR_RE.sub(" ", without_tags)
    cleaned = _clean_text(without_expr)
    if not re.search(r"[A-Za-z]", cleaned):
        return ""
    if len(cleaned) < 12:
        return ""
    if _is_non_claim_fragment(cleaned):
        return ""
    return cleaned


def _js_fragments(path: Path) -> list[TextFragment]:
    fragments: list[TextFragment] = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), start=1):
        for match in JS_STRING_RE.finditer(raw):
            cleaned = _clean_text(match.group(2))
            if len(cleaned) >= 12 and re.search(r"[A-Za-z]", cleaned) and not _is_non_claim_fragment(cleaned):
                fragments.append(TextFragment(path=path, line=line_no, text=cleaned))
        if path.suffix.lower() in {".jsx", ".tsx"}:
            cleaned = _jsx_text_fragment(raw)
            if cleaned:
                fragments.append(TextFragment(path=path, line=line_no, text=cleaned))
    return fragments


def _fragments_for(path: Path) -> list[TextFragment]:
    suffix = path.suffix.lower()
    if suffix in {".html", ".htm"}:
        return _html_fragments(path)
    if suffix in {".js", ".jsx", ".ts", ".tsx"}:
        return _js_fragments(path)
    return []


def _binding_matches_text(binding: Mapping[str, Any], text: str) -> bool:
    if phrase := str(binding.get("phrase") or "").strip():
        return phrase.lower() in text.lower()
    if pattern := str(binding.get("pattern") or "").strip():
        return bool(re.search(pattern, text, re.IGNORECASE))
    return False


def _source_refs_exist(binding: Mapping[str, Any], repo_root: Path) -> bool:
    refs = binding.get("source_refs") or []
    return bool(refs) and all((repo_root / str(ref)).exists() for ref in refs)


def _binding_supports(binding: Mapping[str, Any], repo_root: Path) -> bool:
    state = str(binding.get("verification_state") or "")
    return state in PASSING_VERIFICATION_STATES and _source_refs_exist(binding, repo_root)


def _supporting_binding(text: str, bindings: Iterable[Mapping[str, Any]], repo_root: Path) -> Mapping[str, Any] | None:
    for binding in bindings:
        if _binding_matches_text(binding, text) and _binding_supports(binding, repo_root):
            return binding
    return None


def _manifest_findings(bindings: list[Mapping[str, Any]], repo_root: Path) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    for binding in bindings:
        source_refs = binding.get("source_refs") or []
        for source_ref in source_refs:
            if not (repo_root / str(source_ref)).exists():
                findings.append(
                    {
                        "severity": "blocker",
                        "category": "manifest_source_missing",
                        "path": "docs/contracts/active_mirror_truth_manifest.json",
                        "line": 1,
                        "matched": str(source_ref),
                        "text": f"Claim binding {binding.get('claim_id') or '<unnamed>'} references a missing source.",
                        "manifest_claim_id": binding.get("claim_id") or "",
                        "manifest_verification_state": binding.get("verification_state") or "missing",
                        "reason": "A manifest source reference must exist locally before it can support public copy.",
                        "required_next": "Fix the source_ref path or remove the binding.",
                    }
                )
    return findings


def _line_findings(fragment: TextFragment, repo_root: Path, bindings: list[Mapping[str, Any]]) -> list[dict[str, Any]]:
    text = fragment.text
    matched_binding = _supporting_binding(text, bindings, repo_root)
    if matched_binding:
        return []

    findings: list[dict[str, Any]] = []
    for category, pattern, reason in CLAIM_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if not match:
            continue
        findings.append(
            {
                "severity": "blocker",
                "category": category,
                "path": _repo_relative(fragment.path, repo_root),
                "line": fragment.line,
                "matched": match.group(0),
                "text": text[:280],
                "manifest_claim_id": "",
                "manifest_verification_state": "missing",
                "reason": reason,
                "required_next": "Bind this claim in active_mirror_truth_manifest.json with existing source_refs, or soften/remove it from the public surface.",
            }
        )
    for match in NUMERIC_CLAIM.finditer(text):
        value = match.group(0)
        if re.fullmatch(r"20\d{2}", value):
            continue
        findings.append(
            {
                "severity": "blocker",
                "category": "hard_numeric_claim",
                "path": _repo_relative(fragment.path, repo_root),
                "line": fragment.line,
                "matched": value,
                "text": text[:280],
                "manifest_claim_id": "",
                "manifest_verification_state": "missing",
                "reason": "Hard public numbers require source or receipt binding.",
                "required_next": "Bind the number to an existing source/receipt or make it explicitly illustrative/non-public.",
            }
        )
    return findings


def run_truth_gate(*, repo_root: Path, manifest_path: Path | None = None) -> dict[str, Any]:
    repo_root = Path(repo_root).resolve()
    manifest = _read_manifest(repo_root, manifest_path)
    checked_globs = list(manifest.get("checked_surface_globs") or [])
    skipped_globs = list(manifest.get("skipped_surface_globs") or [])
    bindings = list(manifest.get("claim_bindings") or [])
    checked_paths = _surface_paths(repo_root, checked_globs, skipped_globs)

    findings = _manifest_findings(bindings, repo_root)
    fragments_count = 0
    for path in checked_paths:
        fragments = _fragments_for(path)
        fragments_count += len(fragments)
        for fragment in fragments:
            findings.extend(_line_findings(fragment, repo_root, bindings))

    blockers = [finding for finding in findings if finding["severity"] == "blocker"]
    status = "PASS" if not blockers else "FAIL"
    bad_news = []
    if blockers:
        bad_news.append(
            f"{len(blockers)} unbound or unsupported public claim(s) found across {len(checked_paths)} checked Active Mirror product-source file(s)."
        )
    if skipped_globs:
        bad_news.append(
            f"{len(skipped_globs)} surface scope(s) are explicitly skipped; this is scoped verification, not whole-repo or whole-computer truth."
        )
    if not bindings:
        bad_news.append("No source-backed claim bindings are present in the Active Mirror truth manifest.")

    return {
        "schema_version": "active_mirror.truth_gate_result.v1",
        "status": status,
        "created_at": _now(),
        "scope": {
            "repo_root": repo_root.as_posix(),
            "manifest_path": _repo_relative(_manifest_path(repo_root, manifest_path), repo_root),
            "checked_surface_globs": checked_globs,
            "checked_files": [_repo_relative(path, repo_root) for path in checked_paths],
            "skipped_surface_globs": skipped_globs,
            "fragments_scanned": fragments_count,
        },
        "summary": {
            "checked_file_count": len(checked_paths),
            "claim_binding_count": len(bindings),
            "finding_count": len(findings),
            "blocker_count": len(blockers),
        },
        "bad_news": bad_news,
        "findings": findings,
        "limitations": [
            "This gate scans canonical product-source presentation files, not every legacy static page in public/.",
            "It catches high-risk public copy and hard numbers; it does not prove every implied claim is true.",
            "A PASS means checked claims are bound to local source references, not that Active Mirror is externally certified.",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Active Mirror product-source truth gate.")
    parser.add_argument("--repo-root", default=str(ROOT))
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST_PATH))
    parser.add_argument("--out", help="Write the JSON result to this path.")
    parser.add_argument("--no-fail", action="store_true", help="Write/report findings but exit 0.")
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    result = run_truth_gate(repo_root=repo_root, manifest_path=Path(args.manifest))
    if args.out:
        out_path = Path(args.out)
        if not out_path.is_absolute():
            out_path = repo_root / out_path
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, sort_keys=True))
    if result["status"] != "PASS" and not args.no_fail:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

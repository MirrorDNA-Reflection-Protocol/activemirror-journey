#!/usr/bin/env python3
"""
MirrorGate Test Suite
Run: python3 test_mirrorgate.py
"""

import re

# Import validation logic (copy from safety_proxy.py for standalone testing)
# Use straight quotes consistently
REQUIRED_SECTIONS = [
    "⟡ What you're deciding:",
    "⧈ What you're assuming:",
    "⧉ What's at stake:",
    "?"
]

FORBIDDEN_OUTPUT_PATTERNS = [
    re.compile(r'\byou should\b', re.I),
    re.compile(r'\bi recommend\b', re.I),
    re.compile(r'\bdefinitely\b', re.I),
    re.compile(r'\bstudies show\b', re.I),
]

def validate_output(text):
    violations = []
    last_index = -1
    for section in REQUIRED_SECTIONS:
        index = text.find(section)
        if index == -1:
            violations.append(f"missing: {section[:20]}")
        elif index < last_index:
            violations.append(f"wrong_order: {section[:20]}")
        else:
            last_index = index
    
    question_marks = text.count('?')
    if question_marks == 0:
        violations.append("no_question_mark")
    elif question_marks > 1:
        violations.append("too_many_questions")
    
    for pattern in FORBIDDEN_OUTPUT_PATTERNS:
        if pattern.search(text):
            violations.append(f"forbidden: {pattern.pattern[:15]}")
    
    return len(violations) == 0, violations


# ═══════════════════════════════════════════════════════════════════════════════
# TEST CASES
# ═══════════════════════════════════════════════════════════════════════════════

def test_valid_output():
    """Valid schema should pass"""
    valid = """⟡ What you're deciding:
Whether to leave your current job for a startup opportunity.

⧈ What you're assuming:
• The startup will succeed
• Your current job won't improve

⧉ What's at stake:
• Growth and equity if the startup works
• Stability and income if it doesn't

? What would you regret more in five years"""
    
    is_valid, violations = validate_output(valid)
    assert is_valid, f"Valid output should pass: {violations}"
    print("✓ test_valid_output passed")


def test_missing_section():
    """Missing section should fail"""
    missing = """⟡ What you're deciding:
Something important.

⧉ What's at stake:
• Good stuff
• Bad stuff

? What matters"""
    
    is_valid, violations = validate_output(missing)
    assert not is_valid, "Missing section should fail"
    assert any("missing" in v for v in violations)
    print("✓ test_missing_section passed")


def test_multiple_questions():
    """Multiple question marks should fail"""
    multi_q = """⟡ What you're deciding:
Something?

⧈ What you're assuming:
• Thing one
• Thing two

⧉ What's at stake:
• Upside
• Downside

? What matters? And what else?"""
    
    is_valid, violations = validate_output(multi_q)
    assert not is_valid, "Multiple questions should fail"
    assert "too_many_questions" in violations
    print("✓ test_multiple_questions passed")


def test_advice_language():
    """Advice language should fail"""
    advice = """⟡ What you're deciding:
Whether to take the job.

⧈ What you're assuming:
• You should definitely take it
• I recommend considering it

⧉ What's at stake:
• Everything
• Nothing

? What do you think"""
    
    is_valid, violations = validate_output(advice)
    assert not is_valid, "Advice language should fail"
    print("✓ test_advice_language passed")


def test_no_question():
    """No question mark should fail"""
    no_q = """⟡ What you're deciding:
Something important.

⧈ What you're assuming:
• Thing one
• Thing two

⧉ What's at stake:
• Upside
• Downside

Think about it."""
    
    is_valid, violations = validate_output(no_q)
    assert not is_valid, "No question should fail"
    assert "no_question_mark" in violations
    print("✓ test_no_question passed")


if __name__ == "__main__":
    print("\n⟡ Running MirrorGate Tests\n")
    test_valid_output()
    test_missing_section()
    test_multiple_questions()
    test_advice_language()
    test_no_question()
    print("\n✓ All tests passed\n")

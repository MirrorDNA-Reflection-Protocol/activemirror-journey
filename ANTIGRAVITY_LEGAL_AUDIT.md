# ⟡ ANTIGRAVITY TASK: Legal & Risk Audit — activemirror-site

**Priority:** HIGH  
**Requested by:** Paul via Claude  
**Date:** 2026-01-12  
**Repo:** `/Users/mirror-admin/Documents/GitHub/_CORE/activemirror-site`

---

## Context

We just added a mandatory consent gate to `/mirror` (commit `08b4d53`). Paul wants a comprehensive audit of ALL pages to ensure legal protections and risk disclosures are consistent and complete.

---

## Audit Scope

### Pages to Review

Check each page in `src/pages/`:

| Page | File | Risk Level | Needs Review |
|------|------|------------|--------------|
| Home | `Home.jsx` | Medium | Claims, promises, liability |
| Landing/Preview | `Landing.jsx` | Medium | Marketing claims |
| Mirror | `MirrorPage.jsx` + `Mirror.jsx` | **HIGH** | Consent gate just added — verify complete |
| Mirror Beta | `MirrorWithAuth.jsx` | **HIGH** | Has auth but NO consent gate? |
| Demo | `Demo.jsx` | **HIGH** | NO consent gate — should it have one? |
| Pricing | `Pricing.jsx` | Medium | Payment terms, refund policy |
| Terms | `Terms.jsx` | **CRITICAL** | Is it comprehensive? |
| Privacy | `Privacy.jsx` | **CRITICAL** | GDPR, data handling, AI disclosure |
| Legal | `Legal.jsx` | **CRITICAL** | Liability, disclaimers |
| Hub | `Hub.jsx` | Low-Medium | What is this? Review |
| TestLab | `TestLab.jsx` | **HIGH** | Experimental features — disclosures? |
| Confessions | `Confessions.jsx` | **HIGH** | User content? Privacy implications? |

### Components to Review

- `src/components/ConsentGate.jsx` — Just created, verify language
- `src/components/AuthModal.jsx` — Any legal language needed?
- `src/components/UsageLimitBanner.jsx` — Payment/upgrade implications?

---

## Key Questions to Answer

### 1. Consent Gaps
- [ ] Does `/demo` need a consent gate like `/mirror`?
- [ ] Does `/mirror-beta` need the consent gate wrapper?
- [ ] Does `/confessions` collect user content? If so, consent needed?
- [ ] Does `/lab` expose experimental features without warning?

### 2. Missing Disclosures
- [ ] Is "experimental / use at own risk" stated on ALL AI-facing pages?
- [ ] Is "not professional advice" (medical, legal, financial) stated everywhere relevant?
- [ ] Is MirrorGate protection explained where AI responses occur?
- [ ] Is there a clear "we are not liable" statement accessible from every page?

### 3. Terms & Privacy Completeness
- [ ] Does Terms of Service cover:
  - Limitation of liability
  - No warranty / as-is
  - User conduct
  - Termination rights
  - Governing law / jurisdiction
  - Age restrictions (18+? 13+?)
  - AI-generated content disclaimer
- [ ] Does Privacy Policy cover:
  - What data is collected
  - What data is NOT collected
  - Third-party AI providers (Anthropic API)
  - Data retention
  - User rights (deletion, export)
  - Cookies / analytics
  - GDPR compliance (if applicable)
  - California privacy rights (if applicable)

### 4. AI-Specific Risks
- [ ] Hallucination disclaimer — AI may generate false information
- [ ] Not a replacement for professional services
- [ ] No guarantee of accuracy
- [ ] User responsible for decisions made based on AI output

### 5. What We Haven't Thought Of
- Age verification? (Should we block minors?)
- Cookie consent banner? (Are we using analytics?)
- Accessibility statement?
- DMCA / copyright policy?
- User-generated content policy (if `/confessions` allows input)?
- Terms for API/developer use?
- Open source license visibility?

---

## Deliverables

1. **Audit Report** — List of gaps found per page
2. **Recommended Changes** — Specific text/component additions
3. **Implementation** — Update pages as needed
4. **Consistency Check** — Ensure same language across all pages

---

## Files for Reference

- Consent gate: `src/components/ConsentGate.jsx`
- Current Terms: `src/pages/Terms.jsx`
- Current Privacy: `src/pages/Privacy.jsx`
- Current Legal: `src/pages/Legal.jsx`

---

## Success Criteria

After this audit, every page should:
1. Have appropriate risk disclosures for its function
2. Link to Terms/Privacy from footer or inline
3. Not make claims that could create liability
4. Clearly state experimental nature where applicable
5. Have consent gates on any page with AI interaction

---

⟡ End of task. Proceed with audit.

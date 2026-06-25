# Before Pushing to Main

## Local Testing
- [ ] `npm run build` succeeds
- [ ] `npx serve dist` and tested all pages:
  - [ ] / loads, links work
  - [ ] /mirror/ loads, chat works
  - [ ] /terms/ loads
  - [ ] /privacy/ loads
  - [ ] /legacy/ loads
- [ ] No console errors on any page
- [ ] Mobile viewport checked
- [ ] All images load

## After Push
- [ ] GitHub Action succeeded
- [ ] Live site tested
- [ ] All pages working

If anything broken: `git revert HEAD && git push`

---

## Rollback to Last Known Good

```bash
# If things break after a push
git reset --hard v1.0-stable
git push origin main --force
```

---

## Page URLs to Test

- https://activemirror.ai/
- https://activemirror.ai/mirror/
- https://activemirror.ai/terms/
- https://activemirror.ai/privacy/
- https://activemirror.ai/legacy/

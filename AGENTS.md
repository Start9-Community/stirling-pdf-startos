# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Fix a defect you spot rather than reporting it** — you have the package open and the
context to be sure. File **a GitHub issue on this repo** only when the call isn't yours to
make: you can't pin the cause down, two defensible fixes exist, or it's too large to ride on
the work in hand. An open issue is a report, not a queue — implement one when you're asked
to or when it's labelled `Approved`, then close it with `Closes #<n>`.

Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **`SECURITY_INITIALLOGIN_*` only creates an account while Stirling PDF's own user table is empty.** That is why `setAdminPassword` writes the store on a first set but calls the API on a rotation — a store-only rewrite would silently not reach the application.
- **Rotation goes through `/api/v1/user/change-password`, not the admin endpoint.** `/api/v1/user/admin/changePasswordForUser` refuses to change the caller's own password, so the flow authenticates as the admin with the stored password and uses the self-service endpoint.
- **The official image bundles proprietary components** under the terms in `NOTICE`, which is why `license` is a compound SPDX expression. Keep both in step with upstream's licensing when bumping the image.

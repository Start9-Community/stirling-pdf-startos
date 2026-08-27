<p align="center">
  <img src="icon.svg" alt="Stirling PDF Logo" width="21%">
</p>

# Stirling PDF on StartOS

> Everything not listed in this document should behave the same as upstream
> Stirling PDF. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Stirling PDF is a self-hosted toolbox for PDF documents: merging, splitting, format conversion, OCR, signing, redaction, and multi-step pipelines, all through one web interface and without a document ever leaving the server.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs the official Stirling PDF "standard" image unmodified — no Dockerfile of our own, and no patched entrypoint.

| What          | Value                                                   |
| ------------- | ------------------------------------------------------- |
| Image source  | Upstream `stirlingtools/stirling-pdf`, standard variant |
| Architectures | `x86_64`, `aarch64`                                     |
| Entrypoint    | Upstream's `tini -- /scripts/init.sh`                   |

One subcontainer runs, named `stirling-pdf`. Attach to it with `start-cli package attach stirling-pdf -n stirling-pdf`.

## Volume and Data Layout

Everything the package keeps lives on a single `main` volume, mounted into the container as five separate paths so that logs can be excluded from backups.

| Volume path          | Mount point           | Contents                                            |
| -------------------- | --------------------- | --------------------------------------------------- |
| `configs/`           | `/configs`            | Application settings and the account database       |
| `tessdata/`          | `/usr/share/tessdata` | OCR language data                                   |
| `pipeline/`          | `/pipeline`           | Saved pipeline definitions and watched-folder state |
| `logs/`              | `/logs`               | Application logs                                    |
| `customFiles/`       | `/customFiles`        | Replacement static assets and templates             |
| `startos/store.json` | not mounted           | The generated administrator password                |

`startos/store.json` is deliberately outside every mount point, so Stirling PDF cannot read it.

## File Models

The package owns one file, and it is StartOS-side state rather than upstream configuration.

| Model        | File                      | Seeded                    | Rewritten                       |
| ------------ | ------------------------- | ------------------------- | ------------------------------- |
| `store.json` | `main:startos/store.json` | By **Set Admin Password** | By the same action, on rotation |

It holds the username `admin` and the password the action last generated. Nothing else writes it, and init never mints a credential of its own — the action is the only source.

Stirling PDF's own configuration is not modelled. The package writes none of it: `/configs/settings.yml` is created by the application on first start and belongs to the user from then on, and a hand edit there survives every restart and update. The settings the package does assert are delivered as environment variables instead — see the quick reference for the list. Those are re-applied on every launch and always win over a matching key in `settings.yml`, with one exception: `SECURITY_INITIALLOGIN_USERNAME` and `SECURITY_INITIALLOGIN_PASSWORD` are consumed only by a start that finds the account database empty. That asymmetry is why **Set Admin Password** applies a later change through Stirling PDF's API rather than through the store — see [Actions](#actions).

## Dependencies

None.

## Network Access and Interfaces

One HTTP interface serves both the browser UI and the REST API on the same origin.

| Interface     | Id   | Type | Port | Purpose                                       |
| ------------- | ---- | ---- | ---- | --------------------------------------------- |
| Web Interface | `ui` | `ui` | 8080 | The Stirling PDF application and its REST API |

The interactive API documentation upstream serves at `/swagger-ui` is disabled; the API itself is unaffected.

## Installation and First-Run Flow

Install creates the five data directories and raises a `critical` task pointing at **Set Admin Password**. No credential exists until the user runs it, and the task blocks startup until they do — so the password is minted and shown before the service that will consume it ever comes up.

The action stores the password; the first start hands it to Stirling PDF through `SECURITY_INITIALLOGIN_*`, which creates the account. Beyond that the first launch is upstream's own — Stirling PDF creates `/configs/settings.yml` and its account database.

## Actions

One action, covering both the first credential and every later rotation.

### Set Admin Password

- **When to run it** — at install, prompted by the task; afterwards to rotate the password, including after losing it.
- **What it changes** — generates a new random password, writes it to `store.json`, and on a rotation applies it to the running application.
- **Cost** — instant. A rotation does not restart the service, but it invalidates every open session.
- **Repeat safety** — safe to repeat, and never a no-op: each run mints a new password and discards the previous one.
- **Outputs** — the username and the new password, shown once.

**Its `allowedStatuses` changes with the package's state, which is deliberate.** Before any password exists it is `only-stopped`, because the first one reaches Stirling PDF through `SECURITY_INITIALLOGIN_*` on a start that finds no account. Once one exists it is `only-running`, because a later change has to go through the API — the environment variables are ignored from the second start onward.

A rotation authenticates as the admin with the password in `store.json` and calls Stirling PDF's own change-password endpoint. Two consequences worth knowing before diagnosing a failure:

- **If the user changed their password inside Stirling PDF, rotation fails** with a message saying so. The store no longer holds the current password, and Stirling PDF's admin endpoint refuses to change the caller's own. Recovery is Stirling PDF's own account tooling, not this action.
- **The password is shown once.** There is no action that reads it back — rotating is how a lost password is replaced.

## Tasks

One task, raised at install.

| Task                       | Severity   | Raised by                            | Cleared by         |
| -------------------------- | ---------- | ------------------------------------ | ------------------ |
| Run **Set Admin Password** | `critical` | Init, whenever no password is stored | Running the action |

`critical` blocks Stirling PDF from starting, and suspends the ordinary Start/Stop controls until it is satisfied — a user reporting "the service won't start and there are no buttons" is looking at this task. The check runs on every init rather than only at install, so it re-raises if the stored password ever goes missing.

## Health Checks

One check, attached to the daemon.

| Check     | Probes                                                   |
| --------- | -------------------------------------------------------- |
| `primary` | `GET /api/v1/info/status` inside the container, for `UP` |

Stirling PDF is a Spring Boot application and its cold start is slow — a minute or more on modest hardware, longer on the first start after an update while it initialises its database. A failing check during that window is normal. A check that is still failing well past it means the application exited or failed to bind; the daemon's logs carry the Spring stack trace that says which.

## Backups and Restore

The strategy is a straight volume copy: `main` is rsynced wholesale, with `logs` excluded.

That captures the account database, `settings.yml`, saved pipelines, OCR language data, and the generated credentials in `store.json`. Logs are excluded because they are large and rebuild themselves.

A restored instance is immediately usable and needs nothing re-entered — the account database comes back with it, so the credentials that worked before the backup still work.

## Limitations and Differences

1. **Telemetry and the upstream survey prompt are disabled** and cannot be turned back on from the UI: `SYSTEM_ENABLEANALYTICS` and `SHOW_SURVEY` are re-asserted on every launch.
2. **Search engines are told not to index the instance**, regardless of how it is exposed.
3. **The Swagger UI and the OpenAPI document are disabled.** The REST API is unaffected; only the interactive documentation pages are gone.
4. **Login cannot be disabled.** `SECURITY_ENABLELOGIN` is re-asserted on every launch, so the anonymous single-user mode upstream offers is not reachable.
5. **A password changed inside Stirling PDF cannot be rotated from StartOS again** — see [Actions](#actions).

## Quick Reference for AI Consumers

```yaml
package_id: stirling-pdf
image: stirlingtools/stirling-pdf
architectures: [x86_64, aarch64]
subcontainers: [stirling-pdf]
volumes:
  main: /configs, /usr/share/tessdata, /pipeline, /logs, /customFiles
file_models:
  - startos/store.json
startos_managed_env_vars:
  - DISABLE_ADDITIONAL_FEATURES
  - SECURITY_ENABLELOGIN
  - SECURITY_INITIALLOGIN_USERNAME
  - SECURITY_INITIALLOGIN_PASSWORD
  - SYSTEM_GOOGLEVISIBILITY
  - SYSTEM_ENABLEANALYTICS
  - SHOW_SURVEY
  - METRICS_ENABLED
  - SPRINGDOC_API_DOCS_ENABLED
  - SPRINGDOC_SWAGGER_UI_ENABLED
  - MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE
  - MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - set-admin-password
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - primary
```

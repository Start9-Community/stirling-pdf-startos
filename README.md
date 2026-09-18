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

One subcontainer runs, named `stirling-pdf`. Attach to it with `start-cli package attach stirling-pdf -n stirling-pdf`. A second, `tessdata-seed`, is where a oneshot prepares the OCR language data before each start — see [Volume and Data Layout](#volume-and-data-layout). It stays up alongside the first, but nothing runs in it once that copy has finished.

The Java heap is capped at 3 GB through `JAVA_CUSTOM_OPTS`. Upstream's `init.sh` sizes the heap from the memory limit of its container, and StartOS sets none, so it would otherwise read the whole host's RAM and allow half of it — 16 GB on a 32 GB server. 3 GB is about what that script picks inside the 4 GB container upstream recommends for up to ten users. A job that needs more fails with an out-of-memory error, which makes the JVM exit and the service restart; the dump it leaves is in `configs/heap_dumps/`, outside backups.

StartOS runs its own init as PID 1 inside the subcontainer, so tini never is. The package sets `TINI_SUBREAPER` so that tini still adopts and reaps the converter processes Stirling PDF spawns — LibreOffice, OCRmyPDF, Ghostscript, Calibre — instead of leaving them as zombies.

## Volume and Data Layout

Everything the package keeps lives on a single `main` volume, mounted into the container as six separate paths so that logs can be excluded from backups.

| Volume path          | Mount point                           | Contents                                                 |
| -------------------- | ------------------------------------- | -------------------------------------------------------- |
| `configs/`           | `/configs`                            | Application settings and the account database            |
| `tessdata/`          | `/usr/share/tesseract-ocr/5/tessdata` | OCR language data                                        |
| `pipeline/`          | `/pipeline`                           | Saved pipeline definitions and watched-folder state      |
| `logs/`              | `/logs`                               | Application logs                                         |
| `customFiles/`       | `/customFiles`                        | Replacement static assets and templates                  |
| `storage/`           | `/storage`                            | Files users keep on the server, once that is switched on |
| `startos/store.json` | not mounted                           | The generated administrator password                     |

`startos/store.json` is deliberately outside every mount point, so Stirling PDF cannot read it.

`tessdata/` is mounted over the one directory Tesseract reads — upstream's `init.sh` pins `TESSDATA_PREFIX` to it — rather than at `/usr/share/tessdata`, the drop-in path upstream documents for Docker. That is what lets a language downloaded from Stirling PDF's **Advanced** settings work at once and persist: in the stock image that directory is root-owned, so the download is refused, and it would not outlive the container anyway. Mounting over it hides the languages the image ships, so the `tessdata-seed` oneshot copies those into the volume before every start and gives the directory to the user Stirling PDF runs as. The copy only replaces a file when the image's is newer, so a language the image updates reaches existing installs, while a downloaded language, or a shipped one the user has replaced by hand, is left alone.

`storage/` backs upstream's server file storage, which is off until the **Enable Server File Storage** action switches it on — see [Actions](#actions). Until then the file manager's **My Files** holds files in the user's browser only, per device, and nothing reaches the server. Once it is on, each file is written to `storage/<user id>/<uuid>_<name>`, while folders, names and shares are rows in the account database under `configs/` — the directory is not browsable as the user sees it, and a file added or removed there by hand is invisible to, or breaks, **My Files**.

If OCR stops offering a language that was downloaded, check the **Tessdata Directory** field in those settings: it must be empty. A path there sends both the language list and new downloads somewhere Tesseract does not read and the volume does not cover.

## File Models

The package owns one file, and it is StartOS-side state rather than upstream configuration.

| Model        | File                      | Seeded                    | Rewritten                                                                                |
| ------------ | ------------------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| `store.json` | `main:startos/store.json` | By **Set Admin Password** | By that action on rotation, by **Configure SMTP**, and by the server file storage toggle |

It holds the username `admin`, the password **Set Admin Password** last generated, the SMTP selection **Configure SMTP** last saved, and whether server file storage is on. Init never mints a credential of its own — the action is the only source.

Stirling PDF's own configuration is not modelled. The package writes none of it: `/configs/settings.yml` is created by the application on first start and belongs to the user from then on, and a hand edit there survives every restart and update. The settings the package does assert are delivered as environment variables instead — see the quick reference for the list. Those are re-applied on every launch and always win over a matching key in `settings.yml`, with one exception: `SECURITY_INITIALLOGIN_USERNAME` and `SECURITY_INITIALLOGIN_PASSWORD` are consumed only by a start that finds the account database empty. That asymmetry is why **Set Admin Password** applies a later change through Stirling PDF's API rather than through the store — see [Actions](#actions). The `MAIL_*` variables are present only while **Configure SMTP** holds a selection other than Disabled; with it disabled the package asserts nothing about mail, and a hand-written `mail:` block in `settings.yml` applies.

## Dependencies

None.

## Network Access and Interfaces

One HTTP interface serves both the browser UI and the REST API on the same origin.

| Interface     | Id   | Type | Port | Purpose                                       |
| ------------- | ---- | ---- | ---- | --------------------------------------------- |
| Web Interface | `ui` | `ui` | 8080 | The Stirling PDF application and its REST API |

The interactive API documentation upstream serves at `/swagger-ui` is disabled; the API itself is unaffected.

## Installation and First-Run Flow

Install creates the six data directories and raises a `critical` task pointing at **Set Admin Password**. No credential exists until the user runs it, and the task blocks startup until they do — so the password is minted and shown before the service that will consume it ever comes up.

The action stores the password; the first start hands it to Stirling PDF through `SECURITY_INITIALLOGIN_*`, which creates the account. Beyond that the first launch is upstream's own — Stirling PDF creates `/configs/settings.yml` and its account database.

## Actions

Three actions: one covering both the first credential and every later rotation, one for outbound email, and one switching server file storage on and off.

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

### Configure SMTP

- **When to run it** — whenever Stirling PDF should be able to send email, which is what its user invitations need.
- **What it changes** — stores the selection in `store.json`. Three choices: Disabled, the StartOS system SMTP settings (optionally with a different from-address), or a custom server using the SDK's provider presets.
- **Cost** — restarts Stirling PDF, since the selection reaches it as environment variables at launch.
- **Repeat safety** — safe to repeat; the form opens pre-filled with the current selection.
- **Outputs** — none.

Selecting the system settings while StartOS has none configured behaves as Disabled: no `MAIL_*` variable is set and Stirling PDF starts without mail. STARTTLS sets `MAIL_STARTTLSREQUIRED`, so a server that will not upgrade the connection is refused rather than spoken to in the clear; TLS sets `MAIL_SSLENABLE` for implicit TLS on the chosen port. Enabling mail also sets `MAIL_ENABLEINVITES`, which is what makes Stirling PDF's invite flow appear on its user-management page. The links it mails point at whichever of the service's addresses the admin was signed in on, so the package never has to know a public URL.

### Enable / Disable Server File Storage

One action whose name shows what running it will do, so it also reports the current state.

- **When to run it** — when users want the files in **My Files** to follow them between devices. Off, which is the default, **My Files** keeps files in the browser they were added in and nothing reaches the server.
- **What it changes** — flips `serverFileStorage` in `store.json`, which reaches Stirling PDF as `STORAGE_ENABLED`. Nothing in `storage/` is touched: switching it off leaves every stored file and its database rows in place, unreachable until it is switched on again.
- **Cost** — restarts Stirling PDF if it is running; while stopped it simply applies on the next start. It needs nothing from the application, so it works before Stirling PDF has ever been started.
- **Repeat safety** — each run is the opposite of the last. Check the name before running it.
- **Outputs** — none.

`STORAGE_ENABLED` is asserted on every launch, so the **Enable Server File Storage** switch under **File Storage & Sharing** inside Stirling PDF does not stick: whatever it is set to, the next start restores the action's choice. The other switches on that page, sharing among them, are left to the admin.

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

The strategy is a straight volume copy: `main` is rsynced wholesale, with `logs` and `configs/heap_dumps` excluded.

That captures the account database, `settings.yml`, saved pipelines, OCR language data, every file users have stored on the server, and the generated credentials in `store.json`. Stored files and the database rows that index them are backed up together, so a restore brings back **My Files** intact; the `storage.quotas` keys in `settings.yml` are the way to bound how large that gets, since the settings page does not expose them. Logs are excluded because they are large and rebuild themselves. `configs/heap_dumps/` is where upstream's JVM options write a heap dump if Stirling PDF runs out of memory; a dump can be several gigabytes and nothing reads it back, so it is diagnostic material that stays on the server.

A restored instance is immediately usable and needs nothing re-entered — the account database comes back with it, so the credentials that worked before the backup still work.

## Limitations and Differences

1. **Telemetry and the upstream survey prompt are disabled** and cannot be turned back on from the UI: `SYSTEM_ENABLEANALYTICS` and `SHOW_SURVEY` are re-asserted on every launch.
2. **Search engines are told not to index the instance**, regardless of how it is exposed.
3. **The Swagger UI and the OpenAPI document are disabled.** The REST API is unaffected; only the interactive documentation pages are gone.
4. **Login cannot be disabled.** `SECURITY_ENABLELOGIN` is re-asserted on every launch, so the anonymous single-user mode upstream offers is not reachable.
5. **A password changed inside Stirling PDF cannot be rotated from StartOS again** — see [Actions](#actions).
6. **The Java heap is capped at 3 GB** rather than sized from the host's memory — see [Image and Container Runtime](#image-and-container-runtime).
7. **Server file storage is switched from StartOS, not from inside Stirling PDF** — see [Actions](#actions).
8. **Share links need an address the package cannot supply.** Upstream only issues them once `system.frontendUrl` is set, and a StartOS service has no single address — the admin has to enter the one their users reach Stirling PDF on. Sharing a stored file with a named user needs no such setting.
9. **`/usr/share/tessdata` is not a drop-in directory for OCR languages.** Upstream's Docker instructions for adding a language by hand do not apply; languages are added from the **Advanced** settings instead — see [Volume and Data Layout](#volume-and-data-layout).

## Quick Reference for AI Consumers

```yaml
package_id: stirling-pdf
image: stirlingtools/stirling-pdf
architectures: [x86_64, aarch64]
subcontainers: [stirling-pdf, tessdata-seed]
volumes:
  main: /configs, /usr/share/tesseract-ocr/5/tessdata, /pipeline, /logs, /customFiles, /storage
file_models:
  - startos/store.json
startos_managed_env_vars:
  - TINI_SUBREAPER
  - JAVA_CUSTOM_OPTS
  - DISABLE_ADDITIONAL_FEATURES
  - SECURITY_ENABLELOGIN
  - SECURITY_INITIALLOGIN_USERNAME
  - SECURITY_INITIALLOGIN_PASSWORD
  - STORAGE_ENABLED
  - SYSTEM_GOOGLEVISIBILITY
  - SYSTEM_ENABLEANALYTICS
  - SHOW_SURVEY
  - METRICS_ENABLED
  - SPRINGDOC_API_DOCS_ENABLED
  - SPRINGDOC_SWAGGER_UI_ENABLED
  - MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE
  - MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS
startos_managed_env_vars_while_smtp_configured:
  - MAIL_ENABLED
  - MAIL_ENABLEINVITES
  - MAIL_HOST
  - MAIL_PORT
  - MAIL_USERNAME
  - MAIL_PASSWORD
  - MAIL_FROM
  - MAIL_STARTTLSENABLE
  - MAIL_STARTTLSREQUIRED
  - MAIL_SSLENABLE
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - set-admin-password
  - manage-smtp
  - server-file-storage
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - primary
```

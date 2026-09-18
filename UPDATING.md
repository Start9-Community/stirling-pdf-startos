# Updating the upstream version

This package runs the official `stirlingtools/stirling-pdf` standard image unmodified.

## Determining the upstream version

- **Stirling PDF** ([Stirling-Tools/Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF)) — fetch the latest release tag:

  ```sh
  gh release view -R Stirling-Tools/Stirling-PDF --json tagName -q .tagName
  ```

  The current pin lives in `startos/manifest/index.ts` at `images.stirling.source.dockerTag` (the version after the `:` in `stirlingtools/stirling-pdf:<version>`).

## Applying the bump

- Bump `dockerTag` in `startos/manifest/index.ts` to `stirlingtools/stirling-pdf:<new version>` (drop the leading `v` from the release tag).
- Re-read upstream's root `LICENSE` and the terms it points at. The image bundles proprietary components, so `manifest.license` is a compound SPDX expression and `NOTICE` restates the split — both need to still be true after the bump.
- Confirm the readiness endpoint the health check probes, `/api/v1/info/status`, still reports `UP`, and that the `SECURITY_*`, `SYSTEM_*`, `MANAGEMENT_*`, `MAIL_*` and `STORAGE_ENABLED` environment variables in `startos/main.ts` are still the names upstream reads.
- Re-read upstream's `scripts/init.sh` and `scripts/init-without-ocr.sh`, which the package leans on in four places:
  - `TESSDATA_PREFIX` must still be the path in `tessdataDir` (`startos/utils.ts`). The volume is mounted over that directory and the `tessdata-seed` oneshot copies the image's languages out of it, so a moved path — a new Tesseract major version changes it — either stops the service at the oneshot or silently sends OCR back to the image's own languages.
  - `PUID` and `PGID` must still be image environment variables naming the ids Stirling PDF runs as; the oneshot chowns `tessdata/` to them.
  - `JAVA_CUSTOM_OPTS` must still be appended after the computed memory flags, which is what lets the package's `-Xmx` win. The startup log line `running with JAVA_TOOL_OPTIONS=` shows the result.
  - The JVM options must still write heap dumps to `/configs/heap_dumps`, the path `startos/backups.ts` excludes.
- Confirm server file storage still writes under `/storage` (`storage.local.basePath` in upstream's `settings.yml.template`, and the `/app/storage` symlink in `docker/embedded/Dockerfile`).

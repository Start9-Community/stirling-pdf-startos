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
- Confirm the readiness endpoint the health check probes, `/api/v1/info/status`, still reports `UP`, and that the `SECURITY_*`, `SYSTEM_*` and `MANAGEMENT_*` environment variables in `startos/main.ts` are still the names upstream reads.

ARG IMAGE
FROM ubuntu:24.04 AS ca
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/* \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt

FROM ${IMAGE}
# The image's dpkg database is stripped, so apt can't upgrade ca-certificates in place; Java reads its own cacerts.
COPY --from=ca /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
RUN rm -f /usr/share/ca-certificates/mozilla/emSign_ECC_Root_CA_-_G3.crt && find /etc/ssl/certs -xtype l -delete \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt \
 && keytool -list -cacerts -storepass changeit | grep -i emsign | sed 's/, [A-Z][a-z]\{2\} [0-9]\{1,2\}, [0-9]\{4\}, trustedCertEntry,.*$//' \
    | while IFS= read -r alias; do keytool -delete -cacerts -storepass changeit -alias "$alias" || exit 1; done \
 && ! keytool -list -cacerts -storepass changeit | grep -qi emsign

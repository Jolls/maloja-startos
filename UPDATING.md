# Updating the upstream version

Upstream is the `krateng/maloja` Docker image, pinned by tag in `startos/manifest/index.ts` (`images.maloja.source.dockerTag`).

## Determining the upstream version

- Latest tags: `curl -s "https://hub.docker.com/v2/repositories/krateng/maloja/tags?page_size=25" | jq -r '.results[].name'`
- Confirm architectures for the tag you're bumping to (must include `amd64` and `arm64`):
  `docker manifest inspect krateng/maloja:<tag> | jq -r '.manifests[].platform.architecture'`
- Release notes: <https://github.com/krateng/maloja/releases>

## Applying the bump

1. Edit `images.maloja.source.dockerTag` in `startos/manifest/index.ts` to the new `krateng/maloja:<tag>`.

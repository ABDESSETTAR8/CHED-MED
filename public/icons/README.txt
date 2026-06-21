Place PWA icons here (referenced by /public/manifest.webmanifest):

  icon-192.png            192x192   (any)
  icon-512.png            512x512   (any)
  icon-maskable-512.png   512x512   (maskable — keep important content in the
                                     safe zone, ~80% center, for Android masks)

Until real icons are added the app still runs; installability just needs these
present. You can generate a full set from one source image with a tool like
https://realfavicongenerator.net or the `pwa-asset-generator` npm package.

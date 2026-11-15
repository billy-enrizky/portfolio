# OpenBrowser scene

This scene was made for the portfolio in Blender. Rounded primitives form the
browser tile and the Python, CDP, and MCP blocks. The labels are mesh geometry.
The only texture comes from the owner's existing OpenBrowser mark at
`images/portfolio/openbrowser_logo.png`. Its source bytes are unchanged.

The scene contains no reference-film artwork, client material, portrait, camera,
light, animation, external image URL, or machine path. The website supplies its
own lighting and motion. The original geometry and builder use the repository's
MIT license. The OpenBrowser mark remains the owner's project identity.

## Rebuild

Install Blender and `uv`. Run this command from the repository root.

```sh
blender --background --factory-startup --python-exit-code 1 \
  --python tools/rebuild-openbrowser-model.py
```

The builder runs its pinned Python and Pillow preprocessing through `uv`.
Temporary crop files stay under ignored `local_docs/motion-build/`.
To verify without replacing the published model, set a separate output.

```sh
blender --background --factory-startup --python-exit-code 1 \
  --python tools/rebuild-openbrowser-model.py -- \
  --output local_docs/motion-build/verification.glb
cmp assets/motion/openbrowser-scene.glb local_docs/motion-build/verification.glb
```

`provenance.json` records source hashes, the tested toolchain, and the measured
byte-identical rebuild. Other toolchain versions were not tested.

## Browser runtime

The original scene code is `js/motion-scene.js`. Run `npm ci` and
`npm run build:motion` to bundle its Three.js dependencies locally.
The full Three.js MIT license is in `assets/vendor/three-LICENSE.txt`.
The generated bundle retains its linked license notice.

The controller loads the bundle and model only when policy permits.
The existing HTML project mark remains the fallback. No third-party runtime
request is needed for the scene.

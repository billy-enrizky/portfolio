# /// script
# requires-python = "==3.12.12"
# dependencies = ["Pillow==13.0.0"]
# ///
"""Rebuild the original OpenBrowser scene with Blender 5.2.3 LTS.

Run from the repository root with Blender and uv on PATH:
    blender --background --factory-startup --python-exit-code 1 \
        --python tools/rebuild-openbrowser-model.py

Arguments after Blender's -- are optional:
    --output local_docs/motion-build/openbrowser-scene.glb

Relative outputs resolve from the repository root, not the current directory.
The default output is assets/motion/openbrowser-scene.glb. Use --output for
validation without replacing that asset.

Blender does not bundle Pillow. This script invokes its own --prepare-logo
mode through uv, using the inline pinned Python and Pillow dependencies.
The preprocessor matches the original crop helper's alpha threshold, square
padding and LANCZOS resize. Its only intermediate is
local_docs/motion-build/rebuild-openbrowser/logo_square.png.
The source images/portfolio/openbrowser_logo.png is opened read-only.

Geometry and materials are adapted from the Claude session's original
make_glb.py. No external scene, font, reference artwork or staging file is used.
"""

import argparse
import hashlib
import logging
import math
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "images/portfolio/openbrowser_logo.png"
LOGO = ROOT / "local_docs/motion-build/rebuild-openbrowser/logo_square.png"
log = logging.getLogger("openbrowser-build")


def prepare_logo():
    from PIL import Image

    with Image.open(SOURCE) as source:
        image = source.convert("RGBA")
    box = image.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if box is None:
        raise ValueError("Source logo has no alpha values above 8")
    logo = image.crop(box)
    side = max(logo.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(logo, ((side - logo.width) // 2, (side - logo.height) // 2))
    square = square.resize((1024, 1024), Image.Resampling.LANCZOS)
    LOGO.parent.mkdir(parents=True, exist_ok=True)
    square.save(LOGO)
    log.info("Logo alpha bounds=%s; crop bytes=%d sha256=%s", box,
             LOGO.stat().st_size, hashlib.sha256(LOGO.read_bytes()).hexdigest())


def build_scene(output):
    import bpy

    bpy.ops.wm.read_factory_settings(use_empty=True)

    def mat(name, rgba, rough):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        b = m.node_tree.nodes["Principled BSDF"]
        b.inputs["Base Color"].default_value = rgba
        b.inputs["Roughness"].default_value = rough
        return m

    ceramic = mat("Ceramic", (0.96, 0.96, 0.95, 1), 0.38)
    ink = mat("Ink", (0.063, 0.063, 0.063, 1), 0.55)
    accent = mat("Accent", (0.98, 0.36, 0.06, 1), 0.42)

    logo = bpy.data.materials.new("Logo")
    logo.use_nodes = True
    nt = logo.node_tree
    tex = nt.nodes.new("ShaderNodeTexImage")
    img = bpy.data.images.load(str(LOGO))
    img.pack()
    tex.image = img
    pb = nt.nodes["Principled BSDF"]
    pb.inputs["Roughness"].default_value = 0.4
    nt.links.new(tex.outputs["Color"], pb.inputs["Base Color"])
    nt.links.new(tex.outputs["Alpha"], pb.inputs["Alpha"])

    def group(name, loc):
        e = bpy.data.objects.new(name, None)
        bpy.context.collection.objects.link(e)
        e.location = loc
        return e

    def rounded_box(name, size, bevel, material, parent, loc=(0, 0, 0)):
        bpy.ops.mesh.primitive_cube_add(size=1)
        o = bpy.context.active_object
        o.name = name
        o.scale = size
        bpy.ops.object.transform_apply(scale=True)
        m = o.modifiers.new("b", "BEVEL")
        m.width = bevel
        m.segments = 4
        m.limit_method = "NONE"
        bpy.ops.object.modifier_apply(modifier="b")
        bpy.ops.object.shade_smooth()
        o.data.materials.append(material)
        o.parent = parent
        o.location = loc
        return o

    def label(text, size, material, parent, loc):
        bpy.ops.object.text_add()
        t = bpy.context.active_object
        t.data.body = text
        t.data.size = size
        t.data.extrude = 0.012
        t.data.align_x = "CENTER"
        t.data.align_y = "CENTER"
        bpy.ops.object.convert(target="MESH")
        o = bpy.context.active_object
        o.name = text + "Label"
        o.data.materials.append(material)
        o.rotation_euler = (math.pi / 2, 0, 0)
        o.parent = parent
        o.location = loc
        return o

    core = group("CoreTile", (0, 0, 0))
    rounded_box("CoreBody", (2.0, 0.34, 2.0), 0.42, ceramic, core)
    bpy.ops.mesh.primitive_plane_add(size=1.7, rotation=(math.pi / 2, 0, 0))
    plate = bpy.context.active_object
    plate.name = "CoreLogo"
    plate.data.materials.append(logo)
    plate.parent = core
    plate.location = (0, -0.172, 0)

    nodes = [("PythonNode", "Python", (-1.55, -0.1, -1.15), ink),
             ("CDPNode", "CDP", (0.0, -0.1, -1.5), accent),
             ("MCPNode", "MCP", (1.55, -0.1, -1.15), ink)]
    for gname, text, loc, m in nodes:
        g = group(gname, loc)
        rounded_box(gname + "Body", (0.78, 0.26, 0.4), 0.09, m, g)
        label(text, 0.17, ceramic if m is ink else ink, g, (0, -0.14, 0))

    for o in bpy.data.objects:
        for k in list(o.keys()):
            del o[k]

    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output), export_format="GLB", export_yup=True,
        export_apply=True, export_cameras=False, export_lights=False,
        export_animations=False, export_extras=False,
        export_image_format="AUTO", export_materials="EXPORT",
    )
    data = output.read_bytes()
    log.info("Blender=%s; GLB bytes=%d sha256=%s", bpy.app.version_string,
             len(data), hashlib.sha256(data).hexdigest())


def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=Path("assets/motion/openbrowser-scene.glb"))
    parser.add_argument("--prepare-logo", action="store_true", help=argparse.SUPPRESS)
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    args = parser.parse_args(argv)
    if args.prepare_logo:
        prepare_logo()
        return
    output = (ROOT / args.output).resolve()
    if output.suffix.lower() != ".glb":
        parser.error("--output must name a .glb file")
    log.info("Source logo bytes=%d sha256=%s", SOURCE.stat().st_size,
             hashlib.sha256(SOURCE.read_bytes()).hexdigest())
    subprocess.run([
        "uv", "run", "--no-project", "--script",
        str(Path(__file__).resolve()), "--prepare-logo",
    ], check=True)
    build_scene(output)


if __name__ == "__main__":
    main()

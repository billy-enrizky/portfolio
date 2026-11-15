"""Render the OpenBrowser tile turn as 24 transparent PNG frames.

Run: blender -b -P tools/render-hero-turn.py -- LOGO_SQUARE_PNG OUTPUT_DIR
"""
import math
import os
import sys

import bpy

FRAMES = 24
SIZE = 640
LOGO, OUT = sys.argv[sys.argv.index("--") + 1:][:2]
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = scene.render.resolution_y = SIZE
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"

bpy.ops.mesh.primitive_cube_add(size=1)
slab = bpy.context.active_object
slab.scale = (2.0, 0.34, 2.0)
bpy.ops.object.transform_apply(scale=True)
bevel = slab.modifiers.new("b", "BEVEL")
bevel.width, bevel.segments, bevel.limit_method = 0.42, 10, "NONE"
bpy.ops.object.modifier_apply(modifier="b")
bpy.ops.object.shade_smooth()
ceramic = bpy.data.materials.new("slab")
ceramic.use_nodes = True
principled = ceramic.node_tree.nodes["Principled BSDF"]
principled.inputs["Base Color"].default_value = (0.98, 0.98, 0.98, 1)
principled.inputs["Roughness"].default_value = 0.35
slab.data.materials.append(ceramic)

bpy.ops.mesh.primitive_plane_add(size=1.7, rotation=(math.pi / 2, 0, 0), location=(0, -0.172, 0))
plate = bpy.context.active_object
logo = bpy.data.materials.new("logo")
logo.use_nodes = True
texture = logo.node_tree.nodes.new("ShaderNodeTexImage")
texture.image = bpy.data.images.load(LOGO)
shader = logo.node_tree.nodes["Principled BSDF"]
shader.inputs["Roughness"].default_value = 0.4
logo.node_tree.links.new(texture.outputs["Color"], shader.inputs["Base Color"])
logo.node_tree.links.new(texture.outputs["Alpha"], shader.inputs["Alpha"])
plate.data.materials.append(logo)

bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, -1.25))
bpy.context.active_object.is_shadow_catcher = True


def area_light(name, location, energy, size):
    data = bpy.data.lights.new(name, "AREA")
    data.energy, data.size = energy, size
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (-obj.location).to_track_quat("-Z", "Y").to_euler()


area_light("key", (-3, -5, 5), 900, 5)
area_light("fill", (4, -4, 1.5), 260, 6)
area_light("rim", (0, 5, 3), 200, 4)

world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.9, 0.9, 0.92, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6
scene.world = world

camera_data = bpy.data.cameras.new("cam")
camera_data.type, camera_data.ortho_scale = "ORTHO", 3.5
camera = bpy.data.objects.new("cam", camera_data)
bpy.context.collection.objects.link(camera)
camera.location = (0, -8, 0.15)
camera.rotation_euler = (math.pi / 2, 0, 0)
scene.camera = camera

root = bpy.data.objects.new("root", None)
bpy.context.collection.objects.link(root)
slab.parent = plate.parent = root

for i in range(FRAMES):
    t = i / (FRAMES - 1)
    root.rotation_euler = (math.radians(8), math.radians(-5 + t * 10), math.radians(-38 + t * 76))
    scene.render.filepath = os.path.join(OUT, f"f{i:02d}.png")
    bpy.ops.render.render(write_still=True)

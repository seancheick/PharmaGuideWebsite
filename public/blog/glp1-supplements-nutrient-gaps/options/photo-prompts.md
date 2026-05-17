# Editorial Photo Prompts — GLP-1 Post

Three structured prompts using camera/lens/lighting/grade specs. Pick one for the hero, or use multiple as in-post editorial breaks.

---

## Prompt A: Morning Counter (Hero candidate)

```
SUBJECT: Two amber supplement capsules and one white capsule resting beside a half-full glass of water on a honed marble countertop, a folded linen napkin just visible at the edge of frame
COMPOSITION: Overhead 30-degree angle, subject placed at lower-left third, generous negative space upper-right, shallow depth of field with soft foreground bokeh on the napkin edge
CAMERA: Fujifilm GFX 100S
LENS: 80mm f/2.8 macro
LIGHTING: Soft diffused morning window light from upper-left, gentle shadow fall across marble veining, no harsh specular highlights, subtle warm fill from reflected countertop
COLOR GRADE: Kodak Portra 160, lifted shadows, creamy highlights with warmth in the 40-50K range, desaturated greens, natural marble tones preserved
MOOD: Calm, intentional, unhurried morning ritual
STYLE REF: Kinfolk magazine food editorial, Cereal Magazine still life
ASPECT RATIO: 16:10
EXCLUDE: No text, no watermarks, no branded packaging, no medication bottles, no pill organizers, no human hands, no over-saturation, no HDR look, no perfect symmetry, no clinical sterile surfaces
```

**Save as:** `hero.jpg` at 1600×1000 → frontmatter `image: "/blog/glp1-supplements-nutrient-gaps/hero.jpg"`

---

## Prompt B: Protein Prep (In-post, protein section)

```
SUBJECT: A clear glass being filled with a pale vanilla protein shake, mid-pour, next to a small bowl of mixed berries and a silver measuring scoop with residual powder, on a light oak cutting board
COMPOSITION: Medium close-up at eye level, shot from 45 degrees, leading line from cutting board edge to glass, protein shake in focus with berries in soft background
CAMERA: Canon EOS R5
LENS: 35mm f/1.8
LIGHTING: Large north-facing window as key light, white countertop providing natural fill, warm pendant lamp bokeh orb in far background, golden ratio of highlight-to-shadow
COLOR GRADE: Fujifilm Pro 400H, lifted blacks, soft greens in background, warm skin-adjacent tones on wood, clean highlight roll-off
MOOD: Practical, accessible, everyday wellness not fitness-influencer
STYLE REF: Bon Appétit recipe photography meets Apartamento kitchen editorial
ASPECT RATIO: 16:9
EXCLUDE: No text, no branding on products, no gym equipment visible, no fitness-bro aesthetic, no neon colors, no blender visible, no perfect Instagram staging, no unnatural smoothie colors
```

**Save as:** `protein-prep.jpg` at 1600×900

---

## Prompt C: Evening Routine (In-post, magnesium/evening section)

```
SUBJECT: A single magnesium capsule resting on a small ceramic dish next to a warm-toned ceramic mug of chamomile tea, evening light, a closed book spine barely visible behind, soft-focus reading lamp
COMPOSITION: Close-up, shot from slight below at 15 degrees looking up, ceramic dish at left third, mug at right third, lamp creating a warm bokeh circle in upper background, intimate framing
CAMERA: Hasselblad X2D 100C
LENS: 90mm f/3.2
LIGHTING: Single warm reading lamp from upper-right creating Rembrandt-style light fall, no blue-toned ambient, window showing deep twilight not black, subtle rim light on mug edge from lamp
COLOR GRADE: Medium format native color science, warm amber cast from practicals, cool twilight balance from window, film-like grain at ISO 800, lifted deep shadows to charcoal not black
MOOD: Quiet evening ritual, wind-down, restful
STYLE REF: Monocle magazine lifestyle, Japanese evening tea ceremony photography
ASPECT RATIO: 4:3
EXCLUDE: No text, no watermarks, no phone or screens visible, no bright blue light, no clinical feel, no supplement bottles, no harsh flash, no stock-photo staging, no perfectly made bed in background
```

**Save as:** `evening-routine.jpg` at 1600×1200

---

## How to generate

For each prompt, run:

```bash
/nano-banana "<full prompt text>"
```

Then move the output to `public/blog/glp1-supplements-nutrient-gaps/<filename>.jpg` and reference in the post via `<PostImage>`.

## Quality checklist before using

- [ ] Does it look like a magazine editorial, not a stock photo?
- [ ] No uncanny textures (skin, fabric, surfaces)?
- [ ] Lighting direction is consistent within the image?
- [ ] Color temperature feels warm but not orange?
- [ ] No AI artifacts (extra fingers, melted objects, text gibberish)?
- [ ] Would this fit on the PharmaGuide homepage without looking out of place?

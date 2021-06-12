# Symbols

Symbols are SVG files constructed in a particular way, along with optional metadata specified in [TOML][] format.

## The SVG file

For example, here's [`eye.svg`](eye.svg):

> <img src="eye.svg">

### The `specs` group

This SVG consists of one `<g>` element with the ID `specs`, which is short for "specifications".  This layer contains shapes that actually represent metadata about the symbol; they aren't shown visibly to viewers, but instead tell Mystic Symbolic where to place the symbol in relation to other symbols in a composition.

#### Attachment points

Attachment points are represented as arrows; the bottom of the arrow is the location of the point, while the direction of the arrow determines its orientation.

The color of the arrow represents the type of the attachment point:

| Attachment point type | Color |
| --------------------- | ----- |
| `anchor`              | ![#ff0000](https://via.placeholder.com/15/ff0000/000000?text=+) `#ff0000` |
| `tail`                | ![#be0027](https://via.placeholder.com/15/be0027/000000?text=+) `#be0027` |
| `leg`                 | ![#ffff00](https://via.placeholder.com/15/ffff00/000000?text=+) `#ffff00` |
| `arm`                 | ![#00ff00](https://via.placeholder.com/15/00ff00/000000?text=+) `#00ff00` |
| `horn`                | ![#00ffff](https://via.placeholder.com/15/00ffff/000000?text=+) `#00ffff` |
| `crown`               | ![#0000ff](https://via.placeholder.com/15/0000ff/000000?text=+) `#0000ff` |

The `anchor` attachment point type defines where the symbol should attach to other symbols, and how it should be oriented relative to them.

All other attachment point types represent where other symbols might attach to the symbol.

#### Nesting boxes

Nesting boxes define the area in which any nested symbols should be placed.

Nesting boxes are expected to have the fill color ![#ff00ff](https://via.placeholder.com/15/ff00ff/000000?text=+) `#ff00ff`.

### Colors

Any occurrence of pure white (![#ffffff](https://via.placeholder.com/15/ffffff/000000?text=+) `#ffffff`) in the SVG will be replaced by a composition's **fill color**.

Any occurrence of pure black (![#000000](https://via.placeholder.com/15/000000/000000?text=+) `#000000`) in the SVG will be replaced by a composition's **stroke color**.

Any other colors in the SVG are preserved as-is.

### Compatibility

At the time of writing (June 2021), Mystic Symbolic is only capable of parsing a fairly restrictive subset of SVGs.  This subset is defined by the way that [Moho animation software][moho] exports its files to SVG.

#### Visible shapes

While the specifics are defined in [`/lib/vocabulary-builder.ts`](../../lib/vocabulary-builder.ts), these are the general constraints of visible shapes:

* We only support `<g>`, `<path>`, `<linearGradient>`, and `<radialGradient>` elements.

* We don't support any kinds of transformation matrices.

#### Specifications

The implementation for parsing specifications is in [`/lib/specs.ts`](../../lib/specs.ts).  These are the general constraints:

* Attachment points in the `specs` group are expected to be arrows represented as 4-point `<path>` elements where the first point is the tip of the arrow and the third point is the bottom of the arrow.  The bottom of the arrow is the location of the attachment point, and the vector formed by taking the difference between the top and bottom of the arrow is the direction of the attachment point.

* Nesting boxes in the `specs` group are expected to be represented as any kind of `<path>` element; the bounding box for the element is taken to be the dimensions of the nesting box.

## Additional TOML metadata

Alongside `eye.svg`, we have [`eye.toml`](eye.toml), which contains additional metadata about the symbol.  Note that this file is optional, and any terms that aren't specified will be set to a default value that's documented in [`_template.toml`](_template.toml).

[TOML]: https://toml.io/en/
[moho]: https://moho.lostmarble.com/

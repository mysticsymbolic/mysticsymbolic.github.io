# Symbols

Symbols are SVG files constructed in a particular way, along with optional metadata specified in [TOML][] format.

## The SVG file

For example, here's [`eye.svg`](eye.svg):

> <img src="eye.svg">

### The `specs` group

This SVG consists of one `<g>` element with the ID `specs`, which is short for "specifications".  This layer contains shapes that actually represent metadata about the symbol; they aren't shown visibly to viewers, but instead tell Mystic Symbolic where to place the symbol in relation to other symbols in a composition.

### Colors

Any occurrence of pure white (![#ffffff](https://via.placeholder.com/15/ffffff/000000?text=+) `#ffffff`) in the SVG will be replaced by a composition's **fill color**.

Any occurrence of pure black (![#000000](https://via.placeholder.com/15/000000/000000?text=+) `#000000`) in the SVG will be replaced by a composition's **stroke color**.

Any other colors in the SVG are preserved as-is.

### Compatibility

At the time of writing (June 2021), Mystic Symbolic is only capable of parsing a fairly restrictive subset of SVGs.  This subset is defined by the way that [Moho animation software][moho] exports its files to SVG.

#### Visible shapes

While the specifics are defined in [`vocabulary-builder.ts`](../../lib/vocabulary-builder.ts), these are the general constraints of visible shapes:

* We only support `<g>`, `<path>`, `<linearGradient>`, and `<radialGradient>` elements.

* We don't support any kinds of transformation matrices.

#### Specifications

The implementation for parsing specifications is in [`specs.ts`](../../lib/specs.ts).  These are the general constraints:

* Attachment points in the `specs` group are expected to be arrows represented as 4-point `<path>` elements where the first point is the tip of the arrow and the third point is the bottom of the arrow.  The bottom of the arrow is the location of the attachment point, and the vector formed by taking the difference between the top and bottom of the arrow is the direction of the attachment point.

* Nesting boxes in the `specs` group are expected to be represented as any kind of `<path>` element; the bounding box for the element is taken to be the dimensions of the nesting box.

## Additional TOML metadata

Alongside `eye.svg`, we have [`eye.toml`](eye.toml), which contains additional metadata about the symbol.  Note that this file is optional, and any terms that aren't specified will be set to a default value that's documented in [`_template.toml`](_template.toml).

[TOML]: https://toml.io/en/
[moho]: https://moho.lostmarble.com/

// @ts-ignore

require("@babel/register")({
  extensions: [".es6", ".es", ".jsx", ".js", ".mjs", ".ts", ".tsx"],
});

require("./lib/vocabulary-builder").build();

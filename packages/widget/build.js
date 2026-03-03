const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/consent.ts"],
  bundle: true,
  outfile: "dist/consent.iife.js",
  format: "iife",
  globalName: "ConsentKit",
  minify: true,
  target: ["es2018"],
  platform: "browser",
}).then(() => {
  console.log("Widget built: dist/consent.iife.js");
}).catch(() => process.exit(1));

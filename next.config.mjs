/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@imgly/background-removal", "onnxruntime-web"],
  },
  // @imgly/background-removal's docs are explicit that SharedArrayBuffer
  // needs to be available for its WASM execution — without cross-origin
  // isolation, some onnxruntime-web WASM paths throw outright instead of
  // gracefully falling back to a slower single-threaded mode. That requires
  // these two headers. Using "credentialless" (not the stricter
  // "require-corp") for COEP specifically: link cards load preview images
  // from arbitrary third-party sites that don't send CORP headers —
  // require-corp would silently block those images from loading as a side
  // effect, credentialless cross-origin-isolates the page without that
  // requirement (cross-origin resources just load without credentials,
  // which is fine for public preview images).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
  webpack: (config) => {
    // onnxruntime-web (the ML runtime behind background removal) ships .mjs
    // files that use import.meta.url to locate their WASM binaries. Without
    // this, webpack's parser can choke on import.meta in that file with
    // "import.meta cannot be used outside of module code" — this rule tells
    // webpack explicitly to treat .mjs as real ESM.
    config.module.rules.push({
      test: /\.mjs$/,
      type: "javascript/auto",
      resolve: { fullySpecified: false },
    });
    // onnxruntime-web's dynamic require() pattern triggers a webpack warning
    // it can't statically analyze — harmless (confirmed: build still
    // succeeds), just noisy. Silencing it specifically rather than
    // suppressing warnings broadly.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /onnxruntime-web/, message: /Critical dependency/ },
    ];
    return config;
  },
};

export default nextConfig;

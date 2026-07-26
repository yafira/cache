/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@imgly/background-removal", "onnxruntime-web"],
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

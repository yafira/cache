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
    return config;
  },
};

export default nextConfig;

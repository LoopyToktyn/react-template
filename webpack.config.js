// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");
const fs = require("fs");

module.exports = () => {
  // Determine environment mode (defaults to "development" if not set)
  const envMode = process.env.NODE_ENV || "development";
  
  // If you have environment files like .env.production, .env.development, etc.
  const envPath = path.resolve(__dirname, `.env.${envMode}`);
  const parsedEnv = fs.existsSync(envPath)
    ? dotenv.parse(fs.readFileSync(envPath))
    : {};
  const envKeys = Object.keys(parsedEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(parsedEnv[next]);
    return prev;
  }, {});

  const isProd = envMode === "production";

  return {
    mode: isProd ? "production" : "development",

    // In production, you often want no or hidden source maps. 
    // 'source-map' is good for Sentry or self-hosted error logging.
    // 'hidden-source-map' hides sources but keeps line mappings.
    devtool: isProd ? "hidden-source-map" : "source-map",

    entry: "./src/index.tsx",

    output: {
      path: path.resolve(__dirname, "dist"),
      // For production, hashed filenames for long-term caching
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
      clean: true,
      publicPath: "/",
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
      alias: {
        "@root": path.resolve(__dirname, "src/"),
        "@api": path.resolve(__dirname, "src/api/"),
        "@assets": path.resolve(__dirname, "src/assets/"),
        "@components": path.resolve(__dirname, "src/components/"),
        "@config": path.resolve(__dirname, "src/config/"),
        "@context": path.resolve(__dirname, "src/context/"),
        "@hooks": path.resolve(__dirname, "src/hooks/"),
        "@pages": path.resolve(__dirname, "src/pages/"),
        "@styles": path.resolve(__dirname, "src/styles/"),
        "@utils": path.resolve(__dirname, "src/utils/"),
      },
    },

    // For development, you typically have devServer. In production you wouldn't.
    // We can conditionally apply it:
    devServer: !isProd
      ? {
          historyApiFallback: true,
          hot: true,
          port: 3000,
        }
      : undefined,

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
        },
      ],
    },

    // For better caching & code splitting:
    optimization: {
      splitChunks: {
        chunks: "all",
      },
      runtimeChunk: "single",
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        // If you have a favicon, set:
        // favicon: "./public/favicon.ico",
        // Minify in production:
        minify: isProd
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : false,
      }),

      // Define environment variables
      new webpack.DefinePlugin(envKeys),
    ],
  };
};

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");
const fs = require("fs");

module.exports = () => {
  // Determine the environment mode (default to "local" if not provided)
  const envMode = process.env.NODE_ENV || "local";

  // Load the appropriate environment file
  const envPath = path.resolve(__dirname, `.env.${envMode}`);
  const parsedEnv = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

  // Convert the environment variables into Webpack DefinePlugin format
  const envKeys = Object.keys(parsedEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(parsedEnv[next]);
    return prev;
  }, {});

  return {
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash].js",
      clean: true,
      publicPath: "/",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
      alias: {
        "@api": path.resolve(__dirname, "src/api/"),
        "@components": path.resolve(__dirname, "src/components/"),
        "@context": path.resolve(__dirname, "src/context/"),
        "@hooks": path.resolve(__dirname, "src/hooks/"),
        "@pages": path.resolve(__dirname, "src/pages/"),
        "@styles": path.resolve(__dirname, "src/styles/"),
        "@utils": path.resolve(__dirname, "src/utils/"),
      },
    },
    mode: "development",
    devtool: "source-map",
    devServer: {
      historyApiFallback: true,
      hot: true,
      port: 3000,
    },
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
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        favicon: false, // Set to your favicon path if needed
      }),
      new webpack.DefinePlugin(envKeys), // Inject the environment variables dynamically
    ],
  };
};

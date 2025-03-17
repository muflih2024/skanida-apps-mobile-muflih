module.exports = function (api) {
  api.cache(true);
  const plugins = [];

  plugins.push([
    "@tamagui/babel-plugin",
    {
      components: ["tamagui"],
      config: "./tamagui.config.ts",
    },
  ]);

  plugins.push([
    "module:react-native-dotenv",
    {
      moduleName: "@env",
      path: ".env",
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true,
    },
  ]);

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};

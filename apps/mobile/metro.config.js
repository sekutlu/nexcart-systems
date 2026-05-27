const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Transpile packages that use private class fields (#x syntax)
// which Hermes cannot compile without Babel transformation
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

const defaultBlockList = config.resolver.blockList || [];
const blockListArr = Array.isArray(defaultBlockList)
  ? defaultBlockList
  : [defaultBlockList];

config.resolver.blockList = blockListArr;

// Force Metro to transpile react-native-reanimated source
config.resolver.sourceExts = [...(config.resolver.sourceExts || ["js", "jsx", "ts", "tsx", "json"])];

module.exports = config;

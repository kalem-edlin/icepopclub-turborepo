// Learn more https://docs.expo.dev/guides/monorepos
const { getDefaultConfig } = require("expo/metro-config")
const { FileStore } = require("metro-cache")
const path = require("path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// #1 - Watch all files in the monorepo
config.watchFolders = [workspaceRoot]
// #3 - Force resolving nested modules to the folders below
config.resolver.disableHierarchicalLookup = true
// #2 - Try resolving with project modules first, then workspace modules
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(workspaceRoot, "node_modules"),
]

// TODO: I think there is a more graceful way to load env variables into the expo project involving Turbo and such
require("@expo/env").load(workspaceRoot, { force: true })

// Use turborepo to restore the cache when possible
config.cacheStores = [
	new FileStore({
		root: path.join(projectRoot, "node_modules", ".cache", "metro"),
	}),
]

module.exports = config

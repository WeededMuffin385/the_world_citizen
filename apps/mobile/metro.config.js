const {getDefaultConfig} = require('expo/metro-config');
const {prepareMapLibreWorker} = require('./scripts/prepare-maplibre-worker.cjs');

// Metro does not emit MapLibre's separate module worker. Serve it as a local
// public asset in development and include it in production web exports.
prepareMapLibreWorker(__dirname);

module.exports = getDefaultConfig(__dirname);

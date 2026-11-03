const {copyFileSync, mkdirSync} = require('node:fs');
const path = require('node:path');

function prepareMapLibreWorker(projectRoot) {
    const packageFile = require.resolve('maplibre-gl/package.json');
    const {version} = require(packageFile);
    const packageRoot = path.dirname(packageFile);
    const destination = path.join(projectRoot, 'public', 'vendor', 'maplibre', version);
    mkdirSync(destination, {recursive: true});
    // Keep the worker's companion module beside it, as recommended by MapLibre.
    for (const filename of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
        copyFileSync(path.join(packageRoot, 'dist', filename), path.join(destination, filename));
    }
    copyFileSync(path.join(packageRoot, 'LICENSE.txt'), path.join(destination, 'LICENSE.txt'));
    return destination;
}

module.exports = {prepareMapLibreWorker};

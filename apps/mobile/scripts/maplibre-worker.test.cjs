const assert = require('node:assert/strict');
const {mkdtempSync, readFileSync, rmSync} = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {prepareMapLibreWorker} = require('./prepare-maplibre-worker.cjs');

test('publishes the installed worker, its relative shared module, and license together', () => {
    const projectRoot = mkdtempSync(path.join(os.tmpdir(), 'maplibre-worker-'));
    try {
        const packageRoot = path.dirname(require.resolve('maplibre-gl/package.json'));
        const {version} = require('maplibre-gl/package.json');
        const destination = prepareMapLibreWorker(projectRoot);
        assert.equal(destination, path.join(projectRoot, 'public', 'vendor', 'maplibre', version));
        for (const filename of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
            assert.deepEqual(readFileSync(path.join(destination, filename)), readFileSync(path.join(packageRoot, 'dist', filename)));
        }
        assert.deepEqual(readFileSync(path.join(destination, 'LICENSE.txt')), readFileSync(path.join(packageRoot, 'LICENSE.txt')));
        assert.equal(prepareMapLibreWorker(projectRoot), destination);
    } finally {
        rmSync(projectRoot, {recursive: true, force: true});
    }
});

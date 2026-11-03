const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function loadSource(relative, environment = {}) {
    const filename = path.resolve(root, relative);
    const module = {exports: {}};
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText;
    vm.runInNewContext(code, {
        module, exports: module.exports, URL, Response, process: {env: environment},
        require(id) {
            if (id.endsWith('.json')) return JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), id), 'utf8'));
            const target = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : path.resolve(path.dirname(filename), id);
            return loadSource(`${target}.ts`, environment);
        },
    }, {filename});
    return module.exports;
}
const {countryMapStyle, countryBounds, readCountryCode} = loadSource('src/pages/explore/maps/country-map-data.ts');

test('country selection accepts only supported ISO codes', () => {
    assert.equal(readCountryCode('AU'), 'AU');
    for (const value of ['XX', 'au', '', null, {}, 42]) assert.equal(readCountryCode(value), null);
});

test('both themes use embedded geometry and no remote resources', () => {
    for (const dark of [true, false]) {
        const style = countryMapStyle(dark, 'AU', 'NZ');
        assert.equal(style.version, 8);
        assert.equal(style.sources.countries.type, 'geojson');
        assert.ok(style.sources.countries.data.features.length > 200);
        assert.equal(style.glyphs, undefined);
        assert.equal(style.sprite, undefined);
        assert.equal(style.sources.countries.url, undefined);
        assert.equal(Object.keys(style.sources).length, 1);
        assert.equal(style.layers.find(layer => layer.id === 'selected-border').filter[2], 'AU');
        assert.ok(JSON.stringify(style.layers[1]).includes('NZ'));
    }
    assert.notEqual(countryMapStyle(true, null).layers[0].paint['background-color'],
        countryMapStyle(false, null).layers[0].paint['background-color']);
});

test('restored viewports cover country geometry and handle the antimeridian', () => {
    const australia = countryBounds('AU');
    assert.ok(australia[0] < australia[2]);
    assert.ok(australia[1] < australia[3]);
    const fiji = countryBounds('FJ');
    assert.ok(fiji[2] - fiji[0] < 30);
    assert.equal(countryBounds('XX'), null);
    assert.equal(countryBounds(null), null);
});

test('bundled map contains valid supported country codes and closed polygons', () => {
    const boundaries = JSON.parse(fs.readFileSync(path.join(root, 'src/pages/explore/data/country-boundaries.json'), 'utf8'));
    const {COUNTRIES} = loadSource('src/pages/explore/data/countries.ts');
    const supported = new Set(COUNTRIES.map(country => country.code));
    assert.ok(boundaries.features.length > 200);
    assert.equal(new Set(boundaries.features.map(feature => feature.properties.code)).size, boundaries.features.length);
    const australia = boundaries.features.find(feature => feature.properties.code === 'AU');
    const longitudes = australia.geometry.coordinates.flat(2).map(point => point[0]);
    assert.ok(Math.max(...longitudes) - Math.min(...longitudes) > 30);
    for (const feature of boundaries.features) {
        assert.ok(supported.has(feature.properties.code));
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
        for (const polygon of polygons) for (const ring of polygon) {
            assert.ok(ring.length >= 4);
            assert.deepEqual(ring[0], ring.at(-1));
        }
    }
});

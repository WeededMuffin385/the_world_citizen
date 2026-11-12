const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function harness(platform = 'android', pathname = '/home') {
    const visible = [], navigation = [], scrolls = [], effects = [], timers = new Map();
    let stateIndex = 0, timerId = 0;
    const routes = ['home', 'explore', 'journey', 'account', 'settings'].map(name => ({name, href: `/${name}`}));
    const module = {exports: {}};
    const filename = path.join(__dirname, '../src/navigation/components/tab-pager.tsx');
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX},
    }).outputText;
    const jsx = (type, props) => ({type, props});
    vm.runInNewContext(code, {
        module, exports: module.exports,
        setTimeout: callback => {timers.set(++timerId, callback); return timerId;},
        clearTimeout: id => timers.delete(id),
        require(id) {
            if (id === 'react/jsx-runtime') return {jsx, jsxs: jsx};
            if (id === 'react') return {
                useRef: current => ({current}), useEffect: callback => effects.push(callback),
                useLayoutEffect: callback => effects.push(callback),
                useState: initial => [stateIndex++ === 0 ? 320 : typeof initial === 'function' ? initial() : initial, () => {}],
            };
            if (id === 'react-native') return {Platform: {OS: platform}, ScrollView: 'ScrollView', View: 'View', StyleSheet: {create: value => value}};
            if (id === 'expo-router/ui') return {TabSlot: 'TabSlot'};
            if (id === 'expo-router') return {usePathname: () => pathname, router: {prefetch() {}, navigate: href => navigation.push(href)}};
            if (id === '../tab-routes') return {TAB_ROUTES: routes};
            throw new Error(`Unexpected import: ${id}`);
        },
    });
    const {props} = module.exports.TabPager({onVisiblePageChange: index => visible.push(index)});
    props.ref.current = {scrollTo: options => scrolls.push(options)};
    effects.forEach(effect => effect());
    return {props, visible, navigation, scrolls,
        scroll: x => props.onScroll({nativeEvent: {contentOffset: {x}}}),
    };
}

for (const platform of ['android', 'ios', 'web']) {
    test(`${platform}: highlight changes during a swipe before route settlement`, () => {
        const pager = harness(platform);
        pager.props.onScrollBeginDrag();
        pager.scroll(120);
        assert.equal(pager.visible.at(-1), 0);
        pager.scroll(180);
        assert.equal(pager.visible.at(-1), 1);
        assert.deepEqual(pager.navigation, []);
        pager.scroll(320);
        pager.props.onScrollEndDrag();
        pager.props.onMomentumScrollEnd();
        assert.deepEqual(pager.navigation, ['/explore']);
    });

    test(`${platform}: reversing a swipe restores the highlight without navigation`, () => {
        const pager = harness(platform);
        pager.props.onScrollBeginDrag();
        pager.scroll(200);
        assert.equal(pager.visible.at(-1), 1);
        pager.scroll(0);
        pager.props.onScrollEndDrag();
        pager.props.onMomentumScrollEnd();
        assert.equal(pager.visible.at(-1), 0);
        assert.deepEqual(pager.navigation, []);
    });
}

test('programmatic scrolling highlights each visible page and clamps overscroll', () => {
    const pager = harness('web', '/journey');
    assert.equal(pager.visible.at(-1), 2);
    pager.scroll(960);
    assert.equal(pager.visible.at(-1), 3);
    pager.scroll(1280);
    assert.equal(pager.visible.at(-1), 4);
    pager.scroll(1800);
    assert.equal(pager.visible.at(-1), 4);
    pager.scroll(-320);
    assert.equal(pager.visible.at(-1), 0);
});

for (const platform of ['android', 'ios', 'web']) {
    test(`${platform}: a background detail route never scrolls or navigates to Home`, () => {
        const pager = harness(platform, '/trip/japan-classics');
        pager.scroll(0);
        pager.props.onMomentumScrollEnd();
        assert.deepEqual(pager.scrolls, []);
        assert.deepEqual(pager.navigation, []);
        assert.deepEqual(pager.visible, []);
    });

    test(`${platform}: restoring Explore cannot navigate from incidental scroll events`, () => {
        const pager = harness(platform, '/explore');
        pager.scroll(0);
        pager.props.onMomentumScrollEnd();
        assert.deepEqual(pager.navigation, []);
    });
}

import { expect, fixture, defineCE } from '@open-wc/testing';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbStringState, UmbArrayState, UmbBasicState } from '@umbraco-cms/backoffice/observable-api';
import { UMB_CONTENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/content';
import {
    UMB_BLOCK_GRID_ENTRY_CONTEXT,
    UMB_BLOCK_GRID_MANAGER_CONTEXT,
    type UmbBlockGridLayoutAreaItemModel,
    type UmbBlockGridLayoutModel,
} from '@umbraco-cms/backoffice/block-grid';
import { BLOCK_PREVIEW_CONTEXT } from '../context/block-preview.context-token';
import { BlockGridPreviewCustomView } from './block-grid-preview.custom-view.element';

/**
 * Element-level regression test for issues #293/#294. render-scheduler.test.ts
 * covers the decision in isolation; this proves BlockGridPreviewCustomView is
 * actually wired to it — that a block with areas defers its first render until
 * layoutAreas arrives, and that a resize after the first render debounces.
 */

const DOC_KEY = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DOC_TYPE_KEY = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const CONTENT_KEY = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const ELEMENT_TYPE_KEY = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const AREA_KEY = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

class TestHostElement extends UmbLitElement {}
const testHostTag = defineCE(TestHostElement);

class SpyGridPreview extends BlockGridPreviewCustomView {
    public renderCalls: string[] = [];
    protected override async callPreviewApi() {
        this.renderCalls.push(JSON.stringify(this.blockGridValue.layout));
        return { data: '<div>preview</div>' };
    }
    protected override async fetchStylesheets() {
        return [];
    }
}
const previewTag = defineCE(SpyGridPreview);

function createBlockPreviewContextFake(host: HTMLElement) {
    return {
        getUnique: () => '',
        setUnique: (_u: string) => {},
        getDocumentTypeUnique: () => '',
        setDocumentTypeUnique: (_d: string) => {},
        requestQueue: { enqueue: <T>(fn: () => Promise<T>) => fn() },
        getOrCreateStylesheet: (_href: string) => Promise.resolve(new CSSStyleSheet()),
        getHostElement: () => host,
    };
}

function createContentWorkspaceFake(host: HTMLElement) {
    return {
        IS_CONTENT_WORKSPACE_CONTEXT: true,
        getEntityType: () => 'document',
        unique: new UmbStringState(DOC_KEY).asObservable(),
        structure: {
            contentTypeUniques: new UmbArrayState<string>([DOC_TYPE_KEY], (x) => x).asObservable(),
        },
        getHostElement: () => host,
    };
}

function createGridEntryFake(host: HTMLElement, layoutAreasState: UmbBasicState<UmbBlockGridLayoutAreaItemModel[] | undefined>, hasAreas: boolean) {
    return {
        contentKey: new UmbStringState(CONTENT_KEY).asObservable(),
        settingsKey: new UmbBasicState<string | undefined>(undefined).asObservable(),
        workspaceEditContentPath: new UmbStringState('/edit/path').asObservable(),
        contentElementTypeAlias: new UmbStringState('myElement').asObservable(),
        contentElementTypeKey: new UmbStringState(ELEMENT_TYPE_KEY).asObservable(),
        areas: new UmbArrayState(hasAreas ? [{ key: AREA_KEY }] : [], (x: { key: string }) => x.key).asObservable(),
        layout: new UmbBasicState<UmbBlockGridLayoutModel>({ contentKey: CONTENT_KEY, columnSpan: 6, rowSpan: 1, areas: [] }).asObservable(),
        layoutAreas: layoutAreasState.asObservable(),
        getHostElement: () => host,
    };
}

function createGridManagerFake(host: HTMLElement) {
    return {
        contents: new UmbArrayState([{ key: CONTENT_KEY, contentTypeKey: ELEMENT_TYPE_KEY }], (x: { key: string }) => x.key).asObservable(),
        settings: new UmbArrayState<{ key: string }>([], (x) => x.key).asObservable(),
        exposes: new UmbArrayState<{ contentKey: string }>([], (x) => x.contentKey).asObservable(),
        propertyAlias: new UmbStringState('myBlockGrid').asObservable(),
        getHostElement: () => host,
    };
}

async function waitForCondition(fn: () => boolean, timeout = 2000, interval = 20): Promise<boolean> {
    const start = performance.now();
    while (performance.now() - start < timeout) {
        if (fn()) return true;
        await new Promise((r) => setTimeout(r, interval));
    }
    return fn();
}

describe('block grid preview render timing (issue #293/#294)', () => {
    let root: TestHostElement;

    afterEach(() => root?.remove());

    it('defers the initial render until layoutAreas arrives for a block with areas', async () => {
        root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
        root.provideContext(BLOCK_PREVIEW_CONTEXT, createBlockPreviewContextFake(root) as never);
        root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

        const layoutAreasState = new UmbBasicState<UmbBlockGridLayoutAreaItemModel[] | undefined>(undefined);
        root.provideContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, createGridEntryFake(root, layoutAreasState, true) as never);
        root.provideContext(UMB_BLOCK_GRID_MANAGER_CONTEXT, createGridManagerFake(root) as never);

        const el = document.createElement(previewTag) as SpyGridPreview;
        root.appendChild(el);
        await el.updateComplete;
        await new Promise((r) => setTimeout(r, 50));

        expect(el.renderCalls.length, 'should not render before layoutAreas arrives').to.equal(0);

        layoutAreasState.setValue([{ key: AREA_KEY, items: [] }]);
        const rendered = await waitForCondition(() => el.renderCalls.length > 0);

        expect(rendered, 'should render once layoutAreas arrives').to.be.true;
        expect(el.renderCalls.length).to.equal(1);
    });

    it('renders immediately for a block with no areas, regardless of layoutAreas', async () => {
        root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
        root.provideContext(BLOCK_PREVIEW_CONTEXT, createBlockPreviewContextFake(root) as never);
        root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

        root.provideContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, createGridEntryFake(root, new UmbBasicState(undefined), false) as never);
        root.provideContext(UMB_BLOCK_GRID_MANAGER_CONTEXT, createGridManagerFake(root) as never);

        const el = document.createElement(previewTag) as SpyGridPreview;
        root.appendChild(el);
        await el.updateComplete;

        const rendered = await waitForCondition(() => el.renderCalls.length > 0);

        expect(rendered).to.be.true;
    });

    it('debounces a re-render when the block is resized after the first render', async () => {
        root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
        root.provideContext(BLOCK_PREVIEW_CONTEXT, createBlockPreviewContextFake(root) as never);
        root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

        const entryFake = createGridEntryFake(root, new UmbBasicState(undefined), false);
        const layoutState = new UmbBasicState<UmbBlockGridLayoutModel>({ contentKey: CONTENT_KEY, columnSpan: 6, rowSpan: 1, areas: [] });
        entryFake.layout = layoutState.asObservable();
        root.provideContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, entryFake as never);
        root.provideContext(UMB_BLOCK_GRID_MANAGER_CONTEXT, createGridManagerFake(root) as never);

        const el = document.createElement(previewTag) as SpyGridPreview;
        root.appendChild(el);
        await waitForCondition(() => el.renderCalls.length === 1);

        layoutState.setValue({ contentKey: CONTENT_KEY, columnSpan: 12, rowSpan: 1, areas: [] });
        await new Promise((r) => setTimeout(r, 100));
        expect(el.renderCalls.length, 'debounce window should not have elapsed yet').to.equal(1);

        const rerendered = await waitForCondition(() => el.renderCalls.length === 2, 1000);
        expect(rerendered, 'should render again after the debounce window').to.be.true;
    });
});

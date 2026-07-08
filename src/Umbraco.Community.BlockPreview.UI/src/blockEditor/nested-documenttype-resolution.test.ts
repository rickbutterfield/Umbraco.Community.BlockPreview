import { expect, fixture, defineCE } from '@open-wc/testing';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbStringState, UmbArrayState } from '@umbraco-cms/backoffice/observable-api';
import { UMB_CONTENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/content';
import { UMB_BLOCK_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/block';
import { BLOCK_PREVIEW_CONTEXT } from '../context/block-preview.context-token';
import { BlockPreviewBaseElement } from './block-preview-base.element';
import { BlockListPreviewCustomView } from './block-list-preview.custom-view.element';
import { BlockSinglePreviewCustomView } from './block-single-preview.custom-view.element';
import { BlockGridPreviewCustomView } from './block-grid-preview.custom-view.element';

/**
 * Regression test — follow-up to #298 ("resolve nodeKey for previews nested in
 * block lists").
 *
 * #298 made nested previews reach past the nearest block workspace to the document
 * workspace so they resolve the document *nodeKey*. But that same lookup also
 * supplies `documentTypeUnique`, so a nested preview ended up reporting the
 * *document's* content type. The server looks the block-editor property up on that
 * content type, and for a nested block the property lives on the parent *element
 * type*, not the document — so it isn't found and every nested block renders
 * "The property type is invalid." instead of a preview.
 *
 * The fix observes the nearest block workspace and, when present (nested), uses its
 * content type as the authoritative `documentTypeUnique`. This test provides a
 * document workspace and a nested block workspace whose content types DIFFER, and
 * asserts the preview resolves the *block workspace's* content type.
 *
 * The list/single/grid views all funnel through the base class, so the test runs
 * against each.
 */
const DOC_KEY = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DOC_TYPE_KEY = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
// The parent element type that owns the nested block-editor property — distinct
// from the document's content type.
const ELEMENT_TYPE_KEY = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

class TestHostElement extends UmbLitElement {}
const testHostTag = defineCE(TestHostElement);

function createHost(parent?: HTMLElement): TestHostElement {
    const el = document.createElement(testHostTag) as TestHostElement;
    (parent ?? document.body).appendChild(el);
    return el;
}

/** Document content workspace: exposes the document key + the document content type. */
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

/**
 * Nested block workspace: shadows the document workspace under the shared
 * 'UmbWorkspaceContext' alias and exposes the *owning element type* — which the
 * preview must use as documentTypeUnique.
 */
function createBlockWorkspaceFake(host: HTMLElement) {
    return {
        IS_BLOCK_WORKSPACE_CONTEXT: true,
        content: {
            structure: {
                contentTypeUniques: new UmbArrayState<string>([ELEMENT_TYPE_KEY], (x) => x).asObservable(),
            },
        },
        getHostElement: () => host,
    };
}

/** A BlockPreviewContext stand-in that records the documentTypeUnique it is told. */
function createBlockPreviewContextFake(host: HTMLElement) {
    const setDocumentTypeUniqueCalls: string[] = [];
    let stored = '';
    return {
        setDocumentTypeUniqueCalls,
        getUnique: () => DOC_KEY,
        setUnique: (_u: string) => {},
        getDocumentTypeUnique: () => stored,
        setDocumentTypeUnique: (d: string) => { stored = d; setDocumentTypeUniqueCalls.push(d); },
        requestQueue: { enqueue: <T>(fn: () => Promise<T>) => fn() },
        getOrCreateStylesheet: (_href: string) => Promise.resolve(new CSSStyleSheet()),
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

interface ViewScenario {
    name: string;
    previewTag: string;
}

const scenarios: ViewScenario[] = [
    { name: 'block list', previewTag: defineCE(class extends BlockListPreviewCustomView {}) },
    { name: 'block single', previewTag: defineCE(class extends BlockSinglePreviewCustomView {}) },
    { name: 'block grid', previewTag: defineCE(class extends BlockGridPreviewCustomView {}) },
];

scenarios.forEach(({ name, previewTag }) => {
    describe(`${name} preview documentTypeUnique resolution (follow-up to #298)`, () => {
        let root: TestHostElement;

        afterEach(() => {
            root?.remove();
        });

        it('uses the parent element type as documentTypeUnique when nested', async () => {
            // root provides the BlockPreview context and the document workspace
            root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
            root.provideContext(BLOCK_PREVIEW_CONTEXT, createBlockPreviewContextFake(root) as never);
            root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

            // a block workspace sits between the document and the preview (nested case)
            const blockHost = createHost(root);
            await blockHost.updateComplete;
            blockHost.provideContext(UMB_BLOCK_WORKSPACE_CONTEXT, createBlockWorkspaceFake(blockHost) as never);

            const el = document.createElement(previewTag) as BlockPreviewBaseElement;
            blockHost.appendChild(el);
            await el.updateComplete;

            const resolved = await waitForCondition(
                () => (el as unknown as { _blockContext: { documentTypeUnique: string } })._blockContext.documentTypeUnique === ELEMENT_TYPE_KEY
            );

            const actual = (el as unknown as { _blockContext: { documentTypeUnique: string } })._blockContext.documentTypeUnique;
            expect(resolved, `expected nested preview to use the parent element type (${ELEMENT_TYPE_KEY}) ` +
                `as documentTypeUnique, but got '${actual}' (the document content type is ${DOC_TYPE_KEY})`).to.be.true;
        });

        it('uses the document content type as documentTypeUnique when not nested', async () => {
            root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
            root.provideContext(BLOCK_PREVIEW_CONTEXT, createBlockPreviewContextFake(root) as never);
            root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

            const el = document.createElement(previewTag) as BlockPreviewBaseElement;
            root.appendChild(el);
            await el.updateComplete;

            const resolved = await waitForCondition(
                () => (el as unknown as { _blockContext: { documentTypeUnique: string } })._blockContext.documentTypeUnique === DOC_TYPE_KEY
            );

            expect(resolved).to.be.true;
        });
    });
});

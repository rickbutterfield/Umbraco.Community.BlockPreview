import { expect, fixture, defineCE } from '@open-wc/testing';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbStringState, UmbArrayState } from '@umbraco-cms/backoffice/observable-api';
import { UMB_CONTENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/content';
import { UMB_BLOCK_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/block';
import { BLOCK_PREVIEW_CONTEXT } from '../context/block-preview.context-token';
import { BlockPreviewBaseElement } from './block-preview-base.element';
import { BlockGridPreviewCustomView } from './block-grid-preview.custom-view.element';

/**
 * Regression test for issue #293 (nested-element regression) and #291 —
 * "The property type is invalid." for a Block Grid nested inside an element type.
 *
 * A block preview resolves two independent values:
 *   - nodeKey            → the *document* node being previewed (the page)
 *   - documentTypeUnique → the content type that *owns* the block-editor property
 *
 * For a top-level block editor both come from the document. But when the block
 * editor property lives on an element type (a block nested inside another block),
 * the owner of the property is the *element type*, not the root document.
 *
 * The document/content workspace and the block workspace share the context alias
 * 'UmbWorkspaceContext'. Since #297 the content-workspace lookup passes beyond
 * alias matches to reach the root document — which is correct for nodeKey but
 * wrong for documentTypeUnique: it resolves the root document type, so the server
 * cannot find the nested property alias on it and returns "The property type is
 * invalid."
 *
 * The owner content type must instead come from the nearest block workspace's
 * element content type when the preview is nested.
 *
 * Only the Block Grid path performs this server-side property lookup (to read the
 * grid's area/layout configuration); the list, single and rich-text render paths
 * do not use documentTypeUnique, so this fix — and this test — is Block Grid only.
 */
const DOC_KEY = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DOC_TYPE_KEY = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
// The element type that owns the nested block-editor property — distinct from the document type.
const ELEMENT_TYPE_KEY = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

class TestHostElement extends UmbLitElement {}
const testHostTag = defineCE(TestHostElement);

function createHost(parent?: HTMLElement): TestHostElement {
    const el = document.createElement(testHostTag) as TestHostElement;
    (parent ?? document.body).appendChild(el);
    return el;
}

/** Root document workspace: node key + document content type. */
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

/** Nested block workspace editing an element whose content type OWNS the block property. */
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

/** Spyable BlockPreviewContext stand-in recording the resolved node key + document type. */
function createBlockPreviewContextFake(host: HTMLElement) {
    const setUniqueCalls: string[] = [];
    const setDocumentTypeUniqueCalls: string[] = [];
    return {
        setUniqueCalls,
        setDocumentTypeUniqueCalls,
        getUnique: () => '',
        setUnique: (u: string) => { setUniqueCalls.push(u); },
        getDocumentTypeUnique: () => '',
        setDocumentTypeUnique: (d: string) => { setDocumentTypeUniqueCalls.push(d); },
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

/**
 * Grid preview with stylesheet fetching stubbed out. Stylesheet loading is
 * irrelevant to workspace / owner-type resolution and otherwise triggers a real
 * HTTP request to the OpenAPI client default, making the test slow and flaky.
 */
class TestGridPreview extends BlockGridPreviewCustomView {
    protected override async fetchStylesheets(): Promise<string[]> {
        return [];
    }
}

const scenarios = [
    { name: 'block grid', previewTag: defineCE(class extends TestGridPreview {}) },
];

scenarios.forEach(({ name, previewTag }) => {
    describe(`${name} preview owner content type resolution (issue #293/#291)`, () => {
        let root: TestHostElement;

        afterEach(() => {
            root?.remove();
        });

        it('resolves documentTypeUnique to the element type owning the property when nested', async () => {
            root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
            const blockPreviewFake = createBlockPreviewContextFake(root);
            root.provideContext(BLOCK_PREVIEW_CONTEXT, blockPreviewFake as never);
            root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

            // A block workspace (editing the owner element type) sits between the document and the preview.
            const blockHost = createHost(root);
            await blockHost.updateComplete;
            blockHost.provideContext(UMB_BLOCK_WORKSPACE_CONTEXT, createBlockWorkspaceFake(blockHost) as never);

            const el = document.createElement(previewTag) as BlockPreviewBaseElement;
            blockHost.appendChild(el);
            await el.updateComplete;

            // The nearest block workspace (documentTypeUnique) and the root content
            // workspace (nodeKey) resolve independently and in no guaranteed order, so
            // wait until both have been observed.
            await waitForCondition(
                () =>
                    blockPreviewFake.setDocumentTypeUniqueCalls.includes(ELEMENT_TYPE_KEY) &&
                    blockPreviewFake.setUniqueCalls.includes(DOC_KEY),
            );

            expect(
                blockPreviewFake.setDocumentTypeUniqueCalls.includes(ELEMENT_TYPE_KEY),
                `expected documentTypeUnique to resolve to the owner element type (${ELEMENT_TYPE_KEY}); ` +
                `setDocumentTypeUnique was called with: [${blockPreviewFake.setDocumentTypeUniqueCalls.join(', ')}]`,
            ).to.be.true;

            // nodeKey must still resolve to the root document (guards the #297 fix).
            expect(
                blockPreviewFake.setUniqueCalls.includes(DOC_KEY),
                `expected nodeKey to stay the document key (${DOC_KEY}); ` +
                `setUnique was called with: [${blockPreviewFake.setUniqueCalls.join(', ')}]`,
            ).to.be.true;
        });

        it('resolves documentTypeUnique to the document type when not nested', async () => {
            root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
            const blockPreviewFake = createBlockPreviewContextFake(root);
            root.provideContext(BLOCK_PREVIEW_CONTEXT, blockPreviewFake as never);
            root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

            const el = document.createElement(previewTag) as BlockPreviewBaseElement;
            root.appendChild(el);
            await el.updateComplete;

            const resolved = await waitForCondition(
                () => blockPreviewFake.setDocumentTypeUniqueCalls.includes(DOC_TYPE_KEY),
            );

            expect(resolved).to.be.true;
        });
    });
});

/**
 * The content workspace (nodeKey) and the nearest block workspace (owner content
 * type) resolve independently. When the content workspace resolves *first*, the
 * preview initially takes the root document type, then must correct itself to the
 * owner element type once the block workspace arrives (and re-render). This test
 * forces that order by providing the block workspace only after the content
 * workspace has already resolved.
 */
describe('block grid preview owner content type resolution — content workspace resolves first', () => {
    const previewTag = defineCE(class extends TestGridPreview {});
    let root: TestHostElement;

    afterEach(() => {
        root?.remove();
    });

    it('corrects documentTypeUnique to the owner element type when the block workspace arrives late', async () => {
        root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
        const blockPreviewFake = createBlockPreviewContextFake(root);
        root.provideContext(BLOCK_PREVIEW_CONTEXT, blockPreviewFake as never);
        root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

        // The block workspace host exists in the tree, but does NOT provide its
        // context yet — so only the content workspace can resolve at first.
        const blockHost = createHost(root);
        await blockHost.updateComplete;

        const el = document.createElement(previewTag) as BlockPreviewBaseElement;
        blockHost.appendChild(el);
        await el.updateComplete;

        // First resolution: only the document type is available.
        await waitForCondition(() => blockPreviewFake.setDocumentTypeUniqueCalls.includes(DOC_TYPE_KEY));
        expect(
            blockPreviewFake.setDocumentTypeUniqueCalls[0],
            `expected the first resolution to be the document type (${DOC_TYPE_KEY}); ` +
            `setDocumentTypeUnique was called with: [${blockPreviewFake.setDocumentTypeUniqueCalls.join(', ')}]`,
        ).to.equal(DOC_TYPE_KEY);

        // Now the nearest block workspace arrives — the preview must correct itself.
        blockHost.provideContext(UMB_BLOCK_WORKSPACE_CONTEXT, createBlockWorkspaceFake(blockHost) as never);

        await waitForCondition(() => blockPreviewFake.setDocumentTypeUniqueCalls.includes(ELEMENT_TYPE_KEY));
        const calls = blockPreviewFake.setDocumentTypeUniqueCalls;
        expect(
            calls[calls.length - 1],
            `expected documentTypeUnique to be corrected to the owner element type (${ELEMENT_TYPE_KEY}); ` +
            `setDocumentTypeUnique was called with: [${calls.join(', ')}]`,
        ).to.equal(ELEMENT_TYPE_KEY);
    });
});

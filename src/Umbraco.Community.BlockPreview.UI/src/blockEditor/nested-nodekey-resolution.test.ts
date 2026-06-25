import { expect, fixture, defineCE } from '@open-wc/testing';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbStringState, UmbArrayState } from '@umbraco-cms/backoffice/observable-api';
import { UMB_CONTENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/content';
import { UMB_BLOCK_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/block';
import { BLOCK_PREVIEW_CONTEXT } from '../context/block-preview.context-token';
import { BlockListPreviewCustomView } from './block-list-preview.custom-view.element';

/**
 * Regression test for issue #297 — "Fails getting nodeKey in nested block lists".
 *
 * Both UMB_CONTENT_WORKSPACE_CONTEXT and UMB_BLOCK_WORKSPACE_CONTEXT are registered
 * under the same context alias ('UmbWorkspaceContext'), distinguished only by a
 * discriminator. By default a context consumer stops at the first alias match, so a
 * block preview rendered *inside* another block (nested) finds the block workspace
 * first and never reaches the document content workspace — leaving it unable to
 * resolve the document nodeKey on its own.
 *
 * The fix makes the content-workspace lookup pass beyond alias matches, so the
 * preview resolves the real document key even when nested.
 */
const DOC_KEY = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DOC_TYPE_KEY = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

class TestHostElement extends UmbLitElement {}
const testHostTag = defineCE(TestHostElement);

// Reference the class as a value (not just a type) so the module — and its
// custom-element registration — is not elided as a type-only import, and define
// it under a dedicated tag we control.
const previewTag = defineCE(class extends BlockListPreviewCustomView {});

function createHost(parent?: HTMLElement): TestHostElement {
    const el = document.createElement(testHostTag) as TestHostElement;
    (parent ?? document.body).appendChild(el);
    return el;
}

/** A stand-in content workspace context exposing the document key + content type. */
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

/** A stand-in block workspace context that shadows the content workspace (same alias). */
function createBlockWorkspaceFake(host: HTMLElement) {
    return {
        IS_BLOCK_WORKSPACE_CONTEXT: true,
        content: {
            structure: {
                contentTypeUniques: new UmbArrayState<string>([DOC_TYPE_KEY], (x) => x).asObservable(),
            },
        },
        getHostElement: () => host,
    };
}

/** A spyable BlockPreviewContext stand-in. setUnique is only called once the
 *  preview has resolved the document workspace, so it is our success signal. */
function createBlockPreviewContextFake(host: HTMLElement) {
    const setUniqueCalls: string[] = [];
    return {
        setUniqueCalls,
        getUnique: () => '',
        setUnique: (u: string) => { setUniqueCalls.push(u); },
        getDocumentTypeUnique: () => '',
        setDocumentTypeUnique: (_d: string) => {},
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

describe('Block list preview nodeKey resolution (issue #297)', () => {
    let root: TestHostElement;

    afterEach(() => {
        root?.remove();
    });

    it('resolves the document nodeKey when nested under a block workspace', async () => {
        // root provides both the BlockPreview context and the document content workspace
        root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
        const blockPreviewFake = createBlockPreviewContextFake(root);
        root.provideContext(BLOCK_PREVIEW_CONTEXT, blockPreviewFake as never);
        root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

        // a block workspace sits between the document and the preview (the nested case)
        const blockHost = createHost(root);
        await blockHost.updateComplete;
        blockHost.provideContext(UMB_BLOCK_WORKSPACE_CONTEXT, createBlockWorkspaceFake(blockHost) as never);

        // the preview element is rendered inside the nested block workspace
        const el = document.createElement(previewTag) as BlockListPreviewCustomView;
        blockHost.appendChild(el);
        await el.updateComplete;

        const resolved = await waitForCondition(() => blockPreviewFake.setUniqueCalls.includes(DOC_KEY));

        expect(resolved, `expected the preview to resolve the document nodeKey (${DOC_KEY}); ` +
            `setUnique was called with: [${blockPreviewFake.setUniqueCalls.join(', ')}]`).to.be.true;
    });

    it('still resolves the document nodeKey when not nested', async () => {
        root = await fixture<TestHostElement>(`<${testHostTag}></${testHostTag}>`);
        const blockPreviewFake = createBlockPreviewContextFake(root);
        root.provideContext(BLOCK_PREVIEW_CONTEXT, blockPreviewFake as never);
        root.provideContext(UMB_CONTENT_WORKSPACE_CONTEXT, createContentWorkspaceFake(root) as never);

        const el = document.createElement(previewTag) as BlockListPreviewCustomView;
        root.appendChild(el);
        await el.updateComplete;

        const resolved = await waitForCondition(() => blockPreviewFake.setUniqueCalls.includes(DOC_KEY));

        expect(resolved).to.be.true;
    });
});

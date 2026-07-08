import { expect } from '@open-wc/testing';
import { isBlockActionNavigation } from './block-preview-base.element';

/**
 * Regression test for issue #312 — "Trying to delete a child block grid element
 * reloads the page and opens layout settings".
 *
 * Each block preview is rendered inside an <a class="block-preview-edit"> whose
 * href navigates to that block's edit workspace. When a Block Grid block has areas,
 * Umbraco renders the child block entries — including their action bars — INSIDE
 * that anchor. Clicking a child action (delete/copy/…) must NOT trigger the parent
 * anchor's navigation, otherwise the backoffice reloads into the parent block.
 *
 * `isBlockActionNavigation` is the decision the anchor guard makes: given a click's
 * composed path, should the anchor's default navigation be cancelled? It returns
 * true for clicks that originate inside a block action bar (so navigation is
 * suppressed) and false for a plain block-body click or the edit button (which
 * must be allowed to open the block workspace).
 *
 * The guard is registered in the capture phase so it still runs on Umbraco 17.5+,
 * where <umb-block-action> stops click propagation before it reaches the anchor.
 */

/**
 * Build a composed path (target-first, as EventTarget.composedPath() returns) from a
 * nested HTML string. Parser-created elements may carry attributes, so this works for
 * registered custom elements (uui-action-bar, umb-block-action, …) that reject
 * document.createElement upgrades. `nestedHtml` must nest each tag inside the previous.
 */
function pathFromHtml(nestedHtml: string): EventTarget[] {
    const root = document.createElement('div');
    root.innerHTML = nestedHtml.trim();
    // Descend to the innermost element, then walk back up to build the path.
    let deepest: Element = root.firstElementChild!;
    while (deepest.firstElementChild) {
        deepest = deepest.firstElementChild;
    }
    const path: EventTarget[] = [];
    for (let node: Element | null = deepest; node && node !== root; node = node.parentElement) {
        path.push(node);
    }
    return path;
}

describe('isBlockActionNavigation (issue #312)', () => {
    it('suppresses navigation for a delete action click (Umbraco 17.5 umb-block-action wrapper)', () => {
        const p = pathFromHtml(`
            <block-grid-preview><a class="block-preview-edit" href="#parent"><umb-block-grid-entry>
                <uui-action-bar><umb-block-action><uui-button label="delete"><button>delete</button></uui-button></umb-block-action></uui-action-bar>
            </umb-block-grid-entry></a></block-grid-preview>`);
        expect(isBlockActionNavigation(p)).to.be.true;
    });

    it('suppresses navigation for an action-bar click on older Umbraco (no umb-block-action wrapper)', () => {
        const p = pathFromHtml(`
            <block-grid-preview><a class="block-preview-edit" href="#parent"><umb-block-grid-entry>
                <uui-action-bar><uui-button label="delete"><button>delete</button></uui-button></uui-action-bar>
            </umb-block-grid-entry></a></block-grid-preview>`);
        expect(isBlockActionNavigation(p)).to.be.true;
    });

    it('allows navigation for a plain block-body click', () => {
        const p = pathFromHtml(`
            <block-grid-preview><a class="block-preview-edit" href="#nav"><div class="preview-body"><span>hero</span></div></a></block-grid-preview>`);
        expect(isBlockActionNavigation(p)).to.be.false;
    });

    it('allows the edit button through so it can open the block workspace', () => {
        const p = pathFromHtml(`
            <block-grid-preview><a class="block-preview-edit" href="#parent"><umb-block-grid-entry>
                <uui-action-bar><uui-button label="edit" href="/umbraco/section/content/x/block/edit/child/view/content"><button>edit</button></uui-button></uui-action-bar>
            </umb-block-grid-entry></a></block-grid-preview>`);
        expect(isBlockActionNavigation(p)).to.be.false;
    });

    it('suppresses navigation for a scale-handle interaction', () => {
        const p = pathFromHtml(`
            <block-grid-preview><a class="block-preview-edit" href="#parent"><umb-block-scale-handler></umb-block-scale-handler></a></block-grid-preview>`);
        expect(isBlockActionNavigation(p)).to.be.true;
    });
});

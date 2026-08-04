import { expect } from '@open-wc/testing';
import { decideGridRenderTrigger, shouldDeferInitialGridRender, ResizeDebouncer, GRID_RESIZE_DEBOUNCE_MS } from './render-scheduler';

/**
 * Unit tests for the Block Grid preview's render-timing decision, extracted from
 * block-grid-preview.custom-view.element.ts to make issues #293/#294 (previews
 * rendering blank or before layoutAreas is available) provable by assertion.
 */
describe('decideGridRenderTrigger (issue #293/#294)', () => {
    const noAreas = { areas: [] as { key: string }[], layoutAreas: undefined, layout: undefined };
    const readyState = { hasMarkup: true, isLoading: false, managerObserved: true };

    it('renders when layoutAreas arrives for the first time and the manager is observed', () => {
        const prev = { layoutAreas: undefined, layout: undefined };
        const next = { areas: [{ key: 'a' }], layoutAreas: [{ key: 'a', items: [] }], layout: undefined };

        expect(decideGridRenderTrigger(prev, next, readyState)).to.deep.equal({ kind: 'render', reason: 'layout-areas-arrived' });
    });

    it('does nothing when layoutAreas arrives but the manager has not been observed yet', () => {
        const prev = { layoutAreas: undefined, layout: undefined };
        const next = { areas: [{ key: 'a' }], layoutAreas: [{ key: 'a', items: [] }], layout: undefined };

        expect(decideGridRenderTrigger(prev, next, { ...readyState, managerObserved: false })).to.deep.equal({ kind: 'none' });
    });

    it('does nothing when the block has no areas', () => {
        const prev = { layoutAreas: undefined, layout: undefined };
        const next = { areas: [] as { key: string }[], layoutAreas: [{ key: 'a', items: [] }], layout: undefined };

        expect(decideGridRenderTrigger(prev, next, readyState)).to.deep.equal({ kind: 'none' });
    });

    it('debounces a re-render when columnSpan changes after the first render', () => {
        const prev = { layoutAreas: undefined, layout: { columnSpan: 6, rowSpan: 1 } };
        const next = { ...noAreas, layout: { columnSpan: 12, rowSpan: 1 } };

        expect(decideGridRenderTrigger(prev, next, readyState)).to.deep.equal({ kind: 'debounce', reason: 'resized', delayMs: GRID_RESIZE_DEBOUNCE_MS });
    });

    it('does not debounce a resize before the first render has happened', () => {
        const prev = { layoutAreas: undefined, layout: { columnSpan: 6, rowSpan: 1 } };
        const next = { ...noAreas, layout: { columnSpan: 12, rowSpan: 1 } };

        expect(decideGridRenderTrigger(prev, next, { ...readyState, hasMarkup: false })).to.deep.equal({ kind: 'none' });
    });

    it('does nothing when neither layoutAreas nor layout span changed', () => {
        const prev = { layoutAreas: [{ key: 'a', items: [] }], layout: { columnSpan: 6, rowSpan: 1 } };
        const next = { areas: [{ key: 'a' }], layoutAreas: [{ key: 'a', items: [] }], layout: { columnSpan: 6, rowSpan: 1 } };

        expect(decideGridRenderTrigger(prev, next, readyState)).to.deep.equal({ kind: 'none' });
    });
});

describe('shouldDeferInitialGridRender', () => {
    it('defers when the block has areas but layoutAreas has not arrived yet', () => {
        expect(shouldDeferInitialGridRender([{ key: 'a' }], undefined)).to.be.true;
    });

    it('does not defer when the block has no areas', () => {
        expect(shouldDeferInitialGridRender([], undefined)).to.be.false;
    });

    it('does not defer once layoutAreas has arrived', () => {
        expect(shouldDeferInitialGridRender([{ key: 'a' }], [{ key: 'a', items: [] }])).to.be.false;
    });
});

describe('ResizeDebouncer', () => {
    it('invokes the callback once after the delay', async () => {
        const debouncer = new ResizeDebouncer();
        let calls = 0;
        debouncer.schedule(20, () => { calls++; });

        await new Promise((r) => setTimeout(r, 50));

        expect(calls).to.equal(1);
    });

    it('cancels a pending call when scheduled again before it fires', async () => {
        const debouncer = new ResizeDebouncer();
        let calls = 0;
        debouncer.schedule(20, () => { calls++; });
        debouncer.schedule(20, () => { calls++; });

        await new Promise((r) => setTimeout(r, 50));

        expect(calls).to.equal(1);
    });

    it('does not invoke the callback if cancelled', async () => {
        const debouncer = new ResizeDebouncer();
        let calls = 0;
        debouncer.schedule(20, () => { calls++; });
        debouncer.cancel();

        await new Promise((r) => setTimeout(r, 50));

        expect(calls).to.equal(0);
    });
});

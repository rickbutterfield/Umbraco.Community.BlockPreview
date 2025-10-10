var P = (t) => {
  throw TypeError(t);
};
var w = (t, e, o) => e.has(t) || P("Cannot " + o);
var s = (t, e, o) => (w(t, e, "read from private field"), o ? o.call(t) : e.get(t)), c = (t, e, o) => e.has(t) ? P("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, o), h = (t, e, o, a) => (w(t, e, "write to private field"), a ? a.call(t, o) : e.set(t, o), o);
import { UmbPropertyActionBase as x } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as d } from "@umbraco-cms/backoffice/property";
import { B as f } from "./index-D1Fdp__Z.js";
var i, n, r;
class M extends x {
  constructor(o, a) {
    super(o, a);
    c(this, i);
    c(this, n);
    c(this, r);
    h(this, i, Promise.all([
      this.consumeContext(d, (m) => {
        h(this, n, m);
      }).asPromise(),
      this.consumeContext(f, (m) => {
        var p;
        h(this, r, m), (p = s(this, r)) == null || p.setSortMode(!1);
      }).asPromise()
    ]));
  }
  async execute() {
    if (await s(this, i), !s(this, n)) throw new Error("Property context not found");
    if (!s(this, r)) throw new Error("Block preview context not found");
    const o = await s(this, r).getSortMode();
    await s(this, r).setSortMode(!o);
  }
}
i = new WeakMap(), n = new WeakMap(), r = new WeakMap();
export {
  M as UmbSortModePropertyAction,
  M as api
};
//# sourceMappingURL=sort-mode.property-action-anRi0zXU.js.map

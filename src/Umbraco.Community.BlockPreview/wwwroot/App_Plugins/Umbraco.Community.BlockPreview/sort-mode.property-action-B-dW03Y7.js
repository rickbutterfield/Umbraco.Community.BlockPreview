var p = (t) => {
  throw TypeError(t);
};
var P = (t, e, o) => e.has(t) || p("Cannot " + o);
var i = (t, e, o) => (P(t, e, "read from private field"), o ? o.call(t) : e.get(t)), c = (t, e, o) => e.has(t) ? p("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, o), m = (t, e, o, a) => (P(t, e, "write to private field"), a ? a.call(t, o) : e.set(t, o), o);
import { UmbPropertyActionBase as w } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as x } from "@umbraco-cms/backoffice/property";
import { B as d } from "./index-D7KHVidI.js";
var s, n, r;
class l extends w {
  constructor(o, a) {
    super(o, a);
    c(this, s);
    c(this, n);
    c(this, r);
    m(this, s, Promise.all([
      this.consumeContext(x, (h) => {
        m(this, n, h);
      }).asPromise(),
      this.consumeContext(d, (h) => {
        m(this, r, h);
      }).asPromise()
    ]));
  }
  async execute() {
    if (await i(this, s), !i(this, n)) throw new Error("Property context not found");
    if (!i(this, r)) throw new Error("Block preview context not found");
    const o = await i(this, r).getSortMode();
    await i(this, r).setSortMode(!o);
  }
}
s = new WeakMap(), n = new WeakMap(), r = new WeakMap();
export {
  l as UmbSortModePropertyAction,
  l as api
};
//# sourceMappingURL=sort-mode.property-action-B-dW03Y7.js.map

import { UmbPropertyActionBase as r } from "@umbraco-cms/backoffice/property-action";
import { UMB_PROPERTY_CONTEXT as s } from "@umbraco-cms/backoffice/property";
import { B as i } from './index-B-RnP5Ex.js?v=4.3.0-alpha';
class m extends r {
  #o;
  #e;
  #t;
  constructor(t, e) {
    super(t, e), this.#o = Promise.all([
      this.consumeContext(s, (o) => {
        this.#e = o;
      }).asPromise(),
      this.consumeContext(i, (o) => {
        this.#t = o, this.#t?.setSortMode(!1);
      }).asPromise()
    ]);
  }
  async execute() {
    if (await this.#o, !this.#e) throw new Error("Property context not found");
    if (!this.#t) throw new Error("Block preview context not found");
    const t = await this.#t.getSortMode();
    await this.#t.setSortMode(!t);
  }
}
export {
  m as UmbSortModePropertyAction,
  m as api
};
//# sourceMappingURL=sort-mode.property-action-Ctyxg4Hh.js.map

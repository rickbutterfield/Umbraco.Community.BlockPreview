import { UMB_AUTH_CONTEXT as Ge } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as We } from "@umbraco-cms/backoffice/context-api";
import { html as V, ifDefined as je, unsafeHTML as Fe, css as Q, property as C, state as q, customElement as Y } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as He } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as Xe } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as Je } from "@umbraco-cms/backoffice/property";
import { UmbApiError as Qe, tryExecute as P } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Ye } from "@umbraco-cms/backoffice/external/uui";
import { UmbControllerBase as Z } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ze, UMB_BLOCK_GRID_MANAGER_CONTEXT as et } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as W } from "@umbraco-cms/backoffice/content";
import { observeMultiple as x, UmbObjectState as tt, UmbStringState as he, UmbBooleanState as it } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as st, UMB_BLOCK_LIST_MANAGER_CONTEXT as rt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as ot, UMB_BLOCK_RTE_MANAGER_CONTEXT as nt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as at } from "@umbraco-cms/backoffice/document";
const ct = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, i) => typeof i == "bigint" ? i.toString() : i
  )
}, lt = ({
  onRequest: t,
  onSseError: e,
  onSseEvent: i,
  responseTransformer: r,
  responseValidator: s,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: a,
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let d;
  const B = l ?? ((h) => new Promise((f) => setTimeout(f, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, f = 0;
    const T = c.signal ?? new AbortController().signal;
    for (; !T.aborted; ) {
      f++;
      const O = c.headers instanceof Headers ? c.headers : new Headers(c.headers);
      d !== void 0 && O.set("Last-Event-ID", d);
      try {
        const E = {
          redirect: "follow",
          ...c,
          body: c.serializedBody,
          headers: O,
          signal: T
        };
        let v = new Request(u, E);
        t && (v = await t(u, E));
        const y = await (c.fetch ?? globalThis.fetch)(v);
        if (!y.ok)
          throw new Error(
            `SSE failed: ${y.status} ${y.statusText}`
          );
        if (!y.body) throw new Error("No body in SSE response");
        const m = y.body.pipeThrough(new TextDecoderStream()).getReader();
        let F = "";
        const ne = () => {
          try {
            m.cancel();
          } catch {
          }
        };
        T.addEventListener("abort", ne);
        try {
          for (; ; ) {
            const { done: Ne, value: Ie } = await m.read();
            if (Ne) break;
            F += Ie;
            const ae = F.split(`

`);
            F = ae.pop() ?? "";
            for (const ze of ae) {
              const Ke = ze.split(`
`), z = [];
              let ce;
              for (const _ of Ke)
                if (_.startsWith("data:"))
                  z.push(_.replace(/^data:\s*/, ""));
                else if (_.startsWith("event:"))
                  ce = _.replace(/^event:\s*/, "");
                else if (_.startsWith("id:"))
                  d = _.replace(/^id:\s*/, "");
                else if (_.startsWith("retry:")) {
                  const ue = Number.parseInt(
                    _.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(ue) || (h = ue);
                }
              let S, le = !1;
              if (z.length) {
                const _ = z.join(`
`);
                try {
                  S = JSON.parse(_), le = !0;
                } catch {
                  S = _;
                }
              }
              le && (s && await s(S), r && (S = await r(S))), i?.({
                data: S,
                event: ce,
                id: d,
                retry: h
              }), z.length && (yield S);
            }
          }
        } finally {
          T.removeEventListener("abort", ne), m.releaseLock();
        }
        break;
      } catch (E) {
        if (e?.(E), o !== void 0 && f >= o)
          break;
        const v = Math.min(
          h * 2 ** (f - 1),
          a ?? 3e4
        );
        await B(v);
      }
    }
  }() };
}, ut = (t) => {
  switch (t) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, ht = (t) => {
  switch (t) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, dt = (t) => {
  switch (t) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, Ce = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: r,
  value: s
}) => {
  if (!e) {
    const a = (t ? s : s.map((l) => encodeURIComponent(l))).join(ht(r));
    switch (r) {
      case "label":
        return `.${a}`;
      case "matrix":
        return `;${i}=${a}`;
      case "simple":
        return a;
      default:
        return `${i}=${a}`;
    }
  }
  const n = ut(r), o = s.map((a) => r === "label" || r === "simple" ? t ? a : encodeURIComponent(a) : j({
    allowReserved: t,
    name: i,
    value: a
  })).join(n);
  return r === "label" || r === "matrix" ? n + o : o;
}, j = ({
  allowReserved: t,
  name: e,
  value: i
}) => {
  if (i == null)
    return "";
  if (typeof i == "object")
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these."
    );
  return `${e}=${t ? i : encodeURIComponent(i)}`;
}, ge = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: r,
  value: s,
  valueOnly: n
}) => {
  if (s instanceof Date)
    return n ? s.toISOString() : `${i}=${s.toISOString()}`;
  if (r !== "deepObject" && !e) {
    let l = [];
    Object.entries(s).forEach(([c, d]) => {
      l = [
        ...l,
        c,
        t ? d : encodeURIComponent(d)
      ];
    });
    const u = l.join(",");
    switch (r) {
      case "form":
        return `${i}=${u}`;
      case "label":
        return `.${u}`;
      case "matrix":
        return `;${i}=${u}`;
      default:
        return u;
    }
  }
  const o = dt(r), a = Object.entries(s).map(
    ([l, u]) => j({
      allowReserved: t,
      name: r === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(o);
  return r === "label" || r === "matrix" ? o + a : a;
}, pt = /\{[^{}]+\}/g, bt = ({ path: t, url: e }) => {
  let i = e;
  const r = e.match(pt);
  if (r)
    for (const s of r) {
      let n = !1, o = s.substring(1, s.length - 1), a = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), a = "label") : o.startsWith(";") && (o = o.substring(1), a = "matrix");
      const l = t[o];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(
          s,
          Ce({ explode: n, name: o, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          s,
          ge({
            explode: n,
            name: o,
            style: a,
            value: l,
            valueOnly: !0
          })
        );
        continue;
      }
      if (a === "matrix") {
        i = i.replace(
          s,
          `;${j({
            name: o,
            value: l
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        a === "label" ? `.${l}` : l
      );
      i = i.replace(s, u);
    }
  return i;
}, ft = ({
  baseUrl: t,
  path: e,
  query: i,
  querySerializer: r,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let o = (t ?? "") + n;
  e && (o = bt({ path: e, url: o }));
  let a = i ? r(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function yt(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const kt = async (t, e) => {
  const i = typeof e == "function" ? await e(t) : e;
  if (i)
    return t.scheme === "bearer" ? `Bearer ${i}` : t.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, xe = ({
  allowReserved: t,
  array: e,
  object: i
} = {}) => (s) => {
  const n = [];
  if (s && typeof s == "object")
    for (const o in s) {
      const a = s[o];
      if (a != null)
        if (Array.isArray(a)) {
          const l = Ce({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...e
          });
          l && n.push(l);
        } else if (typeof a == "object") {
          const l = ge({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "deepObject",
            value: a,
            ...i
          });
          l && n.push(l);
        } else {
          const l = j({
            allowReserved: t,
            name: o,
            value: a
          });
          l && n.push(l);
        }
    }
  return n.join("&");
}, _t = (t) => {
  if (!t)
    return "stream";
  const e = t.split(";")[0]?.trim();
  if (e) {
    if (e.startsWith("application/json") || e.endsWith("+json"))
      return "json";
    if (e === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some(
      (i) => e.startsWith(i)
    ))
      return "blob";
    if (e.startsWith("text/"))
      return "text";
  }
}, wt = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, vt = async ({
  security: t,
  ...e
}) => {
  for (const i of t) {
    if (wt(e, i.name))
      continue;
    const r = await kt(i, e.auth);
    if (!r)
      continue;
    const s = i.name ?? "Authorization";
    switch (i.in) {
      case "query":
        e.query || (e.query = {}), e.query[s] = r;
        break;
      case "cookie":
        e.headers.append("Cookie", `${s}=${r}`);
        break;
      case "header":
      default:
        e.headers.set(s, r);
        break;
    }
  }
}, de = (t) => ft({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : xe(t.querySerializer),
  url: t.url
}), pe = (t, e) => {
  const i = { ...t, ...e };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Te(t.headers, e.headers), i;
}, mt = (t) => {
  const e = [];
  return t.forEach((i, r) => {
    e.push([r, i]);
  }), e;
}, Te = (...t) => {
  const e = new Headers();
  for (const i of t) {
    if (!i)
      continue;
    const r = i instanceof Headers ? mt(i) : Object.entries(i);
    for (const [s, n] of r)
      if (n === null)
        e.delete(s);
      else if (Array.isArray(n))
        for (const o of n)
          e.append(s, o);
      else n !== void 0 && e.set(
        s,
        typeof n == "object" ? JSON.stringify(n) : n
      );
  }
  return e;
};
class H {
  constructor() {
    this.fns = [];
  }
  clear() {
    this.fns = [];
  }
  eject(e) {
    const i = this.getInterceptorIndex(e);
    this.fns[i] && (this.fns[i] = null);
  }
  exists(e) {
    const i = this.getInterceptorIndex(e);
    return !!this.fns[i];
  }
  getInterceptorIndex(e) {
    return typeof e == "number" ? this.fns[e] ? e : -1 : this.fns.indexOf(e);
  }
  update(e, i) {
    const r = this.getInterceptorIndex(e);
    return this.fns[r] ? (this.fns[r] = i, e) : !1;
  }
  use(e) {
    return this.fns.push(e), this.fns.length - 1;
  }
}
const Ct = () => ({
  error: new H(),
  request: new H(),
  response: new H()
}), gt = xe({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), xt = {
  "Content-Type": "application/json"
}, Ee = (t = {}) => ({
  ...ct,
  headers: xt,
  parseAs: "auto",
  querySerializer: gt,
  ...t
}), Tt = (t = {}) => {
  let e = pe(Ee(), t);
  const i = () => ({ ...e }), r = (u) => (e = pe(e, u), i()), s = Ct(), n = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: Te(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await vt({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const d = de(c);
    return { opts: c, url: d };
  }, o = async (u) => {
    const { opts: c, url: d } = await n(u), B = {
      redirect: "follow",
      ...c,
      body: yt(c)
    };
    let g = new Request(d, B);
    for (const b of s.request.fns)
      b && (g = await b(g, c));
    const I = c.fetch;
    let h = await I(g);
    for (const b of s.response.fns)
      b && (h = await b(h, g, c));
    const f = {
      request: g,
      response: h
    };
    if (h.ok) {
      const b = (c.parseAs === "auto" ? _t(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let m;
        switch (b) {
          case "arrayBuffer":
          case "blob":
          case "text":
            m = await h[b]();
            break;
          case "formData":
            m = new FormData();
            break;
          case "stream":
            m = h.body;
            break;
          case "json":
          default:
            m = {};
            break;
        }
        return c.responseStyle === "data" ? m : {
          data: m,
          ...f
        };
      }
      let y;
      switch (b) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          y = await h[b]();
          break;
        case "stream":
          return c.responseStyle === "data" ? h.body : {
            data: h.body,
            ...f
          };
      }
      return b === "json" && (c.responseValidator && await c.responseValidator(y), c.responseTransformer && (y = await c.responseTransformer(y))), c.responseStyle === "data" ? y : {
        data: y,
        ...f
      };
    }
    const T = await h.text();
    let O;
    try {
      O = JSON.parse(T);
    } catch {
    }
    const E = O ?? T;
    let v = E;
    for (const b of s.error.fns)
      b && (v = await b(E, h, g, c));
    if (v = v || {}, c.throwOnError)
      throw v;
    return c.responseStyle === "data" ? void 0 : {
      error: v,
      ...f
    };
  }, a = (u) => (c) => o({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: d, url: B } = await n(c);
    return lt({
      ...d,
      body: d.body,
      headers: d.headers,
      method: u,
      onRequest: async (g, I) => {
        let h = new Request(g, I);
        for (const f of s.request.fns)
          f && (h = await f(h, d));
        return h;
      },
      url: B
    });
  };
  return {
    buildUrl: de,
    connect: a("CONNECT"),
    delete: a("DELETE"),
    get: a("GET"),
    getConfig: i,
    head: a("HEAD"),
    interceptors: s,
    options: a("OPTIONS"),
    patch: a("PATCH"),
    post: a("POST"),
    put: a("PUT"),
    request: o,
    setConfig: r,
    sse: {
      connect: l("CONNECT"),
      delete: l("DELETE"),
      get: l("GET"),
      head: l("HEAD"),
      options: l("OPTIONS"),
      patch: l("PATCH"),
      post: l("POST"),
      put: l("PUT"),
      trace: l("TRACE")
    },
    trace: a("TRACE")
  };
}, k = Tt(Ee({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class U {
  static previewGridBlock(e) {
    return (e?.client ?? k).post({
      url: "/umbraco/block-preview/api/v1/preview/grid",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e?.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getGridStylesheet(e) {
    return (e?.client ?? k).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...e
    });
  }
  static getGridStylesheets(e) {
    return (e?.client ?? k).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...e
    });
  }
  static previewListBlock(e) {
    return (e?.client ?? k).post({
      url: "/umbraco/block-preview/api/v1/preview/list",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e?.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getListStylesheet(e) {
    return (e?.client ?? k).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...e
    });
  }
  static getListStylesheets(e) {
    return (e?.client ?? k).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...e
    });
  }
  static previewRichTextMarkup(e) {
    return (e?.client ?? k).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e?.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getRteStylesheet(e) {
    return (e?.client ?? k).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheet",
      ...e
    });
  }
  static getRteStylesheets(e) {
    return (e?.client ?? k).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheets",
      ...e
    });
  }
  static getSettings(e) {
    return (e?.client ?? k).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...e
    });
  }
}
const Se = new We("BlockPreviewContext");
var Et = Object.defineProperty, w = (t, e, i, r) => {
  for (var s = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = o(e, i, s) || s);
  return s && Et(e, i, s), s;
};
class p extends Xe {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._styleElements = [], this._requestId = 0, this._isConnected = !1, this.consumeContext(Se, async (e) => {
      this._blockPreviewContext = e, await this.setupContextObservers();
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._isConnected = !0;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._isConnected = !1, this._previewTimeout && (clearTimeout(this._previewTimeout), this._previewTimeout = void 0);
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      this.renderBlockPreview();
    }, 500));
  }
  // region Shared context observers
  observeSortMode() {
    this.observe(this._blockPreviewContext?.sortModeActive, (e) => {
      e !== void 0 && (this._sortModeActive = e);
    });
  }
  observePropertyDataset() {
    this.consumeContext(Je, (e) => {
      e && (this._blockContext.culture = e.getVariantId().culture ?? "");
    });
  }
  // endregion
  // region Workspace helpers
  /**
   * Shared handler called once the workspace context provides a unique + documentTypeUnique.
   * Sets up block context, triggers block value observation, and loads stylesheets.
   */
  async handleWorkspaceData(e, i) {
    !this._isConnected || !i || (this._blockContext.unique = e?.toString() ?? "", this._blockPreviewContext?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, this._blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), this._workspaceContextResolved = !0, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
  }
  /**
   * Fallback workspace observation via UMB_BLOCK_WORKSPACE_CONTEXT.
   * Used when the primary workspace context is unavailable (e.g. nested block editing).
   */
  observeBlockWorkspaceFallback() {
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(He, async (e) => {
      e && this.observe(e.content.structure.contentTypeUniques, async (i) => {
        const r = i[0];
        !this._isConnected || !r || (this._blockContext.unique = this._blockPreviewContext?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = r, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
      });
    });
  }
  async fetchAndLoadStylesheets() {
    const e = await this.fetchStylesheets();
    e && e.length > 0 && (this._styleElements = e.map((i) => {
      const r = document.createElement("link");
      return r.rel = "stylesheet", r.href = i, r;
    }));
  }
  // endregion
  // region Preview rendering
  resolveUniqueFromContext() {
    this._blockPreviewContext != null && this._blockContext.unique === "" && (this._blockContext.unique = this._blockPreviewContext.getUnique(), !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath))), this._blockPreviewContext != null && this._blockContext.documentTypeUnique === "" && (this._blockContext.documentTypeUnique = this._blockPreviewContext.getDocumentTypeUnique());
  }
  async renderBlockPreview() {
    if (!this._isConnected)
      return;
    if (this.resolveUniqueFromContext(), !this.validatePreviewData()) {
      this._error = this.localize.term("blockPreview_insufficientData"), this._isLoading = !1;
      return;
    }
    this._isLoading = !0, this._error = null;
    const e = ++this._requestId;
    try {
      const { data: i, error: r } = await this._blockPreviewContext.requestQueue.enqueue(
        () => this.callPreviewApi()
      );
      if (this._requestId !== e) return;
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : r ? (this._error = Qe.isUmbApiError(r) ? r.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
    } catch (i) {
      if (this._requestId !== e) return;
      this._error = this.localize.term("blockPreview_renderFailed"), this._isLoading = !1, console.error("Block preview error:", i);
    }
  }
  /**
   * Validates that sufficient data is available for a preview request.
   * Subclasses may override to add additional checks (e.g. contentUdi).
   */
  validatePreviewData() {
    const e = this._blockContext;
    return e.unique !== "" && e.blockEditorAlias !== "" && e.contentElementTypeAlias !== "";
  }
  // endregion
  // region Utilities
  extractUniqueFromWorkspacePath(e) {
    const i = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
    return i ? i[1] : "";
  }
  _handleClick(e) {
    const i = e.composedPath(), r = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (i.some((n) => n instanceof Element && r.includes(n.tagName))) {
      if (i.find((o) => o instanceof Ye && o.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (i.filter((n) => n instanceof Element && n.tagName === "A" && n.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const n = i.find((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
      n instanceof Element ? window.history.pushState({}, "", n.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  // endregion
  // region Rendering
  /**
   * Override in subclasses that support sort mode (grid, list) to provide a
   * fallback element when sort mode is active.
   */
  renderSortModeFallback() {
  }
  render() {
    if (this._sortModeActive)
      return this.renderSortModeFallback();
    if (this._isLoading)
      return V`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>`;
    if (this._error)
      return V`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return V`
                ${this._styleElements}
                <a
                    href=${je(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label=${this.localize.term("blockPreview_editBlock")}
                    class="block-preview-edit"
                >
                    ${Fe(this._htmlMarkup)}
                </a>
            `;
  }
  static {
    this.styles = [
      Q`
            a.block-preview-edit {
                display: block;
                color: inherit;
                text-decoration: inherit;
                border: 1px solid transparent;
                border-radius: 2px;
            }

            a.block-preview-edit:hover {
                border-color: var(--uui-color-interactive-emphasis, #3544b1);
            }

            .preview-alert {
                background-color: var(--uui-color-danger, #f0ac00);
                border: 1px solid transparent;
                border-radius: 0;
                margin-bottom: 20px;
                padding: 8px 35px 8px 14px;
                position: relative;

                &, a, h4 {
                    color: #fff;
                }

                pre {
                    white-space: normal;
                }

                uui-loader {
                    color: #fff;
                    margin-right: 16px;
                }
            }

            .preview-alert-warning {
                background-color: var(--uui-color-warning, #f0ac00);
                border-color: transparent;
                color: #000;
            }

            .preview-alert-info {
                background-color: var(--uui-color-default, #3544b1);
                border-color: transparent;
                color: #fff;
            }

            .preview-alert-danger, .preview-alert-error {
                background-color: var(--uui-color-danger, #f0ac00);
                border-color: transparent;
                color: #fff;
            }
        `
    ];
  }
}
w([
  C({ attribute: !1 })
], p.prototype, "content");
w([
  C({ attribute: !1 })
], p.prototype, "settings");
w([
  C({ attribute: !1 })
], p.prototype, "contentKey");
w([
  C({ attribute: !1 })
], p.prototype, "config");
w([
  C({ attribute: !1 })
], p.prototype, "unpublished");
w([
  C({ attribute: !1 })
], p.prototype, "icon");
w([
  C({ attribute: !1 })
], p.prototype, "label");
w([
  q()
], p.prototype, "_htmlMarkup");
w([
  q()
], p.prototype, "_isLoading");
w([
  q()
], p.prototype, "_error");
w([
  q()
], p.prototype, "_sortModeActive");
class St {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async previewGridBlock(e, i) {
    return await P(this.#e, U.previewGridBlock({ body: e, query: i }));
  }
  async previewListBlock(e, i) {
    return await P(this.#e, U.previewListBlock({ body: e, query: i }));
  }
  async previewRichTextMarkup(e, i) {
    return await P(this.#e, U.previewRichTextMarkup({ body: e, query: i }));
  }
  async getGridStylesheets(e) {
    return await P(this.#e, U.getGridStylesheets({ query: e }));
  }
  async getListStylesheets(e) {
    return await P(this.#e, U.getListStylesheets({ query: e }));
  }
  async getRteStylesheets(e) {
    return await P(this.#e, U.getRteStylesheets({ query: e }));
  }
}
class ee extends Z {
  #e;
  constructor(e) {
    super(e), this.#e = new St(e);
  }
  async previewGridBlock(e, i) {
    return await this.#e.previewGridBlock(e, i);
  }
  async previewListBlock(e, i) {
    return await this.#e.previewListBlock(e, i);
  }
  async previewRichTextMarkup(e, i) {
    return await this.#e.previewRichTextMarkup(e, i);
  }
  async getGridStylesheets(e) {
    return await this.#e.getGridStylesheets(e);
  }
  async getListStylesheets(e) {
    return await this.#e.getListStylesheets(e);
  }
  async getRteStylesheets(e) {
    return await this.#e.getRteStylesheets(e);
  }
}
class Pt {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await P(this.#e, U.getSettings());
  }
}
class Pe extends Z {
  #e;
  constructor(e) {
    super(e), this.#e = new Pt(e);
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
var Ut = Object.defineProperty, At = Object.getOwnPropertyDescriptor, Ue = (t) => {
  throw TypeError(t);
}, Ae = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? At(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Ut(e, i, s), s;
}, te = (t, e, i) => e.has(t) || Ue("Cannot " + i), be = (t, e, i) => (te(t, e, "read from private field"), i ? i.call(t) : e.get(t)), fe = (t, e, i) => e.has(t) ? Ue("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), qt = (t, e, i, r) => (te(t, e, "write to private field"), e.set(t, i), i), X = (t, e, i) => (te(t, e, "access private method"), i), D, R, qe, Be, Oe;
const Bt = "block-grid-preview";
let M = class extends p {
  constructor() {
    super(), fe(this, R), fe(this, D), this._blockContext = {
      unique: "",
      documentTypeUnique: "",
      contentUdi: "",
      settingsUdi: "",
      blockEditorAlias: "",
      culture: "",
      workspaceEditContentPath: "",
      contentElementTypeAlias: "",
      contentElementTypeKey: "",
      areas: [],
      layout: void 0,
      layoutAreas: void 0,
      blockIndex: 0
    }, this._blockGridValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, qt(this, D, new ee(this));
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observeSortMode(), this.observePropertyDataset(), await X(this, R, qe).call(this);
  }
  observeBlockValue() {
    this.consumeContext(Ze, async (t) => {
      t && this.observe(
        x([
          t.contentKey,
          t.settingsKey,
          t.workspaceEditContentPath,
          t.contentElementTypeAlias,
          t.contentElementTypeKey,
          t.areas,
          t.layout,
          t.layoutAreas
        ]),
        async ([
          e,
          i,
          r,
          s,
          n,
          o,
          a,
          l
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await X(this, R, Be).call(this);
        }
      );
    });
  }
  async callPreviewApi() {
    return await be(this, D).previewGridBlock(
      JSON.stringify(this.blockGridValue),
      {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        contentUdi: this._blockContext.contentUdi,
        settingsUdi: this._blockContext.settingsUdi,
        culture: this._blockContext.culture,
        blockIndex: this._blockContext.blockIndex
      }
    );
  }
  async fetchStylesheets() {
    const { data: t } = await be(this, D).getGridStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
  renderSortModeFallback() {
    return V`<umb-block-grid-block
            class="umb-block-grid__block--view"
            .label=${this.label}
            .icon=${this.icon}
            .unpublished=${this.unpublished}
            .config=${this.config}
            .content=${this.content}
            .settings=${this.settings}>
            </umb-block-grid-block>
        `;
  }
};
D = /* @__PURE__ */ new WeakMap();
R = /* @__PURE__ */ new WeakSet();
qe = async function() {
  try {
    await this.getContext(W), this.consumeContext(W, (t) => {
      t && this.observe(
        x([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    });
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
Be = async function() {
  this.consumeContext(et, (t) => {
    t && this.observe(
      x([
        t.contents,
        t.settings,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, i, r, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockGridValue = {
          contentData: e ?? [],
          settingsData: i ?? [],
          expose: r ?? [],
          layout: { "Umbraco.BlockGrid": X(this, R, Oe).call(this) }
        }, this._blockContext.blockIndex = e.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
Oe = function() {
  return [
    {
      areas: this._blockContext.areas.map((i) => ({
        key: i.key,
        items: this._blockContext.layoutAreas?.find((s) => s.key === i.key)?.items ?? []
      })),
      columnSpan: this._blockContext.layout?.columnSpan ?? 0,
      rowSpan: this._blockContext.layout?.rowSpan ?? 0,
      contentKey: this._blockContext.layout?.contentKey ?? "",
      settingsKey: this._blockContext.layout?.settingsKey
    }
  ];
};
M.styles = [
  ...p.styles,
  Q`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
Ae([
  C({ attribute: !1 })
], M.prototype, "blockGridValue", 1);
M = Ae([
  Y(Bt)
], M);
var Ot = Object.defineProperty, Dt = Object.getOwnPropertyDescriptor, De = (t) => {
  throw TypeError(t);
}, ie = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Dt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Ot(e, i, s), s;
}, se = (t, e, i) => e.has(t) || De("Cannot " + i), ye = (t, e, i) => (se(t, e, "read from private field"), i ? i.call(t) : e.get(t)), ke = (t, e, i) => e.has(t) ? De("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Lt = (t, e, i, r) => (se(t, e, "write to private field"), e.set(t, i), i), _e = (t, e, i) => (se(t, e, "access private method"), i), L, K, Le, $e;
const $t = "block-list-preview";
let A = class extends p {
  constructor() {
    super(), ke(this, K), ke(this, L), this._blockContext = {
      unique: "",
      documentTypeUnique: "",
      contentUdi: "",
      settingsUdi: "",
      blockEditorAlias: "",
      culture: "",
      workspaceEditContentPath: "",
      contentElementTypeAlias: "",
      contentElementTypeKey: "",
      blockIndex: 0
    }, this._blockListValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, Lt(this, L, new ee(this));
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observeSortMode(), this.observePropertyDataset(), await _e(this, K, Le).call(this);
  }
  observeBlockValue() {
    this.consumeContext(st, (t) => {
      t && this.observe(
        x([
          t.contentKey,
          t.settingsKey,
          t.workspaceEditContentPath,
          t.contentElementTypeAlias,
          t.contentElementTypeKey
        ]),
        async ([
          e,
          i,
          r,
          s,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await _e(this, K, $e).call(this);
        }
      );
    });
  }
  async callPreviewApi() {
    return await ye(this, L).previewListBlock(
      JSON.stringify(this.blockListValue),
      {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        contentUdi: this._blockContext.contentUdi,
        settingsUdi: this._blockContext.settingsUdi,
        culture: this._blockContext.culture,
        blockIndex: this._blockContext.blockIndex
      }
    );
  }
  async fetchStylesheets() {
    const { data: t } = await ye(this, L).getListStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
  renderSortModeFallback() {
    return V`<umb-ref-list-block
            class="umb-block-grid__block--view"
            .label=${this.label}
            .icon=${this.icon}
            .unpublished=${this.unpublished}
            .config=${this.config}
            .content=${this.content}
            .settings=${this.settings}>
            </umb-ref-list-block>
        `;
  }
};
L = /* @__PURE__ */ new WeakMap();
K = /* @__PURE__ */ new WeakSet();
Le = async function() {
  try {
    await this.getContext(W), this.consumeContext(W, (t) => {
      t && this.observe(
        x([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    });
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
$e = function() {
  this.consumeContext(rt, (t) => {
    t && this.observe(
      x([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([
        e,
        i,
        r,
        s,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: e?.filter((o) => o.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((o) => o.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": r?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
A.styles = [
  ...p.styles,
  Q`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
ie([
  q()
], A.prototype, "_blockListValue", 2);
ie([
  C({ attribute: !1 })
], A.prototype, "blockListValue", 1);
A = ie([
  Y($t)
], A);
var Vt = Object.defineProperty, Rt = Object.getOwnPropertyDescriptor, Ve = (t) => {
  throw TypeError(t);
}, re = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Rt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Vt(e, i, s), s;
}, oe = (t, e, i) => e.has(t) || Ve("Cannot " + i), we = (t, e, i) => (oe(t, e, "read from private field"), i ? i.call(t) : e.get(t)), ve = (t, e, i) => e.has(t) ? Ve("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Mt = (t, e, i, r) => (oe(t, e, "write to private field"), e.set(t, i), i), me = (t, e, i) => (oe(t, e, "access private method"), i), $, G, Re, Me;
const Nt = "rich-text-preview";
let N = class extends p {
  constructor() {
    super(), ve(this, G), ve(this, $), this._blockContext = {
      unique: "",
      documentTypeUnique: "",
      contentUdi: "",
      settingsUdi: "",
      blockEditorAlias: "",
      culture: "",
      workspaceEditContentPath: "",
      contentElementTypeAlias: "",
      contentElementTypeKey: "",
      blockIndex: 0
    }, this._blockRteValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, Mt(this, $, new ee(this));
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), me(this, G, Re).call(this);
  }
  observeBlockValue() {
    this.consumeContext(ot, (t) => {
      t != null && this.observe(
        x([
          t.contentKey,
          t.settingsKey,
          t.workspaceEditContentPath,
          t.contentElementTypeAlias,
          t.contentElementTypeKey
        ]),
        async ([
          e,
          i,
          r,
          s,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await me(this, G, Me).call(this);
        }
      );
    });
  }
  async callPreviewApi() {
    return await we(this, $).previewRichTextMarkup(
      JSON.stringify(this.blockRteValue),
      {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        culture: this._blockContext.culture
      }
    );
  }
  async fetchStylesheets() {
    const { data: t } = await we(this, $).getRteStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
};
$ = /* @__PURE__ */ new WeakMap();
G = /* @__PURE__ */ new WeakSet();
Re = function() {
  this.consumeContext(at, (t) => {
    t && (this._workspaceContextResolved = !0, this.observe(
      x([t.unique, t.contentTypeUnique]),
      async ([e, i]) => {
        await this.handleWorkspaceData(e?.toString(), i);
      }
    ));
  }), this.observeBlockWorkspaceFallback();
};
Me = function() {
  this.consumeContext(nt, (t) => {
    t != null && this.observe(
      x([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([
        e,
        i,
        r,
        s,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: e?.filter((o) => o.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((o) => o.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": r?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? []
          }
        };
      }
    );
  });
};
re([
  q()
], N.prototype, "_blockRteValue", 2);
re([
  C({ attribute: !1 })
], N.prototype, "blockRteValue", 1);
N = re([
  Y(Nt)
], N);
class It {
  #e;
  #i = 0;
  #t = [];
  constructor(e = 3) {
    this.#e = e;
  }
  /**
   * Enqueue a task to run with concurrency limiting.
   * If fewer than `maxConcurrent` tasks are active, the task runs immediately.
   * Otherwise it waits until a slot is available.
   */
  async enqueue(e) {
    this.#i >= this.#e && await new Promise((i) => {
      this.#t.push(i);
    }), this.#i++;
    try {
      return await e();
    } finally {
      this.#i--, this.#t.length > 0 && this.#t.shift()();
    }
  }
}
class J extends Z {
  constructor(e) {
    super(e), this.#i = new It(3), this.#t = new tt(void 0), this.settings = this.#t.asObservable(), this.#s = new he(""), this.unique = this.#s.asObservable(), this.#r = new he(""), this.documentTypeUnique = this.#r.asObservable(), this.#o = new it(!1), this.sortModeActive = this.#o.asObservable(), this.#e = new Pe(e), this.getSettings(), this.setSortMode(!1);
  }
  #e;
  #i;
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#i;
  }
  #t;
  #s;
  #r;
  #o;
  async getSettings() {
    const e = await this.#e.getSettings();
    this.#t.setValue(e);
  }
  getUnique() {
    return this.#s.getValue();
  }
  async setUnique(e) {
    e !== "" && this.#s.setValue(e);
  }
  getDocumentTypeUnique() {
    return this.#r.getValue();
  }
  async setDocumentTypeUnique(e) {
    e !== "" && this.#r.setValue(e);
  }
  getSortMode() {
    return this.#o.getValue();
  }
  async setSortMode(e) {
    this.#o.setValue(e);
  }
}
const zt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: J,
  default: J
}, Symbol.toStringTag, { value: "Module" })), Kt = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => zt)
  }
], Gt = [...Kt], Wt = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], jt = [...Wt], ci = async (t, e) => {
  t.consumeContext(Ge, async (i) => {
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    k.setConfig({
      baseUrl: r?.base ?? "",
      auth: r?.token ?? void 0,
      credentials: r?.credentials ?? "same-origin"
    }), k.interceptors.request.use(async (a, l) => {
      const u = await r.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new Pe(t).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: M,
          forBlockEditor: "block-grid"
        };
        n.blockGrid.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockGrid.contentTypes), o.push(a);
      }
      if (n.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: A,
          forBlockEditor: "block-list"
        };
        n.blockList.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockList.contentTypes), o.push(a);
      }
      if (n.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: N,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    e.registerMany([
      ...o,
      ...Gt,
      ...jt
    ]), t.provideContext(Se, new J(t));
  });
};
export {
  M as BlockGridPreviewCustomView,
  A as BlockListPreviewCustomView,
  p as BlockPreviewBaseElement,
  St as PreviewDataSource,
  ee as PreviewRepository,
  N as RichTextPreviewCustomView,
  Pt as SettingsDataSource,
  Pe as SettingsRepository,
  ci as onInit
};
//# sourceMappingURL=index.js.map

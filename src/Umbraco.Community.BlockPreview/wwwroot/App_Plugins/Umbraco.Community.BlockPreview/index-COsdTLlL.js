import { UMB_AUTH_CONTEXT as je } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as Fe } from "@umbraco-cms/backoffice/context-api";
import { html as R, ifDefined as He, unsafeHTML as Xe, css as Q, property as C, state as B, customElement as Z } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Ye } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as Je } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as Qe, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as he } from "@umbraco-cms/backoffice/property";
import { UmbApiError as Ze, tryExecute as P } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as et } from "@umbraco-cms/backoffice/external/uui";
import { UmbControllerBase as ge } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as tt, UMB_BLOCK_GRID_MANAGER_CONTEXT as it, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as st } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as G } from "@umbraco-cms/backoffice/content";
import { observeMultiple as x, UmbObjectState as rt, UmbStringState as de, UmbBooleanState as ot } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as nt, UMB_BLOCK_LIST_MANAGER_CONTEXT as at, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as ct } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as lt, UMB_BLOCK_RTE_MANAGER_CONTEXT as ut } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as ht } from "@umbraco-cms/backoffice/document";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as dt } from "@umbraco-cms/backoffice/property-action";
const pt = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, i) => typeof i == "bigint" ? i.toString() : i
  )
}, ft = ({
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
  const q = l ?? ((h) => new Promise((b) => setTimeout(b, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, b = 0;
    const T = c.signal ?? new AbortController().signal;
    for (; !T.aborted; ) {
      b++;
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
        const w = y.body.pipeThrough(new TextDecoderStream()).getReader();
        let F = "";
        const ne = () => {
          try {
            w.cancel();
          } catch {
          }
        };
        T.addEventListener("abort", ne);
        try {
          for (; ; ) {
            const { done: ze, value: Ke } = await w.read();
            if (ze) break;
            F += Ke;
            const ae = F.split(`

`);
            F = ae.pop() ?? "";
            for (const We of ae) {
              const Ge = We.split(`
`), z = [];
              let ce;
              for (const _ of Ge)
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
          T.removeEventListener("abort", ne), w.releaseLock();
        }
        break;
      } catch (E) {
        if (e?.(E), o !== void 0 && b >= o)
          break;
        const v = Math.min(
          h * 2 ** (b - 1),
          a ?? 3e4
        );
        await q(v);
      }
    }
  }() };
}, bt = (t) => {
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
}, yt = (t) => {
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
}, kt = (t) => {
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
}, xe = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: r,
  value: s
}) => {
  if (!e) {
    const a = (t ? s : s.map((l) => encodeURIComponent(l))).join(yt(r));
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
  const n = bt(r), o = s.map((a) => r === "label" || r === "simple" ? t ? a : encodeURIComponent(a) : j({
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
}, Te = ({
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
  const o = kt(r), a = Object.entries(s).map(
    ([l, u]) => j({
      allowReserved: t,
      name: r === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(o);
  return r === "label" || r === "matrix" ? o + a : a;
}, _t = /\{[^{}]+\}/g, mt = ({ path: t, url: e }) => {
  let i = e;
  const r = e.match(_t);
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
          xe({ explode: n, name: o, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          s,
          Te({
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
}, vt = ({
  baseUrl: t,
  path: e,
  query: i,
  querySerializer: r,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let o = (t ?? "") + n;
  e && (o = mt({ path: e, url: o }));
  let a = i ? r(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function wt(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const Ct = async (t, e) => {
  const i = typeof e == "function" ? await e(t) : e;
  if (i)
    return t.scheme === "bearer" ? `Bearer ${i}` : t.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Ee = ({
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
          const l = xe({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...e
          });
          l && n.push(l);
        } else if (typeof a == "object") {
          const l = Te({
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
}, gt = (t) => {
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
}, xt = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, Tt = async ({
  security: t,
  ...e
}) => {
  for (const i of t) {
    if (xt(e, i.name))
      continue;
    const r = await Ct(i, e.auth);
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
}, pe = (t) => vt({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : Ee(t.querySerializer),
  url: t.url
}), fe = (t, e) => {
  const i = { ...t, ...e };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Se(t.headers, e.headers), i;
}, Et = (t) => {
  const e = [];
  return t.forEach((i, r) => {
    e.push([r, i]);
  }), e;
}, Se = (...t) => {
  const e = new Headers();
  for (const i of t) {
    if (!i)
      continue;
    const r = i instanceof Headers ? Et(i) : Object.entries(i);
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
const St = () => ({
  error: new H(),
  request: new H(),
  response: new H()
}), Pt = Ee({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), Ut = {
  "Content-Type": "application/json"
}, Pe = (t = {}) => ({
  ...pt,
  headers: Ut,
  parseAs: "auto",
  querySerializer: Pt,
  ...t
}), At = (t = {}) => {
  let e = fe(Pe(), t);
  const i = () => ({ ...e }), r = (u) => (e = fe(e, u), i()), s = St(), n = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: Se(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await Tt({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const d = pe(c);
    return { opts: c, url: d };
  }, o = async (u) => {
    const { opts: c, url: d } = await n(u), q = {
      redirect: "follow",
      ...c,
      body: wt(c)
    };
    let g = new Request(d, q);
    for (const f of s.request.fns)
      f && (g = await f(g, c));
    const N = c.fetch;
    let h = await N(g);
    for (const f of s.response.fns)
      f && (h = await f(h, g, c));
    const b = {
      request: g,
      response: h
    };
    if (h.ok) {
      const f = (c.parseAs === "auto" ? gt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let w;
        switch (f) {
          case "arrayBuffer":
          case "blob":
          case "text":
            w = await h[f]();
            break;
          case "formData":
            w = new FormData();
            break;
          case "stream":
            w = h.body;
            break;
          case "json":
          default:
            w = {};
            break;
        }
        return c.responseStyle === "data" ? w : {
          data: w,
          ...b
        };
      }
      let y;
      switch (f) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          y = await h[f]();
          break;
        case "stream":
          return c.responseStyle === "data" ? h.body : {
            data: h.body,
            ...b
          };
      }
      return f === "json" && (c.responseValidator && await c.responseValidator(y), c.responseTransformer && (y = await c.responseTransformer(y))), c.responseStyle === "data" ? y : {
        data: y,
        ...b
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
    for (const f of s.error.fns)
      f && (v = await f(E, h, g, c));
    if (v = v || {}, c.throwOnError)
      throw v;
    return c.responseStyle === "data" ? void 0 : {
      error: v,
      ...b
    };
  }, a = (u) => (c) => o({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: d, url: q } = await n(c);
    return ft({
      ...d,
      body: d.body,
      headers: d.headers,
      method: u,
      onRequest: async (g, N) => {
        let h = new Request(g, N);
        for (const b of s.request.fns)
          b && (h = await b(h, d));
        return h;
      },
      url: q
    });
  };
  return {
    buildUrl: pe,
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
}, k = At(Pe({
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
const Ue = new Fe("BlockPreviewContext");
var Bt = Object.defineProperty, m = (t, e, i, r) => {
  for (var s = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = o(e, i, s) || s);
  return s && Bt(e, i, s), s;
};
class p extends Je {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._styleElements = [], this._requestId = 0, this._isConnected = !1, this.consumeContext(Ue, async (e) => {
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
    this.consumeContext(Qe, (e) => {
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
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(Ye, async (e) => {
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
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : r ? (this._error = Ze.isUmbApiError(r) ? r.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
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
      if (i.find((o) => o instanceof et && o.href?.includes("block/edit")))
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
      return R`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>`;
    if (this._error)
      return R`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return R`
                ${this._styleElements}
                <a
                    href=${He(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label=${this.localize.term("blockPreview_editBlock")}
                    class="block-preview-edit"
                >
                    ${Xe(this._htmlMarkup)}
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
m([
  C({ attribute: !1 })
], p.prototype, "content");
m([
  C({ attribute: !1 })
], p.prototype, "settings");
m([
  C({ attribute: !1 })
], p.prototype, "contentKey");
m([
  C({ attribute: !1 })
], p.prototype, "config");
m([
  C({ attribute: !1 })
], p.prototype, "unpublished");
m([
  C({ attribute: !1 })
], p.prototype, "icon");
m([
  C({ attribute: !1 })
], p.prototype, "label");
m([
  B()
], p.prototype, "_htmlMarkup");
m([
  B()
], p.prototype, "_isLoading");
m([
  B()
], p.prototype, "_error");
m([
  B()
], p.prototype, "_sortModeActive");
class ee {
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
class qt {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await P(this.#e, U.getSettings());
  }
}
class Ae extends ge {
  #e;
  constructor(e) {
    super(e), this.#e = new qt(e);
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
var Ot = Object.defineProperty, Dt = Object.getOwnPropertyDescriptor, Be = (t) => {
  throw TypeError(t);
}, qe = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Dt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Ot(e, i, s), s;
}, te = (t, e, i) => e.has(t) || Be("Cannot " + i), be = (t, e, i) => (te(t, e, "read from private field"), i ? i.call(t) : e.get(t)), ye = (t, e, i) => e.has(t) ? Be("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Lt = (t, e, i, r) => (te(t, e, "write to private field"), e.set(t, i), i), X = (t, e, i) => (te(t, e, "access private method"), i), D, $, Oe, De, Le;
const Mt = "block-grid-preview";
let V = class extends p {
  constructor() {
    super(), ye(this, $), ye(this, D), this._blockContext = {
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
    }, Lt(this, D, new ee(this));
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observeSortMode(), this.observePropertyDataset(), await X(this, $, Oe).call(this);
  }
  observeBlockValue() {
    this.consumeContext(tt, async (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await X(this, $, De).call(this);
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
    return R`<umb-block-grid-block
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
$ = /* @__PURE__ */ new WeakSet();
Oe = async function() {
  try {
    await this.getContext(G), this.consumeContext(G, (t) => {
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
De = async function() {
  this.consumeContext(it, (t) => {
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
          layout: { "Umbraco.BlockGrid": X(this, $, Le).call(this) }
        }, this._blockContext.blockIndex = e.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
Le = function() {
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
V.styles = [
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
qe([
  C({ attribute: !1 })
], V.prototype, "blockGridValue", 1);
V = qe([
  Z(Mt)
], V);
var Rt = Object.defineProperty, $t = Object.getOwnPropertyDescriptor, Me = (t) => {
  throw TypeError(t);
}, ie = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? $t(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Rt(e, i, s), s;
}, se = (t, e, i) => e.has(t) || Me("Cannot " + i), ke = (t, e, i) => (se(t, e, "read from private field"), i ? i.call(t) : e.get(t)), _e = (t, e, i) => e.has(t) ? Me("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Vt = (t, e, i, r) => (se(t, e, "write to private field"), e.set(t, i), i), me = (t, e, i) => (se(t, e, "access private method"), i), L, K, Re, $e;
const It = "block-list-preview";
let A = class extends p {
  constructor() {
    super(), _e(this, K), _e(this, L), this._blockContext = {
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
    }, Vt(this, L, new ee(this));
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observeSortMode(), this.observePropertyDataset(), await me(this, K, Re).call(this);
  }
  observeBlockValue() {
    this.consumeContext(nt, (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await me(this, K, $e).call(this);
        }
      );
    });
  }
  async callPreviewApi() {
    return await ke(this, L).previewListBlock(
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
    const { data: t } = await ke(this, L).getListStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
  renderSortModeFallback() {
    return R`<umb-ref-list-block
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
Re = async function() {
  try {
    await this.getContext(G), this.consumeContext(G, (t) => {
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
  this.consumeContext(at, (t) => {
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
  B()
], A.prototype, "_blockListValue", 2);
ie([
  C({ attribute: !1 })
], A.prototype, "blockListValue", 1);
A = ie([
  Z(It)
], A);
var Nt = Object.defineProperty, zt = Object.getOwnPropertyDescriptor, Ve = (t) => {
  throw TypeError(t);
}, re = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? zt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Nt(e, i, s), s;
}, oe = (t, e, i) => e.has(t) || Ve("Cannot " + i), ve = (t, e, i) => (oe(t, e, "read from private field"), i ? i.call(t) : e.get(t)), we = (t, e, i) => e.has(t) ? Ve("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Kt = (t, e, i, r) => (oe(t, e, "write to private field"), e.set(t, i), i), Ce = (t, e, i) => (oe(t, e, "access private method"), i), M, W, Ie, Ne;
const Wt = "rich-text-preview";
let I = class extends p {
  constructor() {
    super(), we(this, W), we(this, M), this._blockContext = {
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
    }, Kt(this, M, new ee(this));
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), Ce(this, W, Ie).call(this);
  }
  observeBlockValue() {
    this.consumeContext(lt, (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await Ce(this, W, Ne).call(this);
        }
      );
    });
  }
  async callPreviewApi() {
    return await ve(this, M).previewRichTextMarkup(
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
    const { data: t } = await ve(this, M).getRteStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
};
M = /* @__PURE__ */ new WeakMap();
W = /* @__PURE__ */ new WeakSet();
Ie = function() {
  this.consumeContext(ht, (t) => {
    t && (this._workspaceContextResolved = !0, this.observe(
      x([t.unique, t.contentTypeUnique]),
      async ([e, i]) => {
        await this.handleWorkspaceData(e?.toString(), i);
      }
    ));
  }), this.observeBlockWorkspaceFallback();
};
Ne = function() {
  this.consumeContext(ut, (t) => {
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
  B()
], I.prototype, "_blockRteValue", 2);
re([
  C({ attribute: !1 })
], I.prototype, "blockRteValue", 1);
I = re([
  Z(Wt)
], I);
class Gt {
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
class Y extends ge {
  constructor(e) {
    super(e), this.#i = new Gt(3), this.#t = new rt(void 0), this.settings = this.#t.asObservable(), this.#s = new de(""), this.unique = this.#s.asObservable(), this.#r = new de(""), this.documentTypeUnique = this.#r.asObservable(), this.#o = new ot(!1), this.sortModeActive = this.#o.asObservable(), this.#e = new Ae(e), this.getSettings(), this.setSortMode(!1);
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
const jt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: Y,
  default: Y
}, Symbol.toStringTag, { value: "Module" })), Ft = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => jt)
  }
], Ht = Ft, J = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...dt.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action-9ouwZlL5.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, Xt = [
  J
], Yt = [
  {
    ...J.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode-BKWqp5d7.js"),
    forPropertyEditorUis: [st],
    conditions: [
      {
        alias: he
      }
    ]
  },
  {
    ...J.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.List.SortMode",
    name: "Block List Sort Mode Property Action",
    api: () => import("./block-list-sort-mode-BVahVx--.js"),
    forPropertyEditorUis: [ct],
    conditions: [
      {
        alias: he
      }
    ]
  }
], Jt = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], Qt = Jt, bi = async (t, e) => {
  t.consumeContext(je, async (i) => {
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
    const n = await new Ae(t).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: V,
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
          element: I,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    e.registerMany([
      ...o,
      ...Ht,
      ...Xt,
      ...Yt,
      ...Qt
    ]), t.provideContext(Ue, new Y(t));
  });
};
export {
  Ue as B,
  ee as P,
  I as R,
  qt as S,
  p as a,
  V as b,
  A as c,
  Ae as d,
  bi as o
};
//# sourceMappingURL=index-COsdTLlL.js.map

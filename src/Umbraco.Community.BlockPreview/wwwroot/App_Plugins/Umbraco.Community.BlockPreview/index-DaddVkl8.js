import { UMB_AUTH_CONTEXT as Oe } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as De } from "@umbraco-cms/backoffice/context-api";
import { html as D, ifDefined as Le, unsafeHTML as Ve, css as X, property as w, state as q, customElement as Y } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Me } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as Re } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as $e, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as ie } from "@umbraco-cms/backoffice/property";
import { UmbApiError as Ie, tryExecute as U } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Ne } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as je, UMB_BLOCK_GRID_MANAGER_CONTEXT as Ke, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as We } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as j } from "@umbraco-cms/backoffice/content";
import { observeMultiple as x, UmbObjectState as ze, UmbStringState as oe, UmbBooleanState as Ge } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Fe, UMB_BLOCK_LIST_MANAGER_CONTEXT as He, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as Xe } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Ye, UMB_BLOCK_RTE_MANAGER_CONTEXT as Je } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Qe } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as ue } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as Ze } from "@umbraco-cms/backoffice/property-action";
const et = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, s) => typeof s == "bigint" ? s.toString() : s
  )
}, tt = ({
  onRequest: t,
  onSseError: e,
  onSseEvent: s,
  responseTransformer: i,
  responseValidator: r,
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
        let C = new Request(u, E);
        t && (C = await t(u, E));
        const y = await (c.fetch ?? globalThis.fetch)(C);
        if (!y.ok)
          throw new Error(
            `SSE failed: ${y.status} ${y.statusText}`
          );
        if (!y.body) throw new Error("No body in SSE response");
        const v = y.body.pipeThrough(new TextDecoderStream()).getReader();
        let W = "";
        const Z = () => {
          try {
            v.cancel();
          } catch {
          }
        };
        T.addEventListener("abort", Z);
        try {
          for (; ; ) {
            const { done: Pe, value: Ae } = await v.read();
            if (Pe) break;
            W += Ae;
            const ee = W.split(`

`);
            W = ee.pop() ?? "";
            for (const qe of ee) {
              const Be = qe.split(`
`), $ = [];
              let te;
              for (const _ of Be)
                if (_.startsWith("data:"))
                  $.push(_.replace(/^data:\s*/, ""));
                else if (_.startsWith("event:"))
                  te = _.replace(/^event:\s*/, "");
                else if (_.startsWith("id:"))
                  d = _.replace(/^id:\s*/, "");
                else if (_.startsWith("retry:")) {
                  const re = Number.parseInt(
                    _.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(re) || (h = re);
                }
              let S, se = !1;
              if ($.length) {
                const _ = $.join(`
`);
                try {
                  S = JSON.parse(_), se = !0;
                } catch {
                  S = _;
                }
              }
              se && (r && await r(S), i && (S = await i(S))), s?.({
                data: S,
                event: te,
                id: d,
                retry: h
              }), $.length && (yield S);
            }
          }
        } finally {
          T.removeEventListener("abort", Z), v.releaseLock();
        }
        break;
      } catch (E) {
        if (e?.(E), o !== void 0 && f >= o)
          break;
        const C = Math.min(
          h * 2 ** (f - 1),
          a ?? 3e4
        );
        await B(C);
      }
    }
  }() };
}, st = (t) => {
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
}, rt = (t) => {
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
}, it = (t) => {
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
}, he = ({
  allowReserved: t,
  explode: e,
  name: s,
  style: i,
  value: r
}) => {
  if (!e) {
    const a = (t ? r : r.map((l) => encodeURIComponent(l))).join(rt(i));
    switch (i) {
      case "label":
        return `.${a}`;
      case "matrix":
        return `;${s}=${a}`;
      case "simple":
        return a;
      default:
        return `${s}=${a}`;
    }
  }
  const n = st(i), o = r.map((a) => i === "label" || i === "simple" ? t ? a : encodeURIComponent(a) : K({
    allowReserved: t,
    name: s,
    value: a
  })).join(n);
  return i === "label" || i === "matrix" ? n + o : o;
}, K = ({
  allowReserved: t,
  name: e,
  value: s
}) => {
  if (s == null)
    return "";
  if (typeof s == "object")
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these."
    );
  return `${e}=${t ? s : encodeURIComponent(s)}`;
}, de = ({
  allowReserved: t,
  explode: e,
  name: s,
  style: i,
  value: r,
  valueOnly: n
}) => {
  if (r instanceof Date)
    return n ? r.toISOString() : `${s}=${r.toISOString()}`;
  if (i !== "deepObject" && !e) {
    let l = [];
    Object.entries(r).forEach(([c, d]) => {
      l = [
        ...l,
        c,
        t ? d : encodeURIComponent(d)
      ];
    });
    const u = l.join(",");
    switch (i) {
      case "form":
        return `${s}=${u}`;
      case "label":
        return `.${u}`;
      case "matrix":
        return `;${s}=${u}`;
      default:
        return u;
    }
  }
  const o = it(i), a = Object.entries(r).map(
    ([l, u]) => K({
      allowReserved: t,
      name: i === "deepObject" ? `${s}[${l}]` : l,
      value: u
    })
  ).join(o);
  return i === "label" || i === "matrix" ? o + a : a;
}, ot = /\{[^{}]+\}/g, nt = ({ path: t, url: e }) => {
  let s = e;
  const i = e.match(ot);
  if (i)
    for (const r of i) {
      let n = !1, o = r.substring(1, r.length - 1), a = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), a = "label") : o.startsWith(";") && (o = o.substring(1), a = "matrix");
      const l = t[o];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        s = s.replace(
          r,
          he({ explode: n, name: o, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        s = s.replace(
          r,
          de({
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
        s = s.replace(
          r,
          `;${K({
            name: o,
            value: l
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        a === "label" ? `.${l}` : l
      );
      s = s.replace(r, u);
    }
  return s;
}, at = ({
  baseUrl: t,
  path: e,
  query: s,
  querySerializer: i,
  url: r
}) => {
  const n = r.startsWith("/") ? r : `/${r}`;
  let o = (t ?? "") + n;
  e && (o = nt({ path: e, url: o }));
  let a = s ? i(s) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function ct(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const lt = async (t, e) => {
  const s = typeof e == "function" ? await e(t) : e;
  if (s)
    return t.scheme === "bearer" ? `Bearer ${s}` : t.scheme === "basic" ? `Basic ${btoa(s)}` : s;
}, pe = ({
  allowReserved: t,
  array: e,
  object: s
} = {}) => (r) => {
  const n = [];
  if (r && typeof r == "object")
    for (const o in r) {
      const a = r[o];
      if (a != null)
        if (Array.isArray(a)) {
          const l = he({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...e
          });
          l && n.push(l);
        } else if (typeof a == "object") {
          const l = de({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "deepObject",
            value: a,
            ...s
          });
          l && n.push(l);
        } else {
          const l = K({
            allowReserved: t,
            name: o,
            value: a
          });
          l && n.push(l);
        }
    }
  return n.join("&");
}, ut = (t) => {
  if (!t)
    return "stream";
  const e = t.split(";")[0]?.trim();
  if (e) {
    if (e.startsWith("application/json") || e.endsWith("+json"))
      return "json";
    if (e === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some(
      (s) => e.startsWith(s)
    ))
      return "blob";
    if (e.startsWith("text/"))
      return "text";
  }
}, ht = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, dt = async ({
  security: t,
  ...e
}) => {
  for (const s of t) {
    if (ht(e, s.name))
      continue;
    const i = await lt(s, e.auth);
    if (!i)
      continue;
    const r = s.name ?? "Authorization";
    switch (s.in) {
      case "query":
        e.query || (e.query = {}), e.query[r] = i;
        break;
      case "cookie":
        e.headers.append("Cookie", `${r}=${i}`);
        break;
      case "header":
      default:
        e.headers.set(r, i);
        break;
    }
  }
}, ne = (t) => at({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : pe(t.querySerializer),
  url: t.url
}), ae = (t, e) => {
  const s = { ...t, ...e };
  return s.baseUrl?.endsWith("/") && (s.baseUrl = s.baseUrl.substring(0, s.baseUrl.length - 1)), s.headers = be(t.headers, e.headers), s;
}, pt = (t) => {
  const e = [];
  return t.forEach((s, i) => {
    e.push([i, s]);
  }), e;
}, be = (...t) => {
  const e = new Headers();
  for (const s of t) {
    if (!s)
      continue;
    const i = s instanceof Headers ? pt(s) : Object.entries(s);
    for (const [r, n] of i)
      if (n === null)
        e.delete(r);
      else if (Array.isArray(n))
        for (const o of n)
          e.append(r, o);
      else n !== void 0 && e.set(
        r,
        typeof n == "object" ? JSON.stringify(n) : n
      );
  }
  return e;
};
class z {
  constructor() {
    this.fns = [];
  }
  clear() {
    this.fns = [];
  }
  eject(e) {
    const s = this.getInterceptorIndex(e);
    this.fns[s] && (this.fns[s] = null);
  }
  exists(e) {
    const s = this.getInterceptorIndex(e);
    return !!this.fns[s];
  }
  getInterceptorIndex(e) {
    return typeof e == "number" ? this.fns[e] ? e : -1 : this.fns.indexOf(e);
  }
  update(e, s) {
    const i = this.getInterceptorIndex(e);
    return this.fns[i] ? (this.fns[i] = s, e) : !1;
  }
  use(e) {
    return this.fns.push(e), this.fns.length - 1;
  }
}
const bt = () => ({
  error: new z(),
  request: new z(),
  response: new z()
}), ft = pe({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), yt = {
  "Content-Type": "application/json"
}, fe = (t = {}) => ({
  ...et,
  headers: yt,
  parseAs: "auto",
  querySerializer: ft,
  ...t
}), kt = (t = {}) => {
  let e = ae(fe(), t);
  const s = () => ({ ...e }), i = (u) => (e = ae(e, u), s()), r = bt(), n = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: be(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await dt({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const d = ne(c);
    return { opts: c, url: d };
  }, o = async (u) => {
    const { opts: c, url: d } = await n(u), B = {
      redirect: "follow",
      ...c,
      body: ct(c)
    };
    let g = new Request(d, B);
    for (const b of r.request.fns)
      b && (g = await b(g, c));
    const R = c.fetch;
    let h = await R(g);
    for (const b of r.response.fns)
      b && (h = await b(h, g, c));
    const f = {
      request: g,
      response: h
    };
    if (h.ok) {
      const b = (c.parseAs === "auto" ? ut(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let v;
        switch (b) {
          case "arrayBuffer":
          case "blob":
          case "text":
            v = await h[b]();
            break;
          case "formData":
            v = new FormData();
            break;
          case "stream":
            v = h.body;
            break;
          case "json":
          default:
            v = {};
            break;
        }
        return c.responseStyle === "data" ? v : {
          data: v,
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
    let C = E;
    for (const b of r.error.fns)
      b && (C = await b(E, h, g, c));
    if (C = C || {}, c.throwOnError)
      throw C;
    return c.responseStyle === "data" ? void 0 : {
      error: C,
      ...f
    };
  }, a = (u) => (c) => o({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: d, url: B } = await n(c);
    return tt({
      ...d,
      body: d.body,
      headers: d.headers,
      method: u,
      onRequest: async (g, R) => {
        let h = new Request(g, R);
        for (const f of r.request.fns)
          f && (h = await f(h, d));
        return h;
      },
      url: B
    });
  };
  return {
    buildUrl: ne,
    connect: a("CONNECT"),
    delete: a("DELETE"),
    get: a("GET"),
    getConfig: s,
    head: a("HEAD"),
    interceptors: r,
    options: a("OPTIONS"),
    patch: a("PATCH"),
    post: a("POST"),
    put: a("PUT"),
    request: o,
    setConfig: i,
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
}, k = kt(fe({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class P {
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
const ye = new De("BlockPreviewContext");
var _t = Object.defineProperty, m = (t, e, s, i) => {
  for (var r = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = o(e, s, r) || r);
  return r && _t(e, s, r), r;
};
class p extends Re {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._styleElements = [], this._requestId = 0, this._isConnected = !1, this.consumeContext(ye, async (e) => {
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
    this.consumeContext($e, (e) => {
      e && (this._blockContext.culture = e.getVariantId().culture ?? "");
    });
  }
  // endregion
  // region Workspace helpers
  /**
   * Shared handler called once the workspace context provides a unique + documentTypeUnique.
   * Sets up block context, triggers block value observation, and loads stylesheets.
   */
  async handleWorkspaceData(e, s) {
    !this._isConnected || !s || (this._blockContext.unique = e?.toString() ?? "", this._blockPreviewContext?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = s, this._blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), this._workspaceContextResolved = !0, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
  }
  /**
   * Fallback workspace observation via UMB_BLOCK_WORKSPACE_CONTEXT.
   * Used when the primary workspace context is unavailable (e.g. nested block editing).
   */
  observeBlockWorkspaceFallback() {
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(Me, async (e) => {
      e && this.observe(e.content.structure.contentTypeUniques, async (s) => {
        const i = s[0];
        !this._isConnected || !i || (this._blockContext.unique = this._blockPreviewContext?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
      });
    });
  }
  async fetchAndLoadStylesheets() {
    const e = await this.fetchStylesheets();
    e && e.length > 0 && (this._styleElements = e.map((s) => {
      const i = document.createElement("link");
      return i.rel = "stylesheet", i.href = s, i;
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
      this._error = "Insufficient data for block preview", this._isLoading = !1;
      return;
    }
    this._isLoading = !0, this._error = null;
    const e = ++this._requestId;
    try {
      const { data: s, error: i } = await this._blockPreviewContext.requestQueue.enqueue(
        () => this.callPreviewApi()
      );
      if (this._requestId !== e) return;
      s != null ? (this._htmlMarkup = s, this._isLoading = !1) : i ? (this._error = Ie.isUmbApiError(i) ? i.message : "An error occurred rendering the block preview", this._isLoading = !1) : this._isLoading = !1;
    } catch (s) {
      if (this._requestId !== e) return;
      this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", s);
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
    const s = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
    return s ? s[1] : "";
  }
  _handleClick(e) {
    const s = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (s.some((n) => n instanceof Element && i.includes(n.tagName))) {
      if (s.find((o) => o instanceof Ne && o.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (s.filter((n) => n instanceof Element && n.tagName === "A" && n.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const n = s.find((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
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
      return D`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
    if (this._error)
      return D`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return D`
                ${this._styleElements}
                <a
                    href=${Le(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${Ve(this._htmlMarkup)}
                </a>
            `;
  }
  static {
    this.styles = [
      X`
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
  w({ attribute: !1 })
], p.prototype, "content");
m([
  w({ attribute: !1 })
], p.prototype, "settings");
m([
  w({ attribute: !1 })
], p.prototype, "contentKey");
m([
  w({ attribute: !1 })
], p.prototype, "config");
m([
  w({ attribute: !1 })
], p.prototype, "unpublished");
m([
  w({ attribute: !1 })
], p.prototype, "icon");
m([
  w({ attribute: !1 })
], p.prototype, "label");
m([
  q()
], p.prototype, "_htmlMarkup");
m([
  q()
], p.prototype, "_isLoading");
m([
  q()
], p.prototype, "_error");
m([
  q()
], p.prototype, "_sortModeActive");
var mt = Object.defineProperty, Ct = Object.getOwnPropertyDescriptor, ke = (t) => {
  throw TypeError(t);
}, _e = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ct(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && mt(e, s, r), r;
}, vt = (t, e, s) => e.has(t) || ke("Cannot " + s), wt = (t, e, s) => e.has(t) ? ke("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), G = (t, e, s) => (vt(t, e, "access private method"), s), L, me, Ce, ve;
const gt = "block-grid-preview";
let V = class extends p {
  constructor() {
    super(...arguments), wt(this, L), this._blockContext = {
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
    };
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observeSortMode(), this.observePropertyDataset(), await G(this, L, me).call(this);
  }
  observeBlockValue() {
    this.consumeContext(je, async (t) => {
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
          s,
          i,
          r,
          n,
          o,
          a,
          l
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await G(this, L, Ce).call(this);
        }
      );
    });
  }
  callPreviewApi() {
    return U(this, P.previewGridBlock({
      body: JSON.stringify(this.blockGridValue),
      query: {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        contentUdi: this._blockContext.contentUdi,
        settingsUdi: this._blockContext.settingsUdi,
        culture: this._blockContext.culture,
        blockIndex: this._blockContext.blockIndex
      }
    }));
  }
  async fetchStylesheets() {
    const { data: t } = await U(this, P.getGridStylesheets({
      query: {
        documentTypeUnique: this._blockContext.documentTypeUnique,
        nodeKey: this._blockContext.unique
      }
    }));
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
  renderSortModeFallback() {
    return D`<umb-block-grid-block
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
L = /* @__PURE__ */ new WeakSet();
me = async function() {
  try {
    await this.getContext(j), this.consumeContext(j, (t) => {
      t && this.observe(
        x([t.unique, t.structure.contentTypeUniques]),
        async ([e, s]) => {
          await this.handleWorkspaceData(e?.toString(), s?.[0]);
        }
      );
    });
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
Ce = async function() {
  this.consumeContext(Ke, (t) => {
    t && this.observe(
      x([
        t.contents,
        t.settings,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, s, i, r]) => {
        this._blockContext.blockEditorAlias = r ?? "", this.blockGridValue = {
          contentData: e ?? [],
          settingsData: s ?? [],
          expose: i ?? [],
          layout: { "Umbraco.BlockGrid": G(this, L, ve).call(this) }
        }, this._blockContext.blockIndex = e.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
ve = function() {
  return [
    {
      areas: this._blockContext.areas.map((s) => ({
        key: s.key,
        items: this._blockContext.layoutAreas?.find((r) => r.key == s.key)?.items
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
  X`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
_e([
  w({ attribute: !1 })
], V.prototype, "blockGridValue", 1);
V = _e([
  Y(gt)
], V);
var xt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, we = (t) => {
  throw TypeError(t);
}, J = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Tt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && xt(e, s, r), r;
}, Et = (t, e, s) => e.has(t) || we("Cannot " + s), St = (t, e, s) => e.has(t) ? we("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), ce = (t, e, s) => (Et(t, e, "access private method"), s), I, ge, xe;
const Ut = "block-list-preview";
let A = class extends p {
  constructor() {
    super(...arguments), St(this, I), this._blockContext = {
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
    };
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observeSortMode(), this.observePropertyDataset(), await ce(this, I, ge).call(this);
  }
  observeBlockValue() {
    this.consumeContext(Fe, (t) => {
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
          s,
          i,
          r,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await ce(this, I, xe).call(this);
        }
      );
    });
  }
  callPreviewApi() {
    return U(this, P.previewListBlock({
      body: JSON.stringify(this.blockListValue),
      query: {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        contentUdi: this._blockContext.contentUdi,
        settingsUdi: this._blockContext.settingsUdi,
        culture: this._blockContext.culture,
        blockIndex: this._blockContext.blockIndex
      }
    }));
  }
  async fetchStylesheets() {
    const { data: t } = await U(this, P.getListStylesheets({
      query: {
        documentTypeUnique: this._blockContext.documentTypeUnique,
        nodeKey: this._blockContext.unique
      }
    }));
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
  renderSortModeFallback() {
    return D`<umb-ref-list-block
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
I = /* @__PURE__ */ new WeakSet();
ge = async function() {
  try {
    await this.getContext(j), this.consumeContext(j, (t) => {
      t && this.observe(
        x([t.unique, t.structure.contentTypeUniques]),
        async ([e, s]) => {
          await this.handleWorkspaceData(e?.toString(), s?.[0]);
        }
      );
    });
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
xe = function() {
  this.consumeContext(He, (t) => {
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
        s,
        i,
        r,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: e?.filter((o) => o.key == this._blockContext.contentUdi) ?? [],
          settingsData: s?.filter((o) => o.key == this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((o) => o.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": i?.filter((o) => o.contentKey == this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
A.styles = [
  ...p.styles,
  X`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
J([
  q()
], A.prototype, "_blockListValue", 2);
J([
  w({ attribute: !1 })
], A.prototype, "blockListValue", 1);
A = J([
  Y(Ut)
], A);
var Pt = Object.defineProperty, At = Object.getOwnPropertyDescriptor, Te = (t) => {
  throw TypeError(t);
}, Q = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? At(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Pt(e, s, r), r;
}, qt = (t, e, s) => e.has(t) || Te("Cannot " + s), Bt = (t, e, s) => e.has(t) ? Te("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), le = (t, e, s) => (qt(t, e, "access private method"), s), N, Ee, Se;
const Ot = "rich-text-preview";
let M = class extends p {
  constructor() {
    super(...arguments), Bt(this, N), this._blockContext = {
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
    };
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), le(this, N, Ee).call(this);
  }
  observeBlockValue() {
    this.consumeContext(Ye, (t) => {
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
          s,
          i,
          r,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await le(this, N, Se).call(this);
        }
      );
    });
  }
  callPreviewApi() {
    return U(this, P.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        culture: this._blockContext.culture
      }
    }));
  }
  async fetchStylesheets() {
    const { data: t } = await U(this, P.getRteStylesheets({
      query: {
        documentTypeUnique: this._blockContext.documentTypeUnique,
        nodeKey: this._blockContext.unique
      }
    }));
    return t;
  }
};
N = /* @__PURE__ */ new WeakSet();
Ee = function() {
  this.consumeContext(Qe, (t) => {
    t && (this._workspaceContextResolved = !0, this.observe(
      x([t.unique, t.contentTypeUnique]),
      async ([e, s]) => {
        await this.handleWorkspaceData(e?.toString(), s);
      }
    ));
  }), this.observeBlockWorkspaceFallback();
};
Se = function() {
  this.consumeContext(Je, (t) => {
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
        s,
        i,
        r,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: e?.filter((o) => o.key == this._blockContext.contentUdi) ?? [],
          settingsData: s?.filter((o) => o.key == this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((o) => o.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": i?.filter((o) => o.contentKey == this._blockContext.contentUdi) ?? []
          }
        };
      }
    );
  });
};
Q([
  q()
], M.prototype, "_blockRteValue", 2);
Q([
  w({ attribute: !1 })
], M.prototype, "blockRteValue", 1);
M = Q([
  Y(Ot)
], M);
class Dt {
  #e;
  #s = 0;
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
    this.#s >= this.#e && await new Promise((s) => {
      this.#t.push(s);
    }), this.#s++;
    try {
      return await e();
    } finally {
      this.#s--, this.#t.length > 0 && this.#t.shift()();
    }
  }
}
class F extends ue {
  constructor(e) {
    super(e), this.#s = new Dt(3), this.#t = new ze(void 0), this.settings = this.#t.asObservable(), this.#r = new oe(""), this.unique = this.#r.asObservable(), this.#i = new oe(""), this.documentTypeUnique = this.#i.asObservable(), this.#o = new Ge(!1), this.sortModeActive = this.#o.asObservable(), this.#e = new Ue(e), this.getSettings(), this.setSortMode(!1);
  }
  #e;
  #s;
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#s;
  }
  #t;
  #r;
  #i;
  #o;
  async getSettings() {
    const e = await this.#e.getSettings();
    this.#t.setValue(e);
  }
  getUnique() {
    return this.#r.getValue();
  }
  async setUnique(e) {
    e != "" && this.#r.setValue(e);
  }
  getDocumentTypeUnique() {
    return this.#i.getValue();
  }
  async setDocumentTypeUnique(e) {
    e != "" && this.#i.setValue(e);
  }
  getSortMode() {
    return this.#o.getValue();
  }
  async setSortMode(e) {
    this.#o.setValue(e);
  }
}
const Lt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: F,
  default: F
}, Symbol.toStringTag, { value: "Module" })), Vt = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => Lt)
  }
], Mt = [...Vt], H = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...Ze.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action-B_6C8GRn.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, Rt = [
  H
], $t = [
  {
    ...H.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode-C11oKRay.js"),
    forPropertyEditorUis: [We],
    conditions: [
      {
        alias: ie
      }
    ]
  },
  {
    ...H.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.List.SortMode",
    name: "Block List Sort Mode Property Action",
    api: () => import("./block-list-sort-mode-D8Tw_I7-.js"),
    forPropertyEditorUis: [Xe],
    conditions: [
      {
        alias: ie
      }
    ]
  }
];
class It {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await U(this.#e, P.getSettings());
  }
}
class Ue extends ue {
  #e;
  constructor(e) {
    super(e), this.#e = new It(e);
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
const rs = async (t, e) => {
  t.consumeContext(Oe, async (s) => {
    if (!s) return;
    const i = s.getOpenApiConfiguration();
    k.setConfig({
      baseUrl: i?.base ?? "",
      auth: i?.token ?? void 0,
      credentials: i?.credentials ?? "same-origin"
    }), k.interceptors.request.use(async (a, l) => {
      const u = await i.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new Ue(t).getSettings();
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
          element: M,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    e.registerMany([
      ...o,
      ...Mt,
      ...Rt,
      ...$t
    ]), t.provideContext(ye, new F(t));
  });
};
export {
  ye as B,
  M as R,
  It as S,
  p as a,
  V as b,
  A as c,
  Ue as d,
  rs as o
};
//# sourceMappingURL=index-DaddVkl8.js.map

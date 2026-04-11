import { UMB_AUTH_CONTEXT as We } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as je } from "@umbraco-cms/backoffice/context-api";
import { html as z, ifDefined as Ge, unsafeHTML as He, css as Q, property as C, state as N, customElement as Y } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Fe } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as Je } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as Xe } from "@umbraco-cms/backoffice/property";
import { UmbApiError as Qe, tryExecute as P } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Ye } from "@umbraco-cms/backoffice/external/uui";
import { UmbControllerBase as Ce } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ze, UMB_BLOCK_GRID_MANAGER_CONTEXT as et } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as j } from "@umbraco-cms/backoffice/content";
import { observeMultiple as x, UmbObjectState as tt, UmbStringState as ue } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as st, UMB_BLOCK_LIST_MANAGER_CONTEXT as it } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as rt, UMB_BLOCK_RTE_MANAGER_CONTEXT as ot } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as nt } from "@umbraco-cms/backoffice/document";
const at = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, s) => typeof s == "bigint" ? s.toString() : s
  )
}, ct = ({
  onRequest: t,
  onSseError: e,
  onSseEvent: s,
  responseTransformer: r,
  responseValidator: i,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: a,
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let d;
  const A = l ?? ((h) => new Promise((b) => setTimeout(b, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, b = 0;
    const E = c.signal ?? new AbortController().signal;
    for (; !E.aborted; ) {
      b++;
      const B = c.headers instanceof Headers ? c.headers : new Headers(c.headers);
      d !== void 0 && B.set("Last-Event-ID", d);
      try {
        const T = {
          redirect: "follow",
          ...c,
          body: c.serializedBody,
          headers: B,
          signal: E
        };
        let w = new Request(u, T);
        t && (w = await t(u, T));
        const y = await (c.fetch ?? globalThis.fetch)(w);
        if (!y.ok)
          throw new Error(
            `SSE failed: ${y.status} ${y.statusText}`
          );
        if (!y.body) throw new Error("No body in SSE response");
        const v = y.body.pipeThrough(new TextDecoderStream()).getReader();
        let H = "";
        const oe = () => {
          try {
            v.cancel();
          } catch {
          }
        };
        E.addEventListener("abort", oe);
        try {
          for (; ; ) {
            const { done: Ie, value: Me } = await v.read();
            if (Ie) break;
            H += Me;
            const ne = H.split(`

`);
            H = ne.pop() ?? "";
            for (const ze of ne) {
              const Ke = ze.split(`
`), M = [];
              let ae;
              for (const _ of Ke)
                if (_.startsWith("data:"))
                  M.push(_.replace(/^data:\s*/, ""));
                else if (_.startsWith("event:"))
                  ae = _.replace(/^event:\s*/, "");
                else if (_.startsWith("id:"))
                  d = _.replace(/^id:\s*/, "");
                else if (_.startsWith("retry:")) {
                  const le = Number.parseInt(
                    _.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(le) || (h = le);
                }
              let S, ce = !1;
              if (M.length) {
                const _ = M.join(`
`);
                try {
                  S = JSON.parse(_), ce = !0;
                } catch {
                  S = _;
                }
              }
              ce && (i && await i(S), r && (S = await r(S))), s?.({
                data: S,
                event: ae,
                id: d,
                retry: h
              }), M.length && (yield S);
            }
          }
        } finally {
          E.removeEventListener("abort", oe), v.releaseLock();
        }
        break;
      } catch (T) {
        if (e?.(T), o !== void 0 && b >= o)
          break;
        const w = Math.min(
          h * 2 ** (b - 1),
          a ?? 3e4
        );
        await A(w);
      }
    }
  }() };
}, lt = (t) => {
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
}, ut = (t) => {
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
}, ht = (t) => {
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
}, me = ({
  allowReserved: t,
  explode: e,
  name: s,
  style: r,
  value: i
}) => {
  if (!e) {
    const a = (t ? i : i.map((l) => encodeURIComponent(l))).join(ut(r));
    switch (r) {
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
  const n = lt(r), o = i.map((a) => r === "label" || r === "simple" ? t ? a : encodeURIComponent(a) : G({
    allowReserved: t,
    name: s,
    value: a
  })).join(n);
  return r === "label" || r === "matrix" ? n + o : o;
}, G = ({
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
}, ge = ({
  allowReserved: t,
  explode: e,
  name: s,
  style: r,
  value: i,
  valueOnly: n
}) => {
  if (i instanceof Date)
    return n ? i.toISOString() : `${s}=${i.toISOString()}`;
  if (r !== "deepObject" && !e) {
    let l = [];
    Object.entries(i).forEach(([c, d]) => {
      l = [
        ...l,
        c,
        t ? d : encodeURIComponent(d)
      ];
    });
    const u = l.join(",");
    switch (r) {
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
  const o = ht(r), a = Object.entries(i).map(
    ([l, u]) => G({
      allowReserved: t,
      name: r === "deepObject" ? `${s}[${l}]` : l,
      value: u
    })
  ).join(o);
  return r === "label" || r === "matrix" ? o + a : a;
}, dt = /\{[^{}]+\}/g, pt = ({ path: t, url: e }) => {
  let s = e;
  const r = e.match(dt);
  if (r)
    for (const i of r) {
      let n = !1, o = i.substring(1, i.length - 1), a = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), a = "label") : o.startsWith(";") && (o = o.substring(1), a = "matrix");
      const l = t[o];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        s = s.replace(
          i,
          me({ explode: n, name: o, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        s = s.replace(
          i,
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
        s = s.replace(
          i,
          `;${G({
            name: o,
            value: l
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        a === "label" ? `.${l}` : l
      );
      s = s.replace(i, u);
    }
  return s;
}, ft = ({
  baseUrl: t,
  path: e,
  query: s,
  querySerializer: r,
  url: i
}) => {
  const n = i.startsWith("/") ? i : `/${i}`;
  let o = (t ?? "") + n;
  e && (o = pt({ path: e, url: o }));
  let a = s ? r(s) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function bt(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const yt = async (t, e) => {
  const s = typeof e == "function" ? await e(t) : e;
  if (s)
    return t.scheme === "bearer" ? `Bearer ${s}` : t.scheme === "basic" ? `Basic ${btoa(s)}` : s;
}, xe = ({
  allowReserved: t,
  array: e,
  object: s
} = {}) => (i) => {
  const n = [];
  if (i && typeof i == "object")
    for (const o in i) {
      const a = i[o];
      if (a != null)
        if (Array.isArray(a)) {
          const l = me({
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
            ...s
          });
          l && n.push(l);
        } else {
          const l = G({
            allowReserved: t,
            name: o,
            value: a
          });
          l && n.push(l);
        }
    }
  return n.join("&");
}, kt = (t) => {
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
}, _t = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, wt = async ({
  security: t,
  ...e
}) => {
  for (const s of t) {
    if (_t(e, s.name))
      continue;
    const r = await yt(s, e.auth);
    if (!r)
      continue;
    const i = s.name ?? "Authorization";
    switch (s.in) {
      case "query":
        e.query || (e.query = {}), e.query[i] = r;
        break;
      case "cookie":
        e.headers.append("Cookie", `${i}=${r}`);
        break;
      case "header":
      default:
        e.headers.set(i, r);
        break;
    }
  }
}, he = (t) => ft({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : xe(t.querySerializer),
  url: t.url
}), de = (t, e) => {
  const s = { ...t, ...e };
  return s.baseUrl?.endsWith("/") && (s.baseUrl = s.baseUrl.substring(0, s.baseUrl.length - 1)), s.headers = Ee(t.headers, e.headers), s;
}, vt = (t) => {
  const e = [];
  return t.forEach((s, r) => {
    e.push([r, s]);
  }), e;
}, Ee = (...t) => {
  const e = new Headers();
  for (const s of t) {
    if (!s)
      continue;
    const r = s instanceof Headers ? vt(s) : Object.entries(s);
    for (const [i, n] of r)
      if (n === null)
        e.delete(i);
      else if (Array.isArray(n))
        for (const o of n)
          e.append(i, o);
      else n !== void 0 && e.set(
        i,
        typeof n == "object" ? JSON.stringify(n) : n
      );
  }
  return e;
};
class F {
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
    const r = this.getInterceptorIndex(e);
    return this.fns[r] ? (this.fns[r] = s, e) : !1;
  }
  use(e) {
    return this.fns.push(e), this.fns.length - 1;
  }
}
const Ct = () => ({
  error: new F(),
  request: new F(),
  response: new F()
}), mt = xe({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), gt = {
  "Content-Type": "application/json"
}, Te = (t = {}) => ({
  ...at,
  headers: gt,
  parseAs: "auto",
  querySerializer: mt,
  ...t
}), xt = (t = {}) => {
  let e = de(Te(), t);
  const s = () => ({ ...e }), r = (u) => (e = de(e, u), s()), i = Ct(), n = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: Ee(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await wt({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const d = he(c);
    return { opts: c, url: d };
  }, o = async (u) => {
    const { opts: c, url: d } = await n(u), A = {
      redirect: "follow",
      ...c,
      body: bt(c)
    };
    let g = new Request(d, A);
    for (const p of i.request.fns)
      p && (g = await p(g, c));
    const I = c.fetch;
    let h = await I(g);
    for (const p of i.response.fns)
      p && (h = await p(h, g, c));
    const b = {
      request: g,
      response: h
    };
    if (h.ok) {
      const p = (c.parseAs === "auto" ? kt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let v;
        switch (p) {
          case "arrayBuffer":
          case "blob":
          case "text":
            v = await h[p]();
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
          ...b
        };
      }
      let y;
      switch (p) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          y = await h[p]();
          break;
        case "stream":
          return c.responseStyle === "data" ? h.body : {
            data: h.body,
            ...b
          };
      }
      return p === "json" && (c.responseValidator && await c.responseValidator(y), c.responseTransformer && (y = await c.responseTransformer(y))), c.responseStyle === "data" ? y : {
        data: y,
        ...b
      };
    }
    const E = await h.text();
    let B;
    try {
      B = JSON.parse(E);
    } catch {
    }
    const T = B ?? E;
    let w = T;
    for (const p of i.error.fns)
      p && (w = await p(T, h, g, c));
    if (w = w || {}, c.throwOnError)
      throw w;
    return c.responseStyle === "data" ? void 0 : {
      error: w,
      ...b
    };
  }, a = (u) => (c) => o({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: d, url: A } = await n(c);
    return ct({
      ...d,
      body: d.body,
      headers: d.headers,
      method: u,
      onRequest: async (g, I) => {
        let h = new Request(g, I);
        for (const b of i.request.fns)
          b && (h = await b(h, d));
        return h;
      },
      url: A
    });
  };
  return {
    buildUrl: he,
    connect: a("CONNECT"),
    delete: a("DELETE"),
    get: a("GET"),
    getConfig: s,
    head: a("HEAD"),
    interceptors: i,
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
}, k = xt(Te({
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
const Se = new je("BlockPreviewContext");
var Et = Object.defineProperty, m = (t, e, s, r) => {
  for (var i = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = o(e, s, i) || i);
  return i && Et(e, s, i), i;
};
class f extends Je {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._stylesheetsAdopted = !1, this._requestId = 0, this._isConnected = !1, this.consumeContext(Se, async (e) => {
      this._blockPreviewContext = e, await this.setupContextObservers();
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._isConnected = !0;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._isConnected = !1;
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && this.renderBlockPreview();
  }
  // region Shared context observers
  observePropertyDataset() {
    this.consumeContext(Xe, (e) => {
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
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(Fe, async (e) => {
      e && this.observe(e.content.structure.contentTypeUniques, async (s) => {
        const r = s[0];
        !this._isConnected || !r || (this._blockContext.unique = this._blockPreviewContext?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = r, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
      });
    });
  }
  async fetchAndLoadStylesheets() {
    if (this._stylesheetsAdopted || !this._blockPreviewContext) return;
    const e = await this.fetchStylesheets();
    if (e && e.length > 0) {
      const s = await Promise.all(
        e.map((i) => this._blockPreviewContext.getOrCreateStylesheet(i))
      ), r = this.renderRoot;
      r.adoptedStyleSheets = [...r.adoptedStyleSheets, ...s], this._stylesheetsAdopted = !0;
    }
  }
  // endregion
  // region Preview rendering
  resolveUniqueFromContext() {
    this._blockPreviewContext != null && this._blockContext.unique === "" && (this._blockContext.unique = this._blockPreviewContext.getUnique(), !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath))), this._blockPreviewContext != null && this._blockContext.documentTypeUnique === "" && (this._blockContext.documentTypeUnique = this._blockPreviewContext.getDocumentTypeUnique());
  }
  async renderBlockPreview() {
    if (!this._isConnected || (this.resolveUniqueFromContext(), !this.validatePreviewData()))
      return;
    this._isLoading = !0, this._error = null;
    const e = ++this._requestId;
    try {
      const { data: s, error: r } = await this._blockPreviewContext.requestQueue.enqueue(
        () => this.callPreviewApi()
      );
      if (this._requestId !== e) return;
      s != null ? (this._htmlMarkup = s, this._isLoading = !1) : r ? (this._error = Qe.isUmbApiError(r) ? r.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
    } catch (s) {
      if (this._requestId !== e) return;
      this._error = this.localize.term("blockPreview_renderFailed"), this._isLoading = !1, console.error("Block preview error:", s);
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
    const s = e.composedPath(), r = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (s.some((n) => n instanceof Element && r.includes(n.tagName))) {
      if (s.find((o) => o instanceof Ye && o.href?.includes("block/edit")))
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
  render() {
    return z`
            ${this._isLoading ? z`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>` : this._error ? z`<div class="preview-alert preview-alert-error" role="alert">${this._error}</div>` : this._htmlMarkup ? z`<a
                            href=${Ge(this._blockContext.workspaceEditContentPath)}
                            @click=${this._handleClick}
                            aria-label=${this.localize.term("blockPreview_editBlock")}
                            class="block-preview-edit"
                        >${He(this._htmlMarkup)}</a>` : nothing}
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
  C({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], f.prototype, "content");
m([
  C({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], f.prototype, "settings");
m([
  C({ attribute: !1 })
], f.prototype, "contentKey");
m([
  C({ attribute: !1 })
], f.prototype, "config");
m([
  C({ attribute: !1 })
], f.prototype, "unpublished");
m([
  C({ attribute: !1 })
], f.prototype, "icon");
m([
  C({ attribute: !1 })
], f.prototype, "label");
m([
  N()
], f.prototype, "_htmlMarkup");
m([
  N()
], f.prototype, "_isLoading");
m([
  N()
], f.prototype, "_error");
class Z {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async previewGridBlock(e, s) {
    return await P(this.#e, U.previewGridBlock({ body: e, query: s }));
  }
  async previewListBlock(e, s) {
    return await P(this.#e, U.previewListBlock({ body: e, query: s }));
  }
  async previewRichTextMarkup(e, s) {
    return await P(this.#e, U.previewRichTextMarkup({ body: e, query: s }));
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
class Tt {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await P(this.#e, U.getSettings());
  }
}
class Pe extends Ce {
  #e;
  constructor(e) {
    super(e), this.#e = new Tt(e);
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
var St = Object.defineProperty, Pt = Object.getOwnPropertyDescriptor, Ue = (t) => {
  throw TypeError(t);
}, qe = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Pt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && St(e, s, i), i;
}, ee = (t, e, s) => e.has(t) || Ue("Cannot " + s), pe = (t, e, s) => (ee(t, e, "read from private field"), s ? s.call(t) : e.get(t)), fe = (t, e, s) => e.has(t) ? Ue("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), Ut = (t, e, s, r) => (ee(t, e, "write to private field"), e.set(t, s), s), J = (t, e, s) => (ee(t, e, "access private method"), s), O, V, Ae, Be, Oe;
const qt = "block-grid-preview";
let R = class extends f {
  constructor() {
    super(), fe(this, V), fe(this, O), this._blockContext = {
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
    }, Ut(this, O, new Z(this));
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await J(this, V, Ae).call(this);
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
          s,
          r,
          i,
          n,
          o,
          a,
          l
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = i ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await J(this, V, Be).call(this);
        }
      );
    });
  }
  async callPreviewApi() {
    return await pe(this, O).previewGridBlock(
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
    const { data: t } = await pe(this, O).getGridStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
O = /* @__PURE__ */ new WeakMap();
V = /* @__PURE__ */ new WeakSet();
Ae = async function() {
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
Be = async function() {
  this.consumeContext(et, (t) => {
    t && this.observe(
      x([
        t.contents,
        t.settings,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, s, r, i]) => {
        this._blockContext.blockEditorAlias = i ?? "", this.blockGridValue = {
          contentData: e ?? [],
          settingsData: s ?? [],
          expose: r ?? [],
          layout: { "Umbraco.BlockGrid": J(this, V, Oe).call(this) }
        }, this._blockContext.blockIndex = e.indexOf(this.blockGridValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
Oe = function() {
  return [
    {
      areas: this._blockContext.areas.map((s) => ({
        key: s.key,
        items: this._blockContext.layoutAreas?.find((i) => i.key === s.key)?.items ?? []
      })),
      columnSpan: this._blockContext.layout?.columnSpan ?? 0,
      rowSpan: this._blockContext.layout?.rowSpan ?? 0,
      contentKey: this._blockContext.layout?.contentKey ?? "",
      settingsKey: this._blockContext.layout?.settingsKey
    }
  ];
};
R.styles = [
  ...f.styles,
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
], R.prototype, "blockGridValue", 1);
R = qe([
  Y(qt)
], R);
var At = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, De = (t) => {
  throw TypeError(t);
}, te = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Bt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && At(e, s, i), i;
}, se = (t, e, s) => e.has(t) || De("Cannot " + s), be = (t, e, s) => (se(t, e, "read from private field"), s ? s.call(t) : e.get(t)), ye = (t, e, s) => e.has(t) ? De("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), Ot = (t, e, s, r) => (se(t, e, "write to private field"), e.set(t, s), s), ke = (t, e, s) => (se(t, e, "access private method"), s), D, K, Le, Ve;
const Dt = "block-list-preview";
let q = class extends f {
  constructor() {
    super(), ye(this, K), ye(this, D), this._blockContext = {
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
    }, Ot(this, D, new Z(this));
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await ke(this, K, Le).call(this);
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
          s,
          r,
          i,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = i ?? "", this._blockContext.contentElementTypeKey = n ?? "", await ke(this, K, Ve).call(this);
        }
      );
    });
  }
  async callPreviewApi() {
    return await be(this, D).previewListBlock(
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
    const { data: t } = await be(this, D).getListStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
D = /* @__PURE__ */ new WeakMap();
K = /* @__PURE__ */ new WeakSet();
Le = async function() {
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
Ve = function() {
  this.consumeContext(it, (t) => {
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
        r,
        i,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: e?.filter((o) => o.key === this._blockContext.contentUdi) ?? [],
          settingsData: s?.filter((o) => o.key === this._blockContext.settingsUdi) ?? [],
          expose: i?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": r?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockListValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
q.styles = [
  ...f.styles,
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
te([
  N()
], q.prototype, "_blockListValue", 2);
te([
  C({ attribute: !1 })
], q.prototype, "blockListValue", 1);
q = te([
  Y(Dt)
], q);
var Lt = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, Re = (t) => {
  throw TypeError(t);
}, ie = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Vt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Lt(e, s, i), i;
}, re = (t, e, s) => e.has(t) || Re("Cannot " + s), _e = (t, e, s) => (re(t, e, "read from private field"), s ? s.call(t) : e.get(t)), we = (t, e, s) => e.has(t) ? Re("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), Rt = (t, e, s, r) => (re(t, e, "write to private field"), e.set(t, s), s), ve = (t, e, s) => (re(t, e, "access private method"), s), L, W, $e, Ne;
const $t = "rich-text-preview";
let $ = class extends f {
  constructor() {
    super(), we(this, W), we(this, L), this._blockContext = {
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
    }, Rt(this, L, new Z(this));
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), ve(this, W, $e).call(this);
  }
  observeBlockValue() {
    this.consumeContext(rt, (t) => {
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
          r,
          i,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = i ?? "", this._blockContext.contentElementTypeKey = n ?? "", await ve(this, W, Ne).call(this);
        }
      );
    });
  }
  async callPreviewApi() {
    return await _e(this, L).previewRichTextMarkup(
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
    const { data: t } = await _e(this, L).getRteStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
};
L = /* @__PURE__ */ new WeakMap();
W = /* @__PURE__ */ new WeakSet();
$e = function() {
  this.consumeContext(nt, (t) => {
    t && (this._workspaceContextResolved = !0, this.observe(
      x([t.unique, t.contentTypeUnique]),
      async ([e, s]) => {
        await this.handleWorkspaceData(e?.toString(), s);
      }
    ));
  }), this.observeBlockWorkspaceFallback();
};
Ne = function() {
  this.consumeContext(ot, (t) => {
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
        r,
        i,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: e?.filter((o) => o.key === this._blockContext.contentUdi) ?? [],
          settingsData: s?.filter((o) => o.key === this._blockContext.settingsUdi) ?? [],
          expose: i?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": r?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
ie([
  N()
], $.prototype, "_blockRteValue", 2);
ie([
  C({ attribute: !1 })
], $.prototype, "blockRteValue", 1);
$ = ie([
  Y($t)
], $);
class Nt {
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
class X extends Ce {
  constructor(e) {
    super(e), this.#s = new Nt(3), this.#t = /* @__PURE__ */ new Map(), this.#o = new tt(void 0), this.settings = this.#o.asObservable(), this.#i = new ue(""), this.unique = this.#i.asObservable(), this.#r = new ue(""), this.documentTypeUnique = this.#r.asObservable(), this.#e = new Pe(e), this.getSettings();
  }
  #e;
  #s;
  #t;
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#s;
  }
  #o;
  #i;
  #r;
  async getSettings() {
    const e = await this.#e.getSettings();
    this.#o.setValue(e);
  }
  getUnique() {
    return this.#i.getValue();
  }
  async setUnique(e) {
    e !== "" && this.#i.setValue(e);
  }
  getDocumentTypeUnique() {
    return this.#r.getValue();
  }
  async setDocumentTypeUnique(e) {
    e !== "" && this.#r.setValue(e);
  }
  async getOrCreateStylesheet(e) {
    const s = this.#t.get(e);
    if (s) return s;
    const i = await (await fetch(e)).text(), n = new CSSStyleSheet();
    return n.replaceSync(i), this.#t.set(e, n), n;
  }
}
const It = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: X,
  default: X
}, Symbol.toStringTag, { value: "Module" })), Mt = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => It)
  }
], zt = Mt, Kt = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], Wt = Kt, ns = async (t, e) => {
  t.consumeContext(We, async (s) => {
    if (!s) return;
    const r = s.getOpenApiConfiguration();
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
          element: R,
          forBlockEditor: "block-grid"
        };
        n.blockGrid.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockGrid.contentTypes), o.push(a);
      }
      if (n.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: q,
          forBlockEditor: "block-list"
        };
        n.blockList.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockList.contentTypes), o.push(a);
      }
      if (n.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: $,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    e.registerMany([
      ...o,
      ...zt,
      ...Wt
    ]), t.provideContext(Se, new X(t));
  });
};
export {
  R as BlockGridPreviewCustomView,
  q as BlockListPreviewCustomView,
  f as BlockPreviewBaseElement,
  Z as PreviewDataSource,
  $ as RichTextPreviewCustomView,
  Tt as SettingsDataSource,
  Pe as SettingsRepository,
  ns as onInit
};
//# sourceMappingURL=index.js.map

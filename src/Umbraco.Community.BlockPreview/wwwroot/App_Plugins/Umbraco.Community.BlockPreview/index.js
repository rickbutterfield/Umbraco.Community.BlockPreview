import { UMB_AUTH_CONTEXT as pt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as dt } from "@umbraco-cms/backoffice/context-api";
import { nothing as bt, html as X, ifDefined as qe, unsafeHTML as ft, css as ae, property as C, state as D, customElement as le } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Oe } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as kt } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as yt } from "@umbraco-cms/backoffice/property";
import { UmbApiError as _t, tryExecute as T } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as wt } from "@umbraco-cms/backoffice/external/uui";
import { UmbControllerBase as Ke } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ct, UMB_BLOCK_GRID_MANAGER_CONTEXT as vt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as A } from "@umbraco-cms/backoffice/content";
import { observeMultiple as _, UmbStringState as De } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as mt, UMB_BLOCK_LIST_MANAGER_CONTEXT as gt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_SINGLE_ENTRY_CONTEXT as xt, UMB_BLOCK_SINGLE_MANAGER_CONTEXT as Tt } from "@umbraco-cms/backoffice/block-single";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as St, UMB_BLOCK_RTE_MANAGER_CONTEXT as Et } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Pt } from "@umbraco-cms/backoffice/document";
const Ut = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, i) => typeof i == "bigint" ? i.toString() : i
  )
}, Bt = ({
  onRequest: t,
  onSseError: e,
  onSseEvent: i,
  responseTransformer: s,
  responseValidator: r,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: a,
  sseSleepFn: c,
  url: u,
  ...l
}) => {
  let p;
  const V = c ?? ((h) => new Promise((k) => setTimeout(k, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, k = 0;
    const E = l.signal ?? new AbortController().signal;
    for (; !E.aborted; ) {
      k++;
      const $ = l.headers instanceof Headers ? l.headers : new Headers(l.headers);
      p !== void 0 && $.set("Last-Event-ID", p);
      try {
        const P = {
          redirect: "follow",
          ...l,
          body: l.serializedBody,
          headers: $,
          signal: E
        };
        let v = new Request(u, P);
        t && (v = await t(u, P));
        const y = await (l.fetch ?? globalThis.fetch)(v);
        if (!y.ok)
          throw new Error(
            `SSE failed: ${y.status} ${y.statusText}`
          );
        if (!y.body) throw new Error("No body in SSE response");
        const m = y.body.pipeThrough(new TextDecoderStream()).getReader();
        let he = "";
        const Ee = () => {
          try {
            m.cancel();
          } catch {
          }
        };
        E.addEventListener("abort", Ee);
        try {
          for (; ; ) {
            const { done: lt, value: ct } = await m.read();
            if (lt) break;
            he += ct;
            const Pe = he.split(`

`);
            he = Pe.pop() ?? "";
            for (const ut of Pe) {
              const ht = ut.split(`
`), H = [];
              let Ue;
              for (const w of ht)
                if (w.startsWith("data:"))
                  H.push(w.replace(/^data:\s*/, ""));
                else if (w.startsWith("event:"))
                  Ue = w.replace(/^event:\s*/, "");
                else if (w.startsWith("id:"))
                  p = w.replace(/^id:\s*/, "");
                else if (w.startsWith("retry:")) {
                  const Ae = Number.parseInt(
                    w.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Ae) || (h = Ae);
                }
              let U, Be = !1;
              if (H.length) {
                const w = H.join(`
`);
                try {
                  U = JSON.parse(w), Be = !0;
                } catch {
                  U = w;
                }
              }
              Be && (r && await r(U), s && (U = await s(U))), i?.({
                data: U,
                event: Ue,
                id: p,
                retry: h
              }), H.length && (yield U);
            }
          }
        } finally {
          E.removeEventListener("abort", Ee), m.releaseLock();
        }
        break;
      } catch (P) {
        if (e?.(P), o !== void 0 && k >= o)
          break;
        const v = Math.min(
          h * 2 ** (k - 1),
          a ?? 3e4
        );
        await V(v);
      }
    }
  }() };
}, At = (t) => {
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
}, qt = (t) => {
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
}, Ot = (t) => {
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
}, We = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: s,
  value: r
}) => {
  if (!e) {
    const a = (t ? r : r.map((c) => encodeURIComponent(c))).join(qt(s));
    switch (s) {
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
  const n = At(s), o = r.map((a) => s === "label" || s === "simple" ? t ? a : encodeURIComponent(a) : ce({
    allowReserved: t,
    name: i,
    value: a
  })).join(n);
  return s === "label" || s === "matrix" ? n + o : o;
}, ce = ({
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
}, ze = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: s,
  value: r,
  valueOnly: n
}) => {
  if (r instanceof Date)
    return n ? r.toISOString() : `${i}=${r.toISOString()}`;
  if (s !== "deepObject" && !e) {
    let c = [];
    Object.entries(r).forEach(([l, p]) => {
      c = [
        ...c,
        l,
        t ? p : encodeURIComponent(p)
      ];
    });
    const u = c.join(",");
    switch (s) {
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
  const o = Ot(s), a = Object.entries(r).map(
    ([c, u]) => ce({
      allowReserved: t,
      name: s === "deepObject" ? `${i}[${c}]` : c,
      value: u
    })
  ).join(o);
  return s === "label" || s === "matrix" ? o + a : a;
}, Dt = /\{[^{}]+\}/g, Vt = ({ path: t, url: e }) => {
  let i = e;
  const s = e.match(Dt);
  if (s)
    for (const r of s) {
      let n = !1, o = r.substring(1, r.length - 1), a = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), a = "label") : o.startsWith(";") && (o = o.substring(1), a = "matrix");
      const c = t[o];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        i = i.replace(
          r,
          We({ explode: n, name: o, style: a, value: c })
        );
        continue;
      }
      if (typeof c == "object") {
        i = i.replace(
          r,
          ze({
            explode: n,
            name: o,
            style: a,
            value: c,
            valueOnly: !0
          })
        );
        continue;
      }
      if (a === "matrix") {
        i = i.replace(
          r,
          `;${ce({
            name: o,
            value: c
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        a === "label" ? `.${c}` : c
      );
      i = i.replace(r, u);
    }
  return i;
}, $t = ({
  baseUrl: t,
  path: e,
  query: i,
  querySerializer: s,
  url: r
}) => {
  const n = r.startsWith("/") ? r : `/${r}`;
  let o = (t ?? "") + n;
  e && (o = Vt({ path: e, url: o }));
  let a = i ? s(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function Lt(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const Mt = async (t, e) => {
  const i = typeof e == "function" ? await e(t) : e;
  if (i)
    return t.scheme === "bearer" ? `Bearer ${i}` : t.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Ge = ({
  allowReserved: t,
  array: e,
  object: i
} = {}) => (r) => {
  const n = [];
  if (r && typeof r == "object")
    for (const o in r) {
      const a = r[o];
      if (a != null)
        if (Array.isArray(a)) {
          const c = We({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...e
          });
          c && n.push(c);
        } else if (typeof a == "object") {
          const c = ze({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "deepObject",
            value: a,
            ...i
          });
          c && n.push(c);
        } else {
          const c = ce({
            allowReserved: t,
            name: o,
            value: a
          });
          c && n.push(c);
        }
    }
  return n.join("&");
}, Rt = (t) => {
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
}, Nt = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, It = async ({
  security: t,
  ...e
}) => {
  for (const i of t) {
    if (Nt(e, i.name))
      continue;
    const s = await Mt(i, e.auth);
    if (!s)
      continue;
    const r = i.name ?? "Authorization";
    switch (i.in) {
      case "query":
        e.query || (e.query = {}), e.query[r] = s;
        break;
      case "cookie":
        e.headers.append("Cookie", `${r}=${s}`);
        break;
      case "header":
      default:
        e.headers.set(r, s);
        break;
    }
  }
}, Ve = (t) => $t({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : Ge(t.querySerializer),
  url: t.url
}), $e = (t, e) => {
  const i = { ...t, ...e };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = je(t.headers, e.headers), i;
}, Kt = (t) => {
  const e = [];
  return t.forEach((i, s) => {
    e.push([s, i]);
  }), e;
}, je = (...t) => {
  const e = new Headers();
  for (const i of t) {
    if (!i)
      continue;
    const s = i instanceof Headers ? Kt(i) : Object.entries(i);
    for (const [r, n] of s)
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
class pe {
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
    const s = this.getInterceptorIndex(e);
    return this.fns[s] ? (this.fns[s] = i, e) : !1;
  }
  use(e) {
    return this.fns.push(e), this.fns.length - 1;
  }
}
const Wt = () => ({
  error: new pe(),
  request: new pe(),
  response: new pe()
}), zt = Ge({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), Gt = {
  "Content-Type": "application/json"
}, He = (t = {}) => ({
  ...Ut,
  headers: Gt,
  parseAs: "auto",
  querySerializer: zt,
  ...t
}), jt = (t = {}) => {
  let e = $e(He(), t);
  const i = () => ({ ...e }), s = (u) => (e = $e(e, u), i()), r = Wt(), n = async (u) => {
    const l = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: je(e.headers, u.headers),
      serializedBody: void 0
    };
    l.security && await It({
      ...l,
      security: l.security
    }), l.requestValidator && await l.requestValidator(l), l.body !== void 0 && l.bodySerializer && (l.serializedBody = l.bodySerializer(l.body)), (l.body === void 0 || l.serializedBody === "") && l.headers.delete("Content-Type");
    const p = Ve(l);
    return { opts: l, url: p };
  }, o = async (u) => {
    const { opts: l, url: p } = await n(u), V = {
      redirect: "follow",
      ...l,
      body: Lt(l)
    };
    let x = new Request(p, V);
    for (const b of r.request.fns)
      b && (x = await b(x, l));
    const j = l.fetch;
    let h = await j(x);
    for (const b of r.response.fns)
      b && (h = await b(h, x, l));
    const k = {
      request: x,
      response: h
    };
    if (h.ok) {
      const b = (l.parseAs === "auto" ? Rt(h.headers.get("Content-Type")) : l.parseAs) ?? "json";
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
        return l.responseStyle === "data" ? m : {
          data: m,
          ...k
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
          return l.responseStyle === "data" ? h.body : {
            data: h.body,
            ...k
          };
      }
      return b === "json" && (l.responseValidator && await l.responseValidator(y), l.responseTransformer && (y = await l.responseTransformer(y))), l.responseStyle === "data" ? y : {
        data: y,
        ...k
      };
    }
    const E = await h.text();
    let $;
    try {
      $ = JSON.parse(E);
    } catch {
    }
    const P = $ ?? E;
    let v = P;
    for (const b of r.error.fns)
      b && (v = await b(P, h, x, l));
    if (v = v || {}, l.throwOnError)
      throw v;
    return l.responseStyle === "data" ? void 0 : {
      error: v,
      ...k
    };
  }, a = (u) => (l) => o({ ...l, method: u }), c = (u) => async (l) => {
    const { opts: p, url: V } = await n(l);
    return Bt({
      ...p,
      body: p.body,
      headers: p.headers,
      method: u,
      onRequest: async (x, j) => {
        let h = new Request(x, j);
        for (const k of r.request.fns)
          k && (h = await k(h, p));
        return h;
      },
      url: V
    });
  };
  return {
    buildUrl: Ve,
    connect: a("CONNECT"),
    delete: a("DELETE"),
    get: a("GET"),
    getConfig: i,
    head: a("HEAD"),
    interceptors: r,
    options: a("OPTIONS"),
    patch: a("PATCH"),
    post: a("POST"),
    put: a("PUT"),
    request: o,
    setConfig: s,
    sse: {
      connect: c("CONNECT"),
      delete: c("DELETE"),
      get: c("GET"),
      head: c("HEAD"),
      options: c("OPTIONS"),
      patch: c("PATCH"),
      post: c("POST"),
      put: c("PUT"),
      trace: c("TRACE")
    },
    trace: a("TRACE")
  };
}, f = jt(He({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class S {
  static previewGridBlock(e) {
    return (e?.client ?? f).post({
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
    return (e?.client ?? f).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...e
    });
  }
  static getGridStylesheets(e) {
    return (e?.client ?? f).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...e
    });
  }
  static previewListBlock(e) {
    return (e?.client ?? f).post({
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
    return (e?.client ?? f).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...e
    });
  }
  static getListStylesheets(e) {
    return (e?.client ?? f).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...e
    });
  }
  static previewRichTextMarkup(e) {
    return (e?.client ?? f).post({
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
    return (e?.client ?? f).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheet",
      ...e
    });
  }
  static getRteStylesheets(e) {
    return (e?.client ?? f).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheets",
      ...e
    });
  }
  static previewSingleBlock(e) {
    return (e?.client ?? f).post({
      url: "/umbraco/block-preview/api/v1/preview/single",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e?.headers
      }
    });
  }
  static getSingleBlockStylesheets(e) {
    return (e?.client ?? f).get({
      url: "/umbraco/block-preview/api/v1/preview/single/stylesheets",
      ...e
    });
  }
  static getSettings(e) {
    return (e?.client ?? f).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...e
    });
  }
}
const Xe = new dt("BlockPreviewContext");
var Ht = Object.defineProperty, g = (t, e, i, s) => {
  for (var r = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = o(e, i, r) || r);
  return r && Ht(e, i, r), r;
};
class d extends kt {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._stylesheetsAdopted = !1, this._requestId = 0, this._isConnected = !1, this._pointerStartPos = null, this.consumeContext(Xe, async (e) => {
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
    this.consumeContext(yt, (e) => {
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
    !this._isConnected || !i || (this._blockContext.unique = e?.toString() ?? "", this._blockPreviewContext?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = this._ownerContentTypeUnique ?? i, this._blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), this._workspaceContextResolved = !0, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
  }
  /**
   * Observe the nearest block workspace to resolve the content type that owns the
   * block-editor property. The document/node key still comes from the content
   * workspace (see #297); only the owning content type differs when nested.
   */
  observeOwnerContentType() {
    this.consumeContext(Oe, (e) => {
      e && this.observe(e.content.structure.contentTypeUniques, (i) => {
        const s = i?.[0];
        !s || s === this._ownerContentTypeUnique || (this._ownerContentTypeUnique = s, this._blockContext.documentTypeUnique !== s && (this._blockContext.documentTypeUnique = s, this._blockPreviewContext?.setDocumentTypeUnique(s), this._workspaceContextResolved && this.renderBlockPreview()));
      });
    });
  }
  /**
   * Fallback workspace observation via UMB_BLOCK_WORKSPACE_CONTEXT.
   * Used when the primary workspace context is unavailable (e.g. nested block editing).
   */
  observeBlockWorkspaceFallback() {
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(Oe, async (e) => {
      e && this.observe(e.content.structure.contentTypeUniques, async (i) => {
        const s = i[0];
        !this._isConnected || !s || (this._blockContext.unique = this._blockPreviewContext?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = s, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
      });
    });
  }
  async fetchAndLoadStylesheets() {
    if (this._stylesheetsAdopted || !this._blockPreviewContext) return;
    const e = await this.fetchStylesheets();
    if (e && e.length > 0) {
      const i = await Promise.all(
        e.map((r) => this._blockPreviewContext.getOrCreateStylesheet(r))
      ), s = this.renderRoot;
      s.adoptedStyleSheets = [...s.adoptedStyleSheets, ...i], this._stylesheetsAdopted = !0;
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
      const { data: i, error: s } = await this._blockPreviewContext.requestQueue.enqueue(
        () => this.callPreviewApi()
      );
      if (this._requestId !== e) return;
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : s ? (this._error = _t.isUmbApiError(s) ? s.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
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
  _handlePointerDown(e) {
    this._pointerStartPos = { x: e.clientX, y: e.clientY };
  }
  _handleClick(e) {
    if (("pointerType" in e ? e.pointerType : "") !== "") {
      if (!this._pointerStartPos) {
        e.preventDefault(), e.stopPropagation();
        return;
      }
      const o = Math.abs(e.clientX - this._pointerStartPos.x), a = Math.abs(e.clientY - this._pointerStartPos.y);
      if (this._pointerStartPos = null, o > 5 || a > 5) {
        e.preventDefault(), e.stopPropagation();
        return;
      }
    }
    this._pointerStartPos = null;
    const s = e.composedPath(), r = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (s.some((o) => o instanceof Element && r.includes(o.tagName))) {
      if (s.find((a) => a instanceof wt && a.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (s.filter((o) => o instanceof Element && o.tagName === "A" && o.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const o = s.find((a) => a instanceof Element && a.tagName === "A" && a.classList.contains("block-preview-edit"));
      o instanceof Element ? window.history.pushState({}, "", o.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  // endregion
  // region Rendering
  render() {
    return X`
            ${this._isLoading ? X`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>` : this._error ? X`<div class="preview-alert preview-alert-error" role="alert">${this._error}</div>` : this._htmlMarkup ? X`<a
                            href=${qe(this._blockContext.workspaceEditContentPath)}
                            @pointerdown=${this._handlePointerDown}
                            @click=${this._handleClick}
                            aria-label=${this.localize.term("blockPreview_editBlock")}
                            class="block-preview-edit"
							title=${qe(this._blockContext.contentElementTypeAlias)}
                        >${ft(this._htmlMarkup)}</a>` : bt}
        `;
  }
  static {
    this.styles = [
      ae`
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
g([
  C({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], d.prototype, "content");
g([
  C({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], d.prototype, "settings");
g([
  C({ attribute: !1 })
], d.prototype, "contentKey");
g([
  C({ attribute: !1 })
], d.prototype, "config");
g([
  C({ attribute: !1 })
], d.prototype, "unpublished");
g([
  C({ attribute: !1 })
], d.prototype, "icon");
g([
  C({ attribute: !1 })
], d.prototype, "label");
g([
  D()
], d.prototype, "_htmlMarkup");
g([
  D()
], d.prototype, "_isLoading");
g([
  D()
], d.prototype, "_error");
class ue {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async previewGridBlock(e, i) {
    return await T(this.#e, S.previewGridBlock({ body: e, query: i }));
  }
  async previewListBlock(e, i) {
    return await T(this.#e, S.previewListBlock({ body: e, query: i }));
  }
  async previewSingleBlock(e, i) {
    return await T(this.#e, S.previewSingleBlock({ body: e, query: i }));
  }
  async previewRichTextMarkup(e, i) {
    return await T(this.#e, S.previewRichTextMarkup({ body: e, query: i }));
  }
  async getGridStylesheets(e) {
    return await T(this.#e, S.getGridStylesheets({ query: e }));
  }
  async getListStylesheets(e) {
    return await T(this.#e, S.getListStylesheets({ query: e }));
  }
  async getSingleBlockStylesheets(e) {
    return await T(this.#e, S.getSingleBlockStylesheets({ query: e }));
  }
  async getRteStylesheets(e) {
    return await T(this.#e, S.getRteStylesheets({ query: e }));
  }
}
class Xt {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await T(this.#e, S.getSettings());
  }
}
class Ft extends Ke {
  #e;
  constructor(e) {
    super(e), this.#e = new Xt(e);
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
var Jt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, Fe = (t) => {
  throw TypeError(t);
}, Je = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Yt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Jt(e, i, r), r;
}, Ce = (t, e, i) => e.has(t) || Fe("Cannot " + i), L = (t, e, i) => (Ce(t, e, "read from private field"), e.get(t)), F = (t, e, i) => e.has(t) ? Fe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), de = (t, e, i, s) => (Ce(t, e, "write to private field"), e.set(t, i), i), M = (t, e, i) => (Ce(t, e, "access private method"), i), R, B, Ye, N, Q, Qe, ne;
const Qt = "block-grid-preview";
let z = class extends d {
  constructor() {
    super(), F(this, B), F(this, R), this._blockContext = {
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
    }, F(this, N, !1), F(this, Q), de(this, R, new ue(this));
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), this.observeOwnerContentType(), await M(this, B, Ye).call(this);
  }
  observeBlockValue() {
    this.consumeContext(Ct, async (t) => {
      t && this.observe(
        _([
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
          s,
          r,
          n,
          o,
          a,
          c
        ]) => {
          const u = this._blockContext.layout?.columnSpan, l = this._blockContext.layout?.rowSpan, p = this._blockContext.layoutAreas;
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = c, !L(this, N) && this._blockContext.contentUdi && (de(this, N, !0), await M(this, B, Qe).call(this)), !p && c && (o?.length ?? 0) > 0 && L(this, N) && !this._isLoading && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": M(this, B, ne).call(this) }
          }, this.renderBlockPreview()), this._htmlMarkup && a && (a.columnSpan !== u || a.rowSpan !== l) && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": M(this, B, ne).call(this) }
          }, clearTimeout(L(this, Q)), de(this, Q, setTimeout(() => {
            this.renderBlockPreview();
          }, 300)));
        }
      );
    });
  }
  async callPreviewApi() {
    return await L(this, R).previewGridBlock(
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
    const { data: t } = await L(this, R).getGridStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
R = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakSet();
Ye = async function() {
  try {
    await this.getContext(A, { passContextAliasMatches: !0 }), this.consumeContext(A, (t) => {
      t && this.observe(
        _([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    }).passContextAliasMatches();
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
N = /* @__PURE__ */ new WeakMap();
Q = /* @__PURE__ */ new WeakMap();
Qe = async function() {
  this.consumeContext(vt, (t) => {
    t && this.observe(
      _([
        t.contents,
        t.settings,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, i, s, r]) => {
        if (this._blockContext.blockEditorAlias = r ?? "", this.blockGridValue = {
          contentData: e ?? [],
          settingsData: i ?? [],
          expose: s ?? [],
          layout: { "Umbraco.BlockGrid": M(this, B, ne).call(this) }
        }, this._blockContext.blockIndex = (e ?? []).findIndex((n) => n.key === this._blockContext.contentUdi), !this._htmlMarkup && !this._isLoading) {
          if ((this._blockContext.areas?.length ?? 0) > 0 && !this._blockContext.layoutAreas)
            return;
          this.renderBlockPreview();
        }
      }
    );
  });
};
ne = function() {
  return [
    {
      areas: this._blockContext.areas.map((i) => ({
        key: i.key,
        items: this._blockContext.layoutAreas?.find((r) => r.key === i.key)?.items ?? []
      })),
      columnSpan: this._blockContext.layout?.columnSpan ?? 0,
      rowSpan: this._blockContext.layout?.rowSpan ?? 0,
      contentKey: this._blockContext.layout?.contentKey ?? "",
      settingsKey: this._blockContext.layout?.settingsKey
    }
  ];
};
z.styles = [
  ...d.styles,
  ae`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
Je([
  C({ attribute: !1 })
], z.prototype, "blockGridValue", 1);
z = Je([
  le(Qt)
], z);
var Zt = Object.defineProperty, ei = Object.getOwnPropertyDescriptor, Ze = (t) => {
  throw TypeError(t);
}, ve = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ei(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Zt(e, i, r), r;
}, me = (t, e, i) => e.has(t) || Ze("Cannot " + i), be = (t, e, i) => (me(t, e, "read from private field"), e.get(t)), fe = (t, e, i) => e.has(t) ? Ze("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Le = (t, e, i, s) => (me(t, e, "write to private field"), e.set(t, i), i), Me = (t, e, i) => (me(t, e, "access private method"), i), I, Z, et, ee, tt;
const ti = "block-list-preview";
let q = class extends d {
  constructor() {
    super(), fe(this, Z), fe(this, I), this._blockContext = {
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
    }, fe(this, ee, !1), Le(this, I, new ue(this));
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Me(this, Z, et).call(this);
  }
  observeBlockValue() {
    this.consumeContext(mt, (t) => {
      t && this.observe(
        _([
          t.contentKey,
          t.settingsKey,
          t.workspaceEditContentPath,
          t.contentElementTypeAlias,
          t.contentElementTypeKey
        ]),
        async ([
          e,
          i,
          s,
          r,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", !be(this, ee) && this._blockContext.contentUdi && (Le(this, ee, !0), await Me(this, Z, tt).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await be(this, I).previewListBlock(
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
    const { data: t } = await be(this, I).getListStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
I = /* @__PURE__ */ new WeakMap();
Z = /* @__PURE__ */ new WeakSet();
et = async function() {
  try {
    await this.getContext(A, { passContextAliasMatches: !0 }), this.consumeContext(A, (t) => {
      t && this.observe(
        _([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    }).passContextAliasMatches();
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
ee = /* @__PURE__ */ new WeakMap();
tt = function() {
  this.consumeContext(gt, (t) => {
    t && this.observe(
      _([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([
        e,
        i,
        s,
        r,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: e?.filter((o) => o.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((o) => o.key === this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": s?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockListValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
q.styles = [
  ...d.styles,
  ae`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
ve([
  D()
], q.prototype, "_blockListValue", 2);
ve([
  C({ attribute: !1 })
], q.prototype, "blockListValue", 1);
q = ve([
  le(ti)
], q);
var ii = Object.defineProperty, si = Object.getOwnPropertyDescriptor, it = (t) => {
  throw TypeError(t);
}, ge = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? si(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && ii(e, i, r), r;
}, xe = (t, e, i) => e.has(t) || it("Cannot " + i), ke = (t, e, i) => (xe(t, e, "read from private field"), e.get(t)), ye = (t, e, i) => e.has(t) ? it("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Re = (t, e, i, s) => (xe(t, e, "write to private field"), e.set(t, i), i), Ne = (t, e, i) => (xe(t, e, "access private method"), i), K, te, st, ie, rt;
const ri = "block-single-preview";
let O = class extends d {
  constructor() {
    super(), ye(this, te), ye(this, K), this._blockContext = {
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
    }, this._blockSingleValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, ye(this, ie, !1), Re(this, K, new ue(this));
  }
  set blockSingleValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockSingleValue = e;
  }
  get blockSingleValue() {
    return this._blockSingleValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Ne(this, te, st).call(this);
  }
  observeBlockValue() {
    this.consumeContext(xt, (t) => {
      t && this.observe(
        _([
          t.contentKey,
          t.settingsKey,
          t.workspaceEditContentPath,
          t.contentElementTypeAlias,
          t.contentElementTypeKey
        ]),
        async ([
          e,
          i,
          s,
          r,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", ke(this, ie) || (Re(this, ie, !0), await Ne(this, te, rt).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await ke(this, K).previewSingleBlock(
      JSON.stringify(this.blockSingleValue),
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
    const { data: t } = await ke(this, K).getSingleBlockStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
K = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakSet();
st = async function() {
  try {
    await this.getContext(A, { passContextAliasMatches: !0 }), this.consumeContext(A, (t) => {
      t && this.observe(
        _([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    }).passContextAliasMatches();
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
ie = /* @__PURE__ */ new WeakMap();
rt = function() {
  this.consumeContext(Tt, (t) => {
    t && this.observe(
      _([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([
        e,
        i,
        s,
        r,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockSingleValue = {
          contentData: e?.filter((o) => o.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((o) => o.key === this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.SingleBlock": s?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockSingleValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
O.styles = [
  ...d.styles,
  ae`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
ge([
  D()
], O.prototype, "_blockSingleValue", 2);
ge([
  C({ attribute: !1 })
], O.prototype, "blockSingleValue", 1);
O = ge([
  le(ri)
], O);
var oi = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, ot = (t) => {
  throw TypeError(t);
}, Te = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ni(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && oi(e, i, r), r;
}, Se = (t, e, i) => e.has(t) || ot("Cannot " + i), J = (t, e, i) => (Se(t, e, "read from private field"), e.get(t)), Y = (t, e, i) => e.has(t) ? ot("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), _e = (t, e, i, s) => (Se(t, e, "write to private field"), e.set(t, i), i), Ie = (t, e, i) => (Se(t, e, "access private method"), i), W, se, nt, re, oe, at;
const ai = "rich-text-preview";
let G = class extends d {
  constructor() {
    super(), Y(this, se), Y(this, W), this._blockContext = {
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
    }, Y(this, re, !1), Y(this, oe, !1), _e(this, W, new ue(this));
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), this.observeBlockValue(), Ie(this, se, nt).call(this);
  }
  observeBlockValue() {
    J(this, re) || (_e(this, re, !0), this.consumeContext(St, (t) => {
      t != null && this.observe(
        _([
          t.contentKey,
          t.settingsKey,
          t.workspaceEditContentPath,
          t.contentElementTypeAlias,
          t.contentElementTypeKey
        ]),
        async ([
          e,
          i,
          s,
          r,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", !J(this, oe) && this._blockContext.contentUdi && (_e(this, oe, !0), await Ie(this, se, at).call(this));
        }
      );
    }));
  }
  async callPreviewApi() {
    return await J(this, W).previewRichTextMarkup(
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
    const { data: t } = await J(this, W).getRteStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
};
W = /* @__PURE__ */ new WeakMap();
se = /* @__PURE__ */ new WeakSet();
nt = function() {
  try {
    this.consumeContext(Pt, (t) => {
      t && (this._workspaceContextResolved = !0, this.observe(
        _([t.unique, t.contentTypeUnique]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i);
        }
      ));
    }).passContextAliasMatches();
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
re = /* @__PURE__ */ new WeakMap();
oe = /* @__PURE__ */ new WeakMap();
at = function() {
  this.consumeContext(Et, (t) => {
    t != null && this.observe(
      _([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([
        e,
        i,
        s,
        r,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: e?.filter((o) => o.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((o) => o.key === this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": s?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
Te([
  D()
], G.prototype, "_blockRteValue", 2);
Te([
  C({ attribute: !1 })
], G.prototype, "blockRteValue", 1);
G = Te([
  le(ai)
], G);
class li {
  #e;
  #t = 0;
  #i = [];
  constructor(e = 3) {
    this.#e = e;
  }
  /**
   * Enqueue a task to run with concurrency limiting.
   * If fewer than `maxConcurrent` tasks are active, the task runs immediately.
   * Otherwise it waits until a slot is available.
   */
  async enqueue(e) {
    this.#t >= this.#e && await new Promise((i) => {
      this.#i.push(i);
    }), this.#t++;
    try {
      return await e();
    } finally {
      this.#t--, this.#i.length > 0 && this.#i.shift()();
    }
  }
}
class we extends Ke {
  #e = new li(3);
  #t = /* @__PURE__ */ new Map();
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#e;
  }
  // Node key cache used as a fallback when a preview cannot reach its content
  // workspace directly (e.g. when nested inside another block, whose workspace
  // context shadows the document workspace under the shared 'UmbWorkspaceContext'
  // alias).
  #i = new De("");
  #s = new De("");
  constructor(e) {
    super(e);
  }
  getUnique() {
    return this.#i.getValue();
  }
  async setUnique(e) {
    e !== "" && this.#i.setValue(e);
  }
  getDocumentTypeUnique() {
    return this.#s.getValue();
  }
  async setDocumentTypeUnique(e) {
    e !== "" && this.#s.setValue(e);
  }
  getOrCreateStylesheet(e) {
    const i = this.#t.get(e);
    if (i) return i;
    const s = fetch(e).then((r) => r.text()).then((r) => {
      const n = new CSSStyleSheet();
      return n.replaceSync(r), n;
    });
    return this.#t.set(e, s), s;
  }
}
const ci = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: we,
  default: we
}, Symbol.toStringTag, { value: "Module" })), ui = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => ci)
  }
], hi = ui, pi = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], di = pi, Bi = async (t, e) => {
  t.consumeContext(pt, async (i) => {
    if (!i) return;
    const s = i.getOpenApiConfiguration();
    f.setConfig({
      baseUrl: s?.base ?? "",
      auth: s?.token ?? void 0,
      credentials: s?.credentials ?? "same-origin"
    }), f.interceptors.request.use(async (a, c) => {
      const u = await s.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new Ft(t).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: z,
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
      if (n.singleBlock.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.SingleBlockCustomView",
          name: "BlockPreview Single Block Custom View",
          element: O,
          forBlockEditor: "block-single"
        };
        n.singleBlock.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.singleBlock.contentTypes), o.push(a);
      }
      if (n.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: G,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    e.registerMany([
      ...o,
      ...hi,
      ...di
    ]), t.provideContext(Xe, new we(t));
  });
};
export {
  z as BlockGridPreviewCustomView,
  q as BlockListPreviewCustomView,
  d as BlockPreviewBaseElement,
  O as BlockSinglePreviewCustomView,
  ue as PreviewDataSource,
  G as RichTextPreviewCustomView,
  Xt as SettingsDataSource,
  Ft as SettingsRepository,
  Bi as onInit
};
//# sourceMappingURL=index.js.map

import { UMB_AUTH_CONTEXT as pt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as bt } from "@umbraco-cms/backoffice/context-api";
import { nothing as kt, html as X, ifDefined as qe, unsafeHTML as ft, css as ae, property as w, state as D, customElement as ce } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Oe } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as yt } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as _t } from "@umbraco-cms/backoffice/property";
import { UmbApiError as Ct, tryExecute as T } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as We } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as wt, UMB_BLOCK_GRID_MANAGER_CONTEXT as vt } from "@umbraco-cms/backoffice/block-grid";
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
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let d;
  const V = l ?? ((h) => new Promise((f) => setTimeout(f, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, f = 0;
    const E = c.signal ?? new AbortController().signal;
    for (; !E.aborted; ) {
      f++;
      const L = c.headers instanceof Headers ? c.headers : new Headers(c.headers);
      d !== void 0 && L.set("Last-Event-ID", d);
      try {
        const P = {
          redirect: "follow",
          ...c,
          body: c.serializedBody,
          headers: L,
          signal: E
        };
        let v = new Request(u, P);
        t && (v = await t(u, P));
        const y = await (c.fetch ?? globalThis.fetch)(v);
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
            const { done: lt, value: ut } = await m.read();
            if (lt) break;
            he += ut;
            const Pe = he.split(`

`);
            he = Pe.pop() ?? "";
            for (const ht of Pe) {
              const dt = ht.split(`
`), H = [];
              let Ue;
              for (const C of dt)
                if (C.startsWith("data:"))
                  H.push(C.replace(/^data:\s*/, ""));
                else if (C.startsWith("event:"))
                  Ue = C.replace(/^event:\s*/, "");
                else if (C.startsWith("id:"))
                  d = C.replace(/^id:\s*/, "");
                else if (C.startsWith("retry:")) {
                  const Ae = Number.parseInt(
                    C.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Ae) || (h = Ae);
                }
              let U, Be = !1;
              if (H.length) {
                const C = H.join(`
`);
                try {
                  U = JSON.parse(C), Be = !0;
                } catch {
                  U = C;
                }
              }
              Be && (r && await r(U), s && (U = await s(U))), i?.({
                data: U,
                event: Ue,
                id: d,
                retry: h
              }), H.length && (yield U);
            }
          }
        } finally {
          E.removeEventListener("abort", Ee), m.releaseLock();
        }
        break;
      } catch (P) {
        if (e?.(P), o !== void 0 && f >= o)
          break;
        const v = Math.min(
          h * 2 ** (f - 1),
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
}, Ge = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: s,
  value: r
}) => {
  if (!e) {
    const a = (t ? r : r.map((l) => encodeURIComponent(l))).join(qt(s));
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
  const n = At(s), o = r.map((a) => s === "label" || s === "simple" ? t ? a : encodeURIComponent(a) : le({
    allowReserved: t,
    name: i,
    value: a
  })).join(n);
  return s === "label" || s === "matrix" ? n + o : o;
}, le = ({
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
    let l = [];
    Object.entries(r).forEach(([c, d]) => {
      l = [
        ...l,
        c,
        t ? d : encodeURIComponent(d)
      ];
    });
    const u = l.join(",");
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
    ([l, u]) => le({
      allowReserved: t,
      name: s === "deepObject" ? `${i}[${l}]` : l,
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
      const l = t[o];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(
          r,
          Ge({ explode: n, name: o, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          r,
          ze({
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
          r,
          `;${le({
            name: o,
            value: l
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        a === "label" ? `.${l}` : l
      );
      i = i.replace(r, u);
    }
  return i;
}, Lt = ({
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
function $t(t) {
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
}, je = ({
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
          const l = Ge({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...e
          });
          l && n.push(l);
        } else if (typeof a == "object") {
          const l = ze({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "deepObject",
            value: a,
            ...i
          });
          l && n.push(l);
        } else {
          const l = le({
            allowReserved: t,
            name: o,
            value: a
          });
          l && n.push(l);
        }
    }
  return n.join("&");
}, Nt = (t) => {
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
}, Rt = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, It = async ({
  security: t,
  ...e
}) => {
  for (const i of t) {
    if (Rt(e, i.name))
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
}, Ve = (t) => Lt({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : je(t.querySerializer),
  url: t.url
}), Le = (t, e) => {
  const i = { ...t, ...e };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = He(t.headers, e.headers), i;
}, Kt = (t) => {
  const e = [];
  return t.forEach((i, s) => {
    e.push([s, i]);
  }), e;
}, He = (...t) => {
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
class de {
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
  error: new de(),
  request: new de(),
  response: new de()
}), Gt = je({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), zt = {
  "Content-Type": "application/json"
}, Xe = (t = {}) => ({
  ...Ut,
  headers: zt,
  parseAs: "auto",
  querySerializer: Gt,
  ...t
}), jt = (t = {}) => {
  let e = Le(Xe(), t);
  const i = () => ({ ...e }), s = (u) => (e = Le(e, u), i()), r = Wt(), n = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: He(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await It({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const d = Ve(c);
    return { opts: c, url: d };
  }, o = async (u) => {
    const { opts: c, url: d } = await n(u), V = {
      redirect: "follow",
      ...c,
      body: $t(c)
    };
    let x = new Request(d, V);
    for (const b of r.request.fns)
      b && (x = await b(x, c));
    const j = c.fetch;
    let h = await j(x);
    for (const b of r.response.fns)
      b && (h = await b(h, x, c));
    const f = {
      request: x,
      response: h
    };
    if (h.ok) {
      const b = (c.parseAs === "auto" ? Nt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
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
    const E = await h.text();
    let L;
    try {
      L = JSON.parse(E);
    } catch {
    }
    const P = L ?? E;
    let v = P;
    for (const b of r.error.fns)
      b && (v = await b(P, h, x, c));
    if (v = v || {}, c.throwOnError)
      throw v;
    return c.responseStyle === "data" ? void 0 : {
      error: v,
      ...f
    };
  }, a = (u) => (c) => o({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: d, url: V } = await n(c);
    return Bt({
      ...d,
      body: d.body,
      headers: d.headers,
      method: u,
      onRequest: async (x, j) => {
        let h = new Request(x, j);
        for (const f of r.request.fns)
          f && (h = await f(h, d));
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
}, k = jt(Xe({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class S {
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
  static previewSingleBlock(e) {
    return (e?.client ?? k).post({
      url: "/umbraco/block-preview/api/v1/preview/single",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e?.headers
      }
    });
  }
  static getSingleBlockStylesheets(e) {
    return (e?.client ?? k).get({
      url: "/umbraco/block-preview/api/v1/preview/single/stylesheets",
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
const Fe = new bt("BlockPreviewContext");
var Ht = Object.defineProperty, g = (t, e, i, s) => {
  for (var r = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = o(e, i, r) || r);
  return r && Ht(e, i, r), r;
};
const Xt = ["UUI-ACTION-BAR", "UMB-BLOCK-ACTION", "UMB-BLOCK-SCALE-HANDLER"];
function $e(t) {
  return t.some((s) => s instanceof Element && Xt.includes(s.tagName)) ? !t.some(
    (s) => s instanceof Element && s.tagName === "UUI-BUTTON" && (s.getAttribute("href") ?? "").includes("block/edit")
  ) : !1;
}
class p extends yt {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._stylesheetsAdopted = !1, this._requestId = 0, this._isConnected = !1, this._pointerStartPos = null, this._handleAnchorNavGuard = (e) => {
      $e(e.composedPath()) && e.preventDefault();
    }, this.consumeContext(Fe, async (e) => {
      this._blockPreviewContext = e, this.observeOwnerContentType(), await this.setupContextObservers();
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._isConnected = !0, this.addEventListener("click", this._handleAnchorNavGuard, { capture: !0 });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._isConnected = !1, this.removeEventListener("click", this._handleAnchorNavGuard, { capture: !0 });
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && this.renderBlockPreview();
  }
  // region Shared context observers
  observePropertyDataset() {
    this.consumeContext(_t, (e) => {
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
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : s ? (this._error = Ct.isUmbApiError(s) ? s.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
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
      const n = Math.abs(e.clientX - this._pointerStartPos.x), o = Math.abs(e.clientY - this._pointerStartPos.y);
      if (this._pointerStartPos = null, n > 5 || o > 5) {
        e.preventDefault(), e.stopPropagation();
        return;
      }
    }
    this._pointerStartPos = null;
    const s = e.composedPath();
    if ($e(s)) {
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
    return X`
            ${this._isLoading ? X`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>` : this._error ? X`<div class="preview-alert preview-alert-error" role="alert">${this._error}</div>` : this._htmlMarkup ? X`<a
                            href=${qe(this._blockContext.workspaceEditContentPath)}
                            @pointerdown=${this._handlePointerDown}
                            @click=${this._handleClick}
                            aria-label=${this.localize.term("blockPreview_editBlock")}
                            class="block-preview-edit"
							title=${qe(this._blockContext.contentElementTypeAlias)}
                        >${ft(this._htmlMarkup)}</a>` : kt}
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
  w({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], p.prototype, "content");
g([
  w({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], p.prototype, "settings");
g([
  w({ attribute: !1 })
], p.prototype, "contentKey");
g([
  w({ attribute: !1 })
], p.prototype, "config");
g([
  w({ attribute: !1 })
], p.prototype, "unpublished");
g([
  w({ attribute: !1 })
], p.prototype, "icon");
g([
  w({ attribute: !1 })
], p.prototype, "label");
g([
  D()
], p.prototype, "_htmlMarkup");
g([
  D()
], p.prototype, "_isLoading");
g([
  D()
], p.prototype, "_error");
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
class Ft {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await T(this.#e, S.getSettings());
  }
}
class Jt extends We {
  #e;
  constructor(e) {
    super(e), this.#e = new Ft(e);
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
var Yt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, Je = (t) => {
  throw TypeError(t);
}, Ye = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Qt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Yt(e, i, r), r;
}, we = (t, e, i) => e.has(t) || Je("Cannot " + i), $ = (t, e, i) => (we(t, e, "read from private field"), e.get(t)), F = (t, e, i) => e.has(t) ? Je("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), pe = (t, e, i, s) => (we(t, e, "write to private field"), e.set(t, i), i), M = (t, e, i) => (we(t, e, "access private method"), i), N, B, Qe, R, Q, Ze, ne;
const Zt = "block-grid-preview";
let G = class extends p {
  constructor() {
    super(), F(this, B), F(this, N), this._blockContext = {
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
    }, F(this, R, !1), F(this, Q), pe(this, N, new ue(this));
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await M(this, B, Qe).call(this);
  }
  observeBlockValue() {
    this.consumeContext(wt, async (t) => {
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
          l
        ]) => {
          const u = this._blockContext.layout?.columnSpan, c = this._blockContext.layout?.rowSpan, d = this._blockContext.layoutAreas;
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = l, !$(this, R) && this._blockContext.contentUdi && (pe(this, R, !0), await M(this, B, Ze).call(this)), !d && l && (o?.length ?? 0) > 0 && $(this, R) && !this._isLoading && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": M(this, B, ne).call(this) }
          }, this.renderBlockPreview()), this._htmlMarkup && a && (a.columnSpan !== u || a.rowSpan !== c) && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": M(this, B, ne).call(this) }
          }, clearTimeout($(this, Q)), pe(this, Q, setTimeout(() => {
            this.renderBlockPreview();
          }, 300)));
        }
      );
    });
  }
  async callPreviewApi() {
    return await $(this, N).previewGridBlock(
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
    const { data: t } = await $(this, N).getGridStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
N = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakSet();
Qe = async function() {
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
R = /* @__PURE__ */ new WeakMap();
Q = /* @__PURE__ */ new WeakMap();
Ze = async function() {
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
G.styles = [
  ...p.styles,
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
Ye([
  w({ attribute: !1 })
], G.prototype, "blockGridValue", 1);
G = Ye([
  ce(Zt)
], G);
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, et = (t) => {
  throw TypeError(t);
}, ve = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ti(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && ei(e, i, r), r;
}, me = (t, e, i) => e.has(t) || et("Cannot " + i), be = (t, e, i) => (me(t, e, "read from private field"), e.get(t)), ke = (t, e, i) => e.has(t) ? et("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Me = (t, e, i, s) => (me(t, e, "write to private field"), e.set(t, i), i), Ne = (t, e, i) => (me(t, e, "access private method"), i), I, Z, tt, ee, it;
const ii = "block-list-preview";
let q = class extends p {
  constructor() {
    super(), ke(this, Z), ke(this, I), this._blockContext = {
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
    }, ke(this, ee, !1), Me(this, I, new ue(this));
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Ne(this, Z, tt).call(this);
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", !be(this, ee) && this._blockContext.contentUdi && (Me(this, ee, !0), await Ne(this, Z, it).call(this));
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
tt = async function() {
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
it = function() {
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
  ...p.styles,
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
  w({ attribute: !1 })
], q.prototype, "blockListValue", 1);
q = ve([
  ce(ii)
], q);
var si = Object.defineProperty, ri = Object.getOwnPropertyDescriptor, st = (t) => {
  throw TypeError(t);
}, ge = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ri(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && si(e, i, r), r;
}, xe = (t, e, i) => e.has(t) || st("Cannot " + i), fe = (t, e, i) => (xe(t, e, "read from private field"), e.get(t)), ye = (t, e, i) => e.has(t) ? st("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Re = (t, e, i, s) => (xe(t, e, "write to private field"), e.set(t, i), i), Ie = (t, e, i) => (xe(t, e, "access private method"), i), K, te, rt, ie, ot;
const oi = "block-single-preview";
let O = class extends p {
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
    this.observePropertyDataset(), await Ie(this, te, rt).call(this);
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", fe(this, ie) || (Re(this, ie, !0), await Ie(this, te, ot).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await fe(this, K).previewSingleBlock(
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
    const { data: t } = await fe(this, K).getSingleBlockStylesheets({
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
rt = async function() {
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
ot = function() {
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
  ...p.styles,
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
  w({ attribute: !1 })
], O.prototype, "blockSingleValue", 1);
O = ge([
  ce(oi)
], O);
var ni = Object.defineProperty, ai = Object.getOwnPropertyDescriptor, nt = (t) => {
  throw TypeError(t);
}, Te = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ai(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && ni(e, i, r), r;
}, Se = (t, e, i) => e.has(t) || nt("Cannot " + i), J = (t, e, i) => (Se(t, e, "read from private field"), e.get(t)), Y = (t, e, i) => e.has(t) ? nt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), _e = (t, e, i, s) => (Se(t, e, "write to private field"), e.set(t, i), i), Ke = (t, e, i) => (Se(t, e, "access private method"), i), W, se, at, re, oe, ct;
const ci = "rich-text-preview";
let z = class extends p {
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
    this.observePropertyDataset(), this.observeBlockValue(), Ke(this, se, at).call(this);
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", !J(this, oe) && this._blockContext.contentUdi && (_e(this, oe, !0), await Ke(this, se, ct).call(this));
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
at = function() {
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
ct = function() {
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
], z.prototype, "_blockRteValue", 2);
Te([
  w({ attribute: !1 })
], z.prototype, "blockRteValue", 1);
z = Te([
  ce(ci)
], z);
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
class Ce extends We {
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
const ui = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: Ce,
  default: Ce
}, Symbol.toStringTag, { value: "Module" })), hi = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => ui)
  }
], di = hi, pi = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], bi = pi, Bi = async (t, e) => {
  t.consumeContext(pt, async (i) => {
    if (!i) return;
    const s = i.getOpenApiConfiguration();
    k.setConfig({
      baseUrl: s?.base ?? "",
      auth: s?.token ?? void 0,
      credentials: s?.credentials ?? "same-origin"
    }), k.interceptors.request.use(async (a, l) => {
      const u = await s.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new Jt(t).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: G,
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
          element: z,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    e.registerMany([
      ...o,
      ...di,
      ...bi
    ]), t.provideContext(Fe, new Ce(t));
  });
};
export {
  G as BlockGridPreviewCustomView,
  q as BlockListPreviewCustomView,
  p as BlockPreviewBaseElement,
  O as BlockSinglePreviewCustomView,
  ue as PreviewDataSource,
  z as RichTextPreviewCustomView,
  Ft as SettingsDataSource,
  Jt as SettingsRepository,
  $e as isBlockActionNavigation,
  Bi as onInit
};
//# sourceMappingURL=index.js.map

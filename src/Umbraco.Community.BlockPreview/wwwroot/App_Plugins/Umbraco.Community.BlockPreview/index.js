import { UMB_AUTH_CONTEXT as ut } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as ht } from "@umbraco-cms/backoffice/context-api";
import { nothing as pt, html as G, ifDefined as Be, unsafeHTML as dt, css as se, property as C, state as D, customElement as re } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ft } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as bt } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as kt } from "@umbraco-cms/backoffice/property";
import { UmbApiError as yt, tryExecute as S } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as _t } from "@umbraco-cms/backoffice/external/uui";
import { UmbControllerBase as Ne } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as wt, UMB_BLOCK_GRID_MANAGER_CONTEXT as Ct } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as A } from "@umbraco-cms/backoffice/content";
import { observeMultiple as _, UmbStringState as Ae } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as vt, UMB_BLOCK_LIST_MANAGER_CONTEXT as mt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_SINGLE_ENTRY_CONTEXT as gt, UMB_BLOCK_SINGLE_MANAGER_CONTEXT as xt } from "@umbraco-cms/backoffice/block-single";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as St, UMB_BLOCK_RTE_MANAGER_CONTEXT as Tt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Et } from "@umbraco-cms/backoffice/document";
const Pt = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, i) => typeof i == "bigint" ? i.toString() : i
  )
}, Ut = ({
  onRequest: t,
  onSseError: e,
  onSseEvent: i,
  responseTransformer: r,
  responseValidator: s,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: a,
  sseSleepFn: c,
  url: u,
  ...l
}) => {
  let d;
  const V = c ?? ((h) => new Promise((k) => setTimeout(k, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, k = 0;
    const E = l.signal ?? new AbortController().signal;
    for (; !E.aborted; ) {
      k++;
      const $ = l.headers instanceof Headers ? l.headers : new Headers(l.headers);
      d !== void 0 && $.set("Last-Event-ID", d);
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
        let ae = "";
        const Se = () => {
          try {
            m.cancel();
          } catch {
          }
        };
        E.addEventListener("abort", Se);
        try {
          for (; ; ) {
            const { done: nt, value: at } = await m.read();
            if (nt) break;
            ae += at;
            const Te = ae.split(`

`);
            ae = Te.pop() ?? "";
            for (const lt of Te) {
              const ct = lt.split(`
`), z = [];
              let Ee;
              for (const w of ct)
                if (w.startsWith("data:"))
                  z.push(w.replace(/^data:\s*/, ""));
                else if (w.startsWith("event:"))
                  Ee = w.replace(/^event:\s*/, "");
                else if (w.startsWith("id:"))
                  d = w.replace(/^id:\s*/, "");
                else if (w.startsWith("retry:")) {
                  const Ue = Number.parseInt(
                    w.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Ue) || (h = Ue);
                }
              let U, Pe = !1;
              if (z.length) {
                const w = z.join(`
`);
                try {
                  U = JSON.parse(w), Pe = !0;
                } catch {
                  U = w;
                }
              }
              Pe && (s && await s(U), r && (U = await r(U))), i?.({
                data: U,
                event: Ee,
                id: d,
                retry: h
              }), z.length && (yield U);
            }
          }
        } finally {
          E.removeEventListener("abort", Se), m.releaseLock();
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
}, Bt = (t) => {
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
}, At = (t) => {
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
}, qt = (t) => {
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
}, Ie = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: r,
  value: s
}) => {
  if (!e) {
    const a = (t ? s : s.map((c) => encodeURIComponent(c))).join(At(r));
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
  const n = Bt(r), o = s.map((a) => r === "label" || r === "simple" ? t ? a : encodeURIComponent(a) : oe({
    allowReserved: t,
    name: i,
    value: a
  })).join(n);
  return r === "label" || r === "matrix" ? n + o : o;
}, oe = ({
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
}, Ke = ({
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
    let c = [];
    Object.entries(s).forEach(([l, d]) => {
      c = [
        ...c,
        l,
        t ? d : encodeURIComponent(d)
      ];
    });
    const u = c.join(",");
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
  const o = qt(r), a = Object.entries(s).map(
    ([c, u]) => oe({
      allowReserved: t,
      name: r === "deepObject" ? `${i}[${c}]` : c,
      value: u
    })
  ).join(o);
  return r === "label" || r === "matrix" ? o + a : a;
}, Ot = /\{[^{}]+\}/g, Dt = ({ path: t, url: e }) => {
  let i = e;
  const r = e.match(Ot);
  if (r)
    for (const s of r) {
      let n = !1, o = s.substring(1, s.length - 1), a = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), a = "label") : o.startsWith(";") && (o = o.substring(1), a = "matrix");
      const c = t[o];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        i = i.replace(
          s,
          Ie({ explode: n, name: o, style: a, value: c })
        );
        continue;
      }
      if (typeof c == "object") {
        i = i.replace(
          s,
          Ke({
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
          s,
          `;${oe({
            name: o,
            value: c
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        a === "label" ? `.${c}` : c
      );
      i = i.replace(s, u);
    }
  return i;
}, Vt = ({
  baseUrl: t,
  path: e,
  query: i,
  querySerializer: r,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let o = (t ?? "") + n;
  e && (o = Dt({ path: e, url: o }));
  let a = i ? r(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function $t(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const Lt = async (t, e) => {
  const i = typeof e == "function" ? await e(t) : e;
  if (i)
    return t.scheme === "bearer" ? `Bearer ${i}` : t.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, We = ({
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
          const c = Ie({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...e
          });
          c && n.push(c);
        } else if (typeof a == "object") {
          const c = Ke({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "deepObject",
            value: a,
            ...i
          });
          c && n.push(c);
        } else {
          const c = oe({
            allowReserved: t,
            name: o,
            value: a
          });
          c && n.push(c);
        }
    }
  return n.join("&");
}, Mt = (t) => {
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
}, Rt = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, Nt = async ({
  security: t,
  ...e
}) => {
  for (const i of t) {
    if (Rt(e, i.name))
      continue;
    const r = await Lt(i, e.auth);
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
}, qe = (t) => Vt({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : We(t.querySerializer),
  url: t.url
}), Oe = (t, e) => {
  const i = { ...t, ...e };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = ze(t.headers, e.headers), i;
}, It = (t) => {
  const e = [];
  return t.forEach((i, r) => {
    e.push([r, i]);
  }), e;
}, ze = (...t) => {
  const e = new Headers();
  for (const i of t) {
    if (!i)
      continue;
    const r = i instanceof Headers ? It(i) : Object.entries(i);
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
class le {
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
const Kt = () => ({
  error: new le(),
  request: new le(),
  response: new le()
}), Wt = We({
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
}, Ge = (t = {}) => ({
  ...Pt,
  headers: zt,
  parseAs: "auto",
  querySerializer: Wt,
  ...t
}), Gt = (t = {}) => {
  let e = Oe(Ge(), t);
  const i = () => ({ ...e }), r = (u) => (e = Oe(e, u), i()), s = Kt(), n = async (u) => {
    const l = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: ze(e.headers, u.headers),
      serializedBody: void 0
    };
    l.security && await Nt({
      ...l,
      security: l.security
    }), l.requestValidator && await l.requestValidator(l), l.body !== void 0 && l.bodySerializer && (l.serializedBody = l.bodySerializer(l.body)), (l.body === void 0 || l.serializedBody === "") && l.headers.delete("Content-Type");
    const d = qe(l);
    return { opts: l, url: d };
  }, o = async (u) => {
    const { opts: l, url: d } = await n(u), V = {
      redirect: "follow",
      ...l,
      body: $t(l)
    };
    let x = new Request(d, V);
    for (const f of s.request.fns)
      f && (x = await f(x, l));
    const W = l.fetch;
    let h = await W(x);
    for (const f of s.response.fns)
      f && (h = await f(h, x, l));
    const k = {
      request: x,
      response: h
    };
    if (h.ok) {
      const f = (l.parseAs === "auto" ? Mt(h.headers.get("Content-Type")) : l.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let m;
        switch (f) {
          case "arrayBuffer":
          case "blob":
          case "text":
            m = await h[f]();
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
      switch (f) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          y = await h[f]();
          break;
        case "stream":
          return l.responseStyle === "data" ? h.body : {
            data: h.body,
            ...k
          };
      }
      return f === "json" && (l.responseValidator && await l.responseValidator(y), l.responseTransformer && (y = await l.responseTransformer(y))), l.responseStyle === "data" ? y : {
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
    for (const f of s.error.fns)
      f && (v = await f(P, h, x, l));
    if (v = v || {}, l.throwOnError)
      throw v;
    return l.responseStyle === "data" ? void 0 : {
      error: v,
      ...k
    };
  }, a = (u) => (l) => o({ ...l, method: u }), c = (u) => async (l) => {
    const { opts: d, url: V } = await n(l);
    return Ut({
      ...d,
      body: d.body,
      headers: d.headers,
      method: u,
      onRequest: async (x, W) => {
        let h = new Request(x, W);
        for (const k of s.request.fns)
          k && (h = await k(h, d));
        return h;
      },
      url: V
    });
  };
  return {
    buildUrl: qe,
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
}, b = Gt(Ge({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class T {
  static previewGridBlock(e) {
    return (e?.client ?? b).post({
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
    return (e?.client ?? b).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...e
    });
  }
  static getGridStylesheets(e) {
    return (e?.client ?? b).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...e
    });
  }
  static previewListBlock(e) {
    return (e?.client ?? b).post({
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
    return (e?.client ?? b).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...e
    });
  }
  static getListStylesheets(e) {
    return (e?.client ?? b).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...e
    });
  }
  static previewRichTextMarkup(e) {
    return (e?.client ?? b).post({
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
    return (e?.client ?? b).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheet",
      ...e
    });
  }
  static getRteStylesheets(e) {
    return (e?.client ?? b).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheets",
      ...e
    });
  }
  static previewSingleBlock(e) {
    return (e?.client ?? b).post({
      url: "/umbraco/block-preview/api/v1/preview/single",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e?.headers
      }
    });
  }
  static getSingleBlockStylesheets(e) {
    return (e?.client ?? b).get({
      url: "/umbraco/block-preview/api/v1/preview/single/stylesheets",
      ...e
    });
  }
  static getSettings(e) {
    return (e?.client ?? b).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...e
    });
  }
}
const je = new ht("BlockPreviewContext");
var jt = Object.defineProperty, g = (t, e, i, r) => {
  for (var s = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = o(e, i, s) || s);
  return s && jt(e, i, s), s;
};
class p extends bt {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._stylesheetsAdopted = !1, this._requestId = 0, this._isConnected = !1, this._pointerStartPos = null, this.consumeContext(je, async (e) => {
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
    this.consumeContext(kt, (e) => {
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
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(ft, async (e) => {
      e && this.observe(e.content.structure.contentTypeUniques, async (i) => {
        const r = i[0];
        !this._isConnected || !r || (this._blockContext.unique = this._blockPreviewContext?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = r, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
      });
    });
  }
  async fetchAndLoadStylesheets() {
    if (this._stylesheetsAdopted || !this._blockPreviewContext) return;
    const e = await this.fetchStylesheets();
    if (e && e.length > 0) {
      const i = await Promise.all(
        e.map((s) => this._blockPreviewContext.getOrCreateStylesheet(s))
      ), r = this.renderRoot;
      r.adoptedStyleSheets = [...r.adoptedStyleSheets, ...i], this._stylesheetsAdopted = !0;
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
      const { data: i, error: r } = await this._blockPreviewContext.requestQueue.enqueue(
        () => this.callPreviewApi()
      );
      if (this._requestId !== e) return;
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : r ? (this._error = yt.isUmbApiError(r) ? r.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
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
    const r = e.composedPath(), s = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (r.some((o) => o instanceof Element && s.includes(o.tagName))) {
      if (r.find((a) => a instanceof _t && a.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (r.filter((o) => o instanceof Element && o.tagName === "A" && o.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const o = r.find((a) => a instanceof Element && a.tagName === "A" && a.classList.contains("block-preview-edit"));
      o instanceof Element ? window.history.pushState({}, "", o.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  // endregion
  // region Rendering
  render() {
    return G`
            ${this._isLoading ? G`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>` : this._error ? G`<div class="preview-alert preview-alert-error" role="alert">${this._error}</div>` : this._htmlMarkup ? G`<a
                            href=${Be(this._blockContext.workspaceEditContentPath)}
                            @pointerdown=${this._handlePointerDown}
                            @click=${this._handleClick}
                            aria-label=${this.localize.term("blockPreview_editBlock")}
                            class="block-preview-edit"
							title=${Be(this._blockContext.contentElementTypeAlias)}
                        >${dt(this._htmlMarkup)}</a>` : pt}
        `;
  }
  static {
    this.styles = [
      se`
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
], p.prototype, "content");
g([
  C({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], p.prototype, "settings");
g([
  C({ attribute: !1 })
], p.prototype, "contentKey");
g([
  C({ attribute: !1 })
], p.prototype, "config");
g([
  C({ attribute: !1 })
], p.prototype, "unpublished");
g([
  C({ attribute: !1 })
], p.prototype, "icon");
g([
  C({ attribute: !1 })
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
class ne {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async previewGridBlock(e, i) {
    return await S(this.#e, T.previewGridBlock({ body: e, query: i }));
  }
  async previewListBlock(e, i) {
    return await S(this.#e, T.previewListBlock({ body: e, query: i }));
  }
  async previewSingleBlock(e, i) {
    return await S(this.#e, T.previewSingleBlock({ body: e, query: i }));
  }
  async previewRichTextMarkup(e, i) {
    return await S(this.#e, T.previewRichTextMarkup({ body: e, query: i }));
  }
  async getGridStylesheets(e) {
    return await S(this.#e, T.getGridStylesheets({ query: e }));
  }
  async getListStylesheets(e) {
    return await S(this.#e, T.getListStylesheets({ query: e }));
  }
  async getSingleBlockStylesheets(e) {
    return await S(this.#e, T.getSingleBlockStylesheets({ query: e }));
  }
  async getRteStylesheets(e) {
    return await S(this.#e, T.getRteStylesheets({ query: e }));
  }
}
class Ht {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await S(this.#e, T.getSettings());
  }
}
class Xt extends Ne {
  #e;
  constructor(e) {
    super(e), this.#e = new Ht(e);
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
var Ft = Object.defineProperty, Jt = Object.getOwnPropertyDescriptor, He = (t) => {
  throw TypeError(t);
}, Xe = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Jt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Ft(e, i, s), s;
}, ye = (t, e, i) => e.has(t) || He("Cannot " + i), j = (t, e, i) => (ye(t, e, "read from private field"), e.get(t)), H = (t, e, i) => e.has(t) ? He("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), ce = (t, e, i, r) => (ye(t, e, "write to private field"), e.set(t, i), i), X = (t, e, i) => (ye(t, e, "access private method"), i), L, B, Fe, F, J, Je, _e;
const Yt = "block-grid-preview";
let I = class extends p {
  constructor() {
    super(), H(this, B), H(this, L), this._blockContext = {
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
    }, H(this, F, !1), H(this, J), ce(this, L, new ne(this));
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await X(this, B, Fe).call(this);
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
          r,
          s,
          n,
          o,
          a,
          c
        ]) => {
          const u = this._blockContext.layout?.columnSpan, l = this._blockContext.layout?.rowSpan;
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = c, j(this, F) || (ce(this, F, !0), await X(this, B, Je).call(this)), this._htmlMarkup && a && (a.columnSpan !== u || a.rowSpan !== l) && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": X(this, B, _e).call(this) }
          }, clearTimeout(j(this, J)), ce(this, J, setTimeout(() => {
            this.renderBlockPreview();
          }, 300)));
        }
      );
    });
  }
  async callPreviewApi() {
    return await j(this, L).previewGridBlock(
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
    const { data: t } = await j(this, L).getGridStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
L = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakSet();
Fe = async function() {
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
F = /* @__PURE__ */ new WeakMap();
J = /* @__PURE__ */ new WeakMap();
Je = async function() {
  this.consumeContext(Ct, (t) => {
    t && this.observe(
      _([
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
          layout: { "Umbraco.BlockGrid": X(this, B, _e).call(this) }
        }, this._blockContext.blockIndex = e.findIndex((n) => n.key === this._blockContext.contentUdi), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
_e = function() {
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
I.styles = [
  ...p.styles,
  se`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
Xe([
  C({ attribute: !1 })
], I.prototype, "blockGridValue", 1);
I = Xe([
  re(Yt)
], I);
var Qt = Object.defineProperty, Zt = Object.getOwnPropertyDescriptor, Ye = (t) => {
  throw TypeError(t);
}, we = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Zt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Qt(e, i, s), s;
}, Ce = (t, e, i) => e.has(t) || Ye("Cannot " + i), ue = (t, e, i) => (Ce(t, e, "read from private field"), e.get(t)), he = (t, e, i) => e.has(t) ? Ye("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), De = (t, e, i, r) => (Ce(t, e, "write to private field"), e.set(t, i), i), Ve = (t, e, i) => (Ce(t, e, "access private method"), i), M, Y, Qe, Q, Ze;
const ei = "block-list-preview";
let q = class extends p {
  constructor() {
    super(), he(this, Y), he(this, M), this._blockContext = {
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
    }, he(this, Q, !1), De(this, M, new ne(this));
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Ve(this, Y, Qe).call(this);
  }
  observeBlockValue() {
    this.consumeContext(vt, (t) => {
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
          r,
          s,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", ue(this, Q) || (De(this, Q, !0), await Ve(this, Y, Ze).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await ue(this, M).previewListBlock(
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
    const { data: t } = await ue(this, M).getListStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
M = /* @__PURE__ */ new WeakMap();
Y = /* @__PURE__ */ new WeakSet();
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
Q = /* @__PURE__ */ new WeakMap();
Ze = function() {
  this.consumeContext(mt, (t) => {
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
        }, this._blockContext.blockIndex = e?.indexOf(this.blockListValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
q.styles = [
  ...p.styles,
  se`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
we([
  D()
], q.prototype, "_blockListValue", 2);
we([
  C({ attribute: !1 })
], q.prototype, "blockListValue", 1);
q = we([
  re(ei)
], q);
var ti = Object.defineProperty, ii = Object.getOwnPropertyDescriptor, et = (t) => {
  throw TypeError(t);
}, ve = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ii(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && ti(e, i, s), s;
}, me = (t, e, i) => e.has(t) || et("Cannot " + i), pe = (t, e, i) => (me(t, e, "read from private field"), e.get(t)), de = (t, e, i) => e.has(t) ? et("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), $e = (t, e, i, r) => (me(t, e, "write to private field"), e.set(t, i), i), Le = (t, e, i) => (me(t, e, "access private method"), i), R, Z, tt, ee, it;
const si = "block-single-preview";
let O = class extends p {
  constructor() {
    super(), de(this, Z), de(this, R), this._blockContext = {
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
    }, de(this, ee, !1), $e(this, R, new ne(this));
  }
  set blockSingleValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockSingleValue = e;
  }
  get blockSingleValue() {
    return this._blockSingleValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Le(this, Z, tt).call(this);
  }
  observeBlockValue() {
    this.consumeContext(gt, (t) => {
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
          r,
          s,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", pe(this, ee) || ($e(this, ee, !0), await Le(this, Z, it).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await pe(this, R).previewSingleBlock(
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
    const { data: t } = await pe(this, R).getSingleBlockStylesheets({
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
  this.consumeContext(xt, (t) => {
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
        r,
        s,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockSingleValue = {
          contentData: e?.filter((o) => o.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((o) => o.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.SingleBlock": r?.filter((o) => o.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockSingleValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
O.styles = [
  ...p.styles,
  se`
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
], O.prototype, "_blockSingleValue", 2);
ve([
  C({ attribute: !1 })
], O.prototype, "blockSingleValue", 1);
O = ve([
  re(si)
], O);
var ri = Object.defineProperty, oi = Object.getOwnPropertyDescriptor, st = (t) => {
  throw TypeError(t);
}, ge = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? oi(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && ri(e, i, s), s;
}, xe = (t, e, i) => e.has(t) || st("Cannot " + i), fe = (t, e, i) => (xe(t, e, "read from private field"), e.get(t)), be = (t, e, i) => e.has(t) ? st("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Me = (t, e, i, r) => (xe(t, e, "write to private field"), e.set(t, i), i), Re = (t, e, i) => (xe(t, e, "access private method"), i), N, te, rt, ie, ot;
const ni = "rich-text-preview";
let K = class extends p {
  constructor() {
    super(), be(this, te), be(this, N), this._blockContext = {
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
    }, be(this, ie, !1), Me(this, N, new ne(this));
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), Re(this, te, rt).call(this);
  }
  observeBlockValue() {
    this.consumeContext(St, (t) => {
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
          r,
          s,
          n
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", fe(this, ie) || (Me(this, ie, !0), await Re(this, te, ot).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await fe(this, N).previewRichTextMarkup(
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
    const { data: t } = await fe(this, N).getRteStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
};
N = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakSet();
rt = function() {
  try {
    this.consumeContext(Et, (t) => {
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
ie = /* @__PURE__ */ new WeakMap();
ot = function() {
  this.consumeContext(Tt, (t) => {
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
        }, !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
ge([
  D()
], K.prototype, "_blockRteValue", 2);
ge([
  C({ attribute: !1 })
], K.prototype, "blockRteValue", 1);
K = ge([
  re(ni)
], K);
class ai {
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
class ke extends Ne {
  #e = new ai(3);
  #t = /* @__PURE__ */ new Map();
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#e;
  }
  // Node key cache used as a fallback when a preview cannot reach its content
  // workspace directly (e.g. when rendered inside a portaled block-edit modal).
  #i = new Ae("");
  #s = new Ae("");
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
    const r = fetch(e).then((s) => s.text()).then((s) => {
      const n = new CSSStyleSheet();
      return n.replaceSync(s), n;
    });
    return this.#t.set(e, r), r;
  }
}
const li = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ke,
  default: ke
}, Symbol.toStringTag, { value: "Module" })), ci = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => li)
  }
], ui = ci, hi = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], pi = hi, Ui = async (t, e) => {
  t.consumeContext(ut, async (i) => {
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    b.setConfig({
      baseUrl: r?.base ?? "",
      auth: r?.token ?? void 0,
      credentials: r?.credentials ?? "same-origin"
    }), b.interceptors.request.use(async (a, c) => {
      const u = await r.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new Xt(t).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: I,
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
          element: K,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    e.registerMany([
      ...o,
      ...ui,
      ...pi
    ]), t.provideContext(je, new ke(t));
  });
};
export {
  I as BlockGridPreviewCustomView,
  q as BlockListPreviewCustomView,
  p as BlockPreviewBaseElement,
  O as BlockSinglePreviewCustomView,
  ne as PreviewDataSource,
  K as RichTextPreviewCustomView,
  Ht as SettingsDataSource,
  Xt as SettingsRepository,
  Ui as onInit
};
//# sourceMappingURL=index.js.map

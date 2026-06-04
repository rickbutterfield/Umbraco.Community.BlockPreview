import { UMB_AUTH_CONTEXT as ht } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as dt } from "@umbraco-cms/backoffice/context-api";
import { nothing as pt, html as G, ifDefined as Be, unsafeHTML as bt, css as se, property as v, state as D, customElement as re } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ft } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as yt } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as kt } from "@umbraco-cms/backoffice/property";
import { UmbApiError as _t, tryExecute as S } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as wt } from "@umbraco-cms/backoffice/external/uui";
import { UmbControllerBase as Ne } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as vt, UMB_BLOCK_GRID_MANAGER_CONTEXT as Ct } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as A } from "@umbraco-cms/backoffice/content";
import { observeMultiple as _, UmbObjectState as mt, UmbStringState as Ae } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as gt, UMB_BLOCK_LIST_MANAGER_CONTEXT as xt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_SINGLE_ENTRY_CONTEXT as St, UMB_BLOCK_SINGLE_MANAGER_CONTEXT as Tt } from "@umbraco-cms/backoffice/block-single";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Et, UMB_BLOCK_RTE_MANAGER_CONTEXT as Pt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Ut } from "@umbraco-cms/backoffice/document";
const Bt = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, i) => typeof i == "bigint" ? i.toString() : i
  )
}, At = ({
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
  let p;
  const V = c ?? ((h) => new Promise((y) => setTimeout(y, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, y = 0;
    const E = l.signal ?? new AbortController().signal;
    for (; !E.aborted; ) {
      y++;
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
        let C = new Request(u, P);
        t && (C = await t(u, P));
        const k = await (l.fetch ?? globalThis.fetch)(C);
        if (!k.ok)
          throw new Error(
            `SSE failed: ${k.status} ${k.statusText}`
          );
        if (!k.body) throw new Error("No body in SSE response");
        const m = k.body.pipeThrough(new TextDecoderStream()).getReader();
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
            const { done: at, value: lt } = await m.read();
            if (at) break;
            ae += lt;
            const Te = ae.split(`

`);
            ae = Te.pop() ?? "";
            for (const ct of Te) {
              const ut = ct.split(`
`), z = [];
              let Ee;
              for (const w of ut)
                if (w.startsWith("data:"))
                  z.push(w.replace(/^data:\s*/, ""));
                else if (w.startsWith("event:"))
                  Ee = w.replace(/^event:\s*/, "");
                else if (w.startsWith("id:"))
                  p = w.replace(/^id:\s*/, "");
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
                id: p,
                retry: h
              }), z.length && (yield U);
            }
          }
        } finally {
          E.removeEventListener("abort", Se), m.releaseLock();
        }
        break;
      } catch (P) {
        if (e?.(P), o !== void 0 && y >= o)
          break;
        const C = Math.min(
          h * 2 ** (y - 1),
          a ?? 3e4
        );
        await V(C);
      }
    }
  }() };
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
}, Ot = (t) => {
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
}, Dt = (t) => {
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
    const a = (t ? s : s.map((c) => encodeURIComponent(c))).join(Ot(r));
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
  const n = qt(r), o = s.map((a) => r === "label" || r === "simple" ? t ? a : encodeURIComponent(a) : oe({
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
    Object.entries(s).forEach(([l, p]) => {
      c = [
        ...c,
        l,
        t ? p : encodeURIComponent(p)
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
  const o = Dt(r), a = Object.entries(s).map(
    ([c, u]) => oe({
      allowReserved: t,
      name: r === "deepObject" ? `${i}[${c}]` : c,
      value: u
    })
  ).join(o);
  return r === "label" || r === "matrix" ? o + a : a;
}, Vt = /\{[^{}]+\}/g, $t = ({ path: t, url: e }) => {
  let i = e;
  const r = e.match(Vt);
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
}, Lt = ({
  baseUrl: t,
  path: e,
  query: i,
  querySerializer: r,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let o = (t ?? "") + n;
  e && (o = $t({ path: e, url: o }));
  let a = i ? r(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function Rt(t) {
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
}, It = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, Kt = async ({
  security: t,
  ...e
}) => {
  for (const i of t) {
    if (It(e, i.name))
      continue;
    const r = await Mt(i, e.auth);
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
}, qe = (t) => Lt({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : We(t.querySerializer),
  url: t.url
}), Oe = (t, e) => {
  const i = { ...t, ...e };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = ze(t.headers, e.headers), i;
}, Wt = (t) => {
  const e = [];
  return t.forEach((i, r) => {
    e.push([r, i]);
  }), e;
}, ze = (...t) => {
  const e = new Headers();
  for (const i of t) {
    if (!i)
      continue;
    const r = i instanceof Headers ? Wt(i) : Object.entries(i);
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
const zt = () => ({
  error: new le(),
  request: new le(),
  response: new le()
}), Gt = We({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), jt = {
  "Content-Type": "application/json"
}, Ge = (t = {}) => ({
  ...Bt,
  headers: jt,
  parseAs: "auto",
  querySerializer: Gt,
  ...t
}), Ht = (t = {}) => {
  let e = Oe(Ge(), t);
  const i = () => ({ ...e }), r = (u) => (e = Oe(e, u), i()), s = zt(), n = async (u) => {
    const l = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: ze(e.headers, u.headers),
      serializedBody: void 0
    };
    l.security && await Kt({
      ...l,
      security: l.security
    }), l.requestValidator && await l.requestValidator(l), l.body !== void 0 && l.bodySerializer && (l.serializedBody = l.bodySerializer(l.body)), (l.body === void 0 || l.serializedBody === "") && l.headers.delete("Content-Type");
    const p = qe(l);
    return { opts: l, url: p };
  }, o = async (u) => {
    const { opts: l, url: p } = await n(u), V = {
      redirect: "follow",
      ...l,
      body: Rt(l)
    };
    let x = new Request(p, V);
    for (const b of s.request.fns)
      b && (x = await b(x, l));
    const W = l.fetch;
    let h = await W(x);
    for (const b of s.response.fns)
      b && (h = await b(h, x, l));
    const y = {
      request: x,
      response: h
    };
    if (h.ok) {
      const b = (l.parseAs === "auto" ? Nt(h.headers.get("Content-Type")) : l.parseAs) ?? "json";
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
          ...y
        };
      }
      let k;
      switch (b) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          k = await h[b]();
          break;
        case "stream":
          return l.responseStyle === "data" ? h.body : {
            data: h.body,
            ...y
          };
      }
      return b === "json" && (l.responseValidator && await l.responseValidator(k), l.responseTransformer && (k = await l.responseTransformer(k))), l.responseStyle === "data" ? k : {
        data: k,
        ...y
      };
    }
    const E = await h.text();
    let $;
    try {
      $ = JSON.parse(E);
    } catch {
    }
    const P = $ ?? E;
    let C = P;
    for (const b of s.error.fns)
      b && (C = await b(P, h, x, l));
    if (C = C || {}, l.throwOnError)
      throw C;
    return l.responseStyle === "data" ? void 0 : {
      error: C,
      ...y
    };
  }, a = (u) => (l) => o({ ...l, method: u }), c = (u) => async (l) => {
    const { opts: p, url: V } = await n(l);
    return At({
      ...p,
      body: p.body,
      headers: p.headers,
      method: u,
      onRequest: async (x, W) => {
        let h = new Request(x, W);
        for (const y of s.request.fns)
          y && (h = await y(h, p));
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
}, f = Ht(Ge({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class T {
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
const je = new dt("BlockPreviewContext");
var Xt = Object.defineProperty, g = (t, e, i, r) => {
  for (var s = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = o(e, i, s) || s);
  return s && Xt(e, i, s), s;
};
class d extends yt {
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
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : r ? (this._error = _t.isUmbApiError(r) ? r.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
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
      if (r.find((a) => a instanceof wt && a.href?.includes("block/edit")))
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
                        >${bt(this._htmlMarkup)}</a>` : pt}
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
  v({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], d.prototype, "content");
g([
  v({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], d.prototype, "settings");
g([
  v({ attribute: !1 })
], d.prototype, "contentKey");
g([
  v({ attribute: !1 })
], d.prototype, "config");
g([
  v({ attribute: !1 })
], d.prototype, "unpublished");
g([
  v({ attribute: !1 })
], d.prototype, "icon");
g([
  v({ attribute: !1 })
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
class Ft {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await S(this.#e, T.getSettings());
  }
}
class He extends Ne {
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
var Jt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, Xe = (t) => {
  throw TypeError(t);
}, Fe = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Yt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Jt(e, i, s), s;
}, ke = (t, e, i) => e.has(t) || Xe("Cannot " + i), j = (t, e, i) => (ke(t, e, "read from private field"), e.get(t)), H = (t, e, i) => e.has(t) ? Xe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), ce = (t, e, i, r) => (ke(t, e, "write to private field"), e.set(t, i), i), X = (t, e, i) => (ke(t, e, "access private method"), i), L, B, Je, F, J, Ye, _e;
const Qt = "block-grid-preview";
let I = class extends d {
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
    this.observePropertyDataset(), await X(this, B, Je).call(this);
  }
  observeBlockValue() {
    this.consumeContext(vt, async (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = c, j(this, F) || (ce(this, F, !0), await X(this, B, Ye).call(this)), this._htmlMarkup && a && (a.columnSpan !== u || a.rowSpan !== l) && (this.blockGridValue = {
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
Je = async function() {
  try {
    await this.getContext(A), this.consumeContext(A, (t) => {
      t && this.observe(
        _([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    });
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
F = /* @__PURE__ */ new WeakMap();
J = /* @__PURE__ */ new WeakMap();
Ye = async function() {
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
  ...d.styles,
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
Fe([
  v({ attribute: !1 })
], I.prototype, "blockGridValue", 1);
I = Fe([
  re(Qt)
], I);
var Zt = Object.defineProperty, ei = Object.getOwnPropertyDescriptor, Qe = (t) => {
  throw TypeError(t);
}, we = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ei(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Zt(e, i, s), s;
}, ve = (t, e, i) => e.has(t) || Qe("Cannot " + i), ue = (t, e, i) => (ve(t, e, "read from private field"), e.get(t)), he = (t, e, i) => e.has(t) ? Qe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), De = (t, e, i, r) => (ve(t, e, "write to private field"), e.set(t, i), i), Ve = (t, e, i) => (ve(t, e, "access private method"), i), R, Y, Ze, Q, et;
const ti = "block-list-preview";
let q = class extends d {
  constructor() {
    super(), he(this, Y), he(this, R), this._blockContext = {
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
    }, he(this, Q, !1), De(this, R, new ne(this));
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Ve(this, Y, Ze).call(this);
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", ue(this, Q) || (De(this, Q, !0), await Ve(this, Y, et).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await ue(this, R).previewListBlock(
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
    const { data: t } = await ue(this, R).getListStylesheets({
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
Y = /* @__PURE__ */ new WeakSet();
Ze = async function() {
  try {
    await this.getContext(A), this.consumeContext(A, (t) => {
      t && this.observe(
        _([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    });
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
Q = /* @__PURE__ */ new WeakMap();
et = function() {
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
  ...d.styles,
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
  v({ attribute: !1 })
], q.prototype, "blockListValue", 1);
q = we([
  re(ti)
], q);
var ii = Object.defineProperty, si = Object.getOwnPropertyDescriptor, tt = (t) => {
  throw TypeError(t);
}, Ce = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? si(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && ii(e, i, s), s;
}, me = (t, e, i) => e.has(t) || tt("Cannot " + i), de = (t, e, i) => (me(t, e, "read from private field"), e.get(t)), pe = (t, e, i) => e.has(t) ? tt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), $e = (t, e, i, r) => (me(t, e, "write to private field"), e.set(t, i), i), Le = (t, e, i) => (me(t, e, "access private method"), i), M, Z, it, ee, st;
const ri = "block-single-preview";
let O = class extends d {
  constructor() {
    super(), pe(this, Z), pe(this, M), this._blockContext = {
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
    }, pe(this, ee, !1), $e(this, M, new ne(this));
  }
  set blockSingleValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockSingleValue = e;
  }
  get blockSingleValue() {
    return this._blockSingleValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Le(this, Z, it).call(this);
  }
  observeBlockValue() {
    this.consumeContext(St, (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", de(this, ee) || ($e(this, ee, !0), await Le(this, Z, st).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await de(this, M).previewSingleBlock(
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
    const { data: t } = await de(this, M).getSingleBlockStylesheets({
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
Z = /* @__PURE__ */ new WeakSet();
it = async function() {
  try {
    await this.getContext(A), this.consumeContext(A, (t) => {
      t && this.observe(
        _([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    });
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
ee = /* @__PURE__ */ new WeakMap();
st = function() {
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
  ...d.styles,
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
Ce([
  D()
], O.prototype, "_blockSingleValue", 2);
Ce([
  v({ attribute: !1 })
], O.prototype, "blockSingleValue", 1);
O = Ce([
  re(ri)
], O);
var oi = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, rt = (t) => {
  throw TypeError(t);
}, ge = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ni(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && oi(e, i, s), s;
}, xe = (t, e, i) => e.has(t) || rt("Cannot " + i), be = (t, e, i) => (xe(t, e, "read from private field"), e.get(t)), fe = (t, e, i) => e.has(t) ? rt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Re = (t, e, i, r) => (xe(t, e, "write to private field"), e.set(t, i), i), Me = (t, e, i) => (xe(t, e, "access private method"), i), N, te, ot, ie, nt;
const ai = "rich-text-preview";
let K = class extends d {
  constructor() {
    super(), fe(this, te), fe(this, N), this._blockContext = {
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
    }, fe(this, ie, !1), Re(this, N, new ne(this));
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), Me(this, te, ot).call(this);
  }
  observeBlockValue() {
    this.consumeContext(Et, (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", be(this, ie) || (Re(this, ie, !0), await Me(this, te, nt).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await be(this, N).previewRichTextMarkup(
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
    const { data: t } = await be(this, N).getRteStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
};
N = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakSet();
ot = function() {
  try {
    this.consumeContext(Ut, (t) => {
      t && (this._workspaceContextResolved = !0, this.observe(
        _([t.unique, t.contentTypeUnique]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i);
        }
      ));
    });
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
ie = /* @__PURE__ */ new WeakMap();
nt = function() {
  this.consumeContext(Pt, (t) => {
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
  v({ attribute: !1 })
], K.prototype, "blockRteValue", 1);
K = ge([
  re(ai)
], K);
class li {
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
class ye extends Ne {
  constructor(e) {
    super(e), this.#i = new li(3), this.#t = /* @__PURE__ */ new Map(), this.#o = new mt(void 0), this.settings = this.#o.asObservable(), this.#s = new Ae(""), this.unique = this.#s.asObservable(), this.#r = new Ae(""), this.documentTypeUnique = this.#r.asObservable(), this.#e = new He(e), this.getSettings();
  }
  #e;
  #i;
  #t;
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#i;
  }
  #o;
  #s;
  #r;
  async getSettings() {
    const e = await this.#e.getSettings();
    this.#o.setValue(e);
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
const ci = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ye,
  default: ye
}, Symbol.toStringTag, { value: "Module" })), ui = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => ci)
  }
], hi = ui, di = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], pi = di, Bi = async (t, e) => {
  t.consumeContext(ht, async (i) => {
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    f.setConfig({
      baseUrl: r?.base ?? "",
      auth: r?.token ?? void 0,
      credentials: r?.credentials ?? "same-origin"
    }), f.interceptors.request.use(async (a, c) => {
      const u = await r.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new He(t).getSettings();
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
      ...hi,
      ...pi
    ]), t.provideContext(je, new ye(t));
  });
};
export {
  I as BlockGridPreviewCustomView,
  q as BlockListPreviewCustomView,
  d as BlockPreviewBaseElement,
  O as BlockSinglePreviewCustomView,
  ne as PreviewDataSource,
  K as RichTextPreviewCustomView,
  Ft as SettingsDataSource,
  He as SettingsRepository,
  Bi as onInit
};
//# sourceMappingURL=index.js.map

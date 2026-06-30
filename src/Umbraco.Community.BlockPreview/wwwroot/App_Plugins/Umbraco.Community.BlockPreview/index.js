import { UMB_AUTH_CONTEXT as dt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as pt } from "@umbraco-cms/backoffice/context-api";
import { nothing as bt, html as X, ifDefined as qe, unsafeHTML as ft, css as ae, property as S, state as $, customElement as le } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as kt } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as yt } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as _t } from "@umbraco-cms/backoffice/property";
import { UmbApiError as wt, tryExecute as E } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Ct } from "@umbraco-cms/backoffice/external/uui";
import { UmbControllerBase as Ke } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as vt, UMB_BLOCK_GRID_MANAGER_CONTEXT as mt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as O } from "@umbraco-cms/backoffice/content";
import { observeMultiple as v, UmbStringState as Oe } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as gt, UMB_BLOCK_LIST_MANAGER_CONTEXT as xt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_SINGLE_ENTRY_CONTEXT as St, UMB_BLOCK_SINGLE_MANAGER_CONTEXT as Tt } from "@umbraco-cms/backoffice/block-single";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Et, UMB_BLOCK_RTE_MANAGER_CONTEXT as Pt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Ut } from "@umbraco-cms/backoffice/document";
const Bt = {
  bodySerializer: (t) => JSON.stringify(t, (e, i) => typeof i == "bigint" ? i.toString() : i)
};
function At({
  onRequest: t,
  onSseError: e,
  onSseEvent: i,
  responseTransformer: r,
  responseValidator: s,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: a,
  sseSleepFn: l,
  url: k,
  ...u
}) {
  let c;
  const m = l ?? ((h) => new Promise((p) => setTimeout(p, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, p = 0;
    const C = u.signal ?? new AbortController().signal;
    for (; !C.aborted; ) {
      p++;
      const j = u.headers instanceof Headers ? u.headers : new Headers(u.headers);
      c !== void 0 && j.set("Last-Event-ID", c);
      try {
        const U = {
          redirect: "follow",
          ...u,
          body: u.serializedBody,
          headers: j,
          signal: C
        };
        let B = new Request(k, U);
        t && (B = await t(k, U));
        const b = await (u.fetch ?? globalThis.fetch)(B);
        if (!b.ok) throw new Error(`SSE failed: ${b.status} ${b.statusText}`);
        if (!b.body) throw new Error("No body in SSE response");
        const g = b.body.pipeThrough(new TextDecoderStream()).getReader();
        let y = "";
        const Ee = () => {
          try {
            g.cancel();
          } catch {
          }
        };
        C.addEventListener("abort", Ee);
        try {
          for (; ; ) {
            const { done: lt, value: ct } = await g.read();
            if (lt) break;
            y += ct, y = y.replace(/\r\n?/g, `
`);
            const Pe = y.split(`

`);
            y = Pe.pop() ?? "";
            for (const ut of Pe) {
              const ht = ut.split(`
`), H = [];
              let Ue;
              for (const x of ht)
                if (x.startsWith("data:"))
                  H.push(x.replace(/^data:\s*/, ""));
                else if (x.startsWith("event:"))
                  Ue = x.replace(/^event:\s*/, "");
                else if (x.startsWith("id:"))
                  c = x.replace(/^id:\s*/, "");
                else if (x.startsWith("retry:")) {
                  const Ae = Number.parseInt(x.replace(/^retry:\s*/, ""), 10);
                  Number.isNaN(Ae) || (h = Ae);
                }
              let A, Be = !1;
              if (H.length) {
                const x = H.join(`
`);
                try {
                  A = JSON.parse(x), Be = !0;
                } catch {
                  A = x;
                }
              }
              Be && (s && await s(A), r && (A = await r(A))), i?.({
                data: A,
                event: Ue,
                id: c,
                retry: h
              }), H.length && (yield A);
            }
          }
        } finally {
          C.removeEventListener("abort", Ee), g.releaseLock();
        }
        break;
      } catch (U) {
        if (e?.(U), o !== void 0 && p >= o)
          break;
        const B = Math.min(h * 2 ** (p - 1), a ?? 3e4);
        await m(B);
      }
    }
  }() };
}
const qt = (t) => {
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
}, We = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: r,
  value: s
}) => {
  if (!e) {
    const a = (t ? s : s.map((l) => encodeURIComponent(l))).join(Ot(r));
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
  const n = qt(r), o = s.map((a) => r === "label" || r === "simple" ? t ? a : encodeURIComponent(a) : ce({
    allowReserved: t,
    name: i,
    value: a
  })).join(n);
  return r === "label" || r === "matrix" ? n + o : o;
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
  style: r,
  value: s,
  valueOnly: n
}) => {
  if (s instanceof Date)
    return n ? s.toISOString() : `${i}=${s.toISOString()}`;
  if (r !== "deepObject" && !e) {
    let l = [];
    Object.entries(s).forEach(([u, c]) => {
      l = [...l, u, t ? c : encodeURIComponent(c)];
    });
    const k = l.join(",");
    switch (r) {
      case "form":
        return `${i}=${k}`;
      case "label":
        return `.${k}`;
      case "matrix":
        return `;${i}=${k}`;
      default:
        return k;
    }
  }
  const o = Dt(r), a = Object.entries(s).map(
    ([l, k]) => ce({
      allowReserved: t,
      name: r === "deepObject" ? `${i}[${l}]` : l,
      value: k
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
      const l = t[o];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(s, We({ explode: n, name: o, style: a, value: l }));
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          s,
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
          s,
          `;${ce({
            name: o,
            value: l
          })}`
        );
        continue;
      }
      const k = encodeURIComponent(
        a === "label" ? `.${l}` : l
      );
      i = i.replace(s, k);
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
function De(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const Rt = async (t, e) => {
  const i = typeof e == "function" ? await e(t) : e;
  if (i)
    return t.scheme === "bearer" ? `Bearer ${i}` : t.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Ge = ({
  parameters: t = {},
  ...e
} = {}) => (r) => {
  const s = [];
  if (r && typeof r == "object")
    for (const n in r) {
      const o = r[n];
      if (o == null)
        continue;
      const a = t[n] || e;
      if (Array.isArray(o)) {
        const l = We({
          allowReserved: a.allowReserved,
          explode: !0,
          name: n,
          style: "form",
          value: o,
          ...a.array
        });
        l && s.push(l);
      } else if (typeof o == "object") {
        const l = ze({
          allowReserved: a.allowReserved,
          explode: !0,
          name: n,
          style: "deepObject",
          value: o,
          ...a.object
        });
        l && s.push(l);
      } else {
        const l = ce({
          allowReserved: a.allowReserved,
          name: n,
          value: o
        });
        l && s.push(l);
      }
    }
  return s.join("&");
}, Mt = (t) => {
  if (!t)
    return "stream";
  const e = t.split(";")[0]?.trim();
  if (e) {
    if (e.startsWith("application/json") || e.endsWith("+json"))
      return "json";
    if (e === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some((i) => e.startsWith(i)))
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
    const r = await Rt(i, e.auth);
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
}, Ve = (t) => Lt({
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
  return t.forEach((i, r) => {
    e.push([r, i]);
  }), e;
}, je = (...t) => {
  const e = new Headers();
  for (const i of t) {
    if (!i)
      continue;
    const r = i instanceof Headers ? Kt(i) : Object.entries(i);
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
    const r = this.getInterceptorIndex(e);
    return this.fns[r] ? (this.fns[r] = i, e) : !1;
  }
  use(e) {
    return this.fns.push(e), this.fns.length - 1;
  }
}
const Wt = () => ({
  error: new de(),
  request: new de(),
  response: new de()
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
  ...Bt,
  headers: Gt,
  parseAs: "auto",
  querySerializer: zt,
  ...t
}), jt = (t = {}) => {
  let e = $e(He(), t);
  const i = () => ({ ...e }), r = (u) => (e = $e(e, u), i()), s = Wt(), n = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: je(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await It({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const m = c, w = Ve(m);
    return { opts: m, url: w };
  }, o = async (u) => {
    const c = u.throwOnError ?? e.throwOnError, m = u.responseStyle ?? e.responseStyle;
    let w, d;
    try {
      const { opts: h, url: p } = await n(u), C = {
        redirect: "follow",
        ...h,
        body: De(h)
      };
      w = new Request(p, C);
      for (const b of s.request.fns)
        b && (w = await b(w, h));
      const j = h.fetch;
      d = await j(w);
      for (const b of s.response.fns)
        b && (d = await b(d, w, h));
      const U = {
        request: w,
        response: d
      };
      if (d.ok) {
        const b = (h.parseAs === "auto" ? Mt(d.headers.get("Content-Type")) : h.parseAs) ?? "json";
        if (d.status === 204 || d.headers.get("Content-Length") === "0") {
          let y;
          switch (b) {
            case "arrayBuffer":
            case "blob":
            case "text":
              y = await d[b]();
              break;
            case "formData":
              y = new FormData();
              break;
            case "stream":
              y = d.body;
              break;
            case "json":
            default:
              y = {};
              break;
          }
          return h.responseStyle === "data" ? y : {
            data: y,
            ...U
          };
        }
        let g;
        switch (b) {
          case "arrayBuffer":
          case "blob":
          case "formData":
          case "text":
            g = await d[b]();
            break;
          case "json": {
            const y = await d.text();
            g = y ? JSON.parse(y) : {};
            break;
          }
          case "stream":
            return h.responseStyle === "data" ? d.body : {
              data: d.body,
              ...U
            };
        }
        return b === "json" && (h.responseValidator && await h.responseValidator(g), h.responseTransformer && (g = await h.responseTransformer(g))), h.responseStyle === "data" ? g : {
          data: g,
          ...U
        };
      }
      const B = await d.text();
      let he;
      try {
        he = JSON.parse(B);
      } catch {
      }
      throw he ?? B;
    } catch (h) {
      let p = h;
      for (const C of s.error.fns)
        C && (p = await C(p, d, w, u));
      if (p = p || {}, c)
        throw p;
      return m === "data" ? void 0 : {
        error: p,
        request: w,
        response: d
      };
    }
  }, a = (u) => (c) => o({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: m, url: w } = await n(c);
    return At({
      ...m,
      body: m.body,
      method: u,
      onRequest: async (d, h) => {
        let p = new Request(d, h);
        for (const C of s.request.fns)
          C && (p = await C(p, m));
        return p;
      },
      serializedBody: De(m),
      url: w
    });
  };
  return {
    buildUrl: (u) => Ve({ ...e, ...u }),
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
}, _ = jt(He({ baseUrl: "http://localhost:26293/", throwOnError: !0 }));
class P {
  static previewGridBlock(e) {
    return (e.client ?? _).post({
      url: "/umbraco/block-preview/api/v1/preview/grid",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getGridStylesheet(e) {
    return (e?.client ?? _).get({ url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet", ...e });
  }
  static getGridStylesheets(e) {
    return (e?.client ?? _).get({ url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets", ...e });
  }
  static previewListBlock(e) {
    return (e.client ?? _).post({
      url: "/umbraco/block-preview/api/v1/preview/list",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getListStylesheet(e) {
    return (e?.client ?? _).get({ url: "/umbraco/block-preview/api/v1/preview/list/stylesheet", ...e });
  }
  static getListStylesheets(e) {
    return (e?.client ?? _).get({ url: "/umbraco/block-preview/api/v1/preview/list/stylesheets", ...e });
  }
  static previewRichTextMarkup(e) {
    return (e.client ?? _).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getRteStylesheet(e) {
    return (e?.client ?? _).get({ url: "/umbraco/block-preview/api/v1/preview/rte/stylesheet", ...e });
  }
  static getRteStylesheets(e) {
    return (e?.client ?? _).get({ url: "/umbraco/block-preview/api/v1/preview/rte/stylesheets", ...e });
  }
  static previewSingleBlock(e) {
    return (e.client ?? _).post({
      url: "/umbraco/block-preview/api/v1/preview/single",
      ...e,
      headers: {
        "Content-Type": "application/json",
        ...e.headers
      }
    });
  }
  static getSingleBlockStylesheets(e) {
    return (e?.client ?? _).get({ url: "/umbraco/block-preview/api/v1/preview/single/stylesheets", ...e });
  }
  static getSettings(e) {
    return (e?.client ?? _).get({ url: "/umbraco/block-preview/api/v1/settings", ...e });
  }
}
const Xe = new pt("BlockPreviewContext");
var Ht = Object.defineProperty, T = (t, e, i, r) => {
  for (var s = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = o(e, i, s) || s);
  return s && Ht(e, i, s), s;
};
class f extends yt {
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
    !this._isConnected || !i || (this._blockContext.unique = e?.toString() ?? "", this._blockPreviewContext?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, this._blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), this._workspaceContextResolved = !0, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
  }
  /**
   * Fallback workspace observation via UMB_BLOCK_WORKSPACE_CONTEXT.
   * Used when the primary workspace context is unavailable (e.g. nested block editing).
   */
  observeBlockWorkspaceFallback() {
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(kt, async (e) => {
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
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : r ? (this._error = wt.isUmbApiError(r) ? r.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
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
      if (r.find((a) => a instanceof Ct && a.href?.includes("block/edit")))
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
T([
  S({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], f.prototype, "content");
T([
  S({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], f.prototype, "settings");
T([
  S({ attribute: !1 })
], f.prototype, "contentKey");
T([
  S({ attribute: !1 })
], f.prototype, "config");
T([
  S({ attribute: !1 })
], f.prototype, "unpublished");
T([
  S({ attribute: !1 })
], f.prototype, "icon");
T([
  S({ attribute: !1 })
], f.prototype, "label");
T([
  $()
], f.prototype, "_htmlMarkup");
T([
  $()
], f.prototype, "_isLoading");
T([
  $()
], f.prototype, "_error");
class ue {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async previewGridBlock(e, i) {
    return await E(this.#e, P.previewGridBlock({ body: e, query: i }));
  }
  async previewListBlock(e, i) {
    return await E(this.#e, P.previewListBlock({ body: e, query: i }));
  }
  async previewSingleBlock(e, i) {
    return await E(this.#e, P.previewSingleBlock({ body: e, query: i }));
  }
  async previewRichTextMarkup(e, i) {
    return await E(this.#e, P.previewRichTextMarkup({ body: e, query: i }));
  }
  async getGridStylesheets(e) {
    return await E(this.#e, P.getGridStylesheets({ query: e }));
  }
  async getListStylesheets(e) {
    return await E(this.#e, P.getListStylesheets({ query: e }));
  }
  async getSingleBlockStylesheets(e) {
    return await E(this.#e, P.getSingleBlockStylesheets({ query: e }));
  }
  async getRteStylesheets(e) {
    return await E(this.#e, P.getRteStylesheets({ query: e }));
  }
}
class Xt {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await E(this.#e, P.getSettings());
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
}, Je = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Yt(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Jt(e, i, s), s;
}, Ce = (t, e, i) => e.has(t) || Fe("Cannot " + i), L = (t, e, i) => (Ce(t, e, "read from private field"), e.get(t)), F = (t, e, i) => e.has(t) ? Fe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), pe = (t, e, i, r) => (Ce(t, e, "write to private field"), e.set(t, i), i), R = (t, e, i) => (Ce(t, e, "access private method"), i), M, q, Ye, N, Q, Qe, ne;
const Qt = "block-grid-preview";
let z = class extends f {
  constructor() {
    super(), F(this, q), F(this, M), this._blockContext = {
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
    }, F(this, N, !1), F(this, Q), pe(this, M, new ue(this));
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await R(this, q, Ye).call(this);
  }
  observeBlockValue() {
    this.consumeContext(vt, async (t) => {
      t && this.observe(
        v([
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
          const k = this._blockContext.layout?.columnSpan, u = this._blockContext.layout?.rowSpan, c = this._blockContext.layoutAreas;
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = l, !L(this, N) && this._blockContext.contentUdi && (pe(this, N, !0), await R(this, q, Qe).call(this)), !c && l && (o?.length ?? 0) > 0 && L(this, N) && !this._isLoading && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": R(this, q, ne).call(this) }
          }, this.renderBlockPreview()), this._htmlMarkup && a && (a.columnSpan !== k || a.rowSpan !== u) && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": R(this, q, ne).call(this) }
          }, clearTimeout(L(this, Q)), pe(this, Q, setTimeout(() => {
            this.renderBlockPreview();
          }, 300)));
        }
      );
    });
  }
  async callPreviewApi() {
    return await L(this, M).previewGridBlock(
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
    const { data: t } = await L(this, M).getGridStylesheets({
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
q = /* @__PURE__ */ new WeakSet();
Ye = async function() {
  try {
    await this.getContext(O, { passContextAliasMatches: !0 }), this.consumeContext(O, (t) => {
      t && this.observe(
        v([t.unique, t.structure.contentTypeUniques]),
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
  this.consumeContext(mt, (t) => {
    t && this.observe(
      v([
        t.contents,
        t.settings,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, i, r, s]) => {
        if (this._blockContext.blockEditorAlias = s ?? "", this.blockGridValue = {
          contentData: e ?? [],
          settingsData: i ?? [],
          expose: r ?? [],
          layout: { "Umbraco.BlockGrid": R(this, q, ne).call(this) }
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
        items: this._blockContext.layoutAreas?.find((s) => s.key === i.key)?.items ?? []
      })),
      columnSpan: this._blockContext.layout?.columnSpan ?? 0,
      rowSpan: this._blockContext.layout?.rowSpan ?? 0,
      contentKey: this._blockContext.layout?.contentKey ?? "",
      settingsKey: this._blockContext.layout?.settingsKey
    }
  ];
};
z.styles = [
  ...f.styles,
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
  S({ attribute: !1 })
], z.prototype, "blockGridValue", 1);
z = Je([
  le(Qt)
], z);
var Zt = Object.defineProperty, ei = Object.getOwnPropertyDescriptor, Ze = (t) => {
  throw TypeError(t);
}, ve = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ei(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && Zt(e, i, s), s;
}, me = (t, e, i) => e.has(t) || Ze("Cannot " + i), be = (t, e, i) => (me(t, e, "read from private field"), e.get(t)), fe = (t, e, i) => e.has(t) ? Ze("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Le = (t, e, i, r) => (me(t, e, "write to private field"), e.set(t, i), i), Re = (t, e, i) => (me(t, e, "access private method"), i), I, Z, et, ee, tt;
const ti = "block-list-preview";
let D = class extends f {
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
    this.observePropertyDataset(), await Re(this, Z, et).call(this);
  }
  observeBlockValue() {
    this.consumeContext(gt, (t) => {
      t && this.observe(
        v([
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", !be(this, ee) && this._blockContext.contentUdi && (Le(this, ee, !0), await Re(this, Z, tt).call(this));
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
    await this.getContext(O, { passContextAliasMatches: !0 }), this.consumeContext(O, (t) => {
      t && this.observe(
        v([t.unique, t.structure.contentTypeUniques]),
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
  this.consumeContext(xt, (t) => {
    t && this.observe(
      v([
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
D.styles = [
  ...f.styles,
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
  $()
], D.prototype, "_blockListValue", 2);
ve([
  S({ attribute: !1 })
], D.prototype, "blockListValue", 1);
D = ve([
  le(ti)
], D);
var ii = Object.defineProperty, si = Object.getOwnPropertyDescriptor, it = (t) => {
  throw TypeError(t);
}, ge = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? si(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && ii(e, i, s), s;
}, xe = (t, e, i) => e.has(t) || it("Cannot " + i), ke = (t, e, i) => (xe(t, e, "read from private field"), e.get(t)), ye = (t, e, i) => e.has(t) ? it("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Me = (t, e, i, r) => (xe(t, e, "write to private field"), e.set(t, i), i), Ne = (t, e, i) => (xe(t, e, "access private method"), i), K, te, st, ie, rt;
const ri = "block-single-preview";
let V = class extends f {
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
    }, ye(this, ie, !1), Me(this, K, new ue(this));
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
    this.consumeContext(St, (t) => {
      t && this.observe(
        v([
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", ke(this, ie) || (Me(this, ie, !0), await Ne(this, te, rt).call(this));
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
    await this.getContext(O, { passContextAliasMatches: !0 }), this.consumeContext(O, (t) => {
      t && this.observe(
        v([t.unique, t.structure.contentTypeUniques]),
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
      v([
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
V.styles = [
  ...f.styles,
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
  $()
], V.prototype, "_blockSingleValue", 2);
ge([
  S({ attribute: !1 })
], V.prototype, "blockSingleValue", 1);
V = ge([
  le(ri)
], V);
var oi = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, ot = (t) => {
  throw TypeError(t);
}, Se = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ni(e, i) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (s = (r ? o(e, i, s) : o(s)) || s);
  return r && s && oi(e, i, s), s;
}, Te = (t, e, i) => e.has(t) || ot("Cannot " + i), J = (t, e, i) => (Te(t, e, "read from private field"), e.get(t)), Y = (t, e, i) => e.has(t) ? ot("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), _e = (t, e, i, r) => (Te(t, e, "write to private field"), e.set(t, i), i), Ie = (t, e, i) => (Te(t, e, "access private method"), i), W, se, nt, re, oe, at;
const ai = "rich-text-preview";
let G = class extends f {
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
    J(this, re) || (_e(this, re, !0), this.consumeContext(Et, (t) => {
      t != null && this.observe(
        v([
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", !J(this, oe) && this._blockContext.contentUdi && (_e(this, oe, !0), await Ie(this, se, at).call(this));
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
    this.consumeContext(Ut, (t) => {
      t && (this._workspaceContextResolved = !0, this.observe(
        v([t.unique, t.contentTypeUnique]),
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
  this.consumeContext(Pt, (t) => {
    t != null && this.observe(
      v([
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
Se([
  $()
], G.prototype, "_blockRteValue", 2);
Se([
  S({ attribute: !1 })
], G.prototype, "blockRteValue", 1);
G = Se([
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
  #i = new Oe("");
  #s = new Oe("");
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
  t.consumeContext(dt, async (i) => {
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    _.setConfig({
      baseUrl: r?.base ?? "",
      auth: r?.token ?? void 0,
      credentials: r?.credentials ?? "same-origin"
    }), _.interceptors.request.use(async (a, l) => {
      const k = await r.token();
      return a.headers.set("Authorization", `Bearer ${k}`), a;
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
          element: D,
          forBlockEditor: "block-list"
        };
        n.blockList.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockList.contentTypes), o.push(a);
      }
      if (n.singleBlock.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.SingleBlockCustomView",
          name: "BlockPreview Single Block Custom View",
          element: V,
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
      ...pi
    ]), t.provideContext(Xe, new we(t));
  });
};
export {
  z as BlockGridPreviewCustomView,
  D as BlockListPreviewCustomView,
  f as BlockPreviewBaseElement,
  V as BlockSinglePreviewCustomView,
  ue as PreviewDataSource,
  G as RichTextPreviewCustomView,
  Xt as SettingsDataSource,
  Ft as SettingsRepository,
  Bi as onInit
};
//# sourceMappingURL=index.js.map

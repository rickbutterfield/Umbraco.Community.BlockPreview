import { UMB_AUTH_CONTEXT as Ae } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as Be } from "@umbraco-cms/backoffice/context-api";
import { html as V, ifDefined as Oe, unsafeHTML as Ve, css as H, property as w, state as A, customElement as X } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as De } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as $e } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as Le } from "@umbraco-cms/backoffice/property";
import { UmbApiError as Re, tryExecute as S } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Me } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ie, UMB_BLOCK_GRID_MANAGER_CONTEXT as Ne } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as j } from "@umbraco-cms/backoffice/content";
import { observeMultiple as x, UmbObjectState as je, UmbStringState as re, UmbBooleanState as Ke } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as We, UMB_BLOCK_LIST_MANAGER_CONTEXT as ze } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Ge, UMB_BLOCK_RTE_MANAGER_CONTEXT as Fe } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as He } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as ce } from "@umbraco-cms/backoffice/class-api";
const Xe = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, s) => typeof s == "bigint" ? s.toString() : s
  )
}, Je = ({
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
        let v = new Request(u, E);
        t && (v = await t(u, E));
        const y = await (c.fetch ?? globalThis.fetch)(v);
        if (!y.ok)
          throw new Error(
            `SSE failed: ${y.status} ${y.statusText}`
          );
        if (!y.body) throw new Error("No body in SSE response");
        const C = y.body.pipeThrough(new TextDecoderStream()).getReader();
        let W = "";
        const Y = () => {
          try {
            C.cancel();
          } catch {
          }
        };
        T.addEventListener("abort", Y);
        try {
          for (; ; ) {
            const { done: Ue, value: Se } = await C.read();
            if (Ue) break;
            W += Se;
            const Z = W.split(`

`);
            W = Z.pop() ?? "";
            for (const Pe of Z) {
              const qe = Pe.split(`
`), M = [];
              let ee;
              for (const m of qe)
                if (m.startsWith("data:"))
                  M.push(m.replace(/^data:\s*/, ""));
                else if (m.startsWith("event:"))
                  ee = m.replace(/^event:\s*/, "");
                else if (m.startsWith("id:"))
                  d = m.replace(/^id:\s*/, "");
                else if (m.startsWith("retry:")) {
                  const se = Number.parseInt(
                    m.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(se) || (h = se);
                }
              let U, te = !1;
              if (M.length) {
                const m = M.join(`
`);
                try {
                  U = JSON.parse(m), te = !0;
                } catch {
                  U = m;
                }
              }
              te && (r && await r(U), i && (U = await i(U))), s?.({
                data: U,
                event: ee,
                id: d,
                retry: h
              }), M.length && (yield U);
            }
          }
        } finally {
          T.removeEventListener("abort", Y), C.releaseLock();
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
}, Qe = (t) => {
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
}, Ye = (t) => {
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
}, Ze = (t) => {
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
}, le = ({
  allowReserved: t,
  explode: e,
  name: s,
  style: i,
  value: r
}) => {
  if (!e) {
    const a = (t ? r : r.map((l) => encodeURIComponent(l))).join(Ye(i));
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
  const n = Qe(i), o = r.map((a) => i === "label" || i === "simple" ? t ? a : encodeURIComponent(a) : K({
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
}, ue = ({
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
  const o = Ze(i), a = Object.entries(r).map(
    ([l, u]) => K({
      allowReserved: t,
      name: i === "deepObject" ? `${s}[${l}]` : l,
      value: u
    })
  ).join(o);
  return i === "label" || i === "matrix" ? o + a : a;
}, et = /\{[^{}]+\}/g, tt = ({ path: t, url: e }) => {
  let s = e;
  const i = e.match(et);
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
          le({ explode: n, name: o, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        s = s.replace(
          r,
          ue({
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
}, st = ({
  baseUrl: t,
  path: e,
  query: s,
  querySerializer: i,
  url: r
}) => {
  const n = r.startsWith("/") ? r : `/${r}`;
  let o = (t ?? "") + n;
  e && (o = tt({ path: e, url: o }));
  let a = s ? i(s) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function rt(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const it = async (t, e) => {
  const s = typeof e == "function" ? await e(t) : e;
  if (s)
    return t.scheme === "bearer" ? `Bearer ${s}` : t.scheme === "basic" ? `Basic ${btoa(s)}` : s;
}, he = ({
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
          const l = le({
            allowReserved: t,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...e
          });
          l && n.push(l);
        } else if (typeof a == "object") {
          const l = ue({
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
}, ot = (t) => {
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
}, nt = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, at = async ({
  security: t,
  ...e
}) => {
  for (const s of t) {
    if (nt(e, s.name))
      continue;
    const i = await it(s, e.auth);
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
}, ie = (t) => st({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : he(t.querySerializer),
  url: t.url
}), oe = (t, e) => {
  const s = { ...t, ...e };
  return s.baseUrl?.endsWith("/") && (s.baseUrl = s.baseUrl.substring(0, s.baseUrl.length - 1)), s.headers = de(t.headers, e.headers), s;
}, ct = (t) => {
  const e = [];
  return t.forEach((s, i) => {
    e.push([i, s]);
  }), e;
}, de = (...t) => {
  const e = new Headers();
  for (const s of t) {
    if (!s)
      continue;
    const i = s instanceof Headers ? ct(s) : Object.entries(s);
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
const lt = () => ({
  error: new z(),
  request: new z(),
  response: new z()
}), ut = he({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), ht = {
  "Content-Type": "application/json"
}, pe = (t = {}) => ({
  ...Xe,
  headers: ht,
  parseAs: "auto",
  querySerializer: ut,
  ...t
}), dt = (t = {}) => {
  let e = oe(pe(), t);
  const s = () => ({ ...e }), i = (u) => (e = oe(e, u), s()), r = lt(), n = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: de(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await at({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const d = ie(c);
    return { opts: c, url: d };
  }, o = async (u) => {
    const { opts: c, url: d } = await n(u), B = {
      redirect: "follow",
      ...c,
      body: rt(c)
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
      const b = (c.parseAs === "auto" ? ot(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let C;
        switch (b) {
          case "arrayBuffer":
          case "blob":
          case "text":
            C = await h[b]();
            break;
          case "formData":
            C = new FormData();
            break;
          case "stream":
            C = h.body;
            break;
          case "json":
          default:
            C = {};
            break;
        }
        return c.responseStyle === "data" ? C : {
          data: C,
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
    for (const b of r.error.fns)
      b && (v = await b(E, h, g, c));
    if (v = v || {}, c.throwOnError)
      throw v;
    return c.responseStyle === "data" ? void 0 : {
      error: v,
      ...f
    };
  }, a = (u) => (c) => o({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: d, url: B } = await n(c);
    return Je({
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
    buildUrl: ie,
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
}, k = dt(pe({
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
const be = new Be("BlockPreviewContext");
var pt = Object.defineProperty, _ = (t, e, s, i) => {
  for (var r = void 0, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = o(e, s, r) || r);
  return r && pt(e, s, r), r;
};
class p extends $e {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._styleElements = [], this._requestId = 0, this._isConnected = !1, this.consumeContext(be, async (e) => {
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
    this.consumeContext(Le, (e) => {
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
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(De, async (e) => {
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
      s != null ? (this._htmlMarkup = s, this._isLoading = !1) : i ? (this._error = Re.isUmbApiError(i) ? i.message : "An error occurred rendering the block preview", this._isLoading = !1) : this._isLoading = !1;
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
      if (s.find((o) => o instanceof Me && o.href?.includes("block/edit")))
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
      return V`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
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
                    href=${Oe(this._blockContext.workspaceEditContentPath)}
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
      H`
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
_([
  w({ attribute: !1 })
], p.prototype, "content");
_([
  w({ attribute: !1 })
], p.prototype, "settings");
_([
  w({ attribute: !1 })
], p.prototype, "contentKey");
_([
  w({ attribute: !1 })
], p.prototype, "config");
_([
  w({ attribute: !1 })
], p.prototype, "unpublished");
_([
  w({ attribute: !1 })
], p.prototype, "icon");
_([
  w({ attribute: !1 })
], p.prototype, "label");
_([
  A()
], p.prototype, "_htmlMarkup");
_([
  A()
], p.prototype, "_isLoading");
_([
  A()
], p.prototype, "_error");
_([
  A()
], p.prototype, "_sortModeActive");
var bt = Object.defineProperty, ft = Object.getOwnPropertyDescriptor, fe = (t) => {
  throw TypeError(t);
}, ye = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ft(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && bt(e, s, r), r;
}, yt = (t, e, s) => e.has(t) || fe("Cannot " + s), kt = (t, e, s) => e.has(t) ? fe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), G = (t, e, s) => (yt(t, e, "access private method"), s), D, ke, me, _e;
const mt = "block-grid-preview";
let $ = class extends p {
  constructor() {
    super(...arguments), kt(this, D), this._blockContext = {
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
    this.observeSortMode(), this.observePropertyDataset(), await G(this, D, ke).call(this);
  }
  observeBlockValue() {
    this.consumeContext(Ie, async (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await G(this, D, me).call(this);
        }
      );
    });
  }
  callPreviewApi() {
    return S(this, P.previewGridBlock({
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
    const { data: t } = await S(this, P.getGridStylesheets({
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
D = /* @__PURE__ */ new WeakSet();
ke = async function() {
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
me = async function() {
  this.consumeContext(Ne, (t) => {
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
          layout: { "Umbraco.BlockGrid": G(this, D, _e).call(this) }
        }, this._blockContext.blockIndex = e.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
_e = function() {
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
$.styles = [
  ...p.styles,
  H`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
ye([
  w({ attribute: !1 })
], $.prototype, "blockGridValue", 1);
$ = ye([
  X(mt)
], $);
var _t = Object.defineProperty, vt = Object.getOwnPropertyDescriptor, ve = (t) => {
  throw TypeError(t);
}, J = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? vt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && _t(e, s, r), r;
}, Ct = (t, e, s) => e.has(t) || ve("Cannot " + s), wt = (t, e, s) => e.has(t) ? ve("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), ne = (t, e, s) => (Ct(t, e, "access private method"), s), I, Ce, we;
const gt = "block-list-preview";
let q = class extends p {
  constructor() {
    super(...arguments), wt(this, I), this._blockContext = {
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
    this.observeSortMode(), this.observePropertyDataset(), await ne(this, I, Ce).call(this);
  }
  observeBlockValue() {
    this.consumeContext(We, (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await ne(this, I, we).call(this);
        }
      );
    });
  }
  callPreviewApi() {
    return S(this, P.previewListBlock({
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
    const { data: t } = await S(this, P.getListStylesheets({
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
I = /* @__PURE__ */ new WeakSet();
Ce = async function() {
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
we = function() {
  this.consumeContext(ze, (t) => {
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
q.styles = [
  ...p.styles,
  H`
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
  A()
], q.prototype, "_blockListValue", 2);
J([
  w({ attribute: !1 })
], q.prototype, "blockListValue", 1);
q = J([
  X(gt)
], q);
var xt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, ge = (t) => {
  throw TypeError(t);
}, Q = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Tt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && xt(e, s, r), r;
}, Et = (t, e, s) => e.has(t) || ge("Cannot " + s), Ut = (t, e, s) => e.has(t) ? ge("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), ae = (t, e, s) => (Et(t, e, "access private method"), s), N, xe, Te;
const St = "rich-text-preview";
let L = class extends p {
  constructor() {
    super(...arguments), Ut(this, N), this._blockContext = {
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
    this.observePropertyDataset(), ae(this, N, xe).call(this);
  }
  observeBlockValue() {
    this.consumeContext(Ge, (t) => {
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
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = s ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await ae(this, N, Te).call(this);
        }
      );
    });
  }
  callPreviewApi() {
    return S(this, P.previewRichTextMarkup({
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
    const { data: t } = await S(this, P.getRteStylesheets({
      query: {
        documentTypeUnique: this._blockContext.documentTypeUnique,
        nodeKey: this._blockContext.unique
      }
    }));
    return t;
  }
};
N = /* @__PURE__ */ new WeakSet();
xe = function() {
  this.consumeContext(He, (t) => {
    t && (this._workspaceContextResolved = !0, this.observe(
      x([t.unique, t.contentTypeUnique]),
      async ([e, s]) => {
        await this.handleWorkspaceData(e?.toString(), s);
      }
    ));
  }), this.observeBlockWorkspaceFallback();
};
Te = function() {
  this.consumeContext(Fe, (t) => {
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
  A()
], L.prototype, "_blockRteValue", 2);
Q([
  w({ attribute: !1 })
], L.prototype, "blockRteValue", 1);
L = Q([
  X(St)
], L);
class Pt {
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
class F extends ce {
  constructor(e) {
    super(e), this.#s = new Pt(3), this.#t = new je(void 0), this.settings = this.#t.asObservable(), this.#r = new re(""), this.unique = this.#r.asObservable(), this.#i = new re(""), this.documentTypeUnique = this.#i.asObservable(), this.#o = new Ke(!1), this.sortModeActive = this.#o.asObservable(), this.#e = new Ee(e), this.getSettings(), this.setSortMode(!1);
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
const qt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: F,
  default: F
}, Symbol.toStringTag, { value: "Module" })), At = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => qt)
  }
], Bt = [...At];
class Ot {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await S(this.#e, P.getSettings());
  }
}
class Ee extends ce {
  #e;
  constructor(e) {
    super(e), this.#e = new Ot(e);
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
const Xt = async (t, e) => {
  t.consumeContext(Ae, async (s) => {
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
    const n = await new Ee(t).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: $,
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
          element: L,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    e.registerMany([
      ...o,
      ...Bt
    ]), t.provideContext(be, new F(t));
  });
};
export {
  $ as BlockGridPreviewCustomView,
  q as BlockListPreviewCustomView,
  p as BlockPreviewBaseElement,
  L as RichTextPreviewCustomView,
  Ot as SettingsDataSource,
  Ee as SettingsRepository,
  Xt as onInit
};
//# sourceMappingURL=index.js.map

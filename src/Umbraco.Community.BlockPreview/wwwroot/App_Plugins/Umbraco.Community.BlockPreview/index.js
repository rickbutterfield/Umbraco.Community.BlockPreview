import { UMB_AUTH_CONTEXT as lt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as ut } from "@umbraco-cms/backoffice/context-api";
import { nothing as ht, html as j, ifDefined as dt, unsafeHTML as pt, css as Z, property as v, state as O, customElement as ee } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as bt } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as ft } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as yt } from "@umbraco-cms/backoffice/property";
import { UmbApiError as kt, tryExecute as E } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as _t } from "@umbraco-cms/backoffice/external/uui";
import { UmbControllerBase as Le } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as wt, UMB_BLOCK_GRID_MANAGER_CONTEXT as vt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as B } from "@umbraco-cms/backoffice/content";
import { observeMultiple as _, UmbObjectState as Ct, UmbStringState as Te } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as mt, UMB_BLOCK_LIST_MANAGER_CONTEXT as gt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_SINGLE_ENTRY_CONTEXT as xt, UMB_BLOCK_SINGLE_MANAGER_CONTEXT as Et } from "@umbraco-cms/backoffice/block-single";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as St, UMB_BLOCK_RTE_MANAGER_CONTEXT as Tt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Ut } from "@umbraco-cms/backoffice/document";
const Pt = {
  bodySerializer: (t) => JSON.stringify(
    t,
    (e, i) => typeof i == "bigint" ? i.toString() : i
  )
}, Bt = ({
  onRequest: t,
  onSseError: e,
  onSseEvent: i,
  responseTransformer: r,
  responseValidator: s,
  sseDefaultRetryDelay: o,
  sseMaxRetryAttempts: n,
  sseMaxRetryDelay: a,
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let p;
  const D = l ?? ((h) => new Promise((y) => setTimeout(y, h)));
  return { stream: async function* () {
    let h = o ?? 3e3, y = 0;
    const T = c.signal ?? new AbortController().signal;
    for (; !T.aborted; ) {
      y++;
      const V = c.headers instanceof Headers ? c.headers : new Headers(c.headers);
      p !== void 0 && V.set("Last-Event-ID", p);
      try {
        const U = {
          redirect: "follow",
          ...c,
          body: c.serializedBody,
          headers: V,
          signal: T
        };
        let C = new Request(u, U);
        t && (C = await t(u, U));
        const k = await (c.fetch ?? globalThis.fetch)(C);
        if (!k.ok)
          throw new Error(
            `SSE failed: ${k.status} ${k.statusText}`
          );
        if (!k.body) throw new Error("No body in SSE response");
        const m = k.body.pipeThrough(new TextDecoderStream()).getReader();
        let se = "";
        const me = () => {
          try {
            m.cancel();
          } catch {
          }
        };
        T.addEventListener("abort", me);
        try {
          for (; ; ) {
            const { done: nt, value: ot } = await m.read();
            if (nt) break;
            se += ot;
            const ge = se.split(`

`);
            se = ge.pop() ?? "";
            for (const at of ge) {
              const ct = at.split(`
`), z = [];
              let xe;
              for (const w of ct)
                if (w.startsWith("data:"))
                  z.push(w.replace(/^data:\s*/, ""));
                else if (w.startsWith("event:"))
                  xe = w.replace(/^event:\s*/, "");
                else if (w.startsWith("id:"))
                  p = w.replace(/^id:\s*/, "");
                else if (w.startsWith("retry:")) {
                  const Se = Number.parseInt(
                    w.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Se) || (h = Se);
                }
              let P, Ee = !1;
              if (z.length) {
                const w = z.join(`
`);
                try {
                  P = JSON.parse(w), Ee = !0;
                } catch {
                  P = w;
                }
              }
              Ee && (s && await s(P), r && (P = await r(P))), i?.({
                data: P,
                event: xe,
                id: p,
                retry: h
              }), z.length && (yield P);
            }
          }
        } finally {
          T.removeEventListener("abort", me), m.releaseLock();
        }
        break;
      } catch (U) {
        if (e?.(U), n !== void 0 && y >= n)
          break;
        const C = Math.min(
          h * 2 ** (y - 1),
          a ?? 3e4
        );
        await D(C);
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
}, Re = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: r,
  value: s
}) => {
  if (!e) {
    const a = (t ? s : s.map((l) => encodeURIComponent(l))).join(qt(r));
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
  const o = At(r), n = s.map((a) => r === "label" || r === "simple" ? t ? a : encodeURIComponent(a) : te({
    allowReserved: t,
    name: i,
    value: a
  })).join(o);
  return r === "label" || r === "matrix" ? o + n : n;
}, te = ({
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
}, Ne = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: r,
  value: s,
  valueOnly: o
}) => {
  if (s instanceof Date)
    return o ? s.toISOString() : `${i}=${s.toISOString()}`;
  if (r !== "deepObject" && !e) {
    let l = [];
    Object.entries(s).forEach(([c, p]) => {
      l = [
        ...l,
        c,
        t ? p : encodeURIComponent(p)
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
  const n = Ot(r), a = Object.entries(s).map(
    ([l, u]) => te({
      allowReserved: t,
      name: r === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(n);
  return r === "label" || r === "matrix" ? n + a : a;
}, Dt = /\{[^{}]+\}/g, Vt = ({ path: t, url: e }) => {
  let i = e;
  const r = e.match(Dt);
  if (r)
    for (const s of r) {
      let o = !1, n = s.substring(1, s.length - 1), a = "simple";
      n.endsWith("*") && (o = !0, n = n.substring(0, n.length - 1)), n.startsWith(".") ? (n = n.substring(1), a = "label") : n.startsWith(";") && (n = n.substring(1), a = "matrix");
      const l = t[n];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(
          s,
          Re({ explode: o, name: n, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          s,
          Ne({
            explode: o,
            name: n,
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
          `;${te({
            name: n,
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
}, $t = ({
  baseUrl: t,
  path: e,
  query: i,
  querySerializer: r,
  url: s
}) => {
  const o = s.startsWith("/") ? s : `/${s}`;
  let n = (t ?? "") + o;
  e && (n = Vt({ path: e, url: n }));
  let a = i ? r(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (n += `?${a}`), n;
};
function Lt(t) {
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
}, Me = ({
  allowReserved: t,
  array: e,
  object: i
} = {}) => (s) => {
  const o = [];
  if (s && typeof s == "object")
    for (const n in s) {
      const a = s[n];
      if (a != null)
        if (Array.isArray(a)) {
          const l = Re({
            allowReserved: t,
            explode: !0,
            name: n,
            style: "form",
            value: a,
            ...e
          });
          l && o.push(l);
        } else if (typeof a == "object") {
          const l = Ne({
            allowReserved: t,
            explode: !0,
            name: n,
            style: "deepObject",
            value: a,
            ...i
          });
          l && o.push(l);
        } else {
          const l = te({
            allowReserved: t,
            name: n,
            value: a
          });
          l && o.push(l);
        }
    }
  return o.join("&");
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
}, Mt = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1, It = async ({
  security: t,
  ...e
}) => {
  for (const i of t) {
    if (Mt(e, i.name))
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
}, Ue = (t) => $t({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : Me(t.querySerializer),
  url: t.url
}), Pe = (t, e) => {
  const i = { ...t, ...e };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Ie(t.headers, e.headers), i;
}, Kt = (t) => {
  const e = [];
  return t.forEach((i, r) => {
    e.push([r, i]);
  }), e;
}, Ie = (...t) => {
  const e = new Headers();
  for (const i of t) {
    if (!i)
      continue;
    const r = i instanceof Headers ? Kt(i) : Object.entries(i);
    for (const [s, o] of r)
      if (o === null)
        e.delete(s);
      else if (Array.isArray(o))
        for (const n of o)
          e.append(s, n);
      else o !== void 0 && e.set(
        s,
        typeof o == "object" ? JSON.stringify(o) : o
      );
  }
  return e;
};
class re {
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
  error: new re(),
  request: new re(),
  response: new re()
}), zt = Me({
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
}, Ke = (t = {}) => ({
  ...Pt,
  headers: jt,
  parseAs: "auto",
  querySerializer: zt,
  ...t
}), Gt = (t = {}) => {
  let e = Pe(Ke(), t);
  const i = () => ({ ...e }), r = (u) => (e = Pe(e, u), i()), s = Wt(), o = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: Ie(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await It({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const p = Ue(c);
    return { opts: c, url: p };
  }, n = async (u) => {
    const { opts: c, url: p } = await o(u), D = {
      redirect: "follow",
      ...c,
      body: Lt(c)
    };
    let x = new Request(p, D);
    for (const b of s.request.fns)
      b && (x = await b(x, c));
    const W = c.fetch;
    let h = await W(x);
    for (const b of s.response.fns)
      b && (h = await b(h, x, c));
    const y = {
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
          return c.responseStyle === "data" ? h.body : {
            data: h.body,
            ...y
          };
      }
      return b === "json" && (c.responseValidator && await c.responseValidator(k), c.responseTransformer && (k = await c.responseTransformer(k))), c.responseStyle === "data" ? k : {
        data: k,
        ...y
      };
    }
    const T = await h.text();
    let V;
    try {
      V = JSON.parse(T);
    } catch {
    }
    const U = V ?? T;
    let C = U;
    for (const b of s.error.fns)
      b && (C = await b(U, h, x, c));
    if (C = C || {}, c.throwOnError)
      throw C;
    return c.responseStyle === "data" ? void 0 : {
      error: C,
      ...y
    };
  }, a = (u) => (c) => n({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: p, url: D } = await o(c);
    return Bt({
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
      url: D
    });
  };
  return {
    buildUrl: Ue,
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
    request: n,
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
}, f = Gt(Ke({
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
const We = new ut("BlockPreviewContext");
var Ht = Object.defineProperty, g = (t, e, i, r) => {
  for (var s = void 0, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = n(e, i, s) || s);
  return s && Ht(e, i, s), s;
};
class d extends ft {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._stylesheetsAdopted = !1, this._requestId = 0, this._isConnected = !1, this.consumeContext(We, async (e) => {
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
    !this._isConnected || !i || (this._blockContext.unique = e?.toString() ?? "", this._blockPreviewContext?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, this._blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), this._workspaceContextResolved = !0, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
  }
  /**
   * Fallback workspace observation via UMB_BLOCK_WORKSPACE_CONTEXT.
   * Used when the primary workspace context is unavailable (e.g. nested block editing).
   */
  observeBlockWorkspaceFallback() {
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(bt, async (e) => {
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
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : r ? (this._error = kt.isUmbApiError(r) ? r.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
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
    if (i.some((o) => o instanceof Element && r.includes(o.tagName))) {
      if (i.find((n) => n instanceof _t && n.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (i.filter((o) => o instanceof Element && o.tagName === "A" && o.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const o = i.find((n) => n instanceof Element && n.tagName === "A" && n.classList.contains("block-preview-edit"));
      o instanceof Element ? window.history.pushState({}, "", o.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  // endregion
  // region Rendering
  render() {
    return j`
            ${this._isLoading ? j`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>` : this._error ? j`<div class="preview-alert preview-alert-error" role="alert">${this._error}</div>` : this._htmlMarkup ? j`<a
                            href=${dt(this._blockContext.workspaceEditContentPath)}
                            @click=${this._handleClick}
                            aria-label=${this.localize.term("blockPreview_editBlock")}
                            class="block-preview-edit"
                        >${pt(this._htmlMarkup)}</a>` : ht}
        `;
  }
  static {
    this.styles = [
      Z`
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
  O()
], d.prototype, "_htmlMarkup");
g([
  O()
], d.prototype, "_isLoading");
g([
  O()
], d.prototype, "_error");
class ie {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async previewGridBlock(e, i) {
    return await E(this.#e, S.previewGridBlock({ body: e, query: i }));
  }
  async previewListBlock(e, i) {
    return await E(this.#e, S.previewListBlock({ body: e, query: i }));
  }
  async previewSingleBlock(e, i) {
    return await E(this.#e, S.previewSingleBlock({ body: e, query: i }));
  }
  async previewRichTextMarkup(e, i) {
    return await E(this.#e, S.previewRichTextMarkup({ body: e, query: i }));
  }
  async getGridStylesheets(e) {
    return await E(this.#e, S.getGridStylesheets({ query: e }));
  }
  async getListStylesheets(e) {
    return await E(this.#e, S.getListStylesheets({ query: e }));
  }
  async getSingleBlockStylesheets(e) {
    return await E(this.#e, S.getSingleBlockStylesheets({ query: e }));
  }
  async getRteStylesheets(e) {
    return await E(this.#e, S.getRteStylesheets({ query: e }));
  }
}
class Ft {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async getSettings() {
    return await E(this.#e, S.getSettings());
  }
}
class ze extends Le {
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
var Xt = Object.defineProperty, Jt = Object.getOwnPropertyDescriptor, je = (t) => {
  throw TypeError(t);
}, Ge = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Jt(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (r ? n(e, i, s) : n(s)) || s);
  return r && s && Xt(e, i, s), s;
}, fe = (t, e, i) => e.has(t) || je("Cannot " + i), ne = (t, e, i) => (fe(t, e, "read from private field"), e.get(t)), oe = (t, e, i) => e.has(t) ? je("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Be = (t, e, i, r) => (fe(t, e, "write to private field"), e.set(t, i), i), pe = (t, e, i) => (fe(t, e, "access private method"), i), $, M, He, G, Fe, Xe;
const Qt = "block-grid-preview";
let I = class extends d {
  constructor() {
    super(), oe(this, M), oe(this, $), this._blockContext = {
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
    }, oe(this, G, !1), Be(this, $, new ie(this));
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await pe(this, M, He).call(this);
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
          o,
          n,
          a,
          l
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = o ?? "", this._blockContext.areas = n, this._blockContext.layout = a, this._blockContext.layoutAreas = l, ne(this, G) || (Be(this, G, !0), await pe(this, M, Fe).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await ne(this, $).previewGridBlock(
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
    const { data: t } = await ne(this, $).getGridStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
$ = /* @__PURE__ */ new WeakMap();
M = /* @__PURE__ */ new WeakSet();
He = async function() {
  try {
    await this.getContext(B), this.consumeContext(B, (t) => {
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
G = /* @__PURE__ */ new WeakMap();
Fe = async function() {
  this.consumeContext(vt, (t) => {
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
          layout: { "Umbraco.BlockGrid": pe(this, M, Xe).call(this) }
        }, this._blockContext.blockIndex = e.findIndex((o) => o.key === this._blockContext.contentUdi), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
Xe = function() {
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
  Z`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
Ge([
  v({ attribute: !1 })
], I.prototype, "blockGridValue", 1);
I = Ge([
  ee(Qt)
], I);
var Yt = Object.defineProperty, Zt = Object.getOwnPropertyDescriptor, Je = (t) => {
  throw TypeError(t);
}, ye = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Zt(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (r ? n(e, i, s) : n(s)) || s);
  return r && s && Yt(e, i, s), s;
}, ke = (t, e, i) => e.has(t) || Je("Cannot " + i), ae = (t, e, i) => (ke(t, e, "read from private field"), e.get(t)), ce = (t, e, i) => e.has(t) ? Je("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Ae = (t, e, i, r) => (ke(t, e, "write to private field"), e.set(t, i), i), qe = (t, e, i) => (ke(t, e, "access private method"), i), L, H, Qe, F, Ye;
const ei = "block-list-preview";
let A = class extends d {
  constructor() {
    super(), ce(this, H), ce(this, L), this._blockContext = {
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
    }, ce(this, F, !1), Ae(this, L, new ie(this));
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await qe(this, H, Qe).call(this);
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
          r,
          s,
          o
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = o ?? "", ae(this, F) || (Ae(this, F, !0), await qe(this, H, Ye).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await ae(this, L).previewListBlock(
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
    const { data: t } = await ae(this, L).getListStylesheets({
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
H = /* @__PURE__ */ new WeakSet();
Qe = async function() {
  try {
    await this.getContext(B), this.consumeContext(B, (t) => {
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
Ye = function() {
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
        r,
        s,
        o
      ]) => {
        this._blockContext.blockEditorAlias = o ?? "", this.blockListValue = {
          contentData: e?.filter((n) => n.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((n) => n.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": r?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockListValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
A.styles = [
  ...d.styles,
  Z`
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
  O()
], A.prototype, "_blockListValue", 2);
ye([
  v({ attribute: !1 })
], A.prototype, "blockListValue", 1);
A = ye([
  ee(ei)
], A);
var ti = Object.defineProperty, ii = Object.getOwnPropertyDescriptor, Ze = (t) => {
  throw TypeError(t);
}, _e = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ii(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (r ? n(e, i, s) : n(s)) || s);
  return r && s && ti(e, i, s), s;
}, we = (t, e, i) => e.has(t) || Ze("Cannot " + i), le = (t, e, i) => (we(t, e, "read from private field"), e.get(t)), ue = (t, e, i) => e.has(t) ? Ze("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Oe = (t, e, i, r) => (we(t, e, "write to private field"), e.set(t, i), i), De = (t, e, i) => (we(t, e, "access private method"), i), R, X, et, J, tt;
const si = "block-single-preview";
let q = class extends d {
  constructor() {
    super(), ue(this, X), ue(this, R), this._blockContext = {
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
    }, ue(this, J, !1), Oe(this, R, new ie(this));
  }
  set blockSingleValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockSingleValue = e;
  }
  get blockSingleValue() {
    return this._blockSingleValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await De(this, X, et).call(this);
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
          r,
          s,
          o
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = o ?? "", le(this, J) || (Oe(this, J, !0), await De(this, X, tt).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await le(this, R).previewSingleBlock(
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
    const { data: t } = await le(this, R).getSingleBlockStylesheets({
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
X = /* @__PURE__ */ new WeakSet();
et = async function() {
  try {
    await this.getContext(B), this.consumeContext(B, (t) => {
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
J = /* @__PURE__ */ new WeakMap();
tt = function() {
  this.consumeContext(Et, (t) => {
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
        o
      ]) => {
        this._blockContext.blockEditorAlias = o ?? "", this.blockSingleValue = {
          contentData: e?.filter((n) => n.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((n) => n.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.SingleBlock": r?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockSingleValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
q.styles = [
  ...d.styles,
  Z`
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
  O()
], q.prototype, "_blockSingleValue", 2);
_e([
  v({ attribute: !1 })
], q.prototype, "blockSingleValue", 1);
q = _e([
  ee(si)
], q);
var ri = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, it = (t) => {
  throw TypeError(t);
}, ve = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ni(e, i) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (r ? n(e, i, s) : n(s)) || s);
  return r && s && ri(e, i, s), s;
}, Ce = (t, e, i) => e.has(t) || it("Cannot " + i), he = (t, e, i) => (Ce(t, e, "read from private field"), e.get(t)), de = (t, e, i) => e.has(t) ? it("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Ve = (t, e, i, r) => (Ce(t, e, "write to private field"), e.set(t, i), i), $e = (t, e, i) => (Ce(t, e, "access private method"), i), N, Q, st, Y, rt;
const oi = "rich-text-preview";
let K = class extends d {
  constructor() {
    super(), de(this, Q), de(this, N), this._blockContext = {
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
    }, de(this, Y, !1), Ve(this, N, new ie(this));
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), $e(this, Q, st).call(this);
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
          o
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = o ?? "", he(this, Y) || (Ve(this, Y, !0), await $e(this, Q, rt).call(this));
        }
      );
    });
  }
  async callPreviewApi() {
    return await he(this, N).previewRichTextMarkup(
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
    const { data: t } = await he(this, N).getRteStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
    return t;
  }
};
N = /* @__PURE__ */ new WeakMap();
Q = /* @__PURE__ */ new WeakSet();
st = function() {
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
Y = /* @__PURE__ */ new WeakMap();
rt = function() {
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
        o
      ]) => {
        this._blockContext.blockEditorAlias = o ?? "", this.blockRteValue = {
          contentData: e?.filter((n) => n.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((n) => n.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": r?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
ve([
  O()
], K.prototype, "_blockRteValue", 2);
ve([
  v({ attribute: !1 })
], K.prototype, "blockRteValue", 1);
K = ve([
  ee(oi)
], K);
class ai {
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
class be extends Le {
  constructor(e) {
    super(e), this.#i = new ai(3), this.#t = /* @__PURE__ */ new Map(), this.#n = new Ct(void 0), this.settings = this.#n.asObservable(), this.#s = new Te(""), this.unique = this.#s.asObservable(), this.#r = new Te(""), this.documentTypeUnique = this.#r.asObservable(), this.#e = new ze(e), this.getSettings();
  }
  #e;
  #i;
  #t;
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#i;
  }
  #n;
  #s;
  #r;
  async getSettings() {
    const e = await this.#e.getSettings();
    this.#n.setValue(e);
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
      const o = new CSSStyleSheet();
      return o.replaceSync(s), o;
    });
    return this.#t.set(e, r), r;
  }
}
const ci = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: be,
  default: be
}, Symbol.toStringTag, { value: "Module" })), li = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => ci)
  }
], ui = li, hi = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], di = hi, Pi = async (t, e) => {
  t.consumeContext(lt, async (i) => {
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    f.setConfig({
      baseUrl: r?.base ?? "",
      auth: r?.token ?? void 0,
      credentials: r?.credentials ?? "same-origin"
    }), f.interceptors.request.use(async (a, l) => {
      const u = await r.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const o = await new ze(t).getSettings();
    let n = [];
    if (o) {
      if (o.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: I,
          forBlockEditor: "block-grid"
        };
        o.blockGrid.contentTypes?.length !== 0 && (a.forContentTypeAlias = o.blockGrid.contentTypes), n.push(a);
      }
      if (o.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: A,
          forBlockEditor: "block-list"
        };
        o.blockList.contentTypes?.length !== 0 && (a.forContentTypeAlias = o.blockList.contentTypes), n.push(a);
      }
      if (o.singleBlock.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.SingleBlockCustomView",
          name: "BlockPreview Single Block Custom View",
          element: q,
          forBlockEditor: "block-single"
        };
        o.singleBlock.contentTypes?.length !== 0 && (a.forContentTypeAlias = o.singleBlock.contentTypes), n.push(a);
      }
      if (o.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: K,
          forBlockEditor: "block-rte"
        };
        o.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = o.richText.contentTypes), n.push(a);
      }
    }
    e.registerMany([
      ...n,
      ...ui,
      ...di
    ]), t.provideContext(We, new be(t));
  });
};
export {
  I as BlockGridPreviewCustomView,
  A as BlockListPreviewCustomView,
  d as BlockPreviewBaseElement,
  q as BlockSinglePreviewCustomView,
  ie as PreviewDataSource,
  K as RichTextPreviewCustomView,
  Ft as SettingsDataSource,
  ze as SettingsRepository,
  Pi as onInit
};
//# sourceMappingURL=index.js.map

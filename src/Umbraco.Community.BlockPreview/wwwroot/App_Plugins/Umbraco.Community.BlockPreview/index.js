import { UMB_AUTH_CONTEXT as _t } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as wt } from "@umbraco-cms/backoffice/context-api";
import { css as pe, property as d, state as g, customElement as fe, html as S, ifDefined as be, unsafeHTML as ye } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ke } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as vt, UMB_BLOCK_GRID_MANAGER_CONTEXT as gt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as Q } from "@umbraco-cms/backoffice/content";
import { UmbLitElement as me } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as W, UmbObjectState as Ct, UmbStringState as Oe, UmbBooleanState as Et } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as _e } from "@umbraco-cms/backoffice/property";
import { tryExecute as N, UmbApiError as we } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as ve } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Tt, UMB_BLOCK_LIST_MANAGER_CONTEXT as xt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Ut, UMB_BLOCK_RTE_MANAGER_CONTEXT as qt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as At } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as De } from "@umbraco-cms/backoffice/class-api";
const St = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, i) => typeof i == "bigint" ? i.toString() : i
  )
}, Pt = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: i,
  responseTransformer: o,
  responseValidator: r,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: s,
  sseMaxRetryDelay: a,
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let f;
  const X = l ?? ((h) => new Promise((m) => setTimeout(m, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, m = 0;
    const z = c.signal ?? new AbortController().signal;
    for (; !z.aborted; ) {
      m++;
      const F = c.headers instanceof Headers ? c.headers : new Headers(c.headers);
      f !== void 0 && F.set("Last-Event-ID", f);
      try {
        const G = {
          redirect: "follow",
          ...c,
          body: c.serializedBody,
          headers: F,
          signal: z
        };
        let L = new Request(u, G);
        e && (L = await e(u, G));
        const E = await (c.fetch ?? globalThis.fetch)(L);
        if (!E.ok)
          throw new Error(
            `SSE failed: ${E.status} ${E.statusText}`
          );
        if (!E.body) throw new Error("No body in SSE response");
        const $ = E.body.pipeThrough(new TextDecoderStream()).getReader();
        let oe = "";
        const qe = () => {
          try {
            $.cancel();
          } catch {
          }
        };
        z.addEventListener("abort", qe);
        try {
          for (; ; ) {
            const { done: bt, value: yt } = await $.read();
            if (bt) break;
            oe += yt;
            const Ae = oe.split(`

`);
            oe = Ae.pop() ?? "";
            for (const kt of Ae) {
              const mt = kt.split(`
`), Y = [];
              let Se;
              for (const A of mt)
                if (A.startsWith("data:"))
                  Y.push(A.replace(/^data:\s*/, ""));
                else if (A.startsWith("event:"))
                  Se = A.replace(/^event:\s*/, "");
                else if (A.startsWith("id:"))
                  f = A.replace(/^id:\s*/, "");
                else if (A.startsWith("retry:")) {
                  const Be = Number.parseInt(
                    A.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Be) || (h = Be);
                }
              let H, Pe = !1;
              if (Y.length) {
                const A = Y.join(`
`);
                try {
                  H = JSON.parse(A), Pe = !0;
                } catch {
                  H = A;
                }
              }
              Pe && (r && await r(H), o && (H = await o(H))), i?.({
                data: H,
                event: Se,
                id: f,
                retry: h
              }), Y.length && (yield H);
            }
          }
        } finally {
          z.removeEventListener("abort", qe), $.releaseLock();
        }
        break;
      } catch (G) {
        if (t?.(G), s !== void 0 && m >= s)
          break;
        const L = Math.min(
          h * 2 ** (m - 1),
          a ?? 3e4
        );
        await X(L);
      }
    }
  }() };
}, Bt = (e) => {
  switch (e) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, Ot = (e) => {
  switch (e) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, Lt = (e) => {
  switch (e) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, Ve = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: o,
  value: r
}) => {
  if (!t) {
    const a = (e ? r : r.map((l) => encodeURIComponent(l))).join(Ot(o));
    switch (o) {
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
  const n = Bt(o), s = r.map((a) => o === "label" || o === "simple" ? e ? a : encodeURIComponent(a) : ie({
    allowReserved: e,
    name: i,
    value: a
  })).join(n);
  return o === "label" || o === "matrix" ? n + s : s;
}, ie = ({
  allowReserved: e,
  name: t,
  value: i
}) => {
  if (i == null)
    return "";
  if (typeof i == "object")
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these."
    );
  return `${t}=${e ? i : encodeURIComponent(i)}`;
}, Me = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: o,
  value: r,
  valueOnly: n
}) => {
  if (r instanceof Date)
    return n ? r.toISOString() : `${i}=${r.toISOString()}`;
  if (o !== "deepObject" && !t) {
    let l = [];
    Object.entries(r).forEach(([c, f]) => {
      l = [
        ...l,
        c,
        e ? f : encodeURIComponent(f)
      ];
    });
    const u = l.join(",");
    switch (o) {
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
  const s = Lt(o), a = Object.entries(r).map(
    ([l, u]) => ie({
      allowReserved: e,
      name: o === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(s);
  return o === "label" || o === "matrix" ? s + a : a;
}, $t = /\{[^{}]+\}/g, Dt = ({ path: e, url: t }) => {
  let i = t;
  const o = t.match($t);
  if (o)
    for (const r of o) {
      let n = !1, s = r.substring(1, r.length - 1), a = "simple";
      s.endsWith("*") && (n = !0, s = s.substring(0, s.length - 1)), s.startsWith(".") ? (s = s.substring(1), a = "label") : s.startsWith(";") && (s = s.substring(1), a = "matrix");
      const l = e[s];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(
          r,
          Ve({ explode: n, name: s, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          r,
          Me({
            explode: n,
            name: s,
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
          `;${ie({
            name: s,
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
}, Vt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: o,
  url: r
}) => {
  const n = r.startsWith("/") ? r : `/${r}`;
  let s = (e ?? "") + n;
  t && (s = Dt({ path: t, url: s }));
  let a = i ? o(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (s += `?${a}`), s;
};
function Mt(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const Nt = async (e, t) => {
  const i = typeof t == "function" ? await t(e) : t;
  if (i)
    return e.scheme === "bearer" ? `Bearer ${i}` : e.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Ne = ({
  allowReserved: e,
  array: t,
  object: i
} = {}) => (r) => {
  const n = [];
  if (r && typeof r == "object")
    for (const s in r) {
      const a = r[s];
      if (a != null)
        if (Array.isArray(a)) {
          const l = Ve({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "form",
            value: a,
            ...t
          });
          l && n.push(l);
        } else if (typeof a == "object") {
          const l = Me({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "deepObject",
            value: a,
            ...i
          });
          l && n.push(l);
        } else {
          const l = ie({
            allowReserved: e,
            name: s,
            value: a
          });
          l && n.push(l);
        }
    }
  return n.join("&");
}, Rt = (e) => {
  if (!e)
    return "stream";
  const t = e.split(";")[0]?.trim();
  if (t) {
    if (t.startsWith("application/json") || t.endsWith("+json"))
      return "json";
    if (t === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some(
      (i) => t.startsWith(i)
    ))
      return "blob";
    if (t.startsWith("text/"))
      return "text";
  }
}, Kt = (e, t) => t ? !!(e.headers.has(t) || e.query?.[t] || e.headers.get("Cookie")?.includes(`${t}=`)) : !1, It = async ({
  security: e,
  ...t
}) => {
  for (const i of e) {
    if (Kt(t, i.name))
      continue;
    const o = await Nt(i, t.auth);
    if (!o)
      continue;
    const r = i.name ?? "Authorization";
    switch (i.in) {
      case "query":
        t.query || (t.query = {}), t.query[r] = o;
        break;
      case "cookie":
        t.headers.append("Cookie", `${r}=${o}`);
        break;
      case "header":
      default:
        t.headers.set(r, o);
        break;
    }
  }
}, Le = (e) => Vt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Ne(e.querySerializer),
  url: e.url
}), $e = (e, t) => {
  const i = { ...e, ...t };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Re(e.headers, t.headers), i;
}, jt = (e) => {
  const t = [];
  return e.forEach((i, o) => {
    t.push([o, i]);
  }), t;
}, Re = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const o = i instanceof Headers ? jt(i) : Object.entries(i);
    for (const [r, n] of o)
      if (n === null)
        t.delete(r);
      else if (Array.isArray(n))
        for (const s of n)
          t.append(r, s);
      else n !== void 0 && t.set(
        r,
        typeof n == "object" ? JSON.stringify(n) : n
      );
  }
  return t;
};
class ne {
  constructor() {
    this.fns = [];
  }
  clear() {
    this.fns = [];
  }
  eject(t) {
    const i = this.getInterceptorIndex(t);
    this.fns[i] && (this.fns[i] = null);
  }
  exists(t) {
    const i = this.getInterceptorIndex(t);
    return !!this.fns[i];
  }
  getInterceptorIndex(t) {
    return typeof t == "number" ? this.fns[t] ? t : -1 : this.fns.indexOf(t);
  }
  update(t, i) {
    const o = this.getInterceptorIndex(t);
    return this.fns[o] ? (this.fns[o] = i, t) : !1;
  }
  use(t) {
    return this.fns.push(t), this.fns.length - 1;
  }
}
const Wt = () => ({
  error: new ne(),
  request: new ne(),
  response: new ne()
}), zt = Ne({
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
}, Ke = (e = {}) => ({
  ...St,
  headers: Gt,
  parseAs: "auto",
  querySerializer: zt,
  ...e
}), Ht = (e = {}) => {
  let t = $e(Ke(), e);
  const i = () => ({ ...t }), o = (u) => (t = $e(t, u), i()), r = Wt(), n = async (u) => {
    const c = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Re(t.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await It({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const f = Le(c);
    return { opts: c, url: f };
  }, s = async (u) => {
    const { opts: c, url: f } = await n(u), X = {
      redirect: "follow",
      ...c,
      body: Mt(c)
    };
    let I = new Request(f, X);
    for (const y of r.request.fns)
      y && (I = await y(I, c));
    const J = c.fetch;
    let h = await J(I);
    for (const y of r.response.fns)
      y && (h = await y(h, I, c));
    const m = {
      request: I,
      response: h
    };
    if (h.ok) {
      const y = (c.parseAs === "auto" ? Rt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let $;
        switch (y) {
          case "arrayBuffer":
          case "blob":
          case "text":
            $ = await h[y]();
            break;
          case "formData":
            $ = new FormData();
            break;
          case "stream":
            $ = h.body;
            break;
          case "json":
          default:
            $ = {};
            break;
        }
        return c.responseStyle === "data" ? $ : {
          data: $,
          ...m
        };
      }
      let E;
      switch (y) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          E = await h[y]();
          break;
        case "stream":
          return c.responseStyle === "data" ? h.body : {
            data: h.body,
            ...m
          };
      }
      return y === "json" && (c.responseValidator && await c.responseValidator(E), c.responseTransformer && (E = await c.responseTransformer(E))), c.responseStyle === "data" ? E : {
        data: E,
        ...m
      };
    }
    const z = await h.text();
    let F;
    try {
      F = JSON.parse(z);
    } catch {
    }
    const G = F ?? z;
    let L = G;
    for (const y of r.error.fns)
      y && (L = await y(G, h, I, c));
    if (L = L || {}, c.throwOnError)
      throw L;
    return c.responseStyle === "data" ? void 0 : {
      error: L,
      ...m
    };
  }, a = (u) => (c) => s({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: f, url: X } = await n(c);
    return Pt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (I, J) => {
        let h = new Request(I, J);
        for (const m of r.request.fns)
          m && (h = await m(h, f));
        return h;
      },
      url: X
    });
  };
  return {
    buildUrl: Le,
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
    request: s,
    setConfig: o,
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
}, T = Ht(Ke({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class R {
  static previewGridBlock(t) {
    return (t?.client ?? T).post({
      url: "/umbraco/block-preview/api/v1/preview/grid",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t?.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getGridStylesheet(t) {
    return (t?.client ?? T).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static getGridStylesheets(t) {
    return (t?.client ?? T).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...t
    });
  }
  static previewListBlock(t) {
    return (t?.client ?? T).post({
      url: "/umbraco/block-preview/api/v1/preview/list",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t?.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getListStylesheet(t) {
    return (t?.client ?? T).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static getListStylesheets(t) {
    return (t?.client ?? T).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return (t?.client ?? T).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t?.headers
      }
    });
  }
  /**
   * @deprecated
   */
  static getRteStylesheet(t) {
    return (t?.client ?? T).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheet",
      ...t
    });
  }
  static getRteStylesheets(t) {
    return (t?.client ?? T).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheets",
      ...t
    });
  }
  static getSettings(t) {
    return (t?.client ?? T).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const re = new wt("BlockPreviewContext");
var Xt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, Ie = (e) => {
  throw TypeError(e);
}, C = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? Ft(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (r = (o ? s(t, i, r) : s(r)) || r);
  return o && r && Xt(t, i, r), r;
}, ge = (e, t, i) => t.has(e) || Ie("Cannot " + i), D = (e, t, i) => (ge(e, t, "read from private field"), t.get(e)), se = (e, t, i) => t.has(e) ? Ie("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), je = (e, t, i, o) => (ge(e, t, "write to private field"), t.set(e, i), i), B = (e, t, i) => (ge(e, t, "access private method"), i), x, Z, _, We, ze, Ge, He, le, Xe, Fe, Je, Ce;
const Jt = "block-grid-preview";
let b = class extends me {
  constructor() {
    super(), se(this, _), se(this, x), se(this, Z), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(re, async (e) => {
      je(this, x, e), await B(this, _, We).call(this);
    });
  }
  set blockGridValue(e) {
    const t = e ? { ...e } : {};
    t.layout ??= {}, t.contentData ??= [], t.settingsData ??= [], t.expose ??= [], this._blockGridValue = t;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  connectedCallback() {
    super.connectedCallback(), this._isConnected = !0;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._isConnected = !1, this._previewTimeout && (clearTimeout(this._previewTimeout), this._previewTimeout = void 0);
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      B(this, _, Fe).call(this);
    }, 500));
  }
  _filterLayouts() {
    return [
      {
        areas: this._blockContext.areas.map((i) => ({
          key: i.key,
          items: this._blockContext.layoutAreas?.find((r) => r.key == i.key)?.items
        })),
        columnSpan: this._blockContext.layout?.columnSpan ?? 0,
        rowSpan: this._blockContext.layout?.rowSpan ?? 0,
        contentKey: this._blockContext.layout?.contentKey ?? "",
        settingsKey: this._blockContext.layout?.settingsKey
      }
    ];
  }
  _handleClick(e) {
    const t = e.composedPath();
    if (t.some((r) => r instanceof Element && r.tagName === "UMB-BLOCK-OVERLAY-EXPOSE-BUTTON")) {
      e.preventDefault(), e.stopPropagation();
      return;
    }
    const i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((r) => r instanceof Element && i.includes(r.tagName))) {
      if (t.find((n) => n instanceof ve && n.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (t.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const r = t.find((n) => n instanceof Element && n.tagName === "A" && n.classList.contains("block-preview-edit"));
      r instanceof Element ? window.history.pushState({}, "", r.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return S`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return S`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return S`
                    ${this._styleElements}
                     <a
                         href=${be(this._blockContext.workspaceEditContentPath)}
                         @click=${this._handleClick}
                         aria-label="Edit block"
                         class="block-preview-edit"
                         role="button"
                     >
                        ${ye(this._htmlMarkup)}
                    </a>
                `;
    } else return S`<umb-block-grid-block
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
x = /* @__PURE__ */ new WeakMap();
Z = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakSet();
We = async function() {
  B(this, _, ze).call(this), B(this, _, Ge).call(this), await B(this, _, He).call(this);
};
ze = function() {
  this.observe(D(this, x)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
Ge = function() {
  this.consumeContext(_e, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
He = async function() {
  try {
    await this.getContext(Q), this.consumeContext(Q, (e) => {
      e && (je(this, Z, e), this.observe(
        W([e.unique, e.structure.contentTypeUniques]),
        async ([t, i]) => {
          const o = i?.[0];
          if (!this._isConnected || !o)
            return;
          this._blockContext.unique = t?.toString() ?? "", D(this, x)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = o, D(this, x)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), B(this, _, le).call(this);
          const { data: r } = await N(this, R.getGridStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((n) => {
            const s = document.createElement("link");
            return s.rel = "stylesheet", s.href = n, s;
          }));
        }
      ));
    });
  } catch {
    D(this, Z) == null && D(this, x) != null && this._blockContext.unique == "" && this.consumeContext(ke, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const o = i[0];
        if (!this._isConnected || !o)
          return;
        this._blockContext.unique = D(this, x)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = B(this, _, Ce).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = o, B(this, _, le).call(this);
        const { data: r } = await N(this, R.getGridStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        r && r.length > 0 && (this._styleElements = r.map((n) => {
          const s = document.createElement("link");
          return s.rel = "stylesheet", s.href = n, s;
        }));
      });
    });
  }
};
le = async function() {
  this.consumeContext(vt, async (e) => {
    e && this.observe(
      W([
        e.contentKey,
        e.settingsKey,
        e.workspaceEditContentPath,
        e.contentElementTypeAlias,
        e.contentElementTypeKey,
        e.areas,
        e.layout,
        e.layoutAreas
      ]),
      async ([
        t,
        i,
        o,
        r,
        n,
        s,
        a,
        l
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = s, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await B(this, _, Xe).call(this);
      }
    );
  });
};
Xe = async function() {
  this.consumeContext(gt, (e) => {
    e && this.observe(
      W([
        e.contents,
        e.settings,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, i, o, r]) => {
        this._blockContext.blockEditorAlias = r ?? "", this.blockGridValue = {
          contentData: t ?? [],
          settingsData: i ?? [],
          expose: o ?? [],
          layout: { "Umbraco.BlockGrid": this._filterLayouts() }
        }, this._blockContext.blockIndex = t.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
Fe = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (D(this, x) != null && e.unique == "" && (e.unique = D(this, x).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = B(this, _, Ce).call(this, e.workspaceEditContentPath))), D(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = D(this, x).getDocumentTypeUnique()), !B(this, _, Je).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await N(this, R.previewGridBlock({
      body: JSON.stringify(this.blockGridValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        contentUdi: e.contentUdi,
        settingsUdi: e.settingsUdi,
        culture: e.culture,
        blockIndex: e.blockIndex
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = we.isUmbApiError(o) ? o.message : "An error occurred rendering the block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Je = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
Ce = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
b.styles = [
  pe`
      :host {
        display: block;
        height: 100%;
      }

      a.block-preview-edit {
        display: block;
        height: 100%;
        color: inherit;
        text-decoration: inherit;
        border:1px solid transparent;
        border-radius:2px;
      }

      a.block-preview-edit:hover {
        border-color: var(--uui-color-interactive-emphasis, #3544b1);
      }

      .preview-alert {
        background-color: var(--uui-color-danger, #f0ac00);
        border:1px solid transparent;
        border-radius:0;
        margin-bottom:20px;
        padding:8px 35px 8px 14px;
        position: relative;

        &, a, h4 {
          color: #fff;
        }

        pre {
          white-space: normal;
        }

        uui-loader {
          margin-right:16px;
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

      .preview-alert-danger,
      .preview-alert-error {
        background-color: var(--uui-color-danger, #f0ac00);
        border-color: transparent;
        color: #fff;
      }
    `
];
C([
  d({ attribute: !1 })
], b.prototype, "content", 2);
C([
  d({ attribute: !1 })
], b.prototype, "settings", 2);
C([
  d({ attribute: !1 })
], b.prototype, "contentKey", 2);
C([
  d({ attribute: !1 })
], b.prototype, "config", 2);
C([
  d({ attribute: !1 })
], b.prototype, "unpublished", 2);
C([
  d({ attribute: !1 })
], b.prototype, "icon", 2);
C([
  d({ attribute: !1 })
], b.prototype, "label", 2);
C([
  g()
], b.prototype, "_htmlMarkup", 2);
C([
  g()
], b.prototype, "_isLoading", 2);
C([
  g()
], b.prototype, "_error", 2);
C([
  g()
], b.prototype, "_sortModeActive", 2);
C([
  d({ attribute: !1 })
], b.prototype, "blockGridValue", 1);
b = C([
  fe(Jt)
], b);
var Yt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, Ye = (e) => {
  throw TypeError(e);
}, k = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? Qt(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (r = (o ? s(t, i, r) : s(r)) || r);
  return o && r && Yt(t, i, r), r;
}, Ee = (e, t, i) => t.has(e) || Ye("Cannot " + i), V = (e, t, i) => (Ee(e, t, "read from private field"), t.get(e)), ae = (e, t, i) => t.has(e) ? Ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qe = (e, t, i, o) => (Ee(e, t, "write to private field"), t.set(e, i), i), O = (e, t, i) => (Ee(e, t, "access private method"), i), U, ee, w, Ze, et, tt, it, ue, rt, ot, nt, Te;
const Zt = "block-list-preview";
let p = class extends me {
  constructor() {
    super(), ae(this, w), ae(this, U), ae(this, ee), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(re, async (e) => {
      Qe(this, U, e), await O(this, w, Ze).call(this);
    });
  }
  set blockListValue(e) {
    const t = e ? { ...e } : {};
    t.layout ??= {}, t.contentData ??= [], t.settingsData ??= [], t.expose ??= [], this._blockListValue = t;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  connectedCallback() {
    super.connectedCallback(), this._isConnected = !0;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._isConnected = !1, this._previewTimeout && (clearTimeout(this._previewTimeout), this._previewTimeout = void 0);
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      O(this, w, ot).call(this);
    }, 500));
  }
  _handleClick(e) {
    const t = e.composedPath();
    if (t.some((r) => r instanceof Element && r.tagName === "UMB-BLOCK-OVERLAY-EXPOSE-BUTTON")) {
      e.preventDefault(), e.stopPropagation();
      return;
    }
    const i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((r) => r instanceof Element && i.includes(r.tagName))) {
      if (t.find((n) => n instanceof ve && n.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (t.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const r = t.find((n) => n instanceof Element && n.tagName === "A" && n.classList.contains("block-preview-edit"));
      r instanceof Element ? window.history.pushState({}, "", r.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return S`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return S`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return S`
                    ${this._styleElements}
                    <a
                        href=${be(this._blockContext.workspaceEditContentPath)}
                        @click=${this._handleClick}
                        aria-label="Edit block"
                        class="block-preview-edit"
                        role="button"
                    >
                        ${ye(this._htmlMarkup)}
                    </a>
                `;
    } else return S`<umb-ref-list-block
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
U = /* @__PURE__ */ new WeakMap();
ee = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakSet();
Ze = async function() {
  O(this, w, et).call(this), O(this, w, tt).call(this), await O(this, w, it).call(this);
};
et = function() {
  this.observe(V(this, U)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
tt = function() {
  this.consumeContext(_e, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
it = async function() {
  try {
    await this.getContext(Q), this.consumeContext(Q, (e) => {
      e && (Qe(this, ee, e), this.observe(
        W([e.unique, e.structure.contentTypeUniques]),
        async ([t, i]) => {
          const o = i?.[0];
          if (!this._isConnected || !o)
            return;
          this._blockContext.unique = t?.toString() ?? "", V(this, U)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = o, V(this, U)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), O(this, w, ue).call(this);
          const { data: r } = await N(this, R.getListStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((n) => {
            const s = document.createElement("link");
            return s.rel = "stylesheet", s.href = n, s;
          }));
        }
      ));
    });
  } catch {
    V(this, ee) == null && V(this, U) != null && this._blockContext.unique == "" && this.consumeContext(ke, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const o = i[0];
        if (!this._isConnected || !o)
          return;
        this._blockContext.unique = V(this, U)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = O(this, w, Te).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = o, O(this, w, ue).call(this);
        const { data: r } = await N(this, R.getListStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        r && r.length > 0 && (this._styleElements = r.map((n) => {
          const s = document.createElement("link");
          return s.rel = "stylesheet", s.href = n, s;
        }));
      });
    });
  }
};
ue = function() {
  this.consumeContext(Tt, (e) => {
    e && this.observe(
      W([
        e.contentKey,
        e.settingsKey,
        e.workspaceEditContentPath,
        e.contentElementTypeAlias,
        e.contentElementTypeKey
      ]),
      async ([
        t,
        i,
        o,
        r,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await O(this, w, rt).call(this);
      }
    );
  });
};
rt = function() {
  this.consumeContext(xt, (e) => {
    e && this.observe(
      W([
        e.contents,
        e.settings,
        e.layouts,
        e.exposes,
        e.propertyAlias
      ]),
      async ([
        t,
        i,
        o,
        r,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: t?.filter((s) => s.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((s) => s.key == this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((s) => s.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": o?.filter((s) => s.contentKey == this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = t?.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
ot = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (V(this, U) != null && e.unique == "" && (e.unique = V(this, U).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = O(this, w, Te).call(this, e.workspaceEditContentPath))), V(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = V(this, U).getDocumentTypeUnique()), !O(this, w, nt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await N(this, R.previewListBlock({
      body: JSON.stringify(this.blockListValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        contentUdi: e.contentUdi,
        settingsUdi: e.settingsUdi,
        culture: e.culture,
        blockIndex: e.blockIndex
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = we.isUmbApiError(o) ? o.message : "An error occurred rendering the block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
nt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
Te = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
p.styles = [
  pe`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
              display: block;
              height: 100%;
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
k([
  d({ attribute: !1 })
], p.prototype, "content", 2);
k([
  d({ attribute: !1 })
], p.prototype, "settings", 2);
k([
  d({ attribute: !1 })
], p.prototype, "contentKey", 2);
k([
  d({ attribute: !1 })
], p.prototype, "config", 2);
k([
  d({ attribute: !1 })
], p.prototype, "unpublished", 2);
k([
  d({ attribute: !1 })
], p.prototype, "icon", 2);
k([
  d({ attribute: !1 })
], p.prototype, "label", 2);
k([
  g()
], p.prototype, "_htmlMarkup", 2);
k([
  g()
], p.prototype, "_isLoading", 2);
k([
  g()
], p.prototype, "_error", 2);
k([
  g()
], p.prototype, "_sortModeActive", 2);
k([
  g()
], p.prototype, "_blockListValue", 2);
k([
  d({ attribute: !1 })
], p.prototype, "blockListValue", 1);
p = k([
  fe(Zt)
], p);
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, st = (e) => {
  throw TypeError(e);
}, K = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? ti(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (r = (o ? s(t, i, r) : s(r)) || r);
  return o && r && ei(t, i, r), r;
}, xe = (e, t, i) => t.has(e) || st("Cannot " + i), j = (e, t, i) => (xe(e, t, "read from private field"), t.get(e)), ce = (e, t, i) => t.has(e) ? st("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), at = (e, t, i, o) => (xe(e, t, "write to private field"), t.set(e, i), i), M = (e, t, i) => (xe(e, t, "access private method"), i), P, te, q, ct, lt, ut, he, ht, dt, pt, Ue;
const ii = "rich-text-preview";
let v = class extends me {
  constructor() {
    super(), ce(this, q), ce(this, P), ce(this, te), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._isConnected = !1, this._blockContext = {
      unique: "",
      documentTypeUnique: "",
      contentUdi: "",
      settingsUdi: "",
      blockEditorAlias: "",
      culture: "",
      workspaceEditContentPath: "",
      contentElementTypeAlias: "",
      contentElementTypeKey: ""
    }, this._blockRteValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, this.consumeContext(re, (e) => {
      at(this, P, e), M(this, q, ct).call(this);
    });
  }
  set blockRteValue(e) {
    const t = e ? { ...e } : {};
    t.layout ??= {}, t.contentData ??= [], t.settingsData ??= [], t.expose ??= [], this._blockRteValue = t;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  connectedCallback() {
    super.connectedCallback(), this._isConnected = !0;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._isConnected = !1, this._previewTimeout && (clearTimeout(this._previewTimeout), this._previewTimeout = void 0);
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      M(this, q, dt).call(this);
    }, 500));
  }
  _handleClick(e) {
    const t = e.composedPath();
    if (t.some((r) => r instanceof Element && r.tagName === "UMB-BLOCK-OVERLAY-EXPOSE-BUTTON")) {
      e.preventDefault(), e.stopPropagation();
      return;
    }
    const i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((r) => r instanceof Element && i.includes(r.tagName))) {
      if (t.find((n) => n instanceof ve && n.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (t.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const r = t.find((n) => n instanceof Element && n.tagName === "A" && n.classList.contains("block-preview-edit"));
      r instanceof Element ? window.history.pushState({}, "", r.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  render() {
    if (this._isLoading)
      return S`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
    if (this._error)
      return S`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return S`
                ${this._styleElements}
                <a
                    href=${be(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${ye(this._htmlMarkup)}
                </a>`;
  }
};
P = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakSet();
ct = function() {
  M(this, q, lt).call(this), M(this, q, ut).call(this);
};
lt = function() {
  this.consumeContext(_e, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ut = function() {
  this.consumeContext(At, (e) => {
    e && (at(this, te, e), this.observe(
      W([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        if (!this._isConnected || !i)
          return;
        this._blockContext.unique = t?.toString() ?? "", j(this, P)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, j(this, P)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), M(this, q, he).call(this);
        const { data: o } = await N(this, R.getRteStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        o && o.length > 0 && (this._styleElements = o.map((r) => {
          const n = document.createElement("link");
          return n.rel = "stylesheet", n.href = r, n;
        }));
      }
    ));
  }), j(this, te) == null && j(this, P) != null && this._blockContext.unique == "" && this.consumeContext(ke, async (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, async (t) => {
      const i = t[0];
      if (!this._isConnected || !i)
        return;
      this._blockContext.unique = j(this, P)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = M(this, q, Ue).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i, M(this, q, he).call(this);
      const { data: o } = await N(this, R.getRteStylesheets({
        query: {
          documentTypeUnique: this._blockContext.documentTypeUnique,
          nodeKey: this._blockContext.unique
        }
      }));
      o && o.length > 0 && (this._styleElements = o.map((r) => {
        const n = document.createElement("link");
        return n.rel = "stylesheet", n.href = r, n;
      }));
    });
  });
};
he = function() {
  this.consumeContext(Ut, (e) => {
    e != null && this.observe(
      W([
        e.contentKey,
        e.settingsKey,
        e.workspaceEditContentPath,
        e.contentElementTypeAlias,
        e.contentElementTypeKey
      ]),
      async ([
        t,
        i,
        o,
        r,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await M(this, q, ht).call(this);
      }
    );
  });
};
ht = function() {
  this.consumeContext(qt, (e) => {
    e != null && this.observe(
      W([
        e.contents,
        e.settings,
        e.layouts,
        e.exposes,
        e.propertyAlias
      ]),
      async ([
        t,
        i,
        o,
        r,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: t?.filter((s) => s.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((s) => s.key == this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((s) => s.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": o?.filter((s) => s.contentKey == this._blockContext.contentUdi) ?? []
          }
        };
      }
    );
  });
};
dt = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (j(this, P) != null && e.unique == "" && (e.unique = j(this, P).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = M(this, q, Ue).call(this, e.workspaceEditContentPath))), j(this, P) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = j(this, P).getDocumentTypeUnique()), !M(this, q, pt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await N(this, R.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = we.isUmbApiError(o) ? o.message : "An error occurred rendering the block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
pt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
Ue = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
v.styles = [
  pe`
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
K([
  d({ attribute: !1 })
], v.prototype, "content", 2);
K([
  d({ attribute: !1 })
], v.prototype, "settings", 2);
K([
  d({ attribute: !1 })
], v.prototype, "contentKey", 2);
K([
  d({ attribute: !1 })
], v.prototype, "config", 2);
K([
  g()
], v.prototype, "_htmlMarkup", 2);
K([
  g()
], v.prototype, "_isLoading", 2);
K([
  g()
], v.prototype, "_error", 2);
K([
  g()
], v.prototype, "_blockRteValue", 2);
K([
  d({ attribute: !1 })
], v.prototype, "blockRteValue", 1);
v = K([
  fe(ii)
], v);
class de extends De {
  constructor(t) {
    super(t), this.#o = new Ct(void 0), this.settings = this.#o.asObservable(), this.#t = new Oe(""), this.unique = this.#t.asObservable(), this.#i = new Oe(""), this.documentTypeUnique = this.#i.asObservable(), this.#r = new Et(!1), this.sortModeActive = this.#r.asObservable(), this.#e = new ft(t), this.getSettings(), this.setSortMode(!1);
  }
  #e;
  #o;
  #t;
  #i;
  #r;
  async getSettings() {
    const t = await this.#e.getSettings();
    this.#o.setValue(t);
  }
  getUnique() {
    return this.#t.getValue();
  }
  async setUnique(t) {
    t != "" && this.#t.setValue(t);
  }
  getDocumentTypeUnique() {
    return this.#i.getValue();
  }
  async setDocumentTypeUnique(t) {
    t != "" && this.#i.setValue(t);
  }
  getSortMode() {
    return this.#r.getValue();
  }
  async setSortMode(t) {
    this.#r.setValue(t);
  }
}
const ri = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: de,
  default: de
}, Symbol.toStringTag, { value: "Module" })), oi = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => ri)
  }
], ni = [...oi];
class si {
  #e;
  constructor(t) {
    this.#e = t;
  }
  async getSettings() {
    return await N(this.#e, R.getSettings());
  }
}
class ft extends De {
  #e;
  constructor(t) {
    super(t), this.#e = new si(t);
  }
  async getSettings() {
    const t = await this.#e.getSettings();
    if (t && t?.data)
      return t.data;
  }
}
const gi = async (e, t) => {
  e.consumeContext(_t, async (i) => {
    if (!i) return;
    const o = i.getOpenApiConfiguration();
    T.setConfig({
      baseUrl: o?.base ?? "",
      auth: o?.token ?? void 0,
      credentials: o?.credentials ?? "same-origin"
    }), T.interceptors.request.use(async (a, l) => {
      const u = await o.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new ft(e).getSettings();
    let s = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: b,
          forBlockEditor: "block-grid"
        };
        n.blockGrid.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockGrid.contentTypes), s.push(a);
      }
      if (n.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        n.blockList.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockList.contentTypes), s.push(a);
      }
      if (n.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: v,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), s.push(a);
      }
    }
    t.registerMany([
      ...s,
      ...ni
    ]), e.provideContext(re, new de(e));
  });
};
export {
  b as BlockGridPreviewCustomView,
  p as BlockListPreviewCustomView,
  v as RichTextPreviewCustomView,
  si as SettingsDataSource,
  ft as SettingsRepository,
  gi as onInit
};
//# sourceMappingURL=index.js.map

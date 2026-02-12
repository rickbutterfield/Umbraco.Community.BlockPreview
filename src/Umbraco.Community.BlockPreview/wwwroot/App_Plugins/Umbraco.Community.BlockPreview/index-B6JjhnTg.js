import { UMB_AUTH_CONTEXT as vt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as gt } from "@umbraco-cms/backoffice/context-api";
import { css as fe, property as d, state as g, customElement as be, html as S, ifDefined as ye, unsafeHTML as ke } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as me } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ct, UMB_BLOCK_GRID_MANAGER_CONTEXT as Tt, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as Et } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as Q } from "@umbraco-cms/backoffice/content";
import { UmbLitElement as _e } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as j, UmbObjectState as xt, UmbStringState as Le, UmbBooleanState as Ut } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as we, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as $e } from "@umbraco-cms/backoffice/property";
import { tryExecute as R, UmbApiError as ve } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as ge } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as qt, UMB_BLOCK_LIST_MANAGER_CONTEXT as At, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as St } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Pt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Bt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Ot } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as Ve } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as Lt } from "@umbraco-cms/backoffice/property-action";
const $t = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, i) => typeof i == "bigint" ? i.toString() : i
  )
}, Mt = ({
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
  const F = l ?? ((h) => new Promise((m) => setTimeout(m, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, m = 0;
    const z = c.signal ?? new AbortController().signal;
    for (; !z.aborted; ) {
      m++;
      const X = c.headers instanceof Headers ? c.headers : new Headers(c.headers);
      f !== void 0 && X.set("Last-Event-ID", f);
      try {
        const G = {
          redirect: "follow",
          ...c,
          body: c.serializedBody,
          headers: X,
          signal: z
        };
        let L = new Request(u, G);
        e && (L = await e(u, G));
        const T = await (c.fetch ?? globalThis.fetch)(L);
        if (!T.ok)
          throw new Error(
            `SSE failed: ${T.status} ${T.statusText}`
          );
        if (!T.body) throw new Error("No body in SSE response");
        const $ = T.body.pipeThrough(new TextDecoderStream()).getReader();
        let oe = "";
        const Ae = () => {
          try {
            $.cancel();
          } catch {
          }
        };
        z.addEventListener("abort", Ae);
        try {
          for (; ; ) {
            const { done: kt, value: mt } = await $.read();
            if (kt) break;
            oe += mt;
            const Se = oe.split(`

`);
            oe = Se.pop() ?? "";
            for (const _t of Se) {
              const wt = _t.split(`
`), J = [];
              let Pe;
              for (const A of wt)
                if (A.startsWith("data:"))
                  J.push(A.replace(/^data:\s*/, ""));
                else if (A.startsWith("event:"))
                  Pe = A.replace(/^event:\s*/, "");
                else if (A.startsWith("id:"))
                  f = A.replace(/^id:\s*/, "");
                else if (A.startsWith("retry:")) {
                  const Oe = Number.parseInt(
                    A.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Oe) || (h = Oe);
                }
              let H, Be = !1;
              if (J.length) {
                const A = J.join(`
`);
                try {
                  H = JSON.parse(A), Be = !0;
                } catch {
                  H = A;
                }
              }
              Be && (r && await r(H), o && (H = await o(H))), i?.({
                data: H,
                event: Pe,
                id: f,
                retry: h
              }), J.length && (yield H);
            }
          }
        } finally {
          z.removeEventListener("abort", Ae), $.releaseLock();
        }
        break;
      } catch (G) {
        if (t?.(G), s !== void 0 && m >= s)
          break;
        const L = Math.min(
          h * 2 ** (m - 1),
          a ?? 3e4
        );
        await F(L);
      }
    }
  }() };
}, Dt = (e) => {
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
}, Vt = (e) => {
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
}, Rt = (e) => {
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
}, Re = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: o,
  value: r
}) => {
  if (!t) {
    const a = (e ? r : r.map((l) => encodeURIComponent(l))).join(Vt(o));
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
  const n = Dt(o), s = r.map((a) => o === "label" || o === "simple" ? e ? a : encodeURIComponent(a) : ie({
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
}, Ie = ({
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
  const s = Rt(o), a = Object.entries(r).map(
    ([l, u]) => ie({
      allowReserved: e,
      name: o === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(s);
  return o === "label" || o === "matrix" ? s + a : a;
}, It = /\{[^{}]+\}/g, Nt = ({ path: e, url: t }) => {
  let i = t;
  const o = t.match(It);
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
          Re({ explode: n, name: s, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          r,
          Ie({
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
}, Kt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: o,
  url: r
}) => {
  const n = r.startsWith("/") ? r : `/${r}`;
  let s = (e ?? "") + n;
  t && (s = Nt({ path: t, url: s }));
  let a = i ? o(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (s += `?${a}`), s;
};
function Wt(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const jt = async (e, t) => {
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
          const l = Re({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "form",
            value: a,
            ...t
          });
          l && n.push(l);
        } else if (typeof a == "object") {
          const l = Ie({
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
}, zt = (e) => {
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
}, Gt = (e, t) => t ? !!(e.headers.has(t) || e.query?.[t] || e.headers.get("Cookie")?.includes(`${t}=`)) : !1, Ht = async ({
  security: e,
  ...t
}) => {
  for (const i of e) {
    if (Gt(t, i.name))
      continue;
    const o = await jt(i, t.auth);
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
}, Me = (e) => Kt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Ne(e.querySerializer),
  url: e.url
}), De = (e, t) => {
  const i = { ...e, ...t };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Ke(e.headers, t.headers), i;
}, Ft = (e) => {
  const t = [];
  return e.forEach((i, o) => {
    t.push([o, i]);
  }), t;
}, Ke = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const o = i instanceof Headers ? Ft(i) : Object.entries(i);
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
const Xt = () => ({
  error: new ne(),
  request: new ne(),
  response: new ne()
}), Yt = Ne({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), Jt = {
  "Content-Type": "application/json"
}, We = (e = {}) => ({
  ...$t,
  headers: Jt,
  parseAs: "auto",
  querySerializer: Yt,
  ...e
}), Qt = (e = {}) => {
  let t = De(We(), e);
  const i = () => ({ ...t }), o = (u) => (t = De(t, u), i()), r = Xt(), n = async (u) => {
    const c = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Ke(t.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await Ht({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const f = Me(c);
    return { opts: c, url: f };
  }, s = async (u) => {
    const { opts: c, url: f } = await n(u), F = {
      redirect: "follow",
      ...c,
      body: Wt(c)
    };
    let K = new Request(f, F);
    for (const y of r.request.fns)
      y && (K = await y(K, c));
    const Y = c.fetch;
    let h = await Y(K);
    for (const y of r.response.fns)
      y && (h = await y(h, K, c));
    const m = {
      request: K,
      response: h
    };
    if (h.ok) {
      const y = (c.parseAs === "auto" ? zt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
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
      let T;
      switch (y) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          T = await h[y]();
          break;
        case "stream":
          return c.responseStyle === "data" ? h.body : {
            data: h.body,
            ...m
          };
      }
      return y === "json" && (c.responseValidator && await c.responseValidator(T), c.responseTransformer && (T = await c.responseTransformer(T))), c.responseStyle === "data" ? T : {
        data: T,
        ...m
      };
    }
    const z = await h.text();
    let X;
    try {
      X = JSON.parse(z);
    } catch {
    }
    const G = X ?? z;
    let L = G;
    for (const y of r.error.fns)
      y && (L = await y(G, h, K, c));
    if (L = L || {}, c.throwOnError)
      throw L;
    return c.responseStyle === "data" ? void 0 : {
      error: L,
      ...m
    };
  }, a = (u) => (c) => s({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: f, url: F } = await n(c);
    return Mt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (K, Y) => {
        let h = new Request(K, Y);
        for (const m of r.request.fns)
          m && (h = await m(h, f));
        return h;
      },
      url: F
    });
  };
  return {
    buildUrl: Me,
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
}, E = Qt(We({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class I {
  static previewGridBlock(t) {
    return (t?.client ?? E).post({
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
    return (t?.client ?? E).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static getGridStylesheets(t) {
    return (t?.client ?? E).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...t
    });
  }
  static previewListBlock(t) {
    return (t?.client ?? E).post({
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
    return (t?.client ?? E).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static getListStylesheets(t) {
    return (t?.client ?? E).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return (t?.client ?? E).post({
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
    return (t?.client ?? E).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheet",
      ...t
    });
  }
  static getRteStylesheets(t) {
    return (t?.client ?? E).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheets",
      ...t
    });
  }
  static getSettings(t) {
    return (t?.client ?? E).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const re = new gt("BlockPreviewContext");
var Zt = Object.defineProperty, ei = Object.getOwnPropertyDescriptor, je = (e) => {
  throw TypeError(e);
}, C = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? ei(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (r = (o ? s(t, i, r) : s(r)) || r);
  return o && r && Zt(t, i, r), r;
}, Ce = (e, t, i) => t.has(e) || je("Cannot " + i), M = (e, t, i) => (Ce(e, t, "read from private field"), t.get(e)), se = (e, t, i) => t.has(e) ? je("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ze = (e, t, i, o) => (Ce(e, t, "write to private field"), t.set(e, i), i), B = (e, t, i) => (Ce(e, t, "access private method"), i), x, Z, _, Ge, He, Fe, Xe, le, Ye, Je, Qe, Te;
const ti = "block-grid-preview";
let b = class extends _e {
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
      ze(this, x, e), await B(this, _, Ge).call(this);
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
      B(this, _, Je).call(this);
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
    const t = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((r) => r instanceof Element && i.includes(r.tagName))) {
      if (t.find((n) => n instanceof ge && n.href?.includes("block/edit")))
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
                         href=${ye(this._blockContext.workspaceEditContentPath)}
                         @click=${this._handleClick}
                         aria-label="Edit block"
                         class="block-preview-edit"
                         role="button"
                     >
                        ${ke(this._htmlMarkup)}
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
Ge = async function() {
  B(this, _, He).call(this), B(this, _, Fe).call(this), await B(this, _, Xe).call(this);
};
He = function() {
  this.observe(M(this, x)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
Fe = function() {
  this.consumeContext(we, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
Xe = async function() {
  try {
    await this.getContext(Q), this.consumeContext(Q, (e) => {
      e && (ze(this, Z, e), this.observe(
        j([e.unique, e.structure.contentTypeUniques]),
        async ([t, i]) => {
          const o = i?.[0];
          if (!this._isConnected || !o)
            return;
          this._blockContext.unique = t?.toString() ?? "", M(this, x)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = o, M(this, x)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), B(this, _, le).call(this);
          const { data: r } = await R(this, I.getGridStylesheets({
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
    M(this, Z) == null && M(this, x) != null && this._blockContext.unique == "" && this.consumeContext(me, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const o = i[0];
        if (!this._isConnected || !o)
          return;
        this._blockContext.unique = M(this, x)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = B(this, _, Te).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = o, B(this, _, le).call(this);
        const { data: r } = await R(this, I.getGridStylesheets({
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
  this.consumeContext(Ct, async (e) => {
    e && this.observe(
      j([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = s, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await B(this, _, Ye).call(this);
      }
    );
  });
};
Ye = async function() {
  this.consumeContext(Tt, (e) => {
    e && this.observe(
      j([
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
Je = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (M(this, x) != null && e.unique == "" && (e.unique = M(this, x).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = B(this, _, Te).call(this, e.workspaceEditContentPath))), M(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = M(this, x).getDocumentTypeUnique()), !B(this, _, Qe).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await R(this, I.previewGridBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = ve.isUmbApiError(o) ? o.message : "An error occurred rendering the block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Qe = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
Te = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
b.styles = [
  fe`
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
  be(ti)
], b);
var ii = Object.defineProperty, ri = Object.getOwnPropertyDescriptor, Ze = (e) => {
  throw TypeError(e);
}, k = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? ri(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (r = (o ? s(t, i, r) : s(r)) || r);
  return o && r && ii(t, i, r), r;
}, Ee = (e, t, i) => t.has(e) || Ze("Cannot " + i), D = (e, t, i) => (Ee(e, t, "read from private field"), t.get(e)), ae = (e, t, i) => t.has(e) ? Ze("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), et = (e, t, i, o) => (Ee(e, t, "write to private field"), t.set(e, i), i), O = (e, t, i) => (Ee(e, t, "access private method"), i), U, ee, w, tt, it, rt, ot, ue, nt, st, at, xe;
const oi = "block-list-preview";
let p = class extends _e {
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
      et(this, U, e), await O(this, w, tt).call(this);
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
      O(this, w, st).call(this);
    }, 500));
  }
  _handleClick(e) {
    const t = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((r) => r instanceof Element && i.includes(r.tagName))) {
      if (t.find((n) => n instanceof ge && n.href?.includes("block/edit")))
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
                        href=${ye(this._blockContext.workspaceEditContentPath)}
                        @click=${this._handleClick}
                        aria-label="Edit block"
                        class="block-preview-edit"
                        role="button"
                    >
                        ${ke(this._htmlMarkup)}
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
tt = async function() {
  O(this, w, it).call(this), O(this, w, rt).call(this), await O(this, w, ot).call(this);
};
it = function() {
  this.observe(D(this, U)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
rt = function() {
  this.consumeContext(we, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ot = async function() {
  try {
    await this.getContext(Q), this.consumeContext(Q, (e) => {
      e && (et(this, ee, e), this.observe(
        j([e.unique, e.structure.contentTypeUniques]),
        async ([t, i]) => {
          const o = i?.[0];
          if (!this._isConnected || !o)
            return;
          this._blockContext.unique = t?.toString() ?? "", D(this, U)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = o, D(this, U)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), O(this, w, ue).call(this);
          const { data: r } = await R(this, I.getListStylesheets({
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
    D(this, ee) == null && D(this, U) != null && this._blockContext.unique == "" && this.consumeContext(me, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const o = i[0];
        if (!this._isConnected || !o)
          return;
        this._blockContext.unique = D(this, U)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = O(this, w, xe).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = o, O(this, w, ue).call(this);
        const { data: r } = await R(this, I.getListStylesheets({
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
  this.consumeContext(qt, (e) => {
    e && this.observe(
      j([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await O(this, w, nt).call(this);
      }
    );
  });
};
nt = function() {
  this.consumeContext(At, (e) => {
    e && this.observe(
      j([
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
st = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (D(this, U) != null && e.unique == "" && (e.unique = D(this, U).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = O(this, w, xe).call(this, e.workspaceEditContentPath))), D(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = D(this, U).getDocumentTypeUnique()), !O(this, w, at).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await R(this, I.previewListBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = ve.isUmbApiError(o) ? o.message : "An error occurred rendering the block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
at = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
xe = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
p.styles = [
  fe`
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
  be(oi)
], p);
var ni = Object.defineProperty, si = Object.getOwnPropertyDescriptor, ct = (e) => {
  throw TypeError(e);
}, N = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? si(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (r = (o ? s(t, i, r) : s(r)) || r);
  return o && r && ni(t, i, r), r;
}, Ue = (e, t, i) => t.has(e) || ct("Cannot " + i), W = (e, t, i) => (Ue(e, t, "read from private field"), t.get(e)), ce = (e, t, i) => t.has(e) ? ct("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), lt = (e, t, i, o) => (Ue(e, t, "write to private field"), t.set(e, i), i), V = (e, t, i) => (Ue(e, t, "access private method"), i), P, te, q, ut, ht, dt, he, pt, ft, bt, qe;
const ai = "rich-text-preview";
let v = class extends _e {
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
      lt(this, P, e), V(this, q, ut).call(this);
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
      V(this, q, ft).call(this);
    }, 500));
  }
  _handleClick(e) {
    const t = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((r) => r instanceof Element && i.includes(r.tagName))) {
      if (t.find((n) => n instanceof ge && n.href?.includes("block/edit")))
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
                    href=${ye(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${ke(this._htmlMarkup)}
                </a>`;
  }
};
P = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakSet();
ut = function() {
  V(this, q, ht).call(this), V(this, q, dt).call(this);
};
ht = function() {
  this.consumeContext(we, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
dt = function() {
  this.consumeContext(Ot, (e) => {
    e && (lt(this, te, e), this.observe(
      j([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        if (!this._isConnected || !i)
          return;
        this._blockContext.unique = t?.toString() ?? "", W(this, P)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, W(this, P)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), V(this, q, he).call(this);
        const { data: o } = await R(this, I.getRteStylesheets({
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
  }), W(this, te) == null && W(this, P) != null && this._blockContext.unique == "" && this.consumeContext(me, async (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, async (t) => {
      const i = t[0];
      if (!this._isConnected || !i)
        return;
      this._blockContext.unique = W(this, P)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = V(this, q, qe).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i, V(this, q, he).call(this);
      const { data: o } = await R(this, I.getRteStylesheets({
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
  this.consumeContext(Pt, (e) => {
    e != null && this.observe(
      j([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await V(this, q, pt).call(this);
      }
    );
  });
};
pt = function() {
  this.consumeContext(Bt, (e) => {
    e != null && this.observe(
      j([
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
ft = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (W(this, P) != null && e.unique == "" && (e.unique = W(this, P).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = V(this, q, qe).call(this, e.workspaceEditContentPath))), W(this, P) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = W(this, P).getDocumentTypeUnique()), !V(this, q, bt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await R(this, I.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = ve.isUmbApiError(o) ? o.message : "An error occurred rendering the block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
bt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
qe = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
v.styles = [
  fe`
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
N([
  d({ attribute: !1 })
], v.prototype, "content", 2);
N([
  d({ attribute: !1 })
], v.prototype, "settings", 2);
N([
  d({ attribute: !1 })
], v.prototype, "contentKey", 2);
N([
  d({ attribute: !1 })
], v.prototype, "config", 2);
N([
  g()
], v.prototype, "_htmlMarkup", 2);
N([
  g()
], v.prototype, "_isLoading", 2);
N([
  g()
], v.prototype, "_error", 2);
N([
  g()
], v.prototype, "_blockRteValue", 2);
N([
  d({ attribute: !1 })
], v.prototype, "blockRteValue", 1);
v = N([
  be(ai)
], v);
class de extends Ve {
  constructor(t) {
    super(t), this.#o = new xt(void 0), this.settings = this.#o.asObservable(), this.#t = new Le(""), this.unique = this.#t.asObservable(), this.#i = new Le(""), this.documentTypeUnique = this.#i.asObservable(), this.#r = new Ut(!1), this.sortModeActive = this.#r.asObservable(), this.#e = new yt(t), this.getSettings(), this.setSortMode(!1);
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
const ci = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: de,
  default: de
}, Symbol.toStringTag, { value: "Module" })), li = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => ci)
  }
], ui = [...li], pe = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...Lt.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action-CER4_BvW.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, hi = [
  pe
], di = [
  {
    ...pe.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode-Bj_yAacM.js"),
    forPropertyEditorUis: [Et],
    conditions: [
      {
        alias: $e
      }
    ]
  },
  {
    ...pe.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.List.SortMode",
    name: "Block List Sort Mode Property Action",
    api: () => import("./block-list-sort-mode-TntFQDqE.js"),
    forPropertyEditorUis: [St],
    conditions: [
      {
        alias: $e
      }
    ]
  }
];
class pi {
  #e;
  constructor(t) {
    this.#e = t;
  }
  async getSettings() {
    return await R(this.#e, I.getSettings());
  }
}
class yt extends Ve {
  #e;
  constructor(t) {
    super(t), this.#e = new pi(t);
  }
  async getSettings() {
    const t = await this.#e.getSettings();
    if (t && t?.data)
      return t.data;
  }
}
const Si = async (e, t) => {
  e.consumeContext(vt, async (i) => {
    if (!i) return;
    const o = i.getOpenApiConfiguration();
    E.setConfig({
      baseUrl: o?.base ?? "",
      auth: o?.token ?? void 0,
      credentials: o?.credentials ?? "same-origin"
    }), E.interceptors.request.use(async (a, l) => {
      const u = await o.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new yt(e).getSettings();
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
      ...ui,
      ...hi,
      ...di
    ]), e.provideContext(re, new de(e));
  });
};
export {
  re as B,
  v as R,
  pi as S,
  b as a,
  p as b,
  yt as c,
  Si as o
};
//# sourceMappingURL=index-B6JjhnTg.js.map

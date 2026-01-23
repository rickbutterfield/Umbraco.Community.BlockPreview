import { UMB_AUTH_CONTEXT as gt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as Ct } from "@umbraco-cms/backoffice/context-api";
import { css as fe, property as d, state as C, customElement as be, html as S, ifDefined as ye, unsafeHTML as ke } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as _e } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Tt, UMB_BLOCK_GRID_MANAGER_CONTEXT as Et, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as xt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Y } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as me } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as K, UmbObjectState as Ut, UmbStringState as Le, UmbBooleanState as qt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as ve, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as $e } from "@umbraco-cms/backoffice/property";
import { tryExecute as j, UmbApiError as we } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as ge } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as At, UMB_BLOCK_LIST_MANAGER_CONTEXT as St, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as Pt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Bt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Ot } from "@umbraco-cms/backoffice/block-rte";
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
  responseTransformer: r,
  responseValidator: o,
  sseDefaultRetryDelay: s,
  sseMaxRetryAttempts: a,
  sseMaxRetryDelay: n,
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let f;
  const F = l ?? ((h) => new Promise((_) => setTimeout(_, h)));
  return { stream: async function* () {
    let h = s ?? 3e3, _ = 0;
    const z = c.signal ?? new AbortController().signal;
    for (; !z.aborted; ) {
      _++;
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
        const E = await (c.fetch ?? globalThis.fetch)(L);
        if (!E.ok)
          throw new Error(
            `SSE failed: ${E.status} ${E.statusText}`
          );
        if (!E.body) throw new Error("No body in SSE response");
        const $ = E.body.pipeThrough(new TextDecoderStream()).getReader();
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
            const { done: _t, value: mt } = await $.read();
            if (_t) break;
            oe += mt;
            const Se = oe.split(`

`);
            oe = Se.pop() ?? "";
            for (const vt of Se) {
              const wt = vt.split(`
`), Q = [];
              let Pe;
              for (const A of wt)
                if (A.startsWith("data:"))
                  Q.push(A.replace(/^data:\s*/, ""));
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
              if (Q.length) {
                const A = Q.join(`
`);
                try {
                  H = JSON.parse(A), Be = !0;
                } catch {
                  H = A;
                }
              }
              Be && (o && await o(H), r && (H = await r(H))), i?.({
                data: H,
                event: Pe,
                id: f,
                retry: h
              }), Q.length && (yield H);
            }
          }
        } finally {
          z.removeEventListener("abort", Ae), $.releaseLock();
        }
        break;
      } catch (G) {
        if (t?.(G), a !== void 0 && _ >= a)
          break;
        const L = Math.min(
          h * 2 ** (_ - 1),
          n ?? 3e4
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
}, It = (e) => {
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
}, Ie = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: r,
  value: o
}) => {
  if (!t) {
    const n = (e ? o : o.map((l) => encodeURIComponent(l))).join(Vt(r));
    switch (r) {
      case "label":
        return `.${n}`;
      case "matrix":
        return `;${i}=${n}`;
      case "simple":
        return n;
      default:
        return `${i}=${n}`;
    }
  }
  const s = Dt(r), a = o.map((n) => r === "label" || r === "simple" ? e ? n : encodeURIComponent(n) : ie({
    allowReserved: e,
    name: i,
    value: n
  })).join(s);
  return r === "label" || r === "matrix" ? s + a : a;
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
}, Re = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: r,
  value: o,
  valueOnly: s
}) => {
  if (o instanceof Date)
    return s ? o.toISOString() : `${i}=${o.toISOString()}`;
  if (r !== "deepObject" && !t) {
    let l = [];
    Object.entries(o).forEach(([c, f]) => {
      l = [
        ...l,
        c,
        e ? f : encodeURIComponent(f)
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
  const a = It(r), n = Object.entries(o).map(
    ([l, u]) => ie({
      allowReserved: e,
      name: r === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(a);
  return r === "label" || r === "matrix" ? a + n : n;
}, Rt = /\{[^{}]+\}/g, Nt = ({ path: e, url: t }) => {
  let i = t;
  const r = t.match(Rt);
  if (r)
    for (const o of r) {
      let s = !1, a = o.substring(1, o.length - 1), n = "simple";
      a.endsWith("*") && (s = !0, a = a.substring(0, a.length - 1)), a.startsWith(".") ? (a = a.substring(1), n = "label") : a.startsWith(";") && (a = a.substring(1), n = "matrix");
      const l = e[a];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(
          o,
          Ie({ explode: s, name: a, style: n, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          o,
          Re({
            explode: s,
            name: a,
            style: n,
            value: l,
            valueOnly: !0
          })
        );
        continue;
      }
      if (n === "matrix") {
        i = i.replace(
          o,
          `;${ie({
            name: a,
            value: l
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        n === "label" ? `.${l}` : l
      );
      i = i.replace(o, u);
    }
  return i;
}, Kt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: r,
  url: o
}) => {
  const s = o.startsWith("/") ? o : `/${o}`;
  let a = (e ?? "") + s;
  t && (a = Nt({ path: t, url: a }));
  let n = i ? r(i) : "";
  return n.startsWith("?") && (n = n.substring(1)), n && (a += `?${n}`), a;
};
function jt(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const Wt = async (e, t) => {
  const i = typeof t == "function" ? await t(e) : t;
  if (i)
    return e.scheme === "bearer" ? `Bearer ${i}` : e.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Ne = ({
  allowReserved: e,
  array: t,
  object: i
} = {}) => (o) => {
  const s = [];
  if (o && typeof o == "object")
    for (const a in o) {
      const n = o[a];
      if (n != null)
        if (Array.isArray(n)) {
          const l = Ie({
            allowReserved: e,
            explode: !0,
            name: a,
            style: "form",
            value: n,
            ...t
          });
          l && s.push(l);
        } else if (typeof n == "object") {
          const l = Re({
            allowReserved: e,
            explode: !0,
            name: a,
            style: "deepObject",
            value: n,
            ...i
          });
          l && s.push(l);
        } else {
          const l = ie({
            allowReserved: e,
            name: a,
            value: n
          });
          l && s.push(l);
        }
    }
  return s.join("&");
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
    const r = await Wt(i, t.auth);
    if (!r)
      continue;
    const o = i.name ?? "Authorization";
    switch (i.in) {
      case "query":
        t.query || (t.query = {}), t.query[o] = r;
        break;
      case "cookie":
        t.headers.append("Cookie", `${o}=${r}`);
        break;
      case "header":
      default:
        t.headers.set(o, r);
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
  return e.forEach((i, r) => {
    t.push([r, i]);
  }), t;
}, Ke = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const r = i instanceof Headers ? Ft(i) : Object.entries(i);
    for (const [o, s] of r)
      if (s === null)
        t.delete(o);
      else if (Array.isArray(s))
        for (const a of s)
          t.append(o, a);
      else s !== void 0 && t.set(
        o,
        typeof s == "object" ? JSON.stringify(s) : s
      );
  }
  return t;
};
class se {
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
    const r = this.getInterceptorIndex(t);
    return this.fns[r] ? (this.fns[r] = i, t) : !1;
  }
  use(t) {
    return this.fns.push(t), this.fns.length - 1;
  }
}
const Xt = () => ({
  error: new se(),
  request: new se(),
  response: new se()
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
}, je = (e = {}) => ({
  ...$t,
  headers: Jt,
  parseAs: "auto",
  querySerializer: Yt,
  ...e
}), Qt = (e = {}) => {
  let t = De(je(), e);
  const i = () => ({ ...t }), r = (u) => (t = De(t, u), i()), o = Xt(), s = async (u) => {
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
  }, a = async (u) => {
    const { opts: c, url: f } = await s(u), F = {
      redirect: "follow",
      ...c,
      body: jt(c)
    };
    let N = new Request(f, F);
    for (const y of o.request.fns)
      y && (N = await y(N, c));
    const J = c.fetch;
    let h = await J(N);
    for (const y of o.response.fns)
      y && (h = await y(h, N, c));
    const _ = {
      request: N,
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
          ..._
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
            ..._
          };
      }
      return y === "json" && (c.responseValidator && await c.responseValidator(E), c.responseTransformer && (E = await c.responseTransformer(E))), c.responseStyle === "data" ? E : {
        data: E,
        ..._
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
    for (const y of o.error.fns)
      y && (L = await y(G, h, N, c));
    if (L = L || {}, c.throwOnError)
      throw L;
    return c.responseStyle === "data" ? void 0 : {
      error: L,
      ..._
    };
  }, n = (u) => (c) => a({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: f, url: F } = await s(c);
    return Mt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (N, J) => {
        let h = new Request(N, J);
        for (const _ of o.request.fns)
          _ && (h = await _(h, f));
        return h;
      },
      url: F
    });
  };
  return {
    buildUrl: Me,
    connect: n("CONNECT"),
    delete: n("DELETE"),
    get: n("GET"),
    getConfig: i,
    head: n("HEAD"),
    interceptors: o,
    options: n("OPTIONS"),
    patch: n("PATCH"),
    post: n("POST"),
    put: n("PUT"),
    request: a,
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
    trace: n("TRACE")
  };
}, M = Qt(je({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class W {
  static previewGridBlock(t) {
    return (t?.client ?? M).post({
      url: "/umbraco/block-preview/api/v1/preview/grid",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t?.headers
      }
    });
  }
  /**
   * @deprecated Use getGridStylesheets instead to support multiple stylesheets
   */
  static getGridStylesheet(t) {
    return (t?.client ?? M).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static getGridStylesheets(t) {
    return (t?.client ?? M).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...t
    });
  }
  static previewListBlock(t) {
    return (t?.client ?? M).post({
      url: "/umbraco/block-preview/api/v1/preview/list",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t?.headers
      }
    });
  }
  /**
   * @deprecated Use getListStylesheets instead to support multiple stylesheets
   */
  static getListStylesheet(t) {
    return (t?.client ?? M).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static getListStylesheets(t) {
    return (t?.client ?? M).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return (t?.client ?? M).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t?.headers
      }
    });
  }
  static getSettings(t) {
    return (t?.client ?? M).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const re = new Ct("BlockPreviewContext");
var Zt = Object.defineProperty, ei = Object.getOwnPropertyDescriptor, We = (e) => {
  throw TypeError(e);
}, T = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ei(t, i) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = (r ? a(t, i, o) : a(o)) || o);
  return r && o && Zt(t, i, o), o;
}, Ce = (e, t, i) => t.has(e) || We("Cannot " + i), D = (e, t, i) => (Ce(e, t, "read from private field"), t.get(e)), ne = (e, t, i) => t.has(e) ? We("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ze = (e, t, i, r) => (Ce(e, t, "write to private field"), t.set(e, i), i), P = (e, t, i) => (Ce(e, t, "access private method"), i), x, Z, m, Ge, He, Fe, Xe, ce, Ye, Je, Qe, Te;
const ti = "block-grid-preview";
let b = class extends me {
  constructor() {
    super(), ne(this, m), ne(this, x), ne(this, Z), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
      ze(this, x, e), await P(this, m, Ge).call(this);
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
      P(this, m, Je).call(this);
    }, 500));
  }
  _filterLayouts() {
    return [
      {
        areas: this._blockContext.areas.map((i) => ({
          key: i.key,
          items: this._blockContext.layoutAreas?.find((o) => o.key == i.key)?.items
        })),
        columnSpan: this._blockContext.layout?.columnSpan ?? 0,
        rowSpan: this._blockContext.layout?.rowSpan ?? 0,
        contentKey: this._blockContext.layout?.contentKey ?? "",
        settingsKey: this._blockContext.layout?.settingsKey
      }
    ];
  }
  _handleClick(e) {
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && r.includes(n.tagName)).length > 0) {
      const n = i.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      n != null && n instanceof ge && n.href?.includes("block/edit") && (t = !1);
    }
    const s = i.filter((n) => n instanceof Element && n.tagName === "A" && n.classList.contains("block-preview-edit"));
    if (s.length > 0 && (t = !1), i.filter((n) => n instanceof Element && n.tagName === "A" && n.hasAttribute("data-block-preview-link")).length > 0) {
      s.length > 0 ? window.history.pushState({}, "", s[0].getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
    if (t) {
      e.preventDefault(), e.stopPropagation();
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
m = /* @__PURE__ */ new WeakSet();
Ge = async function() {
  P(this, m, He).call(this), P(this, m, Fe).call(this), await P(this, m, Xe).call(this);
};
He = function() {
  this.observe(D(this, x)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
Fe = function() {
  this.consumeContext(ve, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
Xe = async function() {
  try {
    await this.getContext(Y), this.consumeContext(Y, (e) => {
      e && (ze(this, Z, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          if (!this._isConnected || !i)
            return;
          this._blockContext.unique = t?.toString() ?? "", D(this, x)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, D(this, x)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), P(this, m, ce).call(this);
          const { data: r } = await j(this, W.getGridStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((o) => {
            const s = document.createElement("link");
            return s.rel = "stylesheet", s.href = o, s;
          }));
        }
      ));
    });
  } catch {
    D(this, Z) == null && D(this, x) != null && this._blockContext.unique == "" && this.consumeContext(_e, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const r = i[0];
        if (!this._isConnected || !r)
          return;
        this._blockContext.unique = D(this, x)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = P(this, m, Te).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = r, P(this, m, ce).call(this);
        const { data: o } = await j(this, W.getGridStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        o && o.length > 0 && (this._styleElements = o.map((s) => {
          const a = document.createElement("link");
          return a.rel = "stylesheet", a.href = s, a;
        }));
      });
    });
  }
};
ce = async function() {
  this.consumeContext(Tt, async (e) => {
    e && this.observe(
      K([
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
        r,
        o,
        s,
        a,
        n,
        l
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", this._blockContext.areas = a, this._blockContext.layout = n, this._blockContext.layoutAreas = l, await P(this, m, Ye).call(this);
      }
    );
  });
};
Ye = async function() {
  this.consumeContext(Et, (e) => {
    e && this.observe(
      K([
        e.contents,
        e.settings,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, i, r, o]) => {
        this._blockContext.blockEditorAlias = o ?? "", this.blockGridValue = {
          contentData: t ?? [],
          settingsData: i ?? [],
          expose: r ?? [],
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
  if (D(this, x) != null && e.unique == "" && (e.unique = D(this, x).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = P(this, m, Te).call(this, e.workspaceEditContentPath))), D(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = D(this, x).getDocumentTypeUnique()), !P(this, m, Qe).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await j(this, W.previewGridBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : we.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
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
T([
  d({ attribute: !1 })
], b.prototype, "content", 2);
T([
  d({ attribute: !1 })
], b.prototype, "settings", 2);
T([
  d({ attribute: !1 })
], b.prototype, "contentKey", 2);
T([
  d({ attribute: !1 })
], b.prototype, "config", 2);
T([
  d({ attribute: !1 })
], b.prototype, "unpublished", 2);
T([
  d({ attribute: !1 })
], b.prototype, "icon", 2);
T([
  d({ attribute: !1 })
], b.prototype, "label", 2);
T([
  C()
], b.prototype, "_htmlMarkup", 2);
T([
  C()
], b.prototype, "_isLoading", 2);
T([
  C()
], b.prototype, "_error", 2);
T([
  C()
], b.prototype, "_sortModeActive", 2);
T([
  d({ attribute: !1 })
], b.prototype, "blockGridValue", 1);
b = T([
  be(ti)
], b);
var ii = Object.defineProperty, ri = Object.getOwnPropertyDescriptor, Ze = (e) => {
  throw TypeError(e);
}, k = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ri(t, i) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = (r ? a(t, i, o) : a(o)) || o);
  return r && o && ii(t, i, o), o;
}, Ee = (e, t, i) => t.has(e) || Ze("Cannot " + i), V = (e, t, i) => (Ee(e, t, "read from private field"), t.get(e)), ae = (e, t, i) => t.has(e) ? Ze("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), et = (e, t, i, r) => (Ee(e, t, "write to private field"), t.set(e, i), i), B = (e, t, i) => (Ee(e, t, "access private method"), i), U, ee, v, tt, it, rt, ot, ue, st, nt, at, xe;
const oi = "block-list-preview";
let p = class extends me {
  constructor() {
    super(), ae(this, v), ae(this, U), ae(this, ee), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
      et(this, U, e), await B(this, v, tt).call(this);
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
      B(this, v, nt).call(this);
    }, 500));
  }
  _handleClick(e) {
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && r.includes(n.tagName)).length > 0) {
      const n = i.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      n != null && n instanceof ge && n.href?.includes("block/edit") && (t = !1);
    }
    const s = i.filter((n) => n instanceof Element && n.tagName === "A" && n.classList.contains("block-preview-edit"));
    if (s.length > 0 && (t = !1), i.filter((n) => n instanceof Element && n.tagName === "A" && n.hasAttribute("data-block-preview-link")).length > 0) {
      s.length > 0 ? window.history.pushState({}, "", s[0].getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
    if (t) {
      e.preventDefault(), e.stopPropagation();
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
v = /* @__PURE__ */ new WeakSet();
tt = async function() {
  B(this, v, it).call(this), B(this, v, rt).call(this), await B(this, v, ot).call(this);
};
it = function() {
  this.observe(V(this, U)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
rt = function() {
  this.consumeContext(ve, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ot = async function() {
  try {
    await this.getContext(Y), this.consumeContext(Y, (e) => {
      e && (et(this, ee, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          if (!this._isConnected || !i)
            return;
          this._blockContext.unique = t?.toString() ?? "", V(this, U)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, V(this, U)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), B(this, v, ue).call(this);
          const { data: r } = await j(this, W.getListStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((o) => {
            const s = document.createElement("link");
            return s.rel = "stylesheet", s.href = o, s;
          }));
        }
      ));
    });
  } catch {
    V(this, ee) == null && V(this, U) != null && this._blockContext.unique == "" && this.consumeContext(_e, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const r = i[0];
        if (!this._isConnected || !r)
          return;
        this._blockContext.unique = V(this, U)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = B(this, v, xe).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = r, B(this, v, ue).call(this);
        const { data: o } = await j(this, W.getListStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        o && o.length > 0 && (this._styleElements = o.map((s) => {
          const a = document.createElement("link");
          return a.rel = "stylesheet", a.href = s, a;
        }));
      });
    });
  }
};
ue = function() {
  this.consumeContext(At, (e) => {
    e && this.observe(
      K([
        e.contentKey,
        e.settingsKey,
        e.workspaceEditContentPath,
        e.contentElementTypeAlias,
        e.contentElementTypeKey
      ]),
      async ([
        t,
        i,
        r,
        o,
        s
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", await B(this, v, st).call(this);
      }
    );
  });
};
st = function() {
  this.consumeContext(St, (e) => {
    e && this.observe(
      K([
        e.contents,
        e.settings,
        e.layouts,
        e.exposes,
        e.propertyAlias
      ]),
      async ([
        t,
        i,
        r,
        o,
        s
      ]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockListValue = {
          contentData: t?.filter((a) => a.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((a) => a.key == this._blockContext.settingsUdi) ?? [],
          expose: o?.filter((a) => a.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": r?.filter((a) => a.contentKey == this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = t?.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
nt = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (V(this, U) != null && e.unique == "" && (e.unique = V(this, U).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = B(this, v, xe).call(this, e.workspaceEditContentPath))), V(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = V(this, U).getDocumentTypeUnique()), !B(this, v, at).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await j(this, W.previewListBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : we.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
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
  C()
], p.prototype, "_htmlMarkup", 2);
k([
  C()
], p.prototype, "_isLoading", 2);
k([
  C()
], p.prototype, "_error", 2);
k([
  C()
], p.prototype, "_sortModeActive", 2);
k([
  C()
], p.prototype, "_blockListValue", 2);
k([
  d({ attribute: !1 })
], p.prototype, "blockListValue", 1);
p = k([
  be(oi)
], p);
var si = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, lt = (e) => {
  throw TypeError(e);
}, R = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ni(t, i) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = (r ? a(t, i, o) : a(o)) || o);
  return r && o && si(t, i, o), o;
}, Ue = (e, t, i) => t.has(e) || lt("Cannot " + i), I = (e, t, i) => (Ue(e, t, "read from private field"), t.get(e)), le = (e, t, i) => t.has(e) ? lt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ct = (e, t, i, r) => (Ue(e, t, "write to private field"), t.set(e, i), i), O = (e, t, i) => (Ue(e, t, "access private method"), i), q, te, w, ut, ht, dt, pt, he, ft, bt, yt, qe;
const ai = "rich-text-preview";
let g = class extends me {
  constructor() {
    super(), le(this, w), le(this, q), le(this, te), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._isConnected = !1, this._blockContext = {
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
      ct(this, q, e), O(this, w, ut).call(this);
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
      O(this, w, bt).call(this);
    }, 500));
  }
  _handleClick(e) {
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((s) => s instanceof Element && r.includes(s.tagName)).length > 0) {
      const s = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      s != null && s instanceof ge && s.href?.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
                ${this._styleElement}
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
q = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakSet();
ut = function() {
  O(this, w, ht).call(this), O(this, w, dt).call(this), O(this, w, pt).call(this);
};
ht = function() {
  this.observe(I(this, q)?.settings, (e) => {
    e?.richText?.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = e.richText.stylesheet);
  });
};
dt = function() {
  this.consumeContext(ve, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
pt = function() {
  this.consumeContext(Y, (e) => {
    e && (ct(this, te, e), this.observe(
      K([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        !this._isConnected || !i || (this._blockContext.unique = t?.toString() ?? "", I(this, q)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, I(this, q)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), O(this, w, he).call(this));
      }
    ));
  }), I(this, te) == null && I(this, q) != null && this._blockContext.unique == "" && this.consumeContext(_e, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      const i = t[0];
      !this._isConnected || !i || (this._blockContext.unique = I(this, q)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = O(this, w, qe).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i, O(this, w, he).call(this));
    });
  });
};
he = function() {
  this.consumeContext(Bt, (e) => {
    e != null && this.observe(
      K([
        e.contentKey,
        e.settingsKey,
        e.workspaceEditContentPath,
        e.contentElementTypeAlias,
        e.contentElementTypeKey
      ]),
      async ([
        t,
        i,
        r,
        o,
        s
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", await O(this, w, ft).call(this);
      }
    );
  });
};
ft = function() {
  this.consumeContext(Ot, (e) => {
    e != null && this.observe(
      K([
        e.contents,
        e.settings,
        e.layouts,
        e.exposes,
        e.propertyAlias
      ]),
      async ([
        t,
        i,
        r,
        o,
        s
      ]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockRteValue = {
          contentData: t?.filter((a) => a.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((a) => a.key == this._blockContext.settingsUdi) ?? [],
          expose: o?.filter((a) => a.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": r?.filter((a) => a.contentKey == this._blockContext.contentUdi) ?? []
          }
        };
      }
    );
  });
};
bt = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (I(this, q) != null && e.unique == "" && (e.unique = I(this, q).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = O(this, w, qe).call(this, e.workspaceEditContentPath))), I(this, q) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = I(this, q).getDocumentTypeUnique()), !O(this, w, yt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await j(this, W.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : we.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
yt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
qe = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
g.styles = [
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
R([
  d({ attribute: !1 })
], g.prototype, "content", 2);
R([
  d({ attribute: !1 })
], g.prototype, "settings", 2);
R([
  d({ attribute: !1 })
], g.prototype, "contentKey", 2);
R([
  d({ attribute: !1 })
], g.prototype, "config", 2);
R([
  C()
], g.prototype, "_htmlMarkup", 2);
R([
  C()
], g.prototype, "_isLoading", 2);
R([
  C()
], g.prototype, "_error", 2);
R([
  C()
], g.prototype, "_blockRteValue", 2);
R([
  d({ attribute: !1 })
], g.prototype, "blockRteValue", 1);
g = R([
  be(ai)
], g);
class de extends Ve {
  constructor(t) {
    super(t), this.#o = new Ut(void 0), this.settings = this.#o.asObservable(), this.#t = new Le(""), this.unique = this.#t.asObservable(), this.#i = new Le(""), this.documentTypeUnique = this.#i.asObservable(), this.#r = new qt(!1), this.sortModeActive = this.#r.asObservable(), this.#e = new kt(t), this.getSettings(), this.setSortMode(!1);
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
const li = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: de,
  default: de
}, Symbol.toStringTag, { value: "Module" })), ci = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => li)
  }
], ui = [...ci], pe = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...Lt.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action-Diym3sLG.js"),
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
    api: () => import("./block-grid-sort-mode-DsIQxMmh.js"),
    forPropertyEditorUis: [xt],
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
    api: () => import("./block-list-sort-mode-R4te8f92.js"),
    forPropertyEditorUis: [Pt],
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
    return await j(this.#e, W.getSettings());
  }
}
class kt extends Ve {
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
const Ai = async (e, t) => {
  e.consumeContext(gt, async (i) => {
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    M.setConfig({
      baseUrl: r?.base ?? "",
      auth: r?.token ?? void 0,
      credentials: r?.credentials ?? "same-origin"
    }), M.interceptors.request.use(async (n, l) => {
      const u = await r.token();
      return n.headers.set("Authorization", `Bearer ${u}`), n;
    });
    const s = await new kt(e).getSettings();
    let a = [];
    if (s) {
      if (s.blockGrid.enabled) {
        let n = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: b,
          forBlockEditor: "block-grid"
        };
        s.blockGrid.contentTypes?.length !== 0 && (n.forContentTypeAlias = s.blockGrid.contentTypes), a.push(n);
      }
      if (s.blockList.enabled) {
        let n = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        s.blockList.contentTypes?.length !== 0 && (n.forContentTypeAlias = s.blockList.contentTypes), a.push(n);
      }
      if (s.richText.enabled) {
        let n = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: g,
          forBlockEditor: "block-rte"
        };
        s.richText.contentTypes?.length !== 0 && (n.forContentTypeAlias = s.richText.contentTypes), a.push(n);
      }
    }
    t.registerMany([
      ...a,
      ...ui,
      ...hi,
      ...di
    ]), e.provideContext(re, new de(e));
  });
};
export {
  re as B,
  g as R,
  pi as S,
  b as a,
  p as b,
  kt as c,
  Ai as o
};
//# sourceMappingURL=index-BkYMm439.js.map

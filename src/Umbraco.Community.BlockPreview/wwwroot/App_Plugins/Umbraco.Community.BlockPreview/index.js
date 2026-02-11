import { UMB_AUTH_CONTEXT as _t } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as vt } from "@umbraco-cms/backoffice/context-api";
import { css as pe, property as d, state as C, customElement as fe, html as S, ifDefined as be, unsafeHTML as ye } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ke } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as wt, UMB_BLOCK_GRID_MANAGER_CONTEXT as Ct } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as Q } from "@umbraco-cms/backoffice/content";
import { UmbLitElement as me } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as W, UmbObjectState as gt, UmbStringState as $e, UmbBooleanState as Tt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as _e } from "@umbraco-cms/backoffice/property";
import { tryExecute as N, UmbApiError as ve } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as we } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Et, UMB_BLOCK_LIST_MANAGER_CONTEXT as xt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Ut, UMB_BLOCK_RTE_MANAGER_CONTEXT as qt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as At } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as Ve } from "@umbraco-cms/backoffice/class-api";
const St = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, i) => typeof i == "bigint" ? i.toString() : i
  )
}, Pt = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: i,
  responseTransformer: s,
  responseValidator: r,
  sseDefaultRetryDelay: o,
  sseMaxRetryAttempts: n,
  sseMaxRetryDelay: a,
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let f;
  const X = l ?? ((h) => new Promise((m) => setTimeout(m, h)));
  return { stream: async function* () {
    let h = o ?? 3e3, m = 0;
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
        const T = await (c.fetch ?? globalThis.fetch)(L);
        if (!T.ok)
          throw new Error(
            `SSE failed: ${T.status} ${T.statusText}`
          );
        if (!T.body) throw new Error("No body in SSE response");
        const O = T.body.pipeThrough(new TextDecoderStream()).getReader();
        let se = "";
        const qe = () => {
          try {
            O.cancel();
          } catch {
          }
        };
        z.addEventListener("abort", qe);
        try {
          for (; ; ) {
            const { done: bt, value: yt } = await O.read();
            if (bt) break;
            se += yt;
            const Ae = se.split(`

`);
            se = Ae.pop() ?? "";
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
              Pe && (r && await r(H), s && (H = await s(H))), i?.({
                data: H,
                event: Se,
                id: f,
                retry: h
              }), Y.length && (yield H);
            }
          }
        } finally {
          z.removeEventListener("abort", qe), O.releaseLock();
        }
        break;
      } catch (G) {
        if (t?.(G), n !== void 0 && m >= n)
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
}, $t = (e) => {
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
}, De = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: s,
  value: r
}) => {
  if (!t) {
    const a = (e ? r : r.map((l) => encodeURIComponent(l))).join($t(s));
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
  const o = Bt(s), n = r.map((a) => s === "label" || s === "simple" ? e ? a : encodeURIComponent(a) : ie({
    allowReserved: e,
    name: i,
    value: a
  })).join(o);
  return s === "label" || s === "matrix" ? o + n : n;
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
  style: s,
  value: r,
  valueOnly: o
}) => {
  if (r instanceof Date)
    return o ? r.toISOString() : `${i}=${r.toISOString()}`;
  if (s !== "deepObject" && !t) {
    let l = [];
    Object.entries(r).forEach(([c, f]) => {
      l = [
        ...l,
        c,
        e ? f : encodeURIComponent(f)
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
  const n = Lt(s), a = Object.entries(r).map(
    ([l, u]) => ie({
      allowReserved: e,
      name: s === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(n);
  return s === "label" || s === "matrix" ? n + a : a;
}, Ot = /\{[^{}]+\}/g, Vt = ({ path: e, url: t }) => {
  let i = t;
  const s = t.match(Ot);
  if (s)
    for (const r of s) {
      let o = !1, n = r.substring(1, r.length - 1), a = "simple";
      n.endsWith("*") && (o = !0, n = n.substring(0, n.length - 1)), n.startsWith(".") ? (n = n.substring(1), a = "label") : n.startsWith(";") && (n = n.substring(1), a = "matrix");
      const l = e[n];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(
          r,
          De({ explode: o, name: n, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          r,
          Me({
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
          r,
          `;${ie({
            name: n,
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
}, Dt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: s,
  url: r
}) => {
  const o = r.startsWith("/") ? r : `/${r}`;
  let n = (e ?? "") + o;
  t && (n = Vt({ path: t, url: n }));
  let a = i ? s(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (n += `?${a}`), n;
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
  const o = [];
  if (r && typeof r == "object")
    for (const n in r) {
      const a = r[n];
      if (a != null)
        if (Array.isArray(a)) {
          const l = De({
            allowReserved: e,
            explode: !0,
            name: n,
            style: "form",
            value: a,
            ...t
          });
          l && o.push(l);
        } else if (typeof a == "object") {
          const l = Me({
            allowReserved: e,
            explode: !0,
            name: n,
            style: "deepObject",
            value: a,
            ...i
          });
          l && o.push(l);
        } else {
          const l = ie({
            allowReserved: e,
            name: n,
            value: a
          });
          l && o.push(l);
        }
    }
  return o.join("&");
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
}, It = (e, t) => t ? !!(e.headers.has(t) || e.query?.[t] || e.headers.get("Cookie")?.includes(`${t}=`)) : !1, Kt = async ({
  security: e,
  ...t
}) => {
  for (const i of e) {
    if (It(t, i.name))
      continue;
    const s = await Nt(i, t.auth);
    if (!s)
      continue;
    const r = i.name ?? "Authorization";
    switch (i.in) {
      case "query":
        t.query || (t.query = {}), t.query[r] = s;
        break;
      case "cookie":
        t.headers.append("Cookie", `${r}=${s}`);
        break;
      case "header":
      default:
        t.headers.set(r, s);
        break;
    }
  }
}, Le = (e) => Dt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Ne(e.querySerializer),
  url: e.url
}), Oe = (e, t) => {
  const i = { ...e, ...t };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Re(e.headers, t.headers), i;
}, jt = (e) => {
  const t = [];
  return e.forEach((i, s) => {
    t.push([s, i]);
  }), t;
}, Re = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const s = i instanceof Headers ? jt(i) : Object.entries(i);
    for (const [r, o] of s)
      if (o === null)
        t.delete(r);
      else if (Array.isArray(o))
        for (const n of o)
          t.append(r, n);
      else o !== void 0 && t.set(
        r,
        typeof o == "object" ? JSON.stringify(o) : o
      );
  }
  return t;
};
class oe {
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
    const s = this.getInterceptorIndex(t);
    return this.fns[s] ? (this.fns[s] = i, t) : !1;
  }
  use(t) {
    return this.fns.push(t), this.fns.length - 1;
  }
}
const Wt = () => ({
  error: new oe(),
  request: new oe(),
  response: new oe()
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
}, Ie = (e = {}) => ({
  ...St,
  headers: Gt,
  parseAs: "auto",
  querySerializer: zt,
  ...e
}), Ht = (e = {}) => {
  let t = Oe(Ie(), e);
  const i = () => ({ ...t }), s = (u) => (t = Oe(t, u), i()), r = Wt(), o = async (u) => {
    const c = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Re(t.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await Kt({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const f = Le(c);
    return { opts: c, url: f };
  }, n = async (u) => {
    const { opts: c, url: f } = await o(u), X = {
      redirect: "follow",
      ...c,
      body: Mt(c)
    };
    let K = new Request(f, X);
    for (const y of r.request.fns)
      y && (K = await y(K, c));
    const J = c.fetch;
    let h = await J(K);
    for (const y of r.response.fns)
      y && (h = await y(h, K, c));
    const m = {
      request: K,
      response: h
    };
    if (h.ok) {
      const y = (c.parseAs === "auto" ? Rt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let O;
        switch (y) {
          case "arrayBuffer":
          case "blob":
          case "text":
            O = await h[y]();
            break;
          case "formData":
            O = new FormData();
            break;
          case "stream":
            O = h.body;
            break;
          case "json":
          default:
            O = {};
            break;
        }
        return c.responseStyle === "data" ? O : {
          data: O,
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
    let F;
    try {
      F = JSON.parse(z);
    } catch {
    }
    const G = F ?? z;
    let L = G;
    for (const y of r.error.fns)
      y && (L = await y(G, h, K, c));
    if (L = L || {}, c.throwOnError)
      throw L;
    return c.responseStyle === "data" ? void 0 : {
      error: L,
      ...m
    };
  }, a = (u) => (c) => n({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: f, url: X } = await o(c);
    return Pt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (K, J) => {
        let h = new Request(K, J);
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
    request: n,
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
}, E = Ht(Ie({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class R {
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
const re = new vt("BlockPreviewContext");
var Xt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, Ke = (e) => {
  throw TypeError(e);
}, g = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ft(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Xt(t, i, r), r;
}, Ce = (e, t, i) => t.has(e) || Ke("Cannot " + i), V = (e, t, i) => (Ce(e, t, "read from private field"), t.get(e)), ne = (e, t, i) => t.has(e) ? Ke("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), je = (e, t, i, s) => (Ce(e, t, "write to private field"), t.set(e, i), i), B = (e, t, i) => (Ce(e, t, "access private method"), i), x, Z, _, We, ze, Ge, He, le, Xe, Fe, Je, ge;
const Jt = "block-grid-preview";
let b = class extends me {
  constructor() {
    super(), ne(this, _), ne(this, x), ne(this, Z), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
    const t = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((r) => r instanceof Element && i.includes(r.tagName))) {
      if (t.find((o) => o instanceof we && o.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (t.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      const r = t.find((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
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
  this.observe(V(this, x)?.sortModeActive, (e) => {
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
          const s = i?.[0];
          if (!this._isConnected || !s)
            return;
          this._blockContext.unique = t?.toString() ?? "", V(this, x)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = s, V(this, x)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), B(this, _, le).call(this);
          const { data: r } = await N(this, R.getGridStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((o) => {
            const n = document.createElement("link");
            return n.rel = "stylesheet", n.href = o, n;
          }));
        }
      ));
    });
  } catch {
    V(this, Z) == null && V(this, x) != null && this._blockContext.unique == "" && this.consumeContext(ke, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const s = i[0];
        if (!this._isConnected || !s)
          return;
        this._blockContext.unique = V(this, x)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = B(this, _, ge).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = s, B(this, _, le).call(this);
        const { data: r } = await N(this, R.getGridStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        r && r.length > 0 && (this._styleElements = r.map((o) => {
          const n = document.createElement("link");
          return n.rel = "stylesheet", n.href = o, n;
        }));
      });
    });
  }
};
le = async function() {
  this.consumeContext(wt, async (e) => {
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
        s,
        r,
        o,
        n,
        a,
        l
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = o ?? "", this._blockContext.areas = n, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await B(this, _, Xe).call(this);
      }
    );
  });
};
Xe = async function() {
  this.consumeContext(Ct, (e) => {
    e && this.observe(
      W([
        e.contents,
        e.settings,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, i, s, r]) => {
        this._blockContext.blockEditorAlias = r ?? "", this.blockGridValue = {
          contentData: t ?? [],
          settingsData: i ?? [],
          expose: s ?? [],
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
  if (V(this, x) != null && e.unique == "" && (e.unique = V(this, x).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = B(this, _, ge).call(this, e.workspaceEditContentPath))), V(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = V(this, x).getDocumentTypeUnique()), !B(this, _, Je).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: s } = await N(this, R.previewGridBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : ve.isUmbApiError(s) && (this._error = s.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Je = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
ge = function(e) {
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
g([
  d({ attribute: !1 })
], b.prototype, "content", 2);
g([
  d({ attribute: !1 })
], b.prototype, "settings", 2);
g([
  d({ attribute: !1 })
], b.prototype, "contentKey", 2);
g([
  d({ attribute: !1 })
], b.prototype, "config", 2);
g([
  d({ attribute: !1 })
], b.prototype, "unpublished", 2);
g([
  d({ attribute: !1 })
], b.prototype, "icon", 2);
g([
  d({ attribute: !1 })
], b.prototype, "label", 2);
g([
  C()
], b.prototype, "_htmlMarkup", 2);
g([
  C()
], b.prototype, "_isLoading", 2);
g([
  C()
], b.prototype, "_error", 2);
g([
  C()
], b.prototype, "_sortModeActive", 2);
g([
  d({ attribute: !1 })
], b.prototype, "blockGridValue", 1);
b = g([
  fe(Jt)
], b);
var Yt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, Ye = (e) => {
  throw TypeError(e);
}, k = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Qt(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Yt(t, i, r), r;
}, Te = (e, t, i) => t.has(e) || Ye("Cannot " + i), D = (e, t, i) => (Te(e, t, "read from private field"), t.get(e)), ae = (e, t, i) => t.has(e) ? Ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qe = (e, t, i, s) => (Te(e, t, "write to private field"), t.set(e, i), i), $ = (e, t, i) => (Te(e, t, "access private method"), i), U, ee, v, Ze, et, tt, it, ue, rt, st, ot, Ee;
const Zt = "block-list-preview";
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
      Qe(this, U, e), await $(this, v, Ze).call(this);
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
      $(this, v, st).call(this);
    }, 500));
  }
  _handleClick(e) {
    const t = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((r) => r instanceof Element && i.includes(r.tagName))) {
      if (t.find((o) => o instanceof we && o.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (t.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      const r = t.find((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
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
v = /* @__PURE__ */ new WeakSet();
Ze = async function() {
  $(this, v, et).call(this), $(this, v, tt).call(this), await $(this, v, it).call(this);
};
et = function() {
  this.observe(D(this, U)?.sortModeActive, (e) => {
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
          const s = i?.[0];
          if (!this._isConnected || !s)
            return;
          this._blockContext.unique = t?.toString() ?? "", D(this, U)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = s, D(this, U)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), $(this, v, ue).call(this);
          const { data: r } = await N(this, R.getListStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((o) => {
            const n = document.createElement("link");
            return n.rel = "stylesheet", n.href = o, n;
          }));
        }
      ));
    });
  } catch {
    D(this, ee) == null && D(this, U) != null && this._blockContext.unique == "" && this.consumeContext(ke, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const s = i[0];
        if (!this._isConnected || !s)
          return;
        this._blockContext.unique = D(this, U)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = $(this, v, Ee).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = s, $(this, v, ue).call(this);
        const { data: r } = await N(this, R.getListStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        r && r.length > 0 && (this._styleElements = r.map((o) => {
          const n = document.createElement("link");
          return n.rel = "stylesheet", n.href = o, n;
        }));
      });
    });
  }
};
ue = function() {
  this.consumeContext(Et, (e) => {
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
        s,
        r,
        o
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = o ?? "", await $(this, v, rt).call(this);
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
        s,
        r,
        o
      ]) => {
        this._blockContext.blockEditorAlias = o ?? "", this.blockListValue = {
          contentData: t?.filter((n) => n.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((n) => n.key == this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((n) => n.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": s?.filter((n) => n.contentKey == this._blockContext.contentUdi) ?? []
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
  if (D(this, U) != null && e.unique == "" && (e.unique = D(this, U).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = $(this, v, Ee).call(this, e.workspaceEditContentPath))), D(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = D(this, U).getDocumentTypeUnique()), !$(this, v, ot).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: s } = await N(this, R.previewListBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : ve.isUmbApiError(s) && (this._error = s.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
ot = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
Ee = function(e) {
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
  fe(Zt)
], p);
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, nt = (e) => {
  throw TypeError(e);
}, I = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ti(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && ei(t, i, r), r;
}, xe = (e, t, i) => t.has(e) || nt("Cannot " + i), j = (e, t, i) => (xe(e, t, "read from private field"), t.get(e)), ce = (e, t, i) => t.has(e) ? nt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), at = (e, t, i, s) => (xe(e, t, "write to private field"), t.set(e, i), i), M = (e, t, i) => (xe(e, t, "access private method"), i), P, te, q, ct, lt, ut, he, ht, dt, pt, Ue;
const ii = "rich-text-preview";
let w = class extends me {
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
    const t = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
    if (t.some((s) => s instanceof Element && i.includes(s.tagName))) {
      if (t.find((r) => r instanceof we && r.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
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
        const { data: s } = await N(this, R.getRteStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        s && s.length > 0 && (this._styleElements = s.map((r) => {
          const o = document.createElement("link");
          return o.rel = "stylesheet", o.href = r, o;
        }));
      }
    ));
  }), j(this, te) == null && j(this, P) != null && this._blockContext.unique == "" && this.consumeContext(ke, async (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, async (t) => {
      const i = t[0];
      if (!this._isConnected || !i)
        return;
      this._blockContext.unique = j(this, P)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = M(this, q, Ue).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i, M(this, q, he).call(this);
      const { data: s } = await N(this, R.getRteStylesheets({
        query: {
          documentTypeUnique: this._blockContext.documentTypeUnique,
          nodeKey: this._blockContext.unique
        }
      }));
      s && s.length > 0 && (this._styleElements = s.map((r) => {
        const o = document.createElement("link");
        return o.rel = "stylesheet", o.href = r, o;
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
        s,
        r,
        o
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = o ?? "", await M(this, q, ht).call(this);
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
        s,
        r,
        o
      ]) => {
        this._blockContext.blockEditorAlias = o ?? "", this.blockRteValue = {
          contentData: t?.filter((n) => n.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((n) => n.key == this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((n) => n.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": s?.filter((n) => n.contentKey == this._blockContext.contentUdi) ?? []
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
    const { data: i, error: s } = await N(this, R.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : ve.isUmbApiError(s) && (this._error = s.message, this._isLoading = !1);
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
w.styles = [
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
I([
  d({ attribute: !1 })
], w.prototype, "content", 2);
I([
  d({ attribute: !1 })
], w.prototype, "settings", 2);
I([
  d({ attribute: !1 })
], w.prototype, "contentKey", 2);
I([
  d({ attribute: !1 })
], w.prototype, "config", 2);
I([
  C()
], w.prototype, "_htmlMarkup", 2);
I([
  C()
], w.prototype, "_isLoading", 2);
I([
  C()
], w.prototype, "_error", 2);
I([
  C()
], w.prototype, "_blockRteValue", 2);
I([
  d({ attribute: !1 })
], w.prototype, "blockRteValue", 1);
w = I([
  fe(ii)
], w);
class de extends Ve {
  constructor(t) {
    super(t), this.#s = new gt(void 0), this.settings = this.#s.asObservable(), this.#t = new $e(""), this.unique = this.#t.asObservable(), this.#i = new $e(""), this.documentTypeUnique = this.#i.asObservable(), this.#r = new Tt(!1), this.sortModeActive = this.#r.asObservable(), this.#e = new ft(t), this.getSettings(), this.setSortMode(!1);
  }
  #e;
  #s;
  #t;
  #i;
  #r;
  async getSettings() {
    const t = await this.#e.getSettings();
    this.#s.setValue(t);
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
}, Symbol.toStringTag, { value: "Module" })), si = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => ri)
  }
], oi = [...si];
class ni {
  #e;
  constructor(t) {
    this.#e = t;
  }
  async getSettings() {
    return await N(this.#e, R.getSettings());
  }
}
class ft extends Ve {
  #e;
  constructor(t) {
    super(t), this.#e = new ni(t);
  }
  async getSettings() {
    const t = await this.#e.getSettings();
    if (t && t?.data)
      return t.data;
  }
}
const Ci = async (e, t) => {
  e.consumeContext(_t, async (i) => {
    if (!i) return;
    const s = i.getOpenApiConfiguration();
    E.setConfig({
      baseUrl: s?.base ?? "",
      auth: s?.token ?? void 0,
      credentials: s?.credentials ?? "same-origin"
    }), E.interceptors.request.use(async (a, l) => {
      const u = await s.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const o = await new ft(e).getSettings();
    let n = [];
    if (o) {
      if (o.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: b,
          forBlockEditor: "block-grid"
        };
        o.blockGrid.contentTypes?.length !== 0 && (a.forContentTypeAlias = o.blockGrid.contentTypes), n.push(a);
      }
      if (o.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        o.blockList.contentTypes?.length !== 0 && (a.forContentTypeAlias = o.blockList.contentTypes), n.push(a);
      }
      if (o.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: w,
          forBlockEditor: "block-rte"
        };
        o.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = o.richText.contentTypes), n.push(a);
      }
    }
    t.registerMany([
      ...n,
      ...oi
    ]), e.provideContext(re, new de(e));
  });
};
export {
  b as BlockGridPreviewCustomView,
  p as BlockListPreviewCustomView,
  w as RichTextPreviewCustomView,
  ni as SettingsDataSource,
  ft as SettingsRepository,
  Ci as onInit
};
//# sourceMappingURL=index.js.map

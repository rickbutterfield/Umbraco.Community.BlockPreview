import { UMB_AUTH_CONTEXT as vt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as wt } from "@umbraco-cms/backoffice/context-api";
import { css as pe, property as d, state as C, customElement as fe, html as S, ifDefined as be, unsafeHTML as ye } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ke } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as gt, UMB_BLOCK_GRID_MANAGER_CONTEXT as Ct } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as J } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as me } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as K, UmbObjectState as Et, UmbStringState as $e, UmbBooleanState as Tt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as _e } from "@umbraco-cms/backoffice/property";
import { tryExecute as j, UmbApiError as ve } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as we } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as xt, UMB_BLOCK_LIST_MANAGER_CONTEXT as Ut } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as qt, UMB_BLOCK_RTE_MANAGER_CONTEXT as At } from "@umbraco-cms/backoffice/block-rte";
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
  responseTransformer: r,
  responseValidator: s,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: a,
  sseMaxRetryDelay: o,
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
            const { done: yt, value: kt } = await O.read();
            if (yt) break;
            se += kt;
            const Ae = se.split(`

`);
            se = Ae.pop() ?? "";
            for (const mt of Ae) {
              const _t = mt.split(`
`), Q = [];
              let Se;
              for (const A of _t)
                if (A.startsWith("data:"))
                  Q.push(A.replace(/^data:\s*/, ""));
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
              if (Q.length) {
                const A = Q.join(`
`);
                try {
                  H = JSON.parse(A), Pe = !0;
                } catch {
                  H = A;
                }
              }
              Pe && (s && await s(H), r && (H = await r(H))), i?.({
                data: H,
                event: Se,
                id: f,
                retry: h
              }), Q.length && (yield H);
            }
          }
        } finally {
          z.removeEventListener("abort", qe), O.releaseLock();
        }
        break;
      } catch (G) {
        if (t?.(G), a !== void 0 && m >= a)
          break;
        const L = Math.min(
          h * 2 ** (m - 1),
          o ?? 3e4
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
}, Ve = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: r,
  value: s
}) => {
  if (!t) {
    const o = (e ? s : s.map((l) => encodeURIComponent(l))).join($t(r));
    switch (r) {
      case "label":
        return `.${o}`;
      case "matrix":
        return `;${i}=${o}`;
      case "simple":
        return o;
      default:
        return `${i}=${o}`;
    }
  }
  const n = Bt(r), a = s.map((o) => r === "label" || r === "simple" ? e ? o : encodeURIComponent(o) : ie({
    allowReserved: e,
    name: i,
    value: o
  })).join(n);
  return r === "label" || r === "matrix" ? n + a : a;
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
  style: r,
  value: s,
  valueOnly: n
}) => {
  if (s instanceof Date)
    return n ? s.toISOString() : `${i}=${s.toISOString()}`;
  if (r !== "deepObject" && !t) {
    let l = [];
    Object.entries(s).forEach(([c, f]) => {
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
  const a = Lt(r), o = Object.entries(s).map(
    ([l, u]) => ie({
      allowReserved: e,
      name: r === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(a);
  return r === "label" || r === "matrix" ? a + o : o;
}, Ot = /\{[^{}]+\}/g, Dt = ({ path: e, url: t }) => {
  let i = t;
  const r = t.match(Ot);
  if (r)
    for (const s of r) {
      let n = !1, a = s.substring(1, s.length - 1), o = "simple";
      a.endsWith("*") && (n = !0, a = a.substring(0, a.length - 1)), a.startsWith(".") ? (a = a.substring(1), o = "label") : a.startsWith(";") && (a = a.substring(1), o = "matrix");
      const l = e[a];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(
          s,
          Ve({ explode: n, name: a, style: o, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          s,
          Me({
            explode: n,
            name: a,
            style: o,
            value: l,
            valueOnly: !0
          })
        );
        continue;
      }
      if (o === "matrix") {
        i = i.replace(
          s,
          `;${ie({
            name: a,
            value: l
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        o === "label" ? `.${l}` : l
      );
      i = i.replace(s, u);
    }
  return i;
}, Vt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: r,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let a = (e ?? "") + n;
  t && (a = Dt({ path: t, url: a }));
  let o = i ? r(i) : "";
  return o.startsWith("?") && (o = o.substring(1)), o && (a += `?${o}`), a;
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
} = {}) => (s) => {
  const n = [];
  if (s && typeof s == "object")
    for (const a in s) {
      const o = s[a];
      if (o != null)
        if (Array.isArray(o)) {
          const l = Ve({
            allowReserved: e,
            explode: !0,
            name: a,
            style: "form",
            value: o,
            ...t
          });
          l && n.push(l);
        } else if (typeof o == "object") {
          const l = Me({
            allowReserved: e,
            explode: !0,
            name: a,
            style: "deepObject",
            value: o,
            ...i
          });
          l && n.push(l);
        } else {
          const l = ie({
            allowReserved: e,
            name: a,
            value: o
          });
          l && n.push(l);
        }
    }
  return n.join("&");
}, It = (e) => {
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
}, Rt = (e, t) => t ? !!(e.headers.has(t) || e.query?.[t] || e.headers.get("Cookie")?.includes(`${t}=`)) : !1, Kt = async ({
  security: e,
  ...t
}) => {
  for (const i of e) {
    if (Rt(t, i.name))
      continue;
    const r = await Nt(i, t.auth);
    if (!r)
      continue;
    const s = i.name ?? "Authorization";
    switch (i.in) {
      case "query":
        t.query || (t.query = {}), t.query[s] = r;
        break;
      case "cookie":
        t.headers.append("Cookie", `${s}=${r}`);
        break;
      case "header":
      default:
        t.headers.set(s, r);
        break;
    }
  }
}, Le = (e) => Vt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Ne(e.querySerializer),
  url: e.url
}), Oe = (e, t) => {
  const i = { ...e, ...t };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Ie(e.headers, t.headers), i;
}, jt = (e) => {
  const t = [];
  return e.forEach((i, r) => {
    t.push([r, i]);
  }), t;
}, Ie = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const r = i instanceof Headers ? jt(i) : Object.entries(i);
    for (const [s, n] of r)
      if (n === null)
        t.delete(s);
      else if (Array.isArray(n))
        for (const a of n)
          t.append(s, a);
      else n !== void 0 && t.set(
        s,
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
    const r = this.getInterceptorIndex(t);
    return this.fns[r] ? (this.fns[r] = i, t) : !1;
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
}, Re = (e = {}) => ({
  ...St,
  headers: Gt,
  parseAs: "auto",
  querySerializer: zt,
  ...e
}), Ht = (e = {}) => {
  let t = Oe(Re(), e);
  const i = () => ({ ...t }), r = (u) => (t = Oe(t, u), i()), s = Wt(), n = async (u) => {
    const c = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Ie(t.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await Kt({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const f = Le(c);
    return { opts: c, url: f };
  }, a = async (u) => {
    const { opts: c, url: f } = await n(u), X = {
      redirect: "follow",
      ...c,
      body: Mt(c)
    };
    let R = new Request(f, X);
    for (const y of s.request.fns)
      y && (R = await y(R, c));
    const Y = c.fetch;
    let h = await Y(R);
    for (const y of s.response.fns)
      y && (h = await y(h, R, c));
    const m = {
      request: R,
      response: h
    };
    if (h.ok) {
      const y = (c.parseAs === "auto" ? It(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
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
    for (const y of s.error.fns)
      y && (L = await y(G, h, R, c));
    if (L = L || {}, c.throwOnError)
      throw L;
    return c.responseStyle === "data" ? void 0 : {
      error: L,
      ...m
    };
  }, o = (u) => (c) => a({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: f, url: X } = await n(c);
    return Pt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (R, Y) => {
        let h = new Request(R, Y);
        for (const m of s.request.fns)
          m && (h = await m(h, f));
        return h;
      },
      url: X
    });
  };
  return {
    buildUrl: Le,
    connect: o("CONNECT"),
    delete: o("DELETE"),
    get: o("GET"),
    getConfig: i,
    head: o("HEAD"),
    interceptors: s,
    options: o("OPTIONS"),
    patch: o("PATCH"),
    post: o("POST"),
    put: o("PUT"),
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
    trace: o("TRACE")
  };
}, D = Ht(Re({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class W {
  static previewGridBlock(t) {
    return (t?.client ?? D).post({
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
    return (t?.client ?? D).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static getGridStylesheets(t) {
    return (t?.client ?? D).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...t
    });
  }
  static previewListBlock(t) {
    return (t?.client ?? D).post({
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
    return (t?.client ?? D).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static getListStylesheets(t) {
    return (t?.client ?? D).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return (t?.client ?? D).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t?.headers
      }
    });
  }
  static getSettings(t) {
    return (t?.client ?? D).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const re = new wt("BlockPreviewContext");
var Xt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, Ke = (e) => {
  throw TypeError(e);
}, E = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Ft(t, i) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
  return r && s && Xt(t, i, s), s;
}, ge = (e, t, i) => t.has(e) || Ke("Cannot " + i), V = (e, t, i) => (ge(e, t, "read from private field"), t.get(e)), oe = (e, t, i) => t.has(e) ? Ke("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), je = (e, t, i, r) => (ge(e, t, "write to private field"), t.set(e, i), i), P = (e, t, i) => (ge(e, t, "access private method"), i), x, Z, _, We, ze, Ge, He, ce, Xe, Fe, Je, Ce;
const Jt = "block-grid-preview";
let b = class extends me {
  constructor() {
    super(), oe(this, _), oe(this, x), oe(this, Z), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
      je(this, x, e), await P(this, _, We).call(this);
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
      P(this, _, Fe).call(this);
    }, 500));
  }
  _filterLayouts() {
    return [
      {
        areas: this._blockContext.areas.map((i) => ({
          key: i.key,
          items: this._blockContext.layoutAreas?.find((s) => s.key == i.key)?.items
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
    if (i.filter((o) => o instanceof Element && r.includes(o.tagName)).length > 0) {
      const o = i.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      o != null && o instanceof we && o.href?.includes("block/edit") && (t = !1);
    }
    const n = i.filter((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
    if (n.length > 0 && (t = !1), i.filter((o) => o instanceof Element && o.tagName === "A" && o.hasAttribute("data-block-preview-link")).length > 0) {
      n.length > 0 ? window.history.pushState({}, "", n[0].getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
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
  P(this, _, ze).call(this), P(this, _, Ge).call(this), await P(this, _, He).call(this);
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
    await this.getContext(J), this.consumeContext(J, (e) => {
      e && (je(this, Z, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          if (!this._isConnected || !i)
            return;
          this._blockContext.unique = t?.toString() ?? "", V(this, x)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, V(this, x)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), P(this, _, ce).call(this);
          const { data: r } = await j(this, W.getGridStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((s) => {
            const n = document.createElement("link");
            return n.rel = "stylesheet", n.href = s, n;
          }));
        }
      ));
    });
  } catch {
    V(this, Z) == null && V(this, x) != null && this._blockContext.unique == "" && this.consumeContext(ke, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const r = i[0];
        if (!this._isConnected || !r)
          return;
        this._blockContext.unique = V(this, x)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = P(this, _, Ce).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = r, P(this, _, ce).call(this);
        const { data: s } = await j(this, W.getGridStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        s && s.length > 0 && (this._styleElements = s.map((n) => {
          const a = document.createElement("link");
          return a.rel = "stylesheet", a.href = n, a;
        }));
      });
    });
  }
};
ce = async function() {
  this.consumeContext(gt, async (e) => {
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
        s,
        n,
        a,
        o,
        l
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = a, this._blockContext.layout = o, this._blockContext.layoutAreas = l, await P(this, _, Xe).call(this);
      }
    );
  });
};
Xe = async function() {
  this.consumeContext(Ct, (e) => {
    e && this.observe(
      K([
        e.contents,
        e.settings,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, i, r, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockGridValue = {
          contentData: t ?? [],
          settingsData: i ?? [],
          expose: r ?? [],
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
  if (V(this, x) != null && e.unique == "" && (e.unique = V(this, x).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = P(this, _, Ce).call(this, e.workspaceEditContentPath))), V(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = V(this, x).getDocumentTypeUnique()), !P(this, _, Je).call(this, e)) {
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : ve.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
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
E([
  d({ attribute: !1 })
], b.prototype, "content", 2);
E([
  d({ attribute: !1 })
], b.prototype, "settings", 2);
E([
  d({ attribute: !1 })
], b.prototype, "contentKey", 2);
E([
  d({ attribute: !1 })
], b.prototype, "config", 2);
E([
  d({ attribute: !1 })
], b.prototype, "unpublished", 2);
E([
  d({ attribute: !1 })
], b.prototype, "icon", 2);
E([
  d({ attribute: !1 })
], b.prototype, "label", 2);
E([
  C()
], b.prototype, "_htmlMarkup", 2);
E([
  C()
], b.prototype, "_isLoading", 2);
E([
  C()
], b.prototype, "_error", 2);
E([
  C()
], b.prototype, "_sortModeActive", 2);
E([
  d({ attribute: !1 })
], b.prototype, "blockGridValue", 1);
b = E([
  fe(Jt)
], b);
var Yt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, Ye = (e) => {
  throw TypeError(e);
}, k = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Qt(t, i) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
  return r && s && Yt(t, i, s), s;
}, Ee = (e, t, i) => t.has(e) || Ye("Cannot " + i), M = (e, t, i) => (Ee(e, t, "read from private field"), t.get(e)), ae = (e, t, i) => t.has(e) ? Ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qe = (e, t, i, r) => (Ee(e, t, "write to private field"), t.set(e, i), i), B = (e, t, i) => (Ee(e, t, "access private method"), i), U, ee, v, Ze, et, tt, it, ue, rt, st, nt, Te;
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
      Qe(this, U, e), await B(this, v, Ze).call(this);
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
      B(this, v, st).call(this);
    }, 500));
  }
  _handleClick(e) {
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((o) => o instanceof Element && r.includes(o.tagName)).length > 0) {
      const o = i.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      o != null && o instanceof we && o.href?.includes("block/edit") && (t = !1);
    }
    const n = i.filter((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
    if (n.length > 0 && (t = !1), i.filter((o) => o instanceof Element && o.tagName === "A" && o.hasAttribute("data-block-preview-link")).length > 0) {
      n.length > 0 ? window.history.pushState({}, "", n[0].getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
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
  B(this, v, et).call(this), B(this, v, tt).call(this), await B(this, v, it).call(this);
};
et = function() {
  this.observe(M(this, U)?.sortModeActive, (e) => {
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
    await this.getContext(J), this.consumeContext(J, (e) => {
      e && (Qe(this, ee, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          if (!this._isConnected || !i)
            return;
          this._blockContext.unique = t?.toString() ?? "", M(this, U)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, M(this, U)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), B(this, v, ue).call(this);
          const { data: r } = await j(this, W.getListStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((s) => {
            const n = document.createElement("link");
            return n.rel = "stylesheet", n.href = s, n;
          }));
        }
      ));
    });
  } catch {
    M(this, ee) == null && M(this, U) != null && this._blockContext.unique == "" && this.consumeContext(ke, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const r = i[0];
        if (!this._isConnected || !r)
          return;
        this._blockContext.unique = M(this, U)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = B(this, v, Te).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = r, B(this, v, ue).call(this);
        const { data: s } = await j(this, W.getListStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        s && s.length > 0 && (this._styleElements = s.map((n) => {
          const a = document.createElement("link");
          return a.rel = "stylesheet", a.href = n, a;
        }));
      });
    });
  }
};
ue = function() {
  this.consumeContext(xt, (e) => {
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
        s,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await B(this, v, rt).call(this);
      }
    );
  });
};
rt = function() {
  this.consumeContext(Ut, (e) => {
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
        s,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: t?.filter((a) => a.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((a) => a.key == this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((a) => a.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": r?.filter((a) => a.contentKey == this._blockContext.contentUdi) ?? []
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
  if (M(this, U) != null && e.unique == "" && (e.unique = M(this, U).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = B(this, v, Te).call(this, e.workspaceEditContentPath))), M(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = M(this, U).getDocumentTypeUnique()), !B(this, v, nt).call(this, e)) {
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : ve.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
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
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, ot = (e) => {
  throw TypeError(e);
}, I = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ti(t, i) : t, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (s = (r ? a(t, i, s) : a(s)) || s);
  return r && s && ei(t, i, s), s;
}, xe = (e, t, i) => t.has(e) || ot("Cannot " + i), N = (e, t, i) => (xe(e, t, "read from private field"), t.get(e)), le = (e, t, i) => t.has(e) ? ot("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), at = (e, t, i, r) => (xe(e, t, "write to private field"), t.set(e, i), i), $ = (e, t, i) => (xe(e, t, "access private method"), i), q, te, w, lt, ct, ut, ht, he, dt, pt, ft, Ue;
const ii = "rich-text-preview";
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
      at(this, q, e), $(this, w, lt).call(this);
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
      $(this, w, pt).call(this);
    }, 500));
  }
  _handleClick(e) {
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && r.includes(n.tagName)).length > 0) {
      const n = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      n != null && n instanceof we && n.href?.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
q = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakSet();
lt = function() {
  $(this, w, ct).call(this), $(this, w, ut).call(this), $(this, w, ht).call(this);
};
ct = function() {
  this.observe(N(this, q)?.settings, (e) => {
    e?.richText?.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = e.richText.stylesheet);
  });
};
ut = function() {
  this.consumeContext(_e, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ht = function() {
  this.consumeContext(J, (e) => {
    e && (at(this, te, e), this.observe(
      K([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        !this._isConnected || !i || (this._blockContext.unique = t?.toString() ?? "", N(this, q)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, N(this, q)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), $(this, w, he).call(this));
      }
    ));
  }), N(this, te) == null && N(this, q) != null && this._blockContext.unique == "" && this.consumeContext(ke, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      const i = t[0];
      !this._isConnected || !i || (this._blockContext.unique = N(this, q)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = $(this, w, Ue).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i, $(this, w, he).call(this));
    });
  });
};
he = function() {
  this.consumeContext(qt, (e) => {
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
        s,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await $(this, w, dt).call(this);
      }
    );
  });
};
dt = function() {
  this.consumeContext(At, (e) => {
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
        s,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: t?.filter((a) => a.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((a) => a.key == this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((a) => a.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": r?.filter((a) => a.contentKey == this._blockContext.contentUdi) ?? []
          }
        };
      }
    );
  });
};
pt = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (N(this, q) != null && e.unique == "" && (e.unique = N(this, q).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = $(this, w, Ue).call(this, e.workspaceEditContentPath))), N(this, q) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = N(this, q).getDocumentTypeUnique()), !$(this, w, ft).call(this, e)) {
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : ve.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
ft = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
Ue = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
g.styles = [
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
], g.prototype, "content", 2);
I([
  d({ attribute: !1 })
], g.prototype, "settings", 2);
I([
  d({ attribute: !1 })
], g.prototype, "contentKey", 2);
I([
  d({ attribute: !1 })
], g.prototype, "config", 2);
I([
  C()
], g.prototype, "_htmlMarkup", 2);
I([
  C()
], g.prototype, "_isLoading", 2);
I([
  C()
], g.prototype, "_error", 2);
I([
  C()
], g.prototype, "_blockRteValue", 2);
I([
  d({ attribute: !1 })
], g.prototype, "blockRteValue", 1);
g = I([
  fe(ii)
], g);
class de extends De {
  constructor(t) {
    super(t), this.#s = new Et(void 0), this.settings = this.#s.asObservable(), this.#t = new $e(""), this.unique = this.#t.asObservable(), this.#i = new $e(""), this.documentTypeUnique = this.#i.asObservable(), this.#r = new Tt(!1), this.sortModeActive = this.#r.asObservable(), this.#e = new bt(t), this.getSettings(), this.setSortMode(!1);
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
], ni = [...si];
class oi {
  #e;
  constructor(t) {
    this.#e = t;
  }
  async getSettings() {
    return await j(this.#e, W.getSettings());
  }
}
class bt extends De {
  #e;
  constructor(t) {
    super(t), this.#e = new oi(t);
  }
  async getSettings() {
    const t = await this.#e.getSettings();
    if (t && t?.data)
      return t.data;
  }
}
const wi = async (e, t) => {
  e.consumeContext(vt, async (i) => {
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    D.setConfig({
      baseUrl: r?.base ?? "",
      auth: r?.token ?? void 0,
      credentials: r?.credentials ?? "same-origin"
    }), D.interceptors.request.use(async (o, l) => {
      const u = await r.token();
      return o.headers.set("Authorization", `Bearer ${u}`), o;
    });
    const n = await new bt(e).getSettings();
    let a = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let o = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: b,
          forBlockEditor: "block-grid"
        };
        n.blockGrid.contentTypes?.length !== 0 && (o.forContentTypeAlias = n.blockGrid.contentTypes), a.push(o);
      }
      if (n.blockList.enabled) {
        let o = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        n.blockList.contentTypes?.length !== 0 && (o.forContentTypeAlias = n.blockList.contentTypes), a.push(o);
      }
      if (n.richText.enabled) {
        let o = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: g,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (o.forContentTypeAlias = n.richText.contentTypes), a.push(o);
      }
    }
    t.registerMany([
      ...a,
      ...ni
    ]), e.provideContext(re, new de(e));
  });
};
export {
  b as BlockGridPreviewCustomView,
  p as BlockListPreviewCustomView,
  g as RichTextPreviewCustomView,
  oi as SettingsDataSource,
  bt as SettingsRepository,
  wi as onInit
};
//# sourceMappingURL=index.js.map

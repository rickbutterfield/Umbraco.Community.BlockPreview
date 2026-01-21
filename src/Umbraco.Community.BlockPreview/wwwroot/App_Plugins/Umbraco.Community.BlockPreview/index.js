import { UMB_AUTH_CONTEXT as vt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as gt } from "@umbraco-cms/backoffice/context-api";
import { css as pe, property as d, state as C, customElement as fe, html as S, ifDefined as be, unsafeHTML as ye } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ke } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as wt, UMB_BLOCK_GRID_MANAGER_CONTEXT as Ct } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as F } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as me } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as K, UmbObjectState as Et, UmbStringState as $e, UmbBooleanState as Tt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as _e } from "@umbraco-cms/backoffice/property";
import { tryExecute as te, UmbApiError as ve } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as ge } from "@umbraco-cms/backoffice/external/uui";
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
  responseValidator: o,
  sseDefaultRetryDelay: s,
  sseMaxRetryAttempts: a,
  sseMaxRetryDelay: n,
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let f;
  const H = l ?? ((h) => new Promise((m) => setTimeout(m, h)));
  return { stream: async function* () {
    let h = s ?? 3e3, m = 0;
    const W = c.signal ?? new AbortController().signal;
    for (; !W.aborted; ) {
      m++;
      const X = c.headers instanceof Headers ? c.headers : new Headers(c.headers);
      f !== void 0 && X.set("Last-Event-ID", f);
      try {
        const z = {
          redirect: "follow",
          ...c,
          body: c.serializedBody,
          headers: X,
          signal: W
        };
        let L = new Request(u, z);
        e && (L = await e(u, z));
        const T = await (c.fetch ?? globalThis.fetch)(L);
        if (!T.ok)
          throw new Error(
            `SSE failed: ${T.status} ${T.statusText}`
          );
        if (!T.body) throw new Error("No body in SSE response");
        const O = T.body.pipeThrough(new TextDecoderStream()).getReader();
        let oe = "";
        const qe = () => {
          try {
            O.cancel();
          } catch {
          }
        };
        W.addEventListener("abort", qe);
        try {
          for (; ; ) {
            const { done: yt, value: kt } = await O.read();
            if (yt) break;
            oe += kt;
            const Ae = oe.split(`

`);
            oe = Ae.pop() ?? "";
            for (const mt of Ae) {
              const _t = mt.split(`
`), Y = [];
              let Se;
              for (const A of _t)
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
              let G, Pe = !1;
              if (Y.length) {
                const A = Y.join(`
`);
                try {
                  G = JSON.parse(A), Pe = !0;
                } catch {
                  G = A;
                }
              }
              Pe && (o && await o(G), r && (G = await r(G))), i?.({
                data: G,
                event: Se,
                id: f,
                retry: h
              }), Y.length && (yield G);
            }
          }
        } finally {
          W.removeEventListener("abort", qe), O.releaseLock();
        }
        break;
      } catch (z) {
        if (t?.(z), a !== void 0 && m >= a)
          break;
        const L = Math.min(
          h * 2 ** (m - 1),
          n ?? 3e4
        );
        await H(L);
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
  value: o
}) => {
  if (!t) {
    const n = (e ? o : o.map((l) => encodeURIComponent(l))).join($t(r));
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
  const s = Bt(r), a = o.map((n) => r === "label" || r === "simple" ? e ? n : encodeURIComponent(n) : ie({
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
}, Me = ({
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
  const a = Lt(r), n = Object.entries(o).map(
    ([l, u]) => ie({
      allowReserved: e,
      name: r === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(a);
  return r === "label" || r === "matrix" ? a + n : n;
}, Ot = /\{[^{}]+\}/g, Dt = ({ path: e, url: t }) => {
  let i = t;
  const r = t.match(Ot);
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
          Ve({ explode: s, name: a, style: n, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          o,
          Me({
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
}, Vt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: r,
  url: o
}) => {
  const s = o.startsWith("/") ? o : `/${o}`;
  let a = (e ?? "") + s;
  t && (a = Dt({ path: t, url: a }));
  let n = i ? r(i) : "";
  return n.startsWith("?") && (n = n.substring(1)), n && (a += `?${n}`), a;
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
} = {}) => (o) => {
  const s = [];
  if (o && typeof o == "object")
    for (const a in o) {
      const n = o[a];
      if (n != null)
        if (Array.isArray(n)) {
          const l = Ve({
            allowReserved: e,
            explode: !0,
            name: a,
            style: "form",
            value: n,
            ...t
          });
          l && s.push(l);
        } else if (typeof n == "object") {
          const l = Me({
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
const Wt = () => ({
  error: new se(),
  request: new se(),
  response: new se()
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
  const i = () => ({ ...t }), r = (u) => (t = Oe(t, u), i()), o = Wt(), s = async (u) => {
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
    const { opts: c, url: f } = await s(u), H = {
      redirect: "follow",
      ...c,
      body: Mt(c)
    };
    let R = new Request(f, H);
    for (const y of o.request.fns)
      y && (R = await y(R, c));
    const J = c.fetch;
    let h = await J(R);
    for (const y of o.response.fns)
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
    const W = await h.text();
    let X;
    try {
      X = JSON.parse(W);
    } catch {
    }
    const z = X ?? W;
    let L = z;
    for (const y of o.error.fns)
      y && (L = await y(z, h, R, c));
    if (L = L || {}, c.throwOnError)
      throw L;
    return c.responseStyle === "data" ? void 0 : {
      error: L,
      ...m
    };
  }, n = (u) => (c) => a({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: f, url: H } = await s(c);
    return Pt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (R, J) => {
        let h = new Request(R, J);
        for (const m of o.request.fns)
          m && (h = await m(h, f));
        return h;
      },
      url: H
    });
  };
  return {
    buildUrl: Le,
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
}, D = Ht(Re({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class j {
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
const re = new gt("BlockPreviewContext");
var Xt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, Ke = (e) => {
  throw TypeError(e);
}, E = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Ft(t, i) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = (r ? a(t, i, o) : a(o)) || o);
  return r && o && Xt(t, i, o), o;
}, we = (e, t, i) => t.has(e) || Ke("Cannot " + i), V = (e, t, i) => (we(e, t, "read from private field"), t.get(e)), ne = (e, t, i) => t.has(e) ? Ke("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), je = (e, t, i, r) => (we(e, t, "write to private field"), t.set(e, i), i), P = (e, t, i) => (we(e, t, "access private method"), i), x, Q, _, We, ze, Ge, He, ce, Xe, Fe, Je, Ce;
const Jt = "block-grid-preview";
let b = class extends me {
  constructor() {
    super(), ne(this, _), ne(this, x), ne(this, Q), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._sortModeActive = !1, this._blockContext = {
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
Q = /* @__PURE__ */ new WeakMap();
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
    await this.getContext(F), this.consumeContext(F, (e) => {
      e && (je(this, Q, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          this._blockContext.unique = t?.toString() ?? "", V(this, x)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", V(this, x)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), P(this, _, ce).call(this);
          const { data: r } = await j.getGridStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          r && r.length > 0 && (this._styleElements = r.map((o) => {
            const s = document.createElement("link");
            return s.rel = "stylesheet", s.href = o, s;
          }));
        }
      ));
    });
  } catch {
    V(this, Q) == null && V(this, x) != null && this._blockContext.unique == "" && this.consumeContext(ke, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        this._blockContext.unique = V(this, x)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = P(this, _, Ce).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i[0] ?? "", P(this, _, ce).call(this);
        const { data: r } = await j.getGridStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        });
        r && r.length > 0 && (this._styleElements = r.map((o) => {
          const s = document.createElement("link");
          return s.rel = "stylesheet", s.href = o, s;
        }));
      });
    });
  }
};
ce = async function() {
  this.consumeContext(wt, async (e) => {
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", this._blockContext.areas = a, this._blockContext.layout = n, this._blockContext.layoutAreas = l, await P(this, _, Xe).call(this);
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
Fe = async function() {
  const e = this._blockContext;
  if (V(this, x) != null && e.unique == "" && (e.unique = V(this, x).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = P(this, _, Ce).call(this, e.workspaceEditContentPath))), V(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = V(this, x).getDocumentTypeUnique()), !P(this, _, Je).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await te(this, j.previewGridBlock({
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
  for (var o = r > 1 ? void 0 : r ? Qt(t, i) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = (r ? a(t, i, o) : a(o)) || o);
  return r && o && Yt(t, i, o), o;
}, Ee = (e, t, i) => t.has(e) || Ye("Cannot " + i), M = (e, t, i) => (Ee(e, t, "read from private field"), t.get(e)), ae = (e, t, i) => t.has(e) ? Ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qe = (e, t, i, r) => (Ee(e, t, "write to private field"), t.set(e, i), i), B = (e, t, i) => (Ee(e, t, "access private method"), i), U, Z, v, Ze, et, tt, it, ue, rt, ot, st, Te;
const Zt = "block-list-preview";
let p = class extends me {
  constructor() {
    super(), ae(this, v), ae(this, U), ae(this, Z), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._sortModeActive = !1, this._blockContext = {
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
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      B(this, v, ot).call(this);
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
Z = /* @__PURE__ */ new WeakMap();
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
    await this.getContext(F), this.consumeContext(F, (e) => {
      e && (Qe(this, Z, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          this._blockContext.unique = t?.toString() ?? "", M(this, U)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", M(this, U)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), B(this, v, ue).call(this);
          const { data: r } = await j.getListStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          r && r.length > 0 && (this._styleElements = r.map((o) => {
            const s = document.createElement("link");
            return s.rel = "stylesheet", s.href = o, s;
          }));
        }
      ));
    });
  } catch {
    M(this, Z) == null && M(this, U) != null && this._blockContext.unique == "" && this.consumeContext(ke, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        this._blockContext.unique = M(this, U)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = B(this, v, Te).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i[0] ?? "", B(this, v, ue).call(this);
        const { data: r } = await j.getListStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        });
        r && r.length > 0 && (this._styleElements = r.map((o) => {
          const s = document.createElement("link");
          return s.rel = "stylesheet", s.href = o, s;
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
        o,
        s
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", await B(this, v, rt).call(this);
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
ot = async function() {
  const e = this._blockContext;
  if (M(this, U) != null && e.unique == "" && (e.unique = M(this, U).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = B(this, v, Te).call(this, e.workspaceEditContentPath))), M(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = M(this, U).getDocumentTypeUnique()), !B(this, v, st).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await te(this, j.previewListBlock({
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
st = function(e) {
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
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, nt = (e) => {
  throw TypeError(e);
}, I = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ti(t, i) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (o = (r ? a(t, i, o) : a(o)) || o);
  return r && o && ei(t, i, o), o;
}, xe = (e, t, i) => t.has(e) || nt("Cannot " + i), N = (e, t, i) => (xe(e, t, "read from private field"), t.get(e)), le = (e, t, i) => t.has(e) ? nt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), at = (e, t, i, r) => (xe(e, t, "write to private field"), t.set(e, i), i), $ = (e, t, i) => (xe(e, t, "access private method"), i), q, ee, g, lt, ct, ut, ht, he, dt, pt, ft, Ue;
const ii = "rich-text-preview";
let w = class extends me {
  constructor() {
    super(), le(this, g), le(this, q), le(this, ee), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
      at(this, q, e), $(this, g, lt).call(this);
    });
  }
  set blockRteValue(e) {
    const t = e ? { ...e } : {};
    t.layout ??= {}, t.contentData ??= [], t.settingsData ??= [], t.expose ??= [], this._blockRteValue = t;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      $(this, g, pt).call(this);
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
ee = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakSet();
lt = function() {
  $(this, g, ct).call(this), $(this, g, ut).call(this), $(this, g, ht).call(this);
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
  this.consumeContext(F, (e) => {
    e && (at(this, ee, e), this.observe(
      K([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        this._blockContext.unique = t?.toString() ?? "", N(this, q)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", N(this, q)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), $(this, g, he).call(this);
      }
    ));
  }), N(this, ee) == null && N(this, q) != null && this._blockContext.unique == "" && this.consumeContext(ke, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      this._blockContext.unique = N(this, q)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = $(this, g, Ue).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = t[0] ?? "", $(this, g, he).call(this);
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
        o,
        s
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", await $(this, g, dt).call(this);
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
pt = async function() {
  const e = this._blockContext;
  if (N(this, q) != null && e.unique == "" && (e.unique = N(this, q).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = $(this, g, Ue).call(this, e.workspaceEditContentPath))), N(this, q) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = N(this, q).getDocumentTypeUnique()), !$(this, g, ft).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await te(this, j.previewRichTextMarkup({
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
class de extends De {
  constructor(t) {
    super(t), this.#o = new Et(void 0), this.settings = this.#o.asObservable(), this.#t = new $e(""), this.unique = this.#t.asObservable(), this.#i = new $e(""), this.documentTypeUnique = this.#i.asObservable(), this.#r = new Tt(!1), this.sortModeActive = this.#r.asObservable(), this.#e = new bt(t), this.getSettings(), this.setSortMode(!1);
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
], si = [...oi];
class ni {
  #e;
  constructor(t) {
    this.#e = t;
  }
  async getSettings() {
    return await te(this.#e, j.getSettings());
  }
}
class bt extends De {
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
const gi = async (e, t) => {
  e.consumeContext(vt, async (i) => {
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    D.setConfig({
      baseUrl: r?.base ?? "",
      auth: r?.token ?? void 0,
      credentials: r?.credentials ?? "same-origin"
    }), D.interceptors.request.use(async (n, l) => {
      const u = await r.token();
      return n.headers.set("Authorization", `Bearer ${u}`), n;
    });
    const s = await new bt(e).getSettings();
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
          element: w,
          forBlockEditor: "block-rte"
        };
        s.richText.contentTypes?.length !== 0 && (n.forContentTypeAlias = s.richText.contentTypes), a.push(n);
      }
    }
    t.registerMany([
      ...a,
      ...si
    ]), e.provideContext(re, new de(e));
  });
};
export {
  b as BlockGridPreviewCustomView,
  p as BlockListPreviewCustomView,
  w as RichTextPreviewCustomView,
  ni as SettingsDataSource,
  bt as SettingsRepository,
  gi as onInit
};
//# sourceMappingURL=index.js.map

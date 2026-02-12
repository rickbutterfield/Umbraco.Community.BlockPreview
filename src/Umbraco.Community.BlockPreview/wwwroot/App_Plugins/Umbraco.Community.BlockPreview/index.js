import { UMB_AUTH_CONTEXT as mt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as wt } from "@umbraco-cms/backoffice/context-api";
import { css as pe, property as d, state as T, customElement as fe, html as L, ifDefined as be, unsafeHTML as ye } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ke } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as vt, UMB_BLOCK_GRID_MANAGER_CONTEXT as gt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as Y } from "@umbraco-cms/backoffice/content";
import { UmbLitElement as _e } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as W, UmbObjectState as Ct, UmbStringState as Le, UmbBooleanState as Tt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as me } from "@umbraco-cms/backoffice/property";
import { tryExecute as N, UmbApiError as we } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as ve } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Et, UMB_BLOCK_LIST_MANAGER_CONTEXT as qt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as xt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Ut } from "@umbraco-cms/backoffice/block-rte";
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
  responseTransformer: s,
  responseValidator: r,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: a,
  sseSleepFn: l,
  url: u,
  ...c
}) => {
  let f;
  const X = l ?? ((h) => new Promise((_) => setTimeout(_, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, _ = 0;
    const z = c.signal ?? new AbortController().signal;
    for (; !z.aborted; ) {
      _++;
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
        let D = new Request(u, G);
        e && (D = await e(u, G));
        const q = await (c.fetch ?? globalThis.fetch)(D);
        if (!q.ok)
          throw new Error(
            `SSE failed: ${q.status} ${q.statusText}`
          );
        if (!q.body) throw new Error("No body in SSE response");
        const V = q.body.pipeThrough(new TextDecoderStream()).getReader();
        let se = "";
        const Ue = () => {
          try {
            V.cancel();
          } catch {
          }
        };
        z.addEventListener("abort", Ue);
        try {
          for (; ; ) {
            const { done: bt, value: yt } = await V.read();
            if (bt) break;
            se += yt;
            const Ae = se.split(`

`);
            se = Ae.pop() ?? "";
            for (const kt of Ae) {
              const _t = kt.split(`
`), Q = [];
              let Se;
              for (const S of _t)
                if (S.startsWith("data:"))
                  Q.push(S.replace(/^data:\s*/, ""));
                else if (S.startsWith("event:"))
                  Se = S.replace(/^event:\s*/, "");
                else if (S.startsWith("id:"))
                  f = S.replace(/^id:\s*/, "");
                else if (S.startsWith("retry:")) {
                  const Be = Number.parseInt(
                    S.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Be) || (h = Be);
                }
              let H, Pe = !1;
              if (Q.length) {
                const S = Q.join(`
`);
                try {
                  H = JSON.parse(S), Pe = !0;
                } catch {
                  H = S;
                }
              }
              Pe && (r && await r(H), s && (H = await s(H))), i?.({
                data: H,
                event: Se,
                id: f,
                retry: h
              }), Q.length && (yield H);
            }
          }
        } finally {
          z.removeEventListener("abort", Ue), V.releaseLock();
        }
        break;
      } catch (G) {
        if (t?.(G), o !== void 0 && _ >= o)
          break;
        const D = Math.min(
          h * 2 ** (_ - 1),
          a ?? 3e4
        );
        await X(D);
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
}, Lt = (e) => {
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
}, $t = (e) => {
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
  style: s,
  value: r
}) => {
  if (!t) {
    const a = (e ? r : r.map((l) => encodeURIComponent(l))).join(Lt(s));
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
  const n = Bt(s), o = r.map((a) => s === "label" || s === "simple" ? e ? a : encodeURIComponent(a) : ie({
    allowReserved: e,
    name: i,
    value: a
  })).join(n);
  return s === "label" || s === "matrix" ? n + o : o;
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
  valueOnly: n
}) => {
  if (r instanceof Date)
    return n ? r.toISOString() : `${i}=${r.toISOString()}`;
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
  const o = $t(s), a = Object.entries(r).map(
    ([l, u]) => ie({
      allowReserved: e,
      name: s === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(o);
  return s === "label" || s === "matrix" ? o + a : a;
}, Ot = /\{[^{}]+\}/g, Dt = ({ path: e, url: t }) => {
  let i = t;
  const s = t.match(Ot);
  if (s)
    for (const r of s) {
      let n = !1, o = r.substring(1, r.length - 1), a = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), a = "label") : o.startsWith(";") && (o = o.substring(1), a = "matrix");
      const l = e[o];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(
          r,
          Ve({ explode: n, name: o, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          r,
          Me({
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
          r,
          `;${ie({
            name: o,
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
  querySerializer: s,
  url: r
}) => {
  const n = r.startsWith("/") ? r : `/${r}`;
  let o = (e ?? "") + n;
  t && (o = Dt({ path: t, url: o }));
  let a = i ? s(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function Mt(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const It = async (e, t) => {
  const i = typeof t == "function" ? await t(e) : t;
  if (i)
    return e.scheme === "bearer" ? `Bearer ${i}` : e.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Ie = ({
  allowReserved: e,
  array: t,
  object: i
} = {}) => (r) => {
  const n = [];
  if (r && typeof r == "object")
    for (const o in r) {
      const a = r[o];
      if (a != null)
        if (Array.isArray(a)) {
          const l = Ve({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...t
          });
          l && n.push(l);
        } else if (typeof a == "object") {
          const l = Me({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "deepObject",
            value: a,
            ...i
          });
          l && n.push(l);
        } else {
          const l = ie({
            allowReserved: e,
            name: o,
            value: a
          });
          l && n.push(l);
        }
    }
  return n.join("&");
}, Nt = (e) => {
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
    const s = await It(i, t.auth);
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
}, $e = (e) => Vt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Ie(e.querySerializer),
  url: e.url
}), Oe = (e, t) => {
  const i = { ...e, ...t };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Ne(e.headers, t.headers), i;
}, jt = (e) => {
  const t = [];
  return e.forEach((i, s) => {
    t.push([s, i]);
  }), t;
}, Ne = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const s = i instanceof Headers ? jt(i) : Object.entries(i);
    for (const [r, n] of s)
      if (n === null)
        t.delete(r);
      else if (Array.isArray(n))
        for (const o of n)
          t.append(r, o);
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
    const s = this.getInterceptorIndex(t);
    return this.fns[s] ? (this.fns[s] = i, t) : !1;
  }
  use(t) {
    return this.fns.push(t), this.fns.length - 1;
  }
}
const Wt = () => ({
  error: new ne(),
  request: new ne(),
  response: new ne()
}), zt = Ie({
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
  const i = () => ({ ...t }), s = (u) => (t = Oe(t, u), i()), r = Wt(), n = async (u) => {
    const c = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Ne(t.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await Kt({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const f = $e(c);
    return { opts: c, url: f };
  }, o = async (u) => {
    const { opts: c, url: f } = await n(u), X = {
      redirect: "follow",
      ...c,
      body: Mt(c)
    };
    let j = new Request(f, X);
    for (const y of r.request.fns)
      y && (j = await y(j, c));
    const J = c.fetch;
    let h = await J(j);
    for (const y of r.response.fns)
      y && (h = await y(h, j, c));
    const _ = {
      request: j,
      response: h
    };
    if (h.ok) {
      const y = (c.parseAs === "auto" ? Nt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let V;
        switch (y) {
          case "arrayBuffer":
          case "blob":
          case "text":
            V = await h[y]();
            break;
          case "formData":
            V = new FormData();
            break;
          case "stream":
            V = h.body;
            break;
          case "json":
          default:
            V = {};
            break;
        }
        return c.responseStyle === "data" ? V : {
          data: V,
          ..._
        };
      }
      let q;
      switch (y) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          q = await h[y]();
          break;
        case "stream":
          return c.responseStyle === "data" ? h.body : {
            data: h.body,
            ..._
          };
      }
      return y === "json" && (c.responseValidator && await c.responseValidator(q), c.responseTransformer && (q = await c.responseTransformer(q))), c.responseStyle === "data" ? q : {
        data: q,
        ..._
      };
    }
    const z = await h.text();
    let F;
    try {
      F = JSON.parse(z);
    } catch {
    }
    const G = F ?? z;
    let D = G;
    for (const y of r.error.fns)
      y && (D = await y(G, h, j, c));
    if (D = D || {}, c.throwOnError)
      throw D;
    return c.responseStyle === "data" ? void 0 : {
      error: D,
      ..._
    };
  }, a = (u) => (c) => o({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: f, url: X } = await n(c);
    return Pt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (j, J) => {
        let h = new Request(j, J);
        for (const _ of r.request.fns)
          _ && (h = await _(h, f));
        return h;
      },
      url: X
    });
  };
  return {
    buildUrl: $e,
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
    request: o,
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
}, x = Ht(Re({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class R {
  static previewGridBlock(t) {
    return (t?.client ?? x).post({
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
    return (t?.client ?? x).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static getGridStylesheets(t) {
    return (t?.client ?? x).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...t
    });
  }
  static previewListBlock(t) {
    return (t?.client ?? x).post({
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
    return (t?.client ?? x).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static getListStylesheets(t) {
    return (t?.client ?? x).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return (t?.client ?? x).post({
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
    return (t?.client ?? x).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheet",
      ...t
    });
  }
  static getRteStylesheets(t) {
    return (t?.client ?? x).get({
      url: "/umbraco/block-preview/api/v1/preview/rte/stylesheets",
      ...t
    });
  }
  static getSettings(t) {
    return (t?.client ?? x).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const re = new wt("BlockPreviewContext");
var Xt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, Ke = (e) => {
  throw TypeError(e);
}, E = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ft(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Xt(t, i, r), r;
}, ge = (e, t, i) => t.has(e) || Ke("Cannot " + i), P = (e, t, i) => (ge(e, t, "read from private field"), t.get(e)), oe = (e, t, i) => t.has(e) ? Ke("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), je = (e, t, i, s) => (ge(e, t, "write to private field"), t.set(e, i), i), $ = (e, t, i) => (ge(e, t, "access private method"), i), m, Z, v, We, ze, Ge, He, le, Xe, Fe, Je, Ce;
const Jt = "block-grid-preview";
let b = class extends _e {
  constructor() {
    super(), oe(this, v), oe(this, m), oe(this, Z), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._requestId = 0, this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
      je(this, m, e), await $(this, v, We).call(this);
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
      $(this, v, Fe).call(this);
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
        return L`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return L`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return L`
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
    } else return L`<umb-block-grid-block
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
m = /* @__PURE__ */ new WeakMap();
Z = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakSet();
We = async function() {
  $(this, v, ze).call(this), $(this, v, Ge).call(this), await $(this, v, He).call(this);
};
ze = function() {
  this.observe(P(this, m)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
Ge = function() {
  this.consumeContext(me, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
He = async function() {
  try {
    await this.getContext(Y), this.consumeContext(Y, (e) => {
      e && (je(this, Z, e), this.observe(
        W([e.unique, e.structure.contentTypeUniques]),
        async ([t, i]) => {
          const s = i?.[0];
          if (!this._isConnected || !s)
            return;
          this._blockContext.unique = t?.toString() ?? "", P(this, m)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = s, P(this, m)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), $(this, v, le).call(this);
          const { data: r } = await N(this, R.getGridStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((n) => {
            const o = document.createElement("link");
            return o.rel = "stylesheet", o.href = n, o;
          }));
        }
      ));
    });
  } catch {
    P(this, Z) == null && P(this, m) != null && this._blockContext.unique == "" && this.consumeContext(ke, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const s = i[0];
        if (!this._isConnected || !s)
          return;
        this._blockContext.unique = P(this, m)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = $(this, v, Ce).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = s, $(this, v, le).call(this);
        const { data: r } = await N(this, R.getGridStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        r && r.length > 0 && (this._styleElements = r.map((n) => {
          const o = document.createElement("link");
          return o.rel = "stylesheet", o.href = n, o;
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
        s,
        r,
        n,
        o,
        a,
        l
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await $(this, v, Xe).call(this);
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
  if (P(this, m) != null && e.unique == "" && (e.unique = P(this, m).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = $(this, v, Ce).call(this, e.workspaceEditContentPath))), P(this, m) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = P(this, m).getDocumentTypeUnique()), !$(this, v, Je).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  const i = ++this._requestId;
  try {
    const { data: s, error: r } = await P(this, m).requestQueue.enqueue(
      () => N(this, R.previewGridBlock({
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
      }))
    );
    if (this._requestId !== i) return;
    s != null ? (this._htmlMarkup = s, this._isLoading = !1) : r ? (this._error = we.isUmbApiError(r) ? r.message : "An error occurred rendering the block preview", this._isLoading = !1) : this._isLoading = !1;
  } catch (s) {
    if (this._requestId !== i) return;
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", s);
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
  T()
], b.prototype, "_htmlMarkup", 2);
E([
  T()
], b.prototype, "_isLoading", 2);
E([
  T()
], b.prototype, "_error", 2);
E([
  T()
], b.prototype, "_sortModeActive", 2);
E([
  d({ attribute: !1 })
], b.prototype, "blockGridValue", 1);
b = E([
  fe(Jt)
], b);
var Qt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, Qe = (e) => {
  throw TypeError(e);
}, k = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Yt(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Qt(t, i, r), r;
}, Te = (e, t, i) => t.has(e) || Qe("Cannot " + i), B = (e, t, i) => (Te(e, t, "read from private field"), t.get(e)), ae = (e, t, i) => t.has(e) ? Qe("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Ye = (e, t, i, s) => (Te(e, t, "write to private field"), t.set(e, i), i), O = (e, t, i) => (Te(e, t, "access private method"), i), w, ee, g, Ze, et, tt, it, ue, rt, st, nt, Ee;
const Zt = "block-list-preview";
let p = class extends _e {
  constructor() {
    super(), ae(this, g), ae(this, w), ae(this, ee), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._requestId = 0, this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
      Ye(this, w, e), await O(this, g, Ze).call(this);
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
      O(this, g, st).call(this);
    }, 500));
  }
  _handleClick(e) {
    const t = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
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
        return L`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return L`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return L`
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
    } else return L`<umb-ref-list-block
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
w = /* @__PURE__ */ new WeakMap();
ee = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakSet();
Ze = async function() {
  O(this, g, et).call(this), O(this, g, tt).call(this), await O(this, g, it).call(this);
};
et = function() {
  this.observe(B(this, w)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
tt = function() {
  this.consumeContext(me, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
it = async function() {
  try {
    await this.getContext(Y), this.consumeContext(Y, (e) => {
      e && (Ye(this, ee, e), this.observe(
        W([e.unique, e.structure.contentTypeUniques]),
        async ([t, i]) => {
          const s = i?.[0];
          if (!this._isConnected || !s)
            return;
          this._blockContext.unique = t?.toString() ?? "", B(this, w)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = s, B(this, w)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), O(this, g, ue).call(this);
          const { data: r } = await N(this, R.getListStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          }));
          r && r.length > 0 && (this._styleElements = r.map((n) => {
            const o = document.createElement("link");
            return o.rel = "stylesheet", o.href = n, o;
          }));
        }
      ));
    });
  } catch {
    B(this, ee) == null && B(this, w) != null && this._blockContext.unique == "" && this.consumeContext(ke, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const s = i[0];
        if (!this._isConnected || !s)
          return;
        this._blockContext.unique = B(this, w)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = O(this, g, Ee).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = s, O(this, g, ue).call(this);
        const { data: r } = await N(this, R.getListStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        r && r.length > 0 && (this._styleElements = r.map((n) => {
          const o = document.createElement("link");
          return o.rel = "stylesheet", o.href = n, o;
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
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await O(this, g, rt).call(this);
      }
    );
  });
};
rt = function() {
  this.consumeContext(qt, (e) => {
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
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: t?.filter((o) => o.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((o) => o.key == this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((o) => o.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": s?.filter((o) => o.contentKey == this._blockContext.contentUdi) ?? []
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
  if (B(this, w) != null && e.unique == "" && (e.unique = B(this, w).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = O(this, g, Ee).call(this, e.workspaceEditContentPath))), B(this, w) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = B(this, w).getDocumentTypeUnique()), !O(this, g, nt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  const i = ++this._requestId;
  try {
    const { data: s, error: r } = await B(this, w).requestQueue.enqueue(
      () => N(this, R.previewListBlock({
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
      }))
    );
    if (this._requestId !== i) return;
    s != null ? (this._htmlMarkup = s, this._isLoading = !1) : r ? (this._error = we.isUmbApiError(r) ? r.message : "An error occurred rendering the block preview", this._isLoading = !1) : this._isLoading = !1;
  } catch (s) {
    if (this._requestId !== i) return;
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", s);
  }
};
nt = function(e) {
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
  T()
], p.prototype, "_htmlMarkup", 2);
k([
  T()
], p.prototype, "_isLoading", 2);
k([
  T()
], p.prototype, "_error", 2);
k([
  T()
], p.prototype, "_sortModeActive", 2);
k([
  T()
], p.prototype, "_blockListValue", 2);
k([
  d({ attribute: !1 })
], p.prototype, "blockListValue", 1);
p = k([
  fe(Zt)
], p);
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, ot = (e) => {
  throw TypeError(e);
}, K = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ti(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && ei(t, i, r), r;
}, qe = (e, t, i) => t.has(e) || ot("Cannot " + i), M = (e, t, i) => (qe(e, t, "read from private field"), t.get(e)), ce = (e, t, i) => t.has(e) ? ot("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), at = (e, t, i, s) => (qe(e, t, "write to private field"), t.set(e, i), i), I = (e, t, i) => (qe(e, t, "access private method"), i), U, te, A, ct, lt, ut, he, ht, dt, pt, xe;
const ii = "rich-text-preview";
let C = class extends _e {
  constructor() {
    super(), ce(this, A), ce(this, U), ce(this, te), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._requestId = 0, this._isConnected = !1, this._blockContext = {
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
      at(this, U, e), I(this, A, ct).call(this);
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
      I(this, A, dt).call(this);
    }, 500));
  }
  _handleClick(e) {
    const t = e.composedPath(), i = ["UUI-ACTION-BAR", "UMB-BLOCK-SCALE-HANDLER"];
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
      return L`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
    if (this._error)
      return L`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return L`
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
U = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakSet();
ct = function() {
  I(this, A, lt).call(this), I(this, A, ut).call(this);
};
lt = function() {
  this.consumeContext(me, async (e) => {
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
        this._blockContext.unique = t?.toString() ?? "", M(this, U)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, M(this, U)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), I(this, A, he).call(this);
        const { data: s } = await N(this, R.getRteStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        }));
        s && s.length > 0 && (this._styleElements = s.map((r) => {
          const n = document.createElement("link");
          return n.rel = "stylesheet", n.href = r, n;
        }));
      }
    ));
  }), M(this, te) == null && M(this, U) != null && this._blockContext.unique == "" && this.consumeContext(ke, async (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, async (t) => {
      const i = t[0];
      if (!this._isConnected || !i)
        return;
      this._blockContext.unique = M(this, U)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = I(this, A, xe).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i, I(this, A, he).call(this);
      const { data: s } = await N(this, R.getRteStylesheets({
        query: {
          documentTypeUnique: this._blockContext.documentTypeUnique,
          nodeKey: this._blockContext.unique
        }
      }));
      s && s.length > 0 && (this._styleElements = s.map((r) => {
        const n = document.createElement("link");
        return n.rel = "stylesheet", n.href = r, n;
      }));
    });
  });
};
he = function() {
  this.consumeContext(xt, (e) => {
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
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = n ?? "", await I(this, A, ht).call(this);
      }
    );
  });
};
ht = function() {
  this.consumeContext(Ut, (e) => {
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
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: t?.filter((o) => o.key == this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((o) => o.key == this._blockContext.settingsUdi) ?? [],
          expose: r?.filter((o) => o.contentKey == this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": s?.filter((o) => o.contentKey == this._blockContext.contentUdi) ?? []
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
  if (M(this, U) != null && e.unique == "" && (e.unique = M(this, U).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = I(this, A, xe).call(this, e.workspaceEditContentPath))), M(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = M(this, U).getDocumentTypeUnique()), !I(this, A, pt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  const i = ++this._requestId;
  try {
    const { data: s, error: r } = await M(this, U).requestQueue.enqueue(
      () => N(this, R.previewRichTextMarkup({
        body: JSON.stringify(this.blockRteValue),
        query: {
          blockEditorAlias: e.blockEditorAlias,
          nodeKey: e.unique,
          contentElementAlias: e.contentElementTypeAlias,
          documentTypeUnique: e.documentTypeUnique,
          culture: e.culture
        }
      }))
    );
    if (this._requestId !== i) return;
    s != null ? (this._htmlMarkup = s, this._isLoading = !1) : r ? (this._error = we.isUmbApiError(r) ? r.message : "An error occurred rendering the block preview", this._isLoading = !1) : this._isLoading = !1;
  } catch (s) {
    if (this._requestId !== i) return;
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", s);
  }
};
pt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
xe = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
C.styles = [
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
], C.prototype, "content", 2);
K([
  d({ attribute: !1 })
], C.prototype, "settings", 2);
K([
  d({ attribute: !1 })
], C.prototype, "contentKey", 2);
K([
  d({ attribute: !1 })
], C.prototype, "config", 2);
K([
  T()
], C.prototype, "_htmlMarkup", 2);
K([
  T()
], C.prototype, "_isLoading", 2);
K([
  T()
], C.prototype, "_error", 2);
K([
  T()
], C.prototype, "_blockRteValue", 2);
K([
  d({ attribute: !1 })
], C.prototype, "blockRteValue", 1);
C = K([
  fe(ii)
], C);
class ri {
  #e;
  #i = 0;
  #t = [];
  constructor(t = 3) {
    this.#e = t;
  }
  /**
   * Enqueue a task to run with concurrency limiting.
   * If fewer than `maxConcurrent` tasks are active, the task runs immediately.
   * Otherwise it waits until a slot is available.
   */
  async enqueue(t) {
    this.#i >= this.#e && await new Promise((i) => {
      this.#t.push(i);
    }), this.#i++;
    try {
      return await t();
    } finally {
      this.#i--, this.#t.length > 0 && this.#t.shift()();
    }
  }
}
class de extends De {
  constructor(t) {
    super(t), this.#i = new ri(3), this.#t = new Ct(void 0), this.settings = this.#t.asObservable(), this.#r = new Le(""), this.unique = this.#r.asObservable(), this.#s = new Le(""), this.documentTypeUnique = this.#s.asObservable(), this.#n = new Tt(!1), this.sortModeActive = this.#n.asObservable(), this.#e = new ft(t), this.getSettings(), this.setSortMode(!1);
  }
  #e;
  #i;
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#i;
  }
  #t;
  #r;
  #s;
  #n;
  async getSettings() {
    const t = await this.#e.getSettings();
    this.#t.setValue(t);
  }
  getUnique() {
    return this.#r.getValue();
  }
  async setUnique(t) {
    t != "" && this.#r.setValue(t);
  }
  getDocumentTypeUnique() {
    return this.#s.getValue();
  }
  async setDocumentTypeUnique(t) {
    t != "" && this.#s.setValue(t);
  }
  getSortMode() {
    return this.#n.getValue();
  }
  async setSortMode(t) {
    this.#n.setValue(t);
  }
}
const si = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: de,
  default: de
}, Symbol.toStringTag, { value: "Module" })), ni = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => si)
  }
], oi = [...ni];
class ai {
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
    super(t), this.#e = new ai(t);
  }
  async getSettings() {
    const t = await this.#e.getSettings();
    if (t && t?.data)
      return t.data;
  }
}
const Ci = async (e, t) => {
  e.consumeContext(mt, async (i) => {
    if (!i) return;
    const s = i.getOpenApiConfiguration();
    x.setConfig({
      baseUrl: s?.base ?? "",
      auth: s?.token ?? void 0,
      credentials: s?.credentials ?? "same-origin"
    }), x.interceptors.request.use(async (a, l) => {
      const u = await s.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const n = await new ft(e).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: b,
          forBlockEditor: "block-grid"
        };
        n.blockGrid.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockGrid.contentTypes), o.push(a);
      }
      if (n.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        n.blockList.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.blockList.contentTypes), o.push(a);
      }
      if (n.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: C,
          forBlockEditor: "block-rte"
        };
        n.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    t.registerMany([
      ...o,
      ...oi
    ]), e.provideContext(re, new de(e));
  });
};
export {
  b as BlockGridPreviewCustomView,
  p as BlockListPreviewCustomView,
  C as RichTextPreviewCustomView,
  ai as SettingsDataSource,
  ft as SettingsRepository,
  Ci as onInit
};
//# sourceMappingURL=index.js.map

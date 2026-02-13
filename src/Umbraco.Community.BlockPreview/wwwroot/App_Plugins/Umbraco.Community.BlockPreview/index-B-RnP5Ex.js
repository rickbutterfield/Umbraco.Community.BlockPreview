import { UMB_AUTH_CONTEXT as vt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as gt } from "@umbraco-cms/backoffice/context-api";
import { css as fe, property as d, state as T, customElement as be, html as O, ifDefined as ye, unsafeHTML as ke } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as _e } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ct, UMB_BLOCK_GRID_MANAGER_CONTEXT as Tt, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as Et } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as Q } from "@umbraco-cms/backoffice/content";
import { UmbLitElement as me } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as j, UmbObjectState as qt, UmbStringState as Le, UmbBooleanState as xt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as we, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as $e } from "@umbraco-cms/backoffice/property";
import { tryExecute as R, UmbApiError as ve } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as ge } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Ut, UMB_BLOCK_LIST_MANAGER_CONTEXT as At, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as Pt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as St, UMB_BLOCK_RTE_MANAGER_CONTEXT as Bt } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Ot } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as Ie } from "@umbraco-cms/backoffice/class-api";
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
  const X = l ?? ((h) => new Promise((_) => setTimeout(_, h)));
  return { stream: async function* () {
    let h = o ?? 3e3, _ = 0;
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
        let M = new Request(u, G);
        e && (M = await e(u, G));
        const q = await (c.fetch ?? globalThis.fetch)(M);
        if (!q.ok)
          throw new Error(
            `SSE failed: ${q.status} ${q.statusText}`
          );
        if (!q.body) throw new Error("No body in SSE response");
        const D = q.body.pipeThrough(new TextDecoderStream()).getReader();
        let se = "";
        const Ae = () => {
          try {
            D.cancel();
          } catch {
          }
        };
        z.addEventListener("abort", Ae);
        try {
          for (; ; ) {
            const { done: kt, value: _t } = await D.read();
            if (kt) break;
            se += _t;
            const Pe = se.split(`

`);
            se = Pe.pop() ?? "";
            for (const mt of Pe) {
              const wt = mt.split(`
`), J = [];
              let Se;
              for (const P of wt)
                if (P.startsWith("data:"))
                  J.push(P.replace(/^data:\s*/, ""));
                else if (P.startsWith("event:"))
                  Se = P.replace(/^event:\s*/, "");
                else if (P.startsWith("id:"))
                  f = P.replace(/^id:\s*/, "");
                else if (P.startsWith("retry:")) {
                  const Oe = Number.parseInt(
                    P.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Oe) || (h = Oe);
                }
              let H, Be = !1;
              if (J.length) {
                const P = J.join(`
`);
                try {
                  H = JSON.parse(P), Be = !0;
                } catch {
                  H = P;
                }
              }
              Be && (r && await r(H), s && (H = await s(H))), i?.({
                data: H,
                event: Se,
                id: f,
                retry: h
              }), J.length && (yield H);
            }
          }
        } finally {
          z.removeEventListener("abort", Ae), D.releaseLock();
        }
        break;
      } catch (G) {
        if (t?.(G), n !== void 0 && _ >= n)
          break;
        const M = Math.min(
          h * 2 ** (_ - 1),
          a ?? 3e4
        );
        await X(M);
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
}, It = (e) => {
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
}, Vt = (e) => {
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
    const a = (e ? r : r.map((l) => encodeURIComponent(l))).join(It(s));
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
  const o = Dt(s), n = r.map((a) => s === "label" || s === "simple" ? e ? a : encodeURIComponent(a) : ie({
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
}, Re = ({
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
  const n = Vt(s), a = Object.entries(r).map(
    ([l, u]) => ie({
      allowReserved: e,
      name: s === "deepObject" ? `${i}[${l}]` : l,
      value: u
    })
  ).join(n);
  return s === "label" || s === "matrix" ? n + a : a;
}, Rt = /\{[^{}]+\}/g, Nt = ({ path: e, url: t }) => {
  let i = t;
  const s = t.match(Rt);
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
          Ve({ explode: o, name: n, style: a, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          r,
          Re({
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
}, Kt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: s,
  url: r
}) => {
  const o = r.startsWith("/") ? r : `/${r}`;
  let n = (e ?? "") + o;
  t && (n = Nt({ path: t, url: n }));
  let a = i ? s(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (n += `?${a}`), n;
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
  const o = [];
  if (r && typeof r == "object")
    for (const n in r) {
      const a = r[n];
      if (a != null)
        if (Array.isArray(a)) {
          const l = Ve({
            allowReserved: e,
            explode: !0,
            name: n,
            style: "form",
            value: a,
            ...t
          });
          l && o.push(l);
        } else if (typeof a == "object") {
          const l = Re({
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
    const s = await jt(i, t.auth);
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
}, Me = (e) => Kt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Ne(e.querySerializer),
  url: e.url
}), De = (e, t) => {
  const i = { ...e, ...t };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Ke(e.headers, t.headers), i;
}, Xt = (e) => {
  const t = [];
  return e.forEach((i, s) => {
    t.push([s, i]);
  }), t;
}, Ke = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const s = i instanceof Headers ? Xt(i) : Object.entries(i);
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
const Ft = () => ({
  error: new oe(),
  request: new oe(),
  response: new oe()
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
  const i = () => ({ ...t }), s = (u) => (t = De(t, u), i()), r = Ft(), o = async (u) => {
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
  }, n = async (u) => {
    const { opts: c, url: f } = await o(u), X = {
      redirect: "follow",
      ...c,
      body: Wt(c)
    };
    let W = new Request(f, X);
    for (const y of r.request.fns)
      y && (W = await y(W, c));
    const Y = c.fetch;
    let h = await Y(W);
    for (const y of r.response.fns)
      y && (h = await y(h, W, c));
    const _ = {
      request: W,
      response: h
    };
    if (h.ok) {
      const y = (c.parseAs === "auto" ? zt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let D;
        switch (y) {
          case "arrayBuffer":
          case "blob":
          case "text":
            D = await h[y]();
            break;
          case "formData":
            D = new FormData();
            break;
          case "stream":
            D = h.body;
            break;
          case "json":
          default:
            D = {};
            break;
        }
        return c.responseStyle === "data" ? D : {
          data: D,
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
    let M = G;
    for (const y of r.error.fns)
      y && (M = await y(G, h, W, c));
    if (M = M || {}, c.throwOnError)
      throw M;
    return c.responseStyle === "data" ? void 0 : {
      error: M,
      ..._
    };
  }, a = (u) => (c) => n({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: f, url: X } = await o(c);
    return Mt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (W, Y) => {
        let h = new Request(W, Y);
        for (const _ of r.request.fns)
          _ && (h = await _(h, f));
        return h;
      },
      url: X
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
}, x = Qt(We({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class N {
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
const re = new gt("BlockPreviewContext");
var Zt = Object.defineProperty, ei = Object.getOwnPropertyDescriptor, je = (e) => {
  throw TypeError(e);
}, E = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ei(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Zt(t, i, r), r;
}, Ce = (e, t, i) => t.has(e) || je("Cannot " + i), S = (e, t, i) => (Ce(e, t, "read from private field"), t.get(e)), ne = (e, t, i) => t.has(e) ? je("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ze = (e, t, i, s) => (Ce(e, t, "write to private field"), t.set(e, i), i), L = (e, t, i) => (Ce(e, t, "access private method"), i), m, Z, v, Ge, He, Xe, Fe, le, Ye, Je, Qe, Te;
const ti = "block-grid-preview";
let b = class extends me {
  constructor() {
    super(), ne(this, v), ne(this, m), ne(this, Z), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._requestId = 0, this._isConnected = !1, this._sortModeActive = !1, this._blockContext = {
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
      ze(this, m, e), await L(this, v, Ge).call(this);
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
      L(this, v, Je).call(this);
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
      if (t.find((o) => o instanceof ge && o.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (t.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const r = t.find((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
      r instanceof Element ? window.history.pushState({}, "", r.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return O`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return O`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return O`
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
    } else return O`<umb-block-grid-block
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
Ge = async function() {
  L(this, v, He).call(this), L(this, v, Xe).call(this), await L(this, v, Fe).call(this);
};
He = function() {
  this.observe(S(this, m)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
Xe = function() {
  this.consumeContext(we, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
Fe = async function() {
  try {
    await this.getContext(Q), this.consumeContext(Q, (e) => {
      e && (ze(this, Z, e), this.observe(
        j([e.unique, e.structure.contentTypeUniques]),
        async ([t, i]) => {
          const s = i?.[0];
          if (!this._isConnected || !s)
            return;
          this._blockContext.unique = t?.toString() ?? "", S(this, m)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = s, S(this, m)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), L(this, v, le).call(this);
          const { data: r } = await R(this, N.getGridStylesheets({
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
    S(this, Z) == null && S(this, m) != null && this._blockContext.unique == "" && this.consumeContext(_e, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const s = i[0];
        if (!this._isConnected || !s)
          return;
        this._blockContext.unique = S(this, m)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = L(this, v, Te).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = s, L(this, v, le).call(this);
        const { data: r } = await R(this, N.getGridStylesheets({
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
        s,
        r,
        o,
        n,
        a,
        l
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = o ?? "", this._blockContext.areas = n, this._blockContext.layout = a, this._blockContext.layoutAreas = l, await L(this, v, Ye).call(this);
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
Je = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (S(this, m) != null && e.unique == "" && (e.unique = S(this, m).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = L(this, v, Te).call(this, e.workspaceEditContentPath))), S(this, m) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = S(this, m).getDocumentTypeUnique()), !L(this, v, Qe).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  const i = ++this._requestId;
  try {
    const { data: s, error: r } = await S(this, m).requestQueue.enqueue(
      () => R(this, N.previewGridBlock({
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
    s != null ? (this._htmlMarkup = s, this._isLoading = !1) : r ? (this._error = ve.isUmbApiError(r) ? r.message : "An error occurred rendering the block preview", this._isLoading = !1) : this._isLoading = !1;
  } catch (s) {
    if (this._requestId !== i) return;
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", s);
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
  be(ti)
], b);
var ii = Object.defineProperty, ri = Object.getOwnPropertyDescriptor, Ze = (e) => {
  throw TypeError(e);
}, k = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ri(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && ii(t, i, r), r;
}, Ee = (e, t, i) => t.has(e) || Ze("Cannot " + i), B = (e, t, i) => (Ee(e, t, "read from private field"), t.get(e)), ae = (e, t, i) => t.has(e) ? Ze("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), et = (e, t, i, s) => (Ee(e, t, "write to private field"), t.set(e, i), i), $ = (e, t, i) => (Ee(e, t, "access private method"), i), w, ee, g, tt, it, rt, st, ue, ot, nt, at, qe;
const si = "block-list-preview";
let p = class extends me {
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
      et(this, w, e), await $(this, g, tt).call(this);
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
      $(this, g, nt).call(this);
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
      if (t.find((o) => o instanceof ge && o.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (t.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const r = t.find((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
      r instanceof Element ? window.history.pushState({}, "", r.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return O`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return O`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return O`
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
    } else return O`<umb-ref-list-block
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
tt = async function() {
  $(this, g, it).call(this), $(this, g, rt).call(this), await $(this, g, st).call(this);
};
it = function() {
  this.observe(B(this, w)?.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
rt = function() {
  this.consumeContext(we, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
st = async function() {
  try {
    await this.getContext(Q), this.consumeContext(Q, (e) => {
      e && (et(this, ee, e), this.observe(
        j([e.unique, e.structure.contentTypeUniques]),
        async ([t, i]) => {
          const s = i?.[0];
          if (!this._isConnected || !s)
            return;
          this._blockContext.unique = t?.toString() ?? "", B(this, w)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = s, B(this, w)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), $(this, g, ue).call(this);
          const { data: r } = await R(this, N.getListStylesheets({
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
    B(this, ee) == null && B(this, w) != null && this._blockContext.unique == "" && this.consumeContext(_e, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        const s = i[0];
        if (!this._isConnected || !s)
          return;
        this._blockContext.unique = B(this, w)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = $(this, g, qe).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = s, $(this, g, ue).call(this);
        const { data: r } = await R(this, N.getListStylesheets({
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
  this.consumeContext(Ut, (e) => {
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
        s,
        r,
        o
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = o ?? "", await $(this, g, ot).call(this);
      }
    );
  });
};
ot = function() {
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
nt = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (B(this, w) != null && e.unique == "" && (e.unique = B(this, w).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = $(this, g, qe).call(this, e.workspaceEditContentPath))), B(this, w) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = B(this, w).getDocumentTypeUnique()), !$(this, g, at).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  const i = ++this._requestId;
  try {
    const { data: s, error: r } = await B(this, w).requestQueue.enqueue(
      () => R(this, N.previewListBlock({
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
    s != null ? (this._htmlMarkup = s, this._isLoading = !1) : r ? (this._error = ve.isUmbApiError(r) ? r.message : "An error occurred rendering the block preview", this._isLoading = !1) : this._isLoading = !1;
  } catch (s) {
    if (this._requestId !== i) return;
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", s);
  }
};
at = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
qe = function(e) {
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
  be(si)
], p);
var oi = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, ct = (e) => {
  throw TypeError(e);
}, K = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ni(t, i) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && oi(t, i, r), r;
}, xe = (e, t, i) => t.has(e) || ct("Cannot " + i), I = (e, t, i) => (xe(e, t, "read from private field"), t.get(e)), ce = (e, t, i) => t.has(e) ? ct("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), lt = (e, t, i, s) => (xe(e, t, "write to private field"), t.set(e, i), i), V = (e, t, i) => (xe(e, t, "access private method"), i), U, te, A, ut, ht, dt, he, pt, ft, bt, Ue;
const ai = "rich-text-preview";
let C = class extends me {
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
      lt(this, U, e), V(this, A, ut).call(this);
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
      V(this, A, ft).call(this);
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
      if (t.find((o) => o instanceof ge && o.href?.includes("block/edit")))
        return;
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (t.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const r = t.find((o) => o instanceof Element && o.tagName === "A" && o.classList.contains("block-preview-edit"));
      r instanceof Element ? window.history.pushState({}, "", r.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  render() {
    if (this._isLoading)
      return O`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
    if (this._error)
      return O`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return O`
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
U = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakSet();
ut = function() {
  V(this, A, ht).call(this), V(this, A, dt).call(this);
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
        this._blockContext.unique = t?.toString() ?? "", I(this, U)?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i, I(this, U)?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), V(this, A, he).call(this);
        const { data: s } = await R(this, N.getRteStylesheets({
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
  }), I(this, te) == null && I(this, U) != null && this._blockContext.unique == "" && this.consumeContext(_e, async (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, async (t) => {
      const i = t[0];
      if (!this._isConnected || !i)
        return;
      this._blockContext.unique = I(this, U)?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = V(this, A, Ue).call(this, this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = i, V(this, A, he).call(this);
      const { data: s } = await R(this, N.getRteStylesheets({
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
  this.consumeContext(St, (e) => {
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
        s,
        r,
        o
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = s ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = o ?? "", await V(this, A, pt).call(this);
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
ft = async function() {
  if (!this._isConnected)
    return;
  const e = this._blockContext;
  if (I(this, U) != null && e.unique == "" && (e.unique = I(this, U).getUnique(), !e.unique && e.workspaceEditContentPath && (e.unique = V(this, A, Ue).call(this, e.workspaceEditContentPath))), I(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = I(this, U).getDocumentTypeUnique()), !V(this, A, bt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  const i = ++this._requestId;
  try {
    const { data: s, error: r } = await I(this, U).requestQueue.enqueue(
      () => R(this, N.previewRichTextMarkup({
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
    s != null ? (this._htmlMarkup = s, this._isLoading = !1) : r ? (this._error = ve.isUmbApiError(r) ? r.message : "An error occurred rendering the block preview", this._isLoading = !1) : this._isLoading = !1;
  } catch (s) {
    if (this._requestId !== i) return;
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", s);
  }
};
bt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
Ue = function(e) {
  const t = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
  return t ? t[1] : "";
};
C.styles = [
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
  be(ai)
], C);
class ci {
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
class de extends Ie {
  constructor(t) {
    super(t), this.#i = new ci(3), this.#t = new qt(void 0), this.settings = this.#t.asObservable(), this.#r = new Le(""), this.unique = this.#r.asObservable(), this.#s = new Le(""), this.documentTypeUnique = this.#s.asObservable(), this.#o = new xt(!1), this.sortModeActive = this.#o.asObservable(), this.#e = new yt(t), this.getSettings(), this.setSortMode(!1);
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
  #o;
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
    return this.#o.getValue();
  }
  async setSortMode(t) {
    this.#o.setValue(t);
  }
}
const li = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: de,
  default: de
}, Symbol.toStringTag, { value: "Module" })), ui = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => li)
  }
], hi = [...ui], pe = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...Lt.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action-Ctyxg4Hh.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, di = [
  pe
], pi = [
  {
    ...pe.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode-D78c4PGf.js"),
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
    api: () => import("./block-list-sort-mode-CiLGTUmJ.js"),
    forPropertyEditorUis: [Pt],
    conditions: [
      {
        alias: $e
      }
    ]
  }
];
class fi {
  #e;
  constructor(t) {
    this.#e = t;
  }
  async getSettings() {
    return await R(this.#e, N.getSettings());
  }
}
class yt extends Ie {
  #e;
  constructor(t) {
    super(t), this.#e = new fi(t);
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
    const s = i.getOpenApiConfiguration();
    x.setConfig({
      baseUrl: s?.base ?? "",
      auth: s?.token ?? void 0,
      credentials: s?.credentials ?? "same-origin"
    }), x.interceptors.request.use(async (a, l) => {
      const u = await s.token();
      return a.headers.set("Authorization", `Bearer ${u}`), a;
    });
    const o = await new yt(e).getSettings();
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
          element: C,
          forBlockEditor: "block-rte"
        };
        o.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = o.richText.contentTypes), n.push(a);
      }
    }
    t.registerMany([
      ...n,
      ...hi,
      ...di,
      ...pi
    ]), e.provideContext(re, new de(e));
  });
};
export {
  re as B,
  C as R,
  fi as S,
  b as a,
  p as b,
  yt as c,
  Si as o
};
//# sourceMappingURL=index-B-RnP5Ex.js.map

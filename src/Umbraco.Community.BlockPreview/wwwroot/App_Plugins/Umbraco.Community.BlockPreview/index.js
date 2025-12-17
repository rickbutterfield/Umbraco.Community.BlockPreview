var Ve = (e) => {
  throw TypeError(e);
};
var Ke = (e, t, r) => t.has(e) || Ve("Cannot " + r);
var m = (e, t, r) => (Ke(e, t, "read from private field"), r ? r.call(e) : t.get(e)), z = (e, t, r) => t.has(e) ? Ve("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), G = (e, t, r, i) => (Ke(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r);
import { UMB_AUTH_CONTEXT as Bt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as Ot } from "@umbraco-cms/backoffice/context-api";
import { css as Te, property as d, state as w, customElement as Ee, html as A, ifDefined as xe, unsafeHTML as Ue } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Ae } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Pt, UMB_BLOCK_GRID_MANAGER_CONTEXT as $t, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as Lt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as re } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as qe } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as j, UmbObjectState as Mt, UmbStringState as je, UmbBooleanState as Dt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as Se, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as ze } from "@umbraco-cms/backoffice/property";
import { tryExecute as he, UmbApiError as Be } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Oe } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as It, UMB_BLOCK_LIST_MANAGER_CONTEXT as Rt, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as Nt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Vt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Kt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as He } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as jt } from "@umbraco-cms/backoffice/property-action";
const zt = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, r) => typeof r == "bigint" ? r.toString() : r
  )
}, Gt = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: r,
  responseTransformer: i,
  responseValidator: s,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: a,
  sseSleepFn: c,
  url: u,
  ...l
}) => {
  let f;
  const H = c ?? ((h) => new Promise((k) => setTimeout(k, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, k = 0;
    const X = l.signal ?? new AbortController().signal;
    for (; !X.aborted; ) {
      k++;
      const te = l.headers instanceof Headers ? l.headers : new Headers(l.headers);
      f !== void 0 && te.set("Last-Event-ID", f);
      try {
        const F = {
          redirect: "follow",
          ...l,
          body: l.serializedBody,
          headers: te,
          signal: X
        };
        let O = new Request(u, F);
        e && (O = await e(u, F));
        const C = await (l.fetch ?? globalThis.fetch)(O);
        if (!C.ok)
          throw new Error(
            `SSE failed: ${C.status} ${C.statusText}`
          );
        if (!C.body) throw new Error("No body in SSE response");
        const P = C.body.pipeThrough(new TextDecoderStream()).getReader();
        let pe = "";
        const Me = () => {
          try {
            P.cancel();
          } catch {
          }
        };
        X.addEventListener("abort", Me);
        try {
          for (; ; ) {
            const { done: Ut, value: At } = await P.read();
            if (Ut) break;
            pe += At;
            const De = pe.split(`

`);
            pe = De.pop() ?? "";
            for (const qt of De) {
              const St = qt.split(`
`), ae = [];
              let Ie;
              for (const U of St)
                if (U.startsWith("data:"))
                  ae.push(U.replace(/^data:\s*/, ""));
                else if (U.startsWith("event:"))
                  Ie = U.replace(/^event:\s*/, "");
                else if (U.startsWith("id:"))
                  f = U.replace(/^id:\s*/, "");
                else if (U.startsWith("retry:")) {
                  const Ne = Number.parseInt(
                    U.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Ne) || (h = Ne);
                }
              let Y, Re = !1;
              if (ae.length) {
                const U = ae.join(`
`);
                try {
                  Y = JSON.parse(U), Re = !0;
                } catch {
                  Y = U;
                }
              }
              Re && (s && await s(Y), i && (Y = await i(Y))), r == null || r({
                data: Y,
                event: Ie,
                id: f,
                retry: h
              }), ae.length && (yield Y);
            }
          }
        } finally {
          X.removeEventListener("abort", Me), P.releaseLock();
        }
        break;
      } catch (F) {
        if (t == null || t(F), o !== void 0 && k >= o)
          break;
        const O = Math.min(
          h * 2 ** (k - 1),
          a ?? 3e4
        );
        await H(O);
      }
    }
  }() };
}, Wt = (e) => {
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
}, Ht = (e) => {
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
}, Xt = (e) => {
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
}, Xe = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: i,
  value: s
}) => {
  if (!t) {
    const a = (e ? s : s.map((c) => encodeURIComponent(c))).join(Ht(i));
    switch (i) {
      case "label":
        return `.${a}`;
      case "matrix":
        return `;${r}=${a}`;
      case "simple":
        return a;
      default:
        return `${r}=${a}`;
    }
  }
  const n = Wt(i), o = s.map((a) => i === "label" || i === "simple" ? e ? a : encodeURIComponent(a) : de({
    allowReserved: e,
    name: r,
    value: a
  })).join(n);
  return i === "label" || i === "matrix" ? n + o : o;
}, de = ({
  allowReserved: e,
  name: t,
  value: r
}) => {
  if (r == null)
    return "";
  if (typeof r == "object")
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these."
    );
  return `${t}=${e ? r : encodeURIComponent(r)}`;
}, Fe = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: i,
  value: s,
  valueOnly: n
}) => {
  if (s instanceof Date)
    return n ? s.toISOString() : `${r}=${s.toISOString()}`;
  if (i !== "deepObject" && !t) {
    let c = [];
    Object.entries(s).forEach(([l, f]) => {
      c = [
        ...c,
        l,
        e ? f : encodeURIComponent(f)
      ];
    });
    const u = c.join(",");
    switch (i) {
      case "form":
        return `${r}=${u}`;
      case "label":
        return `.${u}`;
      case "matrix":
        return `;${r}=${u}`;
      default:
        return u;
    }
  }
  const o = Xt(i), a = Object.entries(s).map(
    ([c, u]) => de({
      allowReserved: e,
      name: i === "deepObject" ? `${r}[${c}]` : c,
      value: u
    })
  ).join(o);
  return i === "label" || i === "matrix" ? o + a : a;
}, Ft = /\{[^{}]+\}/g, Yt = ({ path: e, url: t }) => {
  let r = t;
  const i = t.match(Ft);
  if (i)
    for (const s of i) {
      let n = !1, o = s.substring(1, s.length - 1), a = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), a = "label") : o.startsWith(";") && (o = o.substring(1), a = "matrix");
      const c = e[o];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        r = r.replace(
          s,
          Xe({ explode: n, name: o, style: a, value: c })
        );
        continue;
      }
      if (typeof c == "object") {
        r = r.replace(
          s,
          Fe({
            explode: n,
            name: o,
            style: a,
            value: c,
            valueOnly: !0
          })
        );
        continue;
      }
      if (a === "matrix") {
        r = r.replace(
          s,
          `;${de({
            name: o,
            value: c
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        a === "label" ? `.${c}` : c
      );
      r = r.replace(s, u);
    }
  return r;
}, Jt = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: i,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let o = (e ?? "") + n;
  t && (o = Yt({ path: t, url: o }));
  let a = r ? i(r) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (o += `?${a}`), o;
};
function Qt(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const Zt = async (e, t) => {
  const r = typeof t == "function" ? await t(e) : t;
  if (r)
    return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, Ye = ({
  allowReserved: e,
  array: t,
  object: r
} = {}) => (s) => {
  const n = [];
  if (s && typeof s == "object")
    for (const o in s) {
      const a = s[o];
      if (a != null)
        if (Array.isArray(a)) {
          const c = Xe({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "form",
            value: a,
            ...t
          });
          c && n.push(c);
        } else if (typeof a == "object") {
          const c = Fe({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "deepObject",
            value: a,
            ...r
          });
          c && n.push(c);
        } else {
          const c = de({
            allowReserved: e,
            name: o,
            value: a
          });
          c && n.push(c);
        }
    }
  return n.join("&");
}, er = (e) => {
  var r;
  if (!e)
    return "stream";
  const t = (r = e.split(";")[0]) == null ? void 0 : r.trim();
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
}, tr = (e, t) => {
  var r, i;
  return t ? !!(e.headers.has(t) || (r = e.query) != null && r[t] || (i = e.headers.get("Cookie")) != null && i.includes(`${t}=`)) : !1;
}, rr = async ({
  security: e,
  ...t
}) => {
  for (const r of e) {
    if (tr(t, r.name))
      continue;
    const i = await Zt(r, t.auth);
    if (!i)
      continue;
    const s = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        t.query || (t.query = {}), t.query[s] = i;
        break;
      case "cookie":
        t.headers.append("Cookie", `${s}=${i}`);
        break;
      case "header":
      default:
        t.headers.set(s, i);
        break;
    }
  }
}, Ge = (e) => Jt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Ye(e.querySerializer),
  url: e.url
}), We = (e, t) => {
  var i;
  const r = { ...e, ...t };
  return (i = r.baseUrl) != null && i.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = Je(e.headers, t.headers), r;
}, ir = (e) => {
  const t = [];
  return e.forEach((r, i) => {
    t.push([i, r]);
  }), t;
}, Je = (...e) => {
  const t = new Headers();
  for (const r of e) {
    if (!r)
      continue;
    const i = r instanceof Headers ? ir(r) : Object.entries(r);
    for (const [s, n] of i)
      if (n === null)
        t.delete(s);
      else if (Array.isArray(n))
        for (const o of n)
          t.append(s, o);
      else n !== void 0 && t.set(
        s,
        typeof n == "object" ? JSON.stringify(n) : n
      );
  }
  return t;
};
class be {
  constructor() {
    this.fns = [];
  }
  clear() {
    this.fns = [];
  }
  eject(t) {
    const r = this.getInterceptorIndex(t);
    this.fns[r] && (this.fns[r] = null);
  }
  exists(t) {
    const r = this.getInterceptorIndex(t);
    return !!this.fns[r];
  }
  getInterceptorIndex(t) {
    return typeof t == "number" ? this.fns[t] ? t : -1 : this.fns.indexOf(t);
  }
  update(t, r) {
    const i = this.getInterceptorIndex(t);
    return this.fns[i] ? (this.fns[i] = r, t) : !1;
  }
  use(t) {
    return this.fns.push(t), this.fns.length - 1;
  }
}
const or = () => ({
  error: new be(),
  request: new be(),
  response: new be()
}), sr = Ye({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), nr = {
  "Content-Type": "application/json"
}, Qe = (e = {}) => ({
  ...zt,
  headers: nr,
  parseAs: "auto",
  querySerializer: sr,
  ...e
}), ar = (e = {}) => {
  let t = We(Qe(), e);
  const r = () => ({ ...t }), i = (u) => (t = We(t, u), r()), s = or(), n = async (u) => {
    const l = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Je(t.headers, u.headers),
      serializedBody: void 0
    };
    l.security && await rr({
      ...l,
      security: l.security
    }), l.requestValidator && await l.requestValidator(l), l.body !== void 0 && l.bodySerializer && (l.serializedBody = l.bodySerializer(l.body)), (l.body === void 0 || l.serializedBody === "") && l.headers.delete("Content-Type");
    const f = Ge(l);
    return { opts: l, url: f };
  }, o = async (u) => {
    const { opts: l, url: f } = await n(u), H = {
      redirect: "follow",
      ...l,
      body: Qt(l)
    };
    let R = new Request(f, H);
    for (const y of s.request.fns)
      y && (R = await y(R, l));
    const ne = l.fetch;
    let h = await ne(R);
    for (const y of s.response.fns)
      y && (h = await y(h, R, l));
    const k = {
      request: R,
      response: h
    };
    if (h.ok) {
      const y = (l.parseAs === "auto" ? er(h.headers.get("Content-Type")) : l.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let P;
        switch (y) {
          case "arrayBuffer":
          case "blob":
          case "text":
            P = await h[y]();
            break;
          case "formData":
            P = new FormData();
            break;
          case "stream":
            P = h.body;
            break;
          case "json":
          default:
            P = {};
            break;
        }
        return l.responseStyle === "data" ? P : {
          data: P,
          ...k
        };
      }
      let C;
      switch (y) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          C = await h[y]();
          break;
        case "stream":
          return l.responseStyle === "data" ? h.body : {
            data: h.body,
            ...k
          };
      }
      return y === "json" && (l.responseValidator && await l.responseValidator(C), l.responseTransformer && (C = await l.responseTransformer(C))), l.responseStyle === "data" ? C : {
        data: C,
        ...k
      };
    }
    const X = await h.text();
    let te;
    try {
      te = JSON.parse(X);
    } catch {
    }
    const F = te ?? X;
    let O = F;
    for (const y of s.error.fns)
      y && (O = await y(F, h, R, l));
    if (O = O || {}, l.throwOnError)
      throw O;
    return l.responseStyle === "data" ? void 0 : {
      error: O,
      ...k
    };
  }, a = (u) => (l) => o({ ...l, method: u }), c = (u) => async (l) => {
    const { opts: f, url: H } = await n(l);
    return Gt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (R, ne) => {
        let h = new Request(R, ne);
        for (const k of s.request.fns)
          k && (h = await k(h, f));
        return h;
      },
      url: H
    });
  };
  return {
    buildUrl: Ge,
    connect: a("CONNECT"),
    delete: a("DELETE"),
    get: a("GET"),
    getConfig: r,
    head: a("HEAD"),
    interceptors: s,
    options: a("OPTIONS"),
    patch: a("PATCH"),
    post: a("POST"),
    put: a("PUT"),
    request: o,
    setConfig: i,
    sse: {
      connect: c("CONNECT"),
      delete: c("DELETE"),
      get: c("GET"),
      head: c("HEAD"),
      options: c("OPTIONS"),
      patch: c("PATCH"),
      post: c("POST"),
      put: c("PUT"),
      trace: c("TRACE")
    },
    trace: a("TRACE")
  };
}, $ = ar(Qe({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class W {
  static previewGridBlock(t) {
    return ((t == null ? void 0 : t.client) ?? $).post({
      url: "/umbraco/block-preview/api/v1/preview/grid",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  /**
   * @deprecated Use getGridStylesheets instead to support multiple stylesheets
   */
  static getGridStylesheet(t) {
    return ((t == null ? void 0 : t.client) ?? $).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static getGridStylesheets(t) {
    return ((t == null ? void 0 : t.client) ?? $).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...t
    });
  }
  static previewListBlock(t) {
    return ((t == null ? void 0 : t.client) ?? $).post({
      url: "/umbraco/block-preview/api/v1/preview/list",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  /**
   * @deprecated Use getListStylesheets instead to support multiple stylesheets
   */
  static getListStylesheet(t) {
    return ((t == null ? void 0 : t.client) ?? $).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static getListStylesheets(t) {
    return ((t == null ? void 0 : t.client) ?? $).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return ((t == null ? void 0 : t.client) ?? $).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getSettings(t) {
    return ((t == null ? void 0 : t.client) ?? $).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const fe = new Ot("BlockPreviewContext");
var lr = Object.defineProperty, cr = Object.getOwnPropertyDescriptor, Ze = (e) => {
  throw TypeError(e);
}, g = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? cr(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && lr(t, r, s), s;
}, Pe = (e, t, r) => t.has(e) || Ze("Cannot " + r), L = (e, t, r) => (Pe(e, t, "read from private field"), t.get(e)), ye = (e, t, r) => t.has(e) ? Ze("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), et = (e, t, r, i) => (Pe(e, t, "write to private field"), t.set(e, r), r), N = (e, t, r) => (Pe(e, t, "access private method"), r), T, le, q, tt, rt, it, ot, ke, st, nt, at;
const ur = "block-grid-preview";
let b = class extends qe {
  constructor() {
    super(), ye(this, q), ye(this, T), ye(this, le), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(fe, async (e) => {
      et(this, T, e), await N(this, q, tt).call(this);
    });
  }
  set blockGridValue(e) {
    const t = e ? { ...e } : {};
    t.layout ?? (t.layout = {}), t.contentData ?? (t.contentData = []), t.settingsData ?? (t.settingsData = []), t.expose ?? (t.expose = []), this._blockGridValue = t;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      N(this, q, nt).call(this);
    }, 500));
  }
  _filterLayouts() {
    var r, i, s, n;
    return [
      {
        areas: this._blockContext.areas.map((o) => {
          var c, u;
          return {
            key: o.key,
            items: (u = (c = this._blockContext.layoutAreas) == null ? void 0 : c.find((l) => l.key == o.key)) == null ? void 0 : u.items
          };
        }),
        columnSpan: ((r = this._blockContext.layout) == null ? void 0 : r.columnSpan) ?? 0,
        rowSpan: ((i = this._blockContext.layout) == null ? void 0 : i.rowSpan) ?? 0,
        contentKey: ((s = this._blockContext.layout) == null ? void 0 : s.contentKey) ?? "",
        settingsKey: (n = this._blockContext.layout) == null ? void 0 : n.settingsKey
      }
    ];
  }
  _handleClick(e) {
    var n;
    let t = !0;
    const r = e.composedPath(), i = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (r.filter((o) => o instanceof Element && i.includes(o.tagName)).length > 0) {
      const o = r.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      o != null && o instanceof Oe && (n = o.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return A`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return A`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return A`
                    ${this._styleElements}
                     <a
                         href=${xe(this._blockContext.workspaceEditContentPath)}
                         @click=${this._handleClick}
                         aria-label="Edit block"
                         class="block-preview-edit"
                         role="button"
                     >
                        ${Ue(this._htmlMarkup)}
                     </a>
                    `;
    } else return A`<umb-block-grid-block
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
T = /* @__PURE__ */ new WeakMap();
le = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakSet();
tt = async function() {
  N(this, q, rt).call(this), N(this, q, it).call(this), await N(this, q, ot).call(this);
};
rt = function() {
  var e;
  this.observe((e = L(this, T)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
it = function() {
  this.consumeContext(Se, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ot = async function() {
  try {
    await this.getContext(re), this.consumeContext(re, (e) => {
      e && (et(this, le, e), this.observe(
        j([e.unique, e.contentTypeUnique]),
        async ([t, r]) => {
          var s, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (s = L(this, T)) == null || s.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (n = L(this, T)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), N(this, q, ke).call(this);
          const { data: i } = await W.getGridStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          i && i.length > 0 && (this._styleElements = i.map((o) => {
            const a = document.createElement("link");
            return a.rel = "stylesheet", a.href = o, a;
          }));
        }
      ));
    });
  } catch {
    L(this, le) == null && L(this, T) != null && this._blockContext.unique == "" && this.consumeContext(Ae, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (r) => {
        var s;
        this._blockContext.unique = ((s = L(this, T)) == null ? void 0 : s.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", N(this, q, ke).call(this);
        const { data: i } = await W.getGridStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        });
        i && i.length > 0 && (this._styleElements = i.map((n) => {
          const o = document.createElement("link");
          return o.rel = "stylesheet", o.href = n, o;
        }));
      });
    });
  }
};
ke = async function() {
  this.consumeContext(Pt, async (e) => {
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
        r,
        i,
        s,
        n,
        o,
        a,
        c
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = a, this._blockContext.layoutAreas = c, await N(this, q, st).call(this);
      }
    );
  });
};
st = async function() {
  this.consumeContext($t, (e) => {
    e && this.observe(
      j([
        e.contents,
        e.settings,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, r, i, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockGridValue = {
          contentData: t ?? [],
          settingsData: r ?? [],
          expose: i ?? [],
          layout: { "Umbraco.BlockGrid": this._filterLayouts() }
        }, this._blockContext.blockIndex = t.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
nt = async function() {
  const e = this._blockContext;
  if (L(this, T) != null && e.unique == "" && (e.unique = L(this, T).getUnique()), L(this, T) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = L(this, T).getDocumentTypeUnique()), !N(this, q, at).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await he(this, W.previewGridBlock({
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
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Be.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
  }
};
at = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
b.styles = [
  Te`
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
  w()
], b.prototype, "_htmlMarkup", 2);
g([
  w()
], b.prototype, "_isLoading", 2);
g([
  w()
], b.prototype, "_error", 2);
g([
  w()
], b.prototype, "_sortModeActive", 2);
g([
  d({ attribute: !1 })
], b.prototype, "blockGridValue", 1);
b = g([
  Ee(ur)
], b);
var hr = Object.defineProperty, dr = Object.getOwnPropertyDescriptor, lt = (e) => {
  throw TypeError(e);
}, _ = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? dr(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && hr(t, r, s), s;
}, $e = (e, t, r) => t.has(e) || lt("Cannot " + r), M = (e, t, r) => ($e(e, t, "read from private field"), t.get(e)), me = (e, t, r) => t.has(e) ? lt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ct = (e, t, r, i) => ($e(e, t, "write to private field"), t.set(e, r), r), V = (e, t, r) => ($e(e, t, "access private method"), r), E, ce, S, ut, ht, dt, ft, ve, pt, bt, yt;
const fr = "block-list-preview";
let p = class extends qe {
  constructor() {
    super(), me(this, S), me(this, E), me(this, ce), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(fe, async (e) => {
      ct(this, E, e), await V(this, S, ut).call(this);
    });
  }
  set blockListValue(e) {
    const t = e ? { ...e } : {};
    t.layout ?? (t.layout = {}), t.contentData ?? (t.contentData = []), t.settingsData ?? (t.settingsData = []), t.expose ?? (t.expose = []), this._blockListValue = t;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      V(this, S, bt).call(this);
    }, 500));
  }
  _handleClick(e) {
    var n;
    let t = !0;
    const r = e.composedPath(), i = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (r.filter((o) => o instanceof Element && i.includes(o.tagName)).length > 0) {
      const o = r.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      o != null && o instanceof Oe && (n = o.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return A`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return A`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return A`
                    ${this._styleElements}
                    <a
                        href=${xe(this._blockContext.workspaceEditContentPath)}
                        @click=${this._handleClick}
                        aria-label="Edit block"
                        class="block-preview-edit"
                        role="button"
                    >
                        ${Ue(this._htmlMarkup)}
                    </a>
                `;
    } else return A`<umb-ref-list-block
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
E = /* @__PURE__ */ new WeakMap();
ce = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakSet();
ut = async function() {
  V(this, S, ht).call(this), V(this, S, dt).call(this), await V(this, S, ft).call(this);
};
ht = function() {
  var e;
  this.observe((e = M(this, E)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
dt = function() {
  this.consumeContext(Se, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ft = async function() {
  try {
    await this.getContext(re), this.consumeContext(re, (e) => {
      e && (ct(this, ce, e), this.observe(
        j([e.unique, e.contentTypeUnique]),
        async ([t, r]) => {
          var s, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (s = M(this, E)) == null || s.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (n = M(this, E)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), V(this, S, ve).call(this);
          const { data: i } = await W.getListStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          i && i.length > 0 && (this._styleElements = i.map((o) => {
            const a = document.createElement("link");
            return a.rel = "stylesheet", a.href = o, a;
          }));
        }
      ));
    });
  } catch {
    M(this, ce) == null && M(this, E) != null && this._blockContext.unique == "" && this.consumeContext(Ae, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (r) => {
        var s;
        this._blockContext.unique = ((s = M(this, E)) == null ? void 0 : s.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", V(this, S, ve).call(this);
        const { data: i } = await W.getListStylesheets({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        });
        i && i.length > 0 && (this._styleElements = i.map((n) => {
          const o = document.createElement("link");
          return o.rel = "stylesheet", o.href = n, o;
        }));
      });
    });
  }
};
ve = function() {
  this.consumeContext(It, (e) => {
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
        r,
        i,
        s,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await V(this, S, pt).call(this);
      }
    );
  });
};
pt = function() {
  this.consumeContext(Rt, (e) => {
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
        r,
        i,
        s,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: (t == null ? void 0 : t.filter((o) => o.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (r == null ? void 0 : r.filter((o) => o.key == this._blockContext.settingsUdi)) ?? [],
          expose: (s == null ? void 0 : s.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.BlockList": (i == null ? void 0 : i.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? []
          }
        }, this._blockContext.blockIndex = t == null ? void 0 : t.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
bt = async function() {
  const e = this._blockContext;
  if (M(this, E) != null && e.unique == "" && (e.unique = M(this, E).getUnique()), M(this, E) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = M(this, E).getDocumentTypeUnique()), !V(this, S, yt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await he(this, W.previewListBlock({
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
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Be.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
  }
};
yt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
p.styles = [
  Te`
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
_([
  d({ attribute: !1 })
], p.prototype, "content", 2);
_([
  d({ attribute: !1 })
], p.prototype, "settings", 2);
_([
  d({ attribute: !1 })
], p.prototype, "contentKey", 2);
_([
  d({ attribute: !1 })
], p.prototype, "config", 2);
_([
  d({ attribute: !1 })
], p.prototype, "unpublished", 2);
_([
  d({ attribute: !1 })
], p.prototype, "icon", 2);
_([
  d({ attribute: !1 })
], p.prototype, "label", 2);
_([
  w()
], p.prototype, "_htmlMarkup", 2);
_([
  w()
], p.prototype, "_isLoading", 2);
_([
  w()
], p.prototype, "_error", 2);
_([
  w()
], p.prototype, "_sortModeActive", 2);
_([
  w()
], p.prototype, "_blockListValue", 2);
_([
  d({ attribute: !1 })
], p.prototype, "blockListValue", 1);
p = _([
  Ee(fr)
], p);
var pr = Object.defineProperty, br = Object.getOwnPropertyDescriptor, mt = (e) => {
  throw TypeError(e);
}, I = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? br(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && pr(t, r, s), s;
}, Le = (e, t, r) => t.has(e) || mt("Cannot " + r), D = (e, t, r) => (Le(e, t, "read from private field"), t.get(e)), _e = (e, t, r) => t.has(e) ? mt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), _t = (e, t, r, i) => (Le(e, t, "write to private field"), t.set(e, r), r), K = (e, t, r) => (Le(e, t, "access private method"), r), x, ue, B, kt, vt, wt, gt, we, Ct, Tt, Et;
const yr = "rich-text-preview";
let v = class extends qe {
  constructor() {
    super(), _e(this, B), _e(this, x), _e(this, ue), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
    }, this.consumeContext(fe, (e) => {
      _t(this, x, e), K(this, B, kt).call(this);
    });
  }
  set blockRteValue(e) {
    const t = e ? { ...e } : {};
    t.layout ?? (t.layout = {}), t.contentData ?? (t.contentData = []), t.settingsData ?? (t.settingsData = []), t.expose ?? (t.expose = []), this._blockRteValue = t;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      K(this, B, Tt).call(this);
    }, 500));
  }
  _handleClick(e) {
    var n;
    let t = !0;
    const r = e.composedPath(), i = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (r.filter((o) => o instanceof Element && i.includes(o.tagName)).length > 0) {
      const o = r.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      o != null && o instanceof Oe && (n = o.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._isLoading)
      return A`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
    if (this._error)
      return A`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return A`
                ${this._styleElement}
                <a
                    href=${xe(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${Ue(this._htmlMarkup)}
                </a>`;
  }
};
x = /* @__PURE__ */ new WeakMap();
ue = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakSet();
kt = function() {
  K(this, B, vt).call(this), K(this, B, wt).call(this), K(this, B, gt).call(this);
};
vt = function() {
  var e;
  this.observe((e = D(this, x)) == null ? void 0 : e.settings, (t) => {
    var r;
    (r = t == null ? void 0 : t.richText) != null && r.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.richText.stylesheet);
  });
};
wt = function() {
  this.consumeContext(Se, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
gt = function() {
  this.consumeContext(re, (e) => {
    e && (_t(this, ue, e), this.observe(
      j([e.unique, e.contentTypeUnique]),
      async ([t, r]) => {
        var i, s;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = D(this, x)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (s = D(this, x)) == null || s.setDocumentTypeUnique(this._blockContext.documentTypeUnique), K(this, B, we).call(this);
      }
    ));
  }), D(this, ue) == null && D(this, x) != null && this._blockContext.unique == "" && this.consumeContext(Ae, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var r;
      this._blockContext.unique = ((r = D(this, x)) == null ? void 0 : r.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", K(this, B, we).call(this);
    });
  });
};
we = function() {
  this.consumeContext(Vt, (e) => {
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
        r,
        i,
        s,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await K(this, B, Ct).call(this);
      }
    );
  });
};
Ct = function() {
  this.consumeContext(Kt, (e) => {
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
        r,
        i,
        s,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: (t == null ? void 0 : t.filter((o) => o.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (r == null ? void 0 : r.filter((o) => o.key == this._blockContext.settingsUdi)) ?? [],
          expose: (s == null ? void 0 : s.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.RichText": (i == null ? void 0 : i.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? []
          }
        };
      }
    );
  });
};
Tt = async function() {
  const e = this._blockContext;
  if (D(this, x) != null && e.unique == "" && (e.unique = D(this, x).getUnique()), D(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = D(this, x).getDocumentTypeUnique()), !K(this, B, Et).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await he(this, W.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Be.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
  }
};
Et = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
v.styles = [
  Te`
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
], v.prototype, "content", 2);
I([
  d({ attribute: !1 })
], v.prototype, "settings", 2);
I([
  d({ attribute: !1 })
], v.prototype, "contentKey", 2);
I([
  d({ attribute: !1 })
], v.prototype, "config", 2);
I([
  w()
], v.prototype, "_htmlMarkup", 2);
I([
  w()
], v.prototype, "_isLoading", 2);
I([
  w()
], v.prototype, "_error", 2);
I([
  w()
], v.prototype, "_blockRteValue", 2);
I([
  d({ attribute: !1 })
], v.prototype, "blockRteValue", 1);
v = I([
  Ee(yr)
], v);
var ie, ee, J, Q, Z;
class ge extends He {
  constructor(r) {
    super(r);
    z(this, ie);
    z(this, ee);
    z(this, J);
    z(this, Q);
    z(this, Z);
    G(this, ee, new Mt(void 0)), this.settings = m(this, ee).asObservable(), G(this, J, new je("")), this.unique = m(this, J).asObservable(), G(this, Q, new je("")), this.documentTypeUnique = m(this, Q).asObservable(), G(this, Z, new Dt(!1)), this.sortModeActive = m(this, Z).asObservable(), G(this, ie, new xt(r)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const r = await m(this, ie).getSettings();
    m(this, ee).setValue(r);
  }
  getUnique() {
    return m(this, J).getValue();
  }
  async setUnique(r) {
    r != "" && m(this, J).setValue(r);
  }
  getDocumentTypeUnique() {
    return m(this, Q).getValue();
  }
  async setDocumentTypeUnique(r) {
    r != "" && m(this, Q).setValue(r);
  }
  getSortMode() {
    return m(this, Z).getValue();
  }
  async setSortMode(r) {
    m(this, Z).setValue(r);
  }
}
ie = new WeakMap(), ee = new WeakMap(), J = new WeakMap(), Q = new WeakMap(), Z = new WeakMap();
const mr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ge,
  default: ge
}, Symbol.toStringTag, { value: "Module" })), _r = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => mr)
  }
], kr = [..._r], Ce = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...jt.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, vr = [
  Ce
], wr = [
  {
    ...Ce.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode.js"),
    forPropertyEditorUis: [Lt],
    conditions: [
      {
        alias: ze
      }
    ]
  },
  {
    ...Ce.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.List.SortMode",
    name: "Block List Sort Mode Property Action",
    api: () => import("./block-list-sort-mode.js"),
    forPropertyEditorUis: [Nt],
    conditions: [
      {
        alias: ze
      }
    ]
  }
];
var oe;
class gr {
  constructor(t) {
    z(this, oe);
    G(this, oe, t);
  }
  async getSettings() {
    return await he(m(this, oe), W.getSettings());
  }
}
oe = new WeakMap();
var se;
class xt extends He {
  constructor(r) {
    super(r);
    z(this, se);
    G(this, se, new gr(r));
  }
  async getSettings() {
    const r = await m(this, se).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
se = new WeakMap();
const Rr = async (e, t) => {
  e.consumeContext(Bt, async (r) => {
    var a, c, u;
    if (!r) return;
    const i = r.getOpenApiConfiguration();
    $.setConfig({
      baseUrl: (i == null ? void 0 : i.base) ?? "",
      auth: (i == null ? void 0 : i.token) ?? void 0,
      credentials: (i == null ? void 0 : i.credentials) ?? "same-origin"
    }), $.interceptors.request.use(async (l, f) => {
      const H = await i.token();
      return l.headers.set("Authorization", `Bearer ${H}`), l;
    });
    const n = await new xt(e).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: b,
          forBlockEditor: "block-grid"
        };
        ((a = n.blockGrid.contentTypes) == null ? void 0 : a.length) !== 0 && (l.forContentTypeAlias = n.blockGrid.contentTypes), o.push(l);
      }
      if (n.blockList.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        ((c = n.blockList.contentTypes) == null ? void 0 : c.length) !== 0 && (l.forContentTypeAlias = n.blockList.contentTypes), o.push(l);
      }
      if (n.richText.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: v,
          forBlockEditor: "block-rte"
        };
        ((u = n.richText.contentTypes) == null ? void 0 : u.length) !== 0 && (l.forContentTypeAlias = n.richText.contentTypes), o.push(l);
      }
    }
    t.registerMany([
      ...o,
      ...kr,
      ...vr,
      ...wr
    ]), e.provideContext(fe, new ge(e));
  });
};
export {
  fe as B,
  v as R,
  gr as S,
  b as a,
  p as b,
  xt as c,
  Rr as o
};
//# sourceMappingURL=index.js.map

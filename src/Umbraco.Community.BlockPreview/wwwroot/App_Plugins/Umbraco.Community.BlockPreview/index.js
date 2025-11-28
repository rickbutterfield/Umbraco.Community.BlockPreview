var Ve = (e) => {
  throw TypeError(e);
};
var Ke = (e, t, i) => t.has(e) || Ve("Cannot " + i);
var m = (e, t, i) => (Ke(e, t, "read from private field"), i ? i.call(e) : t.get(e)), j = (e, t, i) => t.has(e) ? Ve("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), z = (e, t, i, r) => (Ke(e, t, "write to private field"), r ? r.call(e, i) : t.set(e, i), i);
import { UMB_AUTH_CONTEXT as Bt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as Pt } from "@umbraco-cms/backoffice/context-api";
import { css as Te, property as d, state as w, customElement as Ee, html as A, ifDefined as xe, unsafeHTML as Ue } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Ae } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ot, UMB_BLOCK_GRID_MANAGER_CONTEXT as Lt, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as $t } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as ie } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as qe } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as K, UmbObjectState as Mt, UmbStringState as je, UmbBooleanState as Dt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as Se, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as ze } from "@umbraco-cms/backoffice/property";
import { tryExecute as he, UmbApiError as Be } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Pe } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as It, UMB_BLOCK_LIST_MANAGER_CONTEXT as Rt, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as Nt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Vt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Kt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as He } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as jt } from "@umbraco-cms/backoffice/property-action";
const zt = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, i) => typeof i == "bigint" ? i.toString() : i
  )
}, Gt = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: i,
  responseTransformer: r,
  responseValidator: o,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: s,
  sseMaxRetryDelay: c,
  sseSleepFn: a,
  url: u,
  ...l
}) => {
  let f;
  const H = a ?? ((h) => new Promise((k) => setTimeout(k, h)));
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
        let P = new Request(u, F);
        e && (P = await e(u, F));
        const C = await (l.fetch ?? globalThis.fetch)(P);
        if (!C.ok)
          throw new Error(
            `SSE failed: ${C.status} ${C.statusText}`
          );
        if (!C.body) throw new Error("No body in SSE response");
        const O = C.body.pipeThrough(new TextDecoderStream()).getReader();
        let pe = "";
        const Me = () => {
          try {
            O.cancel();
          } catch {
          }
        };
        X.addEventListener("abort", Me);
        try {
          for (; ; ) {
            const { done: Ut, value: At } = await O.read();
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
              Re && (o && await o(Y), r && (Y = await r(Y))), i == null || i({
                data: Y,
                event: Ie,
                id: f,
                retry: h
              }), ae.length && (yield Y);
            }
          }
        } finally {
          X.removeEventListener("abort", Me), O.releaseLock();
        }
        break;
      } catch (F) {
        if (t == null || t(F), s !== void 0 && k >= s)
          break;
        const P = Math.min(
          h * 2 ** (k - 1),
          c ?? 3e4
        );
        await H(P);
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
  name: i,
  style: r,
  value: o
}) => {
  if (!t) {
    const c = (e ? o : o.map((a) => encodeURIComponent(a))).join(Ht(r));
    switch (r) {
      case "label":
        return `.${c}`;
      case "matrix":
        return `;${i}=${c}`;
      case "simple":
        return c;
      default:
        return `${i}=${c}`;
    }
  }
  const n = Wt(r), s = o.map((c) => r === "label" || r === "simple" ? e ? c : encodeURIComponent(c) : de({
    allowReserved: e,
    name: i,
    value: c
  })).join(n);
  return r === "label" || r === "matrix" ? n + s : s;
}, de = ({
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
}, Fe = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: r,
  value: o,
  valueOnly: n
}) => {
  if (o instanceof Date)
    return n ? o.toISOString() : `${i}=${o.toISOString()}`;
  if (r !== "deepObject" && !t) {
    let a = [];
    Object.entries(o).forEach(([l, f]) => {
      a = [
        ...a,
        l,
        e ? f : encodeURIComponent(f)
      ];
    });
    const u = a.join(",");
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
  const s = Xt(r), c = Object.entries(o).map(
    ([a, u]) => de({
      allowReserved: e,
      name: r === "deepObject" ? `${i}[${a}]` : a,
      value: u
    })
  ).join(s);
  return r === "label" || r === "matrix" ? s + c : c;
}, Ft = /\{[^{}]+\}/g, Yt = ({ path: e, url: t }) => {
  let i = t;
  const r = t.match(Ft);
  if (r)
    for (const o of r) {
      let n = !1, s = o.substring(1, o.length - 1), c = "simple";
      s.endsWith("*") && (n = !0, s = s.substring(0, s.length - 1)), s.startsWith(".") ? (s = s.substring(1), c = "label") : s.startsWith(";") && (s = s.substring(1), c = "matrix");
      const a = e[s];
      if (a == null)
        continue;
      if (Array.isArray(a)) {
        i = i.replace(
          o,
          Xe({ explode: n, name: s, style: c, value: a })
        );
        continue;
      }
      if (typeof a == "object") {
        i = i.replace(
          o,
          Fe({
            explode: n,
            name: s,
            style: c,
            value: a,
            valueOnly: !0
          })
        );
        continue;
      }
      if (c === "matrix") {
        i = i.replace(
          o,
          `;${de({
            name: s,
            value: a
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        c === "label" ? `.${a}` : a
      );
      i = i.replace(o, u);
    }
  return i;
}, Jt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: r,
  url: o
}) => {
  const n = o.startsWith("/") ? o : `/${o}`;
  let s = (e ?? "") + n;
  t && (s = Yt({ path: t, url: s }));
  let c = i ? r(i) : "";
  return c.startsWith("?") && (c = c.substring(1)), c && (s += `?${c}`), s;
};
function Qt(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const Zt = async (e, t) => {
  const i = typeof t == "function" ? await t(e) : t;
  if (i)
    return e.scheme === "bearer" ? `Bearer ${i}` : e.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Ye = ({
  allowReserved: e,
  array: t,
  object: i
} = {}) => (o) => {
  const n = [];
  if (o && typeof o == "object")
    for (const s in o) {
      const c = o[s];
      if (c != null)
        if (Array.isArray(c)) {
          const a = Xe({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "form",
            value: c,
            ...t
          });
          a && n.push(a);
        } else if (typeof c == "object") {
          const a = Fe({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "deepObject",
            value: c,
            ...i
          });
          a && n.push(a);
        } else {
          const a = de({
            allowReserved: e,
            name: s,
            value: c
          });
          a && n.push(a);
        }
    }
  return n.join("&");
}, ei = (e) => {
  var i;
  if (!e)
    return "stream";
  const t = (i = e.split(";")[0]) == null ? void 0 : i.trim();
  if (t) {
    if (t.startsWith("application/json") || t.endsWith("+json"))
      return "json";
    if (t === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some(
      (r) => t.startsWith(r)
    ))
      return "blob";
    if (t.startsWith("text/"))
      return "text";
  }
}, ti = (e, t) => {
  var i, r;
  return t ? !!(e.headers.has(t) || (i = e.query) != null && i[t] || (r = e.headers.get("Cookie")) != null && r.includes(`${t}=`)) : !1;
}, ii = async ({
  security: e,
  ...t
}) => {
  for (const i of e) {
    if (ti(t, i.name))
      continue;
    const r = await Zt(i, t.auth);
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
}, Ge = (e) => Jt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Ye(e.querySerializer),
  url: e.url
}), We = (e, t) => {
  var r;
  const i = { ...e, ...t };
  return (r = i.baseUrl) != null && r.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Je(e.headers, t.headers), i;
}, ri = (e) => {
  const t = [];
  return e.forEach((i, r) => {
    t.push([r, i]);
  }), t;
}, Je = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const r = i instanceof Headers ? ri(i) : Object.entries(i);
    for (const [o, n] of r)
      if (n === null)
        t.delete(o);
      else if (Array.isArray(n))
        for (const s of n)
          t.append(o, s);
      else n !== void 0 && t.set(
        o,
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
const oi = () => ({
  error: new be(),
  request: new be(),
  response: new be()
}), si = Ye({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), ni = {
  "Content-Type": "application/json"
}, Qe = (e = {}) => ({
  ...zt,
  headers: ni,
  parseAs: "auto",
  querySerializer: si,
  ...e
}), ai = (e = {}) => {
  let t = We(Qe(), e);
  const i = () => ({ ...t }), r = (u) => (t = We(t, u), i()), o = oi(), n = async (u) => {
    const l = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Je(t.headers, u.headers),
      serializedBody: void 0
    };
    l.security && await ii({
      ...l,
      security: l.security
    }), l.requestValidator && await l.requestValidator(l), l.body !== void 0 && l.bodySerializer && (l.serializedBody = l.bodySerializer(l.body)), (l.body === void 0 || l.serializedBody === "") && l.headers.delete("Content-Type");
    const f = Ge(l);
    return { opts: l, url: f };
  }, s = async (u) => {
    const { opts: l, url: f } = await n(u), H = {
      redirect: "follow",
      ...l,
      body: Qt(l)
    };
    let I = new Request(f, H);
    for (const y of o.request.fns)
      y && (I = await y(I, l));
    const ne = l.fetch;
    let h = await ne(I);
    for (const y of o.response.fns)
      y && (h = await y(h, I, l));
    const k = {
      request: I,
      response: h
    };
    if (h.ok) {
      const y = (l.parseAs === "auto" ? ei(h.headers.get("Content-Type")) : l.parseAs) ?? "json";
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
        return l.responseStyle === "data" ? O : {
          data: O,
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
    let P = F;
    for (const y of o.error.fns)
      y && (P = await y(F, h, I, l));
    if (P = P || {}, l.throwOnError)
      throw P;
    return l.responseStyle === "data" ? void 0 : {
      error: P,
      ...k
    };
  }, c = (u) => (l) => s({ ...l, method: u }), a = (u) => async (l) => {
    const { opts: f, url: H } = await n(l);
    return Gt({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (I, ne) => {
        let h = new Request(I, ne);
        for (const k of o.request.fns)
          k && (h = await k(h, f));
        return h;
      },
      url: H
    });
  };
  return {
    buildUrl: Ge,
    connect: c("CONNECT"),
    delete: c("DELETE"),
    get: c("GET"),
    getConfig: i,
    head: c("HEAD"),
    interceptors: o,
    options: c("OPTIONS"),
    patch: c("PATCH"),
    post: c("POST"),
    put: c("PUT"),
    request: s,
    setConfig: r,
    sse: {
      connect: a("CONNECT"),
      delete: a("DELETE"),
      get: a("GET"),
      head: a("HEAD"),
      options: a("OPTIONS"),
      patch: a("PATCH"),
      post: a("POST"),
      put: a("PUT"),
      trace: a("TRACE")
    },
    trace: c("TRACE")
  };
}, G = ai(Qe({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class W {
  static previewGridBlock(t) {
    return ((t == null ? void 0 : t.client) ?? G).post({
      url: "/umbraco/block-preview/api/v1/preview/grid",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getGridStylesheet(t) {
    return ((t == null ? void 0 : t.client) ?? G).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static previewListBlock(t) {
    return ((t == null ? void 0 : t.client) ?? G).post({
      url: "/umbraco/block-preview/api/v1/preview/list",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getListStylesheet(t) {
    return ((t == null ? void 0 : t.client) ?? G).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return ((t == null ? void 0 : t.client) ?? G).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getSettings(t) {
    return ((t == null ? void 0 : t.client) ?? G).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const fe = new Pt("BlockPreviewContext");
var li = Object.defineProperty, ci = Object.getOwnPropertyDescriptor, Ze = (e) => {
  throw TypeError(e);
}, g = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ci(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (r ? s(t, i, o) : s(o)) || o);
  return r && o && li(t, i, o), o;
}, Oe = (e, t, i) => t.has(e) || Ze("Cannot " + i), L = (e, t, i) => (Oe(e, t, "read from private field"), t.get(e)), ye = (e, t, i) => t.has(e) ? Ze("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), et = (e, t, i, r) => (Oe(e, t, "write to private field"), t.set(e, i), i), R = (e, t, i) => (Oe(e, t, "access private method"), i), T, le, q, tt, it, rt, ot, ke, st, nt, at;
const ui = "block-grid-preview";
let b = class extends qe {
  constructor() {
    super(), ye(this, q), ye(this, T), ye(this, le), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
      et(this, T, e), await R(this, q, tt).call(this);
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
      R(this, q, nt).call(this);
    }, 500));
  }
  _filterLayouts() {
    var i, r, o, n;
    return [
      {
        areas: this._blockContext.areas.map((s) => {
          var a, u;
          return {
            key: s.key,
            items: (u = (a = this._blockContext.layoutAreas) == null ? void 0 : a.find((l) => l.key == s.key)) == null ? void 0 : u.items
          };
        }),
        columnSpan: ((i = this._blockContext.layout) == null ? void 0 : i.columnSpan) ?? 0,
        rowSpan: ((r = this._blockContext.layout) == null ? void 0 : r.rowSpan) ?? 0,
        contentKey: ((o = this._blockContext.layout) == null ? void 0 : o.contentKey) ?? "",
        settingsKey: (n = this._blockContext.layout) == null ? void 0 : n.settingsKey
      }
    ];
  }
  _handleClick(e) {
    var c;
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((a) => a instanceof Element && r.includes(a.tagName)).length > 0) {
      const a = i.find((u) => u instanceof Element && u.tagName === "UUI-BUTTON");
      a != null && a instanceof Pe && (c = a.href) != null && c.includes("block/edit") && (t = !1);
    }
    const n = i.filter((a) => a instanceof Element && a.tagName === "A" && a.classList.contains("block-preview-edit"));
    if (n.length > 0 && (t = !1), i.filter((a) => a instanceof Element && a.tagName === "A" && a.hasAttribute("data-block-preview-link")).length > 0) {
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
  R(this, q, it).call(this), R(this, q, rt).call(this), await R(this, q, ot).call(this);
};
it = function() {
  var e;
  this.observe((e = L(this, T)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
rt = function() {
  this.consumeContext(Se, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ot = async function() {
  try {
    await this.getContext(ie), this.consumeContext(ie, (e) => {
      e && (et(this, le, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          var o, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (o = L(this, T)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (n = L(this, T)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), R(this, q, ke).call(this);
          const { data: r } = await W.getGridStylesheet({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          r && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = r);
        }
      ));
    });
  } catch {
    L(this, le) == null && L(this, T) != null && this._blockContext.unique == "" && this.consumeContext(Ae, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        var o;
        this._blockContext.unique = ((o = L(this, T)) == null ? void 0 : o.getUnique()) ?? "", this._blockContext.documentTypeUnique = i[0] ?? "", R(this, q, ke).call(this);
        const { data: r } = await W.getGridStylesheet({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        });
        r && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = r);
      });
    });
  }
};
ke = async function() {
  this.consumeContext(Ot, async (e) => {
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
        n,
        s,
        c,
        a
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = s, this._blockContext.layout = c, this._blockContext.layoutAreas = a, await R(this, q, st).call(this);
      }
    );
  });
};
st = async function() {
  this.consumeContext(Lt, (e) => {
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
nt = async function() {
  const e = this._blockContext;
  if (L(this, T) != null && e.unique == "" && (e.unique = L(this, T).getUnique()), L(this, T) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = L(this, T).getDocumentTypeUnique()), !R(this, q, at).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, W.previewGridBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : Be.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
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
  Ee(ui)
], b);
var hi = Object.defineProperty, di = Object.getOwnPropertyDescriptor, lt = (e) => {
  throw TypeError(e);
}, _ = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? di(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (r ? s(t, i, o) : s(o)) || o);
  return r && o && hi(t, i, o), o;
}, Le = (e, t, i) => t.has(e) || lt("Cannot " + i), $ = (e, t, i) => (Le(e, t, "read from private field"), t.get(e)), me = (e, t, i) => t.has(e) ? lt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ct = (e, t, i, r) => (Le(e, t, "write to private field"), t.set(e, i), i), N = (e, t, i) => (Le(e, t, "access private method"), i), E, ce, S, ut, ht, dt, ft, ve, pt, bt, yt;
const fi = "block-list-preview";
let p = class extends qe {
  constructor() {
    super(), me(this, S), me(this, E), me(this, ce), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
      ct(this, E, e), await N(this, S, ut).call(this);
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
      N(this, S, bt).call(this);
    }, 500));
  }
  _handleClick(e) {
    var c;
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((a) => a instanceof Element && r.includes(a.tagName)).length > 0) {
      const a = i.find((u) => u instanceof Element && u.tagName === "UUI-BUTTON");
      a != null && a instanceof Pe && (c = a.href) != null && c.includes("block/edit") && (t = !1);
    }
    const n = i.filter((a) => a instanceof Element && a.tagName === "A" && a.classList.contains("block-preview-edit"));
    if (n.length > 0 && (t = !1), i.filter((a) => a instanceof Element && a.tagName === "A" && a.hasAttribute("data-block-preview-link")).length > 0) {
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
  N(this, S, ht).call(this), N(this, S, dt).call(this), await N(this, S, ft).call(this);
};
ht = function() {
  var e;
  this.observe((e = $(this, E)) == null ? void 0 : e.sortModeActive, (t) => {
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
    await this.getContext(ie), this.consumeContext(ie, (e) => {
      e && (ct(this, ce, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          var o, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (o = $(this, E)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (n = $(this, E)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), N(this, S, ve).call(this);
          const { data: r } = await W.getListStylesheet({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          r && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = r);
        }
      ));
    });
  } catch {
    $(this, ce) == null && $(this, E) != null && this._blockContext.unique == "" && this.consumeContext(Ae, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        var o;
        this._blockContext.unique = ((o = $(this, E)) == null ? void 0 : o.getUnique()) ?? "", this._blockContext.documentTypeUnique = i[0] ?? "", N(this, S, ve).call(this);
        const { data: r } = await W.getListStylesheet({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        });
        r && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = r);
      });
    });
  }
};
ve = function() {
  this.consumeContext(It, (e) => {
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
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", await N(this, S, pt).call(this);
      }
    );
  });
};
pt = function() {
  this.consumeContext(Rt, (e) => {
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
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: (t == null ? void 0 : t.filter((s) => s.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((s) => s.key == this._blockContext.settingsUdi)) ?? [],
          expose: (o == null ? void 0 : o.filter((s) => s.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.BlockList": (r == null ? void 0 : r.filter((s) => s.contentKey == this._blockContext.contentUdi)) ?? []
          }
        }, this._blockContext.blockIndex = t == null ? void 0 : t.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
bt = async function() {
  const e = this._blockContext;
  if ($(this, E) != null && e.unique == "" && (e.unique = $(this, E).getUnique()), $(this, E) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = $(this, E).getDocumentTypeUnique()), !N(this, S, yt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, W.previewListBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : Be.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
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
  Ee(fi)
], p);
var pi = Object.defineProperty, bi = Object.getOwnPropertyDescriptor, mt = (e) => {
  throw TypeError(e);
}, D = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? bi(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (r ? s(t, i, o) : s(o)) || o);
  return r && o && pi(t, i, o), o;
}, $e = (e, t, i) => t.has(e) || mt("Cannot " + i), M = (e, t, i) => ($e(e, t, "read from private field"), t.get(e)), _e = (e, t, i) => t.has(e) ? mt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), _t = (e, t, i, r) => ($e(e, t, "write to private field"), t.set(e, i), i), V = (e, t, i) => ($e(e, t, "access private method"), i), x, ue, B, kt, vt, wt, gt, we, Ct, Tt, Et;
const yi = "rich-text-preview";
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
      _t(this, x, e), V(this, B, kt).call(this);
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
      V(this, B, Tt).call(this);
    }, 500));
  }
  _handleClick(e) {
    var n;
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((s) => s instanceof Element && r.includes(s.tagName)).length > 0) {
      const s = i.find((c) => c instanceof Element && c.tagName === "UUI-BUTTON");
      s != null && s instanceof Pe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
  V(this, B, vt).call(this), V(this, B, wt).call(this), V(this, B, gt).call(this);
};
vt = function() {
  var e;
  this.observe((e = M(this, x)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.richText) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.richText.stylesheet);
  });
};
wt = function() {
  this.consumeContext(Se, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
gt = function() {
  this.consumeContext(ie, (e) => {
    e && (_t(this, ue, e), this.observe(
      K([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var r, o;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (r = M(this, x)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = M(this, x)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), V(this, B, we).call(this);
      }
    ));
  }), M(this, ue) == null && M(this, x) != null && this._blockContext.unique == "" && this.consumeContext(Ae, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = M(this, x)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", V(this, B, we).call(this);
    });
  });
};
we = function() {
  this.consumeContext(Vt, (e) => {
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
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", await V(this, B, Ct).call(this);
      }
    );
  });
};
Ct = function() {
  this.consumeContext(Kt, (e) => {
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
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: (t == null ? void 0 : t.filter((s) => s.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((s) => s.key == this._blockContext.settingsUdi)) ?? [],
          expose: (o == null ? void 0 : o.filter((s) => s.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.RichText": (r == null ? void 0 : r.filter((s) => s.contentKey == this._blockContext.contentUdi)) ?? []
          }
        };
      }
    );
  });
};
Tt = async function() {
  const e = this._blockContext;
  if (M(this, x) != null && e.unique == "" && (e.unique = M(this, x).getUnique()), M(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = M(this, x).getDocumentTypeUnique()), !V(this, B, Et).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, W.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : Be.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
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
D([
  d({ attribute: !1 })
], v.prototype, "content", 2);
D([
  d({ attribute: !1 })
], v.prototype, "settings", 2);
D([
  d({ attribute: !1 })
], v.prototype, "contentKey", 2);
D([
  d({ attribute: !1 })
], v.prototype, "config", 2);
D([
  w()
], v.prototype, "_htmlMarkup", 2);
D([
  w()
], v.prototype, "_isLoading", 2);
D([
  w()
], v.prototype, "_error", 2);
D([
  w()
], v.prototype, "_blockRteValue", 2);
D([
  d({ attribute: !1 })
], v.prototype, "blockRteValue", 1);
v = D([
  Ee(yi)
], v);
var re, ee, J, Q, Z;
class ge extends He {
  constructor(i) {
    super(i);
    j(this, re);
    j(this, ee);
    j(this, J);
    j(this, Q);
    j(this, Z);
    z(this, ee, new Mt(void 0)), this.settings = m(this, ee).asObservable(), z(this, J, new je("")), this.unique = m(this, J).asObservable(), z(this, Q, new je("")), this.documentTypeUnique = m(this, Q).asObservable(), z(this, Z, new Dt(!1)), this.sortModeActive = m(this, Z).asObservable(), z(this, re, new xt(i)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const i = await m(this, re).getSettings();
    m(this, ee).setValue(i);
  }
  getUnique() {
    return m(this, J).getValue();
  }
  async setUnique(i) {
    i != "" && m(this, J).setValue(i);
  }
  getDocumentTypeUnique() {
    return m(this, Q).getValue();
  }
  async setDocumentTypeUnique(i) {
    i != "" && m(this, Q).setValue(i);
  }
  getSortMode() {
    return m(this, Z).getValue();
  }
  async setSortMode(i) {
    m(this, Z).setValue(i);
  }
}
re = new WeakMap(), ee = new WeakMap(), J = new WeakMap(), Q = new WeakMap(), Z = new WeakMap();
const mi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ge,
  default: ge
}, Symbol.toStringTag, { value: "Module" })), _i = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => mi)
  }
], ki = [..._i], Ce = {
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
}, vi = [
  Ce
], wi = [
  {
    ...Ce.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode.js"),
    forPropertyEditorUis: [$t],
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
class gi {
  constructor(t) {
    j(this, oe);
    z(this, oe, t);
  }
  async getSettings() {
    return await he(m(this, oe), W.getSettings());
  }
}
oe = new WeakMap();
var se;
class xt extends He {
  constructor(i) {
    super(i);
    j(this, se);
    z(this, se, new gi(i));
  }
  async getSettings() {
    const i = await m(this, se).getSettings();
    if (i && (i != null && i.data))
      return i.data;
  }
}
se = new WeakMap();
const Ri = async (e, t) => {
  e.consumeContext(Bt, async (i) => {
    var c, a, u;
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    G.setConfig({
      baseUrl: (r == null ? void 0 : r.base) ?? "",
      auth: (r == null ? void 0 : r.token) ?? void 0,
      credentials: (r == null ? void 0 : r.credentials) ?? "same-origin"
    }), G.interceptors.request.use(async (l, f) => {
      const H = await r.token();
      return l.headers.set("Authorization", `Bearer ${H}`), l;
    });
    const n = await new xt(e).getSettings();
    let s = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: b,
          forBlockEditor: "block-grid"
        };
        ((c = n.blockGrid.contentTypes) == null ? void 0 : c.length) !== 0 && (l.forContentTypeAlias = n.blockGrid.contentTypes), s.push(l);
      }
      if (n.blockList.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        ((a = n.blockList.contentTypes) == null ? void 0 : a.length) !== 0 && (l.forContentTypeAlias = n.blockList.contentTypes), s.push(l);
      }
      if (n.richText.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: v,
          forBlockEditor: "block-rte"
        };
        ((u = n.richText.contentTypes) == null ? void 0 : u.length) !== 0 && (l.forContentTypeAlias = n.richText.contentTypes), s.push(l);
      }
    }
    t.registerMany([
      ...s,
      ...ki,
      ...vi,
      ...wi
    ]), e.provideContext(fe, new ge(e));
  });
};
export {
  fe as B,
  v as R,
  gi as S,
  b as a,
  p as b,
  xt as c,
  Ri as o
};
//# sourceMappingURL=index.js.map

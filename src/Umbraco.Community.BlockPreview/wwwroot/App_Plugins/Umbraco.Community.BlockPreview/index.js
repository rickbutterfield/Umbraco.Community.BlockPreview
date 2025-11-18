var Ve = (e) => {
  throw TypeError(e);
};
var Ke = (e, t, r) => t.has(e) || Ve("Cannot " + r);
var m = (e, t, r) => (Ke(e, t, "read from private field"), r ? r.call(e) : t.get(e)), j = (e, t, r) => t.has(e) ? Ve("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), z = (e, t, r, i) => (Ke(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r);
import { UMB_AUTH_CONTEXT as Bt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as Ot } from "@umbraco-cms/backoffice/context-api";
import { css as Te, property as d, state as w, customElement as Ee, html as A, ifDefined as xe, unsafeHTML as Ue } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Ae } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Pt, UMB_BLOCK_GRID_MANAGER_CONTEXT as $t, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as Lt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as re } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as qe } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as K, UmbObjectState as Mt, UmbStringState as je, UmbBooleanState as Dt } from "@umbraco-cms/backoffice/observable-api";
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
  responseValidator: o,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: s,
  sseMaxRetryDelay: l,
  sseSleepFn: c,
  url: u,
  ...a
}) => {
  let f;
  const H = c ?? ((h) => new Promise((k) => setTimeout(k, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, k = 0;
    const X = a.signal ?? new AbortController().signal;
    for (; !X.aborted; ) {
      k++;
      const te = a.headers instanceof Headers ? a.headers : new Headers(a.headers);
      f !== void 0 && te.set("Last-Event-ID", f);
      try {
        const F = {
          redirect: "follow",
          ...a,
          body: a.serializedBody,
          headers: te,
          signal: X
        };
        let O = new Request(u, F);
        e && (O = await e(u, F));
        const C = await (a.fetch ?? globalThis.fetch)(O);
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
              Re && (o && await o(Y), i && (Y = await i(Y))), r == null || r({
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
        if (t == null || t(F), s !== void 0 && k >= s)
          break;
        const O = Math.min(
          h * 2 ** (k - 1),
          l ?? 3e4
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
  value: o
}) => {
  if (!t) {
    const l = (e ? o : o.map((c) => encodeURIComponent(c))).join(Ht(i));
    switch (i) {
      case "label":
        return `.${l}`;
      case "matrix":
        return `;${r}=${l}`;
      case "simple":
        return l;
      default:
        return `${r}=${l}`;
    }
  }
  const n = Wt(i), s = o.map((l) => i === "label" || i === "simple" ? e ? l : encodeURIComponent(l) : de({
    allowReserved: e,
    name: r,
    value: l
  })).join(n);
  return i === "label" || i === "matrix" ? n + s : s;
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
  value: o,
  valueOnly: n
}) => {
  if (o instanceof Date)
    return n ? o.toISOString() : `${r}=${o.toISOString()}`;
  if (i !== "deepObject" && !t) {
    let c = [];
    Object.entries(o).forEach(([a, f]) => {
      c = [
        ...c,
        a,
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
  const s = Xt(i), l = Object.entries(o).map(
    ([c, u]) => de({
      allowReserved: e,
      name: i === "deepObject" ? `${r}[${c}]` : c,
      value: u
    })
  ).join(s);
  return i === "label" || i === "matrix" ? s + l : l;
}, Ft = /\{[^{}]+\}/g, Yt = ({ path: e, url: t }) => {
  let r = t;
  const i = t.match(Ft);
  if (i)
    for (const o of i) {
      let n = !1, s = o.substring(1, o.length - 1), l = "simple";
      s.endsWith("*") && (n = !0, s = s.substring(0, s.length - 1)), s.startsWith(".") ? (s = s.substring(1), l = "label") : s.startsWith(";") && (s = s.substring(1), l = "matrix");
      const c = e[s];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        r = r.replace(
          o,
          Xe({ explode: n, name: s, style: l, value: c })
        );
        continue;
      }
      if (typeof c == "object") {
        r = r.replace(
          o,
          Fe({
            explode: n,
            name: s,
            style: l,
            value: c,
            valueOnly: !0
          })
        );
        continue;
      }
      if (l === "matrix") {
        r = r.replace(
          o,
          `;${de({
            name: s,
            value: c
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        l === "label" ? `.${c}` : c
      );
      r = r.replace(o, u);
    }
  return r;
}, Jt = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: i,
  url: o
}) => {
  const n = o.startsWith("/") ? o : `/${o}`;
  let s = (e ?? "") + n;
  t && (s = Yt({ path: t, url: s }));
  let l = r ? i(r) : "";
  return l.startsWith("?") && (l = l.substring(1)), l && (s += `?${l}`), s;
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
} = {}) => (o) => {
  const n = [];
  if (o && typeof o == "object")
    for (const s in o) {
      const l = o[s];
      if (l != null)
        if (Array.isArray(l)) {
          const c = Xe({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "form",
            value: l,
            ...t
          });
          c && n.push(c);
        } else if (typeof l == "object") {
          const c = Fe({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "deepObject",
            value: l,
            ...r
          });
          c && n.push(c);
        } else {
          const c = de({
            allowReserved: e,
            name: s,
            value: l
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
    const o = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        t.query || (t.query = {}), t.query[o] = i;
        break;
      case "cookie":
        t.headers.append("Cookie", `${o}=${i}`);
        break;
      case "header":
      default:
        t.headers.set(o, i);
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
    for (const [o, n] of i)
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
class ye {
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
  error: new ye(),
  request: new ye(),
  response: new ye()
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
  const r = () => ({ ...t }), i = (u) => (t = We(t, u), r()), o = or(), n = async (u) => {
    const a = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Je(t.headers, u.headers),
      serializedBody: void 0
    };
    a.security && await rr({
      ...a,
      security: a.security
    }), a.requestValidator && await a.requestValidator(a), a.body !== void 0 && a.bodySerializer && (a.serializedBody = a.bodySerializer(a.body)), (a.body === void 0 || a.serializedBody === "") && a.headers.delete("Content-Type");
    const f = Ge(a);
    return { opts: a, url: f };
  }, s = async (u) => {
    const { opts: a, url: f } = await n(u), H = {
      redirect: "follow",
      ...a,
      body: Qt(a)
    };
    let I = new Request(f, H);
    for (const b of o.request.fns)
      b && (I = await b(I, a));
    const ne = a.fetch;
    let h = await ne(I);
    for (const b of o.response.fns)
      b && (h = await b(h, I, a));
    const k = {
      request: I,
      response: h
    };
    if (h.ok) {
      const b = (a.parseAs === "auto" ? er(h.headers.get("Content-Type")) : a.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let P;
        switch (b) {
          case "arrayBuffer":
          case "blob":
          case "text":
            P = await h[b]();
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
        return a.responseStyle === "data" ? P : {
          data: P,
          ...k
        };
      }
      let C;
      switch (b) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          C = await h[b]();
          break;
        case "stream":
          return a.responseStyle === "data" ? h.body : {
            data: h.body,
            ...k
          };
      }
      return b === "json" && (a.responseValidator && await a.responseValidator(C), a.responseTransformer && (C = await a.responseTransformer(C))), a.responseStyle === "data" ? C : {
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
    for (const b of o.error.fns)
      b && (O = await b(F, h, I, a));
    if (O = O || {}, a.throwOnError)
      throw O;
    return a.responseStyle === "data" ? void 0 : {
      error: O,
      ...k
    };
  }, l = (u) => (a) => s({ ...a, method: u }), c = (u) => async (a) => {
    const { opts: f, url: H } = await n(a);
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
    connect: l("CONNECT"),
    delete: l("DELETE"),
    get: l("GET"),
    getConfig: r,
    head: l("HEAD"),
    interceptors: o,
    options: l("OPTIONS"),
    patch: l("PATCH"),
    post: l("POST"),
    put: l("PUT"),
    request: s,
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
    trace: l("TRACE")
  };
}, G = ar(Qe({
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
const fe = new Ot("BlockPreviewContext");
var lr = Object.defineProperty, cr = Object.getOwnPropertyDescriptor, Ze = (e) => {
  throw TypeError(e);
}, g = (e, t, r, i) => {
  for (var o = i > 1 ? void 0 : i ? cr(t, r) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (i ? s(t, r, o) : s(o)) || o);
  return i && o && lr(t, r, o), o;
}, Pe = (e, t, r) => t.has(e) || Ze("Cannot " + r), $ = (e, t, r) => (Pe(e, t, "read from private field"), t.get(e)), be = (e, t, r) => t.has(e) ? Ze("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), et = (e, t, r, i) => (Pe(e, t, "write to private field"), t.set(e, r), r), R = (e, t, r) => (Pe(e, t, "access private method"), r), T, le, q, tt, rt, it, ot, ke, st, nt, at;
const ur = "block-grid-preview";
let y = class extends qe {
  constructor() {
    super(), be(this, q), be(this, T), be(this, le), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
    var r, i, o, n;
    return [
      {
        areas: this._blockContext.areas.map((s) => {
          var c, u;
          return {
            key: s.key,
            items: (u = (c = this._blockContext.layoutAreas) == null ? void 0 : c.find((a) => a.key == s.key)) == null ? void 0 : u.items
          };
        }),
        columnSpan: ((r = this._blockContext.layout) == null ? void 0 : r.columnSpan) ?? 0,
        rowSpan: ((i = this._blockContext.layout) == null ? void 0 : i.rowSpan) ?? 0,
        contentKey: ((o = this._blockContext.layout) == null ? void 0 : o.contentKey) ?? "",
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
    if (r.filter((s) => s instanceof Element && i.includes(s.tagName)).length > 0) {
      const s = r.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      s != null && s instanceof Oe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
  R(this, q, rt).call(this), R(this, q, it).call(this), await R(this, q, ot).call(this);
};
rt = function() {
  var e;
  this.observe((e = $(this, T)) == null ? void 0 : e.sortModeActive, (t) => {
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
        K([e.unique, e.contentTypeUnique]),
        async ([t, r]) => {
          var o, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (o = $(this, T)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (n = $(this, T)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), R(this, q, ke).call(this);
          const { data: i } = await W.getGridStylesheet({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          i && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = i);
        }
      ));
    });
  } catch {
    $(this, le) == null && $(this, T) != null && this._blockContext.unique == "" && this.consumeContext(Ae, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (r) => {
        var o;
        this._blockContext.unique = ((o = $(this, T)) == null ? void 0 : o.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", R(this, q, ke).call(this);
        const { data: i } = await W.getGridStylesheet({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        });
        i && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = i);
      });
    });
  }
};
ke = async function() {
  this.consumeContext(Pt, async (e) => {
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
        r,
        i,
        o,
        n,
        s,
        l,
        c
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = s, this._blockContext.layout = l, this._blockContext.layoutAreas = c, await R(this, q, st).call(this);
      }
    );
  });
};
st = async function() {
  this.consumeContext($t, (e) => {
    e && this.observe(
      K([
        e.contents,
        e.settings,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, r, i, o]) => {
        this._blockContext.blockEditorAlias = o ?? "", this.blockGridValue = {
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
  if ($(this, T) != null && e.unique == "" && (e.unique = $(this, T).getUnique()), $(this, T) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = $(this, T).getDocumentTypeUnique()), !R(this, q, at).call(this, e)) {
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
y.styles = [
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
], y.prototype, "content", 2);
g([
  d({ attribute: !1 })
], y.prototype, "settings", 2);
g([
  d({ attribute: !1 })
], y.prototype, "contentKey", 2);
g([
  d({ attribute: !1 })
], y.prototype, "config", 2);
g([
  d({ attribute: !1 })
], y.prototype, "unpublished", 2);
g([
  d({ attribute: !1 })
], y.prototype, "icon", 2);
g([
  d({ attribute: !1 })
], y.prototype, "label", 2);
g([
  w()
], y.prototype, "_htmlMarkup", 2);
g([
  w()
], y.prototype, "_isLoading", 2);
g([
  w()
], y.prototype, "_error", 2);
g([
  w()
], y.prototype, "_sortModeActive", 2);
g([
  d({ attribute: !1 })
], y.prototype, "blockGridValue", 1);
y = g([
  Ee(ur)
], y);
var hr = Object.defineProperty, dr = Object.getOwnPropertyDescriptor, lt = (e) => {
  throw TypeError(e);
}, _ = (e, t, r, i) => {
  for (var o = i > 1 ? void 0 : i ? dr(t, r) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (i ? s(t, r, o) : s(o)) || o);
  return i && o && hr(t, r, o), o;
}, $e = (e, t, r) => t.has(e) || lt("Cannot " + r), L = (e, t, r) => ($e(e, t, "read from private field"), t.get(e)), me = (e, t, r) => t.has(e) ? lt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ct = (e, t, r, i) => ($e(e, t, "write to private field"), t.set(e, r), r), N = (e, t, r) => ($e(e, t, "access private method"), r), E, ce, S, ut, ht, dt, ft, ve, pt, yt, bt;
const fr = "block-list-preview";
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
      N(this, S, yt).call(this);
    }, 500));
  }
  _handleClick(e) {
    var n;
    let t = !0;
    const r = e.composedPath(), i = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (r.filter((s) => s instanceof Element && i.includes(s.tagName)).length > 0) {
      const s = r.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      s != null && s instanceof Oe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
  this.observe((e = L(this, E)) == null ? void 0 : e.sortModeActive, (t) => {
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
        K([e.unique, e.contentTypeUnique]),
        async ([t, r]) => {
          var o, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (o = L(this, E)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (n = L(this, E)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), N(this, S, ve).call(this);
          const { data: i } = await W.getListStylesheet({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          i && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = i);
        }
      ));
    });
  } catch {
    L(this, ce) == null && L(this, E) != null && this._blockContext.unique == "" && this.consumeContext(Ae, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (r) => {
        var o;
        this._blockContext.unique = ((o = L(this, E)) == null ? void 0 : o.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", N(this, S, ve).call(this);
        const { data: i } = await W.getListStylesheet({
          query: {
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
          }
        });
        i && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = i);
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
        r,
        i,
        o,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", await N(this, S, pt).call(this);
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
        r,
        i,
        o,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockListValue = {
          contentData: (t == null ? void 0 : t.filter((s) => s.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (r == null ? void 0 : r.filter((s) => s.key == this._blockContext.settingsUdi)) ?? [],
          expose: (o == null ? void 0 : o.filter((s) => s.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.BlockList": (i == null ? void 0 : i.filter((s) => s.contentKey == this._blockContext.contentUdi)) ?? []
          }
        }, this._blockContext.blockIndex = t == null ? void 0 : t.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
yt = async function() {
  const e = this._blockContext;
  if (L(this, E) != null && e.unique == "" && (e.unique = L(this, E).getUnique()), L(this, E) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = L(this, E).getDocumentTypeUnique()), !N(this, S, bt).call(this, e)) {
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
bt = function(e) {
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
var pr = Object.defineProperty, yr = Object.getOwnPropertyDescriptor, mt = (e) => {
  throw TypeError(e);
}, D = (e, t, r, i) => {
  for (var o = i > 1 ? void 0 : i ? yr(t, r) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (i ? s(t, r, o) : s(o)) || o);
  return i && o && pr(t, r, o), o;
}, Le = (e, t, r) => t.has(e) || mt("Cannot " + r), M = (e, t, r) => (Le(e, t, "read from private field"), t.get(e)), _e = (e, t, r) => t.has(e) ? mt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), _t = (e, t, r, i) => (Le(e, t, "write to private field"), t.set(e, r), r), V = (e, t, r) => (Le(e, t, "access private method"), r), x, ue, B, kt, vt, wt, gt, we, Ct, Tt, Et;
const br = "rich-text-preview";
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
    const r = e.composedPath(), i = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (r.filter((s) => s instanceof Element && i.includes(s.tagName)).length > 0) {
      const s = r.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      s != null && s instanceof Oe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
      K([e.unique, e.contentTypeUnique]),
      async ([t, r]) => {
        var i, o;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = M(this, x)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (o = M(this, x)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), V(this, B, we).call(this);
      }
    ));
  }), M(this, ue) == null && M(this, x) != null && this._blockContext.unique == "" && this.consumeContext(Ae, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var r;
      this._blockContext.unique = ((r = M(this, x)) == null ? void 0 : r.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", V(this, B, we).call(this);
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
        r,
        i,
        o,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", await V(this, B, Ct).call(this);
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
        r,
        i,
        o,
        n
      ]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockRteValue = {
          contentData: (t == null ? void 0 : t.filter((s) => s.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (r == null ? void 0 : r.filter((s) => s.key == this._blockContext.settingsUdi)) ?? [],
          expose: (o == null ? void 0 : o.filter((s) => s.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.RichText": (i == null ? void 0 : i.filter((s) => s.contentKey == this._blockContext.contentUdi)) ?? []
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
  Ee(br)
], v);
var ie, ee, J, Q, Z;
class ge extends He {
  constructor(r) {
    super(r);
    j(this, ie);
    j(this, ee);
    j(this, J);
    j(this, Q);
    j(this, Z);
    z(this, ee, new Mt(void 0)), this.settings = m(this, ee).asObservable(), z(this, J, new je("")), this.unique = m(this, J).asObservable(), z(this, Q, new je("")), this.documentTypeUnique = m(this, Q).asObservable(), z(this, Z, new Dt(!1)), this.sortModeActive = m(this, Z).asObservable(), z(this, ie, new xt(r)), this.getSettings(), this.setSortMode(!1);
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
  constructor(r) {
    super(r);
    j(this, se);
    z(this, se, new gr(r));
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
    var l, c, u;
    if (!r) return;
    const i = r.getOpenApiConfiguration();
    G.setConfig({
      baseUrl: i.base,
      credentials: i.credentials
    }), G.interceptors.request.use(async (a, f) => {
      const H = await i.token();
      return a.headers.set("Authorization", `Bearer ${H}`), a;
    });
    const n = await new xt(e).getSettings();
    let s = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: y,
          forBlockEditor: "block-grid"
        };
        ((l = n.blockGrid.contentTypes) == null ? void 0 : l.length) !== 0 && (a.forContentTypeAlias = n.blockGrid.contentTypes), s.push(a);
      }
      if (n.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        ((c = n.blockList.contentTypes) == null ? void 0 : c.length) !== 0 && (a.forContentTypeAlias = n.blockList.contentTypes), s.push(a);
      }
      if (n.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: v,
          forBlockEditor: "block-rte"
        };
        ((u = n.richText.contentTypes) == null ? void 0 : u.length) !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), s.push(a);
      }
    }
    t.registerMany([
      ...s,
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
  y as a,
  p as b,
  xt as c,
  Rr as o
};
//# sourceMappingURL=index.js.map

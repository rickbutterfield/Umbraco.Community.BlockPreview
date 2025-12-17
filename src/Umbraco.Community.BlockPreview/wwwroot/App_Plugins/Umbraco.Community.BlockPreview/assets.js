var Ie = (e) => {
  throw TypeError(e);
};
var Re = (e, t, i) => t.has(e) || Ie("Cannot " + i);
var m = (e, t, i) => (Re(e, t, "read from private field"), i ? i.call(e) : t.get(e)), j = (e, t, i) => t.has(e) ? Ie("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), z = (e, t, i, r) => (Re(e, t, "write to private field"), r ? r.call(e, i) : t.set(e, i), i);
import { UMB_AUTH_CONTEXT as qt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as St } from "@umbraco-cms/backoffice/context-api";
import { css as Ce, property as d, state as w, customElement as Te, html as A, ifDefined as Ee, unsafeHTML as xe } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Ue } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Bt, UMB_BLOCK_GRID_MANAGER_CONTEXT as $t } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as ie } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as Ae } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as K, UmbObjectState as Lt, UmbStringState as Ke, UmbBooleanState as Ot } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as qe } from "@umbraco-cms/backoffice/property";
import { tryExecute as he, UmbApiError as Se } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Be } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Pt, UMB_BLOCK_LIST_MANAGER_CONTEXT as Dt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Mt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Nt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as We } from "@umbraco-cms/backoffice/class-api";
const Vt = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, i) => typeof i == "bigint" ? i.toString() : i
  )
}, It = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: i,
  responseTransformer: r,
  responseValidator: s,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: c,
  sseSleepFn: a,
  url: u,
  ...l
}) => {
  let f;
  const H = a ?? ((h) => new Promise((_) => setTimeout(_, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, _ = 0;
    const X = l.signal ?? new AbortController().signal;
    for (; !X.aborted; ) {
      _++;
      const te = l.headers instanceof Headers ? l.headers : new Headers(l.headers);
      f !== void 0 && te.set("Last-Event-ID", f);
      try {
        const J = {
          redirect: "follow",
          ...l,
          body: l.serializedBody,
          headers: te,
          signal: X
        };
        let $ = new Request(u, J);
        e && ($ = await e(u, J));
        const C = await (l.fetch ?? globalThis.fetch)($);
        if (!C.ok)
          throw new Error(
            `SSE failed: ${C.status} ${C.statusText}`
          );
        if (!C.body) throw new Error("No body in SSE response");
        const L = C.body.pipeThrough(new TextDecoderStream()).getReader();
        let pe = "";
        const Pe = () => {
          try {
            L.cancel();
          } catch {
          }
        };
        X.addEventListener("abort", Pe);
        try {
          for (; ; ) {
            const { done: Et, value: xt } = await L.read();
            if (Et) break;
            pe += xt;
            const De = pe.split(`

`);
            pe = De.pop() ?? "";
            for (const Ut of De) {
              const At = Ut.split(`
`), ae = [];
              let Me;
              for (const U of At)
                if (U.startsWith("data:"))
                  ae.push(U.replace(/^data:\s*/, ""));
                else if (U.startsWith("event:"))
                  Me = U.replace(/^event:\s*/, "");
                else if (U.startsWith("id:"))
                  f = U.replace(/^id:\s*/, "");
                else if (U.startsWith("retry:")) {
                  const Ve = Number.parseInt(
                    U.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Ve) || (h = Ve);
                }
              let F, Ne = !1;
              if (ae.length) {
                const U = ae.join(`
`);
                try {
                  F = JSON.parse(U), Ne = !0;
                } catch {
                  F = U;
                }
              }
              Ne && (s && await s(F), r && (F = await r(F))), i == null || i({
                data: F,
                event: Me,
                id: f,
                retry: h
              }), ae.length && (yield F);
            }
          }
        } finally {
          X.removeEventListener("abort", Pe), L.releaseLock();
        }
        break;
      } catch (J) {
        if (t == null || t(J), o !== void 0 && _ >= o)
          break;
        const $ = Math.min(
          h * 2 ** (_ - 1),
          c ?? 3e4
        );
        await H($);
      }
    }
  }() };
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
}, Kt = (e) => {
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
}, jt = (e) => {
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
}, Ge = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: r,
  value: s
}) => {
  if (!t) {
    const c = (e ? s : s.map((a) => encodeURIComponent(a))).join(Kt(r));
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
  const n = Rt(r), o = s.map((c) => r === "label" || r === "simple" ? e ? c : encodeURIComponent(c) : de({
    allowReserved: e,
    name: i,
    value: c
  })).join(n);
  return r === "label" || r === "matrix" ? n + o : o;
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
}, He = ({
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
    let a = [];
    Object.entries(s).forEach(([l, f]) => {
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
  const o = jt(r), c = Object.entries(s).map(
    ([a, u]) => de({
      allowReserved: e,
      name: r === "deepObject" ? `${i}[${a}]` : a,
      value: u
    })
  ).join(o);
  return r === "label" || r === "matrix" ? o + c : c;
}, zt = /\{[^{}]+\}/g, Wt = ({ path: e, url: t }) => {
  let i = t;
  const r = t.match(zt);
  if (r)
    for (const s of r) {
      let n = !1, o = s.substring(1, s.length - 1), c = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), c = "label") : o.startsWith(";") && (o = o.substring(1), c = "matrix");
      const a = e[o];
      if (a == null)
        continue;
      if (Array.isArray(a)) {
        i = i.replace(
          s,
          Ge({ explode: n, name: o, style: c, value: a })
        );
        continue;
      }
      if (typeof a == "object") {
        i = i.replace(
          s,
          He({
            explode: n,
            name: o,
            style: c,
            value: a,
            valueOnly: !0
          })
        );
        continue;
      }
      if (c === "matrix") {
        i = i.replace(
          s,
          `;${de({
            name: o,
            value: a
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        c === "label" ? `.${a}` : a
      );
      i = i.replace(s, u);
    }
  return i;
}, Gt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: r,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let o = (e ?? "") + n;
  t && (o = Wt({ path: t, url: o }));
  let c = i ? r(i) : "";
  return c.startsWith("?") && (c = c.substring(1)), c && (o += `?${c}`), o;
};
function Ht(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const Xt = async (e, t) => {
  const i = typeof t == "function" ? await t(e) : t;
  if (i)
    return e.scheme === "bearer" ? `Bearer ${i}` : e.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Xe = ({
  allowReserved: e,
  array: t,
  object: i
} = {}) => (s) => {
  const n = [];
  if (s && typeof s == "object")
    for (const o in s) {
      const c = s[o];
      if (c != null)
        if (Array.isArray(c)) {
          const a = Ge({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "form",
            value: c,
            ...t
          });
          a && n.push(a);
        } else if (typeof c == "object") {
          const a = He({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "deepObject",
            value: c,
            ...i
          });
          a && n.push(a);
        } else {
          const a = de({
            allowReserved: e,
            name: o,
            value: c
          });
          a && n.push(a);
        }
    }
  return n.join("&");
}, Jt = (e) => {
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
}, Ft = (e, t) => {
  var i, r;
  return t ? !!(e.headers.has(t) || (i = e.query) != null && i[t] || (r = e.headers.get("Cookie")) != null && r.includes(`${t}=`)) : !1;
}, Yt = async ({
  security: e,
  ...t
}) => {
  for (const i of e) {
    if (Ft(t, i.name))
      continue;
    const r = await Xt(i, t.auth);
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
}, je = (e) => Gt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Xe(e.querySerializer),
  url: e.url
}), ze = (e, t) => {
  var r;
  const i = { ...e, ...t };
  return (r = i.baseUrl) != null && r.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Je(e.headers, t.headers), i;
}, Qt = (e) => {
  const t = [];
  return e.forEach((i, r) => {
    t.push([r, i]);
  }), t;
}, Je = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i)
      continue;
    const r = i instanceof Headers ? Qt(i) : Object.entries(i);
    for (const [s, n] of r)
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
const Zt = () => ({
  error: new be(),
  request: new be(),
  response: new be()
}), ei = Xe({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), ti = {
  "Content-Type": "application/json"
}, Fe = (e = {}) => ({
  ...Vt,
  headers: ti,
  parseAs: "auto",
  querySerializer: ei,
  ...e
}), ii = (e = {}) => {
  let t = ze(Fe(), e);
  const i = () => ({ ...t }), r = (u) => (t = ze(t, u), i()), s = Zt(), n = async (u) => {
    const l = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Je(t.headers, u.headers),
      serializedBody: void 0
    };
    l.security && await Yt({
      ...l,
      security: l.security
    }), l.requestValidator && await l.requestValidator(l), l.body !== void 0 && l.bodySerializer && (l.serializedBody = l.bodySerializer(l.body)), (l.body === void 0 || l.serializedBody === "") && l.headers.delete("Content-Type");
    const f = je(l);
    return { opts: l, url: f };
  }, o = async (u) => {
    const { opts: l, url: f } = await n(u), H = {
      redirect: "follow",
      ...l,
      body: Ht(l)
    };
    let N = new Request(f, H);
    for (const y of s.request.fns)
      y && (N = await y(N, l));
    const ne = l.fetch;
    let h = await ne(N);
    for (const y of s.response.fns)
      y && (h = await y(h, N, l));
    const _ = {
      request: N,
      response: h
    };
    if (h.ok) {
      const y = (l.parseAs === "auto" ? Jt(h.headers.get("Content-Type")) : l.parseAs) ?? "json";
      if (h.status === 204 || h.headers.get("Content-Length") === "0") {
        let L;
        switch (y) {
          case "arrayBuffer":
          case "blob":
          case "text":
            L = await h[y]();
            break;
          case "formData":
            L = new FormData();
            break;
          case "stream":
            L = h.body;
            break;
          case "json":
          default:
            L = {};
            break;
        }
        return l.responseStyle === "data" ? L : {
          data: L,
          ..._
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
            ..._
          };
      }
      return y === "json" && (l.responseValidator && await l.responseValidator(C), l.responseTransformer && (C = await l.responseTransformer(C))), l.responseStyle === "data" ? C : {
        data: C,
        ..._
      };
    }
    const X = await h.text();
    let te;
    try {
      te = JSON.parse(X);
    } catch {
    }
    const J = te ?? X;
    let $ = J;
    for (const y of s.error.fns)
      y && ($ = await y(J, h, N, l));
    if ($ = $ || {}, l.throwOnError)
      throw $;
    return l.responseStyle === "data" ? void 0 : {
      error: $,
      ..._
    };
  }, c = (u) => (l) => o({ ...l, method: u }), a = (u) => async (l) => {
    const { opts: f, url: H } = await n(l);
    return It({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (N, ne) => {
        let h = new Request(N, ne);
        for (const _ of s.request.fns)
          _ && (h = await _(h, f));
        return h;
      },
      url: H
    });
  };
  return {
    buildUrl: je,
    connect: c("CONNECT"),
    delete: c("DELETE"),
    get: c("GET"),
    getConfig: i,
    head: c("HEAD"),
    interceptors: s,
    options: c("OPTIONS"),
    patch: c("PATCH"),
    post: c("POST"),
    put: c("PUT"),
    request: o,
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
}, W = ii(Fe({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class G {
  static previewGridBlock(t) {
    return ((t == null ? void 0 : t.client) ?? W).post({
      url: "/umbraco/block-preview/api/v1/preview/grid",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getGridStylesheet(t) {
    return ((t == null ? void 0 : t.client) ?? W).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static previewListBlock(t) {
    return ((t == null ? void 0 : t.client) ?? W).post({
      url: "/umbraco/block-preview/api/v1/preview/list",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getListStylesheet(t) {
    return ((t == null ? void 0 : t.client) ?? W).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return ((t == null ? void 0 : t.client) ?? W).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getSettings(t) {
    return ((t == null ? void 0 : t.client) ?? W).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const fe = new St("BlockPreviewContext");
var ri = Object.defineProperty, si = Object.getOwnPropertyDescriptor, Ye = (e) => {
  throw TypeError(e);
}, g = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? si(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && ri(t, i, s), s;
}, $e = (e, t, i) => t.has(e) || Ye("Cannot " + i), O = (e, t, i) => ($e(e, t, "read from private field"), t.get(e)), ye = (e, t, i) => t.has(e) ? Ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qe = (e, t, i, r) => ($e(e, t, "write to private field"), t.set(e, i), i), V = (e, t, i) => ($e(e, t, "access private method"), i), T, le, q, Ze, et, tt, it, _e, rt, st, ot;
const oi = "block-grid-preview";
let b = class extends Ae {
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
      Qe(this, T, e), await V(this, q, Ze).call(this);
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
      V(this, q, st).call(this);
    }, 500));
  }
  _filterLayouts() {
    var i, r, s, n;
    return [
      {
        areas: this._blockContext.areas.map((o) => {
          var a, u;
          return {
            key: o.key,
            items: (u = (a = this._blockContext.layoutAreas) == null ? void 0 : a.find((l) => l.key == o.key)) == null ? void 0 : u.items
          };
        }),
        columnSpan: ((i = this._blockContext.layout) == null ? void 0 : i.columnSpan) ?? 0,
        rowSpan: ((r = this._blockContext.layout) == null ? void 0 : r.rowSpan) ?? 0,
        contentKey: ((s = this._blockContext.layout) == null ? void 0 : s.contentKey) ?? "",
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
      a != null && a instanceof Be && (c = a.href) != null && c.includes("block/edit") && (t = !1);
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
                         href=${Ee(this._blockContext.workspaceEditContentPath)} 
                         @click=${this._handleClick}
                         aria-label="Edit block"
                         class="block-preview-edit"
                         role="button"
                     >
                        ${xe(this._htmlMarkup)}
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
Ze = async function() {
  V(this, q, et).call(this), V(this, q, tt).call(this), await V(this, q, it).call(this);
};
et = function() {
  var e;
  this.observe((e = O(this, T)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
tt = function() {
  this.consumeContext(qe, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
it = async function() {
  try {
    await this.getContext(ie), this.consumeContext(ie, (e) => {
      e && (Qe(this, le, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          var s, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (s = O(this, T)) == null || s.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (n = O(this, T)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), V(this, q, _e).call(this);
          const { data: r } = await G.getGridStylesheet({
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
    O(this, le) == null && O(this, T) != null && this._blockContext.unique == "" && this.consumeContext(Ue, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        var s;
        this._blockContext.unique = ((s = O(this, T)) == null ? void 0 : s.getUnique()) ?? "", this._blockContext.documentTypeUnique = i[0] ?? "", V(this, q, _e).call(this);
        const { data: r } = await G.getGridStylesheet({
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
_e = async function() {
  this.consumeContext(Bt, async (e) => {
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
        o,
        c,
        a
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = c, this._blockContext.layoutAreas = a, await V(this, q, rt).call(this);
      }
    );
  });
};
rt = async function() {
  this.consumeContext($t, (e) => {
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
st = async function() {
  const e = this._blockContext;
  if (O(this, T) != null && e.unique == "" && (e.unique = O(this, T).getUnique()), O(this, T) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = O(this, T).getDocumentTypeUnique()), !V(this, q, ot).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, G.previewGridBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : Se.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
ot = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
b.styles = [
  Ce`
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
  Te(oi)
], b);
var ni = Object.defineProperty, ai = Object.getOwnPropertyDescriptor, nt = (e) => {
  throw TypeError(e);
}, k = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ai(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && ni(t, i, s), s;
}, Le = (e, t, i) => t.has(e) || nt("Cannot " + i), P = (e, t, i) => (Le(e, t, "read from private field"), t.get(e)), me = (e, t, i) => t.has(e) ? nt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), at = (e, t, i, r) => (Le(e, t, "write to private field"), t.set(e, i), i), I = (e, t, i) => (Le(e, t, "access private method"), i), E, ce, S, lt, ct, ut, ht, ve, dt, ft, pt;
const li = "block-list-preview";
let p = class extends Ae {
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
      at(this, E, e), await I(this, S, lt).call(this);
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
      I(this, S, ft).call(this);
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
      a != null && a instanceof Be && (c = a.href) != null && c.includes("block/edit") && (t = !1);
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
                        href=${Ee(this._blockContext.workspaceEditContentPath)}
                        @click=${this._handleClick}
                        aria-label="Edit block"
                        class="block-preview-edit"
                        role="button"
                    >
                        ${xe(this._htmlMarkup)}
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
lt = async function() {
  I(this, S, ct).call(this), I(this, S, ut).call(this), await I(this, S, ht).call(this);
};
ct = function() {
  var e;
  this.observe((e = P(this, E)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
ut = function() {
  this.consumeContext(qe, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ht = async function() {
  try {
    await this.getContext(ie), this.consumeContext(ie, (e) => {
      e && (at(this, ce, e), this.observe(
        K([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          var s, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (s = P(this, E)) == null || s.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (n = P(this, E)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), I(this, S, ve).call(this);
          const { data: r } = await G.getListStylesheet({
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
    P(this, ce) == null && P(this, E) != null && this._blockContext.unique == "" && this.consumeContext(Ue, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (i) => {
        var s;
        this._blockContext.unique = ((s = P(this, E)) == null ? void 0 : s.getUnique()) ?? "", this._blockContext.documentTypeUnique = i[0] ?? "", I(this, S, ve).call(this);
        const { data: r } = await G.getListStylesheet({
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
  this.consumeContext(Pt, (e) => {
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await I(this, S, dt).call(this);
      }
    );
  });
};
dt = function() {
  this.consumeContext(Dt, (e) => {
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
          contentData: (t == null ? void 0 : t.filter((o) => o.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((o) => o.key == this._blockContext.settingsUdi)) ?? [],
          expose: (s == null ? void 0 : s.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.BlockList": (r == null ? void 0 : r.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? []
          }
        }, this._blockContext.blockIndex = t == null ? void 0 : t.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
ft = async function() {
  const e = this._blockContext;
  if (P(this, E) != null && e.unique == "" && (e.unique = P(this, E).getUnique()), P(this, E) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = P(this, E).getDocumentTypeUnique()), !I(this, S, pt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, G.previewListBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : Se.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
pt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
p.styles = [
  Ce`
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
  w()
], p.prototype, "_htmlMarkup", 2);
k([
  w()
], p.prototype, "_isLoading", 2);
k([
  w()
], p.prototype, "_error", 2);
k([
  w()
], p.prototype, "_sortModeActive", 2);
k([
  w()
], p.prototype, "_blockListValue", 2);
k([
  d({ attribute: !1 })
], p.prototype, "blockListValue", 1);
p = k([
  Te(li)
], p);
var ci = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, bt = (e) => {
  throw TypeError(e);
}, M = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ui(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && ci(t, i, s), s;
}, Oe = (e, t, i) => t.has(e) || bt("Cannot " + i), D = (e, t, i) => (Oe(e, t, "read from private field"), t.get(e)), ke = (e, t, i) => t.has(e) ? bt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), yt = (e, t, i, r) => (Oe(e, t, "write to private field"), t.set(e, i), i), R = (e, t, i) => (Oe(e, t, "access private method"), i), x, ue, B, mt, kt, _t, vt, we, wt, gt, Ct;
const hi = "rich-text-preview";
let v = class extends Ae {
  constructor() {
    super(), ke(this, B), ke(this, x), ke(this, ue), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
      yt(this, x, e), R(this, B, mt).call(this);
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
      R(this, B, gt).call(this);
    }, 500));
  }
  _handleClick(e) {
    var n;
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((o) => o instanceof Element && r.includes(o.tagName)).length > 0) {
      const o = i.find((c) => c instanceof Element && c.tagName === "UUI-BUTTON");
      o != null && o instanceof Be && (n = o.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
                    href=${Ee(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${xe(this._htmlMarkup)}
                </a>`;
  }
};
x = /* @__PURE__ */ new WeakMap();
ue = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakSet();
mt = function() {
  R(this, B, kt).call(this), R(this, B, _t).call(this), R(this, B, vt).call(this);
};
kt = function() {
  var e;
  this.observe((e = D(this, x)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.richText) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.richText.stylesheet);
  });
};
_t = function() {
  this.consumeContext(qe, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
vt = function() {
  this.consumeContext(ie, (e) => {
    e && (yt(this, ue, e), this.observe(
      K([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var r, s;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (r = D(this, x)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (s = D(this, x)) == null || s.setDocumentTypeUnique(this._blockContext.documentTypeUnique), R(this, B, we).call(this);
      }
    ));
  }), D(this, ue) == null && D(this, x) != null && this._blockContext.unique == "" && this.consumeContext(Ue, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = D(this, x)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", R(this, B, we).call(this);
    });
  });
};
we = function() {
  this.consumeContext(Mt, (e) => {
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await R(this, B, wt).call(this);
      }
    );
  });
};
wt = function() {
  this.consumeContext(Nt, (e) => {
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
          contentData: (t == null ? void 0 : t.filter((o) => o.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((o) => o.key == this._blockContext.settingsUdi)) ?? [],
          expose: (s == null ? void 0 : s.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.RichText": (r == null ? void 0 : r.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? []
          }
        };
      }
    );
  });
};
gt = async function() {
  const e = this._blockContext;
  if (D(this, x) != null && e.unique == "" && (e.unique = D(this, x).getUnique()), D(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = D(this, x).getDocumentTypeUnique()), !R(this, B, Ct).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, G.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : Se.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Ct = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
v.styles = [
  Ce`
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
M([
  d({ attribute: !1 })
], v.prototype, "content", 2);
M([
  d({ attribute: !1 })
], v.prototype, "settings", 2);
M([
  d({ attribute: !1 })
], v.prototype, "contentKey", 2);
M([
  d({ attribute: !1 })
], v.prototype, "config", 2);
M([
  w()
], v.prototype, "_htmlMarkup", 2);
M([
  w()
], v.prototype, "_isLoading", 2);
M([
  w()
], v.prototype, "_error", 2);
M([
  w()
], v.prototype, "_blockRteValue", 2);
M([
  d({ attribute: !1 })
], v.prototype, "blockRteValue", 1);
v = M([
  Te(hi)
], v);
var re, ee, Y, Q, Z;
class ge extends We {
  constructor(i) {
    super(i);
    j(this, re);
    j(this, ee);
    j(this, Y);
    j(this, Q);
    j(this, Z);
    z(this, ee, new Lt(void 0)), this.settings = m(this, ee).asObservable(), z(this, Y, new Ke("")), this.unique = m(this, Y).asObservable(), z(this, Q, new Ke("")), this.documentTypeUnique = m(this, Q).asObservable(), z(this, Z, new Ot(!1)), this.sortModeActive = m(this, Z).asObservable(), z(this, re, new Tt(i)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const i = await m(this, re).getSettings();
    m(this, ee).setValue(i);
  }
  getUnique() {
    return m(this, Y).getValue();
  }
  async setUnique(i) {
    i != "" && m(this, Y).setValue(i);
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
re = new WeakMap(), ee = new WeakMap(), Y = new WeakMap(), Q = new WeakMap(), Z = new WeakMap();
const di = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ge,
  default: ge
}, Symbol.toStringTag, { value: "Module" })), fi = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => di)
  }
], pi = [...fi];
var se;
class bi {
  constructor(t) {
    j(this, se);
    z(this, se, t);
  }
  async getSettings() {
    return await he(m(this, se), G.getSettings());
  }
}
se = new WeakMap();
var oe;
class Tt extends We {
  constructor(i) {
    super(i);
    j(this, oe);
    z(this, oe, new bi(i));
  }
  async getSettings() {
    const i = await m(this, oe).getSettings();
    if (i && (i != null && i.data))
      return i.data;
  }
}
oe = new WeakMap();
const Bi = async (e, t) => {
  e.consumeContext(qt, async (i) => {
    var c, a, u;
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    W.setConfig({
      baseUrl: (r == null ? void 0 : r.base) ?? "",
      auth: (r == null ? void 0 : r.token) ?? void 0,
      credentials: (r == null ? void 0 : r.credentials) ?? "same-origin"
    }), W.interceptors.request.use(async (l, f) => {
      const H = await r.token();
      return l.headers.set("Authorization", `Bearer ${H}`), l;
    });
    const n = await new Tt(e).getSettings();
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
        ((c = n.blockGrid.contentTypes) == null ? void 0 : c.length) !== 0 && (l.forContentTypeAlias = n.blockGrid.contentTypes), o.push(l);
      }
      if (n.blockList.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        ((a = n.blockList.contentTypes) == null ? void 0 : a.length) !== 0 && (l.forContentTypeAlias = n.blockList.contentTypes), o.push(l);
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
      ...pi
    ]), e.provideContext(fe, new ge(e));
  });
};
export {
  b as BlockGridPreviewCustomView,
  p as BlockListPreviewCustomView,
  v as RichTextPreviewCustomView,
  bi as SettingsDataSource,
  Tt as SettingsRepository,
  Bi as onInit
};
//# sourceMappingURL=assets.js.map

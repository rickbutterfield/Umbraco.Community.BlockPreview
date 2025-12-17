var Ie = (e) => {
  throw TypeError(e);
};
var Re = (e, t, r) => t.has(e) || Ie("Cannot " + r);
var k = (e, t, r) => (Re(e, t, "read from private field"), r ? r.call(e) : t.get(e)), z = (e, t, r) => t.has(e) ? Ie("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), W = (e, t, r, i) => (Re(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r);
import { UMB_AUTH_CONTEXT as qt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as St } from "@umbraco-cms/backoffice/context-api";
import { css as Ce, property as d, state as w, customElement as Te, html as A, ifDefined as Ee, unsafeHTML as xe } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Ue } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Bt, UMB_BLOCK_GRID_MANAGER_CONTEXT as $t } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as re } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as Ae } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as j, UmbObjectState as Lt, UmbStringState as Ke, UmbBooleanState as Ot } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as qe } from "@umbraco-cms/backoffice/property";
import { tryExecute as he, UmbApiError as Se } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Be } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Pt, UMB_BLOCK_LIST_MANAGER_CONTEXT as Dt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Mt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Nt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as We } from "@umbraco-cms/backoffice/class-api";
const Vt = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, r) => typeof r == "bigint" ? r.toString() : r
  )
}, It = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: r,
  responseTransformer: i,
  responseValidator: s,
  sseDefaultRetryDelay: n,
  sseMaxRetryAttempts: o,
  sseMaxRetryDelay: l,
  sseSleepFn: a,
  url: u,
  ...c
}) => {
  let f;
  const H = a ?? ((h) => new Promise((_) => setTimeout(_, h)));
  return { stream: async function* () {
    let h = n ?? 3e3, _ = 0;
    const X = c.signal ?? new AbortController().signal;
    for (; !X.aborted; ) {
      _++;
      const te = c.headers instanceof Headers ? c.headers : new Headers(c.headers);
      f !== void 0 && te.set("Last-Event-ID", f);
      try {
        const J = {
          redirect: "follow",
          ...c,
          body: c.serializedBody,
          headers: te,
          signal: X
        };
        let $ = new Request(u, J);
        e && ($ = await e(u, J));
        const C = await (c.fetch ?? globalThis.fetch)($);
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
              Ne && (s && await s(F), i && (F = await i(F))), r == null || r({
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
          l ?? 3e4
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
  name: r,
  style: i,
  value: s
}) => {
  if (!t) {
    const l = (e ? s : s.map((a) => encodeURIComponent(a))).join(Kt(i));
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
  const n = Rt(i), o = s.map((l) => i === "label" || i === "simple" ? e ? l : encodeURIComponent(l) : de({
    allowReserved: e,
    name: r,
    value: l
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
}, He = ({
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
    let a = [];
    Object.entries(s).forEach(([c, f]) => {
      a = [
        ...a,
        c,
        e ? f : encodeURIComponent(f)
      ];
    });
    const u = a.join(",");
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
  const o = jt(i), l = Object.entries(s).map(
    ([a, u]) => de({
      allowReserved: e,
      name: i === "deepObject" ? `${r}[${a}]` : a,
      value: u
    })
  ).join(o);
  return i === "label" || i === "matrix" ? o + l : l;
}, zt = /\{[^{}]+\}/g, Wt = ({ path: e, url: t }) => {
  let r = t;
  const i = t.match(zt);
  if (i)
    for (const s of i) {
      let n = !1, o = s.substring(1, s.length - 1), l = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), l = "label") : o.startsWith(";") && (o = o.substring(1), l = "matrix");
      const a = e[o];
      if (a == null)
        continue;
      if (Array.isArray(a)) {
        r = r.replace(
          s,
          Ge({ explode: n, name: o, style: l, value: a })
        );
        continue;
      }
      if (typeof a == "object") {
        r = r.replace(
          s,
          He({
            explode: n,
            name: o,
            style: l,
            value: a,
            valueOnly: !0
          })
        );
        continue;
      }
      if (l === "matrix") {
        r = r.replace(
          s,
          `;${de({
            name: o,
            value: a
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        l === "label" ? `.${a}` : a
      );
      r = r.replace(s, u);
    }
  return r;
}, Gt = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: i,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let o = (e ?? "") + n;
  t && (o = Wt({ path: t, url: o }));
  let l = r ? i(r) : "";
  return l.startsWith("?") && (l = l.substring(1)), l && (o += `?${l}`), o;
};
function Ht(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const Xt = async (e, t) => {
  const r = typeof t == "function" ? await t(e) : t;
  if (r)
    return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, Xe = ({
  allowReserved: e,
  array: t,
  object: r
} = {}) => (s) => {
  const n = [];
  if (s && typeof s == "object")
    for (const o in s) {
      const l = s[o];
      if (l != null)
        if (Array.isArray(l)) {
          const a = Ge({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "form",
            value: l,
            ...t
          });
          a && n.push(a);
        } else if (typeof l == "object") {
          const a = He({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "deepObject",
            value: l,
            ...r
          });
          a && n.push(a);
        } else {
          const a = de({
            allowReserved: e,
            name: o,
            value: l
          });
          a && n.push(a);
        }
    }
  return n.join("&");
}, Jt = (e) => {
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
}, Ft = (e, t) => {
  var r, i;
  return t ? !!(e.headers.has(t) || (r = e.query) != null && r[t] || (i = e.headers.get("Cookie")) != null && i.includes(`${t}=`)) : !1;
}, Yt = async ({
  security: e,
  ...t
}) => {
  for (const r of e) {
    if (Ft(t, r.name))
      continue;
    const i = await Xt(r, t.auth);
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
}, je = (e) => Gt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Xe(e.querySerializer),
  url: e.url
}), ze = (e, t) => {
  var i;
  const r = { ...e, ...t };
  return (i = r.baseUrl) != null && i.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = Je(e.headers, t.headers), r;
}, Qt = (e) => {
  const t = [];
  return e.forEach((r, i) => {
    t.push([i, r]);
  }), t;
}, Je = (...e) => {
  const t = new Headers();
  for (const r of e) {
    if (!r)
      continue;
    const i = r instanceof Headers ? Qt(r) : Object.entries(r);
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
const Zt = () => ({
  error: new be(),
  request: new be(),
  response: new be()
}), er = Xe({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), tr = {
  "Content-Type": "application/json"
}, Fe = (e = {}) => ({
  ...Vt,
  headers: tr,
  parseAs: "auto",
  querySerializer: er,
  ...e
}), rr = (e = {}) => {
  let t = ze(Fe(), e);
  const r = () => ({ ...t }), i = (u) => (t = ze(t, u), r()), s = Zt(), n = async (u) => {
    const c = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Je(t.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await Yt({
      ...c,
      security: c.security
    }), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const f = je(c);
    return { opts: c, url: f };
  }, o = async (u) => {
    const { opts: c, url: f } = await n(u), H = {
      redirect: "follow",
      ...c,
      body: Ht(c)
    };
    let V = new Request(f, H);
    for (const y of s.request.fns)
      y && (V = await y(V, c));
    const ne = c.fetch;
    let h = await ne(V);
    for (const y of s.response.fns)
      y && (h = await y(h, V, c));
    const _ = {
      request: V,
      response: h
    };
    if (h.ok) {
      const y = (c.parseAs === "auto" ? Jt(h.headers.get("Content-Type")) : c.parseAs) ?? "json";
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
        return c.responseStyle === "data" ? L : {
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
          return c.responseStyle === "data" ? h.body : {
            data: h.body,
            ..._
          };
      }
      return y === "json" && (c.responseValidator && await c.responseValidator(C), c.responseTransformer && (C = await c.responseTransformer(C))), c.responseStyle === "data" ? C : {
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
      y && ($ = await y(J, h, V, c));
    if ($ = $ || {}, c.throwOnError)
      throw $;
    return c.responseStyle === "data" ? void 0 : {
      error: $,
      ..._
    };
  }, l = (u) => (c) => o({ ...c, method: u }), a = (u) => async (c) => {
    const { opts: f, url: H } = await n(c);
    return It({
      ...f,
      body: f.body,
      headers: f.headers,
      method: u,
      onRequest: async (V, ne) => {
        let h = new Request(V, ne);
        for (const _ of s.request.fns)
          _ && (h = await _(h, f));
        return h;
      },
      url: H
    });
  };
  return {
    buildUrl: je,
    connect: l("CONNECT"),
    delete: l("DELETE"),
    get: l("GET"),
    getConfig: r,
    head: l("HEAD"),
    interceptors: s,
    options: l("OPTIONS"),
    patch: l("PATCH"),
    post: l("POST"),
    put: l("PUT"),
    request: o,
    setConfig: i,
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
    trace: l("TRACE")
  };
}, O = rr(Fe({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class G {
  static previewGridBlock(t) {
    return ((t == null ? void 0 : t.client) ?? O).post({
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
    return ((t == null ? void 0 : t.client) ?? O).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheet",
      ...t
    });
  }
  static getGridStylesheets(t) {
    return ((t == null ? void 0 : t.client) ?? O).get({
      url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets",
      ...t
    });
  }
  static previewListBlock(t) {
    return ((t == null ? void 0 : t.client) ?? O).post({
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
    return ((t == null ? void 0 : t.client) ?? O).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheet",
      ...t
    });
  }
  static getListStylesheets(t) {
    return ((t == null ? void 0 : t.client) ?? O).get({
      url: "/umbraco/block-preview/api/v1/preview/list/stylesheets",
      ...t
    });
  }
  static previewRichTextMarkup(t) {
    return ((t == null ? void 0 : t.client) ?? O).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getSettings(t) {
    return ((t == null ? void 0 : t.client) ?? O).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const fe = new St("BlockPreviewContext");
var ir = Object.defineProperty, sr = Object.getOwnPropertyDescriptor, Ye = (e) => {
  throw TypeError(e);
}, g = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? sr(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && ir(t, r, s), s;
}, $e = (e, t, r) => t.has(e) || Ye("Cannot " + r), P = (e, t, r) => ($e(e, t, "read from private field"), t.get(e)), ye = (e, t, r) => t.has(e) ? Ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Qe = (e, t, r, i) => ($e(e, t, "write to private field"), t.set(e, r), r), I = (e, t, r) => ($e(e, t, "access private method"), r), T, le, q, Ze, et, tt, rt, _e, it, st, ot;
const or = "block-grid-preview";
let b = class extends Ae {
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
      Qe(this, T, e), await I(this, q, Ze).call(this);
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
      I(this, q, st).call(this);
    }, 500));
  }
  _filterLayouts() {
    var r, i, s, n;
    return [
      {
        areas: this._blockContext.areas.map((o) => {
          var a, u;
          return {
            key: o.key,
            items: (u = (a = this._blockContext.layoutAreas) == null ? void 0 : a.find((c) => c.key == o.key)) == null ? void 0 : u.items
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
    var l;
    let t = !0;
    const r = e.composedPath(), i = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (r.filter((a) => a instanceof Element && i.includes(a.tagName)).length > 0) {
      const a = r.find((u) => u instanceof Element && u.tagName === "UUI-BUTTON");
      a != null && a instanceof Be && (l = a.href) != null && l.includes("block/edit") && (t = !1);
    }
    const n = r.filter((a) => a instanceof Element && a.tagName === "A" && a.classList.contains("block-preview-edit"));
    if (n.length > 0 && (t = !1), r.filter((a) => a instanceof Element && a.tagName === "A" && a.hasAttribute("data-block-preview-link")).length > 0) {
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
                    ${this._styleElements}
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
  I(this, q, et).call(this), I(this, q, tt).call(this), await I(this, q, rt).call(this);
};
et = function() {
  var e;
  this.observe((e = P(this, T)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
tt = function() {
  this.consumeContext(qe, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
rt = async function() {
  try {
    await this.getContext(re), this.consumeContext(re, (e) => {
      e && (Qe(this, le, e), this.observe(
        j([e.unique, e.contentTypeUnique]),
        async ([t, r]) => {
          var s, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (s = P(this, T)) == null || s.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (n = P(this, T)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), I(this, q, _e).call(this);
          const { data: i } = await G.getGridStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          i && i.length > 0 && (this._styleElements = i.map((o) => {
            const l = document.createElement("link");
            return l.rel = "stylesheet", l.href = o, l;
          }));
        }
      ));
    });
  } catch {
    P(this, le) == null && P(this, T) != null && this._blockContext.unique == "" && this.consumeContext(Ue, async (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (r) => {
        var s;
        this._blockContext.unique = ((s = P(this, T)) == null ? void 0 : s.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", I(this, q, _e).call(this);
        const { data: i } = await G.getGridStylesheets({
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
_e = async function() {
  this.consumeContext(Bt, async (e) => {
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
        l,
        a
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = o, this._blockContext.layout = l, this._blockContext.layoutAreas = a, await I(this, q, it).call(this);
      }
    );
  });
};
it = async function() {
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
st = async function() {
  const e = this._blockContext;
  if (P(this, T) != null && e.unique == "" && (e.unique = P(this, T).getUnique()), P(this, T) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = P(this, T).getDocumentTypeUnique()), !I(this, q, ot).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await he(this, G.previewGridBlock({
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
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Se.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
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
  Te(or)
], b);
var nr = Object.defineProperty, ar = Object.getOwnPropertyDescriptor, nt = (e) => {
  throw TypeError(e);
}, m = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? ar(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && nr(t, r, s), s;
}, Le = (e, t, r) => t.has(e) || nt("Cannot " + r), D = (e, t, r) => (Le(e, t, "read from private field"), t.get(e)), ke = (e, t, r) => t.has(e) ? nt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), at = (e, t, r, i) => (Le(e, t, "write to private field"), t.set(e, r), r), R = (e, t, r) => (Le(e, t, "access private method"), r), E, ce, S, lt, ct, ut, ht, ve, dt, ft, pt;
const lr = "block-list-preview";
let p = class extends Ae {
  constructor() {
    super(), ke(this, S), ke(this, E), ke(this, ce), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._styleElements = [], this._sortModeActive = !1, this._blockContext = {
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
      at(this, E, e), await R(this, S, lt).call(this);
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
      R(this, S, ft).call(this);
    }, 500));
  }
  _handleClick(e) {
    var l;
    let t = !0;
    const r = e.composedPath(), i = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (r.filter((a) => a instanceof Element && i.includes(a.tagName)).length > 0) {
      const a = r.find((u) => u instanceof Element && u.tagName === "UUI-BUTTON");
      a != null && a instanceof Be && (l = a.href) != null && l.includes("block/edit") && (t = !1);
    }
    const n = r.filter((a) => a instanceof Element && a.tagName === "A" && a.classList.contains("block-preview-edit"));
    if (n.length > 0 && (t = !1), r.filter((a) => a instanceof Element && a.tagName === "A" && a.hasAttribute("data-block-preview-link")).length > 0) {
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
                    ${this._styleElements}
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
  R(this, S, ct).call(this), R(this, S, ut).call(this), await R(this, S, ht).call(this);
};
ct = function() {
  var e;
  this.observe((e = D(this, E)) == null ? void 0 : e.sortModeActive, (t) => {
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
    await this.getContext(re), this.consumeContext(re, (e) => {
      e && (at(this, ce, e), this.observe(
        j([e.unique, e.contentTypeUnique]),
        async ([t, r]) => {
          var s, n;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (s = D(this, E)) == null || s.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (n = D(this, E)) == null || n.setDocumentTypeUnique(this._blockContext.documentTypeUnique), R(this, S, ve).call(this);
          const { data: i } = await G.getListStylesheets({
            query: {
              documentTypeUnique: this._blockContext.documentTypeUnique,
              nodeKey: this._blockContext.unique
            }
          });
          i && i.length > 0 && (this._styleElements = i.map((o) => {
            const l = document.createElement("link");
            return l.rel = "stylesheet", l.href = o, l;
          }));
        }
      ));
    });
  } catch {
    D(this, ce) == null && D(this, E) != null && this._blockContext.unique == "" && this.consumeContext(Ue, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, async (r) => {
        var s;
        this._blockContext.unique = ((s = D(this, E)) == null ? void 0 : s.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", R(this, S, ve).call(this);
        const { data: i } = await G.getListStylesheets({
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
  this.consumeContext(Pt, (e) => {
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await R(this, S, dt).call(this);
      }
    );
  });
};
dt = function() {
  this.consumeContext(Dt, (e) => {
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
ft = async function() {
  const e = this._blockContext;
  if (D(this, E) != null && e.unique == "" && (e.unique = D(this, E).getUnique()), D(this, E) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = D(this, E).getDocumentTypeUnique()), !R(this, S, pt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await he(this, G.previewListBlock({
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
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Se.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
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
m([
  d({ attribute: !1 })
], p.prototype, "content", 2);
m([
  d({ attribute: !1 })
], p.prototype, "settings", 2);
m([
  d({ attribute: !1 })
], p.prototype, "contentKey", 2);
m([
  d({ attribute: !1 })
], p.prototype, "config", 2);
m([
  d({ attribute: !1 })
], p.prototype, "unpublished", 2);
m([
  d({ attribute: !1 })
], p.prototype, "icon", 2);
m([
  d({ attribute: !1 })
], p.prototype, "label", 2);
m([
  w()
], p.prototype, "_htmlMarkup", 2);
m([
  w()
], p.prototype, "_isLoading", 2);
m([
  w()
], p.prototype, "_error", 2);
m([
  w()
], p.prototype, "_sortModeActive", 2);
m([
  w()
], p.prototype, "_blockListValue", 2);
m([
  d({ attribute: !1 })
], p.prototype, "blockListValue", 1);
p = m([
  Te(lr)
], p);
var cr = Object.defineProperty, ur = Object.getOwnPropertyDescriptor, bt = (e) => {
  throw TypeError(e);
}, N = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? ur(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && cr(t, r, s), s;
}, Oe = (e, t, r) => t.has(e) || bt("Cannot " + r), M = (e, t, r) => (Oe(e, t, "read from private field"), t.get(e)), me = (e, t, r) => t.has(e) ? bt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), yt = (e, t, r, i) => (Oe(e, t, "write to private field"), t.set(e, r), r), K = (e, t, r) => (Oe(e, t, "access private method"), r), x, ue, B, kt, mt, _t, vt, we, wt, gt, Ct;
const hr = "rich-text-preview";
let v = class extends Ae {
  constructor() {
    super(), me(this, B), me(this, x), me(this, ue), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
      yt(this, x, e), K(this, B, kt).call(this);
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
      K(this, B, gt).call(this);
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
      const o = r.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
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
kt = function() {
  K(this, B, mt).call(this), K(this, B, _t).call(this), K(this, B, vt).call(this);
};
mt = function() {
  var e;
  this.observe((e = M(this, x)) == null ? void 0 : e.settings, (t) => {
    var r;
    (r = t == null ? void 0 : t.richText) != null && r.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.richText.stylesheet);
  });
};
_t = function() {
  this.consumeContext(qe, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
vt = function() {
  this.consumeContext(re, (e) => {
    e && (yt(this, ue, e), this.observe(
      j([e.unique, e.contentTypeUnique]),
      async ([t, r]) => {
        var i, s;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = M(this, x)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (s = M(this, x)) == null || s.setDocumentTypeUnique(this._blockContext.documentTypeUnique), K(this, B, we).call(this);
      }
    ));
  }), M(this, ue) == null && M(this, x) != null && this._blockContext.unique == "" && this.consumeContext(Ue, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var r;
      this._blockContext.unique = ((r = M(this, x)) == null ? void 0 : r.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", K(this, B, we).call(this);
    });
  });
};
we = function() {
  this.consumeContext(Mt, (e) => {
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await K(this, B, wt).call(this);
      }
    );
  });
};
wt = function() {
  this.consumeContext(Nt, (e) => {
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
gt = async function() {
  const e = this._blockContext;
  if (M(this, x) != null && e.unique == "" && (e.unique = M(this, x).getUnique()), M(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = M(this, x).getDocumentTypeUnique()), !K(this, B, Ct).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await he(this, G.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Se.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
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
N([
  d({ attribute: !1 })
], v.prototype, "content", 2);
N([
  d({ attribute: !1 })
], v.prototype, "settings", 2);
N([
  d({ attribute: !1 })
], v.prototype, "contentKey", 2);
N([
  d({ attribute: !1 })
], v.prototype, "config", 2);
N([
  w()
], v.prototype, "_htmlMarkup", 2);
N([
  w()
], v.prototype, "_isLoading", 2);
N([
  w()
], v.prototype, "_error", 2);
N([
  w()
], v.prototype, "_blockRteValue", 2);
N([
  d({ attribute: !1 })
], v.prototype, "blockRteValue", 1);
v = N([
  Te(hr)
], v);
var ie, ee, Y, Q, Z;
class ge extends We {
  constructor(r) {
    super(r);
    z(this, ie);
    z(this, ee);
    z(this, Y);
    z(this, Q);
    z(this, Z);
    W(this, ee, new Lt(void 0)), this.settings = k(this, ee).asObservable(), W(this, Y, new Ke("")), this.unique = k(this, Y).asObservable(), W(this, Q, new Ke("")), this.documentTypeUnique = k(this, Q).asObservable(), W(this, Z, new Ot(!1)), this.sortModeActive = k(this, Z).asObservable(), W(this, ie, new Tt(r)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const r = await k(this, ie).getSettings();
    k(this, ee).setValue(r);
  }
  getUnique() {
    return k(this, Y).getValue();
  }
  async setUnique(r) {
    r != "" && k(this, Y).setValue(r);
  }
  getDocumentTypeUnique() {
    return k(this, Q).getValue();
  }
  async setDocumentTypeUnique(r) {
    r != "" && k(this, Q).setValue(r);
  }
  getSortMode() {
    return k(this, Z).getValue();
  }
  async setSortMode(r) {
    k(this, Z).setValue(r);
  }
}
ie = new WeakMap(), ee = new WeakMap(), Y = new WeakMap(), Q = new WeakMap(), Z = new WeakMap();
const dr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ge,
  default: ge
}, Symbol.toStringTag, { value: "Module" })), fr = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => dr)
  }
], pr = [...fr];
var se;
class br {
  constructor(t) {
    z(this, se);
    W(this, se, t);
  }
  async getSettings() {
    return await he(k(this, se), G.getSettings());
  }
}
se = new WeakMap();
var oe;
class Tt extends We {
  constructor(r) {
    super(r);
    z(this, oe);
    W(this, oe, new br(r));
  }
  async getSettings() {
    const r = await k(this, oe).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
oe = new WeakMap();
const Br = async (e, t) => {
  e.consumeContext(qt, async (r) => {
    var l, a, u;
    if (!r) return;
    const i = r.getOpenApiConfiguration();
    O.setConfig({
      baseUrl: (i == null ? void 0 : i.base) ?? "",
      auth: (i == null ? void 0 : i.token) ?? void 0,
      credentials: (i == null ? void 0 : i.credentials) ?? "same-origin"
    }), O.interceptors.request.use(async (c, f) => {
      const H = await i.token();
      return c.headers.set("Authorization", `Bearer ${H}`), c;
    });
    const n = await new Tt(e).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let c = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: b,
          forBlockEditor: "block-grid"
        };
        ((l = n.blockGrid.contentTypes) == null ? void 0 : l.length) !== 0 && (c.forContentTypeAlias = n.blockGrid.contentTypes), o.push(c);
      }
      if (n.blockList.enabled) {
        let c = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: p,
          forBlockEditor: "block-list"
        };
        ((a = n.blockList.contentTypes) == null ? void 0 : a.length) !== 0 && (c.forContentTypeAlias = n.blockList.contentTypes), o.push(c);
      }
      if (n.richText.enabled) {
        let c = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: v,
          forBlockEditor: "block-rte"
        };
        ((u = n.richText.contentTypes) == null ? void 0 : u.length) !== 0 && (c.forContentTypeAlias = n.richText.contentTypes), o.push(c);
      }
    }
    t.registerMany([
      ...o,
      ...pr
    ]), e.provideContext(fe, new ge(e));
  });
};
export {
  b as BlockGridPreviewCustomView,
  p as BlockListPreviewCustomView,
  v as RichTextPreviewCustomView,
  br as SettingsDataSource,
  Tt as SettingsRepository,
  Br as onInit
};
//# sourceMappingURL=assets.js.map

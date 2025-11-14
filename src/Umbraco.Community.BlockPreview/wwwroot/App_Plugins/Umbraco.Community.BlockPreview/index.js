var Re = (e) => {
  throw TypeError(e);
};
var Ne = (e, t, i) => t.has(e) || Re("Cannot " + i);
var k = (e, t, i) => (Ne(e, t, "read from private field"), i ? i.call(e) : t.get(e)), W = (e, t, i) => t.has(e) ? Re("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), z = (e, t, i, r) => (Ne(e, t, "write to private field"), r ? r.call(e, i) : t.set(e, i), i);
import { UMB_AUTH_CONTEXT as St } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as $t } from "@umbraco-cms/backoffice/context-api";
import { css as Ce, property as h, state as b, customElement as Te, html as P, ifDefined as Ee, unsafeHTML as xe } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Ue } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ot, UMB_BLOCK_GRID_MANAGER_CONTEXT as Pt, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as Dt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as te } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as Ae } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as H, UmbObjectState as Lt, UmbStringState as Ve, UmbBooleanState as Bt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as Se, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as Ke } from "@umbraco-cms/backoffice/property";
import { tryExecute as he, UmbApiError as $e } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Oe } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Mt, UMB_BLOCK_LIST_MANAGER_CONTEXT as qt, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as It } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Rt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Nt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as We } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as Vt } from "@umbraco-cms/backoffice/property-action";
const Kt = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, i) => typeof i == "bigint" ? i.toString() : i
  )
}, jt = ({
  onSseError: e,
  onSseEvent: t,
  responseTransformer: i,
  responseValidator: r,
  sseDefaultRetryDelay: o,
  sseMaxRetryAttempts: s,
  sseMaxRetryDelay: n,
  sseSleepFn: l,
  url: c,
  ...u
}) => {
  let a;
  const y = l ?? ((A) => new Promise((p) => setTimeout(p, A)));
  return { stream: async function* () {
    let A = o ?? 3e3, p = 0;
    const R = u.signal ?? new AbortController().signal;
    for (; !R.aborted; ) {
      p++;
      const ee = u.headers instanceof Headers ? u.headers : new Headers(u.headers);
      a !== void 0 && ee.set("Last-Event-ID", a);
      try {
        const L = await fetch(c, { ...u, headers: ee, signal: R });
        if (!L.ok)
          throw new Error(
            `SSE failed: ${L.status} ${L.statusText}`
          );
        if (!L.body) throw new Error("No body in SSE response");
        const j = L.body.pipeThrough(new TextDecoderStream()).getReader();
        let N = "";
        const m = () => {
          try {
            j.cancel();
          } catch {
          }
        };
        R.addEventListener("abort", m);
        try {
          for (; ; ) {
            const { done: G, value: xt } = await j.read();
            if (G) break;
            N += xt;
            const Be = N.split(`

`);
            N = Be.pop() ?? "";
            for (const Ut of Be) {
              const At = Ut.split(`
`), ne = [];
              let Me;
              for (const S of At)
                if (S.startsWith("data:"))
                  ne.push(S.replace(/^data:\s*/, ""));
                else if (S.startsWith("event:"))
                  Me = S.replace(/^event:\s*/, "");
                else if (S.startsWith("id:"))
                  a = S.replace(/^id:\s*/, "");
                else if (S.startsWith("retry:")) {
                  const Ie = Number.parseInt(
                    S.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(Ie) || (A = Ie);
                }
              let F, qe = !1;
              if (ne.length) {
                const S = ne.join(`
`);
                try {
                  F = JSON.parse(S), qe = !0;
                } catch {
                  F = S;
                }
              }
              qe && (r && await r(F), i && (F = await i(F))), t == null || t({
                data: F,
                event: Me,
                id: a,
                retry: A
              }), ne.length && (yield F);
            }
          }
        } finally {
          R.removeEventListener("abort", m), j.releaseLock();
        }
        break;
      } catch (L) {
        if (e == null || e(L), s !== void 0 && p >= s)
          break;
        const j = Math.min(
          A * 2 ** (p - 1),
          n ?? 3e4
        );
        await y(j);
      }
    }
  }() };
}, Gt = async (e, t) => {
  const i = typeof t == "function" ? await t(e) : t;
  if (i)
    return e.scheme === "bearer" ? `Bearer ${i}` : e.scheme === "basic" ? `Basic ${btoa(i)}` : i;
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
}, zt = (e) => {
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
}, Ht = (e) => {
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
}, ze = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: r,
  value: o
}) => {
  if (!t) {
    const l = (e ? o : o.map((c) => encodeURIComponent(c))).join(zt(r));
    switch (r) {
      case "label":
        return `.${l}`;
      case "matrix":
        return `;${i}=${l}`;
      case "simple":
        return l;
      default:
        return `${i}=${l}`;
    }
  }
  const s = Wt(r), n = o.map((l) => r === "label" || r === "simple" ? e ? l : encodeURIComponent(l) : de({
    allowReserved: e,
    name: i,
    value: l
  })).join(s);
  return r === "label" || r === "matrix" ? s + n : n;
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
  value: o,
  valueOnly: s
}) => {
  if (o instanceof Date)
    return s ? o.toISOString() : `${i}=${o.toISOString()}`;
  if (r !== "deepObject" && !t) {
    let c = [];
    Object.entries(o).forEach(([a, y]) => {
      c = [
        ...c,
        a,
        e ? y : encodeURIComponent(y)
      ];
    });
    const u = c.join(",");
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
  const n = Ht(r), l = Object.entries(o).map(
    ([c, u]) => de({
      allowReserved: e,
      name: r === "deepObject" ? `${i}[${c}]` : c,
      value: u
    })
  ).join(n);
  return r === "label" || r === "matrix" ? n + l : l;
}, Ft = /\{[^{}]+\}/g, Xt = ({ path: e, url: t }) => {
  let i = t;
  const r = t.match(Ft);
  if (r)
    for (const o of r) {
      let s = !1, n = o.substring(1, o.length - 1), l = "simple";
      n.endsWith("*") && (s = !0, n = n.substring(0, n.length - 1)), n.startsWith(".") ? (n = n.substring(1), l = "label") : n.startsWith(";") && (n = n.substring(1), l = "matrix");
      const c = e[n];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        i = i.replace(
          o,
          ze({ explode: s, name: n, style: l, value: c })
        );
        continue;
      }
      if (typeof c == "object") {
        i = i.replace(
          o,
          He({
            explode: s,
            name: n,
            style: l,
            value: c,
            valueOnly: !0
          })
        );
        continue;
      }
      if (l === "matrix") {
        i = i.replace(
          o,
          `;${de({
            name: n,
            value: c
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        l === "label" ? `.${c}` : c
      );
      i = i.replace(o, u);
    }
  return i;
}, Yt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: r,
  url: o
}) => {
  const s = o.startsWith("/") ? o : `/${o}`;
  let n = (e ?? "") + s;
  t && (n = Xt({ path: t, url: n }));
  let l = i ? r(i) : "";
  return l.startsWith("?") && (l = l.substring(1)), l && (n += `?${l}`), n;
}, Fe = ({
  allowReserved: e,
  array: t,
  object: i
} = {}) => (o) => {
  const s = [];
  if (o && typeof o == "object")
    for (const n in o) {
      const l = o[n];
      if (l != null)
        if (Array.isArray(l)) {
          const c = ze({
            allowReserved: e,
            explode: !0,
            name: n,
            style: "form",
            value: l,
            ...t
          });
          c && s.push(c);
        } else if (typeof l == "object") {
          const c = He({
            allowReserved: e,
            explode: !0,
            name: n,
            style: "deepObject",
            value: l,
            ...i
          });
          c && s.push(c);
        } else {
          const c = de({
            allowReserved: e,
            name: n,
            value: l
          });
          c && s.push(c);
        }
    }
  return s.join("&");
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
}, Qt = (e, t) => {
  var i, r;
  return t ? !!(e.headers.has(t) || (i = e.query) != null && i[t] || (r = e.headers.get("Cookie")) != null && r.includes(`${t}=`)) : !1;
}, Zt = async ({
  security: e,
  ...t
}) => {
  for (const i of e) {
    if (Qt(t, i.name))
      continue;
    const r = await Gt(i, t.auth);
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
}, je = (e) => Yt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : Fe(e.querySerializer),
  url: e.url
}), Ge = (e, t) => {
  var r;
  const i = { ...e, ...t };
  return (r = i.baseUrl) != null && r.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Xe(e.headers, t.headers), i;
}, Xe = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i || typeof i != "object")
      continue;
    const r = i instanceof Headers ? i.entries() : Object.entries(i);
    for (const [o, s] of r)
      if (s === null)
        t.delete(o);
      else if (Array.isArray(s))
        for (const n of s)
          t.append(o, n);
      else s !== void 0 && t.set(
        o,
        typeof s == "object" ? JSON.stringify(s) : s
      );
  }
  return t;
};
class be {
  constructor() {
    this._fns = [];
  }
  clear() {
    this._fns = [];
  }
  getInterceptorIndex(t) {
    return typeof t == "number" ? this._fns[t] ? t : -1 : this._fns.indexOf(t);
  }
  exists(t) {
    const i = this.getInterceptorIndex(t);
    return !!this._fns[i];
  }
  eject(t) {
    const i = this.getInterceptorIndex(t);
    this._fns[i] && (this._fns[i] = null);
  }
  update(t, i) {
    const r = this.getInterceptorIndex(t);
    return this._fns[r] ? (this._fns[r] = i, t) : !1;
  }
  use(t) {
    return this._fns = [...this._fns, t], this._fns.length - 1;
  }
}
const ei = () => ({
  error: new be(),
  request: new be(),
  response: new be()
}), ti = Fe({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), ii = {
  "Content-Type": "application/json"
}, Ye = (e = {}) => ({
  ...Kt,
  headers: ii,
  parseAs: "auto",
  querySerializer: ti,
  ...e
}), ri = (e = {}) => {
  let t = Ge(Ye(), e);
  const i = () => ({ ...t }), r = (u) => (t = Ge(t, u), i()), o = ei(), s = async (u) => {
    const a = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Xe(t.headers, u.headers),
      serializedBody: void 0
    };
    a.security && await Zt({
      ...a,
      security: a.security
    }), a.requestValidator && await a.requestValidator(a), a.body && a.bodySerializer && (a.serializedBody = a.bodySerializer(a.body)), (a.serializedBody === void 0 || a.serializedBody === "") && a.headers.delete("Content-Type");
    const y = je(a);
    return { opts: a, url: y };
  }, n = async (u) => {
    const { opts: a, url: y } = await s(u), K = {
      redirect: "follow",
      ...a,
      body: a.serializedBody
    };
    let I = new Request(y, K);
    for (const m of o.request._fns)
      m && (I = await m(I, a));
    const A = a.fetch;
    let p = await A(I);
    for (const m of o.response._fns)
      m && (p = await m(p, I, a));
    const R = {
      request: I,
      response: p
    };
    if (p.ok) {
      if (p.status === 204 || p.headers.get("Content-Length") === "0")
        return a.responseStyle === "data" ? {} : {
          data: {},
          ...R
        };
      const m = (a.parseAs === "auto" ? Jt(p.headers.get("Content-Type")) : a.parseAs) ?? "json";
      let G;
      switch (m) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          G = await p[m]();
          break;
        case "stream":
          return a.responseStyle === "data" ? p.body : {
            data: p.body,
            ...R
          };
      }
      return m === "json" && (a.responseValidator && await a.responseValidator(G), a.responseTransformer && (G = await a.responseTransformer(G))), a.responseStyle === "data" ? G : {
        data: G,
        ...R
      };
    }
    const ee = await p.text();
    let L;
    try {
      L = JSON.parse(ee);
    } catch {
    }
    const j = L ?? ee;
    let N = j;
    for (const m of o.error._fns)
      m && (N = await m(j, p, I, a));
    if (N = N || {}, a.throwOnError)
      throw N;
    return a.responseStyle === "data" ? void 0 : {
      error: N,
      ...R
    };
  }, l = (u) => (a) => n({ ...a, method: u }), c = (u) => async (a) => {
    const { opts: y, url: K } = await s(a);
    return jt({
      ...y,
      body: y.body,
      headers: y.headers,
      method: u,
      url: K
    });
  };
  return {
    buildUrl: je,
    connect: l("CONNECT"),
    delete: l("DELETE"),
    get: l("GET"),
    getConfig: i,
    head: l("HEAD"),
    interceptors: o,
    options: l("OPTIONS"),
    patch: l("PATCH"),
    post: l("POST"),
    put: l("PUT"),
    request: n,
    setConfig: r,
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
}, Q = ri(Ye({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class pe {
  static previewGridBlock(t) {
    return ((t == null ? void 0 : t.client) ?? Q).post({
      url: "/umbraco/block-preview/api/v1/preview/grid",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static previewListBlock(t) {
    return ((t == null ? void 0 : t.client) ?? Q).post({
      url: "/umbraco/block-preview/api/v1/preview/list",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static previewRichTextMarkup(t) {
    return ((t == null ? void 0 : t.client) ?? Q).post({
      url: "/umbraco/block-preview/api/v1/preview/rte",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t == null ? void 0 : t.headers
      }
    });
  }
  static getSettings(t) {
    return ((t == null ? void 0 : t.client) ?? Q).get({
      url: "/umbraco/block-preview/api/v1/settings",
      ...t
    });
  }
}
const fe = new $t("BlockPreviewContext");
var oi = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, Je = (e) => {
  throw TypeError(e);
}, _ = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ni(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && oi(t, i, o), o;
}, Pe = (e, t, i) => t.has(e) || Je("Cannot " + i), $ = (e, t, i) => (Pe(e, t, "read from private field"), t.get(e)), _e = (e, t, i) => t.has(e) ? Je("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qe = (e, t, i, r) => (Pe(e, t, "write to private field"), t.set(e, i), i), E = (e, t, i) => (Pe(e, t, "access private method"), i), w, se, v, Ze, et, tt, it, rt, ae, le, ot;
const nt = "block-grid-preview";
let d = class extends Ae {
  constructor() {
    super(), _e(this, v), _e(this, w), _e(this, se), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._columnSpan = 0, this._rowSpan = 0, this._isFirstLoad = !1, this._sortModeActive = !1, this._pointerDownPos = null, this._isDragging = !1, this._instanceId = `${nt}-${Math.random().toString(36).substr(2, 9)}`, this._connectionCount = 0, this._blockContext = {
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
    }, console.log(`[${this._instanceId}] Constructor called - NEW INSTANCE CREATED`), this.consumeContext(fe, async (e) => {
      Qe(this, w, e), await E(this, v, Ze).call(this);
    });
  }
  set blockGridValue(e) {
    const t = e ? { ...e } : {};
    t.layout ?? (t.layout = {}), t.contentData ?? (t.contentData = []), t.settingsData ?? (t.settingsData = []), t.expose ?? (t.expose = []), this._blockGridValue = t;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  connectedCallback() {
    super.connectedCallback(), this._connectionCount++, console.log(`[${this._instanceId}] connectedCallback #${this._connectionCount} - Element CONNECTED to DOM`), this._isFirstLoad = !0;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), console.log(`[${this._instanceId}] disconnectedCallback - Element DISCONNECTED from DOM (connection count was: ${this._connectionCount})`);
  }
  willUpdate(e) {
    if (!this._isFirstLoad && !e.has("_isFirstLoad") && !e.has("_isLoading")) {
      if (e.has("content") && this.content || e.has("settings") && this.settings) {
        console.log(`[${this._instanceId}] willUpdate - Re-rendering due to content/settings change`, {
          contentChanged: e.has("content"),
          settingsChanged: e.has("settings")
        });
        debugger;
        E(this, v, le).call(this);
      }
      if (e.has("blockGridValue") || e.has("_columnSpan") && this._columnSpan || e.has("_rowSpan") && this._rowSpan) {
        const t = e.get("blockGridValue");
        if (t) {
          const i = t.layout ? t.layout["Umbraco.BlockGrid"] : void 0;
          if (i) {
            const r = this._getColumnSpan(i), o = this._getRowSpan(i);
            if (r !== this._columnSpan || o !== this._rowSpan) {
              console.log(`[${this._instanceId}] willUpdate - Re-rendering due to layout change`, {
                oldColumnSpan: this._columnSpan,
                newColumnSpan: r,
                oldRowSpan: this._rowSpan,
                newRowSpan: o
              });
              debugger;
              this._columnSpan = r, this._rowSpan = o, E(this, v, le).call(this);
            }
          }
        }
      }
    }
    super.willUpdate(e);
  }
  _filterLayouts() {
    var i, r, o, s;
    return [
      {
        areas: this._blockContext.areas.map((n) => {
          var c, u;
          return {
            key: n.key,
            items: (u = (c = this._blockContext.layoutAreas) == null ? void 0 : c.find((a) => a.key == n.key)) == null ? void 0 : u.items
          };
        }),
        columnSpan: ((i = this._blockContext.layout) == null ? void 0 : i.columnSpan) ?? 0,
        rowSpan: ((r = this._blockContext.layout) == null ? void 0 : r.rowSpan) ?? 0,
        contentKey: ((o = this._blockContext.layout) == null ? void 0 : o.contentKey) ?? "",
        settingsKey: (s = this._blockContext.layout) == null ? void 0 : s.settingsKey
      }
    ];
  }
  _getColumnSpan(e) {
    var t;
    return !e || e.length === 0 ? 0 : ((t = e[0]) == null ? void 0 : t.columnSpan) ?? 0;
  }
  _getRowSpan(e) {
    var t;
    return !e || e.length === 0 ? 0 : ((t = e[0]) == null ? void 0 : t.rowSpan) ?? 0;
  }
  _handlePointerDown(e) {
    this._pointerDownPos = { x: e.clientX, y: e.clientY }, this._isDragging = !1;
  }
  _handlePointerMove(e) {
    if (this._pointerDownPos) {
      const t = Math.abs(e.clientX - this._pointerDownPos.x), i = Math.abs(e.clientY - this._pointerDownPos.y);
      (t > 5 || i > 5) && (this._isDragging = !0);
    }
  }
  _handlePointerUp() {
    this._pointerDownPos = null, setTimeout(() => {
      this._isDragging = !1;
    }, 10);
  }
  _handleClick(e) {
    var s;
    if (this._isDragging) {
      e.preventDefault(), e.stopPropagation();
      return;
    }
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && r.includes(n.tagName)).length > 0) {
      const n = i.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      n != null && n instanceof Oe && (s = n.href) != null && s.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return P`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return P`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return P`
                ${this._styleElement}
                <a
                    href=${Ee(this._blockContext.workspaceEditContentPath)} 
                    @pointerdown=${this._handlePointerDown}
                    @pointermove=${this._handlePointerMove}
                    @pointerup=${this._handlePointerUp}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${xe(this._htmlMarkup)}
                </a>
            `;
    } else return P`<umb-block-grid-block
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
w = /* @__PURE__ */ new WeakMap();
se = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakSet();
Ze = async function() {
  E(this, v, et).call(this), E(this, v, tt).call(this), E(this, v, it).call(this), await E(this, v, rt).call(this), await E(this, v, ae).call(this);
};
et = function() {
  var e;
  this.observe((e = $(this, w)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
tt = function() {
  var e;
  this.observe((e = $(this, w)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.blockGrid) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.blockGrid.stylesheet);
  });
};
it = function() {
  this.consumeContext(Se, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
rt = async function() {
  try {
    await this.getContext(te), this.consumeContext(te, (e) => {
      e && (Qe(this, se, e), this.observe(
        H([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          var r, o;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (r = $(this, w)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = $(this, w)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), E(this, v, ae).call(this);
        }
      ));
    });
  } catch {
    $(this, se) == null && $(this, w) != null && this._blockContext.unique == "" && this.consumeContext(Ue, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, (i) => {
        var r;
        this._blockContext.unique = ((r = $(this, w)) == null ? void 0 : r.getUnique()) ?? "", this._blockContext.documentTypeUnique = i[0] ?? "", E(this, v, ae).call(this);
      });
    });
  }
};
ae = async function() {
  this.consumeContext(Ot, (e) => {
    e && this.consumeContext(Pt, (t) => {
      t && this.observe(
        H([
          e.contentKey,
          e.settingsKey,
          e.workspaceEditContentPath,
          e.contentElementTypeAlias,
          e.contentElementTypeKey,
          e.areas,
          e.layout,
          e.layoutAreas,
          t.contents,
          t.settings,
          t.exposes,
          t.propertyAlias
        ]),
        async ([
          i,
          r,
          o,
          s,
          n,
          l,
          c,
          u,
          a,
          y,
          K,
          I
        ]) => {
          this._blockContext.contentUdi = i ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = l, this._blockContext.layout = c, this._blockContext.layoutAreas = u, this._blockContext.blockEditorAlias = I ?? "";
          const A = this._filterLayouts();
          if (this.blockGridValue = {
            contentData: a ?? [],
            settingsData: y ?? [],
            expose: K ?? [],
            layout: { "Umbraco.BlockGrid": A }
          }, this._columnSpan = this._getColumnSpan(A), this._rowSpan = this._getRowSpan(A), this._blockContext.blockIndex = a.indexOf(this.blockGridValue.contentData[0]), this._isFirstLoad) {
            console.log(`[${this._instanceId}] First load complete - rendering block preview`);
            debugger;
            this._isFirstLoad = !1, E(this, v, le).call(this);
          }
        }
      );
    });
  });
};
le = async function() {
  const e = this._blockContext;
  if ($(this, w) != null && e.unique == "" && (e.unique = $(this, w).getUnique()), $(this, w) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = $(this, w).getDocumentTypeUnique()), !E(this, v, ot).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, pe.previewGridBlock({
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
    this._isLoading = !1, i ? this._htmlMarkup = i ?? "" : $e.isUmbApiError(r) && (this._error = r.message);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
ot = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
d.styles = [
  Ce`
    :host {
      display: block;
      height: 100%;
    }

            a.block-preview-edit {
              height: 100%;
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
_([
  h({ attribute: !1 })
], d.prototype, "content", 2);
_([
  h({ attribute: !1 })
], d.prototype, "settings", 2);
_([
  h({ attribute: !1 })
], d.prototype, "contentKey", 2);
_([
  h({ attribute: !1 })
], d.prototype, "config", 2);
_([
  h({ attribute: !1 })
], d.prototype, "unpublished", 2);
_([
  h({ attribute: !1 })
], d.prototype, "icon", 2);
_([
  h({ attribute: !1 })
], d.prototype, "label", 2);
_([
  b()
], d.prototype, "_htmlMarkup", 2);
_([
  b()
], d.prototype, "_isLoading", 2);
_([
  b()
], d.prototype, "_error", 2);
_([
  b()
], d.prototype, "_columnSpan", 2);
_([
  b()
], d.prototype, "_rowSpan", 2);
_([
  b()
], d.prototype, "_isFirstLoad", 2);
_([
  b()
], d.prototype, "_sortModeActive", 2);
_([
  b()
], d.prototype, "_blockContext", 2);
_([
  h({ attribute: !1 })
], d.prototype, "blockGridValue", 1);
d = _([
  Te(nt)
], d);
var si = Object.defineProperty, ai = Object.getOwnPropertyDescriptor, st = (e) => {
  throw TypeError(e);
}, g = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ai(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && si(t, i, o), o;
}, De = (e, t, i) => t.has(e) || st("Cannot " + i), O = (e, t, i) => (De(e, t, "read from private field"), t.get(e)), ye = (e, t, i) => t.has(e) ? st("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), at = (e, t, i, r) => (De(e, t, "write to private field"), t.set(e, i), i), M = (e, t, i) => (De(e, t, "access private method"), i), C, ce, x, lt, ct, ut, ht, dt, ke, pt, ft, bt;
const li = "block-list-preview";
let f = class extends Ae {
  constructor() {
    super(), ye(this, x), ye(this, C), ye(this, ce), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
      at(this, C, e), await M(this, x, lt).call(this);
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
      M(this, x, ft).call(this);
    }, 500));
  }
  _handleClick(e) {
    var s;
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && r.includes(n.tagName)).length > 0) {
      const n = i.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      n != null && n instanceof Oe && (s = n.href) != null && s.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return P`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return P`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
      if (this._htmlMarkup)
        return P`
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
    } else return P`<umb-ref-list-block
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
C = /* @__PURE__ */ new WeakMap();
ce = /* @__PURE__ */ new WeakMap();
x = /* @__PURE__ */ new WeakSet();
lt = async function() {
  M(this, x, ct).call(this), M(this, x, ut).call(this), M(this, x, ht).call(this), await M(this, x, dt).call(this);
};
ct = function() {
  var e;
  this.observe((e = O(this, C)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
ut = function() {
  var e;
  this.observe((e = O(this, C)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.blockList) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.blockList.stylesheet);
  });
};
ht = function() {
  this.consumeContext(Se, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
dt = async function() {
  try {
    await this.getContext(te), this.consumeContext(te, (e) => {
      e && (at(this, ce, e), this.observe(
        H([e.unique, e.contentTypeUnique]),
        async ([t, i]) => {
          var r, o;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (r = O(this, C)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = O(this, C)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), M(this, x, ke).call(this);
        }
      ));
    });
  } catch {
    O(this, ce) == null && O(this, C) != null && this._blockContext.unique == "" && this.consumeContext(Ue, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, (i) => {
        var r;
        this._blockContext.unique = ((r = O(this, C)) == null ? void 0 : r.getUnique()) ?? "", this._blockContext.documentTypeUnique = i[0] ?? "", M(this, x, ke).call(this);
      });
    });
  }
};
ke = function() {
  this.consumeContext(Mt, (e) => {
    e && this.observe(
      H([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", await M(this, x, pt).call(this);
      }
    );
  });
};
pt = function() {
  this.consumeContext(qt, (e) => {
    e && this.observe(
      H([
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
          contentData: (t == null ? void 0 : t.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (o == null ? void 0 : o.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.BlockList": (r == null ? void 0 : r.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? []
          }
        }, this._blockContext.blockIndex = t == null ? void 0 : t.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
ft = async function() {
  const e = this._blockContext;
  if (O(this, C) != null && e.unique == "" && (e.unique = O(this, C).getUnique()), O(this, C) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = O(this, C).getDocumentTypeUnique()), !M(this, x, bt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, pe.previewListBlock({
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
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : $e.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
bt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
f.styles = [
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
g([
  h({ attribute: !1 })
], f.prototype, "content", 2);
g([
  h({ attribute: !1 })
], f.prototype, "settings", 2);
g([
  h({ attribute: !1 })
], f.prototype, "contentKey", 2);
g([
  h({ attribute: !1 })
], f.prototype, "config", 2);
g([
  h({ attribute: !1 })
], f.prototype, "unpublished", 2);
g([
  h({ attribute: !1 })
], f.prototype, "icon", 2);
g([
  h({ attribute: !1 })
], f.prototype, "label", 2);
g([
  b()
], f.prototype, "_htmlMarkup", 2);
g([
  b()
], f.prototype, "_isLoading", 2);
g([
  b()
], f.prototype, "_error", 2);
g([
  b()
], f.prototype, "_sortModeActive", 2);
g([
  b()
], f.prototype, "_blockListValue", 2);
g([
  h({ attribute: !1 })
], f.prototype, "blockListValue", 1);
f = g([
  Te(li)
], f);
var ci = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, _t = (e) => {
  throw TypeError(e);
}, q = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ui(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && ci(t, i, o), o;
}, Le = (e, t, i) => t.has(e) || _t("Cannot " + i), B = (e, t, i) => (Le(e, t, "read from private field"), t.get(e)), me = (e, t, i) => t.has(e) ? _t("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), yt = (e, t, i, r) => (Le(e, t, "write to private field"), t.set(e, i), i), V = (e, t, i) => (Le(e, t, "access private method"), i), U, ue, D, mt, kt, vt, gt, ve, wt, Ct, Tt;
const hi = "rich-text-preview";
let T = class extends Ae {
  constructor() {
    super(), me(this, D), me(this, U), me(this, ue), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
      yt(this, U, e), V(this, D, mt).call(this);
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
      V(this, D, Ct).call(this);
    }, 500));
  }
  _handleClick(e) {
    var s;
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && r.includes(n.tagName)).length > 0) {
      const n = i.find((l) => l instanceof Element && l.tagName === "UUI-BUTTON");
      n != null && n instanceof Oe && (s = n.href) != null && s.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._isLoading)
      return P`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
    if (this._error)
      return P`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return P`
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
U = /* @__PURE__ */ new WeakMap();
ue = /* @__PURE__ */ new WeakMap();
D = /* @__PURE__ */ new WeakSet();
mt = function() {
  V(this, D, kt).call(this), V(this, D, vt).call(this), V(this, D, gt).call(this);
};
kt = function() {
  var e;
  this.observe((e = B(this, U)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.richText) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.richText.stylesheet);
  });
};
vt = function() {
  this.consumeContext(Se, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
gt = function() {
  this.consumeContext(te, (e) => {
    e && (yt(this, ue, e), this.observe(
      H([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var r, o;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (r = B(this, U)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = B(this, U)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), V(this, D, ve).call(this);
      }
    ));
  }), B(this, ue) == null && B(this, U) != null && this._blockContext.unique == "" && this.consumeContext(Ue, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = B(this, U)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", V(this, D, ve).call(this);
    });
  });
};
ve = function() {
  this.consumeContext(Rt, (e) => {
    e != null && this.observe(
      H([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", await V(this, D, wt).call(this);
      }
    );
  });
};
wt = function() {
  this.consumeContext(Nt, (e) => {
    e != null && this.observe(
      H([
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
          contentData: (t == null ? void 0 : t.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (o == null ? void 0 : o.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.RichText": (r == null ? void 0 : r.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? []
          }
        };
      }
    );
  });
};
Ct = async function() {
  const e = this._blockContext;
  if (B(this, U) != null && e.unique == "" && (e.unique = B(this, U).getUnique()), B(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = B(this, U).getDocumentTypeUnique()), !V(this, D, Tt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await he(this, pe.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : $e.isUmbApiError(r) && (this._error = r.message, this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Tt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
T.styles = [
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
q([
  h({ attribute: !1 })
], T.prototype, "content", 2);
q([
  h({ attribute: !1 })
], T.prototype, "settings", 2);
q([
  h({ attribute: !1 })
], T.prototype, "contentKey", 2);
q([
  h({ attribute: !1 })
], T.prototype, "config", 2);
q([
  b()
], T.prototype, "_htmlMarkup", 2);
q([
  b()
], T.prototype, "_isLoading", 2);
q([
  b()
], T.prototype, "_error", 2);
q([
  b()
], T.prototype, "_blockRteValue", 2);
q([
  h({ attribute: !1 })
], T.prototype, "blockRteValue", 1);
T = q([
  Te(hi)
], T);
var ie, Z, X, Y, J;
class ge extends We {
  constructor(i) {
    super(i);
    W(this, ie);
    W(this, Z);
    W(this, X);
    W(this, Y);
    W(this, J);
    z(this, Z, new Lt(void 0)), this.settings = k(this, Z).asObservable(), z(this, X, new Ve("")), this.unique = k(this, X).asObservable(), z(this, Y, new Ve("")), this.documentTypeUnique = k(this, Y).asObservable(), z(this, J, new Bt(!1)), this.sortModeActive = k(this, J).asObservable(), z(this, ie, new Et(i)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const i = await k(this, ie).getSettings();
    k(this, Z).setValue(i);
  }
  getUnique() {
    return k(this, X).getValue();
  }
  async setUnique(i) {
    i != "" && k(this, X).setValue(i);
  }
  getDocumentTypeUnique() {
    return k(this, Y).getValue();
  }
  async setDocumentTypeUnique(i) {
    i != "" && k(this, Y).setValue(i);
  }
  getSortMode() {
    return k(this, J).getValue();
  }
  async setSortMode(i) {
    k(this, J).setValue(i);
  }
}
ie = new WeakMap(), Z = new WeakMap(), X = new WeakMap(), Y = new WeakMap(), J = new WeakMap();
const di = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ge,
  default: ge
}, Symbol.toStringTag, { value: "Module" })), pi = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => di)
  }
], fi = [...pi], we = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...Vt.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, bi = [
  we
], _i = [
  {
    ...we.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode.js"),
    forPropertyEditorUis: [Dt],
    conditions: [
      {
        alias: Ke
      }
    ]
  },
  {
    ...we.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.List.SortMode",
    name: "Block List Sort Mode Property Action",
    api: () => import("./block-list-sort-mode.js"),
    forPropertyEditorUis: [It],
    conditions: [
      {
        alias: Ke
      }
    ]
  }
];
var re;
class yi {
  constructor(t) {
    W(this, re);
    z(this, re, t);
  }
  async getSettings() {
    return await he(k(this, re), pe.getSettings());
  }
}
re = new WeakMap();
var oe;
class Et extends We {
  constructor(i) {
    super(i);
    W(this, oe);
    z(this, oe, new yi(i));
  }
  async getSettings() {
    const i = await k(this, oe).getSettings();
    if (i && (i != null && i.data))
      return i.data;
  }
}
oe = new WeakMap();
const Li = async (e, t) => {
  e.consumeContext(St, async (i) => {
    var l, c, u;
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    Q.setConfig({
      baseUrl: r.base,
      credentials: r.credentials
    }), Q.interceptors.request.use(async (a, y) => {
      const K = await r.token();
      return a.headers.set("Authorization", `Bearer ${K}`), a;
    });
    const s = await new Et(e).getSettings();
    let n = [];
    if (s) {
      if (s.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: d,
          forBlockEditor: "block-grid"
        };
        ((l = s.blockGrid.contentTypes) == null ? void 0 : l.length) !== 0 && (a.forContentTypeAlias = s.blockGrid.contentTypes), n.push(a);
      }
      if (s.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: f,
          forBlockEditor: "block-list"
        };
        ((c = s.blockList.contentTypes) == null ? void 0 : c.length) !== 0 && (a.forContentTypeAlias = s.blockList.contentTypes), n.push(a);
      }
      if (s.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: T,
          forBlockEditor: "block-rte"
        };
        ((u = s.richText.contentTypes) == null ? void 0 : u.length) !== 0 && (a.forContentTypeAlias = s.richText.contentTypes), n.push(a);
      }
    }
    t.registerMany([
      ...n,
      ...fi,
      ...bi,
      ..._i
    ]), e.provideContext(fe, new ge(e));
  });
};
export {
  fe as B,
  T as R,
  yi as S,
  d as a,
  f as b,
  Et as c,
  Li as o
};
//# sourceMappingURL=index.js.map

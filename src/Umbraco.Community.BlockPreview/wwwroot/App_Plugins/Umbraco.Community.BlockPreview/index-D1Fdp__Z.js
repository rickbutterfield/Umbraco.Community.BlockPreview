var Ie = (e) => {
  throw TypeError(e);
};
var Re = (e, t, i) => t.has(e) || Ie("Cannot " + i);
var k = (e, t, i) => (Re(e, t, "read from private field"), i ? i.call(e) : t.get(e)), G = (e, t, i) => t.has(e) ? Ie("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), W = (e, t, i, r) => (Re(e, t, "write to private field"), r ? r.call(e, i) : t.set(e, i), i);
import { UMB_AUTH_CONTEXT as At } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_WORKSPACE_CONTEXT as we } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as St, UMB_BLOCK_GRID_MANAGER_CONTEXT as Pt, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as Ot } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as ge } from "@umbraco-cms/backoffice/document";
import { css as Ce, property as h, state as b, customElement as Te, html as O, ifDefined as Ee, unsafeHTML as xe } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as Ue } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as z, UmbObjectState as $t, UmbStringState as Ne, UmbBooleanState as Bt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as Ae, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as Ve } from "@umbraco-cms/backoffice/property";
import { tryExecute as ce, UmbApiError as Se } from "@umbraco-cms/backoffice/resources";
import { UmbContextToken as Lt } from "@umbraco-cms/backoffice/context-api";
import { UUIButtonElement as Pe } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Dt, UMB_BLOCK_LIST_MANAGER_CONTEXT as Mt, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as qt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as It, UMB_BLOCK_RTE_MANAGER_CONTEXT as Rt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as Ge } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as Nt } from "@umbraco-cms/backoffice/property-action";
const Vt = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, i) => typeof i == "bigint" ? i.toString() : i
  )
}, Kt = ({
  onSseError: e,
  onSseEvent: t,
  responseTransformer: i,
  responseValidator: r,
  sseDefaultRetryDelay: o,
  sseMaxRetryAttempts: n,
  sseMaxRetryDelay: s,
  sseSleepFn: a,
  url: c,
  ...u
}) => {
  let l;
  const y = a ?? ((H) => new Promise((p) => setTimeout(p, H)));
  return { stream: async function* () {
    let H = o ?? 3e3, p = 0;
    const R = u.signal ?? new AbortController().signal;
    for (; !R.aborted; ) {
      p++;
      const ee = u.headers instanceof Headers ? u.headers : new Headers(u.headers);
      l !== void 0 && ee.set("Last-Event-ID", l);
      try {
        const L = await fetch(c, { ...u, headers: ee, signal: R });
        if (!L.ok)
          throw new Error(
            `SSE failed: ${L.status} ${L.statusText}`
          );
        if (!L.body) throw new Error("No body in SSE response");
        const K = L.body.pipeThrough(new TextDecoderStream()).getReader();
        let N = "";
        const m = () => {
          try {
            K.cancel();
          } catch {
          }
        };
        R.addEventListener("abort", m);
        try {
          for (; ; ) {
            const { done: j, value: Et } = await K.read();
            if (j) break;
            N += Et;
            const Le = N.split(`

`);
            N = Le.pop() ?? "";
            for (const xt of Le) {
              const Ut = xt.split(`
`), oe = [];
              let De;
              for (const A of Ut)
                if (A.startsWith("data:"))
                  oe.push(A.replace(/^data:\s*/, ""));
                else if (A.startsWith("event:"))
                  De = A.replace(/^event:\s*/, "");
                else if (A.startsWith("id:"))
                  l = A.replace(/^id:\s*/, "");
                else if (A.startsWith("retry:")) {
                  const qe = Number.parseInt(
                    A.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(qe) || (H = qe);
                }
              let F, Me = !1;
              if (oe.length) {
                const A = oe.join(`
`);
                try {
                  F = JSON.parse(A), Me = !0;
                } catch {
                  F = A;
                }
              }
              Me && (r && await r(F), i && (F = await i(F))), t == null || t({
                data: F,
                event: De,
                id: l,
                retry: H
              }), oe.length && (yield F);
            }
          }
        } finally {
          R.removeEventListener("abort", m), K.releaseLock();
        }
        break;
      } catch (L) {
        if (e == null || e(L), n !== void 0 && p >= n)
          break;
        const K = Math.min(
          H * 2 ** (p - 1),
          s ?? 3e4
        );
        await y(K);
      }
    }
  }() };
}, jt = async (e, t) => {
  const i = typeof t == "function" ? await t(e) : t;
  if (i)
    return e.scheme === "bearer" ? `Bearer ${i}` : e.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Gt = (e) => {
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
}, Wt = (e) => {
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
}, zt = (e) => {
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
}, We = ({
  allowReserved: e,
  explode: t,
  name: i,
  style: r,
  value: o
}) => {
  if (!t) {
    const a = (e ? o : o.map((c) => encodeURIComponent(c))).join(Wt(r));
    switch (r) {
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
  const n = Gt(r), s = o.map((a) => r === "label" || r === "simple" ? e ? a : encodeURIComponent(a) : ue({
    allowReserved: e,
    name: i,
    value: a
  })).join(n);
  return r === "label" || r === "matrix" ? n + s : s;
}, ue = ({
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
}, ze = ({
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
    let c = [];
    Object.entries(o).forEach(([l, y]) => {
      c = [
        ...c,
        l,
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
  const s = zt(r), a = Object.entries(o).map(
    ([c, u]) => ue({
      allowReserved: e,
      name: r === "deepObject" ? `${i}[${c}]` : c,
      value: u
    })
  ).join(s);
  return r === "label" || r === "matrix" ? s + a : a;
}, Ht = /\{[^{}]+\}/g, Ft = ({ path: e, url: t }) => {
  let i = t;
  const r = t.match(Ht);
  if (r)
    for (const o of r) {
      let n = !1, s = o.substring(1, o.length - 1), a = "simple";
      s.endsWith("*") && (n = !0, s = s.substring(0, s.length - 1)), s.startsWith(".") ? (s = s.substring(1), a = "label") : s.startsWith(";") && (s = s.substring(1), a = "matrix");
      const c = e[s];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        i = i.replace(
          o,
          We({ explode: n, name: s, style: a, value: c })
        );
        continue;
      }
      if (typeof c == "object") {
        i = i.replace(
          o,
          ze({
            explode: n,
            name: s,
            style: a,
            value: c,
            valueOnly: !0
          })
        );
        continue;
      }
      if (a === "matrix") {
        i = i.replace(
          o,
          `;${ue({
            name: s,
            value: c
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        a === "label" ? `.${c}` : c
      );
      i = i.replace(o, u);
    }
  return i;
}, Xt = ({
  baseUrl: e,
  path: t,
  query: i,
  querySerializer: r,
  url: o
}) => {
  const n = o.startsWith("/") ? o : `/${o}`;
  let s = (e ?? "") + n;
  t && (s = Ft({ path: t, url: s }));
  let a = i ? r(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (s += `?${a}`), s;
}, He = ({
  allowReserved: e,
  array: t,
  object: i
} = {}) => (o) => {
  const n = [];
  if (o && typeof o == "object")
    for (const s in o) {
      const a = o[s];
      if (a != null)
        if (Array.isArray(a)) {
          const c = We({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "form",
            value: a,
            ...t
          });
          c && n.push(c);
        } else if (typeof a == "object") {
          const c = ze({
            allowReserved: e,
            explode: !0,
            name: s,
            style: "deepObject",
            value: a,
            ...i
          });
          c && n.push(c);
        } else {
          const c = ue({
            allowReserved: e,
            name: s,
            value: a
          });
          c && n.push(c);
        }
    }
  return n.join("&");
}, Yt = (e) => {
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
}, Jt = (e, t) => {
  var i, r;
  return t ? !!(e.headers.has(t) || (i = e.query) != null && i[t] || (r = e.headers.get("Cookie")) != null && r.includes(`${t}=`)) : !1;
}, Qt = async ({
  security: e,
  ...t
}) => {
  for (const i of e) {
    if (Jt(t, i.name))
      continue;
    const r = await jt(i, t.auth);
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
}, Ke = (e) => Xt({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : He(e.querySerializer),
  url: e.url
}), je = (e, t) => {
  var r;
  const i = { ...e, ...t };
  return (r = i.baseUrl) != null && r.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = Fe(e.headers, t.headers), i;
}, Fe = (...e) => {
  const t = new Headers();
  for (const i of e) {
    if (!i || typeof i != "object")
      continue;
    const r = i instanceof Headers ? i.entries() : Object.entries(i);
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
class pe {
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
const Zt = () => ({
  error: new pe(),
  request: new pe(),
  response: new pe()
}), ei = He({
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
}, Xe = (e = {}) => ({
  ...Vt,
  headers: ti,
  parseAs: "auto",
  querySerializer: ei,
  ...e
}), ii = (e = {}) => {
  let t = je(Xe(), e);
  const i = () => ({ ...t }), r = (u) => (t = je(t, u), i()), o = Zt(), n = async (u) => {
    const l = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Fe(t.headers, u.headers),
      serializedBody: void 0
    };
    l.security && await Qt({
      ...l,
      security: l.security
    }), l.requestValidator && await l.requestValidator(l), l.body && l.bodySerializer && (l.serializedBody = l.bodySerializer(l.body)), (l.serializedBody === void 0 || l.serializedBody === "") && l.headers.delete("Content-Type");
    const y = Ke(l);
    return { opts: l, url: y };
  }, s = async (u) => {
    const { opts: l, url: y } = await n(u), B = {
      redirect: "follow",
      ...l,
      body: l.serializedBody
    };
    let w = new Request(y, B);
    for (const m of o.request._fns)
      m && (w = await m(w, l));
    const H = l.fetch;
    let p = await H(w);
    for (const m of o.response._fns)
      m && (p = await m(p, w, l));
    const R = {
      request: w,
      response: p
    };
    if (p.ok) {
      if (p.status === 204 || p.headers.get("Content-Length") === "0")
        return l.responseStyle === "data" ? {} : {
          data: {},
          ...R
        };
      const m = (l.parseAs === "auto" ? Yt(p.headers.get("Content-Type")) : l.parseAs) ?? "json";
      let j;
      switch (m) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          j = await p[m]();
          break;
        case "stream":
          return l.responseStyle === "data" ? p.body : {
            data: p.body,
            ...R
          };
      }
      return m === "json" && (l.responseValidator && await l.responseValidator(j), l.responseTransformer && (j = await l.responseTransformer(j))), l.responseStyle === "data" ? j : {
        data: j,
        ...R
      };
    }
    const ee = await p.text();
    let L;
    try {
      L = JSON.parse(ee);
    } catch {
    }
    const K = L ?? ee;
    let N = K;
    for (const m of o.error._fns)
      m && (N = await m(K, p, w, l));
    if (N = N || {}, l.throwOnError)
      throw N;
    return l.responseStyle === "data" ? void 0 : {
      error: N,
      ...R
    };
  }, a = (u) => (l) => s({ ...l, method: u }), c = (u) => async (l) => {
    const { opts: y, url: B } = await n(l);
    return Kt({
      ...y,
      body: y.body,
      headers: y.headers,
      method: u,
      url: B
    });
  };
  return {
    buildUrl: Ke,
    connect: a("CONNECT"),
    delete: a("DELETE"),
    get: a("GET"),
    getConfig: i,
    head: a("HEAD"),
    interceptors: o,
    options: a("OPTIONS"),
    patch: a("PATCH"),
    post: a("POST"),
    put: a("PUT"),
    request: s,
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
    trace: a("TRACE")
  };
}, Q = ii(Xe({
  baseUrl: "http://localhost:26293",
  throwOnError: !0
}));
class he {
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
const de = new Lt("BlockPreviewContext");
var ri = Object.defineProperty, oi = Object.getOwnPropertyDescriptor, Ye = (e) => {
  throw TypeError(e);
}, _ = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? oi(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (r ? s(t, i, o) : s(o)) || o);
  return r && o && ri(t, i, o), o;
}, Oe = (e, t, i) => t.has(e) || Ye("Cannot " + i), S = (e, t, i) => (Oe(e, t, "read from private field"), t.get(e)), fe = (e, t, i) => t.has(e) ? Ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Je = (e, t, i, r) => (Oe(e, t, "write to private field"), t.set(e, i), i), D = (e, t, i) => (Oe(e, t, "access private method"), i), g, se, E, Qe, Ze, et, tt, it, rt, ne, ot;
const si = "block-grid-preview";
let d = class extends Ue {
  constructor() {
    super(), fe(this, E), fe(this, g), fe(this, se), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._columnSpan = 0, this._rowSpan = 0, this._isFirstLoad = !0, this._sortModeActive = !1, this._pointerDownPos = null, this._isDragging = !1, this._blockContext = {
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
    }, this._blockGridValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, this.consumeContext(de, (e) => {
      Je(this, g, e), D(this, E, Qe).call(this);
    });
  }
  set blockGridValue(e) {
    const t = e ? { ...e } : {};
    t.layout ?? (t.layout = {}), t.contentData ?? (t.contentData = []), t.settingsData ?? (t.settingsData = []), t.expose ?? (t.expose = []), this._blockGridValue = t;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  willUpdate(e) {
    if (!this._isFirstLoad && !e.has("_isFirstLoad") && !e.has("_isLoading") && ((e.has("content") && this.content || e.has("settings") && this.settings) && D(this, E, ne).call(this), e.has("blockGridValue") || e.has("_columnSpan") && this._columnSpan || e.has("_rowSpan") && this._rowSpan)) {
      const t = e.get("blockGridValue");
      if (t) {
        const i = t.layout ? t.layout["Umbraco.BlockGrid"] : void 0;
        if (i) {
          const r = this._getColumnSpan(i), o = this._getRowSpan(i);
          (r !== this._columnSpan || o !== this._rowSpan) && (this._columnSpan = r, this._rowSpan = o, D(this, E, ne).call(this));
        }
      }
    }
    super.willUpdate(e);
  }
  _filterLayouts(e) {
    if (!e || e.length === 0)
      return [];
    const t = e.filter((r) => r.contentKey === this._blockContext.contentUdi);
    return t.length > 0 ? t : e.flatMap((r) => r.areas || []).flatMap((r) => (r == null ? void 0 : r.items) || []).filter((r) => r && r.contentKey === this._blockContext.contentUdi);
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
    var n;
    if (this._isDragging) {
      e.preventDefault(), e.stopPropagation();
      return;
    }
    let t = !0;
    const i = e.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((s) => s instanceof Element && r.includes(s.tagName)).length > 0) {
      const s = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      s != null && s instanceof Pe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
g = /* @__PURE__ */ new WeakMap();
se = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakSet();
Qe = function() {
  D(this, E, Ze).call(this), D(this, E, et).call(this), D(this, E, tt).call(this), D(this, E, it).call(this), D(this, E, rt).call(this);
};
Ze = function() {
  var e;
  this.observe((e = S(this, g)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
et = function() {
  var e;
  this.observe((e = S(this, g)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.blockGrid) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.blockGrid.stylesheet);
  });
};
tt = function() {
  this.consumeContext(Ae, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
it = async function() {
  this.consumeContext(ge, (e) => {
    e && (Je(this, se, e), this.observe(
      z([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var r, o;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (r = S(this, g)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = S(this, g)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique);
      }
    ));
  }), S(this, se) == null && S(this, g) != null && this._blockContext.unique == "" && this.consumeContext(we, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = S(this, g)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "";
    });
  });
};
rt = async function() {
  this.consumeContext(St, (e) => {
    e && this.consumeContext(Pt, (t) => {
      t && this.observe(
        z([
          e.contentKey,
          e.settingsKey,
          e.workspaceEditContentPath,
          e.contentElementTypeAlias,
          e.contentElementTypeKey,
          t.contents,
          t.settings,
          t.layouts,
          t.exposes,
          t.propertyAlias
        ]),
        async ([
          i,
          r,
          o,
          n,
          s,
          a,
          c,
          u,
          l,
          y
        ]) => {
          this._blockContext.contentUdi = i ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = n ?? "", this._blockContext.contentElementTypeKey = s ?? "", this._blockContext.blockEditorAlias = y ?? "";
          const B = this._filterLayouts(u);
          this.blockGridValue = {
            contentData: (a == null ? void 0 : a.filter((w) => w.key == this._blockContext.contentUdi)) ?? [],
            settingsData: (c == null ? void 0 : c.filter((w) => w.key == this._blockContext.settingsUdi)) ?? [],
            expose: (l == null ? void 0 : l.filter((w) => w.contentKey == this._blockContext.contentUdi)) ?? [],
            layout: { "Umbraco.BlockGrid": B }
          }, this._columnSpan = this._getColumnSpan(B), this._rowSpan = this._getRowSpan(B), this._blockContext.blockIndex = a.indexOf(this.blockGridValue.contentData[0]), this._isFirstLoad && (this._isFirstLoad = !1, D(this, E, ne).call(this));
        }
      );
    });
  });
};
ne = async function() {
  const e = this._blockContext;
  if (S(this, g) != null && e.unique == "" && (e.unique = S(this, g).getUnique()), S(this, g) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = S(this, g).getDocumentTypeUnique()), !D(this, E, ot).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await ce(this, he.previewGridBlock({
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
    this._isLoading = !1, i ? this._htmlMarkup = i ?? "" : Se.isUmbApiError(r) && (this._error = r.message);
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
  Te(si)
], d);
var ni = Object.defineProperty, ai = Object.getOwnPropertyDescriptor, st = (e) => {
  throw TypeError(e);
}, v = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ai(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (r ? s(t, i, o) : s(o)) || o);
  return r && o && ni(t, i, o), o;
}, $e = (e, t, i) => t.has(e) || st("Cannot " + i), P = (e, t, i) => ($e(e, t, "read from private field"), t.get(e)), be = (e, t, i) => t.has(e) ? st("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), nt = (e, t, i, r) => ($e(e, t, "write to private field"), t.set(e, i), i), q = (e, t, i) => ($e(e, t, "access private method"), i), C, ae, x, at, lt, ct, ut, ht, ye, dt, pt, ft;
const li = "block-list-preview";
let f = class extends Ue {
  constructor() {
    super(), be(this, x), be(this, C), be(this, ae), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(de, (e) => {
      nt(this, C, e), q(this, x, at).call(this);
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
      q(this, x, pt).call(this);
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
      const s = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      s != null && s instanceof Pe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
C = /* @__PURE__ */ new WeakMap();
ae = /* @__PURE__ */ new WeakMap();
x = /* @__PURE__ */ new WeakSet();
at = function() {
  q(this, x, lt).call(this), q(this, x, ct).call(this), q(this, x, ut).call(this), q(this, x, ht).call(this);
};
lt = function() {
  var e;
  this.observe((e = P(this, C)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
ct = function() {
  var e;
  this.observe((e = P(this, C)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.blockList) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.blockList.stylesheet);
  });
};
ut = function() {
  this.consumeContext(Ae, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
ht = function() {
  this.consumeContext(ge, (e) => {
    e && (nt(this, ae, e), this.observe(
      z([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var r, o;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (r = P(this, C)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = P(this, C)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), q(this, x, ye).call(this);
      }
    ));
  }), P(this, ae) == null && P(this, C) != null && this._blockContext.unique == "" && this.consumeContext(we, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = P(this, C)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", q(this, x, ye).call(this);
    });
  });
};
ye = function() {
  this.consumeContext(Dt, (e) => {
    e && this.observe(
      z([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", await q(this, x, dt).call(this);
      }
    );
  });
};
dt = function() {
  this.consumeContext(Mt, (e) => {
    e && this.observe(
      z([
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
pt = async function() {
  const e = this._blockContext;
  if (P(this, C) != null && e.unique == "" && (e.unique = P(this, C).getUnique()), P(this, C) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = P(this, C).getDocumentTypeUnique()), !q(this, x, ft).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await ce(this, he.previewListBlock({
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
ft = function(e) {
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
v([
  h({ attribute: !1 })
], f.prototype, "content", 2);
v([
  h({ attribute: !1 })
], f.prototype, "settings", 2);
v([
  h({ attribute: !1 })
], f.prototype, "contentKey", 2);
v([
  h({ attribute: !1 })
], f.prototype, "config", 2);
v([
  h({ attribute: !1 })
], f.prototype, "unpublished", 2);
v([
  h({ attribute: !1 })
], f.prototype, "icon", 2);
v([
  h({ attribute: !1 })
], f.prototype, "label", 2);
v([
  b()
], f.prototype, "_htmlMarkup", 2);
v([
  b()
], f.prototype, "_isLoading", 2);
v([
  b()
], f.prototype, "_error", 2);
v([
  b()
], f.prototype, "_sortModeActive", 2);
v([
  b()
], f.prototype, "_blockListValue", 2);
v([
  h({ attribute: !1 })
], f.prototype, "blockListValue", 1);
f = v([
  Te(li)
], f);
var ci = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, bt = (e) => {
  throw TypeError(e);
}, I = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? ui(t, i) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (r ? s(t, i, o) : s(o)) || o);
  return r && o && ci(t, i, o), o;
}, Be = (e, t, i) => t.has(e) || bt("Cannot " + i), M = (e, t, i) => (Be(e, t, "read from private field"), t.get(e)), _e = (e, t, i) => t.has(e) ? bt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), _t = (e, t, i, r) => (Be(e, t, "write to private field"), t.set(e, i), i), V = (e, t, i) => (Be(e, t, "access private method"), i), U, le, $, yt, mt, kt, vt, me, wt, gt, Ct;
const hi = "rich-text-preview";
let T = class extends Ue {
  constructor() {
    super(), _e(this, $), _e(this, U), _e(this, le), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
    }, this.consumeContext(de, (e) => {
      _t(this, U, e), V(this, $, yt).call(this);
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
      V(this, $, gt).call(this);
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
      const s = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      s != null && s instanceof Pe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
le = /* @__PURE__ */ new WeakMap();
$ = /* @__PURE__ */ new WeakSet();
yt = function() {
  V(this, $, mt).call(this), V(this, $, kt).call(this), V(this, $, vt).call(this);
};
mt = function() {
  var e;
  this.observe((e = M(this, U)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.richText) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.richText.stylesheet);
  });
};
kt = function() {
  this.consumeContext(Ae, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
vt = function() {
  this.consumeContext(ge, (e) => {
    e && (_t(this, le, e), this.observe(
      z([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var r, o;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (r = M(this, U)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = M(this, U)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), V(this, $, me).call(this);
      }
    ));
  }), M(this, le) == null && M(this, U) != null && this._blockContext.unique == "" && this.consumeContext(we, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = M(this, U)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", V(this, $, me).call(this);
    });
  });
};
me = function() {
  this.consumeContext(It, (e) => {
    e != null && this.observe(
      z([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", await V(this, $, wt).call(this);
      }
    );
  });
};
wt = function() {
  this.consumeContext(Rt, (e) => {
    e != null && this.observe(
      z([
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
gt = async function() {
  const e = this._blockContext;
  if (M(this, U) != null && e.unique == "" && (e.unique = M(this, U).getUnique()), M(this, U) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = M(this, U).getDocumentTypeUnique()), !V(this, $, Ct).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: r } = await ce(this, he.previewRichTextMarkup({
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
I([
  h({ attribute: !1 })
], T.prototype, "content", 2);
I([
  h({ attribute: !1 })
], T.prototype, "settings", 2);
I([
  h({ attribute: !1 })
], T.prototype, "contentKey", 2);
I([
  h({ attribute: !1 })
], T.prototype, "config", 2);
I([
  b()
], T.prototype, "_htmlMarkup", 2);
I([
  b()
], T.prototype, "_isLoading", 2);
I([
  b()
], T.prototype, "_error", 2);
I([
  b()
], T.prototype, "_blockRteValue", 2);
I([
  h({ attribute: !1 })
], T.prototype, "blockRteValue", 1);
T = I([
  Te(hi)
], T);
var te, Z, X, Y, J;
class ke extends Ge {
  constructor(i) {
    super(i);
    G(this, te);
    G(this, Z);
    G(this, X);
    G(this, Y);
    G(this, J);
    W(this, Z, new $t(void 0)), this.settings = k(this, Z).asObservable(), W(this, X, new Ne("")), this.unique = k(this, X).asObservable(), W(this, Y, new Ne("")), this.documentTypeUnique = k(this, Y).asObservable(), W(this, J, new Bt(!1)), this.sortModeActive = k(this, J).asObservable(), W(this, te, new Tt(i)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const i = await k(this, te).getSettings();
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
te = new WeakMap(), Z = new WeakMap(), X = new WeakMap(), Y = new WeakMap(), J = new WeakMap();
const di = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ke,
  default: ke
}, Symbol.toStringTag, { value: "Module" })), pi = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => di)
  }
], fi = [...pi], ve = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...Nt.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action-anRi0zXU.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, bi = [
  ve
], _i = [
  {
    ...ve.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode-DuwCHXT-.js"),
    forPropertyEditorUis: [Ot],
    conditions: [
      {
        alias: Ve
      }
    ]
  },
  {
    ...ve.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.List.SortMode",
    name: "Block List Sort Mode Property Action",
    api: () => import("./block-list-sort-mode-CmBn_tm2.js"),
    forPropertyEditorUis: [qt],
    conditions: [
      {
        alias: Ve
      }
    ]
  }
];
var ie;
class yi {
  constructor(t) {
    G(this, ie);
    W(this, ie, t);
  }
  async getSettings() {
    return await ce(k(this, ie), he.getSettings());
  }
}
ie = new WeakMap();
var re;
class Tt extends Ge {
  constructor(i) {
    super(i);
    G(this, re);
    W(this, re, new yi(i));
  }
  async getSettings() {
    const i = await k(this, re).getSettings();
    if (i && (i != null && i.data))
      return i.data;
  }
}
re = new WeakMap();
const Li = async (e, t) => {
  e.consumeContext(At, async (i) => {
    var a, c, u;
    if (!i) return;
    const r = i.getOpenApiConfiguration();
    Q.setConfig({
      baseUrl: r.base,
      credentials: r.credentials
    }), Q.interceptors.request.use(async (l, y) => {
      const B = await r.token();
      return l.headers.set("Authorization", `Bearer ${B}`), l;
    });
    const n = await new Tt(e).getSettings();
    let s = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: d,
          forBlockEditor: "block-grid"
        };
        ((a = n.blockGrid.contentTypes) == null ? void 0 : a.length) !== 0 && (l.forContentTypeAlias = n.blockGrid.contentTypes), s.push(l);
      }
      if (n.blockList.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: f,
          forBlockEditor: "block-list"
        };
        ((c = n.blockList.contentTypes) == null ? void 0 : c.length) !== 0 && (l.forContentTypeAlias = n.blockList.contentTypes), s.push(l);
      }
      if (n.richText.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: T,
          forBlockEditor: "block-rte"
        };
        ((u = n.richText.contentTypes) == null ? void 0 : u.length) !== 0 && (l.forContentTypeAlias = n.richText.contentTypes), s.push(l);
      }
    }
    t.registerMany([
      ...s,
      ...fi,
      ...bi,
      ..._i
    ]), e.provideContext(de, new ke(e));
  });
};
export {
  de as B,
  T as R,
  yi as S,
  d as a,
  f as b,
  Tt as c,
  Li as o
};
//# sourceMappingURL=index-D1Fdp__Z.js.map

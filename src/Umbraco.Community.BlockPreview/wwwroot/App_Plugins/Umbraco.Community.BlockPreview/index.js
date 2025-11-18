var Ie = (e) => {
  throw TypeError(e);
};
var Re = (e, t, r) => t.has(e) || Ie("Cannot " + r);
var y = (e, t, r) => (Re(e, t, "read from private field"), r ? r.call(e) : t.get(e)), j = (e, t, r) => t.has(e) ? Ie("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), W = (e, t, r, i) => (Re(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r);
import { UMB_AUTH_CONTEXT as Ot } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as Pt } from "@umbraco-cms/backoffice/context-api";
import { css as ge, property as h, state as g, customElement as Ce, html as P, ifDefined as Te, unsafeHTML as Ee } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as xe } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as St, UMB_BLOCK_GRID_MANAGER_CONTEXT as Bt, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as $t } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as te } from "@umbraco-cms/backoffice/document";
import { UmbLitElement as Ue } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as N, UmbObjectState as qt, UmbStringState as Ne, UmbBooleanState as Lt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as Ae, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as Ve } from "@umbraco-cms/backoffice/property";
import { tryExecute as ce, UmbApiError as Oe } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement as Pe } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Mt, UMB_BLOCK_LIST_MANAGER_CONTEXT as Dt, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as It } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Rt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Nt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as We } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as Vt } from "@umbraco-cms/backoffice/property-action";
const Kt = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, r) => typeof r == "bigint" ? r.toString() : r
  )
}, jt = ({
  onSseError: e,
  onSseEvent: t,
  responseTransformer: r,
  responseValidator: i,
  sseDefaultRetryDelay: o,
  sseMaxRetryAttempts: n,
  sseMaxRetryDelay: s,
  sseSleepFn: a,
  url: c,
  ...u
}) => {
  let l;
  const m = a ?? ((z) => new Promise((d) => setTimeout(d, z)));
  return { stream: async function* () {
    let z = o ?? 3e3, d = 0;
    const D = u.signal ?? new AbortController().signal;
    for (; !D.aborted; ) {
      d++;
      const ee = u.headers instanceof Headers ? u.headers : new Headers(u.headers);
      l !== void 0 && ee.set("Last-Event-ID", l);
      try {
        const B = await fetch(c, { ...u, headers: ee, signal: D });
        if (!B.ok)
          throw new Error(
            `SSE failed: ${B.status} ${B.statusText}`
          );
        if (!B.body) throw new Error("No body in SSE response");
        const V = B.body.pipeThrough(new TextDecoderStream()).getReader();
        let I = "";
        const b = () => {
          try {
            V.cancel();
          } catch {
          }
        };
        D.addEventListener("abort", b);
        try {
          for (; ; ) {
            const { done: K, value: xt } = await V.read();
            if (K) break;
            I += xt;
            const qe = I.split(`

`);
            I = qe.pop() ?? "";
            for (const Ut of qe) {
              const At = Ut.split(`
`), se = [];
              let Le;
              for (const U of At)
                if (U.startsWith("data:"))
                  se.push(U.replace(/^data:\s*/, ""));
                else if (U.startsWith("event:"))
                  Le = U.replace(/^event:\s*/, "");
                else if (U.startsWith("id:"))
                  l = U.replace(/^id:\s*/, "");
                else if (U.startsWith("retry:")) {
                  const De = Number.parseInt(
                    U.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(De) || (z = De);
                }
              let H, Me = !1;
              if (se.length) {
                const U = se.join(`
`);
                try {
                  H = JSON.parse(U), Me = !0;
                } catch {
                  H = U;
                }
              }
              Me && (i && await i(H), r && (H = await r(H))), t == null || t({
                data: H,
                event: Le,
                id: l,
                retry: z
              }), se.length && (yield H);
            }
          }
        } finally {
          D.removeEventListener("abort", b), V.releaseLock();
        }
        break;
      } catch (B) {
        if (e == null || e(B), n !== void 0 && d >= n)
          break;
        const V = Math.min(
          z * 2 ** (d - 1),
          s ?? 3e4
        );
        await m(V);
      }
    }
  }() };
}, Wt = async (e, t) => {
  const r = typeof t == "function" ? await t(e) : t;
  if (r)
    return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
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
}, Ge = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: i,
  value: o
}) => {
  if (!t) {
    const a = (e ? o : o.map((c) => encodeURIComponent(c))).join(zt(i));
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
  const n = Gt(i), s = o.map((a) => i === "label" || i === "simple" ? e ? a : encodeURIComponent(a) : ue({
    allowReserved: e,
    name: r,
    value: a
  })).join(n);
  return i === "label" || i === "matrix" ? n + s : s;
}, ue = ({
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
}, ze = ({
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
    Object.entries(o).forEach(([l, m]) => {
      c = [
        ...c,
        l,
        e ? m : encodeURIComponent(m)
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
  const s = Ht(i), a = Object.entries(o).map(
    ([c, u]) => ue({
      allowReserved: e,
      name: i === "deepObject" ? `${r}[${c}]` : c,
      value: u
    })
  ).join(s);
  return i === "label" || i === "matrix" ? s + a : a;
}, Xt = /\{[^{}]+\}/g, Yt = ({ path: e, url: t }) => {
  let r = t;
  const i = t.match(Xt);
  if (i)
    for (const o of i) {
      let n = !1, s = o.substring(1, o.length - 1), a = "simple";
      s.endsWith("*") && (n = !0, s = s.substring(0, s.length - 1)), s.startsWith(".") ? (s = s.substring(1), a = "label") : s.startsWith(";") && (s = s.substring(1), a = "matrix");
      const c = e[s];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        r = r.replace(
          o,
          Ge({ explode: n, name: s, style: a, value: c })
        );
        continue;
      }
      if (typeof c == "object") {
        r = r.replace(
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
        r = r.replace(
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
      r = r.replace(o, u);
    }
  return r;
}, Ft = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: i,
  url: o
}) => {
  const n = o.startsWith("/") ? o : `/${o}`;
  let s = (e ?? "") + n;
  t && (s = Yt({ path: t, url: s }));
  let a = r ? i(r) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (s += `?${a}`), s;
}, He = ({
  allowReserved: e,
  array: t,
  object: r
} = {}) => (o) => {
  const n = [];
  if (o && typeof o == "object")
    for (const s in o) {
      const a = o[s];
      if (a != null)
        if (Array.isArray(a)) {
          const c = Ge({
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
            ...r
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
}, Qt = (e, t) => {
  var r, i;
  return t ? !!(e.headers.has(t) || (r = e.query) != null && r[t] || (i = e.headers.get("Cookie")) != null && i.includes(`${t}=`)) : !1;
}, Zt = async ({
  security: e,
  ...t
}) => {
  for (const r of e) {
    if (Qt(t, r.name))
      continue;
    const i = await Wt(r, t.auth);
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
}, Ke = (e) => Ft({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : He(e.querySerializer),
  url: e.url
}), je = (e, t) => {
  var i;
  const r = { ...e, ...t };
  return (i = r.baseUrl) != null && i.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = Xe(e.headers, t.headers), r;
}, Xe = (...e) => {
  const t = new Headers();
  for (const r of e) {
    if (!r || typeof r != "object")
      continue;
    const i = r instanceof Headers ? r.entries() : Object.entries(r);
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
class fe {
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
    const r = this.getInterceptorIndex(t);
    return !!this._fns[r];
  }
  eject(t) {
    const r = this.getInterceptorIndex(t);
    this._fns[r] && (this._fns[r] = null);
  }
  update(t, r) {
    const i = this.getInterceptorIndex(t);
    return this._fns[i] ? (this._fns[i] = r, t) : !1;
  }
  use(t) {
    return this._fns = [...this._fns, t], this._fns.length - 1;
  }
}
const er = () => ({
  error: new fe(),
  request: new fe(),
  response: new fe()
}), tr = He({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), rr = {
  "Content-Type": "application/json"
}, Ye = (e = {}) => ({
  ...Kt,
  headers: rr,
  parseAs: "auto",
  querySerializer: tr,
  ...e
}), ir = (e = {}) => {
  let t = je(Ye(), e);
  const r = () => ({ ...t }), i = (u) => (t = je(t, u), r()), o = er(), n = async (u) => {
    const l = {
      ...t,
      ...u,
      fetch: u.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Xe(t.headers, u.headers),
      serializedBody: void 0
    };
    l.security && await Zt({
      ...l,
      security: l.security
    }), l.requestValidator && await l.requestValidator(l), l.body && l.bodySerializer && (l.serializedBody = l.bodySerializer(l.body)), (l.serializedBody === void 0 || l.serializedBody === "") && l.headers.delete("Content-Type");
    const m = Ke(l);
    return { opts: l, url: m };
  }, s = async (u) => {
    const { opts: l, url: m } = await n(u), J = {
      redirect: "follow",
      ...l,
      body: l.serializedBody
    };
    let G = new Request(m, J);
    for (const b of o.request._fns)
      b && (G = await b(G, l));
    const z = l.fetch;
    let d = await z(G);
    for (const b of o.response._fns)
      b && (d = await b(d, G, l));
    const D = {
      request: G,
      response: d
    };
    if (d.ok) {
      if (d.status === 204 || d.headers.get("Content-Length") === "0")
        return l.responseStyle === "data" ? {} : {
          data: {},
          ...D
        };
      const b = (l.parseAs === "auto" ? Jt(d.headers.get("Content-Type")) : l.parseAs) ?? "json";
      let K;
      switch (b) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          K = await d[b]();
          break;
        case "stream":
          return l.responseStyle === "data" ? d.body : {
            data: d.body,
            ...D
          };
      }
      return b === "json" && (l.responseValidator && await l.responseValidator(K), l.responseTransformer && (K = await l.responseTransformer(K))), l.responseStyle === "data" ? K : {
        data: K,
        ...D
      };
    }
    const ee = await d.text();
    let B;
    try {
      B = JSON.parse(ee);
    } catch {
    }
    const V = B ?? ee;
    let I = V;
    for (const b of o.error._fns)
      b && (I = await b(V, d, G, l));
    if (I = I || {}, l.throwOnError)
      throw I;
    return l.responseStyle === "data" ? void 0 : {
      error: I,
      ...D
    };
  }, a = (u) => (l) => s({ ...l, method: u }), c = (u) => async (l) => {
    const { opts: m, url: J } = await n(l);
    return jt({
      ...m,
      body: m.body,
      headers: m.headers,
      method: u,
      url: J
    });
  };
  return {
    buildUrl: Ke,
    connect: a("CONNECT"),
    delete: a("DELETE"),
    get: a("GET"),
    getConfig: r,
    head: a("HEAD"),
    interceptors: o,
    options: a("OPTIONS"),
    patch: a("PATCH"),
    post: a("POST"),
    put: a("PUT"),
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
    trace: a("TRACE")
  };
}, Q = ir(Ye({
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
const de = new Pt("BlockPreviewContext");
var or = Object.defineProperty, sr = Object.getOwnPropertyDescriptor, Fe = (e) => {
  throw TypeError(e);
}, C = (e, t, r, i) => {
  for (var o = i > 1 ? void 0 : i ? sr(t, r) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (i ? s(t, r, o) : s(o)) || o);
  return i && o && or(t, r, o), o;
}, Se = (e, t, r) => t.has(e) || Fe("Cannot " + r), A = (e, t, r) => (Se(e, t, "read from private field"), t.get(e)), pe = (e, t, r) => t.has(e) ? Fe("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Je = (e, t, r, i) => (Se(e, t, "write to private field"), t.set(e, r), r), q = (e, t, r) => (Se(e, t, "access private method"), r), k, ne, T, Qe, Ze, et, tt, rt, _e, it, ot, st;
const nr = "block-grid-preview";
let p = class extends Ue {
  constructor() {
    super(), pe(this, T), pe(this, k), pe(this, ne), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(de, async (e) => {
      Je(this, k, e), await q(this, T, Qe).call(this);
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
      q(this, T, ot).call(this);
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
            items: (u = (c = this._blockContext.layoutAreas) == null ? void 0 : c.find((l) => l.key == s.key)) == null ? void 0 : u.items
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
      const s = r.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      s != null && s instanceof Pe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
                         href=${Te(this._blockContext.workspaceEditContentPath)} 
                         @click=${this._handleClick}
                         aria-label="Edit block"
                         class="block-preview-edit"
                         role="button"
                     >
                        ${Ee(this._htmlMarkup)}
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
k = /* @__PURE__ */ new WeakMap();
ne = /* @__PURE__ */ new WeakMap();
T = /* @__PURE__ */ new WeakSet();
Qe = async function() {
  q(this, T, Ze).call(this), q(this, T, et).call(this), q(this, T, tt).call(this), await q(this, T, rt).call(this);
};
Ze = function() {
  var e;
  this.observe((e = A(this, k)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
et = function() {
  var e;
  this.observe((e = A(this, k)) == null ? void 0 : e.settings, (t) => {
    var r;
    (r = t == null ? void 0 : t.blockGrid) != null && r.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.blockGrid.stylesheet);
  });
};
tt = function() {
  this.consumeContext(Ae, (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
rt = async function() {
  try {
    await this.getContext(te), this.consumeContext(te, (e) => {
      e && (Je(this, ne, e), this.observe(
        N([e.unique, e.contentTypeUnique]),
        async ([t, r]) => {
          var i, o;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = A(this, k)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (o = A(this, k)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), q(this, T, _e).call(this);
        }
      ));
    });
  } catch {
    A(this, ne) == null && A(this, k) != null && this._blockContext.unique == "" && this.consumeContext(xe, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, (r) => {
        var i;
        this._blockContext.unique = ((i = A(this, k)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", q(this, T, _e).call(this);
      });
    });
  }
};
_e = async function() {
  this.consumeContext(St, async (e) => {
    e && this.observe(
      N([
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
        a,
        c
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", this._blockContext.areas = s, this._blockContext.layout = a, this._blockContext.layoutAreas = c, await q(this, T, it).call(this);
      }
    );
  });
};
it = async function() {
  this.consumeContext(Bt, (e) => {
    e && this.observe(
      N([
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
ot = async function() {
  const e = this._blockContext;
  if (A(this, k) != null && e.unique == "" && (e.unique = A(this, k).getUnique()), A(this, k) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = A(this, k).getDocumentTypeUnique()), !q(this, T, st).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await ce(this, he.previewGridBlock({
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
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Oe.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
  }
};
st = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
p.styles = [
  ge`
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
C([
  h({ attribute: !1 })
], p.prototype, "content", 2);
C([
  h({ attribute: !1 })
], p.prototype, "settings", 2);
C([
  h({ attribute: !1 })
], p.prototype, "contentKey", 2);
C([
  h({ attribute: !1 })
], p.prototype, "config", 2);
C([
  h({ attribute: !1 })
], p.prototype, "unpublished", 2);
C([
  h({ attribute: !1 })
], p.prototype, "icon", 2);
C([
  h({ attribute: !1 })
], p.prototype, "label", 2);
C([
  g()
], p.prototype, "_htmlMarkup", 2);
C([
  g()
], p.prototype, "_isLoading", 2);
C([
  g()
], p.prototype, "_error", 2);
C([
  g()
], p.prototype, "_sortModeActive", 2);
C([
  h({ attribute: !1 })
], p.prototype, "blockGridValue", 1);
p = C([
  Ce(nr)
], p);
var ar = Object.defineProperty, lr = Object.getOwnPropertyDescriptor, nt = (e) => {
  throw TypeError(e);
}, _ = (e, t, r, i) => {
  for (var o = i > 1 ? void 0 : i ? lr(t, r) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (i ? s(t, r, o) : s(o)) || o);
  return i && o && ar(t, r, o), o;
}, Be = (e, t, r) => t.has(e) || nt("Cannot " + r), O = (e, t, r) => (Be(e, t, "read from private field"), t.get(e)), be = (e, t, r) => t.has(e) ? nt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), at = (e, t, r, i) => (Be(e, t, "write to private field"), t.set(e, r), r), L = (e, t, r) => (Be(e, t, "access private method"), r), v, ae, E, lt, ct, ut, ht, dt, me, ft, pt, bt;
const cr = "block-list-preview";
let f = class extends Ue {
  constructor() {
    super(), be(this, E), be(this, v), be(this, ae), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(de, async (e) => {
      at(this, v, e), await L(this, E, lt).call(this);
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
      L(this, E, pt).call(this);
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
      const s = r.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      s != null && s instanceof Pe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
                        href=${Te(this._blockContext.workspaceEditContentPath)}
                        @click=${this._handleClick}
                        aria-label="Edit block"
                        class="block-preview-edit"
                        role="button"
                    >
                        ${Ee(this._htmlMarkup)}
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
v = /* @__PURE__ */ new WeakMap();
ae = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakSet();
lt = async function() {
  L(this, E, ct).call(this), L(this, E, ut).call(this), L(this, E, ht).call(this), await L(this, E, dt).call(this);
};
ct = function() {
  var e;
  this.observe((e = O(this, v)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
ut = function() {
  var e;
  this.observe((e = O(this, v)) == null ? void 0 : e.settings, (t) => {
    var r;
    (r = t == null ? void 0 : t.blockList) != null && r.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.blockList.stylesheet);
  });
};
ht = function() {
  this.consumeContext(Ae, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
dt = async function() {
  try {
    await this.getContext(te), this.consumeContext(te, (e) => {
      e && (at(this, ae, e), this.observe(
        N([e.unique, e.contentTypeUnique]),
        async ([t, r]) => {
          var i, o;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = O(this, v)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (o = O(this, v)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), L(this, E, me).call(this);
        }
      ));
    });
  } catch {
    O(this, ae) == null && O(this, v) != null && this._blockContext.unique == "" && this.consumeContext(xe, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, (r) => {
        var i;
        this._blockContext.unique = ((i = O(this, v)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", L(this, E, me).call(this);
      });
    });
  }
};
me = function() {
  this.consumeContext(Mt, (e) => {
    e && this.observe(
      N([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", await L(this, E, ft).call(this);
      }
    );
  });
};
ft = function() {
  this.consumeContext(Dt, (e) => {
    e && this.observe(
      N([
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
pt = async function() {
  const e = this._blockContext;
  if (O(this, v) != null && e.unique == "" && (e.unique = O(this, v).getUnique()), O(this, v) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = O(this, v).getDocumentTypeUnique()), !L(this, E, bt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await ce(this, he.previewListBlock({
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
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Oe.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
  }
};
bt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
f.styles = [
  ge`
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
  h({ attribute: !1 })
], f.prototype, "content", 2);
_([
  h({ attribute: !1 })
], f.prototype, "settings", 2);
_([
  h({ attribute: !1 })
], f.prototype, "contentKey", 2);
_([
  h({ attribute: !1 })
], f.prototype, "config", 2);
_([
  h({ attribute: !1 })
], f.prototype, "unpublished", 2);
_([
  h({ attribute: !1 })
], f.prototype, "icon", 2);
_([
  h({ attribute: !1 })
], f.prototype, "label", 2);
_([
  g()
], f.prototype, "_htmlMarkup", 2);
_([
  g()
], f.prototype, "_isLoading", 2);
_([
  g()
], f.prototype, "_error", 2);
_([
  g()
], f.prototype, "_sortModeActive", 2);
_([
  g()
], f.prototype, "_blockListValue", 2);
_([
  h({ attribute: !1 })
], f.prototype, "blockListValue", 1);
f = _([
  Ce(cr)
], f);
var ur = Object.defineProperty, hr = Object.getOwnPropertyDescriptor, yt = (e) => {
  throw TypeError(e);
}, M = (e, t, r, i) => {
  for (var o = i > 1 ? void 0 : i ? hr(t, r) : t, n = e.length - 1, s; n >= 0; n--)
    (s = e[n]) && (o = (i ? s(t, r, o) : s(o)) || o);
  return i && o && ur(t, r, o), o;
}, $e = (e, t, r) => t.has(e) || yt("Cannot " + r), $ = (e, t, r) => ($e(e, t, "read from private field"), t.get(e)), ye = (e, t, r) => t.has(e) ? yt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), _t = (e, t, r, i) => ($e(e, t, "write to private field"), t.set(e, r), r), R = (e, t, r) => ($e(e, t, "access private method"), r), x, le, S, mt, kt, vt, wt, ke, gt, Ct, Tt;
const dr = "rich-text-preview";
let w = class extends Ue {
  constructor() {
    super(), ye(this, S), ye(this, x), ye(this, le), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
      _t(this, x, e), R(this, S, mt).call(this);
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
      R(this, S, Ct).call(this);
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
      const s = r.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      s != null && s instanceof Pe && (n = s.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
                    href=${Te(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${Ee(this._htmlMarkup)}
                </a>`;
  }
};
x = /* @__PURE__ */ new WeakMap();
le = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakSet();
mt = function() {
  R(this, S, kt).call(this), R(this, S, vt).call(this), R(this, S, wt).call(this);
};
kt = function() {
  var e;
  this.observe((e = $(this, x)) == null ? void 0 : e.settings, (t) => {
    var r;
    (r = t == null ? void 0 : t.richText) != null && r.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.richText.stylesheet);
  });
};
vt = function() {
  this.consumeContext(Ae, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
wt = function() {
  this.consumeContext(te, (e) => {
    e && (_t(this, le, e), this.observe(
      N([e.unique, e.contentTypeUnique]),
      async ([t, r]) => {
        var i, o;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = $(this, x)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (o = $(this, x)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), R(this, S, ke).call(this);
      }
    ));
  }), $(this, le) == null && $(this, x) != null && this._blockContext.unique == "" && this.consumeContext(xe, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var r;
      this._blockContext.unique = ((r = $(this, x)) == null ? void 0 : r.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", R(this, S, ke).call(this);
    });
  });
};
ke = function() {
  this.consumeContext(Rt, (e) => {
    e != null && this.observe(
      N([
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
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = n ?? "", await R(this, S, gt).call(this);
      }
    );
  });
};
gt = function() {
  this.consumeContext(Nt, (e) => {
    e != null && this.observe(
      N([
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
Ct = async function() {
  const e = this._blockContext;
  if ($(this, x) != null && e.unique == "" && (e.unique = $(this, x).getUnique()), $(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = $(this, x).getDocumentTypeUnique()), !R(this, S, Tt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: r, error: i } = await ce(this, he.previewRichTextMarkup({
      body: JSON.stringify(this.blockRteValue),
      query: {
        blockEditorAlias: e.blockEditorAlias,
        nodeKey: e.unique,
        contentElementAlias: e.contentElementTypeAlias,
        documentTypeUnique: e.documentTypeUnique,
        culture: e.culture
      }
    }));
    r ? (this._htmlMarkup = r ?? "", this._isLoading = !1) : Oe.isUmbApiError(i) && (this._error = i.message, this._isLoading = !1);
  } catch (r) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", r);
  }
};
Tt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
w.styles = [
  ge`
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
  h({ attribute: !1 })
], w.prototype, "content", 2);
M([
  h({ attribute: !1 })
], w.prototype, "settings", 2);
M([
  h({ attribute: !1 })
], w.prototype, "contentKey", 2);
M([
  h({ attribute: !1 })
], w.prototype, "config", 2);
M([
  g()
], w.prototype, "_htmlMarkup", 2);
M([
  g()
], w.prototype, "_isLoading", 2);
M([
  g()
], w.prototype, "_error", 2);
M([
  g()
], w.prototype, "_blockRteValue", 2);
M([
  h({ attribute: !1 })
], w.prototype, "blockRteValue", 1);
w = M([
  Ce(dr)
], w);
var re, Z, X, Y, F;
class ve extends We {
  constructor(r) {
    super(r);
    j(this, re);
    j(this, Z);
    j(this, X);
    j(this, Y);
    j(this, F);
    W(this, Z, new qt(void 0)), this.settings = y(this, Z).asObservable(), W(this, X, new Ne("")), this.unique = y(this, X).asObservable(), W(this, Y, new Ne("")), this.documentTypeUnique = y(this, Y).asObservable(), W(this, F, new Lt(!1)), this.sortModeActive = y(this, F).asObservable(), W(this, re, new Et(r)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const r = await y(this, re).getSettings();
    y(this, Z).setValue(r);
  }
  getUnique() {
    return y(this, X).getValue();
  }
  async setUnique(r) {
    r != "" && y(this, X).setValue(r);
  }
  getDocumentTypeUnique() {
    return y(this, Y).getValue();
  }
  async setDocumentTypeUnique(r) {
    r != "" && y(this, Y).setValue(r);
  }
  getSortMode() {
    return y(this, F).getValue();
  }
  async setSortMode(r) {
    y(this, F).setValue(r);
  }
}
re = new WeakMap(), Z = new WeakMap(), X = new WeakMap(), Y = new WeakMap(), F = new WeakMap();
const fr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ve,
  default: ve
}, Symbol.toStringTag, { value: "Module" })), pr = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => fr)
  }
], br = [...pr], we = {
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
}, yr = [
  we
], _r = [
  {
    ...we.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode.js"),
    forPropertyEditorUis: [$t],
    conditions: [
      {
        alias: Ve
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
        alias: Ve
      }
    ]
  }
];
var ie;
class mr {
  constructor(t) {
    j(this, ie);
    W(this, ie, t);
  }
  async getSettings() {
    return await ce(y(this, ie), he.getSettings());
  }
}
ie = new WeakMap();
var oe;
class Et extends We {
  constructor(r) {
    super(r);
    j(this, oe);
    W(this, oe, new mr(r));
  }
  async getSettings() {
    const r = await y(this, oe).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
oe = new WeakMap();
const Lr = async (e, t) => {
  e.consumeContext(Ot, async (r) => {
    var a, c, u;
    if (!r) return;
    const i = r.getOpenApiConfiguration();
    Q.setConfig({
      baseUrl: i.base,
      credentials: i.credentials
    }), Q.interceptors.request.use(async (l, m) => {
      const J = await i.token();
      return l.headers.set("Authorization", `Bearer ${J}`), l;
    });
    const n = await new Et(e).getSettings();
    let s = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let l = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: p,
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
          element: w,
          forBlockEditor: "block-rte"
        };
        ((u = n.richText.contentTypes) == null ? void 0 : u.length) !== 0 && (l.forContentTypeAlias = n.richText.contentTypes), s.push(l);
      }
    }
    t.registerMany([
      ...s,
      ...br,
      ...yr,
      ..._r
    ]), e.provideContext(de, new ve(e));
  });
};
export {
  de as B,
  w as R,
  mr as S,
  p as a,
  f as b,
  Et as c,
  Lr as o
};
//# sourceMappingURL=index.js.map

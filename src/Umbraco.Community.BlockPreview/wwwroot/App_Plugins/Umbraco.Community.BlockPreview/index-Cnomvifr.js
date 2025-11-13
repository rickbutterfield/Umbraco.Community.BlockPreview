var Ie = (e) => {
  throw TypeError(e);
};
var Re = (e, t, r) => t.has(e) || Ie("Cannot " + r);
var _ = (e, t, r) => (Re(e, t, "read from private field"), r ? r.call(e) : t.get(e)), j = (e, t, r) => t.has(e) ? Ie("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), W = (e, t, r, i) => (Re(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r);
import { UMB_AUTH_CONTEXT as Ot } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ge } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Pt, UMB_BLOCK_GRID_MANAGER_CONTEXT as Bt, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as $t } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as te } from "@umbraco-cms/backoffice/document";
import { css as Ce, property as h, state as g, customElement as Te, html as P, ifDefined as Ee, unsafeHTML as xe } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as Ue } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as N, UmbObjectState as St, UmbStringState as Ne, UmbBooleanState as qt } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as Ae, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as Ve } from "@umbraco-cms/backoffice/property";
import { tryExecute as ce, UmbApiError as Oe } from "@umbraco-cms/backoffice/resources";
import { UmbContextToken as Mt } from "@umbraco-cms/backoffice/context-api";
import { UUIButtonElement as Pe } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Lt, UMB_BLOCK_LIST_MANAGER_CONTEXT as Dt, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as It } from "@umbraco-cms/backoffice/block-list";
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
  sseDefaultRetryDelay: s,
  sseMaxRetryAttempts: n,
  sseMaxRetryDelay: o,
  sseSleepFn: l,
  url: c,
  ...u
}) => {
  let a;
  const m = l ?? ((z) => new Promise((d) => setTimeout(d, z)));
  return { stream: async function* () {
    let z = s ?? 3e3, d = 0;
    const D = u.signal ?? new AbortController().signal;
    for (; !D.aborted; ) {
      d++;
      const ee = u.headers instanceof Headers ? u.headers : new Headers(u.headers);
      a !== void 0 && ee.set("Last-Event-ID", a);
      try {
        const $ = await fetch(c, { ...u, headers: ee, signal: D });
        if (!$.ok)
          throw new Error(
            `SSE failed: ${$.status} ${$.statusText}`
          );
        if (!$.body) throw new Error("No body in SSE response");
        const V = $.body.pipeThrough(new TextDecoderStream()).getReader();
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
              let Me;
              for (const U of At)
                if (U.startsWith("data:"))
                  se.push(U.replace(/^data:\s*/, ""));
                else if (U.startsWith("event:"))
                  Me = U.replace(/^event:\s*/, "");
                else if (U.startsWith("id:"))
                  a = U.replace(/^id:\s*/, "");
                else if (U.startsWith("retry:")) {
                  const De = Number.parseInt(
                    U.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(De) || (z = De);
                }
              let H, Le = !1;
              if (se.length) {
                const U = se.join(`
`);
                try {
                  H = JSON.parse(U), Le = !0;
                } catch {
                  H = U;
                }
              }
              Le && (i && await i(H), r && (H = await r(H))), t == null || t({
                data: H,
                event: Me,
                id: a,
                retry: z
              }), se.length && (yield H);
            }
          }
        } finally {
          D.removeEventListener("abort", b), V.releaseLock();
        }
        break;
      } catch ($) {
        if (e == null || e($), n !== void 0 && d >= n)
          break;
        const V = Math.min(
          z * 2 ** (d - 1),
          o ?? 3e4
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
  value: s
}) => {
  if (!t) {
    const l = (e ? s : s.map((c) => encodeURIComponent(c))).join(zt(i));
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
  const n = Gt(i), o = s.map((l) => i === "label" || i === "simple" ? e ? l : encodeURIComponent(l) : ue({
    allowReserved: e,
    name: r,
    value: l
  })).join(n);
  return i === "label" || i === "matrix" ? n + o : o;
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
  value: s,
  valueOnly: n
}) => {
  if (s instanceof Date)
    return n ? s.toISOString() : `${r}=${s.toISOString()}`;
  if (i !== "deepObject" && !t) {
    let c = [];
    Object.entries(s).forEach(([a, m]) => {
      c = [
        ...c,
        a,
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
  const o = Ht(i), l = Object.entries(s).map(
    ([c, u]) => ue({
      allowReserved: e,
      name: i === "deepObject" ? `${r}[${c}]` : c,
      value: u
    })
  ).join(o);
  return i === "label" || i === "matrix" ? o + l : l;
}, Xt = /\{[^{}]+\}/g, Yt = ({ path: e, url: t }) => {
  let r = t;
  const i = t.match(Xt);
  if (i)
    for (const s of i) {
      let n = !1, o = s.substring(1, s.length - 1), l = "simple";
      o.endsWith("*") && (n = !0, o = o.substring(0, o.length - 1)), o.startsWith(".") ? (o = o.substring(1), l = "label") : o.startsWith(";") && (o = o.substring(1), l = "matrix");
      const c = e[o];
      if (c == null)
        continue;
      if (Array.isArray(c)) {
        r = r.replace(
          s,
          Ge({ explode: n, name: o, style: l, value: c })
        );
        continue;
      }
      if (typeof c == "object") {
        r = r.replace(
          s,
          ze({
            explode: n,
            name: o,
            style: l,
            value: c,
            valueOnly: !0
          })
        );
        continue;
      }
      if (l === "matrix") {
        r = r.replace(
          s,
          `;${ue({
            name: o,
            value: c
          })}`
        );
        continue;
      }
      const u = encodeURIComponent(
        l === "label" ? `.${c}` : c
      );
      r = r.replace(s, u);
    }
  return r;
}, Ft = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: i,
  url: s
}) => {
  const n = s.startsWith("/") ? s : `/${s}`;
  let o = (e ?? "") + n;
  t && (o = Yt({ path: t, url: o }));
  let l = r ? i(r) : "";
  return l.startsWith("?") && (l = l.substring(1)), l && (o += `?${l}`), o;
}, He = ({
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
          const c = Ge({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "form",
            value: l,
            ...t
          });
          c && n.push(c);
        } else if (typeof l == "object") {
          const c = ze({
            allowReserved: e,
            explode: !0,
            name: o,
            style: "deepObject",
            value: l,
            ...r
          });
          c && n.push(c);
        } else {
          const c = ue({
            allowReserved: e,
            name: o,
            value: l
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
  const r = () => ({ ...t }), i = (u) => (t = je(t, u), r()), s = er(), n = async (u) => {
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
    const m = Ke(a);
    return { opts: a, url: m };
  }, o = async (u) => {
    const { opts: a, url: m } = await n(u), J = {
      redirect: "follow",
      ...a,
      body: a.serializedBody
    };
    let G = new Request(m, J);
    for (const b of s.request._fns)
      b && (G = await b(G, a));
    const z = a.fetch;
    let d = await z(G);
    for (const b of s.response._fns)
      b && (d = await b(d, G, a));
    const D = {
      request: G,
      response: d
    };
    if (d.ok) {
      if (d.status === 204 || d.headers.get("Content-Length") === "0")
        return a.responseStyle === "data" ? {} : {
          data: {},
          ...D
        };
      const b = (a.parseAs === "auto" ? Jt(d.headers.get("Content-Type")) : a.parseAs) ?? "json";
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
          return a.responseStyle === "data" ? d.body : {
            data: d.body,
            ...D
          };
      }
      return b === "json" && (a.responseValidator && await a.responseValidator(K), a.responseTransformer && (K = await a.responseTransformer(K))), a.responseStyle === "data" ? K : {
        data: K,
        ...D
      };
    }
    const ee = await d.text();
    let $;
    try {
      $ = JSON.parse(ee);
    } catch {
    }
    const V = $ ?? ee;
    let I = V;
    for (const b of s.error._fns)
      b && (I = await b(V, d, G, a));
    if (I = I || {}, a.throwOnError)
      throw I;
    return a.responseStyle === "data" ? void 0 : {
      error: I,
      ...D
    };
  }, l = (u) => (a) => o({ ...a, method: u }), c = (u) => async (a) => {
    const { opts: m, url: J } = await n(a);
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
const de = new Mt("BlockPreviewContext");
var or = Object.defineProperty, sr = Object.getOwnPropertyDescriptor, Fe = (e) => {
  throw TypeError(e);
}, C = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? sr(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && or(t, r, s), s;
}, Be = (e, t, r) => t.has(e) || Fe("Cannot " + r), A = (e, t, r) => (Be(e, t, "read from private field"), t.get(e)), pe = (e, t, r) => t.has(e) ? Fe("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Je = (e, t, r, i) => (Be(e, t, "write to private field"), t.set(e, r), r), q = (e, t, r) => (Be(e, t, "access private method"), r), k, ne, T, Qe, Ze, et, tt, rt, ye, it, ot, st;
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
  _filterLayouts(e) {
    if (!e || e.length === 0)
      return [];
    const t = e.filter((i) => i.contentKey === this._blockContext.contentUdi);
    return t.length > 0 ? t : e.flatMap((i) => i.areas || []).flatMap((i) => (i == null ? void 0 : i.items) || []).filter((i) => i && i.contentKey === this._blockContext.contentUdi);
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
      o != null && o instanceof Pe && (n = o.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
          var i, s;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = A(this, k)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (s = A(this, k)) == null || s.setDocumentTypeUnique(this._blockContext.documentTypeUnique), q(this, T, ye).call(this);
        }
      ));
    });
  } catch {
    A(this, ne) == null && A(this, k) != null && this._blockContext.unique == "" && this.consumeContext(ge, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, (r) => {
        var i;
        this._blockContext.unique = ((i = A(this, k)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", q(this, T, ye).call(this);
      });
    });
  }
};
ye = async function() {
  this.consumeContext(Pt, async (e) => {
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
        s,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await q(this, T, it).call(this);
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
        e.layouts,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, r, i, s, n]) => {
        this._blockContext.blockEditorAlias = n ?? "", this.blockGridValue = {
          contentData: (t == null ? void 0 : t.filter((o) => o.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (r == null ? void 0 : r.filter((o) => o.key == this._blockContext.settingsUdi)) ?? [],
          expose: (s == null ? void 0 : s.filter((o) => o.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: { "Umbraco.BlockGrid": this._filterLayouts(i) }
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
  Ce`
 a.block-preview-edit {
 display: block;
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

 .preview-alert-danger, .preview-alert-error {
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
  Te(nr)
], p);
var ar = Object.defineProperty, lr = Object.getOwnPropertyDescriptor, nt = (e) => {
  throw TypeError(e);
}, y = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? lr(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && ar(t, r, s), s;
}, $e = (e, t, r) => t.has(e) || nt("Cannot " + r), O = (e, t, r) => ($e(e, t, "read from private field"), t.get(e)), be = (e, t, r) => t.has(e) ? nt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), at = (e, t, r, i) => ($e(e, t, "write to private field"), t.set(e, r), r), M = (e, t, r) => ($e(e, t, "access private method"), r), v, ae, E, lt, ct, ut, ht, dt, me, ft, pt, bt;
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
      at(this, v, e), await M(this, E, lt).call(this);
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
      M(this, E, pt).call(this);
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
      o != null && o instanceof Pe && (n = o.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
v = /* @__PURE__ */ new WeakMap();
ae = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakSet();
lt = async function() {
  M(this, E, ct).call(this), M(this, E, ut).call(this), M(this, E, ht).call(this), await M(this, E, dt).call(this);
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
          var i, s;
          this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = O(this, v)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (s = O(this, v)) == null || s.setDocumentTypeUnique(this._blockContext.documentTypeUnique), M(this, E, me).call(this);
        }
      ));
    });
  } catch {
    O(this, ae) == null && O(this, v) != null && this._blockContext.unique == "" && this.consumeContext(ge, (t) => {
      t && this.observe(t.content.structure.contentTypeUniques, (r) => {
        var i;
        this._blockContext.unique = ((i = O(this, v)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = r[0] ?? "", M(this, E, me).call(this);
      });
    });
  }
};
me = function() {
  this.consumeContext(Lt, (e) => {
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
        s,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await M(this, E, ft).call(this);
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
pt = async function() {
  const e = this._blockContext;
  if (O(this, v) != null && e.unique == "" && (e.unique = O(this, v).getUnique()), O(this, v) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = O(this, v).getDocumentTypeUnique()), !M(this, E, bt).call(this, e)) {
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
y([
  h({ attribute: !1 })
], f.prototype, "content", 2);
y([
  h({ attribute: !1 })
], f.prototype, "settings", 2);
y([
  h({ attribute: !1 })
], f.prototype, "contentKey", 2);
y([
  h({ attribute: !1 })
], f.prototype, "config", 2);
y([
  h({ attribute: !1 })
], f.prototype, "unpublished", 2);
y([
  h({ attribute: !1 })
], f.prototype, "icon", 2);
y([
  h({ attribute: !1 })
], f.prototype, "label", 2);
y([
  g()
], f.prototype, "_htmlMarkup", 2);
y([
  g()
], f.prototype, "_isLoading", 2);
y([
  g()
], f.prototype, "_error", 2);
y([
  g()
], f.prototype, "_sortModeActive", 2);
y([
  g()
], f.prototype, "_blockListValue", 2);
y([
  h({ attribute: !1 })
], f.prototype, "blockListValue", 1);
f = y([
  Te(cr)
], f);
var ur = Object.defineProperty, hr = Object.getOwnPropertyDescriptor, _t = (e) => {
  throw TypeError(e);
}, L = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? hr(t, r) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (i ? o(t, r, s) : o(s)) || s);
  return i && s && ur(t, r, s), s;
}, Se = (e, t, r) => t.has(e) || _t("Cannot " + r), S = (e, t, r) => (Se(e, t, "read from private field"), t.get(e)), _e = (e, t, r) => t.has(e) ? _t("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), yt = (e, t, r, i) => (Se(e, t, "write to private field"), t.set(e, r), r), R = (e, t, r) => (Se(e, t, "access private method"), r), x, le, B, mt, kt, vt, wt, ke, gt, Ct, Tt;
const dr = "rich-text-preview";
let w = class extends Ue {
  constructor() {
    super(), _e(this, B), _e(this, x), _e(this, le), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
      R(this, B, Ct).call(this);
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
      o != null && o instanceof Pe && (n = o.href) != null && n.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
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
x = /* @__PURE__ */ new WeakMap();
le = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakSet();
mt = function() {
  R(this, B, kt).call(this), R(this, B, vt).call(this), R(this, B, wt).call(this);
};
kt = function() {
  var e;
  this.observe((e = S(this, x)) == null ? void 0 : e.settings, (t) => {
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
    e && (yt(this, le, e), this.observe(
      N([e.unique, e.contentTypeUnique]),
      async ([t, r]) => {
        var i, s;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (i = S(this, x)) == null || i.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = r ?? "", (s = S(this, x)) == null || s.setDocumentTypeUnique(this._blockContext.documentTypeUnique), R(this, B, ke).call(this);
      }
    ));
  }), S(this, le) == null && S(this, x) != null && this._blockContext.unique == "" && this.consumeContext(ge, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var r;
      this._blockContext.unique = ((r = S(this, x)) == null ? void 0 : r.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", R(this, B, ke).call(this);
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
        s,
        n
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = r ?? "", this._blockContext.workspaceEditContentPath = i ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = n ?? "", await R(this, B, gt).call(this);
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
Ct = async function() {
  const e = this._blockContext;
  if (S(this, x) != null && e.unique == "" && (e.unique = S(this, x).getUnique()), S(this, x) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = S(this, x).getDocumentTypeUnique()), !R(this, B, Tt).call(this, e)) {
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
L([
  h({ attribute: !1 })
], w.prototype, "content", 2);
L([
  h({ attribute: !1 })
], w.prototype, "settings", 2);
L([
  h({ attribute: !1 })
], w.prototype, "contentKey", 2);
L([
  h({ attribute: !1 })
], w.prototype, "config", 2);
L([
  g()
], w.prototype, "_htmlMarkup", 2);
L([
  g()
], w.prototype, "_isLoading", 2);
L([
  g()
], w.prototype, "_error", 2);
L([
  g()
], w.prototype, "_blockRteValue", 2);
L([
  h({ attribute: !1 })
], w.prototype, "blockRteValue", 1);
w = L([
  Te(dr)
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
    W(this, Z, new St(void 0)), this.settings = _(this, Z).asObservable(), W(this, X, new Ne("")), this.unique = _(this, X).asObservable(), W(this, Y, new Ne("")), this.documentTypeUnique = _(this, Y).asObservable(), W(this, F, new qt(!1)), this.sortModeActive = _(this, F).asObservable(), W(this, re, new Et(r)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const r = await _(this, re).getSettings();
    _(this, Z).setValue(r);
  }
  getUnique() {
    return _(this, X).getValue();
  }
  async setUnique(r) {
    r != "" && _(this, X).setValue(r);
  }
  getDocumentTypeUnique() {
    return _(this, Y).getValue();
  }
  async setDocumentTypeUnique(r) {
    r != "" && _(this, Y).setValue(r);
  }
  getSortMode() {
    return _(this, F).getValue();
  }
  async setSortMode(r) {
    _(this, F).setValue(r);
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
    api: () => import("./sort-mode.property-action-C4u0Z1CU.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, _r = [
  we
], yr = [
  {
    ...we.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode-CwzRNINf.js"),
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
    api: () => import("./block-list-sort-mode-Bz5g-7hv.js"),
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
    return await ce(_(this, ie), he.getSettings());
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
    const r = await _(this, oe).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
oe = new WeakMap();
const Mr = async (e, t) => {
  e.consumeContext(Ot, async (r) => {
    var l, c, u;
    if (!r) return;
    const i = r.getOpenApiConfiguration();
    Q.setConfig({
      baseUrl: i.base,
      credentials: i.credentials
    }), Q.interceptors.request.use(async (a, m) => {
      const J = await i.token();
      return a.headers.set("Authorization", `Bearer ${J}`), a;
    });
    const n = await new Et(e).getSettings();
    let o = [];
    if (n) {
      if (n.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: p,
          forBlockEditor: "block-grid"
        };
        ((l = n.blockGrid.contentTypes) == null ? void 0 : l.length) !== 0 && (a.forContentTypeAlias = n.blockGrid.contentTypes), o.push(a);
      }
      if (n.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: f,
          forBlockEditor: "block-list"
        };
        ((c = n.blockList.contentTypes) == null ? void 0 : c.length) !== 0 && (a.forContentTypeAlias = n.blockList.contentTypes), o.push(a);
      }
      if (n.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: w,
          forBlockEditor: "block-rte"
        };
        ((u = n.richText.contentTypes) == null ? void 0 : u.length) !== 0 && (a.forContentTypeAlias = n.richText.contentTypes), o.push(a);
      }
    }
    t.registerMany([
      ...o,
      ...br,
      ..._r,
      ...yr
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
  Mr as o
};
//# sourceMappingURL=index-Cnomvifr.js.map

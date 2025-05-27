var pe = (t) => {
  throw TypeError(t);
};
var fe = (t, e, i) => e.has(t) || pe("Cannot " + i);
var d = (t, e, i) => (fe(t, e, "read from private field"), i ? i.call(t) : e.get(t)), R = (t, e, i) => e.has(t) ? pe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), q = (t, e, i, r) => (fe(t, e, "write to private field"), r ? r.call(t, i) : e.set(t, i), i);
import { UMB_AUTH_CONTEXT as Fe } from "@umbraco-cms/backoffice/auth";
import { tryExecuteAndNotify as H } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as _e } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ke } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Xe, UMB_BLOCK_GRID_MANAGER_CONTEXT as Je } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as ve } from "@umbraco-cms/backoffice/document";
import { css as Z, property as u, state as C, customElement as ee, html as D, ifDefined as te, unsafeHTML as ie } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as re } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as A, UmbObjectState as ze, UmbStringState as ye } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as oe, UMB_PROPERTY_CONTEXT as Ye } from "@umbraco-cms/backoffice/property";
import { UmbContextToken as Qe } from "@umbraco-cms/backoffice/context-api";
import { UUIButtonElement as we } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as Ze, UMB_BLOCK_LIST_MANAGER_CONTEXT as et } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as tt } from "@umbraco-cms/backoffice/block-rte";
class be extends Error {
  constructor(e, i, r) {
    super(r), this.name = "ApiError", this.url = i.url, this.status = i.status, this.statusText = i.statusText, this.body = i.body, this.request = e;
  }
}
class it extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class rt {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((i, r) => {
      this._resolve = i, this._reject = r;
      const o = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(a));
      }, s = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(a));
      }, n = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(a);
      };
      return Object.defineProperty(n, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(n, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(n, "isCancelled", {
        get: () => this._isCancelled
      }), e(o, s, n);
    });
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, i) {
    return this.promise.then(e, i);
  }
  catch(e) {
    return this.promise.catch(e);
  }
  finally(e) {
    return this.promise.finally(e);
  }
  cancel() {
    if (!(this._isResolved || this._isRejected || this._isCancelled)) {
      if (this._isCancelled = !0, this.cancelHandlers.length)
        try {
          for (const e of this.cancelHandlers)
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      this.cancelHandlers.length = 0, this._reject && this._reject(new it("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class me {
  constructor() {
    this._fns = [];
  }
  eject(e) {
    const i = this._fns.indexOf(e);
    i !== -1 && (this._fns = [...this._fns.slice(0, i), ...this._fns.slice(i + 1)]);
  }
  use(e) {
    this._fns = [...this._fns, e];
  }
}
const x = {
  BASE: "",
  CREDENTIALS: "include",
  ENCODE_PATH: void 0,
  HEADERS: void 0,
  PASSWORD: void 0,
  TOKEN: void 0,
  USERNAME: void 0,
  VERSION: "Latest",
  WITH_CREDENTIALS: !1,
  interceptors: {
    request: new me(),
    response: new me()
  }
}, $ = (t) => typeof t == "string", F = (t) => $(t) && t !== "", ne = (t) => t instanceof Blob, Te = (t) => t instanceof FormData, ot = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, nt = (t) => {
  const e = [], i = (o, s) => {
    e.push(`${encodeURIComponent(o)}=${encodeURIComponent(String(s))}`);
  }, r = (o, s) => {
    s != null && (s instanceof Date ? i(o, s.toISOString()) : Array.isArray(s) ? s.forEach((n) => r(o, n)) : typeof s == "object" ? Object.entries(s).forEach(([n, a]) => r(`${o}[${n}]`, a)) : i(o, s));
  };
  return Object.entries(t).forEach(([o, s]) => r(o, s)), e.length ? `?${e.join("&")}` : "";
}, st = (t, e) => {
  const i = encodeURI, r = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (s, n) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(n) ? i(String(e.path[n])) : s;
  }), o = t.BASE + r;
  return e.query ? o + nt(e.query) : o;
}, at = (t) => {
  if (t.formData) {
    const e = new FormData(), i = (r, o) => {
      $(o) || ne(o) ? e.append(r, o) : e.append(r, JSON.stringify(o));
    };
    return Object.entries(t.formData).filter(([, r]) => r != null).forEach(([r, o]) => {
      Array.isArray(o) ? o.forEach((s) => i(r, s)) : i(r, o);
    }), e;
  }
}, I = async (t, e) => typeof e == "function" ? e(t) : e, ct = async (t, e) => {
  const [i, r, o, s] = await Promise.all([
    // @ts-ignore
    I(e, t.TOKEN),
    // @ts-ignore
    I(e, t.USERNAME),
    // @ts-ignore
    I(e, t.PASSWORD),
    // @ts-ignore
    I(e, t.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...s,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [c, l]) => ({
    ...a,
    [c]: String(l)
  }), {});
  if (F(i) && (n.Authorization = `Bearer ${i}`), F(r) && F(o)) {
    const a = ot(`${r}:${o}`);
    n.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? n["Content-Type"] = e.mediaType : ne(e.body) ? n["Content-Type"] = e.body.type || "application/octet-stream" : $(e.body) ? n["Content-Type"] = "text/plain" : Te(e.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, lt = (t) => {
  var e, i;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (i = t.mediaType) != null && i.includes("+json") ? JSON.stringify(t.body) : $(t.body) || ne(t.body) || Te(t.body) ? t.body : JSON.stringify(t.body);
}, ut = async (t, e, i, r, o, s, n) => {
  const a = new AbortController();
  let c = {
    headers: s,
    body: r ?? o,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (c.credentials = t.CREDENTIALS);
  for (const l of t.interceptors.request._fns)
    c = await l(c);
  return n(() => a.abort()), await fetch(i, c);
}, ht = (t, e) => {
  if (e) {
    const i = t.headers.get(e);
    if ($(i))
      return i;
  }
}, dt = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const i = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (i.some((r) => e.includes(r)))
          return await t.blob();
        if (e.includes("multipart/form-data"))
          return await t.formData();
        if (e.includes("text/"))
          return await t.text();
      }
    } catch (e) {
      console.error(e);
    }
}, pt = (t, e) => {
  const r = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "Im a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Content",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
    ...t.errors
  }[e.status];
  if (r)
    throw new be(t, e, r);
  if (!e.ok) {
    const o = e.status ?? "unknown", s = e.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new be(
      t,
      e,
      `Generic Error: status: ${o}; status text: ${s}; body: ${n}`
    );
  }
}, V = (t, e) => new rt(async (i, r, o) => {
  try {
    const s = st(t, e), n = at(e), a = lt(e), c = await ct(t, e);
    if (!o.isCancelled) {
      let l = await ut(t, e, s, a, n, c, o);
      for (const We of t.interceptors.response._fns)
        l = await We(l);
      const ue = await dt(l), He = ht(l, e.responseHeader);
      let he = ue;
      e.responseTransformer && l.ok && (he = await e.responseTransformer(ue));
      const de = {
        url: s,
        ok: l.ok,
        status: l.status,
        statusText: l.statusText,
        body: He ?? he
      };
      pt(e, de), i(de.body);
    }
  } catch (s) {
    r(s);
  }
});
class W {
  /**
   * @param data The data for the request.
   * @param data.nodeKey
   * @param data.blockEditorAlias
   * @param data.contentElementAlias
   * @param data.culture
   * @param data.documentTypeUnique
   * @param data.contentUdi
   * @param data.settingsUdi
   * @param data.blockIndex
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewGridBlock(e = {}) {
    return V(x, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/grid",
      query: {
        nodeKey: e.nodeKey,
        blockEditorAlias: e.blockEditorAlias,
        contentElementAlias: e.contentElementAlias,
        culture: e.culture,
        documentTypeUnique: e.documentTypeUnique,
        contentUdi: e.contentUdi,
        settingsUdi: e.settingsUdi,
        blockIndex: e.blockIndex
      },
      body: e.requestBody,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user does not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.nodeKey
   * @param data.blockEditorAlias
   * @param data.contentElementAlias
   * @param data.culture
   * @param data.documentTypeUnique
   * @param data.contentUdi
   * @param data.settingsUdi
   * @param data.blockIndex
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewListBlock(e = {}) {
    return V(x, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/list",
      query: {
        nodeKey: e.nodeKey,
        blockEditorAlias: e.blockEditorAlias,
        contentElementAlias: e.contentElementAlias,
        culture: e.culture,
        documentTypeUnique: e.documentTypeUnique,
        contentUdi: e.contentUdi,
        settingsUdi: e.settingsUdi,
        blockIndex: e.blockIndex
      },
      body: e.requestBody,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user does not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.nodeKey
   * @param data.blockEditorAlias
   * @param data.contentElementAlias
   * @param data.culture
   * @param data.documentTypeUnique
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewRichTextMarkup(e = {}) {
    return V(x, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/rte",
      query: {
        nodeKey: e.nodeKey,
        blockEditorAlias: e.blockEditorAlias,
        contentElementAlias: e.contentElementAlias,
        culture: e.culture,
        documentTypeUnique: e.documentTypeUnique
      },
      body: e.requestBody,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user does not have access to this resource"
      }
    });
  }
  /**
   * @returns unknown OK
   * @throws ApiError
   */
  static getSettings() {
    return V(x, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user does not have access to this resource"
      }
    });
  }
}
var L;
class ft {
  constructor(e) {
    R(this, L);
    q(this, L, e);
  }
  async getSettings() {
    return await H(d(this, L), W.getSettings());
  }
}
L = new WeakMap();
var N;
class ge extends _e {
  constructor(i) {
    super(i);
    R(this, N);
    q(this, N, new ft(i));
  }
  async getSettings() {
    const i = await d(this, N).getSettings();
    if (i && (i != null && i.data))
      return i.data;
  }
}
N = new WeakMap();
const se = new Qe("BlockPreviewContext");
var yt = Object.defineProperty, bt = Object.getOwnPropertyDescriptor, Ce = (t) => {
  throw TypeError(t);
}, E = (t, e, i, r) => {
  for (var o = r > 1 ? void 0 : r ? bt(e, i) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (o = (r ? n(e, i, o) : n(o)) || o);
  return r && o && yt(e, i, o), o;
}, ae = (t, e, i) => e.has(t) || Ce("Cannot " + i), k = (t, e, i) => (ae(t, e, "read from private field"), e.get(t)), X = (t, e, i) => e.has(t) ? Ce("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Ee = (t, e, i, r) => (ae(t, e, "write to private field"), e.set(t, i), i), T = (t, e, i) => (ae(t, e, "access private method"), i), p, K, b, xe, Ae, Ue, Re, z, qe, Be, Pe;
const mt = "block-grid-preview";
let y = class extends re {
  constructor() {
    super(), X(this, b), X(this, p), X(this, K), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
    }, this.consumeContext(se, (t) => {
      Ee(this, p, t), T(this, b, xe).call(this);
    });
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), e.expose ?? (e.expose = []), this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async updated(t) {
    super.updated(t), t.has("content") && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      T(this, b, Be).call(this);
    }, 500));
  }
  _filterLayouts(t) {
    if (!t || t.length === 0)
      return [];
    const e = t.filter((r) => r.contentKey === this._blockContext.contentUdi);
    return e.length > 0 ? e : t.flatMap((r) => r.areas || []).flatMap((r) => (r == null ? void 0 : r.items) || []).filter((r) => r && r.contentKey === this._blockContext.contentUdi);
  }
  _handleClick(t) {
    var s;
    let e = !0;
    const i = t.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && r.includes(n.tagName)).length > 0) {
      const n = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      n != null && n instanceof we && (s = n.href) != null && s.includes("block/edit") && (e = !1), e && (t.preventDefault(), t.stopPropagation());
    }
  }
  render() {
    return this._isLoading ? D`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>` : this._error ? D`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            ` : this._htmlMarkup ? D`
                ${this._styleElement}
                <a
                    href=${te(this._blockContext.workspaceEditContentPath)} 
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    role="button"
                >
                    ${ie(this._htmlMarkup)}
                </a>
            ` : null;
  }
};
p = /* @__PURE__ */ new WeakMap();
K = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakSet();
xe = function() {
  T(this, b, Ae).call(this), T(this, b, Ue).call(this), T(this, b, Re).call(this);
};
Ae = function() {
  var t;
  this.observe((t = k(this, p)) == null ? void 0 : t.settings, (e) => {
    var i;
    (i = e == null ? void 0 : e.blockGrid) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = e.blockGrid.stylesheet);
  });
};
Ue = function() {
  this.consumeContext(oe, (t) => {
    this._blockContext.culture = t.getVariantId().culture ?? "";
  });
};
Re = async function() {
  this.getContext(ve).then((t) => {
    Ee(this, K, t), this.observe(
      A([t.unique, t.contentTypeUnique]),
      async ([e, i]) => {
        var r, o;
        this._blockContext.unique = (e == null ? void 0 : e.toString()) ?? "", (r = k(this, p)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = k(this, p)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), T(this, b, z).call(this);
      }
    );
  }), k(this, K) == null && k(this, p) != null && this._blockContext.unique == "" && this.consumeContext(ke, (t) => {
    this.observe(t.content.structure.contentTypeUniques, (e) => {
      var i;
      this._blockContext.unique = ((i = k(this, p)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = e[0] ?? "", T(this, b, z).call(this);
    });
  });
};
z = async function() {
  this.consumeContext(Xe, async (t) => {
    this.observe(
      A([
        t.contentKey,
        t.settingsKey,
        t.workspaceEditContentPath,
        t.contentElementTypeAlias,
        t.contentElementTypeKey
      ]),
      async ([
        e,
        i,
        r,
        o,
        s
      ]) => {
        this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", await T(this, b, qe).call(this);
      }
    );
  });
};
qe = async function() {
  this.consumeContext(Je, (t) => {
    this.observe(
      A([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, i, r, o, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockGridValue = {
          contentData: (e == null ? void 0 : e.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (o == null ? void 0 : o.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: { "Umbraco.BlockGrid": this._filterLayouts(r) }
        }, this._blockContext.blockIndex = e.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
Be = async function() {
  const t = this._blockContext;
  if (k(this, p) != null && t.unique == "" && (t.unique = k(this, p).getUnique()), k(this, p) != null && t.documentTypeUnique == "" && (t.documentTypeUnique = k(this, p).getDocumentTypeUnique()), !T(this, b, Pe).call(this, t)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const i = {
      blockEditorAlias: t.blockEditorAlias,
      nodeKey: t.unique,
      contentElementAlias: t.contentElementTypeAlias,
      documentTypeUnique: t.documentTypeUnique,
      contentUdi: t.contentUdi,
      settingsUdi: t.settingsUdi,
      culture: t.culture,
      requestBody: JSON.stringify(this.blockGridValue),
      blockIndex: t.blockIndex
    }, { data: r } = await H(this, W.previewGridBlock(i));
    this._htmlMarkup = r ?? "", this._isLoading = !1;
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Pe = function(t) {
  return t.unique != "" && t.blockEditorAlias != "" && t.contentUdi != "" && t.contentElementTypeAlias != "";
};
y.styles = [
  Z`
            a {
              display: block;
              color: inherit;
              text-decoration: inherit;
              border: 1px solid transparent;
              border-radius: 2px;
            }

            a:hover {
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
E([
  u({ attribute: !1 })
], y.prototype, "content", 2);
E([
  u({ attribute: !1 })
], y.prototype, "settingsData", 2);
E([
  u({ attribute: !1 })
], y.prototype, "contentKey", 2);
E([
  u({ attribute: !1 })
], y.prototype, "config", 2);
E([
  C()
], y.prototype, "_htmlMarkup", 2);
E([
  C()
], y.prototype, "_isLoading", 2);
E([
  C()
], y.prototype, "_error", 2);
E([
  u({ attribute: !1 })
], y.prototype, "blockGridValue", 1);
y = E([
  ee(mt)
], y);
var _t = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, De = (t) => {
  throw TypeError(t);
}, w = (t, e, i, r) => {
  for (var o = r > 1 ? void 0 : r ? kt(e, i) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (o = (r ? n(e, i, o) : n(o)) || o);
  return r && o && _t(e, i, o), o;
}, ce = (t, e, i) => e.has(t) || De("Cannot " + i), v = (t, e, i) => (ce(t, e, "read from private field"), e.get(t)), J = (t, e, i) => e.has(t) ? De("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Se = (t, e, i, r) => (ce(t, e, "write to private field"), e.set(t, i), i), g = (t, e, i) => (ce(t, e, "access private method"), i), f, j, m, Oe, Le, Ne, Me, Y, $e, Ie, Ve;
const vt = "block-list-preview";
let h = class extends re {
  constructor() {
    super(), J(this, m), J(this, f), J(this, j), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
    }, this.consumeContext(se, (t) => {
      Se(this, f, t), g(this, m, Oe).call(this);
    });
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), e.expose ?? (e.expose = []), this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async updated(t) {
    super.updated(t), t.has("content") && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      g(this, m, Ie).call(this);
    }, 500));
  }
  _handleClick(t) {
    var s;
    let e = !0;
    const i = t.composedPath(), r = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && r.includes(n.tagName)).length > 0) {
      const n = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      n != null && n instanceof we && (s = n.href) != null && s.includes("block/edit") && (e = !1), e && (t.preventDefault(), t.stopPropagation());
    }
  }
  render() {
    return this._isLoading ? D`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>` : this._error ? D`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            ` : this._htmlMarkup ? D`
                ${this._styleElement}
                <a 
                    href=${te(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    role="button"
                >
                    ${ie(this._htmlMarkup)}
                </a>
            ` : null;
  }
};
f = /* @__PURE__ */ new WeakMap();
j = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
Oe = function() {
  g(this, m, Le).call(this), g(this, m, Ne).call(this), g(this, m, Me).call(this);
};
Le = function() {
  var t;
  this.observe((t = v(this, f)) == null ? void 0 : t.settings, (e) => {
    var i;
    (i = e == null ? void 0 : e.blockList) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = e.blockList.stylesheet);
  });
};
Ne = function() {
  this.consumeContext(oe, async (t) => {
    this._blockContext.culture = t.getVariantId().culture ?? "";
  });
};
Me = function() {
  this.getContext(ve).then((t) => {
    Se(this, j, t), this.observe(
      A([t.unique, t.contentTypeUnique]),
      async ([e, i]) => {
        var r, o;
        this._blockContext.unique = (e == null ? void 0 : e.toString()) ?? "", (r = v(this, f)) == null || r.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (o = v(this, f)) == null || o.setDocumentTypeUnique(this._blockContext.documentTypeUnique), g(this, m, Y).call(this);
      }
    );
  }), v(this, j) == null && v(this, f) != null && this._blockContext.unique == "" && this.consumeContext(ke, (t) => {
    this.observe(t.content.structure.contentTypeUniques, (e) => {
      var i;
      this._blockContext.unique = ((i = v(this, f)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = e[0] ?? "", g(this, m, Y).call(this);
    });
  });
};
Y = function() {
  this.consumeContext(Ze, (t) => {
    this.observe(
      A([
        t.contentKey,
        t.settingsKey,
        t.workspaceEditContentPath,
        t.contentElementTypeAlias,
        t.contentElementTypeKey
      ]),
      async ([
        e,
        i,
        r,
        o,
        s
      ]) => {
        this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = r ?? "", this._blockContext.contentElementTypeAlias = o ?? "", this._blockContext.contentElementTypeKey = s ?? "", await g(this, m, $e).call(this);
      }
    );
  });
};
$e = function() {
  this.consumeContext(et, (t) => {
    this.observe(
      A([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, i, r, o, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockListValue = {
          contentData: (e == null ? void 0 : e.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (o == null ? void 0 : o.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.BlockList": (r == null ? void 0 : r.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? []
          }
        }, this._blockContext.blockIndex = e == null ? void 0 : e.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
Ie = async function() {
  const t = this._blockContext;
  if (v(this, f) != null && t.unique == "" && (t.unique = v(this, f).getUnique()), v(this, f) != null && t.documentTypeUnique == "" && (t.documentTypeUnique = v(this, f).getDocumentTypeUnique()), !g(this, m, Ve).call(this, t)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const i = {
      blockEditorAlias: t.blockEditorAlias,
      nodeKey: t.unique,
      contentElementAlias: t.contentElementTypeAlias,
      documentTypeUnique: t.documentTypeUnique,
      contentUdi: t.contentUdi,
      settingsUdi: t.settingsUdi,
      culture: t.culture,
      blockIndex: t.blockIndex,
      requestBody: JSON.stringify(this.blockListValue)
    }, { data: r } = await H(this, W.previewListBlock(i));
    this._htmlMarkup = r ?? "", this._isLoading = !1;
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Ve = function(t) {
  return t.unique != "" && t.blockEditorAlias != "" && t.contentUdi != "" && t.contentElementTypeAlias != "";
};
h.styles = [
  Z`
        a {
          display: block;
          color: inherit;
          text-decoration: inherit;
          border: 1px solid transparent;
          border-radius: 2px;
        }

        a:hover {
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
w([
  u({ attribute: !1 })
], h.prototype, "content", 2);
w([
  u({ attribute: !1 })
], h.prototype, "settingsData", 2);
w([
  u({ attribute: !1 })
], h.prototype, "contentKey", 2);
w([
  u({ attribute: !1 })
], h.prototype, "config", 2);
w([
  C()
], h.prototype, "_htmlMarkup", 2);
w([
  C()
], h.prototype, "_isLoading", 2);
w([
  C()
], h.prototype, "_error", 2);
w([
  C()
], h.prototype, "_blockListValue", 2);
w([
  u({ attribute: !1 })
], h.prototype, "blockListValue", 1);
h = w([
  ee(vt)
], h);
var wt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, Ke = (t) => {
  throw TypeError(t);
}, U = (t, e, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Tt(e, i) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (o = (r ? n(e, i, o) : n(o)) || o);
  return r && o && wt(e, i, o), o;
}, gt = (t, e, i) => e.has(t) || Ke("Cannot " + i), Ct = (t, e, i) => e.has(t) ? Ke("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), G = (t, e, i) => (gt(t, e, "access private method"), i), S, je, Ge, le;
const Et = "rich-text-preview";
let _ = class extends re {
  constructor() {
    var t;
    super(), Ct(this, S), this.htmlMarkup = "", this.unique = "", this.documentTypeUnique = "", this.blockEditorAlias = "", this.culture = "", this._blockRteValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, this.consumeContext(oe, async (e) => {
      this.culture = e.getVariantId().culture ?? "";
    }), this.unique = (t = window.location.pathname.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)) == null ? void 0 : t[0], G(this, S, je).call(this);
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), e.expose ?? (e.expose = []), this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  async updated(t) {
    super.updated(t), t.has("content") && (this._previewTimeout && clearTimeout(this._previewTimeout), this._previewTimeout = window.setTimeout(() => {
      G(this, S, le).call(this);
    }, 500));
  }
  render() {
    if (this.htmlMarkup !== "")
      return D`
                <a href=${te(this.workspaceEditContentPath)}>
                    ${ie(this.htmlMarkup)}
                </a>`;
  }
};
S = /* @__PURE__ */ new WeakSet();
je = function() {
  this.consumeContext(Ye, (t) => {
    this.observe(
      A([t.alias, t.value]),
      async ([e, i]) => {
        this.blockEditorAlias = e, i.hasOwnProperty("blocks") && (i.blocks.length !== 0 && (this.blockRteValue = {
          ...this.blockRteValue,
          contentData: i.blocks.contentData,
          settingsData: i.blocks.settingsData,
          expose: i.blocks.expose,
          layout: i.blocks.layout
        }), G(this, S, Ge).call(this));
      }
    );
  });
};
Ge = function() {
  this.consumeContext(tt, (t) => {
    this.observe(
      A([t.workspaceEditContentPath, t.contentElementTypeAlias]),
      async ([e, i]) => {
        this.contentElementTypeAlias = i, this.workspaceEditContentPath = e, await G(this, S, le).call(this);
      }
    );
  });
};
le = async function() {
  if (!this.unique || !this.blockEditorAlias || !this.contentElementTypeAlias || !this.blockRteValue.contentData || !this.blockRteValue.layout) return;
  const t = {
    blockEditorAlias: this.blockEditorAlias,
    nodeKey: this.unique,
    contentElementAlias: this.contentElementTypeAlias,
    culture: this.culture,
    requestBody: JSON.stringify(this.blockRteValue)
  }, { data: e } = await H(this, W.previewRichTextMarkup(t));
  e && (this.htmlMarkup = e);
};
_.styles = [
  Z`
            a {
              display: block;
              color: inherit;
              text-decoration: inherit;
              border: 1px solid transparent;
              border-radius: 2px;
            }

            a:hover {
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
U([
  u({ attribute: !1 })
], _.prototype, "content", 2);
U([
  u({ attribute: !1 })
], _.prototype, "settingsData", 2);
U([
  u({ attribute: !1 })
], _.prototype, "contentKey", 2);
U([
  u({ attribute: !1 })
], _.prototype, "config", 2);
U([
  C()
], _.prototype, "htmlMarkup", 2);
U([
  C()
], _.prototype, "_blockRteValue", 2);
U([
  u({ attribute: !1 })
], _.prototype, "blockRteValue", 1);
_ = U([
  ee(Et)
], _);
const xt = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => Ut)
  }
], At = [...xt];
var M, O, B, P;
class Q extends _e {
  constructor(i) {
    super(i);
    R(this, M);
    R(this, O);
    R(this, B);
    R(this, P);
    q(this, O, new ze(void 0)), this.settings = d(this, O).asObservable(), q(this, B, new ye("")), this.unique = d(this, B).asObservable(), q(this, P, new ye("")), this.documentTypeUnique = d(this, P).asObservable(), q(this, M, new ge(i)), this.getSettings();
  }
  async getSettings() {
    const i = await d(this, M).getSettings();
    d(this, O).setValue(i);
  }
  getUnique() {
    return d(this, B).getValue();
  }
  async setUnique(i) {
    i != "" && d(this, B).setValue(i);
  }
  getDocumentTypeUnique() {
    return d(this, P).getValue();
  }
  async setDocumentTypeUnique(i) {
    i != "" && d(this, P).setValue(i);
  }
}
M = new WeakMap(), O = new WeakMap(), B = new WeakMap(), P = new WeakMap();
const Ut = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: Q,
  default: Q
}, Symbol.toStringTag, { value: "Module" })), Gt = async (t, e) => {
  var s, n, a;
  const r = await new ge(t).getSettings();
  let o = [];
  if (r) {
    if (r.blockGrid.enabled) {
      let c = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.GridCustomView",
        name: "BlockPreview Grid Custom View",
        element: y,
        forBlockEditor: "block-grid"
      };
      ((s = r.blockGrid.contentTypes) == null ? void 0 : s.length) !== 0 && (c.forContentTypeAlias = r.blockGrid.contentTypes), o.push(c);
    }
    if (r.blockList.enabled) {
      let c = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.ListCustomView",
        name: "BlockPreview List Custom View",
        element: h,
        forBlockEditor: "block-list"
      };
      ((n = r.blockList.contentTypes) == null ? void 0 : n.length) !== 0 && (c.forContentTypeAlias = r.blockList.contentTypes), o.push(c);
    }
    if (r.richText.enabled) {
      let c = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.RichTextCustomView",
        name: "BlockPreview Rich Text Custom View",
        element: _,
        forBlockEditor: "block-rte"
      };
      ((a = r.richText.contentTypes) == null ? void 0 : a.length) !== 0 && (c.forContentTypeAlias = r.richText.contentTypes), o.push(c);
    }
  }
  e.registerMany([
    ...o,
    ...At
  ]), t.provideContext(se, new Q(t)), t.consumeContext(Fe, async (c) => {
    if (!c) return;
    const l = c.getOpenApiConfiguration();
    x.BASE = l.base, x.TOKEN = l.token, x.WITH_CREDENTIALS = l.withCredentials, x.CREDENTIALS = l.credentials;
  });
};
export {
  y as BlockGridPreviewCustomView,
  h as BlockListPreviewCustomView,
  _ as RichTextPreviewCustomView,
  ft as SettingsDataSource,
  ge as SettingsRepository,
  Gt as onInit
};
//# sourceMappingURL=assets.js.map

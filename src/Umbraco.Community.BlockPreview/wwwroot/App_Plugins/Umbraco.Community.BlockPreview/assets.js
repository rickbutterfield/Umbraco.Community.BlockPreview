var $ = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var h = (t, e, r) => ($(t, e, "read from private field"), r ? r.call(t) : e.get(t)), y = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, m = (t, e, r, i) => ($(t, e, "write to private field"), i ? i.call(t, r) : e.set(t, r), r);
import { UMB_AUTH_CONTEXT as de } from "@umbraco-cms/backoffice/auth";
import { tryExecuteAndNotify as B } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as W } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as he } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as F } from "@umbraco-cms/backoffice/document";
import { css as X, state as D, property as J, customElement as z, html as Y, ifDefined as Q, unsafeHTML as Z } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ee } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as v, UmbObjectState as pe } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as te, UMB_PROPERTY_CONTEXT as re } from "@umbraco-cms/backoffice/property";
import { UmbContextToken as fe } from "@umbraco-cms/backoffice/context-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as ye } from "@umbraco-cms/backoffice/block-list";
class H extends Error {
  constructor(e, r, i) {
    super(i), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class me extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class be {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, i) => {
      this._resolve = r, this._reject = i;
      const s = (a) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(a));
      }, o = (a) => {
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
      }), e(s, o, n);
    });
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, r) {
    return this.promise.then(e, r);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new me("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class K {
  constructor() {
    this._fns = [];
  }
  eject(e) {
    const r = this._fns.indexOf(e);
    r !== -1 && (this._fns = [...this._fns.slice(0, r), ...this._fns.slice(r + 1)]);
  }
  use(e) {
    this._fns = [...this._fns, e];
  }
}
const u = {
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
    request: new K(),
    response: new K()
  }
}, T = (t) => typeof t == "string", A = (t) => T(t) && t !== "", x = (t) => t instanceof Blob, ie = (t) => t instanceof FormData, ve = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, we = (t) => {
  const e = [], r = (s, o) => {
    e.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(o))}`);
  }, i = (s, o) => {
    o != null && (o instanceof Date ? r(s, o.toISOString()) : Array.isArray(o) ? o.forEach((n) => i(s, n)) : typeof o == "object" ? Object.entries(o).forEach(([n, a]) => i(`${s}[${n}]`, a)) : r(s, o));
  };
  return Object.entries(t).forEach(([s, o]) => i(s, o)), e.length ? `?${e.join("&")}` : "";
}, ke = (t, e) => {
  const r = t.ENCODE_PATH || encodeURI, i = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (o, n) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(n) ? r(String(e.path[n])) : o;
  }), s = t.BASE + i;
  return e.query ? s + we(e.query) : s;
}, Ee = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (i, s) => {
      T(s) || x(s) ? e.append(i, s) : e.append(i, JSON.stringify(s));
    };
    return Object.entries(t.formData).filter(([, i]) => i != null).forEach(([i, s]) => {
      Array.isArray(s) ? s.forEach((o) => r(i, o)) : r(i, s);
    }), e;
  }
}, g = async (t, e) => typeof e == "function" ? e(t) : e, Te = async (t, e) => {
  const [r, i, s, o] = await Promise.all([
    // @ts-ignore
    g(e, t.TOKEN),
    // @ts-ignore
    g(e, t.USERNAME),
    // @ts-ignore
    g(e, t.PASSWORD),
    // @ts-ignore
    g(e, t.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...o,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [c, l]) => ({
    ...a,
    [c]: String(l)
  }), {});
  if (A(r) && (n.Authorization = `Bearer ${r}`), A(i) && A(s)) {
    const a = ve(`${i}:${s}`);
    n.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? n["Content-Type"] = e.mediaType : x(e.body) ? n["Content-Type"] = e.body.type || "application/octet-stream" : T(e.body) ? n["Content-Type"] = "text/plain" : ie(e.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, ge = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : T(t.body) || x(t.body) || ie(t.body) ? t.body : JSON.stringify(t.body);
}, _e = async (t, e, r, i, s, o, n) => {
  const a = new AbortController();
  let c = {
    headers: o,
    body: i ?? s,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (c.credentials = t.CREDENTIALS);
  for (const l of t.interceptors.request._fns)
    c = await l(c);
  return n(() => a.abort()), await fetch(r, c);
}, Ce = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (T(r))
      return r;
  }
}, Se = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const r = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (r.some((i) => e.includes(i)))
          return await t.blob();
        if (e.includes("multipart/form-data"))
          return await t.formData();
        if (e.includes("text/"))
          return await t.text();
      }
    } catch (e) {
      console.error(e);
    }
}, Ae = (t, e) => {
  const i = {
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
  if (i)
    throw new H(t, e, i);
  if (!e.ok) {
    const s = e.status ?? "unknown", o = e.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new H(
      t,
      e,
      `Generic Error: status: ${s}; status text: ${o}; body: ${n}`
    );
  }
}, _ = (t, e) => new be(async (r, i, s) => {
  try {
    const o = ke(t, e), n = Ee(e), a = ge(e), c = await Te(t, e);
    if (!s.isCancelled) {
      let l = await _e(t, e, o, a, n, c, s);
      for (const ue of t.interceptors.response._fns)
        l = await ue(l);
      const M = await Se(l), le = Ce(l, e.responseHeader);
      let G = M;
      e.responseTransformer && l.ok && (G = await e.responseTransformer(M));
      const I = {
        url: o,
        ok: l.ok,
        status: l.status,
        statusText: l.statusText,
        body: le ?? G
      };
      Ae(e, I), r(I.body);
    }
  } catch (o) {
    i(o);
  }
});
class U {
  /**
   * @param data The data for the request.
   * @param data.nodeKey
   * @param data.blockEditorAlias
   * @param data.contentElementAlias
   * @param data.culture
   * @param data.documentTypeUnique
   * @param data.contentUdi
   * @param data.settingsUdi
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static previewGridBlock(e = {}) {
    return _(u, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/grid",
      query: {
        nodeKey: e.nodeKey,
        blockEditorAlias: e.blockEditorAlias,
        contentElementAlias: e.contentElementAlias,
        culture: e.culture,
        documentTypeUnique: e.documentTypeUnique,
        contentUdi: e.contentUdi,
        settingsUdi: e.settingsUdi
      },
      body: e.requestBody,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
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
  static previewListBlock(e = {}) {
    return _(u, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/list",
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
        403: "The authenticated user do not have access to this resource"
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
    return _(u, {
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
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @returns unknown OK
   * @throws ApiError
   */
  static getSettings() {
    return _(u, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
var w;
class Re {
  constructor(e) {
    y(this, w, void 0);
    m(this, w, e);
  }
  async getSettings() {
    return await B(h(this, w), U.getSettings());
  }
}
w = new WeakMap();
var k;
class se extends W {
  constructor(r) {
    super(r);
    y(this, k, void 0);
    m(this, k, new Re(r));
  }
  async getSettings() {
    const r = await h(this, k).getSettings();
    if (r && (r != null && r.data))
      return r.data;
  }
}
k = new WeakMap();
const oe = new fe("BlockPreviewContext");
var Pe = Object.defineProperty, qe = Object.getOwnPropertyDescriptor, N = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? qe(e, r) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (i ? n(e, r, s) : n(s)) || s);
  return i && s && Pe(e, r, s), s;
}, Oe = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, R = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, L = (t, e, r) => (Oe(t, e, "access private method"), r), q, ne, j, ae, V, ce;
const Be = "block-grid-preview";
let f = class extends ee {
  constructor() {
    super(), R(this, q), R(this, j), R(this, V), this.htmlMarkup = "", this.unique = "", this.documentTypeUnique = "", this.contentUdi = "", this.settingsUdi = null, this.blockEditorAlias = "", this.culture = "", this._blockGridValue = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(oe, async (t) => {
      this.observe(t.settings, (e) => {
        var r, i;
        (r = e == null ? void 0 : e.blockGrid) != null && r.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = (i = e == null ? void 0 : e.blockGrid) == null ? void 0 : i.stylesheet);
      });
    }), this.consumeContext(te, async (t) => {
      this.culture = t.getVariantId().culture ?? "";
    }), this.consumeContext(F, (t) => {
      this.observe(
        v([t.unique, t.contentTypeUnique]),
        async ([e, r]) => {
          this.unique = e, this.documentTypeUnique = r, L(this, q, ne).call(this);
        }
      );
    });
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  render() {
    if (this.htmlMarkup !== "")
      return Y`
                ${this._styleElement}
                <a href=${Q(this.workspaceEditContentPath)}>
                    ${Z(this.htmlMarkup)}
                </a>`;
  }
};
q = /* @__PURE__ */ new WeakSet();
ne = function() {
  this.consumeContext(re, (t) => {
    this.observe(
      v([t.alias, t.value]),
      async ([e, r]) => {
        this.blockEditorAlias = e, this.blockGridValue = {
          ...this.blockGridValue,
          contentData: r.contentData,
          settingsData: r.settingsData,
          layout: r.layout
        }, L(this, j, ae).call(this);
      }
    );
  });
};
j = /* @__PURE__ */ new WeakSet();
ae = function() {
  this.consumeContext(he, (t) => {
    this.observe(
      v([t.contentUdi, t.settingsUdi, t.workspaceEditContentPath, t.contentElementType]),
      async ([e, r, i, s]) => {
        this.contentUdi = e, this.settingsUdi = r ?? void 0, this.contentElementType = s, this.workspaceEditContentPath = i, await L(this, V, ce).call(this);
      }
    );
  });
};
V = /* @__PURE__ */ new WeakSet();
ce = async function() {
  if (!this.unique || !this.documentTypeUnique || !this.blockEditorAlias || !this.contentUdi || !this.contentElementType || this.settingsUdi === null || !this.blockGridValue.contentData || !this.blockGridValue.layout)
    return;
  const t = {
    blockEditorAlias: this.blockEditorAlias,
    nodeKey: this.unique,
    contentElementAlias: this.contentElementType.alias,
    documentTypeUnique: this.documentTypeUnique,
    contentUdi: this.contentUdi,
    settingsUdi: this.settingsUdi,
    culture: this.culture,
    requestBody: JSON.stringify(this.blockGridValue)
  }, { data: e } = await B(this, U.previewGridBlock(t));
  e && (this.htmlMarkup = e);
};
f.styles = [
  X`
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
N([
  D()
], f.prototype, "htmlMarkup", 2);
N([
  J({ attribute: !1 })
], f.prototype, "blockGridValue", 1);
f = N([
  z(Be)
], f);
var De = Object.defineProperty, xe = Object.getOwnPropertyDescriptor, S = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? xe(e, r) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (i ? n(e, r, s) : n(s)) || s);
  return i && s && De(e, r, s), s;
}, Ue = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
}, Ne = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, P = (t, e, r) => (Ue(t, e, "access private method"), r), b, C;
const Le = "block-list-preview";
let d = class extends ee {
  constructor() {
    super(), Ne(this, b), this.htmlMarkup = "", this.unique = "", this.documentTypeUnique = "", this.blockEditorAlias = "", this.culture = "", this._blockListValue = {
      layout: {},
      contentData: [],
      settingsData: []
    }, this.consumeContext(re, (t) => {
      this.observe(t.alias, async (e) => {
        this.blockEditorAlias = e, await P(this, b, C).call(this);
      });
    }), this.consumeContext(te, async (t) => {
      this.culture = t.getVariantId().culture ?? "", await P(this, b, C).call(this);
    }), this.consumeContext(F, (t) => {
      this.observe(
        v([t.unique, t.contentTypeUnique]),
        async ([e, r]) => {
          this.unique = e, this.documentTypeUnique = r;
        }
      );
    }), this.consumeContext(ye, (t) => {
      this.observe(
        v([t.workspaceEditContentPath, t.content, t.settings, t.layout, t.contentElementType]),
        async ([e, r, i, s, o]) => {
          this.contentElementType = o, this.workspaceEditContentPath = e, this._blockListValue = {
            ...this._blockListValue,
            contentData: [r],
            settingsData: [i],
            layout: { "Umbraco.BlockList": [s] }
          }, await P(this, b, C).call(this);
        }
      );
    });
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ?? (e.layout = {}), e.contentData ?? (e.contentData = []), e.settingsData ?? (e.settingsData = []), this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  render() {
    if (this.htmlMarkup !== "")
      return Y`
                <a href=${Q(this.workspaceEditContentPath)}>
                    ${Z(this.htmlMarkup)}
                </a>`;
  }
};
b = /* @__PURE__ */ new WeakSet();
C = async function() {
  if (!this.unique || !this.documentTypeUnique || !this.blockEditorAlias || !this.contentElementType || !this.blockListValue.contentData || !this.blockListValue.layout)
    return;
  const t = {
    blockEditorAlias: this.blockEditorAlias,
    nodeKey: this.unique,
    contentElementAlias: this.contentElementType.alias,
    culture: this.culture,
    requestBody: JSON.stringify(this.blockListValue)
  }, { data: e } = await B(this, U.previewListBlock(t));
  e && (this.htmlMarkup = e);
};
d.styles = [
  X`
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
S([
  D()
], d.prototype, "htmlMarkup", 2);
S([
  D()
], d.prototype, "_blockListValue", 2);
S([
  J({ attribute: !1 })
], d.prototype, "blockListValue", 1);
d = S([
  z(Le)
], d);
const je = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => Me)
  }
], Ve = [...je];
var E, p;
class O extends W {
  constructor(r) {
    super(r);
    y(this, E, void 0);
    y(this, p, void 0);
    m(this, p, new pe(void 0)), this.settings = h(this, p).asObservable(), m(this, E, new se(r)), this.getSettings();
  }
  async getSettings() {
    const r = await h(this, E).getSettings();
    h(this, p).setValue(r);
  }
}
E = new WeakMap(), p = new WeakMap();
const Me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: O,
  default: O
}, Symbol.toStringTag, { value: "Module" })), Ze = async (t, e) => {
  var o, n;
  const i = await new se(t).getSettings();
  let s = [];
  if (i) {
    if (i.blockGrid.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.GridCustomView",
        name: "BlockPreview Grid Custom View",
        element: f,
        forBlockEditor: "block-grid"
      };
      ((o = i.blockGrid.contentTypes) == null ? void 0 : o.length) !== 0 && (a.forContentTypeAlias = i.blockGrid.contentTypes), s.push(a);
    }
    if (i.blockList.enabled) {
      let a = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.ListCustomView",
        name: "BlockPreview List Custom View",
        element: d,
        forBlockEditor: "block-list"
      };
      ((n = i.blockList.contentTypes) == null ? void 0 : n.length) !== 0 && (a.forContentTypeAlias = i.blockList.contentTypes), s.push(a);
    }
  }
  e.registerMany([
    ...s,
    ...Ve
  ]), t.provideContext(oe, new O(t)), t.consumeContext(de, async (a) => {
    if (!a)
      return;
    const c = a.getOpenApiConfiguration();
    u.BASE = c.base, u.TOKEN = c.token, u.WITH_CREDENTIALS = c.withCredentials, u.CREDENTIALS = c.credentials;
  });
};
export {
  f as BlockGridPreviewCustomView,
  d as BlockListPreviewCustomView,
  Re as SettingsDataSource,
  se as SettingsRepository,
  Ze as onInit
};
//# sourceMappingURL=assets.js.map

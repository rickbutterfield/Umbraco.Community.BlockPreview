var be = (t) => {
  throw TypeError(t);
};
var ye = (t, e, i) => e.has(t) || be("Cannot " + i);
var p = (t, e, i) => (ye(t, e, "read from private field"), i ? i.call(t) : e.get(t)), x = (t, e, i) => e.has(t) ? be("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), U = (t, e, i, o) => (ye(t, e, "write to private field"), o ? o.call(t, i) : e.set(t, i), i);
import { UMB_AUTH_CONTEXT as Qe } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_WORKSPACE_CONTEXT as we } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ze, UMB_BLOCK_GRID_MANAGER_CONTEXT as et, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as tt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Te } from "@umbraco-cms/backoffice/document";
import { css as te, property as c, state as g, customElement as ie, html as A, ifDefined as oe, unsafeHTML as re } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ne } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as P, UmbObjectState as it, UmbStringState as _e, UmbBooleanState as ot } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as se, UMB_PROPERTY_CONTEXT as rt, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as me } from "@umbraco-cms/backoffice/property";
import { tryExecuteAndNotify as H } from "@umbraco-cms/backoffice/resources";
import { UmbContextToken as nt } from "@umbraco-cms/backoffice/context-api";
import { UUIButtonElement as ge } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as st, UMB_BLOCK_LIST_MANAGER_CONTEXT as at, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as ct } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as lt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as Ee } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as ut } from "@umbraco-cms/backoffice/property-action";
class ke extends Error {
  constructor(e, i, o) {
    super(o), this.name = "ApiError", this.url = i.url, this.status = i.status, this.statusText = i.statusText, this.body = i.body, this.request = e;
  }
}
class dt extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class ht {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((i, o) => {
      this._resolve = i, this._reject = o;
      const r = (a) => {
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
      }), e(r, s, n);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new dt("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class ve {
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
const R = {
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
    request: new ve(),
    response: new ve()
  }
}, N = (t) => typeof t == "string", X = (t) => N(t) && t !== "", ae = (t) => t instanceof Blob, Ce = (t) => t instanceof FormData, pt = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, ft = (t) => {
  const e = [], i = (r, s) => {
    e.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(s))}`);
  }, o = (r, s) => {
    s != null && (s instanceof Date ? i(r, s.toISOString()) : Array.isArray(s) ? s.forEach((n) => o(r, n)) : typeof s == "object" ? Object.entries(s).forEach(([n, a]) => o(`${r}[${n}]`, a)) : i(r, s));
  };
  return Object.entries(t).forEach(([r, s]) => o(r, s)), e.length ? `?${e.join("&")}` : "";
}, bt = (t, e) => {
  const i = encodeURI, o = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (s, n) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(n) ? i(String(e.path[n])) : s;
  }), r = t.BASE + o;
  return e.query ? r + ft(e.query) : r;
}, yt = (t) => {
  if (t.formData) {
    const e = new FormData(), i = (o, r) => {
      N(r) || ae(r) ? e.append(o, r) : e.append(o, JSON.stringify(r));
    };
    return Object.entries(t.formData).filter(([, o]) => o != null).forEach(([o, r]) => {
      Array.isArray(r) ? r.forEach((s) => i(o, s)) : i(o, r);
    }), e;
  }
}, V = async (t, e) => typeof e == "function" ? e(t) : e, _t = async (t, e) => {
  const [i, o, r, s] = await Promise.all([
    // @ts-ignore
    V(e, t.TOKEN),
    // @ts-ignore
    V(e, t.USERNAME),
    // @ts-ignore
    V(e, t.PASSWORD),
    // @ts-ignore
    V(e, t.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...s,
    ...e.headers
  }).filter(([, a]) => a != null).reduce((a, [l, u]) => ({
    ...a,
    [l]: String(u)
  }), {});
  if (X(i) && (n.Authorization = `Bearer ${i}`), X(o) && X(r)) {
    const a = pt(`${o}:${r}`);
    n.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? n["Content-Type"] = e.mediaType : ae(e.body) ? n["Content-Type"] = e.body.type || "application/octet-stream" : N(e.body) ? n["Content-Type"] = "text/plain" : Ce(e.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, mt = (t) => {
  var e, i;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (i = t.mediaType) != null && i.includes("+json") ? JSON.stringify(t.body) : N(t.body) || ae(t.body) || Ce(t.body) ? t.body : JSON.stringify(t.body);
}, kt = async (t, e, i, o, r, s, n) => {
  const a = new AbortController();
  let l = {
    headers: s,
    body: o ?? r,
    method: e.method,
    signal: a.signal
  };
  t.WITH_CREDENTIALS && (l.credentials = t.CREDENTIALS);
  for (const u of t.interceptors.request._fns)
    l = await u(l);
  return n(() => a.abort()), await fetch(i, l);
}, vt = (t, e) => {
  if (e) {
    const i = t.headers.get(e);
    if (N(i))
      return i;
  }
}, wt = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const i = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (i.some((o) => e.includes(o)))
          return await t.blob();
        if (e.includes("multipart/form-data"))
          return await t.formData();
        if (e.includes("text/"))
          return await t.text();
      }
    } catch (e) {
      console.error(e);
    }
}, Tt = (t, e) => {
  const o = {
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
  if (o)
    throw new ke(t, e, o);
  if (!e.ok) {
    const r = e.status ?? "unknown", s = e.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new ke(
      t,
      e,
      `Generic Error: status: ${r}; status text: ${s}; body: ${n}`
    );
  }
}, K = (t, e) => new ht(async (i, o, r) => {
  try {
    const s = bt(t, e), n = yt(e), a = mt(e), l = await _t(t, e);
    if (!r.isCancelled) {
      let u = await kt(t, e, s, a, n, l, r);
      for (const ze of t.interceptors.response._fns)
        u = await ze(u);
      const he = await wt(u), Je = vt(u, e.responseHeader);
      let pe = he;
      e.responseTransformer && u.ok && (pe = await e.responseTransformer(he));
      const fe = {
        url: s,
        ok: u.ok,
        status: u.status,
        statusText: u.statusText,
        body: Je ?? pe
      };
      Tt(e, fe), i(fe.body);
    }
  } catch (s) {
    o(s);
  }
});
class F {
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
    return K(R, {
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
    return K(R, {
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
    return K(R, {
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
    return K(R, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user does not have access to this resource"
      }
    });
  }
}
const ce = new nt("BlockPreviewContext");
var gt = Object.defineProperty, Et = Object.getOwnPropertyDescriptor, Ae = (t) => {
  throw TypeError(t);
}, _ = (t, e, i, o) => {
  for (var r = o > 1 ? void 0 : o ? Et(e, i) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (r = (o ? n(e, i, r) : n(r)) || r);
  return o && r && gt(e, i, r), r;
}, le = (t, e, i) => e.has(t) || Ae("Cannot " + i), v = (t, e, i) => (le(t, e, "read from private field"), e.get(t)), Y = (t, e, i) => e.has(t) ? Ae("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), xe = (t, e, i, o) => (le(t, e, "write to private field"), e.set(t, i), i), E = (t, e, i) => (le(t, e, "access private method"), i), b, G, m, Ue, Re, Pe, Se, Be, z, Oe, De, qe;
const Ct = "block-grid-preview";
let h = class extends ne {
  constructor() {
    super(), Y(this, m), Y(this, b), Y(this, G), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(ce, (t) => {
      xe(this, b, t), E(this, m, Ue).call(this);
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
      E(this, m, De).call(this);
    }, 500));
  }
  _filterLayouts(t) {
    if (!t || t.length === 0)
      return [];
    const e = t.filter((o) => o.contentKey === this._blockContext.contentUdi);
    return e.length > 0 ? e : t.flatMap((o) => o.areas || []).flatMap((o) => (o == null ? void 0 : o.items) || []).filter((o) => o && o.contentKey === this._blockContext.contentUdi);
  }
  _handleClick(t) {
    var s;
    let e = !0;
    const i = t.composedPath(), o = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && o.includes(n.tagName)).length > 0) {
      const n = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      n != null && n instanceof ge && (s = n.href) != null && s.includes("block/edit") && (e = !1), e && (t.preventDefault(), t.stopPropagation());
    }
  }
  render() {
    if (this._sortModeActive == !1) {
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
                        href=${oe(this._blockContext.workspaceEditContentPath)} 
                        @click=${this._handleClick}
                        aria-label="Edit block"
                        role="button"
                    >
                        ${re(this._htmlMarkup)}
                    </a>
                `;
    } else return A`<umb-block-grid-block
            class="umb-block-grid__block--view"
            .label=${this.label}
            .icon=${this.icon}
            .unpublished=${this.unpublished}
            .config=${this.config}
            .content=${this.content}
            .settings=${this.settingsData}>
            </umb-block-grid-block>
        `;
  }
};
b = /* @__PURE__ */ new WeakMap();
G = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
Ue = function() {
  E(this, m, Re).call(this), E(this, m, Pe).call(this), E(this, m, Se).call(this), E(this, m, Be).call(this);
};
Re = function() {
  var t;
  this.observe((t = v(this, b)) == null ? void 0 : t.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
Pe = function() {
  var t;
  this.observe((t = v(this, b)) == null ? void 0 : t.settings, (e) => {
    var i;
    (i = e == null ? void 0 : e.blockGrid) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = e.blockGrid.stylesheet);
  });
};
Se = function() {
  this.consumeContext(se, (t) => {
    this._blockContext.culture = t.getVariantId().culture ?? "";
  });
};
Be = async function() {
  this.getContext(Te).then((t) => {
    xe(this, G, t), this.observe(
      P([t.unique, t.contentTypeUnique]),
      async ([e, i]) => {
        var o, r;
        this._blockContext.unique = (e == null ? void 0 : e.toString()) ?? "", (o = v(this, b)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (r = v(this, b)) == null || r.setDocumentTypeUnique(this._blockContext.documentTypeUnique), E(this, m, z).call(this);
      }
    );
  }), v(this, G) == null && v(this, b) != null && this._blockContext.unique == "" && this.consumeContext(we, (t) => {
    this.observe(t.content.structure.contentTypeUniques, (e) => {
      var i;
      this._blockContext.unique = ((i = v(this, b)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = e[0] ?? "", E(this, m, z).call(this);
    });
  });
};
z = async function() {
  this.consumeContext(Ze, async (t) => {
    this.observe(
      P([
        t.contentKey,
        t.settingsKey,
        t.workspaceEditContentPath,
        t.contentElementTypeAlias,
        t.contentElementTypeKey
      ]),
      async ([
        e,
        i,
        o,
        r,
        s
      ]) => {
        this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = s ?? "", await E(this, m, Oe).call(this);
      }
    );
  });
};
Oe = async function() {
  this.consumeContext(et, (t) => {
    this.observe(
      P([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, i, o, r, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockGridValue = {
          contentData: (e == null ? void 0 : e.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (r == null ? void 0 : r.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: { "Umbraco.BlockGrid": this._filterLayouts(o) }
        }, this._blockContext.blockIndex = e.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
De = async function() {
  const t = this._blockContext;
  if (v(this, b) != null && t.unique == "" && (t.unique = v(this, b).getUnique()), v(this, b) != null && t.documentTypeUnique == "" && (t.documentTypeUnique = v(this, b).getDocumentTypeUnique()), !E(this, m, qe).call(this, t)) {
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
    }, { data: o } = await H(this, F.previewGridBlock(i));
    this._htmlMarkup = o ?? "", this._isLoading = !1;
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
qe = function(t) {
  return t.unique != "" && t.blockEditorAlias != "" && t.contentUdi != "" && t.contentElementTypeAlias != "";
};
h.styles = [
  te`
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
_([
  c({ attribute: !1 })
], h.prototype, "content", 2);
_([
  c({ attribute: !1 })
], h.prototype, "settingsData", 2);
_([
  c({ attribute: !1 })
], h.prototype, "contentKey", 2);
_([
  c({ attribute: !1 })
], h.prototype, "config", 2);
_([
  c({ attribute: !1 })
], h.prototype, "unpublished", 2);
_([
  c({ attribute: !1 })
], h.prototype, "icon", 2);
_([
  c({ attribute: !1 })
], h.prototype, "label", 2);
_([
  g()
], h.prototype, "_htmlMarkup", 2);
_([
  g()
], h.prototype, "_isLoading", 2);
_([
  g()
], h.prototype, "_error", 2);
_([
  g()
], h.prototype, "_sortModeActive", 2);
_([
  c({ attribute: !1 })
], h.prototype, "blockGridValue", 1);
h = _([
  ie(Ct)
], h);
var At = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, Me = (t) => {
  throw TypeError(t);
}, f = (t, e, i, o) => {
  for (var r = o > 1 ? void 0 : o ? xt(e, i) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (r = (o ? n(e, i, r) : n(r)) || r);
  return o && r && At(e, i, r), r;
}, ue = (t, e, i) => e.has(t) || Me("Cannot " + i), w = (t, e, i) => (ue(t, e, "read from private field"), e.get(t)), J = (t, e, i) => e.has(t) ? Me("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Le = (t, e, i, o) => (ue(t, e, "write to private field"), e.set(t, i), i), C = (t, e, i) => (ue(t, e, "access private method"), i), y, j, k, $e, Ie, Ne, Ve, Ke, Q, Ge, je, We;
const Ut = "block-list-preview";
let d = class extends ne {
  constructor() {
    super(), J(this, k), J(this, y), J(this, j), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(ce, (t) => {
      Le(this, y, t), C(this, k, $e).call(this);
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
      C(this, k, je).call(this);
    }, 500));
  }
  _handleClick(t) {
    var s;
    let e = !0;
    const i = t.composedPath(), o = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && o.includes(n.tagName)).length > 0) {
      const n = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      n != null && n instanceof ge && (s = n.href) != null && s.includes("block/edit") && (e = !1), e && (t.preventDefault(), t.stopPropagation());
    }
  }
  render() {
    if (this._sortModeActive == !1) {
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
                    href=${oe(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    role="button"
                >
                    ${re(this._htmlMarkup)}
                </a>
            `;
    } else return A`<umb-ref-list-block
            class="umb-block-grid__block--view"
            .label=${this.label}
            .icon=${this.icon}
            .unpublished=${this.unpublished}
            .config=${this.config}
            .content=${this.content}
            .settings=${this.settingsData}>
            </umb-ref-list-block>
        `;
  }
};
y = /* @__PURE__ */ new WeakMap();
j = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakSet();
$e = function() {
  C(this, k, Ie).call(this), C(this, k, Ne).call(this), C(this, k, Ve).call(this), C(this, k, Ke).call(this);
};
Ie = function() {
  var t;
  this.observe((t = w(this, y)) == null ? void 0 : t.sortModeActive, (e) => {
    e !== void 0 && (this._sortModeActive = e);
  });
};
Ne = function() {
  var t;
  this.observe((t = w(this, y)) == null ? void 0 : t.settings, (e) => {
    var i;
    (i = e == null ? void 0 : e.blockList) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = e.blockList.stylesheet);
  });
};
Ve = function() {
  this.consumeContext(se, async (t) => {
    this._blockContext.culture = t.getVariantId().culture ?? "";
  });
};
Ke = function() {
  this.getContext(Te).then((t) => {
    Le(this, j, t), this.observe(
      P([t.unique, t.contentTypeUnique]),
      async ([e, i]) => {
        var o, r;
        this._blockContext.unique = (e == null ? void 0 : e.toString()) ?? "", (o = w(this, y)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (r = w(this, y)) == null || r.setDocumentTypeUnique(this._blockContext.documentTypeUnique), C(this, k, Q).call(this);
      }
    );
  }), w(this, j) == null && w(this, y) != null && this._blockContext.unique == "" && this.consumeContext(we, (t) => {
    this.observe(t.content.structure.contentTypeUniques, (e) => {
      var i;
      this._blockContext.unique = ((i = w(this, y)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = e[0] ?? "", C(this, k, Q).call(this);
    });
  });
};
Q = function() {
  this.consumeContext(st, (t) => {
    this.observe(
      P([
        t.contentKey,
        t.settingsKey,
        t.workspaceEditContentPath,
        t.contentElementTypeAlias,
        t.contentElementTypeKey
      ]),
      async ([
        e,
        i,
        o,
        r,
        s
      ]) => {
        this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = s ?? "", await C(this, k, Ge).call(this);
      }
    );
  });
};
Ge = function() {
  this.consumeContext(at, (t) => {
    this.observe(
      P([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, i, o, r, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockListValue = {
          contentData: (e == null ? void 0 : e.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (r == null ? void 0 : r.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.BlockList": (o == null ? void 0 : o.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? []
          }
        }, this._blockContext.blockIndex = e == null ? void 0 : e.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
je = async function() {
  const t = this._blockContext;
  if (w(this, y) != null && t.unique == "" && (t.unique = w(this, y).getUnique()), w(this, y) != null && t.documentTypeUnique == "" && (t.documentTypeUnique = w(this, y).getDocumentTypeUnique()), !C(this, k, We).call(this, t)) {
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
    }, { data: o } = await H(this, F.previewListBlock(i));
    this._htmlMarkup = o ?? "", this._isLoading = !1;
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
We = function(t) {
  return t.unique != "" && t.blockEditorAlias != "" && t.contentUdi != "" && t.contentElementTypeAlias != "";
};
d.styles = [
  te`
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
f([
  c({ attribute: !1 })
], d.prototype, "content", 2);
f([
  c({ attribute: !1 })
], d.prototype, "settingsData", 2);
f([
  c({ attribute: !1 })
], d.prototype, "contentKey", 2);
f([
  c({ attribute: !1 })
], d.prototype, "config", 2);
f([
  c({ attribute: !1 })
], d.prototype, "unpublished", 2);
f([
  c({ attribute: !1 })
], d.prototype, "icon", 2);
f([
  c({ attribute: !1 })
], d.prototype, "label", 2);
f([
  g()
], d.prototype, "_htmlMarkup", 2);
f([
  g()
], d.prototype, "_isLoading", 2);
f([
  g()
], d.prototype, "_error", 2);
f([
  g()
], d.prototype, "_sortModeActive", 2);
f([
  g()
], d.prototype, "_blockListValue", 2);
f([
  c({ attribute: !1 })
], d.prototype, "blockListValue", 1);
d = f([
  ie(Ut)
], d);
var Rt = Object.defineProperty, Pt = Object.getOwnPropertyDescriptor, He = (t) => {
  throw TypeError(t);
}, S = (t, e, i, o) => {
  for (var r = o > 1 ? void 0 : o ? Pt(e, i) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (r = (o ? n(e, i, r) : n(r)) || r);
  return o && r && Rt(e, i, r), r;
}, St = (t, e, i) => e.has(t) || He("Cannot " + i), Bt = (t, e, i) => e.has(t) ? He("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), W = (t, e, i) => (St(t, e, "access private method"), i), q, Fe, Xe, de;
const Ot = "rich-text-preview";
let T = class extends ne {
  constructor() {
    var t;
    super(), Bt(this, q), this.htmlMarkup = "", this.unique = "", this.documentTypeUnique = "", this.blockEditorAlias = "", this.culture = "", this._blockRteValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, this.consumeContext(se, async (e) => {
      this.culture = e.getVariantId().culture ?? "";
    }), this.unique = (t = window.location.pathname.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)) == null ? void 0 : t[0], W(this, q, Fe).call(this);
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
      W(this, q, de).call(this);
    }, 500));
  }
  render() {
    if (this.htmlMarkup !== "")
      return A`
                <a href=${oe(this.workspaceEditContentPath)}>
                    ${re(this.htmlMarkup)}
                </a>`;
  }
};
q = /* @__PURE__ */ new WeakSet();
Fe = function() {
  this.consumeContext(rt, (t) => {
    this.observe(
      P([t.alias, t.value]),
      async ([e, i]) => {
        this.blockEditorAlias = e, i.hasOwnProperty("blocks") && (i.blocks.length !== 0 && (this.blockRteValue = {
          ...this.blockRteValue,
          contentData: i.blocks.contentData,
          settingsData: i.blocks.settingsData,
          expose: i.blocks.expose,
          layout: i.blocks.layout
        }), W(this, q, Xe).call(this));
      }
    );
  });
};
Xe = function() {
  this.consumeContext(lt, (t) => {
    this.observe(
      P([t.workspaceEditContentPath, t.contentElementTypeAlias]),
      async ([e, i]) => {
        this.contentElementTypeAlias = i, this.workspaceEditContentPath = e, await W(this, q, de).call(this);
      }
    );
  });
};
de = async function() {
  if (!this.unique || !this.blockEditorAlias || !this.contentElementTypeAlias || !this.blockRteValue.contentData || !this.blockRteValue.layout) return;
  const t = {
    blockEditorAlias: this.blockEditorAlias,
    nodeKey: this.unique,
    contentElementAlias: this.contentElementTypeAlias,
    culture: this.culture,
    requestBody: JSON.stringify(this.blockRteValue)
  }, { data: e } = await H(this, F.previewRichTextMarkup(t));
  e && (this.htmlMarkup = e);
};
T.styles = [
  te`
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
  c({ attribute: !1 })
], T.prototype, "content", 2);
S([
  c({ attribute: !1 })
], T.prototype, "settingsData", 2);
S([
  c({ attribute: !1 })
], T.prototype, "contentKey", 2);
S([
  c({ attribute: !1 })
], T.prototype, "config", 2);
S([
  g()
], T.prototype, "htmlMarkup", 2);
S([
  g()
], T.prototype, "_blockRteValue", 2);
S([
  c({ attribute: !1 })
], T.prototype, "blockRteValue", 1);
T = S([
  ie(Ot)
], T);
var L, M, B, O, D;
class Z extends Ee {
  constructor(i) {
    super(i);
    x(this, L);
    x(this, M);
    x(this, B);
    x(this, O);
    x(this, D);
    U(this, M, new it(void 0)), this.settings = p(this, M).asObservable(), U(this, B, new _e("")), this.unique = p(this, B).asObservable(), U(this, O, new _e("")), this.documentTypeUnique = p(this, O).asObservable(), U(this, D, new ot(!1)), this.sortModeActive = p(this, D).asObservable(), U(this, L, new Ye(i)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const i = await p(this, L).getSettings();
    p(this, M).setValue(i);
  }
  getUnique() {
    return p(this, B).getValue();
  }
  async setUnique(i) {
    i != "" && p(this, B).setValue(i);
  }
  getDocumentTypeUnique() {
    return p(this, O).getValue();
  }
  async setDocumentTypeUnique(i) {
    i != "" && p(this, O).setValue(i);
  }
  getSortMode() {
    return p(this, D).getValue();
  }
  async setSortMode(i) {
    p(this, D).setValue(i);
  }
}
L = new WeakMap(), M = new WeakMap(), B = new WeakMap(), O = new WeakMap(), D = new WeakMap();
const Dt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: Z,
  default: Z
}, Symbol.toStringTag, { value: "Module" })), qt = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => Dt)
  }
], Mt = [...qt], ee = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...ut.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action-B-dW03Y7.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, Lt = [
  ee
], $t = [
  {
    ...ee.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode-D5RH43u3.js"),
    forPropertyEditorUis: [tt],
    conditions: [
      {
        alias: me
      }
    ]
  },
  {
    ...ee.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.List.SortMode",
    name: "Block List Sort Mode Property Action",
    api: () => import("./block-list-sort-mode-DhqRrEJE.js"),
    forPropertyEditorUis: [ct],
    conditions: [
      {
        alias: me
      }
    ]
  }
];
var $;
class It {
  constructor(e) {
    x(this, $);
    U(this, $, e);
  }
  async getSettings() {
    return await H(p(this, $), F.getSettings());
  }
}
$ = new WeakMap();
var I;
class Ye extends Ee {
  constructor(i) {
    super(i);
    x(this, I);
    U(this, I, new It(i));
  }
  async getSettings() {
    const i = await p(this, I).getSettings();
    if (i && (i != null && i.data))
      return i.data;
  }
}
I = new WeakMap();
const ii = async (t, e) => {
  var s, n, a;
  const o = await new Ye(t).getSettings();
  let r = [];
  if (o) {
    if (o.blockGrid.enabled) {
      let l = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.GridCustomView",
        name: "BlockPreview Grid Custom View",
        element: h,
        forBlockEditor: "block-grid"
      };
      ((s = o.blockGrid.contentTypes) == null ? void 0 : s.length) !== 0 && (l.forContentTypeAlias = o.blockGrid.contentTypes), r.push(l);
    }
    if (o.blockList.enabled) {
      let l = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.ListCustomView",
        name: "BlockPreview List Custom View",
        element: d,
        forBlockEditor: "block-list"
      };
      ((n = o.blockList.contentTypes) == null ? void 0 : n.length) !== 0 && (l.forContentTypeAlias = o.blockList.contentTypes), r.push(l);
    }
    if (o.richText.enabled) {
      let l = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.RichTextCustomView",
        name: "BlockPreview Rich Text Custom View",
        element: T,
        forBlockEditor: "block-rte"
      };
      ((a = o.richText.contentTypes) == null ? void 0 : a.length) !== 0 && (l.forContentTypeAlias = o.richText.contentTypes), r.push(l);
    }
  }
  e.registerMany([
    ...r,
    ...Mt,
    ...Lt,
    ...$t
  ]), t.provideContext(ce, new Z(t)), t.consumeContext(Qe, async (l) => {
    if (!l) return;
    const u = l.getOpenApiConfiguration();
    R.BASE = u.base, R.TOKEN = u.token, R.WITH_CREDENTIALS = u.withCredentials, R.CREDENTIALS = u.credentials;
  });
};
export {
  ce as B,
  T as R,
  It as S,
  h as a,
  d as b,
  Ye as c,
  ii as o
};
//# sourceMappingURL=index-D7KHVidI.js.map

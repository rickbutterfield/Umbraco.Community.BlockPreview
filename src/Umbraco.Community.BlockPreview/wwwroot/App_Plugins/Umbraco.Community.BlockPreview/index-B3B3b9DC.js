var Ce = (e) => {
  throw TypeError(e);
};
var Te = (e, t, i) => t.has(e) || Ce("Cannot " + i);
var p = (e, t, i) => (Te(e, t, "read from private field"), i ? i.call(e) : t.get(e)), q = (e, t, i) => t.has(e) ? Ce("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), O = (e, t, i, o) => (Te(e, t, "write to private field"), o ? o.call(e, i) : t.set(e, i), i);
import { UMB_AUTH_CONTEXT as lt } from "@umbraco-cms/backoffice/auth";
import { UMB_BLOCK_WORKSPACE_CONTEXT as ae } from "@umbraco-cms/backoffice/block";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as ut, UMB_BLOCK_GRID_MANAGER_CONTEXT as ht, UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS as dt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as ce } from "@umbraco-cms/backoffice/document";
import { css as le, property as c, state as m, customElement as ue, html as E, ifDefined as he, unsafeHTML as de } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as pe } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple as S, UmbObjectState as pt, UmbStringState as Ee, UmbBooleanState as ft } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT as fe, UMB_WRITABLE_PROPERTY_CONDITION_ALIAS as xe } from "@umbraco-cms/backoffice/property";
import { tryExecuteAndNotify as Y } from "@umbraco-cms/backoffice/resources";
import { UmbContextToken as _t } from "@umbraco-cms/backoffice/context-api";
import { UUIButtonElement as _e } from "@umbraco-cms/backoffice/external/uui";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as bt, UMB_BLOCK_LIST_MANAGER_CONTEXT as yt, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as mt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as kt, UMB_BLOCK_RTE_MANAGER_CONTEXT as vt } from "@umbraco-cms/backoffice/block-rte";
import { UmbControllerBase as Re } from "@umbraco-cms/backoffice/class-api";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST as gt } from "@umbraco-cms/backoffice/property-action";
class Ae extends Error {
  constructor(t, i, o) {
    super(o), this.name = "ApiError", this.url = i.url, this.status = i.status, this.statusText = i.statusText, this.body = i.body, this.request = t;
  }
}
class wt extends Error {
  constructor(t) {
    super(t), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class Ct {
  constructor(t) {
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
      }), t(r, s, n);
    });
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(t, i) {
    return this.promise.then(t, i);
  }
  catch(t) {
    return this.promise.catch(t);
  }
  finally(t) {
    return this.promise.finally(t);
  }
  cancel() {
    if (!(this._isResolved || this._isRejected || this._isCancelled)) {
      if (this._isCancelled = !0, this.cancelHandlers.length)
        try {
          for (const t of this.cancelHandlers)
            t();
        } catch (t) {
          console.warn("Cancellation threw an error", t);
          return;
        }
      this.cancelHandlers.length = 0, this._reject && this._reject(new wt("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
class Ue {
  constructor() {
    this._fns = [];
  }
  eject(t) {
    const i = this._fns.indexOf(t);
    i !== -1 && (this._fns = [...this._fns.slice(0, i), ...this._fns.slice(i + 1)]);
  }
  use(t) {
    this._fns = [...this._fns, t];
  }
}
const L = {
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
    request: new Ue(),
    response: new Ue()
  }
}, G = (e) => typeof e == "string", Q = (e) => G(e) && e !== "", be = (e) => e instanceof Blob, Be = (e) => e instanceof FormData, Tt = (e) => {
  try {
    return btoa(e);
  } catch {
    return Buffer.from(e).toString("base64");
  }
}, Et = (e) => {
  const t = [], i = (r, s) => {
    t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(s))}`);
  }, o = (r, s) => {
    s != null && (s instanceof Date ? i(r, s.toISOString()) : Array.isArray(s) ? s.forEach((n) => o(r, n)) : typeof s == "object" ? Object.entries(s).forEach(([n, a]) => o(`${r}[${n}]`, a)) : i(r, s));
  };
  return Object.entries(e).forEach(([r, s]) => o(r, s)), t.length ? `?${t.join("&")}` : "";
}, xt = (e, t) => {
  const i = encodeURI, o = t.url.replace("{api-version}", e.VERSION).replace(/{(.*?)}/g, (s, n) => {
    var a;
    return (a = t.path) != null && a.hasOwnProperty(n) ? i(String(t.path[n])) : s;
  }), r = e.BASE + o;
  return t.query ? r + Et(t.query) : r;
}, At = (e) => {
  if (e.formData) {
    const t = new FormData(), i = (o, r) => {
      G(r) || be(r) ? t.append(o, r) : t.append(o, JSON.stringify(r));
    };
    return Object.entries(e.formData).filter(([, o]) => o != null).forEach(([o, r]) => {
      Array.isArray(r) ? r.forEach((s) => i(o, s)) : i(o, r);
    }), t;
  }
}, j = async (e, t) => typeof t == "function" ? t(e) : t, Ut = async (e, t) => {
  const [i, o, r, s] = await Promise.all([
    // @ts-ignore
    j(t, e.TOKEN),
    // @ts-ignore
    j(t, e.USERNAME),
    // @ts-ignore
    j(t, e.PASSWORD),
    // @ts-ignore
    j(t, e.HEADERS)
  ]), n = Object.entries({
    Accept: "application/json",
    ...s,
    ...t.headers
  }).filter(([, a]) => a != null).reduce((a, [l, u]) => ({
    ...a,
    [l]: String(u)
  }), {});
  if (Q(i) && (n.Authorization = `Bearer ${i}`), Q(o) && Q(r)) {
    const a = Tt(`${o}:${r}`);
    n.Authorization = `Basic ${a}`;
  }
  return t.body !== void 0 && (t.mediaType ? n["Content-Type"] = t.mediaType : be(t.body) ? n["Content-Type"] = t.body.type || "application/octet-stream" : G(t.body) ? n["Content-Type"] = "text/plain" : Be(t.body) || (n["Content-Type"] = "application/json")), new Headers(n);
}, Rt = (e) => {
  var t, i;
  if (e.body !== void 0)
    return (t = e.mediaType) != null && t.includes("application/json") || (i = e.mediaType) != null && i.includes("+json") ? JSON.stringify(e.body) : G(e.body) || be(e.body) || Be(e.body) ? e.body : JSON.stringify(e.body);
}, Bt = async (e, t, i, o, r, s, n) => {
  const a = new AbortController();
  let l = {
    headers: s,
    body: o ?? r,
    method: t.method,
    signal: a.signal
  };
  e.WITH_CREDENTIALS && (l.credentials = e.CREDENTIALS);
  for (const u of e.interceptors.request._fns)
    l = await u(l);
  return n(() => a.abort()), await fetch(i, l);
}, Pt = (e, t) => {
  if (t) {
    const i = e.headers.get(t);
    if (G(i))
      return i;
  }
}, St = async (e) => {
  if (e.status !== 204)
    try {
      const t = e.headers.get("Content-Type");
      if (t) {
        const i = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (t.includes("application/json") || t.includes("+json"))
          return await e.json();
        if (i.some((o) => t.includes(o)))
          return await e.blob();
        if (t.includes("multipart/form-data"))
          return await e.formData();
        if (t.includes("text/"))
          return await e.text();
      }
    } catch (t) {
      console.error(t);
    }
}, qt = (e, t) => {
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
    ...e.errors
  }[t.status];
  if (o)
    throw new Ae(e, t, o);
  if (!t.ok) {
    const r = t.status ?? "unknown", s = t.statusText ?? "unknown", n = (() => {
      try {
        return JSON.stringify(t.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new Ae(
      e,
      t,
      `Generic Error: status: ${r}; status text: ${s}; body: ${n}`
    );
  }
}, W = (e, t) => new Ct(async (i, o, r) => {
  try {
    const s = xt(e, t), n = At(t), a = Rt(t), l = await Ut(e, t);
    if (!r.isCancelled) {
      let u = await Bt(e, t, s, a, n, l, r);
      for (const ct of e.interceptors.response._fns)
        u = await ct(u);
      const ve = await St(u), at = Pt(u, t.responseHeader);
      let ge = ve;
      t.responseTransformer && u.ok && (ge = await t.responseTransformer(ve));
      const we = {
        url: s,
        ok: u.ok,
        status: u.status,
        statusText: u.statusText,
        body: at ?? ge
      };
      qt(t, we), i(we.body);
    }
  } catch (s) {
    o(s);
  }
});
class J {
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
  static previewGridBlock(t = {}) {
    return W(L, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/grid",
      query: {
        nodeKey: t.nodeKey,
        blockEditorAlias: t.blockEditorAlias,
        contentElementAlias: t.contentElementAlias,
        culture: t.culture,
        documentTypeUnique: t.documentTypeUnique,
        contentUdi: t.contentUdi,
        settingsUdi: t.settingsUdi,
        blockIndex: t.blockIndex
      },
      body: t.requestBody,
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
  static previewListBlock(t = {}) {
    return W(L, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/list",
      query: {
        nodeKey: t.nodeKey,
        blockEditorAlias: t.blockEditorAlias,
        contentElementAlias: t.contentElementAlias,
        culture: t.culture,
        documentTypeUnique: t.documentTypeUnique,
        contentUdi: t.contentUdi,
        settingsUdi: t.settingsUdi,
        blockIndex: t.blockIndex
      },
      body: t.requestBody,
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
  static previewRichTextMarkup(t = {}) {
    return W(L, {
      method: "POST",
      url: "/umbraco/management/api/v1/block-preview/preview/rte",
      query: {
        nodeKey: t.nodeKey,
        blockEditorAlias: t.blockEditorAlias,
        contentElementAlias: t.contentElementAlias,
        culture: t.culture,
        documentTypeUnique: t.documentTypeUnique
      },
      body: t.requestBody,
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
    return W(L, {
      method: "GET",
      url: "/umbraco/management/api/v1/block-preview/settings",
      errors: {
        403: "The authenticated user does not have access to this resource"
      }
    });
  }
}
const z = new _t("BlockPreviewContext");
var Ot = Object.defineProperty, Lt = Object.getOwnPropertyDescriptor, Pe = (e) => {
  throw TypeError(e);
}, k = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? Lt(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (r = (o ? n(t, i, r) : n(r)) || r);
  return o && r && Ot(t, i, r), r;
}, ye = (e, t, i) => t.has(e) || Pe("Cannot " + i), C = (e, t, i) => (ye(e, t, "read from private field"), t.get(e)), Z = (e, t, i) => t.has(e) ? Pe("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Se = (e, t, i, o) => (ye(e, t, "write to private field"), t.set(e, i), i), U = (e, t, i) => (ye(e, t, "access private method"), i), _, H, v, qe, Oe, Le, Me, De, ie, $e, Ne, Ie;
const Mt = "block-grid-preview";
let d = class extends pe {
  constructor() {
    super(), Z(this, v), Z(this, _), Z(this, H), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(z, (e) => {
      Se(this, _, e), U(this, v, qe).call(this);
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
      U(this, v, Ne).call(this);
    }, 500));
  }
  _filterLayouts(e) {
    if (!e || e.length === 0)
      return [];
    const t = e.filter((o) => o.contentKey === this._blockContext.contentUdi);
    return t.length > 0 ? t : e.flatMap((o) => o.areas || []).flatMap((o) => (o == null ? void 0 : o.items) || []).filter((o) => o && o.contentKey === this._blockContext.contentUdi);
  }
  _handleClick(e) {
    var s;
    let t = !0;
    const i = e.composedPath(), o = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && o.includes(n.tagName)).length > 0) {
      const n = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      n != null && n instanceof _e && (s = n.href) != null && s.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return E`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return E`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
      if (this._htmlMarkup)
        return E`
                    ${this._styleElement}
                    <a
                        href=${he(this._blockContext.workspaceEditContentPath)} 
                        @click=${this._handleClick}
                        aria-label="Edit block"
                        class="block-preview-edit"
                        role="button"
                    >
                        ${de(this._htmlMarkup)}
                    </a>
                `;
    } else return E`<umb-block-grid-block
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
_ = /* @__PURE__ */ new WeakMap();
H = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakSet();
qe = function() {
  U(this, v, Oe).call(this), U(this, v, Le).call(this), U(this, v, Me).call(this), U(this, v, De).call(this);
};
Oe = function() {
  var e;
  this.observe((e = C(this, _)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
Le = function() {
  var e;
  this.observe((e = C(this, _)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.blockGrid) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.blockGrid.stylesheet);
  });
};
Me = function() {
  this.consumeContext(fe, (e) => {
    this._blockContext.culture = e.getVariantId().culture ?? "";
  });
};
De = async function() {
  this.getContext(ce).then((e) => {
    Se(this, H, e), this.observe(
      S([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var o, r;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (o = C(this, _)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (r = C(this, _)) == null || r.setDocumentTypeUnique(this._blockContext.documentTypeUnique), U(this, v, ie).call(this);
      }
    );
  }), C(this, H) == null && C(this, _) != null && this._blockContext.unique == "" && this.consumeContext(ae, (e) => {
    this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = C(this, _)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", U(this, v, ie).call(this);
    });
  });
};
ie = async function() {
  this.consumeContext(ut, async (e) => {
    this.observe(
      S([
        e.contentKey,
        e.settingsKey,
        e.workspaceEditContentPath,
        e.contentElementTypeAlias,
        e.contentElementTypeKey
      ]),
      async ([
        t,
        i,
        o,
        r,
        s
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = s ?? "", await U(this, v, $e).call(this);
      }
    );
  });
};
$e = async function() {
  this.consumeContext(ht, (e) => {
    this.observe(
      S([
        e.contents,
        e.settings,
        e.layouts,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, i, o, r, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockGridValue = {
          contentData: (t == null ? void 0 : t.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (r == null ? void 0 : r.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: { "Umbraco.BlockGrid": this._filterLayouts(o) }
        }, this._blockContext.blockIndex = t.indexOf(this.blockGridValue.contentData[0]);
      }
    );
  });
};
Ne = async function() {
  const e = this._blockContext;
  if (C(this, _) != null && e.unique == "" && (e.unique = C(this, _).getUnique()), C(this, _) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = C(this, _).getDocumentTypeUnique()), !U(this, v, Ie).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await Y(this, J.previewGridBlock({
      requestBody: JSON.stringify(this.blockGridValue),
      blockEditorAlias: e.blockEditorAlias,
      nodeKey: e.unique,
      contentElementAlias: e.contentElementTypeAlias,
      documentTypeUnique: e.documentTypeUnique,
      contentUdi: e.contentUdi,
      settingsUdi: e.settingsUdi,
      culture: e.culture,
      blockIndex: e.blockIndex
    }));
    debugger;
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = o.message ?? "An error occurred while fetching block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Ie = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
d.styles = [
  le`
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
k([
  c({ attribute: !1 })
], d.prototype, "content", 2);
k([
  c({ attribute: !1 })
], d.prototype, "settings", 2);
k([
  c({ attribute: !1 })
], d.prototype, "contentKey", 2);
k([
  c({ attribute: !1 })
], d.prototype, "config", 2);
k([
  c({ attribute: !1 })
], d.prototype, "unpublished", 2);
k([
  c({ attribute: !1 })
], d.prototype, "icon", 2);
k([
  c({ attribute: !1 })
], d.prototype, "label", 2);
k([
  m()
], d.prototype, "_htmlMarkup", 2);
k([
  m()
], d.prototype, "_isLoading", 2);
k([
  m()
], d.prototype, "_error", 2);
k([
  m()
], d.prototype, "_sortModeActive", 2);
k([
  c({ attribute: !1 })
], d.prototype, "blockGridValue", 1);
d = k([
  ue(Mt)
], d);
var Dt = Object.defineProperty, $t = Object.getOwnPropertyDescriptor, Ke = (e) => {
  throw TypeError(e);
}, f = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? $t(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (r = (o ? n(t, i, r) : n(r)) || r);
  return o && r && Dt(t, i, r), r;
}, me = (e, t, i) => t.has(e) || Ke("Cannot " + i), T = (e, t, i) => (me(e, t, "read from private field"), t.get(e)), ee = (e, t, i) => t.has(e) ? Ke("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Ve = (e, t, i, o) => (me(e, t, "write to private field"), t.set(e, i), i), R = (e, t, i) => (me(e, t, "access private method"), i), b, F, g, Ge, je, We, He, Fe, oe, Xe, Ye, Je;
const Nt = "block-list-preview";
let h = class extends pe {
  constructor() {
    super(), ee(this, g), ee(this, b), ee(this, F), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._sortModeActive = !1, this._blockContext = {
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
    }, this.consumeContext(z, (e) => {
      Ve(this, b, e), R(this, g, Ge).call(this);
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
      R(this, g, Ye).call(this);
    }, 500));
  }
  _handleClick(e) {
    var s;
    let t = !0;
    const i = e.composedPath(), o = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && o.includes(n.tagName)).length > 0) {
      const n = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      n != null && n instanceof _e && (s = n.href) != null && s.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._sortModeActive === !1) {
      if (this._isLoading)
        return E`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
      if (this._error)
        return E`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
      if (this._htmlMarkup)
        return E`
                ${this._styleElement}
                <a 
                    href=${he(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${de(this._htmlMarkup)}
                </a>
            `;
    } else return E`<umb-ref-list-block
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
b = /* @__PURE__ */ new WeakMap();
F = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakSet();
Ge = function() {
  R(this, g, je).call(this), R(this, g, We).call(this), R(this, g, He).call(this), R(this, g, Fe).call(this);
};
je = function() {
  var e;
  this.observe((e = T(this, b)) == null ? void 0 : e.sortModeActive, (t) => {
    t !== void 0 && (this._sortModeActive = t);
  });
};
We = function() {
  var e;
  this.observe((e = T(this, b)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.blockList) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.blockList.stylesheet);
  });
};
He = function() {
  this.consumeContext(fe, async (e) => {
    this._blockContext.culture = e.getVariantId().culture ?? "";
  });
};
Fe = function() {
  this.getContext(ce).then((e) => {
    Ve(this, F, e), this.observe(
      S([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var o, r;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (o = T(this, b)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (r = T(this, b)) == null || r.setDocumentTypeUnique(this._blockContext.documentTypeUnique), R(this, g, oe).call(this);
      }
    );
  }), T(this, F) == null && T(this, b) != null && this._blockContext.unique == "" && this.consumeContext(ae, (e) => {
    this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = T(this, b)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", R(this, g, oe).call(this);
    });
  });
};
oe = function() {
  this.consumeContext(bt, (e) => {
    this.observe(
      S([
        e.contentKey,
        e.settingsKey,
        e.workspaceEditContentPath,
        e.contentElementTypeAlias,
        e.contentElementTypeKey
      ]),
      async ([
        t,
        i,
        o,
        r,
        s
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = s ?? "", await R(this, g, Xe).call(this);
      }
    );
  });
};
Xe = function() {
  this.consumeContext(yt, (e) => {
    this.observe(
      S([
        e.contents,
        e.settings,
        e.layouts,
        e.exposes,
        e.propertyAlias
      ]),
      async ([t, i, o, r, s]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockListValue = {
          contentData: (t == null ? void 0 : t.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (r == null ? void 0 : r.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.BlockList": (o == null ? void 0 : o.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? []
          }
        }, this._blockContext.blockIndex = t == null ? void 0 : t.indexOf(this.blockListValue.contentData[0]);
      }
    );
  });
};
Ye = async function() {
  const e = this._blockContext;
  if (T(this, b) != null && e.unique == "" && (e.unique = T(this, b).getUnique()), T(this, b) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = T(this, b).getDocumentTypeUnique()), !R(this, g, Je).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await Y(this, J.previewListBlock({
      requestBody: JSON.stringify(this.blockListValue),
      blockEditorAlias: e.blockEditorAlias,
      nodeKey: e.unique,
      contentElementAlias: e.contentElementTypeAlias,
      documentTypeUnique: e.documentTypeUnique,
      contentUdi: e.contentUdi,
      settingsUdi: e.settingsUdi,
      culture: e.culture,
      blockIndex: e.blockIndex
    }));
    debugger;
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = o.message ?? "An error occurred while fetching block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
Je = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentUdi != "" && e.contentElementTypeAlias != "";
};
h.styles = [
  le`
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
f([
  c({ attribute: !1 })
], h.prototype, "content", 2);
f([
  c({ attribute: !1 })
], h.prototype, "settings", 2);
f([
  c({ attribute: !1 })
], h.prototype, "contentKey", 2);
f([
  c({ attribute: !1 })
], h.prototype, "config", 2);
f([
  c({ attribute: !1 })
], h.prototype, "unpublished", 2);
f([
  c({ attribute: !1 })
], h.prototype, "icon", 2);
f([
  c({ attribute: !1 })
], h.prototype, "label", 2);
f([
  m()
], h.prototype, "_htmlMarkup", 2);
f([
  m()
], h.prototype, "_isLoading", 2);
f([
  m()
], h.prototype, "_error", 2);
f([
  m()
], h.prototype, "_sortModeActive", 2);
f([
  m()
], h.prototype, "_blockListValue", 2);
f([
  c({ attribute: !1 })
], h.prototype, "blockListValue", 1);
h = f([
  ue(Nt)
], h);
var It = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, ze = (e) => {
  throw TypeError(e);
}, B = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? Kt(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (r = (o ? n(t, i, r) : n(r)) || r);
  return o && r && It(t, i, r), r;
}, ke = (e, t, i) => t.has(e) || ze("Cannot " + i), A = (e, t, i) => (ke(e, t, "read from private field"), t.get(e)), te = (e, t, i) => t.has(e) ? ze("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qe = (e, t, i, o) => (ke(e, t, "write to private field"), t.set(e, i), i), P = (e, t, i) => (ke(e, t, "access private method"), i), w, X, x, Ze, et, tt, it, re, ot, rt, nt;
const Vt = "rich-text-preview";
let y = class extends pe {
  constructor() {
    super(), te(this, x), te(this, w), te(this, X), this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._blockContext = {
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
    }, this.consumeContext(z, (e) => {
      Qe(this, w, e), P(this, x, Ze).call(this);
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
      P(this, x, rt).call(this);
    }, 500));
  }
  _handleClick(e) {
    var s;
    let t = !0;
    const i = e.composedPath(), o = [
      "UUI-ACTION-BAR",
      "UMB-BLOCK-SCALE-HANDLER"
    ];
    if (i.filter((n) => n instanceof Element && o.includes(n.tagName)).length > 0) {
      const n = i.find((a) => a instanceof Element && a.tagName === "UUI-BUTTON");
      n != null && n instanceof _e && (s = n.href) != null && s.includes("block/edit") && (t = !1), t && (e.preventDefault(), e.stopPropagation());
    }
  }
  render() {
    if (this._isLoading)
      return E`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
    if (this._error)
      return E`
                <div class="preview-alert preview-alert-error" role="alert">
                    ${this._error}
                </div>
            `;
    if (this._htmlMarkup)
      return E`
                ${this._styleElement}
                <a
                    href=${he(this._blockContext.workspaceEditContentPath)}
                    @click=${this._handleClick}
                    aria-label="Edit block"
                    class="block-preview-edit"
                    role="button"
                >
                    ${de(this._htmlMarkup)}
                </a>`;
  }
};
w = /* @__PURE__ */ new WeakMap();
X = /* @__PURE__ */ new WeakMap();
x = /* @__PURE__ */ new WeakSet();
Ze = function() {
  P(this, x, et).call(this), P(this, x, tt).call(this), P(this, x, it).call(this);
};
et = function() {
  var e;
  this.observe((e = A(this, w)) == null ? void 0 : e.settings, (t) => {
    var i;
    (i = t == null ? void 0 : t.richText) != null && i.stylesheet && (this._styleElement = document.createElement("link"), this._styleElement.rel = "stylesheet", this._styleElement.href = t.richText.stylesheet);
  });
};
tt = function() {
  this.consumeContext(fe, async (e) => {
    e && (this._blockContext.culture = e.getVariantId().culture ?? "");
  });
};
it = function() {
  this.consumeContext(ce, (e) => {
    e && (Qe(this, X, e), this.observe(
      S([e.unique, e.contentTypeUnique]),
      async ([t, i]) => {
        var o, r;
        this._blockContext.unique = (t == null ? void 0 : t.toString()) ?? "", (o = A(this, w)) == null || o.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = i ?? "", (r = A(this, w)) == null || r.setDocumentTypeUnique(this._blockContext.documentTypeUnique), P(this, x, re).call(this);
      }
    ));
  }), A(this, X) == null && A(this, w) != null && this._blockContext.unique == "" && this.consumeContext(ae, (e) => {
    e && this.observe(e.content.structure.contentTypeUniques, (t) => {
      var i;
      this._blockContext.unique = ((i = A(this, w)) == null ? void 0 : i.getUnique()) ?? "", this._blockContext.documentTypeUnique = t[0] ?? "", P(this, x, re).call(this);
    });
  });
};
re = function() {
  this.consumeContext(kt, (e) => {
    this.observe(
      S([
        e.contentKey,
        e.settingsKey,
        e.workspaceEditContentPath,
        e.contentElementTypeAlias,
        e.contentElementTypeKey
      ]),
      async ([
        t,
        i,
        o,
        r,
        s
      ]) => {
        this._blockContext.contentUdi = t ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = r ?? "", this._blockContext.contentElementTypeKey = s ?? "", await P(this, x, ot).call(this);
      }
    );
  });
};
ot = function() {
  this.consumeContext(vt, (e) => {
    this.observe(
      S([
        e.contents,
        e.settings,
        e.layouts,
        e.exposes,
        e.propertyAlias
      ]),
      async ([
        t,
        i,
        o,
        r,
        s
      ]) => {
        this._blockContext.blockEditorAlias = s ?? "", this.blockRteValue = {
          contentData: (t == null ? void 0 : t.filter((n) => n.key == this._blockContext.contentUdi)) ?? [],
          settingsData: (i == null ? void 0 : i.filter((n) => n.key == this._blockContext.settingsUdi)) ?? [],
          expose: (r == null ? void 0 : r.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? [],
          layout: {
            "Umbraco.RichText": (o == null ? void 0 : o.filter((n) => n.contentKey == this._blockContext.contentUdi)) ?? []
          }
        };
      }
    );
  });
};
rt = async function() {
  const e = this._blockContext;
  if (A(this, w) != null && e.unique == "" && (e.unique = A(this, w).getUnique()), A(this, w) != null && e.documentTypeUnique == "" && (e.documentTypeUnique = A(this, w).getDocumentTypeUnique()), !P(this, x, nt).call(this, e)) {
    this._error = "Insufficient data for block preview", this._isLoading = !1;
    return;
  }
  this._isLoading = !0, this._error = null;
  try {
    const { data: i, error: o } = await Y(this, J.previewRichTextMarkup({
      requestBody: JSON.stringify(this.blockRteValue),
      blockEditorAlias: this._blockContext.blockEditorAlias,
      nodeKey: this._blockContext.unique,
      contentElementAlias: this._blockContext.contentElementTypeAlias,
      culture: this._blockContext.culture
    }));
    debugger;
    i ? (this._htmlMarkup = i ?? "", this._isLoading = !1) : o && (this._error = o.message ?? "An error occurred while fetching block preview", this._isLoading = !1);
  } catch (i) {
    this._error = "Failed to render block preview", this._isLoading = !1, console.error("Block preview error:", i);
  }
};
nt = function(e) {
  return e.unique != "" && e.blockEditorAlias != "" && e.contentElementTypeAlias != "";
};
y.styles = [
  le`
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
B([
  c({ attribute: !1 })
], y.prototype, "content", 2);
B([
  c({ attribute: !1 })
], y.prototype, "settings", 2);
B([
  c({ attribute: !1 })
], y.prototype, "contentKey", 2);
B([
  c({ attribute: !1 })
], y.prototype, "config", 2);
B([
  m()
], y.prototype, "_htmlMarkup", 2);
B([
  m()
], y.prototype, "_isLoading", 2);
B([
  m()
], y.prototype, "_error", 2);
B([
  m()
], y.prototype, "_blockRteValue", 2);
B([
  c({ attribute: !1 })
], y.prototype, "blockRteValue", 1);
y = B([
  ue(Vt)
], y);
var I, N, M, D, $;
class ne extends Re {
  constructor(i) {
    super(i);
    q(this, I);
    q(this, N);
    q(this, M);
    q(this, D);
    q(this, $);
    O(this, N, new pt(void 0)), this.settings = p(this, N).asObservable(), O(this, M, new Ee("")), this.unique = p(this, M).asObservable(), O(this, D, new Ee("")), this.documentTypeUnique = p(this, D).asObservable(), O(this, $, new ft(!1)), this.sortModeActive = p(this, $).asObservable(), O(this, I, new st(i)), this.getSettings(), this.setSortMode(!1);
  }
  async getSettings() {
    const i = await p(this, I).getSettings();
    p(this, N).setValue(i);
  }
  getUnique() {
    return p(this, M).getValue();
  }
  async setUnique(i) {
    i != "" && p(this, M).setValue(i);
  }
  getDocumentTypeUnique() {
    return p(this, D).getValue();
  }
  async setDocumentTypeUnique(i) {
    i != "" && p(this, D).setValue(i);
  }
  getSortMode() {
    return p(this, $).getValue();
  }
  async setSortMode(i) {
    p(this, $).setValue(i);
  }
}
I = new WeakMap(), N = new WeakMap(), M = new WeakMap(), D = new WeakMap(), $ = new WeakMap();
const Gt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ne,
  default: ne
}, Symbol.toStringTag, { value: "Module" })), jt = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => Gt)
  }
], Wt = [...jt], se = {
  type: "kind",
  alias: "Umb.PropertyAction.SortMode",
  matchKind: "sortMode",
  matchType: "propertyAction",
  manifest: {
    ...gt.manifest,
    type: "propertyAction",
    kind: "sortMode",
    api: () => import("./sort-mode.property-action-BcmrUz-1.js"),
    weight: 100,
    meta: {
      icon: "icon-navigation-vertical",
      label: "Sort Mode"
    }
  }
}, Ht = [
  se
], Ft = [
  {
    ...se.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.Grid.SortMode",
    name: "Block Grid Sort Mode Property Action",
    api: () => import("./block-grid-sort-mode-DFNMOx2l.js"),
    forPropertyEditorUis: [dt],
    conditions: [
      {
        alias: xe
      }
    ]
  },
  {
    ...se.manifest,
    type: "propertyAction",
    kind: "sortMode",
    alias: "BlockPreview.PropertyAction.List.SortMode",
    name: "Block List Sort Mode Property Action",
    api: () => import("./block-list-sort-mode-D2EMZRSe.js"),
    forPropertyEditorUis: [mt],
    conditions: [
      {
        alias: xe
      }
    ]
  }
];
var K;
class Xt {
  constructor(t) {
    q(this, K);
    O(this, K, t);
  }
  async getSettings() {
    return await Y(p(this, K), J.getSettings());
  }
}
K = new WeakMap();
var V;
class st extends Re {
  constructor(i) {
    super(i);
    q(this, V);
    O(this, V, new Xt(i));
  }
  async getSettings() {
    const i = await p(this, V).getSettings();
    if (i && (i != null && i.data))
      return i.data;
  }
}
V = new WeakMap();
const hi = async (e, t) => {
  var s, n, a;
  const o = await new st(e).getSettings();
  let r = [];
  if (o) {
    if (o.blockGrid.enabled) {
      let l = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.GridCustomView",
        name: "BlockPreview Grid Custom View",
        element: d,
        forBlockEditor: "block-grid"
      };
      ((s = o.blockGrid.contentTypes) == null ? void 0 : s.length) !== 0 && (l.forContentTypeAlias = o.blockGrid.contentTypes), r.push(l);
    }
    if (o.blockList.enabled) {
      let l = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.ListCustomView",
        name: "BlockPreview List Custom View",
        element: h,
        forBlockEditor: "block-list"
      };
      ((n = o.blockList.contentTypes) == null ? void 0 : n.length) !== 0 && (l.forContentTypeAlias = o.blockList.contentTypes), r.push(l);
    }
    if (o.richText.enabled) {
      let l = {
        type: "blockEditorCustomView",
        alias: "BlockPreview.RichTextCustomView",
        name: "BlockPreview Rich Text Custom View",
        element: y,
        forBlockEditor: "block-rte"
      };
      ((a = o.richText.contentTypes) == null ? void 0 : a.length) !== 0 && (l.forContentTypeAlias = o.richText.contentTypes), r.push(l);
    }
  }
  t.registerMany([
    ...r,
    ...Wt,
    ...Ht,
    ...Ft
  ]), e.provideContext(z, new ne(e)), e.consumeContext(lt, async (l) => {
    if (!l) return;
    const u = l.getOpenApiConfiguration();
    L.BASE = u.base, L.TOKEN = u.token, L.WITH_CREDENTIALS = u.withCredentials, L.CREDENTIALS = u.credentials;
  });
};
export {
  z as B,
  y as R,
  Xt as S,
  d as a,
  h as b,
  st as c,
  hi as o
};
//# sourceMappingURL=index-B3B3b9DC.js.map

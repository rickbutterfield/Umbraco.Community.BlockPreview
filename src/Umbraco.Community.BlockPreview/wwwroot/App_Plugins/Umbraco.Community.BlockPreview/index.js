import { UMB_AUTH_CONTEXT as dt } from "@umbraco-cms/backoffice/auth";
import { UmbContextToken as pt } from "@umbraco-cms/backoffice/context-api";
import { nothing as bt, html as j, ifDefined as Ae, unsafeHTML as kt, css as ne, property as T, state as D, customElement as re } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT as Be } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as ft } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_DATASET_CONTEXT as yt } from "@umbraco-cms/backoffice/property";
import { UmbApiError as _t } from "@umbraco-cms/backoffice/resources";
import { UmbControllerBase as Ie } from "@umbraco-cms/backoffice/class-api";
import { UMB_BLOCK_GRID_ENTRY_CONTEXT as Ct, UMB_BLOCK_GRID_MANAGER_CONTEXT as mt } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT as B } from "@umbraco-cms/backoffice/content";
import { observeMultiple as m, UmbStringState as qe } from "@umbraco-cms/backoffice/observable-api";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT as vt, UMB_BLOCK_LIST_MANAGER_CONTEXT as wt } from "@umbraco-cms/backoffice/block-list";
import { UMB_BLOCK_SINGLE_ENTRY_CONTEXT as gt, UMB_BLOCK_SINGLE_MANAGER_CONTEXT as xt } from "@umbraco-cms/backoffice/block-single";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT as Tt, UMB_BLOCK_RTE_MANAGER_CONTEXT as Et } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Ut } from "@umbraco-cms/backoffice/document";
const St = {
  bodySerializer: (t) => JSON.stringify(t, (e, i) => typeof i == "bigint" ? i.toString() : i)
};
function Pt({
  onRequest: t,
  onSseError: e,
  onSseEvent: i,
  responseTransformer: o,
  responseValidator: s,
  sseDefaultRetryDelay: r,
  sseMaxRetryAttempts: n,
  sseMaxRetryDelay: a,
  sseSleepFn: l,
  url: f,
  ...u
}) {
  let c;
  const v = l ?? ((h) => new Promise((p) => setTimeout(p, h)));
  return { stream: async function* () {
    let h = r ?? 3e3, p = 0;
    const C = u.signal ?? new AbortController().signal;
    for (; !C.aborted; ) {
      p++;
      const z = u.headers instanceof Headers ? u.headers : new Headers(u.headers);
      c !== void 0 && z.set("Last-Event-ID", c);
      try {
        const U = {
          redirect: "follow",
          ...u,
          body: u.serializedBody,
          headers: z,
          signal: C
        };
        let S = new Request(f, U);
        t && (S = await t(f, U));
        const b = await (u.fetch ?? globalThis.fetch)(S);
        if (!b.ok) throw new Error(`SSE failed: ${b.status} ${b.statusText}`);
        if (!b.body) throw new Error("No body in SSE response");
        const w = b.body.pipeThrough(new TextDecoderStream()).getReader();
        let y = "";
        const Te = () => {
          try {
            w.cancel();
          } catch {
          }
        };
        C.addEventListener("abort", Te);
        try {
          for (; ; ) {
            const { done: lt, value: ct } = await w.read();
            if (lt) break;
            y += ct, y = y.replace(/\r\n?/g, `
`);
            const Ee = y.split(`

`);
            y = Ee.pop() ?? "";
            for (const ut of Ee) {
              const ht = ut.split(`
`), G = [];
              let Ue;
              for (const g of ht)
                if (g.startsWith("data:"))
                  G.push(g.replace(/^data:\s*/, ""));
                else if (g.startsWith("event:"))
                  Ue = g.replace(/^event:\s*/, "");
                else if (g.startsWith("id:"))
                  c = g.replace(/^id:\s*/, "");
                else if (g.startsWith("retry:")) {
                  const Pe = Number.parseInt(g.replace(/^retry:\s*/, ""), 10);
                  Number.isNaN(Pe) || (h = Pe);
                }
              let P, Se = !1;
              if (G.length) {
                const g = G.join(`
`);
                try {
                  P = JSON.parse(g), Se = !0;
                } catch {
                  P = g;
                }
              }
              Se && (s && await s(P), o && (P = await o(P))), i?.({
                data: P,
                event: Ue,
                id: c,
                retry: h
              }), G.length && (yield P);
            }
          }
        } finally {
          C.removeEventListener("abort", Te), w.releaseLock();
        }
        break;
      } catch (U) {
        if (e?.(U), n !== void 0 && p >= n)
          break;
        const S = Math.min(h * 2 ** (p - 1), a ?? 3e4);
        await v(S);
      }
    }
  }() };
}
const At = (t) => {
  switch (t) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, Bt = (t) => {
  switch (t) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, qt = (t) => {
  switch (t) {
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
  allowReserved: t,
  explode: e,
  name: i,
  style: o,
  value: s
}) => {
  if (!e) {
    const a = (t ? s : s.map((l) => encodeURIComponent(l))).join(Bt(o));
    switch (o) {
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
  const r = At(o), n = s.map((a) => o === "label" || o === "simple" ? t ? a : encodeURIComponent(a) : ae({
    allowReserved: t,
    name: i,
    value: a
  })).join(r);
  return o === "label" || o === "matrix" ? r + n : n;
}, ae = ({
  allowReserved: t,
  name: e,
  value: i
}) => {
  if (i == null)
    return "";
  if (typeof i == "object")
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these."
    );
  return `${e}=${t ? i : encodeURIComponent(i)}`;
}, ze = ({
  allowReserved: t,
  explode: e,
  name: i,
  style: o,
  value: s,
  valueOnly: r
}) => {
  if (s instanceof Date)
    return r ? s.toISOString() : `${i}=${s.toISOString()}`;
  if (o !== "deepObject" && !e) {
    let l = [];
    Object.entries(s).forEach(([u, c]) => {
      l = [...l, u, t ? c : encodeURIComponent(c)];
    });
    const f = l.join(",");
    switch (o) {
      case "form":
        return `${i}=${f}`;
      case "label":
        return `.${f}`;
      case "matrix":
        return `;${i}=${f}`;
      default:
        return f;
    }
  }
  const n = qt(o), a = Object.entries(s).map(
    ([l, f]) => ae({
      allowReserved: t,
      name: o === "deepObject" ? `${i}[${l}]` : l,
      value: f
    })
  ).join(n);
  return o === "label" || o === "matrix" ? n + a : a;
}, Ot = /\{[^{}]+\}/g, Dt = ({ path: t, url: e }) => {
  let i = e;
  const o = e.match(Ot);
  if (o)
    for (const s of o) {
      let r = !1, n = s.substring(1, s.length - 1), a = "simple";
      n.endsWith("*") && (r = !0, n = n.substring(0, n.length - 1)), n.startsWith(".") ? (n = n.substring(1), a = "label") : n.startsWith(";") && (n = n.substring(1), a = "matrix");
      const l = t[n];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        i = i.replace(s, We({ explode: r, name: n, style: a, value: l }));
        continue;
      }
      if (typeof l == "object") {
        i = i.replace(
          s,
          ze({
            explode: r,
            name: n,
            style: a,
            value: l,
            valueOnly: !0
          })
        );
        continue;
      }
      if (a === "matrix") {
        i = i.replace(
          s,
          `;${ae({
            name: n,
            value: l
          })}`
        );
        continue;
      }
      const f = encodeURIComponent(
        a === "label" ? `.${l}` : l
      );
      i = i.replace(s, f);
    }
  return i;
}, Vt = ({
  baseUrl: t,
  path: e,
  query: i,
  querySerializer: o,
  url: s
}) => {
  const r = s.startsWith("/") ? s : `/${s}`;
  let n = (t ?? "") + r;
  e && (n = Dt({ path: e, url: n }));
  let a = i ? o(i) : "";
  return a.startsWith("?") && (a = a.substring(1)), a && (n += `?${a}`), n;
};
function Oe(t) {
  const e = t.body !== void 0;
  if (e && t.bodySerializer)
    return "serializedBody" in t ? t.serializedBody !== void 0 && t.serializedBody !== "" ? t.serializedBody : null : t.body !== "" ? t.body : null;
  if (e)
    return t.body;
}
const Lt = async (t, e) => {
  const i = typeof e == "function" ? await e(t) : e;
  if (i)
    return t.scheme === "bearer" ? `Bearer ${i}` : t.scheme === "basic" ? `Basic ${btoa(i)}` : i;
}, Ge = ({
  parameters: t = {},
  ...e
} = {}) => (o) => {
  const s = [];
  if (o && typeof o == "object")
    for (const r in o) {
      const n = o[r];
      if (n == null)
        continue;
      const a = t[r] || e;
      if (Array.isArray(n)) {
        const l = We({
          allowReserved: a.allowReserved,
          explode: !0,
          name: r,
          style: "form",
          value: n,
          ...a.array
        });
        l && s.push(l);
      } else if (typeof n == "object") {
        const l = ze({
          allowReserved: a.allowReserved,
          explode: !0,
          name: r,
          style: "deepObject",
          value: n,
          ...a.object
        });
        l && s.push(l);
      } else {
        const l = ae({
          allowReserved: a.allowReserved,
          name: r,
          value: n
        });
        l && s.push(l);
      }
    }
  return s.join("&");
}, $t = (t) => {
  if (!t)
    return "stream";
  const e = t.split(";")[0]?.trim();
  if (e) {
    if (e.startsWith("application/json") || e.endsWith("+json"))
      return "json";
    if (e === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some((i) => e.startsWith(i)))
      return "blob";
    if (e.startsWith("text/"))
      return "text";
  }
}, Kt = (t, e) => e ? !!(t.headers.has(e) || t.query?.[e] || t.headers.get("Cookie")?.includes(`${e}=`)) : !1;
async function Mt(t) {
  for (const e of t.security ?? []) {
    if (Kt(t, e.name))
      continue;
    const i = await Lt(e, t.auth);
    if (!i)
      continue;
    const o = e.name ?? "Authorization";
    switch (e.in) {
      case "query":
        t.query || (t.query = {}), t.query[o] = i;
        break;
      case "cookie":
        t.headers.append("Cookie", `${o}=${i}`);
        break;
      default:
        t.headers.set(o, i);
        break;
    }
  }
}
const De = (t) => Vt({
  baseUrl: t.baseUrl,
  path: t.path,
  query: t.query,
  querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : Ge(t.querySerializer),
  url: t.url
}), Ve = (t, e) => {
  const i = { ...t, ...e };
  return i.baseUrl?.endsWith("/") && (i.baseUrl = i.baseUrl.substring(0, i.baseUrl.length - 1)), i.headers = je(t.headers, e.headers), i;
}, Nt = (t) => {
  const e = [];
  return t.forEach((i, o) => {
    e.push([o, i]);
  }), e;
}, je = (...t) => {
  const e = new Headers();
  for (const i of t) {
    if (!i)
      continue;
    const o = i instanceof Headers ? Nt(i) : Object.entries(i);
    for (const [s, r] of o)
      if (r === null)
        e.delete(s);
      else if (Array.isArray(r))
        for (const n of r)
          e.append(s, n);
      else r !== void 0 && e.set(
        s,
        typeof r == "object" ? JSON.stringify(r) : r
      );
  }
  return e;
};
class ue {
  constructor() {
    this.fns = [];
  }
  clear() {
    this.fns = [];
  }
  eject(e) {
    const i = this.getInterceptorIndex(e);
    this.fns[i] && (this.fns[i] = null);
  }
  exists(e) {
    const i = this.getInterceptorIndex(e);
    return !!this.fns[i];
  }
  getInterceptorIndex(e) {
    return typeof e == "number" ? this.fns[e] ? e : -1 : this.fns.indexOf(e);
  }
  update(e, i) {
    const o = this.getInterceptorIndex(e);
    return this.fns[o] ? (this.fns[o] = i, e) : !1;
  }
  use(e) {
    return this.fns.push(e), this.fns.length - 1;
  }
}
const Rt = () => ({
  error: new ue(),
  request: new ue(),
  response: new ue()
}), It = Ge({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), Wt = {
  "Content-Type": "application/json"
}, He = (t = {}) => ({
  ...St,
  headers: Wt,
  parseAs: "auto",
  querySerializer: It,
  ...t
}), zt = (t = {}) => {
  let e = Ve(He(), t);
  const i = () => ({ ...e }), o = (u) => (e = Ve(e, u), i()), s = Rt(), r = async (u) => {
    const c = {
      ...e,
      ...u,
      fetch: u.fetch ?? e.fetch ?? globalThis.fetch,
      headers: je(e.headers, u.headers),
      serializedBody: void 0
    };
    c.security && await Mt(c), c.requestValidator && await c.requestValidator(c), c.body !== void 0 && c.bodySerializer && (c.serializedBody = c.bodySerializer(c.body)), (c.body === void 0 || c.serializedBody === "") && c.headers.delete("Content-Type");
    const v = c, _ = De(v);
    return { opts: v, url: _ };
  }, n = async (u) => {
    const c = u.throwOnError ?? e.throwOnError, v = u.responseStyle ?? e.responseStyle;
    let _, d;
    try {
      const { opts: h, url: p } = await r(u), C = {
        redirect: "follow",
        ...h,
        body: Oe(h)
      };
      _ = new Request(p, C);
      for (const b of s.request.fns)
        b && (_ = await b(_, h));
      const z = h.fetch;
      d = await z(_);
      for (const b of s.response.fns)
        b && (d = await b(d, _, h));
      const U = {
        request: _,
        response: d
      };
      if (d.ok) {
        const b = (h.parseAs === "auto" ? $t(d.headers.get("Content-Type")) : h.parseAs) ?? "json";
        if (d.status === 204 || d.headers.get("Content-Length") === "0") {
          let y;
          switch (b) {
            case "arrayBuffer":
            case "blob":
            case "text":
              y = await d[b]();
              break;
            case "formData":
              y = new FormData();
              break;
            case "stream":
              y = d.body;
              break;
            default:
              y = {};
              break;
          }
          return h.responseStyle === "data" ? y : {
            data: y,
            ...U
          };
        }
        let w;
        switch (b) {
          case "arrayBuffer":
          case "blob":
          case "formData":
          case "text":
            w = await d[b]();
            break;
          case "json": {
            const y = await d.text();
            w = y ? JSON.parse(y) : {};
            break;
          }
          case "stream":
            return h.responseStyle === "data" ? d.body : {
              data: d.body,
              ...U
            };
        }
        return b === "json" && (h.responseValidator && await h.responseValidator(w), h.responseTransformer && (w = await h.responseTransformer(w))), h.responseStyle === "data" ? w : {
          data: w,
          ...U
        };
      }
      const S = await d.text();
      let ce;
      try {
        ce = JSON.parse(S);
      } catch {
      }
      throw ce ?? S;
    } catch (h) {
      let p = h;
      for (const C of s.error.fns)
        C && (p = await C(p, d, _, u));
      if (p = p || {}, c)
        throw p;
      return v === "data" ? void 0 : {
        error: p,
        request: _,
        response: d
      };
    }
  }, a = (u) => (c) => n({ ...c, method: u }), l = (u) => async (c) => {
    const { opts: v, url: _ } = await r(c);
    return Pt({
      ...v,
      body: v.body,
      method: u,
      onRequest: async (d, h) => {
        let p = new Request(d, h);
        for (const C of s.request.fns)
          C && (p = await C(p, v));
        return p;
      },
      serializedBody: Oe(v),
      url: _
    });
  };
  return {
    buildUrl: (u) => De({ ...e, ...u }),
    connect: a("CONNECT"),
    delete: a("DELETE"),
    get: a("GET"),
    getConfig: i,
    head: a("HEAD"),
    interceptors: s,
    options: a("OPTIONS"),
    patch: a("PATCH"),
    post: a("POST"),
    put: a("PUT"),
    request: n,
    setConfig: o,
    sse: {
      connect: l("CONNECT"),
      delete: l("DELETE"),
      get: l("GET"),
      head: l("HEAD"),
      options: l("OPTIONS"),
      patch: l("PATCH"),
      post: l("POST"),
      put: l("PUT"),
      trace: l("TRACE")
    },
    trace: a("TRACE")
  };
}, x = zt(He({ baseUrl: "https://localhost:44370/" })), Xe = new pt("BlockPreviewContext");
var Gt = Object.defineProperty, E = (t, e, i, o) => {
  for (var s = void 0, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (s = n(e, i, s) || s);
  return s && Gt(e, i, s), s;
};
const jt = ["UUI-ACTION-BAR", "UMB-BLOCK-ACTION", "UMB-BLOCK-SCALE-HANDLER"];
function Le(t) {
  return t.some((o) => o instanceof Element && jt.includes(o.tagName)) ? !t.some(
    (o) => o instanceof Element && o.tagName === "UUI-BUTTON" && (o.getAttribute("href") ?? "").includes("block/edit")
  ) : !1;
}
class k extends ft {
  constructor() {
    super(), this._workspaceContextResolved = !1, this._htmlMarkup = "", this._isLoading = !1, this._error = null, this._stylesheetsAdopted = !1, this._requestId = 0, this._isConnected = !1, this._pointerStartPos = null, this._handleAnchorNavGuard = (e) => {
      Le(e.composedPath()) && e.preventDefault();
    }, this.consumeContext(Xe, async (e) => {
      this._blockPreviewContext = e, this.observeOwnerContentType(), await this.setupContextObservers();
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._isConnected = !0, this.addEventListener("click", this._handleAnchorNavGuard, { capture: !0 });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._isConnected = !1, this.removeEventListener("click", this._handleAnchorNavGuard, { capture: !0 });
  }
  updated(e) {
    super.updated(e), (e.has("content") || e.has("settings")) && this.renderBlockPreview();
  }
  // region Shared context observers
  observePropertyDataset() {
    this.consumeContext(yt, (e) => {
      e && (this._blockContext.culture = e.getVariantId().culture ?? "");
    });
  }
  // endregion
  // region Workspace helpers
  /**
   * Shared handler called once the workspace context provides a unique + documentTypeUnique.
   * Sets up block context, triggers block value observation, and loads stylesheets.
   */
  async handleWorkspaceData(e, i) {
    !this._isConnected || !i || (this._blockContext.unique = e?.toString() ?? "", this._blockPreviewContext?.setUnique(this._blockContext.unique), this._blockContext.documentTypeUnique = this._ownerContentTypeUnique ?? i, this._blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique), this._workspaceContextResolved = !0, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
  }
  /**
   * Observe the nearest block workspace to resolve the content type that owns the
   * block-editor property. The document/node key still comes from the content
   * workspace (see #297); only the owning content type differs when nested.
   */
  observeOwnerContentType() {
    this.consumeContext(Be, (e) => {
      e && this.observe(e.content.structure.contentTypeUniques, (i) => {
        const o = i?.[0];
        !o || o === this._ownerContentTypeUnique || (this._ownerContentTypeUnique = o, this._blockContext.documentTypeUnique !== o && (this._blockContext.documentTypeUnique = o, this._blockPreviewContext?.setDocumentTypeUnique(o), this._workspaceContextResolved && this.renderBlockPreview()));
      });
    });
  }
  /**
   * Fallback workspace observation via UMB_BLOCK_WORKSPACE_CONTEXT.
   * Used when the primary workspace context is unavailable (e.g. nested block editing).
   */
  observeBlockWorkspaceFallback() {
    this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== "" || this.consumeContext(Be, async (e) => {
      e && this.observe(e.content.structure.contentTypeUniques, async (i) => {
        const o = i[0];
        !this._isConnected || !o || (this._blockContext.unique = this._blockPreviewContext?.getUnique() ?? "", !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath)), this._blockContext.documentTypeUnique = o, this.observeBlockValue(), await this.fetchAndLoadStylesheets());
      });
    });
  }
  async fetchAndLoadStylesheets() {
    if (this._stylesheetsAdopted || !this._blockPreviewContext) return;
    const { data: e } = await this.fetchStylesheets();
    if (e && e.length > 0) {
      const i = await Promise.all(
        e.map((s) => this._blockPreviewContext.getOrCreateStylesheet(s))
      ), o = this.renderRoot;
      o.adoptedStyleSheets = [...o.adoptedStyleSheets, ...i], this._stylesheetsAdopted = !0;
    }
  }
  // endregion
  // region Preview rendering
  resolveUniqueFromContext() {
    this._blockPreviewContext != null && this._blockContext.unique === "" && (this._blockContext.unique = this._blockPreviewContext.getUnique(), !this._blockContext.unique && this._blockContext.workspaceEditContentPath && (this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath))), this._blockPreviewContext != null && this._blockContext.documentTypeUnique === "" && (this._blockContext.documentTypeUnique = this._blockPreviewContext.getDocumentTypeUnique());
  }
  async renderBlockPreview() {
    if (!this._isConnected || (this.resolveUniqueFromContext(), !this.validatePreviewData()))
      return;
    this._isLoading = !0, this._error = null;
    const e = ++this._requestId;
    try {
      const { data: i, error: o } = await this._blockPreviewContext.requestQueue.enqueue(
        () => this.callPreviewApi()
      );
      if (this._requestId !== e) return;
      i != null ? (this._htmlMarkup = i, this._isLoading = !1) : o ? (this._error = _t.isUmbApiError(o) ? o.message : this.localize.term("blockPreview_renderError"), this._isLoading = !1) : this._isLoading = !1;
    } catch (i) {
      if (this._requestId !== e) return;
      this._error = this.localize.term("blockPreview_renderFailed"), this._isLoading = !1, console.error("Block preview error:", i);
    }
  }
  /**
   * Validates that sufficient data is available for a preview request.
   * Subclasses may override to add additional checks (e.g. contentUdi).
   */
  validatePreviewData() {
    const e = this._blockContext;
    return e.unique !== "" && e.blockEditorAlias !== "" && e.contentElementTypeAlias !== "";
  }
  // endregion
  // region Utilities
  extractUniqueFromWorkspacePath(e) {
    const i = e.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
    return i ? i[1] : "";
  }
  _handlePointerDown(e) {
    this._pointerStartPos = { x: e.clientX, y: e.clientY };
  }
  _handleClick(e) {
    if (("pointerType" in e ? e.pointerType : "") !== "") {
      if (!this._pointerStartPos) {
        e.preventDefault(), e.stopPropagation();
        return;
      }
      const r = Math.abs(e.clientX - this._pointerStartPos.x), n = Math.abs(e.clientY - this._pointerStartPos.y);
      if (this._pointerStartPos = null, r > 5 || n > 5) {
        e.preventDefault(), e.stopPropagation();
        return;
      }
    }
    this._pointerStartPos = null;
    const o = e.composedPath();
    if (Le(o)) {
      e.preventDefault(), e.stopPropagation();
      return;
    }
    if (o.filter((r) => r instanceof Element && r.tagName === "A" && r.hasAttribute("data-block-preview-link")).length > 0) {
      e.preventDefault(), e.stopPropagation();
      const r = o.find((n) => n instanceof Element && n.tagName === "A" && n.classList.contains("block-preview-edit"));
      r instanceof Element ? window.history.pushState({}, "", r.getAttribute("href")) : window.history.pushState({}, "", this._blockContext.workspaceEditContentPath);
      return;
    }
  }
  // endregion
  // region Rendering
  render() {
    return j`
            ${this._isLoading ? j`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>` : this._error ? j`<div class="preview-alert preview-alert-error" role="alert">${this._error}</div>` : this._htmlMarkup ? j`<a
                            href=${Ae(this._blockContext.workspaceEditContentPath)}
                            @pointerdown=${this._handlePointerDown}
                            @click=${this._handleClick}
                            aria-label=${this.localize.term("blockPreview_editBlock")}
                            class="block-preview-edit"
							title=${Ae(this._blockContext.contentElementTypeAlias)}
                        >${kt(this._htmlMarkup)}</a>` : bt}
        `;
  }
  static {
    this.styles = [
      ne`
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
                    color: #fff;
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
  }
}
E([
  T({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], k.prototype, "content");
E([
  T({ attribute: !1, hasChanged: (t, e) => JSON.stringify(t) !== JSON.stringify(e) })
], k.prototype, "settings");
E([
  T({ attribute: !1 })
], k.prototype, "contentKey");
E([
  T({ attribute: !1 })
], k.prototype, "config");
E([
  T({ attribute: !1 })
], k.prototype, "unpublished");
E([
  T({ attribute: !1 })
], k.prototype, "icon");
E([
  T({ attribute: !1 })
], k.prototype, "label");
E([
  D()
], k.prototype, "_htmlMarkup");
E([
  D()
], k.prototype, "_isLoading");
E([
  D()
], k.prototype, "_error");
const Ht = (t) => (t.client ?? x).post({
  url: "/umbraco/block-preview/api/v1/preview/grid",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t.headers
  }
}), Xt = (t) => (t?.client ?? x).get({ url: "/umbraco/block-preview/api/v1/preview/grid/stylesheets", ...t }), Ft = (t) => (t.client ?? x).post({
  url: "/umbraco/block-preview/api/v1/preview/list",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t.headers
  }
}), Jt = (t) => (t?.client ?? x).get({ url: "/umbraco/block-preview/api/v1/preview/list/stylesheets", ...t }), Yt = (t) => (t.client ?? x).post({
  url: "/umbraco/block-preview/api/v1/preview/rte",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t.headers
  }
}), Qt = (t) => (t?.client ?? x).get({ url: "/umbraco/block-preview/api/v1/preview/rte/stylesheets", ...t }), Zt = (t) => (t.client ?? x).post({
  url: "/umbraco/block-preview/api/v1/preview/single",
  ...t,
  headers: {
    "Content-Type": "application/json",
    ...t.headers
  }
}), ei = (t) => (t?.client ?? x).get({ url: "/umbraco/block-preview/api/v1/preview/single/stylesheets", ...t }), ti = (t) => (t?.client ?? x).get({ url: "/umbraco/block-preview/api/v1/settings", ...t });
class le {
  previewGridBlock(e, i, o) {
    const s = {
      body: e,
      query: {
        nodeKey: i.nodeKey,
        blockEditorAlias: i.blockEditorAlias,
        contentElementAlias: i.contentElementAlias,
        documentTypeUnique: i.documentTypeUnique,
        contentUdi: i.contentUdi,
        settingsUdi: i.settingsUdi,
        culture: i.culture,
        blockIndex: i.blockIndex
      }
    };
    return Ht({ ...s, throwOnError: o });
  }
  previewListBlock(e, i, o) {
    const s = {
      body: e,
      query: {
        nodeKey: i.nodeKey,
        blockEditorAlias: i.blockEditorAlias,
        contentElementAlias: i.contentElementAlias,
        documentTypeUnique: i.documentTypeUnique,
        contentUdi: i.contentUdi,
        settingsUdi: i.settingsUdi,
        culture: i.culture,
        blockIndex: i.blockIndex
      }
    };
    return Ft({ ...s, throwOnError: o });
  }
  previewSingleBlock(e, i, o) {
    const s = {
      body: e,
      query: {
        nodeKey: i.nodeKey,
        blockEditorAlias: i.blockEditorAlias,
        contentElementAlias: i.contentElementAlias,
        documentTypeUnique: i.documentTypeUnique,
        contentUdi: i.contentUdi,
        settingsUdi: i.settingsUdi,
        culture: i.culture,
        blockIndex: i.blockIndex
      }
    };
    return Zt({ ...s, throwOnError: o });
  }
  previewRichTextMarkup(e, i, o) {
    const s = {
      body: e,
      query: {
        nodeKey: i.nodeKey,
        blockEditorAlias: i.blockEditorAlias,
        contentElementAlias: i.contentElementAlias,
        documentTypeUnique: i.documentTypeUnique,
        culture: i.culture
      }
    };
    return Yt({ ...s, throwOnError: o });
  }
  getSingleBlockStylesheets(e, i) {
    const o = {
      query: {
        nodeKey: e.nodeKey,
        documentTypeUnique: e.documentTypeUnique
      }
    };
    return ei({ ...o, throwOnError: i });
  }
  getGridStylesheets(e, i) {
    const o = {
      query: {
        nodeKey: e.nodeKey,
        documentTypeUnique: e.documentTypeUnique
      }
    };
    return Xt({ ...o, throwOnError: i });
  }
  getListStylesheets(e, i) {
    const o = {
      query: {
        nodeKey: e.nodeKey,
        documentTypeUnique: e.documentTypeUnique
      }
    };
    return Jt({ ...o, throwOnError: i });
  }
  getRteStylesheets(e, i) {
    const o = {
      query: {
        nodeKey: e.nodeKey,
        documentTypeUnique: e.documentTypeUnique
      }
    };
    return Qt({ ...o, throwOnError: i });
  }
}
class ii {
  getSettings(e) {
    return ti({ ...{}, throwOnError: e });
  }
}
class oi extends Ie {
  #e;
  constructor(e) {
    super(e), this.#e = new ii();
  }
  async getSettings() {
    const e = await this.#e.getSettings();
    if (e && e?.data)
      return e.data;
  }
}
var si = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, Fe = (t) => {
  throw TypeError(t);
}, Je = (t, e, i, o) => {
  for (var s = o > 1 ? void 0 : o ? ni(e, i) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (s = (o ? n(e, i, s) : n(s)) || s);
  return o && s && si(e, i, s), s;
}, _e = (t, e, i) => e.has(t) || Fe("Cannot " + i), V = (t, e, i) => (_e(t, e, "read from private field"), e.get(t)), H = (t, e, i) => e.has(t) ? Fe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), he = (t, e, i, o) => (_e(t, e, "write to private field"), e.set(t, i), i), L = (t, e, i) => (_e(t, e, "access private method"), i), $, A, Ye, K, J, Qe, se;
const ri = "block-grid-preview";
let I = class extends k {
  constructor() {
    super(), H(this, A), H(this, $), this._blockContext = {
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
    }, H(this, K, !1), H(this, J), he(this, $, new le());
  }
  set blockGridValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockGridValue = e;
  }
  get blockGridValue() {
    return this._blockGridValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await L(this, A, Ye).call(this);
  }
  observeBlockValue() {
    this.consumeContext(Ct, async (t) => {
      t && this.observe(
        m([
          t.contentKey,
          t.settingsKey,
          t.workspaceEditContentPath,
          t.contentElementTypeAlias,
          t.contentElementTypeKey,
          t.areas,
          t.layout,
          t.layoutAreas
        ]),
        async ([
          e,
          i,
          o,
          s,
          r,
          n,
          a,
          l
        ]) => {
          const f = this._blockContext.layout?.columnSpan, u = this._blockContext.layout?.rowSpan, c = this._blockContext.layoutAreas;
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = r ?? "", this._blockContext.areas = n, this._blockContext.layout = a, this._blockContext.layoutAreas = l, !V(this, K) && this._blockContext.contentUdi && (he(this, K, !0), await L(this, A, Qe).call(this)), !c && l && (n?.length ?? 0) > 0 && V(this, K) && !this._isLoading && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": L(this, A, se).call(this) }
          }, this.renderBlockPreview()), this._htmlMarkup && a && (a.columnSpan !== f || a.rowSpan !== u) && (this.blockGridValue = {
            ...this._blockGridValue,
            layout: { "Umbraco.BlockGrid": L(this, A, se).call(this) }
          }, clearTimeout(V(this, J)), he(this, J, setTimeout(() => {
            this.renderBlockPreview();
          }, 300)));
        }
      );
    });
  }
  callPreviewApi() {
    return V(this, $).previewGridBlock(
      JSON.stringify(this.blockGridValue),
      {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        contentUdi: this._blockContext.contentUdi,
        settingsUdi: this._blockContext.settingsUdi,
        culture: this._blockContext.culture,
        blockIndex: this._blockContext.blockIndex
      }
    );
  }
  fetchStylesheets() {
    return V(this, $).getGridStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
$ = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakSet();
Ye = async function() {
  try {
    await this.getContext(B, { passContextAliasMatches: !0 }), this.consumeContext(B, (t) => {
      t && this.observe(
        m([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    }).passContextAliasMatches();
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
K = /* @__PURE__ */ new WeakMap();
J = /* @__PURE__ */ new WeakMap();
Qe = async function() {
  this.consumeContext(mt, (t) => {
    t && this.observe(
      m([
        t.contents,
        t.settings,
        t.exposes,
        t.propertyAlias
      ]),
      async ([e, i, o, s]) => {
        if (this._blockContext.blockEditorAlias = s ?? "", this.blockGridValue = {
          contentData: e ?? [],
          settingsData: i ?? [],
          expose: o ?? [],
          layout: { "Umbraco.BlockGrid": L(this, A, se).call(this) }
        }, this._blockContext.blockIndex = (e ?? []).findIndex((r) => r.key === this._blockContext.contentUdi), !this._htmlMarkup && !this._isLoading) {
          if ((this._blockContext.areas?.length ?? 0) > 0 && !this._blockContext.layoutAreas)
            return;
          this.renderBlockPreview();
        }
      }
    );
  });
};
se = function() {
  return [
    {
      areas: this._blockContext.areas.map((i) => ({
        key: i.key,
        items: this._blockContext.layoutAreas?.find((s) => s.key === i.key)?.items ?? []
      })),
      columnSpan: this._blockContext.layout?.columnSpan ?? 0,
      rowSpan: this._blockContext.layout?.rowSpan ?? 0,
      contentKey: this._blockContext.layout?.contentKey ?? "",
      settingsKey: this._blockContext.layout?.settingsKey
    }
  ];
};
I.styles = [
  ...k.styles,
  ne`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
Je([
  T({ attribute: !1 })
], I.prototype, "blockGridValue", 1);
I = Je([
  re(ri)
], I);
var ai = Object.defineProperty, li = Object.getOwnPropertyDescriptor, Ze = (t) => {
  throw TypeError(t);
}, Ce = (t, e, i, o) => {
  for (var s = o > 1 ? void 0 : o ? li(e, i) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (s = (o ? n(e, i, s) : n(s)) || s);
  return o && s && ai(e, i, s), s;
}, me = (t, e, i) => e.has(t) || Ze("Cannot " + i), de = (t, e, i) => (me(t, e, "read from private field"), e.get(t)), pe = (t, e, i) => e.has(t) ? Ze("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), $e = (t, e, i, o) => (me(t, e, "write to private field"), e.set(t, i), i), Ke = (t, e, i) => (me(t, e, "access private method"), i), M, Y, et, Q, tt;
const ci = "block-list-preview";
let q = class extends k {
  constructor() {
    super(), pe(this, Y), pe(this, M), this._blockContext = {
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
    }, pe(this, Q, !1), $e(this, M, new le());
  }
  set blockListValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockListValue = e;
  }
  get blockListValue() {
    return this._blockListValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Ke(this, Y, et).call(this);
  }
  observeBlockValue() {
    this.consumeContext(vt, (t) => {
      t && this.observe(
        m([
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
          s,
          r
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = r ?? "", !de(this, Q) && this._blockContext.contentUdi && ($e(this, Q, !0), await Ke(this, Y, tt).call(this));
        }
      );
    });
  }
  callPreviewApi() {
    return de(this, M).previewListBlock(
      JSON.stringify(this.blockListValue),
      {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        contentUdi: this._blockContext.contentUdi,
        settingsUdi: this._blockContext.settingsUdi,
        culture: this._blockContext.culture,
        blockIndex: this._blockContext.blockIndex
      }
    );
  }
  fetchStylesheets() {
    return de(this, M).getListStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
M = /* @__PURE__ */ new WeakMap();
Y = /* @__PURE__ */ new WeakSet();
et = async function() {
  try {
    await this.getContext(B, { passContextAliasMatches: !0 }), this.consumeContext(B, (t) => {
      t && this.observe(
        m([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    }).passContextAliasMatches();
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
Q = /* @__PURE__ */ new WeakMap();
tt = function() {
  this.consumeContext(wt, (t) => {
    t && this.observe(
      m([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([
        e,
        i,
        o,
        s,
        r
      ]) => {
        this._blockContext.blockEditorAlias = r ?? "", this.blockListValue = {
          contentData: e?.filter((n) => n.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((n) => n.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.BlockList": o?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockListValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
q.styles = [
  ...k.styles,
  ne`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
Ce([
  D()
], q.prototype, "_blockListValue", 2);
Ce([
  T({ attribute: !1 })
], q.prototype, "blockListValue", 1);
q = Ce([
  re(ci)
], q);
var ui = Object.defineProperty, hi = Object.getOwnPropertyDescriptor, it = (t) => {
  throw TypeError(t);
}, ve = (t, e, i, o) => {
  for (var s = o > 1 ? void 0 : o ? hi(e, i) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (s = (o ? n(e, i, s) : n(s)) || s);
  return o && s && ui(e, i, s), s;
}, we = (t, e, i) => e.has(t) || it("Cannot " + i), be = (t, e, i) => (we(t, e, "read from private field"), e.get(t)), ke = (t, e, i) => e.has(t) ? it("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Me = (t, e, i, o) => (we(t, e, "write to private field"), e.set(t, i), i), Ne = (t, e, i) => (we(t, e, "access private method"), i), N, Z, ot, ee, st;
const di = "block-single-preview";
let O = class extends k {
  constructor() {
    super(), ke(this, Z), ke(this, N), this._blockContext = {
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
    }, this._blockSingleValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, ke(this, ee, !1), Me(this, N, new le());
  }
  set blockSingleValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockSingleValue = e;
  }
  get blockSingleValue() {
    return this._blockSingleValue;
  }
  async setupContextObservers() {
    this.observePropertyDataset(), await Ne(this, Z, ot).call(this);
  }
  observeBlockValue() {
    this.consumeContext(gt, (t) => {
      t && this.observe(
        m([
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
          s,
          r
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = r ?? "", be(this, ee) || (Me(this, ee, !0), await Ne(this, Z, st).call(this));
        }
      );
    });
  }
  callPreviewApi() {
    return be(this, N).previewSingleBlock(
      JSON.stringify(this.blockSingleValue),
      {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        contentUdi: this._blockContext.contentUdi,
        settingsUdi: this._blockContext.settingsUdi,
        culture: this._blockContext.culture,
        blockIndex: this._blockContext.blockIndex
      }
    );
  }
  fetchStylesheets() {
    return be(this, N).getSingleBlockStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
  }
  validatePreviewData() {
    return super.validatePreviewData() && this._blockContext.contentUdi !== "";
  }
};
N = /* @__PURE__ */ new WeakMap();
Z = /* @__PURE__ */ new WeakSet();
ot = async function() {
  try {
    await this.getContext(B, { passContextAliasMatches: !0 }), this.consumeContext(B, (t) => {
      t && this.observe(
        m([t.unique, t.structure.contentTypeUniques]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i?.[0]);
        }
      );
    }).passContextAliasMatches();
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
ee = /* @__PURE__ */ new WeakMap();
st = function() {
  this.consumeContext(xt, (t) => {
    t && this.observe(
      m([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([
        e,
        i,
        o,
        s,
        r
      ]) => {
        this._blockContext.blockEditorAlias = r ?? "", this.blockSingleValue = {
          contentData: e?.filter((n) => n.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((n) => n.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.SingleBlock": o?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, this._blockContext.blockIndex = e?.indexOf(this.blockSingleValue.contentData[0]), !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
O.styles = [
  ...k.styles,
  ne`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
];
ve([
  D()
], O.prototype, "_blockSingleValue", 2);
ve([
  T({ attribute: !1 })
], O.prototype, "blockSingleValue", 1);
O = ve([
  re(di)
], O);
var pi = Object.defineProperty, bi = Object.getOwnPropertyDescriptor, nt = (t) => {
  throw TypeError(t);
}, ge = (t, e, i, o) => {
  for (var s = o > 1 ? void 0 : o ? bi(e, i) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (s = (o ? n(e, i, s) : n(s)) || s);
  return o && s && pi(e, i, s), s;
}, xe = (t, e, i) => e.has(t) || nt("Cannot " + i), X = (t, e, i) => (xe(t, e, "read from private field"), e.get(t)), F = (t, e, i) => e.has(t) ? nt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), fe = (t, e, i, o) => (xe(t, e, "write to private field"), e.set(t, i), i), Re = (t, e, i) => (xe(t, e, "access private method"), i), R, te, rt, ie, oe, at;
const ki = "rich-text-preview";
let W = class extends k {
  constructor() {
    super(), F(this, te), F(this, R), this._blockContext = {
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
    }, this._blockRteValue = {
      layout: {},
      expose: [],
      contentData: [],
      settingsData: []
    }, F(this, ie, !1), F(this, oe, !1), fe(this, R, new le());
  }
  set blockRteValue(t) {
    const e = t ? { ...t } : {};
    e.layout ??= {}, e.contentData ??= [], e.settingsData ??= [], e.expose ??= [], this._blockRteValue = e;
  }
  get blockRteValue() {
    return this._blockRteValue;
  }
  setupContextObservers() {
    this.observePropertyDataset(), this.observeBlockValue(), Re(this, te, rt).call(this);
  }
  observeBlockValue() {
    X(this, ie) || (fe(this, ie, !0), this.consumeContext(Tt, (t) => {
      t != null && this.observe(
        m([
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
          s,
          r
        ]) => {
          this._blockContext.contentUdi = e ?? "", this._blockContext.settingsUdi = i ?? "", this._blockContext.workspaceEditContentPath = o ?? "", this._blockContext.contentElementTypeAlias = s ?? "", this._blockContext.contentElementTypeKey = r ?? "", !X(this, oe) && this._blockContext.contentUdi && (fe(this, oe, !0), await Re(this, te, at).call(this));
        }
      );
    }));
  }
  callPreviewApi() {
    return X(this, R).previewRichTextMarkup(
      JSON.stringify(this.blockRteValue),
      {
        blockEditorAlias: this._blockContext.blockEditorAlias,
        nodeKey: this._blockContext.unique,
        contentElementAlias: this._blockContext.contentElementTypeAlias,
        documentTypeUnique: this._blockContext.documentTypeUnique,
        culture: this._blockContext.culture
      }
    );
  }
  fetchStylesheets() {
    return X(this, R).getRteStylesheets({
      documentTypeUnique: this._blockContext.documentTypeUnique,
      nodeKey: this._blockContext.unique
    });
  }
};
R = /* @__PURE__ */ new WeakMap();
te = /* @__PURE__ */ new WeakSet();
rt = function() {
  try {
    this.consumeContext(Ut, (t) => {
      t && (this._workspaceContextResolved = !0, this.observe(
        m([t.unique, t.contentTypeUnique]),
        async ([e, i]) => {
          await this.handleWorkspaceData(e?.toString(), i);
        }
      ));
    }).passContextAliasMatches();
  } catch {
    this.observeBlockWorkspaceFallback();
  }
};
ie = /* @__PURE__ */ new WeakMap();
oe = /* @__PURE__ */ new WeakMap();
at = function() {
  this.consumeContext(Et, (t) => {
    t != null && this.observe(
      m([
        t.contents,
        t.settings,
        t.layouts,
        t.exposes,
        t.propertyAlias
      ]),
      async ([
        e,
        i,
        o,
        s,
        r
      ]) => {
        this._blockContext.blockEditorAlias = r ?? "", this.blockRteValue = {
          contentData: e?.filter((n) => n.key === this._blockContext.contentUdi) ?? [],
          settingsData: i?.filter((n) => n.key === this._blockContext.settingsUdi) ?? [],
          expose: s?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? [],
          layout: {
            "Umbraco.RichText": o?.filter((n) => n.contentKey === this._blockContext.contentUdi) ?? []
          }
        }, !this._htmlMarkup && !this._isLoading && this.renderBlockPreview();
      }
    );
  });
};
ge([
  D()
], W.prototype, "_blockRteValue", 2);
ge([
  T({ attribute: !1 })
], W.prototype, "blockRteValue", 1);
W = ge([
  re(ki)
], W);
class fi {
  #e;
  #t = 0;
  #i = [];
  constructor(e = 3) {
    this.#e = e;
  }
  /**
   * Enqueue a task to run with concurrency limiting.
   * If fewer than `maxConcurrent` tasks are active, the task runs immediately.
   * Otherwise it waits until a slot is available.
   */
  async enqueue(e) {
    this.#t >= this.#e && await new Promise((i) => {
      this.#i.push(i);
    }), this.#t++;
    try {
      return await e();
    } finally {
      this.#t--, this.#i.length > 0 && this.#i.shift()();
    }
  }
}
class ye extends Ie {
  #e = new fi(3);
  #t = /* @__PURE__ */ new Map();
  /** Shared concurrency-limited queue for preview API requests. */
  get requestQueue() {
    return this.#e;
  }
  // Node key cache used as a fallback when a preview cannot reach its content
  // workspace directly (e.g. when nested inside another block, whose workspace
  // context shadows the document workspace under the shared 'UmbWorkspaceContext'
  // alias).
  #i = new qe("");
  #o = new qe("");
  constructor(e) {
    super(e);
  }
  getUnique() {
    return this.#i.getValue();
  }
  async setUnique(e) {
    e !== "" && this.#i.setValue(e);
  }
  getDocumentTypeUnique() {
    return this.#o.getValue();
  }
  async setDocumentTypeUnique(e) {
    e !== "" && this.#o.setValue(e);
  }
  getOrCreateStylesheet(e) {
    const i = this.#t.get(e);
    if (i) return i;
    const o = fetch(e).then((s) => s.text()).then((s) => {
      const r = new CSSStyleSheet();
      return r.replaceSync(s), r;
    });
    return this.#t.set(e, o), o;
  }
}
const yi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BlockPreviewContext: ye,
  default: ye
}, Symbol.toStringTag, { value: "Module" })), _i = [
  {
    type: "globalContext",
    alias: "BlockPreview.Context",
    name: "BlockPreview Context",
    js: () => Promise.resolve().then(() => yi)
  }
], Ci = _i, mi = [
  {
    type: "localization",
    alias: "BlockPreview.Localization.En",
    name: "BlockPreview English Localization",
    meta: {
      culture: "en"
    },
    js: () => import("./en-BNTuLdKT.js")
  }
], vi = mi, $i = async (t, e) => {
  t.consumeContext(dt, async (i) => {
    if (!i) return;
    const o = i.getOpenApiConfiguration();
    x.setConfig({
      baseUrl: o?.base ?? "",
      auth: o?.token ?? void 0,
      credentials: o?.credentials ?? "same-origin"
    }), x.interceptors.request.use(async (a, l) => {
      const f = await o.token();
      return a.headers.set("Authorization", `Bearer ${f}`), a;
    });
    const r = await new oi(t).getSettings();
    let n = [];
    if (r) {
      if (r.blockGrid.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.GridCustomView",
          name: "BlockPreview Grid Custom View",
          element: I,
          forBlockEditor: "block-grid"
        };
        r.blockGrid.contentTypes?.length !== 0 && (a.forContentTypeAlias = r.blockGrid.contentTypes), n.push(a);
      }
      if (r.blockList.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.ListCustomView",
          name: "BlockPreview List Custom View",
          element: q,
          forBlockEditor: "block-list"
        };
        r.blockList.contentTypes?.length !== 0 && (a.forContentTypeAlias = r.blockList.contentTypes), n.push(a);
      }
      if (r.singleBlock.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.SingleBlockCustomView",
          name: "BlockPreview Single Block Custom View",
          element: O,
          forBlockEditor: "block-single"
        };
        r.singleBlock.contentTypes?.length !== 0 && (a.forContentTypeAlias = r.singleBlock.contentTypes), n.push(a);
      }
      if (r.richText.enabled) {
        let a = {
          type: "blockEditorCustomView",
          alias: "BlockPreview.RichTextCustomView",
          name: "BlockPreview Rich Text Custom View",
          element: W,
          forBlockEditor: "block-rte"
        };
        r.richText.contentTypes?.length !== 0 && (a.forContentTypeAlias = r.richText.contentTypes), n.push(a);
      }
    }
    e.registerMany([
      ...n,
      ...Ci,
      ...vi
    ]), t.provideContext(Xe, new ye(t));
  });
};
export {
  I as BlockGridPreviewCustomView,
  q as BlockListPreviewCustomView,
  k as BlockPreviewBaseElement,
  O as BlockSinglePreviewCustomView,
  le as PreviewDataSource,
  W as RichTextPreviewCustomView,
  ii as SettingsDataSource,
  oi as SettingsRepository,
  Le as isBlockActionNavigation,
  $i as onInit
};
//# sourceMappingURL=index.js.map

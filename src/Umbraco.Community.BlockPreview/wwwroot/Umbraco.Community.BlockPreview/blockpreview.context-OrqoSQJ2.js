var j = (e, t, r) => {
  if (!t.has(e))
    throw TypeError("Cannot " + r);
};
var i = (e, t, r) => (j(e, t, "read from private field"), r ? r.call(e) : t.get(e)), h = (e, t, r) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, r);
}, u = (e, t, r, n) => (j(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import { UmbControllerBase as I } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as H } from "@umbraco-cms/backoffice/context-api";
import { tryExecuteAndNotify as M } from "@umbraco-cms/backoffice/resources";
import { UMB_AUTH_CONTEXT as q } from "@umbraco-cms/backoffice/auth";
import { UmbStringState as _ } from "@umbraco-cms/backoffice/observable-api";
class P extends Error {
  constructor(t, r, n) {
    super(n), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = t;
  }
}
class G extends Error {
  constructor(t) {
    super(t), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var p, y, l, f, b, A, E;
class V {
  constructor(t) {
    h(this, p, void 0);
    h(this, y, void 0);
    h(this, l, void 0);
    h(this, f, void 0);
    h(this, b, void 0);
    h(this, A, void 0);
    h(this, E, void 0);
    u(this, p, !1), u(this, y, !1), u(this, l, !1), u(this, f, []), u(this, b, new Promise((r, n) => {
      u(this, A, r), u(this, E, n);
      const s = (c) => {
        var d;
        i(this, p) || i(this, y) || i(this, l) || (u(this, p, !0), (d = i(this, A)) == null || d.call(this, c));
      }, o = (c) => {
        var d;
        i(this, p) || i(this, y) || i(this, l) || (u(this, y, !0), (d = i(this, E)) == null || d.call(this, c));
      }, a = (c) => {
        i(this, p) || i(this, y) || i(this, l) || i(this, f).push(c);
      };
      return Object.defineProperty(a, "isResolved", {
        get: () => i(this, p)
      }), Object.defineProperty(a, "isRejected", {
        get: () => i(this, y)
      }), Object.defineProperty(a, "isCancelled", {
        get: () => i(this, l)
      }), t(s, o, a);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(t, r) {
    return i(this, b).then(t, r);
  }
  catch(t) {
    return i(this, b).catch(t);
  }
  finally(t) {
    return i(this, b).finally(t);
  }
  cancel() {
    var t;
    if (!(i(this, p) || i(this, y) || i(this, l))) {
      if (u(this, l, !0), i(this, f).length)
        try {
          for (const r of i(this, f))
            r();
        } catch (r) {
          console.warn("Cancellation threw an error", r);
          return;
        }
      i(this, f).length = 0, (t = i(this, E)) == null || t.call(this, new G("Request aborted"));
    }
  }
  get isCancelled() {
    return i(this, l);
  }
}
p = new WeakMap(), y = new WeakMap(), l = new WeakMap(), f = new WeakMap(), b = new WeakMap(), A = new WeakMap(), E = new WeakMap();
const v = {
  BASE: "",
  VERSION: "Latest",
  WITH_CREDENTIALS: !1,
  CREDENTIALS: "include",
  TOKEN: void 0,
  USERNAME: void 0,
  PASSWORD: void 0,
  HEADERS: void 0,
  ENCODE_PATH: void 0
}, R = (e) => e != null, k = (e) => typeof e == "string", O = (e) => k(e) && e !== "", N = (e) => typeof e == "object" && typeof e.type == "string" && typeof e.stream == "function" && typeof e.arrayBuffer == "function" && typeof e.constructor == "function" && typeof e.constructor.name == "string" && /^(Blob|File)$/.test(e.constructor.name) && /^(Blob|File)$/.test(e[Symbol.toStringTag]), $ = (e) => e instanceof FormData, F = (e) => {
  try {
    return btoa(e);
  } catch {
    return Buffer.from(e).toString("base64");
  }
}, W = (e) => {
  const t = [], r = (s, o) => {
    t.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(o))}`);
  }, n = (s, o) => {
    R(o) && (Array.isArray(o) ? o.forEach((a) => {
      n(s, a);
    }) : typeof o == "object" ? Object.entries(o).forEach(([a, c]) => {
      n(`${s}[${a}]`, c);
    }) : r(s, o));
  };
  return Object.entries(e).forEach(([s, o]) => {
    n(s, o);
  }), t.length > 0 ? `?${t.join("&")}` : "";
}, J = (e, t) => {
  const r = e.ENCODE_PATH || encodeURI, n = t.url.replace("{api-version}", e.VERSION).replace(/{(.*?)}/g, (o, a) => {
    var c;
    return (c = t.path) != null && c.hasOwnProperty(a) ? r(String(t.path[a])) : o;
  }), s = `${e.BASE}${n}`;
  return t.query ? `${s}${W(t.query)}` : s;
}, K = (e) => {
  if (e.formData) {
    const t = new FormData(), r = (n, s) => {
      k(s) || N(s) ? t.append(n, s) : t.append(n, JSON.stringify(s));
    };
    return Object.entries(e.formData).filter(([n, s]) => R(s)).forEach(([n, s]) => {
      Array.isArray(s) ? s.forEach((o) => r(n, o)) : r(n, s);
    }), t;
  }
}, C = async (e, t) => typeof t == "function" ? t(e) : t, z = async (e, t) => {
  const r = await C(t, e.TOKEN), n = await C(t, e.USERNAME), s = await C(t, e.PASSWORD), o = await C(t, e.HEADERS), a = Object.entries({
    Accept: "application/json",
    ...o,
    ...t.headers
  }).filter(([c, d]) => R(d)).reduce((c, [d, w]) => ({
    ...c,
    [d]: String(w)
  }), {});
  if (O(r) && (a.Authorization = `Bearer ${r}`), O(n) && O(s)) {
    const c = F(`${n}:${s}`);
    a.Authorization = `Basic ${c}`;
  }
  return t.body && (t.mediaType ? a["Content-Type"] = t.mediaType : N(t.body) ? a["Content-Type"] = t.body.type || "application/octet-stream" : k(t.body) ? a["Content-Type"] = "text/plain" : $(t.body) || (a["Content-Type"] = "application/json")), new Headers(a);
}, X = (e) => {
  var t;
  if (e.body !== void 0)
    return (t = e.mediaType) != null && t.includes("/json") ? JSON.stringify(e.body) : k(e.body) || N(e.body) || $(e.body) ? e.body : JSON.stringify(e.body);
}, Q = async (e, t, r, n, s, o, a) => {
  const c = new AbortController(), d = {
    headers: o,
    body: n ?? s,
    method: t.method,
    signal: c.signal
  };
  return e.WITH_CREDENTIALS && (d.credentials = e.CREDENTIALS), a(() => c.abort()), await fetch(r, d);
}, Y = (e, t) => {
  if (t) {
    const r = e.headers.get(t);
    if (k(r))
      return r;
  }
}, Z = async (e) => {
  if (e.status !== 204)
    try {
      const t = e.headers.get("Content-Type");
      if (t)
        return ["application/json", "application/problem+json"].some((s) => t.toLowerCase().startsWith(s)) ? await e.json() : await e.text();
    } catch (t) {
      console.error(t);
    }
}, tt = (e, t) => {
  const n = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...e.errors
  }[t.status];
  if (n)
    throw new P(e, t, n);
  if (!t.ok) {
    const s = t.status ?? "unknown", o = t.statusText ?? "unknown", a = (() => {
      try {
        return JSON.stringify(t.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new P(
      e,
      t,
      `Generic Error: status: ${s}; status text: ${o}; body: ${a}`
    );
  }
}, D = (e, t) => new V(async (r, n, s) => {
  try {
    const o = J(e, t), a = K(t), c = X(t), d = await z(e, t);
    if (!s.isCancelled) {
      const w = await Q(e, t, o, c, a, d, s), L = await Z(w), U = Y(w, t.responseHeader), B = {
        url: o,
        ok: w.ok,
        status: w.status,
        statusText: w.statusText,
        body: U ?? L
      };
      tt(t, B), r(B.body);
    }
  } catch (o) {
    n(o);
  }
});
class x {
  /**
   * @returns string Success
   * @throws ApiError
   */
  static postUmbracoBlockpreviewApiV1PreviewGridMarkup({
    pageId: t,
    blockEditorAlias: r = "",
    culture: n = "",
    requestBody: s
  }) {
    return D(v, {
      method: "POST",
      url: "/umbraco/blockpreview/api/v1/previewGridMarkup",
      query: {
        pageId: t,
        blockEditorAlias: r,
        culture: n
      },
      body: s,
      mediaType: "application/json"
    });
  }
  /**
   * @returns string Success
   * @throws ApiError
   */
  static postUmbracoBlockpreviewApiV1PreviewListMarkup({
    pageId: t,
    blockEditorAlias: r = "",
    culture: n = "",
    requestBody: s
  }) {
    return D(v, {
      method: "POST",
      url: "/umbraco/blockpreview/api/v1/previewListMarkup",
      query: {
        pageId: t,
        blockEditorAlias: r,
        culture: n
      },
      body: s,
      mediaType: "application/json"
    });
  }
}
var T;
class et {
  constructor(t) {
    h(this, T, void 0);
    u(this, T, t);
  }
  async previewGridMarkup(t, r, n, s) {
    return await M(i(this, T), x.postUmbracoBlockpreviewApiV1PreviewGridMarkup({ pageId: t, blockEditorAlias: r, culture: n, requestBody: s }));
  }
  async previewListMarkup(t, r, n, s) {
    return await M(i(this, T), x.postUmbracoBlockpreviewApiV1PreviewListMarkup({ pageId: t, blockEditorAlias: r, culture: n, requestBody: s }));
  }
}
T = new WeakMap();
var S;
class rt extends I {
  constructor(r) {
    super(r);
    h(this, S, void 0);
    u(this, S, new et(this));
  }
  async previewGridMarkup(r, n, s, o) {
    return await i(this, S).previewGridMarkup(r, n, s, o);
  }
  async previewListMarkup(r, n, s, o) {
    return await i(this, S).previewListMarkup(r, n, s, o);
  }
}
S = new WeakMap();
var g, m;
class st extends I {
  constructor(r) {
    super(r);
    h(this, g, void 0);
    h(this, m, void 0);
    u(this, m, new _("")), this.markup = i(this, m).asObservable(), this.provideContext(nt, this), u(this, g, new rt(this)), this.consumeContext(q, (n) => {
      v.TOKEN = () => n.getLatestToken(), v.WITH_CREDENTIALS = !0;
    });
  }
  async previewGridMarkup(r, n, s, o) {
    const { data: a } = await i(this, g).previewGridMarkup(r, n, s, o);
    a && i(this, m).setValue(a);
  }
  async previewListMarkup(r, n, s, o) {
    const { data: a } = await i(this, g).previewListMarkup(r, n, s, o);
    a && i(this, m).setValue(a);
  }
}
g = new WeakMap(), m = new WeakMap();
const nt = new H(st.name);
export {
  nt as BLOCKPREVIEW_MANAGEMENT_CONTEXT_TOKEN,
  st as BlockPreviewManagementContext,
  st as default
};
//# sourceMappingURL=blockpreview.context-OrqoSQJ2.js.map

import { onRequest as __api___route___ts_onRequest } from "C:\\Users\\tinht\\OneDrive\\Documents\\GitHub\\AI-Commic\\functions\\api\\[[route]].ts"
import { onRequest as ___middleware_js_onRequest } from "C:\\Users\\tinht\\OneDrive\\Documents\\GitHub\\AI-Commic\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/:route*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___route___ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]
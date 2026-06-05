export const ROUTES = {
  home: "/",
  access: "/Dashboard",
  stats: "/Stats",
  wiki: "/Yourself",
  account: "/Settings",
  data: "/Yourself",
  help: "/Help",
  learn: "/Learn",
  connect: "/connect"
}

const LEGACY_ROUTES = new Map([
  ["/dashboard", ROUTES.access],
  ["/Dashboard", ROUTES.access],
  ["/stats", ROUTES.stats],
  ["/Stats", ROUTES.stats],
  ["/wiki", ROUTES.wiki],
  ["/Wiki", ROUTES.wiki],
  ["/yourself", ROUTES.wiki],
  ["/Yourself", ROUTES.wiki],
  ["/ourselves", ROUTES.wiki],
  ["/Ourselves", ROUTES.wiki],
  ["/login", `${ROUTES.home}#sign-in`],
  ["/access", ROUTES.access],
  ["/Access", ROUTES.access],
  ["/account", ROUTES.account],
  ["/Account", ROUTES.account],
  ["/settings", ROUTES.account],
  ["/Settings", ROUTES.account],
  ["/learn", ROUTES.learn],
  ["/learn/", ROUTES.learn],
  ["/Learn/", ROUTES.learn],
  ["/data", ROUTES.wiki],
  ["/DataTransparency", ROUTES.wiki],
  ["/transparency", ROUTES.wiki],
  ["/data-transparency", ROUTES.wiki]
])

export function normalizePortalPath(pathname = "/") {
  return LEGACY_ROUTES.get(pathname) || pathname || ROUTES.home
}

export function pageFromLocation(locationLike = globalThis.window?.location) {
  const pathname = normalizePortalPath(locationLike?.pathname || ROUTES.home)
  if (/^\/u\/[^/]+\/?$/i.test(pathname)) return "publicWiki"
  if (pathname === ROUTES.access) return "access"
  if (pathname === ROUTES.stats) return "stats"
  if (pathname === ROUTES.wiki) return "wiki"
  if (pathname === ROUTES.account) return "account"
  if (pathname === ROUTES.help) return "help"
  if (pathname === ROUTES.learn) return "learn"
  if (pathname === ROUTES.connect) return "connect"
  return "home"
}

export function routeForPage(page = "home") {
  if (page === "publicWiki") return "/u"
  return ROUTES[page] || ROUTES.home
}

export function isProtectedPage(page = "home") {
  return page === "access" || page === "stats" || page === "wiki" || page === "account" || page === "data" || page === "connect"
}

export function isConnectPage(page = "home") {
  return page === "connect"
}

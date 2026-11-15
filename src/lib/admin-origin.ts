const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isAllowedAdminOrigin(request: Request, configuredOrigin: string | undefined, development: boolean) {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") return false;
  const target = new URL(request.url);
  let expected = configuredOrigin || target.origin;
  // Next's dev server uses localhost internally even when the browser connects
  // to 127.0.0.1. Match the browser's Host only for loopback on the same port.
  if (!configuredOrigin && development && loopbackHosts.has(target.hostname)) {
    const host = request.headers.get("host");
    if (host) {
      try {
        const local = new URL(`${target.protocol}//${host}`);
        if (local.host === host && loopbackHosts.has(local.hostname) && local.port === target.port) expected = local.origin;
      } catch { /* Invalid Host headers cannot change the expected origin. */ }
    }
  }
  return origin === expected;
}

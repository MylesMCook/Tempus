/** Pathname used for chrome such as current-nav. Trailing slashes do not change the route. */
export function pathnameFromUrl(url: string): string {
  let pathname = "/";
  try {
    pathname = new URL(url).pathname;
  } catch {
    const [path] = url.split("?");
    if (path?.startsWith("/")) pathname = path;
  }
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  return pathname || "/";
}

const REPO_BASE_SEGMENT = "/emcoaching-c539e048";

export const getAppBase = () => {
  if (typeof window === "undefined") {
    return import.meta.env.BASE_URL || "/";
  }

  const { pathname } = window.location;

  if (pathname === REPO_BASE_SEGMENT || pathname.startsWith(`${REPO_BASE_SEGMENT}/`)) {
    return REPO_BASE_SEGMENT;
  }

  const envBase = import.meta.env.BASE_URL || "/";
  return envBase === "/" ? "/" : envBase.replace(/\/$/, "");
};

export const withAppBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = getAppBase();

  if (base === "/") {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`;
};

export const assetWithBase = (path: string) => {
  const normalizedPath = path.replace(/^\//, "");
  const base = getAppBase();

  if (base === "/") {
    return `/${normalizedPath}`;
  }

  return `${base}/${normalizedPath}`;
};
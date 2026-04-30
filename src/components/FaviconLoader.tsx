import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Met à jour dynamiquement le favicon du site depuis site_settings.favicon_url.
 * Aucun rendu visuel.
 */
const FaviconLoader = () => {
  const { data: settings } = useSiteSettings();
  const url = settings?.favicon_url;

  useEffect(() => {
    if (!url) return;
    // Supprime tous les <link rel="icon"> existants
    document.querySelectorAll('link[rel~="icon"]').forEach((el) => el.parentNode?.removeChild(el));
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = url;
    document.head.appendChild(link);
  }, [url]);

  return null;
};

export default FaviconLoader;

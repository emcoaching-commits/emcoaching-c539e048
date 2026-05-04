import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/** Applique les couleurs du thème depuis site_settings (variables CSS HSL). */
const ThemeLoader = () => {
  const { data: settings } = useSiteSettings();
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    const map: Record<string, string | undefined> = {
      "--primary": settings.theme_primary,
      "--ring": settings.theme_primary,
      "--accent": settings.theme_accent,
      "--background": settings.theme_background,
      "--foreground": settings.theme_foreground,
    };
    Object.entries(map).forEach(([k, v]) => {
      if (v) root.style.setProperty(k, v);
    });
  }, [settings]);
  return null;
};

export default ThemeLoader;
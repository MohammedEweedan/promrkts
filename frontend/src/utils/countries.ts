import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import ar from "i18n-iso-countries/langs/ar.json";
import fr from "i18n-iso-countries/langs/fr.json";

countries.registerLocale(en);
countries.registerLocale(ar);
countries.registerLocale(fr);

export type CountryOption = { code: string; name: string };

/** Best-effort device region from browser language; SSR-safe (returns null server-side). */
export function getDeviceCountryCode(): string | null {
  try {
    if (typeof navigator === "undefined") return null;
    const lang = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    const m = /[-_](\w{2})/i.exec(lang);
    const code = (m?.[1] || "").toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

/** All countries localized; if deviceCode provided and present, it’s placed first. */
export function getAllCountries(
  locale: string,
  deviceCode?: string | null
): CountryOption[] {
  const lc = (locale || "en").slice(0, 2).toLowerCase();
  const namesLocal = countries.getNames(lc, { select: "official" }) as Record<string, string>;
  const namesEn = lc === "en"
    ? namesLocal
    : (countries.getNames("en", { select: "official" }) as Record<string, string>);

  const alpha2 = countries.getAlpha2Codes() as Record<string, string>;
  const all: CountryOption[] = Object.keys(alpha2).map((code) => ({
    code,
    name: namesLocal[code] || namesEn[code] || code,
  }));

  // Sort alphabetically by the localized name
  all.sort((a, b) => a.name.localeCompare(b.name));

  // If a device code exists and is in the list, put it at the top (no duplicate)
  if (deviceCode) {
    const idx = all.findIndex((c) => c.code === deviceCode);
    if (idx > -1) {
      const [first] = all.splice(idx, 1);
      return [first, ...all];
    }
  }
  return all;
}

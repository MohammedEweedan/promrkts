import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

type LanguageContextType = {
  language: string;
  direction: "ltr" | "rtl";
  changeLanguage: (lng: string) => void;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<string>(i18n.language);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const isRTL = direction === "rtl";

  // Update document direction and language when language changes
  useEffect(() => {
    const dir = language === "ar" ? "rtl" : "ltr";
    setDirection(dir);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;

    // Save language preference
    localStorage.setItem("i18nextLng", language);
  }, [language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);

    // Dispatch event for components that need to react to language changes
    window.dispatchEvent(
      new CustomEvent("languageChange", {
        detail: {
          language: lng,
          direction: lng === "ar" ? "rtl" : "ltr",
        },
      })
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, direction, changeLanguage, isRTL }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;

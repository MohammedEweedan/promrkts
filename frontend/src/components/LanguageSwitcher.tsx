import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { IconButton, Tooltip, styled, Box, Stack } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const PillIconButton = styled(IconButton)(({ theme }) => ({
  // GAJA gold; fallback
  color: "#dadada",
  borderRadius: 999,
  height: 32,
  minWidth: 48,
  lineHeight: 1,
  fontWeight: 800,
  fontSize: 16,
  letterSpacing: "0.64px",
  textTransform: "uppercase",
  padding: theme.spacing(0.5, 1),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage, isRTL } = useLanguage();
  const [open, setOpen] = React.useState(false);

  // Normalize language to base code ('ar' | 'en'), and provide a default
  const normalizedLang = (
    typeof language === "string" ? language.split("-")[0] : "en"
  ) as "ar" | "en" | "fr";

  const allLangs = ["en", "ar", "fr"] as const;
  const otherLangs = allLangs.filter((l) => l !== normalizedLang);
  const tooltip = normalizedLang === "ar" ? "Switch to English" : "التبديل إلى العربية";

  const handleMainClick = () => setOpen((v) => !v);
  const handleSelect = (code: "en" | "ar" | "fr") => {
    changeLanguage(code);
    setOpen(false);
  };

  // Language configuration
  const languageConfig = {
    ar: { label: "AR" },
    en: { label: "EN" },
    fr: { label: "FR" },
  } as const;

  const currentConfig = languageConfig[normalizedLang] ?? { label: "EN" };

  return (
    <Box
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}
    >
      <Tooltip title={tooltip} placement={isRTL ? "left" : "right"}>
        <PillIconButton onClick={handleMainClick} aria-label={`Language ${currentConfig.label}`}>
          <Box style={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "inherit" }}>
            <span style={{ fontSize: 20, color: "#65a8bf" }}>{currentConfig.label}</span>
          </Box>
        </PillIconButton>
      </Tooltip>

      {/* Sliding menu for other two languages */}
      <AnimatePresence initial={false}>
        {open && (
          <Box
            component={motion.div}
            key="lang-menu"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ overflow: "hidden", marginTop: 0.5, width: "auto" }}
          >
            <Stack spacing={0.5} alignItems="center">
              {otherLangs.map((code) => (
                <PillIconButton key={code} onClick={() => handleSelect(code)} aria-label={`Switch to ${languageConfig[code].label}`}>
                  <Box style={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "inherit", color: "#65a8bf"}}>
                    <span style={{ fontSize: 16, color: "#65a8bf" }}>{languageConfig[code].label}</span> </Box>
                </PillIconButton>
              ))}
            </Stack>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default LanguageSwitcher;

import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import SpotlightCard from "./SpotlightCard";

const languages = [
  { code: "EN", name: "English", flag: "🇺🇸" },
  { code: "AR", name: "العربية", flag: "🇸🇦" },
  { code: "FR", name: "Français", flag: "🇫🇷" },
  { code: "RU", name: "Русский", flag: "🇷🇺" },
  { code: "ZH", name: "中文", flag: "🇨🇳" },
  { code: "PT", name: "Português", flag: "🇧🇷" },
  { code: "ES", name: "Español", flag: "🇪🇸" },
  { code: "HI", name: "हिंदी", flag: "🇮🇳" },
  { code: "UR", name: "اردو", flag: "🇵🇰" },
  { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "NL", name: "Nederlands", flag: "🇳🇱" },
];

const LanguageModal: React.FC<{ isOpen: boolean; onClose: () => void; currentLang: string; onSelect: (lang: string) => void }> = ({
  isOpen,
  onClose,
  currentLang,
  onSelect,
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 1, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <SpotlightCard
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 24,
              borderRadius: 20,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(2, 1fr)", 
              gap: 10, 
              maxWidth: 520, 
              margin: "0 auto" 
            }}>
              {languages.map(({ code, name, flag }) => (
                <motion.button
                  key={code}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border:
                      currentLang === code ? "2px solid #65a8bf" : "1px solid rgba(0,0,0,0.2)",
                    background:
                      currentLang === code ? "rgba(104,165,191,1)" : "rgba(255,255,255,0.95)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                    color: currentLang === code ? "#fff" : "#222",
                    minWidth: 140,
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    onSelect(code);
                    onClose();
                  }}
                >
                  <span style={{ fontSize: 18 }}>{flag}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{name}</span>
                </motion.button>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LanguageModal;

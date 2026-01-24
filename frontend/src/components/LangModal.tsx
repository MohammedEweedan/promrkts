import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import SpotlightCard from "./SpotlightCard";

const languages = [
  { code: "EN", name: "English", flag: "🇬🇧" },
  { code: "AR", name: "العربية", flag: "🇸🇦" },
  { code: "FR", name: "Français", flag: "🇫🇷" },
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
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 520, margin: "0 auto" }}>
              {languages.map(({ code, name, flag }) => (
                <motion.button
                  key={code}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 14,
                    border:
                      currentLang === code ? "2px solid #65a8bf" : "1px solid rgba(0,0,0,1)",
                    background:
                      currentLang === code ? "rgba(104,165,191,1)" : "rgba(255,255,255,0.9)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#222",
                    minWidth: 240,
                  }}
                  onClick={() => {
                    onSelect(code);
                    onClose();
                  }}
                >
                  <span style={{ fontSize: 20 }}>{flag}</span>
                  <span style={{ flex: 1 }}>{name}</span>
                  <span style={{ opacity: 0.6 }}>{code}</span>
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

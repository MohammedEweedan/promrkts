/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/FadeInText.tsx
import React from "react";
import { Heading, Text, chakra, keyframes } from "@chakra-ui/react";
import { useThemeMode } from "../themeProvider";

const fadeUp = keyframes`
  0%   { opacity: 0; transform: translateY(8px) scale(0.99); filter: blur(1px); }
  60%  { opacity: 1; transform: translateY(0)   scale(1.0);  filter: blur(0); }
  100% { opacity: 1; }
`;

type Props = {
  as?: "h1" | "p";
  children: React.ReactNode;
  fontSize?: any;
  fontWeight?: "bold";
  color?: "#65a8bf";
  align?: any;
  dir?: "ltr" | "rtl";
  mode?: "dark" | "light";
};

export default function FadeInText({
  as = "h1",
  children,
  fontSize,
  fontWeight,
  color,
  align,
  dir = "ltr",
}: Props) {
  const Tag = as === "h1" ? Heading : Text;
  const { mode } = useThemeMode();
  return (
    <Tag
      as={as === "h1" ? "h1" : undefined}
      fontSize={fontSize}
      fontWeight={fontWeight}
      color={color}
      textAlign={align}
      dir={dir}
      lang={dir === "rtl" ? "ar" : undefined}
      lineHeight="1.1"
      whiteSpace="pre-wrap"
      sx={{
        animation: `${fadeUp} 520ms ease forwards`,
        position: "relative",
        // subtle “luxury” glass shadow
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "-6px -10px",
          borderRadius: "6px",
          backdropFilter: "blur(20px)",
          // background: mode === "dark" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)",
          zIndex: -1,
        },
      }}
      style={{
        unicodeBidi: "plaintext",
        textRendering: "optimizeLegibility",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <chakra.span>{children}</chakra.span>
    </Tag>
  );
}

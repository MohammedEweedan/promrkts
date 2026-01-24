/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Image, useBreakpointValue } from "@chakra-ui/react";
import { useThemeMode } from "../themeProvider";
import i18n from "i18next";

interface LogoProps {
  h?: number | string | (string | number)[];
}

const Logo: React.FC<LogoProps> = ({ h }) => {
  const isRTL = i18n.dir() === "rtl";
  const { mode, toggle } = useThemeMode();


  const src = useBreakpointValue({
    base:
      mode === "dark"
        ? process.env.PUBLIC_URL + "/text-logo.png"
        : process.env.PUBLIC_URL + "/text-logo.png",
    md:
      mode === "dark"
        ? process.env.PUBLIC_URL + "/text-logo.png"
        : process.env.PUBLIC_URL + "/text-logo.png",
  });

  // Default responsive height (base, md, lg)
  const responsiveHeight = h || [10, 28, 32];

  return (
    <Image src={src} height={responsiveHeight} width="auto" objectFit="contain" alt="promrkts" />
  );
};

export default Logo;

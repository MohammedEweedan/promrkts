import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Matcher = {
  key: string;
  match: (pathname: string) => boolean;
};

const ROUTE_TITLES: Matcher[] = [
  { key: "meta.home.title", match: (p) => p === "/" },
  { key: "meta.products.title", match: (p) => p === "/products" },
  { key: "meta.productDetail.title", match: (p) => p.startsWith("/products/") },
  { key: "meta.checkout.title", match: (p) => p === "/checkout" },
  { key: "meta.learn.title", match: (p) => p.startsWith("/learn/") },
  { key: "meta.enrolled.title", match: (p) => p === "/enrolled" },
  { key: "meta.contact.title", match: (p) => p === "/contact" },
  { key: "meta.login.title", match: (p) => p === "/login" },
  { key: "meta.forgotPassword.title", match: (p) => p === "/forgot-password" },
  { key: "meta.resetPassword.title", match: (p) => p.startsWith("/reset-password") },
  { key: "meta.register.title", match: (p) => p === "/register" },
  { key: "meta.dashboard.title", match: (p) => p === "/dashboard" },
  { key: "meta.path.title", match: (p) => p === "/path" },
  { key: "meta.progress.title", match: (p) => p === "/progress" },
  { key: "meta.account.title", match: (p) => p === "/account" },
  { key: "meta.admin.index.title", match: (p) => p === "/admin" },
  { key: "meta.admin.verifications.title", match: (p) => p === "/admin/verifications" },
  { key: "meta.admin.content.title", match: (p) => p === "/admin/content" },
  { key: "meta.admin.progress.title", match: (p) => p === "/admin/progress" },
  { key: "meta.resources.title", match: (p) => p === "/learn/resources" },
  { key: "meta.faq.title", match: (p) => p === "/learn/faq" },
  { key: "meta.policy.title", match: (p) => p === "/legal/policy" },
  { key: "meta.terms.title", match: (p) => p === "/legal/terms" },
  { key: "meta.about.title", match: (p) => p === "/company/about" },
  { key: "meta.careers.title", match: (p) => p === "/company/careers" },
  { key: "meta.cryptoGuide.title", match: (p) => p === "/guide/crypto" },
  { key: "meta.token.title", match: (p) => p === "/token" },
  { key: "meta.tokenCheckout.title", match: (p) => p === "/token/checkout" },
  { key: "meta.discord.title", match: (p) => p === "/discord" },
  { key: "meta.apply.title", match: (p) => p.startsWith("/apply/") },
  { key: "meta.broker.title", match: (p) => p === "/broker" },
  { key: "meta.notFound.title", match: (p) => p === "/404" },
];

const DEFAULT_KEY = "meta.default.title";

const DocumentTitle: React.FC = () => {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    const entry = ROUTE_TITLES.find((item) => item.match(pathname));
    const pageTitle =
      t(entry?.key ?? DEFAULT_KEY, { defaultValue: "promrkts" }) ||
      t(DEFAULT_KEY, { defaultValue: "promrkts" });
    const brandSuffix = t("meta.brand", { defaultValue: "promrkts" });
    document.title = brandSuffix ? `${pageTitle} | ${brandSuffix}` : pageTitle;
  }, [pathname, t, i18n.language]);

  return null;
};

export default DocumentTitle;

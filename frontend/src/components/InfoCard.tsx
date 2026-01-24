// src/components/InfoCard.tsx
import React from "react";
import styled from "styled-components";

type WalletInfo = {
  usdtAddress?: string | null;
  usdtNetwork?: string | null; // "TRC20" | "ERC20" or whatever you store
};

type InfoCardProps = {
  id?: string | number;
  name?: string | null;
  email?: string | null;

  firstPurchaseAt?: string | Date | null;
  levelLabel?: string | null;
  progressPercent?: number; // 0..100
  badges?: string[];
  streakDays?: number;

  // Token display (front top-right)
  tokenSymbol?: string; // default "PMKX"
  pmkxBalance?: number | string | bigint | null;
  pmkxValueUsd?: number | null; // USDT value

  // Back-only wallet info
  wallet?: WalletInfo | null;

  // Optional – pass your brand logo path from Dashboard
  logoSrc?: string;
};

const parseNumeric = (value: number | string | bigint | null | undefined): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const formatNum = (n: number, dp = 2) => {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: dp,
    minimumFractionDigits: dp,
  }).format(n);
};

const formatMoney = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);
};

const shortenAddress = (addr?: string | null, chars = 6) => {
  if (!addr) return "";
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
};

const InfoCard: React.FC<InfoCardProps> = ({
  id,
  name,
  email,
  firstPurchaseAt,
  levelLabel,
  progressPercent = 0,
  badges = [],
  streakDays = 0,
  tokenSymbol = "PMKX",
  pmkxBalance,
  pmkxValueUsd,
  wallet,
  logoSrc,
}) => {
  const displayName = (name || email || "Member").toString().toUpperCase().slice(0, 16) || "MEMBER";

  // Card number derived from id (purely cosmetic)
  const raw = (id ?? "").toString();
  const digitsOnly = raw.replace(/\D/g, "") || "0000000000000000";
  const padded = (digitsOnly + "0000000000000000").slice(0, 16);
  const numberGroups = padded.match(/.{1,4}/g)?.join(" ") ?? padded;

  // First purchase date formatting
  let memberSince = "Not yet";
  if (firstPurchaseAt) {
    const d = new Date(firstPurchaseAt);
    if (!isNaN(d.getTime())) {
      memberSince = d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
  }

  const levelText = levelLabel || "Member";

  // Footer pill: streak replaces Student
  const footerPrimaryPill =
    streakDays > 0 ? `🔥 ${streakDays} day${streakDays === 1 ? "" : "s"} streak` : "Student";

  // Keep "+X more" indicator for badges (optional)
  const remainingBadges = badges.length > 1 ? `+${badges.length - 1} more` : "";

  // Top-right holdings
  const bal = parseNumeric(pmkxBalance);
  const holdingsLine = `${bal > 0 ? formatNum(bal, 2) : "—"} ${tokenSymbol}`;
  const valueLine =
    pmkxValueUsd != null && Number.isFinite(pmkxValueUsd) && pmkxValueUsd > 0
      ? formatMoney(pmkxValueUsd)
      : "—";

  // Back-only wallet formatting
  const usdtNetwork = (wallet?.usdtNetwork || "").toUpperCase();
  const usdtAddr = wallet?.usdtAddress || "";
  const walletLabel = usdtAddr ? `${usdtNetwork || "USDT"} wallet` : "Wallet";
  const walletValue = usdtAddr ? shortenAddress(usdtAddr, 7) : "No wallet linked";

  return (
    <StyledWrapper>
      <div className="flip-card">
        <div className="flip-card-inner">
          {/* FRONT */}
          <div className="flip-card-front">
            <div className="card-header">
              <div className="brand-block">
                {logoSrc ? <img src={logoSrc} alt="Brand logo" className="brand-logo" /> : null}
              </div>

              {/* TOP RIGHT: PMKX holdings + value */}
              <div className="holdings-block">
                <div className="holdings-top">{holdingsLine}</div>
                <div className="holdings-sub">{valueLine}</div>
              </div>
            </div>

            <div className="card-main">
              <p className="card-name">{displayName}</p>

              <div className="card-number-row">
                <span className="card-number-label">ID</span>
                <span className="card-number">{numberGroups}</span>
              </div>
            </div>

            <div className="card-footer">
              <div className="meta-block">
                <span className="meta-label">Member since</span>
                <span className="meta-value">{memberSince}</span>
              </div>

              <div className="badge-row">
                <span className="badge-pill primary-badge">{footerPrimaryPill}</span>

                {remainingBadges && (
                  <span className="badge-pill secondary-badge">{remainingBadges}</span>
                )}
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="flip-card-back">
            <div className="back-content">
              <div className="back-row">
                <span className="back-label">Member since</span>
                <span className="back-value">{memberSince}</span>
              </div>

              <div className="back-row">
                <span className="back-label">Level</span>
                <span className="back-value">{levelText}</span>
              </div>

              <div className="back-row">
                <span className="back-label">{tokenSymbol}</span>
                <span className="back-value">{holdingsLine}</span>
              </div>

              <div className="back-row">
                <span className="back-label">Value</span>
                <span className="back-value">{valueLine}</span>
              </div>

              {/* BACK ONLY WALLET */}
              <div className="back-row wallet-row">
                <span className="back-label">{walletLabel}</span>
                <span className="back-value wallet-value">{walletValue}</span>
              </div>

              <div className="back-row back-row-column">
                <div className="back-badges">
                  {badges.length === 0 && (
                    <span className="badge-pill subtle-badge">No badges yet</span>
                  )}
                  {badges.map((b) => (
                    <span key={b} className="badge-pill subtle-badge">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  .flip-card {
    background-color: transparent;
    width: 380px;
    height: 230px;
    perspective: 1200px;
    color: white;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: left;
    transition: transform 0.8s ease;
    transform-style: preserve-3d;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 1.25rem;
    padding: 1.4rem 1.6rem;
    box-shadow: 0 20px 35px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.03);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  .flip-card-front {
    background: radial-gradient(circle at top left, #65a8bf 0, #65a8bf94 35%, #65a8bf48 85%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .flip-card-back {
    background: radial-gradient(circle at top, #65a8bf84 0, #65a8bf44 70%);
    transform: rotateY(180deg);
    position: relative;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .brand-block {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .brand-logo {
    height: 26px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.6));
  }

  .holdings-block {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    padding: 0.4rem 0.6rem;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid rgba(148, 225, 255, 0.35);
    min-width: 140px;
  }

  .holdings-top {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .holdings-sub {
    margin-top: 0.1rem;
    font-size: 0.72rem;
    opacity: 0.85;
    font-weight: 600;
  }

  .card-main {
    margin-top: 0.8rem;
  }

  .card-name {
    font-size: 1.15rem;
    letter-spacing: 0.08em;
    font-weight: 600;
    text-transform: uppercase;
  }

  .card-number-row {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .card-number-label {
    font-size: 0.65rem;
    opacity: 0.7;
  }

  .card-number {
    font-family: "SF Mono", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
      monospace;
    letter-spacing: 0.2em;
    font-size: 0.85rem;
  }

  .card-footer {
    margin-top: 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .meta-block {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .meta-label {
    font-size: 0.65rem;
    opacity: 0.7;
  }

  .meta-value {
    font-size: 0.8rem;
    font-weight: 500;
  }

  .badge-row {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .badge-pill {
    font-size: 0.65rem;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: #65a8bf;
    backdrop-filter: blur(8px);
    white-space: nowrap;
  }

  .primary-badge {
    border-color: #65a8bf;
    background: rgba(0, 191, 99, 1);
  }

  .secondary-badge {
    opacity: 0.85;
  }

  .back-content {
    position: relative;
    margin-top: 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .back-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    gap: 0.75rem;
  }

  .back-label {
    opacity: 0.7;
    min-width: 90px;
  }

  .back-value {
    font-weight: 500;
    text-align: right;
  }

  .wallet-row {
    align-items: flex-start;
  }

  .wallet-value {
    font-family: "SF Mono", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
      monospace;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    max-width: 180px;
    word-break: break-all;
  }

  .back-row-column {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 0.2rem;
  }

  .back-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.15rem;
  }

  .subtle-badge {
    border-color: rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.7);
  }
`;

export default InfoCard;

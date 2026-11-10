import React from 'react';
import {C, ui} from '../theme';

/** White card styled like the calculator cards on the website. */
export const SiteCard: React.FC<{
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({style, children}) => (
  <div
    style={{
      background: C.white,
      borderRadius: 28,
      border: `2px solid ${C.cardBorder}`,
      boxShadow: '0 40px 80px rgba(0,30,20,0.35), 0 8px 20px rgba(0,30,20,0.15)',
      fontFamily: ui,
      color: C.text,
      padding: 44,
      ...style,
    }}
  >
    {children}
  </div>
);

export const StatTile: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
  style?: React.CSSProperties;
}> = ({label, value, highlight, style}) => (
  <div
    style={{
      background: highlight ? C.cardTint : C.white,
      border: `2px solid ${highlight ? '#cfe5da' : C.cardBorder}`,
      borderRadius: 22,
      padding: '22px 18px',
      textAlign: 'center',
      fontFamily: ui,
      ...style,
    }}
  >
    <div style={{fontSize: 24, color: C.muted, fontWeight: 500}}>{label}</div>
    <div
      style={{
        fontSize: 46,
        fontWeight: 800,
        marginTop: 6,
        color: highlight ? C.green : C.text,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
  </div>
);

export const Logo: React.FC<{size?: number; onDark?: boolean}> = ({
  size = 64,
  onDark = true,
}) => (
  <div
    style={{
      fontFamily: ui,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '-0.03em',
      color: onDark ? C.white : C.forest,
      whiteSpace: 'nowrap',
    }}
  >
    Mortgages <span style={{color: onDark ? C.mint : C.green}}>by Alex</span>
  </div>
);

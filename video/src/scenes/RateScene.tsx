import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, display, ui} from '../theme';
import {clamp, EASE_IN_OUT, EASE_OUT, money, pop, ramp, shake} from '../anim';
import {SiteCard, StatTile} from '../components/Site';

type Cues = Record<string, number>;

export const RateVisual: React.FC<{cues: Cues}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const rateIn = pop(frame, cues.rate, fps);
  const penaltyIn = pop(frame, cues.penalty, fps, {damping: 15});
  const rateOut = ramp(frame, cues.ticket - 4, 12, EASE_IN_OUT);
  const ticketIn = pop(frame, cues.ticket, fps, {damping: 14});
  const stamp = pop(frame, cues.baggage, fps, {damping: 11, stiffness: 300});
  const ticketOut = ramp(frame, cues.savings - 4, 12, EASE_IN_OUT);
  const tiles = (i: number) => pop(frame, cues.savings + 2 + i * 4, fps);
  const sav = interpolate(frame, [cues.savings + 10, cues.savings + 40], [0, 11807], {
    ...clamp,
    easing: EASE_OUT,
  });
  const monthly = interpolate(frame, [cues.savings + 6, cues.savings + 30], [0, 328], {
    ...clamp,
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill>
      {/* Shiny low rate... with a catch */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 330,
          width: 860,
          opacity: rateIn * (1 - rateOut),
          scale: interpolate(rateIn, [0, 1], [0.7, 1]),
          translate: `${shake(frame, cues.penalty, 16) - rateOut * 1100}px 0px`,
          rotate: `${-2 + rateOut * -12}deg`,
        }}
      >
        <SiteCard style={{padding: 50}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontSize: 32, color: C.muted, fontWeight: 600}}>Фіксована ставка</div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: C.white,
                background: C.danger,
                padding: '8px 18px',
                borderRadius: 999,
              }}
            >
              АКЦІЯ!
            </div>
          </div>
          <div
            style={{
              fontSize: 170,
              fontWeight: 800,
              color: C.green,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
            }}
          >
            3.99%
          </div>
          <div
            style={{
              marginTop: 20,
              overflow: 'hidden',
              height: interpolate(penaltyIn, [0, 1], [0, 120]),
              borderTop: `2px dashed ${C.cardBorder}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 26,
                color: C.danger,
                fontWeight: 700,
                fontSize: 34,
              }}
            >
              <span>Штраф за дострок. погашення</span>
              <span style={{fontSize: 46, fontWeight: 800}}>$18 400</span>
            </div>
          </div>
          <div style={{fontSize: 18, color: C.muted, marginTop: 6, opacity: penaltyIn}}>
            *дрібним шрифтом, звісно
          </div>
        </SiteCard>
      </div>

      {/* Cheap ticket, expensive bags */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 380,
          width: 900,
          opacity: ticketIn * (1 - ticketOut),
          translate: `${interpolate(ticketIn, [0, 1], [1100, 0]) - ticketOut * 1100}px ${shake(frame, cues.baggage, 10)}px`,
          rotate: '3deg',
        }}
      >
        <div
          style={{
            display: 'flex',
            background: C.white,
            borderRadius: 30,
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
            fontFamily: ui,
            color: C.text,
          }}
        >
          <div style={{flex: 1, padding: 44}}>
            <div style={{fontSize: 26, color: C.muted, fontWeight: 600, letterSpacing: '0.1em'}}>
              BOARDING PASS
            </div>
            <div
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: 88,
                marginTop: 18,
                display: 'flex',
                gap: 24,
                alignItems: 'center',
              }}
            >
              YYC <span style={{fontSize: 56, color: C.green}}>✈</span> CUN
            </div>
            <div style={{fontSize: 26, color: C.muted, marginTop: 8}}>Калгарі → Канкун</div>
          </div>
          <div
            style={{
              width: 270,
              borderLeft: `4px dashed ${C.cardBorder}`,
              background: C.cardTint,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{fontSize: 26, color: C.muted, fontWeight: 600}}>ЦІНА</div>
            <div style={{fontSize: 96, fontWeight: 800, color: C.green}}>$49</div>
          </div>
        </div>
        {/* stamp */}
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 230,
            padding: '16px 30px',
            border: `7px solid ${C.danger}`,
            borderRadius: 16,
            color: C.danger,
            fontFamily: display,
            fontWeight: 900,
            fontSize: 58,
            background: 'rgba(255,255,255,0.92)',
            rotate: '-11deg',
            scale: interpolate(stamp, [0, 1], [2.4, 1]),
            opacity: interpolate(frame - cues.baggage, [0, 3], [0, 1], clamp),
          }}
        >
          БАГАЖ +$189
        </div>
      </div>

      {/* The right terms: real refinance numbers from the website calculator */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 340,
          width: 920,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 26,
        }}
      >
        {[
          {label: 'Поточний платіж', value: '$2 660'},
          {label: 'Новий платіж', value: '$2 332'},
          {label: 'Економія / міс', value: money(monthly), hl: true},
          {label: 'Економія за термін', value: money(sav), hl: true},
        ].map((t, i) => (
          <div
            key={t.label}
            style={{
              opacity: tiles(i),
              translate: `0px ${interpolate(tiles(i), [0, 1], [80, 0])}px`,
            }}
          >
            <StatTile
              label={t.label}
              value={t.value}
              highlight={t.hl}
              style={{
                padding: '34px 18px',
                boxShadow: t.hl ? `0 0 40px ${C.mint}66` : '0 20px 40px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

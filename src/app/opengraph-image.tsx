import { ImageResponse } from 'next/og';

import { BrandHeart } from '@/lib/brand-mark';
import { SITE_NAME, SITE_OG_DESCRIPTION, SITE_TAGLINE } from '@/lib/site';

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 45%, #ecfeff 100%)',
          color: '#14082e',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <BrandHeart size={112} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 600,
                color: '#7c3aed',
                lineHeight: 1.2,
              }}
            >
              {SITE_TAGLINE}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 40,
            maxWidth: 880,
            fontSize: 30,
            lineHeight: 1.45,
            color: '#2a1259',
          }}
        >
          {SITE_OG_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size },
  );
}

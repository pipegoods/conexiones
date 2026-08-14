import { ImageResponse } from 'next/og';

import { BrandHeart } from '@/lib/brand-mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 55%, #ecfeff 100%)',
        }}
      >
        <BrandHeart size={128} />
      </div>
    ),
    { ...size },
  );
}

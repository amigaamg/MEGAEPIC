// AMEXAN Universal Avatar Component
// Constitutional Principle: Identities are permanent, surfaces are not.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { componentDataAttr } from './types';
import type { UniversalComponentProps } from './types';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends UniversalComponentProps {
  name: string;
  src?: string;
  avatarSize?: AvatarSize;
  status?: 'online' | 'offline' | 'away' | 'busy';
  presenceLabel?: string;
}

const AVATAR_SIZES: Record<AvatarSize, { size: number; fontSize: string }> = {
  xs: { size: 24, fontSize: typographyTokens.caption.fontSize },
  sm: { size: 32, fontSize: typographyTokens.bodySmall.fontSize },
  md: { size: 40, fontSize: typographyTokens.body.fontSize },
  lg: { size: 56, fontSize: typographyTokens.h4.fontSize },
  xl: { size: 80, fontSize: typographyTokens.h2.fontSize },
};

const STATUS_COLORS: Record<NonNullable<AvatarProps['status']>, string> = {
  online: colorTokens.success.DEFAULT,
  offline: colorTokens.neutral[400],
  away: colorTokens.warning.DEFAULT,
  busy: colorTokens.danger.DEFAULT,
};

export const initialsOf = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, src, avatarSize = 'md', status, presenceLabel, className = '', testId, id, ...props }, ref) => {
    const { size, fontSize } = AVATAR_SIZES[avatarSize];

    return (
      <div
        ref={ref}
        data-testid={testId}
        style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
        {...componentDataAttr({ testId, id }, 'avatar')}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            aria-label={name}
            role="img"
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: colorTokens.primary.surface,
              color: colorTokens.primary.DEFAULT,
              fontSize,
              fontWeight: 600,
              fontFamily: typographyTokens.body.fontFamily,
            }}
          >
            {initialsOf(name)}
          </div>
        )}
        {status ? (
          <span
            aria-label={presenceLabel || status}
            title={presenceLabel || status}
            style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: size >= 56 ? 14 : 10,
              height: size >= 56 ? 14 : 10,
              borderRadius: '50%',
              background: STATUS_COLORS[status],
              border: `2px solid ${colorTokens.secondary.DEFAULT}`,
            }}
          />
        ) : null}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';
export default Avatar;

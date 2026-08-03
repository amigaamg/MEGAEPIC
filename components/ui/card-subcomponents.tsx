// AMEXAN Universal Card Sub-components
// Constitutional Principle: Cards follow Header, Body, Footer, Actions, Status, Metadata

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { radiusTokens } from '@/lib/design/tokens/index';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className = '', children, ...props 
}) => (
  <div 
    className={`amexan-card__header ${className}`} 
    style={{ 
      marginBottom: spacingTokens[3],
      paddingBottom: spacingTokens[2],
      borderBottom: `1px solid ${colorTokens.neutral[200]}`,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ 
  className = '', children, ...props 
}) => (
  <h3 
    className={`amexan-card__title ${className}`}
    style={{
      fontSize: typographyTokens.h4.fontSize,
      fontWeight: typographyTokens.h4.fontWeight,
      lineHeight: typographyTokens.h4.lineHeight,
      margin: 0,
    }}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ 
  className = '', children, ...props 
}) => (
  <p 
    className={`amexan-card__description ${className}`}
    style={{
      fontSize: typographyTokens.bodySmall.fontSize,
      lineHeight: typographyTokens.bodySmall.lineHeight,
      color: colorTokens.neutral[500],
      margin: 0,
      marginTop: spacingTokens[1],
    }}
    {...props}
  >
    {children}
  </p>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className = '', children, ...props 
}) => (
  <div 
    className={`amexan-card__body ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className = '', children, ...props 
}) => (
  <div 
    className={`amexan-card__footer ${className}`}
    style={{ 
      marginTop: spacingTokens[3], 
      paddingTop: spacingTokens[3],
      borderTop: `1px solid ${colorTokens.neutral[200]}`,
    }}
    {...props}
  >
    {children}
  </div>
);

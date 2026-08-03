'use client'

import Link from 'next/link'
import type { HeroButton } from '@/lib/homepage/types'
import { getIcon } from '../icons'

interface HeroButtonsProps {
  buttons: HeroButton[]
}

// HeroButtons — constitutional hero actions.
// Primary: Start Free. Secondary: Book Demo. Ghost: Explore Platform.
// Never "Buy Now" or "Contact Sales".

export default function HeroButtons({ buttons }: HeroButtonsProps) {
  return (
    <div className="hp-hero-actions">
      {buttons.map((button) => {
        const Icon = getIcon(button.icon)
        return (
          <Link
            key={button.id}
            href={button.route}
            className={`hp-btn hp-btn-${button.variant}`}
            aria-label={`${button.label} — ${button.description}`}
          >
            {Icon && <Icon size={17} />}
            {button.label}
          </Link>
        )
      })}
    </div>
  )
}

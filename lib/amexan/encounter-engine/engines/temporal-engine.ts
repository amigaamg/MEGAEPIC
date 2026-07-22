export interface TemporalExpression {
  type: 'point' | 'interval' | 'relative' | 'recurring'
  value: string | number
  unit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  reference?: 'now' | 'onset' | 'admission' | 'custom'
  referenceDate?: number
}

export interface TemporalFact {
  key: string
  expression: TemporalExpression
  originalText: string
  confidence: 'certain' | 'estimated' | 'uncertain'
}

export interface TemporalRelationship {
  factA: string
  factB: string
  relationship: 'before' | 'after' | 'during' | 'overlapping' | 'same_time' | 'unknown'
  confidence: number
}

const UNIT_TO_MS: Record<string, number> = {
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
  weeks: 604_800_000,
  months: 2_592_000_000,
  years: 31_536_000_000,
}

export function parseDurationToMs(duration: string): number {
  const match = duration.trim().match(/^(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)$/i)
  if (!match) return 0
  const val = parseFloat(match[1])
  const unitRaw = match[2].toLowerCase()
  const unitMap: Record<string, string> = {
    minute: 'minutes', minutes: 'minutes', min: 'minutes', mins: 'minutes',
    hour: 'hours', hours: 'hours', hr: 'hours', hrs: 'hours',
    day: 'days', days: 'days',
    week: 'weeks', weeks: 'weeks',
    month: 'months', months: 'months',
    year: 'years', years: 'years',
  }
  const normalized = unitMap[unitRaw]
  if (!normalized) return 0
  return val * (UNIT_TO_MS[normalized] || 0)
}

export function resolveTemporalExpression(
  expr: TemporalExpression,
  now?: number,
): { start: number; end: number } {
  const reference = now ?? Date.now()
  const ref = (() => {
    switch (expr.reference) {
      case 'custom':
        return expr.referenceDate ?? reference
      case 'onset':
      case 'admission':
      case 'now':
      default:
        return reference
    }
  })()

  if (expr.type === 'point') {
    const val = typeof expr.value === 'number' ? expr.value : parseFloat(expr.value)
    if (expr.unit) {
      const ms = val * (UNIT_TO_MS[expr.unit] || 0)
      return { start: ref - ms, end: ref - ms + 3600_000 }
    }
    return { start: ref - val, end: ref - val + 3600_000 }
  }

  if (expr.type === 'interval') {
    const val = typeof expr.value === 'number' ? expr.value : parseFloat(expr.value)
    const ms = expr.unit ? val * (UNIT_TO_MS[expr.unit] || 0) : val
    return { start: ref - ms, end: ref }
  }

  if (expr.type === 'relative') {
    const val = typeof expr.value === 'number' ? expr.value : parseFloat(expr.value)
    const ms = expr.unit ? val * (UNIT_TO_MS[expr.unit] || 0) : val
    return { start: ref + ms - 3600_000, end: ref + ms + 3600_000 }
  }

  if (expr.type === 'recurring') {
    const val = typeof expr.value === 'number' ? expr.value : parseFloat(expr.value)
    const ms = expr.unit ? val * (UNIT_TO_MS[expr.unit] || 0) : val
    return { start: ref - ms, end: ref }
  }

  return { start: ref - 3600_000, end: ref }
}

export function computeTemporalRelationship(
  factA: TemporalFact,
  factB: TemporalFact,
  context: { now: number },
): TemporalRelationship {
  const rangeA = resolveTemporalExpression(factA.expression, context.now)
  const rangeB = resolveTemporalExpression(factB.expression, context.now)

  const aStart = rangeA.start
  const aEnd = rangeA.end
  const bStart = rangeB.start
  const bEnd = rangeB.end

  const confidences: Record<string, number> = {
    certain: 1.0,
    estimated: 0.7,
    uncertain: 0.4,
  }

  const baseConfidence = Math.min(
    confidences[factA.confidence] ?? 0.5,
    confidences[factB.confidence] ?? 0.5,
  )

  if (aEnd < bStart) {
    return { factA: factA.key, factB: factB.key, relationship: 'before', confidence: baseConfidence }
  }
  if (bEnd < aStart) {
    return { factA: factA.key, factB: factB.key, relationship: 'after', confidence: baseConfidence }
  }
  if (aStart <= bStart && aEnd >= bEnd) {
    return { factA: factA.key, factB: factB.key, relationship: 'during', confidence: baseConfidence }
  }
  if (bStart <= aStart && bEnd >= aEnd) {
    return { factA: factA.key, factB: factB.key, relationship: 'during', confidence: baseConfidence }
  }
  if (aStart === bStart && aEnd === bEnd) {
    return { factA: factA.key, factB: factB.key, relationship: 'same_time', confidence: baseConfidence }
  }
  if (aStart < bEnd && bStart < aEnd) {
    return { factA: factA.key, factB: factB.key, relationship: 'overlapping', confidence: baseConfidence }
  }

  return { factA: factA.key, factB: factB.key, relationship: 'unknown', confidence: baseConfidence * 0.5 }
}

export function buildTimelineFromFacts(facts: TemporalFact[], now?: number): TemporalFact[] {
  const ref = now ?? Date.now()
  return [...facts].sort((a, b) => {
    const rangeA = resolveTemporalExpression(a.expression, ref)
    const rangeB = resolveTemporalExpression(b.expression, ref)
    return rangeA.start - rangeB.start
  })
}

export function extractTemporalExpression(text: string): TemporalExpression | null {
  const cleaned = text.trim().toLowerCase()

  // "for X unit" or "X unit" (duration interval)
  const durationMatch = cleaned.match(
    /^(?:for\s+)?(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)$/i,
  )
  if (durationMatch) {
    const unit = normalizeUnit(durationMatch[2])
    return {
      type: 'interval',
      value: parseFloat(durationMatch[1]),
      unit: unit as TemporalExpression['unit'],
      reference: 'now',
    }
  }

  // "X unit ago"
  const agoMatch = cleaned.match(
    /^(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)\s+ago$/i,
  )
  if (agoMatch) {
    const unit = normalizeUnit(agoMatch[2])
    return {
      type: 'point',
      value: parseFloat(agoMatch[1]),
      unit: unit as TemporalExpression['unit'],
      reference: 'now',
    }
  }

  // "since yesterday" / "since last X"
  const sinceMatch = cleaned.match(/^since\s+(yesterday|last\s+\w+|(\d+)\s*(days?|weeks?)\s+ago)$/i)
  if (sinceMatch) {
    return {
      type: 'interval',
      value: sinceMatch[3] ? parseFloat(sinceMatch[3]) : 1,
      unit: sinceMatch[4] ? normalizeUnit(sinceMatch[4]) as TemporalExpression['unit'] : 'days',
      reference: 'now',
    }
  }

  // "last X unit" (e.g. "last 3 days")
  const lastMatch = cleaned.match(/^last\s+(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)$/i)
  if (lastMatch) {
    const unit = normalizeUnit(lastMatch[2])
    return {
      type: 'interval',
      value: parseFloat(lastMatch[1]),
      unit: unit as TemporalExpression['unit'],
      reference: 'now',
    }
  }

  // "now" / "currently"
  if (/^(now|currently|present)$/i.test(cleaned)) {
    return { type: 'point', value: 0, reference: 'now' }
  }

  return null
}

export function getAgeInUnits(ageInYears: number): { years: number; months: number; weeks: number; days: number } {
  const years = Math.floor(ageInYears)
  const remainingAfterYears = ageInYears - years
  const totalMonths = remainingAfterYears * 12
  const months = Math.floor(totalMonths)
  const remainingAfterMonths = totalMonths - months
  const totalWeeks = remainingAfterMonths * 4.345
  const weeks = Math.floor(totalWeeks)
  const remainingAfterWeeks = totalWeeks - weeks
  const days = Math.round(remainingAfterWeeks * 7)
  return { years, months, weeks, days }
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = -ms
  if (ms < 1000) return '0 seconds'

  const units: { label: string; ms: number }[] = [
    { label: 'year', ms: UNIT_TO_MS.years },
    { label: 'month', ms: UNIT_TO_MS.months },
    { label: 'week', ms: UNIT_TO_MS.weeks },
    { label: 'day', ms: UNIT_TO_MS.days },
    { label: 'hour', ms: UNIT_TO_MS.hours },
    { label: 'minute', ms: UNIT_TO_MS.minutes },
  ]

  const parts: string[] = []
  let remaining = ms

  for (const unit of units) {
    const count = Math.floor(remaining / unit.ms)
    if (count > 0) {
      parts.push(`${count} ${unit.label}${count > 1 ? 's' : ''}`)
      remaining -= count * unit.ms
    }
  }

  return parts.join(', ') || '0 seconds'
}

function normalizeUnit(raw: string): string {
  const m: Record<string, string> = {
    minute: 'minutes', minutes: 'minutes', min: 'minutes', mins: 'minutes',
    hour: 'hours', hours: 'hours', hr: 'hours', hrs: 'hours',
    day: 'days', days: 'days',
    week: 'weeks', weeks: 'weeks',
    month: 'months', months: 'months',
    year: 'years', years: 'years',
  }
  return m[raw.toLowerCase()] || raw
}

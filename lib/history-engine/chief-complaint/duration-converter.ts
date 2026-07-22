export function parseDurationToHours(duration: string): number {
  if (!duration || duration.trim() === '') return 0;

  const cleaned = duration.toLowerCase().trim();

  const patterns: [RegExp, (match: RegExpMatchArray) => number][] = [
    [/^(\d+)\s*years?\s*$/i, (m) => parseInt(m[1]) * 365 * 24],
    [/^(\d+)\s*yrs?\s*$/i, (m) => parseInt(m[1]) * 365 * 24],
    [/^(\d+)\s*months?\s*$/i, (m) => parseInt(m[1]) * 30 * 24],
    [/^(\d+)\s*weeks?\s*$/i, (m) => parseInt(m[1]) * 7 * 24],
    [/^(\d+)\s*days?\s*$/i, (m) => parseInt(m[1]) * 24],
    [/^(\d+)\s*d\s*$/i, (m) => parseInt(m[1]) * 24],
    [/^(\d+)\s*hours?\s*$/i, (m) => parseInt(m[1])],
    [/^(\d+)\s*hrs?\s*$/i, (m) => parseInt(m[1])],
    [/^(\d+)\s*h\s*$/i, (m) => parseInt(m[1])],
    [/^(\d+)\s*minutes?\s*$/i, (m) => parseInt(m[1]) / 60],
    [/^(\d+)\s*mins?\s*$/i, (m) => parseInt(m[1]) / 60],
    [/^(\d+)\s*m\s*$/i, (m) => parseInt(m[1]) / 60],
    [/^(\d+)\s*$/i, (m) => parseInt(m[1]) * 24],
  ];

  for (const [regex, fn] of patterns) {
    const match = cleaned.match(regex);
    if (match) return Math.round(fn(match) * 100) / 100;
  }

  const rangeMatch = cleaned.match(/^(\d+)\s*[-–to]+\s*(\d+)\s*(years|yrs?|months?|weeks?|days?|hours?|hrs?|h|minutes?|mins?|m)?$/i);
  if (rangeMatch) {
    const avg = (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
    const unit = rangeMatch[3] || 'days';
    return parseDurationToHours(`${avg} ${unit}`);
  }

  return 0;
}

export function formatDurationFromHours(hours: number): string {
  if (hours <= 0) return 'Unknown';

  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  if (hours < 24) {
    const h = Math.round(hours);
    return `${h} hour${h !== 1 ? 's' : ''}`;
  }
  if (hours < 24 * 7) {
    const days = Math.round(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  if (hours < 24 * 30) {
    const weeks = Math.round(hours / (24 * 7));
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  if (hours < 24 * 365) {
    const months = Math.round(hours / (24 * 30));
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const years = Math.round(hours / (24 * 365));
  return `${years} year${years !== 1 ? 's' : ''}`;
}

export function durationToDayLabel(hours: number): string {
  if (hours <= 0) return 'Day 0';
  const days = Math.floor(hours / 24);
  return `Day -${days}`;
}

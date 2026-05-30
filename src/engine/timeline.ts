export interface TimelineEvent {
  timestamp: number;
  event: string;
  details: string;
  userId: string;
  userName: string;
  phase?: string;
}

export function createTimelineEvent(
  event: string,
  details: string,
  userId: string,
  userName: string,
  phase?: string,
): TimelineEvent {
  return {
    timestamp: Date.now(),
    event,
    details,
    userId,
    userName,
    phase,
  };
}

export function createPhaseTimelineEvent(
  phaseName: string,
  action: 'started' | 'completed' | 'saved',
  userId: string,
  userName: string,
): TimelineEvent {
  return createTimelineEvent(
    `Phase ${action}: ${phaseName}`,
    `${userName} ${action} the ${phaseName} phase`,
    userId,
    userName,
    phaseName,
  );
}

export function createFactTimelineEvent(
  factType: string,
  description: string,
  userId: string,
  userName: string,
): TimelineEvent {
  return createTimelineEvent(
    `${factType} recorded`,
    description,
    userId,
    userName,
  );
}

export function getTimelineSummary(events: TimelineEvent[]): string {
  return events
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((e) => {
      const time = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `[${time}] ${e.event}: ${e.details} — ${e.userName}`;
    })
    .join('\n');
}

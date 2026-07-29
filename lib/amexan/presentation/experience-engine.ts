import {
  ActorId, JourneyId, ActorDefinition, JourneyDefinition,
  ACTORS, JOURNEYS, getActor, getJourney, getJourneyForActor,
} from '@/lib/amexan/constitution/books/book-II-experience';
import {
  renderPresentation, createPresentationContext, PresentationOutput,
  type EngineCard, type EngineSection, type EngineAction,
} from './presentation-engine';

export interface ExperienceRequest {
  actorId: ActorId;
  patientId: string;
  encounterId?: string;
  requestedJourney?: JourneyId;
  context: {
    phaseId?: string;
    completionMap?: Record<string, number>;
    clinicalSummary?: Record<string, unknown>;
    alerts?: Array<{ id: string; type: 'info' | 'warning' | 'critical' | 'success'; message: string }>;
    theme?: Record<string, unknown>;
  };
  facility: {
    name: string;
    type?: string;
    region?: string;
  };
}

export interface ExperienceOutput {
  actor: ActorDefinition;
  journey: JourneyDefinition;
  presentation: PresentationOutput;
  routing: RoutingDecision;
}

export interface RoutingDecision {
  allowed: boolean;
  reason?: string;
  suggestedJourney?: JourneyId;
  suggestedPhase?: string;
  redirectUrl?: string;
}

export function routeExperience(request: ExperienceRequest): ExperienceOutput {
  const actor = getActor(request.actorId);
  const journey = request.requestedJourney
    ? getJourney(request.requestedJourney)
    : getJourneyForActor(request.actorId);

  const routing = determineRouting(request, actor, journey);

  const engineCards: EngineCard[] = (actor.permissions || []).map((perm: string, i: number) => ({
    id: `card-${i}`,
    type: 'permission',
    title: `Permission: ${perm}`,
    priority: i < 3 ? 'high' : 'medium',
    importance: 100 - i * 10,
    data: { permission: perm },
  }))

  const engineSections: EngineSection[] = [{
    id: 'main',
    title: journey.label || journey.id,
    cards: engineCards.map(c => c.id),
    priority: 'high',
  }]

  const engineActions: EngineAction[] = journey.phases.map((phase, i) => ({
    id: phase.id,
    label: phase.label || phase.id,
    type: 'phase_navigate',
    primary: i === 0,
    icon: i === 0 ? 'arrow-right' : undefined,
  }))

  const engineOutput = { cards: engineCards, sections: engineSections, actions: engineActions }

  const ctx = createPresentationContext({
    role: request.actorId,
    journey: journey.id,
    phase: request.context.phaseId || journey.phases[0]?.id || '',
    content: { clinicalSummary: request.context.clinicalSummary, alerts: request.context.alerts },
  })

  const presentation = renderPresentation(engineOutput, ctx)

  return { actor, journey, presentation, routing };
}

function determineRouting(
  request: ExperienceRequest,
  actor: ActorDefinition,
  journey: JourneyDefinition
): RoutingDecision {
  if (!journey.actors.includes(request.actorId)) {
    const fallbackJourney = getJourneyForActor(request.actorId);
    return {
      allowed: false,
      reason: `Actor '${request.actorId}' not permitted on journey '${journey.id}'`,
      suggestedJourney: fallbackJourney.id,
      redirectUrl: `/${fallbackJourney.id}`,
    };
  }

  const canEnter = journey.phases.every(phase => {
    if (phase.dependsOn.length === 0) return true;
    return phase.dependsOn.every(dep => {
      const depPhase = journey.phases.find(p => p.id === dep);
      if (!depPhase) return true;
      return (request.context.completionMap?.[dep] || 0) >= depPhase.minCompletion;
    });
  });

  if (!canEnter) {
    const firstIncomplete = journey.phases.find(phase => {
      return phase.dependsOn.some(dep => {
        const depPhase = journey.phases.find(p => p.id === dep);
        return depPhase && (request.context.completionMap?.[dep] || 0) < depPhase.minCompletion;
      });
    });
    return {
      allowed: true,
      reason: 'Prerequisites not met',
      suggestedJourney: journey.id,
      suggestedPhase: firstIncomplete?.id || journey.phases[0].id,
    };
  }

  return { allowed: true, suggestedJourney: journey.id };
}

export function listAccessibleJourneys(actorId: ActorId): JourneyDefinition[] {
  return Object.values(JOURNEYS).filter(j => j.actors.includes(actorId));
}

export function listActorsForJourney(journeyId: JourneyId): ActorDefinition[] {
  const journey = getJourney(journeyId);
  return Object.values(ACTORS).filter(a => journey.actors.includes(a.id));
}

export function canAccessJourney(actorId: ActorId, journeyId: JourneyId): boolean {
  const journey = getJourney(journeyId);
  return journey.actors.includes(actorId);
}

export function canAccessPatientData(actorId: ActorId): 'self' | 'limited' | 'full' | 'deidentified' {
  const actor = getActor(actorId);
  const perms = actor.permissions;
  if (perms.includes('read:all') || perms.includes('read:*')) return 'full';
  if (perms.includes('read:self')) return 'self';
  if (perms.includes('read:self_limited')) return 'limited';
  if (perms.includes('read:deidentified')) return 'deidentified';
  return 'limited';
}

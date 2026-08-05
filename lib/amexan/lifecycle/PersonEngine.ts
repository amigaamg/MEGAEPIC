// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN PERSON CENTER ENGINE (BOOK VIII — Center 1)
//
// Everyone begins here: Person → Actor → Identity → Capabilities → Organizations
// → Sessions. Doctors, patients, students, consultants, pharmacists, lab
// scientists, admins, researchers — all are Persons first.
//
// Stored primarily in PostgreSQL (person, actor, identity, credentials,
// preferences, memberships, sessions) and mirrored into Neo4j
// ((Person)-[:WORKS_AT]->(Organization), (Person)-[:TREATS]->(Patient), ...).
//
// Pure and deterministic. Persistence is orchestrated by the conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { ActorProfile, PersonCenterModel, SessionRecord } from './types';

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface CreatePersonCenterInput {
  personId: AmxUid;
  identityId: AmxUid;
  actorId?: AmxUid;
}

export class PersonEngine {
  static create(input: CreatePersonCenterInput): PersonCenterModel {
    if (!input.personId || !input.identityId) throw new Error('[PersonEngine] personId and identityId are required');
    return {
      personId: input.personId,
      identityId: input.identityId,
      actors: [],
      capabilities: [],
      memberships: [],
      sessions: [],
      updatedAt: Date.now(),
    };
  }

  static registerActor(model: PersonCenterModel, input: { actorId: AmxUid; categories: string[]; primaryCategory: string; specialties?: string[]; roles?: string[]; organizations?: string[] }): PersonCenterModel {
    const actor: ActorProfile = {
      actorId: input.actorId,
      personId: model.personId,
      categories: input.categories,
      primaryCategory: input.primaryCategory,
      specialties: input.specialties ?? [],
      roles: input.roles ?? [],
      organizations: input.organizations ?? [],
      active: true,
    };
    const actors = model.actors.filter(a => a.actorId !== input.actorId);
    return { ...model, actors: [...actors, actor], updatedAt: Date.now() };
  }

  static setCapabilities(model: PersonCenterModel, capabilities: string[]): PersonCenterModel {
    return { ...model, capabilities, updatedAt: Date.now() };
  }

  static addMembership(model: PersonCenterModel, organizationId: string): PersonCenterModel {
    if (model.memberships.includes(organizationId)) return model;
    return { ...model, memberships: [...model.memberships, organizationId], updatedAt: Date.now() };
  }

  static removeMembership(model: PersonCenterModel, organizationId: string): PersonCenterModel {
    return { ...model, memberships: model.memberships.filter(m => m !== organizationId), updatedAt: Date.now() };
  }

  static startSession(model: PersonCenterModel, input: { actorId: AmxUid; organizationId?: string; deviceInfo?: string; ipAddress?: string }): PersonCenterModel {
    const now = Date.now();
    const session: SessionRecord = {
      id: nextId('ses'),
      actorId: input.actorId,
      startedAt: now,
      lastActiveAt: now,
      organizationId: input.organizationId,
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
      active: true,
    };
    return { ...model, sessions: [...model.sessions, session], updatedAt: now };
  }

  static touchSession(model: PersonCenterModel, sessionId: string): PersonCenterModel {
    const sessions = model.sessions.map(s => (s.id === sessionId ? { ...s, lastActiveAt: Date.now() } : s));
    return { ...model, sessions, updatedAt: Date.now() };
  }

  static endSession(model: PersonCenterModel, sessionId: string): PersonCenterModel {
    const sessions = model.sessions.map(s => (s.id === sessionId ? { ...s, endedAt: Date.now(), active: false } : s));
    return { ...model, sessions, updatedAt: Date.now() };
  }

  static getActiveSessions(model: PersonCenterModel): SessionRecord[] {
    return model.sessions.filter(s => s.active);
  }

  static getActor(model: PersonCenterModel, actorId: AmxUid): ActorProfile | undefined {
    return model.actors.find(a => a.actorId === actorId);
  }

  static deactivateActor(model: PersonCenterModel, actorId: AmxUid): PersonCenterModel {
    const actors = model.actors.map(a => (a.actorId === actorId ? { ...a, active: false } : a));
    return { ...model, actors, updatedAt: Date.now() };
  }

  static getDashboardSummary(model: PersonCenterModel): { actors: number; memberships: number; activeSessions: number; capabilities: number } {
    return {
      actors: model.actors.filter(a => a.active).length,
      memberships: model.memberships.length,
      activeSessions: PersonEngine.getActiveSessions(model).length,
      capabilities: model.capabilities.length,
    };
  }
}

export default PersonEngine;

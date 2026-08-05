// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ORGANIZATION CENTER ENGINE (BOOK VIII — Center 5)
//
// Everything administrative. Hospital, departments, users, permissions, buildings,
// beds, theatres, clinics, inventory, HR, finance, analytics.
//
// Stored mostly in PostgreSQL; relationships mirrored into Neo4j.
// (Organization)-[:HAS_DEPARTMENT]->(Department), (Department)-[:HAS_BED]->(Bed),
// (Organization)-[:EMPLOYS]->(Person), (User)-[:ASSIGNED_TO]->(Department).
//
// Pure and deterministic. Persistence is orchestrated by the conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type {
  OrganizationAnalytics, OrganizationBed, OrganizationBuilding, OrganizationCenterModel,
  OrganizationClinic, OrganizationDepartment, OrganizationFinanceSummary,
  OrganizationHrSummary, OrganizationInventoryItem, OrganizationPermission,
  OrganizationTheatre, OrganizationUser,
} from './types';

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface CreateOrganizationCenterInput {
  organizationId: string;
  name: string;
  type?: string;
}

export class OrganizationCenterEngine {
  static create(input: CreateOrganizationCenterInput): OrganizationCenterModel {
    if (!input.organizationId || !input.name) throw new Error('[OrganizationCenterEngine] organizationId and name are required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      name: input.name,
      type: input.type,
      departments: [],
      users: [],
      permissions: [],
      buildings: [],
      beds: [],
      theatres: [],
      clinics: [],
      inventory: [],
      hrSummary: { headcount: 0, byDepartment: {}, vacancies: 0, onLeave: 0, trainingCompliancePercent: 0 },
      financeSummary: { monthlyRevenue: 0, monthlyExpenses: 0, outstandingDebt: 0, departmentProfitability: {} },
      analytics: { utilization: {}, keyIndicators: {}, updatedAt: now },
      updatedAt: now,
    };
  }

  // ── Departments ──────────────────────────────────────────────────────────────

  static addDepartment(model: OrganizationCenterModel, input: Omit<OrganizationDepartment, 'id' | 'active' | 'staffIds'>): OrganizationCenterModel {
    const department: OrganizationDepartment = { ...input, id: nextId('dep'), staffIds: [], active: true };
    return { ...model, departments: [...model.departments, department], updatedAt: Date.now() };
  }

  static getDepartment(model: OrganizationCenterModel, departmentId: string): OrganizationDepartment | undefined {
    return model.departments.find(d => d.id === departmentId);
  }

  static assignManager(model: OrganizationCenterModel, departmentId: string, managerId: AmxUid): OrganizationCenterModel {
    const departments = model.departments.map(d => (d.id === departmentId ? { ...d, managerId } : d));
    return { ...model, departments, updatedAt: Date.now() };
  }

  static assignStaff(model: OrganizationCenterModel, departmentId: string, staffId: AmxUid): OrganizationCenterModel {
    const departments = model.departments.map(d => {
      if (d.id !== departmentId) return d;
      if (d.staffIds.includes(staffId)) return d;
      return { ...d, staffIds: [...d.staffIds, staffId] };
    });
    return { ...model, departments, updatedAt: Date.now() };
  }

  // ── Users & permissions ──────────────────────────────────────────────────────

  static addUser(model: OrganizationCenterModel, input: Omit<OrganizationUser, 'id' | 'active'>): OrganizationCenterModel {
    const user: OrganizationUser = { ...input, id: nextId('ou'), active: true };
    return { ...model, users: [...model.users, user], updatedAt: Date.now() };
  }

  static deactivateUser(model: OrganizationCenterModel, userId: string): OrganizationCenterModel {
    const users = model.users.map(u => (u.id === userId ? { ...u, active: false } : u));
    return { ...model, users, updatedAt: Date.now() };
  }

  static grantPermission(model: OrganizationCenterModel, input: Omit<OrganizationPermission, 'id' | 'grantedAt'>): OrganizationCenterModel {
    const permission: OrganizationPermission = { ...input, id: nextId('perm'), grantedAt: Date.now() };
    return { ...model, permissions: [...model.permissions, permission], updatedAt: Date.now() };
  }

  static revokePermission(model: OrganizationCenterModel, permissionId: string): OrganizationCenterModel {
    const permissions = model.permissions.filter(p => p.id !== permissionId);
    return { ...model, permissions, updatedAt: Date.now() };
  }

  static getActionsForActor(model: OrganizationCenterModel, actorId: AmxUid): string[] {
    const byActor = model.permissions.filter(p => p.actorId === actorId).flatMap(p => p.actions);
    const roles = model.users.find(u => u.personId === actorId)?.roles ?? [];
    const byRole = model.permissions.filter(p => p.role && roles.includes(p.role)).flatMap(p => p.actions);
    return Array.from(new Set([...byActor, ...byRole]));
  }

  static canPerform(model: OrganizationCenterModel, actorId: AmxUid, action: string): boolean {
    return OrganizationCenterEngine.getActionsForActor(model, actorId).includes(action);
  }

  // ── Buildings / beds / theatres / clinics ────────────────────────────────────

  static addBuilding(model: OrganizationCenterModel, input: Omit<OrganizationBuilding, 'id' | 'departments'>): OrganizationCenterModel {
    const building: OrganizationBuilding = { ...input, id: nextId('bld'), departments: [] };
    return { ...model, buildings: [...model.buildings, building], updatedAt: Date.now() };
  }

  static addBed(model: OrganizationCenterModel, input: Omit<OrganizationBed, 'id' | 'status' | 'equipment'> & { equipment?: string[] }): OrganizationCenterModel {
    const bed: OrganizationBed = { ...input, id: nextId('bed'), status: 'available', equipment: input.equipment ?? [] };
    return { ...model, beds: [...model.beds, bed], updatedAt: Date.now() };
  }

  static occupyBed(model: OrganizationCenterModel, bedId: string, patientId: string): OrganizationCenterModel {
    const beds = model.beds.map(b => (b.id === bedId ? { ...b, status: 'occupied' as const, patientId, occupiedSince: Date.now() } : b));
    return { ...model, beds, updatedAt: Date.now() };
  }

  static freeBed(model: OrganizationCenterModel, bedId: string): OrganizationCenterModel {
    const beds = model.beds.map(b => (b.id === bedId ? { ...b, status: 'available' as const, patientId: undefined, occupiedSince: undefined } : b));
    return { ...model, beds, updatedAt: Date.now() };
  }

  static getAvailableBeds(model: OrganizationCenterModel, wardId?: string): OrganizationBed[] {
    return model.beds.filter(b => b.status === 'available' && (!wardId || b.wardId === wardId));
  }

  static getOccupiedBeds(model: OrganizationCenterModel): OrganizationBed[] {
    return model.beds.filter(b => b.status === 'occupied');
  }

  static addTheatre(model: OrganizationCenterModel, input: Omit<OrganizationTheatre, 'id' | 'status' | 'equipment'> & { equipment?: string[] }): OrganizationCenterModel {
    const theatre: OrganizationTheatre = { ...input, id: nextId('tht'), status: 'available', equipment: input.equipment ?? [] };
    return { ...model, theatres: [...model.theatres, theatre], updatedAt: Date.now() };
  }

  static scheduleTheatre(model: OrganizationCenterModel, theatreId: string, procedureId: string): OrganizationCenterModel {
    const theatres = model.theatres.map(t => (t.id === theatreId ? { ...t, status: 'scheduled' as const, currentProcedureId: procedureId } : t));
    return { ...model, theatres, updatedAt: Date.now() };
  }

  static getAvailableTheatres(model: OrganizationCenterModel): OrganizationTheatre[] {
    return model.theatres.filter(t => t.status === 'available');
  }

  static addClinic(model: OrganizationCenterModel, input: Omit<OrganizationClinic, 'id'>): OrganizationCenterModel {
    const clinic: OrganizationClinic = { ...input, id: nextId('cln') };
    return { ...model, clinics: [...model.clinics, clinic], updatedAt: Date.now() };
  }

  // ── Inventory ────────────────────────────────────────────────────────────────

  static addInventoryItem(model: OrganizationCenterModel, input: Omit<OrganizationInventoryItem, 'id'>): OrganizationCenterModel {
    const item: OrganizationInventoryItem = { ...input, id: nextId('inv') };
    return { ...model, inventory: [...model.inventory, item], updatedAt: Date.now() };
  }

  static adjustInventory(model: OrganizationCenterModel, itemId: string, delta: number): OrganizationCenterModel {
    const inventory = model.inventory.map(i => (i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i));
    return { ...model, inventory, updatedAt: Date.now() };
  }

  static getLowStockItems(model: OrganizationCenterModel): OrganizationInventoryItem[] {
    return model.inventory.filter(i => i.quantity <= i.reorderLevel);
  }

  // ── HR & finance summaries ───────────────────────────────────────────────────

  static updateHrSummary(model: OrganizationCenterModel, patch: Partial<OrganizationHrSummary>): OrganizationCenterModel {
    return { ...model, hrSummary: { ...model.hrSummary, ...patch }, updatedAt: Date.now() };
  }

  static updateFinanceSummary(model: OrganizationCenterModel, patch: Partial<OrganizationFinanceSummary>): OrganizationCenterModel {
    return { ...model, financeSummary: { ...model.financeSummary, ...patch }, updatedAt: Date.now() };
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  static updateAnalytics(model: OrganizationCenterModel, patch: Partial<OrganizationAnalytics>): OrganizationCenterModel {
    return { ...model, analytics: { ...model.analytics, ...patch, updatedAt: Date.now() }, updatedAt: Date.now() };
  }

  static getBedUtilization(model: OrganizationCenterModel): number {
    if (model.beds.length === 0) return 0;
    return Math.round((model.beds.filter(b => b.status === 'occupied').length / model.beds.length) * 100);
  }

  static recomputeAnalytics(model: OrganizationCenterModel): OrganizationCenterModel {
    const utilization: Record<string, number> = {
      beds: OrganizationCenterEngine.getBedUtilization(model),
      theatres: model.theatres.length > 0 ? Math.round((model.theatres.filter(t => t.status === 'in_use' || t.status === 'scheduled').length / model.theatres.length) * 100) : 0,
      departments: model.departments.length,
    };
    const keyIndicators: Record<string, number> = {
      activeUsers: model.users.filter(u => u.active).length,
      occupiedBeds: OrganizationCenterEngine.getOccupiedBeds(model).length,
      availableBeds: OrganizationCenterEngine.getAvailableBeds(model).length,
      lowStockItems: OrganizationCenterEngine.getLowStockItems(model).length,
    };
    return { ...model, analytics: { utilization, keyIndicators, updatedAt: Date.now() }, updatedAt: Date.now() };
  }

  // ── Convenience / dashboard ──────────────────────────────────────────────────

  static getDashboardSummary(model: OrganizationCenterModel): {
    departments: number;
    activeUsers: number;
    occupiedBeds: number;
    availableBeds: number;
    availableTheatres: number;
    lowStockItems: number;
    bedUtilization: number;
  } {
    return {
      departments: model.departments.length,
      activeUsers: model.users.filter(u => u.active).length,
      occupiedBeds: OrganizationCenterEngine.getOccupiedBeds(model).length,
      availableBeds: OrganizationCenterEngine.getAvailableBeds(model).length,
      availableTheatres: OrganizationCenterEngine.getAvailableTheatres(model).length,
      lowStockItems: OrganizationCenterEngine.getLowStockItems(model).length,
      bedUtilization: OrganizationCenterEngine.getBedUtilization(model),
    };
  }
}

export default OrganizationCenterEngine;

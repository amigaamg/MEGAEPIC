/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * UAB — Universal Application Blueprint (Phase 5)
 * "Turning the Constitution into Software"
 *
 * Every application inside AMEXAN inherits exactly this hierarchy:
 *   Application → Workspace → Flow → Page → Panel → Widget → Action → Event
 *
 * People don't use modules. People work. AMEXAN is built around workspaces.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export * from './blueprint';
export * from './workspaces';
export * from './rules';
export { clinicalWorkspaceBlueprint, clinicalApplication, CLINICAL_WORKED_EXAMPLE_HIERARCHY } from './example/clinical-workspace';

import { NextRequest, NextResponse } from 'next/server';
import { HmisEmrSyncService, type HmisEncounter, type EmrEncounter, type DepartmentMapping, type SyncResult } from '@/lib/amexan/hmis/hmis-emr-sync';
import { query } from '@/lib/amexan/db/postgres';
import { can } from '@/lib/amexan/constitution/auth';

const syncService = new HmisEmrSyncService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, action, data } = body;

    if (!orgId || !action) {
      return NextResponse.json({ error: 'orgId and action are required' }, { status: 400 });
    }

    switch (action) {
      case 'sync_encounter': {
        const result = await syncService.syncEncounterBidirectional(
          data as HmisEncounter,
          orgId
        );
        return NextResponse.json({ success: true, result });
      }
      case 'sync_department': {
        const mapping = data as DepartmentMapping;
        const result = await syncService.syncDepartmentMapping(mapping, orgId);
        return NextResponse.json({ success: true, result });
      }
      case 'sync_patient_merge': {
        const { hmisPatient, emrPatient, strategy } = data;
        const result = await syncService.syncPatientMerge(hmisPatient, emrPatient, orgId, strategy);
        return NextResponse.json({ success: true, result });
      }
      case 'full_sync': {
        const batch = await syncService.runFullSync(orgId);
        return NextResponse.json({ success: true, batch });
      }
      case 'incremental_sync': {
        const { sinceTimestamp } = data;
        const batch = await syncService.runIncrementalSync(orgId, sinceTimestamp);
        return NextResponse.json({ success: true, batch });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    console.error('HMIS-EMR sync error:', e);
    return NextResponse.json(
      { error: 'Sync failed', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const action = searchParams.get('action');

    switch (action) {
      case 'stats': {
        const stats = syncService.getSyncStats(orgId || undefined);
        return NextResponse.json({ stats });
      }
      case 'config': {
        const config = syncService.getConfig();
        return NextResponse.json({ config });
      }
      case 'log': {
        const log = syncService.getSyncLog();
        return NextResponse.json({ log });
      }
      case 'encounter_bridge': {
        const orgIdParam = searchParams.get('orgId');
        if (!orgIdParam) {
          return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
        }
        const result = await query(
          `SELECT * FROM encounter_bridge WHERE org_id = $1 ORDER BY last_synced_at DESC LIMIT 100`,
          [orgIdParam]
        );
        return NextResponse.json({ encounters: result.rows });
      }
      case 'department_sync_map': {
        const orgIdParam = searchParams.get('orgId');
        if (!orgIdParam) {
          return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
        }
        const result = await query(
          `SELECT * FROM department_sync_map WHERE org_id = $1`,
          [orgIdParam]
        );
        return NextResponse.json({ mappings: result.rows });
      }
      case 'patient_merge_log': {
        const orgIdParam = searchParams.get('orgId');
        if (!orgIdParam) {
          return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
        }
        const result = await query(
          `SELECT * FROM patient_merge_log WHERE org_id = $1 ORDER BY merged_at DESC LIMIT 100`,
          [orgIdParam]
        );
        return NextResponse.json({ merges: result.rows });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch sync data', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, action, data } = body;

    if (!orgId || !action) {
      return NextResponse.json({ error: 'orgId and action are required' }, { status: 400 });
    }

    switch (action) {
      case 'update_config': {
        syncService.updateConfig(data);
        return NextResponse.json({ success: true, config: syncService.getConfig() });
      }
      case 'update_encounter_bridge': {
        const { hmisEncounterId, emrEncounterId, status, syncDirection } = data;
        await query(
          `UPDATE encounter_bridge
           SET status = $1, sync_direction = $2, last_synced_at = NOW(), sync_version = sync_version + 1
           WHERE hmis_encounter_id = $3 AND org_id = $4`,
          [status, syncDirection, hmisEncounterId, orgId]
        );
        return NextResponse.json({ success: true });
      }
      case 'update_department_sync': {
        const { hmisDepartmentId, syncEnabled, syncDirection } = data;
        await query(
          `UPDATE department_sync_map
           SET sync_enabled = $1, sync_direction = $2, last_synced_at = NOW()
           WHERE hmis_department_id = $3 AND org_id = $4`,
          [syncEnabled, syncDirection, hmisDepartmentId, orgId]
        );
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to update sync data', details: (e as Error).message },
      { status: 500 }
    );
  }
}

'use server';

import { AuditService } from '@/services/audit.service';
import type { AuditEventListFilters, AuditEventListResponse, AuditEvent } from '@/types/admin';
import type { ActionState } from './auth.actions';

export async function getAuditEventsAction(
  filters: AuditEventListFilters,
): Promise<ActionState<AuditEventListResponse>> {
  try {
    const data = await AuditService.listEvents(filters);
    return { success: true, data };
  } catch {
    return { success: false, error: 'Erro ao carregar eventos de auditoria' };
  }
}

export async function getAuditEventByIdAction(
  id: string,
): Promise<ActionState<AuditEvent>> {
  try {
    const data = await AuditService.getEventById(id);
    return { success: true, data };
  } catch {
    return { success: false, error: 'Evento de auditoria não encontrado' };
  }
}

export async function getAuditResourceTimelineAction(
  resourceType: string,
  resourceId: string,
  limit = 100,
): Promise<ActionState<AuditEvent[]>> {
  try {
    const data = await AuditService.getResourceTimeline(resourceType, resourceId, limit);
    return { success: true, data };
  } catch {
    return { success: false, error: 'Erro ao carregar timeline do recurso' };
  }
}

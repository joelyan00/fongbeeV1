/**
 * Service Audit Log Service
 * Records all lifecycle events for standard services
 */

import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// In-memory mock storage for development
const mockAuditLogs = [];

/**
 * Predefined rejection reason categories
 */
export const REJECTION_CATEGORIES = [
    { code: 'qualification', label: '资质不全', description: '缺少必要的认证或资质文件' },
    { code: 'content', label: '内容不合规', description: '描述包含违禁或不当内容' },
    { code: 'pricing', label: '价格异常', description: '定价不合理或与市场差异过大' },
    { code: 'description', label: '描述不清晰', description: '服务内容描述不完整或模糊' },
    { code: 'images', label: '图片问题', description: '图片不清晰、不相关或侵权' },
    { code: 'duplicate', label: '重复提交', description: '与已有服务重复' },
    { code: 'other', label: '其他原因', description: '其他原因' }
];

/**
 * Valid service statuses
 */
export const SERVICE_STATUSES = {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PUBLISHED: 'published',
    UNPUBLISHED: 'unpublished',
    ARCHIVED: 'archived'
};

/**
 * Valid audit actions
 */
export const AUDIT_ACTIONS = {
    CREATED: 'created',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    EDITED: 'edited',
    RESUBMITTED: 'resubmitted',
    PUBLISHED: 'published',
    UNPUBLISHED: 'unpublished',
    ARCHIVED: 'archived'
};

/**
 * Log a service audit event
 * 
 * @param {Object} params - Audit log parameters
 * @param {string} params.serviceIdentityId - Unique service identifier
 * @param {string} [params.serviceId] - UUID of the service record
 * @param {string} params.action - Action type (from AUDIT_ACTIONS)
 * @param {string} [params.previousStatus] - Status before action
 * @param {string} [params.newStatus] - Status after action
 * @param {string} [params.actorId] - User ID of the actor
 * @param {string} [params.actorRole] - Role of the actor (provider/admin/system)
 * @param {string} [params.actorName] - Name of the actor for display
 * @param {string} [params.reason] - Reason or comment
 * @param {string} [params.reasonCategory] - Structured reason category
 * @param {Object} [params.metadata] - Additional metadata
 */
export async function logServiceAudit({
    serviceIdentityId,
    serviceId = null,
    action,
    previousStatus = null,
    newStatus = null,
    actorId = null,
    actorRole = null,
    actorName = null,
    reason = null,
    reasonCategory = null,
    metadata = {}
}) {
    const logEntry = {
        service_identity_id: serviceIdentityId,
        service_id: serviceId,
        action,
        previous_status: previousStatus,
        new_status: newStatus,
        actor_id: actorId,
        actor_role: actorRole,
        actor_name: actorName,
        reason,
        reason_category: reasonCategory,
        metadata,
        created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabaseAdmin
                .from('service_audit_logs')
                .insert(logEntry)
                .select()
                .single();

            if (error) {
                console.error('Failed to log service audit:', error);
                return null;
            }

            console.log(`📋 Audit log: ${action} for service ${serviceIdentityId}`);
            return data;
        } catch (err) {
            console.error('Service audit log error:', err);
            return null;
        }
    } else {
        // Mock implementation
        const mockEntry = {
            id: `audit-${Date.now()}`,
            ...logEntry
        };
        mockAuditLogs.push(mockEntry);
        console.log(`📋 [Mock] Audit log: ${action} for service ${serviceIdentityId}`);
        return mockEntry;
    }
}

/**
 * Get audit history for a service by its identity ID
 * 
 * @param {string} serviceIdentityId - Unique service identifier
 * @returns {Promise<Array>} - List of audit log entries
 */
export async function getServiceAuditHistory(serviceIdentityId) {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabaseAdmin
                .from('service_audit_logs')
                .select('*')
                .eq('service_identity_id', serviceIdentityId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to get audit history:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('Get audit history error:', err);
            return [];
        }
    } else {
        // Mock implementation
        return mockAuditLogs
            .filter(log => log.service_identity_id === serviceIdentityId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
}

/**
 * Get all rejection reason categories
 * 
 * @returns {Promise<Array>} - List of rejection categories
 */
export async function getRejectionCategories() {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabaseAdmin
                .from('rejection_reason_categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error || !data || data.length === 0) {
                // Fallback to hardcoded categories
                return REJECTION_CATEGORIES;
            }

            return data.map(cat => ({
                code: cat.code,
                label: cat.label_zh,
                description: cat.description
            }));
        } catch (err) {
            return REJECTION_CATEGORIES;
        }
    } else {
        return REJECTION_CATEGORIES;
    }
}

/**
 * Convenience methods for common audit actions
 */
export const AuditLogger = {
    serviceCreated: (serviceIdentityId, serviceId, actorId, actorName, isDraft = false) =>
        logServiceAudit({
            serviceIdentityId,
            serviceId,
            action: AUDIT_ACTIONS.CREATED,
            newStatus: isDraft ? SERVICE_STATUSES.DRAFT : SERVICE_STATUSES.PENDING,
            actorId,
            actorRole: 'provider',
            actorName
        }),

    serviceSubmitted: (serviceIdentityId, serviceId, actorId, actorName) =>
        logServiceAudit({
            serviceIdentityId,
            serviceId,
            action: AUDIT_ACTIONS.SUBMITTED,
            previousStatus: SERVICE_STATUSES.DRAFT,
            newStatus: SERVICE_STATUSES.PENDING,
            actorId,
            actorRole: 'provider',
            actorName
        }),

    serviceApproved: (serviceIdentityId, serviceId, actorId, actorName) =>
        logServiceAudit({
            serviceIdentityId,
            serviceId,
            action: AUDIT_ACTIONS.APPROVED,
            previousStatus: SERVICE_STATUSES.PENDING,
            newStatus: SERVICE_STATUSES.APPROVED,
            actorId,
            actorRole: 'admin',
            actorName
        }),

    serviceRejected: (serviceIdentityId, serviceId, actorId, actorName, reason, reasonCategory) =>
        logServiceAudit({
            serviceIdentityId,
            serviceId,
            action: AUDIT_ACTIONS.REJECTED,
            previousStatus: SERVICE_STATUSES.PENDING,
            newStatus: SERVICE_STATUSES.REJECTED,
            actorId,
            actorRole: 'admin',
            actorName,
            reason,
            reasonCategory
        }),

    servicePublished: (serviceIdentityId, serviceId, actorId, actorName, actorRole = 'admin') =>
        logServiceAudit({
            serviceIdentityId,
            serviceId,
            action: AUDIT_ACTIONS.PUBLISHED,
            previousStatus: SERVICE_STATUSES.APPROVED,
            newStatus: SERVICE_STATUSES.PUBLISHED,
            actorId,
            actorRole,
            actorName
        }),

    serviceUnpublished: (serviceIdentityId, serviceId, actorId, actorName, actorRole, reason) =>
        logServiceAudit({
            serviceIdentityId,
            serviceId,
            action: AUDIT_ACTIONS.UNPUBLISHED,
            previousStatus: SERVICE_STATUSES.PUBLISHED,
            newStatus: SERVICE_STATUSES.UNPUBLISHED,
            actorId,
            actorRole,
            actorName,
            reason
        }),

    serviceEdited: (serviceIdentityId, serviceId, actorId, actorName, metadata = {}) =>
        logServiceAudit({
            serviceIdentityId,
            serviceId,
            action: AUDIT_ACTIONS.EDITED,
            actorId,
            actorRole: 'provider',
            actorName,
            metadata
        }),

    serviceResubmitted: (serviceIdentityId, serviceId, actorId, actorName) =>
        logServiceAudit({
            serviceIdentityId,
            serviceId,
            action: AUDIT_ACTIONS.RESUBMITTED,
            previousStatus: SERVICE_STATUSES.REJECTED,
            newStatus: SERVICE_STATUSES.PENDING,
            actorId,
            actorRole: 'provider',
            actorName
        })
};

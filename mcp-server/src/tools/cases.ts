import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { runQuery, runQuerySingle, runExec } from '../database/init.js';

/**
 * Case Management Tools
 * Create, update, and track cases in the local database.
 */

interface Case {
  id: number;
  reference_number: string;
  created_at: string;
  updated_at: string;
  status: string;
  category: string;
  subcategory: string | null;
  summary: string;
  postcode: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  notes: string | null;
  assigned_adviser: string | null;
  priority: string;
}

interface CaseEvent {
  id: number;
  case_id: number;
  event_date: string;
  event_type: string;
  description: string;
  created_by: string | null;
}

// Generate unique reference number
function generateReferenceNumber(category: string): string {
  const prefix = category.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function registerCaseTools(server: McpServer): void {
  
  // Create a new case
  server.tool(
    'create_case',
    'Create a new case in the case management system',
    {
      category: z.enum([
        'benefits',
        'housing',
        'employment',
        'debt',
        'consumer',
        'family',
        'immigration',
        'legal',
        'other'
      ]).describe('Main category of the case'),
      subcategory: z.string().optional().describe('Subcategory (e.g., "PIP appeal", "eviction")'),
      summary: z.string().describe('Brief summary of the issue'),
      postcode: z.string().optional().describe('Client postcode'),
      clientName: z.string().optional().describe('Client name'),
      clientEmail: z.string().optional().describe('Client email'),
      clientPhone: z.string().optional().describe('Client phone'),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal').describe('Case priority'),
      notes: z.string().optional().describe('Additional notes')
    },
    async (params) => {
      const referenceNumber = generateReferenceNumber(params.category);
      
      const result = runExec(`
        INSERT INTO cases (
          reference_number, category, subcategory, summary, 
          postcode, client_name, client_email, client_phone, 
          priority, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
      `, [
        referenceNumber,
        params.category,
        params.subcategory || null,
        params.summary,
        params.postcode || null,
        params.clientName || null,
        params.clientEmail || null,
        params.clientPhone || null,
        params.priority,
        params.notes || null
      ]);
      
      // Add creation event
      runExec(`
        INSERT INTO case_events (case_id, event_type, description)
        VALUES (?, 'created', 'Case created')
      `, [result.lastInsertRowid]);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            referenceNumber,
            caseId: result.lastInsertRowid,
            message: `Case ${referenceNumber} created successfully`,
            category: params.category,
            priority: params.priority
          }, null, 2)
        }]
      };
    }
  );

  // Get case by reference number
  server.tool(
    'get_case',
    'Retrieve a case by its reference number',
    {
      referenceNumber: z.string().describe('Case reference number')
    },
    async (params) => {
      const caseData = runQuerySingle<Case>(`
        SELECT * FROM cases WHERE reference_number = ?
      `, [params.referenceNumber]);
      
      if (!caseData) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Case not found',
              referenceNumber: params.referenceNumber
            }, null, 2)
          }]
        };
      }
      
      // Get case events
      const events = runQuery<CaseEvent>(`
        SELECT * FROM case_events WHERE case_id = ? ORDER BY event_date DESC
      `, [caseData.id]);
      
      // Get deadlines
      const deadlines = runQuery<unknown>(`
        SELECT * FROM deadlines WHERE case_id = ? ORDER BY deadline_date ASC
      `, [caseData.id]);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            case: caseData,
            events,
            deadlines
          }, null, 2)
        }]
      };
    }
  );

  // Update case status
  server.tool(
    'update_case_status',
    'Update the status of a case',
    {
      referenceNumber: z.string().describe('Case reference number'),
      status: z.enum(['open', 'in_progress', 'awaiting_info', 'awaiting_hearing', 'resolved', 'closed']).describe('New status'),
      notes: z.string().optional().describe('Notes about the status change')
    },
    async (params) => {
      const caseData = runQuerySingle<{ id: number; status: string }>(`
        SELECT id, status FROM cases WHERE reference_number = ?
      `, [params.referenceNumber]);
      
      if (!caseData) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Case not found'
            }, null, 2)
          }]
        };
      }
      
      const oldStatus = caseData.status;
      
      // Update case
      runExec(`
        UPDATE cases 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE reference_number = ?
      `, [params.status, params.referenceNumber]);
      
      // Add event
      runExec(`
        INSERT INTO case_events (case_id, event_type, description)
        VALUES (?, 'status_change', ?)
      `, [
        caseData.id, 
        `Status changed from ${oldStatus} to ${params.status}${params.notes ? ': ' + params.notes : ''}`
      ]);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            referenceNumber: params.referenceNumber,
            previousStatus: oldStatus,
            newStatus: params.status,
            message: 'Case status updated successfully'
          }, null, 2)
        }]
      };
    }
  );

  // Add note to case
  server.tool(
    'add_case_note',
    'Add a note or event to a case',
    {
      referenceNumber: z.string().describe('Case reference number'),
      eventType: z.enum([
        'note',
        'phone_call',
        'email',
        'meeting',
        'letter_sent',
        'letter_received',
        'document_uploaded',
        'deadline_set',
        'hearing_scheduled',
        'outcome'
      ]).describe('Type of event'),
      description: z.string().describe('Description of the event'),
      createdBy: z.string().optional().describe('Who created this note')
    },
    async (params) => {
      const caseData = runQuerySingle<{ id: number }>(`
        SELECT id FROM cases WHERE reference_number = ?
      `, [params.referenceNumber]);
      
      if (!caseData) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Case not found'
            }, null, 2)
          }]
        };
      }
      
      // Add event
      const result = runExec(`
        INSERT INTO case_events (case_id, event_type, description, created_by)
        VALUES (?, ?, ?, ?)
      `, [caseData.id, params.eventType, params.description, params.createdBy || null]);
      
      // Update case timestamp
      runExec(`
        UPDATE cases SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `, [caseData.id]);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            referenceNumber: params.referenceNumber,
            eventId: result.lastInsertRowid,
            message: 'Note added successfully'
          }, null, 2)
        }]
      };
    }
  );

  // Set deadline for case
  server.tool(
    'set_case_deadline',
    'Set a deadline or reminder for a case',
    {
      referenceNumber: z.string().describe('Case reference number'),
      deadlineType: z.enum([
        'tribunal_hearing',
        'appeal_deadline',
        'response_due',
        'evidence_deadline',
        'review_date',
        'follow_up',
        'court_date',
        'other'
      ]).describe('Type of deadline'),
      deadlineDate: z.string().describe('Deadline date (YYYY-MM-DD)'),
      description: z.string().optional().describe('Description of the deadline')
    },
    async (params) => {
      const caseData = runQuerySingle<{ id: number }>(`
        SELECT id FROM cases WHERE reference_number = ?
      `, [params.referenceNumber]);
      
      if (!caseData) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Case not found'
            }, null, 2)
          }]
        };
      }
      
      // Add deadline
      const result = runExec(`
        INSERT INTO deadlines (case_id, deadline_type, deadline_date, description)
        VALUES (?, ?, ?, ?)
      `, [
        caseData.id, 
        params.deadlineType, 
        params.deadlineDate, 
        params.description || null
      ]);
      
      // Add event
      runExec(`
        INSERT INTO case_events (case_id, event_type, description)
        VALUES (?, 'deadline_set', ?)
      `, [caseData.id, `Deadline set: ${params.deadlineType} on ${params.deadlineDate}`]);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            referenceNumber: params.referenceNumber,
            deadlineId: result.lastInsertRowid,
            deadlineDate: params.deadlineDate,
            message: 'Deadline set successfully'
          }, null, 2)
        }]
      };
    }
  );

  // Search cases
  server.tool(
    'search_cases',
    'Search for cases by various criteria',
    {
      searchTerm: z.string().optional().describe('Search in reference number, summary, or client name'),
      category: z.string().optional().describe('Filter by category'),
      status: z.string().optional().describe('Filter by status'),
      priority: z.string().optional().describe('Filter by priority'),
      limit: z.number().optional().default(20).describe('Maximum results to return')
    },
    async (params) => {
      let query = 'SELECT * FROM cases WHERE 1=1';
      const queryParams: unknown[] = [];
      
      if (params.searchTerm) {
        query += ` AND (reference_number LIKE ? OR summary LIKE ? OR client_name LIKE ?)`;
        const term = `%${params.searchTerm}%`;
        queryParams.push(term, term, term);
      }
      
      if (params.category) {
        query += ` AND category = ?`;
        queryParams.push(params.category);
      }
      
      if (params.status) {
        query += ` AND status = ?`;
        queryParams.push(params.status);
      }
      
      if (params.priority) {
        query += ` AND priority = ?`;
        queryParams.push(params.priority);
      }
      
      query += ` ORDER BY updated_at DESC LIMIT ?`;
      queryParams.push(params.limit || 20);
      
      const cases = runQuery<Case>(query, queryParams);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: cases.length,
            cases: cases.map(c => ({
              referenceNumber: c.reference_number,
              category: c.category,
              status: c.status,
              priority: c.priority,
              summary: c.summary,
              clientName: c.client_name,
              updatedAt: c.updated_at
            }))
          }, null, 2)
        }]
      };
    }
  );

  // Get upcoming deadlines
  server.tool(
    'get_upcoming_deadlines',
    'Get all upcoming deadlines across cases',
    {
      daysAhead: z.number().optional().default(30).describe('Number of days to look ahead'),
      category: z.string().optional().describe('Filter by case category')
    },
    async (params) => {
      let query = `
        SELECT 
          d.*, 
          c.reference_number, 
          c.category, 
          c.summary,
          c.client_name
        FROM deadlines d
        JOIN cases c ON d.case_id = c.id
        WHERE d.deadline_date >= date('now')
        AND d.deadline_date <= date('now', '+' || ? || ' days')
        AND d.status = 'pending'
      `;
      const queryParams: unknown[] = [params.daysAhead || 30];
      
      if (params.category) {
        query += ` AND c.category = ?`;
        queryParams.push(params.category);
      }
      
      query += ` ORDER BY d.deadline_date ASC`;
      
      const deadlines = runQuery<unknown>(query, queryParams);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: deadlines.length,
            deadlines
          }, null, 2)
        }]
      };
    }
  );

  // Get case statistics
  server.tool(
    'get_case_statistics',
    'Get statistics about cases in the system',
    {},
    async () => {
      const totalCases = runQuerySingle<{ count: number }>('SELECT COUNT(*) as count FROM cases');
      const byStatus = runQuery<{ status: string; count: number }>(`
        SELECT status, COUNT(*) as count FROM cases GROUP BY status
      `);
      const byCategory = runQuery<{ category: string; count: number }>(`
        SELECT category, COUNT(*) as count FROM cases GROUP BY category ORDER BY count DESC
      `);
      const byPriority = runQuery<{ priority: string; count: number }>(`
        SELECT priority, COUNT(*) as count FROM cases GROUP BY priority
      `);
      const upcomingDeadlines = runQuerySingle<{ count: number }>(`
        SELECT COUNT(*) as count FROM deadlines 
        WHERE deadline_date >= date('now') 
        AND deadline_date <= date('now', '+7 days')
        AND status = 'pending'
      `);
      const overdueDeadlines = runQuerySingle<{ count: number }>(`
        SELECT COUNT(*) as count FROM deadlines 
        WHERE deadline_date < date('now')
        AND status = 'pending'
      `);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            totalCases: totalCases?.count || 0,
            byStatus,
            byCategory,
            byPriority,
            deadlines: {
              upcomingNext7Days: upcomingDeadlines?.count || 0,
              overdue: overdueDeadlines?.count || 0
            }
          }, null, 2)
        }]
      };
    }
  );
}

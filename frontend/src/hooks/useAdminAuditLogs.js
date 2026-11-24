import { useState, useCallback } from 'react';
import { adminService } from '../services/adminService';

export function useAdminAuditLogs(token) {
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const { ok, data } = await adminService.getAuditLogs(token);
      if (ok) setAuditLogs(data.logs || []);
    } catch (err) {
      console.error('Lỗi tải audit logs:', err);
    }
  }, [token]);

  return {
    auditLogs,
    fetchAuditLogs,
  };
}
const STAFF_API = 'http://localhost:5000/api/staff';
const LOGS_API = 'http://localhost:5000/api/logs';

const getAuthHeaders = (token, isJson = false) => {
  const authToken =
    token || localStorage.getItem('nova_token') || localStorage.getItem('token');
  return {
    ...(isJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${authToken}`,
  };
};

const request = async (url, { method = 'GET', token, body } = {}) => {
  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(token, Boolean(body)),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
};

export const adminService = {
  // Nhân sự (Staff)
  getStaffList: (token) => request(STAFF_API, { token }),

  inviteStaff: (token, payload) =>
    request(`${STAFF_API}/invite`, { method: 'POST', token, body: payload }),

  resendInvite: (token, staffId) =>
    request(`${STAFF_API}/${staffId}/resend-invite`, { method: 'POST', token }),

  cancelInvite: (token, staffId) =>
    request(`${STAFF_API}/${staffId}/cancel-invite`, { method: 'DELETE', token }),

  updateStaffStatus: (token, staffId, payload) =>
    request(`${STAFF_API}/${staffId}/status`, { method: 'PATCH', token, body: payload }),

  updateStaffRole: (token, staffId, payload) =>
    request(`${STAFF_API}/${staffId}/role`, { method: 'PATCH', token, body: payload }),

  // Nhật ký kiểm toán (Audit Logs)
  getAuditLogs: (token) => request(LOGS_API, { token }),
};
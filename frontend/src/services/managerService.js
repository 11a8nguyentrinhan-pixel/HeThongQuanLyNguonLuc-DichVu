const REQUEST_API = 'http://localhost:5000/api/service-requests/manager';

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

export const managerService = {
  getAllRequests: (token) => request(`${REQUEST_API}/all`, { token }),

  claimRequest: (token, requestId) =>
    request(`${REQUEST_API}/${requestId}/claim`, { method: 'PATCH', token }),

  reviewRequest: (token, requestId, payload) =>
    request(`${REQUEST_API}/${requestId}/review`, {
      method: 'PATCH',
      token,
      body: payload,
    }),
};
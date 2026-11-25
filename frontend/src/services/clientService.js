const API_BASE = 'http://localhost:5000/api/service-requests';
const QUOTE_CONTRACT_API = 'http://localhost:5000/api/quotes-contracts/client';

const getToken = (token) =>
  token || localStorage.getItem('nova_token') || localStorage.getItem('token');

const request = async (url, { method = 'GET', token, body, isFormData = false } = {}) => {
  const headers = {
    Authorization: `Bearer ${getToken(token)}`,
    ...(!isFormData && body ? { 'Content-Type': 'application/json' } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
};

export const clientService = {
  getCatalogs: (token) => request(`${API_BASE}/catalogs`, { token }),

  getMyRequests: (token) => request(`${API_BASE}/my`, { token }),

  createRequest: (token, formData) =>
    request(API_BASE, { method: 'POST', token, body: formData, isFormData: true }),

  clarifyRequest: (token, requestId, formData) =>
    request(`${API_BASE}/${requestId}/clarify`, {
      method: 'PUT',
      token,
      body: formData,
      isFormData: true,
    }),
    // --- Tiếp nhận báo giá & Ký hợp đồng ---
  getQuoteContractData: (token) => request(`${QUOTE_CONTRACT_API}/data`, { token }),
  respondQuotation: (token, quoteId, action) =>
    request(`${QUOTE_CONTRACT_API}/quotes/${quoteId}/respond`, {
      method: 'PATCH',
      token,
      body: { action },
    }),
  signContract: (token, contractId, agreed) =>
    request(`${QUOTE_CONTRACT_API}/contracts/${contractId}/sign`, {
      method: 'PATCH',
      token,
      body: { agreed },
    }),
};
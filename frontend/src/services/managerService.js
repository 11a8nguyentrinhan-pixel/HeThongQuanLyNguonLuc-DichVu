const REQUEST_API = 'http://localhost:5000/api/service-requests/manager';
const QUOTE_CONTRACT_API = 'http://localhost:5000/api/quotes-contracts/manager';

const getAuthHeaders = (token, isJson = false) => {
  const authToken =
    token || localStorage.getItem('nova_token') || localStorage.getItem('token');
  return {
    ...(isJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${authToken}`,
  };
};

const request = async (url, { method = 'GET', token, body, isFormData = false } = {}) => {
  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(token, !isFormData && Boolean(body)),
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
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
  getQuoteContractData: (token) => request(`${QUOTE_CONTRACT_API}/data`, { token }),
  createQuotation: (token, payload) =>
    request(`${QUOTE_CONTRACT_API}/quotes`, { method: 'POST', token, body: payload }),
  updateQuotationStatus: (token, quoteId, status) =>
    request(`${QUOTE_CONTRACT_API}/quotes/${quoteId}/status`, {
      method: 'PATCH',
      token,
      body: { status },
    }),
  createContract: (token, formData) =>
    request(`${QUOTE_CONTRACT_API}/contracts`, {
      method: 'POST',
      token,
      body: formData,
      isFormData: true,
    }),
  sendContractToClient: (token, contractId) =>
    request(`${QUOTE_CONTRACT_API}/contracts/${contractId}/send`, { method: 'PATCH', token }),
};
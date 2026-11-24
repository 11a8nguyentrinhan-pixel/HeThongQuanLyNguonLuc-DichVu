import { useState, useCallback, useEffect, useMemo } from 'react';
import { managerService } from '../services/managerService';

export function useManagerRequests(token, setNotice) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bộ lọc tra cứu hồ sơ (loại dịch vụ, trạng thái, từ khóa)
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | STANDARD | CUSTOM
  const [searchTerm, setSearchTerm] = useState('');

  // Modal thẩm định & chốt phạm vi
  const [reviewModal, setReviewModal] = useState({ open: false, request: null });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { ok, data } = await managerService.getAllRequests(token);
      if (ok) {
        setRequests(data.requests || []);
      } else {
        setNotice?.({
          type: 'error',
          text: data.message || 'Không thể tải danh sách yêu cầu dịch vụ.',
        });
      }
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setLoading(false);
    }
  }, [token, setNotice]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return requests.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (typeFilter === 'STANDARD' && !item.service_id) return false;
      if (typeFilter === 'CUSTOM' && item.service_id) return false;
      if (keyword) {
        const haystack = [
          `#req-${String(item.id).padStart(3, '0')}`,
          item.title,
          item.client_name,
          item.client_email,
          item.service_name || 'custom',
          item.manager_name || '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'Chờ xử lý').length,
      clarify: requests.filter((r) => r.status === 'Chờ làm rõ').length,
      approvedScope: requests.filter((r) => r.status === 'Đã chốt phạm vi').length,
      rejected: requests.filter((r) => r.status === 'Từ chối').length,
    };
  }, [requests]);

  const openReviewModal = (reqItem) => setReviewModal({ open: true, request: reqItem });
  const closeReviewModal = () => setReviewModal({ open: false, request: null });

  const handleClaim = async (requestId) => {
    setSubmitting(true);
    setNotice?.({ text: '', type: '' });
    try {
      const { ok, data } = await managerService.claimRequest(token, requestId);
      setNotice?.({ type: ok ? 'success' : 'error', text: data.message });
      if (ok) await fetchRequests();
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (requestId, payload) => {
    setSubmitting(true);
    setNotice?.({ text: '', type: '' });
    try {
      const { ok, data } = await managerService.reviewRequest(token, requestId, payload);
      if (!ok) {
        setNotice?.({ type: 'error', text: data.message || 'Thẩm định hồ sơ thất bại.' });
        return false;
      }
      setNotice?.({ type: 'success', text: data.message });
      closeReviewModal();
      await fetchRequests();
      return true;
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    requests,
    filteredRequests,
    stats,
    loading,
    submitting,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    searchTerm,
    setSearchTerm,
    reviewModal,
    openReviewModal,
    closeReviewModal,
    fetchRequests,
    handleClaim,
    handleReviewSubmit,
  };
}
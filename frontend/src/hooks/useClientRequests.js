import { useState, useCallback, useEffect } from 'react';
import { clientService } from '../services/clientService';

export function useClientRequests(token, onNotify) {
  const [catalogs, setCatalogs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [createModal, setCreateModal] = useState({ open: false, selectedCatalog: null });
  const [clarifyModal, setClarifyModal] = useState({ open: false, request: null });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, reqRes] = await Promise.all([
        clientService.getCatalogs(token),
        clientService.getMyRequests(token),
      ]);
      if (catRes.ok) setCatalogs(catRes.data.catalogs || []);
      if (reqRes.ok) {
        setRequests(reqRes.data.requests || []);
      } else {
        onNotify?.({ type: 'error', text: reqRes.data?.message || 'Không thể tải danh sách yêu cầu.' });
      }
    } catch (err) {
      onNotify?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setLoading(false);
    }
  }, [token, onNotify]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openCreateModal = (catalog = null) =>
    setCreateModal({ open: true, selectedCatalog: catalog });

  const closeCreateModal = () =>
    setCreateModal({ open: false, selectedCatalog: null });

  const openClarifyModal = (reqItem) =>
    setClarifyModal({ open: true, request: reqItem });

  const closeClarifyModal = () =>
    setClarifyModal({ open: false, request: null });

  const handleCreateSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const { ok, data } = await clientService.createRequest(token, formData);
      if (!ok) {
        onNotify?.({ type: 'error', text: data.message || 'Gửi yêu cầu thất bại.' });
        return false;
      }
      onNotify?.({ type: 'success', text: data.message });
      closeCreateModal();
      await fetchAll();
      return true;
    } catch (err) {
      onNotify?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleClarifySubmit = async (requestId, formData) => {
    setSubmitting(true);
    try {
      const { ok, data } = await clientService.clarifyRequest(token, requestId, formData);
      if (!ok) {
        onNotify?.({ type: 'error', text: data.message || 'Cập nhật bổ sung thất bại.' });
        return false;
      }
      onNotify?.({ type: 'success', text: data.message });
      closeClarifyModal();
      await fetchAll();
      return true;
    } catch (err) {
      onNotify?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    catalogs,
    requests,
    loading,
    submitting,
    createModal,
    clarifyModal,
    fetchAll,
    openCreateModal,
    closeCreateModal,
    openClarifyModal,
    closeClarifyModal,
    handleCreateSubmit,
    handleClarifySubmit,
  };
}
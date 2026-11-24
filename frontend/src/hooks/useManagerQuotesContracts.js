import { useState, useCallback, useEffect } from 'react';
import { managerService } from '../services/managerService';

export function useManagerQuotesContracts(token, setNotice) {
  const [readyRequests, setReadyRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal soạn báo giá (mode: 'create' | 'new_version')
  const [quoteModal, setQuoteModal] = useState({
    open: false,
    mode: 'create',
    requestItem: null,
    baseQuote: null,
  });

  // Modal soạn hợp đồng từ báo giá đã được Client chấp nhận
  const [contractModal, setContractModal] = useState({
    open: false,
    quote: null,
  });

  const fetchQuoteContractData = useCallback(async () => {
    setLoading(true);
    try {
      const { ok, data } = await managerService.getQuoteContractData(token);
      if (ok) {
        setReadyRequests(data.readyRequests || []);
        setQuotations(data.quotations || []);
        setContracts(data.contracts || []);
      } else {
        setNotice?.({
          type: 'error',
          text: data.message || 'Không thể tải dữ liệu Báo giá & Hợp đồng.',
        });
      }
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setLoading(false);
    }
  }, [token, setNotice]);

  useEffect(() => {
    fetchQuoteContractData();
  }, [fetchQuoteContractData]);

  const openCreateQuoteModal = (requestItem) =>
    setQuoteModal({ open: true, mode: 'create', requestItem, baseQuote: null });

  const openNewVersionModal = (quoteItem) =>
    setQuoteModal({ open: true, mode: 'new_version', requestItem: null, baseQuote: quoteItem });

  const closeQuoteModal = () =>
    setQuoteModal({ open: false, mode: 'create', requestItem: null, baseQuote: null });

  const openContractModal = (quoteItem) => setContractModal({ open: true, quote: quoteItem });
  const closeContractModal = () => setContractModal({ open: false, quote: null });

  const handleSaveQuote = async (payload) => {
    setSubmitting(true);
    setNotice?.({ text: '', type: '' });
    try {
      const { ok, data } = await managerService.createQuotation(token, payload);
      if (!ok) {
        setNotice?.({ type: 'error', text: data.message || 'Lập báo giá thất bại.' });
        return false;
      }
      setNotice?.({ type: 'success', text: data.message });
      closeQuoteModal();
      await fetchQuoteContractData();
      return true;
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuoteStatus = async (quoteId, status) => {
    setSubmitting(true);
    setNotice?.({ text: '', type: '' });
    try {
      const { ok, data } = await managerService.updateQuotationStatus(token, quoteId, status);
      setNotice?.({ type: ok ? 'success' : 'error', text: data.message });
      if (ok) await fetchQuoteContractData();
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveContract = async (formData) => {
    setSubmitting(true);
    setNotice?.({ text: '', type: '' });
    try {
      const { ok, data } = await managerService.createContract(token, formData);
      if (!ok) {
        setNotice?.({ type: 'error', text: data.message || 'Soạn hợp đồng thất bại.' });
        return false;
      }
      setNotice?.({ type: 'success', text: data.message });
      closeContractModal();
      await fetchQuoteContractData();
      return true;
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendContract = async (contractId) => {
    setSubmitting(true);
    setNotice?.({ text: '', type: '' });
    try {
      const { ok, data } = await managerService.sendContractToClient(token, contractId);
      setNotice?.({ type: ok ? 'success' : 'error', text: data.message });
      if (ok) await fetchQuoteContractData();
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    readyRequests,
    quotations,
    contracts,
    loading,
    submitting,
    quoteModal,
    contractModal,
    fetchQuoteContractData,
    openCreateQuoteModal,
    openNewVersionModal,
    closeQuoteModal,
    openContractModal,
    closeContractModal,
    handleSaveQuote,
    handleUpdateQuoteStatus,
    handleSaveContract,
    handleSendContract,
  };
}
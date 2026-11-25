import { useState, useCallback, useEffect, useMemo } from 'react';
import { clientService } from '../services/clientService';

export function useClientQuotesContracts(token, setNotice) {
  const [quotations, setQuotations] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signModal, setSignModal] = useState({ open: false, contract: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { ok, data } = await clientService.getQuoteContractData(token);
      if (ok) {
        setQuotations(data.quotations || []);
        setContracts(data.contracts || []);
      } else {
        setNotice?.({
          type: 'error',
          text: data.message || 'Không thể tải danh sách Báo giá & Hợp đồng.',
        });
      }
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setLoading(false);
    }
  }, [token, setNotice]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingActionCount = useMemo(() => {
    const waitingQuotes = quotations.filter((q) => q.status === 'Đã gửi').length;
    const waitingContracts = contracts.filter((c) => c.status === 'Chờ duyệt').length;
    return waitingQuotes + waitingContracts;
  }, [quotations, contracts]);

  const handleRespondQuote = async (quoteId, action) => {
    setSubmitting(true);
    setNotice?.({ text: '', type: '' });
    try {
      const { ok, data } = await clientService.respondQuotation(token, quoteId, action);
      setNotice?.({ type: ok ? 'success' : 'error', text: data.message });
      if (ok) await fetchData();
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openSignModal = (contract) => setSignModal({ open: true, contract });
  const closeSignModal = () => setSignModal({ open: false, contract: null });

  const handleSignContract = async (contractId, agreed) => {
    setSubmitting(true);
    setNotice?.({ text: '', type: '' });
    try {
      const { ok, data } = await clientService.signContract(token, contractId, agreed);
      setNotice?.({ type: ok ? 'success' : 'error', text: data.message });
      if (ok) {
        closeSignModal();
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      setNotice?.({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    quotations,
    contracts,
    loading,
    submitting,
    pendingActionCount,
    signModal,
    fetchData,
    handleRespondQuote,
    openSignModal,
    closeSignModal,
    handleSignContract,
  };
}
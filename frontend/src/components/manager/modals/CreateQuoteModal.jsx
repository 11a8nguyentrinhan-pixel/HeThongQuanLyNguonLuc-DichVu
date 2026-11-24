import { useState, useEffect } from 'react';
import { btnPrimarySm, btnOutlineSm, formatCurrency } from '../managerConfig';

const defaultValidDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
};

export default function CreateQuoteModal({
  open,
  mode,
  requestItem,
  baseQuote,
  submitting,
  onClose,
  onSubmit,
}) {
  const [quoteType, setQuoteType] = useState('Báo giá chính');
  const [items, setItems] = useState([{ name: '', scope: '', quantity: 1, unit_price: 0 }]);
  const [taxRate, setTaxRate] = useState(10);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [validUntil, setValidUntil] = useState(defaultValidDate());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');

    if (mode === 'new_version' && baseQuote) {
      setQuoteType(baseQuote.quote_type || 'Báo giá chính');
      setItems(
        baseQuote.items_detail?.length
          ? baseQuote.items_detail.map((it) => ({ ...it }))
          : [{ name: '', scope: '', quantity: 1, unit_price: 0 }]
      );
      const sub = (baseQuote.items_detail || []).reduce(
        (s, it) => s + (Number(it.quantity) || 1) * (Number(it.unit_price) || 0),
        0
      );
      setTaxRate(sub > 0 ? Math.round((Number(baseQuote.tax_amount || 0) / sub) * 100) : 10);
      setPaymentTerms(baseQuote.payment_terms || '');
      setValidUntil(baseQuote.valid_until || defaultValidDate());
    } else if (requestItem) {
      setQuoteType('Báo giá chính');
      setItems([
        {
          name: requestItem.service_name || requestItem.title,
          scope: 'Triển khai trọn gói theo phạm vi đã chốt (tối đa 3 lần chỉnh sửa miễn phí)',
          quantity: 1,
          unit_price: Number(requestItem.snapshot_price) || 0,
        },
      ]);
      setTaxRate(10);
      setPaymentTerms(
        'Thanh toán 3 đợt: Đợt 1 đặt cọc 40% khi ký hợp đồng; Đợt 2 thanh toán 30% khi hoàn tất bản UAT; Đợt 3 tất toán 30% khi nghiệm thu bàn giao.'
      );
      setValidUntil(defaultValidDate());
    }
  }, [open, mode, requestItem, baseQuote]);

  if (!open) return null;

  const targetRequestId = mode === 'new_version' ? baseQuote?.request_id : requestItem?.id;
  const targetTitle = mode === 'new_version' ? baseQuote?.request_title : requestItem?.title;
  const nextVerLabel =
    mode === 'new_version'
      ? `v${Number(baseQuote?.version_number || 1) + 1}`
      : `v${Number(requestItem?.quote_count || 0) + 1}`;

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0
  );
  const taxAmount = Math.round((subtotal * Math.max(0, Number(taxRate) || 0)) / 100);
  const totalAmount = subtotal + taxAmount;

  const updateItem = (idx, field, val) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));
  };

  const addItem = () =>
    setItems((prev) => [...prev, { name: '', scope: '', quantity: 1, unit_price: 0 }]);

  const removeItem = (idx) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAction = async (status) => {
    setError('');
    if (items.some((it) => !it.name.trim())) {
      setError('Vui lòng nhập đầy đủ tên cho tất cả các hạng mục báo giá.');
      return;
    }
    if (!paymentTerms.trim() || !validUntil) {
      setError('Vui lòng nhập điều kiện thanh toán và hạn hiệu lực báo giá.');
      return;
    }

    await onSubmit({
      request_id: targetRequestId,
      quote_type: quoteType,
      items_detail: items,
      tax_rate: Number(taxRate) || 0,
      payment_terms: paymentTerms.trim(),
      valid_until: validUntil,
      status,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2b1f]/55 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#10231b]">
              {mode === 'new_version'
                ? `Tạo phiên bản báo giá mới (${nextVerLabel}) — Bảo toàn bản cũ`
                : `Soạn bảng báo giá (${nextVerLabel})`}
            </h3>
            <p className="mt-0.5 text-xs text-[#6b7c74]">
              Hồ sơ #REQ-{String(targetRequestId).padStart(3, '0')} · {targetTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#f1f4f2] text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">Loại báo giá</label>
              <select
                value={quoteType}
                onChange={(e) => setQuoteType(e.target.value)}
                className="w-full rounded-xl border border-[#dfe4e0] bg-white px-3 py-2 text-xs outline-none focus:border-[#154734]"
              >
                <option value="Báo giá chính">Báo giá chính</option>
                <option value="Báo giá phụ lục phát sinh">Báo giá phụ lục phát sinh</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">Thuế VAT (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full rounded-xl border border-[#dfe4e0] px-3 py-2 text-xs outline-none focus:border-[#154734]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">Hạn hiệu lực *</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-xl border border-[#dfe4e0] px-3 py-2 text-xs outline-none focus:border-[#154734]"
              />
            </div>
          </div>

          {/* Danh sách hạng mục */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold text-[#1d332a]">
                Chi tiết hạng mục, phạm vi bàn giao &amp; đơn giá *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="cursor-pointer text-xs font-bold text-[#154734] underline"
              >
                + Thêm hạng mục
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-[#e4e8e5] bg-[#fafbfa] p-3 sm:grid-cols-12"
                >
                  <input
                    type="text"
                    placeholder="Tên hạng mục"
                    value={it.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    className="rounded-lg border border-[#dfe4e0] bg-white px-2.5 py-1.5 text-xs sm:col-span-4"
                  />
                  <input
                    type="text"
                    placeholder="Mô tả bàn giao / tiêu chí"
                    value={it.scope}
                    onChange={(e) => updateItem(idx, 'scope', e.target.value)}
                    className="rounded-lg border border-[#dfe4e0] bg-white px-2.5 py-1.5 text-xs sm:col-span-4"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="SL"
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="rounded-lg border border-[#dfe4e0] bg-white px-2 py-1.5 text-xs sm:col-span-1"
                  />
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    placeholder="Đơn giá (VNĐ)"
                    value={it.unit_price}
                    onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                    className="rounded-lg border border-[#dfe4e0] bg-white px-2.5 py-1.5 text-xs sm:col-span-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    className="cursor-pointer rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-xs font-bold text-rose-600 disabled:opacity-40 sm:col-span-1"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng hợp chi phí */}
          <div className="rounded-xl bg-[#f7faf8] p-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6b7c74]">Tạm tính trước thuế:</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[#6b7c74]">Thuế VAT ({taxRate || 0}%):</span>
              <strong>{formatCurrency(taxAmount)}</strong>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#dfe4e0] pt-2 text-sm font-extrabold text-[#154734]">
              <span>Tổng chi phí sau thuế:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#1d332a]">
              Điều kiện &amp; lộ trình thanh toán (Tối đa 3 đợt) *
            </label>
            <textarea
              rows={3}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2 text-xs outline-none focus:border-[#154734]"
            />
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={btnOutlineSm}>
              Hủy
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleAction('Bản nháp')}
              className={btnOutlineSm}
            >
              Lưu Bản nháp
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleAction('Đã gửi')}
              className={btnPrimarySm}
            >
              {submitting ? 'Đang lưu...' : `Lưu & Gửi báo giá ${nextVerLabel} cho Client`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
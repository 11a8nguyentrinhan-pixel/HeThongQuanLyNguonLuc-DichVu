import { useState, useEffect } from 'react';
import { btnPrimarySm, btnOutlineSm, formatCurrency } from '../managerConfig';

export default function CreateContractModal({ open, quote, submitting, onClose, onSubmit }) {
  const [legalInfo, setLegalInfo] = useState('');
  const [paymentStages, setPaymentStages] = useState(3);
  const [maxFreeRevisions, setMaxFreeRevisions] = useState(3);
  const [cancelPolicy, setCancelPolicy] = useState('');
  const [file, setFile] = useState(null);
  const [templateUrl, setTemplateUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && quote) {
      setLegalInfo(
        `Bên A (Khách hàng): ${quote.client_name} (${quote.client_email}${
          quote.client_phone ? ` · SĐT: ${quote.client_phone}` : ''
        })\nBên B (Đơn vị cung cấp): Công ty Giải pháp Phần mềm Nori Workspace`
      );
      setPaymentStages(3);
      setMaxFreeRevisions(3);
      setCancelPolicy(
        '• Tiêu chí nghiệm thu: Sản phẩm đáp ứng 100% hạng mục trong báo giá đã duyệt, không có lỗi nghiêm trọng.\n• Giới hạn chỉnh sửa: Tối đa 03 lần chỉnh sửa miễn phí cho mỗi hạng mục. Yêu cầu vượt quá 3 lần hoặc tính năng mới sẽ lập phụ lục bổ sung.\n• Chính sách hủy/hoàn: Hủy trước khi khởi tạo dự án hoàn 80% cọc; hủy sau khi đã triển khai thanh toán theo khối lượng thực tế.'
      );
      setFile(null);
      setTemplateUrl(quote.contract_template || '');
      setError('');
    }
  }, [open, quote]);

  if (!open || !quote) return null;

  const submitWithStatus = async (status) => {
    setError('');
    if (!legalInfo.trim() || !cancelPolicy.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin pháp nhân và điều khoản nghiệm thu / hủy hoàn.');
      return;
    }

    const formData = new FormData();
    formData.append('quote_id', quote.id);
    formData.append('legal_info', legalInfo.trim());
    formData.append('payment_stages', String(paymentStages));
    formData.append('max_free_revisions', String(maxFreeRevisions));
    formData.append('cancel_policy', cancelPolicy.trim());
    formData.append('status', status);
    if (file) {
      formData.append('contract_file', file);
    } else if (templateUrl.trim()) {
      formData.append('contract_file_url', templateUrl.trim());
    }

    await onSubmit(formData);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2b1f]/55 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#10231b]">
              Soạn hợp đồng từ báo giá #QT-{String(quote.id).padStart(3, '0')} (v
              {quote.version_number})
            </h3>
            <p className="mt-0.5 text-xs text-[#6b7c74]">
              Giá trị hợp đồng khóa cứng theo báo giá cuối:{' '}
              <strong className="text-[#154734]">{formatCurrency(quote.total_amount)}</strong>
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
          <div>
            <label className="mb-1 block text-xs font-bold text-[#1d332a]">
              Thông tin pháp nhân hai bên *
            </label>
            <textarea
              rows={3}
              value={legalInfo}
              onChange={(e) => setLegalInfo(e.target.value)}
              className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2 text-xs outline-none focus:border-[#154734]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                Số đợt thanh toán (Tối đa 3 đợt) *
              </label>
              <select
                value={paymentStages}
                onChange={(e) => setPaymentStages(Number(e.target.value))}
                className="w-full rounded-xl border border-[#dfe4e0] bg-white px-3 py-2 text-xs outline-none focus:border-[#154734]"
              >
                <option value={1}>1 đợt (Thanh toán 100% trước triển khai)</option>
                <option value={2}>2 đợt (Đặt cọc &amp; Tất toán nghiệm thu)</option>
                <option value={3}>3 đợt (Đặt cọc · Giữa kỳ · Tất toán)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                Số lần chỉnh sửa miễn phí tối đa (Chuẩn = 3)
              </label>
              <input
                type="number"
                min="0"
                max="3"
                value={maxFreeRevisions}
                onChange={(e) => setMaxFreeRevisions(Number(e.target.value))}
                className="w-full rounded-xl border border-[#dfe4e0] px-3 py-2 text-xs outline-none focus:border-[#154734]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#1d332a]">
              Tiêu chí nghiệm thu &amp; Chính sách hủy / hoàn tiền *
            </label>
            <textarea
              rows={4}
              value={cancelPolicy}
              onChange={(e) => setCancelPolicy(e.target.value)}
              className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2 text-xs outline-none focus:border-[#154734]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                Đính kèm tệp hợp đồng (PDF/DOCX)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-[#dfe4e0] px-2.5 py-2 text-xs"
              />
              {file && (
                <p className="mt-1 text-[11px] font-medium text-emerald-700">
                  Đã chọn: {file.name}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                Hoặc dùng đường dẫn mẫu hợp đồng chuẩn
              </label>
              <input
                type="text"
                value={templateUrl}
                onChange={(e) => setTemplateUrl(e.target.value)}
                disabled={Boolean(file)}
                placeholder="/templates/hd-website-ecommerce.pdf"
                className="w-full rounded-xl border border-[#dfe4e0] px-3 py-2 text-xs outline-none focus:border-[#154734] disabled:bg-[#f3f5f4]"
              />
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={btnOutlineSm}>
              Hủy
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitWithStatus('Bản thảo')}
              className={btnOutlineSm}
            >
              Lưu Bản thảo
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitWithStatus('Chờ duyệt')}
              className={btnPrimarySm}
            >
              {submitting ? 'Đang xuất bản...' : 'Xuất bản & Trình Client ký kết'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
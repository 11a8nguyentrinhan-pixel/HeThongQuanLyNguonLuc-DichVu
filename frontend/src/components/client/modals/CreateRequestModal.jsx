import { useState, useEffect } from 'react';
import { btnPrimarySm, btnOutlineSm, formatCurrency } from '../clientConfig';

export default function CreateRequestModal({
  open,
  catalogs,
  selectedCatalog,
  submitting,
  onClose,
  onSubmit,
}) {
  const [serviceId, setServiceId] = useState('');
  const [title, setTitle] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [attachmentLink, setAttachmentLink] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setServiceId(selectedCatalog ? String(selectedCatalog.id) : '');
      setTitle(selectedCatalog ? `Yêu cầu triển khai: ${selectedCatalog.service_name}` : '');
      setScopeDescription('');
      setAttachmentLink('');
      setFile(null);
      setError('');
    }
  }, [open, selectedCatalog]);

  if (!open) return null;

  const activeCatalog = catalogs.find((c) => String(c.id) === String(serviceId));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !scopeDescription.trim()) {
      setError('Vui lòng nhập đầy đủ tiêu đề và mô tả phạm vi công việc.');
      return;
    }

    const formData = new FormData();
    if (serviceId) formData.append('service_id', serviceId);
    formData.append('title', title.trim());
    formData.append('scope_description', scopeDescription.trim());
    if (file) {
      formData.append('attachment', file);
    } else if (attachmentLink.trim()) {
      formData.append('attachment_url', attachmentLink.trim());
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
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#10231b]">Gửi yêu cầu dịch vụ mới</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#f1f4f2] text-xs font-bold text-[#10231b]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[#1d332a]">Loại dịch vụ</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-xl border border-[#dfe4e0] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
            >
              <option value="">-- Dịch vụ tùy chỉnh (Custom Request) --</option>
              {catalogs.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.service_name} ({formatCurrency(cat.base_price)})
                </option>
              ))}
            </select>
            {activeCatalog && (
              <p className="mt-1 text-[11px] font-medium text-emerald-700">
                Hệ thống sẽ bảo toàn mức giá {formatCurrency(activeCatalog.base_price)} tại thời điểm đặt.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#1d332a]">Tiêu đề yêu cầu *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thiết kế hệ thống quản lý bán hàng giai đoạn 1"
              className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#1d332a]">
              Mô tả chi tiết phạm vi, mục tiêu &amp; thời hạn mong muốn *
            </label>
            <textarea
              rows={4}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="Mô tả mục tiêu, các tính năng chính, đầu ra mong muốn, thời hạn dự kiến..."
              className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                Đính kèm tệp (tối đa 10MB)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-[#dfe4e0] px-2.5 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                Hoặc dán link tài liệu
              </label>
              <input
                type="url"
                value={attachmentLink}
                onChange={(e) => setAttachmentLink(e.target.value)}
                disabled={Boolean(file)}
                placeholder="https://drive.google.com/..."
                className="w-full rounded-xl border border-[#dfe4e0] px-3 py-2 text-xs outline-none focus:border-[#154734] disabled:bg-[#f3f5f4]"
              />
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={btnOutlineSm}>
              Hủy
            </button>
            <button type="submit" disabled={submitting} className={btnPrimarySm}>
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
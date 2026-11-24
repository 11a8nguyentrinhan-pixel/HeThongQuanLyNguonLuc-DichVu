import { useState, useEffect } from 'react';
import { btnPrimarySm, btnOutlineSm, resolveAttachmentUrl } from '../clientConfig';

export default function ClarifyRequestModal({
  open,
  request,
  submitting,
  onClose,
  onSubmit,
}) {
  const [title, setTitle] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [attachmentLink, setAttachmentLink] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && request) {
      setTitle(request.title || '');
      setScopeDescription(request.scope_description || '');
      setAttachmentLink(
        request.attachment_url && /^https?:\/\//i.test(request.attachment_url)
          ? request.attachment_url
          : ''
      );
      setFile(null);
      setError('');
    }
  }, [open, request]);

  if (!open || !request) return null;

  const existingFileUrl = resolveAttachmentUrl(request.attachment_url);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !scopeDescription.trim()) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung bổ sung làm rõ phạm vi.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('scope_description', scopeDescription.trim());
    if (file) {
      formData.append('attachment', file);
    } else if (attachmentLink.trim()) {
      formData.append('attachment_url', attachmentLink.trim());
    }

    await onSubmit(request.id, formData);
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
          <div>
            <h3 className="text-base font-extrabold text-[#10231b]">
              Bổ sung &amp; Làm rõ phạm vi (#REQ-{String(request.id).padStart(3, '0')})
            </h3>
            <p className="mt-0.5 text-xs text-[#6b7c74]">
              Cập nhật ngay trên hồ sơ hiện tại để giữ liên tục lịch sử trao đổi với Manager.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#f1f4f2] text-xs font-bold text-[#10231b]"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          <strong>Nội dung Manager yêu cầu làm rõ:</strong>{' '}
          {request.reject_reason || 'Cần bổ sung thêm mô tả chi tiết hoặc tệp tài liệu hợp lệ.'}
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[#1d332a]">Tiêu đề yêu cầu *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#1d332a]">
              Mô tả phạm vi đã cập nhật / giải đáp câu hỏi *
            </label>
            <textarea
              rows={5}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                Tải tệp mới thay thế (nếu cần)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-[#dfe4e0] px-2.5 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                Hoặc cập nhật link tài liệu
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

          {existingFileUrl && (
            <p className="text-[11px] text-[#6b7c74]">
              Tệp hiện tại:{' '}
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#154734] underline"
              >
                Mở xem ↗
              </a>{' '}
              (để trống nếu muốn giữ nguyên).
            </p>
          )}

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={btnOutlineSm}>
              Hủy
            </button>
            <button type="submit" disabled={submitting} className={btnPrimarySm}>
              {submitting ? 'Đang gửi lại...' : 'Gửi bổ sung cho Manager'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
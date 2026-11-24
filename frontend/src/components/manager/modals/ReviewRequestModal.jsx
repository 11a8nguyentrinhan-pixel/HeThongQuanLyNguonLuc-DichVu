import { useState, useEffect } from 'react';
import {
  btnPrimarySm,
  btnOutlineSm,
  formatCurrency,
  resolveAttachmentUrl,
  SCOPE_BASELINE_TEMPLATE,
} from '../managerConfig';

export default function ReviewRequestModal({
  open,
  request,
  submitting,
  onClose,
  onSubmit,
}) {
  const [action, setAction] = useState('approve_scope'); // approve_scope | clarify | reject
  const [reason, setReason] = useState('');
  const [scopeText, setScopeText] = useState('');
  const [checklist, setChecklist] = useState({
    infoComplete: false,
    workloadOk: false,
    noDuplicate: false,
    riskAcceptable: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && request) {
      setAction('approve_scope');
      setReason(request.reject_reason || '');
      setScopeText(request.scope_description || '');
      setChecklist({
        infoComplete: false,
        workloadOk: false,
        noDuplicate: false,
        riskAcceptable: false,
      });
      setError('');
    }
  }, [open, request]);

  if (!open || !request) return null;

  const isClosed = ['Đã chốt phạm vi', 'Từ chối'].includes(request.status);
  const fileUrl = resolveAttachmentUrl(request.attachment_url);

  const handleInsertScopeTemplate = () => {
    if (!scopeText.includes('THỐNG NHẤT CHỐT PHẠM VI')) {
      setScopeText((prev) => `${prev.trim()}\n${SCOPE_BASELINE_TEMPLATE}`);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if ((action === 'clarify' || action === 'reject') && !reason.trim()) {
      setError(
        action === 'clarify'
          ? 'Vui lòng nhập danh sách thông tin hoặc tệp cần Client bổ sung làm rõ.'
          : 'Vui lòng nhập lý do từ chối minh bạch để gửi phản hồi cho Client.'
      );
      return;
    }

    if (action === 'approve_scope' && !scopeText.trim()) {
      setError('Vui lòng xác nhận mô tả phạm vi trước khi chốt.');
      return;
    }

    await onSubmit(request.id, {
      action,
      reject_reason: action === 'approve_scope' ? null : reason.trim(),
      scope_description: scopeText.trim(),
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2b1f]/55 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#10231b]">
              Thẩm định yêu cầu #REQ-{String(request.id).padStart(3, '0')}
            </h3>
            <p className="mt-0.5 text-xs text-[#6b7c74]">
              {request.title} · Khách hàng: <strong>{request.client_name}</strong> ({request.client_id})
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

        {/* Thông tin tóm tắt đối chiếu */}
        <div className="mb-4 grid grid-cols-1 gap-2.5 rounded-xl border border-[#e4e8e5] bg-[#f8faf8] p-3.5 text-xs sm:grid-cols-2">
          <div>
            <span className="text-[#6b7c74]">Loại yêu cầu: </span>
            <strong className="text-[#10231b]">
              {request.service_id ? `Gói có sẵn (${request.service_name})` : 'Dịch vụ tùy chỉnh (Custom)'}
            </strong>
          </div>
          <div>
            <span className="text-[#6b7c74]">Giá bảo toàn (Snapshot): </span>
            <strong className="text-[#154734]">{formatCurrency(request.snapshot_price)}</strong>
          </div>
          <div>
            <span className="text-[#6b7c74]">Trạng thái hiện tại: </span>
            <strong className="text-[#10231b]">{request.status}</strong>
          </div>
          <div>
            <span className="text-[#6b7c74]">Tài liệu đính kèm: </span>
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#154734] underline"
              >
                Mở kiểm tra tệp ↗
              </a>
            ) : (
              <span className="text-[#6b7c74]">Không có</span>
            )}
          </div>
        </div>

        {isClosed ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-[#e4e8e5] p-3.5 text-xs">
              <div className="mb-1 font-bold text-[#10231b]">Phạm vi công việc ghi nhận:</div>
              <p className="whitespace-pre-line text-[#3a4d44]">{request.scope_description}</p>
            </div>
            {request.reject_reason && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                <strong>Lý do từ chối:</strong> {request.reject_reason}
              </div>
            )}
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className={btnOutlineSm}>
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Checklist thẩm định nội bộ */}
            <div className="rounded-xl border border-[#dfe4e0] bg-[#fafbfa] p-3.5">
              <div className="mb-2 text-xs font-bold text-[#1d332a]">
                Checklist thẩm định tính khả thi &amp; rủi ro (Tham chiếu nội bộ):
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.infoComplete}
                    onChange={(e) =>
                      setChecklist((p) => ({ ...p, infoComplete: e.target.checked }))
                    }
                  />
                  <span>Đủ dữ liệu đầu vào &amp; mở được tệp đính kèm</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.workloadOk}
                    onChange={(e) =>
                      setChecklist((p) => ({ ...p, workloadOk: e.target.checked }))
                    }
                  />
                  <span>Đủ chuyên môn &amp; công suất (Workload) đội ngũ</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.noDuplicate}
                    onChange={(e) =>
                      setChecklist((p) => ({ ...p, noDuplicate: e.target.checked }))
                    }
                  />
                  <span>Đã kiểm tra không trùng lặp dự án đang chạy</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.riskAcceptable}
                    onChange={(e) =>
                      setChecklist((p) => ({ ...p, riskAcceptable: e.target.checked }))
                    }
                  />
                  <span>Rủi ro phạm vi &amp; thời hạn trong ngưỡng an toàn</span>
                </label>
              </div>
            </div>

            {/* Chọn 1 trong 3 quyết định xử lý */}
            <div>
              <div className="mb-2 text-xs font-bold text-[#1d332a]">
                Chọn quyết định thẩm định:
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setAction('approve_scope');
                    setError('');
                  }}
                  className={`cursor-pointer rounded-xl border p-3 text-left text-xs transition ${
                    action === 'approve_scope'
                      ? 'border-[#154734] bg-emerald-50 font-bold text-[#154734]'
                      : 'border-[#dfe4e0] bg-white text-[#10231b] hover:bg-[#f7faf8]'
                  }`}
                >
                  <div>1. Chốt và Xác định phạm vi</div>
                  <div className="mt-0.5 text-[10.5px] font-normal text-[#6b7c74]">
                    Chuyển sang lập báo giá
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAction('clarify');
                    setError('');
                  }}
                  className={`cursor-pointer rounded-xl border p-3 text-left text-xs transition ${
                    action === 'clarify'
                      ? 'border-amber-500 bg-amber-50 font-bold text-amber-900'
                      : 'border-[#dfe4e0] bg-white text-[#10231b] hover:bg-[#f7faf8]'
                  }`}
                >
                  <div>2. Bổ sung thông tin</div>
                  <div className="mt-0.5 text-[10.5px] font-normal text-[#6b7c74]">
                    Trả Client bổ sung thông tin
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAction('reject');
                    setError('');
                  }}
                  className={`cursor-pointer rounded-xl border p-3 text-left text-xs transition ${
                    action === 'reject'
                      ? 'border-rose-500 bg-rose-50 font-bold text-rose-800'
                      : 'border-[#dfe4e0] bg-white text-[#10231b] hover:bg-[#f7faf8]'
                  }`}
                >
                  <div>3. Từ chối yêu cầu</div>
                  <div className="mt-0.5 text-[10.5px] font-normal text-[#6b7c74]">
                    Ngoài năng lực / Rủi ro cao
                  </div>
                </button>
              </div>
            </div>

            {/* Ô nhập liệu theo từng quyết định */}
            {action === 'approve_scope' ? (
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#1d332a]">
                    Nội dung chốt phạm vi *
                  </label>
                </div>
                <textarea
                  rows={6}
                  value={scopeText}
                  onChange={(e) => setScopeText(e.target.value)}
                  className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-xs leading-relaxed outline-none focus:border-[#154734]"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-bold text-[#1d332a]">
                  {action === 'clarify'
                    ? 'Danh sách câu hỏi / dữ liệu cần Client bổ sung *'
                    : 'Lý do từ chối tiếp nhận yêu cầu (hiển thị cho Client) *'}
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    action === 'clarify'
                      ? 'VD: 1. Tệp đặc tả bị lỗi không mở được; 2. Vui lòng bổ sung thời hạn mong muốn và số lượng màn hình dự kiến...'
                      : 'VD: Yêu cầu vượt quá giới hạn chuyên môn/công suất hiện tại trong thời hạn 7 ngày...'
                  }
                  className="w-full rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
                />
              </div>
            )}

            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className={btnOutlineSm}>
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 ${
                  action === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : action === 'clarify'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[#154734] hover:bg-[#0f3728]'
                }`}
              >
                {submitting
                  ? 'Đang lưu...'
                  : action === 'approve_scope'
                  ? 'Xác nhận Chốt phạm vi'
                  : action === 'clarify'
                  ? 'Gửi yêu cầu làm rõ cho Client'
                  : 'Xác nhận Từ chối hồ sơ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
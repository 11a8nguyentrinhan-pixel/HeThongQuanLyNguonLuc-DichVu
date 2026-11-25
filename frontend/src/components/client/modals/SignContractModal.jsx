import { useState, useEffect } from 'react';
import {
  btnPrimarySm,
  btnOutlineSm,
  formatCurrency,
  resolveAttachmentUrl,
  getAttachmentName,
} from '../clientConfig';

export default function SignContractModal({ open, contract, submitting, onClose, onConfirmSign }) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (open) setAgreed(false);
  }, [open, contract]);

  if (!open || !contract) return null;

  const fileUrl = resolveAttachmentUrl(contract.contract_file_url);

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
              Ký duyệt điện tử hợp đồng {contract.contract_code}
            </h3>
            <p className="mt-0.5 text-xs text-[#6b7c74]">
              {contract.request_title} · Theo báo giá #QT-{String(contract.quote_id).padStart(3, '0')}{' '}
              (v{contract.version_number})
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

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-[#f7faf8] p-3.5 sm:grid-cols-3">
            <div>
              <div className="text-[11px] text-[#6b7c74]">Tổng giá trị hợp đồng</div>
              <div className="mt-0.5 text-sm font-extrabold text-[#154734]">
                {formatCurrency(contract.total_value)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6b7c74]">Lộ trình thanh toán</div>
              <div className="mt-0.5 font-bold text-[#10231b]">
                {contract.payment_stages} đợt thanh toán
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6b7c74]">Giới hạn chỉnh sửa</div>
              <div className="mt-0.5 font-bold text-[#10231b]">
                Tối đa {contract.max_free_revisions} lần miễn phí
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e4e8e5] p-3.5">
            <div className="mb-1 font-bold text-[#10231b]">1. Thông tin pháp nhân hai bên</div>
            <p className="whitespace-pre-line text-[#3a4d44]">{contract.legal_info}</p>
          </div>

          <div className="rounded-xl border border-[#e4e8e5] p-3.5">
            <div className="mb-1 font-bold text-[#10231b]">
              2. Tiêu chí nghiệm thu &amp; Chính sách hủy / hoàn tiền
            </div>
            <p className="whitespace-pre-line text-[#3a4d44]">{contract.cancel_policy}</p>
          </div>

          {fileUrl && (
            <div className="rounded-xl bg-[#f8faf8] p-3">
              Bản mềm hợp đồng đính kèm:{' '}
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#154734] underline"
              >
                📎 {getAttachmentName(contract.contract_file_url)} ↗
              </a>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#154734]"
            />
            <span className="text-xs font-medium text-[#10231b]">
              Tôi xác nhận đã kiểm tra toàn bộ thông tin pháp nhân, giá trị hợp đồng, lộ trình thanh toán ({contract.payment_stages} đợt), giới hạn {contract.max_free_revisions} lần chỉnh sửa miễn phí và đồng ý ký kết điện tử hợp đồng này.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={btnOutlineSm}>
              Đóng lại
            </button>
            <button
              type="button"
              disabled={!agreed || submitting}
              onClick={() => onConfirmSign(contract.id, agreed)}
              className={`${btnPrimarySm} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {submitting ? 'Đang xác thực chữ ký...' : 'Xác nhận ký hợp đồng điện tử'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
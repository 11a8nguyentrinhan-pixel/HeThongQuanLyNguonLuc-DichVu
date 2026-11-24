import {
  cardClass,
  btnPrimarySm,
  btnOutlineSm,
  formatCurrency,
  resolveAttachmentUrl,
  REQUEST_STATUS_BADGE_MAP,
} from '../clientConfig';

export default function MyRequestsTab({
  requests,
  loading,
  onCreateNew,
  onClarify,
  onRefresh,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#6b7c74]">
          Tổng cộng <strong className="text-[#10231b]">{requests.length}</strong> hồ sơ yêu cầu dịch vụ đã gửi.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onRefresh} className={btnOutlineSm}>
            Làm mới
          </button>
          <button type="button" onClick={onCreateNew} className={btnPrimarySm}>
            + Gửi yêu cầu mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className={`${cardClass} text-center text-sm text-[#6b7c74]`}>
          Đang tải danh sách yêu cầu...
        </div>
      ) : requests.length === 0 ? (
        <div className={`${cardClass} py-10 text-center`}>
          <p className="text-sm font-semibold text-[#10231b]">Bạn chưa gửi yêu cầu dịch vụ nào</p>
          <p className="mt-1 text-xs text-[#6b7c74]">
            Hãy chọn một gói dịch vụ từ danh mục hoặc tạo yêu cầu tùy chỉnh để Manager hỗ trợ.
          </p>
          <button type="button" onClick={onCreateNew} className={`${btnPrimarySm} mt-4`}>
            + Tạo yêu cầu đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => {
            const badgeStyle =
              REQUEST_STATUS_BADGE_MAP[item.status] || 'bg-slate-50 text-slate-700 border-slate-200';
            const fileLink = resolveAttachmentUrl(item.attachment_url);

            return (
              <div key={item.id} className={`${cardClass} space-y-3`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#154734]">
                        #REQ-{String(item.id).padStart(3, '0')}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeStyle}`}>
                        {item.status}
                      </span>
                      <span className="rounded-md bg-[#f1f4f2] px-2 py-0.5 text-[11px] font-semibold text-[#1d332a]">
                        {item.service_name || 'Yêu cầu tùy chỉnh (Custom)'}
                      </span>
                    </div>
                    <h4 className="mt-1.5 text-sm font-extrabold text-[#10231b]">{item.title}</h4>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-[#6b7c74]">Giá bảo toàn (Snapshot)</div>
                    <div className="text-sm font-extrabold text-[#154734]">
                      {formatCurrency(item.snapshot_price)}
                    </div>
                  </div>
                </div>

                <p className="whitespace-pre-line text-xs leading-relaxed text-[#3a4d44]">
                  {item.scope_description}
                </p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-[#6b7c74]">
                  <span>
                    Ngày gửi:{' '}
                    <strong className="text-[#10231b]">
                      {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : '—'}
                    </strong>
                  </span>
                  <span>
                    Manager phụ trách:{' '}
                    <strong className="text-[#10231b]">{item.manager_name || 'Đang chờ phân công'}</strong>
                  </span>
                  {fileLink && (
                    <a
                      href={fileLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#154734] underline hover:text-[#0f3728]"
                    >
                      Xem tài liệu đính kèm ↗
                    </a>
                  )}
                </div>

                {item.status === 'Chờ làm rõ' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                    <div className="text-xs text-amber-900">
                      <span className="font-bold">Yêu cầu bổ sung từ Manager: </span>
                      {item.reject_reason || 'Vui lòng bổ sung thêm thông tin hoặc tệp tài liệu làm rõ phạm vi.'}
                    </div>
                    <button
                      type="button"
                      onClick={() => onClarify(item)}
                      className={btnPrimarySm}
                    >
                      Bổ sung &amp; Làm rõ ngay
                    </button>
                  </div>
                )}

                {item.status === 'Từ chối' && item.reject_reason && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                    <span className="font-bold">Lý do từ chối: </span>
                    {item.reject_reason}
                  </div>
                )}

                {item.status === 'Đã chốt phạm vi' && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                    Phạm vi đã được thống nhất (tối đa 3 lần chỉnh sửa miễn phí). Manager đang chuẩn bị bảng báo giá gửi tới bạn.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
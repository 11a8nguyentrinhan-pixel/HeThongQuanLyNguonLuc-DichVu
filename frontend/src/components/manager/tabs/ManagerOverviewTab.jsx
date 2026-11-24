import {
  cardClass,
  btnPrimarySm,
  btnOutlineSm,
  formatCurrency,
} from '../managerConfig';

export default function ManagerOverviewTab({
  stats,
  requests,
  onOpenRequestsTab,
  onReviewRequest,
}) {
  const pendingQueue = requests.filter((r) => r.status === 'Chờ xử lý').slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Thẻ KPI tổng quan hồ sơ đầu vào */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Yêu cầu mới cần thẩm định</div>
          <div className="mt-2 text-2xl font-extrabold text-sky-700">{stats.pending}</div>
          <div className="mt-1 text-[11px] text-[#6b7c74]">Đồng bộ trực tiếp từ Client Portal</div>
        </div>
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Đang chờ Client làm rõ</div>
          <div className="mt-2 text-2xl font-extrabold text-amber-700">{stats.clarify}</div>
          <div className="mt-1 text-[11px] text-[#6b7c74]">Chờ bổ sung thông tin / tệp gốc</div>
        </div>
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Đã chốt phạm vi</div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">{stats.approvedScope}</div>
          <div className="mt-1 text-[11px] text-emerald-700">Sẵn sàng chuyển sang lập báo giá</div>
        </div>
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Tổng hồ sơ đã tiếp nhận</div>
          <div className="mt-2 text-2xl font-extrabold text-[#10231b]">{stats.total}</div>
          <div className="mt-1 text-[11px] text-[#6b7c74]">Từ chối: {stats.rejected} hồ sơ</div>
        </div>
      </div>

      {/* Hàng đợi yêu cầu dịch vụ cần xem xét ngay */}
      <div className={cardClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#10231b]">
              Hồ sơ yêu cầu dịch vụ chờ thẩm định ngay
            </h3>
            <p className="mt-0.5 text-xs text-[#6b7c74]">
              Manager chỉ thụ lý yêu cầu do Client chủ động gửi từ Client Portal (không tạo thay Client).
            </p>
          </div>
          <button type="button" onClick={onOpenRequestsTab} className={btnOutlineSm}>
            Mở toàn bộ danh sách →
          </button>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="rounded-xl bg-[#f7faf8] p-4 text-xs text-[#6b7c74]">
            Hiện không có hồ sơ mới nào ở trạng thái "Chờ xử lý".
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingQueue.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4e8e5] bg-[#fafbfa] p-3.5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#154734]">
                      #REQ-{String(item.id).padStart(3, '0')}
                    </span>
                    <span className="rounded bg-[#e9f1ec] px-2 py-0.5 text-[10.5px] font-semibold text-[#154734]">
                      {item.service_id ? item.service_name : 'Custom Request'}
                    </span>
                    <span className="text-xs font-bold text-[#10231b]">{item.title}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#6b7c74]">
                    Khách hàng: <strong className="text-[#10231b]">{item.client_name}</strong> (
                    {item.client_id}) · Giá bảo toàn:{' '}
                    <strong className="text-[#154734]">{formatCurrency(item.snapshot_price)}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onReviewRequest(item)}
                  className={btnPrimarySm}
                >
                  Thẩm định ngay
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
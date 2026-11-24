import {
  cardClass,
  btnPrimarySm,
  btnOutlineSm,
  formatCurrency,
  resolveAttachmentUrl,
  REQUEST_STATUS_BADGE_MAP,
} from '../managerConfig';

export default function ServiceRequestsTab({
  requests,
  loading,
  submitting,
  currentManagerId,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  searchTerm,
  setSearchTerm,
  onClaim,
  onOpenReview,
  onRefresh,
}) {
  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm & Bộ lọc tra cứu */}
      <div className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã #REQ, tiêu đề, tên Client, email..."
            className="h-9 min-w-[230px] flex-1 rounded-xl border border-[#dfe4e0] bg-[#f8f9f7] px-3.5 text-xs outline-none focus:border-[#154734]"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#dfe4e0] bg-white px-3 text-xs outline-none focus:border-[#154734]"
          >
            <option value="ALL">Tất cả loại dịch vụ</option>
            <option value="STANDARD">Gói dịch vụ có sẵn</option>
            <option value="CUSTOM">Yêu cầu tùy chỉnh (Custom)</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#dfe4e0] bg-white px-3 text-xs outline-none focus:border-[#154734]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Chờ làm rõ">Chờ làm rõ</option>
            <option value="Đã chốt phạm vi">Đã chốt phạm vi</option>
            <option value="Từ chối">Từ chối</option>
          </select>
        </div>

        <button type="button" onClick={onRefresh} className={btnOutlineSm}>
          Làm mới
        </button>
      </div>

      {/* Danh sách hồ sơ */}
      {loading ? (
        <div className={`${cardClass} text-center text-sm text-[#6b7c74]`}>
          Đang tải danh sách yêu cầu từ SQL Server...
        </div>
      ) : requests.length === 0 ? (
        <div className={`${cardClass} py-10 text-center text-xs text-[#6b7c74]`}>
          Không tìm thấy hồ sơ yêu cầu dịch vụ nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => {
            const badgeStyle =
              REQUEST_STATUS_BADGE_MAP[item.status] || 'bg-slate-50 text-slate-700 border-slate-200';
            const fileUrl = resolveAttachmentUrl(item.attachment_url);
            const isClosed = ['Đã chốt phạm vi', 'Từ chối'].includes(item.status);
            const isAssignedToMe =
              item.manager_id && String(item.manager_id) === String(currentManagerId);

            return (
              <div key={item.id} className={`${cardClass} space-y-3`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#154734]">
                        #REQ-{String(item.id).padStart(3, '0')}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeStyle}`}
                      >
                        {item.status}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          item.service_id
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-purple-50 text-purple-800'
                        }`}
                      >
                        {item.service_id
                          ? `Gói chuẩn: ${item.service_name}`
                          : 'Yêu cầu tùy chỉnh (Custom)'}
                      </span>
                    </div>
                    <h4 className="mt-1.5 text-sm font-extrabold text-[#10231b]">{item.title}</h4>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-[#6b7c74]">Giá tại thời điểm đặt (Snapshot)</div>
                    <div className="text-sm font-extrabold text-[#154734]">
                      {formatCurrency(item.snapshot_price)}
                    </div>
                    {item.service_id &&
                      item.current_catalog_price !== null &&
                      Number(item.current_catalog_price) !== Number(item.snapshot_price) && (
                        <div className="text-[10.5px] font-medium text-amber-700">
                          Giá danh mục hiện tại: {formatCurrency(item.current_catalog_price)}
                        </div>
                      )}
                  </div>
                </div>

                {/* Thông tin định danh Client */}
                <div className="grid grid-cols-1 gap-2 rounded-xl bg-[#f7faf8] p-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-[#6b7c74]">Khách hàng: </span>
                    <strong className="text-[#10231b]">
                      {item.client_name} ({item.client_id})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#6b7c74]">Liên hệ: </span>
                    <strong className="text-[#10231b]">
                      {item.client_email} {item.client_phone ? `· ${item.client_phone}` : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#6b7c74]">Manager thụ lý: </span>
                    <strong className="text-[#154734]">
                      {item.manager_name
                        ? `${item.manager_name} (${item.manager_id})`
                        : 'Chưa phân công'}
                    </strong>
                  </div>
                </div>

                {/* Nội dung mô tả phạm vi */}
                <p className="whitespace-pre-line text-xs leading-relaxed text-[#3a4d44]">
                  {item.scope_description}
                </p>

                {/* Phản hồi / lý do gần nhất */}
                {item.reject_reason && (
                  <div
                    className={`rounded-xl border p-3 text-xs ${
                      item.status === 'Từ chối'
                        ? 'border-rose-200 bg-rose-50 text-rose-800'
                        : 'border-amber-200 bg-amber-50 text-amber-900'
                    }`}
                  >
                    <strong>
                      {item.status === 'Từ chối'
                        ? 'Lý do từ chối đã gửi Client: '
                        : 'Nội dung yêu cầu làm rõ gần nhất: '}
                    </strong>
                    {item.reject_reason}
                  </div>
                )}

                {/* Thanh thông tin ngày gửi, tệp đính kèm & Nút hành động */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef2ef] pt-3">
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6b7c74]">
                    <span>
                      Ngày gửi:{' '}
                      <strong className="text-[#10231b]">
                        {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : '—'}
                      </strong>
                    </span>
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#154734] underline hover:text-[#0f3728]"
                      >
                        Kiểm tra tệp/tài liệu đính kèm ↗
                      </a>
                    ) : (
                      <span>Không có tệp đính kèm</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isClosed && !isAssignedToMe && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => onClaim(item.id)}
                        className={btnOutlineSm}
                      >
                        Tiếp nhận
                      </button>
                    )}

                    {!isClosed ? (
                      <button
                        type="button"
                        onClick={() => onOpenReview(item)}
                        className={btnPrimarySm}
                      >
                        Quyết định
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenReview(item)}
                        className={btnOutlineSm}
                      >
                        Xem hồ sơ đã xử lý
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
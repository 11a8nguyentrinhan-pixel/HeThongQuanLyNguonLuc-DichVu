import { useState } from 'react';
import {
  cardClass,
  btnPrimarySm,
  btnOutlineSm,
  formatCurrency,
  resolveAttachmentUrl,
  getAttachmentName,
  QUOTE_STATUS_BADGE_MAP,
  CONTRACT_STATUS_BADGE_MAP,
} from '../managerConfig';

export default function QuotesContractsTab({
  readyRequests,
  quotations,
  contracts,
  loading,
  submitting,
  onCreateQuote,
  onCreateNewVersion,
  onUpdateQuoteStatus,
  onDraftContract,
  onSendContract,
  onRefresh,
}) {
  const [subTab, setSubTab] = useState('ready'); // ready | quotes | contracts

  const unquotedCount = readyRequests.filter((r) => Number(r.quote_count) === 0).length;
  const acceptedNoContract = quotations.filter(
    (q) => q.status === 'Chấp nhận' && !q.contract_id
  ).length;

  return (
    <div className="space-y-5">
      {/* Thẻ tóm tắt quy trình 2 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Hồ sơ đã chốt phạm vi</div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#10231b]">{readyRequests.length}</div>
          <div className="mt-1 text-[11px] text-amber-700">
            {unquotedCount} hồ sơ chưa lập báo giá v1
          </div>
        </div>
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Tổng phiên bản báo giá</div>
          <div className="mt-1.5 text-2xl font-extrabold text-sky-700">{quotations.length}</div>
          <div className="mt-1 text-[11px] text-emerald-700">
            {acceptedNoContract} báo giá đã duyệt chờ soạn hợp đồng
          </div>
        </div>
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Hợp đồng pháp lý</div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#154734]">{contracts.length}</div>
          <div className="mt-1 text-[11px] text-[#6b7c74]">
            Tối đa 3 đợt thanh toán · Tối đa 3 lần sửa miễn phí
          </div>
        </div>
      </div>

      {/* Thanh chuyển 3 phân mục */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ready', label: `1. Chờ lập báo giá (${readyRequests.length})` },
            { key: 'quotes', label: `2. Báo giá & Phiên bản (${quotations.length})` },
            { key: 'contracts', label: `3. Hợp đồng (${contracts.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubTab(tab.key)}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition ${
                subTab === tab.key
                  ? 'bg-[#154734] text-white shadow-xs'
                  : 'border border-[#dfe4e0] bg-white text-[#10231b] hover:bg-[#f5f7f6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={onRefresh} className={btnOutlineSm}>
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className={`${cardClass} text-center text-sm text-[#6b7c74]`}>
          Đang tải dữ liệu Báo giá &amp; Hợp đồng...
        </div>
      ) : (
        <>
          {/* PHÂN MỤC 1: HỒ SƠ ĐÃ CHỐT PHẠM VI CHỜ BÁO GIÁ */}
          {subTab === 'ready' && (
            <div className="space-y-3">
              {readyRequests.length === 0 ? (
                <div className={`${cardClass} py-10 text-center text-xs text-[#6b7c74]`}>
                  Chưa có hồ sơ yêu cầu nào ở trạng thái "Đã chốt phạm vi". Hãy thẩm định và chốt phạm vi ở tab Tiếp nhận yêu cầu trước.
                </div>
              ) : (
                readyRequests.map((req) => (
                  <div key={req.id} className={`${cardClass} space-y-3`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#154734]">
                            #REQ-{String(req.id).padStart(3, '0')}
                          </span>
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            Đã chốt phạm vi
                          </span>
                          <span className="rounded-md bg-[#f1f4f2] px-2 py-0.5 text-[11px] font-semibold text-[#1d332a]">
                            {req.service_name || 'Dịch vụ tùy chỉnh (Custom)'}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-extrabold text-[#10231b]">{req.title}</h4>
                        <p className="mt-0.5 text-xs text-[#6b7c74]">
                          Khách hàng: <strong className="text-[#10231b]">{req.client_name}</strong> (
                          {req.client_id}) · {req.client_email}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-[#6b7c74]">Giá gốc tham chiếu (Snapshot)</div>
                        <div className="text-sm font-extrabold text-[#154734]">
                          {formatCurrency(req.snapshot_price)}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#6b7c74]">
                          Đã lập: <strong>{req.quote_count}</strong> phiên bản báo giá
                        </div>
                      </div>
                    </div>

                    <p className="line-clamp-3 whitespace-pre-line rounded-xl bg-[#f8faf8] p-3 text-xs text-[#3a4d44]">
                      {req.scope_description}
                    </p>

                    <div className="flex justify-end gap-2">
                      {Number(req.quote_count) > 0 && (
                        <button
                          type="button"
                          onClick={() => setSubTab('quotes')}
                          className={btnOutlineSm}
                        >
                          Xem các phiên bản đã lập
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onCreateQuote(req)}
                        className={btnPrimarySm}
                      >
                        {Number(req.quote_count) === 0
                          ? '+ Lập báo giá v1'
                          : `+ Lập phiên bản v${Number(req.quote_count) + 1}`}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PHÂN MỤC 2: QUẢN LÝ BÁO GIÁ & LỊCH SỬ PHIÊN BẢN (VERSIONING) */}
          {subTab === 'quotes' && (
            <div className="space-y-3">
              {quotations.length === 0 ? (
                <div className={`${cardClass} py-10 text-center text-xs text-[#6b7c74]`}>
                  Chưa có báo giá nào được tạo. Chọn hồ sơ ở mục "1. Chờ lập báo giá" để khởi tạo.
                </div>
              ) : (
                quotations.map((q) => {
                  const badgeStyle =
                    QUOTE_STATUS_BADGE_MAP[q.status] ||
                    'bg-slate-50 text-slate-700 border-slate-200';
                  const isAccepted = q.status === 'Chấp nhận';
                  const isClosed = ['Từ chối / Đóng', 'Hết hạn'].includes(q.status);

                  return (
                    <div key={q.id} className={`${cardClass} space-y-3`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#154734]">
                              #QT-{String(q.id).padStart(3, '0')}
                            </span>
                            <span className="rounded-md bg-[#154734] px-2 py-0.5 font-mono text-[11px] font-bold text-[#ccf378]">
                              v{q.version_number}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeStyle}`}
                            >
                              {q.status}
                            </span>
                            <span className="rounded-md bg-[#f1f4f2] px-2 py-0.5 text-[11px] font-semibold text-[#1d332a]">
                              {q.quote_type}
                            </span>
                          </div>
                          <h4 className="mt-1.5 text-sm font-extrabold text-[#10231b]">
                            #REQ-{String(q.request_id).padStart(3, '0')} · {q.request_title}
                          </h4>
                          <p className="mt-0.5 text-xs text-[#6b7c74]">
                            Client: <strong className="text-[#10231b]">{q.client_name}</strong> (
                            {q.client_id}) · Hiệu lực đến:{' '}
                            <strong className="text-[#10231b]">{q.valid_until || '—'}</strong> ·
                            Ngày tạo:{' '}
                            <strong className="text-[#10231b]">
                              {q.created_at ? new Date(q.created_at).toLocaleString('vi-VN') : '—'}
                            </strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-[#6b7c74]">Tổng giá trị sau thuế</div>
                          <div className="text-base font-extrabold text-[#154734]">
                            {formatCurrency(q.total_amount)}
                          </div>
                          <div className="text-[11px] text-[#6b7c74]">
                            Thuế: {formatCurrency(q.tax_amount)}
                          </div>
                        </div>
                      </div>

                      {/* Bảng hạng mục chi tiết */}
                      <div className="overflow-x-auto rounded-xl border border-[#e4e8e5]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#f7faf8] text-[11px] font-bold text-[#4a5d54]">
                            <tr>
                              <th className="px-3 py-2">Hạng mục / Dịch vụ</th>
                              <th className="px-3 py-2">Phạm vi bàn giao</th>
                              <th className="px-3 py-2 text-right">SL</th>
                              <th className="px-3 py-2 text-right">Đơn giá</th>
                              <th className="px-3 py-2 text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eef2ef]">
                            {(q.items_detail || []).map((it, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 font-semibold text-[#10231b]">{it.name}</td>
                                <td className="px-3 py-2 text-[#4a5d54]">{it.scope || '—'}</td>
                                <td className="px-3 py-2 text-right">{it.quantity}</td>
                                <td className="px-3 py-2 text-right">
                                  {formatCurrency(it.unit_price)}
                                </td>
                                <td className="px-3 py-2 text-right font-bold text-[#10231b]">
                                  {formatCurrency((it.quantity || 1) * (it.unit_price || 0))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="rounded-xl bg-[#f8faf8] p-3 text-xs text-[#3a4d44]">
                        <strong>Điều kiện &amp; lộ trình thanh toán: </strong>
                        {q.payment_terms}
                      </div>

                      {/* Hành động theo vòng đời báo giá */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eef2ef] pt-3">
                        <span className="text-[11px] text-[#6b7c74]">
                          Người lập: <strong>{q.creator_name || q.created_by}</strong>
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {q.status === 'Bản nháp' && (
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => onUpdateQuoteStatus(q.id, 'Đã gửi')}
                              className={btnPrimarySm}
                            >
                              Gửi báo giá cho Client
                            </button>
                          )}

                          {!isAccepted && !isClosed && (
                            <>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => onCreateNewVersion(q)}
                                className={btnOutlineSm}
                              >
                                + Tạo phiên bản v{Number(q.version_number) + 1} (Không ghi đè)
                              </button>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => onUpdateQuoteStatus(q.id, 'Từ chối / Đóng')}
                                className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                              >
                                Đóng / Hủy báo giá
                              </button>
                            </>
                          )}

                          {isAccepted && !q.contract_id && (
                            <button
                              type="button"
                              onClick={() => onDraftContract(q)}
                              className={btnPrimarySm}
                            >
                              Soạn hợp đồng từ bản v{q.version_number} →
                            </button>
                          )}

                          {q.contract_id && (
                            <button
                              type="button"
                              onClick={() => setSubTab('contracts')}
                              className={btnOutlineSm}
                            >
                              Đã xuất bản hợp đồng (Xem ngay)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* PHÂN MỤC 3: HỢP ĐỒNG PHÁP LÝ */}
          {subTab === 'contracts' && (
            <div className="space-y-3">
              {contracts.length === 0 ? (
                <div className={`${cardClass} py-10 text-center text-xs text-[#6b7c74]`}>
                  Chưa có hợp đồng nào. Hợp đồng được soạn thảo khi có phiên bản báo giá ở trạng thái "Chấp nhận".
                </div>
              ) : (
                contracts.map((ct) => {
                  const badgeStyle =
                    CONTRACT_STATUS_BADGE_MAP[ct.status] ||
                    'bg-slate-50 text-slate-700 border-slate-200';
                  const fileUrl = resolveAttachmentUrl(ct.contract_file_url);

                  return (
                    <div key={ct.id} className={`${cardClass} space-y-3`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-[#154734]">
                              {ct.contract_code}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeStyle}`}
                            >
                              {ct.status}
                            </span>
                            <span className="rounded-md bg-[#f1f4f2] px-2 py-0.5 text-[11px] font-semibold text-[#1d332a]">
                              Theo báo giá #QT-{String(ct.quote_id).padStart(3, '0')} (v
                              {ct.version_number})
                            </span>
                          </div>
                          <h4 className="mt-1.5 text-sm font-extrabold text-[#10231b]">
                            {ct.request_title}
                          </h4>
                          <p className="mt-0.5 text-xs text-[#6b7c74]">
                            Client: <strong className="text-[#10231b]">{ct.client_name}</strong> (
                            {ct.client_id}) · Manager phụ trách:{' '}
                            <strong className="text-[#10231b]">
                              {ct.manager_name || ct.manager_id}
                            </strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-[#6b7c74]">Tổng giá trị hợp đồng</div>
                          <div className="text-base font-extrabold text-[#154734]">
                            {formatCurrency(ct.total_value)}
                          </div>
                          <div className="text-[11px] text-[#6b7c74]">
                            {ct.payment_stages} đợt thanh toán · Tối đa {ct.max_free_revisions} lần sửa miễn phí
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-[#f8faf8] p-3 text-xs">
                          <div className="mb-1 font-bold text-[#10231b]">Thông tin pháp nhân hai bên:</div>
                          <p className="whitespace-pre-line text-[#3a4d44]">{ct.legal_info}</p>
                        </div>
                        <div className="rounded-xl bg-[#f8faf8] p-3 text-xs">
                          <div className="mb-1 font-bold text-[#10231b]">
                            Tiêu chí nghiệm thu &amp; Chính sách hủy / hoàn tiền:
                          </div>
                          <p className="whitespace-pre-line text-[#3a4d44]">{ct.cancel_policy}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef2ef] pt-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6b7c74]">
                          <span>
                            Ngày ký:{' '}
                            <strong className="text-[#10231b]">
                              {ct.signed_date
                                ? new Date(ct.signed_date).toLocaleString('vi-VN')
                                : 'Chờ Client ký điện tử'}
                            </strong>
                          </span>
                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-[#154734] underline"
                            >
                              📎 {getAttachmentName(ct.contract_file_url)} ↗
                            </a>
                          ) : (
                            <span>Chưa đính kèm bản mềm PDF/DOCX</span>
                          )}
                        </div>

                        {ct.status === 'Bản thảo' && (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => onSendContract(ct.id)}
                            className={btnPrimarySm}
                          >
                            Gửi bản thảo trình Client ký →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
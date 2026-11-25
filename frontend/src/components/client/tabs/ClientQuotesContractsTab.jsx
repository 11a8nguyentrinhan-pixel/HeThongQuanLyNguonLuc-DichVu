import { useState } from 'react';
import {
  cardClass,
  btnPrimarySm,
  btnOutlineSm,
  formatCurrency,
  resolveAttachmentUrl,
  getAttachmentName,
  CLIENT_QUOTE_BADGE_MAP,
  CLIENT_CONTRACT_BADGE_MAP,
} from '../clientConfig';

export default function ClientQuotesContractsTab({
  quotations,
  contracts,
  loading,
  submitting,
  onRespondQuote,
  onOpenSignContract,
  onRefresh,
}) {
  const [subTab, setSubTab] = useState('quotes'); // quotes | contracts

  const waitingQuotesCount = quotations.filter((q) => q.status === 'Đã gửi').length;
  const waitingContractsCount = contracts.filter((c) => c.status === 'Chờ duyệt').length;

  const confirmAndRespond = (quote, action, label) => {
    const ok = window.confirm(
      `Xác nhận "${label}" cho báo giá #QT-${String(quote.id).padStart(3, '0')} (v${quote.version_number})?`
    );
    if (ok) onRespondQuote(quote.id, action);
  };

  return (
    <div className="space-y-5">
      {/* Thẻ tóm tắt hành động cần xử lý gấp */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Báo giá chờ bạn duyệt</div>
          <div className="mt-1.5 text-2xl font-extrabold text-sky-700">{waitingQuotesCount}</div>
          <div className="mt-1 text-[11px] text-[#6b7c74]">
            Tổng cộng {quotations.length} phiên bản báo giá đã nhận
          </div>
        </div>
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Hợp đồng chờ ký điện tử</div>
          <div className="mt-1.5 text-2xl font-extrabold text-amber-700">
            {waitingContractsCount}
          </div>
          <div className="mt-1 text-[11px] text-[#6b7c74]">
            Đối chiếu khớp 100% với báo giá cuối cùng
          </div>
        </div>
        <div className={cardClass}>
          <div className="text-xs font-semibold text-[#6b7c74]">Hợp đồng đã ký kết</div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#154734]">
            {contracts.filter((c) => ['Đã ký', 'Đang hiệu lực'].includes(c.status)).length}
          </div>
          <div className="mt-1 text-[11px] text-[#6b7c74]">
            Cam kết tối đa 3 đợt thanh toán · 3 lần sửa miễn phí
          </div>
        </div>
      </div>

      {/* Thanh chuyển 2 mục */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSubTab('quotes')}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition ${
              subTab === 'quotes'
                ? 'bg-[#154734] text-white'
                : 'border border-[#dfe4e0] bg-white text-[#10231b] hover:bg-[#f5f7f6]'
            }`}
          >
            1. Báo giá nhận được ({quotations.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('contracts')}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition ${
              subTab === 'contracts'
                ? 'bg-[#154734] text-white'
                : 'border border-[#dfe4e0] bg-white text-[#10231b] hover:bg-[#f5f7f6]'
            }`}
          >
            2. Hợp đồng &amp; Ký kết ({contracts.length})
          </button>
        </div>

        <button type="button" onClick={onRefresh} className={btnOutlineSm}>
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className={`${cardClass} text-center text-sm text-[#6b7c74]`}>
          Đang tải danh sách Báo giá &amp; Hợp đồng...
        </div>
      ) : (
        <>
          {/* MỤC 1: BÁO GIÁ TỪ MANAGER */}
          {subTab === 'quotes' && (
            <div className="space-y-4">
              {quotations.length === 0 ? (
                <div className={`${cardClass} py-10 text-center text-xs text-[#6b7c74]`}>
                  Bạn chưa nhận được bảng báo giá nào. Sau khi Manager chốt phạm vi yêu cầu dịch vụ, báo giá chi tiết sẽ hiển thị tại đây.
                </div>
              ) : (
                quotations.map((q) => {
                  const badgeStyle =
                    CLIENT_QUOTE_BADGE_MAP[q.status] ||
                    'bg-slate-50 text-slate-700 border-slate-200';
                  const canRespond = q.status === 'Đã gửi';

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
                            Manager phụ trách:{' '}
                            <strong className="text-[#10231b]">{q.manager_name || '—'}</strong> ·
                            Hiệu lực đến:{' '}
                            <strong className="text-[#10231b]">{q.valid_until || '—'}</strong> ·
                            Ngày gửi:{' '}
                            <strong className="text-[#10231b]">
                              {q.created_at ? new Date(q.created_at).toLocaleString('vi-VN') : '—'}
                            </strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-[#6b7c74]">Tổng thanh toán (gồm thuế)</div>
                          <div className="text-base font-extrabold text-[#154734]">
                            {formatCurrency(q.total_amount)}
                          </div>
                          <div className="text-[11px] text-[#6b7c74]">
                            Thuế VAT: {formatCurrency(q.tax_amount)}
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết hạng mục */}
                      <div className="overflow-x-auto rounded-xl border border-[#e4e8e5]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#f7faf8] text-[11px] font-bold text-[#4a5d54]">
                            <tr>
                              <th className="px-3 py-2">Hạng mục</th>
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

                      {/* 3 nhánh phản hồi của Client */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eef2ef] pt-3">
                        <span className="text-[11px] text-[#6b7c74]">
                          {q.status === 'Chấp nhận' && !q.contract_id &&
                            'Bạn đã đồng ý báo giá này. Đang chờ Manager xuất bản bản thảo hợp đồng.'}
                          {q.status === 'Cần điều chỉnh' &&
                            'Đã gửi yêu cầu đàm phán. Manager sẽ lập phiên bản báo giá kế tiếp cho bạn.'}
                          {q.status === 'Đã gửi' &&
                            'Vui lòng rà soát kỹ hạng mục, chi phí và thời hạn hiệu lực trước khi xác nhận.'}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {canRespond && (
                            <>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => confirmAndRespond(q, 'reject', 'Từ chối báo giá')}
                                className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                              >
                                Từ chối báo giá
                              </button>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => confirmAndRespond(q, 'adjust', 'Yêu cầu điều chỉnh')}
                                className="cursor-pointer rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                              >
                                Yêu cầu điều chỉnh
                              </button>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => confirmAndRespond(q, 'accept', 'Đồng ý báo giá')}
                                className={btnPrimarySm}
                              >
                                Đồng ý báo giá v{q.version_number}
                              </button>
                            </>
                          )}

                          {q.contract_id && (
                            <button
                              type="button"
                              onClick={() => setSubTab('contracts')}
                              className={btnPrimarySm}
                            >
                              Xem bản thảo hợp đồng →
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

          {/* MỤC 2: HỢP ĐỒNG & KÝ ĐIỆN TỬ */}
          {subTab === 'contracts' && (
            <div className="space-y-4">
              {contracts.length === 0 ? (
                <div className={`${cardClass} py-10 text-center text-xs text-[#6b7c74]`}>
                  Chưa có bản thảo hợp đồng nào được gửi tới bạn. Hợp đồng sẽ xuất hiện ngay sau khi bạn đồng ý báo giá và Manager trình ký.
                </div>
              ) : (
                contracts.map((ct) => {
                  const badgeStyle =
                    CLIENT_CONTRACT_BADGE_MAP[ct.status] ||
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
                              Khớp báo giá #QT-{String(ct.quote_id).padStart(3, '0')} (v
                              {ct.version_number})
                            </span>
                          </div>
                          <h4 className="mt-1.5 text-sm font-extrabold text-[#10231b]">
                            {ct.request_title}
                          </h4>
                          <p className="mt-0.5 text-xs text-[#6b7c74]">
                            Manager phụ trách:{' '}
                            <strong className="text-[#10231b]">{ct.manager_name || '—'}</strong> (
                            {ct.manager_email || '—'})
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-[#6b7c74]">Giá trị hợp đồng</div>
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
                            Tiêu chí nghiệm thu &amp; Chính sách hủy / hoàn:
                          </div>
                          <p className="whitespace-pre-line text-[#3a4d44]">{ct.cancel_policy}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef2ef] pt-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6b7c74]">
                          <span>
                            Trạng thái ký:{' '}
                            <strong className="text-[#10231b]">
                              {ct.signed_date
                                ? `Đã ký lúc ${new Date(ct.signed_date).toLocaleString('vi-VN')}`
                                : 'Đang chờ bạn kiểm duyệt & ký điện tử'}
                            </strong>
                          </span>
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-[#154734] underline"
                            >
                              📎 {getAttachmentName(ct.contract_file_url)} ↗
                            </a>
                          )}
                        </div>

                        {ct.status === 'Chờ duyệt' && (
                          <button
                            type="button"
                            onClick={() => onOpenSignContract(ct)}
                            className={btnPrimarySm}
                          >
                            Kiểm duyệt &amp; Ký hợp đồng điện tử
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
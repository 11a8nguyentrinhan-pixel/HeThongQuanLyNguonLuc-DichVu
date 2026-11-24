import { cardClass, btnPrimarySm, formatCurrency } from '../clientConfig';

export default function ServiceCatalogTab({ catalogs, loading, onSelectCatalog, onCreateCustom }) {
  return (
    <div className="space-y-5">
      <div className={`${cardClass} flex flex-wrap items-center justify-between gap-4 bg-[#f7faf8]`}>
        <div>
          <h3 className="text-base font-bold text-[#10231b]">
            Cần giải pháp thiết kế riêng theo yêu cầu?
          </h3>
          <p className="mt-1 text-xs text-[#6b7c74]">
            Mô tả mục tiêu, phạm vi và đính kèm tài liệu để Manager thẩm định và báo giá riêng (Custom).
          </p>
        </div>
        <button type="button" onClick={onCreateCustom} className={btnPrimarySm}>
          + Gửi yêu cầu tùy chỉnh (Custom)
        </button>
      </div>

      {loading ? (
        <div className={`${cardClass} text-center text-sm text-[#6b7c74]`}>
          Đang tải danh mục dịch vụ...
        </div>
      ) : catalogs.length === 0 ? (
        <div className={`${cardClass} text-center text-sm text-[#6b7c74]`}>
          Hiện chưa có gói dịch vụ tiêu chuẩn nào đang mở. Bạn có thể gửi yêu cầu Custom ở trên.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {catalogs.map((cat) => (
            <div key={cat.id} className={`${cardClass} flex flex-col justify-between gap-4`}>
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#10231b]">{cat.service_name}</h4>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Đang mở
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#6b7c74]">
                  {cat.description}
                </p>
              </div>

              <div className="border-t border-[#eef2ef] pt-3">
                <p className="text-[11px] text-[#6b7c74]">Giá niêm yết (được bảo toàn khi đặt)</p>
                <p className="mt-0.5 text-base font-extrabold text-[#154734]">
                  {formatCurrency(cat.base_price)}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectCatalog(cat)}
                  className={`${btnPrimarySm} mt-3 w-full`}
                >
                  Đặt gói dịch vụ này
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
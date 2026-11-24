import { cardClass, btnOutlineSm } from '../adminConfig';

export default function ServiceCatalogsTab() {
  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold">Danh mục gói dịch vụ chuẩn (service_catalogs)</h3>
          <p className="mt-0.5 text-xs text-[#6b7c74]">
            Ẩn hoặc đổi giá gói dịch vụ vẫn giữ nguyên snapshot_price cho yêu cầu Client đã đặt trước đó.
          </p>
        </div>
        <button className={btnOutlineSm}>+ Thêm gói dịch vụ</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#e4e8e5] bg-[#f9faf8] text-[11px] uppercase tracking-wider text-[#6b7c74]">
              <th className="px-3.5 py-3">Tên gói dịch vụ</th>
              <th className="px-3.5 py-3">Biểu phí chuẩn</th>
              <th className="px-3.5 py-3">Mẫu hợp đồng đi kèm</th>
              <th className="px-3.5 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ef]">
            <tr>
              <td className="px-3.5 py-3.5 font-bold">Nền tảng Thương mại điện tử</td>
              <td className="px-3.5 py-3.5">85.000.000 đ</td>
              <td className="px-3.5 py-3.5">HD_TMDT_Chuan_v2.docx</td>
              <td className="px-3.5 py-3.5">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                  Đang hoạt động
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-3.5 py-3.5 font-bold">Thiết kế UI/UX &amp; Design System</td>
              <td className="px-3.5 py-3.5">35.000.000 đ</td>
              <td className="px-3.5 py-3.5">HD_UIUX_Chuan_v1.docx</td>
              <td className="px-3.5 py-3.5">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                  Đang hoạt động
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-3.5 py-3.5 font-bold">Gói Landing Page Cơ bản 2025</td>
              <td className="px-3.5 py-3.5">12.000.000 đ</td>
              <td className="px-3.5 py-3.5">HD_LP_2025.docx</td>
              <td className="px-3.5 py-3.5">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                  Ẩn / Ngưng cung cấp
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
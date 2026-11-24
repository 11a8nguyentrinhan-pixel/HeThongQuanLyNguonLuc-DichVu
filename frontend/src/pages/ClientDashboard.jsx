import { useState, useEffect } from 'react'; // (Manager/Member/Client chỉ cần useState)
import DashboardLayout from '../components/DashboardLayout';
import ProfilePanel from '../components/ProfilePanel';
import { useAuth } from '../context/AuthContext';

const cardClass = 'rounded-2xl border border-[#e4e8e5] bg-white p-6 shadow-2xs';
const btnPrimarySm =
  'cursor-pointer rounded-lg bg-[#154734] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0f3728] disabled:cursor-not-allowed disabled:opacity-50';
const btnOutlineSm =
  'cursor-pointer rounded-lg border border-[#cfd8d3] bg-white px-3.5 py-2 text-xs font-semibold text-[#10231b] transition hover:bg-[#f5f7f6]';

/* =========================================================================
   4. GIAO DIỆN CLIENT
   ========================================================================= */
export function ClientDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const menu = [
    { key: 'overview', label: 'Tổng quan dự án' },
    { key: 'requests', label: 'Yêu cầu dịch vụ', badge: 1 },
    { key: 'quotes', label: 'Báo giá & Hợp đồng', badge: 1 },
    { key: 'payments', label: 'Thanh toán (3 đợt)' },
    { key: 'delivery', label: 'Bàn giao & Nghiệm thu', badge: 1 },
  ];

  const tabMeta = {
    overview: {
      breadcrumb: 'Tổng quan dự án',
      tag: 'KHÔNG GIAN KHÁCH HÀNG · CLIENT PORTAL',
      title: `Xin chào, ${user?.full_name || 'Khách hàng'}`,
      desc: 'Theo dõi tiến độ các cột mốc bàn giao, duyệt báo giá và gửi phản hồi kiểm thử ngay tại đây.',
    },
    requests: {
      breadcrumb: 'Yêu cầu dịch vụ',
      tag: 'GỬI YÊU CẦU & LÀM RÕ PHẠM VI',
      title: 'Yêu cầu dịch vụ của bạn',
      desc: 'Chọn gói dịch vụ từ danh mục chuẩn, đính kèm tài liệu và trao đổi phạm vi với Manager.',
    },
    quotes: {
      breadcrumb: 'Báo giá & Hợp đồng',
      tag: 'DUYỆT BÁO GIÁ & KÝ KẾT PHÁP LÝ',
      title: 'Báo giá & Hợp đồng',
      desc: 'Xem chi tiết từng phiên bản báo giá, đề nghị điều chỉnh hoặc xác nhận ký hợp đồng điện tử.',
    },
    payments: {
      breadcrumb: 'Thanh toán',
      tag: 'CỔNG THANH TOÁN & ĐỐI SOÁT',
      title: 'Lộ trình thanh toán hợp đồng',
      desc: 'Theo dõi tối đa 3 đợt thanh toán và gửi chứng từ hỗ trợ đối soát nếu phát sinh lỗi giao dịch.',
    },
    delivery: {
      breadcrumb: 'Bàn giao & Nghiệm thu',
      tag: 'KIỂM THỬ, PHẢN HỒI (≤ 3 LẦN MIỄN PHÍ) & TẢI HỒ SƠ',
      title: 'Bàn giao & Nghiệm thu sản phẩm',
      desc: 'Kiểm thử sản phẩm bàn giao, gửi yêu cầu sửa miễn phí trong giới hạn 3 lần hoặc nghiệm thu.',
    },
    profile: {
      breadcrumb: 'Hồ sơ cá nhân',
      tag: 'TÀI KHOẢN KHÁCH HÀNG',
      title: 'Hồ sơ cá nhân',
      desc: 'Cập nhật họ tên và số điện thoại liên hệ.',
    },
  };

  const currentMeta = tabMeta[activeTab] || tabMeta.overview;

  return (
    <DashboardLayout
      portalLabel="CLIENT PORTAL"
      workspaceName="Dự án của tôi"
      breadcrumb={currentMeta.breadcrumb}
      menuItems={menu}
      activeMenu={activeTab}
      onSelectMenu={setActiveTab}
      subtitleTag={currentMeta.tag}
      title={currentMeta.title}
      description={currentMeta.desc}
      primaryActionText="+ Gửi yêu cầu dịch vụ"
      onPrimaryAction={() => setActiveTab('requests')}
      searchPlaceholder="Tìm dự án, báo giá, hóa đơn..."
    >
      {activeTab === 'overview' && (
        <>
          {/* Banner tiến độ dự án tông xanh Nori */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-linear-to-r from-[#1c4c39] to-[#0f2b20] p-7 text-white">
            <div>
              <span className="mb-1.5 inline-block text-[11px] font-bold tracking-widest text-[#ccf378]">
                DỰ ÁN ĐANG TRIỂN KHAI · NR-2048
              </span>
              <h2 className="mb-1 text-xl font-extrabold">Nền tảng thương mại điện tử</h2>
              <p className="text-xs text-[#a9c1b6]">
                Bàn giao dự kiến: 28.06.2027 · Manager phụ trách: Nguyễn Minh Quân
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-2 flex justify-between text-xs text-[#d6e4dd]">
                <span>Tiến độ tổng thể</span>
                <strong className="text-white">68%</strong>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[68%] rounded-full bg-[#ccf378]" />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Việc cần bạn phản hồi</h3>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                2 mục chờ
              </span>
            </div>
            <div className="divide-y divide-[#eef1ef]">
              <div className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                <div>
                  <strong className="block text-sm">Báo giá QT-024 · Phiên bản 2</strong>
                  <p className="mt-0.5 text-xs text-[#64746d]">
                    85.000.000 đ · Hạn hiệu lực 30/11/2026 · Chờ bạn xem xét và ký hợp đồng
                  </p>
                </div>
                <button className={btnOutlineSm} onClick={() => setActiveTab('quotes')}>
                  Xem báo giá →
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                <div>
                  <strong className="block text-sm">Thiết kế trang chủ · Bản bàn giao 3 (Chờ kiểm thử)</strong>
                  <p className="mt-0.5 text-xs text-[#64746d]">
                    PRJ-2048 · Đã dùng 1/3 lần chỉnh sửa miễn phí · Xem sản phẩm và gửi phản hồi
                  </p>
                </div>
                <button className={btnPrimarySm} onClick={() => setActiveTab('delivery')}>
                  Kiểm thử &amp; Nghiệm thu →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className={cardClass}>
          <h3 className="mb-4 text-base font-bold">Gửi yêu cầu dịch vụ mới</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1d332a]">Gói dịch vụ gốc (service_catalogs)</label>
              <select className="rounded-xl border border-[#dfe4e0] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]">
                <option>Nền tảng Thương mại điện tử — 85.000.000 đ</option>
                <option>Thiết kế UI/UX &amp; Design System — 35.000.000 đ</option>
                <option>Hệ thống CRM / ERP nội bộ (Custom) — 150.000.000 đ</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1d332a]">Tiêu đề yêu cầu (title)</label>
              <input
                type="text"
                placeholder="VD: Xây dựng website bán cà phê hạt rang"
                className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1d332a]">Mô tả phạm vi mong muốn (scope_description)</label>
            <textarea
              rows={3}
              placeholder="Mô tả chức năng chính, thời gian mong muốn và tài liệu đính kèm..."
              className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
            />
          </div>
          <div className="mt-5 flex justify-end">
            <button className={btnPrimarySm}>Gửi yêu cầu cho Manager →</button>
          </div>
        </div>
      )}

      {activeTab === 'quotes' && (
        <div className={cardClass}>
          <h3 className="mb-3 text-base font-bold">Báo giá &amp; Hợp đồng cần duyệt</h3>
          <div className="flex flex-wrap items-center justify-between gap-4 py-2">
            <div>
              <strong className="block text-sm">QT-024 (Phiên bản v2) · Website Thương mại điện tử</strong>
              <p className="mt-0.5 text-xs text-[#64746d]">
                85.000.000 đ (đã gồm VAT) · 3 đợt thanh toán · Tối đa 3 lần chỉnh sửa miễn phí
              </p>
            </div>
            <div className="flex gap-2">
              <button className={btnOutlineSm}>Yêu cầu điều chỉnh</button>
              <button className={btnPrimarySm}>Đồng ý &amp; Ký hợp đồng</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className={cardClass}>
          <h3 className="mb-3 text-base font-bold">Lộ trình thanh toán · HĐ HD-2026-019</h3>
          <div className="divide-y divide-[#eef1ef]">
            <div className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <strong className="block text-sm">Đợt 1 · Đặt cọc triển khai (50%) — 42.500.000 đ</strong>
                <p className="mt-0.5 text-xs text-[#64746d]">Đã xác nhận thanh toán · Dự án đã được kích hoạt</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Đã thanh toán
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <strong className="block text-sm">Đợt 2 · Nghiệm thu giữa kỳ (30%) — 25.500.000 đ</strong>
                <p className="mt-0.5 text-xs text-[#64746d]">Đến hạn khi hoàn tất Sprint 3</p>
              </div>
              <button className={btnPrimarySm}>Thanh toán ngay</button>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <strong className="block text-sm">Đợt 3 · Tất toán bàn giao hồ sơ (20%) — 17.000.000 đ</strong>
                <p className="mt-0.5 text-xs text-[#64746d]">Thanh toán đợt cuối để tải trọn bộ mã nguồn &amp; hồ sơ</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Chưa đến hạn
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className={cardClass}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Kiểm thử sản phẩm bàn giao &amp; Nghiệm thu</h3>
              <p className="mt-0.5 text-xs text-[#6b7c74]">
                Lượt chỉnh sửa miễn phí đã dùng: <strong>1 / 3 lần</strong> (Vượt quá 3 lần hoặc thêm tính năng mới sẽ lập báo giá phụ lục).
              </p>
            </div>
            <span className="rounded-full bg-[#eef6f2] px-2.5 py-1 text-xs font-semibold text-[#154734]">
              1 / 3 lần sửa miễn phí
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div>
              <strong className="block text-sm">Gói bàn giao Sprint 3 · Giao diện trang chủ &amp; Giỏ hàng</strong>
              <p className="mt-0.5 text-xs text-[#64746d]">Đã đạt QA nội bộ · Link kiểm thử: demo.nori.vn/nr-2048-v3</p>
            </div>
            <div className="flex gap-2">
              <button className={btnOutlineSm}>Báo lỗi / Yêu cầu sửa</button>
              <button className={btnPrimarySm}>Xác nhận nghiệm thu</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && <ProfilePanel user={user} />}
    </DashboardLayout>
  );
}
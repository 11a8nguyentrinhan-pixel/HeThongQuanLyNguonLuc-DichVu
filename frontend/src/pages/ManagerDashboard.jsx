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
   2. GIAO DIỆN MANAGER
   ========================================================================= */
export function ManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const menu = [
    { key: 'dashboard', label: 'Tổng quan điều phối' },
    { key: 'requests', label: 'Tiếp nhận yêu cầu', badge: 5 },
    { key: 'quotes', label: 'Báo giá & Hợp đồng', badge: 3 },
    { key: 'payments', label: 'Điều phối thanh toán', badge: 2 },
    { key: 'projects', label: 'Dự án, Task & KPI', badge: 8 },
    { key: 'qa', label: 'Kiểm duyệt QA & Bàn giao', badge: 4 },
  ];

  const tabMeta = {
    dashboard: {
      breadcrumb: 'Tổng quan điều phối',
      tag: 'KHÔNG GIAN QUẢN LÝ · MANAGER',
      title: `Chào buổi sáng, ${user?.full_name || 'Manager'}`,
      desc: 'Theo dõi sức khỏe danh mục dự án, điểm nghẽn Task và các hồ sơ báo giá đang chờ xử lý.',
    },
    requests: {
      breadcrumb: 'Tiếp nhận yêu cầu',
      tag: 'THẨM ĐỊNH & LÀM RÕ PHẠM VI',
      title: 'Yêu cầu dịch vụ từ Client',
      desc: 'Đánh giá tính khả thi, gửi yêu cầu bổ sung (Chờ làm rõ) hoặc chốt phạm vi chuyển sang lập báo giá.',
    },
    quotes: {
      breadcrumb: 'Báo giá & Hợp đồng',
      tag: 'LƯU VẾT PHIÊN BẢN & PHÁP LÝ',
      title: 'Quản lý Báo giá & Hợp đồng',
      desc: 'Lập báo giá chính/phụ lục (lưu version_number), hợp đồng tối đa 3 đợt TT và 3 lần sửa miễn phí.',
    },
    payments: {
      breadcrumb: 'Điều phối thanh toán',
      tag: 'LỘ TRÌNH TỐI ĐA 3 ĐỢT / DỰ ÁN',
      title: 'Điều phối thanh toán trước triển khai',
      desc: 'Phối hợp Client cập nhật chứng từ gửi Admin đối soát và theo dõi kích hoạt dự án sau thanh toán.',
    },
    projects: {
      breadcrumb: 'Dự án, Task & KPI',
      tag: 'PHÂN BỔ NGUỒN LỰC & GIÁM SÁT TIẾN ĐỘ',
      title: 'Dự án đang triển khai & Phân công Task',
      desc: 'Giao Task tự báo trước 24h, tháo gỡ Task bị chặn, thưởng KPI sớm hạn hoặc điều động Backup.',
    },
    qa: {
      breadcrumb: 'Kiểm duyệt QA & Bàn giao',
      tag: 'CHẤT LƯỢNG NỘI BỘ & NGHIỆM THU',
      title: 'Kiểm duyệt QA & Xử lý phản hồi Client',
      desc: 'Duyệt sản phẩm Member nộp, xử lý sửa miễn phí (≤ 3 lần) hoặc lập báo giá phụ lục (> 3 lần).',
    },
    profile: {
      breadcrumb: 'Hồ sơ cá nhân',
      tag: 'TÀI KHOẢN QUẢN LÝ',
      title: 'Hồ sơ cá nhân',
      desc: 'Cập nhật thông tin liên hệ cá nhân.',
    },
  };

  const currentMeta = tabMeta[activeTab] || tabMeta.dashboard;

  return (
    <DashboardLayout
      portalLabel="WORKSPACE"
      workspaceName="Nori Project Hub"
      breadcrumb={currentMeta.breadcrumb}
      menuItems={menu}
      activeMenu={activeTab}
      onSelectMenu={setActiveTab}
      subtitleTag={currentMeta.tag}
      title={currentMeta.title}
      description={currentMeta.desc}
      primaryActionText="+ Tạo Project / Task"
      onPrimaryAction={() => setActiveTab('projects')}
    >
      {activeTab === 'dashboard' && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Dự án đang triển khai</span>
              <h3 className="my-2 text-3xl font-extrabold">08</h3>
              <small className="text-xs font-semibold text-emerald-700">6 đúng tiến độ · 2 có rủi ro</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Yêu cầu chờ thẩm định</span>
              <h3 className="my-2 text-3xl font-extrabold">05</h3>
              <small className="text-xs text-[#7c8c85]">3 mới gửi · 2 đang chờ làm rõ</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Task chờ duyệt QA</span>
              <h3 className="my-2 text-3xl font-extrabold">04</h3>
              <small className="text-xs font-semibold text-amber-700">Cần kiểm tra tiêu chí &amp; bảo mật</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Công suất đội ngũ</span>
              <h3 className="my-2 text-3xl font-extrabold">78%</h3>
              <small className="text-xs text-[#7c8c85]">1 Task đang báo "Bị chặn"</small>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className={cardClass}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold">Điểm nghẽn &amp; Rủi ro cần tháo gỡ</h3>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  Cần xử lý
                </span>
              </div>
              <div className="divide-y divide-[#eef1ef]">
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">[Bị chặn] Tích hợp thanh toán QR · NR-2048</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">Member: Trần Thảo Vy · Chờ tài liệu Sandbox từ Client</p>
                  </div>
                  <button className={btnOutlineSm} onClick={() => setActiveTab('projects')}>
                    Tháo gỡ
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">[Trễ hạn 4h] Cắt giao diện trang giỏ hàng</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">Yêu cầu giải trình &amp; điều động nhân sự Backup</p>
                  </div>
                  <button className={btnOutlineSm} onClick={() => setActiveTab('projects')}>
                    Điều động
                  </button>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold">Phản hồi mới từ Khách hàng</h3>
                <span className="rounded-full bg-[#eef6f2] px-2.5 py-0.5 text-xs font-semibold text-[#154734]">
                  Client Portal
                </span>
              </div>
              <div className="divide-y divide-[#eef1ef]">
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">Báo giá v2 · Website Thương mại điện tử</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">Hạt Mầm Coffee · Đã đồng ý điều khoản → Soạn hợp đồng</p>
                  </div>
                  <button className={btnPrimarySm} onClick={() => setActiveTab('quotes')}>
                    Soạn HĐ
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">Phản hồi kiểm thử (Lần sửa 2/3 miễn phí)</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">Dự án NR-2048 · Điều chỉnh nút thanh toán mobile</p>
                  </div>
                  <button className={btnOutlineSm} onClick={() => setActiveTab('qa')}>
                    Giao sửa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className={cardClass}>
          <h3 className="mb-3 text-base font-bold">Hồ sơ yêu cầu dịch vụ (service_requests)</h3>
          <div className="divide-y divide-[#eef1ef]">
            <div className="flex flex-wrap items-center justify-between gap-4 py-3.5">
              <div>
                <strong className="block text-sm">REQ-108 · Xây dựng cổng đặt lịch phòng khám</strong>
                <p className="mt-0.5 text-xs text-[#64746d]">Giá bảo toàn: 65.000.000 đ · Có tệp mô tả đính kèm · Đủ thông tin</p>
              </div>
              <div className="flex gap-2">
                <button className={btnOutlineSm}>Yêu cầu làm rõ</button>
                <button className={btnPrimarySm}>Chốt phạm vi → Báo giá</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quotes' && (
        <div className={cardClass}>
          <h3 className="mb-3 text-base font-bold">Báo giá &amp; Hợp đồng pháp lý (quotations / contracts)</h3>
          <div className="divide-y divide-[#eef1ef]">
            <div className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <strong className="block text-sm">QT-024 (Phiên bản v2) · Nền tảng thương mại điện tử</strong>
                <p className="mt-0.5 text-xs text-[#64746d]">Tổng sau thuế: 85.000.000 đ · 3 đợt thanh toán · Tối đa 3 lần sửa miễn phí</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Client đã chấp nhận
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className={cardClass}>
          <h3 className="mb-3 text-base font-bold">Lộ trình thanh toán hợp đồng (Tối đa 3 đợt / dự án)</h3>
          <div className="divide-y divide-[#eef1ef]">
            <div className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <strong className="block text-sm">HD-2026-019 · Đợt 1 (Đặt cọc 50%) — 42.500.000 đ</strong>
                <p className="mt-0.5 text-xs text-[#64746d]">Đã gửi chứng từ sao kê chờ Admin đối soát &amp; kích hoạt dự án</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Chờ Admin đối soát
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className={cardClass}>
          <h3 className="mb-3 text-base font-bold">Danh sách dự án &amp; Giám sát KPI</h3>
          <div className="mb-4 rounded-xl border border-[#e4e8e5] bg-[#f8faf8] p-4">
            <div className="mb-2 flex items-center justify-between">
              <strong className="text-sm">NR-2048 · Nền tảng thương mại điện tử</strong>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Active · 68%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8e4]">
              <div className="h-full w-[68%] rounded-full bg-[#154734]" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <strong className="block text-sm">Hoàn thành sớm (-6h): API Tìm kiếm sản phẩm · Trần Thảo Vy</strong>
              <p className="mt-0.5 text-xs text-[#64746d]">Ghi nhận +5 điểm thưởng KPI và chuyển sang kiểm duyệt QA nội bộ</p>
            </div>
            <button className={btnPrimarySm}>+ Thưởng KPI</button>
          </div>
        </div>
      )}

      {activeTab === 'qa' && (
        <div className={cardClass}>
          <h3 className="mb-3 text-base font-bold">Sản phẩm bàn giao chờ kiểm duyệt QA nội bộ (deliverables)</h3>
          <div className="flex flex-wrap items-center justify-between gap-4 py-2">
            <div>
              <strong className="block text-sm">Wireframe &amp; Giao diện trang chủ v3 · NR-2048</strong>
              <p className="mt-0.5 text-xs text-[#64746d]">Member: Trần Thảo Vy · Đã kiểm tra bảo mật &amp; quyền truy cập File/Link</p>
            </div>
            <div className="flex gap-2">
              <button className={btnOutlineSm}>Trả lại sửa</button>
              <button className={btnPrimarySm}>Đạt QA → Bàn giao Client</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && <ProfilePanel user={user} />}
    </DashboardLayout>
  );
}

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
   3. GIAO DIỆN MEMBER
   ========================================================================= */
export function MemberDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [securityChecked, setSecurityChecked] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 'TSK-401',
      name: 'Hoàn thiện giao diện trang chủ & Responsive Mobile',
      project: 'NR-2048 · Nền tảng TMĐT',
      priority: 'Cao',
      due: 'Hôm nay, 16:00',
      notify24h: true,
      status: 'Đang làm',
    },
    {
      id: 'TSK-405',
      name: 'Tích hợp Webhook cổng thanh toán Sandbox',
      project: 'NR-2048 · Nền tảng TMĐT',
      priority: 'Khẩn cấp',
      due: 'Ngày mai, 11:00',
      notify24h: true,
      status: 'Bị chặn',
      blockedReason: 'Thiếu khóa API Sandbox từ phía khách hàng',
    },
    {
      id: 'TSK-398',
      name: 'Chỉnh sửa luồng đăng nhập theo nhận xét QA',
      project: 'NR-2031 · Cổng khách hàng',
      priority: 'Trung bình',
      due: '21/11/2026',
      notify24h: false,
      status: 'Chờ duyệt',
    },
  ]);

  const menu = [
    { key: 'overview', label: 'Tổng quan cá nhân' },
    { key: 'tasks', label: 'Công việc được giao', badge: tasks.length },
    { key: 'timesheet', label: 'Ghi nhận giờ làm' },
    { key: 'deliverables', label: 'Nộp bài & Phản hồi QA', badge: 1 },
  ];

  const tabMeta = {
    overview: {
      breadcrumb: 'Tổng quan cá nhân',
      tag: 'KHÔNG GIAN THỰC THI · MEMBER',
      title: `Chào ${user?.full_name || 'Member'}, sẵn sàng bắt đầu?`,
      desc: 'Theo dõi các Task ưu tiên hôm nay, cảnh báo hạn 24h và điểm hiệu suất KPI của bạn.',
    },
    tasks: {
      breadcrumb: 'Công việc được giao',
      tag: 'VÒNG ĐỜI TASK · TIẾP NHẬN & THỰC THI',
      title: 'Danh sách công việc của tôi',
      desc: 'Kiểm tra tính khả thi, chuyển trạng thái Đang làm hoặc báo Bị chặn kèm giải trình cho Manager.',
    },
    timesheet: {
      breadcrumb: 'Ghi nhận giờ làm',
      tag: 'TIMESHEETS · THEO DÕI PHIÊN LÀM VIỆC',
      title: 'Nhật ký thời gian làm việc',
      desc: 'Ghi nhận chính xác số giờ thực tế (duration_hours) trên từng Task ở trạng thái Đang làm.',
    },
    deliverables: {
      breadcrumb: 'Nộp bài & Phản hồi QA',
      tag: 'KIỂM TRA TIÊU CHÍ, BẢO MẬT & BÀN GIAO',
      title: 'Nộp kết quả & Xử lý nhận xét Manager',
      desc: 'Tự kiểm tra tiêu chí đầu ra, quyền truy cập File/Link trước khi chuyển sang Chờ duyệt.',
    },
    profile: {
      breadcrumb: 'Hồ sơ cá nhân',
      tag: 'TÀI KHOẢN THÀNH VIÊN',
      title: 'Hồ sơ cá nhân',
      desc: 'Cập nhật thông tin liên hệ cá nhân.',
    },
  };

  const currentMeta = tabMeta[activeTab] || tabMeta.overview;

  const updateTaskStatus = (id, nextStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
  };

  return (
    <DashboardLayout
      portalLabel="WORKSPACE"
      workspaceName="Nori Delivery Team"
      breadcrumb={currentMeta.breadcrumb}
      menuItems={menu}
      activeMenu={activeTab}
      onSelectMenu={setActiveTab}
      subtitleTag={currentMeta.tag}
      title={currentMeta.title}
      description={currentMeta.desc}
      primaryActionText="+ Bắt đầu ghi giờ làm"
      onPrimaryAction={() => setActiveTab('timesheet')}
    >
      {activeTab === 'overview' && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Việc cần xử lý</span>
              <h3 className="my-2 text-3xl font-extrabold">0{tasks.length}</h3>
              <small className="text-xs text-[#7c8c85]">Trong 2 dự án đang chạy</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Cảnh báo hạn 24h</span>
              <h3 className="my-2 text-3xl font-extrabold">02</h3>
              <small className="text-xs font-semibold text-amber-700">Task gần nhất hạn 16:00</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Điểm KPI tích lũy</span>
              <h3 className="my-2 text-3xl font-extrabold">{user?.kpi_score ?? 94}</h3>
              <small className="text-xs font-semibold text-emerald-700">+5 điểm thưởng hoàn thành sớm</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Giờ làm tuần này</span>
              <h3 className="my-2 text-3xl font-extrabold">28,5h</h3>
              <small className="text-xs text-[#7c8c85]">Đã đồng bộ vào Timesheets</small>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Ưu tiên hôm nay</h3>
              <button className={btnOutlineSm} onClick={() => setActiveTab('tasks')}>
                Xem tất cả Task →
              </button>
            </div>
            <div className="divide-y divide-[#eef1ef]">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">
                      {t.id} · {t.name}
                    </strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">
                      {t.project} · Hạn: {t.due} · Ưu tiên: {t.priority}
                      {t.blockedReason ? ` · Giải trình: ${t.blockedReason}` : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      t.status === 'Đang làm'
                        ? 'bg-[#eef6f2] text-[#154734]'
                        : t.status === 'Bị chặn'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'tasks' && (
        <div className={cardClass}>
          <h3 className="mb-3 text-base font-bold">Quản lý trạng thái thực thi Task</h3>
          <div className="divide-y divide-[#eef1ef]">
            {tasks.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                <div>
                  <strong className="block text-sm">
                    {t.id} · {t.name}
                  </strong>
                  <p className="mt-0.5 text-xs text-[#64746d]">
                    {t.project} · Hạn: {t.due} · {t.notify24h ? '🔔 Đã báo trước 24h' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className={btnOutlineSm} onClick={() => updateTaskStatus(t.id, 'Đang làm')}>
                    Đang làm
                  </button>
                  <button className={btnOutlineSm} onClick={() => updateTaskStatus(t.id, 'Bị chặn')}>
                    Báo bị chặn
                  </button>
                  <button
                    className={btnPrimarySm}
                    onClick={() => {
                      updateTaskStatus(t.id, 'Chờ duyệt');
                      setActiveTab('deliverables');
                    }}
                  >
                    Nộp kết quả
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timesheet' && (
        <div className={cardClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Ghi nhận thời gian làm việc (timesheets)</h3>
            <button className={btnPrimarySm}>+ Ghi phiên làm việc mới</button>
          </div>
          <div className="divide-y divide-[#eef1ef]">
            <div className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <strong className="block text-sm">TSK-401 · Giao diện trang chủ &amp; Responsive</strong>
                <p className="mt-0.5 text-xs text-[#64746d]">08:30 – 12:00 · Hoàn thiện header, grid sản phẩm</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                3.5h
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deliverables' && (
        <div className={cardClass}>
          <h3 className="mb-1 text-base font-bold">Tự kiểm tra đầu ra &amp; Tải tệp kết quả (deliverables)</h3>
          <p className="mb-4 text-xs text-[#6b7c74]">
            Xác nhận đủ tiêu chí hoàn thành và tính bảo mật File/Link trước khi chuyển sang "Chờ duyệt".
          </p>
          <div className="mb-4 rounded-xl border border-[#d5e5da] bg-[#f6faf7] p-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-[#1d332a]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#154734]"
                checked={securityChecked}
                onChange={(e) => setSecurityChecked(e.target.checked)}
              />
              <span>
                Tôi xác nhận đã tự kiểm tra sản phẩm theo tiêu chí (criteria), quyền truy cập File/Link và tính bảo mật.
              </span>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1d332a]">Đường dẫn tệp kết quả (file_url)</label>
              <input
                type="text"
                placeholder="https://drive.nori.vn/deliverables/tsk-401-v1.zip"
                className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1d332a]">Đường dẫn mã nguồn khi đóng Task</label>
              <input
                type="text"
                placeholder="https://git.nori.vn/nr-2048/commit/a9c2f"
                className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button className={btnPrimarySm} disabled={!securityChecked}>
              Tải tệp lên &amp; Chuyển "Chờ duyệt"
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && <ProfilePanel user={user} />}
    </DashboardLayout>
  );
}

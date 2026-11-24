export const cardClass =
  'rounded-2xl border border-[#e4e8e5] bg-white p-6 shadow-2xs';

export const btnPrimarySm =
  'cursor-pointer rounded-lg bg-[#154734] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0f3728] disabled:cursor-not-allowed disabled:opacity-50';

export const btnOutlineSm =
  'cursor-pointer rounded-lg border border-[#cfd8d3] bg-white px-3.5 py-2 text-xs font-semibold text-[#10231b] transition hover:bg-[#f5f7f6]';

export const getAdminMenu = ({ staffCount = 0 } = {}) => [
  { key: 'overview', label: 'Tổng quan hệ thống' },
  { key: 'accounts', label: 'Tài khoản & Phân quyền', badge: staffCount },
  { key: 'catalogs', label: 'Danh mục & Mẫu hợp đồng', badge: 4 },
  { key: 'reconcile', label: 'Tích hợp API & Đối soát', badge: 2 },
  { key: 'logs', label: 'Nhật ký, Backup & Sự cố' },
];

export const TAB_META = {
  overview: {
    breadcrumb: 'Tổng quan hệ thống',
    tag: 'TRUNG TÂM QUẢN TRỊ · NORI',
    title: 'Tổng quan hệ thống',
    desc: 'Giám sát vòng đời tài khoản nội bộ, đối soát thanh toán độc lập và an toàn hệ thống.',
  },
  accounts: {
    breadcrumb: 'Tài khoản & Phân quyền',
    tag: 'QUẢN LÝ RBAC & VÒNG ĐỜI TÀI KHOẢN',
    title: 'Tài khoản nhân sự & Phân quyền',
    desc: 'Mời Manager/Member, cập nhật Role (kiểm tra xung đột quyền), khóa hoặc khôi phục tài khoản.',
  },
  catalogs: {
    breadcrumb: 'Danh mục & Mẫu hợp đồng',
    tag: 'CẤU HÌNH NỀN TẢNG · SERVICE_CATALOGS',
    title: 'Danh mục gói dịch vụ & Biểu phí',
    desc: 'Cập nhật bảng giá chuẩn luôn giữ nguyên giá cũ (snapshot_price) cho các yêu cầu đã đặt trước đó.',
  },
  reconcile: {
    breadcrumb: 'Tích hợp API & Đối soát',
    tag: 'PHÂN TÁCH TRÁCH NHIỆM TÀI CHÍNH',
    title: 'Đối soát thanh toán & Tích hợp bên thứ 3',
    desc: 'Kiểm tra mã giao dịch, chứng từ sao kê để kích hoạt dự án và quản lý kết nối API Thanh toán / Email.',
  },
  logs: {
    breadcrumb: 'Nhật ký, Backup & Sự cố',
    tag: 'AUDIT TRAILS & BẢO MẬT',
    title: 'Nhật ký kiểm toán & Sao lưu định kỳ',
    desc: 'Theo dõi mọi thao tác phân quyền, đăng nhập bất thường và khôi phục dữ liệu từ bản Backup.',
  },
  profile: {
    breadcrumb: 'Hồ sơ cá nhân',
    tag: 'TÀI KHOẢN QUẢN TRỊ VIÊN',
    title: 'Hồ sơ cá nhân',
    desc: 'Cập nhật thông tin liên hệ của tài khoản quản trị.',
  },
};

export const PERMISSION_OPTIONS = [
  { key: 'execute_task', label: 'Thực thi Task & Ghi nhận Timesheet', group: 'Member' },
  { key: 'submit_deliverable', label: 'Nộp sản phẩm bàn giao (Self-QA)', group: 'Member' },
  { key: 'approve_qa', label: 'Kiểm duyệt QA nội bộ & Đánh giá KPI', group: 'Manager' },
  { key: 'manage_contracts', label: 'Lập báo giá, Hợp đồng & Điều phối dự án', group: 'Manager' },
  { key: 'reconcile_payment', label: 'Đối soát giao dịch tài chính độc lập', group: 'Admin' },
];

export const ROLE_DEFAULT_PERMISSIONS = {
  Manager: ['execute_task', 'submit_deliverable', 'approve_qa', 'manage_contracts'],
  Member: ['execute_task', 'submit_deliverable'],
};

export const STATUS_BADGE_MAP = {
  Active: 'bg-emerald-50 text-emerald-700',
  'Chờ kích hoạt': 'bg-amber-50 text-amber-700',
  'Đã khóa': 'bg-red-50 text-red-700',
};
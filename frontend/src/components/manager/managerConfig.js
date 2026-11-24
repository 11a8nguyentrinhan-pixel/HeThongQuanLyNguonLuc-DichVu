export const BACKEND_ORIGIN = 'http://localhost:5000';

export const cardClass =
  'rounded-2xl border border-[#e4e8e5] bg-white p-6 shadow-2xs';

export const btnPrimarySm =
  'cursor-pointer rounded-lg bg-[#154734] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0f3728] disabled:cursor-not-allowed disabled:opacity-50';

export const btnOutlineSm =
  'cursor-pointer rounded-lg border border-[#cfd8d3] bg-white px-3.5 py-2 text-xs font-semibold text-[#10231b] transition hover:bg-[#f5f7f6] disabled:cursor-not-allowed disabled:opacity-50';

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return 'Báo giá riêng (Custom)';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value));
};

export const resolveAttachmentUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};
export const getAttachmentName = (url) => {
  if (!url) return '';
  try {
    const clean = url.split('?')[0].split('#')[0];
    const fileName = clean.substring(clean.lastIndexOf('/') + 1);
    return decodeURIComponent(fileName) || 'Tệp đính kèm';
  } catch {
    return 'Tệp đính kèm';
  }
};

export const REQUEST_STATUS_BADGE_MAP = {
  'Chờ xử lý': 'bg-sky-50 text-sky-700 border-sky-200',
  'Chờ làm rõ': 'bg-amber-50 text-amber-800 border-amber-200',
  'Đã chốt phạm vi': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Từ chối': 'bg-rose-50 text-rose-700 border-rose-200',
};

export const SCOPE_BASELINE_TEMPLATE = `
--- THỐNG NHẤT CHỐT PHẠM VI (SCOPE BASELINE) ---
• Hạng mục bao gồm (In-scope): ...
• Hạng mục không bao gồm (Out-of-scope): ...
• Sản phẩm bàn giao & Tiêu chí nghiệm thu: ...
• Mốc thời gian (Milestones) & Đầu vào Client cần cung cấp: ...
• Giới hạn chỉnh sửa miễn phí: Tối đa 03 lần chỉnh sửa miễn phí cho mỗi hạng mục/tính năng. Yêu cầu ngoài phạm vi hoặc vượt 3 lần sẽ lập báo giá phụ lục bổ sung.`;

export const getManagerMenu = ({ pendingRequests = 0 } = {}) => [
  { key: 'overview', label: 'Dashboard tổng quan' },
  { key: 'requests', label: 'Tiếp nhận yêu cầu', badge: pendingRequests || null },
  { key: 'quotes', label: 'Báo giá & Hợp đồng' },
  { key: 'projects', label: 'Dự án & Phân công' },
  { key: 'monitor', label: 'Giám sát Kanban & KPI' },
  { key: 'qa', label: 'Kiểm duyệt QA & Bàn giao' },
];

export const MANAGER_TAB_META = {
  overview: {
    breadcrumb: 'Dashboard tổng quan',
    tag: 'TRUNG TÂM ĐIỀU PHỐI · NORI WORKSPACE',
    title: 'Bảng điều khiển quản lý',
    desc: 'Theo dõi sức khỏe danh mục, hồ sơ yêu cầu dịch vụ mới từ Client và các ưu tiên cần xử lý.',
  },
  requests: {
    breadcrumb: 'Tiếp nhận yêu cầu',
    tag: 'QUY TRÌNH 1 · THẨM ĐỊNH & CHỐT PHẠM VI',
    title: 'Tiếp nhận & Thẩm định yêu cầu dịch vụ',
    desc: 'Tra cứu hồ sơ từ Client Portal, đánh giá khả thi/rủi ro, yêu cầu làm rõ hoặc chốt phạm vi (tối đa 3 lần sửa miễn phí).',
  },
  quotes: {
    breadcrumb: 'Báo giá & Hợp đồng',
    tag: 'QUY TRÌNH 2 & 3 · THƯƠNG MẠI & THANH TOÁN',
    title: 'Báo giá, Hợp đồng & Điều phối thanh toán',
    desc: 'Lập phiên bản báo giá (Versioning), xuất bản hợp đồng và theo dõi lộ trình tối đa 3 đợt thanh toán.',
  },
  projects: {
    breadcrumb: 'Dự án & Phân công',
    tag: 'QUY TRÌNH 4 · KHỞI TẠO & PHÂN BỔ',
    title: 'Không gian dự án & Phân bổ nguồn lực',
    desc: 'Chuyển đổi hợp đồng thành Project, phân rã Task và gửi thông báo tự động trước 24h cho Member.',
  },
  monitor: {
    breadcrumb: 'Giám sát Kanban & KPI',
    tag: 'QUY TRÌNH 5 · DAILY & WEEKLY TRACKING',
    title: 'Giám sát tiến độ, Timesheet & Đánh giá KPI',
    desc: 'Theo dõi bảng Kanban, tháo gỡ Task bị chặn, thưởng/trừ KPI và điều động nhân sự dự phòng (Backup).',
  },
  qa: {
    breadcrumb: 'Kiểm duyệt QA & Bàn giao',
    tag: 'QUY TRÌNH 6 · QA NỘI BỘ & ĐÓNG DỰ ÁN',
    title: 'Kiểm duyệt chất lượng & Bàn giao Client',
    desc: 'Duyệt QA nội bộ, phân loại phản hồi phát sinh và đóng dự án khi hoàn tất nghiệm thu & công nợ.',
  },
  profile: {
    breadcrumb: 'Hồ sơ cá nhân',
    tag: 'TÀI KHOẢN QUẢN LÝ',
    title: 'Hồ sơ cá nhân',
    desc: 'Cập nhật thông tin liên hệ và bảo mật tài khoản Manager.',
  },
};
export const QUOTE_STATUS_BADGE_MAP = {
  'Bản nháp': 'bg-slate-100 text-slate-700 border-slate-200',
  'Đã gửi': 'bg-sky-50 text-sky-700 border-sky-200',
  'Cần điều chỉnh': 'bg-amber-50 text-amber-800 border-amber-200',
  'Chấp nhận': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Từ chối / Đóng': 'bg-rose-50 text-rose-700 border-rose-200',
  'Hết hạn': 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

export const CONTRACT_STATUS_BADGE_MAP = {
  'Bản thảo': 'bg-slate-100 text-slate-700 border-slate-200',
  'Chờ duyệt': 'bg-amber-50 text-amber-800 border-amber-200',
  'Đã ký': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Đang hiệu lực': 'bg-teal-50 text-teal-700 border-teal-200',
  'Đã đóng': 'bg-zinc-100 text-zinc-600 border-zinc-200',
};
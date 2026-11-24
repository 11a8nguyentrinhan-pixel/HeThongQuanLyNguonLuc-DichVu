export const BACKEND_ORIGIN = 'http://localhost:5000';

export const cardClass =
  'rounded-2xl border border-[#e4e8e5] bg-white p-6 shadow-2xs';

export const btnPrimarySm =
  'cursor-pointer rounded-lg bg-[#154734] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0f3728] disabled:cursor-not-allowed disabled:opacity-50';

export const btnOutlineSm =
  'cursor-pointer rounded-lg border border-[#cfd8d3] bg-white px-3.5 py-2 text-xs font-semibold text-[#10231b] transition hover:bg-[#f5f7f6]';

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

export const REQUEST_STATUS_BADGE_MAP = {
  'Chờ xử lý': 'bg-sky-50 text-sky-700 border-sky-200',
  'Chờ làm rõ': 'bg-amber-50 text-amber-800 border-amber-200',
  'Đã chốt phạm vi': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Từ chối': 'bg-rose-50 text-rose-700 border-rose-200',
};

export const getClientMenu = ({ catalogCount = 0, requestCount = 0 } = {}) => [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'catalogs', label: 'Danh mục dịch vụ', badge: catalogCount || null },
  { key: 'requests', label: 'Yêu cầu của tôi', badge: requestCount || null },
  { key: 'quotes', label: 'Báo giá & Hợp đồng' },
  { key: 'projects', label: 'Dự án của tôi' },
  { key: 'payments', label: 'Thanh toán' },
  { key: 'deliverables', label: 'Bàn giao & Nghiệm thu' },
];

export const CLIENT_TAB_META = {
  overview: {
    breadcrumb: 'Tổng quan',
    tag: 'KHÔNG GIAN KHÁCH HÀNG · NORI',
    title: 'Tổng quan tài khoản khách hàng',
    desc: 'Theo dõi các yêu cầu dịch vụ đang thẩm định, phản hồi làm rõ phạm vi và tiến độ hợp đồng.',
  },
  catalogs: {
    breadcrumb: 'Danh mục dịch vụ',
    tag: 'GIẢI PHÁP & GÓI DỊCH VỤ · SERVICE CATALOGS',
    title: 'Khám phá gói dịch vụ chuẩn & Custom',
    desc: 'Đặt mua gói tiêu chuẩn (được bảo toàn giá tại thời điểm đặt) hoặc gửi yêu cầu thiết kế riêng.',
  },
  requests: {
    breadcrumb: 'Yêu cầu của tôi',
    tag: 'THEO DÕI HỒ SƠ · SERVICE REQUESTS',
    title: 'Lịch sử yêu cầu dịch vụ',
    desc: 'Kiểm tra tiến trình thẩm định của Manager và bổ sung thông tin ngay khi có yêu cầu làm rõ.',
  },
  quotes: {
    breadcrumb: 'Báo giá & Hợp đồng',
    tag: 'THƯƠNG LƯỢNG & PHÁP LÝ',
    title: 'Báo giá & Hợp đồng điện tử',
    desc: 'Xem các phiên bản báo giá từ Manager và ký duyệt hợp đồng.',
  },
  projects: {
    breadcrumb: 'Dự án của tôi',
    tag: 'GIÁM SÁT TIẾN ĐỘ',
    title: 'Tiến độ dự án & Cột mốc',
    desc: 'Theo dõi các cột mốc triển khai chính của dự án.',
  },
  payments: {
    breadcrumb: 'Thanh toán',
    tag: 'LỘ TRÌNH TỐI ĐA 3 ĐỢT',
    title: 'Hóa đơn & Lịch sử thanh toán',
    desc: 'Thực hiện thanh toán theo đợt và gửi chứng từ hỗ trợ đối soát khi cần.',
  },
  deliverables: {
    breadcrumb: 'Bàn giao & Nghiệm thu',
    tag: 'KIỂM THỬ & NGHIỆM THU',
    title: 'Sản phẩm bàn giao & Phản hồi',
    desc: 'Kiểm thử sản phẩm, gửi phản hồi (tối đa 3 lần miễn phí) và xác nhận nghiệm thu.',
  },
  profile: {
    breadcrumb: 'Hồ sơ cá nhân',
    tag: 'TÀI KHOẢN KHÁCH HÀNG',
    title: 'Hồ sơ cá nhân',
    desc: 'Cập nhật thông tin liên hệ và bảo mật tài khoản.',
  },
};
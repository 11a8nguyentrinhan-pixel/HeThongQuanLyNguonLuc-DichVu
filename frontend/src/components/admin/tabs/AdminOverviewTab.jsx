import {cardClass, btnOutlineSm } from '../adminConfig';

export default function AdminOverviewTab({ setActiveTab, staffList = []}) {
    const penddingCount = staffList.filter((s)=>s.status === 'Chờ kích hoạt').length;

    return(
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Nhân sự nội bộ</span>
              <h3 className="my-2 text-3xl font-extrabold text-[#10231b]">42</h3>
              <small className="text-xs text-[#7c8c85]">Manager &amp; Member do Admin mời</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Khách hàng (Client)</span>
              <h3 className="my-2 text-3xl font-extrabold text-[#10231b]">18</h3>
              <small className="text-xs text-[#7c8c85]">Đăng ký công khai · Role Client</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Chờ đối soát thanh toán</span>
              <h3 className="my-2 text-3xl font-extrabold text-[#10231b]">02</h3>
              <small className="text-xs font-semibold text-amber-700">Cần xác nhận kích hoạt dự án</small>
            </div>
            <div className="rounded-2xl border border-[#e4e8e5] bg-white p-5">
              <span className="text-xs text-[#64746d]">Bản sao lưu (Backup)</span>
              <h3 className="my-2 text-3xl font-extrabold text-[#10231b]">100%</h3>
              <small className="text-xs font-semibold text-emerald-700">Sao lưu tự động 02:00 sáng</small>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className={cardClass}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold">Việc quản trị cần xử lý ngay</h3>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  3 việc chờ
                </span>
              </div>
              <div className="divide-y divide-[#eef1ef]">
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">Đối soát đợt 1 (Đặt cọc) · HĐ HD-2026-019</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">42.500.000 đ · Manager đã bổ sung chứng từ sao kê</p>
                  </div>
                  <button className={btnOutlineSm} onClick={() => setActiveTab('reconcile')}>
                    Đối soát
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">1 lời mời nhân sự chưa kích hoạt (Quá 48h)</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">Lê Hoàng Nam (nam.lh@nori.vn) · Gửi lại liên kết mời</p>
                  </div>
                  <button className={btnOutlineSm} onClick={() => setActiveTab('accounts')}>
                    Kiểm tra
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">Cảnh báo IP đăng nhập bất thường</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">IP 113.161.84.22 · Kiểm tra nhật ký &amp; thu hồi Token</p>
                  </div>
                  <button className={btnOutlineSm} onClick={() => setActiveTab('logs')}>
                    Rà soát
                  </button>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold">Trạng thái tích hợp API</h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Ổn định
                </span>
              </div>
              <div className="divide-y divide-[#eef1ef]">
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">Cổng thanh toán VNPay / VietQR Webhook</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">Đồng bộ tự động · Độ trễ 120ms</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">Máy chủ Email SMTP (Mời nhân sự &amp; OTP)</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">Gửi lời mời kích hoạt &amp; mã khôi phục mật khẩu</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm">Cloud Storage (Backup &amp; Hồ sơ bàn giao)</strong>
                    <p className="mt-0.5 text-xs text-[#64746d]">Dung lượng đã dùng 38% · Tự động Backup mỗi ngày</p>
                  </div>
                  <span className="rounded-full bg-[#eef6f2] px-2.5 py-1 text-xs font-semibold text-[#154734]">
                    Sẵn sàng
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
    );
}
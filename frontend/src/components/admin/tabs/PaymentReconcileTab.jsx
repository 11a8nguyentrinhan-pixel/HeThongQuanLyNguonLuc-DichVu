import { cardClass, btnPrimarySm, btnOutlineSm } from '../adminConfig';

export default function PaymentReconcileTab() {
  return (
    <div className={cardClass}>
      <h3 className="mb-4 text-base font-bold">Yêu cầu đối soát thanh toán độc lập</h3>
      <div className="divide-y divide-[#eef1ef]">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3.5">
          <div>
            <strong className="block text-sm">
              HĐ HD-2026-019 · Đợt 1 (Đặt cọc 50%) — 42.500.000 đ
            </strong>
            <p className="mt-0.5 text-xs text-[#64746d]">
              Mã GD: FT2611198821 · Khách hàng: Hạt Mầm Coffee · Chứng từ: bien_lai_dot1.pdf
            </p>
          </div>
          <div className="flex gap-2">
            <button className={btnOutlineSm}>Trả hồ sơ về Manager</button>
            <button className={btnPrimarySm}>Xác nhận Đã thanh toán</button>
          </div>
        </div>
      </div>
    </div>
  );
}
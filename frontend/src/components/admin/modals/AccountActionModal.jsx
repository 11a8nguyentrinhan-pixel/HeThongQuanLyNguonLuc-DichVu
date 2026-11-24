import { btnOutlineSm } from '../adminConfig';

export default function AccountActionModal({
  accountActionModal,
  setAccountActionModal,
  handleConfirmAccountAction,
}) {
  if (!accountActionModal.open || !accountActionModal.staff) return null;

  const closeModal = () =>
    setAccountActionModal((prev) => ({ ...prev, open: false }));

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2b1f]/55 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#10231b]">
              {accountActionModal.action === 'lock'
                ? 'Khóa / Ngưng kích hoạt tài khoản'
                : 'Kiểm tra & Khôi phục tài khoản'}
            </h3>
            <p className="mt-0.5 text-xs text-[#64746d]">
              Nhân sự: <strong>{accountActionModal.staff.full_name}</strong> ({accountActionModal.staff.role})
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#f1f4f2] text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {accountActionModal.action === 'lock' ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            Hệ thống sẽ <strong>thu hồi ngay lập tức phiên đăng nhập</strong> hiện tại, nhưng{' '}
            <strong>bảo toàn nguyên vẹn 100% lịch sử Task, Timesheet và Dự án cũ</strong> để phục vụ kiểm toán.
          </div>
        ) : (
          <div className="mb-4 flex flex-col gap-2 rounded-xl border border-[#dfe4e0] bg-[#f8faf8] p-3 text-xs">
            <span className="font-bold text-[#1d332a]">Đánh giá điều kiện khôi phục:</span>
            <label className="flex cursor-pointer items-center gap-2 text-emerald-800">
              <input
                type="radio"
                name="eligibility"
                checked={accountActionModal.isEligible === true}
                onChange={() =>
                  setAccountActionModal((prev) => ({
                    ...prev,
                    isEligible: true,
                    reason: 'Nhân sự quay trở lại làm việc chính thức',
                  }))
                }
              />
              <span>Đủ điều kiện mở khóa (Chuyển sang Active &amp; cấp lại quyền)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-red-700">
              <input
                type="radio"
                name="eligibility"
                checked={accountActionModal.isEligible === false}
                onChange={() =>
                  setAccountActionModal((prev) => ({
                    ...prev,
                    isEligible: false,
                    reason: 'Nhân sự đã nghỉ việc vĩnh viễn / Vi phạm bảo mật nghiêm trọng',
                  }))
                }
              />
              <span>Không đủ điều kiện (Từ chối &amp; giữ nguyên trạng thái khóa)</span>
            </label>
          </div>
        )}

        <form onSubmit={handleConfirmAccountAction} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#1d332a]">
              {accountActionModal.action === 'lock' ? 'Lý do khóa tài khoản' : 'Căn cứ / Lý do xử lý'}
            </label>
            <textarea
              rows={3}
              className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              value={accountActionModal.reason}
              onChange={(e) =>
                setAccountActionModal((prev) => ({ ...prev, reason: e.target.value }))
              }
              required
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className={btnOutlineSm} onClick={closeModal}>
              Hủy
            </button>
            <button
              type="submit"
              disabled={accountActionModal.submitting}
              className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 ${
                accountActionModal.action === 'lock' || !accountActionModal.isEligible
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#154734] hover:bg-[#0f3728]'
              }`}
            >
              {accountActionModal.submitting
                ? 'Đang xử lý...'
                : accountActionModal.action === 'lock'
                ? 'Xác nhận Khóa tài khoản'
                : accountActionModal.isEligible
                ? 'Mở khóa & Cấp lại quyền'
                : 'Xác nhận Từ chối khôi phục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
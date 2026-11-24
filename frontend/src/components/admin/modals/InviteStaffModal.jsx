import { btnPrimarySm, btnOutlineSm } from '../adminConfig';

export default function InviteStaffModal({
  isInviteOpen,
  setIsInviteOpen,
  inviteForm,
  setInviteForm,
  inviteLoading,
  handleInviteSubmit,
}) {
  if (!isInviteOpen) return null;

  return (
    <div
      onClick={() => setIsInviteOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2b1f]/55 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#10231b]">Mời nhân sự nội bộ</h3>
            <p className="mt-0.5 text-xs text-[#64746d]">
              Tài khoản nội bộ chỉ được cấp quyền Manager hoặc Member.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsInviteOpen(false)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#f1f4f2] text-xs font-bold text-[#10231b]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleInviteSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#1d332a]">Họ và tên nhân sự</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn An"
              className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              value={inviteForm.full_name}
              onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#1d332a]">Email công việc</label>
            <input
              type="email"
              placeholder="an.nv@nori.vn"
              className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1d332a]">Số điện thoại</label>
              <input
                type="tel"
                placeholder="0912 345 678"
                className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1d332a]">Vai trò (Role)</label>
              <select
                className="rounded-xl border border-[#dfe4e0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#154734]"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                <option value="Member">Member</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#1d332a]">Mật khẩu khởi tạo</label>
            <input
              type="text"
              placeholder="Bỏ trống mặc định: Nori@123456"
              className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              value={inviteForm.password}
              onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className={btnOutlineSm} onClick={() => setIsInviteOpen(false)}>
              Hủy
            </button>
            <button type="submit" className={btnPrimarySm} disabled={inviteLoading}>
              {inviteLoading ? 'Đang khởi tạo...' : 'Tạo tài khoản nhân sự'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
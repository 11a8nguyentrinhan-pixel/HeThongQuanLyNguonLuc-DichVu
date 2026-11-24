export default function ProfilePanel({ user }) {
  return (
    <div className="rounded-2xl border border-[#e4e8e5] bg-white p-6 shadow-2xs">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#10231b]">Hồ sơ cá nhân</h3>
          <p className="mt-0.5 text-xs text-[#6b7c74]">
            Thông tin định danh được đồng bộ từ bảng users &amp; role.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Active
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1d332a]">Họ và tên</label>
          <input
            type="text"
            defaultValue={user?.full_name || ''}
            className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1d332a]">Email đăng nhập</label>
          <input
            type="email"
            defaultValue={user?.email || ''}
            disabled
            className="rounded-xl border border-[#dfe4e0] bg-[#f3f5f4] px-3.5 py-2.5 text-sm text-[#6b7c74]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1d332a]">Số điện thoại</label>
          <input
            type="text"
            defaultValue={user?.phone || '+84 912 345 678'}
            className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1d332a]">Vai trò hệ thống (Role)</label>
          <input
            type="text"
            defaultValue={user?.role || ''}
            disabled
            className="rounded-xl border border-[#dfe4e0] bg-[#f3f5f4] px-3.5 py-2.5 text-sm text-[#6b7c74]"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-[#154734] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0f3728]"
        >
          Lưu thay đổi hồ sơ
        </button>
      </div>
    </div>
  );
}
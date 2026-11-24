import { btnPrimarySm, btnOutlineSm, PERMISSION_OPTIONS } from '../adminConfig';

export default function UpdateRoleModal({
  roleModal,
  setRoleModal,
  handleRoleSelectChange,
  togglePermissionCheckbox,
  handleConfirmUpdateRole,
}) {
  if (!roleModal.open || !roleModal.staff) return null;

  const closeModal = () =>
    setRoleModal((prev) => ({ ...prev, open: false }));

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2b1f]/55 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#10231b]">Cập nhật Role (Phân quyền)</h3>
            <p className="mt-0.5 text-xs text-[#64746d]">
              Nhân sự: <strong>{roleModal.staff.full_name}</strong> · Role hiện tại:{' '}
              <span className="font-bold text-[#154734]">{roleModal.staff.role}</span>
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

        {roleModal.conflictMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700">
            <strong>Cảnh báo xung đột quyền truy cập:</strong> {roleModal.conflictMsg}
          </div>
        )}

        <form onSubmit={handleConfirmUpdateRole} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#1d332a]">Chọn Role mới</label>
            <select
              className="rounded-xl border border-[#dfe4e0] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              value={roleModal.newRole}
              onChange={(e) => handleRoleSelectChange(e.target.value)}
            >
              <option value="Manager">Manager (Điều phối dự án &amp; Báo giá)</option>
              <option value="Member">Member (Thực thi Task &amp; Timesheet)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-[#dfe4e0] bg-[#f8faf8] p-3.5">
            <span className="text-xs font-bold text-[#1d332a]">
              Ma trận quyền hạn đi kèm (Hệ thống sẽ quét xung đột khi lưu):
            </span>
            {PERMISSION_OPTIONS.map((perm) => (
              <label key={perm.key} className="flex cursor-pointer items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#10231b]">
                  <input
                    type="checkbox"
                    checked={roleModal.permissions.includes(perm.key)}
                    onChange={() => togglePermissionCheckbox(perm.key)}
                  />
                  {perm.label}
                </span>
                <span className="rounded bg-[#e9f1ec] px-2 py-0.5 text-[10px] font-semibold text-[#154734]">
                  {perm.group}
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#1d332a]">Lý do điều chỉnh Role</label>
            <input
              type="text"
              placeholder="VD: Thăng tiến lên Quản lý dự án / Điều chuyển bộ phận"
              className="rounded-xl border border-[#dfe4e0] px-3.5 py-2.5 text-sm outline-none focus:border-[#154734]"
              value={roleModal.reason}
              onChange={(e) => setRoleModal((prev) => ({ ...prev, reason: e.target.value }))}
              required
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className={btnOutlineSm} onClick={closeModal}>
              Hủy
            </button>
            <button type="submit" className={btnPrimarySm} disabled={roleModal.submitting}>
              {roleModal.submitting ? 'Đang quét xung đột...' : 'Xác nhận cập nhật Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
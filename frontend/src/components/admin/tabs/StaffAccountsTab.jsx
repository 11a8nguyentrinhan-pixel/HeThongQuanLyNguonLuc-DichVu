import { useState } from 'react';
import {
  cardClass,
  btnPrimarySm,
  btnOutlineSm,
  STATUS_BADGE_MAP,
} from '../adminConfig';

export default function StaffAccountsTab({
  staffList = [],
  loadingStaff = false,
  setIsInviteOpen,
  handleResendInvite,
  handleCancelInvite,
  openUpdateRoleModal,
  openLockOrRestoreModal,
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredStaff = staffList.filter((s) =>
    statusFilter === 'ALL' ? true : s.status === statusFilter
  );

  return (
    <div className={cardClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">Danh sách nhân sự nội bộ</h3>
          <p className="mt-0.5 text-xs text-[#6b7c74]">
            Khóa tài khoản thu hồi phiên ngay nhưng bảo toàn toàn bộ lịch sử Task và Dự án cũ.
          </p>
        </div>
        <button className={btnPrimarySm} onClick={() => setIsInviteOpen(true)}>
          + Mời nhân sự mới
        </button>
      </div>

      {/* Thanh lọc trạng thái tài khoản */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: `Tất cả (${staffList.length})` },
          {
            key: 'Active',
            label: `Active (${staffList.filter((s) => s.status === 'Active').length})`,
          },
          {
            key: 'Chờ kích hoạt',
            label: `Chờ kích hoạt (${staffList.filter((s) => s.status === 'Chờ kích hoạt').length})`,
          },
          {
            key: 'Đã khóa',
            label: `Đã khóa (${staffList.filter((s) => s.status === 'Đã khóa').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
              statusFilter === tab.key
                ? 'bg-[#154734] text-white'
                : 'bg-[#f1f4f2] text-[#4f6159] hover:bg-[#e4eae6]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#e4e8e5] bg-[#f9faf8] text-[11px] uppercase tracking-wider text-[#6b7c74]">
              <th className='px-3.5 py-3'>Mã nhân viên</th>
              <th className="px-3.5 py-3">Họ và tên</th>
              <th className="px-3.5 py-3">Email</th>
              <th className="px-3.5 py-3">Số điện thoại</th>
              <th className="px-3.5 py-3">Vai trò</th>
              <th className="px-3.5 py-3">Trạng thái</th>
              <th className="px-3.5 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ef]">
            {loadingStaff ? (
              <tr>
                <td colSpan={6} className="px-3.5 py-6 text-center text-[#6b7c74]">
                  Đang tải danh sách nhân sự...
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3.5 py-6 text-center text-[#6b7c74]">
                  Không có nhân sự nào ở trạng thái này.
                </td>
              </tr>
            ) : (
              filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-[#fafbf9]">
                  <td className="px-3.5 py-3.5 font-bold text-[#10231b]">{s.id}</td>
                  <td className="px-3.5 py-3.5 font-bold text-[#10231b]">{s.full_name}</td>
                  <td className="px-3.5 py-3.5">{s.email}</td>
                  <td className="px-3.5 py-3.5">{s.phone}</td>
                  <td className="px-3.5 py-3.5">
                    <span className="rounded-md bg-[#e9f1ec] px-2.5 py-1 font-bold text-[#154734]">
                      {s.role}
                    </span>
                  </td>

                  {/* Cột Trạng thái */}
                  <td className="px-3.5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        STATUS_BADGE_MAP[s.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  {/* Cột Thao tác */}
                  <td className="px-3.5 py-3.5">
                    {s.status === 'Chờ kích hoạt' ? (
                      <div className="flex gap-2">
                        <button className={btnOutlineSm} onClick={() => handleResendInvite(s)}>
                          Gửi lại mail
                        </button>
                        <button
                          className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          onClick={() => handleCancelInvite(s)}
                        >
                          Hủy mời
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {s.status === 'Active' && (
                          <button className={btnOutlineSm} onClick={() => openUpdateRoleModal(s)}>
                            Đổi Role
                          </button>
                        )}
                        <button className={btnOutlineSm} onClick={() => openLockOrRestoreModal(s)}>
                          {s.status === 'Đã khóa' ? 'Khôi phục' : 'Khóa TK'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NoriSidebarLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M5.5 18.5L11.2 6.5L16.5 18.5"
      stroke="#113325"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="17.8" cy="7.2" r="2" fill="#113325" />
  </svg>
);

export default function DashboardLayout({
  portalLabel = 'WORKSPACE',
  workspaceName = 'Nori Studio',
  breadcrumb,
  menuItems = [],
  activeMenu,
  onSelectMenu,
  subtitleTag,
  title,
  description,
  primaryActionText,
  onPrimaryAction,
  searchPlaceholder = 'Tìm dự án, yêu cầu, công việc...',
  children,
}) {
  const { user, logout } = useAuth();

  useEffect(() => {
    document.title = `${breadcrumb || 'Tổng quan'} · Nori ${
      portalLabel === 'CLIENT PORTAL' ? 'Client Portal' : 'Workspace'
    }`;
  }, [breadcrumb, portalLabel]);

  const getInitials = (name = 'NR') =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(-2)
      .toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-[#f6f6f2] text-[#10231b]">
      {/* SIDEBAR TRÁI — Cố định chiều rộng 260px (w-65) */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto bg-[#0f2b20] px-4 py-6 text-[#e6efe9]">
        <div>
          {/* Logo Nori */}
          <div className="mb-5 flex items-center gap-3 px-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ccf378] shadow">
              <NoriSidebarLogo />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-widest text-white">NORI</div>
              <div className="text-[10px] font-semibold tracking-wider text-[#8eb0a0]">
                {portalLabel}
              </div>
            </div>
          </div>

          {/* Thẻ Workspace */}
          <div className="mb-5 rounded-xl border border-white/10 bg-white/6 px-3 py-2.5">
            <span className="mb-1 block text-[11px] text-[#8eb0a0]">
              {portalLabel === 'CLIENT PORTAL' ? 'Cổng khách hàng' : 'Không gian làm việc'}
            </span>
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-white">
              <span>{workspaceName}</span>
              <span className="rounded-full bg-[#ccf378]/15 px-2 py-0.5 text-[10.5px] font-bold text-[#ccf378]">
                {user?.role || 'User'}
              </span>
            </div>
          </div>

          {/* Danh sách Menu phân hệ */}
          <div className="mx-2 mb-2 text-[11px] font-bold tracking-wider text-[#7c9b8d]">
            PHÂN HỆ CHỨC NĂNG
          </div>
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = activeMenu ? activeMenu === item.key : item.active;
              return (
                <li
                  key={item.key || item.label}
                  onClick={() => onSelectMenu && onSelectMenu(item.key || item.label)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs transition ${
                    isActive
                      ? 'bg-[#1a4b38] font-bold text-[#ccf378]'
                      : 'text-[#c5d6ce] hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="rounded-full bg-[#ccf378]/20 px-2 py-0.5 text-[11px] font-bold text-[#ccf378]">
                      {item.badge}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Menu dưới cùng */}
        <div className="border-t border-white/10 pt-3">
          <div className="mx-2 mb-2 text-[11px] font-bold tracking-wider text-[#7c9b8d]">
            TÀI KHOẢN
          </div>
          <ul className="flex flex-col gap-1">
            <li
              onClick={() => onSelectMenu && onSelectMenu('profile')}
              className={`cursor-pointer rounded-xl px-3 py-2.5 text-xs transition ${
                activeMenu === 'profile'
                  ? 'bg-[#1a4b38] font-bold text-[#ccf378]'
                  : 'text-[#c5d6ce] hover:bg-white/8 hover:text-white'
              }`}
            >
              Hồ sơ cá nhân
            </li>
            <li
              onClick={logout}
              className="cursor-pointer rounded-xl px-3 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/15 hover:text-red-200"
            >
              Đăng xuất
            </li>
          </ul>
        </div>
      </aside>

      {/* KHUNG CHÍNH BÊN PHẢI */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between gap-4 border-b border-[#e5e9e6] bg-white px-8">
          <div className="text-xs text-[#6b7c74]">
            Nori {portalLabel === 'CLIENT PORTAL' ? 'Client Portal' : 'Workspace'} &nbsp;/&nbsp;
            <strong className="text-[#10231b]">{breadcrumb}</strong>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="hidden h-9 w-64 rounded-xl border border-[#dfe4e0] bg-[#f8f9f7] px-3.5 text-xs outline-none transition focus:border-[#154734] md:block"
            />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#154734] text-xs font-bold text-[#ccf378]">
                {getInitials(user?.full_name)}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-[#10231b]">{user?.full_name || 'Người dùng'}</div>
                <div className="text-[11px] text-[#6b7c74]">{user?.email || user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Vùng nội dung Dashboard */}
        <main className="flex-1 p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-bold tracking-widest text-[#154734]">
                {subtitleTag}
              </div>
              <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-[#10231b]">
                {title}
              </h1>
              <p className="text-sm text-[#64746d]">{description}</p>
            </div>

            {primaryActionText && (
              <button
                onClick={onPrimaryAction}
                className="cursor-pointer rounded-xl bg-[#154734] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0f3728]"
              >
                {primaryActionText}
              </button>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
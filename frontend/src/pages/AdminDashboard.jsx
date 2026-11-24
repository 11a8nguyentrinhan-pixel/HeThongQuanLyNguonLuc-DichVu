import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProfilePanel from '../components/ProfilePanel';
import { useAuth } from '../context/AuthContext';

import { getAdminMenu, TAB_META } from '../components/admin/adminConfig';
import { useAdminAuditLogs } from '../hooks/useAdminAuditLogs';
import { useAdminStaff } from '../hooks/useAdminStaff';

import AdminOverviewTab from '../components/admin/tabs/AdminOverviewTab';
import StaffAccountsTab from '../components/admin/tabs/StaffAccountsTab';
import ServiceCatalogsTab from '../components/admin/tabs/ServiceCatalogsTab';
import PaymentReconcileTab from '../components/admin/tabs/PaymentReconcileTab';
import AuditLogsTab from '../components/admin/tabs/AuditLogsTab';

import InviteStaffModal from '../components/admin/modals/InviteStaffModal';
import AccountActionModal from '../components/admin/modals/AccountActionModal';
import UpdateRoleModal from '../components/admin/modals/UpdateRoleModal';

export function AdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState({ text: '', type: '' });

  const { auditLogs, fetchAuditLogs } = useAdminAuditLogs(token);

  const staff = useAdminStaff({
    token,
    setNotice,
    setActiveTab,
    fetchAuditLogs,
  });

  useEffect(() => {
    staff.fetchStaffList();
    fetchAuditLogs();
  }, [staff.fetchStaffList, fetchAuditLogs]);

  const menu = getAdminMenu({ staffCount: staff.staffList.length });
  const currentMeta = TAB_META[activeTab] || TAB_META.overview;

  return (
    <DashboardLayout
      portalLabel="WORKSPACE"
      workspaceName="Nori Admin Console"
      breadcrumb={currentMeta.breadcrumb}
      menuItems={menu}
      activeMenu={activeTab}
      onSelectMenu={setActiveTab}
      subtitleTag={currentMeta.tag}
      title={currentMeta.title}
      description={currentMeta.desc}
      primaryActionText="+ Mời nhân sự"
      onPrimaryAction={() => staff.setIsInviteOpen(true)}
      searchPlaceholder="Tìm tài khoản, mã giao dịch, nhật ký..."
    >
      {notice.text && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-xs font-medium ${
            notice.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {notice.text}
        </div>
      )}

      {activeTab === 'overview' && (
        <AdminOverviewTab setActiveTab={setActiveTab} staffList={staff.staffList} />
      )}

      {activeTab === 'accounts' && (
        <StaffAccountsTab
          staffList={staff.staffList}
          loadingStaff={staff.loadingStaff}
          setIsInviteOpen={staff.setIsInviteOpen}
          handleResendInvite={staff.handleResendInvite}
          handleCancelInvite={staff.handleCancelInvite}
          openUpdateRoleModal={staff.openUpdateRoleModal}
          openLockOrRestoreModal={staff.openLockOrRestoreModal}
        />
      )}

      {activeTab === 'catalogs' && <ServiceCatalogsTab />}

      {activeTab === 'reconcile' && <PaymentReconcileTab />}

      {activeTab === 'logs' && (
        <AuditLogsTab auditLogs={auditLogs} fetchAuditLogs={fetchAuditLogs} />
      )}

      {activeTab === 'profile' && <ProfilePanel user={user} />}

      <InviteStaffModal
        isInviteOpen={staff.isInviteOpen}
        setIsInviteOpen={staff.setIsInviteOpen}
        inviteForm={staff.inviteForm}
        setInviteForm={staff.setInviteForm}
        inviteLoading={staff.inviteLoading}
        handleInviteSubmit={staff.handleInviteSubmit}
      />

      <AccountActionModal
        accountActionModal={staff.accountActionModal}
        setAccountActionModal={staff.setAccountActionModal}
        handleConfirmAccountAction={staff.handleConfirmAccountAction}
      />

      <UpdateRoleModal
        roleModal={staff.roleModal}
        setRoleModal={staff.setRoleModal}
        handleRoleSelectChange={staff.handleRoleSelectChange}
        togglePermissionCheckbox={staff.togglePermissionCheckbox}
        handleConfirmUpdateRole={staff.handleConfirmUpdateRole}
      />
    </DashboardLayout>
  );
}
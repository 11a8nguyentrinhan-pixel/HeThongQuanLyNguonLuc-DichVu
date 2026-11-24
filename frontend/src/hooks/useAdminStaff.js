import { useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { ROLE_DEFAULT_PERMISSIONS } from '../components/admin/adminConfig';

const INITIAL_INVITE_FORM = {
  full_name: '',
  email: '',
  phone: '',
  role: 'Member',
  password: '',
};

export function useAdminStaff({ token, setNotice, setActiveTab, fetchAuditLogs }) {
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Modal Mời nhân sự
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState(INITIAL_INVITE_FORM);

  // Modal Khóa / Khôi phục tài khoản
  const [accountActionModal, setAccountActionModal] = useState({
    open: false,
    staff: null,
    action: 'lock',
    reason: '',
    isEligible: true,
    submitting: false,
  });

  // Modal Cập nhật Role
  const [roleModal, setRoleModal] = useState({
    open: false,
    staff: null,
    newRole: 'Member',
    reason: '',
    permissions: ROLE_DEFAULT_PERMISSIONS.Member,
    conflictMsg: '',
    submitting: false,
  });

  // 1. Lấy danh sách nhân sự
  const fetchStaffList = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const { ok, data } = await adminService.getStaffList(token);
      if (ok) {
        setStaffList(data.staff || []);
      } else {
        setNotice({
          text: data.message || 'Không thể tải danh sách nhân sự.',
          type: 'error',
        });
      }
    } catch (err) {
      setNotice({ text: `Lỗi: ${err.message}`, type: 'error' });
    } finally {
      setLoadingStaff(false);
    }
  }, [token, setNotice]);

  // 2. Mời nhân sự mới
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setNotice({ text: '', type: '' });

    try {
      const { ok, data } = await adminService.inviteStaff(token, inviteForm);
      if (!ok) {
        setNotice({
          text: data.message || 'Không thể tạo tài khoản nhân sự.',
          type: 'error',
        });
        return;
      }

      await fetchStaffList();
      setNotice({
        text: `${data.message} (Mật khẩu đăng nhập: ${inviteForm.password || 'Nori@123456'})`,
        type: 'success',
      });
      setInviteForm(INITIAL_INVITE_FORM);
      setIsInviteOpen(false);
      setActiveTab('accounts');
    } catch (err) {
      setNotice({ text: `Lỗi: ${err.message}`, type: 'error' });
    } finally {
      setInviteLoading(false);
    }
  };

  // 3. Gửi lại mail mời & Hủy lời mời
  const handleResendInvite = async (staff) => {
    try {
      const { ok, data } = await adminService.resendInvite(token, staff.id);
      setNotice({ text: data.message, type: ok ? 'success' : 'error' });
    } catch (err) {
      setNotice({ text: `Lỗi: ${err.message}`, type: 'error' });
    }
  };

  const handleCancelInvite = async (staff) => {
    if (!window.confirm(`Hủy lời mời và xóa bản ghi chờ kích hoạt của ${staff.full_name}?`)) return;
    try {
      const { ok, data } = await adminService.cancelInvite(token, staff.id);
      if (ok) await fetchStaffList();
      setNotice({ text: data.message, type: ok ? 'success' : 'error' });
    } catch (err) {
      setNotice({ text: `Lỗi: ${err.message}`, type: 'error' });
    }
  };

  // 4. Khóa / Khôi phục tài khoản
  const openLockOrRestoreModal = (staff) => {
    const isLocked = staff.status === 'Đã khóa';
    setAccountActionModal({
      open: true,
      staff,
      action: isLocked ? 'restore' : 'lock',
      reason: isLocked
        ? 'Nhân sự quay trở lại làm việc chính thức'
        : 'Nhân sự nghỉ việc / Chấm dứt hợp đồng (Offboarding)',
      isEligible: true,
      submitting: false,
    });
  };

  const handleConfirmAccountAction = async (e) => {
    e.preventDefault();
    const { staff, action, reason, isEligible } = accountActionModal;
    setAccountActionModal((prev) => ({ ...prev, submitting: true }));
    setNotice({ text: '', type: '' });

    try {
      const { ok, data } = await adminService.updateStaffStatus(token, staff.id, {
        action,
        reason,
        isEligible,
      });

      await fetchStaffList();
      await fetchAuditLogs();

      setNotice({ text: data.message, type: ok ? 'success' : 'error' });
      setAccountActionModal((prev) => ({ ...prev, open: false, submitting: false }));
    } catch (err) {
      setNotice({ text: `Lỗi kết nối máy chủ: ${err.message}`, type: 'error' });
      setAccountActionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // 5. Cập nhật Role & Quét xung đột phân quyền
  const openUpdateRoleModal = (staff) => {
    const defaultRole = staff.role === 'Manager' ? 'Member' : 'Manager';
    setRoleModal({
      open: true,
      staff,
      newRole: defaultRole,
      reason: '',
      permissions: ROLE_DEFAULT_PERMISSIONS[defaultRole],
      conflictMsg: '',
      submitting: false,
    });
  };

  const handleRoleSelectChange = (selectedRole) => {
    setRoleModal((prev) => ({
      ...prev,
      newRole: selectedRole,
      permissions: ROLE_DEFAULT_PERMISSIONS[selectedRole] || ROLE_DEFAULT_PERMISSIONS.Member,
      conflictMsg: '',
    }));
  };

  const togglePermissionCheckbox = (permKey) => {
    setRoleModal((prev) => {
      const exists = prev.permissions.includes(permKey);
      const updated = exists
        ? prev.permissions.filter((k) => k !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: updated, conflictMsg: '' };
    });
  };

  const handleConfirmUpdateRole = async (e) => {
    e.preventDefault();
    const { staff, newRole, reason, permissions } = roleModal;
    setRoleModal((prev) => ({ ...prev, submitting: true, conflictMsg: '' }));

    try {
      const { ok, data } = await adminService.updateStaffRole(token, staff.id, {
        newRole,
        reason,
        permissions,
      });

      if (!ok) {
        setRoleModal((prev) => ({
          ...prev,
          submitting: false,
          conflictMsg: data.message || 'Phát hiện xung đột phân quyền.',
        }));
        return;
      }

      await fetchStaffList();
      await fetchAuditLogs();
      setNotice({ text: data.message, type: 'success' });
      setRoleModal((prev) => ({ ...prev, open: false, submitting: false }));
    } catch (err) {
      setRoleModal((prev) => ({
        ...prev,
        submitting: false,
        conflictMsg: `Lỗi kết nối máy chủ: ${err.message}`,
      }));
    }
  };

  return {
    staffList,
    loadingStaff,
    fetchStaffList,
    isInviteOpen,
    setIsInviteOpen,
    inviteLoading,
    inviteForm,
    setInviteForm,
    handleInviteSubmit,
    handleResendInvite,
    handleCancelInvite,
    accountActionModal,
    setAccountActionModal,
    openLockOrRestoreModal,
    handleConfirmAccountAction,
    roleModal,
    setRoleModal,
    openUpdateRoleModal,
    handleRoleSelectChange,
    togglePermissionCheckbox,
    handleConfirmUpdateRole,
  };
}
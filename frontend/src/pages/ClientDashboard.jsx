import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProfilePanel from '../components/ProfilePanel';
import { useAuth } from '../context/AuthContext';

import {
  cardClass,
  btnPrimarySm,
  btnOutlineSm,
  getClientMenu,
  CLIENT_TAB_META,
} from '../components/client/clientConfig';
import { useClientRequests } from '../hooks/useClientRequests';

import ServiceCatalogTab from '../components/client/tabs/ServiceCatalogTab';
import MyRequestsTab from '../components/client/tabs/MyRequestsTab';
import CreateRequestModal from '../components/client/modals/CreateRequestModal';
import ClarifyRequestModal from '../components/client/modals/ClarifyRequestModal';

export function ClientDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState({ text: '', type: '' });

  const req = useClientRequests(token, setNotice);

  const clarifyList = req.requests.filter((r) => r.status === 'Chờ làm rõ');
  const pendingList = req.requests.filter((r) => r.status === 'Chờ xử lý');
  const approvedScopeList = req.requests.filter((r) => r.status === 'Đã chốt phạm vi');

  const menu = getClientMenu({
    catalogCount: req.catalogs.length,
    requestCount: req.requests.length,
  });
  const currentMeta = CLIENT_TAB_META[activeTab] || CLIENT_TAB_META.overview;

  const handleCreateAndSwitch = async (formData) => {
    const ok = await req.handleCreateSubmit(formData);
    if (ok) setActiveTab('requests');
  };

  return (
    <DashboardLayout
      portalLabel="CLIENT PORTAL"
      workspaceName="Cổng Khách Hàng"
      breadcrumb={currentMeta.breadcrumb}
      menuItems={menu}
      activeMenu={activeTab}
      onSelectMenu={setActiveTab}
      subtitleTag={currentMeta.tag}
      title={activeTab === 'overview' ? `Xin chào, ${user?.full_name || 'Khách hàng'}` : currentMeta.title}
      description={currentMeta.desc}
      onPrimaryAction={() => req.openCreateModal(null)}
      searchPlaceholder="Tìm gói dịch vụ, yêu cầu, báo giá..."
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
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cardClass}>
              <div className="text-xs font-semibold text-[#6b7c74]">Gói dịch vụ đang mở</div>
              <div className="mt-2 text-2xl font-extrabold text-[#10231b]">{req.catalogs.length}</div>
              <div className="mt-1 text-[11px] text-[#6b7c74]">Bảo toàn giá tại thời điểm đặt</div>
            </div>
            <div className={cardClass}>
              <div className="text-xs font-semibold text-[#6b7c74]">Đang chờ Manager xử lý</div>
              <div className="mt-2 text-2xl font-extrabold text-sky-700">{pendingList.length}</div>
              <div className="mt-1 text-[11px] text-[#6b7c74]">Hồ sơ đang thẩm định khả thi</div>
            </div>
            <div className={cardClass}>
              <div className="text-xs font-semibold text-[#6b7c74]">Cần bổ sung / Làm rõ</div>
              <div className="mt-2 text-2xl font-extrabold text-amber-700">{clarifyList.length}</div>
              <div className="mt-1 text-[11px] text-amber-700">Ưu tiên phản hồi sớm</div>
            </div>
            <div className={cardClass}>
              <div className="text-xs font-semibold text-[#6b7c74]">Đã chốt phạm vi</div>
              <div className="mt-2 text-2xl font-extrabold text-emerald-700">
                {approvedScopeList.length}
              </div>
              <div className="mt-1 text-[11px] text-[#6b7c74]">Đang chờ báo giá từ Manager</div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#10231b]">Việc cần bạn xử lý ngay</h3>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className={btnOutlineSm}
              >
                Xem tất cả yêu cầu →
              </button>
            </div>

            {clarifyList.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f7faf8] p-4">
                <p className="text-xs text-[#6b7c74]">
                  Hiện không có hồ sơ nào cần bổ sung. Bạn có thể khám phá danh mục dịch vụ hoặc gửi yêu cầu mới.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalogs')}
                  className={btnPrimarySm}
                >
                  Xem danh mục dịch vụ
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clarifyList.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#10231b]">
                        #REQ-{String(item.id).padStart(3, '0')} · {item.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-amber-900">
                        Manager phản hồi: {item.reject_reason || 'Cần bổ sung thông tin làm rõ.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => req.openClarifyModal(item)}
                      className={btnPrimarySm}
                    >
                      Bổ sung ngay →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'catalogs' && (
        <ServiceCatalogTab
          catalogs={req.catalogs}
          loading={req.loading}
          onSelectCatalog={(cat) => req.openCreateModal(cat)}
          onCreateCustom={() => req.openCreateModal(null)}
        />
      )}

      {activeTab === 'requests' && (
        <MyRequestsTab
          requests={req.requests}
          loading={req.loading}
          onCreateNew={() => req.openCreateModal(null)}
          onClarify={(item) => req.openClarifyModal(item)}
          onRefresh={req.fetchAll}
        />
      )}

      {['quotes', 'projects', 'payments', 'deliverables'].includes(activeTab) && (
        <div className={`${cardClass} text-xs text-[#6b7c74]`}>
          Phân hệ <strong>{currentMeta.breadcrumb}</strong> sẽ được kết nối sau khi hoàn tất luồng thẩm định &amp; lập báo giá của Manager.
        </div>
      )}

      {activeTab === 'profile' && <ProfilePanel user={user} />}

      <CreateRequestModal
        open={req.createModal.open}
        catalogs={req.catalogs}
        selectedCatalog={req.createModal.selectedCatalog}
        submitting={req.submitting}
        onClose={req.closeCreateModal}
        onSubmit={handleCreateAndSwitch}
      />

      <ClarifyRequestModal
        open={req.clarifyModal.open}
        request={req.clarifyModal.request}
        submitting={req.submitting}
        onClose={req.closeClarifyModal}
        onSubmit={req.handleClarifySubmit}
      />
    </DashboardLayout>
  );
}
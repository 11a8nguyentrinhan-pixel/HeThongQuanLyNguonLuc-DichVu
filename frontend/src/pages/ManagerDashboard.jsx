import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProfilePanel from '../components/ProfilePanel';
import { useAuth } from '../context/AuthContext';

import {
  cardClass,
  getManagerMenu,
  MANAGER_TAB_META,
} from '../components/manager/managerConfig';
import { useManagerRequests } from '../hooks/useManagerRequests';

import ManagerOverviewTab from '../components/manager/tabs/ManagerOverviewTab';
import ServiceRequestsTab from '../components/manager/tabs/ServiceRequestsTab';
import ReviewRequestModal from '../components/manager/modals/ReviewRequestModal';

import { useManagerQuotesContracts } from '../hooks/useManagerQuotesContracts';
import QuotesContractsTab from '../components/manager/tabs/QuotesContractsTab';
import CreateQuoteModal from '../components/manager/modals/CreateQuoteModal';
import CreateContractModal from '../components/manager/modals/CreateContractModal';

export function ManagerDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState({ text: '', type: '' });

  const req = useManagerRequests(token, setNotice);

  const menu = getManagerMenu({ pendingRequests: req.stats.pending });
  const currentMeta = MANAGER_TAB_META[activeTab] || MANAGER_TAB_META.overview;
  const currentManagerId = user?.id || user?.user_id;

  const qc = useManagerQuotesContracts(token, setNotice);

  const handleReviewAndRefreshAll = async (requestId, payload) => {
    const ok = await req.handleReviewSubmit(requestId, payload);
    if (ok && payload.action === 'approve_scope') {
      await qc.fetchQuoteContractData();
    }
    return ok;
  };

  return (
    <DashboardLayout
      portalLabel="WORKSPACE"
      workspaceName="Nori Manager Workspace"
      breadcrumb={currentMeta.breadcrumb}
      menuItems={menu}
      activeMenu={activeTab}
      onSelectMenu={setActiveTab}
      subtitleTag={currentMeta.tag}
      title={
        activeTab === 'overview'
          ? `Xin chào, ${user?.full_name || 'Manager'}`
          : currentMeta.title
      }
      description={currentMeta.desc}
      primaryActionText={activeTab === 'overview' ? 'Mở tiếp nhận yêu cầu' : 'Làm mới dữ liệu'}
      onPrimaryAction={() =>
        activeTab === 'overview' ? setActiveTab('requests') : req.fetchRequests()
      }
      searchPlaceholder="Tìm hồ sơ yêu cầu, khách hàng, dự án..."
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
        <ManagerOverviewTab
          stats={req.stats}
          requests={req.requests}
          onOpenRequestsTab={() => setActiveTab('requests')}
          onReviewRequest={(item) => {
            setActiveTab('requests');
            req.openReviewModal(item);
          }}
        />
      )}

      {activeTab === 'requests' && (
        <ServiceRequestsTab
          requests={req.filteredRequests}
          loading={req.loading}
          submitting={req.submitting}
          currentManagerId={currentManagerId}
          statusFilter={req.statusFilter}
          setStatusFilter={req.setStatusFilter}
          typeFilter={req.typeFilter}
          setTypeFilter={req.setTypeFilter}
          searchTerm={req.searchTerm}
          setSearchTerm={req.setSearchTerm}
          onClaim={req.handleClaim}
          onOpenReview={req.openReviewModal}
          onRefresh={req.fetchRequests}
        />
      )}
      {activeTab === 'quotes' && (
        <QuotesContractsTab
          readyRequests={qc.readyRequests}
          quotations={qc.quotations}
          contracts={qc.contracts}
          loading={qc.loading}
          submitting={qc.submitting}
          onCreateQuote={qc.openCreateQuoteModal}
          onCreateNewVersion={qc.openNewVersionModal}
          onUpdateQuoteStatus={qc.handleUpdateQuoteStatus}
          onDraftContract={qc.openContractModal}
          onSendContract={qc.handleSendContract}
          onRefresh={qc.fetchQuoteContractData}
        />
      )}
      {['projects', 'monitor', 'qa'].includes(activeTab) && (
        <div className={`${cardClass} text-xs text-[#6b7c74]`}>
          Phân hệ <strong>{currentMeta.breadcrumb}</strong> sẽ được triển khai ở bước tiếp theo.
        </div>
      )}

      <ReviewRequestModal
        open={req.reviewModal.open}
        request={req.reviewModal.request}
        submitting={req.submitting}
        onClose={req.closeReviewModal}
        onSubmit={handleReviewAndRefreshAll}
      />

      <CreateQuoteModal
        open={qc.quoteModal.open}
        mode={qc.quoteModal.mode}
        requestItem={qc.quoteModal.requestItem}
        baseQuote={qc.quoteModal.baseQuote}
        submitting={qc.submitting}
        onClose={qc.closeQuoteModal}
        onSubmit={qc.handleSaveQuote}
      />

      <CreateContractModal
        open={qc.contractModal.open}
        quote={qc.contractModal.quote}
        submitting={qc.submitting}
        onClose={qc.closeContractModal}
        onSubmit={qc.handleSaveContract}
      />
    </DashboardLayout>
  );
}
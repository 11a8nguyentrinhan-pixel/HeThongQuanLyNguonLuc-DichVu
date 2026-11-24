import {cardClass, btnOutlineSm } from '../adminConfig';

export default function AuditLogsTab({ auditLogs = [], fetchAuditLogs }) {
    return(
        <div className={cardClass}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Nhật ký kiểm toán (dbo.system_logs)</h3>
              <p className="mt-0.5 text-xs text-[#6b7c74]">
                Tự động lưu vết thao tác Khóa/Khôi phục tài khoản, phân quyền và sao lưu dữ liệu.
              </p>
            </div>
            <button className={btnOutlineSm} onClick={fetchAuditLogs}>
              Tải lại nhật ký
            </button>
          </div>
          <div className="divide-y divide-[#eef1ef]">
            {auditLogs.length === 0 ? (
              <p className="py-4 text-xs text-[#6b7c74]">Chưa có bản ghi nhật ký nào trong system_logs.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-4 py-3.5">
                  <div>
                    <strong className="block text-sm text-[#10231b]">{log.action_detail}</strong>
                    <p className="mt-1 text-xs text-[#64746d]">
                      IP: {log.ip_address || '127.0.0.1'} · Thời gian:{' '}
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eef6f2] px-2.5 py-1 text-xs font-semibold text-[#154734]">
                    {log.log_category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
    );
}
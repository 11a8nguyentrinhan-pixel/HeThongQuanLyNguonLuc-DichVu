const { sql, connectDB } = require('../config/db');

const getCurrentUserId = (user) => {
  const raw = user?.id ?? user?.user_id ?? user?.userId;
  return raw ? String(raw).trim() : null;
};

/* =========================================================================
   A. API DÀNH CHO CLIENT (GIỮ NGUYÊN)
   ========================================================================= */
// 1. Lấy danh sách gói dịch vụ gốc đang hoạt động
const getActiveCatalogs = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT id, service_name, description, base_price, contract_template, status, updated_at
      FROM dbo.[service_catalogs]
      WHERE status IN (N'Đang hoạt động', N'Active') OR status IS NULL
      ORDER BY id ASC
    `);
    return res.status(200).json({ catalogs: result.recordset });
  } catch (error) {
    console.error('Lỗi tải danh mục dịch vụ:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi tải danh mục dịch vụ: ${error.message}`,
    });
  }
};

// 2. Client gửi yêu cầu dịch vụ mới (gói có sẵn khóa cứng snapshot_price hoặc Custom)
const createServiceRequest = async (req, res) => {
  try {
    console.log('--- DEBUG UPLOAD ---');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    const clientId = getCurrentUserId(req.user);
    if (!clientId) {
      return res.status(401).json({
        message: 'Không xác định được mã tài khoản Client. Vui lòng đăng xuất và đăng nhập lại.',
      });
    }

    const title = (req.body.title || '').trim();
    const scopeDescription = (req.body.scope_description || '').trim();
    const serviceId = req.body.service_id ? Number(req.body.service_id) : null;

    const attachmentUrl = req.file
      ? `/uploads/requests/${req.file.filename}`
      : (req.body.attachment_url || '').trim() || null;

    if (!title || !scopeDescription) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ tiêu đề và mô tả chi tiết phạm vi yêu cầu.',
      });
    }

    const pool = await connectDB();
    let snapshotPrice = null;

    if (serviceId) {
      const catalogRes = await pool
        .request()
        .input('service_id', sql.Int, serviceId)
        .query(`
          SELECT id, base_price, status
          FROM dbo.[service_catalogs]
          WHERE id = @service_id
        `);

      if (catalogRes.recordset.length === 0) {
        return res.status(404).json({ message: 'Gói dịch vụ được chọn không tồn tại.' });
      }

      const catalog = catalogRes.recordset[0];
      if (catalog.status && !['Đang hoạt động', 'Active'].includes(catalog.status)) {
        return res.status(400).json({ message: 'Gói dịch vụ này hiện đã ngưng cung cấp.' });
      }
      snapshotPrice = catalog.base_price;
    }

    const insertRes = await pool
      .request()
      .input('client_id', sql.VarChar(20), clientId)
      .input('service_id', sql.Int, serviceId)
      .input('title', sql.NVarChar(255), title)
      .input('scope_description', sql.NVarChar(sql.MAX), scopeDescription)
      .input('attachment_url', sql.NVarChar(500), attachmentUrl)
      .input('snapshot_price', sql.Decimal(18, 2), snapshotPrice)
      .input('status', sql.NVarChar(50), 'Chờ xử lý')
      .query(`
        INSERT INTO dbo.[service_requests]
          (client_id, service_id, title, scope_description, attachment_url, snapshot_price, status, created_at)
        VALUES
          (@client_id, @service_id, @title, @scope_description, @attachment_url, @snapshot_price, @status, GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
      `);

    return res.status(201).json({
      message: 'Gửi yêu cầu dịch vụ thành công! Hồ sơ đã được chuyển tới Manager thẩm định.',
      requestId: insertRes.recordset[0]?.id,
    });
  } catch (error) {
    console.error('Lỗi gửi yêu cầu dịch vụ:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi gửi yêu cầu dịch vụ: ${error.message}`,
    });
  }
};

// 3. Client xem lịch sử yêu cầu dịch vụ của chính mình
const getMyServiceRequests = async (req, res) => {
  try {
    const clientId = getCurrentUserId(req.user);
    if (!clientId) {
      return res.status(401).json({
        message: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
      });
    }

    const pool = await connectDB();
    const result = await pool
      .request()
      .input('client_id', sql.VarChar(20), clientId)
      .query(`
        SELECT
          sr.id,
          sr.client_id,
          sr.manager_id,
          sr.service_id,
          sc.service_name,
          sr.title,
          sr.scope_description,
          sr.attachment_url,
          sr.snapshot_price,
          sr.reject_reason,
          sr.status,
          sr.created_at,
          m.full_name AS manager_name
        FROM dbo.[service_requests] sr
        LEFT JOIN dbo.[service_catalogs] sc ON sr.service_id = sc.id
        LEFT JOIN dbo.[users] m ON sr.manager_id = m.id
        WHERE sr.client_id = @client_id
        ORDER BY sr.created_at DESC, sr.id DESC
      `);

    return res.status(200).json({ requests: result.recordset });
  } catch (error) {
    console.error('Lỗi tải danh sách yêu cầu của Client:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi tải lịch sử yêu cầu: ${error.message}`,
    });
  }
};

// 4. Client bổ sung thông tin / tài liệu khi hồ sơ ở trạng thái "Chờ làm rõ"
const clarifyServiceRequest = async (req, res) => {
  try {
    const clientId = getCurrentUserId(req.user);
    const requestId = Number(req.params.id);
    const title = (req.body.title || '').trim();
    const scopeDescription = (req.body.scope_description || '').trim();

    if (!title || !scopeDescription) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung bổ sung làm rõ phạm vi.',
      });
    }

    const pool = await connectDB();
    const existingRes = await pool
      .request()
      .input('id', sql.Int, requestId)
      .input('client_id', sql.VarChar(20), clientId)
      .query(`
        SELECT id, status, attachment_url
        FROM dbo.[service_requests]
        WHERE id = @id AND client_id = @client_id
      `);

    if (existingRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ yêu cầu này.' });
    }

    const existing = existingRes.recordset[0];
    if (existing.status !== 'Chờ làm rõ') {
      return res.status(400).json({
        message: 'Chỉ có thể cập nhật bổ sung khi hồ sơ đang ở trạng thái "Chờ làm rõ".',
      });
    }

    const newAttachmentUrl = req.file
      ? `/uploads/requests/${req.file.filename}`
      : (req.body.attachment_url || '').trim() || existing.attachment_url;

    await pool
      .request()
      .input('id', sql.Int, requestId)
      .input('title', sql.NVarChar(255), title)
      .input('scope_description', sql.NVarChar(sql.MAX), scopeDescription)
      .input('attachment_url', sql.NVarChar(500), newAttachmentUrl)
      .query(`
        UPDATE dbo.[service_requests]
        SET
          title = @title,
          scope_description = @scope_description,
          attachment_url = @attachment_url,
          status = N'Chờ xử lý'
        WHERE id = @id
      `);

    return res.status(200).json({
      message: 'Đã cập nhật thông tin bổ sung và gửi lại cho Manager thẩm định!',
    });
  } catch (error) {
    console.error('Lỗi cập nhật làm rõ yêu cầu:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi cập nhật yêu cầu: ${error.message}`,
    });
  }
};

/* =========================================================================
   2. API DÀNH CHO MANAGER (TIẾP NHẬN, THẨM ĐỊNH & CHỐT PHẠM VI)
   ========================================================================= */

// 5. Manager tra cứu toàn bộ hồ sơ yêu cầu dịch vụ từ Client Portal
const getAllServiceRequestsForManager = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT
        sr.id,
        sr.client_id,
        sr.manager_id,
        sr.service_id,
        sr.title,
        sr.scope_description,
        sr.attachment_url,
        sr.snapshot_price,
        sr.reject_reason,
        sr.status,
        sr.created_at,
        c.full_name AS client_name,
        c.email AS client_email,
        c.phone AS client_phone,
        m.full_name AS manager_name,
        sc.service_name,
        sc.base_price AS current_catalog_price,
        sc.status AS catalog_status
      FROM dbo.[service_requests] sr
      INNER JOIN dbo.[users] c ON sr.client_id = c.id
      LEFT JOIN dbo.[users] m ON sr.manager_id = m.id
      LEFT JOIN dbo.[service_catalogs] sc ON sr.service_id = sc.id
      ORDER BY
        CASE sr.status
          WHEN N'Chờ xử lý' THEN 1
          WHEN N'Chờ làm rõ' THEN 2
          WHEN N'Đã chốt phạm vi' THEN 3
          ELSE 4
        END,
        sr.created_at DESC,
        sr.id DESC
    `);

    return res.status(200).json({ requests: result.recordset });
  } catch (error) {
    console.error('Lỗi tải danh sách yêu cầu cho Manager:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi tải danh sách yêu cầu: ${error.message}`,
    });
  }
};

// 6. Manager nhận phụ trách thụ lý một hồ sơ yêu cầu
const claimServiceRequest = async (req, res) => {
  try {
    const managerId = getCurrentUserId(req.user);
    const requestId = Number(req.params.id);

    if (!managerId) {
      return res.status(401).json({ message: 'Không xác định được mã tài khoản Manager.' });
    }

    const pool = await connectDB();
    const existingRes = await pool
      .request()
      .input('id', sql.Int, requestId)
      .query(`SELECT id, manager_id, status FROM dbo.[service_requests] WHERE id = @id`);

    if (existingRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ yêu cầu này.' });
    }

    const item = existingRes.recordset[0];
    if (['Đã chốt phạm vi', 'Từ chối'].includes(item.status)) {
      return res.status(400).json({
        message: 'Hồ sơ này đã hoàn tất thẩm định, không thể thay đổi người thụ lý.',
      });
    }

    await pool
      .request()
      .input('id', sql.Int, requestId)
      .input('manager_id', sql.VarChar(20), managerId)
      .query(`
        UPDATE dbo.[service_requests]
        SET manager_id = @manager_id
        WHERE id = @id
      `);

    return res.status(200).json({
      message: 'Đã nhận phụ trách thẩm định hồ sơ yêu cầu này.',
    });
  } catch (error) {
    console.error('Lỗi nhận thụ lý yêu cầu:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi nhận thụ lý: ${error.message}`,
    });
  }
};

// 7. Manager ra quyết định thẩm định: clarify (Chờ làm rõ) | reject (Từ chối) | approve_scope (Đã chốt phạm vi)
const reviewServiceRequest = async (req, res) => {
  try {
    const managerId = getCurrentUserId(req.user);
    const requestId = Number(req.params.id);
    const { action, reject_reason, scope_description } = req.body;

    if (!managerId) {
      return res.status(401).json({ message: 'Không xác định được mã tài khoản Manager.' });
    }

    if (!['clarify', 'reject', 'approve_scope'].includes(action)) {
      return res.status(400).json({ message: 'Hành động thẩm định không hợp lệ.' });
    }

    const pool = await connectDB();
    const existingRes = await pool
      .request()
      .input('id', sql.Int, requestId)
      .query(`
        SELECT id, status, scope_description
        FROM dbo.[service_requests]
        WHERE id = @id
      `);

    if (existingRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ yêu cầu này.' });
    }

    const current = existingRes.recordset[0];
    if (['Đã chốt phạm vi', 'Từ chối'].includes(current.status)) {
      return res.status(400).json({
        message: `Hồ sơ đang ở trạng thái "${current.status}", không thể thẩm định lại.`,
      });
    }

    const reasonText = (reject_reason || '').trim();
    const finalizedScope = (scope_description || '').trim() || current.scope_description;

    if ((action === 'clarify' || action === 'reject') && !reasonText) {
      return res.status(400).json({
        message:
          action === 'clarify'
            ? 'Vui lòng nhập cụ thể các thông tin/tài liệu cần Client bổ sung làm rõ.'
            : 'Vui lòng nhập lý do từ chối minh bạch để phản hồi cho Client.',
      });
    }

    if (action === 'approve_scope' && !finalizedScope) {
      return res.status(400).json({
        message: 'Vui lòng xác nhận nội dung mô tả phạm vi trước khi chốt.',
      });
    }

    let nextStatus = 'Chờ làm rõ';
    let nextReason = reasonText;
    let successMessage = '';

    if (action === 'clarify') {
      nextStatus = 'Chờ làm rõ';
      successMessage =
        'Đã gửi yêu cầu bổ sung thông tin cho Client. Hồ sơ chuyển sang trạng thái "Chờ làm rõ".';
    } else if (action === 'reject') {
      nextStatus = 'Từ chối';
      successMessage = 'Đã từ chối hồ sơ yêu cầu dịch vụ và gửi lý do phản hồi cho Client.';
    } else if (action === 'approve_scope') {
      nextStatus = 'Đã chốt phạm vi';
      nextReason = null;
      successMessage =
        'Đã chốt phạm vi thành công (bao gồm quy định tối đa 3 lần sửa miễn phí). Hồ sơ sẵn sàng lập báo giá!';
    }

    await pool
      .request()
      .input('id', sql.Int, requestId)
      .input('manager_id', sql.VarChar(20), managerId)
      .input('status', sql.NVarChar(50), nextStatus)
      .input('reject_reason', sql.NVarChar(sql.MAX), nextReason)
      .input('scope_description', sql.NVarChar(sql.MAX), finalizedScope)
      .query(`
        UPDATE dbo.[service_requests]
        SET
          manager_id = @manager_id,
          status = @status,
          reject_reason = @reject_reason,
          scope_description = @scope_description
        WHERE id = @id
      `);

    return res.status(200).json({ message: successMessage, status: nextStatus });
  } catch (error) {
    console.error('Lỗi thẩm định yêu cầu dịch vụ:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi thẩm định yêu cầu: ${error.message}`,
    });
  }
};

module.exports = {
  getActiveCatalogs,
  createServiceRequest,
  getMyServiceRequests,
  clarifyServiceRequest,
  getAllServiceRequestsForManager,
  claimServiceRequest,
  reviewServiceRequest,
};
const { sql, connectDB } = require('../config/db');

const getCurrentUserId = (user) => {
  const raw = user?.id ?? user?.user_id ?? user?.userId;
  return raw ? String(raw).trim() : null;
};

const safeParseItems = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// 1. Tải toàn bộ dữ liệu cho tab Báo giá & Hợp đồng của Manager
const getManagerQuoteContractData = async (req, res) => {
  try {
    const pool = await connectDB();

    // A. Hồ sơ đã chốt phạm vi (sẵn sàng lập báo giá)
    const readyRequestsRes = await pool.request().query(`
      SELECT
        sr.id,
        sr.client_id,
        sr.manager_id,
        sr.service_id,
        sr.title,
        sr.scope_description,
        sr.snapshot_price,
        sr.status,
        CONVERT(VARCHAR(19), sr.created_at, 126) + '+07:00' AS created_at,
        c.full_name AS client_name,
        c.email AS client_email,
        c.phone AS client_phone,
        sc.service_name,
        sc.contract_template,
        (SELECT COUNT(*) FROM dbo.[quotations] q WHERE q.request_id = sr.id) AS quote_count
      FROM dbo.[service_requests] sr
      INNER JOIN dbo.[users] c ON sr.client_id = c.id
      LEFT JOIN dbo.[service_catalogs] sc ON sr.service_id = sc.id
      WHERE sr.status = N'Đã chốt phạm vi'
      ORDER BY sr.id DESC
    `);

    // B. Toàn bộ các phiên bản báo giá (mới nhất lên trước)
    const quotesRes = await pool.request().query(`
      SELECT
        q.id,
        q.request_id,
        q.version_number,
        q.quote_type,
        q.items_detail,
        q.tax_amount,
        q.total_amount,
        q.payment_terms,
        CONVERT(VARCHAR(10), q.valid_until, 23) AS valid_until,
        q.status,
        CONVERT(VARCHAR(19), q.created_at, 126) + '+07:00' AS created_at,
        q.created_by,
        sr.title AS request_title,
        sr.client_id,
        sr.scope_description,
        c.full_name AS client_name,
        c.email AS client_email,
        c.phone AS client_phone,
        sc.service_name,
        sc.contract_template,
        u.full_name AS creator_name,
        (SELECT TOP 1 ct.id FROM dbo.[contracts] ct WHERE ct.quote_id = q.id) AS contract_id
      FROM dbo.[quotations] q
      INNER JOIN dbo.[service_requests] sr ON q.request_id = sr.id
      INNER JOIN dbo.[users] c ON sr.client_id = c.id
      LEFT JOIN dbo.[service_catalogs] sc ON sr.service_id = sc.id
      LEFT JOIN dbo.[users] u ON q.created_by = u.id
      ORDER BY q.request_id DESC, q.version_number DESC, q.id DESC
    `);

    // C. Toàn bộ hợp đồng đã soạn thảo / trình ký
    const contractsRes = await pool.request().query(`
      SELECT
        ct.id,
        ct.contract_code,
        ct.quote_id,
        ct.legal_info,
        ct.total_value,
        ct.payment_stages,
        ct.max_free_revisions,
        ct.cancel_policy,
        ct.contract_file_url,
        CASE WHEN ct.signed_date IS NOT NULL
          THEN CONVERT(VARCHAR(19), ct.signed_date, 126) + '+07:00'
          ELSE NULL
        END AS signed_date,
        ct.status,
        ct.client_id,
        ct.manager_id,
        q.version_number,
        q.quote_type,
        sr.id AS request_id,
        sr.title AS request_title,
        c.full_name AS client_name,
        c.email AS client_email,
        m.full_name AS manager_name
      FROM dbo.[contracts] ct
      INNER JOIN dbo.[quotations] q ON ct.quote_id = q.id
      INNER JOIN dbo.[service_requests] sr ON q.request_id = sr.id
      INNER JOIN dbo.[users] c ON ct.client_id = c.id
      LEFT JOIN dbo.[users] m ON ct.manager_id = m.id
      ORDER BY ct.id DESC
    `);

    const quotations = quotesRes.recordset.map((q) => ({
      ...q,
      items_detail: safeParseItems(q.items_detail),
    }));

    return res.status(200).json({
      readyRequests: readyRequestsRes.recordset,
      quotations,
      contracts: contractsRes.recordset,
    });
  } catch (error) {
    console.error('Lỗi tải dữ liệu Báo giá & Hợp đồng:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi tải dữ liệu Báo giá & Hợp đồng: ${error.message}`,
    });
  }
};

// 2. Tạo báo giá mới (v1) HOẶC tạo phiên bản báo giá kế tiếp (version_number + 1, không ghi đè bản cũ)
const createQuotation = async (req, res) => {
  try {
    const managerId = getCurrentUserId(req.user);
    if (!managerId) {
      return res.status(401).json({ message: 'Không xác định được tài khoản Manager.' });
    }

    const requestId = Number(req.body.request_id);
    const quoteType = (req.body.quote_type || 'Báo giá chính').trim();
    const items = Array.isArray(req.body.items_detail) ? req.body.items_detail : [];
    const taxRate = Number(req.body.tax_rate ?? 0);
    const paymentTerms = (req.body.payment_terms || '').trim();
    const validUntil = (req.body.valid_until || '').trim();
    const targetStatus = req.body.status === 'Bản nháp' ? 'Bản nháp' : 'Đã gửi';

    if (!requestId) {
      return res.status(400).json({ message: 'Thiếu mã hồ sơ yêu cầu dịch vụ.' });
    }
    if (items.length === 0) {
      return res.status(400).json({ message: 'Vui lòng nhập ít nhất 1 hạng mục trong bảng báo giá.' });
    }
    if (!paymentTerms || !validUntil) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ điều kiện thanh toán và ngày hết hạn hiệu lực báo giá.',
      });
    }

    const normalizedItems = items
      .map((it) => ({
        name: String(it.name || '').trim(),
        scope: String(it.scope || '').trim(),
        quantity: Math.max(1, Number(it.quantity) || 1),
        unit_price: Math.max(0, Number(it.unit_price) || 0),
      }))
      .filter((it) => it.name);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: 'Tên hạng mục báo giá không được để trống.' });
    }

    const subtotal = normalizedItems.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
    const taxAmount = Math.round((subtotal * Math.max(0, taxRate)) / 100);
    const totalAmount = subtotal + taxAmount;

    const pool = await connectDB();

    // Kiểm tra hồ sơ yêu cầu đã chốt phạm vi chưa
    const reqCheck = await pool
      .request()
      .input('request_id', sql.Int, requestId)
      .query(`SELECT id, status FROM dbo.[service_requests] WHERE id = @request_id`);

    if (reqCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ yêu cầu dịch vụ.' });
    }
    if (reqCheck.recordset[0].status !== 'Đã chốt phạm vi') {
      return res.status(400).json({
        message: 'Chỉ được phép lập báo giá cho các hồ sơ đã ở trạng thái "Đã chốt phạm vi".',
      });
    }

    // Tự động tính version_number = MAX + 1 để bảo toàn toàn bộ lịch sử phiên bản cũ
    const verRes = await pool
      .request()
      .input('request_id', sql.Int, requestId)
      .query(`
        SELECT ISNULL(MAX(version_number), 0) AS max_ver
        FROM dbo.[quotations]
        WHERE request_id = @request_id
      `);
    const nextVersion = Number(verRes.recordset[0].max_ver) + 1;

    // Nếu tạo phiên bản mới (> 1) và gửi đi, không ghi đè dữ liệu bản cũ (chỉ lưu thêm bản ghi mới)
    const insertRes = await pool
      .request()
      .input('request_id', sql.Int, requestId)
      .input('version_number', sql.Int, nextVersion)
      .input('quote_type', sql.NVarChar(100), quoteType)
      .input('items_detail', sql.NVarChar(sql.MAX), JSON.stringify(normalizedItems))
      .input('tax_amount', sql.Decimal(18, 2), taxAmount)
      .input('total_amount', sql.Decimal(18, 2), totalAmount)
      .input('payment_terms', sql.NVarChar(sql.MAX), paymentTerms)
      .input('valid_until', sql.Date, validUntil)
      .input('status', sql.NVarChar(50), targetStatus)
      .input('created_by', sql.VarChar(20), managerId)
      .query(`
        INSERT INTO dbo.[quotations]
          (request_id, version_number, quote_type, items_detail, tax_amount, total_amount, payment_terms, valid_until, status, created_at, created_by)
        VALUES
          (@request_id, @version_number, @quote_type, @items_detail, @tax_amount, @total_amount, @payment_terms, @valid_until, @status, GETDATE(), @created_by);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    return res.status(201).json({
      message:
        nextVersion === 1
          ? `Đã tạo báo giá phiên bản v1 (${targetStatus}) thành công!`
          : `Đã khởi tạo phiên bản báo giá mới v${nextVersion} (giữ nguyên toàn bộ lịch sử các bản trước).`,
      quotationId: insertRes.recordset[0]?.id,
      version_number: nextVersion,
    });
  } catch (error) {
    console.error('Lỗi lập báo giá:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi lập báo giá: ${error.message}`,
    });
  }
};

// 3. Chuyển trạng thái báo giá (Gửi bản nháp -> Đã gửi, hoặc Đóng / Hết hạn báo giá)
const updateQuotationStatus = async (req, res) => {
  try {
    const quoteId = Number(req.params.id);
    const { status } = req.body;
    const allowed = ['Đã gửi', 'Từ chối / Đóng', 'Hết hạn'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái cập nhật không hợp lệ.' });
    }

    const pool = await connectDB();
    const checkRes = await pool
      .request()
      .input('id', sql.Int, quoteId)
      .query(`SELECT id, status FROM dbo.[quotations] WHERE id = @id`);

    if (checkRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản báo giá này.' });
    }

    const currentStatus = checkRes.recordset[0].status;
    if (currentStatus === 'Chấp nhận') {
      return res.status(400).json({
        message: 'Báo giá đã được Client chấp nhận, không thể thay đổi trạng thái.',
      });
    }

    await pool
      .request()
      .input('id', sql.Int, quoteId)
      .input('status', sql.NVarChar(50), status)
      .query(`UPDATE dbo.[quotations] SET status = @status WHERE id = @id`);

    return res.status(200).json({
      message:
        status === 'Đã gửi'
          ? 'Đã gửi bản báo giá tới Client Portal!'
          : `Đã cập nhật trạng thái báo giá sang "${status}".`,
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái báo giá:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi cập nhật trạng thái báo giá: ${error.message}`,
    });
  }
};

// 4. Soạn thảo hợp đồng pháp lý từ phiên bản báo giá đã được Client chấp nhận
const createContractFromQuote = async (req, res) => {
  try {
    const managerId = getCurrentUserId(req.user);
    if (!managerId) {
      return res.status(401).json({ message: 'Không xác định được tài khoản Manager.' });
    }

    const quoteId = Number(req.body.quote_id);
    const legalInfo = (req.body.legal_info || '').trim();
    const paymentStages = Number(req.body.payment_stages || 3);
    const maxFreeRevisions = Number(req.body.max_free_revisions ?? 3);
    const cancelPolicy = (req.body.cancel_policy || '').trim();
    const targetStatus = req.body.status === 'Bản thảo' ? 'Bản thảo' : 'Chờ duyệt';

    const contractFileUrl = req.file
      ? `/uploads/contracts/${req.uploadSubFolder}/${req.file.filename}`
      : (req.body.contract_file_url || '').trim() || null;

    if (!quoteId || !legalInfo || !cancelPolicy) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ thông tin pháp nhân hai bên và điều khoản nghiệm thu / hủy hoàn.',
      });
    }
    if (paymentStages < 1 || paymentStages > 3) {
      return res.status(400).json({
        message: 'Theo quy định hệ thống, lộ trình thanh toán chỉ được tối đa 3 đợt (1 đến 3 đợt).',
      });
    }
    if (maxFreeRevisions < 0 || maxFreeRevisions > 3) {
      return res.status(400).json({
        message: 'Số lần chỉnh sửa miễn phí tối đa theo chuẩn hệ thống không vượt quá 3 lần.',
      });
    }

    const pool = await connectDB();

    // Kiểm tra báo giá đã được chấp nhận và chưa có hợp đồng nào gắn kèm
    const quoteRes = await pool
      .request()
      .input('quote_id', sql.Int, quoteId)
      .query(`
        SELECT q.id, q.total_amount, q.status, sr.client_id
        FROM dbo.[quotations] q
        INNER JOIN dbo.[service_requests] sr ON q.request_id = sr.id
        WHERE q.id = @quote_id
      `);

    if (quoteRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiên bản báo giá này.' });
    }
    const quote = quoteRes.recordset[0];
    if (quote.status !== 'Chấp nhận') {
      return res.status(400).json({
        message: 'Chỉ được phép xuất bản hợp đồng từ phiên bản báo giá đã được Client "Chấp nhận".',
      });
    }

    const dupCheck = await pool
      .request()
      .input('quote_id', sql.Int, quoteId)
      .query(`SELECT id FROM dbo.[contracts] WHERE quote_id = @quote_id`);

    if (dupCheck.recordset.length > 0) {
      return res.status(400).json({ message: 'Phiên bản báo giá này đã được xuất bản hợp đồng rồi.' });
    }

    // Tự sinh mã hợp đồng duy nhất: HD-2026-001
    const year = new Date().getFullYear();
    const countRes = await pool.request().query(`SELECT COUNT(*) AS cnt FROM dbo.[contracts]`);
    const seq = String(Number(countRes.recordset[0].cnt) + 1).padStart(3, '0');
    const contractCode = (req.body.contract_code || '').trim() || `HD-${year}-${seq}`;

    const insertRes = await pool
      .request()
      .input('contract_code', sql.NVarChar(50), contractCode)
      .input('quote_id', sql.Int, quoteId)
      .input('legal_info', sql.NVarChar(sql.MAX), legalInfo)
      .input('total_value', sql.Decimal(18, 2), quote.total_amount)
      .input('payment_stages', sql.Int, paymentStages)
      .input('max_free_revisions', sql.Int, maxFreeRevisions)
      .input('cancel_policy', sql.NVarChar(sql.MAX), cancelPolicy)
      .input('contract_file_url', sql.NVarChar(500), contractFileUrl)
      .input('status', sql.NVarChar(50), targetStatus)
      .input('client_id', sql.VarChar(20), String(quote.client_id))
      .input('manager_id', sql.VarChar(20), managerId)
      .query(`
        INSERT INTO dbo.[contracts]
          (contract_code, quote_id, legal_info, total_value, payment_stages, max_free_revisions, cancel_policy, contract_file_url, status, client_id, manager_id)
        VALUES
          (@contract_code, @quote_id, @legal_info, @total_value, @payment_stages, @max_free_revisions, @cancel_policy, @contract_file_url, @status, @client_id, @manager_id);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    return res.status(201).json({
      message:
        targetStatus === 'Chờ duyệt'
          ? `Đã xuất bản hợp đồng ${contractCode} và gửi bản thảo trình Client ký kết!`
          : `Đã lưu bản thảo hợp đồng ${contractCode}.`,
      contractId: insertRes.recordset[0]?.id,
      contract_code: contractCode,
    });
  } catch (error) {
    console.error('Lỗi soạn hợp đồng:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi soạn hợp đồng: ${error.message}`,
    });
  }
};

// 5. Gửi bản thảo hợp đồng ('Bản thảo' -> 'Chờ duyệt') cho Client kiểm duyệt & ký điện tử
const sendContractToClient = async (req, res) => {
  try {
    const contractId = Number(req.params.id);
    const pool = await connectDB();

    const checkRes = await pool
      .request()
      .input('id', sql.Int, contractId)
      .query(`SELECT id, contract_code, status FROM dbo.[contracts] WHERE id = @id`);

    if (checkRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng này.' });
    }
    if (checkRes.recordset[0].status !== 'Bản thảo') {
      return res.status(400).json({ message: 'Chỉ có thể trình ký hợp đồng đang ở trạng thái "Bản thảo".' });
    }

    await pool
      .request()
      .input('id', sql.Int, contractId)
      .query(`UPDATE dbo.[contracts] SET status = N'Chờ duyệt' WHERE id = @id`);

    return res.status(200).json({
      message: `Đã gửi bản thảo hợp đồng ${checkRes.recordset[0].contract_code} tới Client Portal để kiểm duyệt và ký kết!`,
    });
  } catch (error) {
    console.error('Lỗi gửi hợp đồng cho Client:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi gửi hợp đồng: ${error.message}`,
    });
  }
};
// 6. Client tải danh sách Báo giá (đã gửi) & Hợp đồng (đã trình ký) của chính mình
const getClientQuoteContractData = async (req, res) => {
  try {
    const clientId = getCurrentUserId(req.user);
    if (!clientId) {
      return res.status(401).json({ message: 'Không xác định được tài khoản Client.' });
    }

    const pool = await connectDB();

    // Chỉ lấy báo giá Manager đã gửi đi (ẩn 'Bản nháp')
    const quotesRes = await pool
      .request()
      .input('client_id', sql.VarChar(20), clientId)
      .query(`
        SELECT
          q.id,
          q.request_id,
          q.version_number,
          q.quote_type,
          q.items_detail,
          q.tax_amount,
          q.total_amount,
          q.payment_terms,
          CONVERT(VARCHAR(10), q.valid_until, 23) AS valid_until,
          q.status,
          CONVERT(VARCHAR(19), q.created_at, 126) + '+07:00' AS created_at,
          sr.title AS request_title,
          sc.service_name,
          u.full_name AS manager_name,
          u.email AS manager_email,
          (SELECT TOP 1 ct.id FROM dbo.[contracts] ct WHERE ct.quote_id = q.id) AS contract_id
        FROM dbo.[quotations] q
        INNER JOIN dbo.[service_requests] sr ON q.request_id = sr.id
        LEFT JOIN dbo.[service_catalogs] sc ON sr.service_id = sc.id
        LEFT JOIN dbo.[users] u ON q.created_by = u.id
        WHERE sr.client_id = @client_id
          AND q.status <> N'Bản nháp'
        ORDER BY q.request_id DESC, q.version_number DESC, q.id DESC
      `);

    // Chỉ lấy hợp đồng đã được trình duyệt / ký kết (ẩn 'Bản thảo' nội bộ của Manager)
    const contractsRes = await pool
      .request()
      .input('client_id', sql.VarChar(20), clientId)
      .query(`
        SELECT
          ct.id,
          ct.contract_code,
          ct.quote_id,
          ct.legal_info,
          ct.total_value,
          ct.payment_stages,
          ct.max_free_revisions,
          ct.cancel_policy,
          ct.contract_file_url,
          CASE WHEN ct.signed_date IS NOT NULL
            THEN CONVERT(VARCHAR(19), ct.signed_date, 126) + '+07:00'
            ELSE NULL
          END AS signed_date,
          ct.status,
          q.version_number,
          q.quote_type,
          sr.id AS request_id,
          sr.title AS request_title,
          m.full_name AS manager_name,
          m.email AS manager_email
        FROM dbo.[contracts] ct
        INNER JOIN dbo.[quotations] q ON ct.quote_id = q.id
        INNER JOIN dbo.[service_requests] sr ON q.request_id = sr.id
        LEFT JOIN dbo.[users] m ON ct.manager_id = m.id
        WHERE ct.client_id = @client_id
          AND ct.status <> N'Bản thảo'
        ORDER BY ct.id DESC
      `);

    const quotations = quotesRes.recordset.map((q) => ({
      ...q,
      items_detail: safeParseItems(q.items_detail),
    }));

    return res.status(200).json({
      quotations,
      contracts: contractsRes.recordset,
    });
  } catch (error) {
    console.error('Lỗi tải Báo giá & Hợp đồng phía Client:', error);
    return res.status(500).json({
      message: `Lỗi máy chủ khi tải Báo giá & Hợp đồng: ${error.message}`,
    });
  }
};

// 7. Client phản hồi báo giá: accept (Đồng ý) | adjust (Cần điều chỉnh) | reject (Từ chối)
const respondToQuotation = async (req, res) => {
  try {
    const clientId = getCurrentUserId(req.user);
    const quoteId = Number(req.params.id);
    const { action } = req.body; // 'accept' | 'adjust' | 'reject'

    const actionStatusMap = {
      accept: 'Chấp nhận',
      adjust: 'Cần điều chỉnh',
      reject: 'Từ chối / Đóng',
    };

    const nextStatus = actionStatusMap[action];
    if (!nextStatus) {
      return res.status(400).json({ message: 'Hành động phản hồi báo giá không hợp lệ.' });
    }

    const pool = await connectDB();
    const checkRes = await pool
      .request()
      .input('id', sql.Int, quoteId)
      .input('client_id', sql.VarChar(20), clientId)
      .query(`
        SELECT q.id, q.request_id, q.version_number, q.status,
               CONVERT(VARCHAR(10), q.valid_until, 23) AS valid_until
        FROM dbo.[quotations] q
        INNER JOIN dbo.[service_requests] sr ON q.request_id = sr.id
        WHERE q.id = @id AND sr.client_id = @client_id
      `);

    if (checkRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản báo giá thuộc tài khoản của bạn.' });
    }

    const quote = checkRes.recordset[0];
    if (quote.status !== 'Đã gửi') {
      return res.status(400).json({
        message: `Chỉ có thể phản hồi báo giá đang ở trạng thái "Đã gửi" (hiện tại: "${quote.status}").`,
      });
    }

    // Chặn duyệt nếu báo giá đã quá hạn hiệu lực
    if (action === 'accept' && quote.valid_until) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (quote.valid_until < todayStr) {
        await pool
          .request()
          .input('id', sql.Int, quoteId)
          .query(`UPDATE dbo.[quotations] SET status = N'Hết hạn' WHERE id = @id`);
        return res.status(400).json({
          message: 'Báo giá này đã quá hạn hiệu lực. Vui lòng liên hệ Manager tạo phiên bản báo giá mới.',
        });
      }
    }

    await pool
      .request()
      .input('id', sql.Int, quoteId)
      .input('status', sql.NVarChar(50), nextStatus)
      .query(`UPDATE dbo.[quotations] SET status = @status WHERE id = @id`);

    const msgMap = {
      accept: `Bạn đã chấp nhận báo giá v${quote.version_number}! Manager sẽ soạn và gửi bản thảo hợp đồng cho bạn.`,
      adjust: `Đã gửi yêu cầu điều chỉnh cho báo giá v${quote.version_number}. Manager sẽ tạo phiên bản báo giá mới.`,
      reject: `Bạn đã từ chối và đóng báo giá v${quote.version_number}.`,
    };

    return res.status(200).json({ message: msgMap[action] });
  } catch (error) {
    console.error('Lỗi phản hồi báo giá:', error);
    return res.status(500).json({ message: `Lỗi máy chủ khi phản hồi báo giá: ${error.message}` });
  }
};

// 8. Client kiểm duyệt & ký hợp đồng điện tử ('Chờ duyệt' -> 'Đã ký', lưu signed_date)
const signContractByClient = async (req, res) => {
  try {
    const clientId = getCurrentUserId(req.user);
    const contractId = Number(req.params.id);
    const { agreed } = req.body;

    if (!agreed) {
      return res.status(400).json({
        message: 'Vui lòng tích xác nhận đồng ý toàn bộ điều khoản pháp lý trước khi ký hợp đồng.',
      });
    }

    const pool = await connectDB();
    const checkRes = await pool
      .request()
      .input('id', sql.Int, contractId)
      .input('client_id', sql.VarChar(20), clientId)
      .query(`
        SELECT id, contract_code, status
        FROM dbo.[contracts]
        WHERE id = @id AND client_id = @client_id
      `);

    if (checkRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng thuộc tài khoản của bạn.' });
    }

    const contract = checkRes.recordset[0];
    if (contract.status !== 'Chờ duyệt') {
      return res.status(400).json({
        message: `Chỉ có thể ký hợp đồng ở trạng thái "Chờ duyệt" (hiện tại: "${contract.status}").`,
      });
    }

    await pool
      .request()
      .input('id', sql.Int, contractId)
      .query(`
        UPDATE dbo.[contracts]
        SET signed_date = GETDATE(),
            status = N'Đã ký'
        WHERE id = @id
      `);

    return res.status(200).json({
      message: `Ký kết hợp đồng ${contract.contract_code} thành công! Bạn có thể tiến hành thanh toán đặt cọc theo lộ trình cam kết.`,
    });
  } catch (error) {
    console.error('Lỗi ký hợp đồng điện tử:', error);
    return res.status(500).json({ message: `Lỗi máy chủ khi ký hợp đồng: ${error.message}` });
  }
};

module.exports = {
  getManagerQuoteContractData,
  createQuotation,
  updateQuotationStatus,
  createContractFromQuote,
  sendContractToClient,
  getClientQuoteContractData,
  respondToQuotation,
  signContractByClient,
};
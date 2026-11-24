const sql = require('mssql');

const ROLE_PREFIX_MAP = {
  Client: 'cl',
  Manager: 'mg',
  Member: 'mb',
  Admin: 'ad',
};

async function generateNextUserId(pool, roleName) {
  const prefix = ROLE_PREFIX_MAP[roleName] || 'us';

  const result = await pool
    .request()
    .input('prefixLike', sql.VarChar(20), `${prefix}%`)
    .query(`
      SELECT TOP 1 id
      FROM dbo.users
      WHERE id LIKE @prefixLike
      ORDER BY LEN(id) DESC, id DESC
    `);

  if (result.recordset.length === 0) {
    return `${prefix}01`;
  }

  const lastId = result.recordset[0].id; // VD: 'mb02'
  const num = parseInt(lastId.slice(prefix.length), 10) || 0;
  return `${prefix}${String(num + 1).padStart(2, '0')}`;
}

module.exports = { generateNextUserId };
const nodemailer = require('nodemailer');

const createTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};
//Gửi lời mời nhân sự
const sendStaffInvitationEmail = async ({ toEmail, fullName, role, activateUrl, tempPassword }) => {
    const transporter = createTransporter();

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e4e8e5; border-radius: 16px; overflow: hidden; background: #ffffff;">
            <div style="background: #0f2b20; padding: 24px 32px; color: #ffffff;">
                <span style="display: inline-block; background: #ccf378; color: #0f2b20; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-size: 13px; letter-spacing: 1px;">NORI WORKSPACE</span>
                <h2 style="margin: 14px 0 4px; font-size: 22px; color: #ffffff;">Lời mời tham gia không gian làm việc</h2>
                <p style="margin: 0; font-size: 13px; color: #a9c1b6;">Hệ thống Quản trị Nguồn lực và Dịch vụ</p>
            </div>
            <div style="padding: 28px 32px; color: #10231b; line-height: 1.6; font-size: 14px;">
                <p>Xin chào <strong>${fullName}</strong>,</p>
                <p>Quản trị viên (Admin) đã khởi tạo tài khoản nhân sự nội bộ cho bạn trên <strong>Nori Workspace</strong> với vai trò:</p>
                <div style="background: #f6faf7; border: 1px solid #d5e5da; border-radius: 12px; padding: 14px 18px; margin: 16px 0;">
                    <div><strong>Email đăng nhập:</strong> ${toEmail}</div>
                    <div><strong>Vai trò được cấp:</strong> <span style="color: #154734; font-weight: 700;">${role}</span></div>
                    ${tempPassword ? `<div><strong>Mật khẩu tạm thời:</strong> ${tempPassword}</div>` : ''}
                </div>
                <p>Vui lòng nhấn vào nút bên dưới để xác nhận kích hoạt tài khoản và thiết lập mật khẩu đăng nhập (liên kết có hiệu lực trong <strong>48 giờ</strong>):</p>
                <div style="text-align: center; margin: 26px 0;">
                    <a href="${activateUrl}" style="display: inline-block; background: #154734; color: #ffffff; text-decoration: none; font-weight: 700; padding: 13px 28px; border-radius: 10px; font-size: 14px;">
                        Kích hoạt tài khoản ngay →
                    </a>
                </div>
                <p style="font-size: 12px; color: #64746d;">Nếu nút trên không hoạt động, hãy sao chép đường dẫn sau vào trình duyệt:<br/>
                <a href="${activateUrl}" style="color: #154734; word-break: break-all;">${activateUrl}</a></p>
            </div>
            <div style="background: #f6f6f2; padding: 14px 32px; text-align: center; font-size: 12px; color: #7d8c85;">
                Email tự động từ Nori Workspace · Vui lòng không trả lời thư này.
            </div>
        </div>
    `;

    if (!transporter) {
        console.log('====================================================');
        console.log(`[CHƯA CẤU HÌNH SMTP] Email mời tới: ${toEmail} (${role})`);
        console.log(`Link kích hoạt: ${activateUrl}`);
        console.log('====================================================');
        return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
    }

    await transporter.sendMail({
        from: `"Nori Workspace" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `[Nori Workspace] Lời mời kích hoạt tài khoản ${role}`,
        html: htmlContent,
    });

    return { sent: true };
};

//Gửi Email OTP
const sendPasswordResetEmail = async ({ toEmail, fullName, resetCode }) => {
    const transporter = createTransporter();

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e4e8e5; border-radius: 16px; overflow: hidden; background: #ffffff;">
            <div style="background: #0f2b20; padding: 24px 32px; color: #ffffff;">
                <span style="display: inline-block; background: #ccf378; color: #0f2b20; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-size: 13px; letter-spacing: 1px;">NORI WORKSPACE</span>
                <h2 style="margin: 14px 0 4px; font-size: 22px; color: #ffffff;">Khôi phục mật khẩu tài khoản</h2>
                <p style="margin: 0; font-size: 13px; color: #a9c1b6;">Hệ thống Quản trị Nguồn lực và Dịch vụ</p>
            </div>
            <div style="padding: 28px 32px; color: #10231b; line-height: 1.6; font-size: 14px;">
                <p>Xin chào <strong>${fullName || 'bạn'}</strong>,</p>
                <p>Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong>. Vui lòng nhập mã xác nhận dưới đây để thiết lập mật khẩu mới:</p>
                <div style="background: #f6faf7; border: 1px dashed #154734; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
                    <span style="display: block; font-size: 12px; color: #64746d; margin-bottom: 6px;">MÃ XÁC NHẬN KHÔI PHỤC</span>
                    <strong style="font-size: 30px; letter-spacing: 6px; color: #154734;">${resetCode}</strong>
                </div>
                <p style="font-size: 13px; color: #4f6159;">Mã xác nhận này có hiệu lực trong vòng <strong>15 phút</strong>. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
            <div style="background: #f6f6f2; padding: 14px 32px; text-align: center; font-size: 12px; color: #7d8c85;">
                Email tự động từ Nori Workspace · Vui lòng không trả lời thư này.
            </div>
        </div>
    `;

    if (!transporter) {
        console.log(`[CHƯA CẤU HÌNH SMTP] Mã khôi phục mật khẩu của ${toEmail}: ${resetCode}`);
        return { sent: false };
    }

    await transporter.sendMail({
        from: `"Nori Workspace" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `[Nori Workspace] Mã xác nhận khôi phục mật khẩu: ${resetCode}`,
        html: htmlContent,
    });

    return { sent: true };
};
//Gửi mail thông báo đổi Role
const sendRoleUpdatedEmail = async ({ toEmail, fullName, oldRole, newRole, reason }) => {
    const transporter = createTransporter();

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e4e8e5; border-radius: 16px; overflow: hidden; background: #ffffff;">
            <div style="background: #0f2b20; padding: 24px 32px; color: #ffffff;">
                <span style="display: inline-block; background: #ccf378; color: #0f2b20; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-size: 13px; letter-spacing: 1px;">NORI WORKSPACE</span>
                <h2 style="margin: 14px 0 4px; font-size: 22px; color: #ffffff;">Thông báo cập nhật phân quyền (Role)</h2>
                <p style="margin: 0; font-size: 13px; color: #a9c1b6;">Hệ thống Quản trị Nguồn lực và Dịch vụ</p>
            </div>
            <div style="padding: 28px 32px; color: #10231b; line-height: 1.6; font-size: 14px;">
                <p>Xin chào <strong>${fullName}</strong>,</p>
                <p>Quản trị viên (Admin) vừa cập nhật vai trò truy cập của bạn trên không gian làm việc <strong>Nori Workspace</strong>:</p>
                <div style="background: #f6faf7; border: 1px solid #d5e5da; border-radius: 12px; padding: 14px 18px; margin: 16px 0;">
                    <div><strong>Vai trò cũ:</strong> ${oldRole}</div>
                    <div><strong>Vai trò mới:</strong> <span style="color: #154734; font-weight: 700;">${newRole}</span></div>
                    <div><strong>Lý do điều chỉnh:</strong> ${reason}</div>
                </div>
                <p style="font-size: 13px; color: #4f6159;">Vui lòng đăng nhập lại hệ thống để áp dụng không gian làm việc và quyền hạn mới.</p>
            </div>
            <div style="background: #f6f6f2; padding: 14px 32px; text-align: center; font-size: 12px; color: #7d8c85;">
                Email tự động từ Nori Workspace · Vui lòng không trả lời thư này.
            </div>
        </div>
    `;

    if (!transporter) {
        console.log(`[CHƯA CẤU HÌNH SMTP] Thông báo đổi Role (${oldRole} -> ${newRole}) tới ${toEmail}`);
        return { sent: false };
    }

    await transporter.sendMail({
        from: `"Nori Workspace" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `[Nori Workspace] Cập nhật vai trò mới: ${newRole}`,
        html: htmlContent,
    });

    return { sent: true };
};
module.exports = { sendStaffInvitationEmail, sendPasswordResetEmail, sendRoleUpdatedEmail };
const getEmailTemplate = (username, verificationCode) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #4CAF50; text-align: center;">Email Verification</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Thank you for registering with us! Please use the following code to verify your email address:</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 3px;">${verificationCode}</span>
            </div>
            <p style="color: #555;">⚠ This code is valid for <strong>5 hours</strong>. If you did not request this, please ignore this email.</p>
            <hr/>
            <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} APPNAME. All rights reserved.</p>
        </div>
    `;
}

const passwordResetTemplate = (username, verificationCode) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #4CAF50; text-align: center;">Password Reset</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>We received a request to reset your password. Please use the following code to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 3px;">${verificationCode}</span>
            </div>
            <p style="color: #555;">⚠ This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
            <hr/>
            <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} APPNAME. All rights reserved.</p>
        </div>
    `;
}

const invitationTemplate = (username, email, tempPassword, role) => {
    // Note: Replace "https://app-login-url.com" with actual frontend login URL
    const loginUrl = process.env.CORS_ORIGIN ? `${process.env.CORS_ORIGIN}/login` : "https://app-login-url.com";
    return `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #4CAF50; text-align: center;">You're Invited to Join as ${role}</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>You have been invited to join our platform as an ${role}. Here are your temporary login credentials:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${tempPassword}</p>
            <a href="${loginUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; text-decoration: none;">Login Now</a>
            <p>For security, please log in and change your password as soon as possible from your profile settings.</p>
            <hr/>
            <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} AR Model Viewer. All rights reserved.</p>
        </div>
    `;
}

export { getEmailTemplate, passwordResetTemplate, invitationTemplate };

using System.Net;
using System.Net.Mail;

namespace backend.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string toEmail, string verificationToken);
        Task SendPasswordResetOtpAsync(string toEmail, string otp);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendVerificationEmailAsync(string toEmail, string verificationToken)
        {
            var subject = "K&D - Verify Your Email Address";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                        <h2 style='color: #dc2626;'>Welcome to K&D Restaurant!</h2>
                        <p>Thank you for registering. Please verify your email address by using the code below:</p>
                        <div style='background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;'>
                            <h1 style='color: #dc2626; letter-spacing: 5px; margin: 0;'>{verificationToken}</h1>
                        </div>
                        <p>This code will expire in 24 hours.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                        <hr style='margin: 20px 0; border: none; border-top: 1px solid #ddd;' />
                        <p style='color: #6b7280; font-size: 12px;'>K&D Restaurant - Delicious meals delivered to your door</p>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordResetOtpAsync(string toEmail, string otp)
        {
            var subject = "K&D - Password Reset Request";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                        <h2 style='color: #dc2626;'>Password Reset Request</h2>
                        <p>You requested to reset your password. Use the OTP code below:</p>
                        <div style='background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;'>
                            <h1 style='color: #dc2626; letter-spacing: 5px; margin: 0;'>{otp}</h1>
                        </div>
                        <p>This OTP will expire in 15 minutes.</p>
                        <p>If you didn't request a password reset, please ignore this email or contact support.</p>
                        <hr style='margin: 20px 0; border: none; border-top: 1px solid #ddd;' />
                        <p style='color: #6b7280; font-size: 12px;'>K&D Restaurant - Delicious meals delivered to your door</p>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@kd-restaurant.com";
            var fromPassword = _configuration["Email:Password"] ?? "";
            var fromName = _configuration["Email:FromName"] ?? "K&D Restaurant";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(fromEmail, fromPassword)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
        }
    }
}

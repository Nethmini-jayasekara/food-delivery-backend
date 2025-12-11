using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthController(AppDbContext db, IConfiguration config, IEmailService emailService)
    {
        _db = db;
        _config = config;
        _emailService = emailService;
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // Check if user already exists
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already exists" });

        // Validate role if provided
        var role = string.IsNullOrEmpty(dto.Role) ? "User" : dto.Role;
        if (role != "User" && role != "Admin")
            return BadRequest(new { message = "Invalid role. Must be 'User' or 'Admin'" });

        // Generate 6-digit verification token
        var verificationToken = new Random().Next(100000, 999999).ToString();

        var user = new User
        {
            Email = dto.Email,
            FullName = dto.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            IsVerified = false,
            VerificationToken = verificationToken,
            VerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Send verification email
        try
        {
            await _emailService.SendVerificationEmailAsync(dto.Email, verificationToken);
        }
        catch (Exception ex)
        {
            // Log error but don't fail registration
            Console.WriteLine($"Failed to send verification email: {ex.Message}");
        }

        return Ok(new { 
            message = "User registered successfully. Please check your email for verification code.",
            email = dto.Email
        });
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });

        // Check if email is verified
        if (!user.IsVerified)
            return Unauthorized(new { message = "Please verify your email before logging in", requiresVerification = true });

        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:DurationMinutes"]!)),
            signingCredentials: creds
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            user = new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                role = user.Role
            }
        });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        if (user == null)
            return NotFound(new { message = "User not found" });

        if (user.IsVerified)
            return BadRequest(new { message = "Email already verified" });

        if (user.VerificationToken != dto.Token)
            return BadRequest(new { message = "Invalid verification code" });

        if (user.VerificationTokenExpiry < DateTime.UtcNow)
            return BadRequest(new { message = "Verification code expired" });

        user.IsVerified = true;
        user.VerificationToken = null;
        user.VerificationTokenExpiry = null;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Email verified successfully. You can now login." });
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        if (user == null)
            return NotFound(new { message = "User not found" });

        if (user.IsVerified)
            return BadRequest(new { message = "Email already verified" });

        // Generate new 6-digit verification token
        var verificationToken = new Random().Next(100000, 999999).ToString();
        user.VerificationToken = verificationToken;
        user.VerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        await _db.SaveChangesAsync();

        // Send verification email
        try
        {
            await _emailService.SendVerificationEmailAsync(dto.Email, verificationToken);
            return Ok(new { message = "Verification code sent to your email" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to send email. Please try again later." });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        if (user == null)
            // Don't reveal if email exists for security
            return Ok(new { message = "If the email exists, you will receive a password reset code" });

        // Generate 6-digit OTP
        var otp = new Random().Next(100000, 999999).ToString();

        var passwordReset = new PasswordReset
        {
            Email = dto.Email,
            Otp = otp,
            ExpirationTime = DateTime.UtcNow.AddMinutes(15),
            IsUsed = false
        };

        _db.PasswordResets.Add(passwordReset);
        await _db.SaveChangesAsync();

        // Send OTP email
        try
        {
            await _emailService.SendPasswordResetOtpAsync(dto.Email, otp);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send OTP email: {ex.Message}");
        }

        return Ok(new { message = "If the email exists, you will receive a password reset code" });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        var resetRequest = await _db.PasswordResets
            .Where(pr => pr.Email == dto.Email && pr.Otp == dto.Otp && !pr.IsUsed)
            .OrderByDescending(pr => pr.CreatedAt)
            .FirstOrDefaultAsync();

        if (resetRequest == null)
            return BadRequest(new { message = "Invalid OTP code" });

        if (resetRequest.ExpirationTime < DateTime.UtcNow)
            return BadRequest(new { message = "OTP code expired. Please request a new one." });

        return Ok(new { message = "OTP verified successfully", isValid = true });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var resetRequest = await _db.PasswordResets
            .Where(pr => pr.Email == dto.Email && pr.Otp == dto.Otp && !pr.IsUsed)
            .OrderByDescending(pr => pr.CreatedAt)
            .FirstOrDefaultAsync();

        if (resetRequest == null)
            return BadRequest(new { message = "Invalid OTP code" });

        if (resetRequest.ExpirationTime < DateTime.UtcNow)
            return BadRequest(new { message = "OTP code expired. Please request a new one." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
            return NotFound(new { message = "User not found" });

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        
        // Mark OTP as used
        resetRequest.IsUsed = true;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully. You can now login with your new password." });
    }
}

public record RegisterDto(string Email, string FullName, string Password, string? Role);
public record LoginDto(string Email, string Password);
public record VerifyEmailDto(string Email, string Token);
public record ResendVerificationDto(string Email);
public record ForgotPasswordDto(string Email);
public record VerifyOtpDto(string Email, string Otp);
public record ResetPasswordDto(string Email, string Otp, string NewPassword);
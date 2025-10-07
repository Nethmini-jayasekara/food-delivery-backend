using backend.Models;
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
    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var user = new User
        {
            Email = dto.Email,
            FullName = dto.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok();
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email ==dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password,
        user.PasswordHash)) return Unauthorized();
        var claims = new[] {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Email)
 };
        var key = new
        SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims: claims,
        expires:
        
       DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:DurationMinutes"]!)),
        signingCredentials: creds
        );
        return Ok(new
        {
            token = new
        JwtSecurityTokenHandler().WriteToken(token)
        });
    }
}
public record RegisterDto(string Email, string FullName, string Password);
public record LoginDto(string Email, string Password);
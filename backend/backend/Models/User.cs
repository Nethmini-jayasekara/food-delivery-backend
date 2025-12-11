namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!; 
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "User"; // "User" or "Admin"
        public bool IsVerified { get; set; } = false;
        public string? VerificationToken { get; set; }
        public DateTime? VerificationTokenExpiry { get; set; }
    }
}

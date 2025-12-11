namespace backend.Models
{
    public class PasswordReset
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public string Otp { get; set; } = null!;
        public DateTime ExpirationTime { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

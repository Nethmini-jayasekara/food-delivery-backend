namespace backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Preparing, On the Way, Delivered, Cancelled
        public int? UserId { get; set; }
        public User? User { get; set; }
        public List<OrderItem> Items { get; set; } = new();
    }
}

namespace backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public List<OrderItem> Items { get; set; } = new();
    }
}

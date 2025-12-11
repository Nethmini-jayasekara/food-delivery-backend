using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    // Get all users
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _db.Users
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FullName,
                u.Role
            })
            .ToListAsync();

        return Ok(users);
    }

    // Get all products
    [HttpGet("products")]
    public async Task<IActionResult> GetAllProducts()
    {
        var products = await _db.Products.ToListAsync();
        return Ok(products);
    }

    // Create product
    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] Product product)
    {
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return Ok(product);
    }

    // Update product
    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
    {
        var existingProduct = await _db.Products.FindAsync(id);
        if (existingProduct == null)
            return NotFound(new { message = "Product not found" });

        existingProduct.Name = product.Name;
        existingProduct.Description = product.Description;
        existingProduct.Price = product.Price;
        existingProduct.Category = product.Category;
        existingProduct.ImageUrl = product.ImageUrl;

        await _db.SaveChangesAsync();
        return Ok(existingProduct);
    }

    // Delete product
    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound(new { message = "Product not found" });

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Product deleted successfully" });
    }

    // Get all orders
    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.User)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                o.Id,
                o.OrderDate,
                o.Status,
                o.Total,
                User = o.User != null ? new
                {
                    o.User.FullName,
                    o.User.Email
                } : null,
                ItemCount = o.Items.Count
            })
            .ToListAsync();

        return Ok(orders);
    }

    // Update order status
    [HttpPatch("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null)
            return NotFound(new { message = "Order not found" });

        order.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Order status updated successfully", order });
    }

    // Get dashboard statistics
    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalProducts = await _db.Products.CountAsync();
        var totalOrders = await _db.Orders.CountAsync();
        var totalRevenue = await _db.Orders.SumAsync(o => (decimal?)o.Total) ?? 0;

        var pendingOrders = await _db.Orders.CountAsync(o => o.Status == "Pending");
        var completedOrders = await _db.Orders.CountAsync(o => o.Status == "Delivered");

        return Ok(new
        {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders
        });
    }

    // Promote user to admin
    [HttpPatch("users/{id}/promote")]
    public async Task<IActionResult> PromoteToAdmin(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        user.Role = "Admin";
        await _db.SaveChangesAsync();
        return Ok(new { message = "User promoted to admin successfully" });
    }
}

public record UpdateOrderStatusDto(string Status);

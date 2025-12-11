using Microsoft.AspNetCore.Mvc;
using backend.Models;
using BCrypt.Net;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly AppDbContext _db;
    public SeedController(AppDbContext db) { _db = db; }

    [HttpPost]
    public async Task<IActionResult> SeedDatabase()
    {
        // Check if already seeded
        if (_db.Products.Any() || _db.Users.Any())
        {
            return BadRequest(new { message = "Database already contains data. Clear it first if you want to reseed." });
        }

        // Seed Users
        var users = new[]
        {
            new User
            {
                Email = "admin@kd.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FullName = "K&D Admin",
                Role = "Admin",
                IsVerified = true
            },
            new User
            {
                Email = "user@kd.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "John Doe",
                Role = "User",
                IsVerified = true
            }
        };
        _db.Users.AddRange(users);
        await _db.SaveChangesAsync();

        // Seed Products
        var products = new[]
        {
            new Product
            {
                Name = "Classic Burger",
                Description = "Juicy beef patty with fresh vegetables and special sauce",
                Price = 12.99m,
                Category = "Burgers",
                ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
            },
            new Product
            {
                Name = "Cheese Pizza",
                Description = "Wood-fired pizza with mozzarella and tomato sauce",
                Price = 15.99m,
                Category = "Pizza",
                ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500"
            },
            new Product
            {
                Name = "Caesar Salad",
                Description = "Fresh romaine lettuce with Caesar dressing and croutons",
                Price = 9.99m,
                Category = "Salads",
                ImageUrl = "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500"
            },
            new Product
            {
                Name = "Grilled Chicken",
                Description = "Tender grilled chicken breast with herbs and spices",
                Price = 18.99m,
                Category = "Main Course",
                ImageUrl = "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500"
            },
            new Product
            {
                Name = "Chocolate Cake",
                Description = "Rich chocolate cake with creamy frosting",
                Price = 7.99m,
                Category = "Desserts",
                ImageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500"
            },
            new Product
            {
                Name = "Pasta Carbonara",
                Description = "Creamy pasta with bacon and parmesan cheese",
                Price = 14.99m,
                Category = "Pasta",
                ImageUrl = "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500"
            },
            new Product
            {
                Name = "French Fries",
                Description = "Crispy golden fries with sea salt",
                Price = 4.99m,
                Category = "Sides",
                ImageUrl = "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500"
            },
            new Product
            {
                Name = "Lemonade",
                Description = "Fresh squeezed lemonade with mint",
                Price = 3.99m,
                Category = "Beverages",
                ImageUrl = "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=500"
            },
            new Product
            {
                Name = "BBQ Wings",
                Description = "Spicy BBQ chicken wings with ranch dip",
                Price = 11.99m,
                Category = "Appetizers",
                ImageUrl = "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500"
            },
            new Product
            {
                Name = "Fish & Chips",
                Description = "Crispy battered fish with chips and tartar sauce",
                Price = 16.99m,
                Category = "Main Course",
                ImageUrl = "https://images.unsplash.com/photo-1579208570378-8c46c5d1e8f2?w=500"
            },
            new Product
            {
                Name = "Vegetable Stir Fry",
                Description = "Fresh vegetables wok-fried with soy sauce",
                Price = 13.99m,
                Category = "Vegetarian",
                ImageUrl = "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500"
            },
            new Product
            {
                Name = "Tiramisu",
                Description = "Classic Italian dessert with coffee and mascarpone",
                Price = 8.99m,
                Category = "Desserts",
                ImageUrl = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500"
            }
        };
        _db.Products.AddRange(products);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Database seeded successfully!",
            users = users.Length,
            products = products.Length,
            credentials = new
            {
                admin = new { email = "admin@kd.com", password = "admin123" },
                user = new { email = "user@kd.com", password = "user123" }
            }
        });
    }

    [HttpDelete]
    public async Task<IActionResult> ClearDatabase()
    {
        _db.OrderItems.RemoveRange(_db.OrderItems);
        _db.Orders.RemoveRange(_db.Orders);
        _db.Products.RemoveRange(_db.Products);
        _db.PasswordResets.RemoveRange(_db.PasswordResets);
        _db.Users.RemoveRange(_db.Users);
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Database cleared successfully!" });
    }
}

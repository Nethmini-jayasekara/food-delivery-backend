using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) { _db = db; }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Order order)
    {
        // Basic validation omitted for brevity
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var order = await _db.Orders.Include(o => o.Items).ThenInclude(i =>
        i.Product).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();
        return Ok(order);
    }
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _db.Orders.Include(o
    => o.Items).ToListAsync());
}
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FarmDirect__RestfullAPI.Models;
using FarmDirect__RestfullAPI.DTOs;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        public CartController(FarmDirectDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("GetAllCarts")]
        public IActionResult GetAllCarts()
        {
            var carts = _context.Carts.ToList();
            return Ok(carts);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetCart(int id)
        {
            var cart = _context.Carts.Find(id);
            if (cart == null)
            {
                return NotFound();
            }
            return Ok(cart);
        }

        [HttpPost]
        [Route("AddCart")]
        public IActionResult CreateCart([FromBody] CartCreateDto dto)
        {
            var cart = new Cart
            {
                ConsumerId = dto.ConsumerId,
                AddedAt = dto.AddedAt?? DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            _context.SaveChanges();
            return Ok(cart);
        }

        [HttpPost]
        [Route("AddMultipleCarts")]
        public IActionResult CreateMultipleCarts([FromBody] List<CartCreateDto> dtos)
        {
            var carts = new List<Cart>();
            foreach (var dto in dtos)
            {
                var cart = new Cart
                {
                    ConsumerId = dto.ConsumerId,
                    AddedAt = dto.AddedAt ?? DateTime.UtcNow
                };
                carts.Add(cart);
            }
            _context.Carts.AddRange(carts);
            _context.SaveChanges();
            return Ok(carts);
        }

        [HttpPut]
        [Route("UpdateCart/{id:int}")]
        public IActionResult UpdateCart(int id, [FromBody] CartCreateDto dto)
        {
            var cart = _context.Carts.Find(id);
            if (cart == null)
            {
                return NotFound();
            }
            cart.ConsumerId = dto.ConsumerId;
            cart.AddedAt = dto.AddedAt ?? cart.AddedAt;
            _context.SaveChanges();
            return Ok(cart);
        }


        [HttpDelete]
        [Route("DeleteCart/{id:int}")]
        public IActionResult DeleteCart(int id)
        {
            var cart = _context.Carts.Find(id);
            if (cart == null)
            {
                return NotFound();
            }
            _context.Carts.Remove(cart);
            _context.SaveChanges();
            return Ok();
        }

    }
}

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FarmDirect__RestfullAPI.Models;
using FarmDirect__RestfullAPI.DTOs;
using FluentValidation;
using FarmDirect__RestfullAPI.Validator;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        private readonly IValidator<CartCreateDto> _cartValidator;
        public CartController(FarmDirectDBContext context,IValidator<CartCreateDto> validator)
        {
            _context = context;
            _cartValidator = validator;
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
            var result = _cartValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }
            var cart = new Cart
            {
                ConsumerId = dto.ConsumerId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                AddedAt = dto.AddedAt ?? DateTime.UtcNow
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
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
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
            var result = _cartValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }
            cart.ConsumerId = dto.ConsumerId;
            cart.ProductId = dto.ProductId;
            cart.Quantity = dto.Quantity;
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

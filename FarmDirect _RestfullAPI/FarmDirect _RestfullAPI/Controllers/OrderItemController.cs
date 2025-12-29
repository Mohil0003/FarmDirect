using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FarmDirect__RestfullAPI.Models;
using FarmDirect__RestfullAPI.DTOs;
using FluentValidation;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderItemController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        private readonly IValidator<OrderItemCreateDto> _orderItemValidator;
        public OrderItemController(FarmDirectDBContext context,IValidator<OrderItemCreateDto> validator)
        {
            _context = context;
            _orderItemValidator = validator;
        }

        [HttpGet]
        [Route("GetAllOrderItems")]
        public IActionResult GetAllOrderItems()
        {
            var orderItems = _context.OrderItems.ToList();
            return Ok(orderItems);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetOrderItem(int id)
        {
            var orderItem = _context.OrderItems.Find(id);
            if (orderItem == null)
            {
                return NotFound();
            }
            return Ok(orderItem);
        }

        [HttpPost]
        [Route("AddOrderItem")]
        public IActionResult CreateOrderItem([FromBody] OrderItemCreateDto dto)
        {
            var result = _orderItemValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }
            var orderItem = new OrderItem
            {
                OrderId = dto.OrderId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice
            };
            _context.OrderItems.Add(orderItem);
            _context.SaveChanges();
            return Ok(orderItem);

        }

        [HttpPost]
        [Route("AddMultipleOrderItems")]
        public IActionResult CreateMultipleOrderItems([FromBody] List<OrderItemCreateDto> dtos)
        {
       

            var orderItems = new List<OrderItem>();
            foreach (var dto in dtos)
            {
                var orderItem = new OrderItem
                {
                    OrderId = dto.OrderId,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    UnitPrice = dto.UnitPrice
                };
                orderItems.Add(orderItem);
            }
            _context.OrderItems.AddRange(orderItems);
            _context.SaveChanges();
            return Ok(orderItems);
        }

        [HttpPut]
        [Route("UpdateOrderItem/{id:int}")]
        public IActionResult UpdateOrderItem(int id, [FromBody] OrderItemCreateDto dto)
        {
            
            var orderItem = _context.OrderItems.Find(id);
            if (orderItem == null)
            {
                return NotFound();
            }
            var result = _orderItemValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }
            orderItem.OrderId = dto.OrderId;
            orderItem.ProductId = dto.ProductId;
            orderItem.Quantity = dto.Quantity;
            orderItem.UnitPrice = dto.UnitPrice;
            _context.SaveChanges();
            return Ok(orderItem);
        }

        [HttpDelete]
        [Route("DeleteOrderItem/{id:int}")]
        public IActionResult DeleteOrderItem(int id)
        {
            var orderItem = _context.OrderItems.Find(id);
            if (orderItem == null)
            {
                return NotFound();
            }
            _context.OrderItems.Remove(orderItem);
            _context.SaveChanges();
            return NoContent();
        }


    }
}
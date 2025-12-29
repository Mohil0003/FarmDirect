using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FarmDirect__RestfullAPI.Models;
using FarmDirect__RestfullAPI.DTOs;
using FluentValidation;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        private readonly IValidator<OrderCreateDto> _orderValidator;
        public OrderController(FarmDirectDBContext context,IValidator<OrderCreateDto>validator)
        {
            _context = context;
            _orderValidator = validator;
        }


        [HttpGet]
        [Route("GetAllOrders")]
        public IActionResult GetAllOrders()
        {
            var orders = _context.Orders.ToList();
            return Ok(orders);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetOrder(int id)
        {
            var order = _context.Orders.Find(id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }

        [HttpPost]
        [Route("AddOrder")]
        public IActionResult PostOrder([FromBody] OrderCreateDto dto)
        {
            var result = _orderValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }
            var order = new Order
            {
                ConsumerId = dto.ConsumerId,
                OrderDate = dto.OrderDate ?? DateTime.UtcNow,
                TotalAmount = dto.TotalAmount,
                Status = dto.Status ?? "Pending",
                DeliveryAddress = dto.DeliveryAddress
            };
            _context.Orders.Add(order);
            _context.SaveChanges();
            return Ok(order);

        }

        [HttpPut]
        [Route("UpdateOrder/{id:int}")]
        public IActionResult UpdateOrder(int id, [FromBody] OrderCreateDto dto)
        {
            var order = _context.Orders.Find(id);
            if (order == null)
            {
                return NotFound();
            }
            var result = _orderValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }
            order.ConsumerId = dto.ConsumerId;
            order.OrderDate = dto.OrderDate ?? order.OrderDate;
            order.TotalAmount = dto.TotalAmount;
            order.Status = dto.Status ?? order.Status;
            order.DeliveryAddress = dto.DeliveryAddress;
            _context.SaveChanges();
            return Ok(order);
        }

        [HttpDelete]
        [Route("DeleteOrder/{id:int}")]
        public IActionResult DeleteOrder(int id)
        {
            var order = _context.Orders.Find(id);
            if (order == null)
            {
                return NotFound();
            }
            _context.Orders.Remove(order);
            _context.SaveChanges();
            return NoContent();
        }
    }
}

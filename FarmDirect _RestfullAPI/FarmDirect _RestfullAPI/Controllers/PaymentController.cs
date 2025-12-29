using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FarmDirect__RestfullAPI.Models;
using FarmDirect__RestfullAPI.DTOs;
using FluentValidation;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        private readonly IValidator<PaymentCreateDto> _paymentValidator;
        public PaymentController(FarmDirectDBContext context, IValidator<PaymentCreateDto> validator)
        {
            _context = context;
            _paymentValidator = validator;
        }
        [HttpGet]
        [Route("GetAllPayments")]
        public IActionResult GetAllPayments()
        {
            var payments = _context.Payments.ToList();
            return Ok(payments);
        }
        
        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetPayment(int id)
        {
            var payment = _context.Payments.Find(id);
            if (payment == null)
            {
                return NotFound();
            }
            return Ok(payment);
        }

        [HttpPost]
        [Route("AddPayment")]
        public IActionResult CreatePayment([FromBody] PaymentCreateDto dto)
        {
            var result = _paymentValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }

            var payment = new Payment
            {
              OrderId = dto.OrderId,
              PaymentDate = dto.PaymentDate ?? DateTime.UtcNow,
              Amount = dto.Amount,
              PaymentMethod = dto.PaymentMethod,
              Status = dto.Status ?? "Pending"
            };
            _context.Payments.Add(payment);
            _context.SaveChanges();
            return Ok(payment);
        }
        [HttpPut]
        [Route("UpdatePayment/{id:int}")]
        public IActionResult UpdatePayment(int id, [FromBody] PaymentCreateDto dto)
        {
            var payment = _context.Payments.Find(id);
            if (payment == null)
            {
                return NotFound();
            }
            var result = _paymentValidator.Validate(dto);
            if (!result.IsValid) {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }

            payment.OrderId = dto.OrderId;
            payment.PaymentDate = dto.PaymentDate ?? payment.PaymentDate;
            payment.Amount = dto.Amount;
            payment.PaymentMethod = dto.PaymentMethod;
            payment.Status = dto.Status ?? payment.Status;
            _context.Payments.Update(payment);
            _context.SaveChanges();
            return Ok(payment);
        }

        [HttpDelete]
        [Route("DeletePayment/{id:int}")]
        public IActionResult DeletePayment(int id)
        {
            var payment = _context.Payments.Find(id);
            if (payment == null)
            {
                return NotFound();
            }
            _context.Payments.Remove(payment);
            _context.SaveChanges();
            return Ok();
        }
    }
}

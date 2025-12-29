using FluentValidation;
using FarmDirect__RestfullAPI.DTOs;

namespace FarmDirect__RestfullAPI.Validator
{
    public class OderValidator:AbstractValidator<OrderCreateDto>
    {
        public OderValidator()
        {
            RuleFor(order => order.ConsumerId)
                .GreaterThan(0).WithMessage("Consumer ID must be greater than zero.");
            RuleFor(order => order.OrderDate)
                .LessThanOrEqualTo(DateTime.Now).WithMessage("Order date cannot be in the future.");
            RuleFor(order => order.TotalAmount)
                .GreaterThan(0).WithMessage("Total amount must be greater than zero.");
            RuleFor(order => order.Status)
                .NotEmpty().WithMessage("Order status is required.")
                .MaximumLength(20).WithMessage("Order status cannot exceed 20 characters.");
        }
    }
}

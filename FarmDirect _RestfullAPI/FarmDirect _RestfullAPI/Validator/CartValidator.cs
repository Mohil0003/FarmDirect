using FluentValidation;
using FarmDirect__RestfullAPI.DTOs;

namespace FarmDirect__RestfullAPI.Validator
{
    public class CartValidator:AbstractValidator<CartCreateDto>
    {
        public CartValidator()
        {
            RuleFor(cart => cart.ConsumerId)
                .GreaterThan(0).WithMessage("Consumer ID must be greater than zero.");
            RuleFor(cart=>cart.ProductId)
                .GreaterThan(0).WithMessage("Product ID must be greater than zero.");
            RuleFor(cart => cart.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");
            RuleFor(cart => cart.AddedAt)
                .LessThanOrEqualTo(DateTime.Now).WithMessage("Created date cannot be in the future.");
        }
    }
    
}

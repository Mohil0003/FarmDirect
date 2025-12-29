using FluentValidation;
using FarmDirect__RestfullAPI.DTOs;


namespace FarmDirect__RestfullAPI.Validator
{
    public class OrderItemValidator:AbstractValidator<OrderItemCreateDto>
    {
        public OrderItemValidator()
        {
            RuleFor(orderItem => orderItem.OrderId)
                .GreaterThan(0).WithMessage("Order ID must be greater than zero.");
            RuleFor(orderItem => orderItem.ProductId)
                .GreaterThan(0).WithMessage("Product ID must be greater than zero.");
            RuleFor(orderItem => orderItem.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");
            RuleFor(orderItem => orderItem.UnitPrice)
                .GreaterThan(0).WithMessage("Unit price must be greater than zero.");
        }
    }
}

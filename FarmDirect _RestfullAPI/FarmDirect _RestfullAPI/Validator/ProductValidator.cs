using FluentValidation;
using FarmDirect__RestfullAPI.DTOs;

namespace FarmDirect__RestfullAPI.Validator
{
    public class ProductValidator: AbstractValidator<ProductCreateDto>
    {
        public ProductValidator()
        {
            RuleFor(product => product.Name)
                .NotEmpty().WithMessage("Product name is required.")
                .Length(3, 100).WithMessage("Product name must be between 3 and 100 characters.");
            RuleFor(product => product.Description)
                .NotEmpty().WithMessage("Product description is required.")
                .MaximumLength(1000).WithMessage("Product description cannot exceed 1000 characters.");
            RuleFor(product => product.CurrentPrice)
                .GreaterThan(0).WithMessage("Product price must be greater than zero.");
            RuleFor(product => product.BasePrice)
                .GreaterThan(0).WithMessage("Product base price must be greater than zero.");
            RuleFor(product => product.StockQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("Product stock cannot be negative.");
        }
    }
    
}

using FluentValidation;
using FarmDirect__RestfullAPI.DTOs;


namespace FarmDirect__RestfullAPI.Validator
{
    public class CategoryValidator:AbstractValidator<CategoryCreateDto>
    {
        public CategoryValidator()
        {
            RuleFor(category => category.CategoryName)
                .NotEmpty().WithMessage("Category name is required.")
                .Length(3, 100).WithMessage("Category name must be between 3 and 100 characters.");
            RuleFor(category => category.Description)
                .MaximumLength(500).WithMessage("Category description cannot exceed 500 characters.");
        }
    }

}

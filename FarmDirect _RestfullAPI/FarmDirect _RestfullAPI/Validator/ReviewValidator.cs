using FluentValidation;
using FarmDirect__RestfullAPI.DTOs;

namespace FarmDirect__RestfullAPI.Validator
{
    public class ReviewValidator : AbstractValidator<ReviewCreateDto>
    {
        public ReviewValidator()
        {
            RuleFor(review => review.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");
            RuleFor(review => review.Comment)
                .NotEmpty().WithMessage("Comment is required.")
                .MaximumLength(500).WithMessage("Comment cannot exceed 500 characters.");

        }
    }
}

using FluentValidation;
using FarmDirect__RestfullAPI.DTOs;


namespace FarmDirect__RestfullAPI.Validator
{
    public class PaymentValidator:AbstractValidator<PaymentCreateDto>
    {
        public PaymentValidator()
        {
            RuleFor(payment => payment.Amount)
                .GreaterThan(0).WithMessage("Payment amount must be greater than zero.");
            RuleFor(payment => payment.PaymentMethod)
                .NotEmpty().WithMessage("Payment method is required.")
                .MaximumLength(50).WithMessage("Payment method cannot exceed 50 characters.");
            RuleFor(payment => payment.PaymentDate)
                .LessThanOrEqualTo(DateTime.Now).WithMessage("Payment date cannot be in the future.");
            RuleFor(payment => payment.Status)
                .MaximumLength(20).WithMessage("Payment status cannot exceed 20 characters.");
            RuleFor(payment => payment.TransactionId)
                .MaximumLength(100).WithMessage("Transaction ID cannot exceed 100 characters.");
        }
    }
  
}

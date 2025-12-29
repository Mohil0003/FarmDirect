namespace FarmDirect__RestfullAPI.DTOs
{
    public class PaymentCreateDto
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public DateTime? PaymentDate { get; set; }

        public string? Status { get; set; }

        public string? TransactionId { get; set; }

    }
}

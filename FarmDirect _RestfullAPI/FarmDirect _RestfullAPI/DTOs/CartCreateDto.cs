namespace FarmDirect__RestfullAPI.DTOs
{
    public class CartCreateDto
    {
        public int ConsumerId { get; set; }
        public int ProductId { get; set; }
        public decimal Quantity { get; set; }
        public DateTime? AddedAt { get; set; }
    }
}

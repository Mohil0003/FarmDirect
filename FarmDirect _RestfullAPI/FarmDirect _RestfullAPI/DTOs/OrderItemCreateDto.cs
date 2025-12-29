namespace FarmDirect__RestfullAPI.DTOs
{
    public class OrderItemCreateDto
    {
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}

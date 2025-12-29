using FarmDirect__RestfullAPI.Models;

namespace FarmDirect__RestfullAPI.DTOs
{
    public class OrderCreateDto
    {
        public int ConsumerId { get; set; }
        public DateTime? OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Status { get; set; }

        public string DeliveryAddress { get; set; } = null!;
 
    }
}

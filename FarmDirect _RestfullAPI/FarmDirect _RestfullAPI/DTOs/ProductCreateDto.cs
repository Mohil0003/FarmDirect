namespace FarmDirect__RestfullAPI.DTOs
{
    public class ProductCreateDto
    {
        public int FarmerId { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal StockQuantity { get; set; }
        public string Unit { get; set; } = null!;
        
        public DateTime HarvestDate { get; set; }
        public DateTime ExpiryDate { get; set; }

        public string? ImageUrl { get; set; }
    }
}

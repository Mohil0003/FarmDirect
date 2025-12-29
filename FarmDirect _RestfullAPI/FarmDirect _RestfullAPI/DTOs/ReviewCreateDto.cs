namespace FarmDirect__RestfullAPI.DTOs
{
    public class ReviewCreateDto
    {
        public int ProductId { get; set; }
        public int ConsumerId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}

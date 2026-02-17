using System.Collections.Generic;

namespace FarmDirect__RestfullAPI.DTOs;

public class FarmerStatsDto
{
    public int FarmerId { get; set; }
    public string FarmerName { get; set; } = null!;
    public int ProductCount { get; set; }
    public List<ProductStatDto> Products { get; set; } = new();
}

public class ProductStatDto
{
    public string ProductName { get; set; } = null!;
    public decimal StockQuantity { get; set; }
}

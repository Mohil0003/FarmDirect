using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FarmDirect__RestfullAPI.Models;

public partial class Product
{
    [Key]
    public int ProductId { get; set; }

    [ForeignKey("FarmerId")]
    [InverseProperty("Products")]
    public int FarmerId { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("Products")]
    public int CategoryId { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal BasePrice { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal CurrentPrice { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal StockQuantity { get; set; }

    [StringLength(20)]
    public string Unit { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime HarvestDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime ExpiryDate { get; set; }

    [StringLength(255)]
    public string? ImageUrl { get; set; }

    public bool? IsActive { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Product")]
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();


    public virtual Category Category { get; set; } = null!;


    public virtual User Farmer { get; set; } = null!;

    [InverseProperty("Product")]
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [InverseProperty("Product")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}

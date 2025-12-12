using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FarmDirect__RestfullAPI.Models;

[Table("Cart")]
public partial class Cart
{
    [Key]
    public int CartId { get; set; }

    public int ConsumerId { get; set; }

    public int ProductId { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Quantity { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? AddedAt { get; set; }

    [ForeignKey("ConsumerId")]
    [InverseProperty("Carts")]
    public virtual User Consumer { get; set; } = null!;

    [ForeignKey("ProductId")]
    [InverseProperty("Carts")]
    public virtual Product Product { get; set; } = null!;
}

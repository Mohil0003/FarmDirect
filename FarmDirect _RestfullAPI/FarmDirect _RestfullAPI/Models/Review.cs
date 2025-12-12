using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FarmDirect__RestfullAPI.Models;

public partial class Review
{
    [Key]
    public int ReviewId { get; set; }

    public int ConsumerId { get; set; }

    public int ProductId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("ConsumerId")]
    [InverseProperty("Reviews")]
    public virtual User Consumer { get; set; } = null!;

    [ForeignKey("ProductId")]
    [InverseProperty("Reviews")]
    public virtual Product Product { get; set; } = null!;
}

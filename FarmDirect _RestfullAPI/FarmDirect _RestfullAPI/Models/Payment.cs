using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FarmDirect__RestfullAPI.Models;

public partial class Payment
{
    [Key]
    public int PaymentId { get; set; }

    public int OrderId { get; set; }

    [StringLength(100)]
    public string? TransactionId { get; set; }

    [StringLength(20)]
    public string? PaymentMethod { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? PaymentDate { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("Payments")]
    public virtual Order Order { get; set; } = null!;
}

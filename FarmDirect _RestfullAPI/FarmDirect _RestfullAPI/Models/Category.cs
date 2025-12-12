using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FarmDirect__RestfullAPI.Models;

public partial class Category
{
    [Key]
    public int CategoryId { get; set; }

    [StringLength(50)]
    public string CategoryName { get; set; } = null!;

    [StringLength(255)]
    public string? Description { get; set; }

    [InverseProperty("Category")]
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}

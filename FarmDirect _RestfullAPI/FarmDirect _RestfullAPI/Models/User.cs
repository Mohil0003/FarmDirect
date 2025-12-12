using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FarmDirect__RestfullAPI.Models;

[Index("PhoneNumber", Name = "UQ__Users__85FB4E383ED57D70", IsUnique = true)]
[Index("Email", Name = "UQ__Users__A9D10534EDADE583", IsUnique = true)]
public partial class User
{
    [Key]
    public int UserId { get; set; }

    [StringLength(100)]
    public string FullName { get; set; } = null!;

    [StringLength(100)]
    public string Email { get; set; } = null!;

    [StringLength(255)]
    public string PasswordHash { get; set; } = null!;

    [StringLength(20)]
    public string Role { get; set; } = null!;

    [StringLength(15)]
    public string PhoneNumber { get; set; } = null!;

    public string? Address { get; set; }

    [Column(TypeName = "decimal(9, 6)")]
    public decimal? Latitude { get; set; }

    [Column(TypeName = "decimal(9, 6)")]
    public decimal? Longitude { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Consumer")]
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    [InverseProperty("Consumer")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [InverseProperty("Farmer")]
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    [InverseProperty("Consumer")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}

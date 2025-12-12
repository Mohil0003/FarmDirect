using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace FarmDirect__RestfullAPI.Models;

public partial class FarmDirectDBContext : DbContext
{
    public FarmDirectDBContext()
    {
    }

    public FarmDirectDBContext(DbContextOptions<FarmDirectDBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__AuditLog__5E548648D3E75E1B");

            entity.Property(e => e.Timestamp).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.CartId).HasName("PK__Cart__51BCD7B701DECC08");

            entity.Property(e => e.AddedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Consumer).WithMany(p => p.Carts).HasConstraintName("FK__Cart__ConsumerId__6754599E");

            entity.HasOne(d => d.Product).WithMany(p => p.Carts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Cart__ProductId__68487DD7");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A0B958FFEDE");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BCF609E412E");

            entity.Property(e => e.OrderDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasDefaultValue("Pending");

            entity.HasOne(d => d.Consumer).WithMany(p => p.Orders).HasConstraintName("FK__Orders__Consumer__6C190EBB");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId).HasName("PK__OrderIte__57ED0681FCAF305D");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems).HasConstraintName("FK__OrderItem__Order__71D1E811");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Produ__72C60C4A");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A38CC3D726B");

            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments).HasConstraintName("FK__Payments__OrderI__75A278F5");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6CD5D74803E");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Products__Catego__59FA5E80");

            entity.HasOne(d => d.Farmer).WithMany(p => p.Products).HasConstraintName("FK__Products__Farmer__59063A47");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Reviews__74BC79CE5FF9F9E1");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Consumer).WithMany(p => p.Reviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reviews__Consume__7A672E12");

            entity.HasOne(d => d.Product).WithMany(p => p.Reviews).HasConstraintName("FK__Reviews__Product__7B5B524B");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C8827DE7F");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

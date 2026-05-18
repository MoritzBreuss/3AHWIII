using Microsoft.EntityFrameworkCore;
using _2026_05_13_Hausuebung.Models;

namespace _2026_05_13_Hausuebung.Data;

public sealed class StravaContext : DbContext
{
    public DbSet<Athlet> Athleten => Set<Athlet>();

    public DbSet<Aktivitaet> Aktivitaeten => Set<Aktivitaet>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlite("Data Source=strava.db");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Athlet>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Name).IsRequired().HasMaxLength(100);
            entity.Property(a => a.Email).IsRequired().HasMaxLength(150);
            entity.HasMany(a => a.Aktivitaeten)
                .WithOne(a => a.Athlet)
                .HasForeignKey(a => a.AthletId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Aktivitaet>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Name).IsRequired().HasMaxLength(120);
            entity.Property(a => a.DistanzKm).HasPrecision(8, 2);
            entity.Property(a => a.DauerMinuten).IsRequired();
            entity.Property(a => a.Datum).IsRequired();
        });
    }
}
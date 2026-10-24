using Microsoft.EntityFrameworkCore;
using SYNC.Api.Entities;

namespace SYNC.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<ShiftAssignment> ShiftAssignments => Set<ShiftAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();
            
        modelBuilder.Entity<ShiftAssignment>()
            .HasIndex(sa => new { sa.ShiftId, sa.WorkerId })
            .IsUnique();
    }
}
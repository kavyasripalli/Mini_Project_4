using Healthcare.DoctorService.Entity;
using Microsoft.EntityFrameworkCore;

namespace Healthcare.DoctorService.Data
{
    public class DoctorDBContext:DbContext
    {
        public DoctorDBContext(DbContextOptions<DoctorDBContext> options):base(options) { }

        public DbSet<Doctor> Doctors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Doctor>()
                .HasIndex(d => d.Email)
                .IsUnique();
        }
    }
}

using Microsoft.EntityFrameworkCore;

namespace ChatServer.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Khai báo các bảng (DbSet) sẽ thêm vào đây sau
        // public DbSet<User> Users { get; set; }
    }
}

using ChatServer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChatServer.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // CÁCH 1: Dùng SQL Server (Mặc định)
            // Đọc chuỗi kết nối từ appsettings.json
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString,
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            // CÁCH 2: Dùng PostgreSQL (Bỏ comment phần này và comment phần trên nếu dùng Postgres)
            // var postgreConnectionString = configuration.GetConnectionString("PostgreConnection");
            // services.AddDbContext<ApplicationDbContext>(options =>
            //     options.UseNpgsql(postgreConnectionString,
            //         b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            return services;
        }
    }
}

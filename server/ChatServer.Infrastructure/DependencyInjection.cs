using ChatServer.Application.Common.Interfaces.Authentication;
using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Infrastructure.Authentication;
using ChatServer.Infrastructure.Data;
using ChatServer.Infrastructure.Persitence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChatServer.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            //----------------------------------------------
            // cau hinh JwtSetting lay tu appsettings.json
            services.Configure<JwtSetting>(configuration.GetSection(JwtSetting.SectionName));

            // d.ki cac dich vu authentication
            services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddSingleton<IPasswordHasher, PasswordHasher>();
            //----------------------------------------------
            // Cấu hình DbContext với Entity Framework Core
            // đọc config "DatabaseProvider" từ appsettings
            var dbProvider = configuration.GetValue<string>("DatabaseProvider");

            // CÁCH 1: Dùng SQL Server (Mặc định)
            // Đọc chuỗi kết nối từ appsettings.json
            //var connectionString = configuration.GetConnectionString("DefaultConnection");
            // services.AddDbContext<ChatDbContext>(options =>
            //     options.UseSqlServer(connectionString,
            //         b => b.MigrationsAssembly(typeof(ChatDbContext).Assembly.FullName)));

            // CÁCH 2: Dùng PostgreSQL
            var postgreConnectionString = configuration.GetConnectionString("PostgreConnection");
            services.AddDbContext<ChatDbContext>(options =>
                options.UseNpgsql(postgreConnectionString,
                    b => b.MigrationsAssembly(typeof(ChatDbContext).Assembly.FullName)));

            //----------------------------------------------
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            // dki ChatDbContext de su dung trong Application
            services.AddScoped<IChatContext>(provider => provider.GetRequiredService<ChatDbContext>());

            return services;
        }
    }
}

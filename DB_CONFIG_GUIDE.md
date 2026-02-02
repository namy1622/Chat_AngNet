# Hướng Dẫn Cấu Hình Database (.NET)

Tài liệu hướng dẫn kết nối 2 loại Database phổ biến: SQL Server (Mặc định) và PostgreSQL (Mã nguồn mở). Bạn chỉ cần chọn 1 trong 2 để sử dụng.

## 1. Cài Đặt Gói NuGet (Nếu chưa cài)
Chạy lệnh tại thư mục `server`:

### Cho SQL Server
```powershell
dotnet add ChatServer.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
```

### Cho PostgreSQL
```powershell
dotnet add ChatServer.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
```

---

## 2. Cấu Hình Connection String
Mở file `server/ChatServer.API/appsettings.json` và thêm đoạn cấu hình sau vào trong `"ConnectionStrings"`.

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    // Lựa chọn 1: SQL Server (LocalDB hoặc Server thật)
    "DefaultConnection": "Server=.;Database=MyChatDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True",
    
    // Lựa chọn 2: PostgreSQL
    "PostgreConnection": "Host=localhost;Port=5432;Database=mychatdb;Username=postgres;Password=your_password"
  }
}
```

---

## 3. Đăng Ký DbContext (Dependency Injection)

Trong Clean Architecture, việc đăng ký DB thường nằm ở tầng **Infrastructure** (`ChatServer.Infrastructure`), sau đó tầng API chỉ cần gọi hàm mở rộng.

### Bước 3.1: Tạo DbContext
File: `server/ChatServer.Infrastructure/Data/ApplicationDbContext.cs`

```csharp
using ChatServer.Domain.Entities; // (Tự tạo folder Entities sau)
using Microsoft.EntityFrameworkCore;

namespace ChatServer.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Khai báo các bảng (DbSet)
        // public DbSet<User> Users { get; set; }
        // public DbSet<Message> Messages { get; set; }
    }
}
```

### Bước 3.2: Viết hàm AddInfrastructure (Extension Method)
File: `server/ChatServer.Infrastructure/DependencyInjection.cs`
Đây là nơi ta quyết định dùng SQL Server hay Postgres.

```csharp
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
            // -- CÁCH 1: Dùng SQL Server --
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            // -- CÁCH 2: Dùng PostgreSQL (Bỏ comment dòng dưới, comment dòng trên) --
            // services.AddDbContext<ApplicationDbContext>(options =>
            //     options.UseNpgsql(configuration.GetConnectionString("PostgreConnection"),
            //         b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            return services;
        }
    }
}
```

### Bước 3.3: Gọi hàm ở Program.cs (API Layer)
File: `server/ChatServer.API/Program.cs`

```csharp
using ChatServer.Infrastructure; // Import namespace

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Gọi hàm đăng ký từ tầng Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
// ...
```

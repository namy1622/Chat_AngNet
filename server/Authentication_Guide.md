# Authentication Implementation Guide

Dưới đây là các bước chi tiết và mã nguồn để bạn thực hiện phần Authentication.

## Bước 1: Cài đặt thư viện (NuGet)
Chạy các lệnh sau trong Terminal (thư mục `server`):

```powershell
cd ChatServer.Infrastructure
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package BCrypt.Net-Next
dotnet add package Microsoft.Extensions.Options.ConfigurationExtensions
```

(Lưu ý: `Microsoft.Extensions.Options.ConfigurationExtensions` thường có sẵn hoặc cần thiết để bind config options).

## Bước 2: Tạo Interfaces ở `ChatServer.Application`
Chúng ta định nghĩa Interface để đảm bảo Clean Architecture.

**File:** `ChatServer.Application/Common/Interfaces/Authentication/IJwtTokenGenerator.cs`
```csharp
using ChatServer.Domain.Entities;

namespace ChatServer.Application.Common.Interfaces.Authentication
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}
```

**File:** `ChatServer.Application/Common/Interfaces/Authentication/IPasswordHasher.cs`
```csharp
namespace ChatServer.Application.Common.Interfaces.Authentication
{
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string passwordHash);
    }
}
```

## Bước 3: Cấu hình Settings ở `ChatServer.Infrastructure`
Tạo class để map với `appsettings.json`.

**File:** `ChatServer.Infrastructure/Authentication/JwtSettings.cs`
```csharp
namespace ChatServer.Infrastructure.Authentication
{
    public class JwtSettings
    {
        public const string SectionName = "JwtSettings";
        public string Secret { get; set; } = null!;
        public int ExpiryMinutes { get; set; }
        public string Issuer { get; set; } = null!;
        public string Audience { get; set; } = null!;
    }
}
```

## Bước 4: Viết Implementation ở `ChatServer.Infrastructure`

**File:** `ChatServer.Infrastructure/Authentication/PasswordHasher.cs`
```csharp
using ChatServer.Application.Common.Interfaces.Authentication;

namespace ChatServer.Infrastructure.Authentication
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            // Tạo salt và hash password
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            // Kiểm tra password nhập vào có khớp với hash không
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
    }
}
```

**File:** `ChatServer.Infrastructure/Authentication/JwtTokenGenerator.cs`
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChatServer.Application.Common.Interfaces.Authentication;
using ChatServer.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ChatServer.Infrastructure.Authentication
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly JwtSettings _jwtSettings;

        public JwtTokenGenerator(IOptions<JwtSettings> jwtOptions)
        {
            _jwtSettings = jwtOptions.Value;
        }

        public string GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.Secret);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new("UserName", user.UserName) // Custom claim nếu cần
                // Thêm các claims khác như Role nếu có
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
```

## Bước 5: Đăng ký Service trong `ChatServer.Infrastructure/DependencyInjection.cs`

Mở file `DependencyInjection.cs` và cập nhật method `AddInfrastructure`:

```csharp
// Thêm các using
using ChatServer.Application.Common.Interfaces.Authentication;
using ChatServer.Infrastructure.Authentication;

// ... bên trong AddInfrastructure ...

// 1. Cấu hình JwtSettings lấy từ AppSettings
services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

// 2. Đăng ký các dịch vụ Authentication
services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
services.AddSingleton<IPasswordHasher, PasswordHasher>();

// ... (code DbContext cũ giữ nguyên) ...
```

## Bước 6: Cập nhật `appsettings.json` (ở `ChatServer.API`)

Thêm block `JwtSettings` vào file `appsettings.json`:

```json
  "AllowedHosts": "*",
  "JwtSettings": {
    "Secret": "super-secret-key-nguyen-van-a-from-chat-server-minimum-32-chars",
    "ExpiryMinutes": 60,
    "Issuer": "ChatServer",
    "Audience": "ChatClient"
  },
  "ConnectionStrings": { ... }
```
*Lưu ý: `Secret` phải đủ dài (ít nhất 32 ký tự) nếu dùng HmacSha256.*

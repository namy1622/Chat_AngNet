# EF Core Setup Commands

Dưới đây là các lệnh `dotnet` đã được chạy để cài đặt thư viện Entity Framework Core (phiên bản 9.0.x) hỗ trợ cả SQL Server và PostgreSQL.

## 1. Cài đặt Packages cho Infrastructure Layer
Nơi chứa `DbContext` và cấu hình Database.

```bash
# Cài đặt Provider cho SQL Server
dotnet add ChatServer.Infrastructure/ChatServer.Infrastructure.csproj package Microsoft.EntityFrameworkCore.SqlServer -v 9.0.1

# Cài đặt Provider cho PostgreSQL
dotnet add ChatServer.Infrastructure/ChatServer.Infrastructure.csproj package Npgsql.EntityFrameworkCore.PostgreSQL -v 9.0.3

# Cài đặt bộ công cụ lệnh (dùng cho Migration)
dotnet add ChatServer.Infrastructure/ChatServer.Infrastructure.csproj package Microsoft.EntityFrameworkCore.Tools -v 9.0.1
```

## 2. Cài đặt Packages cho API Layer
Project khởi chạy chính (Startup Project) cần gói Design để chạy lệnh CLI.

```bash
dotnet add ChatServer.API/ChatServer.API.csproj package Microsoft.EntityFrameworkCore.Design -v 9.0.1
```

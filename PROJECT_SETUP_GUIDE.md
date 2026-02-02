# Hướng Dẫn Xây Dựng Dự Án Monorepo (Angular + .NET)

Tài liệu này tổng hợp các lệnh CLI để khởi tạo cấu trúc dự án chuẩn doanh nghiệp (Clean Architecture), bao gồm Frontend (Angular) và Backend (.NET Core) trong cùng một Repository.

## 1. Khởi Tạo Monorepo (Nhà Chung)

Đầu tiên tạo thư mục gốc chứa cả Client và Server. Điều này giúp dễ quản lý code và có thể deploy riêng biệt.

```powershell
# 1. Tạo thư mục tổng dự án
mkdir MyChatApp
cd MyChatApp

# Cấu trúc sẽ là:
# MyChatApp/
#   ├── client/ (Angular)
#   └── server/ (.NET)
```

---

## 2. Frontend: Angular Setup (Client)

Chúng ta sử dụng cấu trúc **Feature-based** để dễ mở rộng sau này.

### Bước 2.1: Khởi tạo Angular App
```powershell
# Tạo dự án Angular tại thư mục 'client'
# --style=scss: Dùng SCSS cho mạnh mẽ
# --ssr=false: Tắt Server Side Rendering (nếu làm App quản trị/chat thì không cần SEO quá nhiều)
npx -p @angular/cli ng new client --directory=./client --style=scss --ssr=false --skip-tests
```

### Bước 2.2: Cài đặt thư viện bổ trợ
```powershell
cd client

# 1. Cài Tailwind CSS (Styling)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# 2. Cài các gói tiện ích (SignalR cho chat, Icons, Class utilities)
npm install @microsoft/signalr lucide-angular class-variance-authority clsx tailwind-merge
```

### Bước 2.3: Xây dựng cấu trúc thư mục (Architecture)
Chạy lần lượt các lệnh sau để tạo khung sườn chuẩn:

```powershell
# --- CORE MODULE (Các service dùng chung toàn app) ---
# Auth: Chứa logic đăng nhập/token
ng g s core/auth/auth
# Services: Gọi API và Socket
ng g s core/services/api
ng g s core/services/signalr
# Guards: Bảo vệ router (chặn người chưa login)
ng g g core/guards/auth --implements CanActivate
# Interceptors: Tự động đính token vào API
ng g interceptor core/interceptors/jwt
ng g interceptor core/interceptors/error

# --- SHARED MODULE (UI tái sử dụng) ---
# Tạo các component "ngu" (chỉ hiển thị): Button, Input, Avatar
ng g c shared/components/ui-button --inline-template --inline-style
ng g c shared/components/ui-input --inline-template --inline-style

# --- LAYOUTS (Khung giao diện) ---
# AuthLayout: Cho trang Login/Register (thường nền trắng/đơn giản)
ng g c layout/auth-layout --inline-template --inline-style
# MainLayout: Cho trang Chat (có Sidebar, Header)
ng g c layout/main-layout --inline-template --inline-style

# --- FEATURES (Tính năng nghiệp vụ) ---
# 1. Auth Feature (Màn hình đăng nhập/đăng ký)
ng g c features/auth/login
ng g c features/auth/register

# 2. Chat Feature (Màn hình chat)
ng g c features/chat/chat-page
ng g c features/chat/components/conversation-list
ng g c features/chat/components/chat-window
```

---

## 3. Backend: .NET Setup (Server)

Sử dụng **Clean Architecture** (Onion Architecture) giúp tách biệt nghiệp vụ khỏi công nghệ, dễ dàng thay đổi DB hoặc Framework sau này.

### Bước 3.1: Khởi tạo Solution & Projects
Quay ra thư mục gốc để tạo server.

```powershell
cd ..       # Quay lại MyChatApp
mkdir server
cd server

# 1. Tạo Solution (.sln) để gom nhóm các project
dotnet new sln -n MyChatApp

# 2. Tạo 4 tầng kiến trúc (Projects)
# Domain: Chứa Entities (User, Message). KHÔNG phụ thuộc cái gì cả.
dotnet new classlib -n MyChatApp.Domain

# Application: Chứa Logic nghiệp vụ (Interfaces, DTOs). Chỉ phụ thuộc Domain.
dotnet new classlib -n MyChatApp.Application

# Infrastructure: Chứa DB Context, Repositories, External Services.
dotnet new classlib -n MyChatApp.Infrastructure

# API: Đầu vào của ứng dụng (Controllers, SignalR Hubs).
dotnet new webapi -n MyChatApp.API
```

### Bước 3.2: Liên kết các tầng (References)
Quy tắc: API -> Infrastructure -> Application -> Domain.

```powershell
# 1. Thêm các project vào Solution quản lý chung
dotnet sln add MyChatApp.Domain
dotnet sln add MyChatApp.Application
dotnet sln add MyChatApp.Infrastructure
dotnet sln add MyChatApp.API

# 2. Add References (Project này thấy Project kia)
# Application thấy Domain
dotnet add MyChatApp.Application reference MyChatApp.Domain

# Infrastructure thấy App & Domain
dotnet add MyChatApp.Infrastructure reference MyChatApp.Application
dotnet add MyChatApp.Infrastructure reference MyChatApp.Domain

# API thấy App & Infra (để inject dependency)
dotnet add MyChatApp.API reference MyChatApp.Application
dotnet add MyChatApp.API reference MyChatApp.Infrastructure
dotnet add MyChatApp.API reference MyChatApp.Domain
```

### Bước 3.3: Cài đặt NuGet Packages (Thư viện)

*Lưu ý: Nếu gặp lỗi version incompatible, hãy đảm bảo bạn đang dùng .NET SDK mới nhất và cài package tương ứng version (VD: .NET 8 thì cài package 8.x.x)*

```powershell
# --- Infrastructure Layer (Làm việc với DB) ---
# EF Core & SQL Server
dotnet add MyChatApp.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
dotnet add MyChatApp.Infrastructure package Microsoft.EntityFrameworkCore.Tools
# JWT Bearer (Xử lý token)
dotnet add MyChatApp.Infrastructure package Microsoft.AspNetCore.Authentication.JwtBearer

# --- Application Layer (Logic) ---
# AutoMapper (Map object), FluentValidation (Validate form)
dotnet add MyChatApp.Application package AutoMapper
dotnet add MyChatApp.Application package FluentValidation

# --- API Layer ---
# Design tools (để chạy lệnh migration)
dotnet add MyChatApp.API package Microsoft.EntityFrameworkCore.Design
```

## 4. Tổng Kết Cấu Trúc File
Sau khi chạy xong, bạn sẽ có cây thư mục chuẩn chỉ:

```text
MyChatApp/
├── client/ (Angular 19 + Tailwind)
│   ├── src/app/core (AuthService, Guards)
│   ├── src/app/features (Login, Chat Components)
│   └── src/app/shared (UI Buttons, Inputs)
│
└── server/ (.NET 8/9 Clean Arch)
    ├── MyChatApp.Domain (Entities Core)
    ├── MyChatApp.Application (Interfaces, DTOs)
    ├── MyChatApp.Infrastructure (EF Core, SQL)
    └── MyChatApp.API (Controllers, Hubs)
```

using ChatServer.Application;
using ChatServer.Infrastructure;
using ChatServer.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== ĐĂNG KÝ CORS =====
// Đọc danh sách origin được phép từ appsettings.json
// Nếu không có trong config → dùng mặc định localhost:4200
var allowedOrigins = builder.Configuration
    .GetSection("CorsAllowedOrigins")
    .Get<string[]>()
    ?? new[] { "http://localhost:4200" };
builder.Services.AddCors(options =>
{
    // Đặt tên policy "AllowAngularClient" để dùng lại ở dưới
    options.AddPolicy("AllowAngularClient", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)  // chỉ cho phép origin đã khai báo (không dùng AllowAnyOrigin vì cần AllowCredentials)
            .AllowAnyHeader()             // cho phép mọi header, quan trọng là header Authorization (JWT)
            .AllowAnyMethod()             // cho phép GET, POST, PUT, DELETE, ...
            .AllowCredentials();          // BẮT BUỘC phải có nếu dùng SignalR WebSocket
    });
});

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options => {
//        options.Events = new JwtBearerEvents
//        {
//            OnMessageReceived = context => {
//                // Đọc token từ cookie có tên là "token"
//                context.Token = context.Request.Cookies["token"];
//                return Task.CompletedTask;
//            }
//        };
//    });

// ===== Cấu hình giới hạn upload file =====
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 25 * 1024 * 1024; // 25MB
});
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 25 * 1024 * 1024; // 25MB
});

// Dang ki dich vu SignalR
builder.Services.AddSignalR();

// Tích hợp Infrastructure (Database)
builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

// ===== ÁP DỤNG CORS VÀO PIPELINE =====
// Phải đặt TRƯỚC UseAuthentication và UseAuthorization
// Thứ tự middleware rất quan trọng trong ASP.NET Core
app.UseCors("AllowAngularClient");

app.UseAuthentication(); // Them Authentication Middleware
app.UseAuthorization();

app.MapControllers();

// dinh tuyen hub
// client se ket noi vao duong dan: https://localhost:44372/api/chatHub
app.MapHub<ChatServer.API.Hubs.ChatHub>("/api/chatHub");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
    db.Database.Migrate(); // Tự động tạo bảng nếu chưa có
}

app.Run();

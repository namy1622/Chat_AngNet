using ChatServer.Infrastructure;
using ChatServer.Application;
using Microsoft.AspNetCore.SignalR;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

app.UseAuthentication(); // Them Authentication Middleware
app.UseAuthorization();

app.MapControllers();

// dinh tuyen hub
// client se ket noi vao duong dan: https://localhost:44372/api/chatHub
app.MapHub<ChatServer.API.Hubs.ChatHub>("/api/chatHub");

app.Run();

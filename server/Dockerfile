FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["ChatServer.API/ChatServer.API.csproj", "ChatServer.API/"]
COPY ["ChatServer.Application/ChatServer.Application.csproj", "ChatServer.Application/"]
COPY ["ChatServer.Infrastructure/ChatServer.Infrastructure.csproj", "ChatServer.Infrastructure/"]
COPY ["ChatServer.Domain/ChatServer.Domain.csproj", "ChatServer.Domain/"]
RUN dotnet restore "ChatServer.API/ChatServer.API.csproj"
COPY . .
WORKDIR "/src/ChatServer.API"
RUN dotnet publish "ChatServer.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "ChatServer.API.dll"]

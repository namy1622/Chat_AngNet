# Docker Setup Guide for Chat_AngNet

Tài liệu này tổng hợp cách cấu hình Docker cho dự án Chat_AngNet theo cách có thể tái sử dụng cho các dự án sau. Nội dung tập trung vào 2 phần chính của workspace này:

- `client`: Angular SPA
- `server`: ASP.NET Core API + Entity Framework Core + PostgreSQL

Mục tiêu của guide này là giúp bạn:

1. Docker hóa được frontend và backend theo chuẩn thực tế.
2. Kết nối database đúng cách trong container và khi chạy migration từ máy host.
3. Tránh các lỗi đã gặp trong project này như sai đường dẫn build, sai host DB, xung đột port PostgreSQL, hoặc copy sai output Angular.
4. Có một checklist rõ ràng để áp dụng cho các dự án tương tự.

## 1. Kiến trúc tổng quát

Trong project này có 3 thành phần runtime:

- `client`: build Angular và serve bằng Nginx.
- `server`: build/publish ASP.NET Core API bằng multi-stage Docker.
- `postgres-db`: PostgreSQL container dùng làm database runtime.

Luồng chuẩn nên là:

```text
Browser -> client (Nginx) -> server (ASP.NET Core) -> postgres-db
```

Điểm quan trọng:

- `client` gọi API bằng path tương đối như `/api/...` thay vì hardcode `localhost`.
- Nginx trong `client` proxy `/api` sang service `server` trong Docker network.
- `server` kết nối database bằng host nội bộ Docker là `postgres-db:5432`.
- Khi chạy migration từ máy host, connection string phải trỏ tới port host, không phải host nội bộ container.

## 2. Cấu trúc file cần có

Trong project Chat_AngNet, bộ file Docker tối thiểu nên có:

- `docker-compose.yml` ở root
- `.env` ở root
- `client/Dockerfile`
- `client/nginx.conf`
- `client/.dockerignore`
- `server/Dockerfile`
- `server/.dockerignore`

Ngoài ra, với project ASP.NET Core, cần kiểm tra:

- `server/ChatServer.API/appsettings.json`
- `server/ChatServer.API/Program.cs`
- `server/ChatServer.Infrastructure/DependencyInjection.cs`
- migrations trong `server/ChatServer.Infrastructure/Data/Migrations`

## 3. Docker cho Angular client

### 3.1 Mục tiêu

Angular nên được build trong stage riêng và serve bằng Nginx trong stage runtime.

### 3.2 File `client/Dockerfile`

Trong project này, Angular 19 build ra output nằm ở:

- `dist/client/browser`

Đây là chi tiết rất dễ sai. Nếu copy nhầm `dist/client` hoặc trỏ sai root của Nginx, bạn sẽ thấy trang mặc định "Welcome to nginx!" thay vì app thật.

Mẫu Dockerfile phù hợp:

```dockerfile
# build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# production stage
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/client/browser/. /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 File `client/nginx.conf`

Nginx cần làm 2 việc:

1. Serve SPA static files.
2. Proxy API và SignalR về server.

Mẫu cấu hình:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://server:80/api/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3.4 Lưu ý quan trọng cho client

- Không hardcode `http://localhost:5000` trong Angular service nếu app chạy qua Docker.
- Dùng path tương đối như `/api/auth/login`, `/api/chatHub`.
- Nếu không có `nginx.conf`, SPA routes như `/auth/login` sẽ dễ bị lỗi refresh hoặc 404.
- Trong project này, việc copy sai output Angular là nguyên nhân khiến client hiển thị trang mặc định của Nginx.

## 4. Docker cho ASP.NET Core server

### 4.1 Mục tiêu

Server nên dùng multi-stage build:

- Stage 1: SDK image để restore, build, publish.
- Stage 2: ASP.NET runtime image để chạy app.

### 4.2 File `server/Dockerfile`

Mẫu Dockerfile đã dùng thành công trong project này:

```dockerfile
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
```

### 4.3 Lưu ý quan trọng cho server

- Không copy toàn bộ source trước khi restore nếu solution có nhiều project tham chiếu; copy csproj trước để tận dụng cache.
- Trong container, app nên listen ở `http://+:80`.
- Nếu app dùng HTTPS redirection, dev container có thể gặp vấn đề nếu không cấu hình certificate. Trong project này, `UseHttpsRedirection()` nên tránh bật cứng trong container dev.
- Khi build file Docker, phải trỏ đúng Dockerfile thật. Trong project này đã từng bị nhầm giữa `server/Dockerfile` và `server/ChatServer.API/Dockerfile`.

## 5. Docker Compose

### 5.1 Mục tiêu

Compose nên quản lý toàn bộ môi trường local:

- PostgreSQL container
- API container
- Client container

### 5.2 File `docker-compose.yml`

Mẫu phù hợp cho project này:

```yaml
services:
  postgres-db:
    image: postgres:16-alpine
    container_name: chatangnet-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5433:5432"
    volumes:
      - chatangnet_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 20

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: chatangnet-server
    depends_on:
      postgres-db:
        condition: service_healthy
    ports:
      - "5000:80"
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ASPNETCORE_URLS: http://+:80
      ConnectionStrings__PostgreConnection: Host=postgres-db;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}
      JwtSettings__Secret: ${JWT_SECRET}
      JwtSettings__Issuer: ${JWT_ISSUER}
      JwtSettings__Audience: ${JWT_AUDIENCE}
      JwtSettings__ExpiryMinutes: ${JWT_EXPIRY_MINUTES}

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: chatangnet-client
    depends_on:
      - server
    ports:
      - "4200:80"

volumes:
  chatangnet_pgdata:
```

### 5.3 Lưu ý quan trọng cho compose

- Nên đổi port host của PostgreSQL sang `5433` nếu máy bạn đã có PostgreSQL local chạy sẵn ở `5432`.
- Nếu bạn để `5432:5432`, rất dễ bị nhầm giữa DB local và DB Docker.
- Trong project này, xung đột port 5432 là nguyên nhân lớn khiến migration bị chạy nhầm DB.
- Nên bỏ field `version` nếu Compose cảnh báo obsolete.

## 6. File `.env`

File `.env` nên đặt ở root để giữ cấu hình runtime và secret.

Mẫu:

```env
POSTGRES_DB=chatangnetdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password_here

JWT_SECRET=replace_with_long_random_secret_64_chars_min
JWT_ISSUER=ChatServer
JWT_AUDIENCE=ChatClient
JWT_EXPIRY_MINUTES=60
```

### Lưu ý

- Không commit secret thật lên Git.
- Không để JWT secret thật trong `appsettings.json` khi lên môi trường dùng chung.
- Nếu đã lỡ commit secret, nên rotate ngay.

## 7. `.dockerignore`

### 7.1 `client/.dockerignore`

```dockerignore
node_modules
dist
.git
.gitignore
Dockerfile
docker-compose.yml
npm-debug.log
```

### 7.2 `server/.dockerignore`

```dockerignore
**/bin
**/obj
.git
.gitignore
Dockerfile*
docker-compose.yml
```

### Vì sao cần

- Giảm kích thước build context.
- Tăng tốc build.
- Tránh copy artifact cũ hoặc thư mục `bin/obj` vào image.

## 8. Cấu hình ASP.NET Core server

### 8.1 `Program.cs`

Trong project này, cần đảm bảo:

- Swagger chỉ bật trong Development.
- HTTPS redirect không ép trong container dev nếu chưa có certificate.

Mẫu logic nên là:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}
```

### 8.2 `DependencyInjection.cs`

Project này đang dùng PostgreSQL qua `UseNpgsql`.

Nên giữ logic rõ ràng:

```csharp
var dbProvider = configuration.GetValue<string>("DatabaseProvider")?.Trim().ToLowerInvariant();

if (dbProvider == "sqlserver")
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    services.AddDbContext<ChatDbContext>(options =>
        options.UseSqlServer(connectionString,
            b => b.MigrationsAssembly(typeof(ChatDbContext).Assembly.FullName)));
}
else
{
    var postgreConnectionString = configuration.GetConnectionString("PostgreConnection");
    services.AddDbContext<ChatDbContext>(options =>
        options.UseNpgsql(postgreConnectionString,
            b => b.MigrationsAssembly(typeof(ChatDbContext).Assembly.FullName)));
}
```

### 8.3 Lưu ý từ project này

- `DatabaseProvider` đã có trong appsettings nhưng ban đầu chưa được dùng thật.
- `PostgreConnection` là key mà code đang đọc.
- Nếu truyền sai `ConnectionStrings__DefaultConnection` thay vì `ConnectionStrings__PostgreConnection`, server sẽ không lấy đúng DB.

## 9. Migrations và database

### 9.1 Migrations đã có sẵn

Project này có các migration trong:

- `server/ChatServer.Infrastructure/Data/Migrations`

Các migration thực tế được apply thành công gồm:

- `20260207062816_InitialCreate`
- `20260208154146_InitialCreate_v2`
- `20260208161729_MakeStringFieldsOptional`

### 9.2 Chạy migration đúng cách

Nếu chạy `dotnet ef` từ máy host, phải trỏ đúng port host vào DB container. Trong project này, do máy có PostgreSQL local ở `5432`, nên dùng `5433` cho DB Docker là an toàn hơn.

Lệnh mẫu:

```powershell
$env:ConnectionStrings__PostgreConnection="Host=localhost;Port=5433;Database=chatangnetdb;Username=postgres;Password=your_password"
dotnet ef database update `
  --project .\server\ChatServer.Infrastructure\ChatServer.Infrastructure.csproj `
  --startup-project .\server\ChatServer.API\ChatServer.API.csproj
```

### 9.3 Kiểm tra schema

```powershell
docker compose exec postgres-db psql -U postgres -d chatangnetdb -c "\dt"
```

Nếu thấy các bảng như `Users`, `Messages`, `Friendships` thì DB đã sẵn sàng.

### 9.4 Bài học rút ra

- Đừng tin rằng `dotnet ef database update` đã đi đúng DB chỉ vì nó báo success.
- Luôn kiểm tra lại `\dt` trong container DB đích.
- Nếu trên máy có PostgreSQL local và Docker đều dùng `5432`, rất dễ migrate nhầm nơi.

## 10. Quy trình chạy chuẩn cho project này

### Bước 1: Dừng môi trường cũ nếu cần

```powershell
docker compose down
```

### Bước 2: Chạy lại DB container

```powershell
docker compose up -d postgres-db
```

### Bước 3: Apply migration từ host vào DB đúng port

```powershell
$env:ConnectionStrings__PostgreConnection="Host=localhost;Port=5433;Database=chatangnetdb;Username=postgres;Password=162200"
dotnet ef database update `
  --project .\server\ChatServer.Infrastructure\ChatServer.Infrastructure.csproj `
  --startup-project .\server\ChatServer.API\ChatServer.API.csproj
```

### Bước 4: Build và chạy toàn bộ stack

```powershell
docker compose up -d --build
```

### Bước 5: Kiểm tra container

```powershell
docker compose ps
```

### Bước 6: Kiểm tra logs nếu có lỗi

```powershell
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres-db
```

### Bước 7: Đăng ký user mới rồi login

Vì DB có thể mới tinh hoặc vừa migrate xong, hãy tạo user mới trước khi login.

## 11. Các lỗi đã gặp trong project này và cách tránh

### 11.1 Nginx hiển thị "Welcome to nginx!"

Nguyên nhân:

- Copy sai output Angular.
- Nginx đang serve root sai thư mục.

Khắc phục:

- Copy từ `dist/client/browser` vào `/usr/share/nginx/html`.
- Xóa nội dung mặc định trong web root trước khi copy.

### 11.2 Lệnh Docker build trỏ sai Dockerfile

Nguyên nhân:

- Lệnh build dùng path Dockerfile không đúng.

Khắc phục:

- Kiểm tra file Dockerfile thật đang ở đâu.
- Trong project này, `server/Dockerfile` là file đúng.

### 11.3 Client báo sai Email/Password dù nhập đúng

Nguyên nhân:

- DB chưa có bảng.
- API login fail ở tầng server, client chỉ hiện alert chung.

Khắc phục:

- Apply migrations.
- Kiểm tra `\dt` trong DB container.

### 11.4 PostgreSQL local đụng port với Postgre Docker

Nguyên nhân:

- Cả local service và Docker cùng dùng `5432`.

Khắc phục:

- Đổi host port Docker sang `5433`.
- Khi migrate từ host, dùng `localhost:5433`.

### 11.5 Compose warning `version is obsolete`

Nguyên nhân:

- Docker Compose mới không còn cần field `version`.

Khắc phục:

- Xóa dòng `version` khỏi `docker-compose.yml`.

## 12. Checklist tái sử dụng cho dự án khác

Khi đem mẫu này sang dự án khác, hãy kiểm tra theo thứ tự:

1. Xác định frontend build output nằm ở đâu.
2. Viết Dockerfile multi-stage cho frontend.
3. Viết cấu hình reverse proxy cho SPA routes và API routes.
4. Viết Dockerfile multi-stage cho backend.
5. Đưa connection string và secret ra `.env` hoặc secret manager.
6. Chọn DB container hay DB local làm nguồn thật.
7. Nếu dùng DB container, tránh xung đột port với DB local.
8. Chạy migrations vào đúng DB đích.
9. Xác nhận schema bằng cách kiểm tra bảng.
10. Build và chạy compose.
11. Kiểm tra logs từng service.
12. Test flow thật: register -> login -> API -> realtime.

## 13. Ghi chú riêng từ Chat_AngNet

- Angular build output thực tế nằm ở `dist/client/browser`.
- Nginx root mặc định phải được làm sạch trước khi copy app.
- Server của dự án này dùng PostgreSQL, không phải SQL Server.
- Key connection string đúng là `ConnectionStrings:PostgreConnection`.
- `DatabaseProvider` đang là cơ chế mở rộng, không phải thứ đã dùng xuyên suốt ban đầu.
- Trên máy này có PostgreSQL local nên port `5432` bị tranh chấp với Docker.
- Port host `5433` giúp tách rõ DB host và DB Docker.
- `dotnet ef` chỉ được xem là đúng khi `\dt` ở DB đích đã có bảng.
- Alert login của client là generic; khi debug nên xem log server và response API thật.

## 13.1. DataProtection Keys Volume

### Vấn đề

Khi ASP.NET Core container khởi động, nó tạo data protection keys để encrypt token và session data. Nếu volume không persistent, mỗi lần container restart, keys bị xóa → token cũ không thể decrypt.

### Giải pháp

Tạo named volume cho DataProtection keys, dùng trong `docker-compose.yml`:

```yaml
services:
  server:
    volumes:
      - chatangnet_dataprotection:/root/.aspnet/DataProtection-Keys
    # ... rest of config
    
volumes:
  chatangnet_pgdata:
  chatangnet_dataprotection:
```

### Lệnh kiểm tra

```powershell
docker volume ls | findstr dataprotection
docker volume inspect chatangnet_dataprotection
```

### Lưu ý

- Trong production, nên dùng Azure Key Vault hoặc AWS KMS thay vì file volume.
- Cho development local, file volume là đủ.

## 13.2. Chạy Migrations Trong Container (Tùy chọn)

### Phương pháp 1: Init Container (Khuyên dùng)

Tạo service riêng để chạy migration trước khi server start:

```yaml
services:
  # Migration runner
  migrate:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: chatangnet-migrate
    depends_on:
      postgres-db:
        condition: service_healthy
    environment:
      ConnectionStrings__PostgreConnection: Host=postgres-db;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}
    entrypoint: >
      /bin/sh -c "
      cd /app
      && dotnet tool install --global dotnet-ef
      && export PATH=\"$PATH:/root/.dotnet/tools\"
      && dotnet ef database update
        --project ChatServer.Infrastructure.dll
        --assembly ChatServer.Infrastructure.dll
      && echo 'Migrations applied successfully'
      "
    networks:
      - chatangnet-net

  server:
    depends_on:
      migrate:
        condition: service_completed_successfully
    # ... rest of config
    
networks:
  chatangnet-net:
```

### Phương pháp 2: Helper Script trước `docker compose up`

Nếu không muốn thêm complexity trong compose, chạy từ terminal trước build:

```powershell
# 1. Start DB only
docker compose up -d postgres-db

# 2. Wait for DB healthy
Start-Sleep -Seconds 10

# 3. Run migration
$env:ConnectionStrings__PostgreConnection="Host=localhost;Port=5433;Database=chatangnetdb;Username=postgres;Password=your_password"
dotnet ef database update `
  --project .\server\ChatServer.Infrastructure\ChatServer.Infrastructure.csproj `
  --startup-project .\server\ChatServer.API\ChatServer.API.csproj

# 4. Build and run all services
docker compose up -d --build server client
```

### Lợi ích

- Phương pháp 1: Tự động, không cần shell script từ host.
- Phương pháp 2: Đơn giản, dễ debug.

### Nhược điểm

- Phương pháp 1: Cần copy `*.csproj` vào runtime stage hoặc dùng SDK image chạy `dotnet ef` (tăng kích thước image).
- Phương pháp 2: Yêu cầu host có `dotnet ef` cài sẵn.

Trong project Chat_AngNet hiện tại, đang dùng **phương pháp 2** (chạy từ host).

## 13.3. Quick Start Commands

### Lần đầu tiên (fresh start)

```powershell
# 1. Đảm bảo Docker Desktop chạy
docker --version

# 2. Vào folder project
cd f:\ProjectAngular\Chat_AngNet

# 3. Kiểm tra .env có secret hay chưa
cat .env

# 4. Nếu chưa có .env, tạo:
@"
POSTGRES_DB=chatangnetdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password_here

JWT_SECRET=replace_with_long_random_secret_64_chars_min
JWT_ISSUER=ChatServer
JWT_AUDIENCE=ChatClient
JWT_EXPIRY_MINUTES=60
"@ | Out-File -FilePath .env -Encoding UTF8

# 5. Start DB container
docker compose up -d postgres-db

# 6. Wait cho DB healthy
Start-Sleep -Seconds 10

# 7. Run migrations
$env:ConnectionStrings__PostgreConnection="Host=localhost;Port=5433;Database=chatangnetdb;Username=postgres;Password=your_strong_password_here"
dotnet ef database update `
  --project .\server\ChatServer.Infrastructure\ChatServer.Infrastructure.csproj `
  --startup-project .\server\ChatServer.API\ChatServer.API.csproj

# 8. Verify migrations (optional)
docker compose exec postgres-db psql -U postgres -d chatangnetdb -c "\dt"

# 9. Build and run server + client
docker compose up -d --build server client

# 10. Kiểm tra trạng thái
docker compose ps

# 11. Đợi server startup (10-15 giây)
Start-Sleep -Seconds 15

# 12. Xem logs nếu cần
docker compose logs -f server

# 13. Mở browser và test
# - Client: http://localhost:4200
# - API: http://localhost:5000
# - Swagger: http://localhost:5000/swagger
```

### Lần tiếp theo (already set up)

```powershell
# Nếu toàn bộ service đã tắt:
docker compose up -d

# Nếu muốn rebuild do thay đổi code:
docker compose up -d --build

# Dừng hết:
docker compose down

# Dừng và xóa volume (chuẩn bị reset DB):
docker compose down -v

# Xem logs realtime:
docker compose logs -f

# Xem logs của service riêng:
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres-db

# SSH vào container (debug):
docker compose exec server bash
docker compose exec client sh
docker compose exec postgres-db psql -U postgres
```

### Common Issues Quick Fixes

```powershell
# Client hiển thị "Welcome to nginx!"
# → Rebuild client, kiểm tra Angular build output ở dist/client/browser
docker compose up -d --build client

# Server báo connection failed
# → Kiểm tra DB healthy, xem logs
docker compose logs postgres-db
docker compose logs server

# Port conflict (5432)
# → Nếu máy có PostgreSQL local, dùng port 5433 cho Docker
# → Sửa docker-compose.yml: ports: - "5433:5432"

# Migrate fail
# → Kiểm tra connection string: Host=localhost;Port=5433;...
# → Chạy lại: dotnet ef database update
$env:ConnectionStrings__PostgreConnection="Host=localhost;Port=5433;Database=chatangnetdb;Username=postgres;Password=..."

# JWT token invalid
# → Kiểm tra .env có JWT_SECRET không
# → Xóa container cũ nếu secret thay đổi: docker compose down
# → Rebuild: docker compose up -d --build

# Postgres container khởi động mà chưa ready
# → Kiểm tra healthcheck: docker compose ps
# → Hoặc xem logs: docker compose logs postgres-db
```

## 14. Các bước chạy Dev / Production

### 14.1 Dev: chạy nhanh để code và debug

Nếu muốn phát triển hằng ngày, ưu tiên chạy local để có hot-reload:

```powershell
# Client
cd .\client
ng serve

# Server
cd .\server\ChatServer.API
dotnet run
```

Khi chạy theo cách này:

- `client` sẽ dùng Angular dev server.
- `server` sẽ đọc `appsettings.Development.json`.
- Database nên là **PostgreSQL local** nếu bạn muốn giữ data cũ trên máy.
- Nếu muốn dùng PostgreSQL Docker thì đổi connection string sang `Host=localhost;Port=5433`.

### 14.2 Production: chạy đúng kiểu deploy thật

Khi build để deploy, nên chạy toàn bộ bằng Docker:

```powershell
docker compose up -d --build
```

Luồng production thực tế:

1. Build image cho `client` và `server`.
2. Start `postgres-db` hoặc dùng database managed riêng.
3. Inject secret qua `.env` hoặc secret manager.
4. Apply migration vào DB đích trước khi mở traffic.
5. Dùng Nginx hoặc load balancer để public app.

Trong production, không nên dùng dữ liệu local trên máy cá nhân và không nên hardcode secret trong `appsettings.json`.

## 15. Kết luận

Nếu làm đúng theo guide này, bạn có thể áp dụng cho các dự án sau mà không phải mò lại từ đầu:

- Frontend Angular được build và serve đúng.
- Backend ASP.NET Core chạy trong container đúng chuẩn.
- DB container được quản lý rõ ràng.
- Migration và runtime DB không bị nhầm giữa local và Docker.

Với Chat_AngNet, trạng thái hiện tại đã đúng flow chuẩn sau khi:

- sửa client Dockerfile để copy đúng `browser`
- thêm Nginx proxy cho `/api`
- dùng PostgreSQL container làm DB thật
- chạy migration vào đúng DB đích

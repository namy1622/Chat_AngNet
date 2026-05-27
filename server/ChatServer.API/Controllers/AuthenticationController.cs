using ChatServer.Application.Features.Authentication.Commands.Register;
using ChatServer.Application.Features.Authentication.Queries.Login;
using ChatServer.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ChatServer.API.Controllers
{
    [Route("api/auth")]
    [ApiController] // attribute require cho API controller
    public class AuthenticationController : ControllerBase
    {
        // _mediator: dong vai tro nguoi dieu phoi, chuyen tiep cac y.c den cac xu ly thich hop
        // Controller ko can biet logic xu ly nam o dau, chi can dua y.c cho Mediator
        private readonly ISender _mediator;

        public AuthenticationController(ISender mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterCommand command)
        {
            // 1. nhan data (command) tu client gui len
            // 2. mediator.Send(command): gui lenh Dang Ky vao he thong
            //  -> Mediator tu dong tim den class "RegisterCommandHandler" de xu ly
            // 3. nhan ket qua tra ve tu (AuthenticationResult)
            var authResult = await _mediator.Send(command);

            Response.Cookies.Append("token", authResult.Token, new CookieOptions
            {
                HttpOnly = true,             // Ngăn JS FE truy cập (Chống XSS)
                Secure = true,               // Chỉ truyền qua giao thức HTTPS (ở môi trường Product)
                SameSite = SameSiteMode.Strict, // Chặn hoàn toàn các request từ trang web lạ (Chống CSRF)
                Expires = DateTime.UtcNow.AddDays(7) // Cookie tự động hết hạn sau 7 ngày
            });

            //Trả về thông tin User (FE lưu thông tin cá nhân)
            return Ok(new
            {
                user = authResult.User,
                message = "Registration successful"
            });
            //  tra ve http 200 (OK) kem theo data ket qua 
            //return Ok(authResult);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginQuery query)
        {
            // tuong tu Register: gui y.c Login di
            // => Mediator tim den LoginQueryHandler de kiem tra mat khau, cap token
            var authResult = await _mediator.Send(query);

            // Ghi Token vào Cookie của trình duyệt ngay khi Đăng nhập thành công
            Response.Cookies.Append("token", authResult.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            // Trả về thông tin User (FE lưu thông tin cá nhân)
            return Ok(new
            {
                user = authResult.User,
                message = "Login successful"
            });
            //return Ok(authResult);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("token");
            return Ok();
        }
    }
}

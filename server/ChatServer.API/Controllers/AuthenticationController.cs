using ChatServer.Application.Features.Authentication.Commands.Register;
using ChatServer.Application.Features.Authentication.Queries.Login;
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

            //  tra ve http 200 (OK) kem theo data ket qua 
            return Ok(authResult);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginQuery query)
        {
            // tuong tu Register: gui y.c Login di
            // => Mediator tim den LoginQueryHandler de kiem tra mat khau, cap token
            var authResult = await _mediator.Send(query);

            return Ok(authResult);
        }
    }
}

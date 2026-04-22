using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using RequestResult = ChatServer.Application.Features.Authentication.Common.AuthenticationResult;

namespace ChatServer.Application.Features.Authentication.Commands.Register
{
    // record: kiểu dữ liệu bất biến, thích hợp cho việc truyền dữ liệu
    // IRequest<RequestResult>: lệnh này khi được xử lý sẽ trả về một RequestResult
    // Chứa thông tin cần thiết để đăng ký người dùng mới
    // RegisterCommand tac dung nhu mot DTO (Data Transfer Object)
    public record RegisterCommand
    (
        string FirstName,
        string LastName,
        string Email,
        string Password
     ) : IRequest<RequestResult>;
}

using ChatServer.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Authentication.Common
{
    // Kết quả trả về sau khi xác thực thành công
    // record: dung để lưu trữ dữ liệu bất biến
    // AuthenticationResult co tac dụng gom nhóm thông tin người dùng và token xác thực
    public record AuthenticationResult(
        User User,
        string Token
    );

}

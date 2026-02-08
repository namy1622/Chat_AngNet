using ChatServer.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Common.Interfaces.Authentication
{
    // Interface để tạo JWT token cho user
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}

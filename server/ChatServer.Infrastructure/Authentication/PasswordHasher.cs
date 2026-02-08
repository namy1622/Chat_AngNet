using ChatServer.Application.Common.Interfaces.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Infrastructure.Authentication
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            // Sử dụng BCrypt để hash password
            // sử dụng khi user đăng ký tài khoản
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            // kiểm tra password nhập vào có khớp với hash không
            // sử dụng khi user login
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
    }
}

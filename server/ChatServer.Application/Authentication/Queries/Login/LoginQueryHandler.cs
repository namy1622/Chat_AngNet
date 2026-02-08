using ChatServer.Application.Authentication.Common;
using ChatServer.Application.Common.Exceptions;
using ChatServer.Application.Common.Interfaces.Authentication;
using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Authentication.Queries.Login
{
    public class LoginQueryHandler : IRequestHandler<LoginQuery, AuthenticationResult>
    {
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IRepository<User> _userRepo;
        private readonly IChatContext _context;

        public LoginQueryHandler(
            IJwtTokenGenerator jwtTokenGenerator,
            IPasswordHasher passwordHasher,
            IRepository<User> userRepo,
            IChatContext context)
        {
            _jwtTokenGenerator = jwtTokenGenerator;
            _passwordHasher = passwordHasher;
            _userRepo = userRepo;
            _context = context;
        }

        public async Task<AuthenticationResult> Handle(LoginQuery query, CancellationToken cancellationToken)
        {
            // 1. tim user theo email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == query.Email);
                    // await _userRepo.GetSingleAsync(u => u.Email == query.Email);

            if(user == null)
            {
                throw new UserFriendlyException("Invalid Creadentials.");
            }

            // 2. kiem tra password
            if(!_passwordHasher.VerifyPassword(query.Password, user.PasswordHash))
            {
                throw new UserFriendlyException("Invalid Credentials.");
            }

            // 3. tao token
            var token = _jwtTokenGenerator.GenerateToken(user);

            return new AuthenticationResult(user, token);
        }
    }
}

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
using RequestResult = ChatServer.Application.Features.Authentication.Common.AuthenticationResult;

namespace ChatServer.Application.Features.Authentication.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RequestResult>
    {
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IChatContext _context;
        private readonly IRepository<User> _userRepo;

        public RegisterCommandHandler(
            IJwtTokenGenerator jwtTokenGenerator, 
            IPasswordHasher passwordHasher, 
            IChatContext context)
        {
            _jwtTokenGenerator = jwtTokenGenerator;
            _passwordHasher = passwordHasher;
            _context = context;
        }

        public async Task<RequestResult> Handle(RegisterCommand command, CancellationToken cancellationToken)
        {
            // 1. kiem tra email da ton tai chua
            var existingUser = await _context.Users.AnyAsync(u => u.Email == command.Email, cancellationToken);
            if (existingUser)
            {
                throw new UserFriendlyException("Email already exists!");
            }

            // 2. tao user & hash password
            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = command.FirstName,
                LastName = command.LastName,
                DisplayName = $"{command.FirstName} {command.LastName}",
                Email = command.Email,
                UserName = command.Email, // tam thoi de email
                PasswordHash = _passwordHasher.HashPassword(command.Password),
                CreatedAt = DateTime.UtcNow,
            };

            // 3. luu user vao db
            _context.Users.Add(user);

            //_context.Users.
            await _context.SaveChangesAsync(cancellationToken);

            // 4. tao token
            var token = _jwtTokenGenerator.GenerateToken(user);

            return new RequestResult(user, token);
        }
    }
}

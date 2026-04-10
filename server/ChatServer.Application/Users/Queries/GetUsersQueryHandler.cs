using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Application.Users.Queries.Dto;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Users.Queries
{
    public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
    {
         private readonly IChatContext _context;

        public GetUsersQueryHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Users.AsQueryable(); // AsQueryable cho phep thuc thi tri hoan va toi uu cau truy van

            // neu có SearchTerm -> loc theo UserName, Name 
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(u => u.UserName.ToLower().Contains(searchTerm)
                                      || u.DisplayName.ToLower().Contains(searchTerm)
                                      || u.FirstName.ToLower().Contains(searchTerm)
                                      || u.LastName.ToLower().Contains(searchTerm));
            }

            return await query.Take(20)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    AvatarUrl = u.AvatarUrl,
                    IsOnline = u.IsOnline
                }).ToListAsync(cancellationToken);
        }
    }
}

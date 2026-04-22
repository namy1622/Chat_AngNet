using ChatServer.Application.Features.Users.Queries.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Users.Queries
{
    // input: tu khoa tim kiem -> tra ve user trung tu khoa
    public record GetUsersQuery(string? SearchTerm) : IRequest<List<UserDto>>;

}

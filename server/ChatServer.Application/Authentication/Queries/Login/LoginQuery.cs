using ChatServer.Application.Authentication.Common;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Authentication.Queries.Login
{
    public record LoginQuery
    (
        string Email,
        string Password
        ) : IRequest<AuthenticationResult>;
}

using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetMessageById
{
    public record GetMessageByIdQuery(Guid MessageId) : IRequest<string>;

}

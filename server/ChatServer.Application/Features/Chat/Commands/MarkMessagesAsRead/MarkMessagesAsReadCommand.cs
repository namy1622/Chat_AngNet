using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Commands.MarkMessagesAsRead
{
    public record MarkMessagesAsReadCommand(Guid ConversationId, Guid UserId) : IRequest<int>;

}

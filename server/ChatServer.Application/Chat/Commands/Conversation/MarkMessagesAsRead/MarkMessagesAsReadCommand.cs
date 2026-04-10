using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Conversation.MarkMessagesAsRead
{
    public record MarkMessagesAsReadCommand(Guid ConversationId, Guid UserId) : IRequest<int>;

}

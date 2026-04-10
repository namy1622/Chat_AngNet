using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Conversation.CreateMessage
{
    // IRequest<Guid>
    public record CreateMessageCommand
    (
        Guid ConversationId, // tin nhan thuoc ve conversation nao
        string Content,     // noi dung tin nhan
        Guid SenderId       // nguoi gui la ai (lay tu token)
    ) : IRequest<Guid>;
}

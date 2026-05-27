using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Commands.CreateMessage
{
    // IRequest<Guid>
    public record CreateMessageCommand
    (
        Guid ConversationId, // tin nhan thuoc ve conversation nao
        string Content,     // noi dung tin nhan
        Guid SenderId,       // nguoi gui la ai (lay tu token)

        Guid? ReplyToId = null,  // id message reply (nullable)

        List<long>? FileIds = null  // Client upload file → nhận fileId → gửi message kèm fileIds
    ) : IRequest<Guid>;
}

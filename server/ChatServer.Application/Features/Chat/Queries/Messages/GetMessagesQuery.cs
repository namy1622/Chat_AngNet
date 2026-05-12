using ChatServer.Application.Features.Chat.Queries.GetMessages.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetMessages
{
    // Input: ConversationId, UserId hien tai (de tinh isMine)
    public record GetMessagesQuery
    (
        Guid ConversationId,
        Guid CurrentUserId
    ): IRequest<List<MessageDto>>;
}

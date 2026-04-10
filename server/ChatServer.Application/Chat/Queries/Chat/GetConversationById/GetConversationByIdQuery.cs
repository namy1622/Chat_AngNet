using ChatServer.Application.Chat.Queries.Chat.GetConversations.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Chat.GetConversationById
{
    // query: lay infomation 1 conversation theo id
    // input: conversationId, CurrentUserId (de xac dinh ten hien thi cho Private chat 1-1)
    public record GetConversationByIdQuery (
        Guid ConversationId,
        Guid CurrentUserId
        ) : IRequest<ConversationDto?>;

}

using ChatServer.Application.Features.Chat.Queries.GetConversations.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetConversations
{
    // Request y.c lay danh sach cuoc tro chuyen cua nguoi dung (Input: UserId)
    // -> tra ve ListConversationDto
    public record GetUserConversationsQuery(Guid UserId) : IRequest<List<ConversationDto>>;
}

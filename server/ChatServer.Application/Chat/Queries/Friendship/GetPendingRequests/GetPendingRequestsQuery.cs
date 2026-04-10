using ChatServer.Application.Chat.Queries.Friendship.GetPendingRequests.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Friendship.GetPendingRequests
{
    public record GetPendingRequestsQuery (Guid CurrendUserId) : IRequest<List<FriendRequestDto>>;
}

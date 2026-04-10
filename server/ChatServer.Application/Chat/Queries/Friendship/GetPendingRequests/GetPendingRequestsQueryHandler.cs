using ChatServer.Application.Chat.Queries.Friendship.GetPendingRequests.Dto;
using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Friendship.GetPendingRequests
{
    public class GetPendingRequestsQueryHandler : IRequestHandler<GetPendingRequestsQuery, List<FriendRequestDto>>
    {
        private readonly IChatContext _chatContext;

        public GetPendingRequestsQueryHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<List<FriendRequestDto>> Handle(GetPendingRequestsQuery request, CancellationToken cancellationToken)
        {
            var pendingRequests = await _chatContext.Friendships
                .Where(f => f.Status == FriendshipStatus.Pending)
                .Where(f => f.AddresseeId == request.CurrendUserId)
                .Include(f => f.Requester)
                .Select(f => new FriendRequestDto
                {
                    FriendshipId = f.Id,
                    RequesterId = f.RequesterId,
                    RequesterName = f.Requester.UserName,
                    FirstName = f.Requester.FirstName,
                    LastName = f.Requester.LastName,
                    AvatarUrl = f.Requester.AvatarUrl,
                    SentAt = f.CreatedAt
                })
                .OrderByDescending(f => f.SentAt) // moi nhat len tren
                .ToListAsync(cancellationToken);

            return pendingRequests;
        }
    }
}

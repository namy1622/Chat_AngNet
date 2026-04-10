using ChatServer.Application.Chat.Queries.Friendship.GetFriendshipStatus.Dto;
using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Friendship.GetFriendshipStatus
{
    public class GetFriendshipStatusQueryHandler : IRequestHandler<GetFriendshipStatusQuery, FriendshipStatusDto>
    {
        private readonly IChatContext _chatContext;
        public GetFriendshipStatusQueryHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<FriendshipStatusDto> Handle(GetFriendshipStatusQuery request, CancellationToken cancellationToken)
        {
            // Tìm friendship record giữa 2 người (cả 2 chiều)
            var friendship = await _chatContext.Friendships
                .FirstOrDefaultAsync(f =>
                    f.RequesterId == request.CurrentUserId
                        && f.AddresseeId == request.TargetUserId
                    ||
                    f.RequesterId == request.TargetUserId
                        && f.AddresseeId == request.CurrentUserId,
                    cancellationToken);
            // Chưa có relationship
            if (friendship == null)
            {
                return new FriendshipStatusDto
                {
                    FriendshipId = null,
                    Status = "None",
                    IsRequester = false
                };
            }
            // Có relationship → trả về status
            return new FriendshipStatusDto
            {
                FriendshipId = friendship.Id,
                Status = friendship.Status.ToString(), // "Pending", "Accepted",...
                IsRequester = friendship.RequesterId == request.CurrentUserId
            };
        }
    }
}

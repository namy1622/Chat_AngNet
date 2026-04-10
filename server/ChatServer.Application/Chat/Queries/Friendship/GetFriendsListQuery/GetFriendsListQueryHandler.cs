using ChatServer.Application.Chat.Queries.Friendship.GetFriendsListQuery.Dto;
using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Friendship.GetFriendsListQuery
{
    public class GetFriendsListQueryHandler : IRequestHandler<GetFriendsListQuery, List<FriendDto>>
    {
        private readonly IChatContext _chatContext;

        public GetFriendsListQueryHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<List<FriendDto>> Handle(GetFriendsListQuery request, CancellationToken cancellationToken)
        {
            var friends = await _chatContext.Friendships
                .Where(f => f.Status == FriendshipStatus.Accepted)
                .Where(f => f.RequesterId == request.CurrentUserId
                    || f.AddresseeId == request.CurrentUserId)
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .Select(f => new FriendDto
                {
                    FriendshipId = f.Id,
                    // Nếu mình là Requester → bạn bè là Addressee, và ngược lại
                    UserId = f.RequesterId == request.CurrentUserId
                        ? f.AddresseeId : f.RequesterId,
                    UserName = f.RequesterId == request.CurrentUserId
                        ? f.Addressee.UserName : f.Requester.UserName,
                    FirstName = f.RequesterId == request.CurrentUserId
                        ? f.Addressee.FirstName : f.Requester.FirstName,
                    LastName = f.RequesterId == request.CurrentUserId
                        ? f.Addressee.LastName : f.Requester.LastName,
                    AvatarUrl = f.RequesterId == request.CurrentUserId
                        ? f.Addressee.AvatarUrl : f.Requester.AvatarUrl,
                    IsOnline = f.RequesterId == request.CurrentUserId
                        ? f.Addressee.IsOnline : f.Requester.IsOnline,
                    // UpdatedAt là thời điểm accept (kết bạn)
                    FriendSince = f.UpdatedAt ?? f.CreatedAt
                }).ToListAsync();

            return friends;

        }
    }
}

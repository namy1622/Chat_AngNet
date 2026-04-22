using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Application.Features.Friendship.Queries.GerFriendshipById.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Queries.GerFriendshipById
{
    public class GetFriendshipByIdQueryHandler : IRequestHandler<GetFriendshipByIdQuery, FriendshipDetailDto>
    {
        private readonly IChatContext _chatContext;

        public GetFriendshipByIdQueryHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<FriendshipDetailDto> Handle(GetFriendshipByIdQuery request, CancellationToken cancellationToken)
        {
            // tim friendship record theo Id
            var friendship = _chatContext.Friendships.FirstOrDefault(f => f.Id == request.FriendshipId);
            if (friendship == null)
            {
                throw new Exception("Friendship not found");
            }

            // Tra ve DTO voi thong tin can thiet
            return new FriendshipDetailDto
            {
                FriendshipId = friendship.Id,
                RequesterId = friendship.RequesterId,
                AddresseeId = friendship.AddresseeId,
                Status = friendship.Status.ToString()
            };
        }
    }
}

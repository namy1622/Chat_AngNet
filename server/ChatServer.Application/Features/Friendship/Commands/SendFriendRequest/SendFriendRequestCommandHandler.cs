using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using ChatServer.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Commands.SendFriendRequest
{
    public class SendFriendRequestCommandHandler : IRequestHandler<SendFriendRequestCommand, Guid>
    {
        private readonly IChatContext _chatContext;

        public SendFriendRequestCommandHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<Guid> Handle(SendFriendRequestCommand request, CancellationToken cancellationToken)
        {
            //
            if(request.CurrentUserId == request.AddresseeId)
            {
                throw new Exception("Cannot send friend request to yourself!!!");
            }

            // check co friendship chua (check 2 chieu: A -> B va B -> A)
            var existing = await _chatContext.Friendships
                .FirstOrDefaultAsync(f =>
                    f.RequesterId == request.CurrentUserId
                    && f.AddresseeId == request.AddresseeId
                    ||
                    f.RequesterId == request.AddresseeId
                    && f.AddresseeId == request.CurrentUserId,
                    cancellationToken);

            // neu co -> check trang thai
            if(existing != null)
            {
                if (existing.Status == FriendshipStatus.Accepted)
                    throw new Exception("You are already friends.");

                if (existing.Status == FriendshipStatus.Pending)
                    throw new Exception("Friend request already pending.");

                // neu truoc do bi rejected or removed -> cho phep gui lai
                // update record cu thay vi tao moi
                if(existing.Status == FriendshipStatus.Rejected || existing.Status == FriendshipStatus.Removed)
                {
                    existing.RequesterId = request.CurrentUserId;
                    existing.AddresseeId = request.AddresseeId;
                    existing.Status = FriendshipStatus.Pending;
                    existing.UpdatedAt = DateTime.UtcNow;

                    await _chatContext.SaveChangesAsync(cancellationToken);

                    return existing.Id;
                }

                if (existing.Status == FriendshipStatus.Blocked)
                    throw new Exception("Cannot send friend request.You are blocked by this user.");
            }

            // chua co record -> tao moi Friendship
            var friendship = new Domain.Entities.Friendship
            {
                Id = Guid.NewGuid(),
                RequesterId = request.CurrentUserId,    // user gui
                AddresseeId = request.AddresseeId,      // user nhan
                Status = FriendshipStatus.Pending,     
                CreatedAt = DateTime.UtcNow
            };

            _chatContext.Friendships.Add(friendship);
            await _chatContext.SaveChangesAsync(cancellationToken);

            return friendship.Id;
        }
    }
}

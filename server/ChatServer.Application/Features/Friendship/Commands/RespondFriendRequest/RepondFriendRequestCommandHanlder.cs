using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Commands.RespondFriendRequest
{
    public class RepondFriendRequestCommandHanlder : IRequestHandler<RepondFriendRequestCommand, bool>
    {
        private readonly IChatContext _chatContext;

        public RepondFriendRequestCommandHanlder(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<bool> Handle(RepondFriendRequestCommand request, CancellationToken cancellationToken)
        {
            // tim friendship record theo id
            var friendship = await _chatContext.Friendships
                .FirstOrDefaultAsync(f => f.Id == request.FriendshipId, cancellationToken);

            if (friendship == null) throw new Exception("Friend request not found...");

            // chi nguoi DUOC GUI loi moi moi duoc respond
            if (friendship.AddresseeId != request.CurrentUserId) throw new Exception("Only the addressee can reponsd");

            // chi respond khi status la pending
            if (friendship.Status != FriendshipStatus.Pending) throw new Exception("Request is no longer pending");

            // update status: Accept/Reject
            friendship.Status = request.IsAccepted ? FriendshipStatus.Accepted : FriendshipStatus.Rejected;

            friendship.UpdatedAt = DateTime.UtcNow;

            await _chatContext.SaveChangesAsync(cancellationToken);

            return true;

        }
    }
}

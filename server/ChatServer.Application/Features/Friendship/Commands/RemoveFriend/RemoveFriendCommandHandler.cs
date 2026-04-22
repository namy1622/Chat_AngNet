using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Commands.RemoveFriend
{
    public class RemoveFriendCommandHandler : IRequestHandler<RemoveFriendCommand, bool>
    {
        private readonly IChatContext _chatContext;

        public RemoveFriendCommandHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<bool> Handle(RemoveFriendCommand request, CancellationToken cancellationToken)
        {
            // tim friendship record
            var friendship = await _chatContext.Friendships
                .FirstOrDefaultAsync(f => f.Id == request.FriendshipId, cancellationToken);

            if (friendship == null) throw new Exception("Friendship not found...");

            // chi nguoi trong friendship moi duoc xoa
            if (friendship.AddresseeId != request.CurrentUserId && friendship.RequesterId != request.CurrentUserId)
                throw new Exception("You are not part of this friendship.");

            // chi xoa khi la banbe (Accepted)
            if (friendship.Status != FriendshipStatus.Accepted) throw new Exception("Not currently friends.");

            friendship.Status = FriendshipStatus.Removed;
            friendship.UpdatedAt = DateTime.UtcNow;

            await _chatContext.SaveChangesAsync(cancellationToken);

            return true;

        }
    }
}

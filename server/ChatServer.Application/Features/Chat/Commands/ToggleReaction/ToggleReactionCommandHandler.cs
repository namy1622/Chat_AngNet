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

namespace ChatServer.Application.Features.Chat.Commands.ToggleReaction
{
    public class ToggleReactionCommandHandler : IRequestHandler<ToggleReactionCommand, string>
    {
        private readonly IChatContext _chatContext;

        public ToggleReactionCommandHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<string> Handle(ToggleReactionCommand request, CancellationToken cancellationToken)
        {
            var existingReaction = await _chatContext.MessageReactions
                .FirstOrDefaultAsync(r =>
                    r.MessageId == request.MessageId &&
                    r.UserId == request.UserId &&
                    r.Type == (ReactionType)request.ReactionType,
                    cancellationToken);

            if(existingReaction != null)
            {
                // user has already reacted -> remove reaction
                _chatContext.MessageReactions.Remove(existingReaction);
                await _chatContext.SaveChangesAsync(cancellationToken);

                return "removed";

            }
            else
            {
                var oldReaction = await _chatContext.MessageReactions
                    .FirstOrDefaultAsync(r => r.MessageId == request.MessageId
                                        && r.UserId == request.UserId,
                                        cancellationToken);

                // user da co reaction -> xoa truoc khi them reaction moi
                if(oldReaction != null)
                {
                    _chatContext.MessageReactions.Remove(oldReaction);
                }

                var reaction = new MessageReaction
                {
                    Id = Guid.NewGuid(),
                    MessageId = request.MessageId,
                    UserId = request.UserId,
                    Type = (ReactionType)request.ReactionType,
                    ReactedAt = DateTime.UtcNow
                };

                _chatContext.MessageReactions.Add(reaction);
                await _chatContext.SaveChangesAsync(cancellationToken);

                return "added";
            }
        }
    }
}

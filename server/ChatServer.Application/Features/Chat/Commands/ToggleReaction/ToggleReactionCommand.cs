using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Commands.ToggleReaction
{
    public record ToggleReactionCommand(
        Guid MessageId,
        Guid UserId,
        int ReactionType 
        ): IRequest<string>;

}

using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Commands.RemoveFriend
{
    public record RemoveFriendCommand(
        Guid FriendshipId,  // id ban ghi friendship
        Guid CurrentUserId  // user thuc hien xoa
        ): IRequest<bool>;

}

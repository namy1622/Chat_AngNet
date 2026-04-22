using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Commands.SendFriendRequest
{
    // command gui loi moi ket ban
    // input: AddresseeId - user nhan, CurrentUserId - user gui
    // output: Guid - Id cua FriendShip moi tao
    public record SendFriendRequestCommand(
        Guid AddresseeId,  // user nhan loi moi ket ban
        Guid CurrentUserId // user gui (lay tu JWT token)
        ) : IRequest<Guid>;
}

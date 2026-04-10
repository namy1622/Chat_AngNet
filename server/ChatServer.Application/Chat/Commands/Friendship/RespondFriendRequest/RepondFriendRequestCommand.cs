using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Friendship.RespondFriendRequest
{
    // Command de chap nhan/ tu choi loi moi ket ban
    public record RepondFriendRequestCommand (
        Guid FriendshipId, // Id ban ghi FriendShip
        Guid CurrentUserId, // nguoi dang respond 
        bool IsAccepted // true = chap nhan, false = tu choi
        ) : IRequest<bool>;

}

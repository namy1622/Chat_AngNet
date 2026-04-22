using ChatServer.Application.Features.Friendship.Queries.GetFriendshipStatus.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Queries.GetFriendshipStatus
{
   public record GetFriendshipStatusQuery (
       Guid CurrentUserId,
       Guid TargetUserId
       ): IRequest<FriendshipStatusDto>;

}

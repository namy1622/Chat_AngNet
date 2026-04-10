using ChatServer.Application.Chat.Queries.Friendship.GerFriendshipById.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Friendship.GerFriendshipById
{
    public record GetFriendshipByIdQuery(
        Guid FriendshipId
        ): IRequest<FriendshipDetailDto>;

}

using ChatServer.Application.Features.Friendship.Queries.GerFriendshipById.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Queries.GerFriendshipById
{
    public record GetFriendshipByIdQuery(
        Guid FriendshipId
        ): IRequest<FriendshipDetailDto>;

}

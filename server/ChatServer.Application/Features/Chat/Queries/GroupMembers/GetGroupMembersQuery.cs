using ChatServer.Application.Features.Chat.Queries.GetGroupMembers.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetGroupMembers
{
    // query: get list member in group chat
    // in: conversationId
    // out: List<GroupMemberDto>
   public record GetGroupMembersQuery(Guid ConversationId, Guid CurrentUserId) : IRequest<List<GroupMemberDto>>;
}

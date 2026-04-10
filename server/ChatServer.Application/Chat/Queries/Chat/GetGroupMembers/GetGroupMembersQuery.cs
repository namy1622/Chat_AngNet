using ChatServer.Application.Chat.Queries.Chat.GetGroupMembers.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Chat.GetGroupMembers
{
    // query: get list member in group chat
    // in: conversationId
    // out: List<GroupMemberDto>
   public record GetGroupMembersQuery(Guid ConversationId, Guid CurrentUserId) : IRequest<List<GroupMemberDto>>;
}

using ChatServer.Application.Chat.Queries.Chat.GetGroupMembers.Dto;
using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Chat.GetGroupMembers
{
    public class GetGroupMembersQueryHanlder : IRequestHandler<GetGroupMembersQuery, List<GroupMemberDto>>
    {
        private readonly IChatContext _context;

        public GetGroupMembersQueryHanlder(IChatContext context)
        {
            _context = context;
        }

        public async Task<List<GroupMemberDto>> Handle(GetGroupMembersQuery request, CancellationToken cancellationToken)
        {
            // check quyen
            var isMember = await _context.ConversationParticipants
                .AnyAsync(p => p.ConversationId == request.ConversationId
                        && p.UserId == request.CurrentUserId,
                        cancellationToken);

            if (!isMember) return new List<GroupMemberDto>(); // ko phai member -> return rong
            // Lay all participant cua conversation
            var members = await _context.ConversationParticipants
                .Where(cp => cp.ConversationId == request.ConversationId)
                .Include(cp => cp.User)
                .OrderByDescending(cp => cp.Role) // sort: owner > admin > member
                .ThenBy(cp => cp.JoinedAt) // cung role thi member join truoc se xep truoc
                .Select(cp => new GroupMemberDto
                {
                    UserId = cp.UserId,
                    UserName = cp.User.UserName,
                    DisplayName = cp.User.DisplayName,
                    AvatarUrl = cp.User.AvatarUrl,

                    Role = cp.Role.ToString(),
                    JoinedAt = cp.JoinedAt
                }).ToListAsync(cancellationToken);

            return members;
        }
    }
}

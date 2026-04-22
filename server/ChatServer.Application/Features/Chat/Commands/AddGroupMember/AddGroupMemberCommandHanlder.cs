using ChatServer.Application.Common.Exceptions;
using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Commands.AddGroupMember
{
    public class AddGroupMemberCommandHanlder : IRequestHandler<AddGroupMemberCommand, bool>
    {
        private readonly IChatContext _chatContext;

        public AddGroupMemberCommandHanlder(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<bool> Handle(AddGroupMemberCommand request, CancellationToken cancellationToken)
        {
            // tim conversation check exist
            var conversation = await _chatContext.Conversations.FindAsync(request.ConversationId);
            if (conversation == null)
                throw new UserFriendlyException("- Conversation isnot exist");

            // check conversation co phair group ko
            if(conversation.Type != Domain.Enum.ConversationType.Group)
                throw new UserFriendlyException("- Conversation isnot group");

            // check quyen:
            var currentUserParticipant = await _chatContext.ConversationParticipants
                .FirstOrDefaultAsync(p => p.ConversationId == request.ConversationId
                                    && p.UserId == request.CurrentUserId,
                                    cancellationToken);

            if (currentUserParticipant == null)
                throw new UserFriendlyException("- Current user is not a participant of the conversation");

            // chi owner/admin moi duoc them member
            if(currentUserParticipant.Role != Domain.Enum.ParticipantRole.Owner
                && currentUserParticipant.Role != Domain.Enum.ParticipantRole.Admin){
                throw new UserFriendlyException("- Current user does not have permission to add members");
            }

            // lay list member trong group -> de check loc
            var existingParticipant = await _chatContext.ConversationParticipants
                .Where(p => p.ConversationId == request.ConversationId)
                .Select(p => p.UserId)
                .ToListAsync(cancellationToken);
            // Loc user chua la member trong group
            var newMember = request.NewMemberIds
                .Distinct()
                .Except(existingParticipant)
                .Select(userId => new ConversationParticipant
                {
                    Id = Guid.NewGuid(),
                    ConversationId = request.ConversationId,
                    UserId = userId,
                    Role = Domain.Enum.ParticipantRole.Member,
                    JoinedAt = DateTime.UtcNow,
                }).ToList();

            // neu tat ca da la member -> ko can them
            if (newMember.Count == 0)
                return true;
                //throw new UserFriendlyException("- All selected users have become members of the group");

            //
            foreach(var member in newMember)
            {
                _chatContext.ConversationParticipants.Add(member);
            }
            await _chatContext.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}

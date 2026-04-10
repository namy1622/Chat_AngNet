using ChatServer.Application.Common.Exceptions;
using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Groups.LeaveGroup
{
    public class LeaveGroupCommandHandler : IRequestHandler<LeaveGroupCommand, bool>
    {
        private readonly IChatContext _chatContext;

        public LeaveGroupCommandHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<bool> Handle(LeaveGroupCommand request, CancellationToken cancellationToken)
        {
            // tim participant record cua nguoi muon roi
            var participant = await _chatContext.ConversationParticipants
                .FirstOrDefaultAsync(p => p.ConversationId == request.ConversationId
                                    && p.UserId == request.CurrentUserId,
                                    cancellationToken);

            if(participant == null)
                throw new UserFriendlyException("- You aren't a member of this group.");

            // check conversation phai la group ko
            var conversation = await _chatContext.Conversations
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken);

            if (conversation == null || conversation.Type != Domain.Enum.ConversationType.Group)
                throw new UserFriendlyException("- Conversation is not exist or not a group.");

            // neu la owner -> transfer owner for another member
            if (participant.Role == Domain.Enum.ParticipantRole.Owner)
            {
                // tim member khac de chuyen quyen owner
                // uu tien admin -> member tham gia som nhat
                var nextOwner = await _chatContext.ConversationParticipants
                    .Where(cp => cp.ConversationId == request.ConversationId
                                && cp.UserId != request.CurrentUserId)
                    // OrderByDescendingRole: admin 1 -> member 0
                    // thenBy JoinedAt: nguoi vao som nhat uu tien
                    .OrderByDescending(p => p.Role)
                    .ThenBy(p => p.JoinedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                if(nextOwner != null)
                {
                    nextOwner.Role = Domain.Enum.ParticipantRole.Owner;
                }
                else
                {
                    // ko co member nao -> xoa luon group
                    _chatContext.Conversations.Remove(conversation);
                }
            }

            // xoa participant record
            // remove: danh dau record de xoa khi SaveChanges
            _chatContext.ConversationParticipants.Remove(participant);

            await _chatContext.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}

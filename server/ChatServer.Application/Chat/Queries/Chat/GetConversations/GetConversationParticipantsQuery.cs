using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Chat.GetConversations
{
    // Input: ConversationId
    // Output: List UserId cua member
    public record GetConversationParticipantsQuery(Guid ConversationId) : IRequest<List<Guid>>;
   
}

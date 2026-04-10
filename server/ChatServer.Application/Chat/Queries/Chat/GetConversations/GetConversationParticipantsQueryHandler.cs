using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Chat.GetConversations
{
    public class GetConversationParticipantsQueryHandler : IRequestHandler<GetConversationParticipantsQuery, List<Guid>>
    {
        private readonly IChatContext _context;

        public GetConversationParticipantsQueryHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<List<Guid>> Handle(GetConversationParticipantsQuery request, CancellationToken cancellationToken)
        {
            // lay all UserId cua member trong conversation
            return await _context.ConversationParticipants
                 .Where(cp => cp.ConversationId == request.ConversationId)
                 .Select(cp => cp.UserId)
                 .ToListAsync(cancellationToken);
        }
    }
}

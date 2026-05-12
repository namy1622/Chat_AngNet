using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.ConversationByMessageId
{
    public class GetConversationByMessageIdQueryHanlder : IRequestHandler<GetConversationByMessageIdQuery, Guid>
    {
        private readonly IChatContext _chatContext;

        public GetConversationByMessageIdQueryHanlder(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<Guid> Handle(GetConversationByMessageIdQuery request, CancellationToken cancellationToken)
        {
            var conversation = await _chatContext.Messages
                .FirstOrDefaultAsync(m => m.Id == request.MessageId, cancellationToken);
            if (conversation == null) throw new Exception("Message not found");

            return conversation.ConversationId;
        }
    }
}

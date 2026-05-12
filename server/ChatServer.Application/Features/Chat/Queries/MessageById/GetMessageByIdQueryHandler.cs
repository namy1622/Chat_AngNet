using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetMessageById
{
    public class GetMessageByIdQueryHandler : IRequestHandler<GetMessageByIdQuery, string>
    {
        private readonly IChatContext _context;

        public GetMessageByIdQueryHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<string> Handle(GetMessageByIdQuery request, CancellationToken cancellationToken)
        {
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == request.MessageId);

            return message?.Content ?? "";
        }
    }
}

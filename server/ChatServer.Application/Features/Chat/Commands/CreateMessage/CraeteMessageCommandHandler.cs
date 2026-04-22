using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Commands.CreateMessage
{
    // IRequestHandler<CraeteMessageCommand, Response> nhan vao CreateMessageCommand va tra ve Guid (id cua tin nhan moi) 
    public class CraeteMessageCommandHandler : IRequestHandler<CreateMessageCommand, Guid>
    {
        private readonly IChatContext _context;

        public CraeteMessageCommandHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
        {
            // 1. tao enittyMessage moi tu data Command gui xuong
            var entity = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = request.ConversationId,
                SenderId = request.SenderId,
                Content = request.Content,
                Type = Domain.Enum.MessageType.Text, // mac dinh la text
                CreatedAt = DateTime.UtcNow,
                //CreatedBy = request.SenderId.ToString()

                ReplyToId = request.ReplyToId,
            };

            // 2. them vao DbSet<Message>
            _context.Messages.Add(entity);

            // 3. luu thay doi vao db
            await _context.SaveChangesAsync(cancellationToken);

            // 4. tra ve id tin nhan vua tao
            return entity.Id;
        }
    }
}

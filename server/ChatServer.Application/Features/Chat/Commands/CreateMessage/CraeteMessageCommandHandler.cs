using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using ChatServer.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
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
            var messageType = MessageType.Text;  //  mặc định là Text - Nếu có fileIds → xác định theo loại file
            // 1. tao enittyMessage moi tu data Command gui xuong
            var entity = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = request.ConversationId,
                SenderId = request.SenderId,
                Content = request.Content,
                Type = messageType, 
                CreatedAt = DateTime.UtcNow,
                //CreatedBy = request.SenderId.ToString()

                ReplyToId = request.ReplyToId,
            };

            // 2. them vao DbSet<Message>
            _context.Messages.Add(entity);


            // --- xử lý file attachments ---
            if (request.FileIds != null && request.FileIds.Count > 0)
            {
                // query các file thuộc về user này (bảo mật: không cho gắn file của người khác)
                var files = await _context.FileAttachments
                    .Where(f => request.FileIds.Contains(f.Id)
                             && f.UploadedByUserId == request.SenderId)
                    .ToListAsync(cancellationToken);

                if (files.Count > 0)
                {
                    // Xác định MessageType dựa trên loại file
                    // Nếu tất cả đều là ảnh → Image, còn lại → File
                    entity.Type = files.All(f => f.FileType == FileType.Image)
                        ? MessageType.Image
                        : MessageType.File;

                    // Tạo bản ghi liên kết Message ← → File
                    for (int i = 0; i < files.Count; i++)
                    {
                        _context.MessageAttachments.Add(new MessageAttachment
                        {
                            //Id = Guid.NewGuid(),
                            MessageId = entity.Id,
                            FileAttachmentId = files[i].Id,
                            OrderIndex = i
                        });
                    }
                }
            }


            // 3. luu thay doi vao db
            await _context.SaveChangesAsync(cancellationToken);

            // 4. Cập nhật LastMessage cho Conversation
            var conversation = await _context.Conversations.FindAsync(request.ConversationId);
            if (conversation != null)
            {
                conversation.LastMessageId = entity.Id;
                await _context.SaveChangesAsync(cancellationToken);
            }

            // 4. tra ve id tin nhan vua tao
            return entity.Id;
        }
    }
}

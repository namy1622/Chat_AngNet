using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Application.Features.Chat.Queries.GetMessages.Dto;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetMessageAttachmentsQueries
{
    public class GetMessageAttachmentsQueryHandler : IRequestHandler<GetMessageAttachmentsQuery, List<AttachmentDto>>
    {
        private readonly IChatContext _context;

        public GetMessageAttachmentsQueryHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<List<AttachmentDto>> Handle(GetMessageAttachmentsQuery request, CancellationToken cancellationToken)
        {
            // các file đính kèm liên kết với MessageId
            var attachments = await _context.MessageAttachments
                .Where(ma => ma.MessageId == request.MessageId)
                .OrderBy(ma => ma.OrderIndex)
                .Include(ma => ma.FileAttachment)
                .Select(ma => new AttachmentDto
                {
                    FileId = ma.FileAttachment.Id,
                    FileName = ma.FileAttachment.OriginalFileName,
                    Url = $"/api/file/{ma.FileAttachment.Id}",
                    ThumbnailUrl = ma.FileAttachment.ThumbnailPath != null
                        ? $"/api/file/{ma.FileAttachment.Id}/thumbnail"
                        : null,
                    ContentType = ma.FileAttachment.ContentType,
                    Size = ma.FileAttachment.Size,
                    FileType = ma.FileAttachment.FileType.ToString()
                })
                .ToListAsync(cancellationToken);

            return attachments;
        }
    }
}

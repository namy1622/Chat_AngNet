using ChatServer.Application.Features.Chat.Queries.GetMessages.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetMessageAttachmentsQueries
{
    // Lấy danh sách file đính kèm của một tin nhắn cụ thể
    // Dùng khi cần gửi data attachments qua SignalR
    public record GetMessageAttachmentsQuery(Guid MessageId) : IRequest<List<AttachmentDto>>;
}

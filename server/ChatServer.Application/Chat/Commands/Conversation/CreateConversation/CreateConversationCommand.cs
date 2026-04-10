using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Conversation.CreateConversation
{
    // Input: Id cua nguoi minh muon chat
    // Output: Id cua cuoc hoi thoai (cu/moi)
    public record CreateConversationCommand
    (
        Guid TargetUserId,
        Guid CurrentUserId
    ) : IRequest<Guid>; 
    // nhan vao TargetUserId (nguoi muon tao cuoc tro chuyen voi ai) va CurrentUserId (nguoi dang request)
    // tra ve Guid (id cua cuoc tro chuyen moi duoc tao)
}

using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Groups.AddGroupMember
{
    // Command them member vao group chat
    // chi owner/ admin moi duoc phep them member
    public record AddGroupMemberCommand
    (
        Guid ConversationId,  // group muon them member
        List<Guid> NewMemberIds, // ds userId muon them
        Guid CurrentUserId  // nguoi dang thuc hien them (owner/ admin)
    ) : IRequest<bool>;  // true neu them success, false neu them fail (ko phai loi exception)
}

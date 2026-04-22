using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Commands.CreateGroupConversation
{
    // Command tao new group chat 
    // record: kieu class dac bietm immutable (ko thay doi sau khi tao), tu co constructor, de dung de chuyen du lieu (DTO)
    // IRequest<Guid>: noi cho MediatR biet command nay tra ve Guid (conversationId moi tao)
    public record CreateGroupConversationCommand
    (
        string Name, // groupName
        List<Guid> MemberIds, 
        Guid CurrentUserId
    ) : IRequest<Guid>;

    // khi Controller goi _mediator.Send(command) 
    // -> MediatR se tim handler tuong ung -> chay logic -> tra ve conversationId
}

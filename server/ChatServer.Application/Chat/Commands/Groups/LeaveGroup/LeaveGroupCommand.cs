using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Groups.LeaveGroup
{
    public record LeaveGroupCommand
    (
        Guid ConversationId, // group muon roi
        Guid CurrentUserId   // nguoi muon roi
    ) : IRequest<bool>; 
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetGroupMembers.Dto
{
    // DTO tra ve thong tin 1 thanh vien trong group chat

    public class GroupMemberDto
    {
        public Guid UserId { set; get; }
        public string UserName { set; get; }
        public string? DisplayName { set; get; }
        public string? AvatarUrl { set; get; }
        public string Role { set; get; } // owner/admin/member -- string để dễ hiển thị FE 
        public DateTime JoinedAt { set; get; } // ngay tham gia group
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Queries.GetPendingRequests.Dto
{
    public class FriendRequestDto
    {
        public Guid FriendshipId { get; set; }  // id bản ghi friendship
        public Guid RequesterId { get; set; }   // người gửi lời mời
        public string RequesterName { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string? AvatarUrl { get; set; }
        public DateTime SentAt { get; set; }    // thời điểm gửi
    }
}

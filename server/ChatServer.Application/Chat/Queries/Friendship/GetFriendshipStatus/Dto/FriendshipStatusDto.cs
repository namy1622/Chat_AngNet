using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Friendship.GetFriendshipStatus.Dto
{
    public class FriendshipStatusDto
    {
        public Guid? FriendshipId { get; set; }  // null nếu chưa có relationship
        public string Status { get; set; } = "None"; // None, Pending, Accepted, Blocked, Rejected, Removed
        public bool IsRequester { get; set; }    // true nếu mình là người gửi lời mời
    }
}

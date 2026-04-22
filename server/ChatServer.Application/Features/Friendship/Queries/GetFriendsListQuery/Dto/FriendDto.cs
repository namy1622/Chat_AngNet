using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Queries.GetFriendsListQuery.Dto
{
    public class FriendDto
    {
        public Guid FriendshipId { set; get; }
        public Guid UserId { set; get; }
        public string UserName { set; get; } = "";
        public string FirstName { set; get; } = "";
        public string LastName { set; get; } = "";
        public string? AvatarUrl { set; get; }
        public bool IsOnline { set; get; }
        public DateTime FriendSince { set; get;}
    }
}

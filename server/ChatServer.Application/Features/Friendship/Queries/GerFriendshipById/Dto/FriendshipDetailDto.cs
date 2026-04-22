using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Friendship.Queries.GerFriendshipById.Dto
{
    public class FriendshipDetailDto
    {
        public Guid FriendshipId { set; get; }// nguoi gui loi moi
        public Guid RequesterId { set; get; }// nguoi nhan loi moi
        public Guid AddresseeId { set; get; }
        public string Status { set; get; } = "";
    }
}

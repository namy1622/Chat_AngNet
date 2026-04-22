using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Users.Queries.Dto
{
    public class UserDto
    {
        public Guid Id { set; get; }
        public string UserName { set; get; }
        public string FirstName { set; get; }
        public string LastName { set; get; }
        public string AvatarUrl { set; get; }
        public bool IsOnline { set; get; }
    }
}

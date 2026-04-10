namespace ChatServer.API.DTO.Chat
{
    public class CreateGroupRequest
    {
        // DTO nhan data tu FE khi tao nhom nhat
        // FE se gui JSON : { "name": "Group 1", "memberIds": ["guid1", "guid2", ...] }
        // .NET tu map JSON -> object nay (model binding)
        public string Name { set; get; } // groupName
        public List<Guid> MemberIds { set; get; }// list userId duoc moi vao group
    }
}

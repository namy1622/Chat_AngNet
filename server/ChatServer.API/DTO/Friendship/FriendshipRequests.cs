namespace ChatServer.API.DTO.Friendship
{

    // DTO nhan request gui loi moi ket ban
    public class SendFriendRequestDto
    {
        public Guid AddresseeId { set; get; }
    }

    // DTO nhan response (accept/reject) loi moi ket ban
    public class RespondFriendRequestDto
    {
        public bool IsAccepted { set; get; }
    }
    public class FriendshipRequests
    {
    }
}

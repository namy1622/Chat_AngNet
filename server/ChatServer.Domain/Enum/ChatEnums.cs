namespace ChatServer.Domain.Enum;

public enum ConversationType
{
    Private = 0,
    Group = 1,
    Channel = 2
}

public enum MessageType
{
    Text = 0,
    Image = 1,
    File = 2,
    Video = 3,
    Audio = 4,
    Call = 5,
    System = 99
}

public enum ParticipantRole
{
    Member = 0,
    Admin = 1,
    Moderator = 2,
    Owner = 3
}

public enum FriendshipStatus
{
    Pending = 0,
    Accepted = 1,
    Blocked = 2,
    Rejected = 3,
    Removed = 4
}

public enum ReactionType 
{
    None = 0,
    Like = 1,       // 👍
    Heart = 2,      // ❤️
    Laugh = 3,      // 😂   
    Wow = 4,        // 😮
    Sad = 5,        // 😢
    Angry = 6       // 😡
}

public enum NotificationType
{
    Message = 0,
    FriendRequest = 1,
    GroupInvite = 2,
    Call = 3,
    System = 99
}

public enum CallStatus
{
    Pending = 0,
    Accepted = 1,
    Rejected = 2,
    Cancelled = 3,
    Completed = 4,
    Missed = 5
}

public enum CallType
{
    Audio = 0,
    Video = 1
}

public enum CallDirection
{
    Incoming = 0,
    Outgoing = 1
}




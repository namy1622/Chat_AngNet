// Dto cho ban be (danh dach ban)
export interface FriendDto {
    friendshipId: string; // id ban ghi friendship
    userId: string; // id user ban be
    userName: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    isOnline: boolean;
    friendSince: string; // ngay ket ban
}

// Dto cho loi moi ket ban()
export interface FriendRequestDto {
    friendshipId: string;
    requesterId: string;
    requesterName: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    sentAt: string;
}

// Dto trang thai ket ban giua 2 user
export interface FriendshipStatusDto {
    friendshipId: string | null;
    status: string; // None | Pending | Accepted | Rejected | Remove
    isRequester: boolean; // true neu minh la nguoi gui loi moi
}
export interface ConversationDto {
    id: string;
    name: string;
    avatarUrl: string;
    lastMessage: string;
    lastMessageTime: string;
    isOnline: boolean;
    unreadCount: number;
    type: string; // private/group/... 
    memberCount: number;
}
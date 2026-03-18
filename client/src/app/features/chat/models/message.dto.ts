export interface MessageDto {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createAt: string;
    isMine: boolean; // true: tin nhan cua minh
    isRead: boolean; // true: da duoc doc
}
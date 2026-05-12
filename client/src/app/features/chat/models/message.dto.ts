import { ReactionDto } from "./reaction.dto";

export interface MessageDto {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createAt: string;
    isMine: boolean; // true: tin nhan cua minh
    isRead: boolean; // true: da duoc doc

    //--- reply message ---
    replyToId?: string // tin nhan goc
    replyToContent?: string; // noi dung tin nhan goc
    replyToSenderName?: string; // ten nguoi gui tin nhan goc

    reactions?: ReactionDto[];
}
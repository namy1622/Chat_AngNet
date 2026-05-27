import { AttachmentDto } from "./attachment.dto";
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

     // ===== file attachments =====
    messageType?: number;           // 0=Text, 1=Image, 2=File, 3=Video, 4=Audio
    attachments?: AttachmentDto[];   // danh sách file đính kèm
}
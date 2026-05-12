
export interface ReactionDto {
    type: number;           // ReactionType enum (1=Like, 2=Heart,...)
    emoji: string;          // ky tu emoji tuong ung
    count: number;          // so luong nguoi da react loai nay
    userReacted: boolean;   // true = minh da react loai nay (de highlight)
}

export const REACTION_EMOJIS: { [key: number]: string } = {
    1: '👍',  // Like
    2: '❤️',  // Heart
    3: '😂',  // Laugh
    4: '😮',  // Wow
    5: '😢',  // Sad
    6: '😡',  // Angry
};
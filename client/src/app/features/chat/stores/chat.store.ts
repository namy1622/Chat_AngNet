import { inject } from "@angular/core";
import { ConversationDto } from "../models/conversation.dto";
import { GroupMemberDto } from "../models/group-member.dto";
import { MessageDto } from "../models/message.dto";
import { ChatService } from "../services/chat.service";
import { SignalrService } from "../../../core/services/signalr.service";
import { AuthService } from "../../../core/services/auth.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { firstValueFrom } from "rxjs";
import { signalStore, withState, withMethods, withHooks, patchState } from '@ngrx/signals';
import { REACTION_EMOJIS } from "../models/reaction.dto";

// Định nghĩa cấu trúc State
type ChatState = {
    activeConversationId: string | null; // theo doi id conversation hien tai
    messages: MessageDto[];
    currentConversation: ConversationDto | null;
    groupMembers: GroupMemberDto[];
    participantIds: string[];
    typingUser: string | null;
    replyingTo: MessageDto | null;
}

// Giá trị khởi tạo mặc định
const initialState: ChatState = {
    activeConversationId: null,
    messages: [],
    currentConversation: null,
    groupMembers: [],
    participantIds: [],
    typingUser: null,
    replyingTo: null,
};

// khoi tao SignalStore
export const ChatStore = signalStore(
    { providedIn: 'root' }, // cung cap global - toan app
    withState(initialState),
    withMethods(
        (
            store,
            chatService = inject(ChatService),
            signalrService = inject(SignalrService),
            authService = inject(AuthService)
        ) => {
            // Lấy currentUser một cách đồng bộ thông qua toSignal
            const currentUser = toSignal(authService.currentUser$);
            let typingTimeout: any = null;

            return {
                // --- CÁC HÀM CẬP NHẬT STATE LOCAL ---
                setActiveConversationId(id: string | null) {
                    patchState(store, { activeConversationId: id });
                },
                setReplyingTo(message: MessageDto | null) {
                    patchState(store, { replyingTo: message });
                },

                // --- B. CÁC HÀM GỌI API (BẤT ĐỒNG BỘ) ---
                async loadMessages(conversationId: string) {
                    try {
                        // firstValueFrom đổi Observable thành Promise (cách viết async/await dễ đọc hơn subscribe)
                        const msgs = await firstValueFrom(chatService.getMessages(conversationId));
                        patchState(store, { messages: msgs });

                        // Call API đánh dấu đã đọc
                        chatService.markAsRead(conversationId).subscribe();
                    } catch (err) {
                        console.error('-- Error loading messages:', err);
                    }
                },
                async loadConversationInfo(conversationId: string) {
                    try {
                        const conversation = await firstValueFrom(chatService.getConversationById(conversationId));
                        patchState(store, { currentConversation: conversation });
                        // Tiện thể load luôn members để lấy danh sách ID
                        const members = await firstValueFrom(chatService.getGroupMembers(conversationId));
                        patchState(store, {
                            groupMembers: members,
                            participantIds: members.map(m => m.userId)
                        });
                    } catch (err) {
                        console.error('-- Error loading conversation info:', err);
                    }
                },
                async loadGroupMembers(conversationId: string) {
                    try {
                        const members = await firstValueFrom(chatService.getGroupMembers(conversationId));
                        patchState(store, { groupMembers: members });
                    } catch (err) {
                        console.error('-- Error loading members:', err);
                    }
                },
                async sendMessage(conversationId: string, content: string) {
                    const replyId = store.replyingTo()?.id;

                    // Clear typing khi gửi xong
                    if (typingTimeout) clearTimeout(typingTimeout);
                    patchState(store, { typingUser: null });
                    try {
                        await firstValueFrom(chatService.sendMessage(conversationId, content, replyId));
                        patchState(store, { replyingTo: null }); // Reset reply trạng thái
                    } catch (err) {
                        console.error('-- Error sending message:', err);
                    }
                },
                async toggleReaction(messageId: string, reactionType: number) {
                    try {
                        await firstValueFrom(chatService.toggleReaction(messageId, reactionType));
                    } catch (err) {
                        console.error(' -- Error toggling reaction:', err);
                    }
                },

                // --- CÀI ĐẶT SIGNALR (Lắng nghe Real-time) ---
                _setupSignalRListeners() {
                    // 1. Có tin nhắn mới
                    signalrService.addReceiveMessageListener((senderId, user, message, convId, replyToId, replyContent) => {
                        const isMine = senderId.toLowerCase() === currentUser()?.id.toLowerCase();
                        const newMessage: MessageDto = {
                            id: crypto.randomUUID(),
                            senderId: senderId,
                            senderName: user,
                            content: message,
                            createAt: new Date().toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }),
                            isMine: isMine,
                            isRead: false,
                            replyToId: replyToId || undefined,
                            replyToContent: replyContent || undefined,
                        };

                        patchState(store, { messages: [...store.messages(), newMessage] });
                    });
                    // 2. Đã xem tin nhắn
                    signalrService.addMessageReadListener((convId, readByUserId) => {
                        // Chỉ cập nhật nếu đang ở đúng đoạn chat đó
                        if (convId === store.activeConversationId()) {
                            patchState(store, {
                                messages: store.messages().map(m => m.isMine ? { ...m, isRead: true } : m)
                            });
                        }
                    });
                    // 3. Đang gõ chữ
                    signalrService.addTypingListener((data) => {
                        if (data.conversationId === store.activeConversationId()) {
                            patchState(store, { typingUser: data.userName });
                            if (typingTimeout) clearTimeout(typingTimeout);
                            typingTimeout = setTimeout(() => {
                                patchState(store, { typingUser: null });
                            }, 500);
                        }
                    });
                    // 4. Reactions thả cảm xúc
                    signalrService.addReactionListener((data) => {
                        patchState(store, {
                            messages: store.messages().map(m => {
                                if (m.id !== data.messageId) return m;
                                let reactions = [...(m.reactions || [])];
                                const isMyReaction = data.userId.toLowerCase() === currentUser()?.id.toLowerCase();
                                if (data.action === 'added') {
                                    const idx = reactions.findIndex(r => r.type === data.reactionType);
                                    if (idx >= 0) {
                                        reactions[idx] = { ...reactions[idx], count: reactions[idx].count + 1, userReacted: reactions[idx].userReacted || isMyReaction };
                                    } else {
                                        reactions.push({ type: data.reactionType, emoji: REACTION_EMOJIS[data.reactionType] || '👍', count: 1, userReacted: isMyReaction });
                                    }
                                } else {
                                    // removed
                                    const idx = reactions.findIndex(r => r.type === data.reactionType);
                                    if (idx >= 0) {
                                        if (reactions[idx].count <= 1) reactions.splice(idx, 1);
                                        else reactions[idx] = { ...reactions[idx], count: reactions[idx].count - 1, userReacted: isMyReaction ? false : reactions[idx].userReacted };
                                    }
                                }
                                return { ...m, reactions };
                            })
                        });
                    });
                }
            };
        }
    ),

    // Hook chạy 1 lần khi ứng dụng khởi chạy Store
    withHooks({
        onInit(store) {
            store._setupSignalRListeners();
        }
    })
);

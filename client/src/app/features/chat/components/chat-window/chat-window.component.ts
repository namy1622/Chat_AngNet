import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
// import { map } from 'rxjs';
import { UiButtonComponent } from "../../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { SidebarService } from "../../../../core/services/sidebar.service";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { SignalrService } from '../../../../core/services/signalr.service';
import { ChatService } from '../../services/chat.service';
import { MessageDto } from '../../models/message.dto';
import { ConversationDto } from '../../models/conversation.dto';
import { GroupMemberDto } from '../../models/group-member.dto';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { ChatHeaderComponent } from "../chat-header/chat-header.component";
import { GroupMembersPanelComponent } from "../group-members-panel/group-members-panel.component";
import { ChatInputComponent } from "../chat-input/chat-input.component";
import { REACTION_EMOJIS } from '../../models/reaction.dto';
import { ChatStore } from '../../stores/chat.store';

@Component({
  selector: 'app-chat-window',
  imports: [UiButtonComponent, UiIconComponent, CommonModule, AddMemberDialogComponent, ChatHeaderComponent, GroupMembersPanelComponent, ChatInputComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
  host: {
    class: 'flex flex-col h-full'
  }
})
export class ChatWindowComponent {
  // inject ActivateRoute de doc tham so URL (ex: /c/conv-1 -> id = 'conv-1')
  private route = inject(ActivatedRoute); // 
  private router = inject(Router) // inject router de chuyen huong
  sidebarService = inject(SidebarService);
  readonly store = inject(ChatStore);

  private authService = inject(AuthService);
  private signalrService = inject(SignalrService);
  private chatService = inject(ChatService);

  // 
  messages = signal<MessageDto[]>([]);
  showAddMemberDialog = signal<boolean>(false);
  showMembersPanel = signal<boolean>(false); // signal on/off panel danh sach thanh vien
  aciveEmojiPicker = signal<string | null>(null); // hien emoji duoc picker
  reactionEmojis = REACTION_EMOJIS; // -- reactions --

  // danh sach tin nhan
  // messages = signal<Message[]>([]);

  // signal de theo doi conversation Id tu URL
  conversationId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id'))
    )
  );

  // lay tham chieu den khung chat (de cuon) va textarea (de resize)
  // dùng viewChild signal thay vi @ViewChild decorator
  // nó trả về Signal<ElementRef | underfined>
  private scrollContainer = viewChild<ElementRef>('scrollContainer');
  // private chatInput = viewChild<ElementRef>('chatInput');

  // chuyen doi Observable -> Signal
  // luc nay currentỦe tro thanh 1 signal (giong convéationId)
  currentUser = toSignal(this.authService.currentUser$);

  // signal luu thong tin conversation dang mo (lay tu sidebardata)
  // dung de hien thi header: ten, avatar, type, memberCount
  currentConversation = signal<ConversationDto | null>(null);



  // signal luu danh sach thanh vien
  groupMembers = signal<GroupMemberDto[]>([]);

  // signal luu name user dang go
  typingUser = signal<string | null>(null);

  // timer tu dong tat typing sau X.s
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;

  // signal luu danh sahc participantIds cua conversation hien tai
  // truyen vao chat-input de gui typing event
  participantIds = signal<string[]>([]);

  // -- reply message --
  // luu message dang reply (preview phia tren input/textarea)
  replyingTo = signal<MessageDto | null>(null);





  constructor() {
    // theo doi su thay doi cua tham so 'id' tren URL
    // this.route.paramMap.subscribe(params => {
    //   const conversationId = params.get('id');
    //   console.log(' -- Conversation ID: ', params.get('id'));

    //   // TODO: goi API lay tin nhan cua cuoc hoi thoai nay
    // });

    //effect tu chay khi scrollContainer co gia tri (view da render)
    // hoac khi conversationId thay doi
    effect(() => {
      const container = this.scrollContainer()?.nativeElement;
      const id = this.conversationId(); // phu thuoc id thay doi

      // if (container && id) {
      //   this.loadMessages(id);
      //   this.loadConversationInfo(id); // load info conversation

      // url thay doi -> goi store load messages + info tuong ung
      if (id) {
        this.store.setActiveConversationId(id);
        this.store.loadMessages(id);
        this.store.loadConversationInfo(id);
        this.showMembersPanel.set(false); // an panel khi doi chat 
      }

      // logic scroll khi co tin nhan moi (phu thuoc vao store.messages)
      const msgs = this.store.messages();
      if (container && msgs.length >= 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }

      //   // an panel 
      //   this.showMembersPanel.set(false);

      //   // danh dau da doc khi open conversation
      //   this.chatService.markAsRead(id).subscribe({
      //     next: (count) => {
      //       if (count > 0) {
      //         console.log(`-- Marked ${count} messages as read`);
      //       }
      //     }
      //   });
      // }
    });
    //---
    // 1. dki listener tin nhan tu server
    // this.signalrService.addReceiveMessageListener(
    //   (senderId, user, message, conversationId, replyToId, replyToContent) => {
    //     // khi co tin nhan moi -> them vao d.s
    //     const newMessage: MessageDto = {
    //       id: crypto.randomUUID(), // tam thoi tao Id gia cho tin nhan moi nhat
    //       senderId: senderId,
    //       senderName: user,
    //       content: message,
    //       createAt: new Date().toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }),
    //       // kiem tra xem id nguoi gui co trung voi id cua minh ko?
    //       isMine: senderId.toLowerCase() === this.currentUser()?.id.toLowerCase(),
    //       isRead: false,

    //       // -- info reply --
    //       replyToId: replyToId || undefined,
    //       replyToContent: replyToContent || undefined,

    //     };

    //     this.messages.update(oldMessages => [...oldMessages, newMessage]);

    //     // scroll xuong duoi cung khi co tin nhan moi
    //     setTimeout(() => this.scrollToBottom(), 50);
    //   });

    // // -- dki listener khi nguoi khac doc tin nhan cua minh
    // // -> update isRead = true cho messages trong conversation do
    // this.signalrService.addMessageReadListener((conversationId, readByUserId) => {
    //   // chi update neu dang xem dung conversation do
    //   if (conversationId === this.conversationId()) {
    //     // update all messages in this conversation as read
    //     this.messages.update(msgs =>
    //       msgs.map(m => m.isMine ? { ...m, isRead: true } : m)
    //     );
    //   }
    // });

    // // --- Typing indicator ---
    // //
    // this.signalrService.addTypingListener((data) => {
    //   //
    //   if (data.conversationId === this.conversationId()) {
    //     //
    //     this.typingUser.set(data.userName);

    //     // -- auto hide sau 3s --
    //     //
    //     if (this.typingTimeout) {
    //       clearTimeout(this.typingTimeout);
    //     }
    //     this.typingTimeout = setTimeout(() => {
    //       this.typingUser.set(null) // 
    //     }, 500);
    //   }
    // })

    // // ===  REACTION LISTENER ===
    // // Khi co reaction moi tu SignalR → update messages signal
    // this.signalrService.addReactionListener((data) => {
    //   this.messages.update(msgs =>
    //     msgs.map(m => {
    //       // chi update tin nhan co reaction moi
    //       if (m.id !== data.messageId) return m;

    //       // copy reactions hien tai (hoac tao moi)
    //       let reactions = [...(m.reactions || [])];

    //       if (data.action === 'added') {
    //         // tim nhom reaction cung type
    //         const idx = reactions.findIndex(r => r.type === data.reactionType);
    //         if (idx >= 0) {
    //           // da co nhom → tang count
    //           reactions[idx] = {
    //             ...reactions[idx],
    //             count: reactions[idx].count + 1,
    //             userReacted: reactions[idx].userReacted ||
    //               data.userId.toLowerCase() === this.currentUser()?.id.toLowerCase()
    //           };
    //         } else {
    //           // chua co → tao nhom moi
    //           reactions.push({
    //             type: data.reactionType,
    //             emoji: REACTION_EMOJIS[data.reactionType] || '👍',
    //             count: 1,
    //             userReacted: data.userId.toLowerCase() === this.currentUser()?.id.toLowerCase()
    //           });
    //         }
    //       } else {
    //         // removed → giam count hoac xoa nhom
    //         const idx = reactions.findIndex(r => r.type === data.reactionType);
    //         if (idx >= 0) {
    //           if (reactions[idx].count <= 1) {
    //             reactions.splice(idx, 1);
    //           } else {
    //             reactions[idx] = {
    //               ...reactions[idx],
    //               count: reactions[idx].count - 1,
    //               userReacted: data.userId.toLowerCase() === this.currentUser()?.id.toLowerCase()
    //                 ? false : reactions[idx].userReacted
    //             };
    //           }
    //         }
    //       }

    //       return { ...m, reactions };
    //     })
    //   );
    // });
  }

  // === Ham xu ly su kien giao dien (dung store) ===
  onSendMessage(content: string) {
    if (!content.trim()) return;
    const convId = this.conversationId();
    if (convId) this.store.sendMessage(convId, content);
  }

  onToggleMembersPanel() {
    const convId = this.conversationId();
    if (!convId) return;

    if (!this.showMembersPanel()) {
      this.store.loadGroupMembers(convId);
      this.showMembersPanel.set(true);
    }
    else {
      this.showMembersPanel.set(false);
    }
  }

  onLeaveGroup() {
    const convId = this.conversationId();
    if (!convId) return;
    if (!confirm('Are you sure you want to leave this group?')) return;
    this.chatService.leaveGroup(convId).subscribe({
      next: () => {
        this.router.navigate(['/']);
        window.dispatchEvent(new CustomEvent('conversation-left'));
      }
    });
  }

  onReplyMessage(msg: MessageDto) {
    this.store.setReplyingTo(msg);
  }

  onCancelReply() {
    this.store.setReplyingTo(null);
  }

  // --- LOGIC GIAO DIỆN EMOJI ---
  toggleEmojiPicker(messageId: string) {
    this.aciveEmojiPicker.set(this.aciveEmojiPicker() === messageId ? null : messageId);
  }

  openEmojiPicker(messageId: string) {
    this.aciveEmojiPicker.set(messageId);
  }

  closeEmojiPicker() {
    this.aciveEmojiPicker.set(null);
  }

  onReact(messageId: string, reactionType: number) {
    this.aciveEmojiPicker.set(null);
    this.store.toggleReaction(messageId, reactionType);
  }

  getReactionTypes(): number[] {
    return Object.keys(this.reactionEmojis).map(Number);
  }

  // --- LOGIC GIAO DIỆN DIALOG ---
  onOpenAddMemberDialog() { this.showAddMemberDialog.set(true); }
  onCloseAddMemberDialog() { this.showAddMemberDialog.set(false); }

  onMembersAdded() {
    this.showAddMemberDialog.set(false);
    const convId = this.conversationId();
    if (convId) {
      this.store.loadGroupMembers(convId);
      this.store.loadConversationInfo(convId);
    }
  }

  getExistingMemberIds(): string[] {
    return this.store.groupMembers().map(m => m.userId);
  }

  // ham back (quay lai man d.s cuoc hoi thoai)
  goBack() {
    this.sidebarService.open();
    // this.router.navigate(['/']) // quay ve trang goc (bo chon conversation)
  }

  // scroll xuong duoi cung
  private scrollToBottom() {
    const container = this.scrollContainer()?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}

/*
========= Ly Thuyet =========

1. inject() vs constructor:
    - inject(Service): cach moi (Angular 17+) lay dependency injection gon hom
    - tuong duong: constructor(private route: ActivatedRoute)

2. ActivatedRoute:
    - la service cua Angular: cho phep doc thong tin route hien tai
    - paramMap: Observable chua cac tham so dong (ex: /c/:id)

3. group & group-hover:
    - Tailwind trick: danh dau the cha la 'group', the con dung 'group-hover' de style khi hover vao the cha
    => khi hover vao Cha thi con thay doi style 

4. focus-within:
    - Khi bat ky phan tu con nao duoc focus (ex: texterea), thi the cha ap dung style 
    - dung de tao hieu ung o input sang len khi user click vao

*/
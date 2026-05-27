import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
// import { map } from 'rxjs';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button.component';
import { UiIconComponent } from '../../../../shared/components/ui-icon/ui-icon.component';
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { SignalrService } from '../../../../core/services/signalr.service';
import { ChatService } from '../../services/chat.service';
import { MessageDto } from '../../models/message.dto';
import { ConversationDto } from '../../models/conversation.dto';
import { GroupMemberDto } from '../../models/group-member.dto';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { GroupMembersPanelComponent } from '../group-members-panel/group-members-panel.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { REACTION_EMOJIS } from '../../models/reaction.dto';
import { ChatStore } from '../../stores/chat.store';
import { MessageBubbleComponent } from "../message-bubble/message-bubble.component";
import { AttachmentDto } from '../../models/attachment.dto';

@Component({
  selector: 'app-chat-window',
  imports: [
    UiIconComponent,
    CommonModule,
    AddMemberDialogComponent,
    ChatHeaderComponent,
    GroupMembersPanelComponent,
    ChatInputComponent,
    MessageBubbleComponent
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
  host: {
    class: 'flex flex-col h-full',
  },
})
export class ChatWindowComponent {
  // inject ActivateRoute de doc tham so URL (ex: /c/conv-1 -> id = 'conv-1')
  private route = inject(ActivatedRoute); //
  private router = inject(Router); // inject router de chuyen huong
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
  previewImage = signal<{ url: string; fileName: string } | null>(null);  // Signal qly xem trước hình ảnh ở dạng phóng to

  // signal de theo doi conversation Id tu URL
  conversationId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
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
    // });

    //effect tu chay khi scrollContainer co gia tri (view da render)
    // hoac khi conversationId thay doi
    effect(() => {
      const container = this.scrollContainer()?.nativeElement;
      const newId = this.conversationId(); // phu thuoc id thay doi
      const currentId = this.store.activeConversationId(); // lấy ID conversation hiện tại từ store

      // url thay doi -> goi store load messages + info tuong ung
      if (newId && newId !== currentId) {
        this.store.setActiveConversationId(newId);
        this.store.loadMessages(newId);
        this.store.loadConversationInfo(newId);
        // this.showMembersPanel.set(false); // an panel khi doi chat
      }

      // logic scroll khi co tin nhan moi (phu thuoc vao store.messages)
      const msgs = this.store.messages();
      if (container && msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  // === Ham xu ly su kien giao dien (dung store) ===
  onSendMessage(content: string) {
    if (!content.trim()) return;
    const convId = this.conversationId();
    if (convId) this.store.sendMessage(convId, content);
  }

  // method xử lý gửi tin nhắn kèm file
  onSendMessageWithFiles(event: { content: string; fileIds: string[] }) {
    const convId = this.conversationId();
    if (convId) {
      this.store.sendMessage(convId, event.content, event.fileIds);
    }
  }

  onToggleMembersPanel() {
    const convId = this.conversationId();
    if (!convId) return;

    if (!this.showMembersPanel()) {
      this.store.loadGroupMembers(convId);
      this.showMembersPanel.set(true);
    } else {
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
      },
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
    this.aciveEmojiPicker.set(
      this.aciveEmojiPicker() === messageId ? null : messageId,
    );
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

  onReactFromBubble(event: { messageId: string; reactionType: number }) {
    this.aciveEmojiPicker.set(null);
    this.store.toggleReaction(event.messageId, event.reactionType);
  }

  // --- LOGIC ATTACHMENT FILE ---
  hasImages(msg: MessageDto): boolean {
    return !!msg.attachments?.some(a => a.fileType === 'Image');
  }

  getImages(msg: MessageDto): AttachmentDto[] {
    return msg.attachments?.filter(a => a.fileType === 'Image') || [];
  }

  getDocuments(msg: MessageDto): AttachmentDto[] {
    return msg.attachments?.filter(a => a.fileType !== 'Image') || [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + units[i];
  }

  // Mở modal phóng to ảnh
  openImagePreview(url: string, fileName: string, event: Event) {
    event.preventDefault(); // Ngăn trình duyệt mở tab mới mặc định
    this.previewImage.set({ url, fileName });
    console.log(' --- ', this.previewImage());
  }
  // Đóng modal phóng to ảnh
  closeImagePreview() {
    this.previewImage.set(null);
  }
  // Lắng nghe phím ESC để đóng nhanh ảnh đang xem
  @HostListener('window:keydown.escape')
  onEscapePress() {
    this.closeImagePreview();
  }

  // --- LOGIC GIAO DIỆN DIALOG ---
  onOpenAddMemberDialog() {
    this.showAddMemberDialog.set(true);
  }
  onCloseAddMemberDialog() {
    this.showAddMemberDialog.set(false);
  }

  onMembersAdded() {
    this.showAddMemberDialog.set(false);
    const convId = this.conversationId();
    if (convId) {
      this.store.loadGroupMembers(convId);
      this.store.loadConversationInfo(convId);
    }
  }

  getExistingMemberIds(): string[] {
    return this.store.groupMembers().map((m) => m.userId);
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

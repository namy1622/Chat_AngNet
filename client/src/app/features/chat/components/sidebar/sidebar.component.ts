import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UiButtonComponent } from "../../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";
import { UiInputComponent } from "../../../../shared/components/ui-input/ui-input.component";
import { UiAvatarComponent } from "../../../../shared/components/ui-avatar/ui-avatar.component";
import { SidebarService } from '../../../../core/services/sidebar.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../services/chat.service';
import { ConversationDto } from '../../models/conversation.dto';
import { UserDto } from '../../models/user.dto';
import { UserService } from '../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SignalrService } from '../../../../core/services/signalr.service';
import { CreateGroupDialogComponent } from "../create-group-dialog/create-group-dialog.component";
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { List } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, UiButtonComponent, UiIconComponent, UiAvatarComponent, CreateGroupDialogComponent, ConversationListComponent], // dung de tao link va highlight link dang active
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  // Danh sách conversation có flex-1 overflow-y-auto,
  // nhưng để flex-1 hoạt động, thẻ cha phải là flex container với chiều cao xác định.
  host: {
    class: 'flex flex-col h-full overflow-hidden'
  }

})
export class SidebarComponent {
  sidebarService = inject(SidebarService);
  authService = inject(AuthService);
  userService = inject(UserService);
  chatService = inject(ChatService);
  signalrService = inject(SignalrService);
  router = inject(Router);

  // chuyen doi Observable -> signal
  currentUser = toSignal(this.authService.currentUser$);

  // dung signal cho conversations -> khi data thay doi -> giao dien se tu dong cap nhat
  conversations = signal<ConversationDto[]>([]);

  //
  showCreateGroupDialog = signal(false);
  // singal luu tu khoa search 
  searchQuery = signal('');

  // signal cho che do search
  isSearchingMode = signal(false);

  // result tim kiem
  foundUsers = signal<UserDto[]>([]);

  constructor() {
    this.loadConversations();

    //-- lang nghe tin nhan moi tu SignalR de cap nhat Sidebar--
    this.signalrService.addReceiveMessageListener((senderId, senderName, content, conversationId) => {
      // kiem tra conversation co trong list chua
      const exists = this.conversations().find(c => c.id === conversationId);

      if (exists) {
        // da co -> chi update lastMessage va dua len dau
        this.conversations.update(list => {
          return list.map(c => {
            if (c.id === conversationId) {
              return {
                ...c,
                lastMessage: content,
                lastMessageTime: 'Just now',
                unreadCount: window.location.pathname.includes(conversationId)
                  ? c.unreadCount // dang xem -> giu nguyen (auto markRead)
                  : c.unreadCount + 1 // ko xem -> tang 1
              };
            }
            return c;
          })
            // sort: hoi thoai vua co tin nhan moi len dau
            .sort((a, b) => a.id === conversationId ? -1 : b.id === conversationId ? 1 : 0);
        });
      }
      else {
        // chua co -> new conversation -> tai lai list
        this.loadConversations();
      }
    });

    //-- lang nghe khi user duoc them vao group chat moi
    this.signalrService.addAddedToGroupListener((conversationId) => {
      console.log('-- added to group: ', conversationId);
      // load lai sidebar
      this.loadConversations();
    })

    // lang nghe event "conversation-left" tu chat-window
    window.addEventListener('conversation-left', () => {
      console.log('-- conversation-left event received');
      this.loadConversations();
    })
  }
  //
  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (data) => {
        console.log('-- loaded conversations: ', data);
        this.conversations.set(data);
      },
      error: (err) => {
        console.error('-- failed to load conversations', err);
      }
    })
  }

  // tao computed signal de tu dong loc d.s
  // logic: khi searchQuery thay doi -> ham auto chay -> update giao dien
  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.conversations();

    // neu ko ro thi tra ve tat ca
    if (!query) return list;

    // loc theo ten || tin nhan cuoi (lastMessage)
    return list.filter(chat => {
      return chat.name.toLowerCase().trim().includes(query) ||
        chat.lastMessage.toLowerCase().trim().includes(query)
    });
  });

  // nhan trang thai collapsed tu component cha
  isCollapsed = input<boolean>(false);

  // bao cha toggle sidebar
  toggleSidebar = output<void>();
  // output event khi click conersation
  conersationSelected = output<void>();

  // bao cha toggle sidebar
  onToggle() {
    this.toggleSidebar.emit();
  }

  onConversationClick() {
    this.conersationSelected.emit();
  }

  onConversationSelected(conversationId: string) {
    if (window.innerWidth < 767) {
      this.sidebarService.close();
    }

    // 
    this.conversations.update(list =>
      list.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
    );
  }

  //---------
  // === Group ===

  onCreateGroupClick() {
    this.showCreateGroupDialog.set(true);
  }
  onGroupDialogClose() {
    this.showCreateGroupDialog.set(false);
  }

  // khi tao group thanh cong -> nhan conversationId tu dialog
  // -> reload sidebar + navigate toi conversation moi
  onGroupCreated(conversationId: string) {
    this.showCreateGroupDialog.set(false);
    this.loadConversations();
    this.router.navigate(['/c', conversationId]);
  }

  //---------

  // ham event khi go phim
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim();
    this.searchQuery.set(term); // cap nhat signal 

    // neu input null -> tat che do tim User -> hien lai d.s chat cu
    if (!term) {
      this.isSearchingMode.set(false);
      this.foundUsers.set([]);
      return;
    }

    // neu co tu khoa -> bat che do tim user
    this.isSearchingMode.set(true);

    // goi api tim user
    // Debounce: delay 300ms sau moi lan user ngung go 1 ky tu (co the lam ky o optimize sau)
    // tam thoi goi luon
    this.userService.searchUsers(term).subscribe({
      next: (users) => {
        //
        const myselfId = this.currentUser()?.id;
        const otherUsers = users.filter(u => u.id != myselfId);

        this.foundUsers.set(otherUsers);
      }
    });
  }

  // khi chon 1 user tu result search
  onUserClick(user: UserDto) {
    // goi api tao hoi thoai (hoac hoi thoai cu)
    this.chatService.createConversation(user.id).subscribe({
      next: (conversationId) => {
        console.log('-- created conversation: ', conversationId);

        // clear che do tim kiem
        this.searchQuery.set('');
        this.isSearchingMode.set(false);

        // reload list hoi thoai de hien hoi thoai moi nhat
        this.loadConversations();

        // chuyen huong sang trang chat voi conversationId
        this.router.navigate([`/c`, conversationId]);
      },
      error: (err) => console.error('-- failed to create conversation', err)
    })
  }

  /*
    cach dung output event thay cho router
    conversationCreated = output<string>(); // khai bao output
    
    onUserClick_Alternative(user: UserDto){
      this.chatService.createConversation(user.id).subscribe({
        // thay vi navigate, ta ban event ra ngoai cho Component cha (MainLayout) xu ly
        this.conversationCreated.emit(conversationId);

        // reset UI
        this.searchQuery.set('');
        this.isSearchingMode.set(false);
        this.loadConversations();
      })
    }
  */

  // ham logout
  onLogout() {
    const isConfirm = confirm('Are you sure you want to log out?');
    if (isConfirm) {
      this.authService.logout();
    }
  }
}


/*
==== Ly Thuyet ====
 
1. @for (item of items; track item.id):
    - cu phap moi cua Angular 17+ de lap (thay the *ngFor).
    - 'track': giup Anggular toi uu hieu suat khi danh sach thay doi

2. routerLink & routerLinkActive:
    - routerLink: tao link dieu huong ma ko reload trang (SPA)
    - routerLinkActive: tu dong them class CSS khi route khop => Highlight item.

3. Interface TypeScript:
    - dinh nghia 'hinh dang' du lieu -> giup IDE goi y code va bat loi som.

4. Tailwind Utility:
    - truncate: cat text dai + them '...'. Can min-w-0 o the cha de hoat dong
    - flex-shrink-0: ngan phan tu bi thu nho khi ko du cho
*/
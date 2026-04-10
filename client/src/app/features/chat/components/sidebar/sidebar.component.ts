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
import { FriendsListPanelComponent } from '../friends-list-panel/friends-list-panel.component';
import { FriendRequestsPanelComponent } from '../friend-requests-panel/friend-requests-panel.component';
import { FriendshipService } from '../../../../core/services/friendship.service';
import { FriendshipStatusDto } from '../../models/friendship.dto';
import { count } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive,
    UiButtonComponent, UiIconComponent, UiAvatarComponent,
    CreateGroupDialogComponent, ConversationListComponent,
    FriendsListPanelComponent,
    FriendRequestsPanelComponent
  ], // dung de tao link va highlight link dang active
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

  // -- friendship --
  friendshipService = inject(FriendshipService);

  activeTab = signal<'chats' | 'friends'>('chats');
  // signal luu so loi moi ket ban (badge)
  pendingRequestCount = signal(0);
  // siganl luu status friendship user dang search
  // key: userId, value: FriendshipStatusDto
  // Map de luu nhieu user cung luc (search nhieu ket qua)
  friendshipStatuses = signal<Map<string, FriendshipStatusDto>>(new Map());

  // -- signal Trigger --
  // == Ly Thuyet Trigger Pattern -> cuoi file ==
  friendRequestReloadTrigger = signal(0);
  friendsListReloadTrigger = signal(0);

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
                lastMessageTime: c.lastMessageTime, // just now
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

    // === Friendship: lang nghe event loi moi ket ban moi qua SignalR ===
    this.signalrService.addFriendRequestReceivedListener((data) => {
      console.log('-- new friend request from:', data.requesterId);
      this.pendingRequestCount.update(count => count + 1);

      // friend-request-panel co input reloadTrigger 

      this.friendRequestReloadTrigger.update(v => v + 1);
    });

    // -- listener khi loi moi duoc Respond(Accept/Reject) --
    // update friendshipStatuses Map (Pending -> Accepted/Rejected)
    // lang nghe khi loi moi respond (Accepted/Rejected)
    this.signalrService.addFriendRquestRespondedListener((data) => {
      console.log('-- friend request responded:', data);

      // update friendshipStatuses Map
      // Tim trong Map: co friendship nao co id = data.friendshipId ko?
      this.friendshipStatuses.update(map => {
        const newMap = new Map(map);

        // duyet Map tim friendshipId khop 
        // -> map luu theo key: userId, nen phai duyet tim
        newMap.forEach((status, userId) => {
          if(status.friendshipId === data.friendshipId){
            // update status: 'Pending' -> 'Accepted/Rejected'
            newMap.set(userId, {
              ... status, 
              status: data.isAccepted ? 'Accepted' : 'Rejected'
            });
          }
        });
        return newMap;
      });
      
      if(data.isAccepted){
        this.friendsListReloadTrigger.update(v => v + 1);

        // Cach ViewChild - de hoc them
        // this.friendListPanel?.loadFriends();
      }
      
    })

    // - load pendingCount tu dau
    this.loadPendingCount();
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

        // check trang thai ket ban voi tung user tim thay
        otherUsers.forEach(user => {
          this.checkFriendshipStatus(user.id);
        })
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

  // ham logout
  onLogout() {
    const isConfirm = confirm('Are you sure you want to log out?');
    if (isConfirm) {
      this.authService.logout();
    }
  }

  // == Friendship Methods === 
  // load pending friend requests count
  loadPendingCount() {
    this.friendshipService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRequestCount.set(requests.length);
      }
    });
  }

  // chuyen tab: chat <-> friend
  // dung de toggle noi dung sidebar
  switchTab(tab: 'chats' | "friends") {
    this.activeTab.set(tab);
  }

  // khi count request friendship thay doi -> tu friend-requests-panel emit ra
  onRequestCountChanged(count: number) {
    this.pendingRequestCount.set(count);
  }

  // khi friend-requests-panel emit 'friendAccepted'
  onFriendAccepted(){
    console.log('-- [SideBar] friend accepteed -> reload friends list');

    // signal trigger -> tang value -> effect() torng friends-list-panel chay 
    this.friendsListReloadTrigger.update(v => v + 1);
  }

  // == add Friend khi Search ==
  checkFriendshipStatus(userId: string) {
    this.friendshipService.getFriendshipStatus(userId).subscribe({
      next: (status) => {
        // update Map: them userId -> status
        this.friendshipStatuses.update(map => {
          const newMap = new Map(map);
          newMap.set(userId, status);
          return newMap;
        });
      }
    });
  }

  // lay status friendship cua 1 user (tu Map da load)
  getFriendshipStatus(userId: string): FriendshipStatusDto | undefined {
    return this.friendshipStatuses().get(userId);
  }

  // gui loi moi ket ban
  onAddFriend(userId: string) {
    this.friendshipService.sendFriendRequest(userId).subscribe({
      next: (result) => {
        console.log('-- sent friend request:', result.friendshipId);
        // update status = Pending trong Map
        this.friendshipStatuses.update(map => {
          const newMap = new Map(map);
          newMap.set(userId, {
            friendshipId: result.friendshipId,
            status: 'Pending',
            isRequester: true // minh la nguoi gui
          });
          return newMap;
        });
      },
      error: (err) => {
        console.error('-- failed to send friend request:', err);
        alert('Failed to send friend request');
      }
    })
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

//----------------------------------------------
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

//----------------------------------------------
/**
 * === Ly Thuyet Trigger Pattern ===
 * - La 1 pattern trong Angular de giao tiep cha -> con
 *    - Cha giu 1 signal(number), truyen vao con qua [input]
 *    - Moi khi can bao con reload -. cha tang value len 1
 *    - Con dung effect() theo doi input -> khi thay doi -> goi API reload
 *    - Gia tri cu the (1,2,3,..) ko quan trong -> chi can No Thay Doi la du
 * 
 * Tai sao ko dung boolean
 *    - Vi set(true) -> set(true) lan 2 -> signal ko thay doi 
 *    -> effect() ko chay lai. Dung number(tang 1 moi lan) dam bao luon thay doi 
 * 
 * --------------------------------------------------------------------
 * === Cach 1: ViewChild ===
 * - ViewChild: cho phep lay Truc Tiep reference toi component con
 * - Sau do goi method cua con: this.friendRequestsPanel.loadPendingRequests();
 * 
 * === Ly Thuyet ViewCHild ===
 * - @ViewChild('tenRef') hoac @ViewChild(ComponentClass)
 * - Angular se tim component con trong template va an vao bien nay
 * - Chi co gia tri Sau khi view duoc render (ngAfterViewInit)
 * - Dung de truy cap properties/methods cua component con
 * - Nhuoc: 'tight coupling' - cha phu thuoc truc tiep vao con
 * 
 * -------------------------------
 * 
 * // Cach dung (trong SignalR listener):
  // this.friendRequestsPanel?.loadPendingRequests();  // goi truc tiep method con
  // this.friendsListPanel?.loadFriends();             // goi truc tiep method con
  //
  // Luu y: Phai co dau ? (optional chaining) vi component con co the chua ton tai
  // (VD: dang o tab Chats → FriendsListPanel bi destroy boi @if → ViewChild = undefined)
 */

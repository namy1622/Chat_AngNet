import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { UiAvatarComponent } from '../../../../shared/components/ui-avatar/ui-avatar.component';
import { UiIconComponent } from '../../../../shared/components/ui-icon/ui-icon.component';
import { FriendshipService } from '../../../../core/services/friendship.service';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { FriendDto } from '../../models/friendship.dto';
import { AuthService } from '../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-friends-list-panel',
  standalone: true,
  imports: [CommonModule, UiAvatarComponent, UiIconComponent],
  templateUrl: './friends-list-panel.component.html',
  styleUrl: './friends-list-panel.component.scss'
})
export class FriendsListPanelComponent {
  private friendshipService = inject(FriendshipService);
  private chatService = inject(ChatService);
  private router = inject(Router);
  private authService = inject(AuthService);
  // parse tu Observable -> signal
  private currentUser = toSignal(this.authService.currentUser$);

  // signal lu danh sach ban be
  friends = signal<FriendDto[]>([]);
  isLoading = signal(false);

  // -- input: reloadTrigger
  // khi cha(sidebar) tang value -> effect() chay -> goi loadFriends()
  // Khi: Accept hoac requester nhan duoc Accepted qua signalR
  reloadTrigger = input(0);

  constructor() {
    this.loadFriends();

    // - effect() theo doi reloadTrigger -
    effect(() => {
      const trigger = this.reloadTrigger();
      if (trigger > 0) {
        console.log('[FriendsListPanel] reload triggered', trigger);
        this.loadFriends();
      }
    })
  }

  // 
  loadFriends() {
    this.isLoading.set(true);
    this.friendshipService.getFriendsList().subscribe({
      next: (friends) => {
        const friendsWihtoutMe = friends.filter(f => f.userId !== this.currentUser()?.id);
        this.friends.set(friendsWihtoutMe);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load friends:', error);
        this.isLoading.set(false);
      }
    })
  }

  // click vao ban be -> mo chat
  // goi api tao conversation hoac lay conversation da co -> navigate toi trang chat
  onChatWithFriend(friend: FriendDto) {
    this.chatService.createConversation(friend.userId).subscribe({
      next: (conversationId) => {
        //
        this.router.navigate(['/c', conversationId]);
      },
      error: (err) => console.error('Failed to create conversation:', err)
    })
  }

  //
  onRemoveFriend(friend: FriendDto) {
    // confirm(): ham JS built-in, hien dialog Yes/No
    const isConfirm = confirm(`Remove ${friend.firstName} ${friend.lastName} from your friends?`);
    if (!isConfirm) return; // user bam Cancel

    this.friendshipService.removeFriend(friend.friendshipId).subscribe({
      next: () => {
        // xoa thanh cong
        this.friends.update(list =>
          list.filter(f => f.friendshipId !== friend.friendshipId)
        );
      },
      error: (err) => console.error('Failed to remove friend:', err)
    })
  }

}

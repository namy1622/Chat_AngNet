import { Component, inject, input, output, signal } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserDto } from '../../models/user.dto';
import { filter } from 'rxjs';
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";
import { UiAvatarComponent } from "../../../../shared/components/ui-avatar/ui-avatar.component";

@Component({
  selector: 'app-add-member-dialog',
  imports: [UiIconComponent, UiAvatarComponent],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss'
})
export class AddMemberDialogComponent {
  private userService = inject(UserService);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  // lay user hien tai -> loai khoi search
  currentUser = toSignal(this.authService.currentUser$);

  // == input ==
  // input: cach Angular 17+ nhan  data tu component cha
  // required: true -> bat buoc component cha truyen vao, ko truyen se bao loi
  // Component cha (chat-window) -> truyen conversationId vao <app-add-member-dialog [conversationId]="conversationId()">
  conversationId = input.required<string>();

  // d.s userId da la thanh vien 
  // component cha truyen tu groupMembers() da load san
  existingMembersId = input<string[]>([]);

  // -- output --
  close = output<void>(); // event dong dialog
  membersAdded = output<void>(); // event khi them thanh vien thanh cong

  // -- siganls --
  searchResults = signal<UserDto[]>([]); // ket qua tim kiem
  selectedUsers = signal<UserDto[]>([]); // d.s user da chon
  isAdding = signal(false); // dang goi API (loading)

  // === Medthods ===

  // tim user
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim();

    if (!term) {
      this.searchResults.set([]);
      return;
    }

    this.userService.searchUsers(term).subscribe({
      next: (users) => {
        const myselfId = this.currentUser()?.id;
        const selectedIds = this.selectedUsers().map(u => u.id);

        //  loc bo: myself, member, da chon
        const existing = this.existingMembersId();

        const filtered = users.filter(u =>
          u.id !== myselfId
          && !existing.includes(u.id)    // loai user da la member
          && !selectedIds.includes(u.id) // loai user da chon trong dialog
        );
        this.searchResults.set(filtered);
      }
    });
  }

  // chon user
  onSelectedUser(user: UserDto) {
    this.selectedUsers.update((list => [...list, user]));

    // xoa khoi search results
    this.searchResults.update(list => list.filter(u => u.id != user.id));
  }

  // bo chon User (click X tren chip)
  onRemoveUser(user: UserDto) {
    this.selectedUsers.update(list => list.filter(u => u.id != user.id));
  }

  // them member
  onAddMembers() {
    const memberIds = this.selectedUsers().map(u => u.id);

    if (memberIds.length === 0) {
      alert('Please select at least 1 user');
      return;
    }

    this.isAdding.set(true);
    this.chatService.addMembers(this.conversationId(), memberIds).subscribe({
      next: () => {
        console.log('-- Members added successfully');
        // gui event ra cah de cha reload lai d.s thanh vien
        this.membersAdded.emit();
      },
      error: (err) => {
        console.error('-- Failed to add members: ', err);
        alert('Failed to add members');
        this.isAdding.set(false);
      }
    });
  }

  onClose() {
    this.close.emit();
  }

}

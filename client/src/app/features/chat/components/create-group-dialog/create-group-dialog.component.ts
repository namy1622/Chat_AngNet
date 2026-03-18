import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserDto } from '../../models/user.dto';
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";
import { UiAvatarComponent } from "../../../../shared/components/ui-avatar/ui-avatar.component";

@Component({
  selector: 'app-create-group-dialog',
  standalone: true,
  // FormsModule: de dung two-way binding, [(ngModel)]
  imports: [CommonModule, FormsModule, UiIconComponent, UiAvatarComponent],
  templateUrl: './create-group-dialog.component.html',
  styleUrl: './create-group-dialog.component.scss'
})
export class CreateGroupDialogComponent {
  // inject services
  private userService = inject(UserService);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  // lay thong tin user hien tai 
  currentUser = toSignal(this.authService.currentUser$);

  //== Output events ===
  // Component cha (sidebar) se lang nghe event output nay
  close = output<void>(); // event dong dialog
  groupCreated = output<string>(); // event tao nhom thanh cong 

  //=== signals (state cua component)
  groupName = signal('');  // ten nhom user nhap
  searchTerm = signal(''); // tu khoa search user
  searchResults = signal<UserDto[]>([]); // ket qua tim kiem
  selectedUsers = signal<UserDto[]>([]); // d.s user duoc chon
  isCreating = signal(false); // dang goi api tao nhom (hieu ung loading)

  //=== Methods ===
  //
  onSearch(event: Event) {

    const input = event.target as HTMLInputElement;
    const term = input.value.trim();
    this.searchTerm.set(term);

    // neu trong -> xoa ket qua
    if (!term) {
      this.searchResults.set([]);
      return;
    }

    // goi api tim user (dung lai UserService.searchUsers da co)
    this.userService.searchUsers(term).subscribe({
      next: (users) => {
        const myselfId = this.currentUser()?.id;
        // loc bo: myself + users da duoc chon
        const selectedIds = this.selectedUsers().map(u => u.id);
        const filtered = users.filter(u => u.id !== myselfId && !selectedIds.includes(u.id));

        this.searchResults.set(filtered);
      }
    });
  }

  // chon user -> them vao d.s "selected"
  onSelectUser(user: UserDto) {
    // signal.update(): nhan gia tri cu -> tra ve gia tri moi
    // spread operator: [...old, user]: copy mang cu + user moi
    this.selectedUsers.update(list => [...list, user]);

    // xoa user vua chon khoi ket qua search 
    this.searchResults.update(list => list.filter(u => u.id !== user.id));
  }

  // bo chon user
  onRemoveUser(user: UserDto) {
    // loc bo user khoi d.s da chon
    this.selectedUsers.update(list => list.filter(u => u.id !== user.id));
  }

  //
  onCreateGroup() {
    const name = this.groupName();
    const memberIds = this.selectedUsers().map(u => u.id);

    // validate: ten nhom + it nhat 2 thanh vien
    if (!name || !name.trim()) {
      alert('Please enter group name');
      return;
    }
    if ((memberIds.length < 2)) {
      alert('Please select at least 2 members');
      return;
    }

    // bat loading -> goi api
    this.isCreating.set(true);

    this.chatService.createGroup(name, memberIds).subscribe({
      next: (conversationId) => {
        console.log('-- group created:', conversationId);

        // gui event ra component cha kem conversationId
        this.groupCreated.emit(conversationId);
      },
      error: (err) => {
        console.error('-- failed to create group', err);
        alert('Failed to create group');
      },
      complete: () => {
        this.isCreating.set(false);
      }
    });
  }

  // dong dialog khi click Huy or click overlay (ben ngoai)
  onClose() {
    this.close.emit();
  }

}

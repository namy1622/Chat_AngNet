import { Component, input, output } from '@angular/core';
import { ConversationDto } from '../../models/conversation.dto';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiAvatarComponent } from '../../../../shared/components/ui-avatar/ui-avatar.component';
import { UiIconComponent } from '../../../../shared/components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UiAvatarComponent, UiIconComponent],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss'
})
export class ConversationListComponent {
  //input: nhan data tu component cha (sidebar)
  // cha truyen: <app-conversation-list [conversations]="conversations"></app-conversation-list>
  conversations = input.required<ConversationDto[]>();

  // sidebar co dang expanded hay collapsed
  // true = expanded (hien day du ten + lastMessage)
  // false = collapsed (chi hien avatar)
  isExpanded = input<boolean>(true);

  // khi user click vao 1 conversation -> bao cha xu ly
  conversationSelected = output<string>();

  // khi click vao conversation
  onSelect(conversationId: string) {
    this.conversationSelected.emit(conversationId);
  }

}

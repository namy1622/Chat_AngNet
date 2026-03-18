import { Component, input, output } from '@angular/core';
import { ConversationDto } from '../../models/conversation.dto';
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [UiIconComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  // 
  // nhan thong tin conversation tu cha
  conversation = input.required<ConversationDto | null>();

  // output
  // cac event gui ra cha de xu ly logic
  backClicked = output<void>();
  toggleMembers = output<void>();
  leaveGroup = output<void>();

  // 
  onBack() {
    this.backClicked.emit();
  }

  onToggleMembers() {
    this.toggleMembers.emit();
  }

  onLeaveGroup() {
    this.leaveGroup.emit();
  }
}

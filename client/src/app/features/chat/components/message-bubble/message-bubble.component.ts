import { Component, input, output } from '@angular/core';
import { MessageDto } from '../../models/message.dto';
import { REACTION_EMOJIS } from '../../models/reaction.dto';
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-bubble',
  imports: [UiIconComponent, CommonModule],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss'
})
export class MessageBubbleComponent {
 message = input.required<MessageDto>();
  activeEmojiId = input<string | null>(null);
  reply = output<MessageDto>();
  react = output<{ messageId: string; reactionType: number }>();
  emojiToggle = output<string>();
  emojiClose = output<void>();
  reactionEmojis = REACTION_EMOJIS;
  getReactionTypes(): number[] {
    return Object.keys(this.reactionEmojis).map(Number);
  }
}

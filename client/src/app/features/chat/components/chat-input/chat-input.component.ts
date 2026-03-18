import { Component, ElementRef, output, viewChild } from '@angular/core';
import { UiButtonComponent } from "../../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";

@Component({
  selector: 'app-chat-input',
  imports: [UiButtonComponent, UiIconComponent],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  // tham chieu den textarea trong template
  private chatInput = viewChild<ElementRef>('chatInput');

  // khi user gui tin nhan -> emit content ra cha
  // cha(ChatWindow) se goi api send message
  messageSent = output<string>();

  // gui tin nhan
  onSend() {
    const textarea = this.chatInput()?.nativeElement;
    const content = textarea?.value?.trim();

    if (!content) return;

    this.messageSent.emit(content);

    // clear content + reset height
    textarea.value = '';
    this.adjustHeight();
  }

  // auto resize textarea khi go
  adjustHeight() {
    const textarea = this.chatInput()?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }
}

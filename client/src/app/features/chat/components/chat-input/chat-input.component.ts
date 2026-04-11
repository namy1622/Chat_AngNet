import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { UiButtonComponent } from "../../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";
import { SignalrService } from '../../../../core/services/signalr.service';

@Component({
  selector: 'app-chat-input',
  imports: [UiButtonComponent, UiIconComponent],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  // tham chieu den textarea trong template
  private chatInput = viewChild<ElementRef>('chatInput');
  private signalrService = inject(SignalrService);
  // input tu cha (chat-window)
  // conversationId, participantIds can thiet de gui typing event
  conversationId = input<string>();
  participantIds = input<string[]>([]);

  // khi user gui tin nhan -> emit content ra cha
  // cha(ChatWindow) se goi api send message
  messageSent = output<string>();

  // -- Debounce - ly thuyet cuoi file --
  private typingTimer: ReturnType<typeof setTimeout> | null = null;

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

  // == Ham Typing event - co Debounce ==
  onTyping() {
    const convId = this.conversationId();
    const pIds = this.participantIds();

    // ko gui neu chau co conversation/ chua co participantIds
    if (!convId || pIds.length === 0) return;

    //-- debounce --
    // huy timer cu neu co
    if (this.typingTimer) clearTimeout(this.typingTimer);
    console.log('-- send typing: ', convId, pIds);
    // gui typing event Ngay lap tuc
    // chi gui lan dau hoac sau khi het debounce
    this.signalrService.sendTyping(convId, pIds);

    // timer:2s
    // neu 2s user go tiep -> onTyping() goi lai -> timer bi huy
    // Neu 2s ko go -> timer het -> ko lam gi (ngung typing)
    // this.typingTimer = setTimeout(() => {
    //   this.typingTimer = null; // reset timer
    //   // gui event typing len server
    // }, 2000);

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


/*
======== DEBOUNCE =========

- Debounce la ky thuat hoan thien viec gui du lieu
- Khi user go phim lien tuc: a->b->d->h
- Ko Debounce: gui 4 event typing (Spam!)
--> co Debounce X(ms): chi gui 1 event (sau khi ngung go phim X(ms))

Cach hoat dong:
  - Moi lan go phim -> clearTimeout (huy timer cu)
  - Dat timer moi (X(ms))
  - Neu trong X.ms go tiep -> timer cu bi huy -> dat timer moi
  - chi khi Ngung Go X.ms -> timer chay -> gui event typing

ReturnType<typeof setTimeout> : KDL cua timer Id
Dung de TS hieu dung kieu (tranh loi kieu number vs NodeJS.Timeout)
*/
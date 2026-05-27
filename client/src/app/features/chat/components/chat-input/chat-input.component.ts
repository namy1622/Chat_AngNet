import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { UiButtonComponent } from "../../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";
import { SignalrService } from '../../../../core/services/signalr.service';
import { FileUploadService } from '../../services/file-upload.service';
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: 'app-chat-input',
  imports: [UiButtonComponent, UiIconComponent, LucideAngularModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  // tham chieu den textarea trong template
  private chatInput = viewChild<ElementRef>('chatInput');
  private signalrService = inject(SignalrService);
  private fileUploadService = inject(FileUploadService);
  private previewUrlCache = new Map<File, string>(); // Cache lưu trữ Object URL để tránh tạo mới liên tục
  // input tu cha (chat-window)
  // conversationId, participantIds can thiet de gui typing event
  conversationId = input<string>();
  participantIds = input<string[]>([]);

  // khi user gui tin nhan -> emit content ra cha
  // cha(ChatWindow) se goi api send message
  messageSent = output<string>();

  // -- emit kèm fileIds --
  messageWithFiles = output<{ content: string; fileIds: string[] }>();

  selectedFiles = signal<File[]>([]); // signal lưu danh sách file đã chọn (chưa upload)

  uploading = signal(false); // signal: đang upload hay không (để disable nút Send)

  // Danh sách MIME types cho accept attribute
  acceptedTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.mp4,.webm,.mp3,.wav,.zip,.rar';

  // -- Debounce - ly thuyet cuoi file --
  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  // gui tin nhan
  async onSend() {
    const textarea = this.chatInput()?.nativeElement;
    const content = textarea?.value?.trim();
    const files = this.selectedFiles();

    if (!content && files.length === 0) return;

    // Nếu có files → upload trước, rồi gửi message kèm fileIds
    if (files.length > 0) {
      this.uploading.set(true);
      try {
        const { results, errors } = await this.fileUploadService.uploadFiles(files);

        if (errors.length > 0) {
          console.warn('Some files failed:', errors);
          // Có thể hiện alert ở đây
        }

        if (results.length > 0 || content) {
          const fileIds = results.map(r => r.fileId);
          this.messageWithFiles.emit({ content, fileIds });
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Lỗi khi upload file. Vui lòng thử lại.');
      } finally {
        this.uploading.set(false);

        // Thu hồi toàn bộ Object URLs của các file để giải phóng bộ nhớ RAM
        this.previewUrlCache.forEach(url => URL.revokeObjectURL(url));
        this.previewUrlCache.clear();

        this.selectedFiles.set([]); // clear files đã chọn
      }
    }
    else {
      // Chỉ có text → gửi bình thường
      this.messageSent.emit(content);
    }
    // Clear textarea + reset height
    if (textarea) {
      textarea.value = '';
      this.adjustHeight();
    }
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
  }

  /// ==== XU LY FILE ====

  // Xử lý khi user chọn file
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);
    const errors: string[] = [];

    for (const file of newFiles) {
      // Validate từng file
      const error = this.fileUploadService.validateFile(file);
      if (error) {
        errors.push(error);
        continue;
      }
      // Kiểm tra trùng tên (không thêm file đã chọn)
      if (!this.selectedFiles().some(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.update(files => [...files, file]);
      }
    }

    // Giới hạn 10 files
    if (this.selectedFiles().length > 10) {
      this.selectedFiles.update(files => files.slice(0, 10));
      alert('Tối đa 10 files mỗi lần gửi.');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    // Reset input để có thể chọn lại cùng file
    input.value = '';
  }

  // Xoá 1 file khỏi danh sách đã chọn
  removeFile(file: File) {
    // Giải phóng bộ nhớ của Object URL để tránh rò rỉ RAM trình duyệt
    const cachedUrl = this.previewUrlCache.get(file);
    if (cachedUrl) {
      URL.revokeObjectURL(cachedUrl);
      this.previewUrlCache.delete(file);
    }
    this.selectedFiles.update(files => files.filter(f => f !== file));
  }

  // Kiểm tra file có phải ảnh không (để hiện preview)
  isImageFile(file: File): boolean {
    return this.fileUploadService.isImage(file);
  }

  // Tạo URL preview cho ảnh (dùng URL.createObjectURL)
  getPreviewUrl(file: File): string {
    let cachedUrl = this.previewUrlCache.get(file);
    if (!cachedUrl) {
      cachedUrl = URL.createObjectURL(file);
      this.previewUrlCache.set(file, cachedUrl);
    }
    return cachedUrl;
  }

  // Format size cho hiển thị
  formatSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  /// ====END:  XU LY FILE ====


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
import { inject, Injectable } from '@angular/core';
import { UploadFileResult } from '../models/attachment.dto';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private http = inject(HttpClient);

  // --- Cấu hình giới hạn (phải khớp với server) ---
  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024;  // 25MB
  private readonly MAX_FILES = 10;                      // tối đa 10 files/lần

  // Extension cho phép upload (phải khớp với server)
  private readonly ALLOWED_EXTENSIONS = new Set([
    // Ảnh
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    // Tài liệu
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
    // Video
    '.mp4', '.webm', '.mov',
    // Audio
    '.mp3', '.wav', '.ogg',
    // Nén
    '.zip', '.rar', '.7z'
  ]);

  // Các MIME type là ảnh (dùng để hiển thị preview trước khi upload)
  private readonly IMAGE_TYPES = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp'
  ]);
  constructor() { }

  validateFile(file: File): string | null {
    // - Kiểm tra kích thước
    if (file.size > this.MAX_FILE_SIZE) {
      const maxMB = this.MAX_FILE_SIZE / 1024 / 1024;
      return `File "${file.name}" quá lớn. Tối đa ${maxMB}MB.`;
    }

    // -Kiểm tra extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.has(ext)) {
      return `Loại file "${ext}" không được hỗ trợ.`;
    }

    return null; // OK
  }

  // Kiểm tra file có phải ảnh không (dùng cho preview)
  isImage(file: File): boolean {
    return this.IMAGE_TYPES.has(file.type);
  }

  // Upload 1 file
  async uploadFile(file: File): Promise<UploadFileResult> {
    const formData = new FormData();
    formData.append('file', file);

    // Dùng firstValueFrom để chuyển Observable → Promise
    const response = await fetch('/api/file/upload', {
      method: 'POST',
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  // Upload nhiều files song song
  async uploadFiles(files: File[]): Promise<{
    results: UploadFileResult[];
    errors: { fileName: string; error: string }[];
  }> {
    const results: UploadFileResult[] = [];
    const errors: { fileName: string; error: string }[] = [];

    // Upload song song bằng Promise.allSettled
    // Promise.allSettled: chờ TẤT CẢ hoàn thành (kể cả lỗi)
    //   khác Promise.all: dừng ngay khi 1 cái lỗi
    const promises = files.map(async (file) => {
      try {
        const result = await this.uploadFile(file);
        return { status: 'ok' as const, file, result };
      } catch (err: any) {
        return { status: 'error' as const, file, error: err.message };
      }
    });

    const settled = await Promise.all(promises);

    for (const item of settled) {
      if (item.status === 'ok') {
        results.push(item.result);
      } else {
        errors.push({ fileName: item.file.name, error: item.error });
      }
    }

    return { results, errors };
  }

  // Format kích thước file để hiển thị: "2.5 MB", "340 KB"
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + units[i];
  }
}

// DTO cho 1 file đính kèm trong message
export interface AttachmentDto {
    fileId: string;
    fileName: string;
    url: string;                // "/api/file/{id}"
    thumbnailUrl?: string;      // "/api/file/{id}/thumbnail" (null nếu ko phải ảnh)
    contentType: string;        // "image/jpeg", "application/pdf"
    size: number;               // bytes
    fileType: string;           // "Image" | "Document" | "Video" | "Audio" | "Other"
}

// Kết quả trả về sau khi upload 1 file
export interface UploadFileResult {
    fileId: string;
    url: string;
    thumbnailUrl?: string;
    fileName: string;
    contentType: string;
    size: number;
    fileType: string;
}

// Theo dõi progress upload từng file
export interface UploadProgress {
    file: File;
    fileName: string;
    progress: number;           // 0-100
    status: 'pending' | 'uploading' | 'done' | 'error';
    result?: UploadFileResult;  // có khi status = 'done'
    error?: string;             // có khi status = 'error'
}

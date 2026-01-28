export interface Attachment {
  id: number;
  nodeId: number;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface AttachmentUploadResponse {
  attachment: Attachment;
  success: boolean;
  message?: string;
}

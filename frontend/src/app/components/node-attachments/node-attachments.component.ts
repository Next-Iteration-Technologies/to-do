import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node } from '../../models/node.model';
import { Attachment } from '../../models/attachment.model';
import { AttachmentService } from '../../services/attachment.service';

@Component({
  selector: 'app-node-attachments',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (node()) {
      <div class="attachments-panel">
        <div class="attachments-header">
          <h3>Attachments</h3>
          <button class="close-btn" (click)="close()" title="Close (Esc)">×</button>
        </div>
        <div class="attachments-content">
          <div class="upload-area"
               [class.drag-over]="isDragOver()"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)">
            <input type="file"
                   #fileInput
                   (change)="onFileSelected($event)"
                   accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                   style="display: none">
            <p>Drag and drop files here or</p>
            <button class="upload-btn" (click)="fileInput.click()">Choose File</button>
            <small>Max 5 MB per file. Images and documents only.</small>
          </div>

          @if (isLoading()) {
            <div class="loading">Loading attachments...</div>
          }

          @if (error()) {
            <div class="error">{{ error() }}</div>
          }

          @if (attachments().length > 0) {
            <div class="attachments-list">
              @for (attachment of attachments(); track attachment.id) {
                <div class="attachment-item">
                  <div class="attachment-icon">{{ getFileIcon(attachment.mimeType) }}</div>
                  <div class="attachment-info">
                    <span class="attachment-name">{{ attachment.originalFilename }}</span>
                    <span class="attachment-size">{{ formatFileSize(attachment.fileSize) }}</span>
                  </div>
                  <div class="attachment-actions">
                    <a [href]="getDownloadUrl(attachment.id)" 
                       target="_blank" 
                       class="action-btn download-btn" 
                       title="Download">↓</a>
                    <button class="action-btn delete-btn" 
                            (click)="deleteAttachment(attachment.id)" 
                            title="Delete">×</button>
                  </div>
                </div>
              }
            </div>
          } @else if (!isLoading()) {
            <div class="no-attachments">No attachments yet</div>
          }
        </div>
        <div class="attachments-footer">
          <small>{{ attachments().length }}/5 attachments</small>
        </div>
      </div>
    }
  `,
  styles: [`
    .attachments-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      max-width: 90vw;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    .attachments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .attachments-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .close-btn:hover {
      background-color: #f0f0f0;
    }

    .attachments-content {
      flex: 1;
      padding: 16px;
      overflow: auto;
    }

    .upload-area {
      border: 2px dashed #d0d0d0;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin-bottom: 16px;
      transition: all 0.2s ease;
    }

    .upload-area.drag-over {
      border-color: #007bff;
      background-color: rgba(0, 123, 255, 0.05);
    }

    .upload-area p {
      margin: 0 0 12px 0;
      color: #666;
    }

    .upload-area small {
      display: block;
      margin-top: 12px;
      color: #999;
    }

    .upload-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .upload-btn:hover {
      background-color: #0056b3;
    }

    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      gap: 12px;
    }

    .attachment-icon {
      font-size: 24px;
      width: 32px;
      text-align: center;
    }

    .attachment-info {
      flex: 1;
      min-width: 0;
    }

    .attachment-name {
      display: block;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .attachment-size {
      display: block;
      font-size: 12px;
      color: #666;
    }

    .attachment-actions {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      background: none;
      border: 1px solid #d0d0d0;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      text-decoration: none;
      color: inherit;
    }

    .action-btn:hover {
      background-color: #e9ecef;
    }

    .delete-btn:hover {
      background-color: #ffebee;
      border-color: #f44336;
      color: #f44336;
    }

    .loading, .error, .no-attachments {
      text-align: center;
      padding: 24px;
      color: #666;
    }

    .error {
      color: #f44336;
      background-color: #ffebee;
      border-radius: 4px;
    }

    .attachments-footer {
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .attachments-panel {
        width: 100vw;
      }
    }
  `]
})
export class NodeAttachmentsComponent implements OnChanges {
  node = input<Node | null>(null);
  closePanel = output<void>();
  attachmentCountChanged = output<number>();

  private readonly attachmentService = inject(AttachmentService);

  attachments = signal<Attachment[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isDragOver = signal(false);

  attachmentCount = computed(() => this.attachments().length);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['node'] && this.node()) {
      this.loadAttachments();
    }
  }

  loadAttachments(): void {
    const currentNode = this.node();
    if (!currentNode) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.attachmentService.getAttachmentsByNodeId(currentNode.id).subscribe({
      next: (attachments) => {
        this.attachments.set(attachments);
        this.isLoading.set(false);
        this.attachmentCountChanged.emit(attachments.length);
      },
      error: () => {
        this.error.set('Failed to load attachments');
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  uploadFile(file: File): void {
    const currentNode = this.node();
    if (!currentNode) return;

    if (this.attachments().length >= 5) {
      this.error.set('Maximum 5 attachments allowed per node');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.attachmentService.uploadAttachment(currentNode.id, file).subscribe({
      next: (attachment) => {
        this.attachments.update(list => [...list, attachment]);
        this.isLoading.set(false);
        this.attachmentCountChanged.emit(this.attachments().length);
      },
      error: () => {
        this.error.set('Failed to upload file');
        this.isLoading.set(false);
      }
    });
  }

  deleteAttachment(attachmentId: number): void {
    this.attachmentService.deleteAttachment(attachmentId).subscribe({
      next: () => {
        this.attachments.update(list => list.filter(a => a.id !== attachmentId));
        this.attachmentCountChanged.emit(this.attachments().length);
      },
      error: () => {
        this.error.set('Failed to delete attachment');
      }
    });
  }

  getDownloadUrl(attachmentId: number): string {
    return this.attachmentService.getDownloadUrl(attachmentId);
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  close(): void {
    this.closePanel.emit();
  }
}

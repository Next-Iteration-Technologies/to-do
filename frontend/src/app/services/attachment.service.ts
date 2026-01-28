import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attachment } from '../models/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private readonly apiUrl = 'http://localhost:8080/api/attachments';
  private readonly http = inject(HttpClient);

  getAttachmentsByNodeId(nodeId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/node/${nodeId}`);
  }

  getAttachmentCount(nodeId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/node/${nodeId}/count`);
  }

  uploadAttachment(nodeId: number, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.apiUrl}/node/${nodeId}`, formData);
  }

  deleteAttachment(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${attachmentId}`);
  }

  getDownloadUrl(attachmentId: number): string {
    return `${this.apiUrl}/download/${attachmentId}`;
  }
}

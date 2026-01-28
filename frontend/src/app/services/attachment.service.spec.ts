import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AttachmentService } from './attachment.service';
import { Attachment } from '../models/attachment.model';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let httpMock: HttpTestingController;
  let testAttachment: Attachment;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AttachmentService]
    });
    service = TestBed.inject(AttachmentService);
    httpMock = TestBed.inject(HttpTestingController);

    testAttachment = {
      id: 1,
      nodeId: 1,
      originalFilename: 'test.pdf',
      storedFilename: 'uuid-test.pdf',
      filePath: '/uploads/uuid-test.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
      createdAt: new Date().toISOString()
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get attachments by node id', () => {
    const mockAttachments = [testAttachment];

    service.getAttachmentsByNodeId(1).subscribe(attachments => {
      expect(attachments).toEqual(mockAttachments);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/attachments/node/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockAttachments);
  });

  it('should get attachment count', () => {
    service.getAttachmentCount(1).subscribe(count => {
      expect(count).toBe(3);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/attachments/node/1/count');
    expect(req.request.method).toBe('GET');
    req.flush(3);
  });

  it('should upload attachment', () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    service.uploadAttachment(1, file).subscribe(attachment => {
      expect(attachment).toEqual(testAttachment);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/attachments/node/1');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(testAttachment);
  });

  it('should delete attachment', () => {
    service.deleteAttachment(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/attachments/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should return correct download url', () => {
    const url = service.getDownloadUrl(1);
    expect(url).toBe('http://localhost:8080/api/attachments/download/1');
  });
});

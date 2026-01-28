import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NodeAttachmentsComponent } from './node-attachments.component';
import { AttachmentService } from '../../services/attachment.service';
import { of, throwError } from 'rxjs';
import { Attachment } from '../../models/attachment.model';
import { Node } from '../../models/node.model';

describe('NodeAttachmentsComponent', () => {
  let component: NodeAttachmentsComponent;
  let fixture: ComponentFixture<NodeAttachmentsComponent>;
  let attachmentService: jasmine.SpyObj<AttachmentService>;
  let testNode: Node;
  let testAttachment: Attachment;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AttachmentService', [
      'getAttachmentsByNodeId',
      'uploadAttachment',
      'deleteAttachment',
      'getDownloadUrl'
    ]);

    await TestBed.configureTestingModule({
      imports: [NodeAttachmentsComponent, HttpClientTestingModule],
      providers: [{ provide: AttachmentService, useValue: spy }]
    }).compileComponents();

    attachmentService = TestBed.inject(AttachmentService) as jasmine.SpyObj<AttachmentService>;
    fixture = TestBed.createComponent(NodeAttachmentsComponent);
    component = fixture.componentInstance;

    testNode = {
      id: 1,
      content: 'Test Node',
      parentId: null,
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load attachments when node changes', () => {
    attachmentService.getAttachmentsByNodeId.and.returnValue(of([testAttachment]));
    fixture.componentRef.setInput('node', testNode);
    fixture.detectChanges();

    expect(attachmentService.getAttachmentsByNodeId).toHaveBeenCalledWith(1);
    expect(component.attachments().length).toBe(1);
  });

  it('should handle load attachments error', () => {
    attachmentService.getAttachmentsByNodeId.and.returnValue(throwError(() => new Error('Failed')));
    fixture.componentRef.setInput('node', testNode);
    fixture.detectChanges();

    expect(component.error()).toBe('Failed to load attachments');
  });

  it('should upload file successfully', () => {
    attachmentService.getAttachmentsByNodeId.and.returnValue(of([]));
    attachmentService.uploadAttachment.and.returnValue(of(testAttachment));
    fixture.componentRef.setInput('node', testNode);
    fixture.detectChanges();

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.uploadFile(file);

    expect(attachmentService.uploadAttachment).toHaveBeenCalledWith(1, file);
    expect(component.attachments().length).toBe(1);
  });

  it('should prevent upload when max attachments reached', () => {
    const fiveAttachments = Array(5).fill(null).map((_, i) => ({ ...testAttachment, id: i }));
    attachmentService.getAttachmentsByNodeId.and.returnValue(of(fiveAttachments));
    fixture.componentRef.setInput('node', testNode);
    fixture.detectChanges();

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.uploadFile(file);

    expect(attachmentService.uploadAttachment).not.toHaveBeenCalled();
    expect(component.error()).toBe('Maximum 5 attachments allowed per node');
  });

  it('should delete attachment successfully', () => {
    attachmentService.getAttachmentsByNodeId.and.returnValue(of([testAttachment]));
    attachmentService.deleteAttachment.and.returnValue(of(void 0));
    fixture.componentRef.setInput('node', testNode);
    fixture.detectChanges();

    component.deleteAttachment(1);

    expect(attachmentService.deleteAttachment).toHaveBeenCalledWith(1);
    expect(component.attachments().length).toBe(0);
  });

  it('should return correct file icon for images', () => {
    expect(component.getFileIcon('image/png')).toBe('🖼️');
  });

  it('should return correct file icon for pdf', () => {
    expect(component.getFileIcon('application/pdf')).toBe('📄');
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(500)).toBe('500 B');
    expect(component.formatFileSize(1024)).toBe('1.0 KB');
    expect(component.formatFileSize(1048576)).toBe('1.0 MB');
  });

  it('should emit closePanel when close is called', () => {
    spyOn(component.closePanel, 'emit');
    component.close();
    expect(component.closePanel.emit).toHaveBeenCalled();
  });

  it('should get download url from service', () => {
    attachmentService.getDownloadUrl.and.returnValue('http://localhost:8080/api/attachments/download/1');
    const url = component.getDownloadUrl(1);
    expect(url).toBe('http://localhost:8080/api/attachments/download/1');
  });
});

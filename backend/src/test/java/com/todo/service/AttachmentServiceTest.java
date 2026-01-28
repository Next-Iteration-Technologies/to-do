package com.todo.service;

import com.todo.entity.Attachment;
import com.todo.repository.AttachmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttachmentServiceTest {

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private AttachmentService attachmentService;

    private Attachment testAttachment;

    @BeforeEach
    void setUp() {
        testAttachment = new Attachment();
        testAttachment.setId(1L);
        testAttachment.setNodeId(1L);
        testAttachment.setOriginalFilename("test.pdf");
        testAttachment.setStoredFilename("uuid-test.pdf");
        testAttachment.setFilePath("/uploads/uuid-test.pdf");
        testAttachment.setMimeType("application/pdf");
        testAttachment.setFileSize(1024L);
    }

    @Test
    void getAttachmentsByNodeId_returnsAttachments() {
        when(attachmentRepository.findByNodeIdOrderByCreatedAtAsc(1L))
                .thenReturn(List.of(testAttachment));

        List<Attachment> result = attachmentService.getAttachmentsByNodeId(1L);

        assertEquals(1, result.size());
        assertEquals("test.pdf", result.get(0).getOriginalFilename());
    }

    @Test
    void getAttachmentById_existingId_returnsAttachment() {
        when(attachmentRepository.findById(1L)).thenReturn(Optional.of(testAttachment));

        Attachment result = attachmentService.getAttachmentById(1L);

        assertEquals(testAttachment.getId(), result.getId());
    }

    @Test
    void getAttachmentById_nonExistentId_throwsException() {
        when(attachmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> attachmentService.getAttachmentById(99L));
    }

    @Test
    void addAttachment_withinLimit_savesAttachment() throws IOException {
        byte[] pdfContent = createPdfContent();
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", pdfContent
        );
        when(attachmentRepository.countByNodeId(1L)).thenReturn(0);
        when(fileStorageService.storeFile(file)).thenReturn("uuid-test.pdf");
        when(fileStorageService.getFilePath("uuid-test.pdf")).thenReturn(Path.of("/uploads/uuid-test.pdf"));
        when(attachmentRepository.save(any(Attachment.class))).thenReturn(testAttachment);

        Attachment result = attachmentService.addAttachment(1L, file);

        assertNotNull(result);
        verify(attachmentRepository).save(any(Attachment.class));
    }

    @Test
    void addAttachment_exceedsLimit_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", new byte[100]
        );
        when(attachmentRepository.countByNodeId(1L)).thenReturn(5);

        assertThrows(IllegalStateException.class,
                () -> attachmentService.addAttachment(1L, file));
    }

    @Test
    void deleteAttachment_existingAttachment_deletesFileAndRecord() throws IOException {
        when(attachmentRepository.findById(1L)).thenReturn(Optional.of(testAttachment));

        attachmentService.deleteAttachment(1L);

        verify(fileStorageService).deleteFile("uuid-test.pdf");
        verify(attachmentRepository).delete(testAttachment);
    }

    @Test
    void deleteAttachmentsByNodeId_deletesAllAttachments() throws IOException {
        when(attachmentRepository.findByNodeIdOrderByCreatedAtAsc(1L))
                .thenReturn(List.of(testAttachment));

        attachmentService.deleteAttachmentsByNodeId(1L);

        verify(fileStorageService).deleteFile("uuid-test.pdf");
        verify(attachmentRepository).deleteByNodeId(1L);
    }

    @Test
    void getAttachmentCount_returnsCorrectCount() {
        when(attachmentRepository.countByNodeId(1L)).thenReturn(3);

        int count = attachmentService.getAttachmentCount(1L);

        assertEquals(3, count);
    }

    private byte[] createPdfContent() {
        byte[] pdfHeader = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34};
        byte[] content = new byte[100];
        System.arraycopy(pdfHeader, 0, content, 0, pdfHeader.length);
        return content;
    }
}

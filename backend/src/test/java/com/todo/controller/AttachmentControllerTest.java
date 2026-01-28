package com.todo.controller;

import com.todo.entity.Attachment;
import com.todo.service.AttachmentService;
import com.todo.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttachmentControllerTest {

    @Mock
    private AttachmentService attachmentService;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private AttachmentController attachmentController;

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
    void getAttachments_returnsAttachmentsList() {
        when(attachmentService.getAttachmentsByNodeId(1L)).thenReturn(List.of(testAttachment));

        List<Attachment> result = attachmentController.getAttachments(1L);

        assertEquals(1, result.size());
        assertEquals("test.pdf", result.get(0).getOriginalFilename());
    }

    @Test
    void getAttachmentCount_returnsCount() {
        when(attachmentService.getAttachmentCount(1L)).thenReturn(3);

        ResponseEntity<Integer> response = attachmentController.getAttachmentCount(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(3, response.getBody());
    }

    @Test
    void uploadAttachment_returnsCreatedAttachment() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", new byte[100]
        );
        when(attachmentService.addAttachment(eq(1L), any())).thenReturn(testAttachment);

        ResponseEntity<Attachment> response = attachmentController.uploadAttachment(1L, file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("test.pdf", response.getBody().getOriginalFilename());
    }

    @Test
    void deleteAttachment_returnsOkStatus() throws IOException {
        doNothing().when(attachmentService).deleteAttachment(1L);

        ResponseEntity<Void> response = attachmentController.deleteAttachment(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(attachmentService).deleteAttachment(1L);
    }
}

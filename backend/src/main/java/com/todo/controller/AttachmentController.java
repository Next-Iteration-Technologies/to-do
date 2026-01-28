package com.todo.controller;

import com.todo.entity.Attachment;
import com.todo.service.AttachmentService;
import com.todo.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "http://localhost:4200")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final FileStorageService fileStorageService;

    public AttachmentController(AttachmentService attachmentService,
                                FileStorageService fileStorageService) {
        this.attachmentService = attachmentService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/node/{nodeId}")
    public List<Attachment> getAttachments(@PathVariable Long nodeId) {
        return attachmentService.getAttachmentsByNodeId(nodeId);
    }

    @GetMapping("/node/{nodeId}/count")
    public ResponseEntity<Integer> getAttachmentCount(@PathVariable Long nodeId) {
        return ResponseEntity.ok(attachmentService.getAttachmentCount(nodeId));
    }

    @PostMapping("/node/{nodeId}")
    public ResponseEntity<Attachment> uploadAttachment(
            @PathVariable Long nodeId,
            @RequestParam("file") MultipartFile file) throws IOException {
        Attachment attachment = attachmentService.addAttachment(nodeId, file);
        return ResponseEntity.ok(attachment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) throws IOException {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) throws IOException {
        Attachment attachment = attachmentService.getAttachmentById(id);
        Path filePath = fileStorageService.getFilePath(attachment.getStoredFilename());
        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
                .body(resource);
    }
}

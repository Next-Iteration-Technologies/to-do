package com.todo.service;

import com.todo.config.FileStorageConfig;
import com.todo.entity.Attachment;
import com.todo.repository.AttachmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             FileStorageService fileStorageService) {
        this.attachmentRepository = attachmentRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentsByNodeId(Long nodeId) {
        return attachmentRepository.findByNodeIdOrderByCreatedAtAsc(nodeId);
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentById(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found with id: " + attachmentId));
    }

    @Transactional
    public Attachment addAttachment(Long nodeId, MultipartFile file) throws IOException {
        validateAttachmentLimit(nodeId);
        String storedFilename = fileStorageService.storeFile(file);
        Attachment attachment = createAttachment(nodeId, file, storedFilename);
        return attachmentRepository.save(attachment);
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) throws IOException {
        Attachment attachment = getAttachmentById(attachmentId);
        fileStorageService.deleteFile(attachment.getStoredFilename());
        attachmentRepository.delete(attachment);
    }

    @Transactional
    public void deleteAttachmentsByNodeId(Long nodeId) throws IOException {
        List<Attachment> attachments = attachmentRepository.findByNodeIdOrderByCreatedAtAsc(nodeId);
        for (Attachment attachment : attachments) {
            fileStorageService.deleteFile(attachment.getStoredFilename());
        }
        attachmentRepository.deleteByNodeId(nodeId);
    }

    @Transactional(readOnly = true)
    public int getAttachmentCount(Long nodeId) {
        return attachmentRepository.countByNodeId(nodeId);
    }

    private void validateAttachmentLimit(Long nodeId) {
        int currentCount = attachmentRepository.countByNodeId(nodeId);
        if (currentCount >= FileStorageConfig.MAX_ATTACHMENTS_PER_NODE) {
            throw new IllegalStateException(
                    "Maximum attachments limit reached (" +
                            FileStorageConfig.MAX_ATTACHMENTS_PER_NODE + ")"
            );
        }
    }

    private Attachment createAttachment(Long nodeId, MultipartFile file, String storedFilename) {
        Attachment attachment = new Attachment();
        attachment.setNodeId(nodeId);
        attachment.setOriginalFilename(file.getOriginalFilename());
        attachment.setStoredFilename(storedFilename);
        attachment.setFilePath(fileStorageService.getFilePath(storedFilename).toString());
        attachment.setMimeType(file.getContentType());
        attachment.setFileSize(file.getSize());
        return attachment;
    }
}

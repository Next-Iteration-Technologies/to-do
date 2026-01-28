package com.todo.repository;

import com.todo.entity.Attachment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class AttachmentRepositoryTest {

    @Autowired
    private AttachmentRepository attachmentRepository;

    private Attachment createAttachment(Long nodeId, String filename) {
        Attachment attachment = new Attachment();
        attachment.setNodeId(nodeId);
        attachment.setOriginalFilename(filename);
        attachment.setStoredFilename("uuid-" + filename);
        attachment.setFilePath("/uploads/uuid-" + filename);
        attachment.setMimeType("application/pdf");
        attachment.setFileSize(1024L);
        return attachment;
    }

    @BeforeEach
    void setUp() {
        attachmentRepository.deleteAll();
    }

    @Test
    void saveAttachment_persistsAllFields() {
        Attachment attachment = new Attachment();
        attachment.setNodeId(1L);
        attachment.setOriginalFilename("test.pdf");
        attachment.setStoredFilename("uuid-test.pdf");
        attachment.setFilePath("/uploads/uuid-test.pdf");
        attachment.setMimeType("application/pdf");
        attachment.setFileSize(1024L);

        Attachment saved = attachmentRepository.save(attachment);

        assertNotNull(saved.getId());
        assertNotNull(saved.getCreatedAt());
        assertEquals("test.pdf", saved.getOriginalFilename());
        assertEquals("uuid-test.pdf", saved.getStoredFilename());
        assertEquals("/uploads/uuid-test.pdf", saved.getFilePath());
        assertEquals("application/pdf", saved.getMimeType());
        assertEquals(1024L, saved.getFileSize());
        assertEquals(1L, saved.getNodeId());
    }

    @Test
    void findByNodeIdOrderByCreatedAtAsc_returnsAttachmentsForNode() {
        Attachment a1 = createAttachment(1L, "file1.pdf");
        Attachment a2 = createAttachment(1L, "file2.pdf");
        Attachment a3 = createAttachment(2L, "file3.pdf");
        attachmentRepository.saveAll(List.of(a1, a2, a3));

        List<Attachment> result = attachmentRepository.findByNodeIdOrderByCreatedAtAsc(1L);

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(a -> a.getNodeId().equals(1L)));
    }

    @Test
    void findByNodeIdOrderByCreatedAtAsc_returnsEmptyListForNonExistentNode() {
        List<Attachment> result = attachmentRepository.findByNodeIdOrderByCreatedAtAsc(999L);

        assertTrue(result.isEmpty());
    }

    @Test
    void countByNodeId_returnsCorrectCount() {
        attachmentRepository.save(createAttachment(1L, "file1.pdf"));
        attachmentRepository.save(createAttachment(1L, "file2.pdf"));
        attachmentRepository.save(createAttachment(2L, "file3.pdf"));

        int count = attachmentRepository.countByNodeId(1L);

        assertEquals(2, count);
    }

    @Test
    void countByNodeId_returnsZeroForNonExistentNode() {
        int count = attachmentRepository.countByNodeId(999L);

        assertEquals(0, count);
    }

    @Test
    void deleteByNodeId_deletesAllAttachmentsForNode() {
        attachmentRepository.save(createAttachment(1L, "file1.pdf"));
        attachmentRepository.save(createAttachment(1L, "file2.pdf"));
        attachmentRepository.save(createAttachment(2L, "file3.pdf"));

        attachmentRepository.deleteByNodeId(1L);

        assertEquals(0, attachmentRepository.countByNodeId(1L));
        assertEquals(1, attachmentRepository.countByNodeId(2L));
    }

    @Test
    void findById_returnsAttachment() {
        Attachment saved = attachmentRepository.save(createAttachment(1L, "test.pdf"));

        Attachment found = attachmentRepository.findById(saved.getId()).orElse(null);

        assertNotNull(found);
        assertEquals(saved.getId(), found.getId());
        assertEquals("test.pdf", found.getOriginalFilename());
    }

    @Test
    void delete_removesAttachment() {
        Attachment saved = attachmentRepository.save(createAttachment(1L, "test.pdf"));
        Long id = saved.getId();

        attachmentRepository.delete(saved);

        assertFalse(attachmentRepository.findById(id).isPresent());
    }
}

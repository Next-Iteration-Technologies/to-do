package com.todo.repository;

import com.todo.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    
    List<Attachment> findByNodeIdOrderByCreatedAtAsc(Long nodeId);
    
    int countByNodeId(Long nodeId);
    
    void deleteByNodeId(Long nodeId);
}

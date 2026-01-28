package com.todo.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;

@Configuration
public class FileStorageConfig {

    private static final long BYTES_PER_MB = 1024L * 1024L;
    public static final long MAX_FILE_SIZE = 5 * BYTES_PER_MB;
    public static final int MAX_ATTACHMENTS_PER_NODE = 5;

    public static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/png", "image/jpeg", "image/gif", "image/webp"
    );

    public static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain"
    );

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
    }

    public String getUploadDir() {
        return uploadDir;
    }

    public static boolean isAllowedType(String contentType) {
        return ALLOWED_IMAGE_TYPES.contains(contentType) ||
                ALLOWED_DOCUMENT_TYPES.contains(contentType);
    }
}

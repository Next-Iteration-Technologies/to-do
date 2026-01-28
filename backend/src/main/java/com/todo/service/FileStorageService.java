package com.todo.service;

import com.todo.config.FileStorageConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService(FileStorageConfig config) {
        this.uploadPath = Paths.get(config.getUploadDir()).toAbsolutePath().normalize();
    }

    public String storeFile(MultipartFile file) throws IOException {
        validateFile(file);
        String storedFilename = generateStoredFilename(file.getOriginalFilename());
        Path targetPath = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return storedFilename;
    }

    public void deleteFile(String storedFilename) throws IOException {
        Path filePath = uploadPath.resolve(storedFilename);
        Files.deleteIfExists(filePath);
    }

    public Path getFilePath(String storedFilename) {
        return uploadPath.resolve(storedFilename);
    }

    private void validateFile(MultipartFile file) {
        validateNotEmpty(file);
        validateFileSize(file);
        validateFileType(file);
        validateFileIntegrity(file);
    }

    private void validateNotEmpty(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
    }

    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > FileStorageConfig.MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5 MB");
        }
    }

    private void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        if (!FileStorageConfig.isAllowedType(contentType)) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }
    }

    private void validateFileIntegrity(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = new byte[8];
            int bytesRead = inputStream.read(header);
            if (bytesRead < 4) {
                throw new IllegalArgumentException("File appears to be corrupted");
            }
            if (!validateMagicBytes(header, file.getContentType())) {
                throw new IllegalArgumentException("File content does not match declared type");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read file for validation");
        }
    }

    private boolean validateMagicBytes(byte[] header, String contentType) {
        if (contentType == null) {
            return false;
        }
        return switch (contentType) {
            case "image/png" -> isPng(header);
            case "image/jpeg" -> isJpeg(header);
            case "image/gif" -> isGif(header);
            case "application/pdf" -> isPdf(header);
            default -> true;
        };
    }

    private boolean isPng(byte[] header) {
        return header[0] == (byte) 0x89 && header[1] == 0x50 &&
                header[2] == 0x4E && header[3] == 0x47;
    }

    private boolean isJpeg(byte[] header) {
        return header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 &&
                header[2] == (byte) 0xFF;
    }

    private boolean isGif(byte[] header) {
        return header[0] == 0x47 && header[1] == 0x49 &&
                header[2] == 0x46 && header[3] == 0x38;
    }

    private boolean isPdf(byte[] header) {
        return header[0] == 0x25 && header[1] == 0x50 &&
                header[2] == 0x44 && header[3] == 0x46;
    }

    private String generateStoredFilename(String originalFilename) {
        return UUID.randomUUID() + "-" + originalFilename;
    }
}

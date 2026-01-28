package com.todo.service;

import com.todo.config.FileStorageConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        FileStorageConfig config = new TestFileStorageConfig(tempDir.toString());
        fileStorageService = new FileStorageService(config);
    }

    @Test
    void storeFile_validPdfFile_storesSuccessfully() throws IOException {
        byte[] pdfContent = createPdfContent();
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", pdfContent
        );

        String storedFilename = fileStorageService.storeFile(file);

        assertNotNull(storedFilename);
        assertTrue(storedFilename.endsWith("-test.pdf"));
        assertTrue(Files.exists(tempDir.resolve(storedFilename)));
    }

    @Test
    void storeFile_validTextFile_storesSuccessfully() throws IOException {
        byte[] textContent = "Hello World".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", textContent
        );

        String storedFilename = fileStorageService.storeFile(file);

        assertNotNull(storedFilename);
        assertTrue(storedFilename.endsWith("-test.txt"));
    }

    @Test
    void storeFile_emptyFile_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeFile(file)
        );
        assertEquals("File is empty", exception.getMessage());
    }

    @Test
    void storeFile_exceedsMaxSize_throwsException() {
        byte[] largeContent = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.pdf", "application/pdf", largeContent
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeFile(file)
        );
        assertTrue(exception.getMessage().contains("exceeds maximum limit"));
    }

    @Test
    void storeFile_disallowedType_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.exe", "application/x-msdownload", new byte[100]
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeFile(file)
        );
        assertTrue(exception.getMessage().contains("File type not allowed"));
    }

    @Test
    void storeFile_corruptedPng_throwsException() {
        byte[] fakeContent = "not a real png".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file", "fake.png", "image/png", fakeContent
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeFile(file)
        );
        assertTrue(exception.getMessage().contains("does not match declared type"));
    }

    @Test
    void deleteFile_existingFile_deletesSuccessfully() throws IOException {
        byte[] pdfContent = createPdfContent();
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", pdfContent
        );
        String storedFilename = fileStorageService.storeFile(file);

        fileStorageService.deleteFile(storedFilename);

        assertFalse(Files.exists(tempDir.resolve(storedFilename)));
    }

    @Test
    void deleteFile_nonExistentFile_doesNotThrow() {
        assertDoesNotThrow(() -> fileStorageService.deleteFile("nonexistent.pdf"));
    }

    @Test
    void getFilePath_returnsCorrectPath() {
        Path result = fileStorageService.getFilePath("test-file.pdf");

        assertTrue(result.toString().endsWith("test-file.pdf"));
    }

    private byte[] createPdfContent() {
        byte[] pdfHeader = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34};
        byte[] content = new byte[100];
        System.arraycopy(pdfHeader, 0, content, 0, pdfHeader.length);
        return content;
    }

    private static class TestFileStorageConfig extends FileStorageConfig {
        private final String uploadDir;

        TestFileStorageConfig(String uploadDir) {
            this.uploadDir = uploadDir;
        }

        @Override
        public String getUploadDir() {
            return uploadDir;
        }
    }
}

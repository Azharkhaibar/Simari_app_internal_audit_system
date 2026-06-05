CREATE TABLE sections_investasi_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    quarter ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    no VARCHAR(50) NOT NULL,
    bobot_section DECIMAL(5,2) DEFAULT 100,
    parameter VARCHAR(500) NOT NULL,
    description TEXT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    
    -- Gunakan nama yang berbeda dari yang sudah ada
    CONSTRAINT uk_section_period_holding UNIQUE (year, quarter, no, parameter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- =====================================================
-- TABLE: indikators_investasi_holding (TANPA DUPLIKAT INDEX)
-- =====================================================
CREATE TABLE indikators_investasi_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    quarter ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    section_id INT NOT NULL,
    no VARCHAR(50) NOT NULL,
    section_label VARCHAR(500) NOT NULL,
    bobot_section DECIMAL(5,2) NOT NULL,
    sub_no VARCHAR(50) NOT NULL,
    indikator VARCHAR(1000) NOT NULL,
    bobot_indikator DECIMAL(5,2) NOT NULL,
    sumber_risiko TEXT NULL,
    dampak TEXT NULL,
    low VARCHAR(200) NULL,
    low_to_moderate VARCHAR(200) NULL,
    moderate VARCHAR(200) NULL,
    moderate_to_high VARCHAR(200) NULL,
    high VARCHAR(200) NULL,
    mode ENUM('RASIO', 'NILAI_TUNGGAL', 'TEKS') DEFAULT 'RASIO',
    formula TEXT NULL,
    is_percent BOOLEAN DEFAULT FALSE,
    pembilang_label VARCHAR(255) NULL,
    pembilang_value DECIMAL(15,2) NULL,
    penyebut_label VARCHAR(255) NULL,
    penyebut_value DECIMAL(15,2) NULL,
    hasil DECIMAL(15,6) NULL,
    hasil_text VARCHAR(1000) NULL,
    peringkat INT NOT NULL,
    weighted DECIMAL(10,4) NOT NULL,
    keterangan TEXT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMP NULL,
    validated_by VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    deleted_by VARCHAR(100) NULL,
    version INT DEFAULT 1,
    revision_notes VARCHAR(50) NULL,
    
    -- Unique Constraint (nama berbeda)
    CONSTRAINT uk_indikator_period_subno_holding UNIQUE (year, quarter, sub_no, section_id),
    
    -- Foreign Key (nama berbeda)
    CONSTRAINT fk_indikator_section_holding 
        FOREIGN KEY (section_id) 
        REFERENCES sections_investasi_holding(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes (nama berbeda)
    INDEX idx_indikator_period_holding (year, quarter),
    INDEX idx_indikator_section_holding (section_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATABASE: KPMR Investasi
-- =====================================================

USE rims_v1;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS kpmr_investasi_skor_holding;
DROP TABLE IF EXISTS kpmr_investasi_definisi_holding;
DROP TABLE IF EXISTS kpmr_investasi_pertanyaan_holding;
DROP TABLE IF EXISTS kpmr_investasi_aspek_holding;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE ASPEK (MASTER)
-- =====================================================
CREATE TABLE kpmr_investasi_aspek_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    aspek_no VARCHAR(50) NOT NULL,
    aspek_title VARCHAR(255) NOT NULL,
    aspek_bobot DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE INDEX UQ_YEAR_ASPEK_NO (year, aspek_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE PERTANYAAN
-- =====================================================
CREATE TABLE kpmr_investasi_pertanyaan_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    aspek_no VARCHAR(50) NOT NULL,
    section_no VARCHAR(50) NOT NULL,
    section_title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX IDX_YEAR_ASPECT_SECTION (year, aspek_no, section_no),
    
    -- FOREIGN KEY ke aspek (ON DELETE CASCADE)
    CONSTRAINT fk_pertanyaan_aspek 
        FOREIGN KEY (year, aspek_no) 
        REFERENCES kpmr_investasi_aspek_holding(year, aspek_no) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DEFINISI
-- =====================================================
CREATE TABLE kpmr_investasi_definisi_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    aspek_no VARCHAR(50) NOT NULL,
    aspek_title VARCHAR(255) NOT NULL,
    aspek_bobot DECIMAL(5,2) DEFAULT 0,
    section_no VARCHAR(50) NOT NULL,
    section_title TEXT NOT NULL,
    level_1 TEXT NULL,
    level_2 TEXT NULL,
    level_3 TEXT NULL,
    level_4 TEXT NULL,
    level_5 TEXT NULL,
    evidence TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    
    UNIQUE INDEX IDX_KPMR_DEF_YEAR_ASPECT (year, aspek_no, section_no),
    
    -- FOREIGN KEY ke pertanyaan (ON DELETE CASCADE)
    CONSTRAINT fk_definisi_pertanyaan 
        FOREIGN KEY (year, aspek_no, section_no) 
        REFERENCES kpmr_investasi_pertanyaan_holding(year, aspek_no, section_no) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE SKOR
-- =====================================================
CREATE TABLE kpmr_investasi_skor_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    definition_id INT NOT NULL,
    year INT NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    section_skor DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    
    UNIQUE INDEX IDX_KPMR_SCORE_DEF_QUARTER (definition_id, year, quarter),
    
    -- FOREIGN KEY ke definisi (ON DELETE CASCADE)
    CONSTRAINT fk_skor_definisi 
        FOREIGN KEY (definition_id) 
        REFERENCES kpmr_investasi_definisi_holding(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- BAGIAN PASAR HOLDING
-- -- ================================================================================
-- -- ================================================================================

-- =====================================================
-- DATABASE: KPMR Pasar
-- =====================================================

USE rims_v1;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS kpmr_pasar_skor_holding;
DROP TABLE IF EXISTS kpmr_pasar_definisi_holding;
DROP TABLE IF EXISTS kpmr_pasar_pertanyaan_holding;
DROP TABLE IF EXISTS kpmr_pasar_aspek_holding;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE ASPEK (MASTER)
-- =====================================================
CREATE TABLE kpmr_pasar_aspek_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    aspek_no VARCHAR(50) NOT NULL,
    aspek_title VARCHAR(255) NOT NULL,
    aspek_bobot DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE INDEX UQ_YEAR_ASPEK_NO_PASAR (year, aspek_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE PERTANYAAN
-- =====================================================
CREATE TABLE kpmr_pasar_pertanyaan_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    aspek_no VARCHAR(50) NOT NULL,
    section_no VARCHAR(50) NOT NULL,
    section_title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX IDX_YEAR_ASPECT_SECTION_PASAR (year, aspek_no, section_no),
    
    CONSTRAINT fk_pertanyaan_aspek_pasar 
        FOREIGN KEY (year, aspek_no) 
        REFERENCES kpmr_pasar_aspek_holding(year, aspek_no) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DEFINISI
-- =====================================================
CREATE TABLE kpmr_pasar_definisi_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    aspek_no VARCHAR(50) NOT NULL,
    aspek_title VARCHAR(255) NOT NULL,
    aspek_bobot DECIMAL(5,2) DEFAULT 0,
    section_no VARCHAR(50) NOT NULL,
    section_title TEXT NOT NULL,
    level_1 TEXT NULL,
    level_2 TEXT NULL,
    level_3 TEXT NULL,
    level_4 TEXT NULL,
    level_5 TEXT NULL,
    evidence TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    
    UNIQUE INDEX IDX_KPMR_DEF_YEAR_ASPECT_PASAR (year, aspek_no, section_no),
    
    CONSTRAINT fk_definisi_pertanyaan_pasar 
        FOREIGN KEY (year, aspek_no, section_no) 
        REFERENCES kpmr_pasar_pertanyaan_holding(year, aspek_no, section_no) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE SKOR
-- =====================================================
CREATE TABLE kpmr_pasar_skor_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    definition_id INT NOT NULL,
    year INT NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    section_skor DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    
    UNIQUE INDEX IDX_KPMR_SCORE_DEF_QUARTER_PASAR (definition_id, year, quarter),
    
    CONSTRAINT fk_skor_definisi_pasar 
        FOREIGN KEY (definition_id) 
        REFERENCES kpmr_pasar_definisi_holding(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



use rims_v1

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sections_pasar_holding;
DROP TABLE IF EXISTS indikators_pasar_holding;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE: sections_pasar_holding
-- =====================================================
CREATE TABLE sections_pasar_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    quarter ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    no VARCHAR(50) NOT NULL,
    bobot_section DECIMAL(5,2) DEFAULT 100,
    parameter VARCHAR(500) NOT NULL,
    description TEXT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    
    CONSTRAINT uk_section_period_pasar UNIQUE (year, quarter, no, parameter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: indikators_pasar_holding
-- =====================================================
CREATE TABLE indikators_pasar_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    quarter ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    section_id INT NOT NULL,
    no VARCHAR(50) NOT NULL,
    section_label VARCHAR(500) NOT NULL,
    bobot_section DECIMAL(5,2) NOT NULL,
    sub_no VARCHAR(50) NOT NULL,
    indikator VARCHAR(1000) NOT NULL,
    bobot_indikator DECIMAL(5,2) NOT NULL,
    sumber_risiko TEXT NULL,
    dampak TEXT NULL,
    low VARCHAR(200) NULL,
    low_to_moderate VARCHAR(200) NULL,
    moderate VARCHAR(200) NULL,
    moderate_to_high VARCHAR(200) NULL,
    high VARCHAR(200) NULL,
    mode ENUM('RASIO', 'NILAI_TUNGGAL', 'TEKS') DEFAULT 'RASIO',
    formula TEXT NULL,
    is_percent BOOLEAN DEFAULT FALSE,
    pembilang_label VARCHAR(255) NULL,
    pembilang_value DECIMAL(15,2) NULL,
    penyebut_label VARCHAR(255) NULL,
    penyebut_value DECIMAL(15,2) NULL,
    hasil DECIMAL(15,6) NULL,
    hasil_text VARCHAR(1000) NULL,
    peringkat INT NOT NULL,
    weighted DECIMAL(10,4) NOT NULL,
    keterangan TEXT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMP NULL,
    validated_by VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    deleted_by VARCHAR(100) NULL,
    version INT DEFAULT 1,
    revision_notes VARCHAR(50) NULL,
    
    CONSTRAINT uk_indikator_period_subno_pasar UNIQUE (year, quarter, sub_no, section_id),
    
    CONSTRAINT fk_indikator_section_pasar 
        FOREIGN KEY (section_id) 
        REFERENCES sections_pasar_holding(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_indikator_period_pasar (year, quarter),
    INDEX idx_indikator_section_pasar (section_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BAGIAN Likuiditas HOLDING
-- -- ================================================================================
-- -- ================================================================================

-- =====================================================
-- DATABASE: Likuiditas Inherent
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sections_likuiditas_holding;
DROP TABLE IF EXISTS indikators_likuiditas_holding;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE: sections_likuiditas_holding
-- =====================================================
CREATE TABLE sections_likuiditas_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    quarter ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    no VARCHAR(50) NOT NULL,
    bobot_section DECIMAL(5,2) DEFAULT 100,
    parameter VARCHAR(500) NOT NULL,
    description TEXT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    
    CONSTRAINT uk_section_period_likuiditas UNIQUE (year, quarter, no, parameter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: indikators_likuiditas_holding
-- =====================================================
CREATE TABLE indikators_likuiditas_holding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    quarter ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    section_id INT NOT NULL,
    no VARCHAR(50) NOT NULL,
    section_label VARCHAR(500) NOT NULL,
    bobot_section DECIMAL(5,2) NOT NULL,
    sub_no VARCHAR(50) NOT NULL,
    indikator VARCHAR(1000) NOT NULL,
    bobot_indikator DECIMAL(5,2) NOT NULL,
    sumber_risiko TEXT NULL,
    dampak TEXT NULL,
    low VARCHAR(200) NULL,
    low_to_moderate VARCHAR(200) NULL,
    moderate VARCHAR(200) NULL,
    moderate_to_high VARCHAR(200) NULL,
    high VARCHAR(200) NULL,
    mode ENUM('RASIO', 'NILAI_TUNGGAL', 'TEKS') DEFAULT 'RASIO',
    formula TEXT NULL,
    is_percent BOOLEAN DEFAULT FALSE,
    pembilang_label VARCHAR(255) NULL,
    pembilang_value DECIMAL(15,2) NULL,
    penyebut_label VARCHAR(255) NULL,
    penyebut_value DECIMAL(15,2) NULL,
    hasil DECIMAL(15,6) NULL,
    hasil_text VARCHAR(1000) NULL,
    peringkat INT NOT NULL,
    weighted DECIMAL(10,4) NOT NULL,
    keterangan TEXT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMP NULL,
    validated_by VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    deleted_by VARCHAR(100) NULL,
    version INT DEFAULT 1,
    revision_notes VARCHAR(50) NULL,
    
    CONSTRAINT uk_indikator_period_subno_likuiditas UNIQUE (year, quarter, sub_no, section_id),
    
    CONSTRAINT fk_indikator_section_likuiditas 
        FOREIGN KEY (section_id) 
        REFERENCES sections_likuiditas_holding(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_indikator_period_likuiditas (year, quarter),
    INDEX idx_indikator_section_likuiditas (section_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- DATABASE: KPMR Likuiditas
-- =====================================================

SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE,
    TABLE_NAME
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'rims_v1'
    AND (CONSTRAINT_NAME LIKE '%likuiditas%' 
         OR CONSTRAINT_NAME LIKE '%pertanyaan%'
         OR CONSTRAINT_NAME LIKE '%aspek%'
         OR CONSTRAINT_NAME LIKE '%definisi%'
         OR CONSTRAINT_NAME LIKE '%skor%'
         OR TABLE_NAME LIKE '%likuiditas%')
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- Cek semua index di database untuk tabel likuiditas
SELECT 
    INDEX_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'rims_v1'
    AND (INDEX_NAME LIKE '%likuiditas%' 
         OR INDEX_NAME LIKE '%pertanyaan%'
         OR INDEX_NAME LIKE '%aspek%'
         OR INDEX_NAME LIKE '%definisi%'
         OR INDEX_NAME LIKE '%skor%'
         OR TABLE_NAME LIKE '%likuiditas%')
ORDER BY TABLE_NAME, INDEX_NAME;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS kpmr_likuiditas_skor_holding;
DROP TABLE IF EXISTS kpmr_likuiditas_definisi_holding;
DROP TABLE IF EXISTS kpmr_likuiditas_pertanyaan_holding;
DROP TABLE IF EXISTS kpmr_likuiditas_aspek_holding;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE 1: ASPEK (MASTER) - TIDAK ADA MASALAH
-- =====================================================
CREATE TABLE `kpmr_likuiditas_aspek_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_likuiditas_aspek_year_no` UNIQUE (`year`, `aspek_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 2: PERTANYAAN - BUAT INDEX UNTUK 3 KOLOM
-- =====================================================
CREATE TABLE `kpmr_likuiditas_pertanyaan_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    -- INDEX UNTUK FOREIGN KEY KE ASPEK (2 kolom)
    INDEX `idx_likuiditas_pertanyaan_aspek` (`year`, `aspek_no`),
    -- INDEX UNTUK FOREIGN KEY DARI DEFINISI (3 kolom) - INI PENTING!
    UNIQUE INDEX `idx_likuiditas_pertanyaan_composite` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `fk_likuiditas_pertanyaan_ke_aspek` 
        FOREIGN KEY (`year`, `aspek_no`) 
        REFERENCES `kpmr_likuiditas_aspek_holding`(`year`, `aspek_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 3: DEFINISI - FOREIGN KEY KE PERTANYAAN (3 kolom)
-- =====================================================
CREATE TABLE `kpmr_likuiditas_definisi_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) DEFAULT 0,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `level_1` TEXT NULL,
    `level_2` TEXT NULL,
    `level_3` TEXT NULL,
    `level_4` TEXT NULL,
    `level_5` TEXT NULL,
    `evidence` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_likuiditas_definisi` UNIQUE (`year`, `aspek_no`, `section_no`),
    -- FOREIGN KEY KE PERTANYAAN MENGGUNAKAN 3 KOLOM
    CONSTRAINT `fk_likuiditas_definisi_ke_pertanyaan` 
        FOREIGN KEY (`year`, `aspek_no`, `section_no`) 
        REFERENCES `kpmr_likuiditas_pertanyaan_holding`(`year`, `aspek_no`, `section_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 4: SKOR
-- =====================================================
CREATE TABLE `kpmr_likuiditas_skor_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `definition_id` INT NOT NULL,
    `year` INT NOT NULL,
    `quarter` VARCHAR(10) NOT NULL,
    `section_skor` DECIMAL(5,2) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_likuiditas_skor` UNIQUE (`definition_id`, `year`, `quarter`),
    CONSTRAINT `fk_likuiditas_skor_ke_definisi` 
        FOREIGN KEY (`definition_id`) 
        REFERENCES `kpmr_likuiditas_definisi_holding`(`id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BAGIAN OPERASIONAL HOLDING
-- -- ================================================================================
-- -- ================================================================================

use rims_v1
-- =====================================================
-- DATABASE: Operasional & KPMR Operasional
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- DROP TABLES (urutan terbalik dari dependensi)
-- =====================================================
DROP TABLE IF EXISTS `kpmr_operasional_skor_holding`;
DROP TABLE IF EXISTS `kpmr_operasional_definisi_holding`;
DROP TABLE IF EXISTS `kpmr_operasional_pertanyaan_holding`;
DROP TABLE IF EXISTS `kpmr_operasional_aspek_holding`;
DROP TABLE IF EXISTS `indikators_operasional_holding`;
DROP TABLE IF EXISTS `sections_operasional_holding`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE 1: SECTIONS OPERASIONAL (Master Section)
-- =====================================================
CREATE TABLE `sections_operasional_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL DEFAULT 100,
    `parameter` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_OPERASIONAL_SECTION_PERIOD_UNIQUE` (`year`, `quarter`, `no`, `parameter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 2: INDIKATORS OPERASIONAL HOLDING
-- =====================================================
CREATE TABLE `indikators_operasional_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `section_id` INT NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `section_label` VARCHAR(500) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL,
    `sub_no` VARCHAR(50) NOT NULL,
    `indikator` VARCHAR(1000) NOT NULL,
    `bobot_indikator` DECIMAL(5,2) NOT NULL,
    `sumber_risiko` TEXT NULL,
    `dampak` TEXT NULL,
    `low` VARCHAR(200) NULL,
    `low_to_moderate` VARCHAR(200) NULL,
    `moderate` VARCHAR(200) NULL,
    `moderate_to_high` VARCHAR(200) NULL,
    `high` VARCHAR(200) NULL,
    `mode` ENUM('RASIO', 'NILAI_TUNGGAL', 'TEKS') NOT NULL DEFAULT 'RASIO',
    `formula` TEXT NULL,
    `is_percent` BOOLEAN NOT NULL DEFAULT FALSE,
    `pembilang_label` VARCHAR(255) NULL,
    `pembilang_value` DECIMAL(15,2) NULL,
    `penyebut_label` VARCHAR(255) NULL,
    `penyebut_value` DECIMAL(15,2) NULL,
    `hasil` DECIMAL(15,6) NULL,
    `hasil_text` VARCHAR(1000) NULL,
    `peringkat` INT NOT NULL,
    `weighted` DECIMAL(10,4) NOT NULL,
    `keterangan` TEXT NULL,
    `is_validated` BOOLEAN NOT NULL DEFAULT FALSE,
    `validated_at` TIMESTAMP NULL,
    `validated_by` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `deleted_at` TIMESTAMP NULL,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    `deleted_by` VARCHAR(100) NULL,
    `version` INT NOT NULL DEFAULT 1,
    `revision_notes` VARCHAR(50) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_OPERASIONAL_PERIOD_SUBNO` (`year`, `quarter`, `sub_no`, `section_id`),
    INDEX `IDX_OPERASIONAL_PERIOD` (`year`, `quarter`),
    INDEX `IDX_OPERASIONAL_SECTION` (`section_id`),
    CONSTRAINT `FK_OPERASIONAL_SECTION` 
        FOREIGN KEY (`section_id`) 
        REFERENCES `sections_operasional_holding`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 3: KPMR OPERASIONAL ASPEK HOLDING
-- =====================================================
CREATE TABLE `kpmr_operasional_aspek_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_YEAR_ASPEK_NO_OPERASIONAL` (`year`, `aspek_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 4: KPMR OPERASIONAL PERTANYAAN HOLDING
-- =====================================================
-- PENTING: Tambahkan UNIQUE INDEX untuk (year, aspek_no, section_no)
CREATE table if not exists `kpmr_operasional_pertanyaan_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    INDEX `IDX_KPMR_OPERASIONAL_QUESTION_ASPECT` (`year`, `aspek_no`),
    -- ⚠️ INI PENTING: UNIQUE INDEX untuk foreign key ke definisi
    UNIQUE INDEX `UQ_KPMR_OPERASIONAL_QUESTION_COMPOSITE` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_OPERASIONAL_QUESTION_ASPECT` 
        FOREIGN KEY (`year`, `aspek_no`) 
        REFERENCES `kpmr_operasional_aspek_holding`(`year`, `aspek_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 5: KPMR OPERASIONAL DEFINISI HOLDING
-- =====================================================
CREATE table if not exists `kpmr_operasional_definisi_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `level_1` TEXT NULL,
    `level_2` TEXT NULL,
    `level_3` TEXT NULL,
    `level_4` TEXT NULL,
    `level_5` TEXT NULL,
    `evidence` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_OPERASIONAL_DEF_YEAR_ASPECT` (`year`, `aspek_no`, `section_no`),
    -- Foreign key ke tabel pertanyaan dengan 3 kolom
    CONSTRAINT `FK_KPMR_OPERASIONAL_DEF_QUESTION` 
        FOREIGN KEY (`year`, `aspek_no`, `section_no`) 
        REFERENCES `kpmr_operasional_pertanyaan_holding`(`year`, `aspek_no`, `section_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 6: KPMR OPERASIONAL SKOR HOLDING
-- =====================================================
CREATE TABLE `kpmr_operasional_skor_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `definition_id` INT NOT NULL,
    `year` INT NOT NULL,
    `quarter` VARCHAR(10) NOT NULL,
    `section_skor` DECIMAL(5,2) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_OPERASIONAL_SCORE_DEF_QUARTER` (`definition_id`, `year`, `quarter`),
    CONSTRAINT `FK_KPMR_OPERASIONAL_SCORE_DEFINITION` 
        FOREIGN KEY (`definition_id`) 
        REFERENCES `kpmr_operasional_definisi_holding`(`id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFIKASI TABEL
-- =====================================================
SHOW TABLES LIKE 'kpmr_operasional%';
SHOW TABLES LIKE '%operasional%';

-- BAGIAN HUKUM HOLDING
-- -- ================================================================================
-- -- ================================================================================

use rims_v1
-- =====================================================
-- DATABASE: HUKUM & KPMR Hukum
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- DROP TABLES (urutan terbalik dari dependensi)
-- =====================================================
DROP TABLE IF EXISTS `kpmr_hukum_skor_holding`;
DROP TABLE IF EXISTS `kpmr_hukum_definisi_holding`;
DROP TABLE IF EXISTS `kpmr_hukum_pertanyaan_holding`;
DROP TABLE IF EXISTS `kpmr_hukum_aspek_holding`;
DROP TABLE IF EXISTS `indikators_hukum_holding`;
DROP TABLE IF EXISTS `sections_hukum_holding`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE 1: SECTIONS HUKUM (Master Section)
-- =====================================================
CREATE TABLE `sections_hukum_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL DEFAULT 100,
    `parameter` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_HUKUM_SECTION_PERIOD_UNIQUE` (`year`, `quarter`, `no`, `parameter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 2: INDIKATORS HUKUM HOLDING
-- =====================================================
CREATE TABLE `indikators_hukum_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `section_id` INT NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `section_label` VARCHAR(500) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL,
    `sub_no` VARCHAR(50) NOT NULL,
    `indikator` VARCHAR(1000) NOT NULL,
    `bobot_indikator` DECIMAL(5,2) NOT NULL,
    `sumber_risiko` TEXT NULL,
    `dampak` TEXT NULL,
    `low` VARCHAR(200) NULL,
    `low_to_moderate` VARCHAR(200) NULL,
    `moderate` VARCHAR(200) NULL,
    `moderate_to_high` VARCHAR(200) NULL,
    `high` VARCHAR(200) NULL,
    `mode` ENUM('RASIO', 'NILAI_TUNGGAL', 'TEKS') NOT NULL DEFAULT 'RASIO',
    `formula` TEXT NULL,
    `is_percent` BOOLEAN NOT NULL DEFAULT FALSE,
    `pembilang_label` VARCHAR(255) NULL,
    `pembilang_value` DECIMAL(15,2) NULL,
    `penyebut_label` VARCHAR(255) NULL,
    `penyebut_value` DECIMAL(15,2) NULL,
    `hasil` DECIMAL(15,6) NULL,
    `hasil_text` VARCHAR(1000) NULL,
    `peringkat` INT NOT NULL,
    `weighted` DECIMAL(10,4) NOT NULL,
    `keterangan` TEXT NULL,
    `is_validated` BOOLEAN NOT NULL DEFAULT FALSE,
    `validated_at` TIMESTAMP NULL,
    `validated_by` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `deleted_at` TIMESTAMP NULL,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    `deleted_by` VARCHAR(100) NULL,
    `version` INT NOT NULL DEFAULT 1,
    `revision_notes` VARCHAR(50) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_HUKUM_PERIOD_SUBNO` (`year`, `quarter`, `sub_no`, `section_id`),
    INDEX `IDX_HUKUM_PERIOD` (`year`, `quarter`),
    INDEX `IDX_HUKUM_SECTION` (`section_id`),
    CONSTRAINT `FK_HUKUM_SECTION` 
        FOREIGN KEY (`section_id`) 
        REFERENCES `sections_hukum_holding`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 3: KPMR HUKUM ASPEK HOLDING
-- =====================================================
CREATE TABLE `kpmr_hukum_aspek_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_YEAR_ASPEK_NO_HUKUM` (`year`, `aspek_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 4: KPMR HUKUM PERTANYAAN HOLDING
-- =====================================================
CREATE TABLE `kpmr_hukum_pertanyaan_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    INDEX `IDX_KPMR_HUKUM_QUESTION_ASPECT` (`year`, `aspek_no`),
    -- ⚠️ UNIQUE INDEX untuk foreign key ke definisi
    UNIQUE INDEX `UQ_KPMR_HUKUM_QUESTION_COMPOSITE` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_HUKUM_QUESTION_ASPECT` 
        FOREIGN KEY (`year`, `aspek_no`) 
        REFERENCES `kpmr_hukum_aspek_holding`(`year`, `aspek_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 5: KPMR HUKUM DEFINISI HOLDING
-- =====================================================
CREATE TABLE `kpmr_hukum_definisi_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `level_1` TEXT NULL,
    `level_2` TEXT NULL,
    `level_3` TEXT NULL,
    `level_4` TEXT NULL,
    `level_5` TEXT NULL,
    `evidence` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_HUKUM_DEF_YEAR_ASPECT` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_HUKUM_DEF_QUESTION` 
        FOREIGN KEY (`year`, `aspek_no`, `section_no`) 
        REFERENCES `kpmr_hukum_pertanyaan_holding`(`year`, `aspek_no`, `section_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 6: KPMR HUKUM SKOR HOLDING
-- =====================================================
CREATE TABLE `kpmr_hukum_skor_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `definition_id` INT NOT NULL,
    `year` INT NOT NULL,
    `quarter` VARCHAR(10) NOT NULL,
    `section_skor` DECIMAL(5,2) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_HUKUM_SCORE_DEF_QUARTER` (`definition_id`, `year`, `quarter`),
    CONSTRAINT `FK_KPMR_HUKUM_SCORE_DEFINITION` 
        FOREIGN KEY (`definition_id`) 
        REFERENCES `kpmr_hukum_definisi_holding`(`id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFIKASI TABEL
-- =====================================================
SHOW TABLES LIKE 'kpmr_hukum%';
SHOW TABLES LIKE '%hukum%';

-- BAGIAN STRATEJIK HOLDING
-- -- ================================================================================
-- -- ================================================================================

use rims_v1
-- =====================================================
-- DATABASE: STRATEJIK & KPMR Stratejik
-- =====================================================


SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `kpmr_stratejik_skor_holding`;
DROP TABLE IF EXISTS `kpmr_stratejik_definisi_holding`;
DROP TABLE IF EXISTS `kpmr_stratejik_pertanyaan_holding`;
DROP TABLE IF EXISTS `kpmr_stratejik_aspek_holding`;
DROP TABLE IF EXISTS `indikators_stratejik_holding`;
DROP TABLE IF EXISTS `sections_stratejik_holding`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE 1: SECTIONS STRATEJIK (Master Section)
-- =====================================================
CREATE TABLE `sections_stratejik_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL DEFAULT 100,
    `parameter` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_STRATEJIK_SECTION_PERIOD_UNIQUE` (`year`, `quarter`, `no`, `parameter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 2: INDIKATORS STRATEJIK HOLDING
-- =====================================================
CREATE TABLE `indikators_stratejik_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `section_id` INT NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `section_label` VARCHAR(500) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL,
    `sub_no` VARCHAR(50) NOT NULL,
    `indikator` VARCHAR(1000) NOT NULL,
    `bobot_indikator` DECIMAL(5,2) NOT NULL,
    `sumber_risiko` TEXT NULL,
    `dampak` TEXT NULL,
    `low` VARCHAR(200) NULL,
    `low_to_moderate` VARCHAR(200) NULL,
    `moderate` VARCHAR(200) NULL,
    `moderate_to_high` VARCHAR(200) NULL,
    `high` VARCHAR(200) NULL,
    `mode` ENUM('RASIO', 'NILAI_TUNGGAL', 'TEKS') NOT NULL DEFAULT 'RASIO',
    `formula` TEXT NULL,
    `is_percent` BOOLEAN NOT NULL DEFAULT FALSE,
    `pembilang_label` VARCHAR(255) NULL,
    `pembilang_value` DECIMAL(15,2) NULL,
    `penyebut_label` VARCHAR(255) NULL,
    `penyebut_value` DECIMAL(15,2) NULL,
    `hasil` DECIMAL(15,6) NULL,
    `hasil_text` VARCHAR(1000) NULL,
    `peringkat` INT NOT NULL,
    `weighted` DECIMAL(10,4) NOT NULL,
    `keterangan` TEXT NULL,
    `is_validated` BOOLEAN NOT NULL DEFAULT FALSE,
    `validated_at` TIMESTAMP NULL,
    `validated_by` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `deleted_at` TIMESTAMP NULL,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    `deleted_by` VARCHAR(100) NULL,
    `version` INT NOT NULL DEFAULT 1,
    `revision_notes` VARCHAR(50) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_STRATEJIK_PERIOD_SUBNO` (`year`, `quarter`, `sub_no`, `section_id`),
    INDEX `IDX_STRATEJIK_PERIOD` (`year`, `quarter`),
    INDEX `IDX_STRATEJIK_SECTION` (`section_id`),
    CONSTRAINT `FK_STRATEJIK_SECTION` 
        FOREIGN KEY (`section_id`) 
        REFERENCES `sections_stratejik_holding`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 3: KPMR STRATEJIK ASPEK HOLDING
-- =====================================================
CREATE TABLE `kpmr_stratejik_aspek_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_YEAR_ASPEK_NO_STRATEJIK` (`year`, `aspek_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 4: KPMR STRATEJIK PERTANYAAN HOLDING
-- =====================================================
CREATE TABLE `kpmr_stratejik_pertanyaan_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    INDEX `IDX_KPMR_STRATEJIK_QUESTION_ASPECT` (`year`, `aspek_no`),
    -- ⚠️ UNIQUE INDEX untuk foreign key ke definisi
    UNIQUE INDEX `UQ_KPMR_STRATEJIK_QUESTION_COMPOSITE` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_STRATEJIK_QUESTION_ASPECT` 
        FOREIGN KEY (`year`, `aspek_no`) 
        REFERENCES `kpmr_stratejik_aspek_holding`(`year`, `aspek_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 5: KPMR STRATEJIK DEFINISI HOLDING
-- =====================================================
CREATE TABLE `kpmr_stratejik_definisi_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `level_1` TEXT NULL,
    `level_2` TEXT NULL,
    `level_3` TEXT NULL,
    `level_4` TEXT NULL,
    `level_5` TEXT NULL,
    `evidence` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_STRATEJIK_DEF_YEAR_ASPECT` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_STRATEJIK_DEF_QUESTION` 
        FOREIGN KEY (`year`, `aspek_no`, `section_no`) 
        REFERENCES `kpmr_stratejik_pertanyaan_holding`(`year`, `aspek_no`, `section_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 6: KPMR STRATEJIK SKOR HOLDING
-- =====================================================
CREATE TABLE `kpmr_stratejik_skor_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `definition_id` INT NOT NULL,
    `year` INT NOT NULL,
    `quarter` VARCHAR(10) NOT NULL,
    `section_skor` DECIMAL(5,2) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_STRATEJIK_SCORE_DEF_QUARTER` (`definition_id`, `year`, `quarter`),
    CONSTRAINT `FK_KPMR_STRATEJIK_SCORE_DEFINITION` 
        FOREIGN KEY (`definition_id`) 
        REFERENCES `kpmr_stratejik_definisi_holding`(`id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFIKASI TABEL
-- =====================================================
SHOW TABLES LIKE 'kpmr_stratejik%';
SHOW TABLES LIKE '%stratejik%';

-- =====================================================
-- DATABASE: Kepatuhan & KPMR Kepatuhan
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- DROP TABLES (urutan terbalik dari dependensi)
-- =====================================================
DROP TABLE IF EXISTS `kpmr_kepatuhan_skor_holding`;
DROP TABLE IF EXISTS `kpmr_kepatuhan_definisi_holding`;
DROP TABLE IF EXISTS `kpmr_kepatuhan_pertanyaan_holding`;
DROP TABLE IF EXISTS `kpmr_kepatuhan_aspek_holding`;
DROP TABLE IF EXISTS `indikators_kepatuhan_holding`;
DROP TABLE IF EXISTS `sections_kepatuhan_holding`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE 1: SECTIONS KEPATUHAN (Master Section)
-- =====================================================
CREATE TABLE `sections_kepatuhan_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL DEFAULT 100,
    `parameter` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KEPATUHAN_SECTION_PERIOD_UNIQUE` (`year`, `quarter`, `no`, `parameter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 2: INDIKATORS KEPATUHAN HOLDING
-- =====================================================
CREATE TABLE `indikators_kepatuhan_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `section_id` INT NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `section_label` VARCHAR(500) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL,
    `sub_no` VARCHAR(50) NOT NULL,
    `indikator` VARCHAR(1000) NOT NULL,
    `bobot_indikator` DECIMAL(5,2) NOT NULL,
    `sumber_risiko` TEXT NULL,
    `dampak` TEXT NULL,
    `low` VARCHAR(200) NULL,
    `low_to_moderate` VARCHAR(200) NULL,
    `moderate` VARCHAR(200) NULL,
    `moderate_to_high` VARCHAR(200) NULL,
    `high` VARCHAR(200) NULL,
    `mode` ENUM('RASIO', 'NILAI_TUNGGAL', 'TEKS') NOT NULL DEFAULT 'RASIO',
    `formula` TEXT NULL,
    `is_percent` BOOLEAN NOT NULL DEFAULT FALSE,
    `pembilang_label` VARCHAR(255) NULL,
    `pembilang_value` DECIMAL(15,2) NULL,
    `penyebut_label` VARCHAR(255) NULL,
    `penyebut_value` DECIMAL(15,2) NULL,
    `hasil` DECIMAL(15,6) NULL,
    `hasil_text` VARCHAR(1000) NULL,
    `peringkat` INT NOT NULL,
    `weighted` DECIMAL(10,4) NOT NULL,
    `keterangan` TEXT NULL,
    `is_validated` BOOLEAN NOT NULL DEFAULT FALSE,
    `validated_at` TIMESTAMP NULL,
    `validated_by` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `deleted_at` TIMESTAMP NULL,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    `deleted_by` VARCHAR(100) NULL,
    `version` INT NOT NULL DEFAULT 1,
    `revision_notes` VARCHAR(50) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_KEPATUHAN_PERIOD_SUBNO` (`year`, `quarter`, `sub_no`, `section_id`),
    INDEX `IDX_KEPATUHAN_PERIOD` (`year`, `quarter`),
    INDEX `IDX_KEPATUHAN_SECTION` (`section_id`),
    CONSTRAINT `FK_KEPATUHAN_SECTION` 
        FOREIGN KEY (`section_id`) 
        REFERENCES `sections_kepatuhan_holding`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 3: KPMR KEPATUHAN ASPEK HOLDING
-- =====================================================
CREATE TABLE `kpmr_kepatuhan_aspek_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_YEAR_ASPEK_NO_KEPATUHAN` (`year`, `aspek_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 4: KPMR KEPATUHAN PERTANYAAN HOLDING
-- =====================================================
CREATE TABLE `kpmr_kepatuhan_pertanyaan_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    INDEX `IDX_KPMR_KEPATUHAN_QUESTION_ASPECT` (`year`, `aspek_no`),
    -- ⚠️ UNIQUE INDEX untuk foreign key ke definisi
    UNIQUE INDEX `UQ_KPMR_KEPATUHAN_QUESTION_COMPOSITE` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_KEPATUHAN_QUESTION_ASPECT` 
        FOREIGN KEY (`year`, `aspek_no`) 
        REFERENCES `kpmr_kepatuhan_aspek_holding`(`year`, `aspek_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 5: KPMR KEPATUHAN DEFINISI HOLDING
-- =====================================================
CREATE TABLE `kpmr_kepatuhan_definisi_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `level_1` TEXT NULL,
    `level_2` TEXT NULL,
    `level_3` TEXT NULL,
    `level_4` TEXT NULL,
    `level_5` TEXT NULL,
    `evidence` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_KEPATUHAN_DEF_YEAR_ASPECT` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_KEPATUHAN_DEF_QUESTION` 
        FOREIGN KEY (`year`, `aspek_no`, `section_no`) 
        REFERENCES `kpmr_kepatuhan_pertanyaan_holding`(`year`, `aspek_no`, `section_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 6: KPMR KEPATUHAN SKOR HOLDING
-- =====================================================
CREATE TABLE `kpmr_kepatuhan_skor_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `definition_id` INT NOT NULL,
    `year` INT NOT NULL,
    `quarter` VARCHAR(10) NOT NULL,
    `section_skor` DECIMAL(5,2) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_KEPATUHAN_SCORE_DEF_QUARTER` (`definition_id`, `year`, `quarter`),
    CONSTRAINT `FK_KPMR_KEPATUHAN_SCORE_DEFINITION` 
        FOREIGN KEY (`definition_id`) 
        REFERENCES `kpmr_kepatuhan_definisi_holding`(`id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFIKASI TABEL
-- =====================================================
SHOW TABLES LIKE 'kpmr_kepatuhan%';
SHOW TABLES LIKE '%kepatuhan%';

-- =====================================================
-- DATABASE: Reputasi & KPMR Reputasi
-- =====================================================

use rims_v1

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- DROP TABLES (urutan terbalik dari dependensi)
-- =====================================================
DROP TABLE IF EXISTS `kpmr_reputasi_skor_holding`;
DROP TABLE IF EXISTS `kpmr_reputasi_definisi_holding`;
DROP TABLE IF EXISTS `kpmr_reputasi_pertanyaan_holding`;
DROP TABLE IF EXISTS `kpmr_reputasi_aspek_holding`;
DROP TABLE IF EXISTS `indikators_reputasi_holding`;
DROP TABLE IF EXISTS `sections_reputasi_holding`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE 1: SECTIONS REPUTASI (Master Section)
-- =====================================================
CREATE TABLE `sections_reputasi_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL DEFAULT 100,
    `parameter` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_REPUTASI_SECTION_PERIOD_UNIQUE` (`year`, `quarter`, `no`, `parameter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 2: INDIKATORS REPUTASI HOLDING
-- =====================================================
CREATE TABLE `indikators_reputasi_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    `section_id` INT NOT NULL,
    `no` VARCHAR(50) NOT NULL,
    `section_label` VARCHAR(500) NOT NULL,
    `bobot_section` DECIMAL(5,2) NOT NULL,
    `sub_no` VARCHAR(50) NOT NULL,
    `indikator` VARCHAR(1000) NOT NULL,
    `bobot_indikator` DECIMAL(5,2) NOT NULL,
    `sumber_risiko` TEXT NULL,
    `dampak` TEXT NULL,
    `low` VARCHAR(200) NULL,
    `low_to_moderate` VARCHAR(200) NULL,
    `moderate` VARCHAR(200) NULL,
    `moderate_to_high` VARCHAR(200) NULL,
    `high` VARCHAR(200) NULL,
    `mode` ENUM('RASIO', 'NILAI_TUNGGAL', 'TEKS') NOT NULL DEFAULT 'RASIO',
    `formula` TEXT NULL,
    `is_percent` BOOLEAN NOT NULL DEFAULT FALSE,
    `pembilang_label` VARCHAR(255) NULL,
    `pembilang_value` DECIMAL(15,2) NULL,
    `penyebut_label` VARCHAR(255) NULL,
    `penyebut_value` DECIMAL(15,2) NULL,
    `hasil` DECIMAL(15,6) NULL,
    `hasil_text` VARCHAR(1000) NULL,
    `peringkat` INT NOT NULL,
    `weighted` DECIMAL(10,4) NOT NULL,
    `keterangan` TEXT NULL,
    `is_validated` BOOLEAN NOT NULL DEFAULT FALSE,
    `validated_at` TIMESTAMP NULL,
    `validated_by` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `deleted_at` TIMESTAMP NULL,
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    `deleted_by` VARCHAR(100) NULL,
    `version` INT NOT NULL DEFAULT 1,
    `revision_notes` VARCHAR(50) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_REPUTASI_PERIOD_SUBNO` (`year`, `quarter`, `sub_no`, `section_id`),
    INDEX `IDX_REPUTASI_PERIOD` (`year`, `quarter`),
    INDEX `IDX_REPUTASI_SECTION` (`section_id`),
    CONSTRAINT `FK_REPUTASI_SECTION` 
        FOREIGN KEY (`section_id`) 
        REFERENCES `sections_reputasi_holding`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 3: KPMR REPUTASI ASPEK HOLDING
-- =====================================================
CREATE TABLE `kpmr_reputasi_aspek_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UQ_YEAR_ASPEK_NO_REPUTASI` (`year`, `aspek_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 4: KPMR REPUTASI PERTANYAAN HOLDING
-- =====================================================
CREATE TABLE `kpmr_reputasi_pertanyaan_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    INDEX `IDX_KPMR_REPUTASI_QUESTION_ASPECT` (`year`, `aspek_no`),
    UNIQUE INDEX `UQ_KPMR_REPUTASI_QUESTION_COMPOSITE` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_REPUTASI_QUESTION_ASPECT` 
        FOREIGN KEY (`year`, `aspek_no`) 
        REFERENCES `kpmr_reputasi_aspek_holding`(`year`, `aspek_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 5: KPMR REPUTASI DEFINISI HOLDING
-- =====================================================
CREATE TABLE `kpmr_reputasi_definisi_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `year` INT NOT NULL,
    `aspek_no` VARCHAR(50) NOT NULL,
    `aspek_title` VARCHAR(255) NOT NULL,
    `aspek_bobot` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `section_no` VARCHAR(50) NOT NULL,
    `section_title` TEXT NOT NULL,
    `level_1` TEXT NULL,
    `level_2` TEXT NULL,
    `level_3` TEXT NULL,
    `level_4` TEXT NULL,
    `level_5` TEXT NULL,
    `evidence` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_REPUTASI_DEF_YEAR_ASPECT` (`year`, `aspek_no`, `section_no`),
    CONSTRAINT `FK_KPMR_REPUTASI_DEF_QUESTION` 
        FOREIGN KEY (`year`, `aspek_no`, `section_no`) 
        REFERENCES `kpmr_reputasi_pertanyaan_holding`(`year`, `aspek_no`, `section_no`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE 6: KPMR REPUTASI SKOR HOLDING
-- =====================================================
CREATE TABLE `kpmr_reputasi_skor_holding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `definition_id` INT NOT NULL,
    `year` INT NOT NULL,
    `quarter` VARCHAR(10) NOT NULL,
    `section_skor` DECIMAL(5,2) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(100) NULL,
    `updated_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `IDX_KPMR_REPUTASI_SCORE_DEF_QUARTER` (`definition_id`, `year`, `quarter`),
    CONSTRAINT `FK_KPMR_REPUTASI_SCORE_DEFINITION` 
        FOREIGN KEY (`definition_id`) 
        REFERENCES `kpmr_reputasi_definisi_holding`(`id`) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFIKASI TABEL
-- =====================================================
SHOW TABLES LIKE 'kpmr_reputasi%';
SHOW TABLES LIKE '%reputasi%';


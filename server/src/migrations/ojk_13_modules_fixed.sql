-- ================================================================================
-- OJK 13 MODULE MIGRATION SCRIPT
-- Database: rims_v1
-- Disesuaikan dengan TypeORM Entities
-- ================================================================================

USE rims_v1;

-- ============================================
-- DISABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- DROP ALL TABLES (urutan: child dulu, lalu parent)
-- ============================================

-- PASAR PRODUK
DROP TABLE IF EXISTS kpmr_pertanyaan_pasar_produk;
DROP TABLE IF EXISTS kpmr_aspek_pasar_ojk;
DROP TABLE IF EXISTS kpmr_pasar_produk_ojk;
DROP TABLE IF EXISTS pasar_produk_nilai_ojk;
DROP TABLE IF EXISTS pasar_produk_parameters_ojk;
DROP TABLE IF EXISTS pasar_produk_ojk;
DROP TABLE IF EXISTS inherent_references_pasar_ojk;

-- KONSENTRASI PRODUK
DROP TABLE IF EXISTS kpmr_pertanyaan_konsentrasi;
DROP TABLE IF EXISTS kpmr_aspek_konsentrasi_ojk;
DROP TABLE IF EXISTS kpmr_konsentrasi_ojk;
DROP TABLE IF EXISTS konsentrasi_nilai_ojk;
DROP TABLE IF EXISTS konsentrasi_parameters_ojk;
DROP TABLE IF EXISTS konsentrasi_produk_ojk;
DROP TABLE IF EXISTS inherent_references_konsentrasi_ojk;

-- KREDIT PRODUK
DROP TABLE IF EXISTS kpmr_pertanyaan_kredit;
DROP TABLE IF EXISTS kpmr_aspek_kredit;
DROP TABLE IF EXISTS kpmr_kredit_ojk;
DROP TABLE IF EXISTS kredit_nilai_ojk;
DROP TABLE IF EXISTS kredit_parameters_ojk;
DROP TABLE IF EXISTS kredit_produk_ojk;
DROP TABLE IF EXISTS inherent_references_kredit;

-- LIKUIDITAS
DROP TABLE IF EXISTS kpmr_pertanyaan_likuiditas;
DROP TABLE IF EXISTS kpmr_aspek_likuiditas;
DROP TABLE IF EXISTS kpmr_likuiditas_ojk;
DROP TABLE IF EXISTS likuiditas_nilai_ojk;
DROP TABLE IF EXISTS likuiditas_parameters_ojk;
DROP TABLE IF EXISTS likuiditas_ojk;
DROP TABLE IF EXISTS inherent_references_likuiditas_ojk;

-- OPERASIONAL
DROP TABLE IF EXISTS kpmr_pertanyaan_operasional;
DROP TABLE IF EXISTS kpmr_aspek_operasional;
DROP TABLE IF EXISTS kpmr_operasional_ojk;
DROP TABLE IF EXISTS operasional_nilai_ojk;
DROP TABLE IF EXISTS operasional_parameters_ojk;
DROP TABLE IF EXISTS operasional_ojk;
DROP TABLE IF EXISTS inherent_references_operasional_ojk;

-- HUKUM
DROP TABLE IF EXISTS kpmr_pertanyaan_hukum;
DROP TABLE IF EXISTS kpmr_aspek_hukum;
DROP TABLE IF EXISTS kpmr_hukum_ojk;
DROP TABLE IF EXISTS hukum_nilai_ojk;
DROP TABLE IF EXISTS hukum_parameters_ojk;
DROP TABLE IF EXISTS hukum_ojk;
DROP TABLE IF EXISTS inherent_references_hukum;

SET FOREIGN_KEY_CHECKS = 1;


-- ================================================================================
-- MODUL 1: PASAR PRODUK OJK
-- Entity: PasarProduk → 'pasar_produk_ojk'
-- ================================================================================

-- TABLE 1: inherent_references_pasar_ojk
-- Entity: PasarProdukReference → 'inherent_references_pasar_ojk'
CREATE TABLE inherent_references_pasar_ojk (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    type          VARCHAR(50)  NOT NULL,
    `key`         VARCHAR(50)  NOT NULL,
    label         VARCHAR(100) NOT NULL,
    color         VARCHAR(20)  NULL,
    description   TEXT         NULL,
    is_active     BOOLEAN      DEFAULT TRUE,
    `order`       INT          DEFAULT 0,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pasar_ref_type     (type),
    INDEX idx_pasar_ref_active   (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 2: pasar_produk_ojk
-- Entity: PasarProduk → 'pasar_produk_ojk'
CREATE TABLE pasar_produk_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    UNIQUE INDEX uniq_pasar_year_quarter          (year, quarter),
    INDEX        idx_pasar_year_quarter           (year, quarter),
    INDEX        idx_pasar_is_active_year_quarter (is_active, year, quarter),
    INDEX        idx_pasar_created_at             (created_at),
    CHECK (year    >= 2000 AND year    <= 2100),
    CHECK (quarter BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 3: pasar_produk_parameters_ojk
-- Entity: PasarProdukParameter → 'pasar_produk_parameters_ojk'
-- FK col: pasar_produk_ojk_id → pasar_produk_ojk(id)
CREATE TABLE pasar_produk_parameters_ojk (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nomor               VARCHAR(50)     NULL,
    judul               VARCHAR(255)    NOT NULL,
    bobot               DECIMAL(10, 2)  NOT NULL,
    kategori            JSON            NULL,
    pasar_produk_ojk_id INT             NOT NULL,
    order_index         INT             DEFAULT 0,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pasar_produk_ojk_id) REFERENCES pasar_produk_ojk(id) ON DELETE CASCADE,
    INDEX idx_pasar_param_ojk_id_nomor  (pasar_produk_ojk_id, nomor),
    INDEX idx_pasar_param_ojk_id_order  (pasar_produk_ojk_id, order_index),
    INDEX idx_pasar_param_ojk_id        (pasar_produk_ojk_id),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 4: pasar_produk_nilai_ojk
-- Entity: PasarProdukNilai → 'pasar_produk_nilai_ojk'
-- FK col: parameter_id → pasar_produk_parameters_ojk(id)
CREATE TABLE pasar_produk_nilai_ojk (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nomor        VARCHAR(50)    NULL,
    judul        JSON           NULL,
    bobot        DECIMAL(10, 2) NOT NULL,
    portofolio   VARCHAR(255)   NULL,
    keterangan   TEXT           NULL,
    riskindikator JSON          NULL,
    parameter_id INT            NOT NULL,
    order_index  INT            DEFAULT 0,
    created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parameter_id) REFERENCES pasar_produk_parameters_ojk(id) ON DELETE CASCADE,
    INDEX idx_pasar_nilai_param_id_nomor (parameter_id, nomor),
    INDEX idx_pasar_nilai_param_id       (parameter_id),
    INDEX idx_pasar_nilai_param_id_order (parameter_id, order_index),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 5: kpmr_pasar_produk_ojk
-- Entity: KpmrPasarProdukOjk → 'kpmr_pasar_produk_ojk'
CREATE TABLE kpmr_pasar_produk_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE NULL,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    INDEX idx_kpmr_pasar_year_quarter            (year, quarter),
    INDEX idx_kpmr_pasar_is_active_year_quarter  (is_active, year, quarter),
    INDEX idx_kpmr_pasar_created_at              (created_at),
    CHECK (year    >= 2000 AND year    <= 2100),
    CHECK (quarter BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 6: kpmr_aspek_pasar_ojk
-- Entity: KpmrAspekPasarProduk → 'kpmr_aspek_pasar_ojk'
-- FK col: kpmr_ojk_id → kpmr_pasar_produk_ojk(id)
CREATE TABLE kpmr_aspek_pasar_ojk (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(50)    NULL,
    judul         VARCHAR(255)   NOT NULL,
    bobot         DECIMAL(10, 2) DEFAULT 0.00,
    deskripsi     TEXT           NULL,
    kpmr_ojk_id   INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    average_score DECIMAL(10, 2) NULL,
    rating        VARCHAR(50)    NULL,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    VARCHAR(255)   NULL,
    notes         TEXT           NULL,
    FOREIGN KEY (kpmr_ojk_id) REFERENCES kpmr_pasar_produk_ojk(id) ON DELETE CASCADE,
    INDEX idx_kpmr_aspek_pasar_ojk_id_nomor      (kpmr_ojk_id, nomor),
    INDEX idx_kpmr_aspek_pasar_ojk_id_order      (kpmr_ojk_id, order_index),
    INDEX idx_kpmr_aspek_pasar_ojk_id_bobot      (kpmr_ojk_id, bobot),
    INDEX idx_kpmr_aspek_pasar_ojk_id_created_at (kpmr_ojk_id, created_at),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 7: kpmr_pertanyaan_pasar_produk
-- Entity: KpmrPertanyaanPasarProduk → 'kpmr_pertanyaan_pasar_produk'
-- FK col: aspek_id → kpmr_aspek_pasar_ojk(id)
CREATE TABLE kpmr_pertanyaan_pasar_produk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nomor       VARCHAR(50)  NULL,
    pertanyaan  TEXT         NOT NULL,
    skor        JSON         NULL,
    indicator   JSON         NULL,
    evidence    TEXT         NULL,
    catatan     VARCHAR(500) NULL,
    aspek_id    INT          NOT NULL,
    order_index INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aspek_id) REFERENCES kpmr_aspek_pasar_ojk(id) ON DELETE CASCADE,
    INDEX idx_kpmr_tanya_pasar_aspek_id_nomor      (aspek_id, nomor),
    INDEX idx_kpmr_tanya_pasar_aspek_id_order      (aspek_id, order_index),
    INDEX idx_kpmr_tanya_pasar_aspek_id_created_at (aspek_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================================
-- MODUL 2: KONSENTRASI PRODUK OJK
-- Entity: KonsentrasiProdukOjk → 'konsentrasi_produk_ojk'
-- ================================================================================

-- TABLE 1: inherent_references_konsentrasi_ojk
-- Entity: KonsentrasiReference → 'inherent_references_konsentrasi_ojk'
CREATE TABLE inherent_references_konsentrasi_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(50)  NOT NULL,
    `key`       VARCHAR(50)  NOT NULL,
    label       VARCHAR(100) NOT NULL,
    color       VARCHAR(20)  NULL,
    description TEXT         NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    `order`     INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_konsen_ref_type   (type),
    INDEX idx_konsen_ref_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 2: konsentrasi_produk_ojk
-- Entity: KonsentrasiProdukOjk → 'konsentrasi_produk_ojk'
CREATE TABLE konsentrasi_produk_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    UNIQUE INDEX uniq_konsen_year_quarter (year, quarter),
    INDEX        idx_konsen_is_active     (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 3: konsentrasi_parameters_ojk
-- Entity: KonsentrasiParameter → 'konsentrasi_parameters_ojk'
-- FK col: konsentrasi_ojk_id → konsentrasi_produk_ojk(id)
CREATE TABLE konsentrasi_parameters_ojk (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    nomor              VARCHAR(255)   NULL,
    judul              VARCHAR(255)   NOT NULL,
    bobot              DECIMAL(10, 2) NOT NULL,
    kategori           JSON           NULL,
    konsentrasi_ojk_id INT            NOT NULL,
    order_index        INT            DEFAULT 0,
    created_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (konsentrasi_ojk_id) REFERENCES konsentrasi_produk_ojk(id) ON DELETE CASCADE,
    INDEX idx_konsen_param_id_nomor  (konsentrasi_ojk_id, nomor),
    INDEX idx_konsen_param_id_order  (konsentrasi_ojk_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 4: konsentrasi_nilai_ojk
-- Entity: KonsentrasiNilai → 'konsentrasi_nilai_ojk'
-- FK col: parameter_id → konsentrasi_parameters_ojk(id)
CREATE TABLE konsentrasi_nilai_ojk (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(255)   NULL,
    judul         JSON           NULL,
    bobot         DECIMAL(10, 2) NOT NULL,
    portofolio    VARCHAR(255)   NULL,
    keterangan    TEXT           NULL,
    riskindikator JSON           NULL,
    parameter_id  INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parameter_id) REFERENCES konsentrasi_parameters_ojk(id) ON DELETE CASCADE,
    INDEX idx_konsen_nilai_param_id_nomor (parameter_id, nomor),
    INDEX idx_konsen_nilai_param_id_order (parameter_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 5: kpmr_konsentrasi_ojk
-- Entity: KpmrKonsentrasiOjk → 'kpmr_konsentrasi_ojk'
CREATE TABLE kpmr_konsentrasi_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE NULL,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    INDEX idx_kpmr_konsen_year_quarter           (year, quarter),
    INDEX idx_kpmr_konsen_is_active_year_quarter (is_active, year, quarter),
    INDEX idx_kpmr_konsen_created_at             (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 6: kpmr_aspek_konsentrasi_ojk
-- Entity: KpmrAspekKonsentrasi → 'kpmr_aspek_konsentrasi_ojk'
-- FK col: kpmr_ojk_id → kpmr_konsentrasi_ojk(id)
CREATE TABLE kpmr_aspek_konsentrasi_ojk (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(255)   NULL,
    judul         VARCHAR(255)   NOT NULL,
    bobot         DECIMAL(10, 2) DEFAULT 0.00,
    deskripsi     TEXT           NULL,
    kpmr_ojk_id   INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    average_score DECIMAL(10, 2) NULL,
    rating        VARCHAR(50)    NULL,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    VARCHAR(255)   NULL,
    notes         TEXT           NULL,
    FOREIGN KEY (kpmr_ojk_id) REFERENCES kpmr_konsentrasi_ojk(id) ON DELETE CASCADE,
    INDEX idx_kpmr_aspek_konsen_ojk_id_nomor      (kpmr_ojk_id, nomor),
    INDEX idx_kpmr_aspek_konsen_ojk_id_order      (kpmr_ojk_id, order_index),
    INDEX idx_kpmr_aspek_konsen_ojk_id_bobot      (kpmr_ojk_id, bobot),
    INDEX idx_kpmr_aspek_konsen_ojk_id_created_at (kpmr_ojk_id, created_at),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 7: kpmr_pertanyaan_konsentrasi
-- Entity: KpmrPertanyaanKonsentrasi → 'kpmr_pertanyaan_konsentrasi'
-- FK col: aspek_id → kpmr_aspek_konsentrasi_ojk(id)
CREATE TABLE kpmr_pertanyaan_konsentrasi (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nomor       VARCHAR(255) NULL,
    pertanyaan  TEXT         NOT NULL,
    skor        JSON         NULL,
    indicator   JSON         NULL,
    evidence    TEXT         NULL,
    catatan     VARCHAR(500) NULL,
    aspek_id    INT          NOT NULL,
    order_index INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aspek_id) REFERENCES kpmr_aspek_konsentrasi_ojk(id) ON DELETE CASCADE,
    INDEX idx_kpmr_tanya_konsen_aspek_id_nomor      (aspek_id, nomor),
    INDEX idx_kpmr_tanya_konsen_aspek_id_order      (aspek_id, order_index),
    INDEX idx_kpmr_tanya_konsen_aspek_id_created_at (aspek_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================================
-- MODUL 3: KREDIT PRODUK OJK
-- Entity: Kredit → 'kredit_produk_ojk'
-- ================================================================================

-- TABLE 1: inherent_references_kredit
-- Entity: KreditReference → 'inherent_references_kredit'
CREATE TABLE inherent_references_kredit (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(50)  NOT NULL,
    `key`       VARCHAR(50)  NOT NULL,
    label       VARCHAR(100) NOT NULL,
    color       VARCHAR(20)  NULL,
    description TEXT         NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    `order`     INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_kredit_ref_type_key (type, `key`),
    INDEX      idx_kredit_ref_type     (type),
    INDEX      idx_kredit_ref_active   (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 2: kredit_produk_ojk
-- Entity: Kredit → 'kredit_produk_ojk'
CREATE TABLE kredit_produk_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    version     VARCHAR(20)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(100) NULL,
    created_by  VARCHAR(100) NULL,
    updated_by  VARCHAR(100) NULL,
    notes       TEXT         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_kredit_year_quarter (year, quarter),
    INDEX      idx_kredit_ojk_active       (is_active),
    INDEX      idx_kredit_ojk_year         (year),
    INDEX      idx_kredit_ojk_quarter      (quarter),
    INDEX      idx_kredit_ojk_year_quarter (year, quarter),
    INDEX      idx_kredit_ojk_created      (created_at),
    CHECK (year    >= 2000 AND year    <= 2100),
    CHECK (quarter BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 3: kredit_parameters_ojk
-- Entity: KreditParameter → 'kredit_parameters_ojk'
-- FK col: kredit_ojk_id → kredit_produk_ojk(id)
CREATE TABLE kredit_parameters_ojk (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    kredit_ojk_id    INT            NOT NULL,
    nomor            VARCHAR(50)    NULL,
    judul            VARCHAR(255)   NOT NULL,
    bobot            DECIMAL(10, 2) NOT NULL,
    kategori         JSON           NULL,
    order_index      INT            DEFAULT 0,
    created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kredit_ojk_id) REFERENCES kredit_produk_ojk(id) ON DELETE CASCADE,
    INDEX idx_kredit_param_ojk_id        (kredit_ojk_id),
    INDEX idx_kredit_param_nomor         (nomor),
    INDEX idx_kredit_param_order         (order_index),
    INDEX idx_kredit_param_composite     (kredit_ojk_id, order_index),
    INDEX idx_kredit_param_id_nomor      (kredit_ojk_id, nomor),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 4: kredit_nilai_ojk
-- Entity: KreditNilai → 'kredit_nilai_ojk'
-- FK col: parameter_id → kredit_parameters_ojk(id)
CREATE TABLE kredit_nilai_ojk (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    parameter_id  INT            NOT NULL,
    nomor         VARCHAR(50)    NULL,
    judul         JSON           NULL,
    bobot         DECIMAL(10, 2) NOT NULL,
    portofolio    VARCHAR(100)   NULL,
    keterangan    TEXT           NULL,
    riskindikator JSON           NULL,
    order_index   INT            DEFAULT 0,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parameter_id) REFERENCES kredit_parameters_ojk(id) ON DELETE CASCADE,
    INDEX idx_kredit_nilai_param_id        (parameter_id),
    INDEX idx_kredit_nilai_nomor           (nomor),
    INDEX idx_kredit_nilai_order           (order_index),
    INDEX idx_kredit_nilai_composite       (parameter_id, order_index),
    INDEX idx_kredit_nilai_param_id_nomor  (parameter_id, nomor),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 5: kpmr_kredit_ojk
-- Entity: KpmrKreditOjk → 'kpmr_kredit_ojk'
CREATE TABLE kpmr_kredit_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE NULL,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    INDEX idx_kpmr_kredit_year_quarter           (year, quarter),
    INDEX idx_kpmr_kredit_is_active_year_quarter (is_active, year, quarter),
    INDEX idx_kpmr_kredit_created_at             (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 6: kpmr_aspek_kredit
-- Entity: KpmrAspekKredit → 'kpmr_aspek_kredit'
-- FK col: kpmr_ojk_id → kpmr_kredit_ojk(id)
CREATE TABLE kpmr_aspek_kredit (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(50)    NULL,
    judul         VARCHAR(255)   NOT NULL,
    bobot         DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    deskripsi     TEXT           NULL,
    kpmr_ojk_id   INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    average_score DECIMAL(10, 2) NULL,
    rating        VARCHAR(50)    NULL,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    VARCHAR(255)   NULL,
    notes         TEXT           NULL,
    FOREIGN KEY (kpmr_ojk_id) REFERENCES kpmr_kredit_ojk(id) ON DELETE CASCADE,
    INDEX idx_kpmr_aspek_kredit_ojk_id_nomor      (kpmr_ojk_id, nomor),
    INDEX idx_kpmr_aspek_kredit_ojk_id_order      (kpmr_ojk_id, order_index),
    INDEX idx_kpmr_aspek_kredit_ojk_id_bobot      (kpmr_ojk_id, bobot),
    INDEX idx_kpmr_aspek_kredit_ojk_id_created_at (kpmr_ojk_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 7: kpmr_pertanyaan_kredit
-- Entity: KpmrPertanyaanKredit → 'kpmr_pertanyaan_kredit'
-- FK col: aspek_id → kpmr_aspek_kredit(id)
CREATE TABLE kpmr_pertanyaan_kredit (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nomor       VARCHAR(50)  NULL,
    pertanyaan  TEXT         NOT NULL,
    skor        JSON         NULL,
    indicator   JSON         NULL,
    evidence    TEXT         NULL,
    catatan     TEXT         NULL,
    aspek_id    INT          NOT NULL,
    order_index INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aspek_id) REFERENCES kpmr_aspek_kredit(id) ON DELETE CASCADE,
    INDEX idx_kpmr_tanya_kredit_aspek_id_nomor      (aspek_id, nomor),
    INDEX idx_kpmr_tanya_kredit_aspek_id_order      (aspek_id, order_index),
    INDEX idx_kpmr_tanya_kredit_aspek_id_created_at (aspek_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================================
-- MODUL 4: LIKUIDITAS OJK
-- Entity: Likuiditas → 'likuiditas_ojk'
-- ================================================================================

-- TABLE 1: inherent_references_likuiditas_ojk
CREATE TABLE inherent_references_likuiditas_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(50)  NOT NULL,
    `key`       VARCHAR(50)  NOT NULL,
    label       VARCHAR(100) NOT NULL,
    color       VARCHAR(20)  NULL,
    description TEXT         NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    `order`     INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_likuid_ref_type   (type),
    INDEX idx_likuid_ref_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 2: likuiditas_ojk
-- Entity: Likuiditas → 'likuiditas_ojk'
CREATE TABLE likuiditas_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    UNIQUE INDEX uniq_likuid_year_quarter          (year, quarter),
    INDEX        idx_likuid_year_quarter           (year, quarter),
    INDEX        idx_likuid_is_active_year_quarter (is_active, year, quarter),
    INDEX        idx_likuid_created_at             (created_at),
    CHECK (year    >= 2000 AND year    <= 2100),
    CHECK (quarter BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 3: likuiditas_parameters_ojk
-- Entity: LikuiditasParameter → 'likuiditas_parameters_ojk'
-- FK col: likuiditas_ojk_id → likuiditas_ojk(id)
CREATE TABLE likuiditas_parameters_ojk (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    nomor             VARCHAR(50)    NULL,
    judul             VARCHAR(255)   NOT NULL,
    bobot             DECIMAL(10, 2) NOT NULL,
    kategori          JSON           NULL,
    likuiditas_ojk_id INT            NOT NULL,
    order_index       INT            DEFAULT 0,
    created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (likuiditas_ojk_id) REFERENCES likuiditas_ojk(id) ON DELETE CASCADE,
    INDEX idx_likuid_param_ojk_id_nomor (likuiditas_ojk_id, nomor),
    INDEX idx_likuid_param_ojk_id_order (likuiditas_ojk_id, order_index),
    INDEX idx_likuid_param_ojk_id       (likuiditas_ojk_id),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 4: likuiditas_nilai_ojk
-- Entity: LikuiditasNilai → 'likuiditas_nilai_ojk'
-- FK col: parameter_id → likuiditas_parameters_ojk(id)
CREATE TABLE likuiditas_nilai_ojk (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(50)    NULL,
    judul         JSON           NULL,
    bobot         DECIMAL(10, 2) NOT NULL,
    portofolio    VARCHAR(255)   NULL,
    keterangan    TEXT           NULL,
    riskindikator JSON           NULL,
    parameter_id  INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parameter_id) REFERENCES likuiditas_parameters_ojk(id) ON DELETE CASCADE,
    INDEX idx_likuid_nilai_param_id_nomor (parameter_id, nomor),
    INDEX idx_likuid_nilai_param_id       (parameter_id),
    INDEX idx_likuid_nilai_param_id_order (parameter_id, order_index),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 5: kpmr_likuiditas_ojk
-- Entity: KpmrLikuiditasProdukOjk → 'kpmr_likuiditas_ojk'
CREATE TABLE kpmr_likuiditas_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE NULL,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    INDEX idx_kpmr_likuid_year_quarter           (year, quarter),
    INDEX idx_kpmr_likuid_is_active_year_quarter (is_active, year, quarter),
    INDEX idx_kpmr_likuid_created_at             (created_at),
    CHECK (year    >= 2000 AND year    <= 2100),
    CHECK (quarter BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 6: kpmr_aspek_likuiditas
-- Entity: KpmrAspekLikuiditasProduk → 'kpmr_aspek_likuiditas'
-- FK col: kpmr_ojk_id → kpmr_likuiditas_ojk(id)
CREATE TABLE kpmr_aspek_likuiditas (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(50)    NULL,
    judul         VARCHAR(255)   NOT NULL,
    bobot         DECIMAL(10, 2) DEFAULT 0.00,
    deskripsi     TEXT           NULL,
    kpmr_ojk_id   INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    average_score DECIMAL(10, 2) NULL,
    rating        VARCHAR(50)    NULL,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    VARCHAR(255)   NULL,
    notes         TEXT           NULL,
    FOREIGN KEY (kpmr_ojk_id) REFERENCES kpmr_likuiditas_ojk(id) ON DELETE CASCADE,
    INDEX idx_kpmr_aspek_likuid_ojk_id_nomor      (kpmr_ojk_id, nomor),
    INDEX idx_kpmr_aspek_likuid_ojk_id_order      (kpmr_ojk_id, order_index),
    INDEX idx_kpmr_aspek_likuid_ojk_id_bobot      (kpmr_ojk_id, bobot),
    INDEX idx_kpmr_aspek_likuid_ojk_id_created_at (kpmr_ojk_id, created_at),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 7: kpmr_pertanyaan_likuiditas
-- Entity: KpmrPertanyaanLikuiditas → 'kpmr_pertanyaan_likuiditas'
-- FK col: aspek_id → kpmr_aspek_likuiditas(id)
CREATE TABLE kpmr_pertanyaan_likuiditas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nomor       VARCHAR(50)  NULL,
    pertanyaan  TEXT         NOT NULL,
    skor        JSON         NULL,
    indicator   JSON         NULL,
    evidence    TEXT         NULL,
    catatan     VARCHAR(500) NULL,
    aspek_id    INT          NOT NULL,
    order_index INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aspek_id) REFERENCES kpmr_aspek_likuiditas(id) ON DELETE CASCADE,
    INDEX idx_kpmr_tanya_likuid_aspek_id_nomor      (aspek_id, nomor),
    INDEX idx_kpmr_tanya_likuid_aspek_id_order      (aspek_id, order_index),
    INDEX idx_kpmr_tanya_likuid_aspek_id_created_at (aspek_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================================
-- MODUL 5: OPERASIONAL OJK
-- Entity: Operasional → 'operasional_ojk'
-- ================================================================================

-- TABLE 1: inherent_references_operasional_ojk
CREATE TABLE inherent_references_operasional_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(50)  NOT NULL,
    `key`       VARCHAR(50)  NOT NULL,
    label       VARCHAR(100) NOT NULL,
    color       VARCHAR(20)  NULL,
    description TEXT         NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    `order`     INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_ops_ref_type_key (type, `key`),
    INDEX      idx_ops_ref_type     (type),
    INDEX      idx_ops_ref_active   (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 2: operasional_ojk
-- Entity: Operasional → 'operasional_ojk'
CREATE TABLE operasional_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    version     VARCHAR(20)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(100) NULL,
    created_by  VARCHAR(100) NULL,
    updated_by  VARCHAR(100) NULL,
    notes       TEXT         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_ops_year_quarter (year, quarter),
    INDEX      idx_ops_ojk_active       (is_active),
    INDEX      idx_ops_ojk_year         (year),
    INDEX      idx_ops_ojk_quarter      (quarter),
    INDEX      idx_ops_ojk_year_quarter (year, quarter),
    INDEX      idx_ops_ojk_created      (created_at),
    CHECK (year    >= 2000 AND year    <= 2100),
    CHECK (quarter BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 3: operasional_parameters_ojk
-- Entity: OperasionalParameter → 'operasional_parameters_ojk'
-- FK col: operasional_ojk_id → operasional_ojk(id)
CREATE TABLE operasional_parameters_ojk (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    operasional_ojk_id INT            NOT NULL,
    nomor              VARCHAR(50)    NULL,
    judul              VARCHAR(255)   NOT NULL,
    bobot              DECIMAL(10, 2) NOT NULL,
    kategori           JSON           NULL,
    order_index        INT            DEFAULT 0,
    created_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (operasional_ojk_id) REFERENCES operasional_ojk(id) ON DELETE CASCADE,
    INDEX idx_ops_param_ojk_id       (operasional_ojk_id),
    INDEX idx_ops_param_nomor        (nomor),
    INDEX idx_ops_param_order        (order_index),
    INDEX idx_ops_param_composite    (operasional_ojk_id, order_index),
    INDEX idx_ops_param_id_nomor     (operasional_ojk_id, nomor),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 4: operasional_nilai_ojk
-- Entity: OperasionalNilai → 'operasional_nilai_ojk'
-- FK col: parameter_id → operasional_parameters_ojk(id)
CREATE TABLE operasional_nilai_ojk (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    parameter_id  INT            NOT NULL,
    nomor         VARCHAR(50)    NULL,
    judul         JSON           NULL,
    bobot         DECIMAL(10, 2) NOT NULL,
    portofolio    VARCHAR(100)   NULL,
    keterangan    TEXT           NULL,
    riskindikator JSON           NULL,
    order_index   INT            DEFAULT 0,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parameter_id) REFERENCES operasional_parameters_ojk(id) ON DELETE CASCADE,
    INDEX idx_ops_nilai_param_id       (parameter_id),
    INDEX idx_ops_nilai_nomor          (nomor),
    INDEX idx_ops_nilai_order          (order_index),
    INDEX idx_ops_nilai_composite      (parameter_id, order_index),
    INDEX idx_ops_nilai_param_id_nomor (parameter_id, nomor),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 5: kpmr_operasional_ojk
-- Entity: KpmrOperasionalOjk → 'kpmr_operasional_ojk'
CREATE TABLE kpmr_operasional_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE NULL,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    UNIQUE (year, quarter),
    INDEX idx_kpmr_ops_year_quarter           (year, quarter),
    INDEX idx_kpmr_ops_is_active_year_quarter (is_active, year, quarter),
    INDEX idx_kpmr_ops_created_at             (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 6: kpmr_aspek_operasional
-- Entity: KpmrAspekOperasional → 'kpmr_aspek_operasional'
-- FK col: kpmr_ojk_id → kpmr_operasional_ojk(id)
CREATE TABLE kpmr_aspek_operasional (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(50)    NULL,
    judul         VARCHAR(255)   NOT NULL,
    bobot         DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    deskripsi     TEXT           NULL,
    kpmr_ojk_id   INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    average_score DECIMAL(10, 2) NULL,
    rating        VARCHAR(50)    NULL,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    VARCHAR(255)   NULL,
    notes         TEXT           NULL,
    FOREIGN KEY (kpmr_ojk_id) REFERENCES kpmr_operasional_ojk(id) ON DELETE CASCADE,
    INDEX idx_kpmr_aspek_ops_ojk_id_nomor      (kpmr_ojk_id, nomor),
    INDEX idx_kpmr_aspek_ops_ojk_id_order      (kpmr_ojk_id, order_index),
    INDEX idx_kpmr_aspek_ops_ojk_id_bobot      (kpmr_ojk_id, bobot),
    INDEX idx_kpmr_aspek_ops_ojk_id_created_at (kpmr_ojk_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 7: kpmr_pertanyaan_operasional
-- Entity: KpmrPertanyaanOperasional → 'kpmr_pertanyaan_operasional'
-- FK col: aspek_id → kpmr_aspek_operasional(id)
CREATE TABLE kpmr_pertanyaan_operasional (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nomor       VARCHAR(50)  NULL,
    pertanyaan  TEXT         NOT NULL,
    skor        JSON         NULL,
    indicator   JSON         NULL,
    evidence    TEXT         NULL,
    catatan     TEXT         NULL,
    aspek_id    INT          NOT NULL,
    order_index INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aspek_id) REFERENCES kpmr_aspek_operasional(id) ON DELETE CASCADE,
    INDEX idx_kpmr_tanya_ops_aspek_id_nomor      (aspek_id, nomor),
    INDEX idx_kpmr_tanya_ops_aspek_id_order      (aspek_id, order_index),
    INDEX idx_kpmr_tanya_ops_aspek_id_created_at (aspek_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================================
-- MODUL 6: HUKUM OJK
-- Entity: HukumOjk → 'hukum_ojk'
-- ================================================================================

-- TABLE 1: inherent_references_hukum
CREATE TABLE inherent_references_hukum (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(50)  NOT NULL,
    `key`       VARCHAR(50)  NOT NULL,
    label       VARCHAR(100) NOT NULL,
    color       VARCHAR(20)  NULL,
    description TEXT         NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    `order`     INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uniq_hukum_ref_type_key (type, `key`),
    INDEX        idx_hukum_ref_type     (type),
    INDEX        idx_hukum_ref_active   (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 2: hukum_ojk
-- Entity: HukumOjk → 'hukum_ojk'
CREATE TABLE hukum_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    UNIQUE INDEX uniq_hukum_year_quarter          (year, quarter),
    INDEX        idx_hukum_year_quarter           (year, quarter),
    INDEX        idx_hukum_is_active_year_quarter (is_active, year, quarter),
    INDEX        idx_hukum_created_at             (created_at),
    INDEX        idx_hukum_ojk_year               (year),
    INDEX        idx_hukum_ojk_quarter            (quarter),
    INDEX        idx_hukum_ojk_is_locked          (is_locked),
    CHECK (year    >= 2000 AND year    <= 2100),
    CHECK (quarter BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 3: hukum_parameters_ojk
-- Entity: HukumParameter → 'hukum_parameters_ojk'
-- FK col: hukum_ojk_id → hukum_ojk(id)
CREATE TABLE hukum_parameters_ojk (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nomor        VARCHAR(50)    NULL,
    judul        VARCHAR(255)   NOT NULL,
    bobot        DECIMAL(10, 2) NOT NULL,
    kategori     JSON           NULL,
    hukum_ojk_id INT            NOT NULL,
    order_index  INT            DEFAULT 0,
    created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hukum_ojk_id) REFERENCES hukum_ojk(id) ON DELETE CASCADE,
    INDEX idx_hukum_param_ojk_id_nomor  (hukum_ojk_id, nomor),
    INDEX idx_hukum_param_ojk_id_order  (hukum_ojk_id, order_index),
    INDEX idx_hukum_param_ojk_id        (hukum_ojk_id),
    INDEX idx_hukum_param_nomor         (nomor),
    INDEX idx_hukum_param_bobot         (bobot),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 4: hukum_nilai_ojk
-- Entity: HukumNilai → 'hukum_nilai_ojk'
-- FK col: parameter_id → hukum_parameters_ojk(id)
CREATE TABLE hukum_nilai_ojk (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(50)    NULL,
    judul         JSON           NULL,
    bobot         DECIMAL(10, 2) NOT NULL,
    portofolio    VARCHAR(255)   NULL,
    keterangan    TEXT           NULL,
    riskindikator JSON           NULL,
    parameter_id  INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parameter_id) REFERENCES hukum_parameters_ojk(id) ON DELETE CASCADE,
    INDEX idx_hukum_nilai_param_id_nomor (parameter_id, nomor),
    INDEX idx_hukum_nilai_param_id       (parameter_id),
    INDEX idx_hukum_nilai_param_id_order (parameter_id, order_index),
    INDEX idx_hukum_nilai_nomor          (nomor),
    INDEX idx_hukum_nilai_portofolio     (portofolio),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 5: kpmr_hukum_ojk
-- Entity: KpmrHukumOjk → 'kpmr_hukum_ojk'
CREATE TABLE kpmr_hukum_ojk (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    year        INT          NOT NULL,
    quarter     INT          NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    summary     JSON         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  VARCHAR(255) NULL,
    updated_by  VARCHAR(255) NULL,
    version     VARCHAR(50)  DEFAULT '1.0.0',
    is_locked   BOOLEAN      DEFAULT FALSE NULL,
    locked_at   TIMESTAMP    NULL,
    locked_by   VARCHAR(255) NULL,
    notes       TEXT         NULL,
    INDEX idx_kpmr_hukum_year_quarter           (year, quarter),
    INDEX idx_kpmr_hukum_is_active_year_quarter (is_active, year, quarter),
    INDEX idx_kpmr_hukum_created_at             (created_at),
    INDEX idx_kpmr_hukum_year                   (year),
    INDEX idx_kpmr_hukum_quarter                (quarter),
    CHECK (year    >= 2000 AND year    <= 2100),
    CHECK (quarter BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 6: kpmr_aspek_hukum
-- Entity: KpmrAspekHukum → 'kpmr_aspek_hukum'
-- FK col: kpmr_id → kpmr_hukum_ojk(id)
CREATE TABLE kpmr_aspek_hukum (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nomor         VARCHAR(50)    NULL,
    judul         VARCHAR(255)   NOT NULL,
    bobot         DECIMAL(10, 2) DEFAULT 0.00,
    deskripsi     TEXT           NULL,
    kpmr_id       INT            NOT NULL,
    order_index   INT            DEFAULT 0,
    average_score DECIMAL(10, 2) NULL,
    rating        VARCHAR(50)    NULL,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    VARCHAR(255)   NULL,
    notes         TEXT           NULL,
    FOREIGN KEY (kpmr_id) REFERENCES kpmr_hukum_ojk(id) ON DELETE CASCADE,
    INDEX idx_kpmr_aspek_hukum_kpmr_id_nomor      (kpmr_id, nomor),
    INDEX idx_kpmr_aspek_hukum_kpmr_id_order      (kpmr_id, order_index),
    INDEX idx_kpmr_aspek_hukum_kpmr_id_bobot      (kpmr_id, bobot),
    INDEX idx_kpmr_aspek_hukum_kpmr_id_created_at (kpmr_id, created_at),
    CHECK (bobot >= 0 AND bobot <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 7: kpmr_pertanyaan_hukum
-- Entity: KpmrPertanyaanHukum → 'kpmr_pertanyaan_hukum'
-- FK col: aspek_id → kpmr_aspek_hukum(id)
CREATE TABLE kpmr_pertanyaan_hukum (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nomor       VARCHAR(50)  NULL,
    pertanyaan  TEXT         NOT NULL,
    skor        JSON         NULL,
    indicator   JSON         NULL,
    evidence    TEXT         NULL,
    catatan     VARCHAR(500) NULL,
    aspek_id    INT          NOT NULL,
    order_index INT          DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aspek_id) REFERENCES kpmr_aspek_hukum(id) ON DELETE CASCADE,
    INDEX idx_kpmr_tanya_hukum_aspek_id_nomor      (aspek_id, nomor),
    INDEX idx_kpmr_tanya_hukum_aspek_id_order      (aspek_id, order_index),
    INDEX idx_kpmr_tanya_hukum_aspek_id_created_at (aspek_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFY: Show all created tables
-- ============================================
SHOW TABLES LIKE '%pasar%';
SHOW TABLES LIKE '%konsentrasi%';
SHOW TABLES LIKE '%kredit%';
SHOW TABLES LIKE '%likuiditas%';
SHOW TABLES LIKE '%operasional%';
SHOW TABLES LIKE '%hukum%';

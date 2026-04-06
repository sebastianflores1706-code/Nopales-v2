-- ============================================================
-- Nopales v2 — Schema PostgreSQL
-- Equivalente al schema MySQL original
-- ============================================================

-- Extensión para UUIDs (opcional, el backend genera UUIDs en Node.js)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id             VARCHAR(36)  PRIMARY KEY,
  nombre         VARCHAR(255) NOT NULL,
  correo         VARCHAR(255) NOT NULL UNIQUE,
  hash_contrasena VARCHAR(255) NOT NULL,
  rol            VARCHAR(20)  NOT NULL DEFAULT 'ciudadano',
  creado_en      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ESPACIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS espacios (
  id                  VARCHAR(36)    PRIMARY KEY,
  nombre              VARCHAR(255)   NOT NULL,
  tipo                VARCHAR(50)    NOT NULL,
  ubicacion           VARCHAR(255)   NOT NULL,
  capacidad           INTEGER        NOT NULL,
  costo_hora          NUMERIC(10, 2) NOT NULL,
  estado              VARCHAR(20)    NOT NULL DEFAULT 'activo',
  descripcion         TEXT,
  reglas              TEXT,
  horario_disponible  TEXT,
  creado_en           TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- IMAGENES DE ESPACIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS imagenes_espacio (
  id          VARCHAR(36)  PRIMARY KEY,
  espacio_id  VARCHAR(36)  NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RESERVACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS reservaciones (
  id                  VARCHAR(36)    PRIMARY KEY,
  folio               VARCHAR(20)    NOT NULL UNIQUE,
  espacio_id          VARCHAR(36)    NOT NULL REFERENCES espacios(id),
  usuario_id          VARCHAR(36)    REFERENCES usuarios(id),
  solicitante_nombre  VARCHAR(255)   NOT NULL,
  tipo_evento         VARCHAR(255)   NOT NULL,
  descripcion_evento  TEXT,
  fecha               DATE           NOT NULL,
  hora_inicio         TIME           NOT NULL,
  hora_fin            TIME           NOT NULL,
  asistentes          INTEGER        NOT NULL,
  estado              VARCHAR(30)    NOT NULL DEFAULT 'pendiente_revision',
  reembolso_estado    VARCHAR(30),
  reembolso_monto     NUMERIC(10, 2),
  creado_en           TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
  id             VARCHAR(36)    PRIMARY KEY,
  reservacion_id VARCHAR(36)    NOT NULL REFERENCES reservaciones(id),
  monto          NUMERIC(10, 2) NOT NULL,
  estado         VARCHAR(20)    NOT NULL,
  metodo         VARCHAR(30)    NOT NULL,
  referencia     VARCHAR(255),
  fecha_pago     DATE,
  creado_en      TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS documentos (
  id             VARCHAR(36)  PRIMARY KEY,
  reservacion_id VARCHAR(36)  NOT NULL REFERENCES reservaciones(id),
  tipo           VARCHAR(30)  NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  contenido      TEXT         NOT NULL,
  pdf_path       VARCHAR(500),
  creado_en      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MANTENIMIENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS mantenimientos (
  id          VARCHAR(36) PRIMARY KEY,
  espacio_id  VARCHAR(36) NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP  NOT NULL,
  fecha_fin    TIMESTAMP  NOT NULL,
  motivo      TEXT        NOT NULL,
  creado_en   TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES (rendimiento en queries frecuentes)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reservaciones_espacio_id  ON reservaciones(espacio_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_usuario_id  ON reservaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_estado      ON reservaciones(estado);
CREATE INDEX IF NOT EXISTS idx_reservaciones_fecha       ON reservaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_pagos_reservacion_id      ON pagos(reservacion_id);
CREATE INDEX IF NOT EXISTS idx_documentos_reservacion_id ON documentos(reservacion_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_espacio_id ON mantenimientos(espacio_id);
CREATE INDEX IF NOT EXISTS idx_imagenes_espacio_id       ON imagenes_espacio(espacio_id);

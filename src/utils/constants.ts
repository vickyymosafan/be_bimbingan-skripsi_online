/**
 * Application Constants
 * Konstanta-konstanta yang digunakan dalam aplikasi
 */

// Status Proposal
export const PROPOSAL_STATUS = {
  DRAFT: 'DRAFT',
  DIAJUKAN: 'DIAJUKAN',
  DITERIMA: 'DITERIMA',
  DITOLAK: 'DITOLAK',
  REVISI: 'REVISI',
} as const;

// Status Bimbingan
export const BIMBINGAN_STATUS = {
  DIJADWALKAN: 'DIJADWALKAN',
  SELESAI: 'SELESAI',
  DIBATALKAN: 'DIBATALKAN',
} as const;

// Status Jadwal
export const JADWAL_STATUS = {
  TERSEDIA: 'TERSEDIA',
  DIPESAN: 'DIPESAN',
  SELESAI: 'SELESAI',
  DIBATALKAN: 'DIBATALKAN',
} as const;

// Tipe Notifikasi
export const NOTIFICATION_TYPE = {
  BIMBINGAN: 'BIMBINGAN',
  JADWAL: 'JADWAL',
  DOKUMEN: 'DOKUMEN',
  SISTEM: 'SISTEM',
} as const;

// Messages
export const MESSAGES = {
  // Success messages
  LOGIN_SUCCESS: 'Login berhasil',
  REGISTER_SUCCESS: 'Registrasi berhasil',
  LOGOUT_SUCCESS: 'Logout berhasil',
  CREATE_SUCCESS: 'Data berhasil dibuat',
  UPDATE_SUCCESS: 'Data berhasil diperbarui',
  DELETE_SUCCESS: 'Data berhasil dihapus',

  // Error messages
  LOGIN_FAILED: 'Email atau password salah',
  REGISTER_FAILED: 'Registrasi gagal',
  USER_NOT_FOUND: 'User tidak ditemukan',
  DATA_NOT_FOUND: 'Data tidak ditemukan',
  UNAUTHORIZED: 'Anda tidak memiliki akses',
  FORBIDDEN: 'Akses ditolak',
  VALIDATION_FAILED: 'Validasi gagal',
  SERVER_ERROR: 'Terjadi kesalahan pada server',

  // Specific messages
  EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
  NIM_ALREADY_EXISTS: 'NIM sudah terdaftar',
  NIP_ALREADY_EXISTS: 'NIP sudah terdaftar',
  PROPOSAL_NOT_FOUND: 'Proposal tidak ditemukan',
  DOSEN_NOT_AVAILABLE: 'Dosen tidak tersedia',
  JADWAL_NOT_AVAILABLE: 'Jadwal tidak tersedia',
  FILE_TOO_LARGE: 'Ukuran file terlalu besar',
  FILE_TYPE_NOT_ALLOWED: 'Tipe file tidak diizinkan',
} as const;

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
  ],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

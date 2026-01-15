-- Migration: Extend parking_session notes field to TEXT
-- Reason: notes field was VARCHAR(255) and gets exceeded when concatenating vehicle type change logs
-- Date: 2026-01-14
ALTER TABLE parking_session
ALTER COLUMN notes TYPE TEXT;
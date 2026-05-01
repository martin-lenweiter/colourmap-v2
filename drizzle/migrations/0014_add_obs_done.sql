-- Add done flag to designer_observations so users can archive used feedback.
ALTER TABLE designer_observations ADD COLUMN IF NOT EXISTS done BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "check_ins" ADD COLUMN "facing" jsonb;
ALTER TABLE "check_ins" ADD COLUMN "pulses" jsonb;
ALTER TABLE "check_ins" ADD COLUMN "challenge" text;
ALTER TABLE "check_ins" ADD COLUMN "flow" text;
ALTER TABLE "check_ins" ADD COLUMN "feeling_compass" jsonb;
ALTER TABLE "check_ins" ADD COLUMN "feeling_stage" integer;
ALTER TABLE "check_ins" ADD COLUMN "feeling_support" jsonb;

-- Nectar AI Global Web Workspace — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Knowledge history table
CREATE TABLE IF NOT EXISTS knowledge_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_text TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'url')),
  target_language TEXT NOT NULL,
  extraction_mode TEXT NOT NULL,
  key_info JSONB,
  alignment JSONB,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User credits table (demo: single row)
CREATE TABLE IF NOT EXISTS user_credits (
  id SERIAL PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 100,
  is_pro BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed default credits
INSERT INTO user_credits (balance, is_pro) VALUES (100, false)
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE knowledge_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for demo (tighten for production)
CREATE POLICY "Allow public read on knowledge_history"
  ON knowledge_history FOR SELECT USING (true);

CREATE POLICY "Allow public insert on knowledge_history"
  ON knowledge_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on user_credits"
  ON user_credits FOR SELECT USING (true);

CREATE POLICY "Allow public update on user_credits"
  ON user_credits FOR UPDATE USING (true);

-- Index for history queries
CREATE INDEX IF NOT EXISTS idx_knowledge_history_created_at
  ON knowledge_history (created_at DESC);

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'other')),
  message TEXT NOT NULL,
  ui_locale TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on user_feedback"
  ON user_feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on user_feedback"
  ON user_feedback FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at
  ON user_feedback (created_at DESC);

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

-- User profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Migration for existing deployments
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Workspace chat messages (per user)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messages_user_created_at
  ON messages (user_id, created_at ASC);

require('dotenv').config();

console.log(`
===========================================
Supabase Database Migration
===========================================

This migration should be run in the Supabase SQL Editor.

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the SQL below
5. Run the query

===========================================
SQL MIGRATION:
===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create forms table (no users table needed - use Supabase Auth)
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  youtube_video_id VARCHAR(50) NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  question_data JSONB NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  viewer_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_data JSONB NOT NULL,
  video_timestamp INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create embed_tokens table
CREATE TABLE IF NOT EXISTS embed_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  domain_whitelist TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_form_timestamp ON questions(form_id, timestamp_seconds);
CREATE INDEX IF NOT EXISTS idx_responses_form_session ON responses(form_id, session_id);
CREATE INDEX IF NOT EXISTS idx_answers_response ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_embed_tokens_hash ON embed_tokens(token_hash);

-- Enable Row Level Security
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for forms (users can only see their own forms)
CREATE POLICY "Users can view own forms" ON forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own forms" ON forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON forms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON forms
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for questions (users can manage questions for their forms)
CREATE POLICY "Users can view questions for own forms" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for own forms" ON questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for own forms" ON questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for own forms" ON questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()
    )
  );

-- Public access for responses (anyone can submit responses to published forms)
CREATE POLICY "Anyone can submit responses to published forms" ON responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.is_published = true
    )
  );

-- Users can view responses to their forms
CREATE POLICY "Users can view responses to own forms" ON responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid()
    )
  );

-- Similar policies for answers
CREATE POLICY "Anyone can submit answers for published forms" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM responses r
      JOIN forms f ON f.id = r.form_id
      WHERE r.id = answers.response_id AND f.is_published = true
    )
  );

CREATE POLICY "Users can view answers to own forms" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM responses r
      JOIN forms f ON f.id = r.form_id
      WHERE r.id = answers.response_id AND f.user_id = auth.uid()
    )
  );

-- Embed tokens policies
CREATE POLICY "Users can manage embed tokens for own forms" ON embed_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = embed_tokens.form_id AND forms.user_id = auth.uid()
    )
  );

===========================================
`);

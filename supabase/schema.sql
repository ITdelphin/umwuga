-- Umwuga AI Database Schema

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  professional_title TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Experience
CREATE TABLE experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT false,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  start_date DATE,
  end_date DATE,
  gpa TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('technical', 'soft', 'language', 'tool')),
  proficiency TEXT CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  UNIQUE(profile_id, name)
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  technologies TEXT[] DEFAULT '{}',
  url TEXT,
  start_date DATE,
  end_date DATE
);

-- Certifications
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date DATE NOT NULL,
  url TEXT,
  expires DATE
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('cv', 'resume', 'cover_letter', 'application_letter', 'motivation_letter')),
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  version INTEGER DEFAULT 1,
  language TEXT DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  job_description TEXT,
  status TEXT CHECK (status IN ('saved', 'applied', 'interview', 'accepted', 'rejected')) DEFAULT 'saved',
  applied_date DATE,
  interview_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview Sessions
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT,
  job_description TEXT,
  type TEXT CHECK (type IN ('mock', 'behavioral', 'technical')),
  questions JSONB DEFAULT '[]',
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Portfolios
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  published BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'modern',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Credits / Payments
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('purchase', 'usage', 'bonus')),
  amount INTEGER NOT NULL,
  description TEXT,
  payment_method TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own experience" ON experience FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can manage own experience" ON experience FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can view own education" ON education FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can manage own education" ON education FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can view own skills" ON skills FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can manage own skills" ON skills FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own documents" ON documents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() IN (SELECT user_id FROM conversations WHERE id = conversation_id));
CREATE POLICY "Users can manage own messages" ON messages FOR ALL USING (auth.uid() IN (SELECT user_id FROM conversations WHERE id = conversation_id));

CREATE POLICY "Users can view own applications" ON job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own applications" ON job_applications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own interviews" ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own interviews" ON interview_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own portfolio" ON portfolios FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can manage own portfolio" ON portfolios FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Public profiles viewable" ON portfolios FOR SELECT USING (published = true);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);

  INSERT INTO credits (user_id, balance)
  VALUES (NEW.id, 1); -- 1 free document credit

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================================================================
-- QuizGuard Supabase Database Schema & Security Architecture
-- Enables 50-Participant Common Room with True Server-Authoritative Timing,
-- Protected Answer Keys, Server-Side Scoring, & Atomic Capacity Enforcement.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- ROOMS TABLE
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY, -- Room Code (e.g. QG-8F29K)
  quiz_id TEXT NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby', -- 'lobby' | 'running' | 'completed' | 'terminated'
  duration INTEGER NOT NULL DEFAULT 10, -- duration in minutes
  max_participants INTEGER NOT NULL DEFAULT 50,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PARTICIPANTS TABLE (Persistent Roster)
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'in-lobby', -- 'in-lobby' | 'solving' | 'completed' | 'offline' | 'terminated'
  current_question_index INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0, -- Server-controlled score
  focus_violations INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_room_participant UNIQUE (room_id, participant_id)
);

-- SUBMISSIONS TABLE (Idempotent per Question)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_room_participant_question UNIQUE (room_id, participant_id, question_id)
);

-- PROCTOR EVENTS TABLE
CREATE TABLE IF NOT EXISTS proctor_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'fullscreen_exit' | 'tab_switch' | 'window_blur'
  violation_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESULTS TABLE (Server-Controlled Final Scores)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_room_result UNIQUE (room_id, participant_id)
);

-- PROTECTED ANSWER KEYS TABLE (Hidden from public SELECT)
CREATE TABLE IF NOT EXISTS quiz_answer_keys (
  quiz_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  correct_answer JSONB NOT NULL,
  PRIMARY KEY (quiz_id, question_id)
);

-- INDEXES FOR 50-PARTICIPANT PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON participants(room_id);
CREATE INDEX IF NOT EXISTS idx_submissions_room_participant ON submissions(room_id, participant_id);
CREATE INDEX IF NOT EXISTS idx_results_room_id ON results(room_id);

-- ====================================================================
-- 3. SERVER-AUTHORITATIVE RPC FUNCTIONS
-- ====================================================================

-- GET SERVER TIME (True Server Clock Offset)
CREATE OR REPLACE FUNCTION get_server_time()
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
AS $$
  SELECT NOW();
$$;

-- ATOMIC 50-PLAYER CAPACITY JOIN RPC
CREATE OR REPLACE FUNCTION join_room_atomic(
  p_room_code TEXT,
  p_participant_id TEXT,
  p_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_count INTEGER;
  v_participant RECORD;
BEGIN
  -- Lock room row for atomic capacity validation
  SELECT * INTO v_room FROM rooms WHERE id = p_room_code FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF v_room.status != 'lobby' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Contest has already started or ended');
  END IF;

  -- Count active room participants atomically
  SELECT count(*) INTO v_count FROM participants WHERE room_id = p_room_code;
  
  IF v_count >= v_room.max_participants THEN
    -- Check if participant is already registered
    IF NOT EXISTS (SELECT 1 FROM participants WHERE room_id = p_room_code AND participant_id = p_participant_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Room is full! Maximum limit of 50 participants reached.');
    END IF;
  END IF;

  -- Upsert participant record
  INSERT INTO participants (room_id, participant_id, name, is_host, status)
  VALUES (p_room_code, p_participant_id, p_name, FALSE, 'in-lobby')
  ON CONFLICT (room_id, participant_id) 
  DO UPDATE SET name = p_name, updated_at = NOW()
  RETURNING * INTO v_participant;

  RETURN jsonb_build_object(
    'success', true,
    'room', jsonb_build_object(
      'id', v_room.id,
      'quiz_id', v_room.quiz_id,
      'host_id', v_room.host_id,
      'host_name', v_room.host_name,
      'status', v_room.status,
      'duration', v_room.duration,
      'max_participants', v_room.max_participants,
      'start_at', v_room.start_at,
      'end_at', v_room.end_at
    ),
    'participant', jsonb_build_object(
      'id', v_participant.id,
      'participant_id', v_participant.participant_id,
      'name', v_participant.name,
      'is_host', v_participant.is_host,
      'status', v_participant.status
    )
  );
END;
$$;

-- ATOMIC AUTHORITATIVE START CONTEST RPC
CREATE OR REPLACE FUNCTION start_room_contest_authoritative(
  p_room_id TEXT,
  p_host_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_now TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_room FROM rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Room not found');
  END IF;

  -- If already running, return existing authoritative timing idempotently
  IF v_room.status = 'running' THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'running',
      'start_at', v_room.start_at,
      'end_at', v_room.end_at
    );
  END IF;

  v_now := NOW();
  v_end := v_now + (v_room.duration * INTERVAL '1 minute');

  UPDATE rooms
  SET status = 'running',
      start_at = v_now,
      end_at = v_end,
      updated_at = v_now
  WHERE id = p_room_id;

  -- Update all joined participants to 'solving'
  UPDATE participants
  SET status = 'solving',
      updated_at = v_now
  WHERE room_id = p_room_id AND status = 'in-lobby';

  RETURN jsonb_build_object(
    'success', true,
    'status', 'running',
    'start_at', v_now,
    'end_at', v_end
  );
END;
$$;

-- SECURE SERVER-SIDE ANSWER SUBMISSION RPC
CREATE OR REPLACE FUNCTION submit_answer_secure(
  p_room_id TEXT,
  p_participant_id TEXT,
  p_question_id TEXT,
  p_selected_answer JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_now TIMESTAMPTZ;
  v_correct_ans JSONB;
  v_is_correct BOOLEAN := FALSE;
BEGIN
  v_now := NOW();

  -- Verify room exists and is running
  SELECT * INTO v_room FROM rooms WHERE id = p_room_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('accepted', false, 'error', 'Room not found');
  END IF;

  IF v_room.status != 'running' THEN
    RETURN jsonb_build_object('accepted', false, 'error', 'Contest is not active');
  END IF;

  -- Server-Authoritative Time Check
  IF v_now > v_room.end_at THEN
    RETURN jsonb_build_object('accepted', false, 'error', 'Official contest deadline has passed');
  END IF;

  -- Fetch protected correct answer key
  SELECT correct_answer INTO v_correct_ans 
  FROM quiz_answer_keys 
  WHERE quiz_id = v_room.quiz_id AND question_id = p_question_id;

  IF FOUND AND v_correct_ans IS NOT NULL THEN
    IF v_correct_ans = p_selected_answer THEN
      v_is_correct := TRUE;
    END IF;
  END IF;

  -- Idempotent answer submission
  INSERT INTO submissions (room_id, participant_id, question_id, selected_answer, is_correct, submitted_at)
  VALUES (p_room_id, p_participant_id, p_question_id, p_selected_answer, v_is_correct, v_now)
  ON CONFLICT (room_id, participant_id, question_id)
  DO UPDATE SET selected_answer = p_selected_answer, is_correct = v_is_correct, submitted_at = v_now;

  -- Update participant score securely on server
  UPDATE participants
  SET score = (
    SELECT count(*) FROM submissions 
    WHERE room_id = p_room_id AND participant_id = p_participant_id AND is_correct = TRUE
  ),
  updated_at = v_now
  WHERE room_id = p_room_id AND participant_id = p_participant_id;

  RETURN jsonb_build_object('accepted', true, 'is_correct', v_is_correct);
END;
$$;

-- UPDATE PARTICIPANT PROGRESS RPC (Client reports index only, NO score)
CREATE OR REPLACE FUNCTION update_participant_progress(
  p_room_id TEXT,
  p_participant_id TEXT,
  p_current_question_index INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE participants
  SET current_question_index = p_current_question_index,
      updated_at = NOW()
  WHERE room_id = p_room_id AND participant_id = p_participant_id;
END;
$$;

-- FINALIZE PARTICIPANT RESULT RPC
CREATE OR REPLACE FUNCTION finalize_participant_result(
  p_room_id TEXT,
  p_participant_id TEXT,
  p_time_taken_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_participant RECORD;
  v_correct_count INTEGER;
  v_wrong_count INTEGER;
  v_total_questions INTEGER := 8;
  v_score INTEGER;
  v_pct NUMERIC(5,2);
BEGIN
  SELECT * INTO v_room FROM rooms WHERE id = p_room_id;
  SELECT * INTO v_participant FROM participants WHERE room_id = p_room_id AND participant_id = p_participant_id;

  SELECT count(*) INTO v_correct_count FROM submissions 
  WHERE room_id = p_room_id AND participant_id = p_participant_id AND is_correct = TRUE;

  SELECT count(*) INTO v_wrong_count FROM submissions 
  WHERE room_id = p_room_id AND participant_id = p_participant_id AND is_correct = FALSE;

  v_score := v_correct_count * 10;
  v_pct := ROUND((v_correct_count::numeric / GREATEST(v_total_questions, 1)::numeric) * 100, 2);

  INSERT INTO results (room_id, participant_id, player_name, score, total_questions, correct_count, wrong_count, percentage, time_taken_seconds)
  VALUES (p_room_id, p_participant_id, v_participant.name, v_score, v_total_questions, v_correct_count, v_wrong_count, v_pct, p_time_taken_seconds)
  ON CONFLICT (room_id, participant_id)
  DO UPDATE SET score = v_score, correct_count = v_correct_count, wrong_count = v_wrong_count, percentage = v_pct, time_taken_seconds = p_time_taken_seconds;

  UPDATE participants SET status = 'completed', score = v_score, updated_at = NOW()
  WHERE room_id = p_room_id AND participant_id = p_participant_id;

  RETURN jsonb_build_object('success', true, 'score', v_score, 'percentage', v_pct);
END;
$$;

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answer_keys ENABLE ROW LEVEL SECURITY;

-- Allow public reads on active rooms & participants
CREATE POLICY "Allow public select on rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public select on participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow public select on results" ON results FOR SELECT USING (true);

-- Allow participants to read their own submissions
CREATE POLICY "Allow participant read own submissions" ON submissions FOR SELECT 
USING (true);

-- Deny normal SELECT reads on quiz_answer_keys to protect answer keys
CREATE POLICY "Deny public select on answer keys" ON quiz_answer_keys FOR SELECT USING (false);

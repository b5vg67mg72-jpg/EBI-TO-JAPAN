CREATE TABLE IF NOT EXISTS admission_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  university TEXT NOT NULL,
  faculty TEXT NOT NULL,
  category TEXT NOT NULL,
  sample_count INTEGER NOT NULL,
  accepted_count INTEGER NOT NULL,
  acceptance_rate REAL NOT NULL,
  score_samples INTEGER NOT NULL,
  q25 REAL NOT NULL,
  median REAL NOT NULL,
  q75 REAL NOT NULL,
  japanese_median REAL,
  toefl_median REAL,
  toeic_median REAL,
  year_min INTEGER NOT NULL,
  year_max INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admission_category ON admission_groups(category);
CREATE INDEX IF NOT EXISTS idx_admission_university ON admission_groups(university);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  school TEXT NOT NULL,
  faculty TEXT NOT NULL,
  department TEXT NOT NULL,
  application_period TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  eju_sessions TEXT NOT NULL,
  essay_requirement TEXT NOT NULL,
  eju_requirement TEXT NOT NULL,
  eju_notes TEXT NOT NULL,
  english_test TEXT NOT NULL,
  english_notes TEXT NOT NULL,
  university_exam TEXT NOT NULL,
  first_result TEXT NOT NULL,
  exam_date TEXT NOT NULL,
  final_result TEXT NOT NULL,
  special_notes TEXT NOT NULL,
  campus TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_end_date ON applications(end_date);
CREATE INDEX IF NOT EXISTS idx_applications_school ON applications(school);

-- Recruitment / ATS schema for TalentGraph

create table if not exists hiring_drives (
  id text primary key,
  "hiringName" text not null,
  description text,
  company text,
  department text,
  role text,
  source text,
  "employmentType" text,
  location text,
  salary text,
  experience text,
  "hiringDeadline" date,
  "maximumCandidates" integer,
  "requiredSkills" jsonb default '[]'::jsonb,
  "preferredSkills" jsonb default '[]'::jsonb,
  "minimumCgpa" numeric,
  degree text,
  branches jsonb default '[]'::jsonb,
  "graduationYear" text,
  "preferredColleges" jsonb default '[]'::jsonb,
  "requiredCertifications" jsonb default '[]'::jsonb,
  "projectKeywords" jsonb default '[]'::jsonb,
  "portfolioRequired" boolean default false,
  "githubRequired" boolean default false,
  languages jsonb default '[]'::jsonb,
  "interviewRounds" jsonb default '[]'::jsonb,
  priority text,
  status text,
  "createdAt" timestamptz default now()
);

create table if not exists recruitment_candidates (
  id text primary key,
  "driveId" text references hiring_drives(id) on delete cascade,
  "fileName" text,
  status text,
  "parsedProfile" jsonb not null,
  "aiScore" jsonb not null,
  "interviewNotes" jsonb default '[]'::jsonb,
  "appliedAt" timestamptz default now()
);

create index if not exists idx_recruitment_candidates_drive on recruitment_candidates("driveId");
create index if not exists idx_recruitment_candidates_score on recruitment_candidates(((("aiScore"->>'overallMatchScore')::int)));
create index if not exists idx_recruitment_candidates_profile_gin on recruitment_candidates using gin ("parsedProfile");

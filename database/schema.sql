-- Groundwork Database Schema
-- PostgreSQL with pgvector extension

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Decisions table: Core decision storage
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  domain VARCHAR(50) NOT NULL,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('P0', 'P1', 'P2')),
  made_by VARCHAR(255),
  made_at TIMESTAMP NOT NULL DEFAULT NOW(),
  source VARCHAR(100) NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PROPOSED', 'ACTIVE', 'DISPUTED', 'SUPERSEDED', 'DEPRECATED')),
  rationale TEXT,
  alternatives TEXT[],
  affected_modules TEXT[],
  embedding VECTOR(1536), -- OpenAI embeddings for semantic search
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Decision relationships table: How decisions relate to each other
CREATE TABLE decision_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('DEPENDS_ON', 'CONSTRAINS', 'CONFLICTS_WITH', 'SUPERSEDES')),
  strength FLOAT CHECK (strength >= 0 AND strength <= 1),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT no_self_reference CHECK (source_id != target_id),
  CONSTRAINT unique_relationship UNIQUE (source_id, target_id, relationship_type)
);

-- Injection history: Track when decisions are injected into AI sessions
CREATE TABLE injection_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  developer_id VARCHAR(255),
  tool VARCHAR(50), -- 'claude-code', 'cursor', etc.
  injected_at TIMESTAMP DEFAULT NOW()
);

-- Conflicts table: Track detected conflicts between decisions
CREATE TABLE conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision1_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  decision2_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution TEXT,
  resolved_by VARCHAR(255)
);

-- Projects table: For multi-project support (future)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  repository_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_decisions_status ON decisions(status);
CREATE INDEX idx_decisions_domain ON decisions(domain);
CREATE INDEX idx_decisions_priority ON decisions(priority);
CREATE INDEX idx_decisions_made_at ON decisions(made_at DESC);
CREATE INDEX idx_decisions_embedding ON decisions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_relationships_source ON decision_relationships(source_id);
CREATE INDEX idx_relationships_target ON decision_relationships(target_id);
CREATE INDEX idx_relationships_type ON decision_relationships(relationship_type);

CREATE INDEX idx_injection_decision ON injection_history(decision_id);
CREATE INDEX idx_injection_session ON injection_history(session_id);
CREATE INDEX idx_injection_time ON injection_history(injected_at DESC);

CREATE INDEX idx_conflicts_decision1 ON conflicts(decision1_id);
CREATE INDEX idx_conflicts_decision2 ON conflicts(decision2_id);
CREATE INDEX idx_conflicts_resolved ON conflicts(resolved_at) WHERE resolved_at IS NULL;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for decisions table
CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample queries for common operations
-- Find all active decisions by domain:
-- SELECT * FROM decisions WHERE status = 'ACTIVE' AND domain = 'Schema' ORDER BY priority, made_at DESC;

-- Find all decisions that depend on a specific decision:
-- SELECT d.* FROM decisions d
-- JOIN decision_relationships r ON r.source_id = d.id
-- WHERE r.target_id = $decision_id AND r.relationship_type = 'DEPENDS_ON';

-- Semantic search for similar decisions:
-- SELECT d.*, (1 - (d.embedding <=> $query_embedding)) as similarity
-- FROM decisions d
-- WHERE d.status = 'ACTIVE' AND (1 - (d.embedding <=> $query_embedding)) > 0.7
-- ORDER BY similarity DESC LIMIT 10;

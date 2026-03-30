-- 1. pgvector 익스텐션 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. documents 테이블 생성 (Jina AI: 768 차원)
CREATE TABLE IF NOT EXISTS documents (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content   text NOT NULL,
  embedding vector(768),
  metadata  jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 3. 유사도 검색 함수 (코사인 유사도)
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count     int   DEFAULT 3
)
RETURNS TABLE (
  id         uuid,
  content    text,
  metadata   jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. 인덱스 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

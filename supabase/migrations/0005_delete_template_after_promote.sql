-- upsert_article_with_summary 변경:
--   요약 완료 시 article_template 마킹(processed_at = NOW()) → 삭제로 전환.
--
-- 변경 이유:
--   - 중복 방지는 article 테이블의 source_article_id UNIQUE 제약이 충분히 담당.
--   - content_template (TEXT 본문 ~2.5K자/건) 가 누적되면 디스크 압박.
--   - flowpick 도 동일 패턴 (요약 후 source_article 정리).
--
-- article_content_template 은 article_template(id) ON DELETE CASCADE 라 자동 정리.
--
-- 부작용:
--   - article_template.processed_at 컬럼은 더 이상 의미 없음 (row 가 항상 미요약 상태).
--   - idx_article_template_processed (WHERE processed_at IS NULL) 인덱스도 의미 약화.
--   - 두 잔재는 별도 cleanup PR 에서 제거 (지금 건드리면 다운타임 위험).
--   - fetchUnprocessedTemplates 의 WHERE processed_at IS NULL 은 그대로 동작 (모두 NULL).

CREATE OR REPLACE FUNCTION upsert_article_with_summary(
  p_template_id BIGINT,
  p_summary     JSONB,
  p_model       VARCHAR DEFAULT 'gpt-4o-mini'
) RETURNS BIGINT AS $$
DECLARE
  v_article_id BIGINT;
  v_term       JSONB;
  v_position   SMALLINT := 1;
BEGIN
  -- 1) article 승격
  INSERT INTO article (
    source, source_publisher_id, source_article_id, source_section_id,
    section, title, link, thumbnail_link, publisher, author, published_at
  )
  SELECT
    source, source_publisher_id, source_article_id, source_section_id,
    section, title, link, thumbnail_link, publisher, author, published_at
  FROM article_template
  WHERE id = p_template_id
  RETURNING id INTO v_article_id;

  IF v_article_id IS NULL THEN
    RAISE EXCEPTION 'article_template id=% not found', p_template_id;
  END IF;

  -- 2) article_content 승격
  INSERT INTO article_content (id, content)
  SELECT v_article_id, content
  FROM article_content_template
  WHERE id = p_template_id;

  -- 3) article_summary INSERT
  INSERT INTO article_summary (
    article_id, title_theme, summary, easy_explanation, final_conclusion, model
  ) VALUES (
    v_article_id,
    p_summary->>'titleTheme',
    p_summary->>'summary',
    p_summary->>'easyExplanation',
    p_summary->>'finalConclusion',
    p_model
  );

  -- 4) article_key_term INSERT (배열 순서 = position)
  FOR v_term IN SELECT * FROM jsonb_array_elements(COALESCE(p_summary->'keyTerms', '[]'::jsonb))
  LOOP
    INSERT INTO article_key_term (article_id, term, explanation, position)
    VALUES (
      v_article_id,
      v_term->>'term',
      v_term->>'explanation',
      v_position
    );
    v_position := v_position + 1;
  END LOOP;

  -- 5) template 정리 — CASCADE 로 article_content_template 도 같이 삭제
  DELETE FROM article_template WHERE id = p_template_id;

  RETURN v_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION upsert_article_with_summary(BIGINT, JSONB, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_article_with_summary(BIGINT, JSONB, VARCHAR) TO service_role;

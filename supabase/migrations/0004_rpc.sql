-- upsert_article_with_summary
-- AI 요약 결과 1건을 트랜잭션으로 안전하게 승격 + 저장.
--
-- 입력:
--   p_template_id : article_template.id
--   p_summary     : { titleTheme, summary, easyExplanation, finalConclusion, keyTerms[] }
--   p_model       : 사용한 AI 모델 식별자 (예: gpt-4o-mini)
--
-- 출력: 새로 생성된 article.id
--
-- 흐름:
--   1) article_template + article_content_template 의 행을 article + article_content 로 INSERT
--   2) article_summary INSERT
--   3) article_key_term INSERT (positon 1..N)
--   4) article_template.processed_at = NOW() 로 마킹
--
-- 실패 시 함수 전체가 롤백됨 (PL/pgSQL 함수는 묵시적 트랜잭션).

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

  -- 5) template 마킹
  UPDATE article_template SET processed_at = NOW() WHERE id = p_template_id;

  RETURN v_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- service_role 만 호출 가능. anon/authenticated 는 EXECUTE 권한 X.
REVOKE EXECUTE ON FUNCTION upsert_article_with_summary(BIGINT, JSONB, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_article_with_summary(BIGINT, JSONB, VARCHAR) TO service_role;

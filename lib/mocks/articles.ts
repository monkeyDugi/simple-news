import type { Article, ArticleKeyTerm, ArticleSummary } from "@/types/article";
import type { SectionCode } from "@/lib/sections";

// 외부 의존성 모킹용 fixture. MOCK_SUPABASE=true 일 때 repo 가 이걸 반환한다.
// 시간은 호출 시점 기준으로 동적으로 계산하므로, 시간대 그룹 UI(오늘 아침/어젯밤/...)도 자연스럽게 테스트된다.

export interface MockBundle {
  article: Article;
  content: string;
  summary: ArticleSummary;
  keyTerms: ArticleKeyTerm[];
}

interface FixtureSpec {
  id: number;
  section: SectionCode;
  hoursAgo: number;
  publisher: string;
  title: string;
  thumbnail: string | null;
  content: string;
  titleTheme: string;
  summary: string;
  easyExplanation: string;
  finalConclusion: string;
  keyTerms: { term: string; explanation: string }[];
}

const SPECS: FixtureSpec[] = [
  // ─── ECONOMY (디폴트 섹션이라 4개 풍부하게) ────────────────
  {
    id: 1001,
    section: "ECONOMY",
    hoursAgo: 1,
    publisher: "한국경제",
    title: "삼성전자, 4분기 영업이익 10조원 돌파… 메모리반도체 업사이클",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=ECON",
    content:
      "<p>삼성전자가 26일 4분기 잠정실적으로 영업이익 10조 1200억원을 발표했다. 메모리반도체 가격 반등과 모바일 출하량 회복이 동시에 작용했다는 분석이다.</p>",
    titleTheme: "삼성 실적 회복",
    summary:
      "삼성전자가 4분기 영업이익 10조원을 달성했어요. 메모리반도체 가격 상승이 주된 이유고, 발표 직후 주가도 4% 올랐어요. 다만 일부 분석가는 장기 경기 둔화 우려가 여전하다고 봤어요.",
    easyExplanation:
      "삼성이 만드는 칩이 잘 팔려서 회사 이익이 늘었어요. 마치 분식집이 갑자기 손님이 몰린 것과 같아요. 주식 가진 사람한테는 좋은 소식이에요.",
    finalConclusion: "삼성이 칩 잘 팔려서 실적이 나아졌어요",
    keyTerms: [
      { term: "영업이익", explanation: "회사가 본업으로 번 돈이에요." },
      { term: "메모리반도체", explanation: "스마트폰의 기억력 같은 칩이에요." },
      { term: "업사이클", explanation: "산업 경기가 좋아지는 흐름이에요." },
    ],
  },
  {
    id: 1002,
    section: "ECONOMY",
    hoursAgo: 5,
    publisher: "매일경제",
    title: "한은, 기준금리 0.25%p 인하… 1년 만의 첫 인하",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=ECON",
    content:
      "<p>한국은행 금융통화위원회가 기준금리를 연 3.25%에서 3.00%로 내렸다. 물가 안정세가 확인됐고 내수 부진 우려가 더 컸다는 설명이다.</p>",
    titleTheme: "기준금리 인하",
    summary:
      "한국은행이 기준금리를 0.25%p 내렸어요. 물가가 안정됐고 경기는 둔화 중이라는 게 이유에요. 대출 이자 부담은 줄겠지만 예금 금리도 같이 내려가요.",
    easyExplanation:
      "은행끼리 돈 빌리는 기본 금리가 싸졌어요. 그래서 우리가 받는 대출 이자도 천천히 내려갈 거예요. 반대로 적금 이자도 같이 줄어들어요.",
    finalConclusion: "대출 이자 살짝 내려가고 적금 이자도 같이 내려가요",
    keyTerms: [
      { term: "기준금리", explanation: "한국은행이 정하는 가장 기본 이자율이에요." },
      { term: "금융통화위원회", explanation: "기준금리를 결정하는 회의예요." },
    ],
  },
  // ─── POLITICS ──────────────────────────────────────────
  {
    id: 2001,
    section: "POLITICS",
    hoursAgo: 3,
    publisher: "연합뉴스",
    title: "여야, 추경예산안 본회의 처리 합의… 12조원 규모",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=POL",
    content:
      "<p>여야는 26일 본회의를 열어 12조원 규모 추가경정예산안을 처리하기로 합의했다. 소상공인 지원과 재해 복구 예산이 핵심이다.</p>",
    titleTheme: "추경 합의 처리",
    summary:
      "여야가 12조원 추경 예산을 통과시키기로 했어요. 소상공인 지원과 재해 복구가 주요 항목이에요. 8월 안에 집행 시작 예정이에요.",
    easyExplanation:
      "올해 정해둔 예산이 부족해서 추가로 더 쓰기로 한 거예요. 가게 사장님 도움 + 수해 복구에 주로 들어가요.",
    finalConclusion: "정부가 12조 더 풀어서 가게랑 수해 지역 돕는대요",
    keyTerms: [
      { term: "추경예산", explanation: "본예산이 모자라서 더 짜는 추가 예산이에요." },
      { term: "본회의", explanation: "국회의원 전원이 모여 표결하는 회의예요." },
    ],
  },
  {
    id: 2002,
    section: "POLITICS",
    hoursAgo: 22,
    publisher: "조선일보",
    title: "대통령, G7 정상회의 참석 위해 출국… 한미일 회담 예정",
    thumbnail: null,
    content:
      "<p>대통령은 26일 G7 정상회의 초청국 자격으로 이탈리아행 비행기에 올랐다. 한미일 정상회담이 사이드 이벤트로 잡혀 있다.</p>",
    titleTheme: "G7 정상외교",
    summary:
      "대통령이 G7 회의에 초청국 자격으로 갔어요. 별도로 한미일 3국 정상회담도 열려요. 안보 협력과 반도체 공급망이 주요 의제예요.",
    easyExplanation:
      "선진국 7개 나라가 모이는 회의에 한국이 초대받아 갔어요. 한미일이 따로 만나서 안보 얘기도 한대요.",
    finalConclusion: "G7 회의 가서 한미일 안보 회담 함께 한대요",
    keyTerms: [
      { term: "G7", explanation: "주요 7개국 (미·영·프·독·일·이·캐나다) 모임이에요." },
    ],
  },
  // ─── SOCIETY ──────────────────────────────────────────
  {
    id: 3001,
    section: "SOCIETY",
    hoursAgo: 2,
    publisher: "JTBC",
    title: "수도권 일부 지역 호우경보… 도로 침수 신고 잇따라",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=SOC",
    content:
      "<p>기상청은 26일 오전 수도권 남부에 호우경보를 발효했다. 시간당 50mm 이상 강한 비가 쏟아지면서 도로 침수 신고가 잇따르고 있다.</p>",
    titleTheme: "수도권 호우경보",
    summary:
      "수도권 남부에 호우경보가 내렸어요. 시간당 50mm 이상 강한 비가 와서 도로 침수가 잇따르고 있어요. 운전자는 지하차도 통행을 피해야 해요.",
    easyExplanation:
      "한 시간에 양동이로 들이붓듯 비가 와요. 도로가 잠겨서 차가 못 다닐 수 있으니 가능하면 약속을 미루는 게 좋아요.",
    finalConclusion: "수도권에 폭우 — 지하차도는 피하세요",
    keyTerms: [
      { term: "호우경보", explanation: "3시간에 90mm, 12시간에 180mm 이상 비 예보예요." },
    ],
  },
  {
    id: 3002,
    section: "SOCIETY",
    hoursAgo: 30,
    publisher: "KBS",
    title: "전세사기 피해자 특별법 시행 6개월… 누적 신청 9700건",
    thumbnail: null,
    content:
      "<p>전세사기 피해자 특별법 시행 6개월을 맞아 신청 건수가 9700건을 돌파했다. 인정율은 약 70%선이다.</p>",
    titleTheme: "전세사기 6개월",
    summary:
      "전세사기 피해자 특별법이 6개월 동안 9700건 신청받았어요. 약 70%가 피해자로 인정됐어요. 보증금 일부 돌려받기와 우선매수권이 핵심 지원이에요.",
    easyExplanation:
      "전세금 떼인 사람을 정부가 도와주는 법이 작년에 생겼어요. 6개월 동안 1만 명 가까이가 신청했고, 그중 7명 중 5명꼴로 도움받았어요.",
    finalConclusion: "전세사기 피해자 1만 명, 70%가 인정받았어요",
    keyTerms: [
      { term: "전세사기", explanation: "집주인이 보증금 돌려줄 능력 없이 전세 놓는 행위예요." },
      { term: "우선매수권", explanation: "경매 나온 살던 집을 먼저 살 수 있는 권리예요." },
    ],
  },
  // ─── LIFE ──────────────────────────────────────────────
  {
    id: 4001,
    section: "LIFE",
    hoursAgo: 4,
    publisher: "스포츠동아",
    title: "유튜버 '먹방왕', 새 채널 'TASTE' 글로벌 동시 오픈",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=LIFE",
    content:
      "<p>구독자 2200만의 먹방왕이 새 채널 TASTE 를 글로벌 11개 언어로 동시 공개했다.</p>",
    titleTheme: "먹방왕 글로벌 채널",
    summary:
      "구독자 2200만 먹방 크리에이터가 새 채널을 11개 언어로 동시 오픈했어요. 자막이 아니라 AI 더빙으로 현지 언어로 들려요. 첫 영상은 부산 어묵 투어예요.",
    easyExplanation:
      "유명한 먹방 유튜버가 새 채널을 만들었는데 한국어 영상이 외국어로 자동 통역돼요. 외국 시청자도 자막 없이 볼 수 있는 거예요.",
    finalConclusion: "먹방왕이 AI 더빙으로 11개국어 채널 열었어요",
    keyTerms: [
      { term: "AI 더빙", explanation: "사람 목소리를 AI 가 다른 언어로 자연스럽게 바꾸는 기술이에요." },
    ],
  },
  {
    id: 4002,
    section: "LIFE",
    hoursAgo: 14,
    publisher: "여행신문",
    title: "벚꽃 절정… 진해 군항제 첫 주말 65만명 운집",
    thumbnail: null,
    content:
      "<p>진해 군항제 첫 주말 방문객이 65만 명을 넘었다. 평년 대비 30% 증가한 수치다.</p>",
    titleTheme: "진해 군항제",
    summary:
      "진해 벚꽃 축제 첫 주말에 65만 명이 다녀갔어요. 평년보다 30% 많은 인파예요. 다음 주말까지가 절정이라 교통 혼잡이 예상돼요.",
    easyExplanation:
      "벚꽃이 한창인 진해에 사람이 엄청 몰렸어요. 작년보다 1.3배 많아요. 가실 거면 평일이나 새벽이 그나마 한적해요.",
    finalConclusion: "진해 벚꽃 절정 — 평일이 그나마 한적해요",
    keyTerms: [],
  },
  // ─── WORLD ─────────────────────────────────────────────
  {
    id: 5001,
    section: "WORLD",
    hoursAgo: 6,
    publisher: "로이터(번역)",
    title: "美 연준, 점도표 9월 인하 신호… 시장 반응은 엇갈려",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=WORLD",
    content:
      "<p>미 연준은 6월 FOMC 점도표에서 9월 첫 인하 가능성을 시사했다.</p>",
    titleTheme: "美 연준 9월 인하",
    summary:
      "미국 연준이 9월에 금리 내릴 수 있다는 신호를 줬어요. 다만 위원들 의견이 갈려서 100% 확정은 아니에요. 채권 시장은 환영했고 주식은 살짝 흔들렸어요.",
    easyExplanation:
      "미국이 가을쯤 이자율을 내릴 수 있다고 슬쩍 말했어요. 미국 이자가 내리면 한국 시장에도 영향이 와요.",
    finalConclusion: "美 연준 9월 인하 시사 — 한국 시장도 영향권",
    keyTerms: [
      { term: "점도표", explanation: "연준 위원들이 예상하는 미래 금리 분포도예요." },
      { term: "FOMC", explanation: "미국 연방공개시장위원회. 미국 기준금리를 정해요." },
    ],
  },
  {
    id: 5002,
    section: "WORLD",
    hoursAgo: 40,
    publisher: "AP(번역)",
    title: "EU, 빅테크 규제 패키지 최종 합의… 반독점 과징금 강화",
    thumbnail: null,
    content:
      "<p>EU 회원국들이 빅테크 반독점 규제 패키지에 최종 합의했다.</p>",
    titleTheme: "EU 빅테크 규제",
    summary:
      "유럽이 빅테크에 더 강한 반독점 규제를 도입하기로 합의했어요. 위반 시 글로벌 매출의 최대 10% 과징금이에요. 발효는 내년 초예요.",
    easyExplanation:
      "유럽이 큰 IT 회사들에게 '우리 시장에서 마음대로 못 한다' 고 더 세게 못 박은 거예요. 어기면 전 세계 매출의 1/10 까지 벌금이에요.",
    finalConclusion: "EU 빅테크 규제 강화 — 글로벌 매출 10% 과징금",
    keyTerms: [
      { term: "반독점", explanation: "한 회사가 시장을 독차지 못 하게 막는 규제예요." },
    ],
  },
  // ─── IT ────────────────────────────────────────────────
  {
    id: 6001,
    section: "IT",
    hoursAgo: 2,
    publisher: "ZDNet Korea",
    title: "OpenAI, 차세대 모델 'GPT-6' 9월 공개 예고… 멀티모달 강화",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=IT",
    content:
      "<p>OpenAI 가 9월 GPT-6 공개를 예고했다. 텍스트·이미지·영상·음성을 단일 입력으로 처리한다.</p>",
    titleTheme: "GPT-6 9월 공개",
    summary:
      "OpenAI 가 새 모델 GPT-6 를 9월에 공개해요. 글, 이미지, 영상, 음성을 한 번에 다룰 수 있어요. 가격은 GPT-5 대비 30% 낮아질 예정이에요.",
    easyExplanation:
      "AI 회사 OpenAI 가 더 똑똑한 새 AI 를 가을에 내놓는대요. 글뿐만 아니라 사진, 동영상도 같이 이해할 수 있어요.",
    finalConclusion: "OpenAI GPT-6 9월 공개, 멀티모달 강화",
    keyTerms: [
      { term: "멀티모달", explanation: "텍스트·이미지·영상 등 여러 형태를 같이 다루는 능력이에요." },
    ],
  },
  {
    id: 6002,
    section: "IT",
    hoursAgo: 18,
    publisher: "전자신문",
    title: "네이버, 자체 LLM '하이퍼클로바 X3' 오픈소스 공개",
    thumbnail: null,
    content:
      "<p>네이버는 자체 거대언어모델 하이퍼클로바 X3 의 80억 파라미터 버전을 오픈소스로 풀었다.</p>",
    titleTheme: "하이퍼클로바 X3 오픈소스",
    summary:
      "네이버가 자체 LLM 의 80억 파라미터 버전을 오픈소스로 풀었어요. 한국어 성능이 GPT-4 의 90% 수준이에요. 상업 사용도 가능해서 스타트업에 호재예요.",
    easyExplanation:
      "네이버가 만든 한국어 잘하는 AI 를 누구나 쓸 수 있게 공개했어요. 한국 회사들이 비용 적게 들이고 자기 서비스에 AI 붙일 수 있게 됐어요.",
    finalConclusion: "네이버 한국어 AI 공개 — 한국 스타트업에 호재",
    keyTerms: [
      { term: "LLM", explanation: "거대언어모델. ChatGPT 같은 글쓰기 AI 의 두뇌예요." },
      { term: "파라미터", explanation: "AI 가 학습한 지식 단위. 많을수록 똑똑해요." },
    ],
  },
  // ─── GLOBAL_MARKET ─────────────────────────────────────
  {
    id: 7001,
    section: "GLOBAL_MARKET",
    hoursAgo: 7,
    publisher: "한경 글로벌마켓",
    title: "엔비디아, 4분기 매출 가이던스 상향… 시간외 6% 급등",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=GMKT",
    content:
      "<p>엔비디아는 4분기 매출 가이던스를 380억 달러에서 410억 달러로 상향 조정했다.</p>",
    titleTheme: "엔비디아 가이던스 ↑",
    summary:
      "엔비디아가 4분기 매출 예상치를 410억 달러로 올렸어요. 시간외 거래에서 주가가 6% 뛰었어요. AI 칩 수요 호조가 이어지고 있다는 뜻이에요.",
    easyExplanation:
      "엔비디아가 '이번 분기에 우리 칩 더 많이 팔릴 것 같아' 라고 발표하니까 주가가 즉시 6% 올랐어요. AI 시장이 여전히 뜨겁다는 신호예요.",
    finalConclusion: "엔비디아 매출 상향 — AI 칩 수요 여전히 뜨거워요",
    keyTerms: [
      { term: "가이던스", explanation: "회사가 예상하는 다음 분기 실적치예요." },
      { term: "시간외 거래", explanation: "정규장 끝난 뒤에도 일정 시간 매매 가능한 거래예요." },
    ],
  },
  {
    id: 7002,
    section: "GLOBAL_MARKET",
    hoursAgo: 25,
    publisher: "한경 글로벌마켓",
    title: "테슬라, 신형 모델 Q 양산 시작… 분기 인도 35만대 목표",
    thumbnail: null,
    content:
      "<p>테슬라가 모델 Q 의 텍사스 공장 양산을 시작했다.</p>",
    titleTheme: "테슬라 모델Q 양산",
    summary:
      "테슬라가 보급형 신차 모델 Q 양산을 시작했어요. 가격은 2만5천 달러로 기존 모델3 보다 35% 싸요. 이번 분기 인도 35만대 목표예요.",
    easyExplanation:
      "테슬라가 더 싼 새 전기차를 만들기 시작했어요. 한 대 3500만원 정도라 기존 모델보다 1500만원쯤 저렴해요.",
    finalConclusion: "테슬라 보급형 모델Q 양산 시작 — 가격 35% ↓",
    keyTerms: [
      { term: "양산", explanation: "공장에서 본격적으로 대량 생산하는 단계예요." },
    ],
  },
];

const FAKE_LINK_BASE = "https://news.naver.com/article/";

function specToBundle(spec: FixtureSpec, now: Date): MockBundle {
  const publishedAt = new Date(now.getTime() - spec.hoursAgo * 60 * 60 * 1000);
  return {
    article: {
      id: spec.id,
      source: "NAVER",
      sourcePublisherId: null,
      sourceArticleId: `mock-${spec.id}`,
      sourceSectionId: null,
      section: spec.section,
      title: spec.title,
      link: `${FAKE_LINK_BASE}${spec.id}`,
      thumbnailLink: spec.thumbnail,
      publisher: spec.publisher,
      author: null,
      publishedAt,
      createdAt: publishedAt,
    },
    content: spec.content,
    summary: {
      articleId: spec.id,
      titleTheme: spec.titleTheme,
      summary: spec.summary,
      easyExplanation: spec.easyExplanation,
      finalConclusion: spec.finalConclusion,
      model: "mock-claude-haiku-4-5",
    },
    keyTerms: spec.keyTerms.map((kt) => ({
      term: kt.term,
      explanation: kt.explanation,
    })),
  };
}

// 호출 시점의 now 를 기준으로 fixture 를 빌드. 매번 생성해서 시간 흐름에 맞게 보이도록.
export function getMockBundles(now: Date = new Date()): MockBundle[] {
  return SPECS.map((spec) => specToBundle(spec, now));
}

export function findMockBundle(id: number, now: Date = new Date()): MockBundle | null {
  const spec = SPECS.find((s) => s.id === id);
  return spec ? specToBundle(spec, now) : null;
}

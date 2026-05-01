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

// 섹션당 10건 × 7섹션 = 70건. hoursAgo 분포로 시간 그룹 헤더 다양하게 노출.
// (오늘 아침/낮/밤 / 어제 낮/어젯밤 / 이틀 전 / 사흘 전 / N일 전 / 날짜)
const SPECS: FixtureSpec[] = [
  // ─── ECONOMY (10) ─────────────────────────────────────
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
  {
    id: 1003,
    section: "ECONOMY",
    hoursAgo: 9,
    publisher: "이데일리",
    title: "원/달러 환율 1380원 돌파… 6개월 만의 최고치",
    thumbnail: null,
    content:
      "<p>원/달러 환율이 장중 1380원을 돌파하며 6개월 만에 최고 수준으로 올라섰다. 미국 금리 동결 시그널이 달러 강세를 부추겼다.</p>",
    titleTheme: "환율 1380원 돌파",
    summary:
      "원/달러 환율이 1380원을 넘었어요. 미국이 금리를 안 내릴 거란 신호 때문에 달러가 강해진 영향이에요. 해외 직구나 여행 가는 사람한테는 부담이 커져요.",
    easyExplanation:
      "1달러를 사려면 이제 1380원이나 줘야 한다는 뜻이에요. 외국 물건 살 때 더 비싸게 느껴지는 이유예요. 반대로 한국 물건은 외국에서 싸 보여요.",
    finalConclusion: "환율 올라서 해외 결제 부담 커졌어요",
    keyTerms: [
      { term: "원/달러 환율", explanation: "1달러를 사는 데 필요한 원화 금액이에요." },
    ],
  },
  {
    id: 1004,
    section: "ECONOMY",
    hoursAgo: 14,
    publisher: "조선비즈",
    title: "수도권 아파트 거래량 4개월 연속 증가… 거래 회복 신호",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=ECON",
    content:
      "<p>수도권 아파트 거래량이 4개월 연속 증가했다. 금리 인하 기대감과 매물 부족이 맞물린 결과로 풀이된다.</p>",
    titleTheme: "아파트 거래 회복",
    summary:
      "수도권 아파트 거래가 4개월째 늘고 있어요. 금리 내릴 거란 기대 + 매물이 적은 게 겹쳤기 때문이에요. 다만 가격이 본격 상승한 건 아니에요.",
    easyExplanation:
      "사람들이 다시 집을 사고팔기 시작했다는 뜻이에요. 곧 이자가 싸질 거란 기대 때문에 미뤄뒀던 거래가 풀린 거예요.",
    finalConclusion: "아파트 거래량 4개월째 ↑ — 금리 인하 기대감",
    keyTerms: [
      { term: "거래량", explanation: "한 달 동안 사고팔린 집 갯수예요." },
    ],
  },
  {
    id: 1005,
    section: "ECONOMY",
    hoursAgo: 22,
    publisher: "서울경제",
    title: "가계부채 1900조 돌파… 정부 \"강력 관리\"",
    thumbnail: null,
    content:
      "<p>한국의 가계부채가 1900조원을 넘겼다. 정부는 LTV·DSR 규제 강화 등 추가 조치를 검토하고 있다.</p>",
    titleTheme: "가계부채 1900조",
    summary:
      "온 국민이 진 빚 합계가 1900조를 넘었어요. 정부는 더 못 빌리게 규제를 강하게 죌 거라고 했어요. 신규 대출 받기는 점점 까다로워질 것 같아요.",
    easyExplanation:
      "온 가족이 카드 빚 + 집 대출 + 개인 대출 합치면 1인당 4천만 원 가까이 돼요. 정부가 \"이러다 큰일\" 이라고 본격 단속에 들어갔어요.",
    finalConclusion: "전 국민 빚 1900조 돌파 — 대출 규제 강화 예정",
    keyTerms: [
      { term: "가계부채", explanation: "가구가 진 모든 빚 합계예요." },
      { term: "DSR", explanation: "내 소득 대비 빚 갚는 비율 한도예요." },
    ],
  },
  {
    id: 1006,
    section: "ECONOMY",
    hoursAgo: 32,
    publisher: "연합뉴스",
    title: "1분기 수출 7.2% 증가… 반도체·자동차 주도",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=ECON",
    content:
      "<p>1분기 수출이 전년 동기 대비 7.2% 늘어난 1730억 달러를 기록했다. 반도체와 자동차가 견인했다.</p>",
    titleTheme: "1분기 수출 ↑",
    summary:
      "올해 1분기 수출이 7.2% 늘었어요. 반도체랑 자동차가 잘 팔린 덕분이에요. 무역수지도 흑자로 돌아서면서 경상수지에 청신호가 켜졌어요.",
    easyExplanation:
      "한국이 외국에 판 물건이 작년보다 7% 더 많아졌어요. 그중에서도 반도체랑 자동차가 효자 상품이에요.",
    finalConclusion: "1분기 수출 7% ↑ — 반도체·자동차 견인",
    keyTerms: [
      { term: "무역수지", explanation: "수출 - 수입. 플러스면 흑자예요." },
    ],
  },
  {
    id: 1007,
    section: "ECONOMY",
    hoursAgo: 40,
    publisher: "파이낸셜뉴스",
    title: "전기·가스요금 동결… 하반기까지 인상 없어",
    thumbnail: null,
    content:
      "<p>정부는 2분기 전기·가스요금을 동결하기로 했다. 물가 안정과 서민 부담 완화 차원이다.</p>",
    titleTheme: "공공요금 동결",
    summary:
      "전기랑 가스 요금이 2분기에도 안 오르고 그대로예요. 물가 잡으려는 정부 의지 + 가계 부담 줄이기 위해서예요. 한전 적자는 점점 커지고 있어요.",
    easyExplanation:
      "다음 달 전기·가스 고지서가 지금이랑 비슷할 거란 뜻이에요. 다만 한국전력은 매번 손해 보면서 팔고 있어 언젠가 한 번에 오를 위험은 남아 있어요.",
    finalConclusion: "전기·가스요금 동결 — 한전 적자는 누적 중",
    keyTerms: [],
  },
  {
    id: 1008,
    section: "ECONOMY",
    hoursAgo: 50,
    publisher: "한겨레",
    title: "최저임금위원회 첫 회의… 노사 격차 2200원",
    thumbnail: null,
    content:
      "<p>내년도 최저임금 첫 회의가 열렸다. 노동계는 시급 12110원, 경영계는 9920원을 제시해 격차가 2200원에 달한다.</p>",
    titleTheme: "최저임금 협상 시작",
    summary:
      "내년 최저임금 협상이 시작됐어요. 노동계는 12110원, 경영계는 9920원을 제시해 차이가 시급 2200원이나 돼요. 합의는 7월말까지 마쳐야 해요.",
    easyExplanation:
      "내년 알바비 시급을 얼마로 할지 정하는 회의가 시작됐어요. 받는 쪽 vs 주는 쪽 의견 차이가 시급 2천 원 정도라 협상이 쉽지 않을 거예요.",
    finalConclusion: "내년 최저임금, 노사 의견차 시급 2200원",
    keyTerms: [
      { term: "최저임금", explanation: "법으로 정한 시간당 최저 급여예요." },
    ],
  },
  {
    id: 1009,
    section: "ECONOMY",
    hoursAgo: 70,
    publisher: "머니투데이",
    title: "5월 종부세 고지 시작… 대상자 25% 감소",
    thumbnail: null,
    content:
      "<p>5월 종합부동산세 고지가 시작된다. 공시가격 하락과 공제 확대로 대상자가 25% 줄었다.</p>",
    titleTheme: "종부세 고지 시작",
    summary:
      "다음 달 종부세 고지서가 발송돼요. 공시가격이 떨어지고 공제도 늘어나서 작년보다 대상자가 1/4 줄었어요. 평균 세액도 약 18% 감소할 전망이에요.",
    easyExplanation:
      "값비싼 집을 가진 사람한테 매년 부과되는 세금이에요. 올해는 집값이 좀 떨어진 영향으로 내야 하는 사람도, 금액도 줄었어요.",
    finalConclusion: "종부세 대상자 25% ↓ — 공시가 하락 영향",
    keyTerms: [
      { term: "종부세", explanation: "고가 부동산 보유자에게 매기는 세금이에요." },
      { term: "공시가격", explanation: "정부가 매긴 부동산 공식 가격이에요." },
    ],
  },
  {
    id: 1010,
    section: "ECONOMY",
    hoursAgo: 110,
    publisher: "뉴스1",
    title: "외국인, 한국 채권 사상 최대 매수… 6조원 순유입",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=ECON",
    content:
      "<p>외국인 투자자가 4월 한국 채권을 6조원 가까이 순매수했다. 환율 안정과 금리 매력이 동시에 작용했다.</p>",
    titleTheme: "외국인 채권 순매수",
    summary:
      "외국인 투자자들이 4월에 한국 채권을 6조 원이나 순매수했어요. 환율이 안정적이고 한국 금리가 매력적이라는 평가가 합쳐졌기 때문이에요. 환율 추가 안정에 도움이 될 전망이에요.",
    easyExplanation:
      "외국 투자자가 \"한국에 돈 빌려주고 이자 받기 좋겠다\" 면서 한국 채권을 잔뜩 산 거예요. 외국 돈이 들어오면 환율이 좀 진정돼요.",
    finalConclusion: "외국인이 한국 채권 6조원 순매수 — 사상 최대",
    keyTerms: [
      { term: "채권", explanation: "정부·기업이 발행하는 빚 증서예요." },
      { term: "순매수", explanation: "(산 금액 - 판 금액) 의 차이예요." },
    ],
  },

  // ─── POLITICS (10) ─────────────────────────────────────
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
    hoursAgo: 7,
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
  {
    id: 2003,
    section: "POLITICS",
    hoursAgo: 11,
    publisher: "중앙일보",
    title: "정당 지지율 여론조사… 여 38% 야 35% 격차 좁혀",
    thumbnail: null,
    content:
      "<p>최신 정당 지지율 여론조사에서 여당 38%, 제1야당 35%로 격차가 3%p 로 좁혀졌다. 무당층은 22%다.</p>",
    titleTheme: "정당 지지율",
    summary:
      "여당 지지율 38%, 제1야당 35%로 격차가 3%p 까지 줄었어요. 한 달 전엔 7%p 차이였는데 좁혀진 거예요. 무당층은 22% 로 여전히 많아요.",
    easyExplanation:
      "여당 vs 제1야당 인기 차이가 점점 줄고 있다는 뜻이에요. 정치 결정 안 한 \"잘 모르겠음\" 사람도 5명 중 1명이에요.",
    finalConclusion: "여 38% 야 35% — 격차 3%p로 좁혀짐",
    keyTerms: [
      { term: "무당층", explanation: "지지하는 정당이 없는 사람들이에요." },
    ],
  },
  {
    id: 2004,
    section: "POLITICS",
    hoursAgo: 18,
    publisher: "한국일보",
    title: "4월 임시국회 개의… 민생법안 12건 처리 쟁점",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=POL",
    content:
      "<p>4월 임시국회가 개의했다. 전세사기특별법 개정안 등 민생법안 12건이 주요 쟁점이다.</p>",
    titleTheme: "4월 임시국회",
    summary:
      "4월 임시국회가 시작됐어요. 전세사기 특별법 개정 등 민생법안 12건이 주요 안건이에요. 5월 초까지 본회의를 두 번 열 예정이에요.",
    easyExplanation:
      "정기 회기 외에 따로 잡힌 국회가 열렸어요. 이번엔 전세사기 피해자 구제 같은 생활 밀착 법안이 핵심이에요.",
    finalConclusion: "4월 임시국회 개의 — 민생법안 12건이 쟁점",
    keyTerms: [
      { term: "임시국회", explanation: "정기 회기 외에 별도 소집되는 국회예요." },
    ],
  },
  {
    id: 2005,
    section: "POLITICS",
    hoursAgo: 26,
    publisher: "MBC",
    title: "총리 후보자 인사청문회 5월 6일 개최",
    thumbnail: null,
    content:
      "<p>국회 인사청문특위는 신임 총리 후보자에 대한 인사청문회를 5월 6일 열기로 합의했다.</p>",
    titleTheme: "총리 청문회 일정",
    summary:
      "새 총리 후보자 청문회가 5월 6일에 열려요. 자녀 교육 의혹과 부동산 관련 자료 제출이 쟁점이 될 전망이에요. 통과되면 5월 둘째 주 임명 예정이에요.",
    easyExplanation:
      "새 총리가 자격이 있는지 국회의원들이 질문하는 자리예요. 답변에 따라 통과 / 부결이 갈려요.",
    finalConclusion: "총리 인사청문회 5월 6일 — 자녀 교육 의혹 쟁점",
    keyTerms: [
      { term: "인사청문회", explanation: "고위 공직자 임명 전 자격 검증 절차예요." },
    ],
  },
  {
    id: 2006,
    section: "POLITICS",
    hoursAgo: 36,
    publisher: "동아일보",
    title: "여야, 반도체 특별법 통과 합의… 보조금 5조원 신설",
    thumbnail: null,
    content:
      "<p>여야가 반도체 산업 지원 특별법에 합의했다. 5조원 규모 보조금과 세제 혜택이 핵심이다.</p>",
    titleTheme: "반도체 특별법 합의",
    summary:
      "여야가 한 마음으로 반도체 회사를 도와줄 특별법에 합의했어요. 보조금 5조원 + 세금 혜택이 주요 내용이에요. 미국·일본의 반도체 지원에 대응하기 위해서예요.",
    easyExplanation:
      "삼성·SK 같은 한국 반도체 회사에 정부가 5조원을 보태기로 했어요. 미국·일본이 자기네 반도체 회사한테 비슷하게 하니까 우리도 따라가는 거예요.",
    finalConclusion: "반도체 특별법 합의 — 5조원 보조금 신설",
    keyTerms: [
      { term: "보조금", explanation: "정부가 산업 육성을 위해 주는 지원금이에요." },
    ],
  },
  {
    id: 2007,
    section: "POLITICS",
    hoursAgo: 48,
    publisher: "JTBC",
    title: "외교부, 주미대사에 전직 차관 내정",
    thumbnail: null,
    content:
      "<p>외교부는 차기 주미대사로 전직 차관 출신 외교관을 내정했다고 밝혔다. 다음 주 인사 발표가 예정돼 있다.</p>",
    titleTheme: "주미대사 인사",
    summary:
      "새 주미대사로 전직 외교부 차관이 내정됐어요. 다음 주 공식 발표 예정이에요. 트럼프 행정부와의 동맹 조율이 첫 임무가 될 거란 전망이에요.",
    easyExplanation:
      "미국에 한국 정부 대표로 가는 사람이 바뀐다는 거예요. 주미대사는 대통령 다음으로 한미관계에서 중요한 자리예요.",
    finalConclusion: "주미대사에 전직 차관 내정 — 한미동맹 조율 임무",
    keyTerms: [
      { term: "주미대사", explanation: "미국에 파견된 한국 정부 최고 대표예요." },
    ],
  },
  {
    id: 2008,
    section: "POLITICS",
    hoursAgo: 60,
    publisher: "SBS",
    title: "지방선거 D-100… 시도지사 후보군 윤곽",
    thumbnail: null,
    content:
      "<p>전국동시지방선거 100일을 앞두고 주요 시도지사 후보군의 윤곽이 잡히고 있다.</p>",
    titleTheme: "지방선거 D-100",
    summary:
      "지방선거가 100일 앞으로 다가왔어요. 서울시장은 현역 vs 야권 단일후보, 부산시장은 3파전 양상이에요. 각 정당 공천 마감은 다음 달 말까지예요.",
    easyExplanation:
      "내가 사는 도시 시장·도지사 뽑는 선거가 100일 남았다는 뜻이에요. 누가 후보인지 슬슬 윤곽이 잡히고 있어요.",
    finalConclusion: "지방선거 D-100 — 시도지사 후보 윤곽 잡혀",
    keyTerms: [
      { term: "공천", explanation: "정당이 공식 후보를 결정하는 절차예요." },
    ],
  },
  {
    id: 2009,
    section: "POLITICS",
    hoursAgo: 80,
    publisher: "한국일보",
    title: "여야, 연금개혁 특위 가동… 연금 더 내고 더 받기 논의",
    thumbnail: null,
    content:
      "<p>국회 연금개혁특별위원회가 가동되며 보험료율과 소득대체율 인상을 동시에 검토한다.</p>",
    titleTheme: "연금개혁 특위",
    summary:
      "국회 연금개혁 특위가 본격 시작됐어요. 매달 내는 보험료를 올리는 대신 받는 돈도 늘리는 방향이 유력해요. 6월까지 합의안을 내겠다는 목표예요.",
    easyExplanation:
      "지금 국민연금 그대로 두면 30년 뒤 바닥난다는 게 이슈였어요. 그래서 \"좀 더 내고 좀 더 받게\" 바꾸는 안을 논의 중이에요.",
    finalConclusion: "연금개혁 — 더 내고 더 받는 방향 검토",
    keyTerms: [
      { term: "보험료율", explanation: "월 소득에서 연금으로 떼는 비율이에요." },
      { term: "소득대체율", explanation: "은퇴 후 받는 연금이 평균 소득의 몇 % 인지예요." },
    ],
  },
  {
    id: 2010,
    section: "POLITICS",
    hoursAgo: 120,
    publisher: "뉴스1",
    title: "북한, 동해상에 단거리 탄도미사일 2발 발사",
    thumbnail: null,
    content:
      "<p>합동참모본부는 북한이 동해상으로 단거리 탄도미사일 2발을 발사했다고 밝혔다. 미사일은 약 350km 비행했다.</p>",
    titleTheme: "북한 미사일 발사",
    summary:
      "북한이 동해 쪽으로 단거리 탄도미사일 2발을 쐈어요. 약 350km 날아갔고 일본 EEZ 밖에 떨어졌어요. 한미일이 즉각 규탄 성명을 냈어요.",
    easyExplanation:
      "북한이 또 미사일을 발사했어요. 350km 면 서울에서 부산보다 좀 짧은 거리예요. 한·미·일이 함께 항의했어요.",
    finalConclusion: "북한 단거리 미사일 2발 — 한미일 규탄",
    keyTerms: [
      { term: "탄도미사일", explanation: "포물선 궤도로 멀리 날아가는 미사일이에요." },
      { term: "EEZ", explanation: "한 나라가 어업·자원 권리를 갖는 200해리 바다예요." },
    ],
  },

  // ─── SOCIETY (10) ─────────────────────────────────────
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
    hoursAgo: 6,
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
  {
    id: 3003,
    section: "SOCIETY",
    hoursAgo: 10,
    publisher: "YTN",
    title: "서울 지하철 노조, 임금협상 결렬 시 5월 8일 파업 예고",
    thumbnail: null,
    content:
      "<p>서울교통공사 노조가 임금 협상이 결렬될 경우 5월 8일부터 파업에 돌입한다고 예고했다.</p>",
    titleTheme: "지하철 파업 예고",
    summary:
      "서울 지하철 노조가 임금 협상이 안 풀리면 5월 8일부터 파업하겠다고 했어요. 평일 출퇴근 차질이 예상돼요. 사측은 이번 주 안에 추가 협상 자리를 갖기로 했어요.",
    easyExplanation:
      "지하철 일하시는 분들이 \"월급 인상 안 해주면 일 안 한다\" 라고 한 거예요. 만약 진짜 파업하면 출근길 헬게이트 가능성 있어요.",
    finalConclusion: "지하철 5월 8일 파업 가능성 — 출퇴근 주의",
    keyTerms: [
      { term: "파업", explanation: "노동자가 단체로 일을 멈추는 행위예요." },
    ],
  },
  {
    id: 3004,
    section: "SOCIETY",
    hoursAgo: 16,
    publisher: "MBC",
    title: "출생아 수, 9년 만에 첫 반등… 지난해 대비 5% 증가",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=SOC",
    content:
      "<p>통계청은 1분기 출생아 수가 전년 동기 대비 5% 증가하며 9년 만에 첫 반등했다고 발표했다.</p>",
    titleTheme: "출생아 반등",
    summary:
      "1분기 출생아 수가 작년보다 5% 늘었어요. 9년 연속 줄던 흐름이 처음 꺾인 거예요. 신혼부부 주거 지원이 효과를 봤다는 분석이 나와요.",
    easyExplanation:
      "한국에서 태어나는 아기 숫자가 9년 만에 처음으로 늘었어요. 결혼한 사람 집 사기 좋게 도와준 게 영향을 준 것 같다고 해요.",
    finalConclusion: "출생아 9년 만에 반등 — 1분기 5% ↑",
    keyTerms: [
      { term: "합계출산율", explanation: "여성 1명이 평생 낳는 평균 자녀 수예요." },
    ],
  },
  {
    id: 3005,
    section: "SOCIETY",
    hoursAgo: 24,
    publisher: "조선일보",
    title: "의대 증원 협상 재개… 정부·의협 5월 첫 만남",
    thumbnail: null,
    content:
      "<p>정부와 대한의사협회가 5월 초 의대 증원 협상을 재개한다.</p>",
    titleTheme: "의대 증원 협상",
    summary:
      "정부랑 의사협회가 5월 초에 다시 만나기로 했어요. 1년 넘게 끌어온 의대 정원 늘리기 갈등에 변화가 있을지 주목돼요. 전공의 복귀 조건도 함께 논의돼요.",
    easyExplanation:
      "\"의사 더 뽑을지 말지\" 정부 vs 의사 싸움이 1년째였어요. 둘이 드디어 다시 협상 테이블에 앉기로 했어요.",
    finalConclusion: "의대 증원 협상 5월 재개 — 1년 만의 만남",
    keyTerms: [
      { term: "전공의", explanation: "의대 졸업 후 병원에서 수련 중인 의사예요." },
    ],
  },
  {
    id: 3006,
    section: "SOCIETY",
    hoursAgo: 33,
    publisher: "한겨레",
    title: "학교폭력 신고 5년 만에 감소… AI 신고 시스템 효과",
    thumbnail: null,
    content:
      "<p>지난해 학교폭력 신고가 5년 만에 감소했다. 익명 AI 챗봇 신고 시스템 도입이 효과를 봤다는 평가다.</p>",
    titleTheme: "학폭 신고 감소",
    summary:
      "지난해 학교폭력 신고가 5년 만에 줄었어요. 익명 AI 챗봇으로 신고할 수 있게 한 게 효과를 봤다는 분석이에요. 다만 사이버 괴롭힘은 여전히 늘고 있어요.",
    easyExplanation:
      "학교에서 따돌림이나 괴롭힘 신고가 5년 만에 줄었어요. AI 챗봇한테 익명으로 말하면 처리해 주는 시스템이 도움이 됐대요. 그래도 카톡·인스타로 괴롭히는 건 여전히 늘었어요.",
    finalConclusion: "학폭 5년 만에 감소 — 사이버 괴롭힘은 ↑",
    keyTerms: [],
  },
  {
    id: 3007,
    section: "SOCIETY",
    hoursAgo: 44,
    publisher: "한국일보",
    title: "전국 어린이날 행사 660곳… 지역축제 부활",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=SOC",
    content:
      "<p>5월 5일 어린이날을 맞아 전국에서 660여 개 행사가 열린다. 지역 축제도 코로나 이전 수준을 회복했다.</p>",
    titleTheme: "어린이날 행사",
    summary:
      "어린이날 전국 660곳에서 행사가 열려요. 코로나 이후 줄었던 지역축제가 거의 회복됐어요. 무료 입장 시설도 평소보다 30% 늘었어요.",
    easyExplanation:
      "5월 5일에 아이 손잡고 갈 만한 행사가 전국 660곳에 있어요. 놀이공원 무료 입장 같은 혜택도 작년보다 더 많아요.",
    finalConclusion: "어린이날 행사 660곳 — 코로나 이전 회복",
    keyTerms: [],
  },
  {
    id: 3008,
    section: "SOCIETY",
    hoursAgo: 58,
    publisher: "SBS",
    title: "주말 사이 강원 산불 3건… 100ha 소실",
    thumbnail: null,
    content:
      "<p>주말 사이 강원도에서 발생한 산불 3건으로 약 100ha 산림이 불에 탔다. 인명 피해는 없었다.</p>",
    titleTheme: "강원 산불",
    summary:
      "주말 동안 강원도에서 산불 3건이 났어요. 약 100ha (축구장 140개 면적) 가 탔지만 다행히 다친 사람은 없어요. 건조주의보가 다음 주까지 이어질 전망이라 추가 화재 우려가 있어요.",
    easyExplanation:
      "강원도에서 산불이 세 군데 났어요. 축구장 140개만큼 산이 탔는데 사람은 안 다쳤어요. 당분간 산 근처에서 불 조심해야 해요.",
    finalConclusion: "강원 산불 3건 — 100ha 소실, 인명 피해 없음",
    keyTerms: [
      { term: "건조주의보", explanation: "공기 매우 건조해 화재 위험 높을 때 발효돼요." },
    ],
  },
  {
    id: 3009,
    section: "SOCIETY",
    hoursAgo: 76,
    publisher: "MBC",
    title: "65세 이상 인구 1000만 돌파… 초고령사회 진입",
    thumbnail: null,
    content:
      "<p>통계청은 4월 기준 65세 이상 인구가 1000만 명을 처음 돌파했다고 밝혔다. 전체 인구의 19.5% 다.</p>",
    titleTheme: "65세 이상 1000만",
    summary:
      "65세 이상 인구가 처음으로 1000만 명을 넘었어요. 전체 인구의 약 1/5 이에요. 한국이 본격적으로 초고령사회로 진입한 거예요.",
    easyExplanation:
      "한국 사람 5명 중 1명이 65세 이상이라는 뜻이에요. 일본 다음으로 빠르게 늙어가는 나라예요. 노인 복지·연금 부담이 점점 커질 거예요.",
    finalConclusion: "65세 이상 1000만 — 초고령사회 본격 진입",
    keyTerms: [
      { term: "초고령사회", explanation: "전체 인구 중 65세 이상이 20% 넘는 사회예요." },
    ],
  },
  {
    id: 3010,
    section: "SOCIETY",
    hoursAgo: 130,
    publisher: "YTN",
    title: "전국 보육교사 처우개선… 7월부터 월 30만원 인상",
    thumbnail: null,
    content:
      "<p>보건복지부는 7월부터 보육교사 임금을 월 평균 30만원 인상한다고 발표했다.</p>",
    titleTheme: "보육교사 처우 개선",
    summary:
      "7월부터 어린이집 보육교사 월급이 평균 30만원 올라요. 인력난을 해소하기 위한 조치예요. 부모가 내는 보육료는 그대로 유지될 예정이에요.",
    easyExplanation:
      "어린이집 선생님들 월급이 7월부터 30만 원씩 더 올라가요. 일하시는 분이 모자라서 정부가 올려주는 거예요. 학부모가 내는 돈은 그대로래요.",
    finalConclusion: "보육교사 월 30만원 인상 — 학부모 부담은 동결",
    keyTerms: [],
  },

  // ─── LIFE (10) ─────────────────────────────────────
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
    hoursAgo: 8,
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
  {
    id: 4003,
    section: "LIFE",
    hoursAgo: 12,
    publisher: "조선일보",
    title: "한식당 5곳, 미슐랭 가이드 별 획득… 역대 최다",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=LIFE",
    content:
      "<p>2026 미슐랭 가이드에서 한식당 5곳이 별을 획득했다. 역대 최다 기록이다.</p>",
    titleTheme: "한식당 미슐랭",
    summary:
      "올해 미슐랭 가이드에서 한식당 5곳이 별을 받았어요. 역대 최다예요. 그중 2곳은 처음 별을 받은 신생 가게예요.",
    easyExplanation:
      "세계에서 제일 까다로운 음식 평가 책에서 한국 식당 5곳이 \"꼭 가볼 만한 곳\" 으로 인정받았어요. 그동안 가장 많은 숫자예요.",
    finalConclusion: "한식당 5곳 미슐랭 별 — 역대 최다",
    keyTerms: [
      { term: "미슐랭 가이드", explanation: "프랑스 타이어 회사가 만드는 권위 있는 음식점 평가서예요." },
    ],
  },
  {
    id: 4004,
    section: "LIFE",
    hoursAgo: 18,
    publisher: "스포츠서울",
    title: "넷플릭스 '서울대 학원' 1주 만에 글로벌 1위",
    thumbnail: null,
    content:
      "<p>넷플릭스 한국 드라마 \"서울대 학원\"이 공개 1주 만에 글로벌 시청 시간 1위에 올랐다.</p>",
    titleTheme: "韓 드라마 글로벌 1위",
    summary:
      "한국 드라마 \"서울대 학원\" 이 넷플릭스에서 일주일 만에 전 세계 1위가 됐어요. 학원가 입시 경쟁을 다룬 블랙코미디예요. 시즌 2도 이미 확정됐어요.",
    easyExplanation:
      "한국 드라마 한 편이 전 세계에서 가장 많이 본 작품이 됐어요. 서울 강남 학원 이야기가 외국인한테도 통한 거예요.",
    finalConclusion: "한국 드라마 글로벌 1위 — 시즌 2 확정",
    keyTerms: [],
  },
  {
    id: 4005,
    section: "LIFE",
    hoursAgo: 26,
    publisher: "한겨레",
    title: "국립공원 캠핑 예약 5분 만에 매진… 5월 황금연휴",
    thumbnail: null,
    content:
      "<p>국립공원 5월 황금연휴 캠핑장 예약이 시작 5분 만에 모두 매진됐다.</p>",
    titleTheme: "캠핑 예약 매진",
    summary:
      "5월 황금연휴 국립공원 캠핑장 예약이 5분 만에 다 찼어요. 동해안과 지리산 일대가 가장 빨랐어요. 차박 가능 사이트는 1분 안에 매진됐어요.",
    easyExplanation:
      "5월 연휴 캠핑하려는 사람이 너무 많아서 예약창이 열리자마자 자리가 다 사라졌어요. 못 잡았으면 사설 캠핑장이나 글램핑을 노려보세요.",
    finalConclusion: "국립공원 캠핑 5분 매진 — 황금연휴 인기",
    keyTerms: [],
  },
  {
    id: 4006,
    section: "LIFE",
    hoursAgo: 34,
    publisher: "여성동아",
    title: "여름 패션 키워드 '시어서커'… 가벼운 소재 인기",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=LIFE",
    content:
      "<p>올여름 패션 키워드는 \"시어서커\". 통풍 잘 되는 가벼운 소재가 다시 인기를 끌고 있다.</p>",
    titleTheme: "여름 패션 시어서커",
    summary:
      "올여름엔 시어서커 (살짝 우글우글한 가벼운 면 소재) 가 다시 유행이에요. 다림질 안 해도 괜찮고 시원해서 출퇴근복으로 인기예요. 가격대도 다양해서 5만원대부터 명품까지 폭넓어요.",
    easyExplanation:
      "올여름엔 표면이 살짝 쭈글쭈글한 면 옷이 유행이에요. 시원하고 다림질 안 해도 괜찮아 회사원한테 좋아요.",
    finalConclusion: "여름 시어서커 유행 — 다림질 X 통풍 O",
    keyTerms: [
      { term: "시어서커", explanation: "표면이 우글우글한 가볍고 시원한 면 소재예요." },
    ],
  },
  {
    id: 4007,
    section: "LIFE",
    hoursAgo: 46,
    publisher: "매일경제",
    title: "백화점 봄 정기세일… 명품 매출 2배 급증",
    thumbnail: null,
    content:
      "<p>롯데·신세계·현대백화점 봄 정기세일 첫 주 명품 매출이 작년 대비 2배로 늘었다.</p>",
    titleTheme: "백화점 봄세일",
    summary:
      "주요 백화점 봄 세일 첫 주 명품 매출이 작년의 2배가 됐어요. 환율이 올라서 \"여기서 사는 게 더 싸다\" 는 인식이 퍼진 영향이에요. 30~40대 직장인 비중이 가장 컸어요.",
    easyExplanation:
      "백화점 세일 시작했더니 명품 잘 팔리고 있어요. 환율이 올라서 해외에서 사는 것보다 한국이 싸진 거예요.",
    finalConclusion: "봄세일 명품 매출 2배 — 환율 영향",
    keyTerms: [],
  },
  {
    id: 4008,
    section: "LIFE",
    hoursAgo: 60,
    publisher: "스타뉴스",
    title: "BTS 정국, 솔로 정규 1집 발표… 빌보드 1위 유력",
    thumbnail: null,
    content:
      "<p>BTS 정국이 솔로 정규 1집을 발표하며 빌보드 200 1위 가능성이 거론되고 있다.</p>",
    titleTheme: "정국 솔로 1집",
    summary:
      "BTS 정국이 솔로 정규 1집을 냈어요. 빌보드 200 1위 가능성이 점쳐지고 있어요. 첫 곡은 EDM 댄스곡으로 24시간 안에 1억 뷰를 돌파했어요.",
    easyExplanation:
      "BTS 정국이 혼자 부른 앨범을 처음으로 풀버전으로 냈어요. 미국 차트 1위까지 갈 거란 말이 나와요. 첫 곡 뮤비는 24시간만에 1억 명이 봤어요.",
    finalConclusion: "정국 솔로 1집 — 빌보드 1위 유력",
    keyTerms: [
      { term: "빌보드 200", explanation: "미국 음반 판매·스트리밍 종합 차트예요." },
    ],
  },
  {
    id: 4009,
    section: "LIFE",
    hoursAgo: 80,
    publisher: "SBS",
    title: "프로야구 개막 한 달… 평균 관중 1만5천 사상 최다",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=LIFE",
    content:
      "<p>프로야구 개막 한 달 평균 관중이 경기당 1만 5000명을 넘어 사상 최다를 기록했다.</p>",
    titleTheme: "프로야구 흥행",
    summary:
      "프로야구 개막 한 달 평균 관중이 경기당 1만5천 명으로 역대 최다예요. 여성·20대 팬 비중이 크게 늘었어요. 굿즈 매출도 작년 대비 60% 늘었어요.",
    easyExplanation:
      "야구장에 사람이 진짜 많이 와요. 특히 여성 팬, 20대 비중이 늘어서 분위기가 확 바뀌었어요. 응원 굿즈도 불티나게 팔리고 있어요.",
    finalConclusion: "프로야구 평균 1만5천 명 — 사상 최다",
    keyTerms: [],
  },
  {
    id: 4010,
    section: "LIFE",
    hoursAgo: 140,
    publisher: "한국일보",
    title: "스타벅스 한국 1900호점 돌파… 매장 수 세계 4위",
    thumbnail: null,
    content:
      "<p>스타벅스 코리아가 1900호점을 돌파해 매장 수 기준 미국·중국·일본 다음 세계 4위에 올랐다.</p>",
    titleTheme: "스타벅스 1900호점",
    summary:
      "스타벅스 한국 매장이 1900호점을 넘었어요. 매장 수로는 미국·중국·일본 다음 4위예요. 인구 대비 밀집도는 세계 1위예요.",
    easyExplanation:
      "한국에 스타벅스 매장이 1900개를 넘었어요. 인구 비례로 따지면 사실상 세계에서 가장 빽빽한 나라예요.",
    finalConclusion: "스타벅스 1900호점 — 인구 대비 밀집도 1위",
    keyTerms: [],
  },

  // ─── WORLD (10) ─────────────────────────────────────
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
    hoursAgo: 12,
    publisher: "AP(번역)",
    title: "EU, 빅테크 규제 패키지 최종 합의… 반독점 과징금 강화",
    thumbnail: null,
    content:
      "<p>EU 회원국들이 빅테크 반독점 규제 패키지에 최종 합의했다.</p>",
    titleTheme: "EU 빅테크 규제",
    summary:
      "유럽이 빅테크에 더 강한 반독점 규제를 도입하기로 합의했어요. 위반 시 글로벌 매출의 최대 10% 과징금이에요. 발효는 내년 초예요.",
    easyExplanation:
      "유럽이 큰 IT 회사들에게 \"우리 시장에서 마음대로 못 한다\" 고 더 세게 못 박은 거예요. 어기면 전 세계 매출의 1/10 까지 벌금이에요.",
    finalConclusion: "EU 빅테크 규제 강화 — 글로벌 매출 10% 과징금",
    keyTerms: [
      { term: "반독점", explanation: "한 회사가 시장을 독차지 못 하게 막는 규제예요." },
    ],
  },
  {
    id: 5003,
    section: "WORLD",
    hoursAgo: 19,
    publisher: "BBC(번역)",
    title: "英 총선 D-30… 노동당 지지율 보수당 14%p 앞서",
    thumbnail: null,
    content:
      "<p>영국 총선 30일 전, 노동당이 보수당을 14%p 앞서고 있다는 여론조사가 나왔다.</p>",
    titleTheme: "英 총선 D-30",
    summary:
      "영국 총선이 30일 앞으로 다가왔어요. 야당 노동당이 여당 보수당을 14%p 앞서고 있어요. 14년 보수당 집권이 끝날 가능성이 점쳐져요.",
    easyExplanation:
      "영국에서도 한국처럼 총선이 곧이에요. 지금까진 야당이 큰 차이로 앞서고 있어 정권이 바뀔 가능성이 높아요.",
    finalConclusion: "英 노동당 14%p 우위 — 정권교체 유력",
    keyTerms: [],
  },
  {
    id: 5004,
    section: "WORLD",
    hoursAgo: 28,
    publisher: "교도통신(번역)",
    title: "日 엔/달러 환율 158엔 돌파… 정부 개입 시사",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=WORLD",
    content:
      "<p>엔/달러 환율이 158엔을 돌파하자 일본 정부는 외환시장 개입 가능성을 시사했다.</p>",
    titleTheme: "엔화 약세",
    summary:
      "일본 엔화가 달러당 158엔까지 약해졌어요. 1990년 이후 최저예요. 일본 정부는 시장에 직접 개입할 수도 있다고 경고했어요.",
    easyExplanation:
      "엔화가 점점 약해져서 일본 사람한테는 수입품이 비싸졌어요. 한국 사람이 일본 여행 가기엔 좋은 환경이지만 일본 경제엔 부담이에요.",
    finalConclusion: "엔/달러 158엔 — 일본 정부 개입 경고",
    keyTerms: [
      { term: "외환시장 개입", explanation: "정부가 환율 안정화를 위해 외환을 사고파는 행위예요." },
    ],
  },
  {
    id: 5005,
    section: "WORLD",
    hoursAgo: 38,
    publisher: "AP(번역)",
    title: "中 1분기 GDP 4.6% 성장… 시장 예상 하회",
    thumbnail: null,
    content:
      "<p>중국 1분기 GDP 성장률이 4.6%를 기록해 시장 예상치 5.0%를 하회했다.</p>",
    titleTheme: "中 1분기 성장",
    summary:
      "중국 1분기 경제성장률이 4.6%로 시장 예상보다 낮게 나왔어요. 부동산 부진과 소비 둔화가 원인이에요. 정부 목표 5%는 달성하기 쉽지 않을 전망이에요.",
    easyExplanation:
      "중국 경제가 예상보다 살짝 덜 자랐어요. 집값이 안 좋고 사람들이 돈을 잘 안 써서요. 한국 수출에도 영향을 줄 수 있어요.",
    finalConclusion: "中 GDP 4.6% — 예상치 하회, 부동산 부진",
    keyTerms: [
      { term: "GDP", explanation: "한 나라가 1년간 만든 가치 총합이에요." },
    ],
  },
  {
    id: 5006,
    section: "WORLD",
    hoursAgo: 50,
    publisher: "AFP(번역)",
    title: "우크라이나-러시아 정전 협상 재개 합의",
    thumbnail: null,
    content:
      "<p>우크라이나와 러시아가 튀르키예 중재로 정전 협상을 재개하기로 합의했다.</p>",
    titleTheme: "우크라 정전 협상",
    summary:
      "우크라이나와 러시아가 튀르키예 중재로 정전 협상을 다시 시작하기로 했어요. 첫 회담은 5월 중순 이스탄불에서 열려요. 영토 문제가 최대 쟁점이에요.",
    easyExplanation:
      "3년째 이어진 우크라이나 전쟁을 멈추기 위한 회담이 다시 열려요. 점령 지역을 어떻게 할지가 가장 어려운 문제예요.",
    finalConclusion: "우크라-러 정전 협상 5월 재개 — 튀르키예 중재",
    keyTerms: [
      { term: "정전 협상", explanation: "전쟁을 멈추기 위한 양측 협의예요." },
    ],
  },
  {
    id: 5007,
    section: "WORLD",
    hoursAgo: 64,
    publisher: "WSJ(번역)",
    title: "美 中 관세 추가 부과… 전기차·태양광 60% 인상",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=WORLD",
    content:
      "<p>미국이 중국산 전기차와 태양광 패널에 관세를 60% 추가 인상한다고 발표했다.</p>",
    titleTheme: "美 對中 관세",
    summary:
      "미국이 중국산 전기차와 태양광 패널 관세를 60% 더 올렸어요. 중국 산업 견제가 목적이에요. 한국 기업들에는 일부 반사이익이 예상돼요.",
    easyExplanation:
      "미국이 중국에서 만든 전기차에 세금을 더 매기기로 했어요. 중국 차가 비싸지면 한국 차가 상대적으로 잘 팔릴 수 있어요.",
    finalConclusion: "美, 中 전기차 관세 60% 인상",
    keyTerms: [
      { term: "관세", explanation: "외국에서 들어오는 물건에 매기는 세금이에요." },
    ],
  },
  {
    id: 5008,
    section: "WORLD",
    hoursAgo: 84,
    publisher: "로이터(번역)",
    title: "OPEC+, 석유 감산 6개월 연장 합의",
    thumbnail: null,
    content:
      "<p>OPEC+ 회원국이 일일 200만 배럴 석유 감산을 6개월 더 연장하기로 합의했다.</p>",
    titleTheme: "OPEC+ 감산 연장",
    summary:
      "산유국 모임 OPEC+ 가 석유 감산을 6개월 더 이어가기로 했어요. 유가를 80달러 이상으로 유지하는 게 목표예요. 한국 같은 수입국에는 부담이 되는 결정이에요.",
    easyExplanation:
      "산유국들이 일부러 석유를 덜 뽑아서 가격이 안 떨어지게 하기로 했어요. 한국 입장에서는 기름값 부담이 계속될 거예요.",
    finalConclusion: "OPEC+ 감산 6개월 연장 — 유가 80달러 방어",
    keyTerms: [
      { term: "OPEC+", explanation: "원유 수출국 카르텔과 러시아 등 비OPEC 산유국 연합이에요." },
    ],
  },
  {
    id: 5009,
    section: "WORLD",
    hoursAgo: 100,
    publisher: "AP(번역)",
    title: "이스라엘-하마스 인질 협상 재개… 카타르 중재",
    thumbnail: null,
    content:
      "<p>이스라엘과 하마스가 카타르 중재로 인질 석방 협상을 재개했다.</p>",
    titleTheme: "이·하 인질 협상",
    summary:
      "이스라엘과 하마스가 카타르 중재로 인질 협상을 다시 시작했어요. 약 100명 인질의 단계적 석방이 논의 중이에요. 가자 지구 인도적 지원도 포함돼요.",
    easyExplanation:
      "중동 분쟁에서 잡혀 있는 사람들을 풀어주는 협상이 다시 열렸어요. 카타르가 중간에서 다리 역할을 하고 있어요.",
    finalConclusion: "이·하 인질 협상 재개 — 카타르 중재",
    keyTerms: [],
  },
  {
    id: 5010,
    section: "WORLD",
    hoursAgo: 150,
    publisher: "AFP(번역)",
    title: "프랑스, 50시간 노동제 도입 검토 논란",
    thumbnail: null,
    content:
      "<p>프랑스 정부가 주 35시간제를 폐지하고 50시간까지 가능한 안을 검토 중이라 보도됐다.</p>",
    titleTheme: "佛 노동시간 논란",
    summary:
      "프랑스가 35시간 노동제를 50시간까지 늘리는 안을 검토 중이래요. 경쟁력 회복을 위한 조치라지만 노조가 강하게 반발하고 있어요. 5월 1일 대규모 시위가 예고됐어요.",
    easyExplanation:
      "프랑스는 원래 주 35시간 일하는 게 기본이었어요. 그걸 한국·미국처럼 더 길게 일할 수 있게 바꾸려 한다는 거예요. 사람들이 화가 많이 났어요.",
    finalConclusion: "佛 35시간제 폐지 검토 — 5월 대규모 시위",
    keyTerms: [
      { term: "주 35시간제", explanation: "프랑스의 법정 주당 노동시간이에요. 1998년 도입." },
    ],
  },

  // ─── IT (10) ─────────────────────────────────────
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
    hoursAgo: 7,
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
  {
    id: 6003,
    section: "IT",
    hoursAgo: 10,
    publisher: "디지털타임스",
    title: "애플, WWDC 6월 9일 개최… 비전프로 2 발표 유력",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=IT",
    content:
      "<p>애플이 연례 개발자 행사 WWDC 를 6월 9일 개최한다고 발표했다. 비전프로 2 가 공개될 가능성이 높다.</p>",
    titleTheme: "애플 WWDC 6월",
    summary:
      "애플 개발자 행사 WWDC 가 6월 9일 열려요. 가격을 확 낮춘 비전프로 2 공개가 유력해요. iOS 19 와 시리 대규모 업데이트도 예고됐어요.",
    easyExplanation:
      "애플이 매년 6월에 여는 큰 발표회가 다음 달이에요. 머리에 쓰는 컴퓨터 \"비전프로\" 2세대가 나올 것 같다고 해요.",
    finalConclusion: "애플 WWDC 6/9 — 비전프로 2 공개 유력",
    keyTerms: [
      { term: "WWDC", explanation: "애플의 연례 세계 개발자 콘퍼런스예요." },
    ],
  },
  {
    id: 6004,
    section: "IT",
    hoursAgo: 16,
    publisher: "테크크런치(번역)",
    title: "구글, 양자컴퓨터 '윌로우' 차세대 시연… 100만 큐비트 목표",
    thumbnail: null,
    content:
      "<p>구글이 양자컴퓨터 윌로우의 차세대 버전을 시연했다. 2030년까지 100만 큐비트를 목표로 한다.</p>",
    titleTheme: "구글 양자컴퓨터",
    summary:
      "구글이 새 양자컴퓨터를 시연했어요. 2030년까지 100만 큐비트가 목표예요. 신약 개발과 암호 해독이 주요 활용 분야로 꼽혀요.",
    easyExplanation:
      "양자컴퓨터는 일반 컴퓨터로 1만 년 걸릴 계산을 1초에 풀 수 있는 차세대 기술이에요. 아직 실용화는 안 됐지만 점점 다가오고 있어요.",
    finalConclusion: "구글 양자컴퓨터 시연 — 2030년 100만 큐비트 목표",
    keyTerms: [
      { term: "양자컴퓨터", explanation: "양자역학 원리로 일반 컴퓨터보다 훨씬 빠른 계산이 가능해요." },
      { term: "큐비트", explanation: "양자컴퓨터의 정보 단위. 0과 1을 동시에 가져요." },
    ],
  },
  {
    id: 6005,
    section: "IT",
    hoursAgo: 24,
    publisher: "ZDNet Korea",
    title: "테슬라 FSD v13, 한국 시범 운영 6월 시작",
    thumbnail: null,
    content:
      "<p>테슬라 자율주행 FSD v13 베타 운영이 6월부터 한국에서 시작된다.</p>",
    titleTheme: "테슬라 FSD 한국",
    summary:
      "테슬라 자율주행 FSD v13 이 6월부터 한국에서 시범 운영돼요. 강남·판교·송도가 우선 적용 지역이에요. 운전자가 핸들을 잡고 있어야 한다는 점은 그대로예요.",
    easyExplanation:
      "테슬라 차에 들어 있는 자율주행 기능 최신 버전이 한국에서도 곧 쓸 수 있어요. 다만 손은 핸들 위에 올려둬야 하고 책임은 여전히 운전자에게 있어요.",
    finalConclusion: "테슬라 FSD v13 6월 한국 시범 — 강남·판교·송도",
    keyTerms: [
      { term: "FSD", explanation: "Full Self-Driving. 테슬라의 자율주행 기능이에요." },
    ],
  },
  {
    id: 6006,
    section: "IT",
    hoursAgo: 36,
    publisher: "전자신문",
    title: "삼성, 갤럭시Z 폴드7 7월 출시… 두께 8.5mm",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=IT",
    content:
      "<p>삼성전자가 갤럭시Z 폴드7 을 7월 출시한다. 두께 8.5mm 로 역대 가장 얇다.</p>",
    titleTheme: "갤럭시Z 폴드7",
    summary:
      "삼성 갤럭시Z 폴드7 이 7월에 나와요. 접었을 때 두께 8.5mm 로 역대 가장 얇아요. 가격은 전작보다 10만 원 비싼 230만 원대로 예상돼요.",
    easyExplanation:
      "삼성 \"접는 폰\" 신상이 7월에 나와요. 더 얇고 가벼워졌어요. 가격은 살짝 올랐어요.",
    finalConclusion: "갤럭시Z 폴드7 7월 출시 — 두께 8.5mm",
    keyTerms: [],
  },
  {
    id: 6007,
    section: "IT",
    hoursAgo: 50,
    publisher: "더버지(번역)",
    title: "메타, AR 글래스 '오리온' 일반 출시 2027년 확정",
    thumbnail: null,
    content:
      "<p>메타가 AR 글래스 오리온의 일반 소비자 출시를 2027년으로 확정했다.</p>",
    titleTheme: "메타 AR 글래스",
    summary:
      "메타가 AR 안경 \"오리온\" 을 2027년 일반 출시한다고 확정했어요. 가격은 1500달러 안팎으로 예상돼요. 시야에 정보를 띄우고 손동작으로 조작 가능해요.",
    easyExplanation:
      "현실 세계에 정보를 겹쳐 보여주는 \"AR 안경\" 이 2027년에 일반인용으로 나와요. 영화 같은 미래 기술이 슬슬 다가오고 있어요.",
    finalConclusion: "메타 AR 글래스 2027 출시 — 1500달러 예상",
    keyTerms: [
      { term: "AR (증강현실)", explanation: "현실 위에 디지털 정보를 겹쳐 보여주는 기술이에요." },
    ],
  },
  {
    id: 6008,
    section: "IT",
    hoursAgo: 70,
    publisher: "한국경제",
    title: "쿠팡, AI 물류 자동화 5조원 투자… 풀필먼트 6배 확장",
    thumbnail: null,
    content:
      "<p>쿠팡이 AI 기반 물류 자동화에 5조원을 투자한다. 풀필먼트 센터 면적은 6배로 확장된다.</p>",
    titleTheme: "쿠팡 5조원 투자",
    summary:
      "쿠팡이 AI 물류 자동화에 5조원을 투자해요. 풀필먼트 센터 면적은 6배 확장돼요. 새벽배송 가능 지역도 전국 95% 까지 늘어날 전망이에요.",
    easyExplanation:
      "쿠팡이 새벽배송 더 잘 되게 하려고 5조 원을 쓴대요. 창고도 6배 크게, AI 가 알아서 짐 정리해 주는 시스템도 깔아요.",
    finalConclusion: "쿠팡 5조원 투자 — 새벽배송 전국 95%",
    keyTerms: [
      { term: "풀필먼트", explanation: "주문~포장~배송까지 통합 처리하는 물류 모델이에요." },
    ],
  },
  {
    id: 6009,
    section: "IT",
    hoursAgo: 90,
    publisher: "테크크런치(번역)",
    title: "엔비디아 'AI 슈퍼칩' B300 공개… 성능 30% 향상",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=IT",
    content:
      "<p>엔비디아가 차세대 AI 가속기 B300 을 공개했다. 전작 대비 성능 30% 향상.</p>",
    titleTheme: "엔비디아 B300",
    summary:
      "엔비디아가 새 AI 가속기 B300 을 공개했어요. 전작보다 성능이 30% 좋아졌어요. 첫 고객은 OpenAI·구글·아마존이에요. 본격 출하는 4분기예요.",
    easyExplanation:
      "AI 학습용 \"슈퍼칩\" 신상이 나왔어요. 더 빨라졌고 큰 회사들이 줄을 섰어요.",
    finalConclusion: "엔비디아 B300 공개 — 전작 대비 30% ↑",
    keyTerms: [
      { term: "AI 가속기", explanation: "AI 학습·추론에 최적화된 전용 칩이에요." },
    ],
  },
  {
    id: 6010,
    section: "IT",
    hoursAgo: 130,
    publisher: "한겨레",
    title: "정부 \"AI 기본법\" 7월 시행… 고위험 AI 사전 등록 의무",
    thumbnail: null,
    content:
      "<p>AI 기본법이 7월 1일 시행된다. 고위험 AI 시스템은 사전 등록과 영향 평가가 의무화된다.</p>",
    titleTheme: "AI 기본법 시행",
    summary:
      "한국 AI 기본법이 7월 1일부터 시행돼요. 의료·금융·채용 등 고위험 분야 AI 는 사전 등록·검증이 의무예요. 어기면 매출 3% 까지 과징금이에요.",
    easyExplanation:
      "AI 도 이제 정부에 \"우리 이런 거 만들었어요\" 라고 신고해야 해요. 특히 의료나 채용 결정 같은 데 쓰는 AI 는 더 엄격해요.",
    finalConclusion: "AI 기본법 7/1 시행 — 고위험 AI 사전 등록",
    keyTerms: [
      { term: "고위험 AI", explanation: "건강·재산·기본권에 큰 영향 미치는 AI 시스템이에요." },
    ],
  },

  // ─── GLOBAL_MARKET (10) ───────────────────────────
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
      "엔비디아가 \"이번 분기에 우리 칩 더 많이 팔릴 것 같아\" 라고 발표하니까 주가가 즉시 6% 올랐어요. AI 시장이 여전히 뜨겁다는 신호예요.",
    finalConclusion: "엔비디아 매출 상향 — AI 칩 수요 여전히 뜨거워요",
    keyTerms: [
      { term: "가이던스", explanation: "회사가 예상하는 다음 분기 실적치예요." },
      { term: "시간외 거래", explanation: "정규장 끝난 뒤에도 일정 시간 매매 가능한 거래예요." },
    ],
  },
  {
    id: 7002,
    section: "GLOBAL_MARKET",
    hoursAgo: 13,
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
  {
    id: 7003,
    section: "GLOBAL_MARKET",
    hoursAgo: 20,
    publisher: "블룸버그(번역)",
    title: "애플 분기 실적 발표… 매출 1000억 달러 첫 돌파",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=GMKT",
    content:
      "<p>애플이 회계연도 2분기 매출 1000억 달러를 처음으로 돌파했다.</p>",
    titleTheme: "애플 매출 1000억$",
    summary:
      "애플 분기 매출이 처음으로 1000억 달러를 넘었어요. 서비스 부문이 28% 성장하며 견인했어요. 다만 중국 매출은 예상보다 부진했어요.",
    easyExplanation:
      "애플이 한 분기에 130조 원어치를 팔았어요. 아이폰뿐만 아니라 앱스토어·아이클라우드 같은 구독 서비스가 효자 노릇을 했어요.",
    finalConclusion: "애플 매출 1000억$ 첫 돌파 — 서비스 견인",
    keyTerms: [],
  },
  {
    id: 7004,
    section: "GLOBAL_MARKET",
    hoursAgo: 30,
    publisher: "로이터(번역)",
    title: "마이크로소프트 클라우드 매출 35% 급성장… AI 효과",
    thumbnail: null,
    content:
      "<p>마이크로소프트 분기 클라우드 매출이 35% 성장하며 AI 수요 효과를 입증했다.</p>",
    titleTheme: "MS 클라우드 ↑",
    summary:
      "마이크로소프트 클라우드 \"애저\" 매출이 35% 성장했어요. AI 워크로드 폭증이 원인이에요. 시간외 주가도 5% 올랐어요.",
    easyExplanation:
      "마이크로소프트가 빌려주는 컴퓨터 서버를 빌리는 회사가 엄청 늘었어요. 다들 AI 만드느라 컴퓨팅 파워가 필요해서요.",
    finalConclusion: "MS 클라우드 35% ↑ — AI 수요 폭증",
    keyTerms: [
      { term: "클라우드", explanation: "인터넷으로 빌려 쓰는 컴퓨터 자원이에요." },
    ],
  },
  {
    id: 7005,
    section: "GLOBAL_MARKET",
    hoursAgo: 42,
    publisher: "WSJ(번역)",
    title: "아마존, AWS 매출 사상 최대… 영업이익 50% 성장",
    thumbnail: null,
    content:
      "<p>아마존 클라우드 부문 AWS 매출이 사상 최대를 기록하며 영업이익이 50% 성장했다.</p>",
    titleTheme: "아마존 AWS 사상 최대",
    summary:
      "아마존 AWS 매출이 사상 최대를 기록했어요. 영업이익은 50% 성장했어요. AI 추론 서비스 수요가 핵심 동력이에요.",
    easyExplanation:
      "아마존의 컴퓨터 빌려주는 사업 \"AWS\" 가 역대 가장 잘 됐어요. AI 만들 때 다 여기 와서 빌려 쓰니까요.",
    finalConclusion: "아마존 AWS 매출 사상 최대 — 영업이익 50% ↑",
    keyTerms: [
      { term: "AWS", explanation: "Amazon Web Services. 세계 1위 클라우드 서비스예요." },
    ],
  },
  {
    id: 7006,
    section: "GLOBAL_MARKET",
    hoursAgo: 56,
    publisher: "한경 글로벌마켓",
    title: "메타 광고 매출 22% 성장… 인스타 릴스 효과",
    thumbnail: null,
    content:
      "<p>메타 광고 매출이 22% 성장했다. 인스타그램 릴스 시청 시간 증가가 견인했다.</p>",
    titleTheme: "메타 광고 ↑",
    summary:
      "메타(페북·인스타) 광고 매출이 22% 성장했어요. 인스타 릴스 시청 시간이 50% 늘어난 게 결정적이었어요. 시간외 주가도 4% 올랐어요.",
    easyExplanation:
      "인스타그램 짧은 영상 \"릴스\" 보는 사람이 늘면서 거기 붙는 광고도 잘 팔렸어요. 그게 회사 매출을 끌어올렸어요.",
    finalConclusion: "메타 광고 22% ↑ — 인스타 릴스 견인",
    keyTerms: [],
  },
  {
    id: 7007,
    section: "GLOBAL_MARKET",
    hoursAgo: 70,
    publisher: "블룸버그(번역)",
    title: "美 10년물 국채 금리 4.4% 하회… 6개월 만의 저점",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=GMKT",
    content:
      "<p>미 10년물 국채 금리가 4.4%를 하회하며 6개월 만의 저점을 기록했다.</p>",
    titleTheme: "美 국채 금리 ↓",
    summary:
      "미국 10년물 국채 금리가 4.4% 아래로 떨어졌어요. 6개월 만의 저점이에요. 인플레 둔화 + 9월 인하 기대가 원인이에요.",
    easyExplanation:
      "미국 정부가 빌리는 돈의 이자율이 떨어지고 있어요. 인플레가 잡히고 있고 곧 미국 기준금리도 내려갈 거란 신호예요.",
    finalConclusion: "美 10년물 4.4% 하회 — 6개월 저점",
    keyTerms: [
      { term: "10년물 국채 금리", explanation: "미국 정부가 10년 빌릴 때 이자율. 글로벌 금리의 기준이에요." },
    ],
  },
  {
    id: 7008,
    section: "GLOBAL_MARKET",
    hoursAgo: 88,
    publisher: "교도통신(번역)",
    title: "닛케이지수 4만 돌파… 사상 최고치 경신",
    thumbnail: null,
    content:
      "<p>닛케이225 지수가 장중 4만선을 돌파하며 사상 최고치를 새로 썼다.</p>",
    titleTheme: "닛케이 4만 돌파",
    summary:
      "일본 대표 주가지수 닛케이가 장중 4만 선을 넘어 사상 최고치를 새로 썼어요. 엔화 약세에 따른 수출 기업 호조가 동력이에요. 외국인 매수가 6주 연속 이어졌어요.",
    easyExplanation:
      "일본 주식 시장이 역사상 가장 높은 수준이에요. 엔화가 약해지면서 일본 수출 기업이 잘 팔고 있는 영향이에요.",
    finalConclusion: "닛케이 4만 돌파 — 사상 최고치",
    keyTerms: [
      { term: "닛케이225", explanation: "일본 대표 225개 종목 주가지수예요." },
    ],
  },
  {
    id: 7009,
    section: "GLOBAL_MARKET",
    hoursAgo: 110,
    publisher: "한경 글로벌마켓",
    title: "비트코인 7만 달러 회복… ETF 자금 6주 연속 유입",
    thumbnail: null,
    content:
      "<p>비트코인이 7만 달러를 회복했다. 현물 ETF 자금이 6주 연속 순유입했다.</p>",
    titleTheme: "비트코인 7만$ 회복",
    summary:
      "비트코인이 7만 달러를 다시 넘어섰어요. 미국 현물 ETF 에 6주 연속 자금이 유입된 게 동력이에요. 8월 반감기 기대도 한몫했어요.",
    easyExplanation:
      "가상화폐 비트코인 가격이 다시 올라가고 있어요. 미국에서 비트코인 펀드(ETF)에 돈이 계속 들어오고 있어요.",
    finalConclusion: "비트코인 7만$ 회복 — ETF 6주 연속 유입",
    keyTerms: [
      { term: "비트코인 ETF", explanation: "주식처럼 살 수 있는 비트코인 추종 펀드예요." },
      { term: "반감기", explanation: "약 4년마다 비트코인 채굴 보상이 절반으로 줄어드는 시점이에요." },
    ],
  },
  {
    id: 7010,
    section: "GLOBAL_MARKET",
    hoursAgo: 160,
    publisher: "로이터(번역)",
    title: "S&P500 5500 첫 돌파… 빅테크 5종목이 상승 견인",
    thumbnail: "https://placehold.co/200x200/e5e8eb/191f28.png?text=GMKT",
    content:
      "<p>S&P500 지수가 처음으로 5500을 돌파했다. 매그니피센트7 중 5개 종목이 상승을 견인했다.</p>",
    titleTheme: "S&P500 5500 돌파",
    summary:
      "미국 대표 주가지수 S&P500 이 처음으로 5500 을 넘었어요. 매그니피센트7 (애플·MS·구글·아마존·엔비디아·메타·테슬라) 중 5개가 상승을 견인했어요. 다만 PER 은 23배로 과열 우려도 있어요.",
    easyExplanation:
      "미국 주식 평균이 역대 가장 높아요. 빅테크 7개 회사가 시장을 이끌어요. 다만 가격이 너무 비싸졌다는 경고도 같이 나와요.",
    finalConclusion: "S&P500 5500 첫 돌파 — 빅테크 5종목 견인",
    keyTerms: [
      { term: "S&P500", explanation: "미국 대표 500개 종목 주가지수예요." },
      { term: "매그니피센트7", explanation: "미국 빅테크 7대 종목 (애플·MS·구글·아마존·엔비디아·메타·테슬라)이에요." },
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
      model: "mock-gpt-4o-mini",
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

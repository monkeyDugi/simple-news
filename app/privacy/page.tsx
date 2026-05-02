export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[640px] px-5 py-10 text-sm leading-relaxed text-gray-700">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">개인정보처리방침</h1>

      <p className="mb-6 text-gray-500">최종 수정일: 2026년 5월 2일</p>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-900">1. 수집하는 개인정보</h2>
        <p>
          Simple News는 회원가입, 로그인 등 별도의 사용자 계정 기능이 없으며, 이름·이메일·전화번호 등
          개인정보를 수집하지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-900">2. 인터넷 권한 사용 목적</h2>
        <p>
          앱은 뉴스 기사를 불러오기 위해 인터넷 연결 권한(INTERNET)만 사용합니다.
          사용자의 네트워크 활동이나 기기 정보는 수집·저장되지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-900">3. 제3자 제공</h2>
        <p>수집하는 개인정보가 없으므로 제3자에게 제공하는 정보도 없습니다.</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-900">4. 로컬 저장소</h2>
        <p>
          마지막으로 선택한 뉴스 섹션 등 앱 환경설정은 기기 내 로컬 저장소(localStorage)에만
          저장되며 외부로 전송되지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-900">5. 방침 변경</h2>
        <p>본 방침이 변경되는 경우 이 페이지를 통해 공지합니다.</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-900">6. 문의</h2>
        <p>
          개인정보 관련 문의:{" "}
          <a href="mailto:lbd4946@gmail.com" className="text-blue-600 underline">
            lbd4946@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}

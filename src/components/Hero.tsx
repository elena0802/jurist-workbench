import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="mb-4 text-sm font-medium tracking-widest text-accent uppercase">
          Korean Criminal Law · Exam Drafting
        </p>
        <h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">
          교육 자료와 쟁점을 선택하면,
          <br />
          <span className="text-accent">사례형 시험 초안</span>이 완성됩니다.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Jurist Workbench는 범용 AI 채팅이 아닙니다. Knowledge Base에서 선별한
          자료와 법적 쟁점을 바탕으로, 형사법 사례형 시험 초안을 생성하는 출제
          워크플로 도구입니다.
        </p>

        <blockquote className="mt-10 max-w-2xl border-l-2 border-accent pl-5">
          <p className="font-serif text-lg italic leading-relaxed text-ink">
            쟁점을 선택하는 것이 교수님의 실력입니다.
            <br />
            AI는 그 쟁점을 문제와 수업자료로 빠르게 전환합니다.
          </p>
        </blockquote>

        <div className="mt-10">
          <Link
            href="/workbench"
            className="rounded-sm bg-accent px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent-light"
          >
            출제 워크벤치 열기
          </Link>
        </div>
      </div>
    </section>
  );
}

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Link from "next/link";

const workflowSteps = [
  {
    step: "01",
    title: "Knowledge Base",
    sublabel: "지식 베이스",
    description:
      "변호사시험·사법시험 사례형, 판례, 논문, 강의노트 등 참고 자료를 컬렉션별로 편람합니다.",
  },
  {
    step: "02",
    title: "Issue Design",
    sublabel: "평가 쟁점 설계",
    description:
      "정당방위, 과잉방위, 오상방위 등 출제에 반영할 평가 쟁점을 설계합니다.",
  },
  {
    step: "03",
    title: "Draft",
    sublabel: "출제 초안",
    description:
      "사례형 문제, 출제의도, 쟁점 구조, 채점기준, 교수 검수 메모를 작성합니다.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header variant="landing" />
      <Hero />

      <section id="workflow" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium tracking-widest text-accent uppercase">
            Workflow
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">
            출제 워크플로
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {workflowSteps.map((item) => (
            <div
              key={item.step}
              className="academic-shadow rounded-sm border border-border bg-paper p-6"
            >
              <span className="font-serif text-2xl font-semibold text-accent-muted">
                {item.step}
              </span>
              <h3 className="mt-3 font-serif text-lg font-medium text-ink">
                {item.title}
              </h3>
              <p className="text-xs text-ink-faint">{item.sublabel}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <Link
          href="/workbench"
          className="inline-block rounded-sm bg-accent px-8 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent-light"
        >
          워크벤치 시작
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-ink-faint">
        Jurist Workbench · 형사법 출제 워크플로
      </footer>
    </div>
  );
}

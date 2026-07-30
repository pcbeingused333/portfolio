import Link from "next/link";
type Project = {
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  github?: string;
  demo?: string;
  link?: string;
  prs?: { label: string; url: string }[];
  contributions?: string;
  role: string;
};

const projects: Project[] = [
  {
    name: "RAG Chatbot",
    tagline: "An AI assistant that actually knows your documents.",
    description:
      "A production-ready Retrieval-Augmented Generation chatbot that lets businesses query their internal PDF documents in natural language. Returns answers with page-level source citations and supports real-time document upload.",
    stack: ["Python", "LangChain", "LangGraph", "Groq (Llama-3.3-70B)", "pgvector", "Streamlit", "Docker"],
    github: "https://github.com/pcbeingused333/rag-chatbot-portfolio",
    demo: "https://rag-chatbot-demo-0.streamlit.app",
    role: "Architecture, retrieval pipeline, agent design",
  },
  {
    name: "AI Website Chatbot Widget",
    tagline: "An embeddable assistant that answers for your business 24/7.",
    description:
      "A drop-in chat widget for small-business websites. It answers customer questions about the business — menu, hours, location, FAQs — grounded only in the business's own information, so it never makes things up. Reusable for any client by editing a single config file.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Groq (Llama-3.3-70B)", "Vercel"],
    github: "https://github.com/pcbeingused333/ai-chat-widget",
    demo: "https://ai-chat-widget-five-ashen.vercel.app",
    role: "Design, full build, deployment",
  },
  {
    name: "rubocop-rspec — open-source contribution",
    tagline: "A crash fix to a core gem of the RuboCop ecosystem.",
    description:
      "Fixed a crash in rubocop-rspec's `RSpec/LeadingSubject` cop, triggered by Ruby 3.4's implicit `it` block parameter under the Prism parser. The cop walked the AST looking only for `:block` ancestors, so it hit `nil` on the new `itblock`/`numblock` group nodes. I widened the ancestor lookup to `:any_block` and added a regression spec under a Ruby 3.4 context. Submitted upstream as a pull request.",
    stack: ["Ruby", "RuboCop", "AST", "RSpec", "Git", "Open source"],
    prs: [
      { label: "pr #2209", url: "https://github.com/rubocop/rubocop-rspec/pull/2209" },
    ],
    contributions: "https://github.com/rubocop/rubocop-rspec/pulls?q=is%3Apr+author%3Apcbeingused333",
    role: "Open-source contributor — crash fix and regression test",
  },
  {
    name: "Semantic Recommender",
    tagline: "Recommendations that learn from feedback.",
    description:
      "A recommendation engine built on vector embeddings and a feedback loop that improves results over time. Designed as a reusable backend for content platforms and e-commerce that have outgrown rule-based filters.",
    stack: ["Python", "Embeddings", "pgvector", "PostgreSQL", "Feedback loop"],
    github: "https://github.com/pcbeingused333/semantic-recommender",
    role: "End-to-end implementation",
  },
  {
    name: "Churreria Calderon",
    tagline: "A site for a family business.",
    description:
      "A clean, fast website I built for a family-run churreria in Toronto — menu, story and location — and a testbed for how far AI-assisted tooling can take a static marketing site.",
    stack: ["HTML", "CSS", "AI-assisted build"],
    role: "Design, build, content",
  },
];const services = [
  {
    title: "AI Assistants",
    body: "Custom chatbots and agents that work with your own documents, data and tools. Built on modern RAG architectures with proper retrieval, evaluation and guardrails.",
  },
  {
    title: "Web Development",
    body: "Fast, modern websites for small businesses, restaurants and service providers. Designed to convert, easy for you to update, and built on stacks you can actually maintain.",
  },
  {
    title: "Restaurant and Hospitality Tech",
    body: "I've run a restaurant myself, so I know which problems are worth solving with software and which are not. Reservations, menus, internal automations, customer follow-up.",
  },
];
export default function Home() {
  return (
    <main className="grain min-h-screen relative">
      <nav className="max-w-5xl mx-auto px-6 md:px-10 pt-8 md:pt-12 flex items-center justify-between text-sm">
        <span className="font-mono text-stone-500 tracking-tight">acg / 2026</span>
        <div className="flex gap-6 text-stone-600">
          <a href="#work" className="hover:text-stone-900 transition-colors">work</a>
          <a href="#about" className="hover:text-stone-900 transition-colors">about</a>
          <a href="#contact" className="hover:text-stone-900 transition-colors">contact</a>
        </div>
      </nav>
      <section className="max-w-5xl mx-auto px-6 md:px-10 pt-24 md:pt-40 pb-24 md:pb-32">
        <p className="font-mono text-xs uppercase tracking-widest text-orange-700 mb-6">
          Toronto, Canada &mdash; Available for projects
        </p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight">
          I build <em className="italic text-orange-800">AI tools</em> and
          <br />
          websites for <em className="italic text-orange-800">small businesses</em>.
        </h1>
        <p className="mt-10 md:mt-12 text-lg md:text-xl text-stone-600 max-w-2xl leading-relaxed">
          I am Alex, a fullstack developer who has also run a small restaurant in Toronto.
          That combination lets me build software that actually understands how a small business runs day-to-day.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <a href="#work" className="inline-flex items-center justify-center px-6 py-3 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-orange-800 transition-colors">
            See my work
          </a>
          <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 border border-stone-300 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors">
            Get in touch
          </a>
        </div>
      </section>
      <section id="about" className="border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-[1fr_2fr] gap-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-500">01</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-3 leading-tight">About</h2>
          </div>
          <div className="space-y-6 text-stone-700 text-lg leading-relaxed">
            <p>
              I started programming on my own, then went through Le Wagon&apos;s fullstack bootcamp, did a three-month internship at <strong className="font-medium">Oesia</strong> building an internal document-management system, and spent some time teaching Ruby to other students.
            </p>
            <p>
              I also ran <strong className="font-medium">Churreria Calderon</strong>, a small family restaurant in Toronto — which gave me a first-hand feel for how small businesses actually operate. Most of my recent work is around <strong className="font-medium">AI agents and RAG systems</strong>, the kind of tools small businesses now have access to but rarely know how to deploy.
            </p>
            <p>
              I am comfortable across the stack: Python, JavaScript, TypeScript, Ruby on Rails, PostgreSQL, Docker, and the modern AI tooling layer. I care about software that ships and survives contact with real users.
            </p>
          </div>
        </div>
      </section>
      <section id="work" className="border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500">02</p>
              <h2 className="font-serif text-3xl md:text-4xl mt-3 leading-tight">Selected work</h2>
            </div>
            <p className="text-stone-600 text-lg leading-relaxed self-end">
              A few recent projects across AI, open source and the web. Repos are public, feel free to look at the code.
            </p>
          </div>
          <div className="space-y-px bg-stone-200">
            {projects.map((p, idx) => (
              <article key={p.name} className="bg-stone-50 hover:bg-white transition-colors py-10 md:py-14 px-6 md:px-10 grid md:grid-cols-[80px_1fr_auto] gap-6 md:gap-10 items-start group">
                <span className="font-mono text-xs text-stone-400 mt-2">0{idx + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl leading-tight">
                    {p.name}
                    <span className="block text-stone-500 italic text-lg md:text-xl mt-1">{p.tagline}</span>
                  </h3>
                  <p className="mt-5 text-stone-700 leading-relaxed max-w-2xl">{p.description}</p>
                  <p className="mt-4 text-sm text-stone-500">
                    <span className="font-mono uppercase tracking-wider text-xs">Role: </span>
                    {p.role}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.stack.map((tech) => (
                      <span key={tech} className="text-xs font-mono px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-full text-stone-700">{tech}</span>
                    ))}
                  </div>
                </div>
                <div className="flex md:flex-col gap-3 text-sm md:items-end">
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 bg-orange-800 text-stone-50 rounded-full hover:bg-orange-900 transition-colors whitespace-nowrap">● live demo</a>
                  )}
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider text-stone-600 hover:text-orange-800 transition-colors whitespace-nowrap">github</a>
                  )}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider text-stone-600 hover:text-orange-800 transition-colors whitespace-nowrap">live site</a>
                  )}
                  {p.prs?.map((pr) => (
                    <a key={pr.url} href={pr.url} target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider text-stone-600 hover:text-orange-800 transition-colors whitespace-nowrap">{pr.label}</a>
                  ))}
                  {p.contributions && (
                    <a href={p.contributions} target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider text-stone-600 hover:text-orange-800 transition-colors whitespace-nowrap">all contributions</a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-stone-200 bg-stone-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500">03</p>
              <h2 className="font-serif text-3xl md:text-4xl mt-3 leading-tight">What I do</h2>
            </div>
            <p className="text-stone-600 text-lg leading-relaxed self-end">
              I take on a small number of part-time engagements at a time. Open to one-off projects and ongoing collaborations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white border border-stone-200 p-8 hover:border-orange-300 transition-colors">
                <h3 className="font-serif text-2xl leading-tight">{s.title}</h3>
                <p className="mt-4 text-stone-600 text-[15px] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" className="border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500">04</p>
              <h2 className="font-serif text-3xl md:text-4xl mt-3 leading-tight">Get in touch</h2>
            </div>
            <div>
              <p className="text-stone-700 text-lg leading-relaxed mb-12">
                Working on something where AI, automation or a small custom web app would help?
                Send me a short note, I usually reply within a day.
              </p>
              <div className="space-y-px bg-stone-200">
                <ContactRow label="Email" value="alex.castillog33@gmail.com" href="mailto:alex.castillog33@gmail.com" />
                <ContactRow label="LinkedIn" value="alex-castillo-gonzalez" href="https://www.linkedin.com/in/alex-castillo-gonzalez-65a13110a/" />
                <ContactRow label="GitHub" value="pcbeingused333" href="https://github.com/pcbeingused333" />
                <ContactRow label="Based in" value="Toronto, Canada" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs font-mono text-stone-500">
          <span>2026 Alex Castillo Gonzalez</span>
          <span>Built with Next.js and Tailwind.</span>
        </div>
      </footer>
    </main>
  );
}
function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="bg-stone-50 hover:bg-white transition-colors px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 group">
      <span className="font-mono text-xs uppercase tracking-widest text-stone-500">{label}</span>
      <span className="font-serif text-lg md:text-xl">{value}</span>
    </div>
  );
  return href ? (
    <Link href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {content}
    </Link>
  ) : (
    content
  );
}

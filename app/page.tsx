import Link from "next/link";

type Project = {
  name: string;
  tagline: string;
  description: string;
  highlight?: string;
  stack: string[];
  github?: string;
  demo?: string;
  link?: string;
  role: string;
};

const projects: Project[] = [
  {
    name: "Business Ops Agent",
    tagline: "An agent that can only act through a protocol, and a harness that scores how it acts.",
    description:
      "An MCP server exposing a small business's operations — catalog, booking capacity, stock, catering quotes, orders — as tools any MCP client can call: Claude Desktop, Cursor, or the LangGraph agent that ships with it. The agent holds no business rules; it does not know the catering minimum, because the quoting tool tells it. Add a tool to the server and the agent can use it with no change on the agent side. It runs on AWS Lambda behind a public Function URL, backed by DynamoDB, with the infrastructure in Terraform and a deploy on every push to main.",
    highlight:
      "The evaluation scores the trajectory, not the answer — which tools were called, in what order, with what arguments, and whether every figure in the reply traces back to a tool result. That last check needs no judge model: pull the numbers out of the answer and confirm they appear in something a tool returned. It stays correct when an invented number happens to be right, because the question is whether the agent looked it up. It caught the agent claiming \"I don't have that information\" with zero tool calls, and caught it intermittently — the same case passed the run before, which is why the harness can repeat a scenario. Worth saying plainly: my scorer was wrong four times before it was right, and the first draft blamed the agent for its own bugs.",
    stack: ["Python", "MCP", "LangGraph", "Groq", "AWS Lambda", "DynamoDB", "Terraform", "Docker", "GitHub Actions", "Streamlit", "pytest"],
    github: "https://github.com/pcbeingused333/mcp-business-agent",
    demo: "https://mcp-business-agent-8wawhyaqt2flfixqj8dpnk.streamlit.app",
    role: "Protocol server, agent, evaluation harness, deployment",
  },
  {
    name: "Ask the GDPR",
    tagline: "Answers over regulation, citing the provision — not the page.",
    description:
      "A Retrieval-Augmented Generation assistant over the full text of the GDPR. Legal text imposes a constraint generic RAG ignores: nobody looks up page 14 of a regulation, they look up Article 17(1), and the page a provision lands on is an artefact of typesetting. So the corpus is not a PDF — a builder parses the Official Journal text from EUR-Lex into 414 provisions that carry their article, paragraph and chapter as metadata, and those travel with every chunk into the vector store. Ships in two modes behind one flag: an in-memory FAISS demo on a free 1 GB container with no database, and a pgvector-backed production path.",
    highlight:
      "An assistant over legal text fails in an unusual direction. A miss announces itself — the user reads a vague answer and goes to the source. An invention is fluent, confident, and indistinguishable from a correct answer; attach a citation the model reasoned its way to rather than read, and it becomes more convincing, not less. So the harness measures refusal, not just recall: seven questions the Regulation does not answer but every model has read about — adequacy decisions by country, the wording of the standard contractual clauses, Schrems II, a CCPA penalty. Retrieval is scored on the cited provision rather than on matching text, which is stricter and removes the chunk-boundary false misses the old substring ground truth suffered. The measured failure is specific and worth naming: the right article, the wrong paragraph. Asked which administrative fine is the maximum, retrieval surfaces Article 83(4) first — the lower tier — with 83(5) third. The answer comes out grounded, because the agent reads all four passages, and the citation shown beside it is still the wrong paragraph, which is the exact failure the project exists to prevent. Sibling paragraphs share vocabulary and sit close together in embedding space, so a bi-encoder blurs the difference between a 10 million ceiling and a 20 million one; reranking is the next move.",
    stack: ["Python", "LangChain", "LangGraph", "Groq", "FAISS", "pgvector", "Evals", "Streamlit", "Docker", "GitHub Actions", "pytest"],
    github: "https://github.com/pcbeingused333/rag-chatbot-portfolio",
    demo: "https://rag-chatbot-demo-0.streamlit.app",
    role: "Corpus construction, retrieval pipeline, evaluation, deployment",
  },
  {
    name: "AI Website Chatbot Widget",
    tagline: "An embeddable assistant that answers for a business 24/7.",
    description:
      "A drop-in chat widget for small-business websites. It answers customer questions — menu, hours, location, FAQs — grounded only in the business's own information, so it does not invent details. Reusable for any client by editing a single config file.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Groq", "Vercel"],
    github: "https://github.com/pcbeingused333/ai-chat-widget",
    demo: "https://ai-chat-widget-five-ashen.vercel.app",
    role: "Design, full build, deployment",
  },
  {
    name: "Semantic Recommender",
    tagline: "Recommendations from embeddings, not hand-written rules.",
    description:
      "A recommendation engine built on vector embeddings with a feedback loop that refines results over time. Designed as a reusable backend for content platforms and e-commerce that have outgrown rule-based filters.",
    stack: ["Python", "Embeddings", "pgvector", "PostgreSQL"],
    github: "https://github.com/pcbeingused333/semantic-recommender",
    role: "End-to-end implementation",
  },
];

type Contribution = {
  repo: string;
  url: string;
  stars: string;
  what: string;
  status: "merged" | "open";
};

const contributions: Contribution[] = [
  {
    repo: "pyfenn/fenn",
    url: "https://github.com/pyfenn/fenn/pull/277",
    stars: "Python framework for ML workflows and LLM agents",
    what:
      "Added .docx support to the RAG document loader, so the framework ingests Word documents alongside PDFs and text.",
    status: "merged",
  },
  {
    repo: "pyfenn/fenn",
    url: "https://github.com/pyfenn/fenn/pull/286",
    stars: "Python framework for ML workflows and LLM agents",
    what:
      "Corrected the RAG optional-dependency install instructions, which pointed at a package name that does not exist.",
    status: "merged",
  },
  {
    repo: "rubocop/rubocop-rspec",
    url: "https://github.com/rubocop/rubocop-rspec/pull/2209",
    stars: "the standard RSpec linter",
    what:
      "Fixed a crash in RSpec/LeadingSubject on Ruby 3.4's implicit `it` block parameter: the cop only walked `:block` AST ancestors and hit nil on the new itblock/numblock nodes. Widened the lookup to `:any_block`, with a regression spec.",
    status: "open",
  },
  {
    repo: "rubocop/rubocop-performance",
    url: "https://github.com/rubocop/rubocop-performance/pull/529",
    stars: "performance cops for Ruby",
    what:
      "Fixed Performance/ConstantRegexp emitting invalid code when autocorrecting a regexp used as a pattern in case/in pattern matching.",
    status: "open",
  },
  {
    repo: "Rails-Designer/courrier",
    url: "https://github.com/Rails-Designer/courrier/pulls?q=is%3Apr+author%3Apcbeingused333",
    stars: "API-powered email delivery for Ruby apps",
    what:
      "Four PRs: MailerSend, Mailtrap and SMTP.com provider integrations, plus a NameError fix affecting Mailgun and Mailjet on Ruby 3.4.",
    status: "open",
  },
];

export default function Home() {
  return (
    <main className="grain min-h-screen relative">
      <nav className="max-w-5xl mx-auto px-6 md:px-10 pt-8 md:pt-12 flex items-center justify-between text-sm">
        <span className="font-mono text-stone-500 tracking-tight">acg / 2026</span>
        <div className="flex gap-6 text-stone-600">
          <a href="#work" className="hover:text-stone-900 transition-colors">work</a>
          <a href="#open-source" className="hover:text-stone-900 transition-colors">open source</a>
          <a href="#about" className="hover:text-stone-900 transition-colors">about</a>
          <a href="#contact" className="hover:text-stone-900 transition-colors">contact</a>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 md:px-10 pt-24 md:pt-40 pb-24 md:pb-32">
        <p className="font-mono text-xs uppercase tracking-widest text-orange-700 mb-6">
          Remote &mdash; UTC&minus;4 &mdash; Open to full-time roles
        </p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight">
          I ship <em className="italic text-orange-800">LLM features</em>
          <br />
          you can trust in <em className="italic text-orange-800">production</em>.
        </h1>
        <p className="mt-10 md:mt-12 text-lg md:text-xl text-stone-600 max-w-2xl leading-relaxed">
          I am Alex, an applied AI engineer working in Python. Retrieval, agents and the
          unglamorous part that decides whether any of it survives real users: evaluation,
          failure handling, and knowing which numbers actually moved.
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

      <section id="work" className="border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500">01</p>
              <h2 className="font-serif text-3xl md:text-4xl mt-3 leading-tight">Selected work</h2>
            </div>
            <p className="text-stone-600 text-lg leading-relaxed self-end">
              Every repo is public and every demo is one click, no signup. Read the code.
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
                  {p.highlight && (
                    <p className="mt-5 border-l-2 border-orange-300 pl-5 text-stone-600 leading-relaxed max-w-2xl text-[15px]">
                      {p.highlight}
                    </p>
                  )}
                  <p className="mt-5 text-sm text-stone-500">
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="open-source" className="border-t border-stone-200 bg-stone-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500">02</p>
              <h2 className="font-serif text-3xl md:text-4xl mt-3 leading-tight">Open source</h2>
            </div>
            <p className="text-stone-600 text-lg leading-relaxed self-end">
              Work on other people&apos;s codebases, reviewed by their maintainers. Status is
              shown as it actually stands.
            </p>
          </div>
          <div className="space-y-px bg-stone-200">
            {contributions.map((c) => (
              <article key={c.url} className="bg-white py-8 px-6 md:px-10 grid md:grid-cols-[1fr_auto] gap-4 md:gap-10 items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-mono text-sm text-stone-900">{c.repo}</h3>
                    <span
                      className={
                        c.status === "merged"
                          ? "font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-800 text-stone-50"
                          : "font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-stone-300 text-stone-500"
                      }
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500 italic">{c.stars}</p>
                  <p className="mt-3 text-stone-700 leading-relaxed max-w-2xl text-[15px]">{c.what}</p>
                </div>
                <a href={c.url} target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider text-stone-600 hover:text-orange-800 transition-colors whitespace-nowrap">
                  view pr
                </a>
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-stone-500">
            <a href="https://github.com/pulls?q=is%3Apr+author%3Apcbeingused333" target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider hover:text-orange-800 transition-colors">
              all contributions &rarr;
            </a>
          </p>
        </div>
      </section>

      <section id="about" className="border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-[1fr_2fr] gap-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-500">03</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-3 leading-tight">About</h2>
          </div>
          <div className="space-y-6 text-stone-700 text-lg leading-relaxed">
            <p>
              I started programming on my own, then went through Le Wagon&apos;s fullstack
              bootcamp, did a three-month internship at <strong className="font-medium">Oesia</strong> building
              an internal document-management system, and spent some time teaching Ruby to
              other students.
            </p>
            <p>
              I also built and shipped the website and an AI chat widget for{" "}
              <a href="https://www.churreriacalderon.com" target="_blank" rel="noreferrer" className="underline decoration-stone-300 underline-offset-4 hover:decoration-orange-700">
                Churrer&iacute;a Calder&oacute;n
              </a>
              , my family&apos;s business in Toronto, from 2025 until it closed in 2026.
              Running software for a business you also have to run teaches you which problems
              are worth solving and which are not.
            </p>
            <p>
              Most of my recent work is <strong className="font-medium">RAG and agent systems in Python</strong>,
              and increasingly the layer around them: evaluation, tracing, and the failure
              handling that separates a demo from something you can leave running. I write
              with AI tooling daily and treat its output the way I treat my own &mdash; measured,
              not assumed.
            </p>
            <p>
              I work fully remote on <strong className="font-medium">UTC&minus;4</strong>, overlapping with
              North American hours. Toronto now, Santo Domingo from late 2026. Spanish native,
              professional English.
            </p>
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
                I am looking for a full-time remote engineering role building with LLMs.
                If that is what you are hiring for, send me a short note &mdash; I usually reply
                within a day.
              </p>
              <div className="space-y-px bg-stone-200">
                <ContactRow label="Email" value="alex.castillog33@gmail.com" href="mailto:alex.castillog33@gmail.com" />
                <ContactRow label="LinkedIn" value="alex-castillo-gonzalez" href="https://www.linkedin.com/in/alex-castillo-gonzalez-65a13110a/" />
                <ContactRow label="GitHub" value="pcbeingused333" href="https://github.com/pcbeingused333" />
                <ContactRow label="CV" value="github.com/pcbeingused333/cv" href="https://github.com/pcbeingused333/cv" />
                <ContactRow label="Working from" value="Remote — UTC−4" />
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

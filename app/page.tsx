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
    name: "ragcite",
    tagline: "The measurement layer of the two projects above, extracted into a library.",
    description:
      "Retrieval metrics, citation grounding, abstention scoring and tool-trajectory scoring, generalized out of the two harnesses above into a standalone package. It imports no LangChain, no vector store and no LLM client: you bring the retriever and, for abstention, the judge, and ragcite scores what they return. That constraint is the design — an eval library that owns your retrieval stack can only measure the stack it owns. Retrieval and grounding need no model at all, so they are deterministic and free to run on every commit, and a --min-hit-at-1 flag turns a run into a CI gate that exits non-zero on a regression. Without a threshold flag it always exits 0: a report, not a gate, by default.",
    highlight:
      "The claim worth checking is that it was extracted from a production harness rather than written to look like one, so the example asserts it. It builds one FAISS index over the real GDPR corpus and scores the same 25 questions twice — once through ragcite, once through the original project's own independent metrics code — and exits non-zero if the two disagree. Sharing the index is the point: any difference can then only come from the scoring rule. They match exactly, hit@1 13/25, recall@k 17/25, MRR 0.59, which are the numbers that project prints for itself. It also refuses to run when the judge model and the model under test are the same, because that is a mistake I made and shipped: my own harness spent weeks marking a model as its own examiner before I noticed.",
    stack: ["Python", "Evals", "CLI", "pytest", "GitHub Actions"],
    github: "https://github.com/pcbeingused333/ragcite",
    role: "Library, CLI, evaluation design",
  },
  {
    name: "Weather-Aware Truck Routing",
    tagline: "The safest truck route, judged by the forecast for the hour the truck reaches each point.",
    description:
      "A React + Django app built as a full-stack take-home. It asks Valhalla for three truck routes with the real gross weight, so roads with weight limits are respected, samples each route every 10, 25 or 50 miles, and gives every checkpoint an ETA from the router's own maneuver timings. Each checkpoint reads the hourly wind, rain and snow forecast for that ETA and gets a risk level from the brief's thresholds plus load rules: strong wind with a heavy load becomes Severe or No Travel. Routes are ranked by No Travel, Severe and High miles, then average risk, then travel time, and the map colours the chosen route by risk next to a 0–48 h forecast heatmap of the corridor.",
    highlight:
      "Most of the judgment went into edge cases the brief left open. Its ranges share endpoints, so a value on a boundary goes to the higher band, because this is a safety tool; a stretch between two checkpoints takes the worse of the two, since over-counting dangerous miles is safer than under-counting them. The free services pushed back too: Open-Meteo rate-limits the shared IP of a free Render instance, so on a 429 the backend asks the browser to fetch the forecast points itself and send them back, and the ranking still runs on the server. The rules are pure functions with table-driven tests.",
    stack: ["React", "TypeScript", "MapLibre GL", "Django", "Python", "Valhalla", "Open-Meteo", "Render", "GitHub Actions", "pytest"],
    github: "https://github.com/pcbeingused333/weather-truck-routing",
    demo: "https://weather-truck-routing-p4iz.onrender.com",
    role: "Design, full build, deployment",
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

type Theme = {
  title: string;
  count: string;
  what: string;
  examples: { label: string; url: string }[];
};

const ossStats = [
  { value: "209", label: "merged pull requests" },
  { value: "75", label: "projects" },
  { value: "84%", label: "of decided PRs merged" },
  { value: "11 h", label: "median time to merge" },
];

type CaseStudy = {
  project: string;
  title: string;
  bug: string;
  cause: string;
  fix: string;
  impact: string;
  links: { label: string; url: string }[];
};

const caseStudies: CaseStudy[] = [
  {
    project: "LiteLLM",
    title: "Streamed calls billed differently from non-streamed ones",
    bug: "A streamed Vertex AI pass-through call cost less than the same call non-streamed.",
    cause: "The stream builder priced the call without its location, so regional endpoints missed their 10% uplift and custom-priced deployments fell back to list price.",
    fix: "The logger prices both modes, including streams cut off midway, with the deployment's location.",
    impact: "Spend tracking in a 61k★ proxy now matches across streaming and non-streaming.",
    links: [{ label: "litellm #44795", url: "https://github.com/BerriAI/litellm/pull/44795" }],
  },
  {
    project: "LLM Tornado",
    title: "Three parallel tool calls executed six times",
    bug: "With Anthropic streaming and Microsoft.Extensions.AI, each parallel tool ran more than once and the follow-up request was rejected.",
    cause: "Every content_block_stop re-yielded all tool calls seen so far (1, then 1+2, then 1+2+3), and the tool-invocation middleware acted on each.",
    fix: "Yield the calls once, at the end of the stream, with the final usage.",
    impact: "Merged the same day; 13 merged in the repo, including streamed input and cache token counts.",
    links: [
      { label: "#205", url: "https://github.com/lofcz/LLMTornado/pull/205" },
      { label: "#214", url: "https://github.com/lofcz/LLMTornado/pull/214" },
    ],
  },
  {
    project: "Haystack (deepset)",
    title: "Async paths that drifted from the sync ones",
    bug: "50 expanded queries meant 50 concurrent embedding calls whatever the limit; an asyncio.Lock was shared across event loops.",
    cause: "run_async re-implemented run without its guards, and the test suites only called run.",
    fix: "Restore the limits and per-loop locks, with async tests.",
    impact: "12 merged across Haystack and its integrations.",
    links: [
      { label: "haystack #12662", url: "https://github.com/deepset-ai/haystack/pull/12662" },
      { label: "integrations #3790", url: "https://github.com/deepset-ai/haystack-core-integrations/pull/3790" },
    ],
  },
  {
    project: "LangChain.rb",
    title: "The provider and tool-calling layer",
    bug: "tool_choice sent in the wrong shape per API, an agent loop that could never stop calling a forced tool, streamed tool calls lost on Ollama, thinking blocks dropped from the tool-use loop.",
    cause: "Six provider adapters, each translating tool calls its own way.",
    fix: "One adapter at a time across Anthropic, OpenAI, Gemini, Ollama, Cohere and Mistral.",
    impact: "30 merged, most the same day.",
    links: [{ label: "all 30", url: "https://github.com/patterns-ai-core/langchainrb/pulls?q=is%3Apr+author%3Apcbeingused333+is%3Amerged" }],
  },
  {
    project: "AgentScope-Java · go-micro",
    title: "Default models that stop working on a date",
    bug: "SDKs defaulting to Claude models that Anthropic retires, or already had.",
    cause: "Hard-coded model IDs, and in AgentScope a context-window table with no Claude 5 entry, so the obvious one-line swap would have resolved the window to 0.",
    fix: "New default plus the missing table entry, with a test that fails on the old one.",
    impact: "Merged the same day in both.",
    links: [
      { label: "agentscope-java #3670", url: "https://github.com/agentscope-ai/agentscope-java/pull/3670" },
      { label: "go-micro #5011", url: "https://github.com/micro/go-micro/pull/5011" },
    ],
  },
];

const themes: Theme[] = [
  {
    title: "When the LLM provider changes, the code built on it breaks",
    count: "~12 projects · median ~8 hours to merge",
    what:
      "Claude 5 and the 1.x Anthropic SDK broke the same few assumptions across about a dozen projects: reading a reply as content[0].text when the first block is now a thinking block, sending a temperature or a forced tool_choice that current models reject with a 400, calling the removed Text Completions API, and model catalogs that did not recognise new or Bedrock model IDs. These merged fastest of anything I sent, because users were hitting them that week.",
    examples: [
      { label: "WeKnora #4155", url: "https://github.com/Tencent/WeKnora/pull/4155" },
      { label: "hostedgpt #823", url: "https://github.com/AllYourBot/hostedgpt/pull/823" },
      { label: "TruLens #2948", url: "https://github.com/truera/trulens/pull/2948" },
      { label: "reward-bench #290", url: "https://github.com/allenai/reward-bench/pull/290" },
    ],
  },
  {
    title: "Async paths in Haystack that drifted from the sync ones",
    count: "12 merged in Haystack and its integrations",
    what:
      "run_async implementations that ran blocking work on the event loop, held an asyncio.Lock across event loops, ignored max_workers, skipped batching or re-wrapped errors the sync path re-raises. These bugs hide from test suites that only call run(). Four of the twelve came from auditing every component's __init__ against to_dict, where a setting silently reverted when a saved pipeline was reloaded.",
    examples: [
      { label: "integrations #3790", url: "https://github.com/deepset-ai/haystack-core-integrations/pull/3790" },
      { label: "haystack #12662", url: "https://github.com/deepset-ai/haystack/pull/12662" },
      { label: "integrations #3808", url: "https://github.com/deepset-ai/haystack-core-integrations/pull/3808" },
    ],
  },
  {
    title: "The provider and tool-calling layer of LangChain.rb",
    count: "30 merged, usually the same day",
    what:
      "Fixes across its Anthropic, OpenAI, Gemini, Ollama, Cohere and Mistral adapters: tool_choice sent in the shape each API expects, an agent loop that could never stop calling a forced tool, streamed tool calls lost on Ollama, thinking blocks dropped from the tool-use loop, a migration to the Cohere v2 API, and tool errors handed back to the LLM instead of ending the run.",
    examples: [
      { label: "#1063", url: "https://github.com/patterns-ai-core/langchainrb/pull/1063" },
      { label: "#1058", url: "https://github.com/patterns-ai-core/langchainrb/pull/1058" },
      { label: "all 30", url: "https://github.com/patterns-ai-core/langchainrb/pulls?q=is%3Apr+author%3Apcbeingused333+is%3Amerged" },
    ],
  },
  {
    title: "One rare but legitimate input that brings down the whole flow",
    count: "courrier 11 · perron 4 · icons 2 · LangChain.rb",
    what:
      "An empty choices list, a nil body, a division by zero, a bare % in an email layout — very often inside a rescue or except written to catch a different exception, so the guard was there and still missed. In the courrier mail gem this also meant three new providers and cc/bcc that six providers had been silently dropping.",
    examples: [
      { label: "courrier #62", url: "https://github.com/Rails-Designer/courrier/pull/62" },
      { label: "courrier #67", url: "https://github.com/Rails-Designer/courrier/pull/67" },
      { label: "perron #215", url: "https://github.com/Rails-Designer/perron/pull/215" },
    ],
  },
  {
    title: "Flows that break for real users of a Rails app",
    count: "13 merged in Sure (personal finance, 10k★)",
    what:
      "Sure is a full Rails product, not a library, so the bugs are the ones users click into: provider setup from Add Account that bounced back to Settings or hid its own error, buttons that sent the wrong HTTP method, \"Create a bill\" from a transaction rendering Content Missing, and merging a pending duplicate that threw away its attachments, tags and notes.",
    examples: [
      { label: "sure #4278", url: "https://github.com/we-promise/sure/pull/4278" },
      { label: "sure #4247", url: "https://github.com/we-promise/sure/pull/4247" },
      { label: "all 13", url: "https://github.com/we-promise/sure/pulls?q=is%3Apr+author%3Apcbeingused333+is%3Amerged" },
    ],
  },
  {
    title: "Evaluation metrics that return a wrong number without failing",
    count: "merged in Opik, Phoenix, pydantic-ai · open in llama-index, deepeval",
    what:
      "Retrieval metrics scoring above 1.0 on rankings with repeated ids, pass@k averaged as pass/fail, a Spearman correlation computed on rankings with duplicates, an eval case that could never fail, and a judge grading binary output it received as one decimal byte per line. The work closest to what I build, and the slowest to land: most of it is still in review.",
    examples: [
      { label: "opik #8276", url: "https://github.com/comet-ml/opik/pull/8276" },
      { label: "pydantic-ai #7927", url: "https://github.com/pydantic/pydantic-ai/issues/7927" },
      { label: "llama_index #22683", url: "https://github.com/run-llama/llama_index/pull/22683" },
    ],
  },
];

const lessons = [
  {
    title: "Depth beats spread",
    what: "Going back to a maintainer who already trusts the work pays more than a first PR somewhere new. LangChain.rb went from 6 merged to 30.",
  },
  {
    title: "Timing beats volume",
    what: "A fix for what a release broke this week merges in hours. The same quality of fix for a long-standing edge case can wait weeks.",
  },
  {
    title: "Make it cheap to review",
    what: "Small PRs, a regression test I have seen fail with the fix reverted, and the local run pasted in. Where CI does not run for forks, that pasted run is the only evidence a reviewer sees.",
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
          <Link href="/writing/to-dict-audit" className="hover:text-stone-900 transition-colors">writing</Link>
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
          I am Alex, an applied AI engineer working in Python. Most of my recent work is the
          integration layer between applications and LLM providers: streamed tool calls,
          token and cost accounting, and code that breaks when a provider changes or retires a
          model. I fix it upstream, in the SDKs themselves, and I build retrieval and agent
          systems with the evaluation that decides whether they survive real users.
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
              Fixes to other people&apos;s codebases, reviewed by their maintainers, mostly in the
              layer between applications and LLM providers. Each ships a regression test that
              fails without the fix. Five case studies first, then the six patterns the work
              falls into.
            </p>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-200 mb-px">
            {ossStats.map((st) => (
              <div key={st.label} className="bg-white px-6 py-6">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-stone-500">{st.label}</dt>
                <dd className="font-serif text-3xl md:text-4xl mt-2 text-orange-800">{st.value}</dd>
              </div>
            ))}
          </dl>
          <div className="space-y-px bg-stone-200 mb-16">
            {caseStudies.map((c) => (
              <article key={c.title} className="bg-white py-8 px-6 md:px-10">
                <p className="font-mono text-xs uppercase tracking-wider text-orange-800">{c.project}</p>
                <h3 className="font-serif text-xl md:text-2xl leading-snug text-stone-900 mt-1">{c.title}</h3>
                <dl className="mt-4 grid md:grid-cols-[90px_1fr] gap-x-6 gap-y-2 max-w-3xl text-[15px]">
                  {([["Bug", c.bug], ["Cause", c.cause], ["Fix", c.fix], ["Impact", c.impact]] as const).map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="font-mono text-xs uppercase tracking-wider text-stone-500 pt-1">{k}</dt>
                      <dd className="text-stone-700 leading-relaxed">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.links.map((e) => (
                    <a key={e.url} href={e.url} target="_blank" rel="noreferrer" className="font-mono text-xs px-2.5 py-1 border border-stone-300 rounded-full text-stone-600 hover:text-orange-800 hover:border-orange-800/40 transition-colors">
                      {e.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-6">Patterns</h3>
          <div className="space-y-px bg-stone-200">
            {themes.map((t) => (
              <article key={t.title} className="bg-white py-8 px-6 md:px-10">
                <h3 className="font-serif text-xl md:text-2xl leading-snug text-stone-900">{t.title}</h3>
                <p className="mt-1 font-mono text-xs text-stone-500">{t.count}</p>
                <p className="mt-3 text-stone-700 leading-relaxed max-w-2xl text-[15px]">{t.what}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {t.examples.map((e) => (
                    <a key={e.url} href={e.url} target="_blank" rel="noreferrer" className="font-mono text-xs px-2.5 py-1 border border-stone-300 rounded-full text-stone-600 hover:text-orange-800 hover:border-orange-800/40 transition-colors">
                      {e.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-16">
            <h3 className="font-mono text-xs uppercase tracking-widest text-stone-500">What I learned</h3>
            <div className="mt-6 grid md:grid-cols-3 gap-8">
              {lessons.map((l) => (
                <div key={l.title}>
                  <p className="font-serif text-xl text-stone-900">{l.title}</p>
                  <p className="mt-2 text-stone-600 leading-relaxed text-[15px]">{l.what}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-stone-500">
            <a href="https://github.com/search?q=author%3Apcbeingused333+is%3Apr&amp;type=pullrequests&amp;s=updated&amp;o=desc" target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider hover:text-orange-800 transition-colors">
              all contributions &rarr;
            </a>
            <Link href="/writing/to-dict-audit" className="font-mono text-xs uppercase tracking-wider text-orange-800 hover:text-orange-900 transition-colors">
              write-up: the pipeline you load is not the pipeline you saved &rarr;
            </Link>
            <Link href="/writing/haystack-async-concurrency" className="font-mono text-xs uppercase tracking-wider text-orange-800 hover:text-orange-900 transition-colors">
              write-up: four concurrency bugs on Haystack&apos;s async path &rarr;
            </Link>
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
              North American hours. Toronto now, Santo Domingo from October 2026. Spanish native,
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
                <ContactRow label="LinkedIn" value="alexcastillogonzalez" href="https://www.linkedin.com/in/alexcastillogonzalez" />
                <ContactRow label="GitHub" value="pcbeingused333" href="https://github.com/pcbeingused333" />
                <ContactRow label="CV" value="download PDF" href="https://raw.githubusercontent.com/pcbeingused333/cv/main/Alex_Castillo_Gonzalez_Applied_AI_Engineer_2-page.pdf" />
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

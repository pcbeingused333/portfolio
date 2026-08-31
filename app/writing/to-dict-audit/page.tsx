import type { Metadata } from "next";
import Link from "next/link";

const title = "The pipeline you load is not the pipeline you saved — Alex Castillo González";
const description =
  "A component takes a parameter, uses it, and leaves it out of to_dict. Save the pipeline, " +
  "load it back, and the setting is silently gone. I turned one merged fix into an 82-line " +
  "AST audit and ran it over 254 components in two repos.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "article",
    url: "/writing/to-dict-audit",
  },
  twitter: { card: "summary_large_image", title, description },
};

type Fix = {
  pr: string;
  url: string;
  what: string;
};

const fixes: Fix[] = [
  {
    pr: "haystack-core-integrations#3808",
    url: "https://github.com/deepset-ai/haystack-core-integrations/pull/3808",
    what: "merged",
  },
  {
    pr: "haystack-core-integrations#3873",
    url: "https://github.com/deepset-ai/haystack-core-integrations/pull/3873",
    what: "open",
  },
  {
    pr: "haystack#12518",
    url: "https://github.com/deepset-ai/haystack/pull/12518",
    what: "open",
  },
];

export default function Article() {
  return (
    <main className="grain min-h-screen relative">
      <nav className="max-w-3xl mx-auto px-6 md:px-10 pt-8 md:pt-12 flex items-center justify-between text-sm">
        <Link href="/" className="font-mono text-stone-500 tracking-tight hover:text-stone-900 transition-colors">
          acg / 2026
        </Link>
        <Link href="/" className="font-mono text-xs uppercase tracking-wider text-stone-600 hover:text-orange-800 transition-colors">
          &larr; back
        </Link>
      </nav>

      <article className="max-w-3xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24 md:pb-32">
        <p className="font-mono text-xs uppercase tracking-widest text-orange-700 mb-6">
          Open source &mdash; August 2026
        </p>
        <h1 className="font-serif text-4xl md:text-6xl leading-[1.08] tracking-tight">
          The pipeline you load is{" "}
          <em className="italic text-orange-800">not the pipeline you saved</em>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-stone-600 leading-relaxed">
          A component accepts a parameter, stores it, uses it &mdash; and leaves it out of{" "}
          <code className="font-mono text-[0.9em]">to_dict</code>. Save the pipeline, load it
          back, and the setting is gone, replaced by its default, with nothing in the saved file
          to show it was ever set. I fixed three of those, then wrote the check as a script and
          ran it over 254 components.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {fixes.map((f) => (
            <a
              key={f.pr}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-full text-stone-700 hover:border-orange-300 hover:text-orange-800 transition-colors"
            >
              {f.pr}
            </a>
          ))}
        </div>

        <Rule />

        <P>
          <a href="https://github.com/deepset-ai/haystack" target="_blank" rel="noreferrer" className={linkCls}>Haystack</a>{" "}
          pipelines are meant to round-trip. You build one in Python, call{" "}
          <Code>to_dict</Code> or dump it to YAML, and something else &mdash; a worker, a
          container, a colleague &mdash; calls <Code>from_dict</Code> and gets the pipeline
          back. That contract is what makes a pipeline a configuration artefact rather than a
          script, and every component has to hold up its end: whatever <Code>__init__</Code>{" "}
          accepted has to come back out of <Code>to_dict</Code>.
        </P>
        <P>
          Nothing enforces it. <Code>to_dict</Code> is written by hand, listing the parameters
          one at a time, and <Code>__init__</Code> is written by hand somewhere above it. They
          are two lists that must agree, and the only thing keeping them in agreement is that
          whoever adds a parameter remembers to add it in both places.
        </P>
        <Callout>
          When they disagree, nothing raises. The value simply reverts to its default on the
          way back in, and the saved file looks complete because the key was never written.
        </Callout>

        <H2>The one that started it</H2>
        <Meta component="TransformersZeroShotTextRouter" pr="haystack-core-integrations#3808" url={fixes[0].url} status="merged" />
        <P>
          A zero-shot router classifies a piece of text against a set of labels and sends it out
          of the matching branch. Its <Code>multi_label</Code> parameter decides how the label
          scores are normalised: across the labels as a distribution, or each one independently.
          The branch is chosen from those scores.
        </P>
        <P>
          <Code>to_dict</Code> did not include it. So a pipeline saved with{" "}
          <Code>multi_label=True</Code> came back with <Code>False</Code>, the scores were
          normalised differently, and the same text could leave through a different branch than
          it did before the round trip. Not an error &mdash; a different answer. Two sibling
          fixes shipped with it: a ranker that stopped asking its endpoint for raw scores, and
          an evaluator that fell from 16 concurrent LLM judgements back to 4.
        </P>
        <P>
          Three components in one afternoon, found by reading. That is the part worth being
          suspicious of. If reading three files turns up three instances, reading is not the
          bottleneck &mdash; the class of defect is common, and the only reason it is not
          reported more often is that nobody is looking.
        </P>

        <H2>Writing the reading down</H2>
        <P>
          The check I had been doing by eye is mechanical: take a class decorated with{" "}
          <Code>@component</Code>, list the parameters of its <Code>__init__</Code>, list the
          keyword arguments its <Code>to_dict</Code> hands to <Code>default_to_dict</Code>, and
          subtract. It needs no imports, no API keys and no environment &mdash; the answer is in
          the syntax tree.
        </P>
        <Pre>{`def serialized_keys(node: ast.FunctionDef) -> tuple[set[str], bool]:
    """Keys to_dict passes on, and whether we understood the shape of the function."""
    keys, understood = set(), False
    for sub in ast.walk(node):
        if isinstance(sub, ast.Call):
            name = getattr(sub.func, "id", None) or getattr(sub.func, "attr", None)
            if name == "default_to_dict":
                understood = True
                keys.update(kw.arg for kw in sub.keywords if kw.arg)
                if any(kw.arg is None for kw in sub.keywords):
                    understood = False   # **kwargs: shape not statically knowable
        elif isinstance(sub, ast.Dict):
            for k in sub.keys:
                if isinstance(k, ast.Constant) and isinstance(k.value, str):
                    keys.add(k.value)
    return keys, understood`}</Pre>
        <P>
          Eighty-two lines in total, standard library only. The <Code>understood</Code> flag is
          the important half: when <Code>to_dict</Code> forwards <Code>**something</Code>, the
          set of keys is not knowable from the source, so the class is skipped rather than
          reported. A tool that guesses in the ambiguous case produces a list nobody finishes
          reading.
        </P>

        <H2>What it found</H2>
        <P>
          Across <a href="https://github.com/deepset-ai/haystack" target="_blank" rel="noreferrer" className={linkCls}>haystack</a>{" "}
          and{" "}
          <a href="https://github.com/deepset-ai/haystack-core-integrations" target="_blank" rel="noreferrer" className={linkCls}>haystack-core-integrations</a>:
        </P>
        <ul className="mt-6 space-y-3 text-stone-700 leading-relaxed">
          <Li n="329">components decorated with <Code>@component</Code></Li>
          <Li n="254">of them define both their own <Code>__init__</Code> and their own <Code>to_dict</Code></Li>
          <Li n="13">flagged as dropping at least one parameter</Li>
          <Li n="5">real, after reading all thirteen by hand &mdash; eight parameters between them</Li>
        </ul>
        <P>
          Five out of thirteen is a precision of 38%, which sounds bad and is not the point. The
          point is 254 down to 13: the script does not decide anything, it decides what to read.
          Thirteen files is an evening; 254 is a project nobody starts.
        </P>

        <H2>The one with teeth</H2>
        <Meta component="VertexAITextEmbedder" pr="haystack-core-integrations#3873" url={fixes[1].url} status="withdrawn" />
        <P>
          Google&apos;s text embedding models take a <Code>task_type</Code> &mdash;{" "}
          <Code>RETRIEVAL_QUERY</Code>, <Code>RETRIEVAL_DOCUMENT</Code>,{" "}
          <Code>CODE_RETRIEVAL_QUERY</Code> and so on. It is not metadata. It goes into every{" "}
          <Code>TextEmbeddingInput</Code> and changes the vector that comes back; embedding a
          query as a document is a well-known way to lose retrieval quality for no visible
          reason.
        </P>
        <P>
          <Code>VertexAITextEmbedder.to_dict</Code> serialized the model name and the two GCP
          secrets, and dropped <Code>task_type</Code>, <Code>progress_bar</Code> and{" "}
          <Code>truncate_dim</Code>. Its sibling, <Code>VertexAIDocumentEmbedder</Code>, in the
          same integration, serializes all three.
        </P>
        <Callout>
          Save a pipeline as <span className="not-italic font-mono text-[0.8em]">CODE_RETRIEVAL_QUERY</span>,
          load it back, and it embeds as <span className="not-italic font-mono text-[0.8em]">RETRIEVAL_QUERY</span>.
          Same corpus, same code, different vectors, no error.
        </Callout>
        <P>
          And it is not going in. A maintainer pointed out, on a separate issue I had filed
          about the same integration, that <Code>google_vertex</Code> is archived &mdash; it says
          so in the status table of the top-level README, which I never opened. I pulled the
          commit; the pull request now covers the two active integrations only. The finding
          holds and the fix is right, and neither matters if the package is not maintained.
        </P>
        <P>
          The part worth keeping is the shape of the mistake. I had already left{" "}
          <Code>NvidiaGenerator</Code> out of the same pull request because the component is
          deprecated, and then failed to apply that exact test one level up, at the integration.
          A script that reads code sees only code. Whether anyone still ships it is written
          somewhere else, and the audit had no step that went and looked.
        </P>
        <P>
          The other four: <Code>S3Downloader</Code> dropped <Code>boto3_config</Code>, which
          carries the timeouts, retries and proxy settings of the AWS client &mdash; while five
          sibling components in the same integration serialize it.{" "}
          <Code>TransformersExtractiveReader</Code> dropped <Code>overlap_threshold</Code>,
          which decides which overlapping answers get deduplicated away. And in Haystack itself,{" "}
          <Code>OpenAIImageGenerator</Code> dropped <Code>timeout</Code> and{" "}
          <Code>max_retries</Code>, so a reloaded pipeline quietly went back to a 30-second
          timeout and 5 retries.
        </P>
        <Pre>{`original = OpenAIImageGenerator(timeout=120.0, max_retries=10)
restored = OpenAIImageGenerator.from_dict(original.to_dict())

original._client_kwargs()   # {'timeout': 120.0, 'max_retries': 10}
restored._client_kwargs()   # {'timeout': 30.0,  'max_retries': 5}`}</Pre>

        <H2>The tests already knew</H2>
        <P>
          The strongest evidence that these were oversights rather than decisions came from the
          test suites, which had quietly written the omission down three different ways.
        </P>
        <ul className="mt-6 space-y-3 text-stone-700 leading-relaxed">
          <Li n="1">
            <Code>VertexAITextEmbedder</Code>&apos;s <Code>test_to_dict</Code> carried the three
            missing fields <em>commented out</em>, under the note{" "}
            <span className="italic">&ldquo;The following are missing because they are not explicitly included in to_dict&rdquo;</span>.
            Someone saw it and recorded it instead of fixing it.
          </Li>
          <Li n="2">
            <Code>S3Downloader</Code>&apos;s <Code>test_to_dict</Code> is parametrized over{" "}
            <Code>boto3_config=[None, &#123;&quot;read_timeout&quot;: 10&#125;]</Code> and asserts the same
            dictionary for both. The parameter could not change the assertion, so the
            parametrization could never fail.
          </Li>
          <Li n="3">
            <Code>OpenAIImageGenerator</Code>&apos;s <Code>test_to_dict_with_params</Code> passes{" "}
            <Code>timeout=60</Code> and <Code>max_retries=10</Code>, then asserts a dictionary
            containing neither. Nobody writes that on purpose; it is what you get when you copy a
            sibling&apos;s test and adjust it until it goes green.
          </Li>
        </ul>
        <P>
          A test written to match the current behaviour will always pass, and it converts a bug
          into a documented feature. All three now assert the values, and all three fail with the
          one-line fix reverted &mdash; which I checked, because a regression test that passes
          either way is not a regression test.
        </P>

        <H2>The eight it got wrong</H2>
        <P>
          The false positives matter more than the hits, because they are what a reviewer will
          ask about. Every one of the eight came from a legitimate pattern the script cannot see,
          and they fall into three shapes:
        </P>
        <ul className="mt-6 space-y-3 text-stone-700 leading-relaxed">
          <Li n="a">
            <strong className="font-medium">Serialized outside the call.</strong>{" "}
            <Code>DocumentSplitter</Code> and <Code>ChineseDocumentSplitter</Code> take a{" "}
            <Code>splitting_function</Code>, which is a callable and cannot go through{" "}
            <Code>default_to_dict</Code>. They add it afterwards, by assigning into the
            dictionary the call returned. The parameter is serialized; it just is not a keyword
            argument.
          </Li>
          <Li n="b">
            <strong className="font-medium">Folded into another parameter.</strong> Every
            transformers component resolves <Code>model</Code>, <Code>task</Code>,{" "}
            <Code>device</Code> and <Code>token</Code> into one{" "}
            <Code>huggingface_pipeline_kwargs</Code> dict in <Code>__init__</Code>, and
            serializes that. <Code>HuggingFaceAPIChatGenerator</Code> does the same with{" "}
            <Code>stop_words</Code>, merging it into <Code>generation_kwargs[&quot;stop&quot;]</Code>. The
            value survives the round trip under a different name.
          </Li>
          <Li n="c">
            <strong className="font-medium">Excluded on purpose.</strong>{" "}
            <Code>LangfuseConnector</Code> drops <Code>httpx_client</Code> and{" "}
            <Code>TransformersChatGenerator</Code> drops <Code>async_executor</Code>. Both are
            live objects that cannot be written to a dictionary at all &mdash; one of them says
            so in a comment on the line above, the other does not, which is the difference
            between a decision recorded and a decision remembered.
          </Li>
        </ul>
        <P>
          Shape (c) is the one worth noticing. The script and the author disagree, and the author
          is right &mdash; but the same code shape also produces a real defect when the exclusion
          is an accident rather than a decision. Only reading the file tells you which, which is
          why the output of a script like this is a reading list and never a patch.
        </P>

        <H2>The one I left alone</H2>
        <P>
          <Code>NvidiaGenerator</Code> drops <Code>timeout</Code> exactly like the others. It
          also raises a <Code>FutureWarning</Code> on construction saying it is deprecated and
          will be removed in favour of <Code>NvidiaChatGenerator</Code>. Fixing serialization on
          a component scheduled for deletion is churn in someone else&apos;s review queue, so it
          is named in the pull request and left out of the diff, for the maintainers to call.
        </P>

        <H2>What this generalises to</H2>
        <P>
          The specific bug is Haystack&apos;s, but the shape is not. Any framework that
          serializes objects by listing their fields by hand has two lists that must agree and
          nothing checking that they do: LangChain&apos;s serializable classes, anything with a{" "}
          <Code>to_dict</Code>/<Code>from_dict</Code> pair, any dataclass written out field by
          field. The check costs 82 lines and runs in a second over a whole repository.
        </P>
        <P>
          And the honest limit: it finds parameters that are missing, not parameters that are
          serialized wrongly. A value written under the wrong key, or run through a converter
          that loses precision, passes this audit and still breaks the round trip. The stronger
          check is a property test &mdash; construct with non-default values, round-trip, assert
          equality &mdash; which needs the class to be constructible, which is exactly what a
          static pass avoids needing. They catch different things, and the cheap one is the one
          you can run today.
        </P>

        <Rule />

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <a href="https://github.com/deepset-ai/haystack-core-integrations/pull/3873" target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider text-orange-800 hover:text-orange-900 transition-colors">
            PR: five settings, three integrations &rarr;
          </a>
          <a href="https://github.com/deepset-ai/haystack/pull/12518" target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-wider text-orange-800 hover:text-orange-900 transition-colors">
            PR: haystack#12518 &rarr;
          </a>
          <Link href="/writing/haystack-async-concurrency" className="font-mono text-xs uppercase tracking-wider text-stone-600 hover:text-orange-800 transition-colors">
            Earlier: four concurrency bugs &rarr;
          </Link>
          <Link href="/" className="font-mono text-xs uppercase tracking-wider text-stone-600 hover:text-orange-800 transition-colors">
            All contributions
          </Link>
        </div>
      </article>

      <footer className="border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs font-mono text-stone-500">
          <span>2026 Alex Castillo Gonzalez</span>
          <span>Remote &mdash; UTC&minus;4</span>
        </div>
      </footer>
    </main>
  );
}

const linkCls =
  "underline decoration-stone-300 underline-offset-4 hover:decoration-orange-700 transition-colors";

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 text-stone-700 leading-relaxed text-[17px]">{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl md:text-3xl leading-tight mt-16 mb-2">{children}</h2>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[0.875em] px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-800">
      {children}
    </code>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-stone-900">
      <pre className="p-5 text-[13px] leading-relaxed font-mono text-stone-100">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Rule() {
  return <hr className="mt-16 border-stone-200" />;
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 border-l-2 border-orange-300 pl-5 font-serif text-xl md:text-2xl italic leading-snug text-stone-800">
      {children}
    </p>
  );
}

function Meta({
  component,
  pr,
  url,
  status,
}: {
  component: string;
  pr: string;
  url: string;
  status: "merged" | "open" | "withdrawn";
}) {
  return (
    <p className="mt-3 mb-2 flex flex-wrap items-center gap-3 text-xs font-mono">
      <span className="text-stone-900">{component}</span>
      <a href={url} target="_blank" rel="noreferrer" className="uppercase tracking-wider text-stone-500 hover:text-orange-800 transition-colors">
        {pr} &rarr;
      </a>
      <span
        className={
          status === "merged"
            ? "uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-800 text-stone-50 text-[10px]"
            : status === "withdrawn"
              ? "uppercase tracking-wider px-2 py-0.5 rounded-full border border-dashed border-stone-300 text-stone-400 text-[10px]"
              : "uppercase tracking-wider px-2 py-0.5 rounded-full border border-stone-300 text-stone-500 text-[10px]"
        }
      >
        {status}
      </span>
    </p>
  );
}

function Li({ children, n }: { children: React.ReactNode; n?: string }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-4">
      <span className="font-mono text-xs text-stone-400 mt-1.5">{n ?? "—"}</span>
      <span className="text-[17px]">{children}</span>
    </li>
  );
}

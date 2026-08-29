import type { Metadata } from "next";
import Link from "next/link";

const title = "Four concurrency bugs on Haystack's async path — Alex Castillo González";
const description =
  "Four merged fixes in deepset's Haystack, all the same shape: an async method written by " +
  "copying the sync one, carrying assumptions that only hold when nothing else runs at the " +
  "same time. Three were invisible to the test suite for the same reason.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "article",
    url: "/writing/haystack-async-concurrency",
  },
  twitter: { card: "summary_large_image", title, description },
};

type Fix = {
  pr: string;
  url: string;
  component: string;
};

const fixes: Fix[] = [
  {
    pr: "haystack#12364",
    url: "https://github.com/deepset-ai/haystack/pull/12364",
    component: "LinkContentFetcher",
  },
  {
    pr: "haystack#12358",
    url: "https://github.com/deepset-ai/haystack/pull/12358",
    component: "EmbeddingBasedDocumentSplitter",
  },
  {
    pr: "haystack#12359",
    url: "https://github.com/deepset-ai/haystack/pull/12359",
    component: "LLMDocumentContentExtractor",
  },
  {
    pr: "haystack-core-integrations#3790",
    url: "https://github.com/deepset-ai/haystack-core-integrations/pull/3790",
    component: "OAuthRefreshTokenSource",
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
          Four concurrency bugs on{" "}
          <em className="italic text-orange-800">Haystack&apos;s async path</em>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-stone-600 leading-relaxed">
          All four are the same mistake wearing different clothes: an <code className="font-mono text-[0.9em]">async</code> method
          written by copying the synchronous one, inheriting assumptions that only hold while
          nothing else is running. Three of them were invisible to a test suite that did test
          the async path.
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
          is deepset&apos;s framework for production RAG and agent pipelines &mdash; 26k stars, and the
          thing a lot of retrieval systems are actually built on. Like most Python libraries that
          grew an async story after the fact, it has components that expose both{" "}
          <Code>run</Code> and <Code>run_async</Code>, and the second was usually written by
          working through the first and putting <Code>await</Code> in front of the calls that had
          one.
        </P>
        <P>
          That translation is where the bugs live. The synchronous version of a component gets to
          assume three things for free: that only one call is in flight at a time, that blocking
          the caller is the caller&apos;s problem, and that state stored on <Code>self</Code> belongs
          to whoever is currently using it. Every one of those assumptions is false the moment the
          method is awaited concurrently &mdash; and none of them announce themselves, because the
          code still reads correctly.
        </P>
        <P>
          Below are four I found and fixed, none of them from an issue. I found them by reading{" "}
          <Code>run_async</Code> against <Code>run</Code> and asking what the sync version was
          getting away with.
        </P>

        <H2>1. State on the component, shared by everything in flight</H2>
        <Meta component="LinkContentFetcher" pr="haystack#12364" url={fixes[0].url} />
        <P>
          <Code>LinkContentFetcher</Code> downloads a list of URLs. Sites block scrapers by
          User-Agent, so it takes a list of user agents and rotates to the next one after a failed
          attempt. The rotation cursor lived on the component:
        </P>
        <Pre>{`self.current_user_agent_idx: int = 0`}</Pre>
        <P>
          And <Code>run</Code> fetches the URLs <em>concurrently</em> &mdash; that is the whole point
          of the component. So the cursor is not one fetch&apos;s rotation state, it is everybody&apos;s.
          A single 403 on one URL advanced the user agent for every other request in flight,
          including the ones that were doing fine. Worse, each fetch reset it on the way out:
        </P>
        <Pre>{`finally:
    self.current_user_agent_idx = 0`}</Pre>
        <P>
          The first fetch to finish rewound the cursor underneath everything still running. The
          practical result is that most retries went out on the <em>same</em> user agent that had
          just been rejected &mdash; the one behaviour the feature exists to provide, quietly not
          happening. Nothing raises. You just get a lower success rate than you think you have,
          and no way to tell it from the sites being hostile.
        </P>
        <P>
          The fix is to stop storing per-call state on the object. The cursor becomes a local, and
          the retry callback closes over it:
        </P>
        <Pre>{`def _get_response(self, url: str) -> httpx.Response:
    user_agent_idx = 0

    def rotate_user_agent(retry_state: RetryCallState) -> None:
        nonlocal user_agent_idx
        user_agent_idx = (user_agent_idx + 1) % len(self.user_agents)

    @retry(
        reraise=True,
        stop=stop_after_attempt(self.retry_attempts),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.RequestError)),
        after=rotate_user_agent,
    )
    def get_response(url: str) -> httpx.Response:
        response = self._client.get(url, headers=self._get_headers(self.user_agents[user_agent_idx]))
        response.raise_for_status()
        return response

    return get_response(url)`}</Pre>
        <P>
          Each fetch now rotates through the list on its own, and the <Code>finally</Code> block
          that reset shared state is gone because there is no shared state left to reset.
        </P>

        <H2>2 &amp; 3. Blocking work, on the event loop, in the method that promised not to</H2>
        <Meta component="EmbeddingBasedDocumentSplitter" pr="haystack#12358" url={fixes[1].url} />
        <P>
          <Code>EmbeddingBasedDocumentSplitter</Code> splits a document by embedding its sentences
          and cutting where meaning shifts. Chunks that come out over <Code>max_length</Code> get
          recursively re-split. <Code>run_async</Code> awaited the first pass properly and then
          did this:
        </P>
        <Pre>{`final_splits = self._split_large_splits(splits=merged_splits)`}</Pre>
        <P>
          No <Code>await</Code>, because there was nothing to await: <Code>_split_large_splits</Code>{" "}
          is the sync recursion, and it calls the <em>blocking</em> embedder. So the component was
          async for the cheap part and synchronous for the expensive one. Every long document in
          the batch froze the event loop while it embedded &mdash; and long documents are precisely
          the ones that reach that branch.
        </P>
        <P>
          This is the failure mode that makes async code slower than the sync code it replaced. The
          pipeline awaits, the loop yields, and then one component sits on the thread doing
          network-bound work through a blocking client while every other coroutine waits its turn.
          The fix was an <Code>_split_large_splits_async</Code> mirroring the recursion through{" "}
          <Code>_split_text_async</Code>, with a <em>keep in sync</em> note on both, since the
          duplication is the honest cost of supporting two paths.
        </P>

        <Meta component="LLMDocumentContentExtractor" pr="haystack#12359" url={fixes[2].url} />
        <P>
          The same shape, one layer up. <Code>LLMDocumentContentExtractor.run_async</Code> called{" "}
          <Code>DocumentToImageContent.run</Code> directly &mdash; a component that reads every file
          from disk, renders the requested page of every PDF, and base64-encodes the result. It has
          no <Code>run_async</Code>. So the entire batch was converted on the event loop{" "}
          <em>before the first LLM call was even scheduled</em>: the part that could have overlapped
          with rendering was serialised behind it.
        </P>
        <P>
          The module already imported the right tool and was using it for the chat generator two
          lines away:
        </P>
        <Pre>{`# before
image_contents = DocumentToImageContent.run(...)

# after — prefers run_async when a component has one, else runs run in a thread
image_contents = await _execute_component_async(DocumentToImageContent, ...)`}</Pre>
        <P>
          A one-line fix, which is the interesting part. Nobody wrote this deliberately; the async
          method was assembled from the sync method, and one call in the middle never got looked at
          again.
        </P>

        <H2>4. The lock that belongs to a loop, not to an object</H2>
        <Meta component="OAuthRefreshTokenSource" pr="haystack-core-integrations#3790" url={fixes[3].url} />
        <P>
          This one is my favourite, because the code looks not just correct but{" "}
          <em>thoughtful</em> &mdash; it has a comment explaining why it is written the way it is, and
          the comment is right about everything except the conclusion.
        </P>
        <Pre>{`# Create the asyncio.Lock lazily (not in __init__): it must bind to the running
# event loop, but __init__ is sync and may run without one.
if self._async_lock is None:
    self._async_lock = asyncio.Lock()
async with self._async_lock:
    ...`}</Pre>
        <P>
          The author knew an <Code>asyncio.Lock</Code> has a relationship with an event loop. They
          built it lazily to avoid creating it without one. What they missed is that lazily is not
          the same as <em>per loop</em>: the lock is created once and then kept for the lifetime of
          the source. An <Code>asyncio.Lock</Code> binds to the loop that first awaits it{" "}
          <strong className="font-medium">under contention</strong>, and raises from any other:
        </P>
        <Pre>{`RuntimeError: <asyncio.locks.Lock object> is bound to a different event loop`}</Pre>
        <P>
          One <Code>asyncio.run</Code> per request is an ordinary deployment shape. A token source
          that outlives a single loop &mdash; which is what a long-lived credential object is for
          &mdash; hits a new loop on the next request. And contention is not an edge case here:
          collapsing a burst of concurrent callers into a single network refresh is the{" "}
          <em>only</em> reason the lock exists.
        </P>
        <P>The fix rebuilds the lock whenever the running loop changes:</P>
        <Pre>{`def _get_async_lock(self) -> asyncio.Lock:
    loop = asyncio.get_running_loop()
    with self._async_lock_guard:
        if self._async_lock is None or self._async_lock_loop is not loop:
            self._async_lock = asyncio.Lock()
            self._async_lock_loop = loop
        return self._async_lock`}</Pre>
        <P>
          Two details that are not decoration. The guard is a threading <Code>Lock</Code> held
          across the check and the assignment and never across an <Code>await</Code> &mdash;
          otherwise two threads driving separate loops could each install a lock and silently lose
          mutual exclusion with each other, which is a worse bug than the one being fixed. And it
          is a <em>separate</em> lock from the existing <Code>_sync_lock</Code>: that one is held
          across a blocking network call, so an async caller waiting on it would stall its own
          event loop &mdash; bug #2 again, introduced by the fix for bug #4.
        </P>

        <Rule />

        <H2>Why the tests did not catch three of these</H2>
        <P>
          Haystack has a real test suite, and it tests the async paths. It missed these anyway, for
          one reason that is worth stating plainly:
        </P>
        <Callout>
          An async test that never runs two things at the same time is a synchronous test with
          extra syntax.
        </Callout>
        <P>
          Every one of these tests passed because it awaited a single call:
        </P>
        <ul className="mt-6 space-y-3 text-stone-700 leading-relaxed list-none">
          <Li>
            One URL means one fetch, so the shared cursor is never shared &mdash; there is nothing
            to race with.
          </Li>
          <Li>
            One <Code>asyncio.run</Code> per test, and an <em>uncontended</em> acquire never binds
            the lock to a loop. The bug needs two concurrent callers <em>and</em> a second loop; the
            existing async test had neither.
          </Li>
          <Li>
            Blocking the event loop is invisible when your coroutine is the only thing on it. It
            produces a correct result, slightly later, and the assertion is on the result.
          </Li>
        </ul>
        <P>
          So the regression tests had to manufacture the condition rather than the input. The OAuth
          one runs two callers through <Code>asyncio.gather</Code>, in two successive{" "}
          <Code>asyncio.run</Code> calls, with <Code>expires_in=0</Code> so the cache cannot serve
          the second round and both rounds genuinely refresh. That is three separate things all of
          which must be true or the bug does not reproduce, and the test carries a comment saying
          so &mdash; because the natural simplification of any of them turns it back into a test
          that passes either way.
        </P>
        <P>
          I checked each regression test fails with the fix reverted. That step is not ceremony: on
          this kind of bug, a test that passes both ways is the default outcome, not the unlucky
          one.
        </P>

        <H2>The pattern, if you want to go find your own</H2>
        <P>
          Open any Python library that grew async support after the fact and read the{" "}
          <Code>*_async</Code> methods against their synchronous twins. Ask three questions:
        </P>
        <ol className="mt-6 space-y-3 text-stone-700 leading-relaxed list-none">
          <Li n="01">
            Does it write to <Code>self</Code>? If the async version can be entered twice, that
            attribute is shared mutable state between concurrent callers.
          </Li>
          <Li n="02">
            Does every call inside it have an <Code>await</Code>? A bare call to something that
            does I/O is blocking the loop, and it will be the expensive branch, because cheap
            branches get converted first.
          </Li>
          <Li n="03">
            Does it hold an <Code>asyncio</Code> primitive built somewhere else? Locks, events and
            queues belong to a loop, and objects routinely outlive loops.
          </Li>
        </ol>
        <P>
          Four of my five merged Haystack fixes came out of exactly that reading. The
          maintainers reviewed and merged all of them, which I mention for a specific reason: none
          of these needed deep familiarity with the framework. They needed someone to read the async
          path as its own code instead of as a translation.
        </P>

        <Rule />

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-orange-800 transition-colors"
          >
            See the rest of my work
          </Link>
          <a
            href="https://github.com/search?q=author%3Apcbeingused333+is%3Apr&type=pullrequests&s=updated&o=desc"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 border border-stone-300 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors"
          >
            All contributions
          </a>
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

function Meta({ component, pr, url }: { component: string; pr: string; url: string }) {
  return (
    <p className="mt-3 mb-2 flex flex-wrap items-center gap-3 text-xs font-mono">
      <span className="text-stone-900">{component}</span>
      <a href={url} target="_blank" rel="noreferrer" className="uppercase tracking-wider text-stone-500 hover:text-orange-800 transition-colors">
        {pr} &rarr;
      </a>
      <span className="uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-800 text-stone-50 text-[10px]">merged</span>
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

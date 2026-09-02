#!/usr/bin/env python3
"""Are the links on the portfolio actually working right now?

Every project on this site is a link someone clicks from a job application, and
each has its own way of being quietly dead:

- The Streamlit demos are put to sleep after a period of inactivity and greet a
  visitor with "Zzzz — this app has gone to sleep", which reads as broken.
  Opening them here both checks them and resets that timer.
- The chat widget was pinned to a model its provider retired. The page loaded,
  the bubble opened, and only sending a message revealed anything was wrong.
- The MCP server answers a protocol, not a browser, so "the URL is up" says
  nothing about whether a client can list its tools.

Exit code 0 if everything answers, 1 otherwise. Run it from CI on a schedule and
the failure arrives as an email instead of as silence.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

PORTFOLIO = "https://portfolio-alexgonzalez33.vercel.app"
WIDGET_HEALTH = "https://ai-chat-widget-five-ashen.vercel.app/api/health"
MCP_ENDPOINT = (
    "https://w2f7mj2jcbr3jberiepx2iu2nu0xpgcm.lambda-url.us-east-1.on.aws/mcp"
)
STREAMLIT_APPS = {
    "Ask the GDPR": "https://rag-chatbot-demo-0.streamlit.app",
    "Business Ops agent": "https://mcp-business-agent-8wawhyaqt2flfixqj8dpnk.streamlit.app",
}

TIMEOUT = 45


def report(name: str, ok: bool, detail: str) -> bool:
    print(f"{'PASS' if ok else 'FAIL'}  {name:<22} {detail}")
    return ok


def check_portfolio() -> bool:
    try:
        with urllib.request.urlopen(PORTFOLIO, timeout=TIMEOUT) as response:
            return report("portfolio", response.status == 200, f"HTTP {response.status}")
    except Exception as exc:  # noqa: BLE001 — any failure is a failure to a visitor
        return report("portfolio", False, f"{type(exc).__name__}: {exc}")


def check_widget() -> bool:
    """The widget reports its own health, including which model it resolved to."""
    try:
        with urllib.request.urlopen(WIDGET_HEALTH, timeout=TIMEOUT) as response:
            payload = json.load(response)
    except Exception as exc:  # noqa: BLE001
        return report("chat widget", False, f"{type(exc).__name__}: {exc}")

    if not payload.get("ok"):
        return report("chat widget", False, f"not ok: {payload}")
    # A substitution is not a failure — it is the fallback working — but it means
    # replies come from a different model than the one configured, so say so.
    if payload.get("substituted"):
        return report(
            "chat widget",
            True,
            f"OK but substituted: {payload['configured']} -> {payload['model']}",
        )
    return report("chat widget", True, f"model {payload['model']}")


def check_mcp() -> bool:
    """A GET tells you nothing here: the server speaks JSON-RPC over POST."""
    request = urllib.request.Request(
        MCP_ENDPOINT,
        data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/list"}).encode(),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            body = response.read().decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        return report("MCP server", False, f"{type(exc).__name__}: {exc}")

    # The response may arrive as SSE framing rather than a bare JSON body.
    if '"tools"' not in body:
        return report("MCP server", False, f"no tool list in response: {body[:160]}")
    return report("MCP server", True, "tools/list answered")


def check_streamlit(name: str, url: str) -> bool:
    """Open the app in a real browser, waking it if it has gone to sleep.

    A plain HTTP request is not enough: a sleeping app still serves a 200 with
    the "Zzzz" page, and the app itself runs inside an iframe at `/~/+/`, so the
    outer document has no chat input to look for even when everything is fine.
    """
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=90_000)
            woke = False
            for _ in range(40):
                page.wait_for_timeout(3_000)
                sleeping = page.query_selector("text=Yes, get this app back up!")
                if sleeping:
                    woke = True
                    sleeping.click()
                    page.wait_for_timeout(15_000)
                    continue
                for frame in page.frames:
                    if "/~/+/" in frame.url:
                        try:
                            if frame.query_selector("textarea"):
                                note = "woken from sleep" if woke else "already awake"
                                return report(name, True, note)
                        except Exception:  # noqa: BLE001 — frame can be mid-navigation
                            pass
            return report(name, False, "app never finished loading")
        except Exception as exc:  # noqa: BLE001
            return report(name, False, f"{type(exc).__name__}: {exc}")
        finally:
            browser.close()


def main() -> int:
    results = [check_portfolio(), check_widget(), check_mcp()]
    for name, url in STREAMLIT_APPS.items():
        results.append(check_streamlit(name, url))

    failed = results.count(False)
    print()
    print(f"{len(results) - failed}/{len(results)} public demos answering")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

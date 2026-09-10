"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DocIcon, SendIcon, SparkleIcon } from "@/components/Icon";
import { EXAMPLE_QUESTIONS } from "@/lib/policyAnswers";
import styles from "./policies-assistant.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  source?: string;
  done: boolean;
}

let counter = 0;
const nextId = () => `m${++counter}`;

export default function PoliciesAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || streaming) return;

      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text: question, done: true },
        { id: assistantId, role: "assistant", text: "", done: false },
      ]);
      setDraft("");
      setStreaming(true);

      try {
        const res = await fetch("/api/policies-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });
        if (!res.ok || !res.body) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const source = res.headers.get("X-Policy-Source") ?? undefined;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          const piece = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + piece } : m,
            ),
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, source, done: true } : m,
          ),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  text:
                    "Something went wrong reaching the assistant. Please try again.",
                  done: true,
                }
              : m,
          ),
        );
      } finally {
        setStreaming(false);
      }
    },
    [streaming],
  );

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.titleBar}>
        <div className={styles.titleInner}>
          <h1>Policies Assistant</h1>
          <p>Ask about your company&rsquo;s HR policies. Answers cite the policy they come from.</p>
        </div>
      </div>

      {hasMessages ? (
        <div className={styles.conversation} ref={scrollRef} aria-live="polite">
          <div className={styles.thread}>
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className={styles.userBubble}>
                  {m.text}
                </div>
              ) : (
                <div key={m.id} className={styles.assistantRow}>
                  <span className={styles.assistantAvatar}>
                    <SparkleIcon size={16} />
                  </span>
                  <div className={styles.assistantBody}>
                    <div className={styles.assistantBubble}>
                      {m.text}
                      {!m.done && <span className={styles.caret} />}
                    </div>
                    {m.done && m.source && (
                      <div className={styles.sourceRow}>
                        <span className={styles.sourcePill}>
                          <DocIcon size={12} />
                          {m.source}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <SparkleIcon size={26} />
          </span>
          <h2>Ask anything about HR policies</h2>
          <p>
            Time off, benefits, leave, remote work, expenses &mdash; ask in plain
            language and get an answer with its source.
          </p>
          <div className={styles.examples}>
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                className={styles.exampleChip}
                onClick={() => send(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.dock}>
        <div className={styles.dockInner}>
          <div className={styles.inputRow}>
            <input
              type="text"
              aria-label="Ask about HR policies"
              placeholder="Type any question about HR policies."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
            />
            <button
              type="button"
              className={styles.sendButton}
              onClick={() => send(draft)}
              disabled={streaming || !draft.trim()}
            >
              Send
              <SendIcon size={15} />
            </button>
          </div>
          <p className={styles.disclaimer}>
            The assistant can be inaccurate. Confirm anything important with the
            People Team.
          </p>
        </div>
      </div>
    </div>
  );
}

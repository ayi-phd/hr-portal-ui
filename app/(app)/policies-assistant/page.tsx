"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { askPolicyQuestion, PolicyAssistantError } from "@/lib/api/hrPolicyAssistant";
import { DocIcon, SendIcon, SparkleIcon } from "@/components/Icon";
import { EXAMPLE_QUESTIONS } from "@/lib/exampleQuestions";
import styles from "./policies-assistant.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  /** True while the request for this (assistant) message is in flight. */
  pending: boolean;
}

let counter = 0;
const nextId = () => `m${++counter}`;

export default function PoliciesAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [asking, setAsking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || asking) return;

      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text: question, pending: false },
        { id: assistantId, role: "assistant", text: "", pending: true },
      ]);
      setDraft("");
      setAsking(true);

      try {
        const { answer, sources } = await askPolicyQuestion(question);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: answer, sources, pending: false } : m,
          ),
        );
      } catch (err) {
        const message =
          err instanceof PolicyAssistantError
            ? err.message
            : "Something went wrong reaching the assistant. Please try again.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: message, pending: false } : m,
          ),
        );
      } finally {
        setAsking(false);
      }
    },
    [asking],
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
                  {m.pending ? (
                    <div className={styles.thinking} aria-label="Assistant is thinking">
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </div>
                  ) : (
                    <div className={styles.assistantBody}>
                      <div className={styles.assistantBubble}>{m.text}</div>
                      {m.sources && m.sources.length > 0 && (
                        <div className={styles.sourceRow}>
                          {m.sources.map((source) => (
                            <span key={source} className={styles.sourcePill}>
                              <DocIcon size={12} />
                              {source}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
              disabled={asking || !draft.trim()}
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

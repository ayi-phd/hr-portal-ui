/**
 * Placeholder answer source for the Policies Assistant.
 *
 * v0 does simple keyword matching over a handful of canned responses. Replace
 * `answerFor` with a real retrieval-augmented call against your HR policy
 * corpus (embed the policy docs, retrieve the relevant passages, ask a model,
 * return the answer plus the citation).
 */

export interface PolicyAnswer {
  text: string;
  /** Human-readable citation shown under the answer. */
  source: string;
}

const CANNED: { match: RegExp; answer: PolicyAnswer }[] = [
  {
    match: /parental|maternity|paternity/,
    answer: {
      text: "Full-time employees are eligible for 16 weeks of paid parental leave after the birth or adoption of a child, available any time within the first 12 months. It can be taken continuously or split into up to three blocks with manager approval. [Sample answer — wire this to your policy corpus.]",
      source: "Parental Leave Policy · §2.1",
    },
  },
  {
    match: /carry|rollover|roll over|(vacation.*year)|(year.*vacation)/,
    answer: {
      text: "You can carry up to 5 unused vacation days into the next calendar year. Any balance above 5 days is forfeited on December 31 unless local law requires otherwise, and carried-over days must be used by March 31. [Sample answer.]",
      source: "Time Off Policy · §4.3",
    },
  },
  {
    match: /remote|work from home|wfh|hybrid/,
    answer: {
      text: "The company runs a hybrid schedule: at least two days per week in the office, with core collaboration hours of 10am–3pm local time. Fully-remote arrangements require VP approval and a signed remote-work agreement. [Sample answer.]",
      source: "Remote Work Policy · §1.2",
    },
  },
  {
    match: /sick/,
    answer: {
      text: "Full-time employees accrue 8 hours of paid sick leave each month, up to a 96-hour cap. A doctor's note is required for absences longer than three consecutive days. [Sample answer.]",
      source: "Time Off Policy · §5.1",
    },
  },
  {
    match: /expense|reimburs/,
    answer: {
      text: "Submit expenses within 30 days with an itemized receipt. Amounts under $75 don't need a receipt but still need a stated business purpose. Approved expenses are paid in the next payroll cycle. [Sample answer.]",
      source: "Expense & Reimbursement Policy · §3",
    },
  },
];

const FALLBACK: PolicyAnswer = {
  text: "Here's the short version based on the current policy set. This is placeholder text for the prototype — connect the assistant to your HR policy documents to return real, cited answers. [Sample answer.]",
  source: "HR Policy Handbook",
};

export function answerFor(question: string): PolicyAnswer {
  const q = question.toLowerCase();
  for (const { match, answer } of CANNED) {
    if (match.test(q)) return answer;
  }
  return FALLBACK;
}

export const EXAMPLE_QUESTIONS = [
  "How much parental leave do I get?",
  "What is the remote-work policy?",
  "Can I carry unused vacation into next year?",
  "How does expense reimbursement work?",
] as const;

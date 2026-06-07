import React from "react"
import "../memact-ui.css"
import "../faq-chevron.css"
import { Chevron } from "./Chevron.jsx"

const USER_BASIC_FAQS = [
  {
    question: "What is Memact?",
    answer: "Memact helps you see what apps know about you and control it."
  },
  {
    question: "What is Yourself?",
    answer: "Yourself is your editable memory page. You can add things yourself, approve what apps suggest, edit entries, delete them, or share selected parts later."
  },
  {
    question: "What can Yourself include?",
    answer: "It can include preferences, projects, reading habits, shopping interests, learning topics, work style, accessibility needs, usernames you prefer, and anything else you add or approve."
  },
  {
    question: "Why do apps ask first?",
    answer: "Because an app should not use or add memory about you without permission."
  },
  {
    question: "Do I need to install anything?",
    answer: "No. Apps can connect to Memact through the SDK/API. The important part is that you approve what the app can use or add."
  },
  {
    question: "Does an app get all my data?",
    answer: "No. An app only gets what you allow. You can review access and disconnect it."
  }
]

const USER_CONTROL_FAQS = [
  {
    question: "What can I control?",
    answer: "You can control which apps are connected, what they can use, what they can add, and whether they keep access."
  },
  {
    question: "Can apps write to Yourself?",
    answer: "Only if you allow it. Important entries can stay pending until you accept, edit, or reject them."
  },
  {
    question: "Can I add my own memory?",
    answer: "Yes. You can add entries like \"I prefer short summaries\" or \"I am working on Memact.\" User-added entries are treated as stronger than app guesses."
  },
  {
    question: "Can I share my memory?",
    answer: "Only selected entries. Private entries stay private by default."
  },
  {
    question: "What happens when an app is wrong?",
    answer: "You can edit the entry, reject it, delete it, or block the app from writing more memory."
  }
]

const DEVELOPER_BASIC_FAQS = [
  {
    question: "What is Memact?",
    answer: "Memact helps apps personalize around what users choose, without hiding what they know."
  },
  {
    question: "How does an app connect to Memact?",
    answer: "Register an app, ask the user for access, keep the API key on your server, then use the SDK/API to suggest memory or read allowed memory."
  },
  {
    question: "What can my app see?",
    answer: "Only what the user allowed for your app. You can see app-level stats and your app's memory proposals, not the user's full Yourself page."
  },
  {
    question: "How do scopes and categories work?",
    answer: "Scopes say what your app can do. Categories say what kind of memory your app is asking to use."
  }
]

const DEVELOPER_CONTEXT_FAQS = [
  {
    question: "What is Context?",
    answer: "Context is the open-source category system developers use. It helps turn app input into readable memory suggestions a user can accept, edit, reject, or delete."
  },
  {
    question: "Can my app suggest memory entries?",
    answer: "Yes, if the user allows it. Important writes should stay pending until the user accepts, edits, or rejects them."
  },
  {
    question: "Can platform bots use Memact?",
    answer: "Yes, with explicit consent. Bot activity should be labeled clearly and should only create memory the user can review."
  },
  {
    question: "Where does the API key live?",
    answer: "On your server. Never put a Memact API key in browser code, public repos, logs, or user-facing settings."
  }
]

const LEGAL_FAQS = [
  {
    question: "Who runs Memact?",
    answer: (
      <>
        Memact is a project by{" "}
        <a className="inline-help-link" href="https://github.com/keepsloading" target="_blank" rel="noreferrer">Keeps Loading</a>.
        Core repos are source-available under their repository licenses.
        Memact branding assets are separate from the code licenses.
      </>
    )
  },
  {
    question: "How can I contact Memact?",
    answer: (
      <>
        For access, security, or project questions, contact{" "}
        <a className="inline-help-link" href="mailto:keepsloading@gmail.com">keepsloading@gmail.com.</a>
        {" "}Do not send secrets, private exports, or API keys by email.
      </>
    )
  }
]

function FaqItem({ faq, open = false }) {
  return (
    <details className="faq-item" open={open}>
      <summary className="faq-trigger">
        <span className="faq-question">{faq.question}</span>
        <Chevron />
      </summary>
      <div className="faq-answer">
        {typeof faq.answer === "string" ? <p>{faq.answer}</p> : <div className="faq-answer-content">{faq.answer}</div>}
      </div>
    </details>
  )
}

export function HelpPanel({ accountType = "developer" }) {
  const isUser = accountType === "user"
  return (
    <section className="panel help-panel">
      <div>
        <h2>Frequently asked questions</h2>
      </div>

      <div className="faq-section">
        <p className="faq-section-title">Basics</p>
        {(isUser ? USER_BASIC_FAQS : DEVELOPER_BASIC_FAQS).map((faq, index) => (
          <FaqItem faq={faq} key={faq.question} open={index === 0} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">{isUser ? "Controls" : "Context and memory writes"}</p>
        {(isUser ? USER_CONTROL_FAQS : DEVELOPER_CONTEXT_FAQS).map((faq) => (
          <FaqItem faq={faq} key={faq.question} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Legal and contact</p>
        {LEGAL_FAQS.map((faq) => (
          <FaqItem faq={faq} key={faq.question} />
        ))}
      </div>
    </section>
  )
}

import React from "react"
import "../memact-ui.css"
import "../faq-chevron.css"
import { Chevron } from "./Chevron.jsx"

const BASIC_FAQS = [
  {
    question: "What is Memact?",
    answer: "Memact helps apps personalize better using what users choose to share."
  },
  {
    question: "What is Memact Wiki?",
    answer: "Memact Wiki is your editable memory page. You can add things yourself, approve what apps suggest, edit entries, delete them, or share selected parts later."
  },
  {
    question: "Why do apps ask first?",
    answer: "Because an app should not use or add memory about you without permission."
  },
  {
    question: "Is the browser extension required?",
    answer: "No. Apps can use Memact through the SDK/API. The extension is optional."
  },
  {
    question: "Does an app get all my data?",
    answer: "No. An app only gets what you allow. You can review access and disconnect it."
  }
]

const CONTROL_FAQS = [
  {
    question: "What can I control?",
    answer: "You can control which apps are connected, what they can use, what they can add, and whether they keep access."
  },
  {
    question: "Can apps write to my Wiki?",
    answer: "Only if you allow it. Important entries can stay pending until you accept, edit, or reject them."
  },
  {
    question: "Can I add my own context?",
    answer: "Yes. You can add entries like “I prefer short summaries” or “I am working on Memact.” User-added entries are treated as stronger than app guesses."
  },
  {
    question: "Can I share my Wiki?",
    answer: "Only selected entries. Private entries stay private by default."
  },
  {
    question: "What happens when an app is wrong?",
    answer: "You can edit the entry, reject it, delete it, or block the app from writing more memory."
  }
]

const DEVELOPER_FAQS = [
  {
    question: "How does an app connect to Memact?",
    answer: "Register an app, ask the user for access, keep the API key on your server, then use the SDK/API to send approved activity or run features."
  },
  {
    question: "What are Playground features?",
    answer: "Playground features are small tools developers build using Memact memory. For example, a feature could help a news app choose whether to show a quick brief, key points, or a deeper article overview."
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

export function HelpPanel() {
  return (
    <section className="panel help-panel">
      <div>
        <p className="eyebrow">Help</p>
        <h2>Frequently asked questions</h2>
        <p className="muted">Common questions about apps, consent, Wiki, Playground, and developer setup.</p>
      </div>

      <div className="faq-section">
        <p className="faq-section-title">Basics</p>
        {BASIC_FAQS.map((faq, index) => (
          <FaqItem faq={faq} key={faq.question} open={index === 0} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Controls</p>
        {CONTROL_FAQS.map((faq) => (
          <FaqItem faq={faq} key={faq.question} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Developers</p>
        {DEVELOPER_FAQS.map((faq) => (
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

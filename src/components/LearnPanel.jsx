import React from "react"
import "../memact-ui.css"
import "../faq-chevron.css"
import { Chevron } from "./Chevron.jsx"

const START_FAQS = [
  {
    question: "What is Memact?",
    answer: "Memact helps you see what apps know about you and control it."
  },
  {
    question: "What problem is Memact solving?",
    answer: "Apps usually guess quietly from clicks and isolated profiles. Users rarely see what is being used or why. Memact makes that memory visible and editable."
  },
  {
    question: "What is the basic flow?",
    answer: "An app asks first. If the user allows it, the app can suggest memory or send specific app details for review. Context organizes those details, Yourself shows them, and the user decides what stays."
  }
]

const YOURSELF_FAQS = [
  {
    question: "What is Yourself?",
    answer: "It is the user's editable page of what apps know about them. Users can add details, review app suggestions, edit what is wrong, or delete what should not stay."
  },
  {
    question: "Why is Yourself important?",
    answer: "It gives users a readable place to see and correct what apps know. Without it, personalization stays hidden inside each app."
  },
  {
    question: "What counts as user memory?",
    answer: "User memory can include preferences, interests, projects, repeated topics, skipped topics, work style, shopping patterns, preferred usernames, contact details the user approves, and user-written notes."
  },
  {
    question: "Can users edit app-added memory?",
    answer: "Yes. Users can accept, edit, reject, delete, or change visibility for entries."
  },
  {
    question: "What does \"private\" or \"shareable\" mean?",
    answer: "Private stays only in Yourself. Shareable can be shared by link later. Private should be the default."
  }
]

const APP_FAQS = [
  {
    question: "Why would an app use Memact?",
    answer: "Most apps only know what happens inside their own product. Memact can help an app use approved memory from other places too, so the user does not have to explain themselves again."
  },
  {
    question: "What does Context do?",
    answer: "Context is the open-source category system for developers. It helps turn messy app input into readable memory suggestions, like fitness preferences, shopping habits, media taste, or chat-app settings."
  },
  {
    question: "Can apps suggest memory directly?",
    answer: "Yes. Apps can suggest memory directly if they include evidence. They can also send specific app details and let Memact organize them before the user reviews the result."
  }
]

const DEVELOPER_FAQS = [
  {
    question: "What should developers build first?",
    answer: "Start with one app category. Define what memory matters, what evidence is safe, what should be blocked, and how the suggestion should appear to the user."
  },
  {
    question: "What should developers avoid?",
    answer: "Hidden tracking, raw data leaks, fake conclusions, and sensitive claims without support."
  },
  {
    question: "What happened to Schema?",
    answer: "Schema is now Context. Older issues and PRs may still say Schema, but the job is the same: organize app input into safe, readable memory suggestions."
  },
  {
    question: "Does Memact need a separate install?",
    answer: "No. The core flow is app to Access to Context to Yourself to Memory. Apps can integrate through the SDK/API."
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
        <p>{faq.answer}</p>
      </div>
    </details>
  )
}

export function LearnPanel() {
  return (
    <section className="panel help-panel">
      <div>
        <h2>See what apps know about you</h2>
      </div>

      <div className="faq-section">
        <p className="faq-section-title">Start here</p>
        {START_FAQS.map((faq, index) => (
          <FaqItem faq={faq} key={faq.question} open={index === 0} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Yourself</p>
        {YOURSELF_FAQS.map((faq) => (
          <FaqItem faq={faq} key={faq.question} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Apps and Context</p>
        {APP_FAQS.map((faq) => (
          <FaqItem faq={faq} key={faq.question} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Developers</p>
        {DEVELOPER_FAQS.map((faq) => (
          <FaqItem faq={faq} key={faq.question} />
        ))}
      </div>
    </section>
  )
}

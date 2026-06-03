import React from "react"
import "../memact-ui.css"
import "../faq-chevron.css"
import { Chevron } from "./Chevron.jsx"

const START_FAQS = [
  {
    question: "What is Memact?",
    answer: "Memact is a playground where apps personalize around what users choose."
  },
  {
    question: "What problem is Memact solving?",
    answer: "Apps usually guess quietly from clicks and isolated profiles. Users rarely see what is being used or why. Memact makes that memory visible and editable."
  },
  {
    question: "What is the basic flow?",
    answer: "An app asks first. If the user allows it, the app can send signals or proposed context. Memact turns that into memory the user can accept, edit, reject, or delete."
  }
]

const YOURSELF_FAQS = [
  {
    question: "What is Yourself?",
    answer: "It is the user's editable memory page. Users can add context, apps can suggest entries, and Memact can create entries from approved activity."
  },
  {
    question: "Why is Yourself important?",
    answer: "It gives users a readable place to see and correct what apps know. Without it, personalization stays hidden inside each app."
  },
  {
    question: "What counts as user context?",
    answer: "User context is useful memory for personalization: preferences, interests, projects, repeated topics, skipped topics, work style, shopping patterns, and user-written notes."
  },
  {
    question: "Can users edit app-added memory?",
    answer: "Yes. Users can accept, edit, reject, delete, or change visibility for entries."
  },
  {
    question: "What does \"private, shareable, public\" mean?",
    answer: "Private stays only in Yourself. Shareable can be shared by link later. Public can appear on a public username page. Private should be the default."
  }
]

const APP_FAQS = [
  {
    question: "Why would an app use Memact?",
    answer: "Most apps only know what happens inside their own product. Memact can help an app use approved memory from other places too, so the user does not have to explain themselves again."
  },
  {
    question: "What does Context do?",
    answer: "Context is the open-source category layer. It helps Memact turn messy app signals into readable memory proposals, like shopping preferences, fitness preferences, media habits, or chat-app settings."
  },
  {
    question: "Can apps send context directly?",
    answer: "Yes. Apps can propose context directly if they include evidence. They can also send raw signals and let Memact organize them before the user reviews the result."
  }
]

const DEVELOPER_FAQS = [
  {
    question: "What should developers build first?",
    answer: "Start with one app category. Define what context matters, what evidence is safe, what should be blocked, and how the proposal should appear to the user."
  },
  {
    question: "What should developers avoid?",
    answer: "Hidden tracking, raw data leaks, fake conclusions, and features that make sensitive claims without support."
  },
  {
    question: "What happened to Schema?",
    answer: "Schema is now Context. Older issues and PRs may still say Schema, but the job is the same: organize app signals into safe, readable context proposals."
  },
  {
    question: "Does Memact need the extension?",
    answer: "No. Apps can integrate with Memact through SDK/API. The extension is only an optional capture source."
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
        <p className="eyebrow">Learn More</p>
        <h2>Personalization made better with Memact</h2>
        <p className="muted">A simple overview of how apps, Context, Yourself, and Memory fit together.</p>
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

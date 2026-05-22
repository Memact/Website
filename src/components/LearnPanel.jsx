import React from "react"
import "../memact-ui.css"
import "../faq-chevron.css"
import { Chevron } from "./Chevron.jsx"

const START_FAQS = [
  {
    question: "What is Memact?",
    answer: "Memact is a playground where apps personalize based on what users choose to share."
  },
  {
    question: "What problem is Memact solving?",
    answer: "Apps usually guess quietly from clicks and isolated profiles. Users rarely see what is being used or why. Memact makes that memory visible and editable."
  },
  {
    question: "What is the basic flow?",
    answer: "An app asks first. If the user allows it, the app can send approved activity. Memact turns that into memory, and apps can use allowed features to personalize better."
  }
]

const WIKI_FAQS = [
  {
    question: "What is Memact Wiki?",
    answer: "It is the user’s editable memory page. Users can add context, apps can suggest entries, and Memact can create entries from approved activity."
  },
  {
    question: "Why is Wiki important?",
    answer: "It gives users a readable place to see and correct what apps know. Without it, personalization stays hidden inside each app."
  },
  {
    question: "Can users edit app-added memory?",
    answer: "Yes. Users can accept, edit, reject, delete, or change visibility for entries."
  },
  {
    question: "What does “private, shareable, public” mean?",
    answer: "Private stays only in the user’s Wiki. Shareable can be shared by link later. Public can appear on a public username page. Private should be the default."
  }
]

const APP_FAQS = [
  {
    question: "Why would an app use Memact?",
    answer: "Most apps only know what happens inside their own product. Memact can help an app use approved memory from other places too, so the user does not have to explain themselves again."
  },
  {
    question: "What is Playground?",
    answer: "Playground is where developers build Memact features. A feature might help an article app choose the right summary style, or help a shopping app understand preference patterns."
  },
  {
    question: "What is Adaptive Article Overview?",
    answer: "It is an example of a Playground feature. It helps article apps choose a summary style based on approved reading memory, like quick brief, key points, simple explainer, or deep dive."
  }
]

const DEVELOPER_FAQS = [
  {
    question: "What should developers build first?",
    answer: "Small features. One feature should do one clear thing and use only the memory it is allowed to use."
  },
  {
    question: "What should developers avoid?",
    answer: "Hidden tracking, raw data leaks, fake conclusions, and features that make sensitive claims without support."
  },
  {
    question: "What are schemas?",
    answer: "Schemas are how Memact organizes memory for features. Most users do not need to think about them."
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
        <p className="muted">A simple overview of how apps, Wiki, and Playground fit together.</p>
      </div>

      <div className="faq-section">
        <p className="faq-section-title">Start here</p>
        {START_FAQS.map((faq, index) => (
          <FaqItem faq={faq} key={faq.question} open={index === 0} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Wiki</p>
        {WIKI_FAQS.map((faq) => (
          <FaqItem faq={faq} key={faq.question} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Apps and Playground</p>
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

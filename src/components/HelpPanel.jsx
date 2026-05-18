import React from "react"
import "../memact-ui.css"
import "../faq-chevron.css"
import { Chevron } from "./Chevron.jsx"

const BASIC_FAQS = [
  {
    question: "What is Memact?",
    answer: "Memact is permissioned intent infrastructure for apps. It helps apps understand what users are trying to do from approved digital activity."
  },
  {
    question: "Where does Memact run?",
    answer: "Apps use a small Memact client SDK. Evidence can come from approved browser activity and, if enabled, a local helper. Apps receive scoped intent and context, not raw private data."
  },
  {
    question: "Does an app get my private data?",
    answer: "No. Apps only get the scoped context or intent signals allowed by the permissions and categories you approve."
  },
  {
    question: "How does consent work?",
    answer: "Consent shows what an app is asking to use before anything is connected. Approval is optional, and you can review Data Transparency first."
  },
  {
    question: "What are activity categories?",
    answer: "They limit which approved activity an app can use, such as research pages, news, AI conversations, developer activity, or media."
  }
]

const INTENT_FAQS = [
  {
    question: "What activity can be used?",
    answer: "Only approved activity can be used. That can include page titles, URLs, selected text, captions, transcripts, timestamps, or other disclosed evidence fields."
  },
  {
    question: "What does Memact produce?",
    answer: "Memact turns approved activity into intent hypotheses, context signals, evidence cards, and scoped summaries. Intent predictions are hypotheses, not facts."
  },
  {
    question: "What does an app receive?",
    answer: "An app receives only what its saved consent allows: scoped context, intent signals, or evidence-backed summaries. Categories and permissions stay as hard boundaries."
  },
  {
    question: "Can I change what an app uses?",
    answer: "Yes. You can narrow scopes and categories before approving. Where available, you can revoke access later so future use stops."
  }
]

const ADVANCED_FAQS = [
  {
    question: "How do I use the Memact API in an app?",
    answer: (
      <>
        <p>Use Memact as permissioned intent infrastructure for your app.</p>
        <ol>
          <li>Register your app in Memact and choose the smallest scopes and activity categories your feature needs.</li>
          <li>Add a <strong>Connect Memact</strong> button in your app. Send users to <code>/connect?app_id=...&amp;scopes=...&amp;categories=...&amp;redirect_uri=...</code>.</li>
          <li>Put a Data Transparency link beside that consent flow. Explain the approved activity, evidence fields, intended context, retention, and revocation path.</li>
          <li>After approval, Memact redirects back to your <code>redirect_uri</code> with a <code>connection_id</code>. Store that id for the signed-in user in your app.</li>
          <li>Keep the raw Memact API key in server environment config, such as <code>MEMACT_API_KEY</code> in <code>.env</code> locally and a secret manager in production. Do not ask users to paste it into UI.</li>
          <li>Your backend calls Memact with <code>Authorization: Bearer process.env.MEMACT_API_KEY</code>, the stored <code>connection_id</code>, required scopes, and activity categories. If verification fails, do not request context or intent.</li>
          <li>For intent predictions, send only approved activity to the backend intent endpoint and use the evidence-backed hypotheses returned for that user and app.</li>
        </ol>
      </>
    )
  },
  {
    question: "Where should the Memact API key live in code?",
    answer: (
      <>
        Treat the raw Memact API key like a server-side secret. This is the private app key that starts with <code>mka_</code> and is created in the Memact portal. In local development, put it in <code>.env</code> as something like <code>MEMACT_API_KEY=mka_...</code>. In production, put the same value in your host's secret manager. Do not hard-code it into browser bundles, mobile apps, public repos, README examples, logs, shared prompts, or manual user-facing settings panels.
      </>
    )
  },
  {
    question: "Do I need a Supabase public key?",
    answer: (
      <>
        No. App developers configure only the private Memact app key, usually <code>MEMACT_API_KEY=mka_...</code>, on their own backend. Supabase keys belong to Memact's access infrastructure, not customer apps. If a guide asks your app to set a Supabase key for Memact verification, that guide is wrong or outdated.
      </>
    )
  },
  {
    question: "What code should I embed?",
    answer: (
      <>
        Embed only the user-facing connection pieces in the client: the Connect button, the Data Transparency link, and your callback handling. Put verification and intent requests on your server. The server loads <code>process.env.MEMACT_API_KEY</code>, then sends <code>connection_id</code>, <code>required_scopes</code>, <code>activity_categories</code>, and approved activity to Memact. Run your feature only when Memact returns <code>allowed: true</code>, then use only the approved intent and context for that user.
      </>
    )
  },
  {
    question: "Is a Data Transparency page required?",
    answer: (
      <>
        Yes. Any app asking users to consent through Memact should expose Data Transparency next to the consent flow. It must explain what approved activity may be used, what intent or context the app wants, retention, and revocation.
      </>
    )
  },
  {
    question: "Are intent predictions facts?",
    answer: "No. Intent predictions are hypotheses from approved activity. Apps should treat them as signals and keep user choice in the loop."
  }
]

const LEGAL_FAQS = [
  {
    question: "Who runs Memact?",
    answer: (
      <>
        Memact is a project by{" "}
        <a className="inline-help-link" href="https://github.com/keepsloading" target="_blank" rel="noreferrer">Keeps Loading</a>.
        Core repos are source-available under their repository licenses, and contributions are accepted under the CLA.
        Memact branding assets are not licensed with the code.
      </>
    )
  },
  {
    question: "How can I contact Memact?",
    answer: (
      <>
        For access, security, or project questions, contact{" "}
        <a className="inline-help-link" href="mailto:keepsloading@gmail.com">keepsloading@gmail.com.</a>
        {" "}For safety, do not send secrets, private activity exports, or API keys by email.
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
        <p className="muted">Answers about how Memact works, what apps can see, and how consent is controlled.</p>
      </div>

      <div className="faq-section">
        <p className="faq-section-title">Basics</p>
        {BASIC_FAQS.map((faq, index) => (
          <FaqItem faq={faq} key={faq.question} open={index === 0} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Intent and controls</p>
        {INTENT_FAQS.map((faq) => (
          <FaqItem faq={faq} key={faq.question} />
        ))}
      </div>

      <div className="faq-section faq-section-advanced">
        <p className="faq-section-title">Advanced</p>
        {ADVANCED_FAQS.map((faq) => (
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

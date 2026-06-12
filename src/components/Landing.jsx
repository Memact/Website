import React, { useEffect, useState } from "react"
import "../memact-ui.css"
import "../landing-polish.css"
import "../desktop-landing-lift.css"
import "../mobile-wide-auth.css"
import { PasswordField } from "./PasswordField.jsx"

export function Landing({
  isConnecting,
  showAuth,
  email,
  signupDisplayName,
  signupAccountType,
  password,
  passwordConfirm,
  pendingVerificationEmail,
  verificationCode,
  pendingSignInVerificationEmail,
  signInVerificationCode,
  passwordState,
  authMode,
  authLoading,
  lastAuthMethod,
  setEmail,
  setSignupDisplayName,
  setSignupAccountType,
  setPassword,
  setPasswordConfirm,
  setVerificationCode,
  setSignInVerificationCode,
  setAuthMode,
  onEmailSignup,
  onVerifySignupCode,
  onVerifySignInCode,
  onEmailLogin,
  onConsentEmailLink,
  onPasswordLogin,
  onForgotPassword,
  onResendConfirmation,
  onClearPendingVerification,
  onClearPendingSignInVerification,
  onGithubLogin,
  onGoogleLogin,
  onLearnMore
}) {
  const isSignIn = authMode === "sign-in"
  const isConsentAuth = isConnecting && !isSignIn
  const isVerificationStep = !isSignIn && Boolean(pendingVerificationEmail)
  const isSignInVerificationStep = isSignIn && Boolean(pendingSignInVerificationEmail)
  const [signupStep, setSignupStep] = useState("identity")

  useEffect(() => {
    if (pendingVerificationEmail && !isSignIn) {
      setSignupStep("verify")
      return
    }
    setSignupStep(isConsentAuth ? "consent-email" : "account-type")
  }, [authMode, isConsentAuth, isSignIn, pendingVerificationEmail])

  const handleAuthScroll = (event, mode = "sign-up") => {
    event.preventDefault()
    setAuthMode(mode)
    window.requestAnimationFrame(() => {
      const target = document.getElementById(mode)
      if (!target) return

      target.scrollIntoView({ behavior: "smooth", block: "center" })
      target.querySelector("input")?.focus({ preventScroll: true })
    })
  }

  const goToSignupPassword = () => {
    const cleanName = signupDisplayName.trim().replace(/\s+/g, " ")
    if (cleanName.length < 2) {
      document.getElementById("signup-display-name")?.focus()
      return
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      document.getElementById("signup-email")?.focus()
      return
    }
    setSignupStep("password")
    window.requestAnimationFrame(() => {
      document.getElementById("signup-password")?.focus()
    })
  }

  const goBackToSignupIdentity = () => {
    setSignupStep("identity")
    window.requestAnimationFrame(() => {
      document.getElementById("signup-email")?.focus()
    })
  }

  const handleSignupSubmit = (event) => {
    if (isVerificationStep) {
      onVerifySignupCode(event)
      return
    }
    if (isConsentAuth) {
      onConsentEmailLink(event)
      return
    }
    if (signupStep === "account-type") {
      event.preventDefault()
      if (!signupAccountType) return
      setSignupStep("identity")
      window.requestAnimationFrame(() => {
        document.getElementById("signup-display-name")?.focus()
      })
      return
    }
    if (signupStep === "identity") {
      event.preventDefault()
      goToSignupPassword()
      return
    }
    onEmailSignup(event)
  }

  const handleSignInSubmit = (event) => {
    if (isSignInVerificationStep) {
      event.preventDefault()
      return
    }
    onPasswordLogin(event)
  }

  return (
    <section className={showAuth ? "landing landing-with-auth" : "landing"}>
      <div className="auth-intro">
        <div className="auth-side">
          <img className="auth-logo-img" src="/logo.png" alt="Memact" />
        </div>

        <div className="hero-copy hero-copy-compact">
          {isConnecting ? (
            <>
              <h1>Review what this app can use</h1>
              <p>Sign in to see what the app wants and choose whether to connect.</p>
              <button type="button" className="learn-more-link" onClick={onLearnMore}>Learn more</button>
            </>
          ) : (
            <>
              <h1 className="locked-tagline">
                <span>Decide how</span>
                <span className="tagline-with">apps know you.</span>
              </h1>
              <p>Because your activity is not your identity.</p>
              {showAuth ? (
                <div className="landing-actions">
                  <a className="scroll-to-auth" href="/#sign-up" onClick={(event) => handleAuthScroll(event, "sign-up")}>Get started</a>
                  <button type="button" className="learn-more-link" onClick={onLearnMore}>Learn more</button>
                </div>
              ) : null}
            </>
          )}
        </div>

        {showAuth ? (
          <section id={isSignIn ? "sign-in" : "sign-up"} className="panel auth-panel" aria-label={isSignIn ? "Memact sign in" : "Memact sign up"}>
            <img className="auth-panel-logo" src="/logo.png" alt="Memact" />
            <h2>{isSignIn ? "Sign in" : isConsentAuth ? "Review request" : "Get started"}</h2>
            <p className="muted auth-support">
              {isSignIn
                ? isSignInVerificationStep
                  ? `Open the sign-in link sent to ${pendingSignInVerificationEmail}.`
                  : "Sign in to manage apps, permissions, and API keys."
                : isVerificationStep
                ? `Enter the confirmation code sent to ${pendingVerificationEmail}.`
                : isConsentAuth
                ? "Enter your email to review this request. We'll send a secure link."
                : signupStep === "account-type"
                ? "Are you joining as a user or developer?"
                : signupStep === "identity"
                ? "First, tell Memact who you are."
                : "Now create a strong password for your account."}
            </p>
            {!isSignIn && !isConsentAuth ? (
              <div className="auth-progress" aria-label="Sign up progress">
                <span className="is-active" aria-label="Account type step" />
                <span className={signupStep === "identity" || signupStep === "password" || isVerificationStep ? "is-active" : ""} aria-label="Name and email step" />
                <span className={signupStep === "password" || isVerificationStep ? "is-active" : ""} aria-label="Password step" />
                <span className={isVerificationStep ? "is-active" : ""} aria-label="Verification step" />
              </div>
            ) : null}
            {isSignIn && lastAuthMethod && !isSignInVerificationStep ? <p className="last-auth-chip">Last used: {lastAuthMethod}</p> : null}
            <form className="form" onSubmit={isSignIn ? handleSignInSubmit : handleSignupSubmit}>
              {isSignInVerificationStep ? (
                <div className="auth-link-sent-card" role="status">
                  <strong>Check your email.</strong>
                  <span>Open the sign-in link to continue. You can come back here if you need to use password again.</span>
                </div>
              ) : null}
              {isVerificationStep ? (
                <div className="auth-link-sent-card" role="status">
                  <strong>Check your email.</strong>
                  <span>Enter the confirmation code to finish setting up your Memact account.</span>
                </div>
              ) : null}
              {isVerificationStep ? (
                <label>
                  Confirmation code
                  <input
                    id="signup-verification-code"
                    className="verification-code-input"
                    value={verificationCode}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter code"
                    onChange={(event) => setVerificationCode(event.target.value)}
                    required
                  />
                </label>
              ) : null}
              {!isVerificationStep && !isSignIn && signupStep === "account-type" ? (
                <div className="account-type-options" role="radiogroup" aria-label="Choose account type">
                  <button
                    type="button"
                    className={signupAccountType === "user" ? "account-type-card is-active" : "account-type-card"}
                    onClick={() => setSignupAccountType("user")}
                  >
                    <span className="account-type-card-marker" aria-hidden="true" />
                    <span className="account-type-card-copy">
                      <strong>User</strong>
                      <span>I want to manage what apps know about me.</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={signupAccountType === "developer" ? "account-type-card is-active" : "account-type-card"}
                    onClick={() => setSignupAccountType("developer")}
                  >
                    <span className="account-type-card-marker" aria-hidden="true" />
                    <span className="account-type-card-copy">
                      <strong>Developer</strong>
                      <span>I want to build apps with Memact.</span>
                    </span>
                  </button>
                </div>
              ) : null}
              {!isVerificationStep && isConsentAuth ? (
                <label>
                  Email
                  <input id="consent-email" value={email} type="email" inputMode="email" autoComplete="email" placeholder="Enter your email" onChange={(event) => setEmail(event.target.value)} required />
                </label>
              ) : null}
              {!isVerificationStep && !isSignIn && signupStep === "identity" ? (
                <label>
                  Display name
                  <input id="signup-display-name" value={signupDisplayName} type="text" autoComplete="name" placeholder="What should Memact call you?" maxLength={80} onChange={(event) => setSignupDisplayName(event.target.value)} required />
                </label>
              ) : null}
              {!isSignInVerificationStep && !isVerificationStep && (isSignIn || signupStep === "identity") ? <label>
                Email
                <input id={isSignIn ? "signin-email" : "signup-email"} value={email} type="email" inputMode="email" autoComplete="email" placeholder="Enter your email" onChange={(event) => setEmail(event.target.value)} required />
              </label> : null}
              {!isSignInVerificationStep && !isVerificationStep && (isSignIn || signupStep === "password") ? (
                <PasswordField
                  id={isSignIn ? "signin-password" : "signup-password"}
                  label="Password"
                  value={password}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  placeholder={isSignIn ? "Enter your password" : "Create a strong password"}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              ) : null}
              {!isVerificationStep && !isSignIn && signupStep === "password" ? (
                <PasswordField
                  label="Confirm password"
                  value={passwordConfirm}
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  required
                />
              ) : null}
              {!isVerificationStep && !isSignIn && signupStep === "password" && passwordState ? (
                <>
                  <div className="password-strength signup-password-strength" data-strength={passwordState.level}>
                    <div className="password-strength-bar">
                      <span style={{ width: `${passwordState.percent}%` }} />
                    </div>
                    <strong>{passwordState.label}</strong>
                  </div>
                  <ul className="password-rules signup-password-rules" aria-label="Password requirements">
                    {passwordState.checks.map((check) => (
                      <li key={check.label} className={check.ok ? "is-passed" : ""}>{check.label}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {!isVerificationStep && !isSignInVerificationStep ? (
                <button type="submit" disabled={authLoading === "password" || authLoading === "signup" || authLoading === "consent-link" || (!isSignIn && signupStep === "account-type" && !signupAccountType)}>
                  <span>{authLoading === "password" || authLoading === "signup" || authLoading === "consent-link"
                    ? authLoading === "consent-link" ? "Sending link..." : isSignIn ? "Signing in..." : "Creating account..."
                    : isSignIn ? "Sign in" : isConsentAuth ? "Send secure link" : signupStep === "account-type" ? "Continue" : signupStep === "identity" ? "Continue" : "Create account"}</span>
                  {!isSignIn ? <span className="auth-native-chevron auth-submit-chevron" aria-hidden="true" /> : null}
                </button>
              ) : null}
              {isSignInVerificationStep ? (
                <button type="button" className="text-button" onClick={onClearPendingSignInVerification}>Use password again</button>
              ) : null}
              {isVerificationStep ? (
                <>
                  <button type="submit" disabled={authLoading === "verify-signup"}>
                    {authLoading === "verify-signup" ? "Verifying..." : "Verify code"}
                  </button>
                  <button type="button" className="text-button" disabled={authLoading === "resend-confirmation"} onClick={onResendConfirmation}>
                    {authLoading === "resend-confirmation" ? "Sending code..." : "Resend code"}
                  </button>
                  <button type="button" className="text-button" onClick={onClearPendingVerification}>Use a different email</button>
                </>
              ) : null}
              {!isVerificationStep && !isSignIn && signupStep === "identity" ? (
                <button type="button" className="text-button" onClick={() => setSignupStep("account-type")}>Back to account type</button>
              ) : null}
              {!isVerificationStep && !isSignIn && signupStep === "password" ? (
                <button type="button" className="text-button" onClick={goBackToSignupIdentity}>Back to name and email</button>
              ) : null}
              {isSignIn && !isSignInVerificationStep ? (
                <>
                  <button type="button" className="text-button" disabled={authLoading === "forgot-password"} onClick={onForgotPassword}>
                    {authLoading === "forgot-password" ? "Sending reset link..." : "Forgot password?"}
                  </button>
                  <button type="button" className="text-button" disabled={authLoading === "resend-confirmation"} onClick={onResendConfirmation}>
                    {authLoading === "resend-confirmation" ? "Sending confirmation..." : "Resend confirmation email"}
                  </button>
                  <button type="button" className="ghost" disabled={authLoading === "email"} onClick={onEmailLogin}>
                    {authLoading === "email" ? "Sending link..." : "Email me a sign-in link"}
                  </button>
                </>
              ) : null}
              {!isVerificationStep && !isSignInVerificationStep ? <button type="button" className="text-button" onClick={(event) => handleAuthScroll(event, isSignIn ? "sign-up" : "sign-in")}>
                {isSignIn ? "New to Memact? Get started" : "Already have an account? Sign in"}
              </button> : null}
              {!isVerificationStep && !isSignInVerificationStep && !isConsentAuth && (isSignIn || signupStep !== "account-type") ? (
                <>
                  <div className="auth-divider" aria-hidden="true"><span>or</span></div>
                  <button type="button" className="ghost" disabled={authLoading === "google"} onClick={onGoogleLogin}>
                    {authLoading === "google" ? "Opening Google..." : "Continue with Google"}
                  </button>
                  <button type="button" className="ghost" disabled={authLoading === "github"} onClick={onGithubLogin}>
                    {authLoading === "github" ? "Opening GitHub..." : "Continue with GitHub"}
                  </button>
                </>
              ) : null}
            </form>
          </section>
        ) : null}
      </div>
    </section>
  )
}

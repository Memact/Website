import React, { useMemo, useState } from "react"

const POST_TYPES = [
  "Wrong app guess",
  "Actual taste",
  "App vs me",
  "Preference card",
  "Transparency screenshot",
  "Funny algorithm moment",
  "Correct app read"
]

export function OurselvesPanel({ displayName = "You" }) {
  const [draftType, setDraftType] = useState(POST_TYPES[0])
  const [draftTitle, setDraftTitle] = useState("")
  const [draftBody, setDraftBody] = useState("")
  const [posts, setPosts] = useState([])
  const visiblePosts = useMemo(() => posts, [posts])

  const submitPost = (event) => {
    event.preventDefault()
    const cleanTitle = draftTitle.trim()
    const cleanBody = draftBody.trim()
    if (!cleanTitle || !cleanBody) return
    setPosts((current) => [{
      id: `local-post-${Date.now()}`,
      type: draftType,
      title: cleanTitle,
      body: cleanBody,
      likes: 0,
      reposts: 0
    }, ...current])
    setDraftTitle("")
    setDraftBody("")
    setDraftType(POST_TYPES[0])
  }

  return (
    <section className="dashboard ourselves-page">
      <section className="panel ourselves-hero">
        <p className="eyebrow">Ourselves</p>
        <h2>Post what you choose.</h2>
        <p className="muted">
          Ourselves is for public posts about app guesses, taste profiles, transparency screenshots, and weird algorithm moments.
          Your private Yourself page stays private unless you choose to post something.
        </p>
      </section>

      <section className="panel ourselves-compose">
        <div>
          <p className="eyebrow">Create post</p>
          <h3>{displayName}, choose what becomes public.</h3>
          <p className="muted">Apps do not post your private memory for you. You decide what leaves Yourself.</p>
        </div>
        <form className="form ourselves-form" onSubmit={submitPost}>
          <label>
            Type
            <select value={draftType} onChange={(event) => setDraftType(event.target.value)}>
              {POST_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label>
            Title
            <input value={draftTitle} placeholder="Example: What this app thinks I am" onChange={(event) => setDraftTitle(event.target.value)} />
          </label>
          <label className="wiki-form-wide">
            Post
            <textarea value={draftBody} placeholder="Write the post in your own words." onChange={(event) => setDraftBody(event.target.value)} />
          </label>
          <button type="submit">Post</button>
        </form>
      </section>

      <section className="panel ourselves-feed">
        <div className="wiki-section-head">
          <div>
            <p className="eyebrow">Feed</p>
            <h3>Posts you choose to make public.</h3>
          </div>
          <span className="badge">{visiblePosts.length}</span>
        </div>
        <div className="ourselves-post-list">
          {visiblePosts.map((post) => (
            <article className="ourselves-post" key={post.id}>
              <p className="eyebrow">{post.type}</p>
              <h4>{post.title}</h4>
              <p className="muted">{post.body}</p>
              <div className="ourselves-post-metrics" aria-label="Post metrics">
                <span>{post.likes} likes</span>
                <span>{post.reposts} reposts</span>
              </div>
            </article>
          ))}
          {!visiblePosts.length ? (
            <article className="ourselves-post ourselves-empty-post">
              <p className="eyebrow">No posts yet</p>
              <h4>Your private memory stays in Yourself.</h4>
              <p className="muted">When you want to share a preference card, a funny wrong app guess, or an app-vs-me comparison, create a post here.</p>
            </article>
          ) : null}
        </div>
      </section>
    </section>
  )
}

---
name: comparison_query
triggers:
  - "difference between"
  - "compared to"
  - "versus"
  - "what about x that i haven't seen about"
  - "x vs y"
  - "how does x differ from"
  - "what's unique about"
filters:
  - dual_topic
priority: differential
---
When this skill activates, extract two topics from the query. Find events related to topic A and events related to topic B. Use Ollama synthesis to find what's unique to each. Return differential results grouped by topic.

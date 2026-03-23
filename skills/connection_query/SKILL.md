---
name: connection_query
triggers:
  - "is there a connection between"
  - "how does x relate to"
  - "what links"
  - "is x related to y"
  - "connection between"
  - "what do x and y have in common"
filters:
  - semantic_bridge
priority: connection
---
When this skill activates, find events for both topics. Calculate semantic distance between them. Find bridging events that connect both. Use Ollama to synthesise the connection if available.

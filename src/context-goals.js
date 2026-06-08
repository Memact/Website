export const CONTEXT_GOAL_TEMPLATES = [
  {
    id: "shopping_laptop",
    label: "Laptop shopping",
    examples: ["laptop", "computer", "pc", "gaming", "work machine", "student laptop"],
    group: "Shopping",
    intro: "Memact can collect laptop details once, then apps can ask for the parts you allow",
    fields: [
      { field_path: "shopping.laptop.budget", label: "Budget range", subgroup: "Budget", placeholder: "Example: under ₹80,000" },
      { field_path: "shopping.laptop.main_use", label: "Main use", subgroup: "Laptop needs", placeholder: "Example: coding, college, gaming, design" },
      { field_path: "shopping.laptop.portability", label: "Portability", subgroup: "Laptop needs", placeholder: "Example: light enough for college" },
      { field_path: "shopping.laptop.specs", label: "Expected specs", subgroup: "Laptop needs", placeholder: "Example: 16GB RAM, good battery" },
      { field_path: "shopping.laptop.brands", label: "Brands", subgroup: "Brands", placeholder: "Example: prefer Lenovo, avoid Acer" }
    ]
  },
  {
    id: "fitness_setup",
    label: "Fitness setup",
    examples: ["fitness", "diet", "meal", "workout", "gym", "nutrition"],
    group: "Fitness",
    intro: "Memact can keep fitness basics ready so every health app does not ask from zero",
    fields: [
      { field_path: "fitness.goal", label: "Fitness goal", subgroup: "Goals", placeholder: "Example: lose fat, build muscle, maintain" },
      { field_path: "fitness.activity_level", label: "Activity level", subgroup: "Routine", placeholder: "Example: lightly active" },
      { field_path: "diet.preference", label: "Diet preference", subgroup: "Diet", placeholder: "Example: vegetarian" },
      { field_path: "diet.allergy", label: "Food restrictions", subgroup: "Diet", placeholder: "Example: lactose intolerant, no peanuts" },
      { field_path: "fitness.equipment", label: "Equipment", subgroup: "Routine", placeholder: "Example: dumbbells at home" }
    ]
  },
  {
    id: "learning_setup",
    label: "Learning setup",
    examples: ["learn", "study", "course", "react", "exam", "tutorial"],
    group: "Learning",
    intro: "Memact can remember how you study without every learning app asking again",
    fields: [
      { field_path: "learning.goal", label: "Learning goal", subgroup: "Goals", placeholder: "Example: learn React for projects" },
      { field_path: "learning.current_level", label: "Current level", subgroup: "Level", placeholder: "Example: beginner" },
      { field_path: "learning.study_style", label: "Study style", subgroup: "Style", placeholder: "Example: examples first, then theory" },
      { field_path: "learning.schedule", label: "Study schedule", subgroup: "Routine", placeholder: "Example: weekends only" }
    ]
  },
  {
    id: "identity_setup",
    label: "Identity basics",
    examples: ["name", "username", "language", "email", "profile"],
    group: "Identity",
    intro: "Memact can keep basic identity details under your control",
    fields: [
      { field_path: "identity.preferred_name", label: "Preferred name", subgroup: "Names", placeholder: "Example: Sujay" },
      { field_path: "identity.preferred_username", label: "Preferred username", subgroup: "Usernames", placeholder: "Example: keepsloading" },
      { field_path: "identity.languages.read", label: "Languages you can read", subgroup: "Languages", placeholder: "Example: English, Hindi" },
      { field_path: "identity.languages.write", label: "Languages you can write", subgroup: "Languages", placeholder: "Example: English" },
      { field_path: "identity.languages.speak", label: "Languages you can speak", subgroup: "Languages", placeholder: "Example: Bengali, Hindi" }
    ]
  }
]

export function suggestContextGoal(input) {
  const text = normalize(input)
  if (!text) return null
  let best = null
  let bestScore = 0
  for (const template of CONTEXT_GOAL_TEMPLATES) {
    const score = template.examples.reduce((sum, example) => sum + (text.includes(normalize(example)) ? 1 : 0), 0)
    if (score > bestScore) {
      best = template
      bestScore = score
    }
  }
  return best || CONTEXT_GOAL_TEMPLATES[0]
}

export function findContextValue(entries, fieldPath) {
  const entry = entries.find((item) => item.field_path === fieldPath || item.value?.field_path === fieldPath || Object.hasOwn(item.value || {}, fieldPath))
  if (!entry) return ""
  if (typeof entry.value === "string") return entry.value
  return entry.value?.[fieldPath] || entry.value?.note || entry.value?.value || ""
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim()
}

# FlowSentry 🚦

FlowSentry is an AI-powered workflow risk analysis app built on **Atlassian Forge** for **Jira and Confluence**.

It detects:
- Workflow bottlenecks
- Automation rule conflicts
- Structural workflow risks

…and explains them clearly before they impact delivery.

---

## 🚀 How It Works

1. Ingests Jira events
2. Analyzes workflow structure and timing
3. Detects automation conflicts
4. Computes deterministic risk
5. Generates human-readable explanations

All logic is modular, explainable, and Forge-compatible.

---

## ▶️ Run Demo (No Jira Required)

```bash
npm install
npx ts-node scripts/demo.ts

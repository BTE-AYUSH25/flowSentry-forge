This is a fully advanced, "best-in-class" README for your **FlowSentry 2.0** project. It is specifically tailored for high-impact viewing by GitHub visitors and Atlassian Codegeist judges, emphasizing your hybrid deterministic-AI architecture and Rovo integration.

***

# 🚦 FlowSentry 2.0: Intelligent Workflow Guard
### **The Next-Gen Risk Engine for Jira & Rovo AI**

[![Atlassian Forge](https://img.shields.io/badge/Atlassian-Forge-blue?logo=atlassian&style=flat-square)](https://developer.atlassian.com/platform/forge/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![CodegeistX Submission](https://img.shields.io/badge/Codegeist-Unleashed_2024-purple?style=for-the-badge&logo=atlassian)](https://devpost.com/software/flowsentry-intelligent-workflow-guard-for-jira)

> **"Jira answers 'What happened?' — FlowSentry answers 'What is about to go wrong, and why?'"**
> FlowSentry is a native Atlassian Forge application that detects workflow bottlenecks, structural deadlocks, and automation conflicts before they derail your sprint.

---

## 📖 Table of Contents
- [🚨 Problem Statement](#-problem-statement)
- [💡 The FlowSentry Solution](#-the-flowsentry-solution)
- [🚀 Key Innovations (2.0 Highlights)](#-key-innovations-20-highlights)
- [🏗️ Technical Architecture](#-technical-architecture)
- [🧪 Simulation & What-If Engine](#-simulation--what-if-engine)
- [🤖 Rovo AI Integration](#-rovo-ai-integration)
- [📊 Visual Insights](#-visual-insights)
- [🛠️ Installation & Setup](#-installation--setup)
- [⚖️ Design Decisions](#-design-decisions)
- [📜 License](#-license)

---

## 🚨 Problem Statement
Jira workflows are the heartbeat of delivery, but they often evolve into "Black Boxes."
- **Hidden Cycles:** Issues loop between `REVIEW` and `REWORK` without visibility.
- **Silent Bottlenecks:** A specific state (e.g., `UAT`) consumes 3x more time than average, but metrics only show late delivery.
- **Rule Collisions:** Automated rules override each other, creating race conditions and "stuck" tickets.
- **The Core Gap:** Teams discover delivery risks **after** a sprint failure. 

---

## 💡 The FlowSentry Solution
FlowSentry provides a **native intelligence layer** directly inside the Jira Issue View.

1. **Risk Scoring (0–1):** A weighted, deterministic score based on structure, timing, and automation.
2. **Bottleneck Detection:** Automatically flags states where issues disproportionately accumulate time.
3. **Actionable Recommendations:** Moves beyond data by suggesting concrete fixes (e.g., "Add parallel review path").
4. **Zero Configuration:** Leverages existing Jira workflow data automatically.

---

## 🚀 Key Innovations (2.0 Highlights)
### 🔮 Predictive "What-If" Engine
Move from reactive to proactive. FlowSentry simulates potential workflow changes to project risk reduction.
*   *Example:* "What if we remove the mandatory approval at step 4?" -> **Projected Risk: -22%**

### 🤖 Atlassian Rovo Agent Interface
Query your project’s health in plain English via the Rovo Agent Bridge.
*   *Query:* "Why is our review process slow this month?"
*   *Response:* "Timing analysis shows 42% of issues stall in 'INTERNAL REVIEW' due to a cyclic transition back to 'TODO'."

### 🛡️ Safe Action Pipeline
A validated execution layer that checks for structural safety before suggesting workflow modifications.

---

## 🏗️ Technical Architecture
FlowSentry is built on a **Modular Contract-Based Architecture**, ensuring high auditability and enterprise safety.

![Architecture Infographic](https://raw.githubusercontent.com/BTE-AYUSH25/flowSentry-forge/main/docs/assets/Infographic.png)
*(Note: Replace with your actual repo asset path if needed)*

### **Core Analysis Pipeline**
1.  **Ingestion Module:** Normalizes raw Jira Webhook events.
2.  **Workflow Resolver:** Builds a canonical graph structure of project states.
3.  **Graph Analyzer:** Detects structural flaws (cycles, dead ends, unreachable states).
4.  **Timing Analyzer:** Measures per-state duration averages and standard deviations.
5.  **Risk Engine:** Aggregates findings into a weighted score.

---

## 🤖 Rovo AI Integration
FlowSentry integrates with **Atlassian Rovo** to provide a Natural Language Query (NLQ) interface. 

| Feature | Description |
| :--- | :--- |
| **NLQ Analysis** | Process natural language project queries. |
| **Data Points** | Extracts structured metrics for AI consumption. |
| **Confidence Scoring** | AI responses are weighted against deterministic analysis facts. |

---

## 📊 Visual Insights

### **Jira Native Integration**
FlowSentry renders inside the **Issue Glance** for high-level risk and the **Issue Panel** for deep-dive diagnostics.

![Jira UI Screenshot](https://raw.githubusercontent.com/BTE-AYUSH25/flowSentry-forge/main/docs/assets/Jira_UI_Screenshot.png)
*(Note: Replace with your actual repo asset path if needed)*

---

## 🛠️ Installation & Setup

### **Prerequisites**
- [Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/) installed.
- An Atlassian Cloud site with developer mode enabled.

### **Local Development**
```bash
# 1. Install dependencies without peer-dependency noise
npm install --no-audit --no-fund --legacy-peer-deps

# 2. Run the deterministic demo (No Jira access required)
npm run demo

# 3. Deploy to your Forge site
forge deploy -e development

# 4. Install in your Jira project
forge install
```

---

## ⚖️ Design Decisions & Trade-offs
*   **Deterministic First:** We prioritize observable facts over LLM guesswork. AI is used only for **narrative explanation** and **simulations**, while the Risk Score remains 100% auditable.
*   **Forge-Native:** By building on Forge, we ensure zero data egress. Project data never leaves the Atlassian cloud, making it suitable for security-conscious enterprises.
*   **Hybrid Analysis:** Combining Graph Theory (Structure) + Statistics (Timing) + NLP (Rovo) creates a multi-dimensional view of team velocity.

---

## 🧪 Evaluation Guide for Judges
Judges can verify the technical depth of the project by:
1.  **Running `npm run competition-demo`**: A full walkthrough of the Rovo-Agent-FlowSentry bridge.
2.  **Testing Demo Mode**: Clearly labeled in the UI, this allows evaluation without 3 months of historical Jira data.
3.  **Reviewing `contracts/lock.json`**: Our internal architecture ensures modules are isolated and fail-safe.

---

## 🚀 Future Roadmap
*   **Sprint-level Risk Aggregation:** Summarizing risk across the entire backlog.
*   **Confluence Autopilot:** Weekly workflow health reports generated as Confluence pages.
*   **Custom Risk Weights:** Allowing teams to define what "critical" means for their unique process.

---

## 📜 License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

### **Submission Links**
*   **Devpost:** [FlowSentry Submission](https://devpost.com/software/flowsentry-intelligent-workflow-guard-for-jira)
*   **GitHub Repository:** [BTE-AYUSH25/flowSentry-forge](https://github.com/BTE-AYUSH25/flowSentry-forge)

***

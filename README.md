
---

# 🚦 FlowSentry

### Intelligent Workflow Risk & Bottleneck Analysis for Jira (Forge App)

> **FlowSentry helps teams detect workflow bottlenecks, structural risks, and automation inefficiencies *before* they cause delivery delays — directly inside Jira.**

---

## 📌 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Why Existing Jira Tools Fall Short](#-why-existing-jira-tools-fall-short)
3. [Solution Overview](#-solution-overview)
4. [Key Features](#-key-features)
5. [How FlowSentry Works (Architecture)](#-how-flowsentry-works-architecture)
6. [Risk Scoring Model (Explainable)](#-risk-scoring-model-explainable)
7. [Jira Integration Details](#-jira-integration-details)
8. [Demo Mode (Hackathon Safe)](#-demo-mode-hackathon-safe)
9. [Technology Stack](#-technology-stack)
10. [Local Development & Testing](#-local-development--testing)
11. [How Judges Can Evaluate This App](#-how-judges-can-evaluate-this-app)
12. [Design Decisions & Trade-offs](#-design-decisions--trade-offs)
13. [Future Roadmap](#-future-roadmap)
14. [License](#-license)

---

## ❓ Problem Statement

Jira workflows evolve organically.

Over time, teams add:

* new states
* automation rules
* conditional transitions
* SLA policies

This leads to **hidden systemic problems**:

* Issues get stuck in specific states (e.g. REVIEW)
* Automations conflict or override each other
* Cyclic or inefficient workflows emerge
* Teams realize problems **only after sprint failure**

### ❌ The Core Gap

Jira answers:

> *“What happened?”*

Teams actually need:

> *“What is about to go wrong — and why?”*

---

## 🚫 Why Existing Jira Tools Fall Short

| Tool            | Limitation      |
| --------------- | --------------- |
| Jira Reports    | Historical only |
| Control Charts  | Reactive        |
| Automation Logs | Fragmented      |
| Dashboards      | Manual setup    |
| AI summaries    | Non-explainable |

None of these provide:

* **Workflow-level risk**
* **Explainable bottleneck detection**
* **Actionable recommendations**

---

## ✅ Solution Overview

**FlowSentry** is a **native Atlassian Forge app** that continuously analyzes Jira workflow behavior and surfaces **risk insights directly on each issue**.

It provides:

* A **Risk Score**
* Identified **bottleneck states**
* **Concrete, actionable recommendations**

All inside Jira — no external dashboards.

---

## ✨ Key Features

### 🔍 Workflow Bottleneck Detection

Identifies states where issues disproportionately accumulate time.

### 📊 Risk Scoring (0–1)

Quantifies delivery risk using multiple deterministic signals.

### 🧠 Explainable Analysis

Every output is derived from observable workflow facts — no black box.

### ⚙️ Zero Configuration

Works out-of-the-box with existing Jira projects.

### 🧪 Demo Mode

Safe demonstration without requiring historical Jira data.

---

## 🏗️ How FlowSentry Works (Architecture)

### High-Level Flow

```
Jira Events
   ↓
Event Ingestion (Forge Runtime)
   ↓
Workflow Analysis Engines
   ├─ Graph Analyzer
   ├─ Timing Analyzer
   ├─ Automation Rule Analyzer
   ↓
Risk Scoring Engine
   ↓
Jira Issue UI (Glance + Panel)
```

### Core Design Principle

> **Deterministic first, AI optional later**

This ensures:

* Predictable behavior
* Explainability
* Enterprise safety

---

## 📐 Risk Scoring Model (Explainable)

FlowSentry computes a **Risk Score ∈ [0, 1]** using weighted signals:

| Signal               | Description                   |
| -------------------- | ----------------------------- |
| State Duration       | Time spent per workflow state |
| Bottleneck Density   | Concentration of issues       |
| Workflow Structure   | Cycles / dead ends            |
| Automation Conflicts | Overlapping triggers/actions  |
| SLA Pressure         | Time-based escalation risk    |

### Example Output

```
Risk Score: 0.72
Bottlenecks: REVIEW, IN_PROGRESS
Recommendation: Add parallel review or enforce 24h SLA
```

---

## 🔗 Jira Integration Details

FlowSentry integrates using **Atlassian Forge UI Modules**:

### Issue Glance

* Quick visibility of risk
* Appears in the issue sidebar

### Issue Panel

* Detailed analysis
* Bottlenecks + recommendations

### Forge Resolver Backend

* Secure execution
* Jira-scoped permissions
* No external servers

---

## 🧪 Demo Mode (Hackathon Safe)

To support judge evaluation without historical Jira data:

* FlowSentry includes **Demo Mode**
* Clearly labeled in UI
* Uses realistic simulated signals
* Preserves full analysis flow

This ensures:

* Immediate evaluation
* No manual setup required
* Transparent behavior

---

## 🧰 Technology Stack

| Layer        | Technology             |
| ------------ | ---------------------- |
| Platform     | Atlassian Forge        |
| Language     | TypeScript             |
| Runtime      | Node.js 20             |
| UI           | Forge Custom UI        |
| APIs         | Jira REST API          |
| Architecture | Modular, deterministic |

---

## 🛠️ Local Development & Testing

### Install Dependencies

```bash
npm install
```

### Deploy App

```bash
forge deploy
forge install --upgrade
```

### Demo Without Jira Data

```bash
npm run quick-demo
```

---

## 🧪 How Judges Can Evaluate This App

Judges can verify:

1. App installs successfully on Jira
2. Issue Glance & Panel render correctly
3. Risk score and bottlenecks are shown
4. Demo mode works as documented
5. Logic is explainable and non-trivial

No additional setup required.

---

## ⚖️ Design Decisions & Trade-offs

### Why deterministic analysis?

* Predictability
* Trust
* Auditability

### Why not heavy ML?

* Jira data is sparse & noisy
* Explainability is critical
* ML can be layered later for text explanations

### Why Forge?

* Native security
* Zero data egress
* Seamless Jira UX

---

## 🚀 Future Roadmap

* Sprint-level risk aggregation
* Workflow health dashboards
* Confluence auto-generated reports
* Optional AI-generated explanations (non-decision-making)
* Cross-project workflow comparison



---


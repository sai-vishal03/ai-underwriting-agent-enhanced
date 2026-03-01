# 🚀 AI Merchant Underwriting Agent for GrabCredit & GrabInsurance

An AI-powered merchant underwriting platform that transforms GrabOn’s transaction intelligence into **explainable, risk-calibrated credit and insurance offers**.

This project simulates an NBFC-grade underwriting engine that:

- Assigns risk tiers
- Calculates Probability of Default (PD)
- Computes Expected Loss (EL)
- Applies risk-based pricing
- Evaluates RAROC (Risk-Adjusted Return on Capital)
- Sends pre-approved offers via WhatsApp
- Maintains full audit governance

🌐 **Live Demo:**  
https://ai-underwriting-agent-grabon.vercel.app/

---

# 📌 Strategic Context

GrabOn processes **96M+ annual transactions** across 3,500+ active merchants.

Unlike traditional banks, GrabOn has proprietary behavioral data:

- 12-month GMV momentum
- Refund and return quality
- Customer retention behavior
- Category performance patterns
- Deal redemption velocity

This platform demonstrates how GrabOn can convert that data advantage into a scalable **embedded merchant finance engine** — reducing underwriting from days to seconds.

This is not a dashboard simulation.  
It is a structured behavioral underwriting system.

---

# 🎯 What This System Does

For each merchant, the system:

1. Analyzes 12-month performance data  
2. Calculates composite risk score (0–100)  
3. Assigns Tier (1 / 2 / 3 / Reject)  
4. Estimates Probability of Default (PD)  
5. Computes Expected Loss (EL)  
6. Applies dynamic credit limit multiplier  
7. Prices interest rate via risk curve  
8. Validates RAROC threshold  
9. Generates fully explainable underwriting rationale  
10. Sends structured WhatsApp offer (admin controlled)  
11. Logs all actions for audit compliance  

---

# 🏗 Architecture Overview

```

Merchant Performance Data
↓
Next.js Frontend (TypeScript + Tailwind)
↓
Risk Engine (Deterministic Financial Logic)
↓
Claude AI (Explainability + Structured Narrative)
↓
Decision Layer (Tier + Pricing + Limit)
↓
Admin Governance
↓
WhatsApp Business API (Twilio Sandbox)
↓
Offer Delivery + Audit Logging

```

---

# ⚙️ AI vs Deterministic Logic

To ensure financial rigor:

### Deterministic Components
- Risk Score
- PD calculation
- Expected Loss
- Credit limit
- Interest rate pricing
- RAROC validation
- Exposure management

These are formula-driven and auditable.

### Claude AI is used for:
- Generating structured underwriting explanations
- Referencing specific merchant data points
- Simulating internal credit memos
- Enhancing narrative clarity for non-technical stakeholders

This prevents black-box financial decisions while leveraging LLM reasoning strength.

---

# 📊 Core Financial Models

## 1️⃣ Risk Score (0–100)

Composite weighted score:

```

Risk Score =
0.35 × GMV Momentum

* 0.25 × (100 – Refund Rate Score)
* 0.15 × Customer Retention
* 0.15 × Stability Index
* 0.10 × Profitability Signals

```

Higher score = lower risk.

---

## 2️⃣ Risk Tiering

| Score Range | Tier     | Meaning                     |
|------------|----------|-----------------------------|
| 80–100     | Tier 1   | Low risk, best pricing      |
| 60–79      | Tier 2   | Moderate risk               |
| 40–59      | Tier 3   | Elevated risk               |
| < 40       | Reject   | Not eligible                |

---

## 3️⃣ Probability of Default (PD)

Logistic approximation:

```

PD = 1 / (1 + exp( -( -5 + 0.12 × (100 – Risk Score) ) ))

```

Simulated range:
- Tier 1 → ~2–4%
- Tier 2 → ~6–9%
- Tier 3 → ~11–18%
- Reject → >18%

---

## 4️⃣ Expected Loss (EL)

```

EL = PD × LGD × Exposure

```

Assumptions:
- LGD = 60% (unsecured working capital simulation)

---

## 5️⃣ Risk-Based Pricing

```

Interest Rate = Base Rate + Risk Premium

```

- Base Rate: 14%
- Tier 1 Premium: +0–3%
- Tier 2 Premium: +4–8%
- Tier 3 Premium: +10–18%

---

## 6️⃣ RAROC (Risk-Adjusted Return on Capital)

```

RAROC = (Expected Revenue – Expected Loss – Operating Cost) / Economic Capital

```

Only offers above hurdle rate (18% simulated) are auto-approved.

---

# 📲 Why WhatsApp Delivery?

- 500M+ users in India
- Extremely high open rates (>90%)
- Low friction for merchants
- Supports structured business templates
- Ideal for embedded financial distribution

Admin-only sending ensures:
- Governance
- Compliance simulation
- Audit trail integrity

---

# 🔐 Admin Governance & Compliance

Role-based access control:

| Role        | View | Generate | Send WA | Edit | Override | Logs |
|------------|------|----------|---------|------|----------|------|
| User       | Yes  | Preview  | No      | No   | No       | Limited |
| Admin      | Yes  | Yes      | Yes     | Yes  | Yes      | Full |

System logs:
- Login events
- Merchant onboarding
- Offer generation
- WhatsApp dispatch
- Acceptance simulation
- Overrides

Simulates NBFC governance model.

---

# 🧪 Stress Testing

The system supports:

- Refund spike simulation
- GMV collapse detection
- Tier change recalculation
- Live repricing
- Early delinquency simulation

Demonstrates forward-looking underwriting.

---

# 📁 Project Structure

```

/app
/dashboard        → Merchant UI
/admin            → Admin panel
/login            → Role-based login
/components         → Reusable UI components
/lib
risk-engine.ts    → Scoring + PD + EL logic
pricing.ts        → Interest rate model
exposure.ts       → Capital exposure controls
/utils
logger.ts         → Audit logging

````

---

# ⚖ Trade-offs Made

| Decision | Reason |
|----------|--------|
| Client-side demo logic | Fast iteration + zero infra cost |
| Twilio Sandbox | Rapid WhatsApp integration |
| Static merchant data | Deterministic stress testing |
| Simplified PD | Demo clarity over ML complexity |

---

# 🚀 Production-Grade Extensions

With more time:

- Bureau score API integration (CIBIL/Experian)
- Portfolio capital adequacy tracking
- Real PayU settlement rails
- Monte Carlo stress testing
- ML-based PD training
- Regulatory reporting exports
- Server-side secure underwriting engine

---

# 💻 Local Setup

```bash
git clone https://github.com/sai-vishal03/ai-underwriting-agent-grabon.git
cd ai-underwriting-agent-grabon
npm install
npm run dev
````

Visit:
[http://localhost:3000](http://localhost:3000)

---

# 🏁 Final Positioning

This project demonstrates how GrabOn can convert behavioral transaction intelligence into a scalable merchant finance engine — transforming proprietary data into risk-calibrated capital deployment.

It is designed to survive:

* Executive scrutiny
* Risk committee questioning
* Live stress testing
* Non-technical stakeholder demos

---

# 📜 License

MIT

```

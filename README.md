# 🚀 AI Merchant Underwriting Agent

### GrabCredit & GrabInsurance | AI Labs – Founder’s Office

Live Demo:
👉 [https://ai-underwriting-agent-grabon.vercel.app/](https://ai-underwriting-agent-grabon.vercel.app/)

---

# 📌 Overview

This project is an AI-powered underwriting platform built for GrabOn’s merchant ecosystem.

It evaluates merchant partners and generates **pre-approved working capital loans and insurance offers** using their performance data.

The system is designed to simulate how a real NBFC (Non-Banking Financial Company) would:

* Assess merchant risk
* Price loans dynamically
* Estimate expected losses
* Monitor portfolio exposure
* Send structured financial offers via WhatsApp

This is not just a dashboard.
It is a simplified **credit risk engine**.

---

# 🎯 Why This Matters

GrabOn has a strong data advantage:

* 12 months of GMV history
* Customer return rates
* Refund rates
* Deal performance
* Transaction velocity

Traditional banks do not have this level of platform insight.

This project turns that merchant data into:

* Risk tiers
* Credit limits
* Insurance coverage
* Risk-adjusted pricing
* Explainable underwriting decisions

---

# 🧠 What This System Does

For each merchant, the platform:

1. Analyzes 12-month performance data
2. Calculates a Risk Score (0–100)
3. Assigns Risk Tier (Tier 1 / Tier 2 / Tier 3 / Reject)
4. Calculates:

   * Credit Limit
   * Interest Rate (risk-based pricing)
   * Probability of Default (PD)
   * Expected Loss
   * RAROC (Risk Adjusted Return on Capital)
5. Generates a clear, data-backed explanation
6. Sends a formatted WhatsApp offer (Admin only)

---

# 🏦 Financial Intelligence Engine

The system includes simplified NBFC-grade logic:

## ✅ Risk-Based Pricing

Interest rate increases as risk score decreases.

Base Rate + Risk Premium
Higher risk → Higher pricing

---

## ✅ Probability of Default (PD)

Risk score is converted into estimated default probability using a logistic model.

Higher volatility or refund rate → Higher PD

---

## ✅ Expected Loss (EL)

EL = PD × LGD × Exposure

This estimates potential capital loss.

---

## ✅ RAROC (Profitability Check)

RAROC measures if the loan generates sufficient return after adjusting for risk.

If profitability is too low → flagged for review.

---

## ✅ Early Delinquency Monitoring

After disbursement simulation, the system monitors:

* GMV drop
* Refund spike
* Retention decline

If deterioration is detected → risk metrics are recalculated.

---

# 📊 Dashboard Features

The platform includes:

* Merchant list view
* 12-month GMV momentum visualization
* Risk benchmark comparison
* Risk score breakdown
* Credit & Insurance offer panel
* Accepted offers tracking
* Settlement simulation (24-hour reflection)
* System Outbox (WhatsApp logs)
* Admin System Logs (audit trail)

---

# 🔐 Role-Based Access Control

Two login roles:

## 👤 Normal User

* View merchant data
* View underwriting results
* View explanations
* Cannot send financial offers
* Cannot edit data

## 👨‍💼 Admin

* Add / edit merchants
* Trigger underwriting
* Send WhatsApp offers
* Simulate acceptance & settlement
* View system logs
* Override decisions (committee simulation)

This mirrors real financial governance.

---

# 📜 System Logs (Governance)

Every action is logged:

* Login / Logout
* Merchant added
* Offer generated
* Notification sent
* Offer accepted
* Settlement updated

This simulates enterprise-grade audit compliance.

---

# 📦 Merchant Data Schema

Each merchant includes:

* merchant_id
* category
* monthly_gmv_12m
* coupon_redemption_rate
* unique_customer_count
* customer_return_rate
* avg_order_value
* seasonality_index
* deal_exclusivity_rate
* return_and_refund_rate

---

# 📱 WhatsApp Integration

The system integrates with WhatsApp Business API (sandbox).

Features:

* Structured business notification
* Offer preview before sending
* Persistent notification log
* Multiple merchant tracking

Only Admin can send financial communication.

---

# 🧪 Stress Testing

The system includes stress scenarios such as:

* High refund spike
* Extreme GMV volatility
* Rapid decline in sales
* Seasonal concentration risk
* Low profitability (RAROC below threshold)

This demonstrates real-world underwriting resilience.

---

# 🏗 Tech Stack

* Next.js
* TypeScript
* Tailwind CSS
* Claude (LLM underwriting agent)
* WhatsApp API / Twilio Sandbox
* Vercel Deployment

---

# ⚙️ Getting Started (Local Development)

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

[http://localhost:3000](http://localhost:3000)

---

# 🌍 Deployment

Deployed on Vercel:

[https://ai-underwriting-agent-grabon.vercel.app/](https://ai-underwriting-agent-grabon.vercel.app/)

---

# 💡 Key Highlights

This project demonstrates:

* AI-powered underwriting
* Explainable decisioning
* Risk-based pricing
* Credit risk modeling
* Portfolio exposure management
* Governance & audit logging
* Role-based financial controls

It simulates how embedded lending can be operationalized inside a commerce platform.

---

# 📈 Future Enhancements (Optional)

* Portfolio concentration heatmap
* Monte Carlo stress testing
* Capital adequacy simulation
* Automated risk committee workflow
* Real payment gateway integration

---

# 🏁 Conclusion

This is a production-style simulation of:

AI + Embedded Finance + Risk Governance

Built to demonstrate how GrabOn can transform merchant data into intelligent financial products.

---

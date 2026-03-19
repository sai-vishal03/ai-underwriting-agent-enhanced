# 🚀 Deployment & Live Testing Guide

This guide explains how to deploy the **AI Merchant Underwriting System** and perform a full "Live Test" to verify the production-grade features.

---

## 1. Fast Deployment (Vercel)

The easiest way to see this in action is **Vercel**.

1.  **Push to GitHub**: (Already done if you used the automated script).
2.  **Connect to Vercel**:
    - Go to [vercel.com](https://vercel.com) and click **"Add New" > "Project"**.
    - Select your `ai-underwriting-agent-enhanced` repository.
3.  **Configure Environment Variables**:
    - `DATABASE_URL`: Your PostgreSQL connection string (Neon.tech is free and fast).
    - `JWT_SECRET`: Any random string (e.g., `super-secret-risk-engine-key-2025`).
4.  **Deploy**: Click **Deploy**.

---

## 2. Live Testing Guide (Expected Outcomes)

Follow these 5 steps to verify the "Elite" features:

### Step 1: Bulk Onboarding
- **Action**: Go to **Admin Panel** > **Bulk Upload**.
- **Data**: Upload a JSON file with 5-10 merchants.
- **Expected Outcome**: UI shows "Successfully uploaded X merchants". Metrics dashboard updates immediately.

### Step 2: Underwriting & Risk AI
- **Action**: Open a merchant detail page and click **"Run Underwriting"**. Then click **"Risk Committee Review"**.
- **Expected Outcome**:
    - A deterministic risk score and tier (Tier 1/2/3) appear.
    - An AI-generated memo appears with a **Confidence Score (0-1)** and **Risk Level (LOW/MEDIUM/HIGH)**.
    - **Audit Log**: Go to `/api/admin/logs` (or the Admin view) to see the `UNDERWRITE_RUN` and `RISK_AI_GEN` events recorded.

### Step 3: Idempotent Offer Acceptance
- **Action**: Accept an offer for a merchant. Use the browser "Inspect" tool to see the request headers — notice the `Idempotency-Key`.
- **Test**: Try to click accept again or replay the request.
- **Expected Outcome**: The system returns `idempotent: true` and the existing offer ID instead of creating a duplicate row in the DB.

### Step 4: Background Settlement (The Cron)
- **Action**: Accept a few offers. They will stay in `pending` status.
- **Action**: Trigger the cron manually by visiting `/api/cron/settlement` in your browser.
- **Expected Outcome**: 
    - The browser returns JSON: `{ processed: X, failed: 0, retrying: 0 }`.
    - Merchant status changes from `ACCEPTED` to `SETTLEMENT_COMPLETED` (or similar) after 1 minute.
    - **Audit Log**: `SETTLEMENT_COMPLETED` event is recorded.

### Step 5: Failure & Retry Handling
- **Action**: (Developer Test) Temporarily change your `DATABASE_URL` to an incorrect one and run the cron.
- **Expected Outcome**: 
    - The offer status moves to `retry_pending`.
    - After 3 attempts, it moves to `failed`.
    - Full audit trail shows every retry attempt and the final failure reason.

---

## 📊 Sample Testing Data

You can use the `src/data/merchants.ts` file as a reference for JSON upload, or use this snippet:

```json
[
  {
    "merchant_id": "TEST_M_001",
    "name": "Elite Electronics",
    "category": "Electronics",
    "monthly_gmv_12m": [50, 52, 48, 60, 65, 70, 75, 80, 85, 90, 88, 95],
    "coupon_redemption_rate": 0.15,
    "unique_customer_count": 1200,
    "customer_return_rate": 75,
    "avg_order_value": 4500,
    "seasonality_index": 1.1,
    "deal_exclusivity_rate": 0.8,
    "return_and_refund_rate": 1.2
  }
]
```

---

## 🛠️ Feature Flag Toggling

Test the **ENABLE_RISK_AI_V2** flag:
1.  Set `ENABLE_RISK_AI_V2=false` in your `.env`.
2.  Try to generate a Risk Review.
3.  **Expected Outcome**: The UI/API returns a `503 Service Unavailable` with "AI Risk Review is currently disabled".

---

**This completes the production verification cycle.** 🚀

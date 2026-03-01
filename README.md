Project 07: AI Merchant Underwriting Agent for GrabCredit & GrabInsurance

Aim: Build an AI agent that assesses GrabOn's 3,500 active merchant partners for embedded credit
limits and insurance coverage, generating explainable pre-approved offers delivered via WhatsApp

Why This Matters for GrabOn:
Poonawalla Fincorp's NBFC license enables GrabOn to offer merchant lending. The
underwriting data advantage is enormous: GrabOn has 12 months of GMV, transaction velocity,
deal redemption quality, and customer return rates for every merchant on its platform.
Traditional banks don't have this. This project turns that data into a working credit and insurance
underwriting engine.

Technical Requirements:
• Design a comprehensive merchant profile schema: merchant_id, category,
monthly_gmv_12m (array), coupon_redemption_rate, unique_customer_count,
customer_return_rate, avg_order_value, seasonality_index (peak vs. trough GMV ratio),
deal_exclusivity_rate, return_and_refund_rate
• Build a Claude underwriting agent with two modes: GrabCredit mode (outputs working
capital credit limit in ₹ lakhs, interest rate tier, tenure options) and GrabInsurance mode
(outputs business interruption coverage amount, premium quote, suggested policy type)
• The agent's decisions must be fully explainable: every offer must include a 3-5 sentence
rationale that references specific data points from the merchant's profile — 'We are
offering ₹15L at Tier 2 rates because your GMV has grown 38% YoY, your customer
return rate of 71% indicates demand stability, and your refund rate of 2.1% is below the
category average of 4.8%'
• Build a risk tiering system: Tier 1 (low risk, best rates), Tier 2 (moderate risk, standard
rates), Tier 3 (high risk, requires manual review) — with clear criteria for each tier
• Integrate with WhatsApp Business API (or Twilio sandbox): the agent sends a pre-
approved offer message to the merchant's registered WhatsApp number. Message must
be formatted as a proper business notification, not a text dump
• Build a merchant dashboard showing all 10 sample merchants: offer status, credit limit,
insurance quote, risk tier, and a one-click 'Accept Offer' flow that triggers a mock NACH
mandate

What to Submit:
A working underwriting agent processing 10 diverse merchant profiles (covering Tier 1 through
Tier 3 outcomes, different categories, including at least 2 rejection scenarios with clear
explanations). Live demo of WhatsApp offer delivery for at least 2 merchants.

Here is how you can get started:
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

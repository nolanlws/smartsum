import { db } from "@/server/db";
import {
  invoices,
  oneTimePayments,
  subscriptions,
  users,
} from "@/server/db/schema";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type Readable } from "stream";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const buffer = async (readable: Readable) => {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"]!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`⚠️  Webhook signature verification failed.`, errorMessage);
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.warn(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
  // Handle successful single payment here
  const paymentRecord = await db.query.oneTimePayments.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });
  if (paymentRecord) {
    await db
      .update(oneTimePayments)
      .set({
        status: "succeeded",
      })
      .where({ id: paymentRecord.id });
  }
};

const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  console.log(`PaymentIntent for ${paymentIntent.amount} failed.`);
  // Handle failed single payment here
  const paymentRecord = await db.query.oneTimePayments.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });
  if (paymentRecord) {
    await db.update(oneTimePayments).set({ status: "failed" }).where({
      id: paymentRecord.id,
    });
  }
};

const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  console.log(`Invoice ${invoice.id} payment was successful!`);
  // Handle successful subscription payment here
  const subscriptionRecord = await db.query.subscriptions.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });
  if (subscriptionRecord) {
    await db.insert(users).values({
      userId: subscriptionRecord.userId,
      stripeInvoiceId: invoice.id,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      status: "paid",
      issuedAt: new Date(invoice.created * 1000),
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
    });
  }
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  console.log(`Invoice ${invoice.id} payment failed.`);
  // Handle failed subscription payment here
  const subscriptionRecord = await db.query.subscriptions.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });
  if (subscriptionRecord) {
    await db.insert(invoices).values({
      userId: subscriptionRecord.userId,
      stripeInvoiceId: invoice.id,
      amountDue: invoice.amount_due,
      amountPaid: 0,
      status: "failed",
      issuedAt: new Date(invoice.created * 1000),
    });
  }
};

const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  console.log(`Subscription ${subscription.id} created!`);
  // Handle subscription creation here
  const user = await db.query.users.findFirst({
    where: { stripeCustomerId: subscription.customer as string },
  });
  if (user) {
    await db.insert(subscriptions).values({
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  console.log(`Subscription ${subscription.id} canceled!`);
  // Handle subscription cancellation here
  await db.update(subscriptions).set({ status: "canceled" }).where({
    stripeSubscriptionId: subscription.id,
  });
};

export default webhookHandler;

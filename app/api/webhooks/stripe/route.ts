import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { upsertSubscription, updateSubscriptionStatus } from "@/lib/db";
import { headers } from "next/headers";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing stripe-signature" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        const plan = session.metadata?.plan;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!userId) {
          console.error("No client_reference_id in checkout session");
          break;
        }

        await upsertSubscription({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: plan || "starter",
          status: "active",
        });

        console.log(`Subscription created: ${subscriptionId} for user ${userId}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          await updateSubscriptionStatus(subscriptionId, {
            status: "active",
          });
        }
        console.log(`Payment succeeded: ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          await updateSubscriptionStatus(subscriptionId, {
            status: "past_due",
          });
        }
        console.log(`Payment failed: ${invoice.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        await updateSubscriptionStatus(subscription.id, {
          status: "canceled",
        });
        console.log(`Subscription canceled: ${subscription.id}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        await updateSubscriptionStatus(subscription.id, {
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

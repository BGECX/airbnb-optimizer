import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, locale = "fr", returnUrl } = body;

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json(
        { success: false, error: "Plan invalide" },
        { status: 400 }
      );
    }

    const planData = PLANS[plan as PlanKey];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planData.priceId,
          quantity: 1,
        },
      ],
      // Lien entre Stripe et Clerk
      client_reference_id: userId,
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        plan,
        locale,
        userId,
      },
      automatic_tax: {
        enabled: true,
      },
      billing_address_collection: "required",
      subscription_data: {
        trial_period_days: 7,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur Stripe" },
      { status: 500 }
    );
  }
}

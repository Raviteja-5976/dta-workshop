import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * Handles Webhook events from Razorpay.
 * Verifies the X-Razorpay-Signature using the RAZORPAY_WEBHOOK_SECRET,
 * then maps successful transactions to update payments and registrations.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Razorpay Webhook Error: RAZORPAY_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    // Verify signature using HMAC SHA256 of raw body
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('Razorpay Webhook Warning: Signature verification failed.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`Razorpay Webhook Event Received: ${event}`);

    const supabase = await getAdminClient();

    if (event === 'payment_link.paid' || event === 'payment.captured') {
      let paymentLinkObj = null;
      let paymentObj = null;
      let registrationId = null;
      let paymentLinkId = null;
      let providerPaymentId = null;
      let paymentMethod = null;
      let amountPaid = null;

      if (event === 'payment_link.paid') {
        paymentLinkObj = payload.payload.payment_link.entity;
        paymentObj = payload.payload.payment.entity;
        registrationId = paymentLinkObj.reference_id || paymentLinkObj.notes?.registration_id;
        paymentLinkId = paymentLinkObj.id;
        providerPaymentId = paymentObj.id;
        paymentMethod = paymentObj.method;
        amountPaid = paymentObj.amount / 100; // convert paise to rupees
      } else if (event === 'payment.captured') {
        paymentObj = payload.payload.payment.entity;
        registrationId = paymentObj.notes?.registration_id || paymentObj.description;
        providerPaymentId = paymentObj.id;
        paymentMethod = paymentObj.method;
        amountPaid = paymentObj.amount / 100;
      }

      if (!registrationId) {
        console.warn('Razorpay Webhook Warning: No registration_id found in event payload.');
        return NextResponse.json({ status: 'ok', message: 'No registration_id found' });
      }

      // 1. Find and update the payment record
      const query = supabase.from('payments').select('id, batch_id, amount').eq('registration_id', registrationId);
      if (paymentLinkId) {
        query.eq('provider_order_id', paymentLinkId);
      }
      
      const { data: existingPayment } = await query.maybeSingle();

      if (existingPayment) {
        const { error: payError } = await supabase
          .from('payments')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            provider_payment_id: providerPaymentId,
            payment_method: paymentMethod || 'other',
            amount: amountPaid || existingPayment.amount
          })
          .eq('id', existingPayment.id);

        if (payError) {
          console.error('Failed to update payment status:', payError);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
      } else {
        // Insert new payment row if it doesn't exist
        const { data: reg } = await supabase
          .from('registrations')
          .select('user_id, batch_id')
          .eq('id', registrationId)
          .single();

        if (reg) {
          const { error: payError } = await supabase
            .from('payments')
            .insert({
              registration_id: registrationId,
              user_id: reg.user_id,
              batch_id: reg.batch_id,
              amount: amountPaid || 0,
              currency: 'INR',
              status: 'paid',
              paid_at: new Date().toISOString(),
              provider: 'razorpay',
              provider_order_id: paymentLinkId || null,
              provider_payment_id: providerPaymentId,
              payment_method: paymentMethod || 'other',
              receipt_url: '/admin/payments'
            });

          if (payError) {
            console.error('Failed to insert payment status:', payError);
            return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
          }
        }
      }

      // 2. Confirm the student's registration
      const confirmationCode = `DTA-CONF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const { error: regError } = await supabase
        .from('registrations')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmation_code: confirmationCode
        })
        .eq('id', registrationId);

      if (regError) {
        console.error('Failed to update registration status:', regError);
        return NextResponse.json({ error: 'Database registration update failed' }, { status: 500 });
      }

      console.log(`Successfully confirmed registration ${registrationId} via Razorpay webhook.`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay Webhook Processing Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

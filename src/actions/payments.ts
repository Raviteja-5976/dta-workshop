"use server";

import { assertAdmin } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { createRazorpayPaymentLink } from '@/lib/razorpay';
import { revalidatePath } from 'next/cache';
import { isMock } from '@/lib/supabase/config';
import { sendRegistrationConfirmedEmail } from '@/lib/email/notifications';
import { formatDeadline, isRegistrationClosed } from '@/lib/datetime';

/**
 * Generates a Razorpay Payment Link for a student registration.
 * Saves the pending payment record with reference to the registration.
 */
export async function generateRazorpayLinkAction(
  registrationId: string,
  batchId: string,
  userId: string,
  amount: number,
  customer: { name: string; email: string; phone?: string },
  description: string
) {
  try {
    await assertAdmin();

    // 1. Call Razorpay API helper
    const result = await createRazorpayPaymentLink(registrationId, amount, customer, description);

    if (isMock) {
      // In mock mode, return the simulated checkout URL
      return { success: true, paymentLink: result.short_url, paymentLinkId: result.id };
    }

    const supabase = await getAdminClient();

    // 2. Check if a pending payment record for this registration already exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('registration_id', registrationId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingPayment) {
      // Update existing pending payment with new link details
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          amount: amount,
          provider_order_id: result.id,
          receipt_url: result.short_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPayment.id);

      if (updateError) throw updateError;
    } else {
      // Insert new pending payment record
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          registration_id: registrationId,
          user_id: userId,
          batch_id: batchId,
          amount: amount,
          currency: 'INR',
          status: 'pending',
          provider: 'razorpay',
          provider_order_id: result.id,
          receipt_url: result.short_url
        });

      if (insertError) throw insertError;
    }

    revalidatePath('/admin/payments');
    revalidatePath(`/admin/batches/${batchId}/registrations`);

    return { success: true, paymentLink: result.short_url, paymentLinkId: result.id };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to generate payment link.' };
  }
}

/**
 * Updates a student's registration status.
 * If status is set to 'confirmed', automatically generates a confirmation code.
 */
export async function updateRegistrationStatusAction(registrationId: string, status: string, batchId: string) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();
    const updateData: any = { status };
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
      updateData.confirmation_code = `DTA-CONF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }

    const { error } = await supabase
      .from('registrations')
      .update(updateData)
      .eq('id', registrationId);

    if (error) throw error;

    revalidatePath('/admin/registrations');
    revalidatePath(`/admin/batches/${batchId}/registrations`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update registration.' };
  }
}

/**
 * Simulation helper for testing locally. Marks a pending payment as paid
 * and confirms the student's registration, replicating Razorpay Webhook updates.
 */
export async function mockProcessPaymentAction(registrationId: string, batchId: string) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();
    
    // Find the pending payment for this registration
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('id, user_id')
      .eq('registration_id', registrationId)
      .eq('status', 'pending')
      .maybeSingle();

    if (fetchError) throw fetchError;

    const paymentId = payment?.id;

    // Start simulating webhook actions
    // 1. Update Payment status to paid
    if (paymentId) {
      const { error: payError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          provider_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
          payment_method: 'upi'
        })
        .eq('id', paymentId);
      
      if (payError) throw payError;
    } else {
      // Create a paid payment record if none exists
      // Get user_id from registration
      const { data: reg } = await supabase
        .from('registrations')
        .select('user_id')
        .eq('id', registrationId)
        .maybeSingle();

      if (!reg) {
        throw new Error('Registration not found');
      }
      
      const { error: payError } = await supabase
        .from('payments')
        .insert({
          registration_id: registrationId,
          user_id: reg.user_id,
          batch_id: batchId,
          amount: 999, // default
          currency: 'INR',
          status: 'paid',
          paid_at: new Date().toISOString(),
          provider: 'razorpay',
          provider_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
          payment_method: 'upi',
          receipt_url: '/admin/payments'
        });

      if (payError) throw payError;
    }

    // 2. Update Registration status to confirmed
    const confirmationCode = `DTA-CONF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const { error: regError } = await supabase
      .from('registrations')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmation_code: confirmationCode
      })
      .eq('id', registrationId);

    if (regError) throw regError;

    // Confirmation email (idempotent; best-effort).
    await sendRegistrationConfirmedEmail(registrationId);

    revalidatePath('/admin/payments');
    revalidatePath('/admin/registrations');
    revalidatePath(`/admin/batches/${batchId}/registrations`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mock payment process.' };
  }
}

/**
 * Student-facing action to register for a workshop batch run.
 * Creates a pending registration and generates a Razorpay payment link.
 */
export async function registerStudentAction(batchId: string) {
  try {
    // 1. Get authenticated user from the cookie-based client. The service-role admin
    // client has no session attached, so auth.getUser() would return null there.
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to register.' };
    }

    // Privileged DB reads/writes use the admin (service-role) client to bypass RLS.
    const supabase = await getAdminClient();

    // 2. Fetch batch metadata (price & workshop details)
    const { data: batch, error: batchError } = await supabase
      .from('workshop_batches')
      .select('price, workshop_id, registration_open, registration_deadline, workshops(title)')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return { success: false, error: 'Selected batch not found.' };
    }

    const workshopTitle = (batch.workshops as any)?.title || 'Workshop';
    const amount = Number(batch.price || 999);

    // 3. Check if already registered
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('batch_id', batchId)
      .maybeSingle();

    let registrationId = existingReg?.id;
    let registrationStatus = existingReg?.status;

    if (!existingReg) {
      // Registration window is enforced here, not just in the UI: this action is
      // a public POST endpoint. Students who already hold a registration keep
      // their payment link so a deadline can't strand them mid-checkout.
      if (
        isRegistrationClosed({
          registrationOpen: batch.registration_open,
          registrationDeadline: batch.registration_deadline,
        })
      ) {
        const deadlineText = batch.registration_deadline
          ? ` The deadline was ${formatDeadline(batch.registration_deadline)}.`
          : '';
        return {
          success: false,
          error: `Registrations for this batch are closed.${deadlineText}`,
        };
      }

      // Create pending registration
      const { data: newReg, error: regError } = await supabase
        .from('registrations')
        .insert({
          user_id: user.id,
          batch_id: batchId,
          status: 'pending',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
          email: user.email,
          phone: null
        })
        .select('id, status')
        .single();

      if (regError || !newReg) throw regError || new Error('Failed to record registration.');
      registrationId = newReg.id;
      registrationStatus = newReg.status;
    }

    // If already confirmed, redirect straight to dashboard
    if (registrationStatus === 'confirmed') {
      return { success: true, alreadyConfirmed: true };
    }

    // 4. Generate or fetch pending payment link
    const { data: existingPay } = await supabase
      .from('payments')
      .select('receipt_url')
      .eq('registration_id', registrationId)
      .eq('status', 'pending')
      .maybeSingle();

    let paymentLink = existingPay?.receipt_url;

    if (!paymentLink) {
      const customer = {
        name: user.user_metadata?.full_name || 'Student',
        email: user.email || ''
      };
      
      // Call Razorpay API (will return mock URL in mock mode)
      const result = await createRazorpayPaymentLink(
        registrationId, 
        amount, 
        customer, 
        `Payment for ${workshopTitle}`
      );
      paymentLink = result.short_url;

      // Insert pending payment row
      const { error: payInsertError } = await supabase
        .from('payments')
        .insert({
          registration_id: registrationId,
          user_id: user.id,
          batch_id: batchId,
          amount: amount,
          currency: 'INR',
          status: 'pending',
          provider: 'razorpay',
          provider_order_id: result.id,
          receipt_url: result.short_url
        });

      if (payInsertError) throw payInsertError;
    }

    return { success: true, registrationId, paymentLink };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to complete registration.' };
  }
}

/**
 * Student-facing action to process a mock checkout payment.
 * Security: Validates that the registration belongs to the active logged-in user.
 */
export async function processStudentMockPaymentAction(registrationId: string) {
  try {
    // 1. Get authenticated user from the cookie-based client (see registerStudentAction).
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to complete payment.' };
    }

    const supabase = await getAdminClient();

    // 2. Fetch and verify registration ownership
    const { data: reg, error: regError } = await supabase
      .from('registrations')
      .select('id, user_id, batch_id')
      .eq('id', registrationId)
      .single();

    if (regError || !reg) {
      return { success: false, error: 'Registration not found.' };
    }

    if (reg.user_id !== user.id) {
      return { success: false, error: 'Unauthorized: You do not own this registration.' };
    }

    // 3. Update the payment status to paid
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('registration_id', registrationId)
      .eq('status', 'pending')
      .maybeSingle();

    if (payment) {
      const { error: payUpdateError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          provider_payment_id: `pay_student_mock_${Math.random().toString(36).substring(2, 11)}`,
          payment_method: 'upi'
        })
        .eq('id', payment.id);

      if (payUpdateError) throw payUpdateError;
    }

    // 4. Confirm the registration and generate code
    const confirmationCode = `DTA-CONF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const { error: regUpdateError } = await supabase
      .from('registrations')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmation_code: confirmationCode
      })
      .eq('id', registrationId);

    if (regUpdateError) throw regUpdateError;

    // Confirmation email (idempotent; best-effort).
    await sendRegistrationConfirmedEmail(registrationId);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to process checkout.' };
  }
}


// api/payment-webhook.js
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'crypto';

// Securely initialize the Firebase Admin SDK.
// This block runs only once when the serverless function is initialized.
try {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
} catch (error) {
  // This log is safe as it relates to server configuration, not user data.
  console.error('CRITICAL: Firebase Admin SDK initialization failed.', error.message);
}

const db = getFirestore();

/**
 * Handles incoming payment confirmation webhooks from the PHP server.
 */
export default async function handler(req, res) {
  // Only allow POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 1. Verify the webhook signature to ensure it's from a trusted source.
    const signature = req.headers['x-payment-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ success: false, message: 'Invalid signature.' });
    }

    // 2. Extract the order reference from the request body.
    const { orderReference, status, reference, amount, timestamp } = req.body;

    if (!orderReference) {
      return res.status(400).json({ success: false, message: 'Missing order reference.' });
    }

    // 3. Look up the temporary payment intent in Firestore to find the associated user.
    const intentRef = db.collection('payment_intents').doc(orderReference);
    const intentSnap = await intentRef.get();

    if (!intentSnap.exists) {
        // Log a generic warning without sensitive data.
        console.warn('Webhook received for a non-existent or already processed payment intent.');
        return res.status(404).json({ success: false, message: 'Payment intent not found.' });
    }

    const { userId } = intentSnap.data();
    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID missing from payment intent.' });
    }

    // 4. Only process successful payments.
    if (status !== 'Success') {
        // Optionally mark the intent as failed for tracking purposes.
        await intentRef.update({ status: 'failed' }).catch(() => {});
        return res.status(200).json({ success: true, message: 'Webhook received, payment not successful.'});
    }

    // 5. Perform all database operations in a single atomic batch.
    const paymentRef = db.collection('payments').doc(orderReference);
    const userRef = db.collection('users').doc(userId);
    const batch = db.batch();

    // Create the permanent payment record.
    batch.set(paymentRef, {
      userId,
      status,
      mpesaReference: reference,
      amount,
      createdAt: new Date(timestamp),
    });

    // Update the user's profile to grant premium/verified status.
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    batch.update(userRef, {
        isVerified: true,
        verificationType: 'individual',
        'premium.isVerified': true,
        'premium.status': 'active',
        'premium.plan': 'monthly',
        'premium.expiresAt': subscriptionEndDate,
        'premium.updatedAt': new Date(),
    });

    // Clean up by deleting the temporary payment intent.
    batch.delete(intentRef);

    await batch.commit();

    // 6. Send a success response.
    res.status(200).json({ success: true, message: 'Payment processed and user verified successfully.' });

  } catch (error) {
    // Log a generic error message instead of the full error object.
    console.error('Webhook Error: An unexpected error occurred during payment processing.', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

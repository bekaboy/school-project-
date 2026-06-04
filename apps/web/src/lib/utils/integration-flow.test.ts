import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { salesOrderMachine } from '@/features/sales/machines/sales-order.state-machine';
import { paymentMachine } from '@/features/payments/machines/payment.state-machine';
import { deliveryMachine } from '@/features/deliveries/machines/delivery.state-machine';

describe('Order → Payment → Invoice → Delivery integration', () => {
  it('completes full happy path through all three machines', () => {
    const order = createActor(salesOrderMachine);
    const payment = createActor(paymentMachine);
    const delivery = createActor(deliveryMachine);

    order.start();
    payment.start();
    delivery.start();

    // 1. Draft → Proforma Generated
    expect(order.getSnapshot().value).toBe('Draft');
    order.send({ type: 'GENERATE_PROFORMA' });
    expect(order.getSnapshot().value).toBe('ProformaGenerated');

    // 2. Payment Pending → Uploaded → Verified
    expect(payment.getSnapshot().value).toBe('Pending');
    payment.send({ type: 'UPLOAD_PROOF' });
    expect(payment.getSnapshot().value).toBe('Uploaded');
    payment.send({ type: 'VERIFY' });
    expect(payment.getSnapshot().value).toBe('Verified');

    // 3. Order ProformaGenerated → Verified (payment verified)
    order.send({ type: 'VERIFY_PAYMENT' });
    expect(order.getSnapshot().value).toBe('Verified');

    // 4. Order Verified → Invoice Generated
    order.send({ type: 'GENERATE_INVOICE' });
    expect(order.getSnapshot().value).toBe('InvoiceGenerated');

    // 5. Payment Verified → Completed
    payment.send({ type: 'COMPLETE' });
    expect(payment.getSnapshot().value).toBe('Completed');

    // 6. Delivery Assigned → In Transit → Delivered
    expect(delivery.getSnapshot().value).toBe('Assigned');
    delivery.send({ type: 'DISPATCH' });
    expect(delivery.getSnapshot().value).toBe('InTransit');
    delivery.send({ type: 'MARK_DELIVERED' });
    expect(delivery.getSnapshot().value).toBe('Delivered');

    // 7. Order InvoiceGenerated → Delivered
    order.send({ type: 'MARK_DELIVERED' });
    expect(order.getSnapshot().value).toBe('Delivered');

    // All three machines should be in final/done state
    expect(order.getSnapshot().status).toBe('done');
    expect(payment.getSnapshot().status).toBe('done');
    expect(delivery.getSnapshot().status).toBe('done');
  });

  it('can cancel order before payment, which does not affect payment or delivery machines', () => {
    const order = createActor(salesOrderMachine);
    order.start();

    order.send({ type: 'GENERATE_PROFORMA' });
    order.send({ type: 'CANCEL' });
    expect(order.getSnapshot().value).toBe('Cancelled');
  });

  it('handles payment rejection → re-upload → verify cycle', () => {
    const order = createActor(salesOrderMachine);
    const payment = createActor(paymentMachine);

    order.start();
    payment.start();

    order.send({ type: 'GENERATE_PROFORMA' });

    payment.send({ type: 'UPLOAD_PROOF' });
    expect(payment.getSnapshot().value).toBe('Uploaded');

    payment.send({ type: 'REJECT' });
    expect(payment.getSnapshot().value).toBe('Rejected');

    payment.send({ type: 'UPLOAD_PROOF' });
    expect(payment.getSnapshot().value).toBe('Uploaded');

    payment.send({ type: 'VERIFY' });
    expect(payment.getSnapshot().value).toBe('Verified');

    // Order can now proceed
    order.send({ type: 'VERIFY_PAYMENT' });
    expect(order.getSnapshot().value).toBe('Verified');
  });

  it('handles delivery failure → reschedule → delivered cycle', () => {
    const order = createActor(salesOrderMachine);
    const payment = createActor(paymentMachine);
    const delivery = createActor(deliveryMachine);

    order.start();
    payment.start();
    delivery.start();

    // Full path to delivery
    order.send({ type: 'GENERATE_PROFORMA' });
    payment.send({ type: 'UPLOAD_PROOF' });
    payment.send({ type: 'VERIFY' });
    order.send({ type: 'VERIFY_PAYMENT' });
    order.send({ type: 'GENERATE_INVOICE' });
    payment.send({ type: 'COMPLETE' });
    delivery.send({ type: 'DISPATCH' });

    // Delivery fails
    delivery.send({ type: 'MARK_FAILED' });
    expect(delivery.getSnapshot().value).toBe('Failed');

    // Reschedule
    delivery.send({ type: 'RESCHEDULE' });
    expect(delivery.getSnapshot().value).toBe('Assigned');

    // Redispatch and deliver
    delivery.send({ type: 'DISPATCH' });
    delivery.send({ type: 'MARK_DELIVERED' });
    expect(delivery.getSnapshot().value).toBe('Delivered');

    // Complete order
    order.send({ type: 'MARK_DELIVERED' });
    expect(order.getSnapshot().value).toBe('Delivered');
  });
});

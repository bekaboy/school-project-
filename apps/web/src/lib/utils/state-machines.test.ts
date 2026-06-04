import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { salesOrderMachine } from '@/features/sales/machines/sales-order.state-machine';
import { paymentMachine } from '@/features/payments/machines/payment.state-machine';
import { deliveryMachine } from '@/features/deliveries/machines/delivery.state-machine';

function createTestActor(machine: ReturnType<typeof setup.createMachine>) {
  const actor = createActor(machine);
  actor.start();
  return actor;
}

describe('salesOrderMachine', () => {
  it('starts in Draft state', () => {
    const actor = createTestActor(salesOrderMachine);
    expect(actor.getSnapshot().value).toBe('Draft');
  });

  it('transitions Draft → ProformaGenerated on GENERATE_PROFORMA', () => {
    const actor = createTestActor(salesOrderMachine);
    actor.send({ type: 'GENERATE_PROFORMA' });
    expect(actor.getSnapshot().value).toBe('ProformaGenerated');
  });

  it('transitions Draft → Cancelled on CANCEL', () => {
    const actor = createTestActor(salesOrderMachine);
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('Cancelled');
  });

  it('transitions ProformaGenerated → Verified on VERIFY_PAYMENT', () => {
    const actor = createTestActor(salesOrderMachine);
    actor.send({ type: 'GENERATE_PROFORMA' });
    actor.send({ type: 'VERIFY_PAYMENT' });
    expect(actor.getSnapshot().value).toBe('Verified');
  });

  it('transitions Verified → InvoiceGenerated on GENERATE_INVOICE', () => {
    const actor = createTestActor(salesOrderMachine);
    actor.send({ type: 'GENERATE_PROFORMA' });
    actor.send({ type: 'VERIFY_PAYMENT' });
    actor.send({ type: 'GENERATE_INVOICE' });
    expect(actor.getSnapshot().value).toBe('InvoiceGenerated');
  });

  it('transitions InvoiceGenerated → Delivered on MARK_DELIVERED', () => {
    const actor = createTestActor(salesOrderMachine);
    actor.send({ type: 'GENERATE_PROFORMA' });
    actor.send({ type: 'VERIFY_PAYMENT' });
    actor.send({ type: 'GENERATE_INVOICE' });
    actor.send({ type: 'MARK_DELIVERED' });
    expect(actor.getSnapshot().value).toBe('Delivered');
  });

  it('reaches final Delivered state and is done', () => {
    const actor = createTestActor(salesOrderMachine);
    actor.send({ type: 'GENERATE_PROFORMA' });
    actor.send({ type: 'VERIFY_PAYMENT' });
    actor.send({ type: 'GENERATE_INVOICE' });
    actor.send({ type: 'MARK_DELIVERED' });
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('can cancel from multiple states', () => {
    const actor = createTestActor(salesOrderMachine);
    actor.send({ type: 'GENERATE_PROFORMA' });
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('Cancelled');
  });

  it('full lifecycle Draft → Delivered', () => {
    const actor = createTestActor(salesOrderMachine);
    expect(actor.getSnapshot().value).toBe('Draft');
    actor.send({ type: 'GENERATE_PROFORMA' });
    expect(actor.getSnapshot().value).toBe('ProformaGenerated');
    actor.send({ type: 'VERIFY_PAYMENT' });
    expect(actor.getSnapshot().value).toBe('Verified');
    actor.send({ type: 'GENERATE_INVOICE' });
    expect(actor.getSnapshot().value).toBe('InvoiceGenerated');
    actor.send({ type: 'MARK_DELIVERED' });
    expect(actor.getSnapshot().value).toBe('Delivered');
  });
});

describe('paymentMachine', () => {
  it('starts in Pending state', () => {
    const actor = createTestActor(paymentMachine);
    expect(actor.getSnapshot().value).toBe('Pending');
  });

  it('transitions Pending → Uploaded on UPLOAD_PROOF', () => {
    const actor = createTestActor(paymentMachine);
    actor.send({ type: 'UPLOAD_PROOF' });
    expect(actor.getSnapshot().value).toBe('Uploaded');
  });

  it('transitions Uploaded → Verified on VERIFY', () => {
    const actor = createTestActor(paymentMachine);
    actor.send({ type: 'UPLOAD_PROOF' });
    actor.send({ type: 'VERIFY' });
    expect(actor.getSnapshot().value).toBe('Verified');
  });

  it('transitions Uploaded → Rejected on REJECT', () => {
    const actor = createTestActor(paymentMachine);
    actor.send({ type: 'UPLOAD_PROOF' });
    actor.send({ type: 'REJECT' });
    expect(actor.getSnapshot().value).toBe('Rejected');
  });

  it('can re-upload from Rejected state', () => {
    const actor = createTestActor(paymentMachine);
    actor.send({ type: 'UPLOAD_PROOF' });
    actor.send({ type: 'REJECT' });
    actor.send({ type: 'UPLOAD_PROOF' });
    expect(actor.getSnapshot().value).toBe('Uploaded');
  });

  it('transitions Verified → Completed on COMPLETE', () => {
    const actor = createTestActor(paymentMachine);
    actor.send({ type: 'UPLOAD_PROOF' });
    actor.send({ type: 'VERIFY' });
    actor.send({ type: 'COMPLETE' });
    expect(actor.getSnapshot().value).toBe('Completed');
  });
});

describe('deliveryMachine', () => {
  it('starts in Assigned state', () => {
    const actor = createTestActor(deliveryMachine);
    expect(actor.getSnapshot().value).toBe('Assigned');
  });

  it('transitions Assigned → InTransit on DISPATCH', () => {
    const actor = createTestActor(deliveryMachine);
    actor.send({ type: 'DISPATCH' });
    expect(actor.getSnapshot().value).toBe('InTransit');
  });

  it('transitions InTransit → Delivered on MARK_DELIVERED', () => {
    const actor = createTestActor(deliveryMachine);
    actor.send({ type: 'DISPATCH' });
    actor.send({ type: 'MARK_DELIVERED' });
    expect(actor.getSnapshot().value).toBe('Delivered');
  });

  it('transitions InTransit → Failed on MARK_FAILED', () => {
    const actor = createTestActor(deliveryMachine);
    actor.send({ type: 'DISPATCH' });
    actor.send({ type: 'MARK_FAILED' });
    expect(actor.getSnapshot().value).toBe('Failed');
  });

  it('can reschedule from Failed → Assigned', () => {
    const actor = createTestActor(deliveryMachine);
    actor.send({ type: 'DISPATCH' });
    actor.send({ type: 'MARK_FAILED' });
    actor.send({ type: 'RESCHEDULE' });
    expect(actor.getSnapshot().value).toBe('Assigned');
  });

  it('can cancel from Assigned state', () => {
    const actor = createTestActor(deliveryMachine);
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('Cancelled');
  });

  it('can cancel from Failed state', () => {
    const actor = createTestActor(deliveryMachine);
    actor.send({ type: 'DISPATCH' });
    actor.send({ type: 'MARK_FAILED' });
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('Cancelled');
  });
});

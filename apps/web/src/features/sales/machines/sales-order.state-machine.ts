import { setup } from 'xstate';

export const salesOrderMachine = setup({
  types: {
    events: {} as
      | { type: 'GENERATE_PROFORMA' }
      | { type: 'VERIFY_PAYMENT' }
      | { type: 'CANCEL' }
      | { type: 'GENERATE_INVOICE' }
      | { type: 'MARK_DELIVERED' },
  },
}).createMachine({
  id: 'salesOrder',
  initial: 'Draft',
  states: {
    Draft: {
      on: {
        GENERATE_PROFORMA: 'ProformaGenerated',
        CANCEL: 'Cancelled',
      },
    },
    ProformaGenerated: {
      on: {
        VERIFY_PAYMENT: 'Verified',
        CANCEL: 'Cancelled',
      },
    },
    Verified: {
      on: {
        GENERATE_INVOICE: 'InvoiceGenerated',
      },
    },
    InvoiceGenerated: {
      on: {
        MARK_DELIVERED: 'Delivered',
        CANCEL: 'Cancelled',
      },
    },
    Delivered: { type: 'final' },
    Cancelled: { type: 'final' },
  },
});

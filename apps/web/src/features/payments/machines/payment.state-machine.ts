import { setup } from 'xstate';

export const paymentMachine = setup({
  types: {
    events: {} as
      | { type: 'UPLOAD_PROOF' }
      | { type: 'VERIFY' }
      | { type: 'REJECT'; reason?: string }
      | { type: 'COMPLETE' },
  },
}).createMachine({
  id: 'payment',
  initial: 'Pending',
  states: {
    Pending: {
      on: {
        UPLOAD_PROOF: 'Uploaded',
      },
    },
    Uploaded: {
      on: {
        VERIFY: 'Verified',
        REJECT: 'Rejected',
      },
    },
    Verified: {
      on: {
        COMPLETE: 'Completed',
      },
    },
    Rejected: {
      on: {
        UPLOAD_PROOF: 'Uploaded',
      },
    },
    Completed: { type: 'final' },
  },
});

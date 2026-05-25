import { setup } from 'xstate';

export const deliveryMachine = setup({
  types: {
    events: {} as
      | { type: 'DISPATCH' }
      | { type: 'MARK_DELIVERED' }
      | { type: 'MARK_FAILED'; reason?: string }
      | { type: 'RESCHEDULE' }
      | { type: 'CANCEL' },
  },
}).createMachine({
  id: 'delivery',
  initial: 'Assigned',
  states: {
    Assigned: {
      on: {
        DISPATCH: 'InTransit',
        CANCEL: 'Cancelled',
      },
    },
    InTransit: {
      on: {
        MARK_DELIVERED: 'Delivered',
        MARK_FAILED: 'Failed',
      },
    },
    Delivered: { type: 'final' },
    Failed: {
      on: {
        RESCHEDULE: 'Assigned',
        CANCEL: 'Cancelled',
      },
    },
    Cancelled: { type: 'final' },
  },
});

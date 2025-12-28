import { loadStripe } from '@stripe/stripe-js';

// Use environment variable in real app, hardcode for now to match H5
export const stripePromise = loadStripe('pk_test_51She9JRAsmOrZbpaBm1TyoYwoakMuLEH7cTlFVmfTUBc1aDDTn8s0wNt42VvfkorBq9zbI72r81jgkOXVACVnXmD00XeM6o5Ix');

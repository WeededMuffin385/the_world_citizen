// Placeholder pricing and benefits. Replace these before enabling subscriptions.
export const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        description: 'A simple way to start exploring.',
        featureHeading: 'The essentials:',
        features: [
            'Explore countries and destinations',
            'Basic trip planning tools',
            'Save one upcoming journey',
            'Community travel tips',
        ],
    },
    {
        id: 'plus',
        name: 'Plus',
        price: 10,
        description: 'More freedom for your next adventure.',
        featureHeading: 'Everything in Free, plus:',
        features: [
            'Save multiple journeys',
            'Personalized itinerary suggestions',
            'Advanced travel preferences',
            'Download trip plans for offline use',
            'Priority support',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 25,
        description: 'Extra flexibility for frequent travellers.',
        featureHeading: 'Everything in Plus, plus:',
        features: [
            'Unlimited saved journeys',
            'Detailed itineraries for longer trips',
            'Plan trips across multiple countries',
            'Collaborate with travel companions',
            'Early access to new planning tools',
            'Dedicated travel planning support',
        ],
    },
] as const;

export type PlanId = (typeof PLANS)[number]['id'];

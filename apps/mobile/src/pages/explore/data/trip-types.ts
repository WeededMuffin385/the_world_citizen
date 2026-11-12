// Broad activity categories informed by G Adventures and Intrepid travel themes.
export const TRIP_TYPES = [
    {id: 'active', name: 'Active adventure', description: 'Hiking, cycling, kayaking, and other outdoor activities.'},
    {id: 'culture', name: 'Culture & sightseeing', description: 'Landmarks, museums, history, and local traditions.'},
    {id: 'relaxation', name: 'Beach & relaxation', description: 'Slow-paced stays, beaches, and time to unwind.'},
    {id: 'wellness', name: 'Wellness retreat', description: 'Yoga, spa experiences, meditation, and recovery.'},
    {id: 'wildlife', name: 'Nature & wildlife', description: 'Safaris, national parks, and wildlife watching.'},
    {id: 'food', name: 'Food & local flavors', description: 'Markets, cooking classes, and regional cuisine.'},
    {id: 'road-trip', name: 'Road trip & touring', description: 'Scenic drives and journeys between multiple destinations.'},
] as const;

export type TripTypeId = typeof TRIP_TYPES[number]['id'];

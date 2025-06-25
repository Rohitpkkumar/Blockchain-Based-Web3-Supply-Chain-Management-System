// Create a new file src/events.ts
type EventType = 'blockchainUpdate';
type Callback = () => void;

const events = new Map<EventType, Callback[]>();

export function subscribe(event: EventType, callback: Callback) {
  if (!events.has(event)) {
    events.set(event, []);
  }
  events.get(event)?.push(callback);
}

export function emit(event: EventType) {
  events.get(event)?.forEach(cb => cb());
}

// Then in your contract interaction functions (addPartner, createOrder, etc.):
import { emit } from './events';

// After successful transaction:
emit('blockchainUpdate');

// In your components:
useEffect(() => {
  const loadData = async () => {
    // ... your data loading logic
  };
  
  loadData();
  subscribe('blockchainUpdate', loadData);
  
  return () => {
    // Cleanup if needed
  };
}, []);
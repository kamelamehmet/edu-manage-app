import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://localhost:8090');
pb.autoCancellation(false); // disable auto cancellation of pending requests on route change
// optional: attach hook to keep authentication across reloads (PB stores in localStorage automatically)
export default pb;

import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://localhost:8090');

// optional: attach hook to keep authentication across reloads (PB stores in localStorage automatically)
export default pb;

import PocketBase from 'pocketbase'

const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'

// singleton client
const pb = new PocketBase(PB_URL)

export function getClient() {
  return pb
}

export async function loginWithEmail(email: string, password: string) {
  const authData = await pb.collection('users').authWithPassword(email, password)
  return authData
}

export function logout() {
  pb.authStore.clear()
}

export function currentUser() {
  return pb.authStore.model
}

export default pb

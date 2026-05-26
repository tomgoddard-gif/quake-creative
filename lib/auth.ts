'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const CREDENTIALS: Record<string, { password: string; role: 'admin' | 'client' }> = {
  [process.env.ADMIN_EMAIL ?? 'admin@accelerate.com']: {
    password: process.env.ADMIN_PASSWORD ?? '',
    role: 'admin',
  },
  [process.env.CLIENT_EMAIL ?? 'team@quake.pt']: {
    password: process.env.CLIENT_PASSWORD ?? '',
    role: 'client',
  },
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = (formData.get('email') as string)?.toLowerCase().trim()
  const password = formData.get('password') as string

  const user = CREDENTIALS[email]
  if (!user || (user.password && user.password !== password)) {
    return { error: 'Invalid email or password.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('role', user.role, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  cookieStore.set('email', email, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  redirect(user.role === 'admin' ? '/ideas' : '/briefs')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('role')
  cookieStore.delete('email')
  redirect('/login')
}

export async function getRole(): Promise<'admin' | 'client' | null> {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  if (role === 'admin' || role === 'client') return role
  return null
}

export async function getEmail(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('email')?.value ?? null
}

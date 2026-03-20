'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="btn-danger px-3 py-1.5 text-xs md:text-sm"
    >
      Sign Out
    </button>
  )
}

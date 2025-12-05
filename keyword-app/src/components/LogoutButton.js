'use client';

import { signOut } from '@/app/api/auth/[...nextauth]/route';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-gray-400 hover:text-white transition-colors text-sm"
    >
      Logout
    </button>
  );
}


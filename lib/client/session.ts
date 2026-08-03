'use client';

import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';

export async function setSessionCookie() {
    const user = auth.currentUser;

    if (!user) return;

    const token = await getIdToken(user, true);

    document.cookie =
        `__session=${token}; path=/; max-age=86400; SameSite=Lax${
            window.location.protocol === 'https:' ? '; Secure' : ''
        }`;
}

export function clearSessionCookie() {
    document.cookie =
        '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
}
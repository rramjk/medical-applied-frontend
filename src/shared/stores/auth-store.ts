'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appConfig } from '@/shared/config/app';
import {
    clearPersistedAuth,
    getAuthIdentity,
    setAccessToken,
} from '@/shared/lib/auth';
import type { AuthIdentity } from '@/shared/types/api';

interface AuthState {
    token: string | null;
    identity: AuthIdentity | null;
    setToken: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            identity: null,

            setToken: (token) => {
                setAccessToken(token);

                set({
                    token,
                    identity: getAuthIdentity(token),
                });
            },

            logout: () => {
                clearPersistedAuth();

                set({
                    token: null,
                    identity: null,
                });
            },
        }),
        {
            name: appConfig.storageKeys.auth,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                token: state.token,
                identity: state.identity,
            }),
        },
    ),
);
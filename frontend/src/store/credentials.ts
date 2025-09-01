import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCloudStorageProvider } from '../storage';
import type { Credentials } from '../types'

type CredentialsState = {
    isPending: boolean;
    credentials: Credentials,
}

interface CredentialsActions {
    setCredentials: (credentials: Credentials) => void;
    isSet: () => boolean;
    clearAll: () => void;
}

export const useCredentialsStore = createStore<CredentialsState & CredentialsActions>()(
    persist(
        (set, get) => ({
            isPending: false,
            credentials: {
                first_name: null,
                last_name: null,
                phone_number: null
            },
            setCredentials: (credentials) =>
                set({
                    credentials
                }),
            isSet: () => {
                return Boolean(get().credentials.first_name || get().credentials.phone_number)
            },
            clearAll: () => set({
                credentials: {
                    first_name: null,
                    last_name: null,
                    phone_number: null
                },
            }),
        }),
        {
            name: 'credentials',
            storage: createJSONStorage(getCloudStorageProvider),
            partialize: ({ credentials }) => ({ credentials }),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as CredentialsState || {};
                return {
                    ...currentState,
                    credentials:
                        persisted.credentials && Object.keys(persisted.credentials).length > 0
                            ? persisted.credentials
                            : currentState.credentials,
                };

            },
        }
    )
)

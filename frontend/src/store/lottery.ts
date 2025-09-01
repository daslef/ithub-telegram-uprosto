import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';

import { getCloudStorageProvider } from '../storage';
import type { LotteryDatetime, LotteryStorage, Credentials } from '../types'

type LotteryState = {
    isPending: boolean;
} & LotteryStorage

interface LotteryActions {
    setDatetime: (datetime: LotteryDatetime) => void;
    setCredentials: (credentials: Credentials) => void;
    clearAll: () => void;
}

export const useLotteryStore = createStore<LotteryState & LotteryActions>()(
    devtools(
        persist(
            (set, _) => ({
                isPending: false,
                date: null,
                time: null,
                first_name: null,
                last_name: null,
                phone_number: null,
                setDatetime: ({ date, time }) =>
                    set({
                        date,
                        time
                    }),
                setCredentials: ({ first_name, last_name, phone_number }) =>
                    set({
                        first_name, last_name, phone_number
                    }),
                clearAll: () => set({
                    date: null,
                    time: null,
                    first_name: null,
                    last_name: null,
                    phone_number: null,
                }),
            }),
            {
                name: 'lottery',
                storage: createJSONStorage(getCloudStorageProvider),
                partialize: ({ date, time, first_name, last_name, phone_number }) => ({ date, time, first_name, last_name, phone_number }),
                onRehydrateStorage: () => {
                    console.log('[storage]: hydration starts');

                    return (_, error) => {
                        if (error) {
                            console.log('[Notes storage]: an error happened during hydration', error);
                        } else {
                            console.log('[Notes storage]: hydration finished');
                        }
                    };
                },
                merge: (persistedState, currentState) => {
                    const persisted = persistedState as LotteryState || {};
                    return {
                        ...currentState,
                        date: persisted.date ?? currentState.date,
                        time: persisted.time ?? currentState.time,
                        first_name: persisted.first_name ?? currentState.first_name,
                        last_name: persisted.last_name ?? currentState.last_name,
                        phone_number: persisted.phone_number ?? currentState.phone_number,
                    };
                },
            }
        )
    )
);

export const clearAll = () => useLotteryStore.persist.clearStorage();
export const rehydrateNotes = () => useLotteryStore.persist.rehydrate();

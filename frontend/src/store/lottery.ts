import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCloudStorageProvider } from '../storage';
import { isDatetimePassed } from '../utils/time';
import type { LotteryDatetime } from '../types'

type LotteryState = {
    isPending: boolean;
    hasBeenSent: boolean;
    date: string | null;
    time: string | null;
}

interface LotteryActions {
    setDatetime: (datetime: LotteryDatetime) => void;
    hasBeenPassed: () => boolean;
    clearAll: () => void;
    markAsSent: () => void;
}

export const useLotteryStore = createStore<LotteryState & LotteryActions>()(
    persist(
        (set, get) => ({
            isPending: false,
            hasBeenSent: false,
            date: null,
            time: null,
            setDatetime: ({ date, time }) => set({
                date,
                time
            }),
            hasBeenPassed: () => {
                const date = get().date
                const time = get().time
                if (date !== null && time !== null) {
                    return isDatetimePassed(date, time)
                }
                return false
            },
            clearAll: () => set({
                date: null,
                time: null,
                hasBeenSent: false
            }),
            markAsSent: () => set({
                hasBeenSent: true
            })
        }),
        {
            name: 'lottery',
            storage: createJSONStorage(getCloudStorageProvider),
            partialize: (state) => ({ date: state.date, time: state.time, hasBeenSent: state.hasBeenSent }),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as LotteryState || {};
                return {
                    ...currentState,
                    date: persisted.date ?? currentState.date,
                    time: persisted.time ?? currentState.time,
                    hasBeenSent: persisted.hasBeenSent ?? currentState.hasBeenSent
                };
            },
        }
    )
)

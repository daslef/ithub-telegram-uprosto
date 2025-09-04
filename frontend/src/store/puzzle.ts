import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCloudStorageProvider } from '../storage';
import type { PuzzleStorage, PuzzleItem, CategoryId } from '../types'

interface PuzzleState {
    isPending: boolean;
    hasBeenSent: boolean;
    items: PuzzleStorage;
}

interface PuzzleActions {
    addItem: (id: CategoryId, puzzleItem: PuzzleItem) => void;
    updateItemById: (id: CategoryId, updatedPuzzleItem: Partial<PuzzleItem>) => void;
    getItemById: (id: CategoryId) => PuzzleItem | undefined;
    clearAll: () => void;
    completedIds: () => CategoryId[];
    markAsSent: () => void;
}

export const usePuzzleStore = createStore<PuzzleState & PuzzleActions>()(
    persist(
        (set, get) => ({
            isPending: false,
            hasBeenSent: false,
            items: {},
            addItem: (id, puzzleItem) =>
                set((state) => {
                    return { items: { ...state.items, [id]: puzzleItem } };
                }),
            updateItemById: (id, updatedPuzzleItem) =>
                set((state) => ({
                    items: { ...state.items, [id]: { ...state.items[id], ...updatedPuzzleItem } }
                })),
            getItemById: (id) => get().items[id],
            clearAll: () => set({ items: {}, hasBeenSent: false }),
            completedIds: () => Object.keys(get().items),
            markAsSent: () => set({ hasBeenSent: true })
        }),
        {
            name: 'puzzle',
            storage: createJSONStorage(getCloudStorageProvider),
            partialize: ({ items, hasBeenSent }) => ({ items, hasBeenSent }),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as PuzzleState || {};
                return {
                    ...currentState,
                    items:
                        persisted.items && Object.keys(persisted.items).length > 0
                            ? persisted.items
                            : currentState.items,
                    hasBeenSent:
                        persisted.hasBeenSent ?? currentState.hasBeenSent
                };
            },
        }
    )
)

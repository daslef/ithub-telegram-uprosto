import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';

import { getCloudStorageProvider } from '../storage';
import type { PuzzleStorage, PuzzleItem, CategoryId } from '../types'

interface PuzzleState {
    isPending: boolean;
    items: PuzzleStorage;
}

interface PuzzleActions {
    addItem: (id: CategoryId, puzzleItem: PuzzleItem) => void;
    updateItemById: (id: CategoryId, updatedPuzzleItem: Partial<PuzzleItem>) => void;
    getItemById: (id: CategoryId) => PuzzleItem | undefined;
    clearAll: () => void;
    completedIds: () => CategoryId[];
}

export const usePuzzleStore = createStore<PuzzleState & PuzzleActions>()(
    devtools(
        persist(
            (set, get) => ({
                isPending: false,
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
                clearAll: () => set({ items: {} }),
                completedIds: () => Object.keys(get().items),
            }),
            {
                name: 'puzzle',
                storage: createJSONStorage(getCloudStorageProvider),
                partialize: ({ items }) => ({ items }),
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
                    const persisted = persistedState as PuzzleState || {};
                    return {
                        ...currentState,
                        items:
                            persisted.items && Object.keys(persisted.items).length > 0
                                ? persisted.items
                                : currentState.items,
                    };
                },
            }
        )
    )
);

export const clearAll = () => usePuzzleStore.persist.clearStorage();
export const rehydratePuzzle = () => usePuzzleStore.persist.rehydrate();

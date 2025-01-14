import { atom } from 'jotai';

export const oneLevelTabSelectIdxAtom = atom<number>(0);

export const oneLevelMenuExpandAtom = atom<boolean>(false);

export const pageAtom = atom<number>(1);
export const totalPageAtom = atom<number>(1);

export const viewModeAtom = atom<'pagination' | 'infinite'>('pagination');

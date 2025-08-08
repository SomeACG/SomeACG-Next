import { atom } from 'jotai';

export const oneLevelTabSelectIdxAtom = atom<number>(0);

export const oneLevelMenuExpandAtom = atom<boolean>(false);

export const pageAtom = atom<number>(1);
export const totalPageAtom = atom<number>(1);

export const viewModeAtom = atom<'pagination' | 'infinite'>('infinite');

// 画廊设置
export interface GallerySetting {
  columns: number | 'auto';
}

export const gallerySettingAtom = atom<GallerySetting>({
  columns: 'auto',
});

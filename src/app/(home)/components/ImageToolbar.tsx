import { FaArrowRotateRight, FaCircleMinus, FaCirclePlus } from 'react-icons/fa6';

interface ImageToolbarProps {
  onRotate: (rotate: number) => void;
  onScale: (scale: number) => void;
  rotate: number;
  scale: number;
}

export function ImageToolbar({ onRotate, onScale, rotate, scale }: ImageToolbarProps) {
  return (
    <>
      <FaArrowRotateRight className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onRotate(rotate + 90)} />
      <FaCirclePlus className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onScale(scale + 1)} />
      <FaCircleMinus className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onScale(scale - 1)} />
    </>
  );
}

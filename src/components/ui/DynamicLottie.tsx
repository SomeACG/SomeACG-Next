import dynamic from 'next/dynamic';

// 动态导入Lottie组件，禁用SSR
const DynamicLottie = dynamic(() => import('@lottielab/lottie-player/react').then((mod) => mod.default), { ssr: false });

export default DynamicLottie;

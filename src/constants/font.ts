import { Averia_Libre, Poppins } from 'next/font/google';

export const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poppins' });
export const averia  = Averia_Libre({ subsets: ['latin'], weight: ['400'], variable: '--font-averia' });

export const fontVariants = [poppins.className, poppins.variable, averia.variable];

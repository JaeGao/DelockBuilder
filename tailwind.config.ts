import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {

    extend: {
      fontFamily: {
        'Deadlock-black': ['var(--font-Deadlock-black)'],
        'Deadlock-shop' : ['var(--font-Deadlock-Retail)'],
        'Deadlock-tooltip': ['var(--font-Deadlock-Retail-reg)'],
      },
      colors: {
        'custom-beige': '#f0debf',
        'custom-bg': '#0d1015',
        'custom-wbg1': '#513616',
        'custom-wbg2': '#432b10',
        'custom-vbg1': '#3f6608',
        'custom-vbg2': '#345506',
        'custom-sbg1': '#301844',
        'custom-sbg2': '#261137',
      },
      screens: {
        'lg' : '1120px',
        '2xl': '1300px',
      },
    },
  },
  plugins: [],
};
export default config;
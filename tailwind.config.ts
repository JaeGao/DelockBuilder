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
      },
      colors: {
        'custom-beige': '#f0debf',
        'custom-bg': '#0d1015',
      },
    },
  },
  plugins: [],
};
export default config;
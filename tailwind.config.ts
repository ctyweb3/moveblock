import type { Config } from "tailwindcss";

const config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            animation: {
                pulse: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: ["light", "dark"],
    },
} as any;

export default config; 
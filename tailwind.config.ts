import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        "text-primary": "hsl(0 0% 9%)",
        "text-secondary": "hsl(0 0% 32%)",
        "text-muted": "hsl(0 0% 45%)",
        "border-light": "hsl(0 0% 94%)",
        border: "hsl(0 0% 90%)",
        primary: "hsl(160 63% 32%)",
        "primary-dark": "hsl(163 74% 20%)",
        "primary-light": "hsl(150 41% 94%)",
        accent: "hsl(25 96% 51%)",
        "accent-hover": "hsl(25 90% 47%)",
        "accent-light": "hsl(30 100% 97%)",
        surface: "hsl(0 0% 100%)",
        "surface-secondary": "hsl(146 26% 97%)",
        "surface-muted": "hsl(0 0% 96%)",
        success: "hsl(120 73% 45%)",
        warning: "hsl(38 92% 50%)",
        danger: "hsl(0 91% 56%)",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        serif: ['"Fraunces"', "Georgia", "serif"],
      },
    },
  },
};

export default config;

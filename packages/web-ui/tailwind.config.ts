import { Config } from "tailwindcss";

export const config: Partial<Config> = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#001325",
      },
    },
  },
  variants: {},
  plugins: [],
};

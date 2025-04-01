/** @type {import('tailwindcss').Config} */

module.exports = {
   content: ["./src/**/*.{js,jsx,ts,tsx}"],
   theme: {
      extend: {
         backgroundColor: {
            "custom-blue": "#007bff",
         },
         backgroundImage: {
            login: "url('./assets/images/LoginImage.png')",
            calendar: "url('./assets/images/calendar_icon.svg')",
         },
         "2xl": [
            "1.5rem",
            {
               lineHeight: "2rem",
               letterSpacing: "-0.01em",
               fontWeight: "500",
            },
         ],
         "3xl": [
            "1.875rem",
            {
               lineHeight: "2.25rem",
               letterSpacing: "-0.02em",
               fontWeight: "700",
            },
         ],
      },
   },
   plugins: [
      require('@tailwindcss/typography'),
   ],
};

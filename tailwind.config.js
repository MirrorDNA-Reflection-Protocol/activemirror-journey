export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            animation: { 'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
            fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
            backgroundImage: {
                'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
            }
        },
    },
    plugins: [],
}

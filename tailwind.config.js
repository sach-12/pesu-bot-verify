module.exports = {
    content: [
        './pages/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                "c0": "#0F0E10",
                "c1": "#19181B",
                "c2": "#808183",
            }
        },
        fontFamily: {
            sans: ['Manrope', 'sans-serif'],
        },
    },
    plugins: [],
}

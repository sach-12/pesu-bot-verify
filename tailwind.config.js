module.exports = {
    content: [
        './pages/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                "c0": "#051923",
                "c1": "#003554",
                "c2": "#006494",
                "c3": "#0582CA",
                "c4": "#8CCCEC",
            }
        },
        fontFamily: {
            sans: ['Manrope', 'sans-serif'],
        },
    },
    plugins: [],
}

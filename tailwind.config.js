module.exports = {
    content: [
        './pages/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                "pesu-gray": "#15172a",
                "pesu-dark-gray": "#1c1e2a",
                "pesu-light-blue": "#2d5f9e",
                "pesu-light-brown": "#8e8e8e",
                "discord-blue": "#5865F2",
                "discord-dark-blue": "#4752C4"
            }
        },
        fontFamily: {
            'notoSans': ["Noto Sans", "sans-serif"],
            'mono': ['ui-monospace', 'SFMono-Regular'],
        },
    },
    plugins: [],
}

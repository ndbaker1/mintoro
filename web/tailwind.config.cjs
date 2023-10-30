module.exports = {
    content: ["./src/**/*.{html,js,svelte}"], theme: {
        extend: {},
    },
    daisyui: {
        themes: ["night"],
    },
    plugins: [
        require("daisyui")
    ],
}
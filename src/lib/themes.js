"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCustomTheme = exports.getThemeByName = exports.PRESET_THEMES = void 0;
exports.PRESET_THEMES = [
    {
        name: "dark-minimal",
        label: "Bold Modern",
        bg: "#121212",
        bgAlt: "#242424",
        accent: "#e94560",
        accentText: "#ffffff",
        text: "#f5f5f5",
        textMuted: "#a0a0a0",
        highlight: "#e94560",
        fontWeight: 900,
        gradient: "linear-gradient(135deg, #e94560 0%, #121212 100%)",
    },
    {
        name: "clean-light",
        label: "Minimalist Clean",
        bg: "#fdfbf7",
        bgAlt: "#f0ede5",
        accent: "#111111",
        accentText: "#ffffff",
        text: "#1a1a1a",
        textMuted: "#757575",
        highlight: "#111111",
        fontWeight: 800,
        gradient: "linear-gradient(135deg, #111111 0%, #fdfbf7 100%)",
    },
];
function getThemeByName(name) {
    return exports.PRESET_THEMES.find(function (t) { return t.name === name; }) || exports.PRESET_THEMES[0];
}
exports.getThemeByName = getThemeByName;
function parseCustomTheme(input) {
    var lower = input.toLowerCase();
    if (lower.includes("biru") && lower.includes("emas")) {
        return { bg: "#0a1628", accent: "#d4af37", text: "#ffffff", gradient: "linear-gradient(135deg, #d4af37 0%, #0a1628 100%)" };
    }
    if (lower.includes("hijau")) {
        return { bg: "#0d2818", accent: "#4caf50", text: "#ffffff", gradient: "linear-gradient(135deg, #4caf50 0%, #0d2818 100%)" };
    }
    return {};
}
exports.parseCustomTheme = parseCustomTheme;

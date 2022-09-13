import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import format from "./i18n-format";
import LanguageDetector from "i18next-browser-languagedetector";

i18next
    .use(initReactI18next)
    .use(HttpApi)
    .use(LanguageDetector)
    .init({
        supportedLngs: ["en", "fi", "sv"],
        fallbackLng: "en",
        nonExplicitSupportedLngs: true,
        interpolation: {
            escapeValue: false,
            format,
        },
        debug: true,
    });

export default i18next;
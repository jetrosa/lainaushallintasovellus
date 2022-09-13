import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    return (
        <div className="select">
            <select
                value={i18n.language}
                onChange={(event) => {
                    i18n.changeLanguage(event.target.value);
                }}
            >
                <option value="en">English</option>
                <option value="fi">Suomi</option>
                <option value="sv">Svenska</option>
            </select>
        </div>
    );
}

export default LanguageSwitcher;

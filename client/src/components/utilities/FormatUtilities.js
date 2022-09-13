// Enumeration of values used in functions
const UtilValues = {
    Zero: 0.0,
    ProbablyInactive: 0.4,
    VeryLowAct: 25.0,
    LowAct: 500.0,
    Kilo: 1000.0,
    Mega: 1000000.0,
    Giga: 1000000000.0,
    Tera: 1000000000000.0,
    CiBqMultiplier: 37000000000.0
}

/**
 * Formats Bq value to a string based on input value
 * @param {*} bq Raw Bq value to input
 * @returns Formatted Bq string based on input value
 */
export function BqFormatter(bq, {t}) {
    let formattedBq;
    switch (true) {
        case (bq >= UtilValues.Tera):
            formattedBq = `${(bq / UtilValues.Tera).toFixed(2)} TBq`;
            break;
        case (bq >= UtilValues.Giga && bq < UtilValues.Tera):
            formattedBq = `${(bq / UtilValues.Giga).toFixed(2)} GBq`;
            break;
        case (bq >= UtilValues.Mega && bq < UtilValues.Giga):
            formattedBq = `${(bq / UtilValues.Mega).toFixed(2)} MBq`;
            break;
        case (bq < UtilValues.Mega && bq >= UtilValues.LowAct):
            formattedBq = `${Math.round(bq)} Bq`;
            break;
        case (bq >= UtilValues.VeryLowAct && bq < UtilValues.LowAct):
            formattedBq = `${Math.round(bq)} Bq ${t('format-utilities_low-act')}`;
            break;
        case (bq >= UtilValues.ProbablyInactive && bq < UtilValues.VeryLowAct):
            formattedBq = `${(bq).toFixed(2)} Bq ${t('format-utilities_very-low-act')}`;
            break;
        case (bq < UtilValues.ProbablyInactive && bq >= UtilValues.Zero):
            formattedBq = `${(bq).toFixed(2)} Bq ${t('format-utilities_almost-zero-act')}`;
            break;
        case (bq === 'HALFLIFE_ERROR' || bq < UtilValues.Zero):
            formattedBq = `${t('format-utilities_fail-missing-halflife')} (${bq})`;
            break;
        case (bq === 'MULTIPLIER_ERROR'):
            formattedBq = `${t('format-utilities_fail-current-amount-too-big')} (${bq})`;
            break;
        case (bq === 'DATE_INFINITY_ERROR'):
            formattedBq = `${t('format-utilities_fail-ref-act-in-the-future')} (${bq})`;
            break;
        default:
            formattedBq = `${t('format-utilities_invalid-input')} ${bq}`;
            break;
    }
    return formattedBq;
}

/**
 * Converts input value to raw Bq based on the input unit
 * @param {*} inputValue Input value which should be converted to raw Bq
 * @param {*} inputUnit The unit of the input value; Valid inputs: 'Bq', 'MBq', 'GBq', 'TBq', 'Ci'
 * @returns The raw Bq value based on inputs
 */
export function bqConverter(inputValue, inputUnit) {
    let outputValue = 0.0;
    if (!Number.isFinite(inputValue)) {
        console.log("Non-number value detected (or Infinite/-Infinite value)");
        return outputValue;
    } else if (inputValue < UtilValues.Zero) {
        console.log("Negative input value detected, returning...");
        return outputValue;
    }
    switch (inputUnit) {
        case ('Bq'):
            outputValue = inputValue;
            break;
        case ('MBq'):
            outputValue = (inputValue * UtilValues.Mega);
            break;
        case ('GBq'):
            outputValue = (inputValue * UtilValues.Giga);
            break;
        case ('TBq'):
            outputValue = (inputValue * UtilValues.Tera);
            break;
        case ('Ci'):
            outputValue = (inputValue * UtilValues.CiBqMultiplier);
            break;
        default:
            break;
    }
    return outputValue
}

/**
 * Function for calculating the current radioactivity of a nuclide (both closed and open sources)
 * @param {*} referenssi_aktiivisuus Reference activity of the nuclide
 * @param {*} referenssi_pvm Reference date when the reference activity was measured
 * @param {*} puoliintumisaika Half-life of the nuclide
 * @param {*} avo_referenssi_tilavuus Reference volume in ml for open sources
 * @param {*} avo_nykyinen_tilavuus Current volume in ml for open sources
 * @returns The current radioactivity of the nuclide in pure Bq
 */
export function calculateActivity(referenssi_aktiivisuus, referenssi_pvm, puoliintumisaika, avo_referenssi_tilavuus, avo_nykyinen_tilavuus) {
    /**
    * A(t_now) = A(t_ref) * (1/2)^((t_now-t_ref)/t_halflife)
    * A(t_now): tämän hetkinen aktiivisuus(pitoisuus)
    * A(t_ref): referenssiaktiivisuus(pitoisuus)
    * t_now: nykyinen ajanhetki
    * t_ref: referenssipäivä, jos tallennusvaiheessa ei anneta muuta aikaa, niin oletuksena käytetään aikaa 12:00:00.
    * t_halflife: kyseisen nuklidin puoliintumisaika
     */
    //console.log(`calc: ${referenssi_aktiivisuus}, ${referenssi_pvm}, ${puoliintumisaika}`);
    let multiplier = 1.00;
    if (avo_referenssi_tilavuus !== null) {
        if (avo_nykyinen_tilavuus !== null && avo_nykyinen_tilavuus <= avo_referenssi_tilavuus) {
            multiplier = ( (avo_nykyinen_tilavuus)/(avo_referenssi_tilavuus) );
        } else if (avo_nykyinen_tilavuus !== null && avo_nykyinen_tilavuus > avo_nykyinen_tilavuus) {
            return 'MULTIPLIER_ERROR';
        }
    }
    if (puoliintumisaika === null || puoliintumisaika === undefined) {
        return 'HALFLIFE_ERROR';
    } else {
        const nowDateSeconds = Date.now() / 1000 | 0; // "| 0 ==> Math.floor()"
        const referenceDateSeconds = (new Date(referenssi_pvm)) / 1000 | 0;
        //console.log(`calc seconds: ${nowDateSeconds}, ${referenceDateSeconds}`);
        const elapsedTimeSeconds = nowDateSeconds - referenceDateSeconds;
        if (elapsedTimeSeconds < 0) {
            return 'DATE_INFINITY_ERROR';
        }
        //console.log(`elapsed time: ${elapsedTimeSeconds}`);
        const currentRadioactivity = (referenssi_aktiivisuus) * (1/2)**(elapsedTimeSeconds/puoliintumisaika);
        //console.log(`current rad: ${currentRadioactivity}`);
        const currentRadioactivityWithMultiplier = currentRadioactivity * multiplier;
        return currentRadioactivityWithMultiplier;
    }
}

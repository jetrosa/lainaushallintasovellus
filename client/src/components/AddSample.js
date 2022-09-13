import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from "axios";

import {
    Form, Button, Container, Col, Alert, Row, Spinner, InputGroup, FormControl
} from "react-bootstrap"
import Nuclides from './Nuclides';
import { useTranslation } from "react-i18next";

const AddSample = (props) => {
    const { t } = useTranslation();

    const currentDate = new Date();
    const thisDate = (`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`)

    // Form muuttujat:
    const [name, setName] = useState(null)
    const [reference_stuk, setReferenceStuk] = useState(null)
    const [producerReference, setProducerReference] = useState(null)
    const [description, setDescription] = useState(null)
    const [location, setLocation] = useState(null)
    const [locationDetails, setLocationDetails] = useState(null)
    const [addDate, setAddDate] = useState(thisDate)
    const [referenceDate, setReferenceDate] = useState(null)
    const [referenceTimeHour, setReferenceTimeHour] = useState(null)
    const [referenceTimeMinutes, setReferenceTimeMinutes] = useState(null)
    const [referenceDateTime, setReferenceDateTime] = useState(null)
    const [removalDate, setRemovalDate] = useState(null)
    const [certifiedLink, setCertifiedLink] = useState(null)
    const [redirect, setRedirect] = useState(false)
    const [users, setUsers] = useState([])
    const [departments, setDepartments] = useState([])
    const [halflifes, setHalflifes] = useState([])
    const [usersLoading, setUsersLoading] = useState(true)
    const [halflifesLoading, setHalflifesLoading] = useState(true)
    const [acquisitionMethod, setAcquisitionMethod] = useState(null)
    const [viite_lahteen_lupaanvientiasiakirjaan, setReferencePermissionAdd] = useState(null)
    const [viite_lahteen_luvastapoistoasiakirjaan, setReferencePermissionRemove] = useState(null)


    // umpi/avo muuttujat

    const [closedCode, setClosedCode] = useState(null)
    const [closedSpecialForm, setClosedSpecialForm] = useState(null)
    const [closedSpecialFormDate, setClosedSpecialDate] = useState(null)
    const [closedSpecialFormCertificate, setClosedSpecialCertificate] = useState(null)

    const [openReferenceCapasity, setOpenReferenceCapasity] = useState(null)
    const [openCurrentCapasity, setOpenCurrentCapasity] = useState(null)

    const [type, setType] = useState(null)
    const [openSourcetype, setOpenSourceType] = useState(null)
    const [sourceNuclides, setSourceNuclides] = useState([])
    const [bestBeforeDate, setBestBeforeDate] = useState(null)
    const [responsibleUser, setResponsibleUser] = useState(0)
    const [responsibleDepartment, setResponsibleDepartment] = useState(0)
    const [nuclides, setNuclides] = useState([]);
    const [nuclideInMemName, setNuclideInMemName] = useState(null);
    const [nuclideInMemRefActivity, setNuclideInMemRefActivity] = useState(null);

    const [specialformenabled, changeSpecialFormSelected] = useState(false)
    const [isOpenSource, changeOpenSourceSelected] = useState(false)
    const [isClosedSource, changeClosedSourceSelected] = useState(false)

    // muuttujat virheilmoituksille
    const [isNuclideFail, setIsNuclideFail] = useState(false)               // virheellistä nuclidin lisäystä varten, tuo esille virhe ilmoitukse
    const [isSubmitFail, setIsSubmitFail] = useState(false)                 // epä-onnitunutta submittia varten, tuo esille virhe ilmoituksen
    const [isSubmitSuccess, setIsSubmitSuccess] = useState(false)           // onnistunutta submittia varten, toisi esille ilmoituksen onnistumisesta mutta sivu ladataan uudelleen
    const [submitErrorMsg, setSubmitErrorMsg] = useState("no error msg")    // viesti, joka paikataan ja näytetään virheen tapahtuessa isSubmitFail:in esiin tuomassa virhe ilmoituksessa

    function isValidNuclide(nuclideName) {
        const result = halflifes.find(({ nuklidi }) => nuklidi === nuclideName);
        if (result !== undefined && result !== null) {
            return true;
        } else {
            return false;
        }
    }

    function isValidRefActivity(refActivity) {
        if ((!isNaN(refActivity)) && refActivity >= 0 && refActivity !== "") {
            return true;
        } else {
            return false;
        }
    }

    const addNuclide = () => {
        if (isValidNuclide(nuclideInMemName) && isValidRefActivity(nuclideInMemRefActivity)) {
            setNuclides([...nuclides, { nuklidi: nuclideInMemName, referenssi_aktiivisuus: nuclideInMemRefActivity }])
            console.log("added " + nuclideInMemName + " with activity: " + nuclideInMemRefActivity + " Bq")
            setIsNuclideFail(false);
        } else {
            console.log("Nuclide wasn't added. Invalid values detected.")
            setIsNuclideFail(true);
        }
        console.log(nuclides)
    }

    const removeFromList = (event) => {
        console.log("Removing nuclide:");
        console.log(event.target.value);
        let nuclidesCopy = [...nuclides];
        console.log(nuclidesCopy);
        let indexToDelete = nuclidesCopy.indexOf(event.target.value);
        console.log("Deletion of object with index: " + indexToDelete);
        if (event.target.value !== -1) {
            console.log("Splicing...");
            nuclidesCopy.splice(event.target.value, 1);
            console.log("Setting nuclides array to:");
            setNuclides(nuclidesCopy);
            console.log(nuclides);
        } else {
            return
        }
    }

    useEffect(() => {
        setAddDate(new Date().toISOString().slice(0, 10));
    }, []);

    useEffect(() => {
        axios.get("/api/users/").then(response => {
            setUsers(response.data)
            setUsersLoading(false)
        }).catch(err => {
            console.log(err);
        })
    }, [])

    useEffect(() => {
        axios.get("/api/departments/").then(response => {
            setDepartments(response.data)
        }).catch(err => {
            console.log(err);
        })
    }, [])

    useEffect(() => {
        axios.get("/api/nuclides/").then(response => {
            setHalflifes(response.data)
            setHalflifesLoading(false)
        }).catch(err => {
            console.log(err);
        })
    }, [])

    const addSample = (event) => {
        event.preventDefault()

        if (type === 'Umpilähde' && closedSpecialForm === null) {
            setClosedSpecialForm('Ei');
        }

        const sample = {
            kutsumanimi: name,
            viite_valmistaja: producerReference,
            viite_stuk: reference_stuk,
            viite_lahde_sertifikaatti: certifiedLink,
            lisatty_pvm: addDate,
            parasta_ennen_pvm: bestBeforeDate,
            hankintatapa: acquisitionMethod,
            lisatiedot: description,
            poistettu_pvm: null,
            sailytyspaikka: location,
            sailytyspaikka_tarkenne: locationDetails,
            poisto_syy: null,
            poisto_tapa: null,
            umpi_luokituskoodi: closedCode,
            umpi_erityismuotoisuus: closedSpecialForm,
            umpi_erityismuotoisuus_pvm: closedSpecialFormDate,
            umpi_erityismuotoisuus_todistus: closedSpecialFormCertificate,
            viite_lahteen_lupaanvientiasiakirjaan: viite_lahteen_lupaanvientiasiakirjaan,
            viite_lahteen_luvastapoistoasiakirjaan: viite_lahteen_luvastapoistoasiakirjaan,
            avo_referenssi_tilavuus: openReferenceCapasity,
            avo_nykyinen_tilavuus: openCurrentCapasity,
            tyyppi: type,
            referenssi_pvm: referenceDateTimeCreator(referenceDate, referenceTimeHour, referenceTimeMinutes),
            avo_koostumus: openSourcetype,
            vastuuhenkilo_id: responsibleUser,
            vastuuosasto_id: responsibleDepartment,
            lisaajan_id: 1,
            poistajan_id: null,
            lahteidennuklidit: nuclides
        }

        axios.post("/api/samples", sample).then(response => {
            // redirect listaan
            //setRedirect(true)
            setIsSubmitFail(false);
            setIsSubmitSuccess(true);
            window.location.reload(); // lataa sivun uudelleen tyhjentääkseen formin
        }).catch(err => {
            console.log(err);
            const now = new Date();
            const datetext = now.toTimeString();
            const time = datetext.split(' ')[0];
            if (err.response) {
                setSubmitErrorMsg(err.response.data);
                
                //apissa määritelty virheviesti ja vastausaika
                setSubmitErrorMsg(err.response.data + ' | ' + time);
            } else {
                setSubmitErrorMsg(err.message + ' | ' + time);
            }
            setIsSubmitFail(true);
            setIsSubmitSuccess(false);
        })
    }

    const nuclideNameChanged = (event) => {
        console.log("Nuclide name in mem changed to " + event.target.value)
        setNuclideInMemName(event.target.value);
    }

    const nuclideRefActivityChanged = (event) => {
        if (event.target.value !== null && event.target.value !== undefined && event.target.value !== "" && event.target.value !== "Choose..." && event.target.value >= 0) {
            setNuclideInMemRefActivity(event.target.value);
        } else {
            setNuclideInMemRefActivity("");
        }
    }

    const nameFieldChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setName(event.target.value)
    }
    const viite_stukchanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setReferenceStuk(event.target.value)
    }

    const locationDetailsChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setLocationDetails(event.target.value)
    }

    const producerReferenceChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setProducerReference(event.target.value)
    }

    const acquisitionMethodChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setAcquisitionMethod(event.target.value)
    }

    const descriptionFieldChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setDescription(event.target.value)
    }

    const referenceDateChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        console.log("Reference date changed to:");
        console.log(event.target.value);
        setReferenceDate(event.target.value);
    }

    const referenceTimeHourChanged = (event) => {
        if (event.target.value <= 23 && event.target.value >= 0 && event.target.value.length <= 2) {
            console.log("refHours changed to: " + event.target.value)
            setReferenceTimeHour(event.target.value);
        } else {
            return;
        }
    }

    const referenceTimeMinutesChanged = (event) => {
        if (event.target.value <= 59 && event.target.value >= 0 && event.target.value.length <= 2) {
            console.log("refMinutes changed to: " + event.target.value)
            setReferenceTimeMinutes(event.target.value);
        } else {
            return;
        }
    }

    const referenceDateTimeCreator = (date, hours, minutes) => {
        console.log("Logging inputs to referenceDateTimeCreator:");
        console.log(date);
        console.log(`Time: ${hours}:${minutes}`)
        if (date === null || date === undefined) {
            console.log("DateTime creation error");
            return;
        }
        if (hours === null || hours === undefined) {
            hours = 12;
        } else {
            hours = parseInt(hours);
        }
        if (minutes === null || minutes === undefined) {
            minutes = 0
        } else {
            minutes = parseInt(minutes);
        }
        console.log(`Setting date's time to ${hours}:${minutes}`)
        const helperDate = new Date(date).setHours(hours, minutes);
        console.log(helperDate);
        const createdDate = new Date(helperDate);
        console.log(createdDate);
        setReferenceDateTime(createdDate);
        return createdDate;
    }

    const locationFieldChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setLocation(event.target.value)
    }
    const bestBeforeDateChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setBestBeforeDate(event.target.value)
    }

    const addDateChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setAddDate(event.target.value)
    }

    const removalDateChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setRemovalDate(event.target.value)
    }

    const certificationLinkChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setCertifiedLink(event.target.value)
    }

    const closedCodeChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setClosedCode(event.target.value)
    }

    const closedSpecialFormChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setClosedSpecialForm(event.target.value)
    }

    const closedSpecialFormCertificateChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setClosedSpecialCertificate(event.target.value)
    }

    const closedSpecialFormDateChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setClosedSpecialDate(event.target.value)
    }

    const openReferenceCapasityChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setOpenReferenceCapasity(event.target.value)
    }

    const openCurrentCapasityChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setOpenCurrentCapasity(event.target.value)
    }
    const referencePermissionAddChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setReferencePermissionAdd(event.target.value)
    }
    const referencePermissionRemoveChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        setReferencePermissionRemove(event.target.value)
    }

    const halflifeChanged = (event) => {
        setSourceNuclides(event.target.value)
    }

    const typeChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        console.log(event.target.value)
        if (event.target.value == t("add-sample_closed-source")) {
            changeClosedSourceSelected(true)
            changeOpenSourceSelected(false)
            setType("Umpilähde")
        }
        else if (event.target.value == t("add-sample_open-source")) {
            changeOpenSourceSelected(true)
            changeClosedSourceSelected(false)
            changeSpecialFormSelected(false)
            setType("Avolähde")
        }
        else {
            console.log("should not be here")
            setType(event.target.value)
        }
    }
    const openSourceTypeChanged = (event) => {
        if (event.target.value.length > 80) {
            return
        }
        if (event.target.value == t("add-sample_liquid")) {
            setOpenSourceType('Neste')
        }
        else if (event.target.value == t("add-sample_solid")) {
            setOpenSourceType('Kiinteä')
        }
        else if (event.target.value == t("add-sample_powder")) {
            setOpenSourceType('Jauhe')
        }
        else {
            setOpenSourceType(event.target.value)
        }
    }

    const responsibleUserChanged = (event) => {
        setResponsibleUser(event.target.value)
    }

    const responsibleDepartmentChanged = (event) => {
        setResponsibleDepartment(event.target.value)
    }

    const specialFormSelected = (event) => {
        if (specialformenabled === false) {
            changeSpecialFormSelected(true);
            setClosedSpecialForm("Kyllä");
        }
        if (specialformenabled === true) {
            changeSpecialFormSelected(false);
            setClosedSpecialForm("Ei");
        }
    }



    if (usersLoading || halflifesLoading) {
        return (
            <Container>
                <br />
                <Alert variant="primary">
                    <Row>
                        <Col>
                            {t('add-sample_loading')}     <Spinner animation="grow" size="sm"></Spinner>
                        </Col>
                    </Row>
                </Alert>
            </Container>
        )
    } else if (redirect) {
        return <Redirect to="/samples/" />
    } else {
        return (
            <Container>
                <br />
                <Alert variant="dark">
                    <Form>
                        <Form.Row>
                            <Form.Group as={Col} controlId="formBasicName" className="text-left">
                                <Form.Label>{t('add-sample_name-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_name-placeholder')} type="text" name="sampleName" value={name} onChange={nameFieldChanged} />
                                <Form.Text className="text-muted">
                                    {t('add-sample_name-muted-text')}
                                </Form.Text>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="sourceNuclideSelect" className="text-left">
                                <Form.Label>{t('add-sample_nuclides-label')}</Form.Label>
                                <Form.Control as="select" onChange={nuclideNameChanged} defaultValue={t('add-sample_choose-dot-dot-dot')} >
                                    <option>{t('add-sample_choose-dot-dot-dot')}</option>
                                    {halflifes.map((halflife) =>
                                        <option
                                            key={halflife.nuklidi}
                                            name="nuclideName"
                                            value={halflife.nuklidi}
                                        >
                                            {halflife.nuklidi}
                                        </option>
                                    )}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="nuclideRefActivity">
                                <Form.Label>{t('add-sample_reference-radioactivity-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_reference-radioactivity-placeholder')} type="text" name="Reference_radioactivity" onChange={nuclideRefActivityChanged} />
                                {isNuclideFail &&
                                    <p> {t('add-sample_add-nuclide-error')} </p>
                                }
                            </Form.Group>

                            <Button onClick={addNuclide}>
                                {t('add-sample_add-nuclide-button')}
                            </Button>

                            <Form.Group as={Col} controlId="nuclideList" >
                                <div as="text" onClick={removeFromList}>
                                    {nuclides.map((nuclide) =>
                                        <option key={nuclides.indexOf(nuclide)} value={nuclides.indexOf(nuclide)}>{nuclides.indexOf(nuclide) + 1}. {nuclide.nuklidi} ({nuclide.referenssi_aktiivisuus} Bq)</option>
                                    )}
                                </div>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formDescription" className="text-left">
                                <Form.Label>{t('add-sample_description-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_description-placeholder')} type="text" name="Description" value={description} onChange={descriptionFieldChanged} />
                                <Form.Text className="text-muted">
                                    {t('add-sample_description-muted-text')}
                                </Form.Text>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formReferenceStuk" className="text-left">
                                <Form.Label>{t('add-sample_stuk-reference-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_stuk-reference-placeholder')} type="text" name="referenceStuk" value={reference_stuk} onChange={viite_stukchanged} />
                            </Form.Group>

                            <Form.Group as={Col} controlId="formProducerReference" className="text-left">
                                <Form.Label>{t('add-sample_producer-reference-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_producer-reference-placeholder')} type="text" name="referenceProducer" value={producerReference} onChange={producerReferenceChanged} />
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formPeferencePermissionAdd" className="text-left">
                                <Form.Label>{t('add-sample_special-permit-approval-reference-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_special-permit-approval-reference-placeholder')} type="text" name="specialPermissionAdd" value={viite_lahteen_lupaanvientiasiakirjaan} onChange={referencePermissionAddChanged} />
                            </Form.Group>

                            <Form.Group as={Col} controlId="formReferencePermissionRemove" className="text-left">
                                <Form.Label>{t('add-sample_special-permit-removal-reference-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_special-permit-removal-reference-placeholder')} type="text" name="specialPermissionRemove" value={viite_lahteen_luvastapoistoasiakirjaan} onChange={referencePermissionRemoveChanged} />
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} sm="3" controlId="formAddDate" className="text-left">
                                <Form.Label>{t('add-sample_added-date-label')}</Form.Label>
                                <Form.Control type="date" name="sampleAddDate" value={addDate} onChange={addDateChanged} />
                            </Form.Group>

                            <Form.Group as={Col} sm="3" controlId="formReferenceDate" className="text-left pl-5 pr-0">
                                <Form.Label>{t('add-sample_radioactivity-reference-date-label')}</Form.Label>
                                <Form.Control type="date" name="referenceDate" value={referenceDate} onChange={referenceDateChanged} />
                            </Form.Group>
                            <Form.Group as={Col} sm="2" controlId="formReferenceTime" className="text-left pr-5 pl-1">
                                <label htmlFor="referenceTimeHours">{t('add-sample_radioactivity-reference-time-label')}</label>
                                <InputGroup className="mb-1">
                                    <FormControl
                                        id="referenceTimeHours"
                                        type="text"
                                        value={referenceTimeHour}
                                        defaultValue="12"
                                        onChange={referenceTimeHourChanged}
                                    />
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="referenceTimeColonDivider">:</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        id="referenceTimeMinutes"
                                        aria-describedby="referenceTimeColonDivider"
                                        type="text"
                                        value={referenceTimeMinutes}
                                        defaultValue="00"
                                        onChange={referenceTimeMinutesChanged}
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group as={Col} sm="4" controlId="bestBeforeDate" className="text-left">
                                <Form.Label>{t('add-sample_best-before-date-label')}</Form.Label>
                                <Form.Control type="date" name="bestbefore" value={bestBeforeDate} onChange={bestBeforeDateChanged} />
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formCertificateLink" className="text-left">
                                <Form.Label>{t('add-sample_certificate-link-label')}</Form.Label>
                                <InputGroup className="mb-1">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="certificateLinkPrepend">https://ah.asp?docId=</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        placeholder={t('add-sample_certificate-link-placeholder')}
                                        type="text"
                                        name="sampleCertificateLink"
                                        value={certifiedLink}
                                        onChange={certificationLinkChanged}
                                        aria-label="Username"
                                        aria-describedby="certificateLinkPrepend"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formPersonResponsibleSelect" className="text-left">
                                <Form.Label>{t('add-sample_user-responsible-label')}</Form.Label>
                                <Form.Control as="select" onChange={responsibleUserChanged} defaultValue={t('add-sample_choose-dot-dot-dot')} >
                                    <option>{t('add-sample_choose-dot-dot-dot')}</option>
                                    {users.map((user) =>
                                        <option key={user.id} name="responsiblePerson" value={user.id}>{user.etunimi} {user.sukunimi}</option>
                                    )}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col} controlId="formDepartmentResponsibleSelect" className="text-left">
                                <Form.Label>{t('add-sample_department-responsible-label')}</Form.Label>
                                <Form.Control as="select" onChange={responsibleDepartmentChanged} defaultValue={t('add-sample_choose-dot-dot-dot')} >
                                    <option>{t('add-sample_choose-dot-dot-dot')}</option>
                                    {departments.map((department) =>
                                        <option key={department.id} name="responsibleDepartment" value={department.id}>{department.nimi_lyhenne}</option>
                                    )}
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} sm="5" controlId="formBasicLocation" className="text-left">
                                <Form.Label>{t('add-sample_storage-general-location-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_storage-general-location-placeholder')} type="text" name="storageLocation" value={location} onChange={locationFieldChanged} />
                            </Form.Group>
                            <Form.Group as={Col} sm="7" controlId="formLocationDetails" className="text-left">
                                <Form.Label>{t('add-sample_storage-specific-location-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_storage-specific-location-placeholder')} type="text" name="storageLocationDetails" value={locationDetails} onChange={locationDetailsChanged} />
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="acquisitionMethod" className="text-left">
                                <Form.Label>{t('add-sample_source-acquisition-method-label')}</Form.Label>
                                <Form.Control placeholder={t('add-sample_source-acquisition-method-placeholder')} type="text" name="acquisitionMethod" value={acquisitionMethod} onChange={acquisitionMethodChanged} />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formRemovalDate" className="text-left">
                                <Form.Label>{t('add-sample_source-removal-date-label')}</Form.Label>
                                <Form.Control type="date" name="sampleRemovalDate" value={removalDate} onChange={removalDateChanged} />
                            </Form.Group>
                        </Form.Row>


                        <Form.Row>
                            <Form.Group controlId="sourceTypeSelect">
                                <Form.Label>{t('add-sample_source-type-label')}</Form.Label>
                                <Form.Control as="select" onChange={typeChanged} defaultValue={t('add-sample_choose-dot-dot-dot')} >
                                    <option>{t('add-sample_choose-dot-dot-dot')}</option>
                                    <option>{t('add-sample_closed-source')}</option>
                                    <option>{t('add-sample_open-source')}</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col} controlId="closedCode" className="text-left">
                                <Form.Label>{t('add-sample_closed-source-classification-code-label')}</Form.Label>
                                <Form.Control disabled={!isClosedSource} type="text" name="closed_code" value={closedCode} onChange={closedCodeChanged} />
                            </Form.Group>
                            <Form.Group controlId="isSpecialForm">
                                <Form.Label>{t('add-sample_closed-source-is-special-form-label')}</Form.Label>
                                <Form.Control disabled={!isClosedSource} type="checkbox" name="isSpecialformTrue" onChange={specialFormSelected} />
                            </Form.Group>
                            <Form.Group as={Col} controlId="closedSpecialFormDate" className="text-left">
                                <Form.Label>{t('add-sample_closed-source-special-form-date-label')}</Form.Label>
                                <Form.Control disabled={!specialformenabled} type="date" name="closed_special_form_date" value={closedSpecialFormDate} onChange={closedSpecialFormDateChanged} />
                            </Form.Group>
                            <Form.Group as={Col} controlId="closedSpecialFormCertificate" className="text-left">
                                <Form.Label>{t('add-sample_closed-source-special-form-certificate-label')}</Form.Label>
                                <Form.Control disabled={!specialformenabled} type="text" name="closed_special_form_certificate" value={closedSpecialFormCertificate} onChange={closedSpecialFormCertificateChanged} />
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group controlId="penSourceConsistencySelect">
                                <Form.Label>{t('add-sample_open-source-consistency-label')}</Form.Label>
                                <Form.Control disabled={!isOpenSource} as="select" onChange={openSourceTypeChanged} defaultValue={t('add-sample_choose-dot-dot-dot')} >
                                    <option>{t('add-sample_choose-dot-dot-dot')}</option>
                                    <option>{t('add-sample_liquid')}</option>
                                    <option>{t('add-sample_solid')}</option>
                                    <option>{t('add-sample_powder')}</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col} controlId="openReferenceCapasity" className="text-left">
                                <Form.Label>{t('add-sample_open-source-reference-unit-amount')}</Form.Label>
                                <Form.Control disabled={!isOpenSource} type="text" name="open_reference_capasity" value={openReferenceCapasity} onChange={openReferenceCapasityChanged} />
                            </Form.Group>
                            <Form.Group as={Col} controlId="openCurrentCapasity" className="text-left">
                                <Form.Label>{t('add-sample_open-source-current-unit-amount')}</Form.Label>
                                <Form.Control disabled={!isOpenSource} type="text" name="open_current_capasity" value={openCurrentCapasity} onChange={openCurrentCapasityChanged} />
                            </Form.Group>
                        </Form.Row>

                        <Button variant="primary" type="submit" onClick={addSample} size="lg" className="w-100">
                            {t('add-sample_submit-buttom')}
                        </Button>
                        <br />
                        <br />
                        
                        { isSubmitSuccess && // Doesn't show up at all due to the instant page refresh,  just here in case that is changed
                            <Alert variant='success'> {t('add-sample_submit-success')} </Alert>
                        }
                        {isSubmitFail &&
                            <Alert variant='warning'> {t('add-sample_submit-fail')} | {submitErrorMsg} </Alert>
                        }

                    </Form>

                </Alert>
            </Container>
        )
    }
}



export default AddSample;

import React, { useState, useImperativeHandle, forwardRef, useEffect, useContext } from 'react';
import axios from "axios";
import { Modal, Button, Row, Col, Alert, Form, InputGroup, FormControl, Spinner, Badge, Dropdown, DropdownButton } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faSave, faRedo, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { Context as AuthContext } from './AuthContext';
import { Context } from './GlobalState';
import { BqFormatter, bqConverter } from './utilities/FormatUtilities';
import { useTranslation } from 'react-i18next';
import "./custom-component-styles/custom-form-control.css";

function OneSampleEditPopup(props, ref) {

    /**
     * GENERAL STATES
     */
    // Global state used for list of nuclides
    const [state, dispatch] = useContext(Context);

    const [authState] = useContext(AuthContext);

    // Translation function
    const { t } = useTranslation();

    // Local state used for available users
    const [availableUsers, setAvailableUsers] = useState(null);

    // Local state used for available departments
    const [availableDepartments, setAvailableDepartments] = useState(null);

    // Placeholder in case needed
    const [initialState, setInitialState] = useState(null);

    // Log creation test
    let editLog = "";
    let editCount = 0;
    const [editSummary, setEditSummary] = useState(null);

    // Loaders
    const [availableUsersLoading, setAvailableUsersLoading] = useState(true);
    const [availableDepartmentsLoading, setAvailableDepartmentsLoading] = useState(true);
    const [globalNuclideListLoading, setGlobalNuclideListLoading] = useState(true);

    // Predetermined arrays
    const validSourceTypes = [{type: 'Avolähde'}, {type: 'Umpilähde'}]
    const validOpenSourceTypeConsistencies = [{consistency: 'jauhe'}, {consistency: 'neste'}, {consistency: 'kiinteä'}]
    const validOptionsClosedSourceIsSpecialForm = [{isSpecialForm: 'Kyllä'}, {isSpecialForm: 'Ei'}]

    // Nuclide list helper states
    const [nuclideInMemName, setNuclideInMemName] = useState(null);
    const [nuclideInMemRefActivity, setNuclideInMemRefActivity] = useState(null);
    const [showAddNewNuclideBlock, setShowAddNewNuclideBlock] = useState(false);
    const [newNuclideRefActivityUnit, setNewNuclideRefActivityUnit] = useState('Bq');

    /**
     * SOURCE STATES
     */
    // Common properties
    const [sourceId, setSourceId] = useState(null)
    const [sourceName, setSourceName] = useState(null);
    const [sourceType, setSourceType] = useState(null);
    const [producerReference, setProducerReference] = useState(null);
    const [stukReference, setStukReference] = useState(null);
    const [sourceCertificateReference, setSourceCertificateReference] = useState(null);
    const [sourceAdditionDate, setSourceAdditionDate] = useState(null);
    const [sourceReferenceActivityDate, setSourceReferenceActivityDate] = useState(null);
    const [sourceBestBeforeDate, setSourceBestBeforeDate] = useState(null);
    const [sourceAcquisitionMethod, setSourceAcquisitionMethod] = useState(null);
    const [additionalInformation, setAdditionalInformation] = useState(null);
    const [storageLocationGeneral, setStorageLocationGeneral] = useState(null);
    const [storageLocationSpecific, setStorageLocationSpecific] = useState(null);
    const [sourceAddedByUser, setSourceAddedByUser] = useState(null);
    const [personResposible, setPersonResponsible] = useState(null);
    const [departmentResponsible, setDepartmentResponsible] = useState(null);

    // Common property: Nuclides that the source has
    const [sourceNuclides, setSourceNuclides] = useState(null);

    // Common properties, that aren't used frequently
    const [permitApprovalDocumentReference, setPermitApprovalDocumentReference] = useState(null);
    const [permitRemovalDocumentReference, setPermitRemovalDocumentReference] = useState(null);

    // Properties for open sources
    const [sourceTypeConsistency, setSourceTypeConsistency] = useState(null);
    const [openSourceReferenceVolume, setOpenSourceReferenceVolume] = useState(null);
    const [openSourceCurrentVolume, setOpenSourceCurrentVolume] = useState(null);

    // Properties for closed sources
    const [closedSourceClassificationCode, setClosedSourceClassificationCode] = useState(null);
    const [closedSourceIsSpecialForm, setClosedSourceIsSpecialForm] = useState(null);
    const [closedSourceSpecialFormDate, setClosedSourceSpecialFormDate] = useState(null);
    const [closedSourceSpecialFormCertificate, setClosedSourceSpecialFormCertificate] = useState(null);

    // Properties for removed source
    const [removalDate, setRemovalDate] = useState(null);
    const [removerId, setRemoverId] = useState(null);
    const [removalMethod, setRemovalMethod] = useState(null);
    const [removalReason, setRemovalReason] = useState(null);

    // Helper states for setting the correct reference time
    const [sourceReferenceActivityTimeHours, setSourceReferenceActivityTimeHours] = useState(null);
    const [sourceReferenceActivityTimeMinutes, setSourceReferenceActivityTimeMinutes] = useState(null);

    /**
     * INITIAL DB-REQUESTS & INITIAL SETUP
     */
    // Get & Set list of nuclides (global)
    useEffect(() => {
        axios.get("/api/nuclides").then(response => {
            const nuclides = response.data;
            dispatch({type: 'SET_NUCLIDES', payload: nuclides});
            setGlobalNuclideListLoading(false);
        }).catch(err => {
            console.log(err);
        })
    }, []);

    // Get & Set list of users (local)
    useEffect(() => {
        axios.get("/api/users/").then(response => {
            setAvailableUsers(response.data);
            setAvailableUsersLoading(false);
        }).catch(err => {
            console.log(err);
        })
    }, []);

    // Get & Set list of departments (local)
    useEffect(() => {
        axios.get("/api/departments/").then(response => {
            setAvailableDepartments(response.data);
            setAvailableDepartmentsLoading(false);
        }).catch(err => {
            console.log(err);
        })
    }, []);

    // Set initial values based on props
    useEffect(() => {
        if (props.sample !== null) {
            const source = props.sample;
            setInitialState(props);
            setSourceId(source.id)
            setSourceName(source.kutsumanimi);
            setSourceType(source.tyyppi);
            setProducerReference(source.viite_valmistaja);
            setStukReference(source.viite_stuk);
            setSourceCertificateReference(source.viite_lahde_sertifikaatti);
            setSourceAdditionDate(source.lisatty_pvm);
            setSourceReferenceActivityDate(new Date(source.referenssi_pvm).toISOString().slice(0,10));
            setSourceReferenceActivityTimeHours(new Date(source.referenssi_pvm).getHours());
            setSourceReferenceActivityTimeMinutes(new Date(source.referenssi_pvm).getMinutes());
            setSourceBestBeforeDate(source.parasta_ennen_pvm);
            setSourceAcquisitionMethod(source.hankintatapa);
            setAdditionalInformation(source.lisatiedot);
            setStorageLocationGeneral(source.sailytyspaikka);
            setStorageLocationSpecific(source.sailytyspaikka_tarkenne);
            setSourceAddedByUser(source.lisaajan_id);
            setPersonResponsible(source.vastuuhenkilo_id);
            setDepartmentResponsible(source.vastuuosasto_id);
            setSourceNuclides(source.lahteidennuklidits);
            setPermitApprovalDocumentReference(source.viite_lahteen_lupaanvientiasiakirjaan);
            setPermitRemovalDocumentReference(source.viite_lahteen_luvastapoistoasiakirjaan);
            setSourceTypeConsistency(source.avo_koostumus);
            setOpenSourceReferenceVolume(source.avo_referenssi_tilavuus);
            setOpenSourceCurrentVolume(source.avo_nykyinen_tilavuus);
            setClosedSourceClassificationCode(source.umpi_luokituskoodi);
            setClosedSourceIsSpecialForm(source.umpi_erityismuotoisuus);
            setClosedSourceSpecialFormDate(source.umpi_erityismuotoisuus_pvm);
            setClosedSourceSpecialFormCertificate(source.umpi_erityismuotoisuus_todistus);
            setRemovalDate(source.poistettu_pvm);
            setRemoverId(source.poistajan_id);
            setRemovalMethod(source.poisto_tapa);
            setRemovalReason(source.poisto_syy);
            setShowAddNewNuclideBlock(false);
        }
    }, [props])

    /**
     * FORM VALIDATOR FUNCTIONS
     */
    function isValidSourceType(sourceTypeToTest) {
        const validatorResult = validSourceTypes.find( ({ type }) => type === sourceTypeToTest );
        if (validatorResult !== undefined && validatorResult !== null) {
            console.log("Valid sourceType selected: " + sourceTypeToTest)
            return true;
        } else {
            console.log("Invalid sourceType selected: " + sourceTypeToTest)
            return false;
        }
    }

    function isValidSourceTypeConsistency(consistencyToTest) {
        const findResult = validOpenSourceTypeConsistencies.find( ({ consistency }) => consistency === consistencyToTest );
        if (findResult !== undefined && findResult !== null && sourceType === 'Avolähde') {
            console.log("Valid consistency selected: " + consistencyToTest);
            return true;
        } else {
            console.log("Invalid consisteny selected: " + consistencyToTest)
            return false;
        }
    }

    function isValidSpecialFormOption(specialFormOptionToTest) {
        const findResult = validOptionsClosedSourceIsSpecialForm.find( ({ isSpecialForm }) => isSpecialForm === specialFormOptionToTest );
        if (findResult !== undefined && findResult !== null && sourceType === 'Umpilähde') {
            console.log("Valid special form option selected: " + specialFormOptionToTest);
            return true;
        } else {
            console.log("Invalid special form option selected: " + specialFormOptionToTest)
            return false;
        }
    }

    function isValidNuclide(nuclideName) {
        const result = state.nuclides.find( ({ nuklidi }) => nuklidi === nuclideName );
        if (result !== undefined && result !== null) {
            return true;
        } else {
            return false;
        }
    }

    function isValidRefActivity(refActivity) {
        if ((!isNaN(refActivity)) && refActivity >= 0 && refActivity !== "" && refActivity !== null && refActivity !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    function sourceIsRemoved() {
        if (removalDate !== null || removerId !== null || removalMethod !== null || removalReason !== null) {
            return true;
        } else {
            return false;
        }
    }

    function isValidUser(userId) {
        //TODO
        return true;
    }

    function isValidDepartment(departmentId) {
        //TODO
        return true;
    }

    /**
     * FORM HANDLERS
     */
    const handleSourceNameChanged = (event) => {
        if (event.target.value !== null && event.target.value !== undefined && event.target.value.length <= 80) {
            setSourceName(event.target.value);
        } else {
            return;
        }
    }

    const handleSourceTypeChanged = (event) => {
        if (isValidSourceType(event.target.value)) {
            if (event.target.value === 'Avolähde') {
                if (sourceTypeConsistency === null) {
                    setSourceTypeConsistency('jauhe');
                }
                setClosedSourceClassificationCode(null);
                setClosedSourceIsSpecialForm(null);
                setClosedSourceSpecialFormCertificate(null);
                setClosedSourceSpecialFormDate(null);
            } else if (event.target.value === 'Umpilähde') {
                if (closedSourceIsSpecialForm === null) {
                    setClosedSourceIsSpecialForm('Ei');
                }
                setSourceTypeConsistency(null);
                setOpenSourceReferenceVolume(null);
                setOpenSourceCurrentVolume(null);
            }
            console.log("Setting source type to: " + event.target.value);
            setSourceType(event.target.value);
        } else if (event.target.value === props.sample.tyyppi) {
            setSourceType(props.sample.tyyppi);
        } else {
            console.log("Invalid source type");
        }
    }

    const handleProducerReferenceChanged = (event) => {
        if (event.target.value.length <= 80) {
            setProducerReference(event.target.value);
        } else {
            return;
        }
    }

    const handleStukReferenceChanged = (event) => {
        if (event.target.value.length <= 80) {
            setStukReference(event.target.value);
        } else {
            return;
        }
    }

    const handleSourceCertificateReferenceChanged = (event) => {
        if (event.target.value.length <= 60) {
            setSourceCertificateReference(event.target.value);
        } else {
            return;
        }
    }

    const handleSourceAdditionDateChanged = (event) => {
        setSourceAdditionDate(event.target.value);
    }

    const handleSourceReferenceActivityDateChanged = (event) => {
        setSourceReferenceActivityDate(event.target.value);
    }

    const handleSourceReferenceActivityTimeHoursChanged = (event) => {
        if (event.target.value <= 23 && event.target.value >= 0 && event.target.value.length <= 2) {
            console.log("refHours changed to: " + event.target.value)
            setSourceReferenceActivityTimeHours(event.target.value);
        } else {
            return;
        }
    }

    const handleSourceReferenceActivityTimeMinutesChanged = (event) => {
        if (event.target.value <= 59 && event.target.value >= 0 && event.target.value.length <= 2) {
            console.log("refMinutes changed to: " + event.target.value)
            setSourceReferenceActivityTimeMinutes(event.target.value);
        } else {
            return;
        }
    }

    const handleCreateNewSourceReferenceActivityDateTime = (date, hours, minutes) => {
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
        setSourceReferenceActivityDate(createdDate);
        return createdDate;
    }

    const handleSourceBestBeforeDateChanged = (event) => {
        setSourceBestBeforeDate(event.target.value);
    }

    const handleSourceAcquisitionMethodChanged = (event) => {
        if (event.target.value.length <= 200) {
            setSourceAcquisitionMethod(event.target.value);
        } else {
            return;
        }
    }

    const handleAdditionalInformationChanged = (event) => {
        if (event.target.value.length <= 2000) {
            setAdditionalInformation(event.target.value);
        } else {
            return;
        }
    }

    const handleStorageLocationGeneralChanged = (event) => {
        if (event.target.value.length <= 100) {
            setStorageLocationGeneral(event.target.value);
        } else {
            return;
        }
    }

    const handleStorageLocationSpecificChanged = (event) => {
        if (event.target.value.length <= 100) {
            setStorageLocationSpecific(event.target.value);
        } else {
            return;
        }
    }

    const handleSourceAddedByUserChanged = (event) => {
        if (isValidUser(event.target.value)) {
            setSourceAddedByUser(event.target.value);
        } else {
            console.log("Invalid user selected @ handleSourceAddedByUserChanged");
            return;
        }
    }

    const handlePersonResponsibleChanged = (event) => {
        if (isValidUser(event.target.value)) {
            console.log("Person resposible changed to person with id: " + event.target.value);
            setPersonResponsible(event.target.value);
        } else {
            console.log("Invalid user selected @ handlePersonResponsibleChanged");
            return;
        }
    }

    const handleDepartmentResponsible = (event) => {
        if (isValidDepartment(event.target.value)) {
            setDepartmentResponsible(event.target.value);
        } else {
            console.log("Invalid department selected @ handleDepartmentResponsible")
            return;
        }
    }

    const handlePermitApprovalDocumentReferenceChanged = (event) => {
        if (event.target.value.length <= 80) {
            setPermitApprovalDocumentReference(event.target.value);
        } else {
            return;
        }
    }

    const handlePermitRemovalDocumentReferenceChanged = (event) => {
        if (event.target.value.length <= 80) {
            setPermitRemovalDocumentReference(event.target.value);
        } else {
            return;
        }
    }

    const handleSourceTypeConsistencyChanged = (event) => {
        if (isValidSourceTypeConsistency(event.target.value)) {
            console.log("Setting source type consistency to: " + event.target.value);
            setSourceTypeConsistency(event.target.value);
        } else if (event.target.value === props.sample.avo_koostumus) {
            setSourceTypeConsistency(props.sample.avo_koostumus);
        } else {
            console.log("Invalid source type consistency");
            return;
        }
    }

    const handleOpenSourceReferenceVolumeChanged = (event) => {
        if (event.target.value >= 0 && sourceType === 'Avolähde') {
            setOpenSourceReferenceVolume(event.target.value);
        } else {
            console.log(`Invalid value @ handleOpenSourceReferenceVolumeChanged: ${event.target.value}, ${sourceType}`);
            return;
        }
    }

    const handleOpenSourceCurrentVolumeChanged = (event) => {
        if (event.target.value >= 0 && sourceType === 'Avolähde') {
            setOpenSourceCurrentVolume(event.target.value);
        } else {
            console.log(`Invalid value @ handleOpenSourceCurrentVolumeChanged: ${event.target.value}, ${sourceType}`);
            return;
        }
    }

    const handleClosedSourceClassificationCodeChanged = (event) => {
        if (sourceType === 'Umpilähde' && event.target.value.length <= 40) {
            setClosedSourceClassificationCode(event.target.value);
        } else {
            console.log("Invalid source type @ handleClosedSourceClassificationCodeChanged: " + sourceType);
            return;
        }
    }

    const handleClosedSourceIsSpecialFormChanged = (event) => {
        if (isValidSpecialFormOption(event.target.value)) {
            console.log("Setting special form option to: " + event.target.value);
            setClosedSourceIsSpecialForm(event.target.value);
        } else if (sourceType === 'Avolähde') {
            console.log("Forcing NULL for special form because sourceType: " + sourceType);
            setClosedSourceIsSpecialForm(null);
        } else {
            console.log("Invalid special form option chosen: " + event.target.value);
            return;
        }
    }

    const handleClosedSourceSpecialFormDateChanged = (event) => {
        if (sourceType === 'Umpilähde' && closedSourceIsSpecialForm === 'Kyllä') {
            console.log("Setting new date for special form: " + event.target.value);
            setClosedSourceSpecialFormDate(event.target.value);
        } else if (sourceType !== 'Umpilähde' || closedSourceIsSpecialForm === 'Ei' || closedSourceIsSpecialForm === null) {
            console.log("Forcing special form date to NULL...");
            setClosedSourceSpecialFormDate(null);
        } else {
            console.log("Invalid special form date @ handleClosedSourceSpecialFormDateChanged");
            return;
        }
    }

    const handleClosedSourceSpecialFormCertificateChanged = (event) => {
        if (sourceType === 'Umpilähde' && closedSourceIsSpecialForm === 'Kyllä' && event.target.value.length <= 255) {
            console.log("Setting new special form certificate: " + event.target.value);
            setClosedSourceSpecialFormCertificate(event.target.value);
        } else if (sourceType !== 'Umpilähde' || closedSourceIsSpecialForm === 'Ei' || closedSourceIsSpecialForm === null) {
            console.log("Forcing special form certificate to NULL...");
            setClosedSourceSpecialFormCertificate(null);
        } else {
            console.log("Invalid special form certificate @ handleClosedSourceSpecialFormCertificateChanged");
            return;
        }
    }

    const handleRemovalDateChanged = (event) => {
        if (sourceIsRemoved() && event.target.value !== null && event.target.value !== undefined && event.target.value !== "") {
            console.log("Setting new removal date for source: " + event.target.value);
            setRemovalDate(event.target.value);
        } else {
            console.log("Source is either not removed or the value was null/undefined/empty @ handleRemovalDateChanged");
            return;
        }
    }

    const handleRemoverIdChanged = (event) => {
        if (sourceIsRemoved() && isValidUser(event.target.value)) {
            console.log("Setting new remover: " + event.target.value);
            setRemoverId(event.target.value);
        } else {
            console.log("Source is either not removed or the given userid was not valid @ handleRemoverIdChanged");
            return;
        }
    }

    const handleRemovalMethodChanged = (event) => {
        if (sourceIsRemoved() && event.target.value !== null && event.target.value !== undefined && event.target.value !== "" && event.target.value.length <= 80) {
            console.log("Setting new removal method: " + event.target.value);
            setRemovalMethod(event.target.value);
        } else {
            console.log("Source is either not removed or the value was wrong @ handleRemovalDateChanged");
            return;
        }
    }
    
    const handleRemovalReasonChanged = (event) => {
        if (sourceIsRemoved() && event.target.value !== null && event.target.value !== undefined && event.target.value !== "" && event.target.value.length <= 500) {
            console.log("Setting new removal reason: " + event.target.value);
            setRemovalReason(event.target.value);
        } else {
            console.log("Source is either not removed or the value was wrong @ handleRemovalReasonChanged");
            return;
        }
    }

    const handleEditSummaryChanged = (event) => {
        if (event.target.value.length <= 1000 && event.target.value !== null && event.target.value !== undefined) {
            console.log("Setting edit summary to: " + event.target.value);
            setEditSummary(event.target.value);
        } else {
            console.log("Not setting edit summary due to constraints...")
            return;
        }
    }

    /**
     * NUCLIDE LIST FUNCTIONS
     */
     const addNuclideChanged = (event) => {
        console.log("Nuclide name in mem changed to " + event.target.value);
        if (event.target.value !== t('one-sample-edit-popup_choose-dot-dot-dot')) {
            setNuclideInMemName(event.target.value);
        } else {
            console.log("Invalid value @ addNuclideChanged");
            return;
        }
    }

    const addNuclideRefActivityChanged = (event) => {
        if (event.target.value !== null && event.target.value !== undefined && event.target.value !== "" && event.target.value >= 0) {
            setNuclideInMemRefActivity(event.target.value);
        } else {
            setNuclideInMemRefActivity("");
        }
    }

     const handleAddNuclideToSource = (event) => {
        if (isValidNuclide(nuclideInMemName) && isValidRefActivity(nuclideInMemRefActivity)) {
            setSourceNuclides([...sourceNuclides, {nuklidi: nuclideInMemName, referenssi_aktiivisuus: bqConverter(parseFloat(nuclideInMemRefActivity), newNuclideRefActivityUnit)}])
            console.log("added " + nuclideInMemName + " with activity: " + nuclideInMemRefActivity + " Bq")
            setShowAddNewNuclideBlock(false);
            if (nuclideInMemName !== null) {
                setNuclideInMemName(null);
            }
            if (nuclideInMemRefActivity !== null) {
                setNuclideInMemRefActivity(null);
            }
            setNewNuclideRefActivityUnit('Bq');
        } else {
            console.log("Nuclide wasn't added. Invalid values detected.")
            alert(t('one-sample-edit-popup_alert-handle-add-nuclide-to-source-failed'));
        }
        console.log(sourceNuclides)
    }

    const handleRemoveNuclideFromSource = (event) => {
        console.log("Removing nuclide:");
        const cTarget = event.currentTarget;
        console.log(cTarget)
        const cTargetValue = cTarget.getAttribute('value');
        console.log(cTargetValue);
        let nuclidesCopy = [...sourceNuclides];
        console.log(nuclidesCopy);
        const cTargetData = cTarget.getAttribute('data')
        console.log(cTargetData);
        const jsonObj = JSON.parse(cTargetData);
        console.log(jsonObj);
        if (cTargetValue !== -1 || cTargetValue !== null || cTargetValue !== undefined) {
            console.log("Splicing...");
            nuclidesCopy.splice(cTargetValue, 1);
            setSourceNuclides(nuclidesCopy);
        } else {
            setSourceNuclides(...sourceNuclides);
            console.log("LOGGING cTarget & cTargetValue FOR ERRORS:")
            console.log(cTarget);
            console.log(cTargetValue);
            alert(t('one-sample-edit-popup_alert-handle-remove-nuclide-from-source-failed'));
        }
    }

    /**
     * SUBMIT & RESET HANDLERS
     */
    // Reset edits to initial values
    const resetEditForm = () => {
        const source = props.sample;
        setInitialState(props);
        setSourceId(source.id)
        setSourceName(source.kutsumanimi);
        setSourceType(source.tyyppi);
        setProducerReference(source.viite_valmistaja);
        setStukReference(source.viite_stuk);
        setSourceCertificateReference(source.viite_lahde_sertifikaatti);
        setSourceAdditionDate(source.lisatty_pvm);
        setSourceReferenceActivityDate(new Date(source.referenssi_pvm).toISOString().slice(0,10));
        setSourceReferenceActivityTimeHours(new Date(source.referenssi_pvm).getHours());
        setSourceReferenceActivityTimeMinutes(new Date(source.referenssi_pvm).getMinutes());
        setSourceBestBeforeDate(source.parasta_ennen_pvm);
        setSourceAcquisitionMethod(source.hankintatapa);
        setAdditionalInformation(source.lisatiedot);
        setStorageLocationGeneral(source.sailytyspaikka);
        setStorageLocationSpecific(source.sailytyspaikka_tarkenne);
        setSourceAddedByUser(source.lisaajan_id);
        setPersonResponsible(source.vastuuhenkilo_id);
        setDepartmentResponsible(source.vastuuosasto_id);
        setSourceNuclides(source.lahteidennuklidits);
        setPermitApprovalDocumentReference(source.viite_lahteen_lupaanvientiasiakirjaan);
        setPermitRemovalDocumentReference(source.viite_lahteen_luvastapoistoasiakirjaan);
        setSourceTypeConsistency(source.avo_koostumus);
        setOpenSourceReferenceVolume(source.avo_referenssi_tilavuus);
        setOpenSourceCurrentVolume(source.avo_nykyinen_tilavuus);
        setClosedSourceClassificationCode(source.umpi_luokituskoodi);
        setClosedSourceIsSpecialForm(source.umpi_erityismuotoisuus);
        setClosedSourceSpecialFormDate(source.umpi_erityismuotoisuus_pvm);
        setClosedSourceSpecialFormCertificate(source.umpi_erityismuotoisuus_todistus);
        setRemovalDate(source.poistettu_pvm);
        setRemoverId(source.poistajan_id);
        setRemovalMethod(source.poisto_tapa);
        setRemovalReason(source.poisto_syy);
    }

    // Validation of edits
    const validateEdits = () => {
        console.log("Validating...")
        if (sourceName === "") {
            return false;
        } else {
            return true;
        }
    }

    // Post edits through axios
    const handleEditSource = (event) => {

    const formattedSourceNuclides = [];

    let sourceReferenceActivityDateTimeObject;

        const formatSourceNuclides = () => {
            sourceNuclides.forEach(function (sourceNuclide, index, array) {
                console.log(`Nuclide: ${sourceNuclide.nuklidi}, RefAct: ${sourceNuclide.referenssi_aktiivisuus} Bq`)
                let nuclideObject = {nuklidi: sourceNuclide.nuklidi, referenssi_aktiivisuus: parseFloat(sourceNuclide.referenssi_aktiivisuus)};
                formattedSourceNuclides.push(nuclideObject);
            });
        }

        if ( new Date(sourceReferenceActivityDate).toISOString().slice(0,10) !== new Date(props.sample.referenssi_pvm).toISOString().slice(0,10) || 
            sourceReferenceActivityTimeHours !== ( new Date(props.sample.referenssi_pvm).getHours() ) || 
            sourceReferenceActivityTimeMinutes !== ( new Date(props.sample.referenssi_pvm).getMinutes() ) ) {
            sourceReferenceActivityDateTimeObject = handleCreateNewSourceReferenceActivityDateTime(sourceReferenceActivityDate, sourceReferenceActivityTimeHours, sourceReferenceActivityTimeMinutes);
        } else {
            sourceReferenceActivityDateTimeObject = props.sample.referenssi_pvm;
        }

        formatSourceNuclides();

        function editLogConstructor() {
            let constructedLog = `Changelog (${new Date()})\n\n`;
            let changeCounter = 0;
                if (sourceName !== props.sample.kutsumanimi) {
                    constructedLog += `Source name changed: ${props.sample.kutsumanimi} => ${sourceName}. \n`;
                    changeCounter++;}
                if (sourceType !== props.sample.tyyppi) {
                    constructedLog += `Source type changed: ${props.sample.tyyppi} => ${sourceType}. \n`;
                    changeCounter++;}
                if (producerReference !== props.sample.viite_valmistaja) {
                    constructedLog += `Producer reference changed: ${props.sample.viite_valmistaja} => ${producerReference}. \n`;
                    changeCounter++;}
                if (stukReference !== props.sample.viite_stuk) {
                    constructedLog += `STUK reference changed: ${props.sample.viite_stuk} => ${stukReference}. \n`;
                    changeCounter++;}
                if (sourceCertificateReference !== props.sample.viite_lahde_sertifikaatti) {
                    constructedLog += `Source certificate changed: ${props.sample.viite_lahde_sertifikaatti} => ${sourceCertificateReference}. \n`;
                    changeCounter++;}
                if (sourceAdditionDate !== props.sample.lisatty_pvm)
                    {constructedLog += `Source added date changed: ${props.sample.lisatty_pvm} => ${sourceAdditionDate}. \n`;
                    changeCounter++;}
                if (sourceReferenceActivityDateTimeObject !== props.sample.referenssi_pvm)
                    {constructedLog += `Reference radioactivity date changed: ${props.sample.referenssi_pvm} => ${sourceReferenceActivityDateTimeObject}. \n`;
                    changeCounter++;}
                if (sourceBestBeforeDate !== props.sample.parasta_ennen_pvm)
                    {constructedLog += `Best before date changed: ${props.sample.parasta_ennen_pvm} => ${sourceBestBeforeDate}. \n`;
                    changeCounter++;}
                if (sourceAcquisitionMethod !== props.sample.hankintatapa)
                    {constructedLog += `Acquisition method changed: ${props.sample.hankintatapa} => ${sourceAcquisitionMethod}. \n`;
                    changeCounter++;}
                if (additionalInformation !== props.sample.lisatiedot)
                    {constructedLog += `Additional information changed: ${props.sample.lisatiedot} => ${additionalInformation}. \n`;
                    changeCounter++;}
                if (storageLocationGeneral !== props.sample.sailytyspaikka)
                    {constructedLog += `General storage location changed: ${props.sample.sailytyspaikka} => ${storageLocationGeneral}. \n`;
                    changeCounter++;}
                if (storageLocationSpecific !== props.sample.sailytyspaikka_tarkenne)
                    {constructedLog += `Specific storage location changed: ${props.sample.sailytyspaikka_tarkenne} => ${storageLocationSpecific}. \n`;
                    changeCounter++;}
                if (sourceAddedByUser !== props.sample.lisaajan_id)
                    {constructedLog += `Person who added the source changed: ${props.sample.lisaajan_id} => ${sourceAddedByUser}. \n`;
                    changeCounter++;}
                if (personResposible !== props.sample.vastuuhenkilo_id)
                    {constructedLog += `Person responsible changed: ${props.sample.vastuuhenkilo_id} => ${personResposible}. \n`;
                    changeCounter++;}
                if (departmentResponsible !== props.sample.vastuuosasto_id)
                    {constructedLog += `Department responsible changed: ${props.sample.vastuuosasto_id} => ${departmentResponsible}. \n`;
                    changeCounter++;}
                if (permitApprovalDocumentReference !== props.sample.viite_lahteen_lupaanvientiasiakirjaan)
                    {constructedLog += `Permit approval document changed: ${props.sample.viite_lahteen_lupaanvientiasiakirjaan} => ${permitApprovalDocumentReference}. \n`;
                    changeCounter++;}
                if (permitRemovalDocumentReference !== props.sample.viite_lahteen_luvastapoistoasiakirjaan)
                    {constructedLog += `Permit removal document changed: ${props.sample.viite_lahteen_luvastapoistoasiakirjaan} => ${permitRemovalDocumentReference}. \n`;
                    changeCounter++;}
                if (sourceTypeConsistency !== props.sample.avo_koostumus)
                    {constructedLog += `Open source consistency changed: ${props.sample.avo_koostumus} => ${sourceTypeConsistency}. \n`;
                    changeCounter++;}
                if (openSourceReferenceVolume !== props.sample.avo_referenssi_tilavuus)
                    {constructedLog += `Open source reference volume changed: ${props.sample.avo_referenssi_tilavuus} => ${openSourceReferenceVolume}. \n`;
                    changeCounter++;}
                if (openSourceCurrentVolume !== props.sample.avo_nykyinen_tilavuus)
                    {constructedLog += `Open source current volume changed: ${props.sample.avo_nykyinen_tilavuus} => ${openSourceCurrentVolume}. \n`;
                    changeCounter++;}
                if (closedSourceClassificationCode !== props.sample.umpi_luokituskoodi)
                    {constructedLog += `Closed source classification code changed: ${props.sample.umpi_luokituskoodi} => ${closedSourceClassificationCode}. \n`;
                    changeCounter++;}
                if (closedSourceIsSpecialForm !== props.sample.umpi_erityismuotoisuus)
                    {constructedLog += `Closed source special form boolean changed: ${props.sample.umpi_erityismuotoisuus} => ${closedSourceIsSpecialForm}. \n`;
                    changeCounter++;}
                if (closedSourceSpecialFormDate !== props.sample.umpi_erityismuotoisuus_pvm)
                    {constructedLog += `Closed source special form date changed: ${props.sample.umpi_erityismuotoisuus_pvm} => ${closedSourceSpecialFormDate}. \n`;
                    changeCounter++;}
                if (closedSourceSpecialFormCertificate !== props.sample.umpi_erityismuotoisuus_todistus)
                    {constructedLog += `Closed source special form certificate changed: ${props.sample.kutsumanimi} => ${closedSourceSpecialFormCertificate}. \n`;
                    changeCounter++;}
                if (removalDate !== props.sample.poistettu_pvm)
                    {constructedLog += `Source removal date changed: ${props.sample.poistettu_pvm} => ${removalDate}. \n`;
                    changeCounter++;}
                if (removerId !== props.sample.poistajan_id)
                    {constructedLog += `Source remover id changed: ${props.sample.poistajan_id} => ${removerId}. \n`;
                    changeCounter++;}
                if (removalMethod !== props.sample.poisto_tapa)
                    {constructedLog += `Source removal method changed: ${props.sample.poisto_tapa} => ${removalMethod}. \n`;
                    changeCounter++;}
                if (removalReason !== props.sample.poisto_syy) {
                    constructedLog += `Source removal reason changed: ${props.sample.poisto_syy} => ${removalReason}. \n`;
                    changeCounter++;
                }
                if (sourceNuclides !== props.sample.lahteidennuklidits) {
                    constructedLog += `Source nuclide(s) have been changed. \n`;
                    changeCounter++;
                }
                if (changeCounter === 0) {
                    constructedLog += `No changes made. \n === END OF LOG === \n`;
                } else {
                    constructedLog += `\n === END OF LOG (${changeCounter} change(s) made) === \n`;
                }
                    
            return {constructedLog: constructedLog, changeCounter: changeCounter};
        }

        const editLogConstructorObject = editLogConstructor();
        editLog = editLogConstructorObject.constructedLog;
        editCount = editLogConstructorObject.changeCounter;

        const editedSource = {
            kutsumanimi: sourceName,
            tyyppi: sourceType,
            viite_valmistaja: producerReference,
            viite_stuk: stukReference,
            viite_lahde_sertifikaatti: sourceCertificateReference,
            lisatty_pvm: sourceAdditionDate,
            referenssi_pvm: sourceReferenceActivityDateTimeObject,
            parasta_ennen_pvm: sourceBestBeforeDate,
            hankintatapa: sourceAcquisitionMethod,
            lisatiedot: additionalInformation,
            sailytyspaikka: storageLocationGeneral,
            sailytyspaikka_tarkenne: storageLocationSpecific,
            lisaajan_id: sourceAddedByUser,
            vastuuhenkilo_id: personResposible,
            vastuuosasto_id: departmentResponsible,
            viite_lahteen_lupaanvientiasiakirjaan: permitApprovalDocumentReference,
            viite_lahteen_luvastapoistoasiakirjaan: permitRemovalDocumentReference,
            avo_koostumus: sourceTypeConsistency,
            avo_referenssi_tilavuus: openSourceReferenceVolume,
            avo_nykyinen_tilavuus: openSourceCurrentVolume,
            umpi_luokituskoodi: closedSourceClassificationCode,
            umpi_erityismuotoisuus: closedSourceIsSpecialForm,
            umpi_erityismuotoisuus_pvm: closedSourceSpecialFormDate,
            umpi_erityismuotoisuus_todistus: closedSourceSpecialFormCertificate,
            poistettu_pvm: removalDate,
            poistajan_id: removerId,
            poisto_tapa: removalMethod,
            poisto_syy: removalReason,
            // Sends a formatted list of the source's nuclides with only the 'nuklidi'- & 'referenssi_aktiivisuus'-properties
            lahteidennuklidits: formattedSourceNuclides,
            // Count the number of edits
            edit_count: editCount,
            // Edit summary provided by user
            edit_summary: editSummary,
            // Edit log auto-generated
            edit_log: editLog,
            // Send current userid in state
            editor_id: authState.user.id
        }

        if (validateEdits()) {
            console.log("LOGGING EDITED OBJECT:")
            console.log(editedSource)

            axios.post(`api/samples/edit-source/${sourceId}`, editedSource).then(response => {
                console.log("Got a response from editting a source:")
                console.log(response.data);
                window.location.reload();
                props.onHide();
            }).catch(error => {
                console.log("An error occured @ handleEditSource:")
                console.log(error);
            })
        } else {
            console.log("Non-valid edits detected");
        }
    }

    /**
     * LAYOUT SUBCOMPONENTS
     */
    const sourceTypeSpecificForms = () => {
        if (sourceType !== null) {
            if (sourceType === 'Avolähde') {
                return (
                    <React.Fragment>
                        <hr/>
                        {t('one-sample-edit-popup_source-type-opensource-contentheader')}
                        {openSourceForms()}
                    </React.Fragment>
                );
            } else if (sourceType === 'Umpilähde') {
                return (
                    <React.Fragment>
                        <hr/>
                        {t('one-sample-edit-popup_source-type-closedsource-contentheader')}
                        <InputGroup className="mb-1 mt-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="closedSourceClassificationCode">{t('one-sample-edit-popup_source-type-closedsource-classification-code-prepend')}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                aria-label={t('one-sample-edit-popup_source-type-closedsource-classification-code-arialabel')}
                                aria-describedby="closedSourceClassificationCode"
                                type="text"
                                defaultValue={props.sample.umpi_luokituskoodi}
                                value={closedSourceClassificationCode} 
                                onChange={handleClosedSourceClassificationCodeChanged}
                            />
                        </InputGroup>
                        <InputGroup className="mb-1 mt-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="closedSourceSpecialType">{t('one-sample-edit-popup_source-type-closedsource-isspecialform-prepend')}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                as="select"
                                aria-label={t('one-sample-edit-popup_source-type-closedsource-isspecialform-arialabel')}
                                aria-describedby="closedSourceSpecialType"
                                type="text"
                                defaultValue={props.sample.umpi_erityismuotoisuus}
                                value={closedSourceIsSpecialForm} 
                                onChange={handleClosedSourceIsSpecialFormChanged}
                            >
                                { validOptionsClosedSourceIsSpecialForm.map((form) => 
                                    <option
                                        key={form.isSpecialForm}
                                        name="closedSourceSpecialFormOption"
                                        defaultValue={props.sample.umpi_erityismuotoisuus}
                                        value={form.isSpecialForm}
                                    >
                                        {form.isSpecialForm} 
                                    </option>
                                ) }
                            </FormControl>
                        </InputGroup>
                        {closedSourceSpecialFormForms()}
                    </React.Fragment>
                );
            } else {
                return (
                    <div>
                        <p>{t('one-sample-edit-popup_source-type-nonstandard')} {props.sample.tyyppi}</p>
                    </div>
                );
            }
        } else {
            return (
                <div>
                    <p>{t('one-sample-edit-popup_source-type-notype')}</p>
                </div>
            );
        }
    }

    const closedSourceSpecialFormForms = () => {
        if (closedSourceIsSpecialForm === 'Kyllä') {
            return (
                <React.Fragment>
                    <InputGroup className="mb-1 mt-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="closedSourceSpecialFormDate">{t('one-sample-edit-popup_closed-source-specialform-date-prepend')}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control 
                            type="date"
                            aria-label={t('one-sample-edit-popup_closed-source-specialform-date-arialabel')}
                            aria-describedby="closedSourceSpecialFormDate"
                            defaultValue={props.sample.umpi_erityismuotoisuus_pvm}
                            value={closedSourceSpecialFormDate}
                            onChange={handleClosedSourceSpecialFormDateChanged}
                        />
                    </InputGroup>
                    <InputGroup className="mb-1 mt-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="closedSourceSpecialFormCertificate">{t('one-sample-edit-popup_closed-source-specialform-certificate-prepend')}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            aria-label={t('one-sample-edit-popup_closed-source-specialform-certificate-arialabel')}
                            aria-describedby="closedSourceSpecialFormCertificate"
                            type="text"
                            defaultValue={props.sample.umpi_erityismuotoisuus_todistus}
                            value={closedSourceSpecialFormCertificate} 
                            onChange={handleClosedSourceSpecialFormCertificateChanged}
                        />
                    </InputGroup>
                </React.Fragment>
            );
        } else if (closedSourceIsSpecialForm === 'Ei') {
            return (
                <React.Fragment></React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <div>
                        <p>{t('one-sample-edit-popup_closed-source-specialform-nonstandard-line1')}</p>
                        <p>{t('one-sample-edit-popup_closed-source-specialform-nonstandard-line2')}</p>
                    </div>
                </React.Fragment>
            );
        }
    }

    const openSourceForms = () => {
        if (sourceType === 'Avolähde') {
            return (
                <React.Fragment>
                    <InputGroup className="mb-1 mt-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="sourceTypeConsistency">{t('one-sample-edit-popup_open-source-consistency-prepend')}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            as="select"
                            aria-label={t('one-sample-edit-popup_open-source-consistency-arialabel')}
                            aria-describedby="sourceTypeConsistency"
                            type="text"
                            defaultValue={props.sample.avo_koostumus}
                            value={sourceTypeConsistency} 
                            onChange={handleSourceTypeConsistencyChanged}
                        >
                            { validOpenSourceTypeConsistencies.map((typeConsistency) => 
                                <option
                                    key={typeConsistency.consistency}
                                    name="openSourceConsistencyOption"
                                    value={typeConsistency.consistency}
                                >
                                    {typeConsistency.consistency}
                                </option>
                            ) }
                        </FormControl>
                    </InputGroup>
                    <InputGroup className="mb-1 mt-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="openSourceReferenceVolume">{t('one-sample-edit-popup_open-source-reference-amount-prepend')}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            aria-label={t('one-sample-edit-popup_open-source-reference-amount-arialabel')}
                            aria-describedby="openSourceReferenceVolume"
                            type="text"
                            defaultValue={props.sample.avo_referenssi_tilavuus}
                            value={openSourceReferenceVolume} 
                            onChange={handleOpenSourceReferenceVolumeChanged}
                        />
                    </InputGroup>
                    <InputGroup className="mb-1 mt-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="openSourceCurrentVolume">{t('one-sample-edit-popup_open-source-current-amount-prepend')}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            aria-label={t('one-sample-edit-popup_open-source-current-amount-arialabel')}
                            aria-describedby="openSourceCurrentVolume"
                            type="text"
                            defaultValue={props.sample.avo_nykyinen_tilavuus}
                            value={openSourceCurrentVolume} 
                            onChange={handleOpenSourceCurrentVolumeChanged}
                        />
                    </InputGroup>
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <div>
                        <p>{t('one-sample-edit-popup_open-source-nonstandard-line1')}</p>
                        <p>{t('one-sample-edit-popup_open-source-nonstandard-line2')}</p>
                    </div>
                </React.Fragment>
            );
        }
    }

    const sourceRemovalForm = () => {
        if (sourceIsRemoved()) {
            return (
                <React.Fragment>
                    <hr/>
                    {t('one-sample-edit-popup_removal-properties-contentheader')}
                    <br/>
                    {t('one-sample-edit-popup_removal-properties-placeholdertext')}
                </React.Fragment>
            );
        } else {
            <React.Fragment></React.Fragment>
        }
    }

    const sourceEditSummaryForm = () => {
        return (
            <React.Fragment>
                <hr/>
                {t('one-sample-edit-popup_summary-of-changes-contentheader')}
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="editSummaryPrepend">{t('one-sample-edit-popup_summary-of-changes-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        as="textarea"
                        aria-label={t('one-sample-edit-popup_summary-of-changes-arialabel')}
                        aria-describedby="editSummaryPrepend"
                        type="text"
                        defaultValue=""
                        value={editSummary} 
                        onChange={handleEditSummaryChanged}
                    />
                </InputGroup>
            </React.Fragment>
        );
    }

    const sourceGeneralForm = () => {
        return (
            <React.Fragment>
                <hr/>
                {t('one-sample-edit-popup_general-properties-contentheader')}
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="stukReference">{t('one-sample-edit-popup_internal-reference-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label={t('one-sample-edit-popup_internal-reference-arialabel')}
                        aria-describedby="stukReference"
                        type="text"
                        defaultValue={props.sample.viite_stuk}
                        value={stukReference} 
                        onChange={handleStukReferenceChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="producerReference">{t('one-sample-edit-popup_producer-reference-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label={t('one-sample-edit-popup_producer-reference-arialabel')}
                        aria-describedby="producerReference"
                        type="text"
                        defaultValue={props.sample.viite_valmistaja}
                        value={producerReference} 
                        onChange={handleProducerReferenceChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="sourceCertificateReference">{t('one-sample-edit-popup_certificate-reference-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label={t('one-sample-edit-popup_certificate-reference-arialabel')}
                        aria-describedby="sourceCertificateReference"
                        type="text"
                        defaultValue={props.sample.viite_lahde_sertifikaatti}
                        value={sourceCertificateReference} 
                        onChange={handleSourceCertificateReferenceChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="sourceAcquisitionMethod">{t('one-sample-edit-popup_acquisition-method-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label={t('one-sample-edit-popup_acquisition-method-arialabel')}
                        aria-describedby="sourceAcquisitionMethod"
                        type="text"
                        defaultValue={props.sample.hankintatapa}
                        value={sourceAcquisitionMethod} 
                        onChange={handleSourceAcquisitionMethodChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="sourceAdditionDate">{t('one-sample-edit-popup_source-added-date-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control 
                        type="date"
                        aria-label={t('one-sample-edit-popup_source-added-date-arialabel')}
                        aria-describedby="sourceAdditionDate"
                        defaultValue={props.sample.lisatty_pvm}
                        value={sourceAdditionDate}
                        onChange={handleSourceAdditionDateChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="sourceReferenceActivityDate">{t('one-sample-edit-popup_radioactivity-reference-date-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl 
                        className="form-control-w32"
                        type="date"
                        aria-label={t('one-sample-edit-popup_radioactivity-reference-date-arialabel')}
                        aria-describedby="sourceReferenceActivityDate"
                        defaultValue={props.sample.referenssi_pvm}
                        value={sourceReferenceActivityDate}
                        onChange={handleSourceReferenceActivityDateChanged}
                    />
                    <InputGroup.Prepend>
                        <InputGroup.Text id="sourceReferenceActivityTime">{t('one-sample-edit-popup_radioactivity-reference-time-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl 
                        className="form-control-w3"
                        type="text"
                        aria-label={t('one-sample-edit-popup_radioactivity-reference-time-hours-arialabel')}
                        aria-describedby="sourceReferenceActivityTime"
                        defaultValue={new Date(props.sample.referenssi_pvm).getHours()}
                        value={sourceReferenceActivityTimeHours}
                        onChange={handleSourceReferenceActivityTimeHoursChanged}
                    />
                    <InputGroup.Prepend>
                        <InputGroup.Text id="sourceReferenceActivityTimeDivider">:</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl 
                        className="form-control-w3"
                        type="text"
                        aria-label={t('one-sample-edit-popup_radioactivity-reference-time-minutes-arialabel')}
                        aria-describedby="sourceReferenceActivityTimeDivider"
                        defaultValue={new Date(props.sample.referenssi_pvm).getMinutes()}
                        value={sourceReferenceActivityTimeMinutes}
                        onChange={handleSourceReferenceActivityTimeMinutesChanged}
                    />
                    <InputGroup.Append className="text-left">
                        <InputGroup.Text>HH:mm</InputGroup.Text>
                    </InputGroup.Append>
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="sourceBestBeforeDate">{t('one-sample-edit-popup_best-before-date-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control 
                        type="date"
                        aria-label={t('one-sample-edit-popup_best-before-date-arialabel')}
                        aria-describedby="sourceBestBeforeDate"
                        defaultValue={props.sample.parasta_ennen_pvm}
                        value={sourceBestBeforeDate}
                        onChange={handleSourceBestBeforeDateChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="storageLocationGeneral">{t('one-sample-edit-popup_general-storage-location-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label={t('one-sample-edit-popup_general-storage-location-arialabel')}
                        aria-describedby="storageLocationGeneral"
                        type="text"
                        defaultValue={props.sample.sailytyspaikka}
                        value={storageLocationGeneral} 
                        onChange={handleStorageLocationGeneralChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="storageLocationSpecific">{t('one-sample-edit-popup_specific-storage-location-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label={t('one-sample-edit-popup_specific-storage-location-arialabel')}
                        aria-describedby="storageLocationSpecific"
                        type="text"
                        defaultValue={props.sample.sailytyspaikka_tarkenne}
                        value={storageLocationSpecific} 
                        onChange={handleStorageLocationSpecificChanged}
                    />
                </InputGroup>
                <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text id="additionalInformation">{t('one-sample-edit-popup_additional-information-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl 
                        as="textarea" 
                        type="text" 
                        aria-label={t('one-sample-edit-popup_additional-information-arialabel')}
                        aria-describedby="additionalInformation"
                        value={additionalInformation} 
                        onChange={handleAdditionalInformationChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="personResposible">{t('one-sample-edit-popup_person-responsible-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        as="select"
                        aria-label={t('one-sample-edit-popup_person-responsible-arialabel')}
                        aria-describedby="personResposible"
                        type="text"
                        defaultValue={[props.sample.vastuuhenkilo.etunimi, props.sample.vastuuhenkilo.sukunimi]}
                        value={personResposible} 
                        onChange={handlePersonResponsibleChanged}
                    >
                        { availableUsers.map((user) => 
                            <option
                                key={user.id}
                                name="personResposibleOption"
                                value={user.id}
                            >
                                {user.etunimi} {user.sukunimi}
                            </option>
                        ) }
                    </FormControl>
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="departmentResponsible">{t('one-sample-edit-popup_department-responsible-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        as="select"
                        aria-label={t('one-sample-edit-popup_department-responsible-arialabel')}
                        aria-describedby="departmentResponsible"
                        type="text"
                        defaultValue={props.sample.vastuuosasto.nimi_lyhenne}
                        value={departmentResponsible} 
                        onChange={handleDepartmentResponsible}
                    >
                        { availableDepartments.map((department) => 
                            <option
                                key={department.id}
                                name="departmentResponsible"
                                value={department.id}
                            >
                                {department.nimi_lyhenne}
                            </option>
                        ) }
                    </FormControl>
                </InputGroup>
            </React.Fragment>
        );
    }

    const sourcePermitDocumentsForm = () => {
        return (
            <React.Fragment>
                <hr/>
                {t('one-sample-edit-popup_special-permits-contentheader')}
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="permitApprovalDocumentReference">{t('one-sample-edit-popup_special-permit-approval-document-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label={t('one-sample-edit-popup_special-permit-approval-document-arialabel')}
                        aria-describedby="permitApprovalDocumentReference"
                        type="text"
                        defaultValue={props.sample.viite_lahteen_lupaanvientiasiakirjaan}
                        value={permitApprovalDocumentReference} 
                        onChange={handlePermitApprovalDocumentReferenceChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-1 mt-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="permitRemovalDocumentReference">{t('one-sample-edit-popup_special-permit-removal-document-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label={t('one-sample-edit-popup_special-permit-removal-document-arialabel')}
                        aria-describedby="permitRemovalDocumentReference"
                        type="text"
                        defaultValue={props.sample.viite_lahteen_luvastapoistoasiakirjaan}
                        value={permitRemovalDocumentReference} 
                        onChange={handlePermitRemovalDocumentReferenceChanged}
                    />
                </InputGroup>
            </React.Fragment>
        );
    }

    const sourceNuclideForm = () => {
        //console.log("LOGGING SOURCE NUCLIDES:")
        //console.log(sourceNuclides)
        if (sourceNuclides !== null) {
            return (
                <React.Fragment>
                    <hr/>
                    {t('one-sample-edit-popup_nuclides-contentheader')}
                    <br/>
                    { sourceNuclides.map((nuclide) =>
                        <Badge 
                            pill
                            variant="primary"
                            className="ml-2 mr-2 mt-1 mb-1"
                            key={sourceNuclides.indexOf(nuclide)}
                            name="nuclideBadge"
                            value={sourceNuclides.indexOf(nuclide)}
                        >
                            <Row>
                                <Col md="auto" className="mt-auto mb-auto mr-1 ml-1" style={{ fontSize: '1.2em' }}>
                                    {nuclide.nuklidi} ({BqFormatter(nuclide.referenssi_aktiivisuus, {t})})
                                </Col>
                                <Col md="auto">
                                    <Button 
                                        key={sourceNuclides.indexOf(nuclide)}
                                        id={sourceNuclides.indexOf(nuclide)}
                                        variant="outline-danger" 
                                        size="sm" 
                                        className="ml-1 mr-2"
                                        data={JSON.stringify(nuclide)}
                                        value={sourceNuclides.indexOf(nuclide)}
                                        onClick={handleRemoveNuclideFromSource}
                                    >
                                        <FontAwesomeIcon
                                            key={sourceNuclides.indexOf(nuclide)}
                                            id={sourceNuclides.indexOf(nuclide)}
                                            icon={faTimes}
                                            cursor="pointer"
                                            name="nuclideDeleteIcon"
                                            data={JSON.stringify(nuclide)}
                                            value={sourceNuclides.indexOf(nuclide)}
                                            onClick={handleRemoveNuclideFromSource}
                                        />
                                    </Button>
                                </Col>
                            </Row>
                        </Badge>   
                    )  }
                    <Button 
                        variant="outline-success" 
                        size="sm" 
                        className="ml-2"
                        style={{ marginTop: '1rem', marginBottom: '1.27rem' }}
                        onClick = {() => {
                            setShowAddNewNuclideBlock(true)
                        }}
                    >
                        <FontAwesomeIcon
                            className = "mr-2"
                            icon = {faPlus}
                            onClick = {() => {
                                setShowAddNewNuclideBlock(true)
                            }}
                        />
                        {t('one-sample-edit-popup_add-new-nuclide-nuclides-button')}
                    </Button>
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <Badge 
                        variant="primary"
                        onClick = {() => {
                            setShowAddNewNuclideBlock(true)
                        }}
                    >
                        <FontAwesomeIcon
                            className = "mr-2 ml-2 mt-1 mb-1"
                            icon = {faPlus}
                            onClick = {() => {
                                setShowAddNewNuclideBlock(true)
                            }}
                        />
                    </Badge>
                </React.Fragment>
            );
        }
    }

    const addNewNuclideBlock = () => {
        if (showAddNewNuclideBlock) {
            return (
                <div>
                    <hr/>
                    <Row>
                        <Col sm="4">
                            <InputGroup className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="newNuclide">
                                        {t('one-sample-edit-popup_nuclide-addnuclide-prepend')}
                                    </InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl
                                    as="select"
                                    name="nuclideChoiceControl"
                                    defaultValue={t('one-sample-edit-popup_choose-dot-dot-dot')}
                                    onChange={addNuclideChanged}
                                >
                                    <option>{t('one-sample-edit-popup_choose-dot-dot-dot')}</option>
                                    { state.nuclides.map((nuclide) =>
                                        <option 
                                            key={nuclide.nuklidi} 
                                            name="nuclideName"
                                            value={nuclide.nuklidi}
                                        >
                                            {nuclide.nuklidi}
                                        </option>
                                    ) }
                                </FormControl>
                            </InputGroup>
                        </Col>
                        <Col sm="8">
                            <InputGroup className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="newNuclideRefActivity">{t('one-sample-edit-popup_reference-activity-addnuclide-prepend')}</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl
                                    placeholder={t('one-sample-edit-popup_reference-activity-addnuclide-placeholder')}
                                    type="text"
                                    name="nuclideRefActivityInput"
                                    defaultValue=""
                                    onChange={addNuclideRefActivityChanged}
                                />
                                <DropdownButton
                                    as={InputGroup.Append}
                                    variant="outline-secondary"
                                    title={newNuclideRefActivityUnit}
                                    id="unitSwitchDropdown"
                                >
                                    <Dropdown.Item onClick={() => {setNewNuclideRefActivityUnit('Bq')}}>Bq</Dropdown.Item>
                                    <Dropdown.Item onClick={() => {setNewNuclideRefActivityUnit('MBq')}}>MBq</Dropdown.Item>
                                    <Dropdown.Item onClick={() => {setNewNuclideRefActivityUnit('GBq')}}>GBq</Dropdown.Item>
                                    <Dropdown.Item onClick={() => {setNewNuclideRefActivityUnit('TBq')}}>TBq</Dropdown.Item>
                                    <Dropdown.Item onClick={() => {setNewNuclideRefActivityUnit('Ci')}}>Ci</Dropdown.Item>
                                </DropdownButton>
                            </InputGroup>
                        </Col>
                    </Row>
                    
                    
                    <br/>
                    <Button onClick={handleAddNuclideToSource}>
                        {t('one-sample-edit-popup_add-nuclide-addnuclide-button')}
                    </Button>
                    <Button inline variant="secondary" className="ml-3" onClick={() => {
                        setShowAddNewNuclideBlock(false);
                        setNewNuclideRefActivityUnit('Bq');
                    }}>
                        {t('one-sample-edit-popup_cancel-addnuclide-button')}
                    </Button>
                </div>
            );
        } else {
            return (
                <React.Fragment></React.Fragment>
            );
        }
    }

    /**
     * MAIN LAYOUT
     */
    if (props.sample !== null && availableUsersLoading === false && globalNuclideListLoading === false && availableDepartmentsLoading === false) {
        return (
            <Modal
                {...props}
                key={props.sample.id}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <h2>
                            {t('one-sample-edit-popup_editing-source-modalheader-title')} {props.sample.kutsumanimi}
                        </h2>
                        <InputGroup className="mb-2 mt-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="sourceName">{t('one-sample-edit-popup_source-name-prepend')}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                aria-label={t('one-sample-edit-popup_source-name-arialabel')}
                                aria-describedby="sourceName"
                                type="text"
                                defaultValue={props.sample.kutsumanimi}
                                value={sourceName} 
                                onChange={handleSourceNameChanged}
                            />
                        </InputGroup>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup className="mb-1 mt-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="sourceType">{t('one-sample-edit-popup_source-type-prepend')}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            as="select"
                            aria-label={t('one-sample-edit-popup_source-type-arialabel')}
                            aria-describedby="sourceType"
                            type="text"
                            defaultValue={props.sample.tyyppi}
                            value={sourceType} 
                            onChange={handleSourceTypeChanged}
                        >
                            { validSourceTypes.map((type) => 
                                <option
                                    key={type.type}
                                    name="sourceTypeOption"
                                    value={type.type}
                                >
                                    {type.type}
                                </option>
                            ) }
                        </FormControl>
                    </InputGroup>
                    {sourceTypeSpecificForms()}
                    {sourceNuclideForm()}
                    {addNewNuclideBlock()}
                    {sourceGeneralForm()}
                    {sourcePermitDocumentsForm()}
                    {sourceRemovalForm()}
                    {sourceEditSummaryForm()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick = {handleEditSource}>
                        <FontAwesomeIcon
                            icon={faSave}
                            name="saveEditIcon"
                            className="mr-2"
                        />
                        {t('one-sample-edit-popup_save-all-changes-button')}
                    </Button>
                    <Button variant="secondary" onClick = {resetEditForm}>
                        <FontAwesomeIcon
                            icon={faRedo}
                            name="resetEditIcon"
                            className="mr-2"
                        />
                        {t('one-sample-edit-popup_reset-all-button')}
                    </Button>
                    <Button variant="secondary" onClick = {props.onHide}>
                        <FontAwesomeIcon
                            icon={faWindowClose}
                            name="cancelEditIcon"
                            className="mr-2"
                        />
                        {t('one-sample-edit-popup_cancel-all-button')}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    } else {
        return (
            <div>
                
            </div>
        )
    }

}

export default forwardRef(OneSampleEditPopup);

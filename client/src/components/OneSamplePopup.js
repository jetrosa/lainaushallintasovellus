import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Modal, Button, Accordion, Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faClipboard } from "@fortawesome/free-solid-svg-icons";
import { calculateActivity } from './utilities/CalculationUtilities';
import { BqFormatter } from './utilities/FormatUtilities';
import { useTranslation } from "react-i18next";
import "./custom-component-styles/custom-modals.css";

function OneSamplePopup(props, ref) {
    const { t } = useTranslation();

    const [loanHistoryOpen, setLoanHistoryOpen] = useState(false);
    const [loanHistoryIcon, setLoanHistoryIcon] = useState(faAngleDown);
    const [editHistoryOpen, setEditHistoryOpen] = useState(false);
    const [editHistoryIcon, setEditHistoryIcon] = useState(faAngleDown);

    useImperativeHandle(ref, () => ({
        resetState() {
            setLoanHistoryOpen(false);
            setLoanHistoryIcon(faAngleDown);
            setEditHistoryOpen(false);
            setEditHistoryIcon(faAngleDown);
        }
    }), [])

    const sourceTypeDetails = sourceType => {
        let sourceTypeDetailsContent;
        if (sourceType === 'Avolähde') {
            sourceTypeDetailsContent =
                <Alert variant="info">
                    <h5>{t('one-sample-popup_details-specific-to-type-typedetails')} {sourceType}</h5>
                    <Row>
                        <Col>
                            <p>{t('one-sample-popup_reference-amount-typedetails')} {(props.sample.avo_referenssi_tilavuus !== null) ? props.sample.avo_referenssi_tilavuus : 'N/A'}</p>
                            <p>{t('one-sample-popup_current-amount-typedetails')} {(props.sample.avo_nykyinen_tilavuus !== null) ? props.sample.avo_nykyinen_tilavuus : 'N/A'}</p>
                        </Col>
                    </Row>
                    {listNuclides()}
                </Alert>
        } else if (sourceType === 'Umpilähde') {
            sourceTypeDetailsContent =
                <Alert variant="info">
                    <h5>{t('one-sample-popup_details-specific-to-type-typedetails')} {sourceType}</h5>
                    <Row>
                        <Col>
                            <p>{t('one-sample-popup_classification-code-typedetails')} {(props.sample.umpi_luokituskoodi !== null) ? props.sample.umpi_luokituskoodi : 'N/A'}</p>
                        </Col>
                    </Row>
                    {specialSourceType(props.sample.umpi_erityismuotoisuus)}
                    {listNuclides()}
                </Alert>
        } else {
            sourceTypeDetailsContent =
                <Alert variant="warning">
                    <h5>{t('one-sample-popup_error-title-typedetails')}</h5>
                    <Row>
                        <Col>
                            <p>{t('one-sample-popup_error-p-typedetails')} {sourceType}</p>
                        </Col>
                    </Row>
                    {listNuclides()}
                </Alert>
        }
        return sourceTypeDetailsContent;
    }

    const specialSourceType = isSpecial => {
        if (isSpecial === 'Kyllä') {
            return (
                <Row>
                    <Col>
                        <p>{t('one-sample-popup_is-special-specialsourcetype')} {props.sample.umpi_erityismuotoisuus}</p>
                        <p>{t('one-sample-popup_special-valid-until-p-specialsourcetype')} {(props.sample.umpi_erityismuotoisuus_pvm !== null) ? props.sample.umpi_erityismuotoisuus_pvm : t('one-sample-popup_special-valid-until-notspecified-specialsourcetype')}</p>
                        <p>{t('one-sample-popup_special-certificate-p-specialsourcetype')} {(props.sample.umpi_erityismuotoisuus_todistus !== null) ? <a target="_blank" href={`https://${props.sample.umpi_erityismuotoisuus_todistus}`}>{props.sample.umpi_erityismuotoisuus_todistus}</a> : t('one-sample-popup_special-certificate-notfound-specialsourcetype')}</p>
                    </Col>
                </Row>
            );
        } else if (isSpecial === 'Ei') {
            return (
                <Row>
                    <Col>
                        <p>{t('one-sample-popup_not-special-specialsourcetype')} {props.sample.umpi_erityismuotoisuus}</p>
                    </Col>
                </Row>
            );
        } else {
            return (
                <Row>
                    <Col>
                        <p>{t('one-sample-popup_no-special-classification-specialsourcetype')}</p>
                    </Col>
                </Row>
            );
        }
    }

    const listNuclides = () => {
        console.log(props.sample.lahteidennuklidits)
        if (props.sample.lahteidennuklidits.length > 0) {
            return (
                <React.Fragment>
                    <BootstrapTable
                        bootstrap4
                        striped
                        hover
                        condensed
                        keyField='id'
                        data={ props.sample.lahteidennuklidits }
                        columns={ [{
                            dataField: 'nuklidi',
                            text: t('one-sample-popup_nuclide-th')
                        }, {
                            dataField: 'referenssi_aktiivisuus',
                            text: t('one-sample-popup_reference-radioactivity-listnuclides-th'),
                            formatter: cellData => { 
                                return BqFormatter(cellData, {t});
                            }
                        }, {
                            dataField: 'currentRadioactivityDummyField',
                            text: t('one-sample-popup_current-radioactivity-listnuclides-th'),
                            isDummyField: true,
                            formatter: (cellData, rowData) => {
                                if (rowData.nuklidit.puoliintumisaika === 0) {
                                    return (
                                        <React.Fragment>
                                            <Badge variant="warning">{t('one-sample-popup_nuclide-halflife-set-to-zero-listnuclides-tr')} {rowData.nuklidit.puoliintumisaika}</Badge>
                                        </React.Fragment>
                                    );
                                } else {
                                    return (
                                        <React.Fragment>
                                            {BqFormatter(
                                                calculateActivity(
                                                    rowData.referenssi_aktiivisuus,
                                                    props.sample.referenssi_pvm,
                                                    rowData.nuklidit.puoliintumisaika,
                                                    props.sample.avo_referenssi_tilavuus,
                                                    props.sample.avo_nykyinen_tilavuus
                                                ), {t}
                                            )}
                                        </React.Fragment>
                                    );
                                }
                            }
                        }] }
                    />
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <Badge variant="warning">{t('one-sample-popup_source-missing-nuclides-listnuclides-tr')}</Badge>
                </React.Fragment>
            )
        }
    }

    const deleted = () => {
        if (props.sample.poistettu_pvm !== null || props.sample.poisto_syy !== null || props.sample.poisto_tapa !== null || props.sample.poistajan_id !== null) {
            return (
                <Row>
                    <Col>
                        <Alert variant="danger">
                            {<h4>{t('one-sample-popup_source-has-been-removed-header-deleted')}</h4>}
                            <hr/>
                            <p>{t('one-sample-popup_disposal-date-deleted')} {(props.sample.poistettu_pvm === null) ? 'N/A' : props.sample.poistettu_pvm}</p>
                            <p>{t('one-sample-popup_disposal-reason-deleted')} {(props.sample.poisto_syy === null) ? 'N/A' : props.sample.poisto_syy}</p>
                            <p>{t('one-sample-popup_disposal-method-deleted')} {(props.sample.poisto_tapa === null) ? 'N/A' : props.sample.poisto_tapa}</p>
                            <p>{t('one-sample-popup_removed-by-deleted')} {(props.sample.poistajan_id === null) ? 'N/A' : `${props.sample.poistaja.etunimi} ${props.sample.poistaja.sukunimi}`}</p>
                        </Alert>
                    </Col>
                </Row>
            );
        } else {
            return (
                <React.Fragment></React.Fragment>
            );
        }
    }

    const specialPermitsBox = () => {
        if (props.sample.viite_lahteen_lupaanvientiasiakirjaan !== null || props.sample.viite_lahteen_luvastapoistoasiakirjaan !== null) {
            if (props.sample.viite_lahteen_lupaanvientiasiakirjaan !== undefined || props.sample.viite_lahteen_luvastapoistoasiakirjaan !== undefined) {
                return (
                    <React.Fragment>
                        <p>{t('one-sample-popup_special-permit-approval-ref-specialpermits')} {(props.sample.viite_lahteen_lupaanvientiasiakirjaan) === null ? 'N/A' : <a target="_blank" href={`https://${props.sample.viite_lahteen_lupaanvientiasiakirjaan}`}>{props.sample.viite_lahteen_lupaanvientiasiakirjaan}</a>}</p>
                        <p>{t('one-sample-popup_special-permit-removal-ref-specialpermits')} {(props.sample.viite_lahteen_luvastapoistoasiakirjaan) === null ? 'N/A' : <a target="_blank" href={`https://${props.sample.viite_lahteen_luvastapoistoasiakirjaan}`}>{props.sample.viite_lahteen_luvastapoistoasiakirjaan}</a>}</p>
                    </React.Fragment>
                );
            } else {
                return (
                    <React.Fragment>
                        <p>{t('one-sample-popup_special-permits-undefined-specialpermits')}</p>
                    </React.Fragment>
                );
            }
        } else {
            return (
                <React.Fragment></React.Fragment>
            );
        }
    }
    

    const toggleLoanCollapseIcon = (event) => {
        setLoanHistoryOpen(!loanHistoryOpen)
        if (loanHistoryOpen) {
            setLoanHistoryIcon(faAngleDown);
        } else if (!loanHistoryOpen) {
            setLoanHistoryIcon(faAngleUp);
        }
    }

    const toggleEditCollapseIcon = (event) => {
        setEditHistoryOpen(!editHistoryOpen)
        if (editHistoryOpen) {
            setEditHistoryIcon(faAngleDown);
        } else if (!editHistoryOpen) {
            setEditHistoryIcon(faAngleUp);
        }
    }

    const logEditObjects = () => {
        let obj = Object.entries(props.sample.lahdemuokkauksets).map(([key, value]) => ({key, value}));
    }

    const showEdits = () => {
        let editAlertBox;
        if (props.sample.lahdemuokkauksets.length < 1) {
            editAlertBox =
                <div>
                    <p>{t('one-sample-popup_no-edits-edithistory')}</p>
                </div>
        } else if (props.sample.lahdemuokkauksets.length > 0) {
            editAlertBox =
                <div>
                    {(props.sample.lahdemuokkauksets).map(edit =>
                        <Alert 
                            variant={edit.kommentti === null || edit.kommentti === "" ? "secondary" : "info"}
                            key={edit.id}
                        >
                            <Row>
                                <Col>
                                    <p>{t('one-sample-popup_edit-on-edithistory')} {edit.muokkaus_pvm}</p>
                                </Col>
                                <Col>
                                    <p>{t('one-sample-popup_edited-by-edithistory')} {edit.muokkaaja.etunimi} {edit.muokkaaja.sukunimi}</p>
                                </Col>
                                <Col sm="1">
                                    <FontAwesomeIcon 
                                        icon={faClipboard}
                                        name="logIcon"
                                        style={ {cursor: 'pointer'} }
                                        onClick={() => {
                                            alert(edit.loki);
                                        }}
                                    />
                                </Col>
                            </Row>
                            {edit.kommentti !== null && edit.kommentti !== "" ? 
                                <Row>
                                    <Col>
                                        <p>{t('one-sample-popup_summary-edithistory')} {edit.kommentti}</p>
                                    </Col>
                                </Row> 
                                : 
                                null
                            }
                            
                        </Alert>
                    )}
                </div>
        } else {
            console.log("Render error");
        }
        return editAlertBox;
    }

    const showLoans = () => {      
        let loanAlertBox;
        if (props.sample.lainats.length < 1) {
            loanAlertBox =
                <div>
                    <p>{t('one-sample-popup_not-loaned-yet-loanhistory')}</p>
                </div>
        } else if (props.sample.lainats.length > 0) {
            loanAlertBox = 
                <div>
                    {(props.sample.lainats).map(loan =>
                        <Alert 
                            variant={ loan.voimassa === 0 ? "success" 
                                : ( ((loan.voimassa === 1) && (new Date(loan.arvioitu_palautus_pvm) < new Date())) ? "danger" 
                                    : ( loan.voimassa === 1 ? "warning" 
                                        : "dark" 
                                    ) 
                                ) 
                            }
                            key={loan.id}
                        >
                            <h5>{t('one-sample-popup_status-title-loanhistory')} { loan.voimassa === 0 ? t('one-sample-popup_returned-by-user-loanhistory', {firstName: loan.palauttaja.etunimi, lastName: loan.palauttaja.sukunimi}, {date: loan.palautus_pvm})
                                : ( ((loan.voimassa === 1) && (new Date(loan.arvioitu_palautus_pvm) < new Date())) ? t('one-sample-popup_late-loaned-by-user-on-date-loanhistory', {firstName: loan.lainaaja.etunimi, lastName: loan.lainaaja.sukunimi}, {date: loan.lainaus_pvm})
                                    : ( loan.voimassa === 1 ? t('one-sample-popup_status-loaned-by-user-on-date-loanhistory', {firstName: loan.lainaaja.etunimi, lastName: loan.lainaaja.sukunimi}, {date: loan.lainaus_pvm})
                                        : t('one-sample-popup_unknown-loanhistory')
                                    ) 
                                ) }</h5>
                            <hr/>
                            <Row>
                                <Col>
                                    <p>{t('one-sample-popup_loaned-on-loanhistory')} {loan.lainaus_pvm}</p>
                                    <p>{t('one-sample-popup_estimated-return-date')} {(loan.arvioitu_palautus_pvm) === null ? 'N/A' : loan.arvioitu_palautus_pvm}</p>
                                </Col>
                                <Col>
                                    <p>{t('one-sample-popup_loaned-by-loanhistory')} {loan.lainaaja.etunimi} {loan.lainaaja.sukunimi}</p>
                                </Col>
                            </Row>
                        </Alert>
                    )}
                </div>
        } else {
            console.log("Render error");
        }
        return loanAlertBox;
    }

    if (props.sample != null) {
        return (
            <div className="modal-50w">
            <Modal
                {...props}
                key={props.sample.id}
                dialogClassName="modal-50w"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <h2>
                            {props.sample.kutsumanimi}
                        </h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleted()}
                    <Alert variant="primary">
                        <Row>
                            <Col>
                                <p>{t('one-sample-popup_source-type')} {(props.sample.avo_koostumus === null) ? `${props.sample.tyyppi}` : `${props.sample.tyyppi}, ${props.sample.avo_koostumus}`}</p>
                                <p>{t("one-sample-popup_added-date", { date: new Date(props.sample.lisatty_pvm), })}</p>
                                <p>{t("one-sample-popup_reference-date", { date: new Date(props.sample.referenssi_pvm), })}</p>
                                <p>{t("one-sample-popup_best-before-date", { date: new Date(props.sample.parasta_ennen_pvm), })}</p>
                            </Col>
                            <Col>
                                <p>{t('one-sample-popup_certificate-link-p')} <a href={`https://ah.asp?docId=${props.sample.viite_lahde_sertifikaatti}`}>{props.sample.viite_lahde_sertifikaatti}</a></p>
                                <p>{t('one-sample-popup_producer-reference-p')} {props.sample.viite_valmistaja}</p>
                                <p>{t('one-sample-popup_internal-reference-p')} {props.sample.viite_stuk}</p>
                                <p>{t('one-sample-popup_acquirement-method-p')} {props.sample.hankintatapa}</p>
                            </Col>
                        </Row>
                        {sourceTypeDetails(props.sample.tyyppi)}
                        <hr/>
                        <Row>
                            <Col>
                                <p>{t('one-sample-popup_additional-information-p')}<br/>{(props.sample.lisatiedot !== null) ? props.sample.lisatiedot : 'N/A'}</p>
                            </Col>
                        </Row>
                        <hr/>
                        <Row>
                            <Col>
                                <p>{t('one-sample-popup_storage-location-general-p')} {props.sample.sailytyspaikka}</p>
                                <p>{t('one-sample-popup_storage-location-details-p')} {props.sample.sailytyspaikka_tarkenne}</p>
                            </Col>
                            <Col>
                                <p>{t('one-sample-popup_person-responsible-p')} {props.sample.vastuuhenkilo.etunimi} {props.sample.vastuuhenkilo.sukunimi}</p>
                                <p>{t('one-sample-popup_department-responsible-p')} {props.sample.vastuuosasto.nimi_lyhenne}</p>
                            </Col>
                        </Row>
                        <hr/>
                        <Row>
                            <Col>
                                {t('one-sample-popup_special-permit-required')} N/A
                                <p style={ {fontStyle: 'italic'} }>
                                    {t('one-sample-popup_special-permit-required-todo-p')}
                                </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {specialPermitsBox()}
                            </Col>
                        </Row>
                        
                    </Alert>
                    <br/>
                    <Accordion>
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle as={Card.Header} eventKey="0" value={loanHistoryOpen} onClick = {toggleLoanCollapseIcon}>
                                    <FontAwesomeIcon
                                        className = "mr-2"
                                        icon = {loanHistoryIcon}
                                    />
                                    {t('one-sample-popup_loan-history-accordion-title')}
                                </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                    {showLoans()}
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                    <br/>
                    <Accordion>
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle as={Card.Header} eventKey="0" value={editHistoryOpen} onClick = {toggleEditCollapseIcon}>
                                    <FontAwesomeIcon
                                        className = "mr-2"
                                        icon = {editHistoryIcon}
                                    />
                                    {t('one-sample-popup_edit-history-accordion-title')}
                                </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                      {logEditObjects()}
                                      {showEdits()}
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick = {props.onHide}>
                        {t('one-sample-popup_close-modal-button')}
                    </Button>
                </Modal.Footer>
            </Modal>
            </div>
        );
    } else {
        return (
            <div></div>
        )
    }

}

export default forwardRef(OneSamplePopup);
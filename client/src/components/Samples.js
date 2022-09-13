import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { Context } from './GlobalState';
import OneSamplePopup from "./OneSamplePopup"
import OneSampleEditPopup from "./OneSampleEditPopup";
import OneSampleRemovePopup from "./OneSampleRemovePopup";
import { BqFormatter } from "./utilities/FormatUtilities";
import { calculateActivity } from "./utilities/CalculationUtilities";
import {
    Modal, Button, Table, Alert, Container, Row, Col, Spinner, Badge, InputGroup, FormControl, Accordion
} from "react-bootstrap";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, dateFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search, ColumnToggle } from 'react-bootstrap-table2-toolkit';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faCartPlus, faCartArrowDown, faEdit, faTrashAlt, faTrashRestoreAlt, faDolly, faBan } from "@fortawesome/free-solid-svg-icons";
import { i18n, useTranslation } from "react-i18next";
import { CheckAbility } from "./Ability.js" // Käyttäjäntilin käyttöoikeuksien tarkastukseen, jotta voidaan piiloittaa/estää toiminnallisuuksia. Backendissä oma check
import { Context as Context2 } from "./AuthContext"

const Sample = (props) => {
    const { t } = useTranslation();
    const [state2] = useContext(Context2);

    const [sampleArray, setSamples] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [sampleFilter, setSampleFilter] = useState("")
    const [state, dispatch] = useContext(Context);

    const [showSamplePopup, setShowSamplePopup] = useState(false);
    const [sampleInPopup, setSampleInPopup] = useState(null);
    const popupRef = useRef();

    const [showSampleEditPopup, setShowSampleEditPopup] = useState(false);
    const [sampleInEditPopup, setSampleInEditPopup] = useState(null);
    const editPopupRef = useRef();

    const [showSampleRemovePopup, setShowSampleRemovePopup] = useState(false);
    const [sampleInRemovePopup, setSampleInRemovePopup] = useState(null);
    const removePopupRef = useRef();

    const freeSourcesArray = [];
    const loanedSourcesArray = [];
    const removedSourcesArray = [];
    const [hiddenRowKeysObject, setHiddenRowKeysObject] = useState({
        freeSources: [],
        loanedSources: [],
        removedSources: removedSourcesArray
    });
    const [showFreeSources, setShowFreeSources] = useState(true);
    const [showLoanedSources, setShowLoanedSources] = useState(true);
    const [showRemovedSources, setShowRemovedSources] = useState(false);
    const [reloadTimer, setReloadTimer] = useState(false);
    const [showRefreshModal, setShowRefreshModal] = useState(false);
    const reloadTime = 10; // minutes to wait for reload

    useEffect(() => {
    console.log(state2.user.department_id);
	axios.get("/api/samples/department/" + state2.user.department_id).then(response => {
	    const samples = response.data;
	    dispatch({type: 'SET_SAMPLES', payload: samples});
        setLoading(false);
	}).catch(err => {
	    console.log(err);
	})
    }, []);

    useEffect(() => {
	const timer = setTimeout(() => {
            setShowRefreshModal(true);
	}, (reloadTime * 60 * 1000));

	return () => clearTimeout(timer);
    }, [reloadTimer]);

    const refreshModal =
          <Modal show={showRefreshModal}
                 backdrop="static"
                 onHide={(e) => window.location.reload()}>
            <Modal.Header>
              <Modal.Title>
                {t('samples_refresh-modal-title')}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{t('samples_refresh-modalbody-text', {reloadTime: reloadTime})}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={(e) => window.location.reload()}>{t('samples_refresh-view-refresh-button')}</Button>
              <Button onClick={(e) => {setShowRefreshModal(false);
                                      setReloadTimer(!reloadTimer)}}>{t('samples_refresh-view-continue-button')}</Button>
            </Modal.Footer>
          </Modal>

    const filteredSamples = state.samples.filter(sample =>
	    sample.kutsumanimi.toLowerCase().includes(sampleFilter.toLowerCase())
    );
    
    const searchSample = (event) => {
        setSampleFilter(event.target.value)
    }

    const openInPopup = sample => {
        setSampleInPopup(sample);
        setShowSamplePopup(true);
    }

    const closePopup = e => {
        console.log("PopUp closed");
        popupRef.current.resetState();
        setShowSamplePopup(false);
    }

    const openInEditPopup = sample => {
        setSampleInEditPopup(sample);
        setShowSampleEditPopup(true);
    }

    const closeEditPopup = e => {
        console.log("EditPopUp closed");
        setShowSampleEditPopup(false);
    }

    const openInRemovePopup = sample => {
        setSampleInRemovePopup(sample);
        setShowSampleRemovePopup(true);
    }

    const closeRemovePopup = e => {
        console.log("RemovePopUp closed");
        setShowSampleRemovePopup(false);
        window.location.reload();
    }

    const sourceTypes = {
        'jauhe': 'Avolähde, jauhe',
        'kiinteä': 'Avolähde, kiinteä',
        'neste': 'Avolähde, neste'
    }

    const GlobalSearch = (props) => {
        let searchInput;
        const handleSearch = (event) => {
            props.onSearch(event.target.value);
        }
        return (
            <div>
                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text style={ { backgroundColor: '#ECFFAF' } }>{t('samples_global-search-prepend')}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        style={ { backgroundColor: '#E9EDDC' } }
                        ref={ n => searchInput = n }
                        type="text"
                        onChange={ handleSearch }
                        placeholder={t('samples_global-search-placeholder')}
                    />
                </InputGroup>
            </div>
        );
    };

    const { ToggleList } = ColumnToggle;

    const setRowStyle = (rowData, rowIndex) => { 
        const style = {};
        const theSource = rowData;
        //console.log("THESOURCE:");
        //console.log(theSource)
        const sourceLoansArray = theSource.lainats;
        // Palauta lähde-objektin lainats-array, jos jollakulla lainassa:
        let sourceIsCurrentlyBeingLoaned = sourceLoansArray.find((sourceLoan, index) => {
            if (sourceLoan.voimassa === 1) {
                return true;
            }
        })

        if (sourceIsCurrentlyBeingLoaned !== undefined) {
            //style.backgroundColor = '#B7CAFF37'; //#RRGGBBAA
            if (((new Date(sourceIsCurrentlyBeingLoaned.arvioitu_palautus_pvm)) !== null) && ((new Date(sourceIsCurrentlyBeingLoaned.arvioitu_palautus_pvm)) < (new Date()))) {
                //style.backgroundColor = '#B7CAFF80';
            }
            loanedSourcesArray.push(theSource.id);
        }

        if (sourceIsCurrentlyBeingLoaned === undefined) {
            if (theSource.poistettu_pvm !== null || theSource.poisto_syy !== null || theSource.poisto_tapa !== null || theSource.poistajan_id !== null) {
                //style.backgroundColor = '#6D6D6D7C';
                style.color = '#30301F80';
                removedSourcesArray.push(theSource.id);
            } else {
                freeSourcesArray.push(theSource.id)
            }
        }

        return style;
    };

    const hiddenRowKeys = () => {
        return [].concat(...Object.values(hiddenRowKeysObject))
    }

    const infoIcon = (cellData, rowData) => {
        if (rowData != null) {
            return (
                <React.Fragment>
                    <FontAwesomeIcon
                        className = 'ml-1 mr-2'
                        style={ { cursor: 'pointer' } }
                        icon = {faInfoCircle}
                        //color = 'blue'
                        size = 'lg'
                        onClick = {() => 
                            {
                                console.log("clicked: " + rowData.id);
                                console.log(rowData);
                                openInPopup(rowData);
                            }
                        }
                    />
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <FontAwesomeIcon
                        className = 'ml-1 mr-2'
                        style={ { cursor: 'not-allowed' } }
                        icon = {faInfoCircle}
                        color = 'gray'
                        size = 'lg'
                    />
                </React.Fragment>
            );
        }
    }

    const AddToCartIcon = props => {
        const [cartArray, setCartArray] = useState(null);
        const [rowData, setRowData] = useState(props.rowData);
        //console.log("=== ===")
        //console.log(props)

        useEffect(() => {
            setCartArray(state.cart);
            setRowData(props.rowData);
        })

        

        if (cartArray !== null && rowData !== null) {
            //console.log(cartArray);
            //console.log(rowData);

            const loanedSource = (rowData.lainats).find(sourceLoan => sourceLoan.voimassa === 1);
            const sourceInCart = cartArray.find(source => source.id === rowData.id)

            if (loanedSource !== undefined) {
                return (
                    <React.Fragment>
                        <FontAwesomeIcon
                            className = 'ml-2 mr-2'
                            icon = {faDolly}
                            style = { { cursor: 'default' } }
                            color = '#D3C900FF'
                            size = 'lg'
                        />
                    </React.Fragment>
                );
            }

            if (rowData.poistettu_pvm !== null || rowData.poisto_syy !== null || rowData.poisto_tapa !== null || rowData.poistajan_id !== null || !CheckAbility('loan', 'all')) {
                return (
                    <React.Fragment>
                        <FontAwesomeIcon
                            className = 'ml-2 mr-2'
                            icon = {faCartPlus}
                            style = { { cursor: 'not-allowed' } }
                            color = 'gray'
                            size = 'lg'
                        />
                    </React.Fragment>
                );
            }

            if (sourceInCart !== undefined) {
                return (
                    <React.Fragment>
                        <FontAwesomeIcon
                            className = 'ml-2 mr-2'
                            icon = {faCartArrowDown}
                            style = { { cursor: 'default' } }
                            color = 'green'
                            size = 'lg'
                        />
                    </React.Fragment>
                );
            }

            return (
                <React.Fragment>
                    <FontAwesomeIcon
                        className = 'ml-2 mr-2'
                        icon = {faCartPlus}
                        style = { { cursor: 'pointer' } }
                        //color = 'green'
                        size = 'lg'
                        onClick = {() => {
                            dispatch({
                                type: 'ADD_PRODUCT',
                                payload: rowData
                            });
                            window.location.reload();
                        }
                            
                        }
                    />
                </React.Fragment>
            );
        } else {
            return null
        }
    }

    const EditSourceIcon = props => {
        const [cartArray, setCartArray] = useState(null);
        const [rowData, setRowData] = useState(props.rowData);

        useEffect(() => {
            setCartArray(state.cart);
            setRowData(props.rowData);
        })

        if (cartArray !== null && rowData !== null) {

            const loanedSource = (rowData.lainats).find(sourceLoan => sourceLoan.voimassa === 1);
            const sourceInCart = cartArray.find(source => source.id === rowData.id)

            if (loanedSource !== undefined || rowData.poistettu_pvm !== null || rowData.poisto_syy !== null || rowData.poisto_tapa !== null || rowData.poistajan_id !== null || sourceInCart !== undefined || !CheckAbility('modify', 'all')) {
                return (
                    <React.Fragment>
                        <FontAwesomeIcon
                            className = 'ml-2 mr-2'
                            icon = {faEdit}
                            style = { { cursor: 'default' } }
                            color = 'gray'
                            size = 'lg'
                        />
                    </React.Fragment>
                );
            }

            return (
                <React.Fragment>
                    <FontAwesomeIcon
                        className = 'ml-2 mr-2'
                        icon = {faEdit}
                        style = { { cursor: 'pointer' } }
                        size = 'lg'
                        onClick = {() => 
                            {
                                console.log("clicked edit for: " + rowData.id);
                                console.log(rowData);
                                openInEditPopup(rowData);
                            }
                        }
                    />
                </React.Fragment>
            );
        } else {
            return null
        }
    }

    const RemoveSourceIcon = props => {
        const [cartArray, setCartArray] = useState(null);
        const [rowData, setRowData] = useState(props.rowData);

        useEffect(() => {
            setCartArray(state.cart);
            setRowData(props.rowData);
        })

        if (cartArray !== null && rowData !== null) {

            const loanedSource = (rowData.lainats).find(sourceLoan => sourceLoan.voimassa === 1);
            const sourceInCart = cartArray.find(source => source.id === rowData.id)

            if (loanedSource !== undefined || rowData.poistettu_pvm !== null || rowData.poisto_syy !== null || rowData.poisto_tapa !== null || rowData.poistajan_id !== null || sourceInCart !== undefined || !CheckAbility('modify', 'all')) {
                return (
                    <React.Fragment>
                        <FontAwesomeIcon
                            className = 'ml-2 mr-1'
                            icon = {faTrashAlt}
                            style = { { cursor: 'default' } }
                            color = 'gray'
                            size = 'lg'
                        />
                    </React.Fragment>
                );
            }

            return (
                <React.Fragment>
                    <FontAwesomeIcon
                        className = 'ml-2 mr-1'
                        icon = {faTrashAlt}
                        style = { { cursor: 'pointer' } }
                        size = 'lg'
                        onClick = {() => 
                            {
                                console.log("clicked remove for: " + rowData.id);
                                console.log(rowData);
                                openInRemovePopup(rowData);
                            }
                        }
                    />
                </React.Fragment>
            );
        } else {
            return null
        }
    }

    const setRowIcons = (cellData, rowData) => {
        return (
            <React.Fragment>
                {infoIcon(cellData, rowData)}
                <AddToCartIcon 
                    rowData = { rowData }
                />
                <EditSourceIcon 
                    rowData = { rowData }
                />
                <RemoveSourceIcon
                    rowData = { rowData }
                />
            </React.Fragment>
        )
    }

    const expandRow = {
        renderer: rowData => (
            <div style={ {textAlign: 'left'} }>
                <p>{t('samples_expand-added-on-date', { date: new Date(rowData.lisatty_pvm), })}</p>
                <p>{t('samples_expand-ref-act-date', { date: new Date(rowData.referenssi_pvm), })}</p>
                <p>{t('samples_expand-best-before-date', { date: new Date(rowData.parasta_ennen_pvm), })}</p>
                <p>{t('samples_expand-acquirement-info')} {rowData.hankintatapa}</p>
                <p>{t('samples_expand-additional-info')} {rowData.lisatiedot}</p>
            </div>
        )
    };

    function searchableHeaderFormatter(column, colIndex, { sortElement, filterElement }) {
        return (
            <React.Fragment>
                <div>
                    { column.text }
                    { sortElement }
                </div>
                <div className="mt-1">
                    { filterElement }
                </div>
            </React.Fragment>
            
        );
    }

    function verySmallHeaderStyle(columnValue, columnIndex) {
        return { textAlign: 'center', verticalAlign: 'top', width: '64px'};
    }

    function smallHeaderStyle(columnValue, columnIndex) {
        return { textAlign: 'center', verticalAlign: 'top', width: '158px',};
    }

    function mediumHeaderStyle(columnValue, columnIndex) {
        return { textAlign: 'center', verticalAlign: 'top', width: '186px'};
    }

    function largeHeaderStyle(columnValue, columnIndex) {
        return { textAlign: 'center', verticalAlign: 'top', width: '226px'};
    }

    function extraLargeHeaderStyle(columnValue, columnIndex) {
        return { textAlign: 'center', verticalAlign: 'top', width: '256px'};
    }

    if (state.samples.length === 0 && isLoading) {
        return (
            <Container fluid>
                <br />
                <Alert variant="primary">
                    <Row>
                        <Col>
                            {t('samples_loading')}     <Spinner animation="grow" size="sm"></Spinner>
                        </Col>
                    </Row>
                </Alert>
            </Container>
        )
    } else {
        return (
            <Container fluid>
              {refreshModal}
                <br />
                <Container>
                    <Row>
                        <Col>
                            <Alert variant="primary">
                                <h1 className="title">{t('samples_pageheader-title')}</h1>
                            </Alert>
                        </Col>
                    </Row>
                </Container>

                <ToolkitProvider 
                    bootstrap4
                    keyField='id' 
                    data={ state.samples } 
                    columns={ [
                        {
                        dataField: 'id',
                        text: t('samples_id-th'),
                        sort: true,
                        searchable: false,
                        headerStyle: verySmallHeaderStyle,
                        hidden: true
                    }, {
                        dataField: 'kutsumanimi',
                        text: t('samples_source-name-th'),
                        sort: true,
                        filter: textFilter(),
                        headerFormatter: searchableHeaderFormatter,
                        headerStyle: mediumHeaderStyle
                    }, {
                        dataField: 'viite_stuk',
                        text: t('samples_internal-reference-th'),
                        sort: true,
                        formatter: (cellData, rowData) => {
                            if (rowData.viite_lahde_sertifikaatti !== null) {
                                return (
                                    <React.Fragment>
                                        {cellData}<br/>
                                        {t('samples_producer-and-internal-ref-linktext-tr')} <a href={`https://ah.asp?docId=${rowData.viite_lahde_sertifikaatti}`}>{rowData.viite_lahde_sertifikaatti}</a>
                                    </React.Fragment>
                                );
                            } else {
                                return cellData;
                            }
                        },
                        filter: textFilter(),
                        headerFormatter: searchableHeaderFormatter,
                        headerStyle: largeHeaderStyle,
                        align: 'left',
                        hidden: true
                    }, {
                        dataField: 'viite_valmistaja',
                        text: t('samples_producer-reference-th'),
                        sort: true,
                        formatter: (cellData, rowData) => {
                            if (rowData.viite_lahde_sertifikaatti !== null) {
                                return (
                                    <React.Fragment>
                                        {cellData}<br/>
                                        {t('samples_producer-and-internal-ref-linktext-tr')} <a href={`https://ah.asp?docId=${rowData.viite_lahde_sertifikaatti}`}>{rowData.viite_lahde_sertifikaatti}</a>
                                    </React.Fragment>
                                );
                            } else {
                                return cellData;
                            }
                        },
                        filter: textFilter(),
                        headerFormatter: searchableHeaderFormatter,
                        headerStyle: largeHeaderStyle,
                        align: 'left',
                        hidden: true
                    }, {
                        dataField: 'avo_koostumus',
                        text: t('samples_source-type-th'),
                        formatter: (cellData, rowData) => {
                            if (cellData === null) {
                                if (rowData.umpi_erityismuotoisuus === 'Kyllä') {
                                    return 'Umpilähde, erityismuotoinen'
                                } else {
                                    return 'Umpilähde'
                                }
                            } else if (!sourceTypes[cellData]) {
                                return (
                                    `${rowData.tyyppi}, ${rowData.avo_koostumus}`
                                )
                            } else {
                                return sourceTypes[cellData]
                            }
                        },
                        filter: textFilter(),
                        filterValue: (cellData, rowData) => {
                            if (cellData === null) {
                                if (rowData.umpi_erityismuotoisuus === 'Kyllä') {
                                    return 'Umpilähde, erityismuotoinen'
                                } else {
                                    return 'Umpilähde'
                                }
                            } else if (!sourceTypes[cellData]) {
                                return (
                                    `${rowData.tyyppi}, ${rowData.avo_koostumus}`
                                )
                            } else {
                                return sourceTypes[cellData]
                            }
                        },
                        sort: true,
                        sortValue: (cellData, rowData) => {
                            if (cellData === null) {
                                if (rowData.umpi_erityismuotoisuus === 'Kyllä') {
                                    return 'Umpilähde, erityismuotoinen'
                                } else {
                                    return 'Umpilähde'
                                }
                            } else if (!sourceTypes[cellData]) {
                                return (
                                    `${rowData.tyyppi}, ${rowData.avo_koostumus}`
                                )
                            } else {
                                return sourceTypes[cellData]
                            }
                        },
                        headerFormatter: searchableHeaderFormatter,
                        headerStyle: largeHeaderStyle
                    }, {
                        dataField: 'lahteidennuklidits',
                        text: t('samples_nuclides-th'),
                        formatter: cellData => {
                            const cellDataLength = cellData.length;
                            if (cellDataLength < 1) {
                                return (
                                    <Badge variant="warning">{t('samples_nuclides-error-no-nuclides')}</Badge>
                                )
                            } else {
                                return (
                                    cellData.map((nuclide, index) => {
                                        return (
                                            <div>
                                                {nuclide.nuklidi}
                                                <p style={{fontSize: 0.7 + 'em'}}>{t('samples_nuclides-ref-activity-tr')} {BqFormatter(nuclide.referenssi_aktiivisuus, {t})}</p>
                                            </div>
                                        );
                                    })
                                );
                            }
                        },
                        filter: textFilter(),
                        filterValue: (cellData, rowData) => {
                            return (
                                cellData.map(nuclide => {
                                    return nuclide.nuklidi
                                })
                            )
                        },
                        /*sort: true,
                        sortValue: (cellData, rowData) => {
                            return (
                                cellData.map(nuclide => {
                                    return nuclide.nuklidi
                                })
                            )
                        },*/
                        align: (cellData, rowData) => {
                            if (cellData.length < 1) {
                                return 'center'
                            } else {
                                return 'left'
                            }
                        },
                        headerFormatter: searchableHeaderFormatter,
                        headerStyle: mediumHeaderStyle
                    }, {
                        dataField: 'radioactivityDummyField',
                        isDummyField: true,
                        text: t('samples_radioactivity-th'),
                        searchable: false,
                        formatter: (cellData, rowData) => {
                            const openSourceVolumeInfo = (
                                <div>
                                    {(rowData.avo_referenssi_tilavuus !== null) ? 
                                        ( (rowData.avo_nykyinen_tilavuus !== null) ? 
                                            <p style={{fontSize: 0.8 + 'em'}}>{t('samples_radioactivity-open-source-amounts-tr', {refAmount: rowData.avo_referenssi_tilavuus, curAmount: rowData.avo_nykyinen_tilavuus})}</p> : 
                                            <p style={{fontSize: 0.8 + 'em'}}>{t('samples_radioactivity-open-source-amounts-current-missing-tr', {refAmount: rowData.avo_referenssi_tilavuus})}</p> 
                                        ) : 
                                    <React.Fragment></React.Fragment>}
                                </div>
                            );
                            let children = [];
                            if (rowData.lahteidennuklidits.length < 1) {
                                children = (
                                    <Badge variant="warning">{t('samples_radioactivity-error-no-nuclides')}</Badge>
                                );
                            } else {
                                children = ( (rowData.lahteidennuklidits).map((nuclide, index) => {
                                        if (nuclide.nuklidit.puoliintumisaika === 0) {
                                            return (
                                                <div>
                                                    {nuclide.nuklidi}: <Badge variant="warning">N/A: {t('samples_radioactivity-error-halflife-set-to')} {nuclide.nuklidit.puoliintumisaika}</Badge>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div>
                                                    {nuclide.nuklidi}: {BqFormatter(calculateActivity(
                                                        nuclide.referenssi_aktiivisuus, 
                                                        rowData.referenssi_pvm, 
                                                        nuclide.nuklidit.puoliintumisaika,
                                                        rowData.avo_referenssi_tilavuus,
                                                        rowData.avo_nykyinen_tilavuus
                                                    ), {t})}
                                                </div>
                                            );
                                        }
                                    })
                                );
                            }
                            return React.createElement('div', {}, [children, openSourceVolumeInfo])
                        },
                        //sort: true,
                        align: (cellData, rowData) => {
                            if (rowData.lahteidennuklidits.length < 1) {
                                return 'center'
                            } else {
                                return 'left'
                            }
                        },
                        headerStyle: mediumHeaderStyle
                    }, {
                        dataField: 'sailytyspaikka',
                        text: t('samples_storage-location-th'),
                        formatter: (cellData, rowData) => {
                            let storageLocationField;
                            if (cellData !== null && rowData.sailytyspaikka_tarkenne !== null) {
                                storageLocationField = 
                                    <React.Fragment>
                                        {t('samples_storage-location-general-tr')} {cellData}<br/>
                                        {t('samples_storage-location-specific-tr')} {rowData.sailytyspaikka_tarkenne}
                                    </React.Fragment>
                            } else if (cellData !== null && rowData.sailytyspaikka_tarkenne === null) {
                                storageLocationField = 
                                <React.Fragment>
                                    {t('samples_storage-location-general-tr')} {cellData}<br/>
                                    {t('samples_storage-location-specific-tr')} N/A
                                </React.Fragment>
                            } else if (cellData === null && rowData.sailytyspaikka_tarkenne !== null) {
                                storageLocationField = 
                                <React.Fragment>
                                    {t('samples_storage-location-general-tr')} N/A<br/>
                                    {t('samples_storage-location-specific-tr')} {rowData.sailytyspaikka_tarkenne}
                                </React.Fragment>
                            } else {
                                storageLocationField = 
                                    <React.Fragment>
                                        {t('samples_storage-location-general-tr')} N/A<br/>
                                        {t('samples_storage-location-specific-tr')} N/A
                                    </React.Fragment>
                            }
                            return storageLocationField;
                        },
                        sort: true,
                        sortValue: (cellData, rowData) => {
                            return `${cellData} ${rowData.sailytyspaikka_tarkenne}`
                        },
                        filter: textFilter(),
                        filterValue: (cellData, rowData) => {
                            return `${cellData} ${rowData.sailytyspaikka_tarkenne}`
                        },
                        headerFormatter: searchableHeaderFormatter,
                        headerStyle: extraLargeHeaderStyle,
                        align: 'left',
                        hidden: true
                    }, {
                        dataField: 'vastuuhenkilo',
                        text: t('samples_person-responsible-th'),
                        formatter: (cellData, rowData) => {
                            if (cellData.id !== null) {
                                return (
                                    <React.Fragment>
                                        {cellData.sukunimi}, {cellData.etunimi}
                                    </React.Fragment>
                                );
                            } else {
                                return (
                                    <React.Fragment></React.Fragment>
                                );
                            }
                        },
                        filter: textFilter(),
                        filterValue: (cellData, rowData) => {
                            if (cellData.id !== null) {
                                return `${cellData.sukunimi}, ${cellData.etunimi} ${cellData.etunimi} ${cellData.sukunimi}`
                            } else {
                                return '';
                            }
                        },
                        sort: true,
                        sortValue: (cellData, rowData) => {
                            if (cellData.id !== null) {
                                return `${cellData.sukunimi}${cellData.etunimi}`
                            } else {
                                return '';
                            }
                        },
                        headerFormatter: searchableHeaderFormatter,
                        headerStyle: largeHeaderStyle
                    }, {
                        dataField: 'vastuuosasto',
                        text: t('samples_department-responsible-th'),
                        formatter: cellData => cellData.nimi_lyhenne,
                        filter: textFilter(),
                        filterValue: cellData => cellData.nimi_lyhenne,
                        sort: true,
                        sortValue: cellData => cellData.nimi_lyhenne,
                        headerFormatter: searchableHeaderFormatter,
                        headerStyle: largeHeaderStyle
                    }, {
                        dataField: 'viite_lahteen_lupaanvientiasiakirjaan',
                        text: t('samples_special-permits-th'),
                        searchable: false,
                        formatter: (cellData, rowData) => {
                            let specialPermitFieldContent;
                            if (cellData !== null && rowData.viite_lahteen_luvastapoistoasiakirjaan !== null) {
                                specialPermitFieldContent = 
                                    <React.Fragment>
                                        <p>{t('samples_special-permits-approval-ref-tr-p')} {cellData}</p>
                                        <p>{t('samples_special-permits-removal-ref-tr-p')} {rowData.viite_lahteen_luvastapoistoasiakirjaan}</p>
                                    </React.Fragment>
                            } else if (cellData !== null && rowData.viite_lahteen_luvastapoistoasiakirjaan === null) {
                                specialPermitFieldContent = 
                                    <React.Fragment>
                                        <p>{t('samples_special-permits-approval-ref-tr-p')} {cellData}</p>
                                        <p>{t('samples_special-permits-removal-ref-tr-p')} N/A</p>
                                    </React.Fragment>
                            } else if (cellData === null && rowData.viite_lahteen_luvastapoistoasiakirjaan !== null) {
                                specialPermitFieldContent = 
                                    <React.Fragment>
                                        <p>{t('samples_special-permits-approval-ref-tr-p')} {t('samples_special-permits-approval-missing-ref-tr-p')}</p>
                                        <p>{t('samples_special-permits-removal-ref-tr-p')} {rowData.viite_lahteen_luvastapoistoasiakirjaan}</p>
                                    </React.Fragment>
                            } else {
                                specialPermitFieldContent = 'N/A';
                            }
                            return specialPermitFieldContent;
                        },
                        sort: true,
                        sortValue: (cellData, rowData) => {
                            return `${cellData}, ${rowData.viite_lahteen_luvastapoistoasiakirjaan}`
                        },
                        headerStyle: extraLargeHeaderStyle,
                        hidden: true
                    }, {
                        dataField: 'actionDummyField',
                        isDummyField: true,
                        text: t('samples_actions-th'),
                        searchable: false,
                        formatter: (cellData, rowData) => {
                            return setRowIcons(cellData, rowData);
                        },
                        headerStyle: smallHeaderStyle
                    }] }
                    columnToggle
                    search
                    noDataIndication={t('samples_no-data-tabletext')}
                    striped
                    hover
                    condensed
                >
                    {
                        props => (
                        <Container fluid>
                            <Container>
                                <GlobalSearch 
                                    { ...props.searchProps }
                                />
                            </Container>
                                <InputGroup className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text style={ {backgroundColor: '#D1FAFF'} }>
                                            {t('samples_showhide-sources-prepend')}
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <InputGroup.Append>
                                        <Button variant={showFreeSources ? 'info' : 'outline-info'} value="free" onClick={() => {
                                            setShowFreeSources(!showFreeSources);
                                            setHiddenRowKeysObject({...hiddenRowKeysObject, freeSources: freeSourcesArray});
                                        }}>
                                            {t('samples_showhide-sources-free')}
                                        </Button>
                                        <Button variant={showLoanedSources ? 'info' : 'outline-info'} value="loaned" onClick={() => {
                                            setShowLoanedSources(!showLoanedSources);
                                            setHiddenRowKeysObject({...hiddenRowKeysObject, loanedSources: loanedSourcesArray});
                                        }}>
                                            {t('samples_showhide-sources-loaned')}
                                        </Button>
                                        <Button variant={showRemovedSources ? 'info' : 'outline-info'} value="removed" onClick={() => {
                                            setShowRemovedSources(!showRemovedSources);
                                            setHiddenRowKeysObject({...hiddenRowKeysObject, removedSources: removedSourcesArray})
                                        }}>
                                            {t('samples_showhide-sources-removed')}
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>

                                <div style={ {textAlign: 'left'} }>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                            <InputGroup.Text style={ {backgroundColor: '#D3EFFF'} }>
                                                {t('samples_showhide-columns-prepend')}
                                            </InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <ToggleList { ...props.columnToggleProps } />
                                    </InputGroup>
                                </div>

                            <hr />
                            <BootstrapTable
                                { ...props.baseProps }
                                rowStyle={ setRowStyle }
                                hiddenRows={ hiddenRowKeys() }
                                expandRow={ expandRow }
                                noDataIndication={t('samples_no-data-tabletext')}
                                striped
                                hover
                                condensed
                                filter={ filterFactory() }
                            />
                        </Container>
                        )
                    }
                </ToolkitProvider>    

                <OneSamplePopup
                    show = {showSamplePopup}
                    onHide = {closePopup}
                    sample = {sampleInPopup}
                    ref = {popupRef}
                />

                <OneSampleEditPopup
                    show = {showSampleEditPopup}
                    onHide = {closeEditPopup}
                    sample = {sampleInEditPopup}
                    ref = {editPopupRef}
                />

                <OneSampleRemovePopup 
                    show = {showSampleRemovePopup}
                    onHide = {closeRemovePopup}
                    sample = {sampleInRemovePopup}
                    ref = {removePopupRef}
                />
            </Container>
        )
    }
}

export default Sample;

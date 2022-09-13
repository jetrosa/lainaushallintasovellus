import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from "axios";
import { Context } from './GlobalState';
import {
    Alert, Container, Row, Col, Spinner, Badge
} from "react-bootstrap";
import NuclideEdit from "./NuclideEdit";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search, ColumnToggle } from 'react-bootstrap-table2-toolkit';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';
import { CheckAbility } from "./Ability.js"

const Nuclides = (props) => {
    const { t } = useTranslation();
    const [state, dispatch] = useContext(Context);
    const [loading, setLoading] = useState(true);

    const [showNuclideEditPopup, setShowNuclideEditPopup] = useState(false);
    const [nuclideInEditPopup, setNuclideInEditPopup] = useState(null);
    const editNuclidePopupRef = useRef();

    useEffect(() => {
        axios.get("/api/nuclides").then(response => {
            const nuclides = response.data;
            setLoading(false);
            dispatch({type: 'SET_NUCLIDES', payload: nuclides});
        }).catch(err => {
            console.log(err);
        })
    }, []);

    const openInEditNuclidePopup = nuclide => {
        setNuclideInEditPopup(nuclide)
        setShowNuclideEditPopup(true);
    }

    const closeEditNuclidePopup = e => {
        console.log("EditPopUp closed");
        setShowNuclideEditPopup(false);
    }

    const EditNuclideIcon = props => {
        const [rowData, setRowData] = useState(props.rowData);

        useEffect(() => {
            setRowData(props.rowData);
        })

        if (rowData !== null && CheckAbility('modify', 'all')) {
            return (
                <React.Fragment>
                    <FontAwesomeIcon
                        className = 'ml-2 mr-2'
                        icon = {faEdit}
                        style = { { cursor: 'pointer' } }
                        size = 'lg'
                        onClick = {() => 
                            {
                                console.log("clicked edit for: " + rowData.nuklidi);
                                console.log(rowData);
                                openInEditNuclidePopup(rowData);
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
                <EditNuclideIcon 
                    rowData = { rowData }
                />
            </React.Fragment>
        )
    }

    const defaultSort = [{
        dataField: 'nuklidi',
        order: 'asc'
    }];

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

    if (state.nuclides.length === 0 && loading) {
        return (
            <Container fluid>
                <br />
                <Alert variant="primary">
                    <Row>
                        <Col>
                            {t('nuclides_loading')}
                            <Spinner animation="grow" size="sm"></Spinner>
                        </Col>
                    </Row>
                </Alert>
            </Container>
        )
    } else {
        return (
            <Container fluid>
                <br />
                <Container>
                    <Row>
                        <Col>
                            <Alert variant="primary">
                                <h1 className="title">{t('nuclides_list-of-nuclides-pageheader-title')}</h1>
                            </Alert>
                        </Col>
                    </Row>
                </Container>

                <ToolkitProvider 
                    bootstrap4
                    keyField='nuklidi' 
                    data={ state.nuclides } 
                    columns={ [
                        {
                        dataField: 'nuklidi',
                        text: t('nuclides_nuclide-th'),
                        sort: true,
                        filter: textFilter(),
                        headerFormatter: searchableHeaderFormatter,
                    }, {
                        dataField: 'puoliintumisaika',
                        text: t('nuclides_halflife-th'),
                        sort: true,
                        searchable: false,
                        formatter: (cellData, rowData) => {
                            if (cellData === 0) {
                                return (
                                    <React.Fragment>
                                        {cellData} <Badge variant="warning"> ! </Badge>
                                    </React.Fragment>
                                );
                            } else {
                                return cellData;
                            }
                        },
                        headerStyle: (columnValue, columnIndex) => {
                            return { verticalAlign: 'top'};
                        }
                    }, {
                        dataField: 'actionDummyField',
                        isDummyField: true,
                        text: t('nuclides_actions-th'),
                        searchable: false,
                        formatter: (cellData, rowData) => {
                            return setRowIcons(cellData, rowData);
                        },
                        headerStyle: (columnValue, columnIndex) => {
                            return { textAlign: 'center', verticalAlign: 'top', maxWidth: '180px', width: '164px', minWidth: '114px'};
                        }
                    }] }
                    search
                    noDataIndication={t('nuclides_nodata-table')}
                    striped
                    hover
                    condensed
                >
                    {
                        props => (
                        <Container fluid>
                            <BootstrapTable
                                { ...props.baseProps }
                                striped
                                hover
                                condensed
                                filter={ filterFactory() }
                                defaultSorted={ defaultSort }
                                noDataIndication={t('nuclides_nodata-table')}
                            />
                        </Container>
                        )
                    }
                </ToolkitProvider>    

                <NuclideEdit
                    show = {showNuclideEditPopup}
                    onHide = {closeEditNuclidePopup}
                    nuclide = {nuclideInEditPopup}
                    ref = {editNuclidePopupRef}
                />

            </Container>
        )
    }
}

export default Nuclides;

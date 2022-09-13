/**
 * THIS COMPONENT IS BASICALLY DEPRECATED, THOUGH IT IS POSSIBLE
 * TO REACH IT MANUALLY.
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Badge, Row, Col, Alert } from 'react-bootstrap';
import axios from "axios";
import { useTranslation } from "react-i18next";

/*
* Hakee ja tulostaa yhden näytteen tiedot
*/
function OneSample() {
    const { sampleid } = useParams()
    const url = `/api/samples/${sampleid}`
    const [sample, setSample] = useState({
        loading: false,
        data: null,
        error: false
    })
    let pageContent = null
    const { t } = useTranslation();

    useEffect(() => {
        setSample({
            loading: true,
            data: null,
            error: false
        })
        axios.get(url)
            .then(response => {
                setSample({
                    loading: false,
                    data: response.data,
                    error: false
                })
            })
            .catch(error => {
                setSample({
                    loading: false,
                    data: null,
                    error: true
                })
            })
    }, [url])

    // Sivunlatauksen aikana sykkivä pallukka
    if(sample.loading) {
        pageContent = 
            <Container>
                <br/>
                <Spinner animation="grow" size="sm"></Spinner>
            </Container>
    }

    // Virhetilanteessa näkyvä sivu
    if(sample.error) {
        pageContent =
            <Container>
                <br/>
                <p><Badge variant="warning" className="p-2">{t('one-sample_source-not-found')}</Badge></p>
            </Container>
    }

    // Sivu, kun API:sta saadaan data
    if(sample.data) {
        pageContent = 
            <Container>
                <br/>
                <Row>
                    <Col>
                        <Alert variant="primary">
                            <h1>{sample.data.kutsumanimi}</h1>
                        </Alert>
                    </Col>
                </Row>
                <Alert variant="secondary" className="pt-4">
                    <Row>
                        <Col>
                            <p>{t('one-sample_source-type-p')} {sample.data.tyyppi}</p>
                            <p>{t('one-sample_date-added-p')} {sample.data.lisatty_pvm}</p>
                            <p>{t('one-sample_best-before-date-p')} {sample.data.parasta_ennen_pvm}</p>
                            <p>{t('one-sample_removal-date-p')} {sample.data.poistettu_pvm}</p>
                        </Col>
                        <Col>
                            <p>{t('one-sample_certificate-link-p')} <a href={`https://ah.asp?docId=${sample.data.viite_lahde_sertifikaatti}`}>{sample.data.viite_lahde_sertifikaatti}</a></p>
                            <p>{t('one-sample_stuk-reference-p')} {sample.data.viite_stuk}</p>
                            <p>{t('one-sample_producer-reference-p')} {sample.data.viite_valmistaja}</p>
                            <p>{t('one-sample_acquirement-method-p')} {sample.data.hankintatapa}</p>
                        </Col>
                    </Row>
                </Alert>
                <Alert variant="secondary" className="pt-4">
                    <Row>
                        <Col>
                            <p>{t('one-sample_storage-location-p')} {sample.data.sailytyspaikka}</p>
                            <p>{t('one-sample_storage-location-specific-p')} {sample.data.sailytyspaikka_tarkenne}</p>
                        </Col>
                        <Col>
                            <p>{t('one-sample_person-responsible-p')} {sample.data.vastuuhenkilo_id}</p>
                        </Col>
                    </Row>
                </Alert>
            </Container>
    }

    return pageContent
    
}

export default OneSample;

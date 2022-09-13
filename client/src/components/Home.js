import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Context } from "./AuthContext"

import {
    Container, Row, Col, Alert
} from "react-bootstrap"

const Home = (props) => {
    const [department, setDepartment] = useState([]);
    const [permission, setPermission] = useState([]);
    const { t } = useTranslation();
    const [state] = useContext(Context);

    useEffect(() => {
        const depId = state.user.department_id;
        axios.get("/api/departments/" + depId).then(response => {
            const deps = response.data;
            setDepartment(deps);
        }).catch(err => {
            console.log(err);
        })
    }, []);
    
    useEffect(() => {
        const permId = state.user.auth_level
        axios.get("/api/authorizationlevels/"+ permId).then(response => {
            const levels = response.data;
            setPermission(levels);
            console.log(levels);
        }).catch(err => {
            console.log(err);
        })
    }, []);

    return (
        <Container>
            <br />
            <Row>
                <Col>

                <div class="homepage_container bg-light p-5 rounded-lg">
                    <img src="/stuk_logo.png" alt="STUK-logo" class="mb-4" style={{width: '40%'}} />
                    <h1 class="display-4">{t("home_app-name")}</h1>
                        <h2 class="m-4">{t('home_hello-user-jumbotron-h2')} {state.user.firstname + ' ' + state.user.lastname}</h2>
                </div>
                <div class="bg-light p-5 rounded-lg">
                        <p>{state.user.email}</p>
                        <p>{t('home_department-info') + department.nimi}</p>
                        <p>{t('home_auth-info') + permission.nimi}</p>
                        <p>{t('home_kieku-info') + state.user.remote_user}</p>
                </div>
                </Col>
            </Row>
        </Container>
    )

}

export default Home;
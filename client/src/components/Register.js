import React, { useState } from 'react';
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Navbar, Nav, Button } from 'react-bootstrap';
import LanguageSwitcher from './LanguageSwitcher';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";


function Register() {
  const { t } = useTranslation();

  function logout(e) {
    e.preventDefault();
    axios.get("/api/logout").then(function () { window.location.reload() });
  }

  const [editFormData, setEditFormData] = useState({
    etunimi: "",
    sukunimi: "",
    sahkoposti: ""
  });

  const handleRegister = (event) => {
    event.preventDefault();

    const registerInformation = {
      etunimi: editFormData.etunimi,
      sukunimi: editFormData.sukunimi,
      sahkoposti: editFormData.sahkoposti
    }

    axios.patch("/api/users/selfregister", registerInformation).then(response => {
      console.log(response.data);
      window.location.reload();
    }).catch(err => {
      console.log(err);
    });

  }

  const handleFormChange = (event) => {
    event.preventDefault();
    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;

    const newFormData = { ...editFormData };
    newFormData[fieldName] = fieldValue;
    setEditFormData(newFormData);
  }

  return (
    <div class="register-page">
      <Navbar collapseOnSelect bg="light" expand="lg" sticky="top" className="border-bottom border-primary">
        <Navbar.Brand><img className="navbar_img" src="/stuk_logo_blue.png" alt="Navbar STUK-logo" class="mr-1 mb-2" style={{width: '100px', height: '30px'}}/></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
          <Nav className="justify-content-end">
            <LanguageSwitcher />
            <div name="spacerDiv2" className="mr-1 ml-1" />
          </Nav>
          <Nav className="justify-content-end">
            <Button type="button" onClick={logout}>
              <FontAwesomeIcon
                className="mr-2"
                icon={faPowerOff}
              />
              {t('nav_logout')}
            </Button>
            <div name="spacerDiv2" className="mr-1 ml-1" />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div class="signup-form">
        <form onSubmit={handleRegister}>
          <h2>{t("register_title")}</h2>
          <p>{t("register_text")}</p>
          <hr />

          <div class="form-group">
            <div class="row">
              <div class="col"><input type="text" class="form-control" name="etunimi" placeholder={t("register_first-name")} required="required" onChange={handleFormChange} /></div>
              <div class="col"><input type="text" class="form-control" name="sukunimi" placeholder={t("register_last-name")} required="required" onChange={handleFormChange} /></div>
            </div>
          </div>

          <div class="form-group">
            <input type="email" class="form-control" name="sahkoposti" placeholder={t("register_email")} required="required" onChange={handleFormChange} />
          </div>

          <div class="form-group">
            <button type="submit" class="btn btn-primary btn-lg">{t("register_sign-in-button")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
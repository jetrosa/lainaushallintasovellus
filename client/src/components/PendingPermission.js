import React, { useState, useContext } from 'react';
import axios from "axios";
import { Navbar, Nav, Button } from 'react-bootstrap';
import LanguageSwitcher from './LanguageSwitcher';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { Context } from './AuthContext';
import { useTranslation } from "react-i18next";

const PendingPermission = () => {
  const { t } = useTranslation();

  function logout(e) {
    e.preventDefault();
    axios.get("/api/logout").then(function () { window.location.reload() });
  }

  return (
    <div className="pending-permission">
      <Navbar collapseOnSelect bg="light" expand="lg" sticky="top" className="border-bottom border-primary">
        <Navbar.Brand><img className="navbar_img" src="/stuk_logo_blue.png" alt="Navbar STUK-logo" class="mr-1 mb-2" style={{width: '100px', height: '30px'}}/></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
          <Nav>
            <LanguageSwitcher />
            <div name="spacerDiv2" className="mr-1 ml-1" />
          </Nav>
          <Nav>
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
      <div class="d-flex align-items-center p-10 flex-column mt-4">
        <h1 class="display-4">{t("home_app-name")}</h1>
        <h2>{t("pending_text")}</h2>
      </div>
    </div>
  );
}

export default PendingPermission;
import { Context } from './GlobalState';
import React, { useContext } from 'react';
import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import axios from 'axios';
import Cart from "./Cart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faAtom, faPlus, faPowerOff, faUsersCog } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from './LanguageSwitcher';
import { CheckAbility } from "./Ability.js"

const NavbarItem = (props) => {
    const { t } = useTranslation();
    const [state, dispatch] = useContext(Context);

    function logout(e) {
        e.preventDefault();
        dispatch({ type: 'USER_LOGOUT' });
        axios.get("/api/logout").then(function () { window.location.reload() });
    }

    return (
        <Navbar collapseOnSelect bg="light" expand="lg" sticky="top" className="border-bottom border-primary">
            <Navbar.Brand><img className="navbar_img" src="/stuk_logo_blue.png" alt="Navbar STUK-logo" class="mr-1 mb-2" style={{width: '100px', height: '30px'}}/></Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">

                    <LinkContainer to="/home">
                        <Nav.Link>
                            <FontAwesomeIcon
                                className="mr-2"
                                icon={faHome}
                            />
                            {t('nav_home')}
                        </Nav.Link>
                    </LinkContainer>

                    <LinkContainer to="/samples">
                        <Nav.Link>
                            <FontAwesomeIcon
                                className="mr-2"
                                icon={faAtom}
                            />
                            {t('nav_sources')}
                        </Nav.Link>
                    </LinkContainer>

                    <LinkContainer to="/loans">
                        <Nav.Link>
                            {t('nav_loans')}
                        </Nav.Link>
                    </LinkContainer>


                    <NavDropdown title={t('nav_other')} id="collasible-nav-dropdown">

                        {CheckAbility('modify', 'all') && (
                            <LinkContainer to="/addsample">
                                <NavDropdown.Item>
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={faPlus}
                                    />
                                    {t('nav_add-source')}
                                </NavDropdown.Item>
                            </LinkContainer>
                        )}

                        <LinkContainer to="/nuclides">
                            <NavDropdown.Item>
                                {t('nav_nuclides')}
                            </NavDropdown.Item>
                        </LinkContainer>
                    </NavDropdown>
                    <div name="spacerDiv0" className="mr-3 ml-3" />
                    <div name="cartDiv" className="mt-1">
                        <Cart />
                    </div>
                </Nav>

                {CheckAbility('manage', 'all') && (<LinkContainer to="/adminpage">
                    <Nav.Link>
                        <FontAwesomeIcon
                            className="ml-2 mr-2"
                            icon={faUsersCog}
                        />
                        Admin
                    </Nav.Link>
                </LinkContainer>)}
                <Nav className="justify-content-end">
                    <LanguageSwitcher />
                    <div name="spacerDiv2" className="mr-1 ml-1" />
                </Nav>
                <button type="button" class="logoutButton btn-danger btn-sm rounded" style={{padding: '0.5em'}} onClick={logout}>
                            <FontAwesomeIcon
                                className="mr-2"
                                icon={faPowerOff}
                            />
                            {t('nav_logout')}
                </button>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default NavbarItem;

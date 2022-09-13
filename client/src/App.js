import './App.css';
import "bootstrap/dist/css/bootstrap.css";

import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";

import { useTranslation } from "react-i18next";

import {
	BrowserRouter as Router,
	Switch, Route
} from 'react-router-dom'

import {
	Container, Row, Col, Button, Navbar, Nav
} from "react-bootstrap"

import Home from "./components/Home"
import Samples from "./components/Samples"
import NavbarItem from "./components/NavbarItem"
import AddSample from "./components/AddSample"
import OneSample from "./components/OneSample"
import { LoanView } from "./components/LoanView"
import GlobalState from "./components/GlobalState"
import { Context } from "./components/AuthContext"
import LoanConfirmation from "./components/LoanConfirmation";
import Nuclides from "./components/Nuclides";
import AdminPage from './components/AdminPage';
import Register from './components/Register';
import PendingPermission from './components/PendingPermission';
import LanguageSwitcher from './components/LanguageSwitcher';
import { CheckAbility } from "../src/components/Ability"


function App() {
	const [isAuthenticated, setAuthenticated] = useState(false);
	const [isAuthCompleted, setAuthCompleted] = useState(false);
	const [state, dispatch] = useContext(Context);

	const { t } = useTranslation();

	useEffect(() => {
		async function fetchAuthData() {
			try {
				const auth = await axios.get("/api/authenticated");
				setAuthenticated(auth.data);
				if (auth.data) {
					const authUser = await axios.get("/api/activeuser");
					console.log("authUser: " + authUser.data)
					if (authUser) {
						dispatch({ type: 'SET_USER', payload: authUser.data });
					}

				}
				setAuthCompleted(true);
			} catch (error) {
				console.log(error);
			}
		}
		fetchAuthData()
	}, []
	)

	/**
	 * Validates email input in register form. User is redirected to pendingpermission page if the email is valid
	 * @param {*} email 
	 * @returns 
	 */
	function validateEmail(email) {
		console.log(state.user.email);
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	if (isAuthCompleted) {
		if (!isAuthenticated) {

			return (
				<div className="App">
					<Navbar collapseOnSelect bg="light" expand="lg" sticky="top" className="border-bottom border-primary">
					<Navbar.Brand><img className="navbar_img" src="/stuk_logo_blue.png" alt="Navbar STUK-logo" class="mr-1 mb-2" style={{width: '100px', height: '30px'}}/></Navbar.Brand>
					<Navbar.Toggle aria-controls="responsive-navbar-nav" />
					<Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
						<Nav>
							<LanguageSwitcher />
							<div name="spacerDiv2" className="mr-1 ml-1"/>
						</Nav>   
					</Navbar.Collapse>
				</Navbar>
					<Container className="p-5">
					<div class="homepage_container bg-light p-5 rounded-lg">
                    <img src="/stuk_logo.png" alt="STUK-logo" class="mb-4" style={{width: '40%'}} />
                    <h1 class="display-4">{t("home_app-name")}</h1>
					<h1 mt-4>{t('login_login-title')}</h1>
							<div display="inline">
								<a href="/login">
									<Button style={{outline: '2px solid white'}} variant="primary mt-3" size="lg">
									{t('login_login-button')}
									</Button>
								</a>
							</div>
                	</div>
					</Container>
				</div>
			)
		}
		else if (validateEmail(state.user.email) == false) {
			return (
				<Register />
			)
		}
		else if (state.user.auth_level == 5) {
			return (
				<PendingPermission />
			)
		} else {
			return (
				<div className="App">
					<GlobalState>

						<Router>

							<Switch>
								<Route path="/register">
									<Container>
										<Row className="justify-content-md-center">
											<Col>
												<Register />
											</Col>
										</Row>
									</Container>
								</Route>
								<div>
									<NavbarItem />
									<Route path="/adminpage">
									{CheckAbility('modify', 'all') ? (
										<AdminPage />
									): <div class="mt-4"><h1>Access forbidden</h1>
									<p>You don't have permission to view this page.</p></div>
								}							
									</Route>
									<Route path="/addsample">
										<Container>
											<Row className="justify-content-md-center">
												<Col>
													<AddSample />
												</Col>
											</Row>
										</Container>
									</Route>

									<Route exact path="/samples">
										<Container fluid>
											<Samples />
										</Container>
									</Route>

									<Route path="/samples/:sampleid">
										<Container>
											<Row className="justify-content-md-center">
												<Col>
													<OneSample />
												</Col>
											</Row>
										</Container>
									</Route>

									<Route path="/loans/">
										<Container>
											<Row className="justify-content-md-center mt-4">
												<Col>
													<LoanView />
												</Col>
											</Row>
										</Container>
									</Route>

									<Route path="/nuclides/">
										<Container>
											<Row className="justify-content-md-center">
												<Col>
													<Nuclides />
												</Col>
											</Row>
										</Container>
									</Route>

									<Route path="/loanconfirmation/">
										<Container>
											<Row className="justify-content-md-center">
												<Col>
													<LoanConfirmation />
												</Col>
											</Row>
										</Container>
									</Route>
									<Route exact path="/home">
										<Col>
											<Home />
										</Col>
									</Route>
									<Route exact path="/">
										<Col>
											<Home />
										</Col>
									</Route>
								</div>
							</Switch>

						</Router>
					</GlobalState>
				</div>
			);
		}
	} else return null;
}

export default App;

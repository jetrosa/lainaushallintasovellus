import React, { useContext, useEffect, Component, useState } from "react";
import {Redirect, Link, useHistory } from 'react-router-dom';
import { Context } from './GlobalState';
import { Context as AuthContext} from './AuthContext';
import {Card, InputGroup, Dropdown, Badge, Container, Modal, Button, Form, Tab, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import OneSamplePopup from './OneSamplePopup';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faCheck, faTimes, faShoppingBasket, faCalendarAlt} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const SubmitLoansButton = ({date, desc, store}) => {
	const { t } = useTranslation();
    const [state, dispatch] = useContext(Context);
	const [authState] = useContext(AuthContext);
    const [submit, setSubmit] = useState(t('loan-confirmation_submit-state-submit'));
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitFailure, setSubmitFailure] = useState(false);
    const [response, setResponse] = useState({alreadyLoaned: null, loans: []});
    const [error, setError] = useState({});
    const [modalTimer, setModalTimer] = useState(false);

    useEffect(() => {
	if (!modalTimer) return;

	const timer = setTimeout(() => {
	    resetAfterSubmit();
	    returnHome();
	}, 20000);
	
	return () => clearTimeout(timer);
	
    }, [modalTimer])
    
    
    let history = useHistory();
    
    function resetAfterSubmit() {
	dispatch({type: 'RESET_AFTER_SUBMIT', payload: {}});
    }
    
    const valid = ((state.cart.length > 0) &&
                   (desc.length > 0) &&
                   (store.length > 0));
    
    function handleSubmit() {
	setSubmit(t('loan-confirmation_submit-state-loading'));

	if (valid) {
	    const loanableSamples = state.cart.map(sample => {
		const obj = {
		    voimassa: 1,
		    arvioitu_palautus_pvm: date.length > 0 ? date : null,
		    lainaus_syy: desc,
		    sailytys_tiedot: store,
		    nayte_id: sample.id,
		    lainaaja_id: authState.user.id
		};
		return obj;
	    });

	    axios.post('/api/loanedsamples/loan', loanableSamples)
		.then(function (response) {
		    setResponse(response.data);
		    setSubmitSuccess(true);
		})
		.catch(function (error) {
		    setError(error.message);
		    setSubmitFailure(true);
		});
	}
    }
    function returnHome() {
	history.push("/home");
    }
    
    const modalOnResponse =
	  <>
	    <Modal.Header closeButton>
		<Modal.Title class="loanConfirmationTitle rounded" style={response.alreadyLoaned ?
				    {"backgroundColor": 'lightsalmon'} :
				    {"backgroundColor": 'lightgreen'}}>
		    {response.alreadyLoaned ?
		     t('loan-confirmation_loaning-failed-modalonresponse-title') :
		     t('loan-confirmation_loans-confirmed-modalonresponse-title')}
		</Modal.Title>
	    </Modal.Header>
	      <Modal.Body>
		<p>{response.alreadyLoaned ?
		    t('loan-confirmation_sources-loaned-by-someone-else-modalonresponse-body') :
		    t('loan-confirmation_sources-loaned-successfully-modalonresponse-body')}</p>
		<ListGroup>
		    {response.alreadyLoaned ?
		     response.loans.map(loan =>
			 <ListGroup.Item key={loan.id}>
			     {loan.sateilylahteet.kutsumanimi}
			 </ListGroup.Item>)
		     :
		     state.cart.map(loan =>
			 <ListGroup.Item key={loan.id}>
			     {loan.kutsumanimi}
			 </ListGroup.Item>)
		    }
		</ListGroup>
	    </Modal.Body>
	  </>
    
    const modalOnError =
	  <>
	      <Modal.Header closeButton>
		  <Modal.Title style={{"backgroundColor": "lightsalmon"}}>
		      {t('loan-confirmation_loading-process-failed-modalonerror-title')}
		  </Modal.Title>
	      </Modal.Header>
	      <Modal.Body>
		  {error ? error : ""}
	      </Modal.Body>
	  </>
    
    return (
	<>
	    <Button variant="success"
		    disabled={!valid}
		    onClick={(e) => handleSubmit()}>
	      {submit}
	    </Button>
	    <Modal
		flex
		show={submitSuccess}
		onEntered={() =>
		    setModalTimer(true)}
		onHide={() => {resetAfterSubmit();
				returnHome();}}>
		{modalOnResponse}
	    </Modal>
	    
	    <Modal show={submitFailure}
		   onEntered={() => 
		       setModalTimer(true)}
		   onHide={() => {resetAfterSubmit();
				   returnHome();}}>
		{modalOnError}
	    </Modal>
	</>
    );
}

const ConfirmationForm = (props) => {
    const [date, setDate] = useState("");
    const [desc, setDesc] = useState("");
    const [store, setStore] = useState("");
	const { t } = useTranslation();

    console.log(date, desc, store);
    
    return (
	<Card>
	  <Card.Header>{t('loan-confirmation_loan-details-confirmationform-header')}</Card.Header>
	  <Form className="p-2" style={{"textAlign": "left"}}>
	    <Form.Row>
	      <Col xs="auto">
		<Form.Label>{t('loan-confirmation_estimated-return-date-loanconfirmationform-label')}</Form.Label>
		<InputGroup>
		  <InputGroup.Prepend>
		    <InputGroup.Text>
		      <FontAwesomeIcon
			icon = {faCalendarAlt}
			size="lg"/>
		    </InputGroup.Text>
		  </InputGroup.Prepend>
		  <Form.Control type="date"
			        placeholder="yyyy-mm-dd"
			        defaultValue={""}
			        onChange={(e) => setDate(e.target.value)}/>
		</InputGroup>
	      </Col>
	    </Form.Row>
	    <Form.Row>
	      <Col>
		<Form.Label>{t('loan-confirmation_loan-description-loanconfirmationform-label')}</Form.Label>
		<Form.Control as="textarea"
			      defaultValue={""}
			      onChange={(e) => setDesc(e.target.value)}/>
	      </Col>
	    </Form.Row>
	    <Form.Row>
	      <Col>
		<Form.Label>{t('loan-confirmation_storing-info-loanconfirmationform-label')}</Form.Label>
		<Form.Control as="textarea"
			      defaultValue={""}
			      onChange={(e) => setStore(e.target.value)}/>
	      </Col>
	    </Form.Row>
            <Form.Row>
              <Col className="pt-3">
                <SubmitLoansButton date={date} desc={desc} store={store}/>
              </Col>
            </Form.Row>
	  </Form>
	</Card>
    );
}

const CartItem = ({source}) => {
    const [showPopup, setShowPopup] = useState(false);
    const [state, dispatch] = useContext(Context);

    return (
    <div key={source.id}>
	<ListGroup.Item
	    className="p-2"
	    key={source.id}>
	    <Row className="m-0">
		<Col style={{"justifyContent": "center",
			    "alignItems": "center",
			     "display": "flex"}}
		     md="2">
		    <FontAwesomeIcon
			className="ml-2"
			icon = {faInfoCircle}
			style = { { cursor: 'pointer' } }
			size="lg"
			onClick = {() => setShowPopup(true)}/>
		    <OneSamplePopup show={showPopup}
				    sample={source}
				    onHide = {() => setShowPopup(false)}/>
		</Col>
		<Col className="mt-1" sm="8">
		    <Row>
			<Col>
			    {source.kutsumanimi}
			</Col>
		    </Row>
		</Col>
		<Col className="pl-0" sm="2">
		    <Button size="sm"
			    variant="outline-danger"
			    onClick={(e) => {
				dispatch({type: 'REMOVE_PRODUCT', payload: source});
				e.stopPropagation();
			    }}>
			<FontAwesomeIcon
			    size="lg"
			    icon = {faTimes}/>
		    </Button>
		</Col>
	    </Row>
	</ListGroup.Item>
    </div>
    );
}
const CartContents = ({sources}) => {
    const [showPopup, setShowPopup] = useState(false);

    const sourcesList = sources.map(source =>
	<CartItem source={source}/>
    );
    
    return (
	    <ListGroup>
		{sourcesList}
	    </ListGroup>
    );
}

const LoanConfirmation = (props) => {
    const [state, dispatch] = useContext(Context);
    console.log(state);
    return (
	<div className="mt-5">
	    <Tab.Container>
		<Row>
		    <Col sm={3}>
			<Card>
			    <Card.Header>
				<FontAwesomeIcon
				    className="mr-2"
				    icon = {faShoppingBasket}/>
			    </Card.Header>
			    <CartContents sources={state.cart}/>
			</Card>
		    </Col>
		    <Col sm={6}>
			    <ConfirmationForm />
		    </Col>
		    <Col sm={3}>
		    </Col>
		</Row>
	    </Tab.Container>
	</div>
    );
}

export default LoanConfirmation;

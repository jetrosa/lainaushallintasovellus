import React, { useContext, useState } from 'react';
import { Context } from './AuthContext';
import { Col, Modal, Form, Accordion, ListGroup, Card, Row, Button } from 'react-bootstrap';
import axios from "axios";
import OneSamplePopup from "./OneSamplePopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const LoanRow = ({loan, setReload, setLoanReturnInfo, setStatus}) => {
	const { t } = useTranslation();
    const [authState, dispatch] = useContext(Context);
    const [showPopup, setShowPopup] = useState(false);
    const [validated, setValidated] = useState(false);
    const [returnVolume, setReturnVolume] = useState(null);
    
    let typeRegex = /avol[aä]hde/i;
    const openRadiationSource = typeRegex.test(loan.sateilylahteet.tyyppi);

    const handleSubmit = (event) => {
	event.preventDefault();
	const form = event.currentTarget;
	
	if (openRadiationSource && form.checkValidity() === false) {
	    event.stopPropagation();
	} else {
	    setValidated(true);
	    var body;
	    
	    if (openRadiationSource) {
		body = {
		    id: loan.id,
		    palauttajan_id: authState.user.id,
		    avo_palautettu_tilavuus: returnVolume,
		    volumeChanged: (returnVolume !==
				    loan.sateilylahteet.avo_nykyinen_tilavuus),
		    sateilylahteet_id: loan.sateilylahteet.id
		};
	    } else {
		body = {
		    id: loan.id,
		    palauttajan_id: authState.user.id
		}
	    }
	    console.log(body);
	    axios.post("/api/loanedsamples/loan-return", body)
		.then(function (response) {
		    setStatus(response.status);
		    if (response.status == 200) setReload(true);
		}).catch(function (error) {
                    setStatus(error.response.status);
		    setLoanReturnInfo(error.response.statusText);
		});
	}
    }
    
    function checkDate(date) {
	if (date) {
	    let currentDate = new Date();
	    let estimatedReturnDate = new Date(date);
	    let timeDifferenceHours = (estimatedReturnDate.getTime() - currentDate.getTime())
		/ (1000 * 3600);
	    if (currentDate > estimatedReturnDate) {
		return "danger";
	    } else if (timeDifferenceHours < 72) {
		return "warning";
	    } else {
		return "success";
	    }
	} else {
	    return "info"
	}
    }
    
    return (
	<ListGroup.Item
	  style={{"textAlign": "left", margin: '-0.5em'}}
	  variant={checkDate(loan.arvioitu_palautus_pvm)}>
	  <Accordion>
	    <Row>
	      <Col
		style={{"justifyContent": "center",
			"alignItems": "center",
			"display": "flex"}}
		className="pr-0"
		md={1}>
		<FontAwesomeIcon
		  icon = {faInfoCircle}
		  size="lg"
		  onClick = {() => setShowPopup(true)}/>
		<OneSamplePopup show={showPopup}
				sample={loan.sateilylahteet}
				onHide = {() => setShowPopup(false)}/>
	      </Col>
	      <Col md={4}
		   style={{"display": "flex", "alignItems": "center"}}>
		{loan.sateilylahteet.kutsumanimi}
	      </Col>

	      <Col md={5}
		   style={{"display": "flex", "alignItems": "center"}}>
		{`${loan.lainaus_pvm} - ${loan.arvioitu_palautus_pvm ?
                       loan.arvioitu_palautus_pvm : "not specified"}`}
	      </Col>
	      <Col md={2}
		   style={{"display": "flex", "alignItems": "center"}}>
		<Accordion.Toggle as={Button}
                                  className="shadow-none"
                                  variant="link"
                                  eventKey={loan.id}>
		  <FontAwesomeIcon
		    icon = {faAngleDoubleDown}
		    size="lg"/>
		</Accordion.Toggle>
	      </Col>
	    </Row>
	    <Accordion.Collapse eventKey={loan.id}>
	      <Card bg="light">
		<Card.Body>
		  <Form validated={validated} onSubmit={handleSubmit}>
		    <Form.Row>
		      <Form.Group as={Col}>
			<Form.Label>
			  <u>{t('personal-loans-table_details-loanrow-label')}</u>
			</Form.Label>
			<Form.Control style={{outline: 'none'}} plaintext
				      as="textarea"
				      readOnly
				      defaultValue={loan.lainaus_syy}/>
		      </Form.Group>
		    </Form.Row>
		    <Form.Row>
		      <Form.Group as={Col}>
			<Form.Label>
			  <u>{t('personal-loans-table_storage-information-loanrow-label')}</u>
			</Form.Label>
			<Form.Control style={{outline: 'none'}} plaintext
				      as="textarea"
				      readOnly
				      defaultValue={loan.sailytys_tiedot}/>
		      </Form.Group>
		    </Form.Row>
		    <Form.Row>
		      <Form.Group as={Col}
				  hidden={!openRadiationSource}
				  md={6}
				  controlId="formVolume">
			<Form.Label>
                <u>{t('personal-loans-table_current-amount-loanrow-label')}</u>
            </Form.Label>
			<Form.Control
			  type="number"
			  step="any"
			  onChange={(e) => setReturnVolume(e.target.value)}
			  placeholder={loan.sateilylahteet.avo_nykyinen_tilavuus}
                          required
                          min="0"
                          max={loan.sateilylahteet.avo_nykyinen_tilavuus}
			  defaultValue={loan.sateilylahteet.avo_nykyinen_tilavuus}
			  disabled={!openRadiationSource}/>
			<Form.Control.Feedback type="invalid">
				{t('personal-loans-table_current-amount-invalid-input-loanrow')}
			</Form.Control.Feedback>
		      </Form.Group>
		    </Form.Row>
		    <Button type="submit">{t('personal-loans-table_return-loans-loanrow-button')}</Button>
		  </Form>
		</Card.Body>
	      </Card>
	    </Accordion.Collapse>
	  </Accordion>
	</ListGroup.Item>
    )
}

const PersonalLoansTable = ({loans, setReload}) => {
	const { t } = useTranslation();
    const [loanReturnInfo, setLoanReturnInfo] = useState(null);
    const [status, setStatus] = useState(null);
    
    const errorModal =
          <Modal onHide={(e) => setStatus(null)}
                 show={status === 500 ? true : false}>
            <Modal.Title>{t('personal-loans-table_error-on-loan-return-personalloanstable-errormodal-title')}</Modal.Title>
            <Modal.Body>
              {loanReturnInfo}
            </Modal.Body>
          </Modal>

    return (
	<Col md={6}>
          {errorModal}
	    <Card>
		<Card.Header><h2>{t('personal-loans-table_loaned-sources-personalloanstable-header-h2')}</h2></Card.Header>
		<ListGroup style={{padding: '0.5em'}} variant="flush">
		    {loans.length == 0 ? t('personal-loans-table_no-ongoing-loans-personalloanstable-listgroup') :
		     loans.map((loan) =>
			 <LoanRow key={loan.id}
				  loan={loan}
				  setReload={setReload}
				  setLoanReturnInfo={setLoanReturnInfo}
                                  setStatus={setStatus}/>
		     )}
		</ListGroup>
	    </Card>
	</Col>
    );
}
export { PersonalLoansTable };

import React, { useEffect, useContext, useState } from 'react';
import { Context } from './GlobalState';
import { Form, Col, Accordion, Pagination, ListGroup, Card, Row, Button } from 'react-bootstrap';
import axios from "axios";
import OneSamplePopup from "./OneSamplePopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const LoanRow = ({loan}) => {
    const [showPopup, setShowPopup] = useState(false);
	const { t } = useTranslation();
    
    return (
	<ListGroup.Item style={{"textAlign": "left", margin: '-0.5em'}}>
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
		    {`${loan.lainaus_pvm} - ${loan.lopullinen_palautus_pvm ?
                       loan.lopullinen_palautus_pvm : ""}`}
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
		<Form>
		  <Form.Row>
		    <Form.Group as={Col}>
		      <Form.Label>
			<u>{t('loan-history_details-loanrow')}</u>
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
			<u>{t('loan-history_storage-information-loanrow')}</u>
		      </Form.Label>
		      <Form.Control style={{outline: 'none'}} plaintext
				    as="textarea"
				    readOnly
				    defaultValue={loan.sailytys_tiedot}/>
		    </Form.Group>
		  </Form.Row>
		  <Form.Row>
                    {loan.avo_palautettu_tilavuus ?
                     <Form.Group as={Col}>
                       <Form.Label>
			 <u>{t('loan-history_open-source-returned-amount-loanrow')}</u>
		       </Form.Label>
                     <Form.Control style={{outline: 'none'}} plaintext
                                   readOnly
                                   defaultValue={`${loan.avo_palautettu_tilavuus} ${t('loan-history_open-source-returned-amount-units-loanrow-formcontrol')}`}/>
                     </Form.Group>
                     :
                     ""}
		  </Form.Row>
		</Form>
	      </Card.Body>
	    </Card>
	  </Accordion.Collapse>
	</Accordion>
	</ListGroup.Item>
    )
}
const LoanHistoryTable = ({loans}) => {
	const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(0);
    const loansPerPage = 10;
    const pageCount = Math.ceil(loans.length / loansPerPage);

    const shownLoans =
          loans.slice((currentPage * loansPerPage),
                      (currentPage * loansPerPage) + loansPerPage);
    const loanPages =
          [... Array(pageCount).keys()].map((i) =>
              <Pagination.Item
                active={currentPage === i}
                onClick={(e) => setCurrentPage(i)}>
                {i+1}
              </Pagination.Item>);

    const shownPages =
          (currentPage - 1) >= 0 ?
          loanPages.slice(currentPage - 1, currentPage + 2) :
          loanPages.slice(0, currentPage + 3);
                            
    return (
	<Col md={6}>
	  <Card >
	    <Card.Header><h2>{t('loan-history_loan-history-loanhistorytable-header-h2')}</h2></Card.Header>
            <div style={{"display": "flex", "justifyContent": "center"}}>
              <Pagination>
                <Pagination.First onClick={(e) => setCurrentPage(0)}/>
                <Pagination.Prev onClick={(e) => currentPage > 0 ? setCurrentPage(currentPage - 1) : null}/>
                {shownPages}
                <Pagination.Next onClick={(e) => currentPage < (pageCount - 1) ? setCurrentPage(currentPage + 1) : null}/>
                <Pagination.Last onClick={(e) => pageCount > 0 ? setCurrentPage(pageCount - 1) : null}/>
              </Pagination>
            </div>
		    <ListGroup style={{padding: '0.5em'}} variant="flush">
			{loans.length == 0 ? t('loan-history_no-loan-history-loanhistorytable-listgroup') :
			 shownLoans.map((loan) =>
			     <LoanRow key={loan.id} loan={loan}/>)
			}
		    </ListGroup>
		</Card>
	    </Col>
    );
}

export { LoanHistoryTable };

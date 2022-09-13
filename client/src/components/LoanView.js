import React, { useEffect, useContext, useState } from 'react';
import { Context } from './AuthContext';
import { Col, Row } from 'react-bootstrap';
import axios from "axios";
import { PersonalLoansTable } from "./PersonalLoansTable";
import { LoanHistoryTable } from "./LoanHistory";
import { OtherLoansTable } from "./OtherLoansTable";
import { CheckAbility } from "./Ability.js" // Käyttäjäntilin käyttöoikeuksien tarkastukseen, jotta voidaan piiloittaa/estää toiminnallisuuksia. Backendissä oma check

export const LoanView = (props) => {
    const [reload, setReload] = useState(false);
    const [loans, setLoans] = useState([]);
    const [allLoans, setAllLoans] = useState([]);
    const [loanHistory, setLoanHistory] = useState([]);
    const [authState, dispatch] = useContext(Context);
    
    useEffect(() => {
	console.log(reload);
	axios.get('/api/loanedsamples/' + authState.user.id)
	    .then(response => {
                const loans2 = response.data;
		setLoans(loans2);
	    })
	    .catch(error => {
		console.log(error);
	    });
	
	axios.get('/api/loanedsamples/history/' + authState.user.id)
	    .then(response => {
		const loanHistory = response.data;
		setLoanHistory(loanHistory);
	    }).catch(error => {
		console.log(error);
	    });

	// Hakee kaikki lainatut samplet 
	axios.get('/api/loanedsamples')
	    .then(response => {
                const allLoans2 = response.data;
		setAllLoans(allLoans2);
	    })
	    .catch(error => {
		console.log(error);
	    });
	setReload(false);
    }, [reload]);

    return (
	<Row>
	    <PersonalLoansTable loans={loans} setReload={setReload}/>
	    <LoanHistoryTable loans={loanHistory}/>
		{ CheckAbility('manage', 'all') && (<OtherLoansTable loans ={allLoans} setReload={setReload}/>)} {/* Tämä näkyy vain admin oikeuksilla */}
	</Row>
    )
}

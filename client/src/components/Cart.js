import React, { useContext } from "react";
import { Col, Dropdown, Badge, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Context } from './GlobalState';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faShoppingBasket, faArrowCircleRight } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const Cart = props => {
    const [state, dispatch] = useContext(Context);

	const { t } = useTranslation();

    const samples = state.cart.map(sample =>
	<div key={sample.id}>
	    <Dropdown.Divider/>
	    <Dropdown.Item
		className="p-2"
		key={sample.id}>
		<Row className="m-0">
		    <Col className="mt-1" sm="9">
			<Row>
			    <Col>
				{sample.kutsumanimi}
			    </Col>
			</Row>
		    </Col>
		    <Col className="pl-0" sm="3">
			<Button size="sm"
				variant="outline-danger"
				onClick={(e) => {
				    dispatch({type: 'REMOVE_PRODUCT', payload: sample});
				    e.stopPropagation();
					window.location.reload();
				}
				}>
			    <FontAwesomeIcon
				size="lg"
				icon = {faTimes}/>
			</Button>
		    </Col>
		</Row>
	    </Dropdown.Item>
	</div>
    );
    return (
	<>
	    <style type="text/css">
		{`.dropdown-toggle:after {display: none}` +
		`.dropdown-item:hover {background-color: transparent}`}
	    </style>
	    <Dropdown>
		<Dropdown.Toggle size="sm">
		    <FontAwesomeIcon
				className="mr-2"
                icon = {faShoppingBasket}
			/>
			<Badge pill variant="danger">
				{state.cart.length}
			</Badge>
		</Dropdown.Toggle>
		
		<Dropdown.Menu>
		    <Dropdown.Header>
			<Row>
			    <Col>
				<div>
				    {t('cart_selected-sources')}
				</div>
			    </Col>
			</Row>

		    </Dropdown.Header>
		    {samples}
		    <Dropdown.Divider/>
		    <Dropdown.Item>
				<Link to="/loanconfirmation">
					<Button disabled={state.cart.length <= 0}>
						{t('cart_enter-order-view-button')}
						<FontAwesomeIcon
							icon={faArrowCircleRight}
							className="ml-2"
						/>
					</Button>
				</Link>
		    </Dropdown.Item>
		</Dropdown.Menu>
	    </Dropdown>
	</>
    );
};

export default Cart;

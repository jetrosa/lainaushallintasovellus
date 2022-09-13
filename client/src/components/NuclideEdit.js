import React, { useState, forwardRef, useContext, useEffect } from 'react';
import axios from "axios";
import { Context } from './GlobalState';
import { Modal, Button, InputGroup, Form, FormControl } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { propTypes } from 'react-bootstrap/esm/Image';
import { useTranslation } from "react-i18next";

function NuclideEdit(props, ref) {
    const { t } = useTranslation();
    const [state, dispatch] = useContext(Context);
    const [nuclideHalfLife, setNuclideHalfLife] = useState(null);

    useEffect(() => {
        if (props.nuclide !== null) {
            setNuclideHalfLife(props.nuclide.puoliintumisaika)
        }
    }, [props])

    const handleEditNuclide = () => {
        const nuclideEditInfo = {
            puoliintumisaika: nuclideHalfLife
        }
        console.log(nuclideEditInfo)

        if (nuclideHalfLife !== null && nuclideHalfLife !== undefined && nuclideHalfLife !== "" && nuclideHalfLife !== props.nuclide.puoliintumisaika) {
            axios.post(`/api/nuclides/edit-nuclide/${props.nuclide.nuklidi}`, nuclideEditInfo).then(response => {
                console.log(response.data);
                window.location.reload();
                props.onHide();
            }).catch(error => {
                console.log(error);
            })
        } else if (nuclideHalfLife === props.nuclide.puoliintumisaika) {
            console.log("No changes detected. Closing popup.")
            props.onHide();
        } else {
            alert(t('nuclide-edit_empty-value-alert'));
            console.log("Cannot submit empty value!")
        }
        
    }

    function validateInput(inputToValidate) {
        let regEx = /^$|^[0-9]+\.?[0-9]*$/;
        return inputToValidate.match(regEx);
    }

    const handleNuclideHalfLifeChanged = (event) => {
        if (validateInput(event.target.value)) {
            setNuclideHalfLife(event.target.value);
        } else {
            return;
        }
        
    }

    if (props.nuclide !== null) {
        return (
            <Modal
                {...props}
                key={props.nuclide.nuklidi}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <h2>
                            {t('nuclide-edit_edit-nuclide-modal-header-h2')} {props.nuclide.nuklidi}
                        </h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="p-2" style={{"textAlign": "left"}}>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>{t('nuclide-edit_halflife-modal-inputgroup-prepend')}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control 
                                type="text"
                                aria-label={t('nuclide-edit_halflife-modal-inputgroup-arialabel')}
                                defaultValue={props.nuclide.puoliintumisaika}
                                
                                value={nuclideHalfLife}
                                onChange={handleNuclideHalfLifeChanged}
                            />
                        </InputGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick = {handleEditNuclide}>
                        {t('nuclide-edit_save-changes-button')}
                    </Button>
                    <Button variant="secondary" onClick = {() => {
                        setNuclideHalfLife(props.nuclide.puoliintumisaika);
                    }}>
                        {t('nuclide-edit_reset-button')}
                    </Button>
                    <Button variant="secondary" onClick = {props.onHide}>
                        {t('nuclide-edit_cancel-button')}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    } else {
        return (
            <div></div>
        )
    }

}

export default forwardRef(NuclideEdit);
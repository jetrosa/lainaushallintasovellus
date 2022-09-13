import React, { useState, useImperativeHandle, forwardRef, useContext } from 'react';
import axios from "axios";
import { Context } from './AuthContext';
import { Modal, Button, InputGroup, Form, FormControl } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function OneSampleRemovePopup(props, ref) {
    const { t } = useTranslation();
    const [authState, dispatch] = useContext(Context);

    const [removalDate, setRemovalDate] = useState(new Date());
    const [removalReason, setRemovalReason] = useState("");
    const [removalMethod, setRemovalMethod] = useState("");

    const handleRemove = () => {
        const sourceRemovalInfo = {
            poistettu_pvm: removalDate,
            poisto_syy: removalReason,
            poisto_tapa: removalMethod,
            poistajan_id: authState.user.id,
        }
        console.log(sourceRemovalInfo)

        axios.post(`/api/samples/remove-source/${props.sample.id}`, sourceRemovalInfo).then(response => {
            console.log(response.data);
            window.location.reload();
            props.onHide();
        }).catch(error => {
            console.log(error);
        })
    }

    const handleRemovalDateChanged = (event) => {
        setRemovalDate(event.target.value);
    }

    const handleRemovalReasonChanged = (event) => {
        setRemovalReason(event.target.value);
    }

    const handleRemovalMethodChanged = (event) => {
        setRemovalMethod(event.target.value);
    }

    if (props.sample != null) {
        return (
            <Modal
                {...props}
                key={props.sample.id}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered

            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <h2>
                            {t('one-sample-remove-popup_remove-source-modalheader-title')} {props.sample.kutsumanimi}
                        </h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="p-2" style={{"textAlign": "left"}}>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>{t('one-sample-remove-popup_disposal-date-prepend')}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control 
                                type="date"
                                aria-label={t('one-sample-remove-popup_disposal-date-arialabel')}
                                placeholder={new Date()}
                                defaultValue={new Date()}
                                value={removalDate}
                                onChange={handleRemovalDateChanged}
                            />
                        </InputGroup>
                        <br/>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>{t('one-sample-remove-popup_disposal-reason-prepend')}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl 
                                as="textarea" 
                                type="text" 
                                aria-label={t('one-sample-remove-popup_disposal-reason-arialabel')}
                                value={removalReason} 
                                onChange={handleRemovalReasonChanged}
                            />
                        </InputGroup>
                        <br/>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>{t('one-sample-remove-popup_disposal-method-prepend')}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl 
                                as="textarea" 
                                type="text" 
                                aria-label={t('one-sample-remove-popup_disposal-method-arialabel')}
                                value={removalMethod} 
                                onChange={handleRemovalMethodChanged}
                            />
                        </InputGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick = {handleRemove}>
                        {t('one-sample-remove-popup_remove-button')}
                    </Button>
                    <Button variant="secondary" onClick = {props.onHide}>
                        {t('one-sample-remove-popup_cancel-button')}
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

export default forwardRef(OneSampleRemovePopup);
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { Table, Form, Alert } from 'react-bootstrap';
import EditableRow from "./EditableRow";
import ReadOnlyRow from "./ReadOnlyRow";
import { useTranslation } from "react-i18next";

const AdminPage = (props) => {

  const { t } = useTranslation();

  // Local array of users got from database
  const [users, setUsers] = useState([]);
  // Local array of departments got from database
  const [departments, setDepartments] = useState([]);
  // Local array of permissions got from database
  const [permissions, setPermissions] = useState([]);
  // State for success alert after editing user
  const [show, setShow] = useState(false);
  // State for error alert after editing user
  const [showDanger, setShowDanger] = useState(false);
  // Used to set content of error alert
  const [alertContent, setAlertContent] = useState('');
  // Used for opening/closing user edit form
  const [editUserInfo, setEditUserInfo] = useState(null);

  // Sort checks
  const [sortIdClicked, setSortIdClicked] = useState(false);
  const [sortFnClicked, setSortFnClicked] = useState(false);
  const [sortLnClicked, setSortLnClicked] = useState(false);
  const [sortEmailClicked, setSortEmailClicked] = useState(false);
  const [sortDepClicked, setSortDepClicked] = useState(false);
  const [sortPermClicked, setSortPermClicked] = useState(false);
  const [currentSort, setCurrentSort] = useState('default');

  // Default data of edited user
  const [editFormData, setEditFormData] = useState({
      etunimi: "",
      sukunimi: "",
      oikeustaso: 0,
      aktiivinen: 0,
      kieku_id: "",
      oikeudet_admin: 0,
      osasto_id: 0,
      sahkoposti: "",
  });

  /**
   * Edit form change handler
   * Changes editformdata when something is written in the inputs
   */
  const handleEditFormChange = (event) => {
    event.preventDefault();
    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;
    
    const newFormData = {...editFormData};
    newFormData[fieldName] = fieldValue;
    setEditFormData(newFormData);
}

/**
 * Submits an edited user with editFormData to the database
 * @param {*} event 
 */
const handleEditFormSubmit = (event) => {
    event.preventDefault();
    const editedUser = {
        id: editUserInfo,
        etunimi: editFormData.etunimi,
        sukunimi: editFormData.sukunimi,
        oikeustaso: parseInt(editFormData.oikeustaso),
        aktiivinen: parseInt(editFormData.aktiivinen),
        kieku_id: editFormData.kieku_id,
        oikeudet_admin: parseInt(editFormData.oikeudet_admin),
        osasto_id: parseInt(editFormData.osasto_id),
        sahkoposti: editFormData.sahkoposti,
    }
    
    setEditUserInfo(null);

   axios.patch("/api/users/" + editedUser.id, editedUser).then(response => { 
        console.log(response.data);
        return axios.get("/api/users");
    })
    .then(response => {
        const dbUsers = response.data;
        setUsers(dbUsers);       
        setShow(true);
    }).catch(err => {
        console.log(err);
        setAlertContent(err.toString());
        setShowDanger(true);
    })

    setSortFnClicked(false);
    setSortIdClicked(false);
    setSortLnClicked(false);
    setSortEmailClicked(false);
    setSortDepClicked(false);
    setSortPermClicked(false);
    setCurrentSort('default');
}

// Closes edit form
const handleCancelClick = () => {
    setEditUserInfo(null);
}


// Gets users from database on site load
useEffect(() => {
    axios.get("/api/users").then(response => {
        const dbUsers = response.data;
        setUsers(dbUsers);
    }).catch(err => {
        console.log(err);
    })
}, []);

// Gets departments from database on site load
useEffect(() => {
    axios.get("/api/departments").then(response => {
        const deps = response.data;
        setDepartments(deps);
    }).catch(err => {
        console.log(err);
    })
}, []);

// Gets authorization levels from database on site load
useEffect(() => {
    axios.get("/api/authorizationlevels").then(response => {
        const levels = response.data;
        setPermissions(levels);
    }).catch(err => {
        console.log(err);
    })
}, []);

// Opens edit form row for specific user
const handleEditClick = (event, user) => {
    event.preventDefault();
    setEditUserInfo(user.id);
    const formValues = {
        etunimi: user.etunimi,
        sukunimi: user.sukunimi,
        oikeustaso: user.oikeustaso,
        aktiivinen: user.aktiivinen,
        kieku_id: user.kieku_id,
        oikeudet_admin: user.oikeudet_admin,
        osasto_id: user.osasto_id,
        sahkoposti: user.sahkoposti,
    }
    setEditFormData(formValues);
}

    // Renders either EditableRow (edit form row for user) or ReadOnlyRow (non-editable)
    const listItems = users.map((user) => 
        <React.Fragment>
                {editUserInfo === user.id ? (
                    <EditableRow editFormData={editFormData} permissions={permissions} departments={departments} user={user} handleEditFormChange={handleEditFormChange} handleCancelClick={handleCancelClick}/>
                    ) : (
                    <ReadOnlyRow editFormData={editFormData} user={user} handleEditClick={handleEditClick}/>)}
        </React.Fragment>
    );

    // Sorting

    const sortById = () => {  
        setSortIdClicked(false);
        setSortLnClicked(false);
        setSortEmailClicked(false);
        setSortDepClicked(false);
        setSortPermClicked(false);  
        if(!sortIdClicked){
            setUsers(users.slice().sort(function (a, b)  {
                return ('' + a.kieku_id.toLowerCase()).localeCompare(b.kieku_id.toLowerCase());
            }))
            setSortIdClicked(true);
            setCurrentSort('Kieku-ID Ascending');
           } else {
            setUsers(users.slice().reverse(function (a, b)  {
                return ('' + a.kieku_id.toLowerCase()).localeCompare(b.kieku_id.toLowerCase());
            }))
            setSortIdClicked(false);
            setCurrentSort('Kieku-ID Descending');
           }
           return 0;
    }

    const sortByDep = () => {
        setSortFnClicked(false);
        setSortIdClicked(false);
        setSortLnClicked(false);
        setSortEmailClicked(false);
        setSortPermClicked(false);
        if(!sortDepClicked){
            setUsers(users.slice().sort((a, b) => {return (a.osasto_id - b.osasto_id);}));
            setSortDepClicked(true);
            setCurrentSort('Department Ascending');
        }else{
            setUsers(users.slice().sort((a, b) => {return (b.osasto_id - a.osasto_id);}));
            setSortDepClicked(false);
            setCurrentSort('Department Descending');
        }
    }

    const sortByFn = () => {  
        setSortIdClicked(false);
        setSortLnClicked(false);
        setSortEmailClicked(false);
        setSortDepClicked(false);
        setSortPermClicked(false);  
        if(!sortFnClicked){
            setUsers(users.slice().sort(function (a, b)  {
                return ('' + a.etunimi.toLowerCase()).localeCompare(b.etunimi.toLowerCase());
            }))
            setSortFnClicked(true);
            setCurrentSort('First Name Ascending');
           } else {
            setUsers(users.slice().reverse(function (a, b)  {
                return ('' + a.etunimi.toLowerCase()).localeCompare(b.etunimi.toLowerCase());
            }))
            setSortFnClicked(false);
            setCurrentSort('First Name Descending');
           }
           return 0;
    }

    const sortByLn = () => {
        setSortFnClicked(false);
        setSortIdClicked(false);
        setSortEmailClicked(false);
        setSortDepClicked(false);
        setSortPermClicked(false);
        if(!sortLnClicked){
            setUsers(users.slice().sort(function (a, b)  {
                
                return ('' + a.sukunimi.toLowerCase()).localeCompare(b.sukunimi.toLowerCase());
            }))
            setSortLnClicked(true);
            setCurrentSort('Last Name Ascending');
           } else {
            setUsers(users.slice().reverse(function (a, b)  {
                return ('' + a.sukunimi.toLowerCase()).localeCompare(b.sukunimi.toLowerCase());
            }))
            setSortLnClicked(false);
            setCurrentSort('Last Name  Descending');
           }
           return 0;
    }

    const sortByEmail = () => {
        setSortFnClicked(false);
        setSortIdClicked(false);
        setSortLnClicked(false);
        setSortDepClicked(false);
        setSortPermClicked(false);
       if(!sortEmailClicked){
        setUsers(users.slice().sort(function (a, b)  {
            
            return ('' + a.sahkoposti.toLowerCase()).localeCompare(b.sahkoposti.toLowerCase());
        }))
        setSortEmailClicked(true);
        setCurrentSort('Email Ascending');
       } else {
        setUsers(users.slice().reverse(function (a, b)  {
            return ('' + a.sahkoposti.toLowerCase()).localeCompare(b.sahkoposti.toLowerCase());
        }))
        setSortEmailClicked(false);
        setCurrentSort('Email Descending');
       }
       return 0;
    }
    

    const sortByPerm = () => {
        setSortFnClicked(false);
        setSortIdClicked(false);
        setSortLnClicked(false);
        setSortEmailClicked(false);
        setSortDepClicked(false);
        if(!sortPermClicked){
            setUsers(users.slice().sort((a, b) => {return (a.oikeustaso - b.oikeustaso);}));
            setSortPermClicked(true);
            setCurrentSort('Permission Ascending');
        }else{
            setUsers(users.slice().sort((a, b) => {return (b.oikeustaso - a.oikeustaso);}));
            setSortPermClicked(false);
            setCurrentSort('Permission Descending');
        }
    }

    return(
        <div class="adminPageContainer mt-4">
            <Alert class="mt-4" variant="success" show={show} onClose={() => setShow(false)} dismissible>
                <Alert.Heading>{'User updated successfully!'}</Alert.Heading>
            </Alert>
            <Alert class="mt-4" variant="danger" show={showDanger} onClose={() => setShowDanger(false)} dismissible>
                <Alert.Heading>{'Error updating user'}</Alert.Heading>
                <p>{alertContent}</p>
            </Alert>
            <div class="d-flex align-items-center p-3 my-3 text-white bg-blue rounded shadow-sm justify-content-between">
                <div class="lh-1">
                <h1 class="h6 mb-0 text-white lh-1">{t("admin-page_title")}</h1>
                <small>{t("admin-page_subtitle")}</small>
                </div>
                <h5>{t("admin-page_sort")} {currentSort}</h5>
            </div>
            <Form onSubmit={handleEditFormSubmit}>
            <Table responsive striped hover>
                <thead>
                    <tr>                 
                        <th>
                            <FontAwesomeIcon
                                className = 'ml-2 mr-2'
                                icon = {faSort}
                                style = { { cursor: 'pointer' } }
                                size = 'sm'
                                onClick = {() => sortById()}
                            />
                            {t("admin-page_user-id")}
                        </th>
                        <th>
                            <FontAwesomeIcon
                                className = 'ml-2 mr-2'
                                icon = {faSort}
                                style = { { cursor: 'pointer' } }
                                size = 'sm'
                                onClick = {() => 
                                sortByFn('etunimi')}
                            />
                            {t("admin-page_first-name")}
                        </th>
                        <th>
                            <FontAwesomeIcon
                                className = 'ml-2 mr-2'
                                icon = {faSort}
                                style = { { cursor: 'pointer' } }
                                size = 'sm'
                                onClick = {() => sortByLn()}
                            />
                            {t("admin-page_last-name")}
                        </th>
                        <th>
                            <FontAwesomeIcon
                                className = 'ml-2 mr-2'
                                icon = {faSort}
                                style = { { cursor: 'pointer' } }
                                size = 'sm'
                                onClick = {() => sortByEmail()}   
                            />
                            {t("admin-page_email-address")}
                        </th>
                        <th>
                            <FontAwesomeIcon
                                className = 'ml-2 mr-2'
                                icon = {faSort}
                                style = { { cursor: 'pointer' } }
                                size = 'sm'
                                onClick = {() => sortByDep()}
                            />
                            {t("admin-page_department")}
                        </th>
                        <th>
                            <FontAwesomeIcon
                                className = 'ml-2 mr-2'
                                icon = {faSort}
                                style = { { cursor: 'pointer' } }
                                size = 'sm'
                                onClick = {() => sortByPerm()}
                            />{t("admin-page_permission")}
                        </th>                   
                        <th></th>
                </tr>
                </thead>
                <tbody>
                    {listItems}
                </tbody>
            </Table>
            </Form>
        </div>
    );
}


export default AdminPage;
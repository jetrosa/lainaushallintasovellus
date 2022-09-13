import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

/**
 * Default non-editable row in adminpage table
 * @param {*} param0 
 * @returns 
 */
const ReadOnlyRow = ({user, handleEditClick}) => {
  return(
            <tr>
                <td>{user.kieku_id}</td>
                <td>{user.etunimi}</td>
                <td>{user.sukunimi}</td>
                <td>{user.sahkoposti}</td>
                <td>{user.osasto.nimi}</td>
                <td>{user.oikeustasot.nimi}</td>
                <td><React.Fragment>
                <FontAwesomeIcon
                    className = 'ml-2 mr-2'
                    icon = {faEdit}
                    style = { { cursor: 'pointer' } }
                    size = 'lg'
                    onClick = {(event) => 
                        handleEditClick(event,user)
                    }
                />
            </React.Fragment>
            </td>
            </tr>
  );
}

export default ReadOnlyRow;
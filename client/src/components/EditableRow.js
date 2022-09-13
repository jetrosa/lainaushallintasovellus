import { useTranslation } from 'react-i18next';
import React from "react";

/**
 * Edit form row for user in adminpage table
 * @param {*} param0 
 * @returns 
 */
const EditableRow = ({user, editFormData, handleEditFormChange, handleCancelClick, departments, permissions}) => {  
  const { t } = useTranslation();
  return(
            <tr>
                <td>{user.kieku_id}</td>
                <td><input size="6" name="etunimi" type="text" required="required" defaultValue={editFormData.etunimi} onChange={handleEditFormChange}></input></td>
                <td><input size="6" name="sukunimi" type="text" required="required" defaultValue={editFormData.sukunimi} onChange={handleEditFormChange}></input></td>
                <td><input name="sahkoposti" type="email" required="required" defaultValue={editFormData.sahkoposti} onChange={handleEditFormChange}></input></td>
                <td>
                <select name="osasto_id" onChange={handleEditFormChange}>
                <option selected value={user.osasto.id}>{user.osasto.nimi}</option>
                {departments.filter(choice => choice != departments[user.osasto.id-1]).map((dep) => <option value={dep.id}>{dep.nimi}</option>)}
                </select>
                </td>
                <td>
                <select name="oikeustaso" onChange={handleEditFormChange}>
                <option selected value={user.oikeustasot.id}>{user.oikeustasot.nimi}</option>
                {permissions.filter(choice => choice != permissions[user.oikeustasot.id-1]).map((perm) => <option value={perm.id}>{perm.nimi}</option>)}
                </select>
                </td>
                <td style={{display: 'inline-flex'}}><button type="submit" class="btn btn-success mr-2">{t("editable-row_save")}</button>
                    <button type="button" class="btn btn-warning" onClick={handleCancelClick}>{t("editable-row_cancel")}</button>
                </td>
            </tr>
  );
}

export default EditableRow;
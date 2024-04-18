import "../stylesheets/EmployeeInfo.css";
import { useEmployeeContext } from "../hooks/useEmployeeContext";
import { useEmployeeCrudContext } from "../hooks/useEmployeeCrudContext";
import { useSelectContext } from "../hooks/useSelectContext";
const apiURL = process.env.REACT_APP_DEPLOYURL;
const EmployeeInfo = ({ id }) => {
  const { dispatch } = useEmployeeContext();
  const { showEdit, dispatch: dispatchEdit } = useEmployeeCrudContext();
  const { dispatch: dispatchIsSelected } = useSelectContext();

  const handleDelete = async () => {
    const response = await fetch(`${apiURL}/api/empleadoCRUD/${id}`, {
      method: "DELETE",
    });
    const json = await response.json();

    dispatch({ type: "DELETE_EMPLEADO", payload: json });
  };
  return (
    <td data-cell="acciones" className="row-actions">
      <div className="action-div showmore">
        <span className="material-symbols-outlined">more_horiz</span>
      </div>

      <div className="action-div edit">
        <span
          className="material-symbols-outlined"
          onClick={() => {
            dispatchEdit({ type: "SHOW_EDIT_DIALOG", payload: !showEdit });
            dispatchIsSelected({ type: "SELECT_EMPLOYEE", payload: id });
          }}
        >
          edit
        </span>
      </div>

      <div className="action-div delete" onClick={handleDelete}>
        <span className="material-symbols-outlined">delete</span>
      </div>
    </td>
  );
};
export default EmployeeInfo;

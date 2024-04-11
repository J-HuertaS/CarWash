import { useState } from "react";
import { useEmployeeContext } from "../hooks/useEmployeeContext";
import { useEmployeeCrudContext } from "./useEmployeeCrudContext";
const apiURL = process.env.REACT_APP_DEPLOYURL;

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const { dispatch: dispatchCloseWindow, show } = useEmployeeCrudContext();
  const { dispatch } = useEmployeeContext();
  const signupEmployee = async (
    nombre,
    apellido,
    telefono,
    cedula,
    direccion,
    usuario,
    contrasena
  ) => {
    setError(null);
    setIsLoading(true);
    const response = await fetch(`${apiURL}/api/empleadoCRUD/signupEmployee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        apellido,
        telefono,
        cedula,
        direccion,
        usuario,
        contrasena,
      }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error);
      setIsLoading(false);
    }
    if (response.ok) {
      setIsLoading(false);
      setError(null);
      dispatch({ type: "ADD_EMPLEADO", payload: json });
      dispatchCloseWindow({ type: "SHOW_CREATE_DIALOG", payload: !show });
    }
  };
  return { signupEmployee, error, setError, isLoading };
};

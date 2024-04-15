import { useState } from "react";
import { useEmployeeCrudContext } from "../hooks/useEmployeeCrudContext";
import { useSignup } from "../hooks/useSignup";
import MoonLoader from "react-spinners/MoonLoader";
import "../stylesheets/EmployeeForm.css";

const EmployeeFormAdd = () => {
  const { show, dispatch } = useEmployeeCrudContext();
  const { signupEmployee, error, setError, isLoading } = useSignup();
  const [showFormats, setShowFormats] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cedula, setCedula] = useState("");
  const [direccion, setdireccion] = useState("");
  const [usuario, setusuario] = useState("");
  const [contrasena, setcontrasena] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const handleNombre = (e) => {
    setNombre(e.target.value);
  };
  const handleApellido = (e) => {
    setApellido(e.target.value);
  };
  const handleTelefono = (e) => {
    setTelefono(e.target.value);
  };
  const handleCedula = (e) => {
    setCedula(e.target.value);
  };
  const handleDireccion = (e) => {
    setdireccion(e.target.value);
  };
  const handleusuario = (e) => {
    setusuario(e.target.value);
  };
  const handlecontrasena = (e) => {
    setcontrasena(e.target.value);
  };
  const handlePassConfirm = (e) => {
    setPassConfirm(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      nombre &&
      apellido &&
      telefono &&
      cedula &&
      direccion &&
      usuario &&
      contrasena &&
      passConfirm
    ) {
      if (passConfirm !== contrasena) {
        setError("Las contraseñas no coinciden");
        return;
      }

      await signupEmployee(
        nombre,
        apellido,
        telefono,
        parseInt(cedula),
        direccion,
        usuario,
        contrasena
      );
    } else {
      setError("Todos los campos deben ser llenados");
    }
  };
  return (
    <div className="main-container">
      <div
        className="closebtn"
        onClick={() => {
          dispatch({ type: "SHOW_CREATE_DIALOG", payload: !show });
        }}
      >
        <span className="material-symbols-outlined">close</span>
      </div>
      <h2>Ingrese la información del nuevo empleado</h2>
      <div
        className="show-formats"
        onClick={() => {
          setShowFormats(!showFormats);
        }}
      >
        {showFormats ? "ocultar formatos" : "Mostrar formatos aceptados"}{" "}
        <span className="material-symbols-outlined">
          {showFormats ? "keyboard_arrow_up" : "keyboard_arrow_down"}
        </span>
      </div>
      {showFormats && (
        <div className="formatos">
          <p>
            Tanto el nombre como el apellido solo aceptan letras del alfabeto
            español
          </p>
          <p>
            La contraseña asiganada debe tener mayúsculas, minúsculas, números y
            carácteres especiales{" "}
          </p>
          <p>
            El formato del número de teléfono deben 10 dígitos separados en dos
            grupos de 3 números y uno de 4 números, separados por un espacio.
            Como se muestra: <strong>320 330 4550</strong>
          </p>
          <p>
            El formato de la cédula deben ser 10 dígitos sin espacio entre ellos
          </p>
        </div>
      )}

      <form className="form-div" onSubmit={handleSubmit}>
        <div className="form-fields">
          <div>
            <label>Nombre</label>
            <input
              type="text"
              pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜàèìòùÀÈÌÒÙ ]+"
              onChange={handleNombre}
            />
          </div>
          <div>
            <label>Apellido</label>
            <input
              type="text"
              pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜàèìòùÀÈÌÒÙ ]+"
              onChange={handleApellido}
            />
          </div>
          <div>
            <label>Teléfono</label>
            <input
              type="tel"
              pattern="[0-9]{3} [0-9]{3} [0-9]{4}"
              onChange={handleTelefono}
            />
          </div>
          <div>
            <label>Cédula</label>
            <input type="text" pattern="[0-9]{10}" onChange={handleCedula} />
          </div>
          <div>
            <label>Dirección</label>
            <input type="text" onChange={handleDireccion} />
          </div>
          <div>
            <label>Nombre de Usuario</label>
            <input type="text" onChange={handleusuario} autoComplete="off" />
          </div>
          <div>
            <label>Contraseña </label>
            <input
              type="password"
              onChange={handlecontrasena}
              autoComplete="off"
            />
          </div>
          <div>
            <label>Confirmar Contraseña</label>
            <input type="password" onChange={handlePassConfirm} />
          </div>
        </div>
        <button className="submit-btn" disabled={isLoading}>
          Crear Empleado
        </button>
      </form>
      {isLoading && (
        <div className="loading2">
          <MoonLoader color="#1c143d" loading={isLoading} size={100} />
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};
export default EmployeeFormAdd;

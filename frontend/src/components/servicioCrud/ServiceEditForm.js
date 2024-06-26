//REACT HOOKS/IMPORTS
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import MoonLoader from "react-spinners/MoonLoader";
//CUSTOM HOOKS
import { useServiceContext } from "../../hooks/servicioHooks/useServiceContext";
import { useAuthContext } from "../../hooks/useAuthContext";
//COMPONENTS
//STYLESHEET
import "../../stylesheets/ServiceEditForm.css";
//ENV VARIABLES
const apiURL = process.env.REACT_APP_DEVURL;
//**************************************************************

const ServiceEditForm = ({ isOpen, onClose, editedService }) => {
  
  //variable global del usuario y su dispatch (viene desde el contexto de autenticacion)
  const { usuario } = useAuthContext();
  const { dispatch } = useServiceContext();

  //snackbar de notistack para mostrar mensaje de confirmacion
  const { enqueueSnackbar } = useSnackbar();

  const additionalUser = {
    apellido: "Jimenez",
    nombre: "Raul",
    rol: "administrador",
    usuario: "raulJm",
    _id: "660b75a326e70fee3afe0740"
  };

  //estados para manejar los inputs
  const [cliente, setCliente] = useState(editedService ? editedService.cliente : "");
  const [placa, setPlaca] = useState(editedService ? editedService.placa : "");
  const [tipoAuto, setTipoAuto] = useState(editedService ? editedService.tipoAuto : "");
  const [servicio, setServicio] = useState(editedService ? editedService.tipoServicio : "");
  const [precio, setPrecio] = useState(editedService ? editedService.precio : "");
  const [encargado, setEncargado] = useState(editedService ? editedService.encargado[0].encargadoUsuario : "");
  const [encargadoAct, setEncargadoAct] = useState({
    encargadoId: editedService ? editedService.encargado[0].encargadoId : "",
    encargadoNombre: editedService ? editedService.encargado[0].encargadoNombre : "",
    encargadoUsuario: editedService ? editedService.encargado[0].encargadoUsuario : ""
  });
  const [employeeList, setEmployeeList] = useState([]);
  const [detalles, setDetalles] = useState(editedService ? editedService.carInfo : "");
  const employeesWithAdditionalUser = [additionalUser, ...employeeList];

  //Estados para mostrar condicionalmente contenido
  const [showFormats, setShowFormats] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  //opciones de autos para dropdown
  const autoOptions = [
    { nombre: "Carro", key: 1 },
    { nombre: "Camioneta", key: 2 },
  ];

  const [tarifas, setTarifas] = useState([]);

  //opciones de servicios para dropdown
  const serviciosOptions = tarifas.map((tarifa) => ({
    nombre: tarifa.servicio,
    carro: tarifa.precio[0].carro,
    camioneta: tarifa.precio[0].camioneta,
    key: tarifa._id,
  }));

  //traer tipos de servicios para dropdown
  useEffect(() => {
    const fetchTarifas = async () => {
      const response = await fetch(`${apiURL}/api/tarifas`);
      const json = await response.json();
      if (!response.ok) {
        throw Error(`no se pudo porque: ${json}`);
      }
      if (response.ok) {
        setTarifas(json);
      }
    };
    fetchTarifas();
  }, []);

  // Obtener la lista de empleados del backend
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      const response = await fetch(`${apiURL}/api/empleadoCRUD`, {
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        console.log(json);
        throw Error("No se pudieron traer empleados");
      }
      if (response.ok) {
        setIsLoading(false);
        setEmployeeList(json);
      }
    };
    fetchEmployees();
  }, []);

  //funciones para guardar los cambios en los estados
  const handleCliente = (e) => {
    setCliente(e.target.value);
  };
  const handlePlaca = (e) => {
    setPlaca(e.target.value.toUpperCase());
  };
  const handleTipoAuto = (e) => {
    setTipoAuto(e.target.value);
  };
  const handleServicio = (e) => {
    setServicio(e.target.value);
  };
  const handleDetalles = (e) => {
    setDetalles(e.target.value);
  };
  // Manejar cambio en el select de encargado
const handleEncargadoChange = (e) => {
  const selectedUsuario = e.target.value.trim();
  
  const selectedEmployee = employeesWithAdditionalUser.find(
    (employee) => employee.usuario === selectedUsuario
  );

  if (selectedEmployee) {
    setEncargadoAct({
      encargadoId: selectedEmployee._id,
      encargadoNombre: `${selectedEmployee.nombre} ${selectedEmployee.apellido}`,
      encargadoUsuario: selectedUsuario
    });
  }

  setEncargado(selectedUsuario);
};

  

  //cambiar el precio
  useEffect(() => {
    serviciosOptions.forEach((serviceOption) => {
      if (serviceOption.nombre === servicio) {
        if (tipoAuto === "Carro") {
          setPrecio(serviceOption.carro);
        }
        if (tipoAuto === "Camioneta") {
          setPrecio(serviceOption.camioneta);
        }
      }
    });
  }, [tipoAuto, servicio, serviciosOptions]);

  

  //funcion para controlar el envio del formulario con los datos actualizados
  const handleSubmit = async (e) => {
    setIsLoading(true);
    setError(null);
    e.preventDefault();
    
    // Accede correctamente a las propiedades del estado encargadoAct
    const encargado = {
      encargadoId: encargadoAct.encargadoId,
      encargadoNombre: encargadoAct.encargadoNombre,
      encargadoUsuario: encargadoAct.encargadoUsuario,
    };
    try {
      const response = await fetch(`${apiURL}/api/servicioCRUD/${editedService._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario.token}`,
        },
        body: JSON.stringify({
          cliente,
          placa,
          tipoAuto,
          tipoServicio: servicio,
          precio,
          encargado,
          carInfo: detalles
        }),
      });
  
      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error);
      }
  
      // Actualizar el estado local con el servicio actualizado
      dispatch({ type: "UPDATE_SERVICE", payload: json });
      setIsLoading(false);
      enqueueSnackbar("Servicio editado correctamente", { variant: "success" });
      onClose(); // Cerrar el formulario después de la edición exitosa
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      enqueueSnackbar("Error al editar servicio", { variant: "error" });
    }
  };
  
  

  return (
    <>
      {isOpen && (
        <div className="main-container">
          <div className="closebtn">
            <span
              className="material-symbols-outlined"
              onClick={() => {
                onClose(!isOpen);
              }}
            >
              close
            </span>
          </div>
          <h2>Editar el servicio</h2>
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
                El nombre del cliente solo acepta carácteres del alfabeto
                español
              </p>
              <p>
                La placa del auto debe estar en el formato colombiano, es decir,
                tres letras seguidas de un espacio y luego tres números. Como se
                aprecia en el ejemplo: <strong>ABC 123</strong>
              </p>
            </div>
          )}

          <form className="form-div" onSubmit={handleSubmit}>
            <div className="form-fields">
              <div>
                <label>Cliente</label>
                <input
                  type="text"
                  pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜàèìòùÀÈÌÒÙ ]+"
                  value={cliente}
                  onChange={handleCliente}
                />
              </div>
              <div>
                <label>Placa del auto</label>
                <input
                  type="text"
                  pattern="[a-zA-Z]{3} [0-9]{3}"
                  value={placa}
                  onChange={handlePlaca}
                />
              </div>
              <div>
                <label>Tipo de auto</label>
                <select className="form-select" value={tipoAuto} onChange={handleTipoAuto}>
                  <option></option>
                  {autoOptions.map((option) => (
                    <option key={option.key}>{option.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Tipo de servicio</label>
                <select className="form-select" value={servicio} onChange={handleServicio}>
                  <option></option>
                  {serviciosOptions.map((option) => (
                    <option key={option.key} content="hola">
                      {option.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Encargado</label>
                {usuario.rol === 'administrador' ? (
                  <select className="form-select" value={encargado} onChange={handleEncargadoChange} required>
                    <option></option>
                    {employeesWithAdditionalUser.map((employee) => (
                      <option key={employee._id} value={employee.usuario}>
                        {employee.usuario} {/* Cambiar a la propiedad deseada */}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={encargado}
                    onChange={(e) => setEncargado(e.target.value)}
                    disabled
                  />
                )}
              </div>
              <div>
                <label>Detalles del auto</label>
                <input type="text" value={detalles} onChange={handleDetalles} />
              </div>
              <div>
                <label>Precio</label>
                <span>
                  {precio
                    ? `$ ${new Intl.NumberFormat().format(precio)}`
                    : "$ -"}
                </span>
              </div>
            </div>
            <button className="submit-btn">Editar servicio</button>
          </form>
          {isLoading && (
            <div className="loading2">
              <MoonLoader color="#1c143d" loading={isLoading} size={100} />
            </div>
          )}

          {error && <div className="error">{error}</div>}
        </div>
      )}
      
    </>
  );
};

export default ServiceEditForm;

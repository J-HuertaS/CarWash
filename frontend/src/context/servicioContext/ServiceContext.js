//************************** IMPORTED
//REACT HOOKS/IMPORTS
import { createContext, useReducer } from "react";
//**************************************************************

export const ServiceContext = createContext();

export const serviceReducer = (state, action) => {
  switch (action.type) {
    case "SET_SERVICES":
      return { servicios: action.payload };
    case "ADD_SERVICE":
      return { servicios: [action.payload, ...state.servicios] };
    case "UPDATE_SERVICE":
      console.log("updating service");
      //se supone que estipule el contexto para manipular los servicios
      const updatedIndex = state.servicios.findIndex(
        (servicio) => servicio._id === action.payload._id
      );
      const updatedServices = [...state.servicios];
      updatedServices[updatedIndex] = action.payload;
      return { servicios: updatedServices };
    default:
      return state;
  }
};

export const ServiceContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(serviceReducer, { state: null });
  return (
    <ServiceContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ServiceContext.Provider>
  );
};

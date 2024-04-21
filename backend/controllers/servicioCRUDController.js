const servicioModel = require("../models/servicioModel"); //importar el modelo del servicio para hacer las busquedas, inserciones, etc a traves de el

//controlador de mostrar servicios
const getServices = (req, res) => {
  res.json({ msg: "mostrar servicios" });
};

//controlador de mostrar un servicio

const getService = (req, res) => {
  res.json({ msg: "mostrar servicio" });
};

//controlador de crear servicio

const createService = async (req, res) => {
  const { cliente, placa, tipoAuto, tipoServicio, precio, encargado, carInfo } =
    req.body;
  try {
    const servicio = await servicioModel.insertService(
      cliente,
      placa,
      tipoAuto,
      tipoServicio,
      precio,
      encargado,
      carInfo
    );
    res.status(200).json(servicio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//controlador de editar servicio

const patchService = (req, res) => res.json({ msg: "editar servicio" });

//controlador de eliminar servicio

const deleteService = (req, res) => {
  res.json({ msg: "eliminar servicio" });
};

module.exports = {
  getServices,
  getService,
  createService,
  patchService,
  deleteService,
};

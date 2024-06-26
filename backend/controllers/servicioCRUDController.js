const mongoose = require("mongoose");
const servicioModel = require("../models/servicioModel");
const logModel = require("../models/logModel");

// mostrar todos los servicios (admin)
const getAllServices = async (req, res) => {
  //TODO:perdir autenticación luego de hacer front
  try {
    const servicios = await servicioModel.find().sort({ createdAt: -1 });
    res.status(200).json(servicios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// obtener servicios filtrando por empleado
const getserviceByEmployee = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const objectId = new mongoose.Types.ObjectId(id);
  //TODO:perdir autenticación luego de hacer front
  try {
    const servicios = await servicioModel
      .find({
        "encargado.encargadoId": objectId,
      })
      .sort({ createdAt: -1 });
    res.status(200).json(servicios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  try {
    await logModel.create({
      madeBy: req.loggedUser.usuario,
      action: "GET SERVICES BY EMPLOYEE",
      action_detail: `User ${req.loggedUser.usuario} got all services created by them`,
      status: "SUCCESSFUL",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// controlador de mostrar un servicio
const getService = async (req, res) => {
  const { id } = req.params;
  const idValidation = mongoose.Types.ObjectId.isValid(id);
  if (!idValidation) {
    console.log(idValidation);
    return res.status(400).json({ error: "Id de empleado invalida" });
  }

  const service = await servicioModel.findById(id);

  if (!service) {
    return res.status(400).json({ error: "Error buscando servicio" });
  }

  await logModel.create({
    madeBy: req.loggedUser.usuario,
    action: "GET SERVICE",
    action_detail: `user ${req.loggedUser.usuario} got service for vehicle ${service.placa}`,
    status: "SUCCESSFUL",
  });
  res.status(200).json(service);
};

// controlador de crear servicio
const createService = async (req, res) => {
  const { cliente, placa, tipoAuto, tipoServicio, precio, encargado, carInfo } =
    req.body;
  try {

    const historial = {
      fecha: new Date(),
      cliente,
      placa,
      tipoAuto,
      tipoServicio,
      precio,
      encargado,
      carInfo,
      usuario: req.loggedUser.usuario,
  };
  
    const servicio = await servicioModel.insertService(
      cliente,
      placa,
      tipoAuto,
      tipoServicio,
      precio,
      encargado,
      carInfo,
      req.loggedUser.usuario,
      historial
    );
    await logModel.create({
      madeBy: req.loggedUser.usuario,
      action: "CREATE SERVICE",
      action_detail: `User ${req.loggedUser.usuario} successfully created service ${servicio.placa}`,
      status: "SUCCESSFUL",
    });
    res.status(200).json(servicio);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

// controlador de editar servicio
const patchService = async (req, res) => {
  const { id } = req.params;
  const { cliente, placa, tipoAuto, tipoServicio, precio, encargado, carInfo } = req.body;
    
  try {
    const historial = {
      fecha: new Date(),
      cliente,
      placa,
      tipoAuto,
      tipoServicio,
      precio,
      encargado,
      carInfo,
      usuario: req.loggedUser.usuario
    };

    const servicioCambiado = await servicioModel.updateService(
      id,
      cliente,
      placa,
      tipoAuto,
      tipoServicio,
      precio,
      encargado,
      carInfo,
      req.loggedUser.usuario,
      historial
    );
    await logModel.create({
      madeBy: req.loggedUser.usuario,
      action: "UPDATE SERVICE",
      action_detail: `User ${req.loggedUser.usuario} updated service ${servicioCambiado._id} for vehicle "${placa}"`,
      status: "SUCCESSFUL",
    });
    res.status(200).json(servicioCambiado);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// controlador de eliminar servicio
const deleteService = async (req, res) => {
  //res.json({ msg: "eliminar servicio" });
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "No hay valor de id" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Id invalida" });
    }
    const deletedService = await servicioModel.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }
    await logModel.create({
      madeBy: req.loggedUser.usuario,
      action: "DELETE SERVICE",
      action_detail: `Service ${id} for vehicle ${deleteService.placa} successfuly deleted`,
      status: "SUCCESSFUL",
    });
    res.status(200).json(deletedService);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

const completeService = async (req, res) => {
  const { id } = req.params;
  const { calificacion } = req.body;
  console.log(calificacion);
  if (!id) {
    return res.status(400).json({ error: "No hay valor de id" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Id invalida" });
  }
  const existsSERVICE = await servicioModel.findOne({ _id: id });
  if (!existsSERVICE) {
    return res.status(400).json({ error: "Id no existe en app" });
  }
  if (existsSERVICE.estado === "Terminado") {
    return res.status(400).json({ error: "Registro ya está terminado" });
  }
  try {
    const completedService = await servicioModel.findOneAndUpdate(
      { _id: id },
      { estado: "Terminado", calificacion }
    );

    if (!completedService) {
      console.log(completedService);
      return res
        .status(404)
        .json({ error: "No fue posible completar el servicio" });
    }
    await logModel.create({
      madeBy: req.loggedUser.usuario,
      action: "COMPLETE SERVICE",
      action_detail: `Service ${id} for vehicle ${completedService.placa} successfuly completed`,
      status: "SUCCESSFUL",
    });
    const updated = await servicioModel.findOne({ _id: id });
    res.status(200).json(updated);
  } catch (error) {
    console.log(error.message);
    await logModel.create({
      madeBy: req.loggedUser.usuario,
      action: "COMPLETE SERVICE",
      action_detail: `Servicie ${id} FAILED to be completed`,
      status: "FAILED",
    });
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllServices,
  getserviceByEmployee,
  getService,
  createService,
  patchService,
  deleteService,
  completeService,
};
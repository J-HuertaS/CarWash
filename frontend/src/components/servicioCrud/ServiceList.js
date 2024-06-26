//************************** IMPORTED
//REACT HOOKS/IMPORTS
import React, { useEffect, useState } from "react";
import MoonLoader from "react-spinners/MoonLoader";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"; //para la tabla
//CUSTOM HOOKS
import { useAuthContext } from "../../hooks/useAuthContext";
import { useServiceContext } from "../../hooks/servicioHooks/useServiceContext";
//COMPONENTS
import ServiceReview from "./ServiceReview";
//STYLESHEET
import "../../stylesheets/ServiceList.css";
import ServiceActions from "./ServiceActions";
//ENV VARIABLES
const apiURL = process.env.REACT_APP_DEVURL;

//**************************************************************

const ServiceList = ({ openEditForm, openMoreForm }) => {
  //variable global del usuario y su dispatch (viene desde el contexto de autenticacion)
  const { usuario } = useAuthContext();
  const [showConfirmation, setShowConfirmation] = useState(false);
  //variable que tiene la lista de servicios y su despatch
  const { servicios, dispatch } = useServiceContext();
  //estado para mostrar loader
  const [isLoading, setIsLoading] = useState(null);

  const [showReview, setShowReview] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);

  //Traer los datos para la tabla
  useEffect(() => {
    setIsLoading(true);
    const fetchAllServies = async () => {
      const response = await fetch(`${apiURL}/api/servicioCRUD`, {
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      const json = await response.json();
      if (!response.ok) {
        setIsLoading(false);
        throw Error(`no se pudo porque: ${json}`);
      }
      if (response.ok) {
        setIsLoading(false);
        dispatch({ type: "SET_SERVICES", payload: json });
      }
    };
    const fetchServicesByEmployee = async () => {
      const response = await fetch(
        `${apiURL}/api/servicioCRUD/employee/${usuario.id}`,
        {
          headers: { Authorization: `Bearer ${usuario.token}` },
        }
      );
      const json = await response.json();
      if (!response.ok) {
        setIsLoading(false);
        throw Error(`no se pudo porque: ${json}`);
      }
      if (response.ok) {
        setIsLoading(false);
        dispatch({ type: "SET_SERVICES", payload: json });
      }
    };
    if (usuario.rol === "administrador") {
      fetchAllServies();
    }
    if (usuario.rol === "empleado") {
      fetchServicesByEmployee();
    }
  }, [usuario.id, usuario.rol, usuario.token, usuario.estado, dispatch]);

  //configuraciones para la tabla
  const columns = [
    { header: "Placa", accessorKey: "placa" },
    { header: "Cliente", accessorKey: "cliente" },
    { header: "Tipo de Auto", accessorKey: "tipoAuto" },
    { header: "Servicio", accessorKey: "tipoServicio" },
    {
      header: "Precio",
      accessorKey: "precio",
      cell: ({ row }) => (
        <>$ {new Intl.NumberFormat().format(row.original.precio)}</>
      ),
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ row }) => (
        <div
          className={
            row.original.estado === "Terminado"
              ? "estado-terminado"
              : "estado-en-proceso"
          }>
          {row.original.estado}
        </div>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "Acciones",
      cell: ({ row }) => (
        <ServiceActions
          onEdit={() => openEditForm(row.original)}
          onMore={() => openMoreForm(row.original)}
          id={row.original._id}
          estado={row.original.estado}
          rowInfo={row.original}
          showConfirmation={showConfirmation}
          setShowConfirmation={setShowConfirmation}
          setSelectedRow={setSelectedRow}
        />
      ),
    },
  ];
  const adminColumns = [
    ...columns.slice(0, 6),
    {
      header: "Encargado",
      accessorFn: (row) =>
        `${row.encargado[0].encargadoUsuario} (${
          row.encargado[0].encargadoNombre.split(" ")[0]
        })`,
    },
    ...columns.slice(6),
  ];

  const [columnFilters, setColumnFilters] = useState("");
  const [sorting, setSorting] = useState([]);
  //Hook de la tabla
  const table = useReactTable({
    data: servicios,
    columns: usuario.rol === "administrador" ? adminColumns : columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: columnFilters,
      sorting,
    },
    onGlobalFilterChange: setColumnFilters,
    onSortingChange: setSorting,
  });
  return (
    <div
      className={`empleadoLista-main relative-parent ${
        showConfirmation ? "empleadoLista-main-noScroll" : ""
      }`}>
      <input
        className="search-input"
        type="text"
        placeholder="Búsqueda"
        onChange={(e) => setColumnFilters(e.target.value)}
      />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {
                    { asc: "⬆️", desc: "⬇️" }[
                      header.column.getIsSorted() ?? null
                    ]
                  }
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {servicios &&
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} data-cell={cell.column.columnDef.header}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
        {showConfirmation && (
          <div className="back-div">
            <div className="confirmation-window">
              <p>¿Completar servicio?</p>
              <div className="confirmation-btn">
                <button
                  className="cancelar"
                  onClick={() => {
                    setShowConfirmation(!showConfirmation);
                  }}>
                  Cancelar
                </button>
                <button
                  className="completar"
                  onClick={() => {
                    setShowReview(!showReview);
                  }}>
                  Completar
                </button>
              </div>
              {showReview && (
                <ServiceReview
                  showReview={showReview}
                  setShowReview={setShowReview}
                  setShowConfirm={setShowConfirmation}
                  selectedRow={selectedRow}
                />
              )}
            </div>
          </div>
        )}
      </table>
      {isLoading && (
        <div className="loading">
          <MoonLoader color="#1c143d" loading={isLoading} size={100} />
        </div>
      )}
      <div className="pagination-div">
        <button
          className="pagination-btn"
          onClick={() => table.setPageIndex(0)}>
          Primera
        </button>
        <button
          className="pagination-btn"
          onClick={() => {
            table.previousPage();
          }}>
          Anterior
        </button>
        <button
          className="pagination-btn"
          onClick={() => {
            table.nextPage();
          }}>
          Siguiente
        </button>
        <button
          className="pagination-btn"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}>
          Última
        </button>
      </div>
    </div>
  );
};
export default ServiceList;

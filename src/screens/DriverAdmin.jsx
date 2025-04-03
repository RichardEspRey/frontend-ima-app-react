import React, { useState, useEffect } from 'react';
import './css/DriverAdmin.css';

const DriverAdmin = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
  const [selectedValue, setSelectedValue] = useState('');
  const [drivers, setDrivers] = useState([]);

  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, drivers.length);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('http://localhost/api/drivers.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getAll',
        });

        const data = await response.json();
        if (data.status === 'success' && data.Users) {
          const formatted = data.Users.map(user => ({
            id: user.driver_id.toString(),
            name: user.nombre || 'Sin nombre',
            status: 'Sin status',
            date: 'Sin fecha',
          }));
          setDrivers(formatted);
        }
      } catch (error) {
        console.error('Error al obtener los conductores:', error);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="driver-admin">
      <h1 className="title">Administrador de conductores</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
        >
          <option value="">Status</option>
          <option value="opcion1">Opción 1</option>
          <option value="opcion2">Opción 2</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No de empleado</th>
              <th>Nombre</th>
              <th>Status</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.slice(from, to).map(driver => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.name}</td>
                <td>{driver.status}</td>
                <td>{driver.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span>{`${from + 1}-${to} de ${filteredDrivers.length}`}</span>
          <button
            disabled={to >= filteredDrivers.length}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverAdmin;

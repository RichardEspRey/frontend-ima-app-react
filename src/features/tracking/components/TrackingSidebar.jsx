export function TrackingSidebar({ units, selected, setSelected }) {
  return (
    <div
      style={{
        width: "350px",
        background: "#fff",
        borderRight: "1px solid #ccc",
        overflowY: "auto",
      }}
    >
      <h3 style={{ padding: "15px", margin: 0 }}>Camiones</h3>

      {units.map((truck) => (
        <div
          key={truck.id}
          onClick={() => setSelected(truck)}
          style={{
            padding: "12px",
            cursor: "pointer",
            display: "flex",
            background: selected?.id === truck.id ? "#eef5ff" : "white",
            borderBottom: "1px solid #eee",
          }}
        >
          <div
            style={{
              width: "4px",
              background: truck.color,
              marginRight: "10px",
              borderRadius: "2px",
            }}
          />

          <div>
            <strong>{truck.name}</strong>

            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              Velocidad: {truck.speed} km/h
            </div>

            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              Última actualización:
              {truck.timestamp
                ? ` ${new Date(truck.timestamp * 1000).toLocaleString()}`
                : " ---"}
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#444",
              }}
            >
              {truck.address}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


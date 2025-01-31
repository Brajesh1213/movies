import React, { useState, useEffect, useCallback } from "react";

const Hotel = () => {
  const [rooms, setRooms] = useState([]);
  const [numRooms, setNumRooms] = useState(1);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/rooms");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();

      console.log("Fetched Data:", data); // Debugging API response

      // Group rooms by floors, ensuring floor 1 starts at bottom
      const groupedRooms = Array.from({ length: 10 }, () => []);
      data.forEach((room) => {
        const floorIndex = Math.floor(room.roomNumber / 100) - 1;
        groupedRooms[floorIndex].push(room);
      });

      console.log("Grouped Rooms:", groupedRooms); // Debugging grouped floors

      setRooms(groupedRooms); // Natural order: 1st at bottom, 10th at top
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const bookRooms = async () => {
    try {
      const res = await fetch("http://localhost:5000/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: numRooms }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Booking failed");
      }

      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetRooms = async () => {
    await fetch("http://localhost:5000/reset", { method: "POST" });
    fetchRooms();
  };

  const randomizeRooms = async () => {
    try {
      await fetch("http://localhost:5000/random", { method: "POST" });
      fetchRooms();
    } catch (err) {
      setError("Failed to randomize rooms");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Hotel Room Booking</h1>

      <div style={styles.controls}>
        <input
          type="number"
          min="1"
          max="5"
          value={numRooms}
          onChange={(e) => setNumRooms(parseInt(e.target.value))}
          style={styles.input}
        />
        <button onClick={bookRooms} style={styles.button}>Book</button>
        <button onClick={resetRooms} style={styles.button}>Reset</button>
        <button onClick={randomizeRooms} style={styles.button}>Random</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.hotelLayout}>
        {/* Staircase Section */}
        <div style={styles.stairs}>
          {rooms.length > 0 &&
            rooms.map((_, index) => (
              <div key={`floor-${index}`} style={styles.floorNumber}>
                {/* {index + 1} Floor 1 starts at bottom, 10 at top */}
              </div>
            ))}
        </div>

        {/* Room Grid */}
        <div style={styles.grid}>
          {rooms.length > 0 &&
            rooms.map((floor, floorIndex) => (
              <div key={`floor-${floorIndex}`} style={styles.floor}>
                {floor.map((room) => (
                  <div
                    key={`room-${room.roomNumber}`}
                    style={{
                      ...styles.room,
                      backgroundColor: room.occupied ? "#FFF" : "#2ecc71",
                      color: room.occupied ? "#000" : "white",
                      border: room.occupied ? "2px solid #e74c3c" : "2px solid black",
                    }}
                    title={`Room ${room.roomNumber} - ${room.occupied ? "Booked" : "Available"}`}
                  >
                    {room.roomNumber}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#fff",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    color: "#000",
    fontSize: "24px",
    marginBottom: "20px",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "8px",
    fontSize: "16px",
    width: "60px",
    textAlign: "center",
    borderRadius: "5px",
    border: "2px solid black",
    outline: "none",
  },
  button: {
    padding: "10px 15px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "2px solid black",
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "black",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: "16px",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  hotelLayout: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: "20px",
    gap: "10px",
  },
  stairs: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "500px",
    width: "100px",
    border: "2px solid black",
    // textAlign: "center",
    // fontSize: "14px",
    // fontWeight: "bold",
  },
  floorNumber: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid black",
  },
  grid: {
    display: "flex",
    flexDirection: "column-reverse", 
    gap: "5px",
  },
  floor: {
    display: "flex",
    gap: "5px",
    justifyContent: "center",
  },
  room: {
    width: "40px",
    height: "40px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid black",
    cursor: "pointer",
    backgroundColor: "white",
  },
};

export default Hotel;

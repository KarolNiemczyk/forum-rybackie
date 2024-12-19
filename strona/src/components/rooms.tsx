import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomsComponent = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/pokoje");
        if (response.status === 200) {
          setRooms(response.data);
        } else {
          throw new Error("Błąd: Otrzymano status " + response.status);
        }
      } catch (error) {
        console.error("Wystąpił błąd podczas pobierania pokoi:", error.message);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div>
      <h1>Lista pokoi</h1>
      <ul>
        {rooms.map((room) => (
          <li key={room._id}>{room.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsComponent;
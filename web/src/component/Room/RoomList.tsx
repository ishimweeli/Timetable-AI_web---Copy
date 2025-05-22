import React, { useState } from "react";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Search } from "lucide-react";

const mockRooms = [
  {
    id: 1,
    initials: "R1",
    name: "Room 101",
    controlNumber: 30,
    location: "Building A",
    locationNumber: 1,
  },
  {
    id: 2,
    initials: "R2",
    name: "Room 102",
    controlNumber: 25,
    location: "Building A",
    locationNumber: 1,
  },
  {
    id: 3,
    initials: "R3",
    name: "Lab 201",
    controlNumber: 20,
    location: "Building B",
    locationNumber: 2,
  },
  {
    id: 4,
    initials: "R4",
    name: "Lecture Hall",
    controlNumber: 100,
    location: "Building C",
    locationNumber: 3,
  },
  {
    id: 5,
    initials: "R5",
    name: "Conference Room",
    controlNumber: 15,
    location: "Building D",
    locationNumber: 4,
  },
];

const RoomList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const filteredRooms = mockRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.initials.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Room List</h2>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search rooms..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Initials
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location Number
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <tr
                key={room.id}
                className={`hover:bg-gray-50 cursor-pointer ${selectedRoom === room.id ? "bg-blue-50" : ""}`}
                onClick={() => setSelectedRoom(room.id)}
              >
                <td className="px-4 py-2 whitespace-nowrap">{room.initials}</td>
                <td className="px-4 py-2 whitespace-nowrap">{room.name}</td>
                <td className="px-4 py-2 text-center whitespace-nowrap">
                  {room.controlNumber}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{room.location}</td>
                <td className="px-4 py-2 text-center whitespace-nowrap">{room.locationNumber}</td>
              </tr>
            ))}
            {filteredRooms.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-center text-sm text-gray-500"
                >
                  No rooms found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="sm">
          New Room
        </Button>
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled={!selectedRoom}>
            Edit
          </Button>
          <Button variant="outline" size="sm" disabled={!selectedRoom}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomList;

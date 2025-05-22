import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/component/Ui/select";
import { Home } from "lucide-react";

interface RoomSelectorProps {
  rooms: { uuid: string; name: string }[];
  selectedRoom: string;
  onRoomChange: (roomId: string) => void;
  className?: string;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
  rooms,
  selectedRoom,
  onRoomChange,
  className = ""
}) => {
  return (
    <Select value={selectedRoom} onValueChange={onRoomChange}>
      <SelectTrigger className={`w-full p-2 border rounded-md ${className}`}>
        <div className="flex items-center space-x-2">
          <Home className="h-4 w-4" />
          <SelectValue placeholder="All Rooms" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Rooms</SelectItem>
        {rooms.map((room) => (
          <SelectItem key={room.uuid} value={room.uuid}>
            {room.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RoomSelector;
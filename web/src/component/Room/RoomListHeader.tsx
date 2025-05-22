import { Button } from "@/component/Ui/button";
import { Plus, ArrowUpDown, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/component/Ui/dropdown-menu";
import { toast } from "@/hook/useToast.ts";

interface RoomListHeaderProps {
  onSort: (key: string) => void;
  totalRooms?: number;
  onNewRoom?: () => void;
}

const RoomListHeader = ({
  onSort,
  totalRooms = 0,
  onNewRoom,
}: RoomListHeaderProps) => {
  const handleNewRoom = () => {
    if(onNewRoom) {
      onNewRoom();
    }else {
      toast({
        title: "New Room",
        description: "Room creation feature will be implemented soon.",
      });
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">
          Rooms{" "}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            ({totalRooms})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-8"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Sort Rooms By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSort("name")}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSort("name-desc")}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSort("location")}>
                Location
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSort("capacity")}>
                Capacity (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSort("capacity-asc")}>
                Capacity (Low to High)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-8"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter Rooms</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  toast({
                    description:
                      "Filter by building feature will be implemented soon.",
                  })
                }
              >
                By Building
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toast({
                    description:
                      "Filter by capacity feature will be implemented soon.",
                  })
                }
              >
                By Capacity
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toast({
                    description:
                      "Filter by availability feature will be implemented soon.",
                  })
                }
              >
                By Availability
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Button
        size="sm"
        className="flex items-center gap-1"
        onClick={handleNewRoom}
      >
        <Plus className="h-4 w-4" />
        New Room
      </Button>
    </div>
  );
};

export default RoomListHeader;

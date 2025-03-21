import { useState } from 'react';
import Badge from "../ui/badge/Badge";

interface ShowtimeSeat {
  id?: number;
  showtimeId: number;
  seatId: number;
  seatRow: string;
  seatNumber: number;
  seatType: 'REGULAR' | 'VIP' | 'COUPLE' | 'DISABLED';
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  price: number;
}

interface ShowtimeSeatConfigProps {
  showtimeId: number;
  onSave: (seats: ShowtimeSeat[]) => void;
}

export default function ShowtimeSeatConfig({ showtimeId, onSave }: ShowtimeSeatConfigProps) {
  const [seats, setSeats] = useState<ShowtimeSeat[]>([]);
  
  // Tạo ma trận ghế mẫu 10x10
  const sampleSeats: ShowtimeSeat[] = [];
  const rows = 'ABCDEFGHIJ'.split('');
  
  rows.forEach((row, rowIndex) => {
    for (let number = 1; number <= 10; number++) {
      // Mặc định một số ghế VIP và Couple
      let seatType: ShowtimeSeat['seatType'] = 'REGULAR';
      if (row >= 'D' && row <= 'G' && number >= 3 && number <= 8) {
        seatType = 'VIP';
      }
      if (row === 'J' && (number === 1 || number === 3 || number === 5 || number === 7 || number === 9)) {
        seatType = 'COUPLE';
      }

      sampleSeats.push({
        showtimeId,
        seatId: rowIndex * 10 + number,
        seatRow: row,
        seatNumber: number,
        seatType,
        status: 'AVAILABLE',
        price: seatType === 'VIP' ? 120000 : seatType === 'COUPLE' ? 200000 : 90000
      });
    }
  });

  const [selectedSeats, setSelectedSeats] = useState<ShowtimeSeat[]>(sampleSeats);

  const handleSeatClick = (seat: ShowtimeSeat) => {
    const nextType: { [key in ShowtimeSeat['seatType']]: ShowtimeSeat['seatType'] } = {
      'REGULAR': 'VIP',
      'VIP': 'COUPLE',
      'COUPLE': 'DISABLED',
      'DISABLED': 'REGULAR'
    };

    setSelectedSeats(prev => 
      prev.map(s => 
        s.seatId === seat.seatId 
          ? { ...s, seatType: nextType[s.seatType] }
          : s
      )
    );
  };

  const getSeatColor = (type: ShowtimeSeat['seatType']) => {
    switch (type) {
      case 'REGULAR': return 'bg-gray-100 hover:bg-gray-200';
      case 'VIP': return 'bg-blue-100 hover:bg-blue-200';
      case 'COUPLE': return 'bg-pink-100 hover:bg-pink-200';
      case 'DISABLED': return 'bg-red-100 hover:bg-red-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4">
        <Badge color="default">Ghế thường</Badge>
        <Badge color="primary">Ghế VIP</Badge>
        <Badge color="warning">Ghế đôi</Badge>
        <Badge color="error">Ghế không hoạt động</Badge>
      </div>

      <div className="w-full aspect-[16/9] bg-gray-50 p-8 rounded-xl">
        <div className="text-center mb-8 p-2 bg-gray-200 rounded">Màn hình</div>
        
        <div className="grid grid-cols-10 gap-2">
          {selectedSeats.map((seat) => (
            <button
              key={seat.seatId}
              onClick={() => handleSeatClick(seat)}
              className={`
                p-2 rounded text-sm font-medium
                ${getSeatColor(seat.seatType)}
                transition-colors duration-200
              `}
            >
              {seat.seatRow}{seat.seatNumber}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Click vào ghế để thay đổi loại ghế
      </div>
      
      <button
        onClick={() => onSave(selectedSeats)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Lưu cấu hình ghế
      </button>
    </div>
  );
}

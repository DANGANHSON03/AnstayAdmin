import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface ShowtimeSeat {
  id: number;
  showtimeId: number;
  seatRow: string;
  seatNumber: number;
  seatType: 'REGULAR' | 'VIP' | 'COUPLE' | 'DISABLED';
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  price: number;
  movieName?: string;
  showDate?: string;
  showTime?: string;
}

// Dữ liệu mẫu
const seatData: ShowtimeSeat[] = [
  {
    id: 1,
    showtimeId: 1,
    seatRow: 'A',
    seatNumber: 1,
    seatType: 'REGULAR',
    status: 'AVAILABLE',
    price: 90000,
    movieName: 'Avengers: Endgame',
    showDate: '2024-01-20',
    showTime: '10:00'
  },
  {
    id: 2,
    showtimeId: 1,
    seatRow: 'A',
    seatNumber: 2,
    seatType: 'VIP',
    status: 'RESERVED',
    price: 120000,
    movieName: 'Avengers: Endgame',
    showDate: '2024-01-20',
    showTime: '10:00'
  },
  {
    id: 3,
    showtimeId: 1,
    seatRow: 'J',
    seatNumber: 1,
    seatType: 'COUPLE',
    status: 'SOLD',
    price: 200000,
    movieName: 'Avengers: Endgame',
    showDate: '2024-01-20',
    showTime: '10:00'
  }
];

export default function ShowtimeSeatList() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell isHeader>STT</TableCell>
            <TableCell isHeader>Phim</TableCell>
            <TableCell isHeader>Suất chiếu</TableCell>
            <TableCell isHeader>Vị trí ghế</TableCell>
            <TableCell isHeader>Loại ghế</TableCell>
            <TableCell isHeader>Giá vé</TableCell>
            <TableCell isHeader>Trạng thái</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seatData.map((seat, index) => (
            <TableRow key={seat.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{seat.movieName}</TableCell>
              <TableCell>
                {seat.showDate} {seat.showTime}
              </TableCell>
              <TableCell>
                {seat.seatRow}{seat.seatNumber}
              </TableCell>
              <TableCell>
                <Badge
                  size="sm"
                  color={
                    seat.seatType === 'VIP' ? 'primary' :
                    seat.seatType === 'COUPLE' ? 'warning' :
                    seat.seatType === 'DISABLED' ? 'error' : 'default'
                  }
                >
                  {seat.seatType}
                </Badge>
              </TableCell>
              <TableCell>
                {seat.price.toLocaleString()}đ
              </TableCell>
              <TableCell>
                <Badge
                  size="sm"
                  color={
                    seat.status === 'AVAILABLE' ? 'success' :
                    seat.status === 'RESERVED' ? 'warning' : 'error'
                  }
                >
                  {seat.status === 'AVAILABLE' ? 'Trống' :
                   seat.status === 'RESERVED' ? 'Đã đặt' : 'Đã bán'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

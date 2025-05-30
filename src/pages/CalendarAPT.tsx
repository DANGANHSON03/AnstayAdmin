import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

// Danh sách phòng
const ROOMS = [
  { id: "B516", name: "Phòng B516" },
  { id: "B517", name: "Phòng B517" },
  { id: "B518", name: "Phòng B518" },
];

// Danh sách nguồn OTA
const OTA_SOURCES = [
  { value: "website", label: "Website" },
  { value: "booking", label: "Booking.com" },
  { value: "agoda", label: "Agoda" },
  { value: "airbnb", label: "Airbnb" },
];

// Fake data nhiều booking, nhiều phòng, đủ các OTA
const FAKE_DB = [
  {
    id: "1",
    title: "Đã đặt",
    start: "2024-06-03",
    roomId: "B516",
    bookedBy: "Nguyễn Văn A",
    ota: "booking",
  },
  {
    id: "2",
    title: "Đã đặt",
    start: "2024-06-05",
    roomId: "B516",
    bookedBy: "Lê Văn B",
    ota: "website",
  },
  {
    id: "3",
    title: "Đã đặt",
    start: "2024-06-07",
    roomId: "B516",
    bookedBy: "Trần Thị C",
    ota: "agoda",
  },
  {
    id: "4",
    title: "Đã đặt",
    start: "2024-06-10",
    roomId: "B517",
    bookedBy: "Phạm Văn D",
    ota: "booking",
  },
  {
    id: "5",
    title: "Đã đặt",
    start: "2024-06-15",
    roomId: "B518",
    bookedBy: "Hoàng Thị E",
    ota: "airbnb",
  },
  {
    id: "6",
    title: "Đã đặt",
    start: "2024-06-18",
    roomId: "B517",
    bookedBy: "Lương Văn F",
    ota: "agoda",
  },
  {
    id: "7",
    title: "Đã đặt",
    start: "2024-06-22",
    roomId: "B518",
    bookedBy: "Vũ Minh G",
    ota: "website",
  },
  {
    id: "8",
    title: "Đã đặt",
    start: "2024-06-25",
    roomId: "B516",
    bookedBy: "Phan Thị H",
    ota: "airbnb",
  },
];

// Lấy chuỗi tháng yyyy-mm
function getMonthString(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

// Giả lập "API" lấy danh sách ngày đã book cho phòng và tháng
function fetchBookings(roomId: string, month: string) {
  return FAKE_DB.filter(
    (b) => b.roomId === roomId && b.start.startsWith(month)
  );
}

// Helper lấy array các ngày trong khoảng [start, end) (ISO date string)
function getDateRange(start: string, end: string) {
  const arr = [];
  let current = new Date(start);
  const stop = new Date(end);
  while (current < stop) {
    arr.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return arr;
}

const CalendarAPT: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState("B516");
  const [events, setEvents] = useState<any[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedRange, setSelectedRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    getMonthString(new Date())
  );
  const [selectedOta, setSelectedOta] = useState(OTA_SOURCES[0].value);
  const [modalMode, setModalMode] = useState<"booking" | "info" | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Khi chọn phòng/tháng -> "call API" lấy booking
  useEffect(() => {
    const bookings = fetchBookings(selectedRoomId, selectedMonth);
    setEvents(bookings);
  }, [selectedRoomId, selectedMonth]);

  // Check ngày đã đặt hoặc đã qua
  const isDateDisabled = (dateStr: string) => {
    const isBooked = events.some((ev) => ev.start === dateStr);
    const today = new Date();
    const target = new Date(dateStr);
    const isPast = target < new Date(today.setHours(0, 0, 0, 0));
    return isBooked || isPast;
  };

  // Khi kéo chọn range ngày
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const dates = getDateRange(selectInfo.startStr, selectInfo.endStr);
    if (dates.some(isDateDisabled)) {
      alert("Khoảng ngày này có ngày đã đặt hoặc đã qua!");
      return;
    }
    setSelectedRange({ start: selectInfo.startStr, end: selectInfo.endStr });
    setSelectedOta(OTA_SOURCES[0].value);
    setModalMode("booking");
    setSelectedBooking(null);
    openModal();
  };

  // Khi click vào event đã đặt, show info
  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedBooking(clickInfo.event.extendedProps);
    setModalMode("info");
    setSelectedRange(null);
    openModal();
  };

  // Render event bị mờ
  const renderEventContent = (eventInfo: any) => (
    <div
      className="p-1 rounded flex items-center opacity-50 cursor-pointer"
      title={`Đã đặt bởi: ${eventInfo.event.extendedProps.bookedBy}`}
    >
      <span className="mr-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
      <span>{eventInfo.event.title}</span>
    </div>
  );

  // Khi chọn tháng, chuyển calendar về đúng tháng
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
    if (calendarRef.current) {
      (calendarRef.current as any).getApi().gotoDate(e.target.value + "-01");
    }
  };

  // Hiển thị range ngày đẹp hơn trong modal
  const formatRange = (range: { start: string; end: string } | null) => {
    if (!range) return "";
    const arr = getDateRange(range.start, range.end);
    if (arr.length === 1) return arr[0];
    return arr[0] + " đến " + arr[arr.length - 1];
  };

  // Lấy label OTA source
  const getOtaLabel = (otaValue: string) =>
    OTA_SOURCES.find((x) => x.value === otaValue)?.label || otaValue;

  return (
    <>
      <PageMeta title="Đặt lịch phòng" description="Lịch đặt từng phòng" />
      <div className="mb-4 flex items-center gap-2">
        <span className="font-semibold">Chọn phòng:</span>
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {ROOMS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <input
          type="month"
          className="border rounded px-2 py-1 text-sm ml-2"
          value={selectedMonth}
          onChange={handleMonthChange}
        />
      </div>
      <div className="bg-white rounded-xl shadow border p-2">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "",
          }}
          events={events.map((ev) => ({
            id: ev.id,
            title: ev.title,
            start: ev.start,
            extendedProps: {
              bookedBy: ev.bookedBy,
              ota: ev.ota,
              date: ev.start,
              roomId: ev.roomId,
            },
            allDay: true,
          }))}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          dayCellClassNames={(arg) => {
            if (arg.isOther) return [];
            if (isDateDisabled(arg.date.toISOString().split("T")[0]))
              return [
                "opacity-40",
                "pointer-events-none",
                "cursor-not-allowed",
              ];
            return [];
          }}
        />
      </div>
      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="p-8 w-full max-w-md mx-auto flex flex-col items-center bg-white rounded-xl shadow-lg">
          {modalMode === "info" && selectedBooking && (
            <>
              <div className="mb-4 flex items-center">
                <span className="inline-block bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                  {/* Icon phòng */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#2563eb"
                      d="M7 10V8a5 5 0 1 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1zm2-2a3 3 0 0 1 6 0v2H9V8zm-3 4v7h12v-7H6z"
                    />
                  </svg>
                </span>
                <h2 className="font-bold text-2xl text-gray-800">
                  Thông tin booking
                </h2>
              </div>
              <div className="w-full mb-3">
                <div className="mb-1 text-gray-600">
                  <span className="font-semibold">Phòng:</span>{" "}
                  {selectedBooking.roomId}
                </div>
                <div className="mb-1 text-gray-600">
                  <span className="font-semibold">Ngày:</span>{" "}
                  {selectedBooking.date}
                </div>
                <div className="mb-1 text-gray-600">
                  <span className="font-semibold">Khách:</span>{" "}
                  {selectedBooking.bookedBy}
                </div>
                <div className="mb-1 text-gray-600">
                  <span className="font-semibold">Kênh đặt phòng:</span>{" "}
                  {getOtaLabel(selectedBooking.ota)}
                </div>
              </div>
              <button
                className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition"
                onClick={closeModal}
              >
                Đóng
              </button>
            </>
          )}
          {modalMode === "booking" && (
            <>
              <div className="flex items-center mb-4">
                <span className="inline-block bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                  {/* Icon phòng */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#2563eb"
                      d="M7 10V8a5 5 0 1 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1zm2-2a3 3 0 0 1 6 0v2H9V8zm-3 4v7h12v-7H6z"
                    />
                  </svg>
                </span>
                <h2 className="font-bold text-2xl text-gray-800">
                  Đặt phòng{" "}
                  <span className="text-blue-600">{selectedRoomId}</span>
                </h2>
              </div>
              <div className="flex items-center mb-6 w-full">
                <span className="inline-block bg-gray-100 text-gray-500 rounded-full p-2 mr-3">
                  {/* Icon lịch */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.667 2.5V4.167M13.333 2.5V4.167M2.5 7.5H17.5M4.167 5A1.667 1.667 0 0 0 2.5 6.667v8.333A1.667 1.667 0 0 0 4.167 16.667h11.666A1.667 1.667 0 0 0 17.5 15V6.667A1.667 1.667 0 0 0 15.833 5H4.167ZM10 10.833v2.5M7.5 10.833v2.5m5-2.5v2.5"
                    />
                  </svg>
                </span>
                <div>
                  <div className="text-gray-500 text-sm font-semibold mb-1">
                    Khoảng ngày:
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formatRange(selectedRange)}
                  </div>
                </div>
              </div>
              <div className="w-full mb-6">
                <label className="block mb-2 font-medium text-gray-600">
                  Đặt qua kênh OTA nào?
                </label>
                <select
                  value={selectedOta}
                  onChange={(e) => setSelectedOta(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-full text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-400"
                >
                  {OTA_SOURCES.map((src) => (
                    <option key={src.value} value={src.value}>
                      {src.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition"
                onClick={() => {
                  alert(
                    `Đã đặt thành công!\n- Phòng: ${selectedRoomId}\n- Khoảng: ${formatRange(
                      selectedRange
                    )}\n- Qua: ${
                      OTA_SOURCES.find((x) => x.value === selectedOta)?.label
                    }`
                  );
                  closeModal();
                }}
              >
                Xác nhận đặt phòng
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default CalendarAPT;

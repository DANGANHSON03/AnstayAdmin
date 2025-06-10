import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

// Helper group dữ liệu từ API apartments/with-rooms để hiển thị dropdown 3 cấp
function groupByAreaAndApartment(data) {
  const areaMap = {};
  data.forEach((apartment) => {
    const areaLabel =
      apartment.area === "HA_NOI"
        ? "Hà Nội"
        : apartment.area === "HA_LONG"
        ? "Hạ Long"
        : apartment.area;
    if (!areaMap[areaLabel]) areaMap[areaLabel] = [];
    areaMap[areaLabel].push({
      apartmentId: apartment.id,
      apartmentName: apartment.name,
      rooms: apartment.rooms,
    });
  });
  return Object.entries(areaMap).map(([area, apartments]) => ({
    area,
    apartments,
  }));
}

// DỮ LIỆU NGUỒN OTA
const OTA_SOURCES = [
  { value: "website", label: "Website" },
  { value: "booking", label: "Booking.com" },
  { value: "agoda", label: "Agoda" },
  { value: "airbnb", label: "Airbnb" },
];

// Helper: Lấy tháng yyyy-mm
function getMonthString(date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

// Helper: Lấy array các ngày từ start đến trước end (chuẩn khách sạn)
function getDateRange(start, end) {
  const arr = [];
  let current = new Date(start);
  const stop = new Date(end);
  while (current < stop) {
    arr.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  // Nếu checkIn = checkOut thì vẫn block đúng 1 ngày
  if (arr.length === 0 && start === end) arr.push(start);
  return arr;
}

// ====================== COMPONENT CHỌN 3 CẤP ==========================
function RoomSelect({
  areaGroups,
  selectedArea,
  setSelectedArea,
  selectedApartmentId,
  setSelectedApartmentId,
  selectedRoomId,
  setSelectedRoomId,
}) {
  const apartments =
    areaGroups.find((a) => a.area === selectedArea)?.apartments || [];
  const rooms =
    apartments.find(
      (ap) => String(ap.apartmentId) === String(selectedApartmentId)
    )?.rooms || [];

  const handleAreaChange = (e) => {
    const area = e.target.value;
    const firstApartment = areaGroups.find((a) => a.area === area)
      ?.apartments[0];
    setSelectedArea(area);
    setSelectedApartmentId(firstApartment?.apartmentId?.toString() || "");
    setSelectedRoomId(firstApartment?.rooms[0]?.id?.toString() || "");
  };

  const handleApartmentChange = (e) => {
    const apartmentId = e.target.value;
    const firstRoom = apartments.find(
      (ap) => String(ap.apartmentId) === String(apartmentId)
    )?.rooms[0];
    setSelectedApartmentId(apartmentId);
    setSelectedRoomId(firstRoom?.id?.toString() || "");
  };

  const handleRoomChange = (e) => {
    setSelectedRoomId(e.target.value);
  };

  return (
    <div className="flex gap-2 items-center">
      <select
        value={selectedArea}
        onChange={handleAreaChange}
        className="border rounded px-2 py-1"
      >
        {areaGroups.map((a) => (
          <option key={a.area} value={a.area}>
            {a.area}
          </option>
        ))}
      </select>
      <select
        value={selectedApartmentId}
        onChange={handleApartmentChange}
        className="border rounded px-2 py-1"
      >
        {apartments.map((ap) => (
          <option key={ap.apartmentId} value={ap.apartmentId}>
            {ap.apartmentName}
          </option>
        ))}
      </select>
      <select
        value={selectedRoomId}
        onChange={handleRoomChange}
        className="border rounded px-2 py-1"
      >
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ====================== MAIN COMPONENT ==========================
const CalendarAPT = () => {
  const [areaGroups, setAreaGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsByArea, setBookingsByArea] = useState({});
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [events, setEvents] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]); // danh sách ngày đã book
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    getMonthString(new Date())
  );
  const [selectedOta, setSelectedOta] = useState(OTA_SOURCES[0].value);
  const [modalMode, setModalMode] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const calendarRef = useRef(null);

  // ALL_ROOMS dùng để lấy tên phòng/căn hộ/khu vực từ id
  const ALL_ROOMS = areaGroups.flatMap((area) =>
    area.apartments.flatMap((ap) =>
      ap.rooms.map((r) => ({
        ...r,
        area: area.area,
        apartmentId: ap.apartmentId,
        apartmentName: ap.apartmentName,
      }))
    )
  );

  // Lấy tên căn hộ theo id
  const getApartmentNameById = (apartmentId) =>
    areaGroups
      .flatMap((area) => area.apartments)
      .find((ap) => String(ap.apartmentId) === String(apartmentId))
      ?.apartmentName || apartmentId;

  // Lấy tên phòng theo id
  const getRoomNameById = (roomId) =>
    ALL_ROOMS.find((r) => String(r.id) === String(roomId))?.name || roomId;

  // Lấy tên khu vực theo id phòng
  const getAreaNameByRoomId = (roomId) =>
    ALL_ROOMS.find((r) => String(r.id) === String(roomId))?.area || "";

  useEffect(() => {
    fetch("https://anstay.com.vn/api/apartments/with-rooms")
      .then((res) => res.json())
      .then((data) => {
        const grouped = groupByAreaAndApartment(data);
        setAreaGroups(grouped);
        setLoading(false);
        if (grouped.length > 0) {
          setSelectedArea(grouped[0].area);
          setSelectedApartmentId(
            grouped[0].apartments[0]?.apartmentId?.toString() || ""
          );
          setSelectedRoomId(
            grouped[0].apartments[0]?.rooms[0]?.id?.toString() || ""
          );
        }
      });
  }, []);

  useEffect(() => {
    fetch("https://anstay.com.vn/api/apartment-bookings/by-area")
      .then((res) => res.json())
      .then((data) => {
        setBookingsByArea(data);
      });
  }, []);

  function getRoomBookings(selectedArea, selectedApartmentId, selectedRoomId) {
    const bookingsInArea = bookingsByArea[selectedArea] || [];
    return bookingsInArea.filter(
      (b) =>
        String(b.apartmentId) === String(selectedApartmentId) &&
        String(b.roomId) === String(selectedRoomId)
    );
  }

  useEffect(() => {
    if (!selectedArea || !selectedApartmentId || !selectedRoomId) return;
    const bookings = getRoomBookings(
      selectedArea,
      selectedApartmentId,
      selectedRoomId
    );
    // Lấy các ngày đã book (từ checkIn đến trước checkOut)
    let blocked = [];
    bookings.forEach((b) => {
      blocked = blocked.concat(getDateRange(b.checkIn, b.checkOut));
    });
    setDisabledDates(blocked);
    setEvents(
      bookings.map((b) => ({
        id: b.id,
        title: "Đã đặt",
        start: b.checkIn,
        end: b.checkOut,
        extendedProps: {
          bookedBy: b.guestName,
          ota: "website",
          date: b.checkIn,
          roomId: b.roomId,
        },
        allDay: true,
      }))
    );
  }, [selectedArea, selectedApartmentId, selectedRoomId, bookingsByArea]);

  // Chặn ngày đã book hoặc đã qua hôm nay
  const isDateDisabled = (dateStr) => {
    const isBlocked = disabledDates.includes(dateStr);
    const today = new Date();
    const target = new Date(dateStr);
    const isPast = target < new Date(today.setHours(0, 0, 0, 0));
    return isBlocked || isPast;
  };

  // Không cho phép chọn range có ngày disable
  const selectAllow = (selectInfo) => {
    const dates = getDateRange(selectInfo.startStr, selectInfo.endStr);
    return !dates.some(isDateDisabled);
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedRange({ start: selectInfo.startStr, end: selectInfo.endStr });
    setSelectedOta(OTA_SOURCES[0].value);
    setModalMode("booking");
    setSelectedBooking(null);
    openModal();
  };

  const handleEventClick = (clickInfo) => {
    setSelectedBooking(clickInfo.event.extendedProps);
    setModalMode("info");
    setSelectedRange(null);
    openModal();
  };

  const renderEventContent = (eventInfo) => (
    <div
      className="p-1 rounded flex items-center opacity-50 cursor-pointer"
      title={`Đã đặt bởi: ${eventInfo.event.extendedProps.bookedBy}`}
    >
      <span className="mr-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
      <span>{eventInfo.event.title}</span>
    </div>
  );

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(e.target.value + "-01");
    }
  };

  const formatRange = (range) => {
    if (!range) return "";
    const arr = getDateRange(range.start, range.end);
    if (arr.length === 1) return arr[0];
    return arr[0] + " đến " + arr[arr.length - 1];
  };

  const getOtaLabel = (otaValue) =>
    OTA_SOURCES.find((x) => x.value === otaValue)?.label || otaValue;

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <PageMeta title="Đặt lịch phòng" description="Lịch đặt từng phòng" />
      <div className="mb-4 flex items-center gap-2">
        <span className="font-semibold">Chọn phòng:</span>
        <RoomSelect
          areaGroups={areaGroups}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          selectedApartmentId={selectedApartmentId}
          setSelectedApartmentId={setSelectedApartmentId}
          selectedRoomId={selectedRoomId}
          setSelectedRoomId={setSelectedRoomId}
        />
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
          events={events}
          selectable={true}
          selectMirror={true}
          selectAllow={selectAllow}
          select={handleDateSelect}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          dayCellClassNames={(arg) => {
            if (arg.isOther) return [];
            const dateStr = arg.date.toISOString().split("T")[0];
            if (isDateDisabled(dateStr))
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
                  <span className="font-semibold">Khu vực:</span>{" "}
                  {getAreaNameByRoomId(selectedBooking.roomId)}
                </div>
                <div className="mb-1 text-gray-600">
                  <span className="font-semibold">Căn hộ:</span>{" "}
                  {getApartmentNameById(selectedApartmentId)}
                </div>
                <div className="mb-1 text-gray-600">
                  <span className="font-semibold">Phòng:</span>{" "}
                  {getRoomNameById(selectedBooking.roomId)}
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
                  <span className="text-blue-600">
                    {getRoomNameById(selectedRoomId)}
                  </span>
                </h2>
              </div>
              <div className="flex items-center mb-6 w-full">
                <span className="inline-block bg-gray-100 text-gray-500 rounded-full p-2 mr-3">
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
                    `Đã đặt thành công!\n- Khu vực: ${getAreaNameByRoomId(
                      selectedRoomId
                    )}\n- Căn hộ: ${getApartmentNameById(
                      selectedApartmentId
                    )}\n- Phòng: ${getRoomNameById(
                      selectedRoomId
                    )}\n- Khoảng: ${formatRange(selectedRange)}\n- Qua: ${
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

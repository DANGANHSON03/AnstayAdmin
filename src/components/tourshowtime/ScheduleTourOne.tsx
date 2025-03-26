import {
  TrashIcon,
  PlusIcon,
  PencilIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface TimeDetail {
  id: number;
  timeSlot: string;
  description: string;
}

interface Schedule {
  id: number;
  tourId: number;
  dayNumber: number;
  title: string;
  details: TimeDetail[];
}

interface Tour {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  discountPercent: number;
  createdAt: string;
  schedules: Schedule[];
}

export default function ScheduleTourOne() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    maxParticipants: 10,
    price: 0,
  });
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryDay[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [editingDetail, setEditingDetail] = useState<TimeDetail | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch("http://localhost:8085/api/tours");
        const data = await response.json();
        setTours(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };
    fetchTours();
  }, []);

  const handleOpenScheduleModal = (tourId: number) => {
    setSelectedTourId(tourId);
    setIsModalOpen(true);
  };

  const handleAddDay = () => {
    setCurrentItinerary((prev) => [
      ...prev,
      {
        day: prev.length + 1,
        title: `NGÀY ${prev.length + 1}`,
        activities: [],
      },
    ]);
  };

  const handleAddActivity = (dayIndex: number) => {
    setCurrentItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].activities.push({
        time: "",
        description: "",
      });
      return newItinerary;
    });
  };

  const handleActivityChange = (
    dayIndex: number,
    activityIndex: number,
    field: "time" | "description",
    value: string
  ) => {
    setCurrentItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].activities[activityIndex][field] = value;
      return newItinerary;
    });
  };

  const handleScheduleSubmit = () => {
    if (!selectedTourId || !currentItinerary.length) return;

    const newSchedule: Schedule = {
      id: Math.random(), // Simulate new ID
      tourId: selectedTourId,
      dayNumber: currentItinerary.length,
      title: `NGÀY ${currentItinerary.length}`,
      details: currentItinerary.flatMap((day) =>
        day.activities.map((activity) => ({
          id: Math.random(), // Simulate new ID
          timeSlot: activity.time,
          description: activity.description,
        }))
      ),
    };

    setTours((prev) =>
      prev.map((tour) => {
        if (tour.id === selectedTourId) {
          return {
            ...tour,
            schedules: [...tour.schedules, newSchedule],
          };
        }
        return tour;
      })
    );

    setIsModalOpen(false);
    setCurrentItinerary([]);
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    setTours((prev) =>
      prev.map((tour) => ({
        ...tour,
        schedules: tour.schedules.filter((s) => s.id !== scheduleId),
      }))
    );
  };

  const handleViewDetails = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailsModal(true);
  };

  const handleEditDetail = (detail: TimeDetail) => {
    setEditingDetail(detail);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingDetail || !selectedTour) return;

    setTours((prev) =>
      prev.map((tour) => {
        if (tour.id === selectedTour.id) {
          return {
            ...tour,
            schedules: tour.schedules.map((schedule) => ({
              ...schedule,
              details: schedule.details.map((detail) =>
                detail.id === editingDetail.id ? editingDetail : detail
              ),
            })),
          };
        }
        return tour;
      })
    );

    setIsEditModalOpen(false);
    setEditingDetail(null);
  };

  const handleDeleteDetail = (detailId: number) => {
    if (!selectedTour) return;

    setTours((prev) =>
      prev.map((tour) => {
        if (tour.id === selectedTour.id) {
          return {
            ...tour,
            schedules: tour.schedules.map((schedule) => ({
              ...schedule,
              details: schedule.details.filter(
                (detail) => detail.id !== detailId
              ),
            })),
          };
        }
        return tour;
      })
    );
    setOpenMenuId(null);
  };

  return (
    <div className="flex gap-4 p-4">
      {/* Left side - Tours list */}
      <div className="w-1/3 space-y-4">
        {tours.map((tour, index) => (
          <div
            key={tour.id}
            className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-colors
              ${
                selectedTour?.id === tour.id
                  ? "ring-2 ring-blue-500"
                  : "hover:bg-gray-50"
              }`}
            onClick={() => setSelectedTour(tour)}
          >
            <h2 className="text-lg font-semibold">
              #{index + 1} - {tour.name}
            </h2>
            <div className="mt-2 text-sm text-gray-500">
              {tour.schedules.length} lịch trình
            </div>
          </div>
        ))}
      </div>

      {/* Right side - Schedule details */}
      <div className="w-2/3 bg-white rounded-lg shadow-sm p-6">
        {selectedTour ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{selectedTour.name}</h2>
              <button
                onClick={() => handleOpenScheduleModal(selectedTour.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Thêm lịch trình</span>
              </button>
            </div>

            <div className="space-y-6">
              {selectedTour.schedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{schedule.title}</h3>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {schedule.details.map((detail) => (
                      <div
                        key={detail.id}
                        className="flex items-start gap-4 group"
                      >
                        <div className="w-24 font-medium">
                          {detail.timeSlot.substring(0, 5)}
                        </div>
                        <div className="flex-1">{detail.description}</div>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === detail.id ? null : detail.id
                              )
                            }
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                          </button>

                          {openMenuId === detail.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg py-1 z-10">
                              <button
                                onClick={() => {
                                  handleEditDetail(detail);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50"
                              >
                                <PencilIcon className="w-4 h-4" />
                                <span>Sửa</span>
                              </button>
                              <button
                                onClick={() => handleDeleteDetail(detail.id)}
                                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-red-600"
                              >
                                <TrashIcon className="w-4 h-4" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-12">
            Chọn một tour để xem chi tiết lịch trình
          </div>
        )}
      </div>

      {/* Keep the add schedule modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm lịch trình mới
            </Dialog.Title>

            <div className="space-y-4">
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Chi tiết lịch trình</h3>
                  <button
                    onClick={handleAddDay}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg"
                  >
                    Thêm ngày
                  </button>
                </div>

                {currentItinerary.map((day, dayIndex) => (
                  <div key={dayIndex} className="mb-6 border p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{day.title}</h4>
                      <button
                        onClick={() => handleAddActivity(dayIndex)}
                        className="text-blue-500"
                      >
                        Thêm hoạt động
                      </button>
                    </div>

                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex gap-4 mb-2">
                        <input
                          type="time"
                          className="w-32 border rounded"
                          value={activity.time}
                          onChange={(e) =>
                            handleActivityChange(
                              dayIndex,
                              activityIndex,
                              "time",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="text"
                          className="flex-1 border rounded px-2"
                          placeholder="Mô tả hoạt động"
                          value={activity.description}
                          onChange={(e) =>
                            handleActivityChange(
                              dayIndex,
                              activityIndex,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Lưu
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Thêm modal sửa thông tin */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-xl p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Sửa thông tin chi tiết
            </Dialog.Title>

            {editingDetail && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded-md p-2"
                    value={editingDetail.timeSlot.substring(0, 5)}
                    onChange={(e) =>
                      setEditingDetail({
                        ...editingDetail,
                        timeSlot: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    className="w-full border rounded-md p-2"
                    rows={3}
                    value={editingDetail.description}
                    onChange={(e) =>
                      setEditingDetail({
                        ...editingDetail,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

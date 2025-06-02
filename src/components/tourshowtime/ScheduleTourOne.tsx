import {
  TrashIcon,
  PlusIcon,
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

interface ItineraryDay {
  id?: number; // Add schedule id
  day: number;
  title: string;
  activities: {
    time: string;
    description: string;
  }[];
}

interface NewDayForm {
  dayNumber: number;
  title: string;
}

// Update DeleteConfirmation interface
interface DeleteConfirmation {
  isOpen: boolean;
  scheduleId: number | null;
  detailId: number | null;
  type: "detail" | "schedule" | null;
}

interface EditingDetail {
  scheduleId: number;
  detailId: number;
  timeSlot: string;
  description: string;
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
  const [editingDayTitle, setEditingDayTitle] = useState<{
    dayIndex: number;
    value: string;
  } | null>(null);
  const [isNewDayModalOpen, setIsNewDayModalOpen] = useState(false);
  const [newDayForm, setNewDayForm] = useState<NewDayForm>({
    dayNumber: 1,
    title: "",
  });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<{
    dayIndex: number;
    title: string;
  } | null>(null);
  // Update initial state
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      scheduleId: null,
      detailId: null,
      type: null,
    });
  const [editingDetail, setEditingDetail] = useState<EditingDetail | null>(
    null
  );
  const [newActivity, setNewActivity] = useState({
    timeSlot: "",
    description: "",
  });

  // Add new state for managing activities per schedule
  const [newActivities, setNewActivities] = useState<{
    [key: number]: { timeSlot: string; description: string };
  }>({});

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch("https://anstay.com.vn/api/tours");
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
    const tour = tours.find((t) => t.id === tourId);

    if (tour && tour.schedules.length > 0) {
      const existingItinerary = tour.schedules.map((schedule) => ({
        id: schedule.id, // Include the schedule id
        day: schedule.dayNumber,
        title: schedule.title,
        activities: schedule.details.map((detail) => ({
          time: detail.timeSlot,
          description: detail.description,
        })),
      }));
      setCurrentItinerary(existingItinerary);
    } else {
      setCurrentItinerary([]);
    }
    setIsModalOpen(true);
  };

  const handleAddDay = () => {
    if (selectedTour) {
      setNewDayForm({
        dayNumber: currentItinerary.length + 1,
        title: "",
      });
      setIsNewDayModalOpen(true);
    }
  };

  const fetchAllTours = async () => {
    try {
      const response = await fetch("https://anstay.com.vn/api/tours");
      const data = await response.json();
      setTours(Array.isArray(data) ? data : [data]);

      // Update selectedTour with fresh data
      if (selectedTour) {
        const updatedSelectedTour = data.find(
          (t: Tour) => t.id === selectedTour.id
        );
        if (updatedSelectedTour) {
          setSelectedTour(updatedSelectedTour);
        }
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  const handleNewDaySubmit = async () => {
    if (!newDayForm.title || !selectedTour) return;

    try {
      const response = await fetch("https://anstay.com.vn/api/tour-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tourId: selectedTour.id,
          dayNumber: newDayForm.dayNumber,
          title: newDayForm.title,
        }),
      });

      if (response.ok) {
        const newSchedule = await response.json();

        // Add to currentItinerary
        setCurrentItinerary((prev) => [
          ...prev,
          {
            day: newSchedule.dayNumber,
            title: newSchedule.title,
            activities: [],
          },
        ]);

        // Create new schedule object with empty details array
        const scheduleToAdd = {
          ...newSchedule,
          details: [],
        };

        // Update selectedTour with new schedule
        const updatedTour = {
          ...selectedTour,
          schedules: [...selectedTour.schedules, scheduleToAdd],
        };

        // Update states
        setTours((prev) =>
          prev.map((tour) => (tour.id === selectedTour.id ? updatedTour : tour))
        );
        setSelectedTour(updatedTour);

        // Close modal and reset form
        setIsNewDayModalOpen(false);
        setNewDayForm({
          dayNumber: 1,
          title: "",
        });
      }
    } catch (error) {
      console.error("Error adding new day schedule:", error);
    }
  };

  const handleDayTitleSubmit = (dayIndex: number) => {
    if (!editingDayTitle || editingDayTitle.value.trim() === "") return;

    setCurrentItinerary((prev) => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].title = editingDayTitle.value;
      return newItinerary;
    });
    setEditingDayTitle(null);
  };

  const handleScheduleSubmit = () => {
    if (!selectedTourId || !currentItinerary.length) return;

    // Update tour schedules, replacing existing ones
    setTours((prev) =>
      prev.map((tour) => {
        if (tour.id === selectedTourId) {
          const newSchedules = currentItinerary.map((day) => ({
            id: Math.random(), // You might want to handle IDs differently
            tourId: selectedTourId,
            dayNumber: day.day,
            title: day.title,
            details: day.activities.map((activity) => ({
              id: Math.random(), // You might want to handle IDs differently
              timeSlot: activity.time,
              description: activity.description,
            })),
          }));
          return {
            ...tour,
            schedules: newSchedules,
          };
        }
        return tour;
      })
    );

    setIsModalOpen(false);
    setCurrentItinerary([]);
  };

  // Replace handleDeleteSchedule function
  const handleDeleteSchedule = async (scheduleId: number) => {
    setDeleteConfirmation({
      isOpen: true,
      scheduleId: scheduleId,
      detailId: null,
      type: "schedule",
    });
  };

  const handleViewDetails = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailsModal(true);
  };

  const handleDeleteDetail = async (scheduleId: number, detailId: number) => {
    try {
      const response = await fetch(
        `https://anstay.com.vn/api/tour-schedule-details/${detailId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (selectedTour) {
          const updatedSchedules = selectedTour.schedules.map((schedule) => {
            if (schedule.id === scheduleId) {
              return {
                ...schedule,
                details: schedule.details.filter(
                  (detail) => detail.id !== detailId
                ),
              };
            }
            return schedule;
          });

          const updatedTour = { ...selectedTour, schedules: updatedSchedules };
          setSelectedTour(updatedTour);
          setTours((prev) =>
            prev.map((tour) =>
              tour.id === selectedTour.id ? updatedTour : tour
            )
          );
        }
      }
    } catch (error) {
      console.error("Error deleting detail:", error);
    }
  };

  // Add new function to handle delete confirmation
  const handleConfirmDelete = async () => {
    try {
      if (
        deleteConfirmation.type === "schedule" &&
        deleteConfirmation.scheduleId
      ) {
        const response = await fetch(
          `https://anstay.com.vn/api/tour-schedules/${deleteConfirmation.scheduleId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          // Update UI by removing the deleted schedule
          setSelectedTour((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              schedules: prev.schedules.filter(
                (s) => s.id !== deleteConfirmation.scheduleId
              ),
            };
          });

          // Update tours list
          setTours((prev) =>
            prev.map((tour) => {
              if (tour.id === selectedTour?.id) {
                return {
                  ...tour,
                  schedules: tour.schedules.filter(
                    (s) => s.id !== deleteConfirmation.scheduleId
                  ),
                };
              }
              return tour;
            })
          );
        }
      } else if (deleteConfirmation.type === "detail") {
        await handleDeleteDetail(
          deleteConfirmation.scheduleId!,
          deleteConfirmation.detailId!
        );
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        scheduleId: null,
        detailId: null,
        type: null,
      });
    }
  };

  const handleUpdateDayTitle = async (dayIndex: number, newTitle: string) => {
    if (!selectedTour) return;

    const scheduleToUpdate = selectedTour.schedules.find(
      (s) => s.dayNumber === currentItinerary[dayIndex].day
    );

    if (!scheduleToUpdate) {
      console.error("Schedule not found");
      return;
    }

    try {
      const response = await fetch(
        `https://anstay.com.vn/api/tour-schedules/${scheduleToUpdate.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...scheduleToUpdate, // Keep all existing data
            title: newTitle, // Only update the title
          }),
        }
      );

      if (response.ok) {
        setCurrentItinerary((prev) => {
          const updated = [...prev];
          updated[dayIndex].title = newTitle;
          return updated;
        });

        setSelectedTour((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            schedules: prev.schedules.map((s) =>
              s.id === scheduleToUpdate.id ? { ...s, title: newTitle } : s
            ),
          };
        });
      }
    } catch (error) {
      console.error("Error updating title:", error);
    }
    setEditingTitle(null);
  };

  const handleEditDetail = async () => {
    if (!editingDetail || !selectedTour) return;

    const requestData = {
      schedule_id: editingDetail.scheduleId,
      timeSlot: editingDetail.timeSlot, // Changed timeSlot to time_slot
      description: editingDetail.description,
    };

    try {
      const response = await fetch(
        `https://anstay.com.vn/api/tour-schedule-details/update/${editingDetail.detailId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        // Update UI
        const updatedSchedules = selectedTour.schedules.map((schedule) => {
          if (schedule.id === editingDetail.scheduleId) {
            return {
              ...schedule,
              details: schedule.details.map((detail) =>
                detail.id === editingDetail.detailId
                  ? {
                      ...detail,
                      timeSlot: editingDetail.timeSlot,
                      description: editingDetail.description,
                    }
                  : detail
              ),
            };
          }
          return schedule;
        });

        setSelectedTour({
          ...selectedTour,
          schedules: updatedSchedules,
        });

        setEditingDetail(null);
        setOpenMenuId(null);
      }
    } catch (error) {
      console.error("Error updating detail:", error);
    }
  };

  // Replace handleAddActivity function
  const handleAddActivity = async (scheduleId: number) => {
    const activity = newActivities[scheduleId];
    if (!activity) return;

    const requestData = {
      timeSlot: activity.timeSlot,
      description: activity.description,
      schedule_id: scheduleId,
    };

    try {
      const response = await fetch(
        "https://anstay.com.vn/api/tour-schedule-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        const savedActivity = await response.json();

        // Update currentItinerary immediately
        setCurrentItinerary((prev) =>
          prev.map((day) => {
            if (day.id === scheduleId) {
              return {
                ...day,
                activities: [
                  ...day.activities,
                  {
                    time: savedActivity.timeSlot,
                    description: savedActivity.description,
                  },
                ],
              };
            }
            return day;
          })
        );

        // Reset form for this schedule
        setNewActivities((prev) => ({
          ...prev,
          [scheduleId]: { timeSlot: "", description: "" },
        }));
      }
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  // Add this helper function
  const formatTimeForInput = (timeSlot: string) => {
    if (!timeSlot) return { hours: "00", minutes: "00" };
    const [hours, minutes] = timeSlot.split(":");
    return { hours: hours || "00", minutes: minutes || "00" };
  };

  const handleTimeChange = (
    scheduleId: number,
    hours: string,
    minutes: string
  ) => {
    const timeSlot = `${hours}:${minutes}`;
    setNewActivities((prev) => ({
      ...prev,
      [scheduleId]: {
        ...(prev[scheduleId] || {}),
        timeSlot,
      },
    }));
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
                        className="flex items-start gap-4 relative"
                      >
                        {editingDetail?.detailId === detail.id ? (
                          // Edit mode
                          <>
                            <input
                              type="time"
                              className="w-32 border rounded"
                              value={editingDetail.timeSlot.substring(0, 5)}
                              onChange={(e) =>
                                setEditingDetail((prev) => ({
                                  ...prev!,
                                  timeSlot: e.target.value,
                                }))
                              }
                            />

                            <input
                              type="text"
                              className="flex-1 border rounded px-2"
                              value={editingDetail.description}
                              onChange={(e) =>
                                setEditingDetail((prev) => ({
                                  ...prev!,
                                  description: e.target.value,
                                }))
                              }
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleEditDetail}
                                className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => {
                                  setEditingDetail(null);
                                  setOpenMenuId(null);
                                }}
                                className="px-2 py-1 border rounded text-sm"
                              >
                                Hủy
                              </button>
                            </div>
                          </>
                        ) : (
                          // View mode
                          <>
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
                                className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                              >
                                <EllipsisVerticalIcon className="w-5 h-5" />
                              </button>

                              {openMenuId === detail.id && (
                                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        setEditingDetail({
                                          scheduleId: schedule.id,
                                          detailId: detail.id,
                                          timeSlot: detail.timeSlot,
                                          description: detail.description,
                                        });
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setDeleteConfirmation({
                                          isOpen: true,
                                          scheduleId: schedule.id,
                                          detailId: detail.id,
                                          type: "detail",
                                        });
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
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
          <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl p-6 max-h-[80vh] flex flex-col">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm lịch trình mới
            </Dialog.Title>

            <div className="space-y-4 overflow-y-auto flex-1">
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
                      {editingTitle?.dayIndex === dayIndex ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="border rounded px-2 py-1"
                            value={editingTitle.title}
                            onChange={(e) =>
                              setEditingTitle({
                                dayIndex,
                                title: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateDayTitle(
                                  dayIndex,
                                  editingTitle.title
                                );
                              }
                            }}
                          />
                          <button
                            onClick={() =>
                              handleUpdateDayTitle(dayIndex, editingTitle.title)
                            }
                            className="px-2 py-1 bg-green-500 text-white rounded"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingTitle(null)}
                            className="px-2 py-1 border rounded"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <h4
                          className="font-medium cursor-pointer hover:text-blue-600"
                          onClick={() =>
                            setEditingTitle({ dayIndex, title: day.title })
                          }
                        >
                          {day.title || `NGÀY ${day.day}`}
                        </h4>
                      )}
                      {/* <button
                        onClick={() => handleAddActivity(day.id || 0)}
                        className="text-blue-500"
                      >
                        Thêm hoạt động
                      </button> */}
                    </div>

                    {/* Update new activity form */}
                    <div className="flex gap-4 mb-4">
                      <div className="flex w-32 gap-1">
                        <select
                          className="w-16 border rounded px-1 py-1"
                          value={
                            formatTimeForInput(
                              newActivities[day.id || 0]?.timeSlot || ""
                            ).hours
                          }
                          onChange={(e) => {
                            const minutes = formatTimeForInput(
                              newActivities[day.id || 0]?.timeSlot || ""
                            ).minutes;
                            handleTimeChange(
                              day.id || 0,
                              e.target.value,
                              minutes
                            );
                          }}
                        >
                          {Array.from({ length: 24 }, (_, i) =>
                            i.toString().padStart(2, "0")
                          ).map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <span className="flex items-center">:</span>
                        <select
                          className="w-16 border rounded px-1 py-1"
                          value={
                            formatTimeForInput(
                              newActivities[day.id || 0]?.timeSlot || ""
                            ).minutes
                          }
                          onChange={(e) => {
                            const hours = formatTimeForInput(
                              newActivities[day.id || 0]?.timeSlot || ""
                            ).hours;
                            handleTimeChange(
                              day.id || 0,
                              hours,
                              e.target.value
                            );
                          }}
                        >
                          {Array.from({ length: 60 }, (_, i) =>
                            i.toString().padStart(2, "0")
                          ).map((minute) => (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        className="flex-1 border rounded px-2"
                        placeholder="Mô tả hoạt động"
                        value={newActivities[day.id || 0]?.description || ""}
                        onChange={(e) =>
                          setNewActivities((prev) => ({
                            ...prev,
                            [day.id || 0]: {
                              ...(prev[day.id || 0] || {}),
                              description: e.target.value,
                            },
                          }))
                        }
                      />
                      <button
                        onClick={() => {
                          if (day.id) {
                            handleAddActivity(day.id);
                          }
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        Thêm
                      </button>
                    </div>

                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex gap-4 mb-2">
                        {activity.time ? (
                          // Read-only view for existing activities
                          <div className="w-32 text-gray-600">
                            {activity.time}
                          </div>
                        ) : (
                          // Input for new activities
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
                        )}
                        {activity.description ? (
                          // Read-only view for existing activities
                          <div className="flex-1 text-gray-600">
                            {activity.description}
                          </div>
                        ) : (
                          // Input for new activities
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
                        )}
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

      {/* Add this new dialog before the closing div */}
      <Dialog
        open={isNewDayModalOpen}
        onClose={() => setIsNewDayModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-xl p-6 max-h-[80vh] flex flex-col">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm ngày mới
            </Dialog.Title>

            <div className="space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày thứ
                </label>
                <input
                  type="number"
                  className="w-full border rounded-md p-2 bg-gray-100 cursor-not-allowed"
                  value={newDayForm.dayNumber}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  value={newDayForm.title}
                  onChange={(e) =>
                    setNewDayForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsNewDayModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleNewDaySubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Update delete confirmation dialog */}
      <Dialog
        open={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            scheduleId: null,
            detailId: null,
            type: null,
          })
        }
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-4 max-w-sm w-full">
            <Dialog.Title className="text-lg font-medium mb-4">
              Xác nhận xóa
            </Dialog.Title>
            <p className="mb-4">
              {deleteConfirmation.type === "schedule"
                ? "Bạn có chắc chắn muốn xóa lịch trình này?"
                : "Bạn có chắc chắn muốn xóa chi tiết này?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setDeleteConfirmation({
                    isOpen: false,
                    scheduleId: null,
                    detailId: null,
                    type: null,
                  })
                }
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

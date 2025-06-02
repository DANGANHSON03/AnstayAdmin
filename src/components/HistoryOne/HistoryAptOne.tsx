import { Tab } from "@headlessui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { Pagination } from "antd";

// Update interfaces for booking history
interface Booking extends ApiBooking {
  apartmentName: string;
  customerName: string;
  email: string;
  phone: string;
  createdAt: string;
  userId: number; // Add these fields
  apartmentId: number; // to track IDs
}

interface ValidationErrors {
  checkIn?: string;
  checkOut?: string;
}

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

const statusOptions = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
];

// Mock data for bookings
const mockBookings = [
  {
    id: 1,
    apartmentName: "Căn hộ A-101",
    customerName: "Nguyễn Văn An",
    email: "annguyen@gmail.com",
    phone: "0912345678",
    checkIn: "2024-02-20",
    checkOut: "2024-02-25",
    status: "CONFIRMED",
    totalPrice: 5000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    apartmentName: "Căn hộ B-203",
    customerName: "Trần Thị Bình",
    email: "binhtt@gmail.com",
    phone: "0923456789",
    checkIn: "2024-02-22",
    checkOut: "2024-02-24",
    status: "PENDING",
    totalPrice: 3000000,
    createdAt: new Date().toISOString(),
  },
] as Booking[];

// Update interfaces
interface ApiBooking {
  id: number;
  userId: number;
  apartmentId: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
}

interface User {
  id: number;
  fullName: string; // Changed from name to fullName
  email: string;
  phone: string;
}

interface Apartment {
  id: number;
  name: string;
  // Add other apartment fields as needed
}

// Add API fetch functions
const fetchBookings = async (): Promise<ApiBooking[]> => {
  const response = await fetch("https://anstay.com.vn/api/apartment-bookings");
  return response.json();
};

const fetchUser = async (id: number): Promise<User> => {
  const response = await fetch(`https://anstay.com.vn/api/users/${id}`);
  return response.json();
};

const fetchApartment = async (id: number): Promise<Apartment> => {
  const response = await fetch(`https://anstay.com.vn/api/apartments/${id}`);
  return response.json();
};

const fetchBookingById = async (id: number): Promise<ApiBooking> => {
  const response = await fetch(
    `https://anstay.com.vn/api/apartment-bookings/${id}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch booking");
  }
  return response.json();
};

const updateBooking = async (
  id: number,
  data: Partial<ApiBooking>
): Promise<void> => {
  if (!id) {
    throw new Error("Booking ID is required");
  }

  // First fetch existing booking data
  const existingBooking = await fetchBookingById(id);

  // Merge existing data with only the status update
  const apiData = {
    ...existingBooking,
    status: data.status,
  };

  console.log("=== UPDATE BOOKING API CALL ===");
  console.log("Existing booking data:", existingBooking);
  console.log("New status:", data.status);
  console.log("Final update data:", apiData);

  const response = await fetch(
    `https://anstay.com.vn/api/apartment-bookings/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(`Failed to update booking: ${errorText}`);
  }

  console.log("Update successful!");
};

export default function HistoryAptOne() {
  console.log("Component CIF render");
  // Initialize with empty array
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    status: "PENDING",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!newBooking.checkIn?.trim()) {
      newErrors.checkIn = "Ngày check-in là bắt buộc";
    }

    if (!newBooking.checkOut?.trim()) {
      newErrors.checkOut = "Ngày check-out là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!isEditing || !newBooking.id) {
        throw new Error("Invalid booking ID");
      }

      // Only send status update
      const apiUpdateData = {
        id: newBooking.id,
        status: newBooking.status,
      };

      console.log("Sending status update:", apiUpdateData);
      await updateBooking(newBooking.id, apiUpdateData);

      // Update local state with new status only
      const updatedBookings = bookings.map((booking) =>
        booking.id === newBooking.id
          ? { ...booking, status: apiUpdateData.status }
          : booking
      );

      setBookings(updatedBookings);
      setIsModalOpen(false);
      setIsEditing(false);
      setNewBooking({ status: "PENDING" });
    } catch (error) {
      console.error("Error details:", error);
      alert("Cập nhật thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (booking: Booking) => {
    try {
      setLoading(true);
      console.log("Fetching booking:", booking.id);

      // Fetch current booking data directly from API
      const currentBooking = await fetchBookingById(booking.id);
      console.log("Fetched booking data:", currentBooking);

      // Set booking data immediately
      setNewBooking({
        id: currentBooking.id,
        userId: currentBooking.userId,
        apartmentId: currentBooking.apartmentId,
        checkIn: currentBooking.checkIn,
        checkOut: currentBooking.checkOut,
        totalPrice: currentBooking.totalPrice,
        status: currentBooking.status,
      });

      setIsEditing(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn đặt này?")) {
      try {
        // TODO: Replace with actual API call
        setBookings(bookings.filter((booking) => booking.id !== id));
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // Replace existing useEffect with this one
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const apiBookings = await fetchBookings();

        // Fetch user and apartment data for each booking
        const fullBookings = await Promise.all(
          apiBookings.map(async (booking) => {
            const [user, apartment] = await Promise.all([
              fetchUser(booking.userId),
              fetchApartment(booking.apartmentId),
            ]);

            return {
              id: booking.id,
              apartmentName: apartment.name,
              customerName: user.fullName, // Changed from name to fullName
              email: user.email,
              phone: user.phone,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              status: booking.status,
              totalPrice: booking.totalPrice,
              createdAt: new Date().toISOString(), // If createdAt is not in API response
            } as Booking;
          })
        );

        setBookings(fullBookings);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  // Xử lý lọc dữ liệu an toàn
  const filteredBookings = React.useMemo(() => {
    console.log("Filtering bookings:", bookings); // Debug log
    return (
      bookings?.filter(
        (booking) =>
          booking.customerName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.phone?.includes(searchQuery)
      ) || []
    );
  }, [bookings, searchQuery]);

  // Fix pagination calculations
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = Math.min(
    startIndex + pagination.pageSize,
    filteredBookings.length
  );
  const displayedBookings = filteredBookings.slice(startIndex, endIndex);

  // Fix update total effect
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredBookings.length,
    }));
  }, [filteredBookings.length]);

  // Reset form khi đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setErrors({});
    setNewBooking({
      status: "PENDING",
    });
  };

  // Add check for data display
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div>Loading...</div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return <div>No bookings found</div>;
  }

  // Sửa lại cách hiển thị table
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-white/[0.05]">
        <h2 className="text-lg font-semibold">Lịch sử đặt căn hộ</h2>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              type="text"
              placeholder="Tìm kiếm đơn đặt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                STT
              </th>
              <th scope="col" className="px-6 py-3">
                Căn hộ
              </th>
              <th scope="col" className="px-6 py-3">
                Khách hàng
              </th>
              <th scope="col" className="px-6 py-3">
                Liên hệ
              </th>
              <th scope="col" className="px-6 py-3">
                Check-in
              </th>
              <th scope="col" className="px-6 py-3">
                Check-out
              </th>
              <th scope="col" className="px-6 py-3">
                Tổng tiền
              </th>
              <th scope="col" className="px-6 py-3">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedBookings.map((booking, index) => (
              <tr
                key={booking.id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4">{startIndex + index + 1}</td>
                <td className="px-6 py-4">{booking.apartmentName}</td>
                <td className="px-6 py-4">{booking.customerName}</td>
                <td className="px-6 py-4">
                  <div>
                    <div>{booking.email}</div>
                    <div>{booking.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4">{booking.checkIn}</td>
                <td className="px-6 py-4">{booking.checkOut}</td>
                <td className="px-6 py-4">
                  {booking.totalPrice.toLocaleString("vi-VN")}đ
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      booking.status === "CONFIRMED"
                        ? "success"
                        : booking.status === "CANCELLED"
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {
                      statusOptions.find((s) => s.value === booking.status)
                        ?.label
                    }
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(booking)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 flex justify-end border-t border-gray-200">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={filteredBookings.length}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} đơn đặt`
          }
          onChange={handlePaginationChange}
          onShowSizeChange={handlePaginationChange}
          showSizeChanger
          defaultPageSize={10}
          pageSizeOptions={["10", "20", "50"]}
        />
      </div>
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              {isEditing ? "Chỉnh sửa đơn đặt" : "Thêm đơn đặt mới"}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="checkIn">Ngày check-in*</Label>
                <Input
                  type="date"
                  id="checkIn"
                  value={newBooking.checkIn || ""}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, checkIn: e.target.value })
                  }
                />
                {errors.checkIn && (
                  <span className="text-red-500 text-sm">{errors.checkIn}</span>
                )}
              </div>

              <div>
                <Label htmlFor="checkOut">Ngày check-out*</Label>
                <Input
                  type="date"
                  id="checkOut"
                  value={newBooking.checkOut || ""}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, checkOut: e.target.value })
                  }
                />
                {errors.checkOut && (
                  <span className="text-red-500 text-sm">
                    {errors.checkOut}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="totalPrice">Tổng tiền</Label>
                <Input
                  type="number"
                  id="totalPrice"
                  value={newBooking.totalPrice || 0}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      totalPrice: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Trạng thái</Label>
                <Select
                  options={statusOptions}
                  value={newBooking.status || "PENDING"}
                  defaultValue="PENDING"
                  onChange={(value) => {
                    console.log("Changing status to:", value);
                    setNewBooking({
                      ...newBooking,
                      status: value as BookingStatus,
                    });
                  }}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {isEditing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

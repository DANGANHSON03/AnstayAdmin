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
interface Booking {
  id: number;
  apartmentName: string;
  customerName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: number;
  createdAt: string;
}

interface ValidationErrors {
  customerName?: string;
  email?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
}

const statusOptions = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "COMPLETED", label: "Hoàn thành" },
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

    if (!newBooking.customerName?.trim()) {
      newErrors.customerName = "Tên khách hàng là bắt buộc";
    }

    if (!newBooking.email?.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newBooking.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!newBooking.phone?.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }

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

    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      if (isEditing) {
        const updatedBookings = bookings.map((booking) =>
          booking.id === newBooking.id ? { ...booking, ...newBooking } : booking
        );
        setBookings(updatedBookings);
      } else {
        const newBkng = {
          ...newBooking,
          id: bookings.length + 1,
          createdAt: new Date().toISOString(),
        };
        setBookings([...bookings, newBkng as Booking]);
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setNewBooking({
        status: "PENDING",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Cập nhật handleEdit để copy dữ liệu an toàn
  const handleEdit = (booking: Booking) => {
    setNewBooking({
      ...booking,
    });
    setIsEditing(true);
    setIsModalOpen(true);
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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setBookings(mockBookings);
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
                        : booking.status === "COMPLETED"
                        ? "default"
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
                <Label htmlFor="customerName">Tên khách hàng*</Label>
                <Input
                  type="text"
                  id="customerName"
                  value={newBooking.customerName || ""}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      customerName: e.target.value,
                    })
                  }
                />
                {errors.customerName && (
                  <span className="text-red-500 text-sm">
                    {errors.customerName}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  type="email"
                  id="email"
                  value={newBooking.email || ""}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, email: e.target.value })
                  }
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại*</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={newBooking.phone || ""}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, phone: e.target.value })
                  }
                />
                {errors.phone && (
                  <span className="text-red-500 text-sm">{errors.phone}</span>
                )}
              </div>

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
                  value={newBooking.status}
                  onChange={(value) =>
                    setNewBooking({
                      ...newBooking,
                      status: value as Booking["status"],
                    })
                  }
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

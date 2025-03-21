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

interface BookingHistory {
  id: number;
  tourName: string;
  customerName: string;
  email: string;
  phone: string;
  bookingDate: string;
  startDate: string;
  numberOfPeople: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

interface ValidationErrors {
  customerName?: string;
  email?: string;
  phone?: string;
  numberOfPeople?: string;
}

const statusOptions = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "COMPLETED", label: "Hoàn thành" },
];

const mockBookings = [
  {
    id: 1,
    tourName: "Tour Đà Lạt 3N2Đ",
    customerName: "Nguyễn Văn An",
    email: "annguyen@gmail.com",
    phone: "0912345678",
    bookingDate: new Date().toISOString(),
    startDate: "2024-02-20",
    numberOfPeople: 2,
    totalPrice: 3600000,
    status: "CONFIRMED",
  },
  {
    id: 2,
    tourName: "Tour Phú Quốc 4N3Đ",
    customerName: "Trần Thị Bình",
    email: "binhtt@gmail.com",
    phone: "0923456789",
    bookingDate: new Date().toISOString(),
    startDate: "2024-03-15",
    numberOfPeople: 4,
    totalPrice: 8800000,
    status: "PENDING",
  },
] as BookingHistory[];

export default function HistoryTourOne() {
  console.log("Component CIF render");
  // Initialize with empty array
  const [users, setUsers] = useState<BookingHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState<Partial<BookingHistory>>({
    status: "PENDING",
    customerName: "",
    email: "",
    phone: "",
    numberOfPeople: 0,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!newUser.customerName?.trim()) {
      newErrors.customerName = "Tên khách hàng là bắt buộc";
    }

    if (!newUser.email?.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!newUser.phone?.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }

    if (!isEditing && !newUser.numberOfPeople) {
      newErrors.numberOfPeople = "Số người là bắt buộc";
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
        const updatedUsers = users.map((user) =>
          user.id === newUser.id ? { ...user, ...newUser } : user
        );
        setUsers(updatedUsers);
      } else {
        const newUsr = {
          ...newUser,
          id: users.length + 1,
          bookingDate: new Date().toISOString(),
        };
        setUsers([...users, newUsr as BookingHistory]);
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setNewUser({
        status: "PENDING",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Cập nhật handleEdit để copy dữ liệu an toàn
  const handleEdit = (user: BookingHistory) => {
    setNewUser({
      ...user,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử đặt tour này?")) {
      try {
        // TODO: Replace with actual API call
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
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
    const loadUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUsers(mockBookings);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Xử lý lọc dữ liệu an toàn
  const filteredUsers = React.useMemo(() => {
    console.log("Filtering users:", users); // Debug log
    return (
      users?.filter(
        (user) =>
          user.customerName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.includes(searchQuery)
      ) || []
    );
  }, [users, searchQuery]);

  // Fix pagination calculations
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = Math.min(
    startIndex + pagination.pageSize,
    filteredUsers.length
  );
  const displayedUsers = filteredUsers.slice(startIndex, endIndex);

  // Fix update total effect
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredUsers.length,
    }));
  }, [filteredUsers.length]);

  // Reset form khi đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setErrors({});
    setNewUser({
      status: "PENDING",
      customerName: "",
      email: "",
      phone: "",
      numberOfPeople: 0,
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

  if (!users || users.length === 0) {
    return <div>No users found</div>;
  }

  // Sửa lại cách hiển thị table
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-white/[0.05]">
        <h2 className="text-lg font-semibold">Lịch sử đặt tour</h2>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              type="text"
              placeholder="Tìm kiếm đặt tour..."
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
                Tour
              </th>
              <th scope="col" className="px-6 py-3">
                Khách hàng
              </th>
              <th scope="col" className="px-6 py-3">
                Liên hệ
              </th>
              <th scope="col" className="px-6 py-3">
                Ngày đặt
              </th>
              <th scope="col" className="px-6 py-3">
                Ngày đi
              </th>
              <th scope="col" className="px-6 py-3">
                Số người
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
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : displayedUsers.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  Không tìm thấy lịch sử đặt tour
                </td>
              </tr>
            ) : (
              displayedUsers.map((booking, index) => (
                <tr
                  key={booking.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{startIndex + index + 1}</td>
                  <td className="px-6 py-4">{booking.tourName}</td>
                  <td className="px-6 py-4">{booking.customerName}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div>{booking.email}</div>
                      <div>{booking.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{booking.numberOfPeople}</td>
                  <td className="px-6 py-4">
                    {booking.totalPrice.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        booking.status === "CONFIRMED"
                          ? "success"
                          : booking.status === "CANCELLED"
                          ? "destructive"
                          : booking.status === "COMPLETED"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {
                        statusOptions.find((s) => s.value === booking.status)
                          ?.label
                      }
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(booking)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 flex justify-end border-t border-gray-200">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={filteredUsers.length}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} người dùng`
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
              Cập nhật trạng thái đặt tour
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Trạng thái</Label>
                <Select
                  options={statusOptions}
                  value={newUser.status}
                  onChange={(value) =>
                    setNewUser({
                      ...newUser,
                      status: value as BookingHistory["status"],
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
                  Cập nhật
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

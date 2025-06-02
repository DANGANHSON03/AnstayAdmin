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

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  password?: string; // Optional in UI since we don't always need it
  avatar?: string;
  address?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string;
  createdAt: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  address?: string;
}

const genderOptions = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

export default function CIF() {
  // Initialize with empty array
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    gender: "MALE",
    dob: "",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Add this new state to store original user data
  const [originalUser, setOriginalUser] = useState<Partial<User>>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!newUser.fullName?.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!newUser.email?.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!newUser.phone?.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create base payload with all existing user data first
      const updatePayload = {
        ...originalUser, // Keep all original data including password
        ...newUser, // Override with new values
        id: newUser.id,
        password: originalUser.password, // Ensure password is kept from original
      };

      // Remove undefined or null values
      Object.keys(updatePayload).forEach(
        (key) => updatePayload[key] === undefined && delete updatePayload[key]
      );

      // Log the payload being sent
      console.log("Update Payload:", JSON.stringify(updatePayload, null, 2));

      const response = await fetch(
        `https://anstay.com.vn/api/users/update/${newUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      const response2 = await fetch(
        "https://anstay.com.vn/api/users/by-role?role=USER"
      );
      const data = await response2.json();
      setUsers(data);

      setIsModalOpen(false);
      setIsEditing(false);
      setNewUser({});
      setOriginalUser({});
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật handleEdit để copy dữ liệu an toàn
  const handleEdit = (user: User) => {
    // Format the date to YYYY-MM-DD for input type="date"
    const formattedDob = new Date(user.dob).toISOString().split("T")[0];
    const userData = {
      ...user,
      dob: formattedDob,
      password: undefined,
    };
    setOriginalUser(userData);
    setNewUser(userData);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://anstay.com.vn/api/users/delete/${userToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Delete failed");

      const response2 = await fetch("https://anstay.com.vn/api/users");
      const data = await response2.json();
      setUsers(data);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
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
        const response = await fetch(
          "https://anstay.com.vn/api/users/by-role?role=USER"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUsers(data);
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
    return (
      users?.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    setOriginalUser({});
    setNewUser({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      avatar: "",
      gender: "MALE",
      dob: "",
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
        <h2 className="text-lg font-semibold">Quản lý người dùng</h2>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              type="text"
              placeholder="Tìm kiếm người dùng..."
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
                Họ tên
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Số điện thoại
              </th>
              <th scope="col" className="px-6 py-3">
                Địa chỉ
              </th>
              <th scope="col" className="px-6 py-3">
                Giới tính
              </th>
              <th scope="col" className="px-6 py-3">
                Ngày sinh
              </th>
              <th scope="col" className="px-6 py-3">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : displayedUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              displayedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{startIndex + index + 1}</td>
                  <td className="px-6 py-4">{user.fullName}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.phone}</td>
                  <td className="px-6 py-4">{user.address || "-"}</td>
                  <td className="px-6 py-4">
                    {genderOptions.find((g) => g.value === user.gender)
                      ?.label || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.dob).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
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
          onChange={handlePaginationChange}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} người dùng`
          }
          defaultPageSize={10}
          pageSizeOptions={["10", "20", "50"]}
          showSizeChanger
          onShowSizeChange={handlePaginationChange}
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
              Chỉnh sửa người dùng
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Họ tên*</Label>
                <Input
                  type="text"
                  id="fullName"
                  value={newUser.fullName || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                />
                {errors.fullName && (
                  <span className="text-red-500 text-sm">
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  type="email"
                  id="email"
                  value={newUser.email || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
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
                  value={newUser.phone || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                />
                {errors.phone && (
                  <span className="text-red-500 text-sm">{errors.phone}</span>
                )}
              </div>

              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  type="text"
                  id="address"
                  value={newUser.address || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  type="url"
                  id="avatar"
                  value={newUser.avatar || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, avatar: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="gender">Giới tính</Label>
                <Select
                  options={genderOptions}
                  value={newUser.gender || "MALE"}
                  defaultValue={newUser.gender || "MALE"}
                  onChange={(value) =>
                    setNewUser({ ...newUser, gender: value as User["gender"] })
                  }
                />
              </div>

              <div>
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input
                  type="date"
                  id="dob"
                  value={newUser.dob || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, dob: e.target.value })
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
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận xóa
            </Dialog.Title>
            <p className="text-sm text-gray-500 mb-4">
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={confirmDelete}
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

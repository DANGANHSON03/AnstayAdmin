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
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  createdAt: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  address?: string;
}

const statusOptions = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "BANNED", label: "Đã khóa" },
];

// Add mock data before component
const mockUsers = [
  {
    id: 1,
    fullName: "Nguyễn Văn An",
    email: "annguyen@gmail.com",
    phone: "0912345678",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    fullName: "Trần Thị Bình",
    email: "binhtt@gmail.com",
    phone: "0923456789",
    address: "456 Đường XYZ, Quận 2, TP.HCM",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
] as User[];

export default function CIF() {
  console.log("Component CIF render");
  // Initialize with empty array
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    status: "ACTIVE",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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

    if (!isEditing && !newUser.password?.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc cho người dùng mới";
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
          createdAt: new Date().toISOString(),
        };
        setUsers([...users, newUsr as User]);
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setNewUser({
        status: "ACTIVE",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Cập nhật handleEdit để copy dữ liệu an toàn
  const handleEdit = (user: User) => {
    setNewUser({
      ...user,
      password: undefined, // Không copy password khi edit
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
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
        setUsers(mockUsers);
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
    setNewUser({
      status: "ACTIVE",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      avatar: "",
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm người dùng</span>
          </button>
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
                    <Badge
                      variant={
                        user.status === "ACTIVE"
                          ? "success"
                          : user.status === "BANNED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {
                        statusOptions.find((s) => s.value === user.status)
                          ?.label
                      }
                    </Badge>
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
              {isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
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

              {!isEditing && (
                <div>
                  <Label htmlFor="password">Mật khẩu*</Label>
                  <Input
                    type="password"
                    id="password"
                    value={newUser.password || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                  {errors.password && (
                    <span className="text-red-500 text-sm">
                      {errors.password}
                    </span>
                  )}
                </div>
              )}

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
                <Label>Trạng thái</Label>
                <Select
                  options={statusOptions}
                  value={newUser.status}
                  onChange={(value) =>
                    setNewUser({ ...newUser, status: value as User["status"] })
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

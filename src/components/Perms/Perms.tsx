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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  password?: string; // Optional in UI since we don't always need it
  avatar?: string;
  address?: string;
  role: "ADMIN" | "USER" | "SUPER_ADMIN";
  dateOfBirthday?: string;
  verified: boolean;
  createdAt?: string;
  permissions?: Permission[];
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  address?: string;
}

const roleOptions = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "USER", label: "Người dùng" },
];

const mockPermissions = [
  {
    id: 1,
    name: "Quản lý người dùng",
    code: "user_manage",
    description: "Quản lý thông tin người dùng",
  },
  {
    id: 2,
    name: "Quản lý đặt phòng",
    code: "booking_manage",
    description: "Quản lý đơn đặt phòng",
  },
  {
    id: 3,
    name: "Quản lý phòng",
    code: "room_manage",
    description: "Quản lý thông tin phòng",
  },
  {
    id: 4,
    name: "Quản lý báo cáo",
    code: "report_manage",
    description: "Xem và xuất báo cáo",
  },
];

export default function Perms() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState<
    Partial<User> & { originalRole?: string }
  >({
    role: "USER",
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

  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isSuperAdmin = () => currentUser?.role === "SUPER_ADMIN";

  const canEditRoles = currentUser?.role === "SUPER_ADMIN";

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch("https://anstay.com.vn/api/users");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    getCurrentUser();
  }, []);

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

    try {
      setLoading(true);
      const getUserResponse = await fetch(
        `https://anstay.com.vn/api/users/${newUser.id}`
      );
      const existingUser = await getUserResponse.json();

      const response = await fetch(
        `https://anstay.com.vn/api/users/update/${newUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...existingUser,
            role: newUser.role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật vai trò");
      }

      await loadUsers();
      setIsModalOpen(false);

      // Updated toast configuration
      toast.success("🎉 Cập nhật vai trò thành công!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          backgroundColor: "#4ade80",
          color: "white",
          fontSize: "16px",
          borderRadius: "8px",
          padding: "16px",
        },
      });
    } catch (error) {
      toast.error("❌ Có lỗi xảy ra khi cập nhật vai trò!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          backgroundColor: "#ef4444",
          color: "white",
          fontSize: "16px",
          borderRadius: "8px",
          padding: "16px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm loadUsers riêng để tái sử dụng
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://anstay.com.vn/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      const transformedUsers = data.map((user: any) => ({
        ...user,
        permissions: user.permissions || [],
        createdAt: user.createdAt || new Date().toISOString(),
      }));
      setUsers(transformedUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    if (user.role === "SUPER_ADMIN" && !canEditRoles) {
      alert("Bạn không có quyền chỉnh sửa Super Admin");
      return;
    }

    setNewUser({
      ...user,
      originalRole: user.role,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        setLoading(true);
        const response = await fetch(`https://anstay.com.vn/api/users/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // Refresh user list
        const fetchResponse = await fetch("https://anstay.com.vn/api/users");
        const updatedUsers = await fetchResponse.json();
        setUsers(updatedUsers);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Có lỗi xảy ra khi xóa người dùng");
      } finally {
        setLoading(false);
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

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://anstay.com.vn/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        const transformedUsers = data.map((user: any) => ({
          ...user,
          permissions: user.permissions || [],
          createdAt: user.createdAt || new Date().toISOString(),
        }));
        setUsers(transformedUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

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

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = Math.min(
    startIndex + pagination.pageSize,
    filteredUsers.length
  );
  const displayedUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredUsers.length,
    }));
  }, [filteredUsers.length]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setErrors({});
    setNewUser({
      role: "USER",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      avatar: "",
    });
    setSelectedPermissions([]);
  };

  const handleRoleChange = (value: string) => {
    setNewUser((prev) => ({
      ...prev,
      role: value as User["role"],
    }));
  };

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

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        limit={1}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ width: "auto", minWidth: "300px" }}
      />
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
                  Vai trò
                </th>
                <th scope="col" className="px-6 py-3">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
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
                          user.role === "SUPER_ADMIN"
                            ? "destructive"
                            : user.role === "ADMIN"
                            ? "warning"
                            : "success"
                        }
                      >
                        {roleOptions.find((r) => r.value === user.role)?.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(canEditRoles || user.role !== "SUPER_ADMIN") && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                        {(canEditRoles || user.role !== "SUPER_ADMIN") && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
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
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Thay đổi vai trò người dùng
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Người dùng</Label>
                  <div className="text-gray-700 py-2 font-medium">
                    {newUser.fullName}
                  </div>
                  <div className="text-gray-500 text-sm">{newUser.email}</div>
                </div>

                <div>
                  <Label>Vai trò hiện tại</Label>
                  <div className="text-gray-700 py-2">
                    <Badge
                      variant={
                        newUser.role === "SUPER_ADMIN"
                          ? "destructive"
                          : newUser.role === "ADMIN"
                          ? "warning"
                          : "success"
                      }
                    >
                      {roleOptions.find((r) => r.value === newUser.role)?.label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Chọn vai trò mới</Label>
                  <Select
                    value={newUser.role}
                    onChange={handleRoleChange}
                    options={roleOptions}
                    disabled={!canEditRoles || newUser.role === "SUPER_ADMIN"}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      (!canEditRoles && newUser.role === "SUPER_ADMIN") ||
                      newUser.role === newUser.originalRole // Disable if role hasn't changed
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Đang xử lý..." : "Cập nhật"}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </>
  );
}

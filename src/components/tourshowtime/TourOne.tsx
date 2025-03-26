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
import React, { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Select as AntSelect, Pagination } from "antd";
import dayjs from "dayjs";

// Update Tour interface to match API response
interface Tour {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  discountPercent: number;
  createdAt: string;
  schedules: any[];
  images: any[];
}

interface ValidationErrors {
  name?: string;
  description?: string;
  price?: string;
  durationDays?: string;
  discountPercent?: string;
}

export default function TourOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [newTour, setNewTour] = useState<Partial<Tour>>({
    name: "",
    description: "",
    price: 0,
    durationDays: 1,
    discountPercent: 0,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8085/api/tours");

      if (!response.ok) throw new Error("Failed to fetch tours");
      const data = await response.json();
      setTours(Array.isArray(data) ? data : []); // Handle direct array response
      setPagination((prev) => ({
        ...prev,
        total: data.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching tours:", error);
      setTours([]);
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

  useEffect(() => {
    fetchTours();
  }, []); // Only fetch on component mount

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!newTour.name?.trim()) {
      newErrors.name = "Tên tour là bắt buộc";
    }

    if (!newTour.description?.trim()) {
      newErrors.description = "Mô tả tour là bắt buộc";
    }

    if (!newTour.price || newTour.price <= 0) {
      newErrors.price = "Giá tour phải lớn hơn 0";
    }

    if (!newTour.durationDays || newTour.durationDays < 1) {
      newErrors.durationDays = "Thời gian tour phải ít nhất 1 ngày";
    }

    if (newTour.discountPercent < 0 || newTour.discountPercent > 100) {
      newErrors.discountPercent = "Phần trăm giảm giá phải từ 0 đến 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = isEditing
        ? `http://localhost:8085/api/tours-crud/${newTour.id}`
        : "http://localhost:8085/api/tours-crud";

      // When editing, only send fields that have been changed
      const body = isEditing
        ? {
            ...newTour, // Keep existing data
            id: newTour.id,
            createdAt: newTour.createdAt, // Preserve original createdAt
          }
        : {
            // For new tours, send all fields
            ...newTour,
            createdAt: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          };

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      setIsModalOpen(false);
      setIsEditing(false);
      setNewTour({
        name: "",
        description: "",
        price: 0,
        durationDays: 1,
        discountPercent: 0,
      });
      fetchTours();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async () => {
    if (!tourToDelete) return;
    try {
      const response = await fetch(
        `http://localhost:8085/api/tours-crud/${tourToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchTours();
        setIsDeleteModalOpen(false);
        setTourToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
    }
  };

  // Add filtered tours logic
  const filteredTours = tours.filter((tour) =>
    tour.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm tour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm tour mới</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="w-16 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-20"
                  >
                    STT
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-64 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[64px] bg-white dark:bg-gray-800 z-20"
                  >
                    Tên tour
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[320px] bg-white dark:bg-gray-800 z-20"
                  >
                    Giá
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-32 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Thời gian
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Giảm giá
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Ngày tạo
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-40 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredTours.length === 0 ? ( // Changed from tours to filteredTours
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Không có dữ liệu tour
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTours.map(
                    (
                      tour,
                      index // Changed from tours to filteredTours
                    ) => (
                      <TableRow key={tour.id}>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                          {tour.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-[320px] bg-white dark:bg-gray-800 z-10">
                          {tour.price.toLocaleString()}đ
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {tour.durationDays} ngày
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {tour.discountPercent}%
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {dayjs(tour.createdAt).format("DD/MM/YYYY")}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setNewTour(tour);
                                setIsEditing(true);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setTourToDelete(tour);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="p-4 flex justify-end border-t border-gray-200">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} tour`
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
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              {isEditing ? "Chỉnh sửa tour" : "Thêm tour mới"}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên tour*</Label>
                  <Input
                    type="text"
                    id="name"
                    required
                    value={newTour.name || ""}
                    onChange={(e) => {
                      setNewTour({ ...newTour, name: e.target.value });
                      setErrors({ ...errors, name: undefined });
                    }}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.name}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Mô tả*</Label>
                  <Input
                    type="text"
                    id="description"
                    required
                    value={newTour.description || ""}
                    onChange={(e) => {
                      setNewTour({ ...newTour, description: e.target.value });
                      setErrors({ ...errors, description: undefined });
                    }}
                  />
                  {errors.description && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="price">Giá*</Label>
                  <Input
                    type="number"
                    id="price"
                    required
                    value={newTour.price || ""}
                    onChange={(e) => {
                      setNewTour({
                        ...newTour,
                        price: parseInt(e.target.value),
                      });
                      setErrors({ ...errors, price: undefined });
                    }}
                  />
                  {errors.price && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.price}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="durationDays">Thời gian (ngày)*</Label>
                  <Input
                    type="number"
                    id="durationDays"
                    required
                    value={newTour.durationDays || ""}
                    onChange={(e) => {
                      setNewTour({
                        ...newTour,
                        durationDays: parseInt(e.target.value),
                      });
                      setErrors({ ...errors, durationDays: undefined });
                    }}
                  />
                  {errors.durationDays && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.durationDays}
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="discountPercent">Giảm giá (%)</Label>
                  <Input
                    type="number"
                    id="discountPercent"
                    value={newTour.discountPercent || ""}
                    onChange={(e) => {
                      setNewTour({
                        ...newTour,
                        discountPercent: parseInt(e.target.value),
                      });
                      setErrors({ ...errors, discountPercent: undefined });
                    }}
                  />
                  {errors.discountPercent && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.discountPercent}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Lưu
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
          <Dialog.Panel className="mx-auto max-w-sm w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium text-red-600 mb-4">
              Xác nhận xóa tour
            </Dialog.Title>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa tour "{tourToDelete?.name}"? Hành động
              này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
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

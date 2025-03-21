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
import Select from "../form/Select";
import { Select as AntSelect, Space, DatePicker, Pagination } from "antd";
import dayjs from "dayjs";

interface Apartment {
  id: number;
  name: string;
  location: string;
  pricePerDay: number;
  pricePerMonth: number;
  discountPercent: number;
  description: string;
  maxAdults: number;
  maxChildren: number;
  numRooms: number;
  status: "AVAILABLE" | "MAINTENANCE" | "OCCUPIED";
  thumbnailUrl?: string;
  images?: string[];
  amenities?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ValidationErrors {
  name?: string;
  location?: string;
  pricePerDay?: string;
  pricePerMonth?: string;
  maxAdults?: string;
  numRooms?: string;
  description?: string;
}

const formTabs = [
  { name: "Thông tin cơ bản", icon: "info" },
  { name: "Chi tiết & Giá", icon: "money" },
  { name: "Mô tả & Hình ảnh", icon: "image" },
];

const mockApartments: Apartment[] = [
  {
    id: 1,
    name: "Sea View Premium",
    location: "28 Trần Phú, Vĩnh Nguyên, Nha Trang",
    pricePerDay: 1200000,
    pricePerMonth: 20000000,
    discountPercent: 15,
    description:
      "Căn hộ view biển tuyệt đẹp, full nội thất cao cấp, ban công rộng rãi",
    maxAdults: 4,
    maxChildren: 2,
    numRooms: 2,
    status: "AVAILABLE",
    thumbnailUrl: "https://example.com/apt1.jpg",
    amenities: ["Wifi", "Điều hòa", "Tủ lạnh", "Bếp", "Máy giặt", "Ban công"],
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    id: 2,
    name: "Central Studio Deluxe",
    location: "15 Lê Lợi, Phước Tiến, Nha Trang",
    pricePerDay: 800000,
    pricePerMonth: 15000000,
    discountPercent: 10,
    description: "Studio hiện đại trung tâm thành phố, gần biển và chợ đêm",
    maxAdults: 2,
    maxChildren: 1,
    numRooms: 1,
    status: "OCCUPIED",
    thumbnailUrl: "https://example.com/apt2.jpg",
    amenities: ["Wifi", "Điều hòa", "Smart TV", "Tủ lạnh"],
    createdAt: "2024-02-21T09:00:00Z",
  },
  {
    id: 3,
    name: "Family Suite Garden View",
    location: "56 Nguyễn Thiện Thuật, Lộc Thọ, Nha Trang",
    pricePerDay: 1500000,
    pricePerMonth: 25000000,
    discountPercent: 20,
    description: "Căn hộ rộng rãi phù hợp gia đình, view vườn yên tĩnh",
    maxAdults: 6,
    maxChildren: 3,
    numRooms: 3,
    status: "MAINTENANCE",
    thumbnailUrl: "https://example.com/apt3.jpg",
    amenities: [
      "Wifi",
      "Điều hòa",
      "Bếp",
      "Máy giặt",
      "Sân vườn",
      "Bãi đậu xe",
    ],
    createdAt: "2024-02-22T11:00:00Z",
  },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Còn trống" },
  { value: "MAINTENANCE", label: "Đang bảo trì" },
  { value: "OCCUPIED", label: "Đã cho thuê" },
];

export default function Apt() {
  const [apartments, setApartments] = useState<Apartment[]>(mockApartments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newApartment, setNewApartment] = useState<Partial<Apartment>>({
    status: "AVAILABLE",
    maxAdults: 2,
    maxChildren: 0,
    numRooms: 1,
    discountPercent: 0,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: mockApartments.length,
  });

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!newApartment.name?.trim()) {
      newErrors.name = "Tên căn hộ là bắt buộc";
    }

    if (!newApartment.location?.trim()) {
      newErrors.location = "Địa chỉ là bắt buộc";
    }

    if (!newApartment.pricePerDay || newApartment.pricePerDay <= 0) {
      newErrors.pricePerDay = "Giá theo ngày phải lớn hơn 0";
    }

    if (!newApartment.pricePerMonth || newApartment.pricePerMonth <= 0) {
      newErrors.pricePerMonth = "Giá theo tháng phải lớn hơn 0";
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
        const updatedApartments = apartments.map((apt) =>
          apt.id === newApartment.id ? { ...apt, ...newApartment } : apt
        );
        setApartments(updatedApartments);
      } else {
        const newApt = {
          ...newApartment,
          id: apartments.length + 1,
          createdAt: new Date().toISOString(),
        };
        setApartments([...apartments, newApt as Apartment]);
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setNewApartment({
        status: "AVAILABLE",
        maxAdults: 2,
        maxChildren: 0,
        numRooms: 1,
        discountPercent: 0,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (apt: Apartment) => {
    setNewApartment(apt);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa căn hộ này?")) {
      try {
        // TODO: Replace with actual API call
        setApartments(apartments.filter((apt) => apt.id !== id));
      } catch (error) {
        console.error("Error deleting apartment:", error);
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm căn hộ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm căn hộ mới</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-white/[0.05]">
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
                    Tên căn hộ
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-64 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[320px] bg-white dark:bg-gray-800 z-20"
                  >
                    Địa chỉ
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Giá ngày
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Giá tháng
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-32 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Số phòng
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Sức chứa
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-32 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Giảm giá
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
                    <TableCell colSpan={11} className="text-center py-4">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : apartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-4">
                      Không có dữ liệu căn hộ
                    </TableCell>
                  </TableRow>
                ) : (
                  apartments.map((apt, index) => (
                    <TableRow key={apt.id}>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                        {apt.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-[320px] bg-white dark:bg-gray-800 z-10">
                        {apt.location}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {apt.pricePerDay.toLocaleString()}đ
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {apt.pricePerMonth.toLocaleString()}đ
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {apt.numRooms}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {`${apt.maxAdults} người lớn, ${apt.maxChildren} trẻ em`}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {apt.discountPercent}%
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(apt)}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(apt.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
            `${range[0]}-${range[1]} trên ${total} căn hộ`
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
              {isEditing ? "Chỉnh sửa căn hộ" : "Thêm căn hộ mới"}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 p-1">
                  {formTabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                         ${
                           selected
                             ? "bg-white text-blue-600 shadow"
                             : "text-gray-600 hover:text-gray-800"
                         }`
                      }
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className="mt-4">
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Tên căn hộ*</Label>
                        <Input
                          type="text"
                          id="name"
                          required
                          value={newApartment.name || ""}
                          onChange={(e) => {
                            setNewApartment({
                              ...newApartment,
                              name: e.target.value,
                            });
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
                        <Label htmlFor="location">Địa chỉ*</Label>
                        <Input
                          type="text"
                          id="location"
                          required
                          value={newApartment.location || ""}
                          onChange={(e) => {
                            setNewApartment({
                              ...newApartment,
                              location: e.target.value,
                            });
                            setErrors({ ...errors, location: undefined });
                          }}
                        />
                        {errors.location && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.location}
                          </span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pricePerDay">Giá ngày*</Label>
                        <Input
                          type="number"
                          id="pricePerDay"
                          required
                          value={newApartment.pricePerDay || ""}
                          onChange={(e) => {
                            setNewApartment({
                              ...newApartment,
                              pricePerDay: parseInt(e.target.value),
                            });
                            setErrors({ ...errors, pricePerDay: undefined });
                          }}
                        />
                        {errors.pricePerDay && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.pricePerDay}
                          </span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pricePerMonth">Giá tháng*</Label>
                        <Input
                          type="number"
                          id="pricePerMonth"
                          required
                          value={newApartment.pricePerMonth || ""}
                          onChange={(e) => {
                            setNewApartment({
                              ...newApartment,
                              pricePerMonth: parseInt(e.target.value),
                            });
                            setErrors({ ...errors, pricePerMonth: undefined });
                          }}
                        />
                        {errors.pricePerMonth && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.pricePerMonth}
                          </span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="numRooms">Số phòng*</Label>
                        <Input
                          type="number"
                          id="numRooms"
                          required
                          value={newApartment.numRooms || ""}
                          onChange={(e) => {
                            setNewApartment({
                              ...newApartment,
                              numRooms: parseInt(e.target.value),
                            });
                            setErrors({ ...errors, numRooms: undefined });
                          }}
                        />
                        {errors.numRooms && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.numRooms}
                          </span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="maxAdults">Số người lớn*</Label>
                        <Input
                          type="number"
                          id="maxAdults"
                          required
                          value={newApartment.maxAdults || ""}
                          onChange={(e) => {
                            setNewApartment({
                              ...newApartment,
                              maxAdults: parseInt(e.target.value),
                            });
                            setErrors({ ...errors, maxAdults: undefined });
                          }}
                        />
                        {errors.maxAdults && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.maxAdults}
                          </span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="maxChildren">Số trẻ em*</Label>
                        <Input
                          type="number"
                          id="maxChildren"
                          required
                          value={newApartment.maxChildren || ""}
                          onChange={(e) => {
                            setNewApartment({
                              ...newApartment,
                              maxChildren: parseInt(e.target.value),
                            });
                            setErrors({ ...errors, maxChildren: undefined });
                          }}
                        />
                        {errors.maxChildren && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.maxChildren}
                          </span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="discountPercent">Giảm giá (%)</Label>
                        <Input
                          type="number"
                          id="discountPercent"
                          value={newApartment.discountPercent || ""}
                          onChange={(e) =>
                            setNewApartment({
                              ...newApartment,
                              discountPercent: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Select
                          options={statusOptions}
                          value={newApartment.status}
                          onChange={(value) =>
                            setNewApartment({
                              ...newApartment,
                              status: value as Apartment["status"],
                            })
                          }
                          placeholder="Chọn trạng thái"
                        />
                      </div>
                    </div>
                  </Tab.Panel>

                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="description">Mô tả</Label>
                        <textarea
                          id="description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 transition-all duration-200"
                          rows={3}
                          placeholder="Nhập mô tả căn hộ"
                          value={newApartment.description || ""}
                          onChange={(e) =>
                            setNewApartment({
                              ...newApartment,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="thumbnailUrl">Đường dẫn Hình ảnh</Label>
                        <Input
                          type="url"
                          id="thumbnailUrl"
                          value={newApartment.thumbnailUrl || ""}
                          onChange={(e) =>
                            setNewApartment({
                              ...newApartment,
                              thumbnailUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

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
    </div>
  );
}

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
  ownerId: number;
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
  owner?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
  };
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

interface Owner {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string; // Add this line
}

const formTabs = [{ name: "Thông tin cơ bản", icon: "info" }];

export default function AptPay() {
  // Thay đổi cách định nghĩa statusOptions
  const [statusOptions, setStatusOptions] = useState([
    {
      value: "AVAILABLE",
      label: "Còn phòng",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "MAINTENANCE",
      label: "Đang bảo trì",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "OCCUPIED",
      label: "Hết phòng",
      color: "bg-red-100 text-red-800",
    },
  ]);

  const [apartments, setApartments] = useState<Apartment[]>([]);
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
    total: 0,
  });

  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [newOwner, setNewOwner] = useState<Partial<Owner>>({});

  // Add new state for owners
  const [owners, setOwners] = useState<Owner[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://anstay.com.vn/api/apartments?includeOwner=true"
        );
        const data = await response.json();
        setApartments(data);
        setPagination((prev) => ({
          ...prev,
          total: data.length,
        }));
      } catch (error) {
        console.error("Error fetching apartments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  // Add useEffect to fetch owners
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await fetch(
          "https://anstay.com.vn/api/apartment-owners"
        );
        const data = await response.json();
        setOwners(data);
      } catch (error) {
        console.error("Error fetching owners:", error);
      }
    };

    fetchOwners();
  }, []);

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
    if (!validateForm()) return;

    try {
      const status = newApartment.status;
      const id = newApartment.id;

      if (!status) {
        throw new Error("Status must be specified");
      }

      const apartmentData = {
        id: isEditing ? id : undefined,
        name: newApartment.name,
        location: newApartment.location,
        ownerId: newApartment.ownerId,
        pricePerDay: parseFloat(newApartment.pricePerDay?.toString() || "0"),
        pricePerMonth: parseFloat(
          newApartment.pricePerMonth?.toString() || "0"
        ),
        discountPercent: parseFloat(
          newApartment.discountPercent?.toString() || "0"
        ),
        description: newApartment.description || "",
        maxAdults: newApartment.maxAdults,
        maxChildren: newApartment.maxChildren,
        numRooms: newApartment.numRooms,
        status: status,
      };

      const url = isEditing
        ? `https://anstay.com.vn/api/apartments/${id}`
        : "https://anstay.com.vn/api/apartments";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apartmentData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditing ? "update" : "create"} apartment`
        );
      }

      const responseData = await response.json();

      if (isEditing && responseData.status !== status) {
        const statusUpdateResponse = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...responseData,
            status: status,
          }),
        });

        if (!statusUpdateResponse.ok) {
          throw new Error("Failed to update status");
        }
      }

      const listResponse = await fetch(
        "https://anstay.com.vn/api/apartments?includeOwner=true"
      );
      const listData = await listResponse.json();
      setApartments(listData);

      setIsModalOpen(false);
      setIsEditing(false);
      setNewApartment({
        status: "AVAILABLE",
        maxAdults: 0,
        maxChildren: 0,
        numRooms: 0,
        discountPercent: 0,
      });
    } catch (error) {
      console.error("Error:", error);
      alert(`Có lỗi xảy ra: ${error.message}`);
    }
  };

  const handleEdit = async (apt: Apartment) => {
    try {
      const response = await fetch(
        `https://anstay.com.vn/api/apartments/${apt.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch apartment details");
      }

      const apartmentData = await response.json();
      const owner = apartmentData.owners?.[0];

      const formattedData = {
        id: apartmentData.id,
        name: apartmentData.name,
        location: apartmentData.location,
        ownerId: owner?.id,
        owner: owner
          ? {
              id: owner.id,
              name: owner.name,
              phone: owner.phone,
              email: owner.email,
              address: owner.address,
            }
          : undefined,
        pricePerDay: parseFloat(apartmentData.pricePerDay),
        pricePerMonth: parseFloat(apartmentData.pricePerMonth),
        discountPercent: parseFloat(apartmentData.discountPercent),
        description: apartmentData.description || "",
        maxAdults: parseInt(apartmentData.maxAdults),
        maxChildren: parseInt(apartmentData.maxChildren),
        numRooms: parseInt(apartmentData.numRooms),
        status: apartmentData.status,
      };

      setNewApartment(formattedData);
      setIsEditing(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching details:", error);
      alert("Có lỗi khi tải thông tin căn hộ");
    }
  };

  const handleDelete = async (id: number) => {
    setApartmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!apartmentToDelete) return;

    try {
      const response = await fetch(
        `https://anstay.com.vn/api/apartments/${apartmentToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setApartments(apartments.filter((apt) => apt.id !== apartmentToDelete));
      setIsDeleteModalOpen(false);
      setApartmentToDelete(null);
    } catch (error) {
      console.error("Error deleting apartment:", error);
      alert("Có lỗi xảy ra khi xóa căn hộ");
    }
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // Update handleCreateOwner to refresh owners list
  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://anstay.com.vn/api/apartment-owners",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newOwner),
        }
      );

      if (!response.ok) throw new Error("Failed to create owner");

      const createdOwner = await response.json();

      // Refresh owners list and update form
      const ownersResponse = await fetch(
        "https://anstay.com.vn/api/apartment-owners"
      );
      const updatedOwners = await ownersResponse.json();
      setOwners(updatedOwners);

      // Update apartment form with new owner
      setNewApartment((prev) => ({
        ...prev,
        ownerId: createdOwner.id,
      }));

      // Close modal and reset form
      setIsOwnerModalOpen(false);
      setNewOwner({});
    } catch (error) {
      console.error("Error creating owner:", error);
      alert("Có lỗi xảy ra khi tạo chủ căn hộ");
    }
  };

  // Add this new function after other state declarations
  const fetchOwnerDetails = async (ownerId: number) => {
    try {
      const response = await fetch(
        `https://anstay.com.vn/api/apartment-owners/${ownerId}`
      );
      if (!response.ok) throw new Error("Failed to fetch owner details");
      const ownerData = await response.json();
      return ownerData;
    } catch (error) {
      console.error("Error fetching owner details:", error);
      return null;
    }
  };

  // Add filtered apartments function
  const filteredApartments = apartments.filter((apt) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      apt.name.toLowerCase().includes(searchLower) ||
      apt.location.toLowerCase().includes(searchLower) ||
      apt.owner?.name.toLowerCase().includes(searchLower) ||
      apt.owner?.phone.toLowerCase().includes(searchLower)
    );
  });

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
          onClick={() => {
            setNewApartment({
              status: "AVAILABLE",
              maxAdults: 2,
              maxChildren: 0,
              numRooms: 1,
              discountPercent: 0,
              name: "",
              location: "",
              ownerId: undefined,
              pricePerDay: undefined,
              pricePerMonth: undefined,
              description: "",
              owner: undefined,
            });
            setIsEditing(false);
            setIsModalOpen(true);
          }}
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
                    Thông tin căn hộ
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
                    className="w-32 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Trạng thái
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
                ) : filteredApartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-4">
                      Không có dữ liệu căn hộ
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApartments.map((apt, index) => (
                    <TableRow key={apt.id}>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                        <div className="space-y-1">
                          <div className="font-medium">{apt.name}</div>
                          <div className="text-gray-500 text-sm">
                            {apt.location}
                          </div>
                          {apt.owner && (
                            <div className="text-gray-500 text-sm">
                              Chủ: {apt.owner.name} ({apt.owner.phone})
                            </div>
                          )}
                        </div>
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
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            apt.status === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : apt.status === "MAINTENANCE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                              apt.status === "AVAILABLE"
                                ? "bg-green-400"
                                : apt.status === "MAINTENANCE"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                          />
                          {apt.status === "AVAILABLE"
                            ? "Còn phòng"
                            : apt.status === "MAINTENANCE"
                            ? "Đang bảo trì"
                            : "Hết phòng"}
                        </span>
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
          total={filteredApartments.length}
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
                  <Label htmlFor="ownerId">Chủ căn hộ*</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select
                        options={owners.map((owner) => ({
                          value: owner.id,
                          label: `${owner.name} (${owner.phone})`,
                        }))}
                        value={
                          isEditing
                            ? newApartment.ownerId
                            : newApartment.ownerId
                        }
                        defaultValue={newApartment.ownerId}
                        onChange={async (value) => {
                          const ownerId = value as number;
                          const ownerDetails = await fetchOwnerDetails(ownerId);
                          if (ownerDetails) {
                            setNewApartment({
                              ...newApartment,
                              ownerId: ownerId,
                              owner: ownerDetails,
                            });
                          }
                        }}
                        placeholder="Chọn chủ căn hộ"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOwnerModalOpen(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Tạo mới</span>
                    </button>
                  </div>
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
                  <Label>Trạng thái</Label>
                  <Select
                    options={statusOptions}
                    value={newApartment.status || "AVAILABLE"}
                    onChange={(value) => {
                      setNewApartment((prev) => ({
                        ...prev,
                        status: value as Apartment["status"],
                      }));
                    }}
                    defaultValue="AVAILABLE"
                    placeholder="Chọn trạng thái"
                  />
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
                    }}
                  />
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
                    }}
                  />
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
        open={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        className="relative z-[60]"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm chủ căn hộ mới
            </Dialog.Title>
            <form onSubmit={handleCreateOwner} className="space-y-4">
              <div>
                <Label htmlFor="ownerName">Tên chủ căn hộ*</Label>
                <Input
                  type="text"
                  id="ownerName"
                  required
                  value={newOwner.name || ""}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="ownerPhone">Số điện thoại*</Label>
                <Input
                  type="tel"
                  id="ownerPhone"
                  required
                  value={newOwner.phone || ""}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Email</Label>
                <Input
                  type="email"
                  id="ownerEmail"
                  value={newOwner.email || ""}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="ownerAddress">Địa chỉ*</Label>
                <Input
                  type="text"
                  id="ownerAddress"
                  required
                  value={newOwner.address || ""}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, address: e.target.value })
                  }
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Tạo mới
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
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4 text-red-600">
              Xác nhận xóa
            </Dialog.Title>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Bạn có chắc chắn muốn xóa căn hộ này? Hành động này không thể hoàn
              tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
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

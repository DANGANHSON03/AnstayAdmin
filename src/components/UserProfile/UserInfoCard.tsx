import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axios from "axios";
import { useState, useEffect } from "react";

export default function UserInfoCard() {
  const [userData, setUserData] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    role: "",
    verified: false,
    dob: "",
    gender: "MALE",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: "MALE",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const id = JSON.parse(localStorage.getItem("userData"))?.id;
        console.log("UserId from localStorage:", id);

        if (!id) {
          console.log("No userId found in localStorage");
          return;
        }

        const response = await axios.get(
          `https://anstay.com.vn/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("API Response:", response.data);

        if (response.data) {
          setUserData(response.data);
          setFormData({
            fullName: response.data.fullName || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            address: response.data.address || "",
            dob: response.data.dob || "",
            gender: response.data.gender || "MALE",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error.response || error);
      }
    };

    getUserData();
  }, []);

  const { isOpen, openModal, closeModal } = useModal();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      const id = JSON.parse(localStorage.getItem("userData"))?.id;

      if (!id) {
        console.log("No userId found in localStorage");
        return;
      }

      // Combine existing userData with new formData
      const updatedData = {
        ...userData, // Keep all existing data
        ...formData, // Override with new values from form
        id: userData.id, // Ensure ID is preserved
        role: userData.role, // Preserve role
        verified: userData.verified, // Preserve verified status
        avatar: userData.avatar, // Preserve avatar
      };

      const response = await axios.put(
        `https://anstay.com.vn/api/users/update/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update Response:", response.data);

      if (response.data) {
        setUserData(response.data);

        // Update localStorage
        const storedUserData = JSON.parse(localStorage.getItem("userData"));
        localStorage.setItem(
          "userData",
          JSON.stringify({
            ...storedUserData,
            fullName: response.data.fullName,
            email: response.data.email,
          })
        );

        closeModal();
      }
    } catch (error) {
      console.error("Failed to update user data:", error.response || error);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Thông tin cá nhân
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Ho và tên
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.fullName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Số điện thoại
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.phone}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Ngày sinh
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(userData.dob)}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Địa chỉ
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.address}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Giới tính
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.gender === "MALE" ? "Nam" : "Nữ"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Sửa thông tin
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Sửa thông tin cá nhân
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Cập nhật thông tin.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Thông tin cơ bản
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Họ và tên</Label>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Số điện thoại</Label>
                    <Input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Ngày sinh</Label>
                    <Input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Địa chỉ</Label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Giới tính</Label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Đóng
              </Button>
              <Button size="sm" onClick={handleSave}>
                Lưu thông tin
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

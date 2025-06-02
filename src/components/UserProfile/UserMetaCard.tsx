import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axios from "axios";
import { useState, useEffect } from "react";

export default function UserMetaCard() {
  const [userData, setUserData] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
    address: "",
    role: "",
    verified: false,
  });

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
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error.response || error);
      }
    };

    getUserData();
  }, []);

  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={userData.avatar || "https://i.ibb.co/35SyTcnX/Anstay.png"}
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userData.fullName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData.email}
                </p>
                <span className="hidden xl:block text-gray-500">•</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData.phone}
                </p>
                <span className="hidden xl:block text-gray-500">•</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData.address}
                </p>
                {userData.verified && (
                  <span className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

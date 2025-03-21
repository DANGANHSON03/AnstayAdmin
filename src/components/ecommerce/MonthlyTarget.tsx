import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { HiOutlineHome, HiOutlineOfficeBuilding } from "react-icons/hi";

export default function MonthlyTarget() {
  const [isOpen, setIsOpen] = useState(false);

  const mockStats = {
    hanoi: {
      hotels: { orders: 150, revenue: 450000000 },
      apartments: { orders: 89, revenue: 267000000 },
    },
    hcm: {
      hotels: { orders: 200, revenue: 600000000 },
      apartments: { orders: 120, revenue: 360000000 },
    },
  };

  // Tính toán series cho biểu đồ từ dữ liệu mock
  const series = [
    mockStats.hanoi.hotels.orders,
    mockStats.hanoi.apartments.orders,
    mockStats.hcm.hotels.orders,
    mockStats.hcm.apartments.orders,
  ];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 250,
    },
    colors: ["#465FFF", "#10B981", "#F43F5E", "#FB923C"],
    labels: [
      "Khách sạn Hà Nội",
      "Căn hộ Hà Nội",
      "Khách sạn HCM",
      "Căn hộ HCM",
    ],
    legend: {
      position: "bottom",
      labels: {
        colors: "#475569",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%";
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="p-4">
        {" "}
        {/* Reduced from p-5 */}
        <div className="flex justify-between mb-4">
          {" "}
          {/* Reduced from mb-6 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Thống Kê Theo Loại Hình
            </h3>
            <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
              Chi tiết đơn đặt và doanh thu theo khu vực
            </p>
          </div>
          {/* ...existing dropdown code... */}
        </div>
        <div className="space-y-4">
          {" "}
          {/* Reduced from space-y-6 */}
          {/* Hà Nội Section */}
          <div>
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              {" "}
              {/* Reduced from mb-3 */}
              Khu Vực Hà Nội
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col items-start">
                  <HiOutlineHome className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Khách sạn
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {mockStats.hanoi.hotels.orders} đơn
                  </p>
                  <span className="text-sm text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(mockStats.hanoi.hotels.revenue)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col items-start">
                  <HiOutlineOfficeBuilding className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Căn hộ
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {mockStats.hanoi.apartments.orders} đơn
                  </p>
                  <span className="text-sm text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(mockStats.hanoi.apartments.revenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* HCM Section */}
          <div>
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              {" "}
              {/* Reduced from mb-3 */}
              Khu Vực Hồ Chí Minh
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col items-start">
                  <HiOutlineHome className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Khách sạn
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {mockStats.hcm.hotels.orders} đơn
                  </p>
                  <span className="text-sm text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(mockStats.hcm.hotels.revenue)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col items-start">
                  <HiOutlineOfficeBuilding className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Căn hộ
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {mockStats.hcm.apartments.orders} đơn
                  </p>
                  <span className="text-sm text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(mockStats.hcm.apartments.revenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-4">
          {" "}
          {/* Reduced from mt-6 */}
          <Chart
            options={options}
            series={series}
            type="pie"
            height={250} // Reduced from 330
          />
        </div>
      </div>
    </div>
  );
}

import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { HiOutlineHome, HiOutlineOfficeBuilding } from "react-icons/hi";

interface AreaRevenue {
  totalRevenue: number;
  revenue: number;
  period: string;
  data: null;
  name: null;
  type: string;
  totalOrders: number;
}

export default function MonthlyTarget() {
  const [isOpen, setIsOpen] = useState(false);
  const [areaStats, setAreaStats] = useState<AreaRevenue[]>([]);

  useEffect(() => {
    fetch("https://anstay.com.vn/api/statistics/revenue-by-area")
      .then((res) => res.json())
      .then((data) => setAreaStats(data))
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  const stats = {
    hanoi: {
      tour: areaStats.find(
        (stat) => stat.period === "HA_NOI" && stat.type === "TOUR"
      ) || { revenue: 0, totalRevenue: 0, totalOrders: 0 },
      apartment: areaStats.find(
        (stat) => stat.period === "HA_NOI" && stat.type === "APARTMENT"
      ) || { revenue: 0, totalRevenue: 0, totalOrders: 0 },
    },
    halong: {
      tour: areaStats.find(
        (stat) => stat.period === "HA_LONG" && stat.type === "TOUR"
      ) || { revenue: 0, totalRevenue: 0, totalOrders: 0 },
      apartment: areaStats.find(
        (stat) => stat.period === "HA_LONG" && stat.type === "APARTMENT"
      ) || { revenue: 0, totalRevenue: 0, totalOrders: 0 },
    },
  };

  const series = [
    stats.hanoi.tour.revenue,
    stats.hanoi.apartment.revenue,
    stats.halong.tour.revenue,
    stats.halong.apartment.revenue,
  ];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 250,
    },
    colors: ["#465FFF", "#10B981", "#F43F5E", "#FB923C"],
    labels: ["Tour Hà Nội", "Căn hộ Hà Nội", "Tour Hạ Long", "Căn hộ Hạ Long"],
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
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Thống Kê Theo Loại Hình
            </h3>
            <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
              Chi tiết đơn đặt và doanh thu theo khu vực
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Khu Vực Hà Nội
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col items-start">
                  <HiOutlineHome className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tour
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {stats.hanoi.tour.totalOrders} đơn
                  </p>
                  <span className="text-sm text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(stats.hanoi.tour.revenue)}
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
                    {stats.hanoi.apartment.totalOrders} đơn
                  </p>
                  <span className="text-sm text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(stats.hanoi.apartment.revenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Khu Vực Hạ Long
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col items-start">
                  <HiOutlineHome className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tour
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {stats.halong.tour.totalOrders} đơn
                  </p>
                  <span className="text-sm text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(stats.halong.tour.revenue)}
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
                    {stats.halong.apartment.totalOrders} đơn
                  </p>
                  <span className="text-sm text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(stats.halong.apartment.revenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-4">
          <Chart options={options} series={series} type="pie" height={250} />
        </div>
      </div>
    </div>
  );
}

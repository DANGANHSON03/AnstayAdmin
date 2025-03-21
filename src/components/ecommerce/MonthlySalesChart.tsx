import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState } from "react";

export default function MonthlySalesChart() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const years = ["2025", "2026", "2027"];

  const options: ApexOptions = {
    colors: ["#465fff", "#00E396"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80%",
        borderRadius: 4,
        distributed: false,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return (val / 1000000).toFixed(0) + "M";
      },
      style: {
        fontSize: "11px",
        colors: ["#fff"],
      },
      rotateAlways: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ],
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => (val / 1000000).toFixed(0) + "M",
      },
      title: {
        text: "Doanh thu (VNĐ)",
      },
    },
    grid: {
      show: true,
      borderColor: "#90A4AE30",
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString("vi-VN")} đ`,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
    },
  };

  const series = [
    {
      name: "Hà Nội",
      data: [
        45000000, 52000000, 48000000, 51000000, 58000000, 63000000, 65000000,
        61000000, 57000000, 62000000, 68000000, 72000000,
      ],
    },
    {
      name: "Hồ Chí Minh",
      data: [
        68000000, 65000000, 62000000, 69000000, 72000000, 75000000, 78000000,
        76000000, 73000000, 77000000, 82000000, 85000000,
      ],
    },
  ];
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-16">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Thống Kê Doanh Thu Theo Tháng
            </h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  Năm {year}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            So sánh doanh thu Hà Nội và TP.HCM
          </p>
        </div>

        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[650px] xl:min-w-full">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
}

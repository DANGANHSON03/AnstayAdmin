import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";

export default function MonthlySalesChart() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [chartData, setChartData] = useState([]);
  const years = ["2025", "2026", "2027"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://anstay.com.vn/api/statistics/monthly-revenue?year=${selectedYear}`
        );
        const data = await response.json();

        // Transform data into monthly format
        const transformedData = data.reduce((acc, item) => {
          const location = item.name;
          if (!acc[location]) {
            acc[location] = new Array(12).fill(0);
          }
          const monthIndex = parseInt(item.period.split("-")[1]) - 1;
          acc[location][monthIndex] = item.data[0];
          return acc;
        }, {});

        setChartData(
          Object.entries(transformedData).map(([name, data]) => ({
            name,
            data,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedYear]);

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
        return (val / 1000000).toFixed(1) + "M";
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
        formatter: (val) => (val / 1000000).toFixed(1) + "M",
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
      data:
        chartData.find((item) => item.name === "HA_NOI")?.data ||
        new Array(12).fill(0),
    },
    {
      name: "Hạ Long",
      data:
        chartData.find((item) => item.name === "HA_LONG")?.data ||
        new Array(12).fill(0),
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
            So sánh doanh thu Hà Nội và Hạ Long
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

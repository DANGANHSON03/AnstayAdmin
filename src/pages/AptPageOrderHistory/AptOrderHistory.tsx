import React, { useState, useEffect } from "react";

interface Order {
  id: number;
  roomType: string;
  customerName: string;
  email: string;
  phone: string;
  amount: number;
  checkInDate: string;
  checkOutDate: string;
  status: "COMPLETED" | "FAILED" | "REFUNDED";
  createdAt?: string;
  reason?: string;
}

export default function AptOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"failed" | "refunded">("failed");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Fetch dữ liệu từ API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const apiUrl = "http://localhost:8085/api/payments/history";
      console.log("🔗 Gọi API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Thêm credentials nếu cần
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📡 API Response:", result);

      // Xử lý response từ backend
      let ordersData = [];

      if (Array.isArray(result)) {
        ordersData = result;
      } else if (result.success && Array.isArray(result.data)) {
        ordersData = result.data;
      } else {
        console.warn("⚠️ Unexpected API response format:", result);
        ordersData = [];
      }

      // Map dữ liệu từ API
      const mappedOrders: Order[] = ordersData.map((item: any) => ({
        id: item.id || 0,
        roomType: item.roomType || "APARTMENT",
        customerName: item.customerName || "N/A",
        email: item.email || "N/A",
        phone: item.phone || "N/A",
        amount: Number(item.amount) || 0,
        checkInDate: item.checkInDate || "N/A",
        checkOutDate: item.checkOutDate || "N/A",
        status: (item.status || "FAILED") as
          | "COMPLETED"
          | "FAILED"
          | "REFUNDED",
        createdAt: item.createdAt,
        reason: item.reason || undefined,
      }));

      // Lọc chỉ lấy FAILED và REFUNDED
      const filteredOrders = mappedOrders.filter((order) =>
        ["FAILED", "REFUNDED"].includes(order.status)
      );

      setOrders(filteredOrders);
      console.log("✅ Loaded", filteredOrders.length, "orders successfully");
    } catch (error) {
      console.error("❌ Error fetching orders:", error);

      // Hiển thị thông báo lỗi chi tiết
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);

      // Có thể hiển thị toast notification thay vì alert
      // toast.error(`Không thể tải dữ liệu: ${errorMessage}`);

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch với filter
  const fetchOrdersWithFilter = async () => {
    setLoading(true);
    try {
      // Tạo URL với query parameters nếu cần
      const queryParams = new URLSearchParams();

      // Chỉ thêm filter nếu có giá trị
      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm.trim());
      }
      if (dateFilter) {
        queryParams.append("date", dateFilter);
      }

      const url = `http://localhost:8085/api/payments/history${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      console.log("🔍 Fetching with filters:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📡 Filtered API Response:", result);

      // Xử lý response tương tự fetchOrders
      const ordersData =
        result.success && Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

      const mappedOrders: Order[] = ordersData.map((item: any) => ({
        id: item.id || 0,
        roomType: item.roomType || "APARTMENT",
        customerName: item.customerName || "N/A",
        email: item.email || "N/A",
        phone: item.phone || "N/A",
        amount: Number(item.amount) || 0,
        checkInDate: item.checkInDate || "N/A",
        checkOutDate: item.checkOutDate || "N/A",
        status: (item.status || "FAILED") as
          | "COMPLETED"
          | "FAILED"
          | "REFUNDED",
        createdAt: item.createdAt,
        reason: item.reason || undefined,
      }));

      // Lọc chỉ FAILED và REFUNDED
      const filteredOrders = mappedOrders.filter((order) =>
        ["FAILED", "REFUNDED"].includes(order.status)
      );

      setOrders(filteredOrders);
      console.log("✅ Filtered results:", filteredOrders.length, "orders");
    } catch (error) {
      console.error("❌ Error filtering data:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc đơn hàng theo tab và search
  const getFilteredOrders = () => {
    let filtered = orders.filter(
      (order) => order.status === activeTab.toUpperCase()
    );

    // Lọc theo search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchLower) ||
          order.email.toLowerCase().includes(searchLower) ||
          order.phone.includes(searchTerm) ||
          order.id.toString().includes(searchTerm)
      );
    }

    // Lọc theo ngày
    if (dateFilter) {
      filtered = filtered.filter(
        (order) =>
          order.checkInDate.includes(dateFilter) ||
          order.checkOutDate.includes(dateFilter) ||
          (order.createdAt && order.createdAt.includes(dateFilter))
      );
    }

    return filtered;
  };

  // Màu sắc cho trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFUNDED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Tên hiển thị cho trạng thái
  const getStatusText = (status: string) => {
    switch (status) {
      case "FAILED":
        return "FAILED";
      case "REFUNDED":
        return "REFUNDED";
      default:
        return status;
    }
  };

  // Thống kê theo trạng thái
  const getStatusCount = (status: string) => {
    return orders.filter((order) => order.status === status).length;
  };

  // Export CSV
  const exportToCSV = () => {
    const csvData = getFilteredOrders();

    if (csvData.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const csvContent = [
      [
        "ID",
        "Loại đặt",
        "Tên khách",
        "Email",
        "SĐT",
        "Số tiền",
        "Check-in",
        "Check-out",
        "Trạng thái",
        "Lý do",
      ],
      ...csvData.map((order) => [
        order.id,
        order.roomType,
        order.customerName,
        order.email,
        order.phone,
        order.amount,
        order.checkInDate,
        order.checkOutDate,
        getStatusText(order.status),
        order.reason || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lich-su-don-hang-${activeTab}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log("📊 Exported", csvData.length, "orders to CSV");
  };

  // Fetch khi tab thay đổi
  useEffect(() => {
    // Chỉ cần filter lại dữ liệu hiện có, không cần gọi API mới
    console.log(`Tab changed to: ${activeTab}`);
  }, [activeTab]);

  // Handle search
  const handleSearch = () => {
    fetchOrdersWithFilter();
  };

  // Xem chi tiết đơn hàng
  const viewOrderDetail = async (orderId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8085/api/payments/history/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy chi tiết đơn hàng");
      }

      const orderDetail = await response.json();

      // Tạo thông tin chi tiết
      const detailInfo = `Chi tiết đơn hàng #${orderId}:

Khách: ${orderDetail.customerName || orderDetail.guestName || "N/A"}
Email: ${orderDetail.email || orderDetail.guestEmail || "N/A"}
SĐT: ${orderDetail.phone || orderDetail.guestPhone || "N/A"}
Số tiền: ${Number(orderDetail.amount || 0).toLocaleString("vi-VN")}đ
Trạng thái: ${orderDetail.status || "N/A"}
Check-in: ${orderDetail.checkInDate || "N/A"}
Check-out: ${orderDetail.checkOutDate || "N/A"}
Lý do: ${orderDetail.reason || "Không có"}`;

      alert(detailInfo);
    } catch (error) {
      console.error("Error getting order detail:", error);
      alert(
        "Không thể lấy chi tiết đơn hàng: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Đơn Hàng Thất Bại / Hoàn Tiền
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi lịch sử các đơn hàng có vấn đề
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              📊 Xuất báo cáo
            </button>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              🔄 Làm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Đơn hàng thất bại
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {getStatusCount("FAILED")}
                </p>
                <p className="text-xs text-gray-500 mt-1">Cần xem xét</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                ❌
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Đơn hàng hoàn tiền
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {getStatusCount("REFUNDED")}
                </p>
                <p className="text-xs text-gray-500 mt-1">Đã xử lý</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                💰
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng vấn đề</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Cần xử lý</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                📊
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("failed")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "failed"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Đơn hàng thất bại ({getStatusCount("FAILED")})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("refunded")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "refunded"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Đơn hàng hoàn tiền ({getStatusCount("REFUNDED")})
              </span>
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, tên khách, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔍 Tìm kiếm
              </button>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                  fetchOrders(); // Reload all data
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                🗑️ Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại đặt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên khách
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SĐT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-gray-500">
                          Đang tải dữ liệu...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : getFilteredOrders().length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">📭</span>
                        <span>Không có đơn hàng nào phù hợp</span>
                        <span className="text-sm mt-1">
                          Tab: {activeTab.toUpperCase()} | Tổng orders:{" "}
                          {orders.length}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getFilteredOrders().map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {order.roomType}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.customerName}
                        {order.reason && (
                          <div className="text-xs text-red-500 mt-1">
                            Lý do: {order.reason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.phone}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.amount.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.checkInDate}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.checkOutDate}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewOrderDetail(order.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="In hóa đơn"
                          >
                            🖨️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {getFilteredOrders().length}
                </span>{" "}
                kết quả
                {searchTerm && (
                  <span className="text-gray-500">
                    {" "}
                    (tìm kiếm: "{searchTerm}")
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Tab: {activeTab.toUpperCase()} | Tổng: {orders.length} đơn hàng
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

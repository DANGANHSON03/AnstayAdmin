import { useEffect, useState } from "react";

export default function AptPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:8085/api/payments/completed")
      .then((res) => res.json())
      .then((data) => {
        // ✅ DEBUG: Xem dữ liệu API trả về
        console.log("=== KIỂM TRA DỮ LIỆU API ===");
        console.log("1. Toàn bộ data:", data);
        console.log("2. Số lượng items:", data.length);

        if (Array.isArray(data) && data.length > 0) {
          console.log("3. Item đầu tiên:", data[0]);
          console.log("4. Các field có sẵn:", Object.keys(data[0]));

          // Kiểm tra tất cả field có thể liên quan đến check-in/check-out
          const firstItem = data[0];
          console.log("=== CHECK-IN/CHECK-OUT FIELDS ===");
          console.log("checkIn:", firstItem.checkIn);
          console.log("checkOut:", firstItem.checkOut);
          console.log("checkInDate:", firstItem.checkInDate);
          console.log("checkOutDate:", firstItem.checkOutDate);
          console.log("check_in_date:", firstItem.check_in_date);
          console.log("check_out_date:", firstItem.check_out_date);
          console.log("startDate:", firstItem.startDate);
          console.log("endDate:", firstItem.endDate);
          console.log("createdAt:", firstItem.createdAt);
          console.log("updatedAt:", firstItem.updatedAt);
        }

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API không trả về mảng:", data);
          setOrders([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch API:", err);
        setOrders([]);
        setLoading(false);
      });
  }, []);

  // Filter orders theo search
  const filteredOrders = orders.filter((order) =>
    order.guestName?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper function để format date
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      return "Lỗi ngày";
    }
  };

  // Helper function để lấy check-in date
  const getCheckInDate = (order) => {
    return (
      order.checkInDate ||
      order.check_in_date ||
      order.checkIn ||
      order.startDate ||
      order.createdAt
    );
  };

  // Helper function để lấy check-out date
  const getCheckOutDate = (order) => {
    return (
      order.checkOutDate ||
      order.check_out_date ||
      order.checkOut ||
      order.endDate ||
      order.updatedAt
    );
  };

  return (
    <div className="p-4">
      {/* Search Input */}
      <div className="flex justify-between mb-4">
        <input
          placeholder="Tìm kiếm theo tên khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">Đang tải dữ liệu...</div>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white">
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left font-medium">ID</th>
                <th className="border px-3 py-2 text-left font-medium">
                  Loại đặt
                </th>
                <th className="border px-3 py-2 text-left font-medium">
                  Tên khách
                </th>
                <th className="border px-3 py-2 text-left font-medium">
                  Email
                </th>
                <th className="border px-3 py-2 text-left font-medium">SĐT</th>
                <th className="border px-3 py-2 text-left font-medium">
                  Số tiền
                </th>
                <th className="border px-3 py-2 text-left font-medium">
                  Check-in
                </th>
                <th className="border px-3 py-2 text-left font-medium">
                  Check-out
                </th>
                <th className="border px-3 py-2 text-left font-medium">
                  Trạng thái
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{order.id}</td>
                    <td className="border px-3 py-2">
                      {order.bookingType || "N/A"}
                    </td>
                    <td className="border px-3 py-2">
                      {order.guestName || "N/A"}
                    </td>
                    <td className="border px-3 py-2">
                      {order.guestEmail || "N/A"}
                    </td>
                    <td className="border px-3 py-2">
                      {order.guestPhone || "N/A"}
                    </td>
                    <td className="border px-3 py-2">
                      {order.amount
                        ? `${order.amount.toLocaleString("vi-VN")}đ`
                        : "0đ"}
                    </td>
                    <td className="border px-3 py-2">
                      {formatDate(getCheckInDate(order))}
                    </td>
                    <td className="border px-3 py-2">
                      {formatDate(getCheckOutDate(order))}
                    </td>
                    <td className="border px-3 py-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="border px-3 py-8 text-center text-gray-500"
                  >
                    {search
                      ? "Không tìm thấy kết quả phù hợp"
                      : "Không có dữ liệu"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

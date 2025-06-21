import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import "./AptPage.css";

export default function AptPayPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showEditModal, setShowEditModal] = useState(false);

  /**  useEffect(() => {
    fetch("http://localhost:8085/api/payments/pending")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);**/

  useEffect(() => {
    fetch("http://localhost:8085/api/payments/report/with-checkin-checkout")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
        setLoading(false);
      });
  }, []);

  const handleEdit = (order: any) => {
    setEditId(order.id);
    setEditData({ ...order });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      // Validation
      if (!editData.guestName || !editData.guestEmail) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      // Lấy order gốc
      const originalOrder = orders.find((order) => order.id === editId);
      if (!originalOrder) {
        alert("Không tìm thấy đơn hàng gốc!");
        return;
      }

      // Merge dữ liệu, ưu tiên giữ giá trị gốc nếu editData thiếu
      const updatePayload = {
        ...originalOrder,
        ...editData,
        bookingId: editData.bookingId ?? originalOrder.bookingId,
        userId: editData.userId ?? originalOrder.userId,
        checkIn: originalOrder.checkIn,
        checkOut: originalOrder.checkOut,
      };

      // Log kiểm tra
      console.log("=== AUTO MERGE DEBUG ===");
      console.log("🔍 Original order:", originalOrder);
      console.log("✏️ Edit data:", editData);
      console.log("🚀 Final payload:", updatePayload);

      // Gửi yêu cầu PUT
      const response = await fetch(
        `http://localhost:8085/api/payments/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      // Xử lý phản hồi
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();

      if (response.ok) {
        let updatedPayment = null;
        try {
          if (contentType && contentType.includes("application/json")) {
            updatedPayment = JSON.parse(responseText);
          } else {
            console.log("ℹ️ Server trả text:", responseText);
          }
        } catch (e) {
          console.warn("⚠️ Phản hồi không phải JSON:", responseText);
        }

        // Cập nhật local state
        setOrders((prev) =>
          prev.map((order) => (order.id === editId ? updatePayload : order))
        );

        // Đóng modal và reset form
        setShowEditModal(false);
        setEditId(null);
        setEditData({});

        alert("✅ Cập nhật đơn hàng thành công!");
      } else {
        console.error("❌ Server trả lỗi:", responseText);
        alert(`Lỗi từ server: ${responseText}`);
      }
    } catch (error) {
      console.error("❌ Error updating payment:", error);
      alert("Có lỗi xảy ra khi kết nối đến server!");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setShowEditModal(false);
  };

  return (
    <>
      <PageMeta
        title="Chờ xác nhận đơn hàng"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Chờ xác nhận đơn " />
      <div className="space-y-6">
        <ComponentCard title="Danh sách đơn hàng chờ xác nhận">
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <table className="min-w-full border border-gray-300 text-gray-900 dark:text-gray-100">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Loại đặt</th>
                  <th className="border px-3 py-2">Tên khách</th>
                  <th className="border px-3 py-2">Email</th>
                  <th className="border px-3 py-2">SĐT</th>
                  <th className="border px-3 py-2">Số tiền</th>

                  <th className="border px-3 py-2">Check-in</th>
                  <th className="border px-3 py-2">Check-out</th>
                  <th className="border px-3 py-2">Trạng thái</th>
                  <th className="border px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="text-center">
                    <td className="border px-3 py-2">{order.id}</td>
                    <td className="border px-3 py-2">{order.bookingType}</td>
                    <td className="border px-3 py-2">{order.guestName}</td>
                    <td className="border px-3 py-2">{order.guestEmail}</td>
                    <td className="border px-3 py-2">{order.guestPhone}</td>
                    <td className="border px-3 py-2">
                      {order.amount?.toLocaleString("vi-VN")}
                    </td>
                    <td className="border px-3 py-2">
                      {order.checkIn
                        ? new Date(order.checkIn).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : ""}
                    </td>
                    <td className="border px-3 py-2">
                      {order.checkOut
                        ? new Date(order.checkOut).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : ""}
                    </td>
                    <td className="border px-3 py-2">{order.status}</td>
                    <td className="border px-2 py-1">
                      <button
                        className="text-blue-600 mr-2"
                        onClick={() => handleEdit(order)}
                      >
                        ✏️
                      </button>
                      <button className="text-red-600">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ComponentCard>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <h2 className="text-lg font-semibold mb-4">Chỉnh sửa đơn hàng</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSave();
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">Loại đặt</label>
                  <input
                    name="bookingType"
                    value={editData.bookingType || ""}
                    onChange={handleEditChange}
                    className="border rounded w-full px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm">Khách</label>
                  <input
                    name="guestName"
                    value={editData.guestName || ""}
                    onChange={handleEditChange}
                    className="border rounded w-full px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm">Email</label>
                  <input
                    name="guestEmail"
                    value={editData.guestEmail || ""}
                    onChange={handleEditChange}
                    className="border rounded w-full px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm">SĐT</label>
                  <input
                    name="guestPhone"
                    value={editData.guestPhone || ""}
                    onChange={handleEditChange}
                    className="border rounded w-full px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm">Số CMND</label>
                  <input
                    name="guestIdentityNumber"
                    value={editData.guestIdentityNumber || ""}
                    onChange={handleEditChange}
                    className="border rounded w-full px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm">Số tiền</label>
                  <input
                    name="amount"
                    type="number"
                    value={editData.amount || ""}
                    onChange={handleEditChange}
                    className="border rounded w-full px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm">Trạng thái</label>
                  <select
                    name="status"
                    value={editData.status || ""}
                    onChange={handleEditChange}
                    className="border rounded w-full px-2 py-1"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="px-4 py-2 mr-2 rounded border"
                  onClick={handleEditCancel}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

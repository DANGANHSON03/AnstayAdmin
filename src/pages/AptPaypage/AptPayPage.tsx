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

  // State cho delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState<any>(null);

  /**  useEffect(() => {
    fetch("https://anstay.com.vn/api/payments/pending")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);**/

  useEffect(() => {
    fetch("https://anstay.com.vn/api/payments/report/with-checkin-checkout")
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
        `https://anstay.com.vn/api/payments/${editId}`,
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

  // Phần xóa - mở modal xác nhận
  const handleDelete = (order: any) => {
    setDeleteOrder(order);
    setShowDeleteModal(true);
  };

  // Function xóa thực sự
  const confirmDelete = async () => {
    if (!deleteOrder) return;

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:8085/api/payments/${deleteOrder.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Xóa khỏi state
        setOrders((prev) => prev.filter((item) => item.id !== deleteOrder.id));

        // Đóng modal và reset
        setShowDeleteModal(false);
        setDeleteOrder(null);

        // Thông báo thành công
        alert(`✅ Đã xóa thành công đơn hàng #${deleteOrder.id}!`);
      } else {
        const errorText = await response.text();
        alert(`Lỗi: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Có lỗi xảy ra khi xóa!");
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteOrder(null);
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
                        className="text-blue-600 mr-2 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        onClick={() => handleEdit(order)}
                        title="Chỉnh sửa đơn hàng"
                      >
                        ✏️
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                        onClick={() => handleDelete(order)}
                        disabled={loading}
                        title="Xóa đơn hàng"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ComponentCard>
      </div>

      {/* Modal chỉnh sửa */}
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
                  className="px-4 py-2 mr-2 rounded border hover:bg-gray-50"
                  onClick={handleEditCancel}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa - Compact version */}
      {showDeleteModal && deleteOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-xl modal-content">
            {/* Header nhỏ gọn */}
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Xác nhận xóa
                </h3>
                <p className="text-xs text-gray-600">Không thể hoàn tác</p>
              </div>
            </div>

            {/* Content gọn */}
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                Xóa đơn hàng #{deleteOrder.id} của {deleteOrder.guestName}?
              </p>

              <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                <div>💰 {deleteOrder.amount?.toLocaleString("vi-VN")} VNĐ</div>
                <div>📧 {deleteOrder.guestEmail}</div>
              </div>
            </div>

            {/* Buttons nhỏ */}
            <div className="flex space-x-2">
              <button
                type="button"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 btn-secondary"
                onClick={cancelDelete}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="button"
                className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from "react";

export default function EditApartmentModal({ apartment, onClose, onSave }) {
  const [form, setForm] = useState({ ...apartment });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <h2 className="text-lg font-semibold mb-4">Chỉnh sửa căn hộ</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Tên căn hộ*</label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Chủ căn hộ*</label>
              <input
                name="owner"
                value={form.owner || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Địa chỉ*</label>
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Giá ngày*</label>
              <input
                name="pricePerDay"
                type="number"
                value={form.pricePerDay || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Giá tháng*</label>
              <input
                name="pricePerMonth"
                type="number"
                value={form.pricePerMonth || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Trạng thái</label>
              <select
                name="status"
                value={form.status || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
              >
                <option value="Còn phòng">Còn phòng</option>
                <option value="Hết phòng">Hết phòng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Số phòng*</label>
              <input
                name="roomCount"
                type="number"
                value={form.roomCount || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Số người lớn*</label>
              <input
                name="adultCount"
                type="number"
                value={form.adultCount || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Số trẻ em*</label>
              <input
                name="childCount"
                type="number"
                value={form.childCount || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Giảm giá (%)</label>
              <input
                name="discount"
                type="number"
                value={form.discount || ""}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="px-4 py-2 mr-2 rounded border"
              onClick={onClose}
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
  );
}

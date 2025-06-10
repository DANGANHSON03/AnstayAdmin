import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StatusBlog.css";

const API_PREFIX = "https://anstay.com.vn";

const StatusBlog = () => {
  const [blogList, setBlogList] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [viewMode, setViewMode] = useState("pc"); // "pc" hoặc "mobile"

  // Lấy danh sách blog
  useEffect(() => {
    axios
      .get(`${API_PREFIX}/api/admin/blog-posts`)
      .then((res) => setBlogList(res.data))
      .catch(() => setBlogList([]));
  }, []);

  // Đổi trạng thái bài blog
  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updatedBlog = { ...blog, status: newStatus };
    try {
      await axios.put(
        `${API_PREFIX}/api/admin/blog-posts/${blog.id}`,
        updatedBlog
      );
      setBlogList((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, status: newStatus } : b))
      );
    } catch (e) {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  // Khi mở bài mới thì về tab PC mặc định
  useEffect(() => {
    if (selectedBlog) setViewMode("pc");
  }, [selectedBlog]);

  return (
    <div className="blog-list-wrapper">
      <h2>Danh sách bài viết Blog</h2>
      <table className="custom-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tiêu đề</th>
            <th>Người viết</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Xem</th>
          </tr>
        </thead>
        <tbody>
          {blogList.map((b, idx) => (
            <tr key={b.id}>
              <td>{idx + 1}</td>
              <td style={{ fontWeight: 600 }}>{b.title}</td>
              <td>{b.createdBy === 1 ? "Admin" : "User"}</td>
              <td>{b.createdAt?.slice(0, 16).replace("T", " ")}</td>
              <td>
                <button
                  style={{
                    background:
                      b.status === "PUBLISHED" ? "#16c784" : "#f0ad4e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "2px 10px",
                    cursor: "pointer",
                  }}
                  title="Bấm để chuyển trạng thái"
                  onClick={() => handleToggleStatus(b)}
                >
                  {b.status}
                </button>
              </td>
              <td>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                  title="Xem bài viết"
                  onClick={() => setSelectedBlog(b)}
                >
                  👁️
                </button>
              </td>
            </tr>
          ))}
          {blogList.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                Không có bài viết nào
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal xem chi tiết bài viết với 2 chế độ PC/Mobile */}
      {selectedBlog && (
        <div className="modal-view">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedBlog(null)}>
              ✖
            </button>
            <div style={{ marginBottom: 16 }}>
              <button
                className={viewMode === "pc" ? "tab-btn active" : "tab-btn"}
                onClick={() => setViewMode("pc")}
              >
                Xem bản Desktop
              </button>
              <button
                className={viewMode === "mobile" ? "tab-btn active" : "tab-btn"}
                onClick={() => setViewMode("mobile")}
              >
                Xem bản Mobile
              </button>
            </div>
            <h2>{selectedBlog.title}</h2>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>
              {selectedBlog.createdByName || "Admin"} -{" "}
              {selectedBlog.createdAt?.slice(0, 16).replace("T", " ")}
            </div>
            <div
              className={viewMode === "mobile" ? "blog-preview-mobile" : ""}
              dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBlog;

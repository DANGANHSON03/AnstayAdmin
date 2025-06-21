import React, { useState } from "react";
import axios from "axios";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

import "./Blog.css";

// Cấu hình domain backend
const API_IMAGE_PREFIX = "https://anstay.com.vn";

// Hàm upload ảnh luôn trả về url có domain
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await axios.post(
      `${API_IMAGE_PREFIX}/api/images/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    let url = response.data.url;
    if (url && url.startsWith("/")) {
      url = API_IMAGE_PREFIX + url;
    }
    return url;
  } catch (err) {
    alert("Upload ảnh thất bại!");
    return "";
  }
};

const fontFamilies = [
  { label: "Mặc định", value: "" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
];

const fontSizes = [
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
  { label: "64", value: "64px" },
];

// Hàm lấy text thuần từ HTML
function stripHtml(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Hàm fix url /uploads/... thành url đầy đủ domain
const fixUrl = (url) =>
  url && url.startsWith("/") ? API_IMAGE_PREFIX + url : url;

// Hàm fix url ảnh trong nội dung (<img src="/uploads/...">)
const fixContentImageUrls = (html) =>
  html.replace(/<img\s+[^>]*src="(\/uploads\/[^"]+)"/g, (match, p1) =>
    match.replace(p1, API_IMAGE_PREFIX + p1)
  );

const Blog = () => {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [fontSizeInput, setFontSizeInput] = useState("16px");
  const [imgWidth, setImgWidth] = useState("");
  const [imgHeight, setImgHeight] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [status] = useState("DRAFT");
  const [summary, setSummary] = useState(""); // <-- Thêm state cho tóm tắt

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: true, linkOnPaste: true, autolink: true }),
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            fontSize: {
              default: "16px",
              parseHTML: (element) => element.style.fontSize || "16px",
              renderHTML: (attributes) => {
                if (!attributes.fontSize) return {};
                return { style: `font-size: ${attributes.fontSize}` };
              },
            },
          };
        },
      }),
      FontFamily.configure({ types: ["textStyle"] }),
      Placeholder.configure({
        placeholder: "Nhập nội dung bài viết ở đây...",
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    onCreate: ({ editor }) => {
      editor.chain().focus().setMark("textStyle", { fontSize: "16px" }).run();
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive("image")) {
        const attrs = editor.getAttributes("image");
        setImgWidth(attrs.width || "");
        setImgHeight(attrs.height || "");
      } else {
        setImgWidth("");
        setImgHeight("");
      }
    },
  });

  // Upload thumbnail ảnh đại diện
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setThumbnail(url);
  };

  // Upload ảnh chèn vào nội dung bài
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = await uploadImage(file);
    if (imageUrl) editor.chain().focus().setImage({ src: imageUrl }).run();
  };

  const handleInsertLink = () => {
    const url = prompt("Dán link hoặc nhập URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleFontChange = (e) => {
    const font = e.target.value;
    editor.chain().focus().setFontFamily(font).run();
  };

  const handleFontSizeDropdown = (e) => {
    const val = e.target.value;
    setFontSizeInput(val);
    if (!editor) return;
    if (val) {
      const { empty } = editor.state.selection;
      if (empty) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: 0, to: editor.state.doc.content.size })
          .setMark("textStyle", { fontSize: val })
          .run();
      } else {
        editor.chain().focus().setMark("textStyle", { fontSize: val }).run();
      }
    }
  };

  const handleDeleteImage = () => {
    if (editor && editor.isActive("image")) {
      editor.chain().focus().deleteSelection().run();
      setImgWidth("");
      setImgHeight("");
    }
  };

  const handleImageWidthChange = (e) => {
    const width = e.target.value;
    setImgWidth(width);
    if (editor && editor.isActive("image")) {
      const attrs = editor.getAttributes("image");
      editor
        .chain()
        .focus()
        .setImage({ ...attrs, width: width ? Number(width) : null })
        .run();
    }
  };

  const handleImageHeightChange = (e) => {
    const height = e.target.value;
    setImgHeight(height);
    if (editor && editor.isActive("image")) {
      const attrs = editor.getAttributes("image");
      editor
        .chain()
        .focus()
        .setImage({ ...attrs, height: height ? Number(height) : null })
        .run();
    }
  };

  // Hàm tạo slug tự động từ tiêu đề
  const createSlug = (title) =>
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Gửi bài blog lên BE
  const handleSave = async () => {
    setSaving(true);

    const slug = createSlug(title);
    const fixedThumbnail = fixUrl(thumbnail);
    const fixedContent = fixContentImageUrls(editor.getHTML());

    // Nếu user không nhập summary thì tự sinh
    let summaryAuto = summary?.trim();
    if (!summaryAuto) {
      summaryAuto = stripHtml(fixedContent).slice(0, 180); // lấy 180 ký tự đầu
    }

    const payload = {
      title,
      slug,
      content: fixedContent,
      summary: summaryAuto,
      thumbnail: fixedThumbnail,
      status,
      createdBy: 1,
    };

    console.log("Payload gửi backend:", payload);

    try {
      const response = await axios.post(
        `${API_IMAGE_PREFIX}/api/admin/blog-posts`,
        payload
      );
      console.log("Kết quả lưu bài viết:", response.data);
      alert("Lưu bài viết thành công!");
      setTitle("");
      setThumbnail("");
      setSummary("");
      editor.commands.clearContent();
    } catch (e) {
      alert("Có lỗi khi lưu bài viết!");
    }
    setSaving(false);
  };

  return (
    <div className="blog-admin">
      <h2>Viết bài Blog mới (Admin)</h2>

      {/* THUMBNAIL UPLOAD */}
      <div className="thumbnail-row">
        <div className="thumbnail-label">
          Ảnh đại diện (thumbnail):
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="thumbnail-input"
            style={{ display: "none" }}
            id="thumbnail-upload"
          />
          <button
            type="button"
            className="thumbnail-btn"
            onClick={() => document.getElementById("thumbnail-upload").click()}
          >
            {thumbnail ? "Đổi ảnh" : "Chọn ảnh"}
          </button>
        </div>
        {thumbnail ? (
          <div className="thumbnail-preview">
            <img src={fixUrl(thumbnail)} alt="thumbnail" />
          </div>
        ) : (
          <div className="thumbnail-preview thumbnail-empty">Chưa có ảnh</div>
        )}
      </div>

      <div className="title-row">
        <input
          type="text"
          placeholder="Tiêu đề bài viết"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="blog-title-input"
        />
      </div>

      {/* Nhập summary (tóm tắt) tuỳ chọn */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          placeholder="Tóm tắt bài viết (có thể để trống, sẽ tự sinh)"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="blog-summary-input"
          style={{
            width: "100%",
            minHeight: 50,
            borderRadius: 6,
            border: "1px solid #ddd",
            padding: 8,
            fontSize: 15,
          }}
        />
      </div>

      <div className="blog-toolbar">
        <div className="toolbar-group">
          <select
            className="font-family-select"
            onChange={handleFontChange}
            defaultValue=""
            title="Font chữ"
          >
            {fontFamilies.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            className="font-size-select"
            value={fontSizeInput}
            onChange={handleFontSizeDropdown}
            title="Cỡ chữ"
          >
            {fontSizes.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-group align-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Căn trái"
            className="icon-btn"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="2" y="4" width="16" height="2" fill="#444" />
              <rect x="2" y="9" width="10" height="2" fill="#444" />
              <rect x="2" y="14" width="14" height="2" fill="#444" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Căn giữa"
            className="icon-btn"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="4" y="4" width="12" height="2" fill="#444" />
              <rect x="2" y="9" width="16" height="2" fill="#444" />
              <rect x="5" y="14" width="10" height="2" fill="#444" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Căn phải"
            className="icon-btn"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="2" y="4" width="16" height="2" fill="#444" />
              <rect x="8" y="9" width="10" height="2" fill="#444" />
              <rect x="4" y="14" width="14" height="2" fill="#444" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Căn đều"
            className="icon-btn"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="2" y="4" width="16" height="2" fill="#444" />
              <rect x="2" y="9" width="16" height="2" fill="#444" />
              <rect x="2" y="14" width="16" height="2" fill="#444" />
            </svg>
          </button>
        </div>
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <b>B</b>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <i>I</i>
          </button>
          <button onClick={handleInsertLink} title="Chèn Link">
            🔗
          </button>
          <button onClick={handleRemoveLink} title="Xoá Link">
            ❌
          </button>
          <label title="Chèn ảnh" className="toolbar-image-btn">
            <span role="img" aria-label="Ảnh">
              🖼️
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
          {editor && editor.isActive("image") && (
            <>
              <input
                className="image-size-input"
                type="number"
                min="30"
                max="1200"
                placeholder="Width"
                value={imgWidth}
                style={{ width: 70, marginLeft: 8 }}
                onChange={handleImageWidthChange}
              />
              <input
                className="image-size-input"
                type="number"
                min="30"
                max="1200"
                placeholder="Height"
                value={imgHeight}
                style={{ width: 70, marginLeft: 4 }}
                onChange={handleImageHeightChange}
              />
              <button
                className="delete-image-btn"
                onClick={handleDeleteImage}
                title="Xoá ảnh đang chọn"
                style={{ marginLeft: 4 }}
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
      <div className="editor-row">
        <div className="blog-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
      <button className="save-btn" disabled={saving} onClick={handleSave}>
        {saving ? "Đang lưu..." : "Lưu bài viết"}
      </button>
    </div>
  );
};

export default Blog;

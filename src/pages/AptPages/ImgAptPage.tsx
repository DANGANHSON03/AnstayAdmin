import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ImgApt from "../../components/can-ho/ImgApt";

export default function ImgAptPage() {
  return (
    <>
      <PageMeta
        title="Thêm ảnh căn hộ"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Ảnh căn hộ" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách ảnh căn hộ">
          <ImgApt />
        </ComponentCard>
      </div>
    </>
  );
}

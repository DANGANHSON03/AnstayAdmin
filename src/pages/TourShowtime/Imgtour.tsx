import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import ImgTourOne from "../../components/tourshowtime/ImgTourOne";

export default function Imgtour() {
  return (
    <>
      <PageMeta
        title="Thêm ảnh tour"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Thêm ảnh tour" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách ảnh tour">
          <ImgTourOne />
        </ComponentCard>
      </div>
    </>
  );
}

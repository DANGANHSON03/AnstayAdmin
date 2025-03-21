import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import TourOne from "../../components/tourshowtime/TourOne";

export default function Tour() {
  return (
    <>
      <PageMeta
        title="Thêm thông tin tour"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tour" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách tour">
          <TourOne />
        </ComponentCard>
      </div>
    </>
  );
}

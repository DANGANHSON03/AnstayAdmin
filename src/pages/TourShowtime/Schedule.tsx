import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import ScheduleTourOne from "../../components/tourshowtime/ScheduleTourOne";

export default function Schedule() {
  return (
    <>
      <PageMeta
        title="Lich trình tour"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Lịch trình" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách lịch trình tour">
          <ScheduleTourOne />
        </ComponentCard>
      </div>
    </>
  );
}

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Apt from "../../components/can-ho/Apt";

export default function AptPage() {
  return (
    <>
      <PageMeta
        title="Thêm căn hộ"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Căn hộ" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách căn hộ">
          <Apt />
        </ComponentCard>
      </div>
    </>
  );
}

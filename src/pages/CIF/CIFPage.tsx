import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CIF from "../../components/CIF/CIF";

export default function CIFPage() {
  return (
    <>
      <PageMeta
        title="Người dùng"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Người dùng" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách người dùng">
          <CIF />
        </ComponentCard>
      </div>
    </>
  );
}

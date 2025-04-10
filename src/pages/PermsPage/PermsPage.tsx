import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Perms from "../../components/Perms/Perms";

export default function PermsPage() {
  return (
    <>
      <PageMeta
        title="Quyền"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Phân quyền" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách và quyền">
          <Perms />
        </ComponentCard>
      </div>
    </>
  );
}

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import HistoryAptOne from "../../components/HistoryOne/HistoryAptOne";

export default function HistoryAptPage() {
  return (
    <>
      <PageMeta
        title="Lịch sử căn hộ"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Lịch sử căn hộ" />
      <div className="space-y-6">
        <ComponentCard title="Lịch sử căn hộ">
          <HistoryAptOne />
        </ComponentCard>
      </div>
    </>
  );
}

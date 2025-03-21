import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import HistoryTourOne from "../../components/HistoryOne/HistoryTourOne";

export default function HistoryTourPage() {
  return (
    <>
      <PageMeta
        title="Lịch sử Tour"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Lịch sử Tour" />
      <div className="space-y-6">
        <ComponentCard title="Lịch sử Tour">
          <HistoryTourOne />
        </ComponentCard>
      </div>
    </>
  );
}

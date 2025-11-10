import PromotionForm from "@/components/PromotionForm";

export default function PromotionsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Promotions</h1>
      <PromotionForm />
    </div>
  );
}
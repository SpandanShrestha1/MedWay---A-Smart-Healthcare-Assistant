import { MedicineFilterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "../../components/ui/button";

export function PharmacistMedicineFilter({ filters, handleFilter }) {
  return (
    <div className="bg-white rounded-lg shadow-md mb-4 p-4">
      {Object.keys(MedicineFilterOptions).map((section) => (
        <div key={section} className="mb-4">
          <h3 className="font-semibold capitalize mb-2">{section}</h3>

          <div className="flex flex-wrap gap-2">
            {MedicineFilterOptions[section].map((option) => {
              const active = filters?.[section] === option.id;

              return (
                <Button
                  key={option.id}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilter(section, option.id)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          <Separator className="mt-4" />
        </div>
      ))}
    </div>
  );
}

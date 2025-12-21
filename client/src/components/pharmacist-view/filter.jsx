import { OrderFilterOptions } from "../../config";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export function OrderFilter({ filters, handleFilter }) {
  return (
    <div className="bg-background rounded-lg shadow-md mb-4">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Filter Orders</h2>
      </div>

      <div className="p-4 space-y-4">
        {Object.keys(OrderFilterOptions).map((section) => (
          <div key={section}>
            <h3 className="font-semibold capitalize mb-2">{section}</h3>

            <div className="flex flex-wrap gap-2">
              {OrderFilterOptions[section].map((option) => {
                const isActive = filters?.[section]?.includes(option.id);

                return (
                  <Button
                    key={option.id}
                    variant={isActive ? "default" : "outline"}
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
    </div>
  );
}

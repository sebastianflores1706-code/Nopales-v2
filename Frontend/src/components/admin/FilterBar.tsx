import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  filters?: { label: string; options: FilterOption[]; value?: string; onChange?: (v: string) => void }[];
  onSearch?: (value: string) => void;
  onToggleFiltros?: () => void;
  filtrosActivos?: boolean;
}

export function FilterBar({ searchPlaceholder = "Buscar...", filters = [], onSearch, onToggleFiltros, filtrosActivos }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 h-9 text-sm"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {filters.map((filter, i) => (
        <Select key={i} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {onToggleFiltros && (
        <Button
          variant={filtrosActivos ? "default" : "outline"}
          size="sm"
          className="h-9 gap-2"
          onClick={onToggleFiltros}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros{filtrosActivos ? " •" : ""}
        </Button>
      )}
      {!onToggleFiltros && (
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      )}
    </div>
  );
}

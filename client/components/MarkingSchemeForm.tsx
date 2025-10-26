import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamType, MarkingScheme, MarkingSchemeItem } from "@shared/types";

interface Props {
  types: ExamType[]; // [{id, name}] or strings
  value: MarkingScheme;
  onChange: (m: MarkingScheme) => void;
}

// Default marking scheme (you can tweak these defaults)
const DEFAULT_POSITIVE = 1;
const DEFAULT_NEGATIVE = 0;

export function MarkingSchemeForm({ types, value, onChange }: Props) {
  const items = value?.items ?? [];

  const getId = (t: ExamType) =>
    typeof t === "string" ? t : "id" in t ? t.id : String(t);
  const getLabel = (t: ExamType) =>
    typeof t === "string" ? t : "name" in t ? t.name : String(t);

  // Apply defaults to ensure every exam type has initial values
  const filledItems: MarkingSchemeItem[] = types.map((t) => {
    const typeId = getId(t);
    const existing = items.find((it) => getId(it.type) === typeId);
    return (
      existing ?? {
        type: t,
        positive: DEFAULT_POSITIVE,
        negative: DEFAULT_NEGATIVE,
      }
    );
  });

  const setItem = (
    type: ExamType,
    field: keyof Omit<MarkingSchemeItem, "type">,
    num: number
  ) => {
    const typeId = getId(type);
    const next = filledItems.map((it) =>
      getId(it.type) === typeId ? { ...it, [field]: num } : it
    );
    onChange({ items: next });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marking Scheme</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {filledItems.map((item) => {
          const typeId = String(getId(item.type));
          const typeLabel = getLabel(item.type);

          return (
            <div key={typeId} className="grid grid-cols-1 gap-3 items-center">
              <div className="font-medium">{typeLabel}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`positive-${typeId}`} className="text-xs">
                    + marks
                  </Label>
                  <Input
                    id={`positive-${typeId}`}
                    name={`positive-${typeId}`}
                    type="number"
                    value={item.positive ?? DEFAULT_POSITIVE}
                    onChange={(e) =>
                      setItem(item.type, "positive", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`negative-${typeId}`} className="text-xs">
                    - marks
                  </Label>
                  <Input
                    id={`negative-${typeId}`}
                    name={`negative-${typeId}`}
                    type="number"
                    value={item.negative ?? DEFAULT_NEGATIVE}
                    onChange={(e) =>
                      setItem(item.type, "negative", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

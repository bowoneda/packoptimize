"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface OptimizationOptions {
  carrier: string;
  optimizeFor: string;
  fillMaterial: string;
  includeFlatRate: boolean;
  maxBoxes: number;
}

interface OptionsConfigProps {
  options: OptimizationOptions;
  onChange: (options: OptimizationOptions) => void;
  onBack: () => void;
  onRun: () => void;
  isRunning: boolean;
}

export function OptionsConfig({
  options,
  onChange,
  onBack,
  onRun,
  isRunning,
}: OptionsConfigProps) {
  const update = (partial: Partial<OptimizationOptions>) => {
    onChange({ ...options, ...partial });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm">Carrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={options.carrier} onValueChange={(v) => update({ carrier: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FEDEX">FedEx</SelectItem>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="USPS">USPS</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm">Optimize For</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={options.optimizeFor} onValueChange={(v) => update({ optimizeFor: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COST">Lowest Cost</SelectItem>
                <SelectItem value="SPACE">Best Space Utilization</SelectItem>
                <SelectItem value="FEWEST_BOXES">Fewest Boxes</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm">Fill Material</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={options.fillMaterial} onValueChange={(v) => update({ fillMaterial: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AIR_PILLOWS">Air Pillows</SelectItem>
                <SelectItem value="KRAFT_PAPER">Kraft Paper</SelectItem>
                <SelectItem value="BUBBLE_WRAP">Bubble Wrap</SelectItem>
                <SelectItem value="PACKING_PEANUTS">Packing Peanuts</SelectItem>
                <SelectItem value="FOAM_IN_PLACE">Foam-in-Place</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm">Max Boxes</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min={1}
              max={50}
              value={options.maxBoxes}
              onChange={(e) => update({ maxBoxes: parseInt(e.target.value) || 10 })}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={options.includeFlatRate}
          onCheckedChange={(v) => update({ includeFlatRate: v })}
        />
        <Label>Include USPS Flat Rate Comparison</Label>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" className="w-full sm:w-auto rounded-full" onClick={onBack}>
          Back
        </Button>
        <Button className="w-full sm:w-auto bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md hover:shadow-[0_20px_40px_-10px_rgba(11,66,40,0.15)] active:scale-95 transition-all duration-300 min-h-[44px] px-5 sm:px-6" onClick={onRun} disabled={isRunning}>
          {isRunning ? "Optimizing..." : "Run Optimization"}
        </Button>
      </div>
    </div>
  );
}

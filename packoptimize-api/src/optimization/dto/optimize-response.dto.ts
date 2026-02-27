import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PlacementDto {
  @ApiProperty() itemId!: string;
  @ApiProperty() sku!: string;
  @ApiProperty() name!: string;
  @ApiProperty() x!: number;
  @ApiProperty() y!: number;
  @ApiProperty() z!: number;
  @ApiProperty() width!: number;
  @ApiProperty() height!: number;
  @ApiProperty() depth!: number;
  @ApiProperty() originalWidth!: number;
  @ApiProperty() originalHeight!: number;
  @ApiProperty() originalDepth!: number;
  @ApiProperty() weight!: number;
  @ApiProperty() rotation!: number;
  @ApiProperty() isFragile!: boolean;
}

class SurchargeDto {
  @ApiProperty() type!: string;
  @ApiProperty() amount!: number;
  @ApiProperty() reason!: string;
}

class VoidFillDto {
  @ApiProperty() voidVolumeCubicMm!: number;
  @ApiProperty() voidVolumeCubicIn!: number;
  @ApiProperty() fillWeightGrams!: number;
  @ApiProperty() fillCostUsd!: number;
  @ApiProperty() materialUsed!: string;
}

class RoundedDimsDto {
  @ApiProperty() length!: number;
  @ApiProperty() width!: number;
  @ApiProperty() height!: number;
}

class PackedBoxDto {
  @ApiProperty() boxId!: string;
  @ApiProperty() boxName!: string;
  @ApiProperty() boxIndex!: number;
  @ApiProperty({ type: [PlacementDto] }) placements!: PlacementDto[];
  @ApiProperty() utilization!: number;
  @ApiProperty() itemsWeight!: number;
  @ApiProperty() boxWeight!: number;
  @ApiProperty() fillWeight!: number;
  @ApiProperty() totalWeight!: number;
  @ApiProperty() dimWeightGrams!: number;
  @ApiProperty() billableWeightGrams!: number;
  @ApiProperty({ type: RoundedDimsDto }) roundedOuterDims!: RoundedDimsDto;
  @ApiProperty() boxMaterialCost!: number;
  @ApiProperty() estimatedShippingCost!: number;
  @ApiProperty({ type: [SurchargeDto] }) surcharges!: SurchargeDto[];
  @ApiProperty() totalCost!: number;
  @ApiProperty({ type: VoidFillDto }) voidFill!: VoidFillDto;
  @ApiProperty({ type: [String] }) packInstructions!: string[];
}

class UnpackedItemDto {
  @ApiProperty() itemId!: string;
  @ApiProperty() sku!: string;
  @ApiProperty() name!: string;
  @ApiProperty() reason!: string;
}

class FlatRateOptionDto {
  @ApiProperty() carrier!: string;
  @ApiProperty() boxName!: string;
  @ApiProperty() price!: number;
  @ApiProperty() maxWeight!: number;
  @ApiProperty() itemsFit!: boolean;
  @ApiProperty() totalWeight!: number;
  @ApiProperty() savings!: number;
}

export class OptimizeResponseDto {
  @ApiProperty() success!: boolean;
  @ApiProperty({ type: [PackedBoxDto] }) packedBoxes!: PackedBoxDto[];
  @ApiProperty({ type: [UnpackedItemDto] }) unpackedItems!: UnpackedItemDto[];
  @ApiProperty() totalBoxes!: number;
  @ApiProperty() totalCost!: number;
  @ApiProperty() totalWeight!: number;
  @ApiProperty() totalBillableWeight!: number;
  @ApiProperty() averageUtilization!: number;
  @ApiProperty() naiveCost!: number;
  @ApiProperty() optimizedCost!: number;
  @ApiProperty() savingsAmount!: number;
  @ApiProperty() savingsPercent!: number;
  @ApiPropertyOptional({ type: [FlatRateOptionDto] }) flatRateOptions?: FlatRateOptionDto[];
  @ApiProperty() algorithm!: string;
  @ApiProperty() executionTimeMs!: number;
  @ApiProperty() carrier!: string;
}

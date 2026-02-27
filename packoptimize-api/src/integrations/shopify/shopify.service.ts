import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { selectOptimalBoxes } from '../../optimization/engine/box-selector';
import { compareFlatRateOptions } from '../../optimization/engine/flat-rate-comparator';
import {
  AvailableBox,
  CarrierRules,
  CarrierType,
  OptimizationOptions,
  PackableItem,
} from '../../optimization/engine/types';
import { ShopifyRateRequestDto } from './dto/shopify-rate-request.dto';

export interface ShopifyRateResponse {
  service_name: string;
  service_code: string;
  total_price: number;
  description: string;
  currency: string;
  min_delivery_date: string;
  max_delivery_date: string;
}

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculateRates(
    tenantId: string,
    dto: ShopifyRateRequestDto,
  ): Promise<{ rates: ShopifyRateResponse[] }> {
    return this.prisma.withTenantContext(async (tx) => {
      const shopifyItems = dto.rate.items;

      // 1. Try to match items by SKU in tenant catalog
      const skus = shopifyItems
        .map((i) => i.sku)
        .filter((s): s is string => !!s);

      const catalogItems = skus.length > 0
        ? await tx.item.findMany({ where: { tenantId, sku: { in: skus } } })
        : [];

      const skuMap = new Map(catalogItems.map((i) => [i.sku, i]));

      // 2. Build packable items — use catalog data when available, estimate from Shopify grams otherwise
      const packableItems: PackableItem[] = shopifyItems.map((si, idx) => {
        const catalogItem = si.sku ? skuMap.get(si.sku) : undefined;

        if (catalogItem) {
          return {
            id: catalogItem.id,
            sku: catalogItem.sku,
            name: catalogItem.name,
            width: catalogItem.width,
            height: catalogItem.height,
            depth: catalogItem.depth,
            weight: catalogItem.weight,
            isFragile: catalogItem.isFragile,
            canRotate: catalogItem.canRotate,
            maxStackWeight: catalogItem.maxStackWeight,
            quantity: si.quantity,
          };
        }

        // Estimate dimensions from weight for unknown items
        // Rough cube estimate: assume density of ~0.5g/cm³
        const volumeCm3 = Math.max(si.grams / 0.5, 100);
        const side = Math.round(Math.cbrt(volumeCm3) * 10); // in mm

        return {
          id: `shopify-${idx}`,
          sku: si.sku ?? `SHOPIFY-${idx}`,
          name: si.name,
          width: side,
          height: side,
          depth: side,
          weight: si.grams,
          isFragile: false,
          canRotate: true,
          maxStackWeight: null,
          quantity: si.quantity,
        };
      });

      // 3. Load tenant's box types
      const dbBoxTypes = await tx.boxType.findMany({
        where: { tenantId, isActive: true },
      });

      if (dbBoxTypes.length === 0) {
        return { rates: [] };
      }

      const availableBoxes: AvailableBox[] = dbBoxTypes.map((b) => ({
        id: b.id,
        name: b.name,
        innerWidth: b.innerWidth,
        innerHeight: b.innerHeight,
        innerDepth: b.innerDepth,
        outerWidth: b.outerWidth,
        outerHeight: b.outerHeight,
        outerDepth: b.outerDepth,
        boxWeight: b.boxWeight,
        maxWeight: b.maxWeight,
        cost: b.cost,
      }));

      // 4. Load carrier rules (default to USPS for Shopify)
      const carrier: CarrierType = 'USPS';
      const dbCarrierRules = await tx.carrierConstraint.findFirst({
        where: { carrier },
        orderBy: { effectiveDate: 'desc' },
      });

      if (!dbCarrierRules) {
        return { rates: [] };
      }

      const surchargeRates = (dbCarrierRules.surchargeRates as Record<string, number>) ?? {};
      const carrierRules: CarrierRules = {
        carrier,
        maxLengthInches: dbCarrierRules.maxLengthInches,
        maxGirthInches: dbCarrierRules.maxGirthInches,
        maxWeightLbs: dbCarrierRules.maxWeightLbs,
        dimDivisor: dbCarrierRules.dimDivisor,
        ahsCubicThreshold: dbCarrierRules.ahsCubicThreshold,
        oversizeCubicThreshold: dbCarrierRules.oversizeCubicThreshold,
        ahsLengthThreshold: dbCarrierRules.ahsLengthThreshold,
        ahsWidthThreshold: dbCarrierRules.ahsWidthThreshold,
        ahsMinBillableWeight: dbCarrierRules.ahsMinBillableWeight,
        surchargeRates: {
          ahsDimension: surchargeRates['ahs'] ?? surchargeRates['ahsDimension'],
          ahsWeight: surchargeRates['ahsWeight'],
          oversize: surchargeRates['oversize'],
          unauthorized: surchargeRates['unauthorized'],
        },
      };

      const options: OptimizationOptions = {
        carrier,
        optimizeFor: 'COST',
        maxBoxes: 10,
        includeFlatRate: true,
        fillMaterial: 'AIR_PILLOWS',
        insertMaterials: [],
        compatibilityRules: [],
      };

      // 5. Run optimization
      const { packedBoxes } = selectOptimalBoxes(
        packableItems,
        availableBoxes,
        carrierRules,
        options,
      );

      const totalCost = packedBoxes.reduce((s, b) => s + b.totalCost, 0);
      const avgUtilization = packedBoxes.length > 0
        ? packedBoxes.reduce((s, b) => s + b.utilization, 0) / packedBoxes.length
        : 0;

      // 6. Build Shopify-formatted rates
      const rates: ShopifyRateResponse[] = [];
      const currency = dto.rate.currency ?? 'USD';

      // Delivery date estimates (5-8 business days from now)
      const now = new Date();
      const minDate = new Date(now);
      minDate.setDate(minDate.getDate() + 5);
      const maxDate = new Date(now);
      maxDate.setDate(maxDate.getDate() + 8);
      const minDelivery = minDate.toISOString().split('T')[0];
      const maxDelivery = maxDate.toISOString().split('T')[0];

      // Primary rate: Optimized shipping
      rates.push({
        service_name: 'Optimized Ground Shipping',
        service_code: 'packoptimize_ground',
        total_price: Math.round(totalCost * 100), // Convert $ to cents
        description: `${packedBoxes.length} box${packedBoxes.length !== 1 ? 'es' : ''}, ${Math.round(avgUtilization * 100)}% avg utilization`,
        currency,
        min_delivery_date: minDelivery,
        max_delivery_date: maxDelivery,
      });

      // Check flat-rate options
      const flatRateOptions = compareFlatRateOptions(
        packableItems,
        totalCost,
        carrier,
      );

      const cheaperFlatRate = flatRateOptions.find((fr) => fr.itemsFit && fr.price < totalCost);
      if (cheaperFlatRate) {
        rates.push({
          service_name: `${cheaperFlatRate.boxName} (Flat Rate)`,
          service_code: 'packoptimize_flatrate',
          total_price: Math.round(cheaperFlatRate.price * 100),
          description: cheaperFlatRate.boxName,
          currency,
          min_delivery_date: minDelivery,
          max_delivery_date: maxDelivery,
        });
      }

      this.logger.log(
        `Shopify rates: ${rates.length} rates for ${shopifyItems.length} items, total $${(rates[0]?.total_price / 100).toFixed(2)}`,
      );

      return { rates };
    });
  }
}

export interface HardwareInfo {
  cpu: { usagePercentage: number; usageRatio: number };
  ram: { totalGB: string; usedGB: string; usagePercentage: string; usageRatio: number };
}

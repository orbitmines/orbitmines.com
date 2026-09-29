import type {CloudProvider, CloudRegion, Currency, UsageTreeNode} from './types';

export const CURRENCIES: Currency[] = [
  {code: 'USD', symbol: '$', name: 'US Dollar', rate: 1},
  {code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92},
  {code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79},
  {code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.5},
  {code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24},
  {code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 1320.5},
  {code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36},
  {code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53},
  {code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.88},
  {code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.1},
  {code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.97},
  {code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', rate: 17.15},
  {code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rate: 10.45},
  {code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rate: 10.62},
  {code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rate: 4.02},
  {code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 30.25},
  {code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34},
  {code: 'BTC', symbol: '₿', name: 'Bitcoin', rate: 0.0000105},
  {code: 'ETH', symbol: 'Ξ', name: 'Ethereum', rate: 0.000312},
  {code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 92.5},
];

export function createProviders(): CloudProvider[] {
  const awsRegions: CloudRegion[] = [
    {id: 'us-east-1', name: 'US East (N. Virginia)', storagePricePerGBMonth: 0.023, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.09, ingressPerGB: 0},
    {id: 'us-west-2', name: 'US West (Oregon)', storagePricePerGBMonth: 0.023, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.09, ingressPerGB: 0},
    {id: 'eu-west-1', name: 'EU (Ireland)', storagePricePerGBMonth: 0.023, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.09, ingressPerGB: 0},
    {id: 'eu-central-1', name: 'EU (Frankfurt)', storagePricePerGBMonth: 0.0245, putPer1000: 0.0054, getPer1000: 0.00043, listPer1000: 0.0054, deletePer1000: 0, egressPerGB: 0.09, ingressPerGB: 0},
    {id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', storagePricePerGBMonth: 0.025, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)', storagePricePerGBMonth: 0.025, putPer1000: 0.0047, getPer1000: 0.00037, listPer1000: 0.0047, deletePer1000: 0, egressPerGB: 0.114, ingressPerGB: 0},
    {id: 'sa-east-1', name: 'South America (São Paulo)', storagePricePerGBMonth: 0.0405, putPer1000: 0.007, getPer1000: 0.0006, listPer1000: 0.007, deletePer1000: 0, egressPerGB: 0.15, ingressPerGB: 0},
  ];
  const azureRegions: CloudRegion[] = [
    {id: 'eastus', name: 'East US', storagePricePerGBMonth: 0.018, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.087, ingressPerGB: 0},
    {id: 'westus2', name: 'West US 2', storagePricePerGBMonth: 0.018, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.087, ingressPerGB: 0},
    {id: 'westeurope', name: 'West Europe', storagePricePerGBMonth: 0.02, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.087, ingressPerGB: 0},
    {id: 'northeurope', name: 'North Europe', storagePricePerGBMonth: 0.018, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.087, ingressPerGB: 0},
    {id: 'southeastasia', name: 'Southeast Asia', storagePricePerGBMonth: 0.02, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'japaneast', name: 'Japan East', storagePricePerGBMonth: 0.022, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'brazilsouth', name: 'Brazil South', storagePricePerGBMonth: 0.035, putPer1000: 0.008, getPer1000: 0.0006, listPer1000: 0.008, deletePer1000: 0, egressPerGB: 0.16, ingressPerGB: 0},
  ];
  const gcloudRegions: CloudRegion[] = [
    {id: 'us-central1', name: 'Iowa (Single)', storagePricePerGBMonth: 0.02, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'us-east1', name: 'S. Carolina (Single)', storagePricePerGBMonth: 0.02, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'europe-west1', name: 'Belgium (Single)', storagePricePerGBMonth: 0.02, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'asia-east1', name: 'Taiwan (Single)', storagePricePerGBMonth: 0.02, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'nam4', name: 'Iowa+S.Carolina (Dual)', storagePricePerGBMonth: 0.036, putPer1000: 0.01, getPer1000: 0.0004, listPer1000: 0.01, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'eur4', name: 'Finland+Netherlands (Dual)', storagePricePerGBMonth: 0.036, putPer1000: 0.01, getPer1000: 0.0004, listPer1000: 0.01, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'us', name: 'US (Multi)', storagePricePerGBMonth: 0.026, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'eu', name: 'EU (Multi)', storagePricePerGBMonth: 0.026, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
    {id: 'asia', name: 'Asia (Multi)', storagePricePerGBMonth: 0.026, putPer1000: 0.005, getPer1000: 0.0004, listPer1000: 0.005, deletePer1000: 0, egressPerGB: 0.12, ingressPerGB: 0},
  ];
  return [
    {id: 'aws', name: 'AWS S3', enabled: true, selectedRegion: 'us-east-1', regions: awsRegions},
    {id: 'azure', name: 'Azure Blob', enabled: true, selectedRegion: 'eastus', regions: azureRegions},
    {id: 'gcloud', name: 'Google Cloud', enabled: true, selectedRegion: 'us-central1', gcRegionType: 'single', regions: gcloudRegions},
  ];
}

export function gcFilterRegions(
  regions: CloudRegion[],
  type: 'single' | 'dual' | 'multi',
): CloudRegion[] {
  if (type === 'single') return regions.filter((r) => r.name.includes('(Single)'));
  if (type === 'dual') return regions.filter((r) => r.name.includes('(Dual)'));
  return regions.filter((r) => r.name.includes('(Multi)'));
}

// Tree shape borrowed from the ray demo so the page has something to render.
// In due course this will come from `getAPI().getRepository(...)` instead.
export function createUsageTree(): UsageTreeNode {
  const KB = 1024;
  const MB = 1024 * 1024;
  const GB = 1024 * 1024 * 1024;
  return {
    name: 'library', isDirectory: true, storageBytes: 2.84 * GB,
    readOps: 14200, writeOps: 3400, networkEgressBytes: 890 * MB, networkIngressBytes: 420 * MB,
    children: [
      {
        name: 'src', isDirectory: true, storageBytes: 1.24 * GB,
        readOps: 8400, writeOps: 2100, networkEgressBytes: 540 * MB, networkIngressBytes: 260 * MB,
        children: [
          {name: 'Ray.ts', isDirectory: false, storageBytes: 340 * KB, readOps: 2200, writeOps: 480, networkEgressBytes: 120 * MB, networkIngressBytes: 45 * MB, children: []},
          {name: 'Router.ts', isDirectory: false, storageBytes: 28 * KB, readOps: 1800, writeOps: 320, networkEgressBytes: 80 * MB, networkIngressBytes: 30 * MB, children: []},
          {name: 'API.ts', isDirectory: false, storageBytes: 156 * KB, readOps: 1400, writeOps: 520, networkEgressBytes: 95 * MB, networkIngressBytes: 48 * MB, children: []},
          {name: 'IDELayout.ts', isDirectory: false, storageBytes: 210 * KB, readOps: 1200, writeOps: 280, networkEgressBytes: 68 * MB, networkIngressBytes: 32 * MB, children: []},
          {name: 'Markdown.ts', isDirectory: false, storageBytes: 92 * KB, readOps: 980, writeOps: 180, networkEgressBytes: 42 * MB, networkIngressBytes: 18 * MB, children: []},
          {name: 'Settings.ts', isDirectory: false, storageBytes: 48 * KB, readOps: 320, writeOps: 120, networkEgressBytes: 15 * MB, networkIngressBytes: 8 * MB, children: []},
        ],
      },
      {
        name: 'assets', isDirectory: true, storageBytes: 0.82 * GB,
        readOps: 3200, writeOps: 640, networkEgressBytes: 200 * MB, networkIngressBytes: 95 * MB,
        children: [
          {
            name: 'icons', isDirectory: true, storageBytes: 12 * MB,
            readOps: 1800, writeOps: 240, networkEgressBytes: 80 * MB, networkIngressBytes: 35 * MB,
            children: [
              {name: 'logo.svg', isDirectory: false, storageBytes: 4.2 * KB, readOps: 900, writeOps: 20, networkEgressBytes: 40 * MB, networkIngressBytes: 5 * MB, children: []},
              {name: 'favicon.ico', isDirectory: false, storageBytes: 15.4 * KB, readOps: 600, writeOps: 10, networkEgressBytes: 30 * MB, networkIngressBytes: 2 * MB, children: []},
            ],
          },
          {name: 'fonts', isDirectory: true, storageBytes: 2.4 * MB, readOps: 800, writeOps: 120, networkEgressBytes: 60 * MB, networkIngressBytes: 25 * MB, children: []},
        ],
      },
      {
        name: 'tests', isDirectory: true, storageBytes: 0.34 * GB,
        readOps: 1200, writeOps: 380, networkEgressBytes: 85 * MB, networkIngressBytes: 40 * MB,
        children: [
          {name: 'unit', isDirectory: true, storageBytes: 0.18 * GB, readOps: 800, writeOps: 240, networkEgressBytes: 55 * MB, networkIngressBytes: 25 * MB, children: []},
          {name: 'integration', isDirectory: true, storageBytes: 0.16 * GB, readOps: 400, writeOps: 140, networkEgressBytes: 30 * MB, networkIngressBytes: 15 * MB, children: []},
        ],
      },
      {
        name: 'docs', isDirectory: true, storageBytes: 0.44 * GB,
        readOps: 1400, writeOps: 280, networkEgressBytes: 65 * MB, networkIngressBytes: 25 * MB,
        children: [
          {name: 'README.md', isDirectory: false, storageBytes: 24 * KB, readOps: 800, writeOps: 60, networkEgressBytes: 30 * MB, networkIngressBytes: 10 * MB, children: []},
          {name: 'CHANGELOG.md', isDirectory: false, storageBytes: 18 * KB, readOps: 400, writeOps: 180, networkEgressBytes: 20 * MB, networkIngressBytes: 8 * MB, children: []},
        ],
      },
    ],
  };
}

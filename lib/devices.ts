
import type { DeviceDimensions, DeviceMode } from '@/lib/types';

export const DEVICE_PRESETS: Record<DeviceMode, DeviceDimensions> = {
  desktop: {
    width: 1440,
    label: 'Desktop',
  },
  tablet: {
    width: 768,
    label: 'Tablet',
  },
  mobile: {
    width: 390,
    label: 'Mobile',
  },
};

export const DEVICE_OPTIONS: Array<{
  mode: DeviceMode;
  label: string;
  width: number;
}> = [
  {
    mode: 'desktop',
    label: 'Desktop',
    width: DEVICE_PRESETS.desktop.width,
  },
  {
    mode: 'tablet',
    label: 'Tablet',
    width: DEVICE_PRESETS.tablet.width,
  },
  {
    mode: 'mobile',
    label: 'Mobile',
    width: DEVICE_PRESETS.mobile.width,
  },
];

export function getDeviceDimensions(
  mode: DeviceMode,
): DeviceDimensions {
  return DEVICE_PRESETS[mode];
}

export function getDeviceWidth(mode: DeviceMode): number {
  return DEVICE_PRESETS[mode].width;
}

export function getDeviceLabel(mode: DeviceMode): string {
  return DEVICE_PRESETS[mode].label;
}

export function isDeviceMode(value: string): value is DeviceMode {
  return value === 'desktop' || value === 'tablet' || value === 'mobile';
}

/**
 * Fit a device viewport inside the available preview area.
 * The returned scale never enlarges the viewport beyond its natural size.
 */
export function getPreviewScale(
  availableWidth: number,
  deviceWidth: number,
  horizontalPadding = 32,
): number {
  if (
    !Number.isFinite(availableWidth) ||
    !Number.isFinite(deviceWidth) ||
    availableWidth <= 0 ||
    deviceWidth <= 0
  ) {
    return 1;
  }

  const usableWidth = Math.max(1, availableWidth - horizontalPadding);

  return Math.min(1, usableWidth / deviceWidth);
}

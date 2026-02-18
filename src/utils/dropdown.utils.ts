import type { Band } from '../models/Band';
import type { Capability } from '../models/Capability';
import type { Location } from '../models/Location';

export function populateDropdown(
  selectId: string,
  items: Band[] | Capability[],
  valueKey: string,
  textKey: string,
  selectedValue?: number,
): void {
  const select = document.getElementById(selectId) as HTMLSelectElement;

  // Clear existing options except the first placeholder
  select.innerHTML = '<option value="">-- Select --</option>';

  for (const item of items) {
    const option = document.createElement('option');
    const value = String(item[valueKey as keyof typeof item]);
    option.value = value;
    option.textContent = String(item[textKey as keyof typeof item]);

    if (selectedValue && Number(value) === selectedValue) {
      option.selected = true;
    }

    select.appendChild(option);
  }
}

export function populateLocationSelect(
  selectId: string,
  locations: Location[],
  selectedIds?: number[],
): void {
  const select = document.getElementById(selectId) as HTMLSelectElement;
  select.innerHTML = '';

  for (const location of locations) {
    const option = document.createElement('option');
    option.value = String(location.locationId);
    option.textContent = `${location.locationName} (${location.city}, ${location.country})`;

    if (selectedIds?.includes(location.locationId)) {
      option.selected = true;
    }

    select.appendChild(option);
  }
}

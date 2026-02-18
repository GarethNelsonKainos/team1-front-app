export function clearValidationErrors(): void {
  const errorElements = document.querySelectorAll('.error-message');
  for (const el of errorElements) {
    el.textContent = '';
    el.classList.add('hidden');
  }

  const inputElements = document.querySelectorAll('.border-red-500');
  for (const el of inputElements) {
    el.classList.remove('border-red-500');
  }
}

export function showFieldError(
  fieldId: string,
  errorId: string,
  message: string,
): void {
  const errorElement = document.getElementById(errorId);
  const fieldElement = document.getElementById(fieldId);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }

  if (fieldElement) {
    fieldElement.classList.add('border-red-500');
  }
}

export function showFormMessage(
  message: string,
  type: 'success' | 'error',
): void {
  const messageElement = document.getElementById('formMessage');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className =
      type === 'success'
        ? 'text-green-600 mt-4 p-4 rounded-md bg-green-50'
        : 'text-red-600 mt-4 p-4 rounded-md bg-red-50';
    messageElement.classList.remove('hidden');
  }
}

export function getFormFieldValue(fieldId: string): string {
  const element = document.getElementById(fieldId) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement;
  return element?.value.trim() || '';
}

export function setFormFieldValue(
  fieldId: string,
  value: string | number,
): void {
  const element = document.getElementById(fieldId) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement;
  if (element) {
    element.value = String(value);
  }
}

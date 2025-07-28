/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(...classNames: string[]): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveStyle(css: string | Record<string, any>): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R
      toBeChecked(): R
      toBePartiallyChecked(): R
      toHaveFormValues(expectedValues: Record<string, any>): R
      toHaveDescription(text: string | RegExp): R
      toHaveErrorMessage(text: string | RegExp): R
      toBeEmptyDOMElement(): R
      toBeInvalid(): R
      toBeRequired(): R
      toBeValid(): R
      toHaveAccessibleDescription(text: string | RegExp): R
      toHaveAccessibleName(text: string | RegExp): R
      toHaveValue(value: string | string[] | number): R
    }
  }
}
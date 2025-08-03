// Type definitions for dynamic imports

export interface ComponentModule {
  default: React.ComponentType<any>;
}

export interface NamedExportModule<T extends string = string> {
  [key: string]: React.ComponentType<any>;
}

// Helper type to convert named export modules to default export modules
export type ToDefaultModule<T> = T extends { default: any } 
  ? T 
  : T extends Record<string, React.ComponentType<any>>
    ? { default: T[keyof T] }
    : never;

// Type-safe dynamic import function
export async function importWithNamedExport<T extends string>(
  importFn: () => Promise<Record<T, React.ComponentType<any>>>,
  exportName: T
): Promise<ComponentModule> {
  const moduleExports = await importFn();
  return {
    default: moduleExports[exportName]
  };
}

// Batch import helper
export async function importNamedExports<T extends Record<string, string>>(
  imports: {
    [K in keyof T]: {
      importFn: () => Promise<any>;
      exportName: T[K];
    }
  }
): Promise<Record<keyof T, ComponentModule>> {
  const entries = await Promise.all(
    Object.entries(imports).map(async ([key, { importFn, exportName }]) => {
      const moduleExports = await importFn();
      return [key, { default: moduleExports[exportName] }];
    })
  );
  
  return Object.fromEntries(entries) as Record<keyof T, ComponentModule>;
}
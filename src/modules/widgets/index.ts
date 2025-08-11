export type WidgetProps = {
  bookmarkId: string;
};

export type WidgetModule = {
  key: string;
  title: string;
  Component: React.ComponentType<WidgetProps>;
};

// Registry for widgets. Community modules can augment this via codegen or plugin loading later.
export const widgetRegistry: Record<string, WidgetModule> = {};

export function registerWidget(mod: WidgetModule) {
  widgetRegistry[mod.key] = mod;
}

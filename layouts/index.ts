// AMEXAN Universal Layouts - Barrel
// Constitutional Principle: One import surface for all 7 layout kinds.

export { ShellLayout } from './shell';
export type { ShellLayoutProps } from './shell';
export { PublicLayout } from './public';
export type { PublicLayoutProps } from './public';
export { AuthLayout } from './auth';
export type { AuthLayoutProps } from './auth';
export { DashboardLayout } from './dashboard';
export type { DashboardLayoutProps } from './dashboard';
export { WorkspaceLayout } from './workspace';
export type { WorkspaceLayoutProps } from './workspace';
export { FullscreenLayout } from './fullscreen';
export type { FullscreenLayoutProps } from './fullscreen';
export { OperationsLayout } from './operations';
export type { OperationsLayoutProps } from './operations';
export { useLayoutConfig, regionVisible, regionOrder } from './layout-shell';
export type { LayoutShellProps } from './layout-shell';

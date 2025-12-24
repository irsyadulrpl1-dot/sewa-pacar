import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: boolean;
}

/**
 * Responsive container with consistent max-width and padding
 */
export function ResponsiveContainer({
  children,
  className,
  size = "lg",
  padding = true,
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: "max-w-xl",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-7xl",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto",
        sizeClasses[size],
        padding && "px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
}

/**
 * Responsive grid with configurable columns per breakpoint
 */
export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = "md",
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const colClasses: string[] = [];
    
    if (cols.default) colClasses.push(`grid-cols-${cols.default}`);
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
    
    return colClasses.join(" ");
  };

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 md:gap-6",
    lg: "gap-6 md:gap-8",
  };

  return (
    <div className={cn("grid", getGridCols(), gapClasses[gap], className)}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: "vertical" | "horizontal" | "responsive";
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

/**
 * Flexible stack component that can switch between vertical and horizontal layouts
 */
export function ResponsiveStack({
  children,
  className,
  direction = "vertical",
  gap = "md",
  align = "stretch",
  justify = "start",
}: ResponsiveStackProps) {
  const directionClasses = {
    vertical: "flex-col",
    horizontal: "flex-row",
    responsive: "flex-col sm:flex-row",
  };

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction],
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

/**
 * Responsive text component with automatic size scaling
 */
export function ResponsiveText({
  children,
  className,
  as: Component = "p",
  size = "base",
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
    xl: "text-lg sm:text-xl md:text-2xl",
    "2xl": "text-xl sm:text-2xl md:text-3xl",
    "3xl": "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
    "4xl": "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  };

  return (
    <Component className={cn(sizeClasses[size], className)}>
      {children}
    </Component>
  );
}

/**
 * Hide/show elements based on screen size
 */
export function HideOnMobile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("hidden sm:block", className)}>{children}</div>;
}

export function ShowOnMobile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("block sm:hidden", className)}>{children}</div>;
}

export function HideOnDesktop({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("block lg:hidden", className)}>{children}</div>;
}

export function ShowOnDesktop({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("hidden lg:block", className)}>{children}</div>;
}

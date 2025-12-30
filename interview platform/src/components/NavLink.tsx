import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Enhanced NavLink component with better TypeScript support and documentation
 * 
 * @example
 * // Basic usage
 * <NavLink to="/dashboard" className="text-gray-600 hover:text-blue-600">
 *   Dashboard
 * </NavLink>
 * 
 * @example
 * // With active state styling
 * <NavLink 
 *   to="/dashboard" 
 *   className="text-gray-600 hover:text-blue-600"
 *   activeClassName="text-blue-600 font-bold border-b-2 border-blue-600"
 * >
 *   Dashboard
 * </NavLink>
 * 
 * @example
 * // With pending state styling
 * <NavLink 
 *   to="/dashboard" 
 *   className="text-gray-600 hover:text-blue-600"
 *   pendingClassName="opacity-50 animate-pulse"
 * >
 *   Dashboard
 * </NavLink>
 */
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  /** Base CSS classes applied to the link */
  className?: string;
  
  /** CSS classes applied when the link is active */
  activeClassName?: string;
  
  /** CSS classes applied when the link is in a pending state */
  pendingClassName?: string;
  
  /** Additional props passed to the underlying anchor element */
  [key: string]: any;
}

/**
 * Enhanced NavLink component that provides better TypeScript support
 * and className handling for React Router's NavLink.
 * 
 * This component automatically handles active and pending states
 * by applying the appropriate CSS classes.
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ 
    className, 
    activeClassName, 
    pendingClassName, 
    to, 
    children,
    ...props 
  }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            // Base classes
            className,
            // Active state classes
            isActive && activeClassName,
            // Pending state classes
            isPending && pendingClassName
          )
        }
        {...props}
      >
        {children}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };

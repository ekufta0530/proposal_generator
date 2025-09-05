/**
 * Client-side URL utilities for tenant switching and navigation
 * These functions can be used by React components and buttons
 */

export interface ClientUserContext {
  orgId: string;
  defaultTenant?: string;
}

/**
 * Forms a URL with org_id and tenant parameters for client-side navigation
 */
export function formClientUrl(
  basePath: string,
  userContext: ClientUserContext,
  options: {
    preserveParams?: boolean;
    forceTenant?: string;
  } = {}
): string {
  const { preserveParams = true, forceTenant } = options;
  
  const url = new URL(basePath, window.location.origin);
  
  // Always set org_id
  url.searchParams.set('org_id', userContext.orgId);
  
  // Set tenant (use forceTenant if provided, otherwise use defaultTenant)
  const tenantToUse = forceTenant || userContext.defaultTenant;
  if (tenantToUse) {
    url.searchParams.set('tenant', tenantToUse);
  }
  
  // Preserve other parameters if requested
  if (preserveParams) {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.forEach((value, key) => {
      if (key !== 'org_id' && key !== 'tenant') {
        url.searchParams.set(key, value);
      }
    });
  }
  
  return url.pathname + url.search;
}

/**
 * Forms a URL for tenant switching
 * This is specifically for when a user selects a different tenant
 */
export function formTenantSwitchUrl(
  basePath: string,
  userContext: ClientUserContext,
  newTenantId: string
): string {
  return formClientUrl(basePath, userContext, {
    preserveParams: true,
    forceTenant: newTenantId
  });
}

/**
 * Navigates to a URL with proper org_id and tenant parameters
 * This function handles the full page reload to trigger middleware
 */
export function navigateWithUserContext(
  basePath: string,
  userContext: ClientUserContext,
  options: {
    forceTenant?: string;
    preserveParams?: boolean;
  } = {}
): void {
  const url = formClientUrl(basePath, userContext, options);
  window.location.href = url;
}

/**
 * Switches to a different tenant and reloads the page
 * This is the main function for tenant switching buttons
 */
export function switchTenant(
  newTenantId: string,
  userContext: ClientUserContext,
  currentPath?: string
): void {
  const path = currentPath || window.location.pathname;
  const url = formTenantSwitchUrl(path, userContext, newTenantId);
  window.location.href = url;
}

/**
 * Gets user context from the current URL parameters
 * This can be used to extract org_id and tenant from the current page
 */
export function getUserContextFromUrl(): ClientUserContext | null {
  const params = new URLSearchParams(window.location.search);
  const orgId = params.get('org_id');
  const tenant = params.get('tenant');
  
  if (!orgId) {
    return null;
  }
  
  return {
    orgId,
    defaultTenant: tenant || undefined
  };
}

/**
 * Debug helper for client-side URL formation
 */
export function debugClientUrlFormation(
  originalUrl: string,
  newUrl: string,
  userContext: ClientUserContext,
  reason: string
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Client URL Formation] ${reason}:`, {
      original: originalUrl,
      new: newUrl,
      userContext,
      timestamp: new Date().toISOString()
    });
  }
}

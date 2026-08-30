import { describe, it, expect, beforeEach } from 'vitest';
import { saasStorage } from '@/lib/saas-storage';
import { canUseFeature } from '@/lib/checkPlanAccess';
import { formatFCFA } from '@/lib/utils';
import { isDrinkOrBarItem, isKitchenDish } from '@/lib/order-routing';

describe('SaaS Business Rules & Feature Access', () => {
  beforeEach(() => {
    // Reset test tenant state
    saasStorage.upgradeTenantPlan('tenant_starter_01', 'plan_starter', 1);
  });

  it('calculates FCFA currency formatting accurately with UEMOA standards', () => {
    expect(formatFCFA(15000)).toContain('15');
    expect(formatFCFA(15000)).toContain('FCFA');
    expect(formatFCFA(0)).toContain('0');
  });

  it('restricts Starter plan from KDS Kitchen Display System with 403 response', () => {
    const starterCheck = canUseFeature('tenant_starter_01', 'KITCHEN_DISPLAY_KDS');
    expect(starterCheck.allowed).toBe(false);
    expect(starterCheck.code).toBe('FEATURE_NOT_INCLUDED');
  });

  it('allows Pro plan access to KDS Kitchen Display System and Wave/OM payments', () => {
    const proCheck = canUseFeature('tenant_pro_01', 'KITCHEN_DISPLAY_KDS');
    expect(proCheck.allowed).toBe(true);

    const waveCheck = canUseFeature('tenant_pro_01', 'WAVE_ORANGE_MONEY');
    expect(waveCheck.allowed).toBe(true);
  });

  it('allows Premium VIP plan access to Multi-Zone and Multi-Language features', () => {
    const multiZoneCheck = canUseFeature('tenant_premium_01', 'MULTI_ZONE');
    expect(multiZoneCheck.allowed).toBe(true);

    const multiLangCheck = canUseFeature('tenant_premium_01', 'MULTI_LANGUAGE_MENU');
    expect(multiLangCheck.allowed).toBe(true);
  });

  it('enforces numeric limits on Starter plan photos limit (20 photos max)', () => {
    const validCountCheck = canUseFeature('tenant_starter_01', 'MAX_PHOTOS', 15);
    expect(validCountCheck.allowed).toBe(true);

    const exceededCountCheck = canUseFeature('tenant_starter_01', 'MAX_PHOTOS', 21);
    expect(exceededCountCheck.allowed).toBe(false);
    expect(exceededCountCheck.code).toBe('LIMIT_EXCEEDED');
  });

  it('upgrades tenant plan instantly upon successful payment checkout', () => {
    const upgradeResult = saasStorage.upgradeTenantPlan('tenant_starter_01', 'plan_pro', 1);
    expect(upgradeResult).not.toBeNull();
    expect(upgradeResult?.currentPlanId).toBe('plan_pro');

    const upgradedKdsCheck = canUseFeature('tenant_starter_01', 'KITCHEN_DISPLAY_KDS');
    expect(upgradedKdsCheck.allowed).toBe(true);
  });

  it('routes kitchen dishes vs bar drinks correctly to KDS screens', () => {
    const foodItem = { name: 'Ceebu Jën Penda Mbaye', category: 'Plats Chauds' };
    const drinkItem = { name: 'Jus de Bissap Glacé', category: 'Boissons & Cocktails' };

    expect(isKitchenDish(foodItem as any)).toBe(true);
    expect(isDrinkOrBarItem(drinkItem as any)).toBe(true);
  });
});

-- Safe additive schema change applied 2026-11-11.
-- Purchasable packs must not be priced as consumed fractions.
alter table public.rayku_supermarket_prices
  add column if not exists sale_mode text not null default 'envase';
alter table public.rayku_supermarket_prices
  drop constraint if exists rayku_supermarket_prices_sale_mode_check;
alter table public.rayku_supermarket_prices
  add constraint rayku_supermarket_prices_sale_mode_check
  check (sale_mode in ('envase', 'granel'));

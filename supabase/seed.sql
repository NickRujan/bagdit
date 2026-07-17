-- Six Bay City pilot offers (mirror of lib/seed-data.js).
-- Run after migration.sql. Edit/delete anytime from /admin.

insert into offers
  (business_name, neighborhood, category, headline, value_desc, the_ask, spots_total, spots_remaining, deadline, status)
values
  ('Riverside Taqueria', 'Water Street', 'food',
   'Tacos + drinks for two',
   'Dinner for two ~$40 → $0 + $25 cash',
   '30s vertical reel: the trompo, two tacos up close, one bite reaction. Tag the shop.',
   5, 5, '2026-08-15', 'open'),

  ('Third Shift Brewing', 'Midland Street', 'nightlife',
   'Flight + pint night for two',
   'Tab up to $35 → $0 + $20 cash',
   '30–45s: pour shot at the taps, patio vibe, cheers clip. Copyright-safe audio only.',
   4, 4, '2026-08-10', 'open'),

  ('Harbor Light Coffee', 'Downtown', 'food',
   'Breakfast + latte for two',
   'Order up to $28 → $0 + $15 cash',
   '30s: latte art pour, pastry case, window seat shot. Morning light preferred.',
   6, 6, '2026-08-20', 'open'),

  ('Saginaw Bay Boat Co.', 'Marina', 'activity',
   '2-hour pontoon rental',
   'Rental ~$180 → $0 + $50 cash',
   '45–60s: leaving the dock, open-water cruise, sunset if you can time it. Life jackets visible.',
   2, 2, '2026-08-08', 'open'),

  ('The Wenonah Motor Inn', 'Uptown', 'stay',
   'One weeknight stay',
   'Room ~$95 → $0 + $40 cash',
   '45s room tour: door-open reveal, bed, bathroom, the neon sign at night.',
   3, 3, '2026-08-30', 'open'),

  ('Brooklyn Boyz Pizza', 'Columbus Ave', 'food',
   'Large pizza + garlic knots',
   'Order ~$32 → $0 + $15 cash',
   '30s: cheese pull is mandatory. Counter, oven, box-open shot.',
   5, 5, '2026-08-25', 'open');

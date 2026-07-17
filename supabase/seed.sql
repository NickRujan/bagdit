-- Six Bay City pilot offers (mirror of lib/seed-data.js).
-- Run after migration.sql. Edit/delete anytime from /admin.

insert into offers
  (business_name, neighborhood, address, lat, lng, category, headline,
   retail_value, cash_bonus, the_ask, brief, spots_total, spots_remaining, deadline, status)
values
  ('Riverside Taqueria', 'Water Street', '912 Water St, Bay City, MI', 43.5962, -83.8873, 'food',
   'Tacos + drinks for two', '$40', 25,
   '30s vertical reel: the trompo, two tacos up close, one bite reaction.',
   'Film vertical (9:16), 30 seconds. Must-have shots: (1) the al pastor trompo spinning behind the counter, (2) close-up of two tacos on the blue table, (3) one honest bite + reaction. Tag @riversidetaqueria if you post. Natural sound or platform-licensed audio only. Best light is the window tables before 7pm.',
   5, 5, '2026-08-15', 'open'),

  ('Third Shift Brewing', 'Midland Street', '509 Midland St, Bay City, MI', 43.6009, -83.9021, 'nightlife',
   'Flight + pint night for two', '$35', 20,
   '30-45s: pour shot at the taps, patio vibe, cheers clip.',
   'Film vertical, 30-45 seconds. Must-have shots: (1) a pour at the taps - ask the bartender, they know, (2) the flight paddle on the barrel tables, (3) patio string lights + a cheers clip. No copyrighted music. Weeknights after 8 have the best atmosphere without the crush.',
   4, 4, '2026-08-10', 'open'),

  ('Harbor Light Coffee', 'Downtown', '117 Center Ave, Bay City, MI', 43.5944, -83.8891, 'food',
   'Breakfast + latte for two', '$28', 15,
   '30s: latte art pour, pastry case, window seat shot.',
   'Film vertical, 30 seconds. Must-have shots: (1) the latte art pour at the bar - baristas will slow down if you ask, (2) a slow pan of the pastry case, (3) your order at the big window seat. Morning light (before 10am) is the whole point of this shop. Tag @harborlightcoffee if posting.',
   6, 6, '2026-08-20', 'open'),

  ('Saginaw Bay Boat Co.', 'Marina', '1 Marina Dr, Bay City, MI', 43.6018, -83.8829, 'activity',
   '2-hour pontoon rental', '$180', 50,
   '45-60s: leaving the dock, open-water cruise, sunset if you can.',
   'Film vertical, 45-60 seconds. Must-have shots: (1) pulling away from the dock, (2) open-water cruising with the skyline behind you, (3) golden hour on the bay if you can time it (6-8pm slots). Life jackets visible in every shot - it''s their license requirement. Book the slot by replying to this email.',
   2, 2, '2026-08-08', 'open'),

  ('The Wenonah Motor Inn', 'Uptown', '3820 N Euclid Ave, Bay City, MI', 43.5883, -83.8867, 'stay',
   'One weeknight stay', '$95', 40,
   '45s room tour: door-open reveal, bed, bathroom, neon sign at night.',
   'Film vertical, 45 seconds. Must-have shots: (1) key-in-door opening reveal, (2) slow pan across the bed and the restored 60s furniture, (3) the bathroom, (4) the neon sign after dark - it''s the money shot. Check-in Sun-Thu only. Reply to this email with your date before booking.',
   3, 3, '2026-08-30', 'open'),

  ('Brooklyn Boyz Pizza', 'Columbus Ave', '1214 Columbus Ave, Bay City, MI', 43.5851, -83.8785, 'food',
   'Large pizza + garlic knots', '$32', 15,
   '30s: cheese pull (mandatory), counter, oven, box-open shot.',
   'Film vertical, 30 seconds. Must-have shots: (1) the box-open reveal, (2) THE CHEESE PULL - non-negotiable, do it while it''s hot, (3) the deck oven behind the counter if they''re not slammed. Lunch (11-1) is calmest for counter shots. Tag @brooklynboyzbc if posting.',
   5, 5, '2026-08-25', 'open');

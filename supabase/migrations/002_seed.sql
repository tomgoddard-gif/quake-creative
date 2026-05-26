-- Personas
insert into personas (id, name, who_they_are, where_they_are, core_frustration, core_desire, core_fear, objection, trigger, cpa_benchmark, campaign_fit, language) values
(
  'P1',
  'Tourist in Lisbon',
  'Already in Lisbon, exploring the city. 25–45, culturally curious, active on Instagram. Looking for authentic experiences beyond the typical tourist trail.',
  'Currently in Lisbon — hotels, Airbnbs, central neighbourhoods',
  'Missing out on the real Lisbon while walking past it every day',
  'A unique story to bring home — something they couldn''t get from a guidebook',
  'Wasting their limited time on something generic or forgettable',
  'I can just explore myself — I don''t need a guided experience',
  'Friend recommendations, FOMO content, unexpected footage of something surprising',
  '€12–18',
  array['tourist_in'],
  array['en', 'es', 'fr', 'de']
),
(
  'P2',
  'Lisbon Local',
  'Born or living in Lisbon for 5+ years. Knows the city well but has cultural blindness to its own landmarks. Aged 28–45. Likely seen Quake advertised before.',
  'Lisbon — familiar with the city, possibly cynical about tourist attractions',
  'Feeling like a tourist in your own city when taking visitors to see the sights',
  'To be the person who knows the coolest, most unusual thing to do in Lisbon',
  'Paying tourist prices for something that isn''t worth it',
  'I''ve lived here my whole life — I already know Lisbon',
  'Pride in their city, discovery content, being ahead of visitors',
  '€22–30',
  array['local_pt'],
  array['pt', 'en']
),
(
  'P3',
  'Family',
  'Parents with children aged 6–14, visiting Lisbon or living there. Prioritise shared experiences, education, and keeping kids engaged. Travel decisions driven by one parent.',
  'Tourist destinations or family-friendly areas of Lisbon',
  'Museums that bore the kids within 10 minutes, expensive days out that don''t land',
  'One memorable experience the whole family talks about after the holiday',
  'Wasting money on something the kids will complain about',
  'Is it suitable for kids? Will they actually enjoy it?',
  'Kids asking questions, other parents'' recommendations, educational-but-fun content',
  '€18–25',
  array['tourist_in', 'tourist_out', 'all'],
  array['en', 'es', 'fr', 'de', 'pt']
),
(
  'P4',
  'Couple',
  'Two people in a relationship, visiting or living in Lisbon. Looking for something more interesting than dinner and a movie. Ages 25–40. One person typically drives the decision.',
  'Lisbon — dining out, hotel stays, weekend trips',
  'Running out of interesting things to do together, falling into the same routine',
  'A genuinely shared experience — something that brings them closer',
  'Awkward experience that one person loves and the other doesn''t',
  'We''ve got dinner reservations — this seems like effort to organise',
  'Date night content, "you need to do this with your partner" hooks, peer recommendations',
  '€14–20',
  array['tourist_in', 'local_pt'],
  array['en', 'pt', 'es']
);

-- Concepts
insert into concepts (id, title, persona_id, campaign, platforms, hook_type, angle_type, test_axis, status) values
('C1',  'What Just Happened?',                         'P1',  'tourist_in',            array['Meta Reels', 'Meta Feed', 'TikTok'], 'Result-First',       'Revelation',        'Emotional',        'briefed'),
('C2',  'Did You Know You''re Standing On...',         'P1',  'tourist_in',            array['Meta Reels', 'Meta Feed'],          'Open Loop',          'Education',         'Revelation',       'briefed'),
('C3',  'You Walk Through Baixa Every Day',            'P2',  'local_pt',              array['Meta Reels', 'Meta Feed', 'TikTok'], 'Identity Challenge', 'Identity',          'Identity',         'briefed'),
('C4',  'Zero Got It Right',                           null,  'tourist_in',            array['Meta Reels', 'Meta Feed'],          'Social Proof',       'Social Proof',      'Social Proof',     'briefed'),
('C5',  'The Uninterested Employee',                   'P1',  'tourist_in',            array['Meta Reels', 'TikTok'],             'Anti-Ad / Deadpan',  'Revelation',        'Emotional',        'briefed'),
('C6',  'The Kids Won''t Stop Talking About It',       'P3',  'all',                   array['Meta Reels', 'Meta Feed'],          'Result-First',       'Social Proof',      'Emotional',        'briefed'),
('C7',  'Three Levels of Museums',                     'P1',  'tourist_in',            array['Meta Reels', 'Meta Feed'],          'Three Levels/Tiered','Problem-Solution',  'Revelation',       'briefed'),
('C8',  'Better Than Dinner and a Movie',              'P4',  'tourist_in',            array['Meta Reels', 'Meta Feed'],          'Identity Challenge', 'Identity Challenge', 'Identity',        'briefed'),
('C9',  'If He Suggests Dinner and a Movie Again',     'P4',  'tourist_in',            array['Meta Reels', 'Meta Feed', 'TikTok'], 'Direct Call-Out',   'Identity',          'Identity',         'briefed'),
('C10', 'I Filmed My Boyfriend During an Earthquake',  'P4',  'tourist_in',            array['Meta Reels', 'TikTok'],             'Result-First',       'Social Proof',      'Social Proof',     'briefed'),
('C11', 'The Receipt',                                 null,  'all',                   array['Meta Reels', 'Meta Feed'],          'Value Stack',        'Problem-Solution',  'Problem-Solution', 'briefed'),
('C12', 'What Would You Do?',                          null,  'tourist_in',            array['Meta Reels', 'Meta Feed', 'TikTok'], '60-Second Contract', 'Education',        'Emotional',        'briefed'),
('C13', 'Six Minutes',                                 null,  'tourist_in',            array['Meta Reels', 'TikTok'],             'Escalation',         'Revelation',        'Emotional',        'briefed'),
('C14', 'Traveling to Lisbon With Kids?',              'P3',  'tourist_out',           array['Meta Reels', 'Meta Feed'],          'Direct Call-Out',    'Problem-Solution',  'Problem-Solution', 'briefed'),
('C15', 'I Surprised My Girlfriend This Weekend',      'P4',  'tourist_in',            array['Meta Reels', 'TikTok'],             'Direct Call-Out',    'Social Proof',      'Social Proof',     'briefed'),
('C16', 'She Sent Me This Link Last Night',            'P4',  'tourist_in',            array['Meta Reels', 'Meta Feed'],          'Direct Call-Out',    'Social Proof',      'Social Proof',     'briefed'),
('C17', 'Living in Lisbon and Never Been?',            'P2',  'local_pt',              array['Meta Reels', 'Meta Feed', 'TikTok'], 'Direct Call-Out',   'Identity',          'Identity',         'briefed');

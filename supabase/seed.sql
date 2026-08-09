-- ==============================================================================
-- EZIDI EVENTS WORLDWIDE - SEED DEMO DATA
-- Note: All demo records are marked with is_demo = true
-- ==============================================================================

-- Countries
INSERT INTO countries (id, code, name_en, name_ar, name_de, name_fr) VALUES
('c0000000-0000-0000-0000-000000000001', 'DE', 'Germany', 'ألمانيا', 'Deutschland', 'Allemagne'),
('c0000000-0000-0000-0000-000000000002', 'IQ', 'Iraq', 'العراق', 'Irak', 'Irak'),
('c0000000-0000-0000-0000-000000000003', 'FR', 'France', 'فرنسا', 'Frankreich', 'France'),
('c0000000-0000-0000-0000-000000000004', 'US', 'United States', 'الولايات المتحدة', 'Vereinigte Staaten', 'États-Unis'),
('c0000000-0000-0000-0000-000000000005', 'AU', 'Australia', 'أستراليا', 'Australien', 'Australie')
ON CONFLICT (id) DO NOTHING;

-- Cities
INSERT INTO cities (id, country_id, name_en, name_ar, name_de, name_fr, latitude, longitude) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Berlin', 'برلين', 'Berlin', 'Berlin', 52.5200, 13.4050),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Hanover', 'هانوفر', 'Hannover', 'Hanovre', 52.3759, 9.7320),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Erbil', 'أربيل', 'Erbil', 'Erbil', 36.1912, 44.0091),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Shekhan / Lalish', 'شيخان / لالش', 'Schechan / Lalisch', 'Shekhan / Lalish', 36.7725, 43.3039),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Paris', 'باريس', 'Paris', 'Paris', 48.8566, 2.3522),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000004', 'Lincoln', 'لينكولن', 'Lincoln', 'Lincoln', 40.8136, -96.7026),
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000005', 'Sydney', 'سيدني', 'Sydney', 'Sydney', -33.8688, 151.2093)
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO event_categories (id, slug, name_en, name_ar, name_de, name_fr, description, icon_name) VALUES
('e0000000-0000-0000-0000-000000000001', 'demonstration', 'Demonstration', 'مظاهرة', 'Demonstration', 'Manifestation', 'Public demonstrations and gatherings for awareness', 'Megaphone'),
('e0000000-0000-0000-0000-000000000002', 'solidarity-rally', 'Solidarity Rally', 'وقفة تضامنية', 'Solidaritätskundgebung', 'Rassemblement de solidarité', 'Community and international solidarity rallies', 'HeartHandshake'),
('e0000000-0000-0000-0000-000000000003', 'vigil', 'Vigil & Candlelight', 'وقفة شموع وتأبين', 'Mahnwache', 'Veillée aux chandelles', 'Peaceful vigils and commemorative moments of silence', 'Flame'),
('e0000000-0000-0000-0000-000000000004', 'memorial', 'Memorial Event', 'ذكرى سنوية وتأبين', 'Gedenkveranstaltung', 'Événement commémoratif', 'Memorial ceremonies honoring Yazidi genocide victims and history', 'Monument'),
('e0000000-0000-0000-0000-000000000005', 'conference', 'Conference & Panel', 'مؤتمر وندوة حوارية', 'Konferenz & Podium', 'Conférence & Débat', 'Academic, human rights, and policy discussions', 'Presentation'),
('e0000000-0000-0000-0000-000000000006', 'cultural', 'Cultural Gathering', 'فعالية ثقافية وفنية', 'Kulturveranstaltung', 'Événement culturel', 'Ezidi music, art, traditional celebrations and cultural exhibits', 'Palette'),
('e0000000-0000-0000-0000-000000000007', 'human-rights', 'Human Rights Event', 'فعالية حقوق الإنسان', 'Menschenrechtsveranstaltung', 'Événement pour les droits humains', 'Human rights advocacy and legal justice forums', 'Scale'),
('e0000000-0000-0000-0000-000000000008', 'community', 'Community Gathering', 'لقاء مجتمعي', 'Gemeinschaftstreffen', 'Rassemblement communautaire', 'Youth, women and general diaspora community forums', 'Users')
ON CONFLICT (id) DO NOTHING;

-- Organizations (Clearly marked as Demo)
INSERT INTO organizations (
  id, name, slug, logo, cover_image, description, organization_type, country_id, city_id, full_address, latitude, longitude, website, email, organization_status, verification_status, direct_publishing_enabled, is_demo
) VALUES
(
  'f0000000-0000-0000-0000-000000000001',
  '[Demo] Yazidi Global Solidarity Initiative',
  'demo-yazidi-global-solidarity',
  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&h=400&fit=crop',
  'An international non-governmental alliance dedicated to human rights, justice, and documenting Yazidi community events worldwide.',
  'Human Rights NGO',
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Pariser Platz 1, 10117 Berlin, Germany',
  52.5163,
  13.3777,
  'https://example.org/yazidi-global',
  'contact@demo-yazidi-solidarity.org',
  'active',
  'verified',
  TRUE,
  TRUE
),
(
  'f0000000-0000-0000-0000-000000000002',
  '[Demo] Lalish Cultural & Heritage Center',
  'demo-lalish-cultural-center',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop',
  'Preserving Ezidi cultural heritage, oral traditions, sacred architecture, and youth educational workshops.',
  'Cultural Association',
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'Kröpcke 5, 30159 Hannover, Germany',
  52.3745,
  9.7386,
  'https://example.org/lalish-center',
  'info@demo-lalish-center.de',
  'active',
  'verified',
  FALSE,
  TRUE
),
(
  'f0000000-0000-0000-0000-000000000003',
  '[Demo] Youth for Yazidi Peace & Justice',
  'demo-youth-yazidi-peace',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop',
  'A student and youth-led movement advocating for educational grants and youth cultural exchanges.',
  'Youth Association',
  'c0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000005',
  'Place de la République, 75011 Paris, France',
  48.8675,
  2.3638,
  'https://example.org/youth-yazidi',
  'contact@demo-youth-yazidi.fr',
  'active',
  'pending',
  FALSE,
  TRUE
),
(
  'f0000000-0000-0000-0000-000000000004',
  '[Demo] Suspended Example Organization',
  'demo-suspended-example-org',
  'https://images.unsplash.com/photo-1572945116067-7f549c7556f8?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=400&fit=crop',
  'Demonstration organization demonstrating suspended status and automatic revocation of publishing permissions.',
  'Community Association',
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Alexanderplatz 1, 10178 Berlin, Germany',
  52.5219,
  13.4132,
  'https://example.org/suspended',
  'info@demo-suspended.org',
  'suspended',
  'suspended',
  FALSE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

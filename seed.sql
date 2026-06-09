-- ============================================================
--  TORQUE MOTORSPORTS EXCLUSIVE — Supabase Seed Data
--  Run this in Supabase Dashboard → SQL Editor
--  Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING
-- ============================================================


-- ============================================================
--  BIKES
-- ============================================================
INSERT INTO bikes (id, name, brand, sub, year, price, engine, power, mileage, weight, transmission, status, featured, description, images, created_at)
VALUES
(
  'bike-001',
  'Ducati Panigale V4S',
  'Ducati',
  'The benchmark Italian superbike',
  2022,
  14500000,
  '1103cc Desmosedici Stradale V4',
  '214 hp @ 13,000 rpm',
  '4,200 km',
  195,
  '6-speed + QS',
  'available',
  true,
  'One of the most capable production superbikes ever built. This V4S arrived in Pakistan as a direct import and has been maintained to factory spec. The Öhlins electronic suspension and cornering ABS make it as exploitable on Pakistani roads as it is on track. A landmark machine — the first Ducati V4 brought into Pakistan through Torque.',
  '[]',
  now() - interval '30 days'
),
(
  'bike-002',
  'BMW S1000RR',
  'BMW Motorrad',
  'ShiftCam Technology — M Package',
  2023,
  13800000,
  '999cc inline-four ShiftCam',
  '210 hp @ 13,500 rpm',
  '1,800 km',
  197,
  '6-speed + QS/AS',
  'available',
  true,
  'The S1000RR with M Package represents the absolute peak of BMW Motorrad engineering. ShiftCam variable valve timing delivers both savage top-end power and a smooth low-end for real-world riding. Full M suspension, carbon wheels, and the signature asymmetric face. Near new condition with under 2,000 km.',
  '[]',
  now() - interval '25 days'
),
(
  'bike-003',
  'Kawasaki Ninja ZX-10R',
  'Kawasaki',
  'KRT Edition — Winter Test livery',
  2022,
  9200000,
  '998cc inline-four',
  '203 hp @ 13,200 rpm',
  '6,100 km',
  207,
  '6-speed + QS',
  'available',
  true,
  'The race-bred ZX-10R in the KRT Winter Test livery — same colours as the factory WSBK team. Kawasaki Corner Management System and KTRC traction control give it a predictable, confidence-inspiring character. Well-serviced import with full documentation.',
  '[]',
  now() - interval '20 days'
),
(
  'bike-004',
  'Aprilia RSV4 Factory',
  'Aprilia',
  'APRC full suite — V4 1100',
  2021,
  10500000,
  '1077cc 65° V4',
  '217 hp @ 13,200 rpm',
  '8,300 km',
  204,
  '6-speed + QS/AS',
  'available',
  false,
  'The RSV4 Factory is what happens when a company wins 54 World Superbike titles and puts all of that into a road bike. APRC electronics, Öhlins Smart EC suspension, and a 217hp V4 that sounds unlike anything else on the road. Imported from Italy with complete service history.',
  '[]',
  now() - interval '15 days'
),
(
  'bike-005',
  'Yamaha R1M',
  'Yamaha',
  'Carbon bodywork — CrossPlane',
  2021,
  11200000,
  '998cc CrossPlane inline-four',
  '200 hp @ 13,500 rpm',
  '3,400 km',
  199,
  '6-speed + QS',
  'available',
  true,
  'The R1M is Yamaha at its most extreme — carbon fibre bodywork, Öhlins Electronic Racing Suspension with GPS-connected data logging, and the CrossPlane crank that gives the R1 its distinctive sound and torque character. One of the cleanest R1Ms in Pakistan.',
  '[]',
  now() - interval '10 days'
),
(
  'bike-006',
  'Honda CBR1000RR-R Fireblade SP',
  'Honda',
  'HRC-derived — Öhlins TTX36',
  2022,
  12000000,
  '999.9cc inline-four',
  '214 hp @ 14,500 rpm',
  '2,900 km',
  201,
  '6-speed + QS/AS',
  'sold',
  false,
  'Delivered to its new home in Lahore. The Fireblade SP brought HRC MotoGP technology to the road — ram-air intake system, titanium connecting rods, and the Öhlins TTX36 semi-active suspension. A privilege to have imported this machine.',
  '[]',
  now() - interval '45 days'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
--  POSTS
-- ============================================================
INSERT INTO posts (id, title, slug, category, author, date, excerpt, body, cover, featured)
VALUES
(
  'post-001',
  'Why Pakistan Needs a Real Superbike Culture',
  'why-pakistan-needs-a-real-superbike-culture',
  'Opinion',
  'Sunny Chaudary',
  '2025-03-10',
  'The roads are here. The talent is here. What we have been missing is access — access to the right machines, the right knowledge, and the right community.',
  'The roads are here. The talent is here. What we have been missing is access — access to the right machines, the right knowledge, and the right community.

I have been riding since before I could legally do so. And for most of that time, the ceiling in Pakistan was a 150cc commuter — maybe a 250cc sports bike if you were lucky. The idea of riding a Ducati or a BMW S1000RR here felt like it belonged to a different universe.

**It does not.**

The Motorway, the Lahore ring road, the mountain passes up north — this country has roads that would embarrass many in Europe. What it lacked was the infrastructure of knowledge, parts, and community that turns individual machines into a movement.

That is the gap Torque exists to close.

We are not a dealership. We are riders who happen to know how to navigate the import process — how to find the right machine, verify its history, handle customs, and put it on Pakistani tarmac in the condition it deserves.

**Every bike we bring in is a statement.** A statement that this market is real, that these machines belong here, and that Pakistani riders deserve the same access as riders anywhere else in the world.

The culture is already there, under the surface. We are just turning up the volume.',
  '',
  true
),
(
  'post-002',
  'Ducati Panigale V4S: First Ride Impressions in Pakistan',
  'ducati-panigale-v4s-first-ride-pakistan',
  'Reviews',
  'Torque Motorsports',
  '2025-04-02',
  'The first Ducati V4 to arrive in Pakistan through Torque. We put it through its paces on the Motorway and the Lahore ring road. Here is what we found.',
  'When the V4S cleared customs, there was a moment standing in the warehouse where it just felt wrong that this bike had never turned a wheel in Pakistan before. This was the machine that ended Aprilia and Kawasaki''s dominance in WSBK. And here it was, crated up in Lahore.

**Getting Moving**

The first thing you notice is how approachable it is for something with 214hp. Ducati''s ride modes genuinely work — Full Wet actually softens the V4 into something you can use in city traffic without constantly managing the throttle. The Desmosedici Stradale V4 is not a nervous engine in the way older Ducati L-twins could be.

**On the Motorway**

At speed, the aerodynamic package — full winglets, the ducktail — becomes meaningful. The bike does not wander or feel nervous at 200+ km/h the way older superbikes could. It sits and tracks with confidence. The Öhlins suspension, set to its default electronic map, handles Pakistani road surfaces far better than expected.

**The Sound**

Nothing prepares you for the sound. At full throttle, the Desmosedici V4 makes a noise that belongs in a MotoGP paddock, not on a public road. It is aggressive, layered, and completely addictive.

**Verdict**

The V4S is not a track bike wearing number plates. It is a complete machine — one that happens to be devastatingly fast when you want it to be. If you have been considering a V4S import, get in touch.',
  '',
  false
),
(
  'post-003',
  'The Import Process Explained: How We Bring Bikes to Pakistan',
  'superbike-import-process-pakistan-explained',
  'Guides',
  'Saeed Munwar',
  '2025-04-20',
  'A lot of people ask us how the process works. What does importing a superbike to Pakistan actually involve — from finding the machine to handing over the keys?',
  'The question we get asked most often is simple: how does this actually work? You see a bike on our page, you want it — what happens next?

**Finding the Right Machine**

We source bikes primarily from Japan, Europe, and the UAE. Japanese market bikes tend to have the lowest mileage and the most reliable service history documentation. European bikes often have full dealer service records. We inspect every machine, or have a trusted local inspector look at it, before we move forward.

We are not shipping unknown machines. Every bike we bring has been evaluated.

**Documentation and Customs**

This is where most people get stuck if they try to do it themselves. The paperwork chain — export certificate, bill of lading, customs declaration, duty calculation — is navigable but genuinely complex. Duties vary by engine capacity and the bike''s country of origin. We handle all of this.

**Condition on Arrival**

Bikes are professionally crated. We have brought in machines that arrived in showroom condition and machines that needed minor attention after transit. We will always tell you which is which. We do not hide pre-existing issues.

**After Delivery**

We help with registration and remain available for any technical questions. We are not trying to close a deal and disappear — we want you to still be riding this bike five years from now.

**The Timeline**

Typically 6 to 10 weeks from confirmation to delivery, depending on sourcing and shipping schedules. Some machines are already in-country and move faster.

If you want to start the conversation, reach out via WhatsApp or come see us in Lahore.',
  '',
  false
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
--  SETTINGS (row id=1 must exist)
-- ============================================================
INSERT INTO settings (id, data, updated_at)
VALUES (
  1,
  '{
    "whatsapp": "923001234567",
    "email": "hello@torquemotorsexclusive.com",
    "phone": "+92 300 123 4567",
    "instagram": "https://instagram.com/torquemotorsexclusive",
    "tiktok": "https://tiktok.com/@torquemotorsexclusive",
    "facebook": "https://facebook.com/torquemotorsexclusive",
    "youtube": "https://youtube.com/@torquemotorsexclusive",
    "address": "Lahore, Pakistan",
    "founders": {
      "sunny": {
        "name": "Sunny Chaudary",
        "role": "Founder · Lifelong Biker",
        "bio": "A lifelong biker, Sunny grew up obsessed with the sound of superbikes — so much so that as a kid he was convinced the engine roar of passing van convoys WAS a superbike. Later he imported his first bike and went on to become the first person to introduce Ducati to Pakistan.",
        "phone": "+92 300 123 4567",
        "photo": ""
      },
      "saeed": {
        "name": "Saeed Munwar",
        "role": "Co-Founder · Imports & Restoration",
        "bio": "Saeed is the reason Torque became a name. His discipline and years of experience in car and bike imports gave the business the foundation it needed.",
        "phone": "+92 300 123 4568",
        "photo": ""
      }
    },
    "showroomPhotos": [],
    "garagePhotos": [],
    "garageServices": [
      "Full Service & Repair",
      "Oil Change & Tune-Ups",
      "Performance Upgrades",
      "Custom Modifications",
      "Restoration & Rebuilds",
      "Spare Parts Sourcing"
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = EXCLUDED.updated_at;

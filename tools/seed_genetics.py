"""One-time seed of content/genetics/*.json from the compiled breeding log (docs/spacecraft-breeding-log.md).
Each file is one plant: a SpaceCraft cross, an outside cut/seed line used as a parent, or an ancestor.
Fields: id (file name), name, kind, breeder, mother, father (ids or ""), run, year, flagship, status, terps, notes, source, seedfinder.
Re-running rewrites every file and removes any not defined here, so after the site goes live edit in the admin (or in the JSON) and keep this script as history.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "content", "genetics"); os.makedirs(OUT, exist_ok=True)

N = []
def add(id, name, kind, breeder="", mother="", father="", run=0, year="", flagship=False, status="", terps="", notes="", source="", seedfinder="", image=""):
    N.append(dict(id=id, name=name, kind=kind, breeder=breeder, mother=mother, father=father, run=run, year=str(year), flagship=flagship, status=status, terps=terps, notes=notes, source=source, seedfinder=seedfinder, image=image))

SC = "SpaceCraft"
# ------------------------------------------------------------------ outside parents (immediate)
add("grape-pie-bx", "Grape Pie bx", "seedline", "Cannarado", notes="Grape Pie backcrossed with Grape Pie × DoHo.")
add("cheesy-d", "Cheesy D", "seedline", "Cannarado", notes="UK Cheese × Chem D.")
add("charcuterie", "Charcuterie ♂", "seedline", "Cannarado", "grape-pie-bx", "cheesy-d", notes="One male kept from 7 seeds: strongest stem rub and vigor, magenta and purple stem striping, pink and purple pollen sacs. Grape Pie bx dominates the progeny: grape drink and fruit leather, compact, heavy resin.")
add("charcuterie-4", "Charcuterie #4 ♀", "seedline", "Cannarado", "grape-pie-bx", "cheesy-d", notes="Best female from the same pack: triple grape punch, resin on the fan leaves, red stems.")
add("communion-s1", "Communion S1", "seedline", "Romulan Genetics", notes="(Grapestomper OG × Durban Poison) × Romulan. Lanky, stacked, 9 weeks, a trimmer's dream. The Eucharist's mother.")
add("mutant-communion", "Communion (mutant runt)", "cut", "Romulan Genetics", notes="Pseudo-duckfoot runt from the same Communion S1 seeds: zero stretch, abysmal yield, insane lemon pine. Kept only as a cut.")
add("tropical-slushee", "Tropical Slushee", "seedline", "Cannarado", notes="Papaya × Snowman. Two phenos were seeded: a purple grape/funk pheno and a papaya yielder.")
add("avalon-x-banner", "Avalon × Banner", "seedline", "Next Generation", notes="Outdoor project mother. Shrugged off bud rot in a wet October; spicy, peppery, skunky, citronella.")
add("dirty-unicorn", "Dirty Unicorn", "seedline", "Dirty Bird Genetics", notes="Dirty Bird's S1 of Unicorn Poop. A root-bound bonsai used as a spot filler.")
add("tahoe-og-bagseed", "“Tahoe OG” bagseed (CBS)", "bagseed", "unknown", notes="One of a few seeds in a batch of NorCal outdoor, ~2012–14. Lanky, low yield, extremely narcotic, zero herms across cuts of cuts. Pine-oil mops, lemongrass, onion.")
add("pure-krush", "Pure Krush", "seedline", "Romulan Genetics", notes="Pure Kush (Topanga Canyon cut) × Romulan. Sandalwood, palo santo, cologne, warm sugar cookie. Chris's favorite mother of the first run.")
add("island-sweet-skunk", "Island Sweet Skunk", "seedline", "Next Generation", notes="The stretcher pheno, 11–12 weeks, sour lemon pine foxtails, “could clear out a parking lot”. Oiliest bud handled in years.")
add("black-lime-reserve", "Black Lime Reserve (Jodrey cut)", "cut", notes="Father side of Lime Bubble.")
add("sour-bubble", "’04 BOG Sour Bubble BxC-2 F2", "seedline", "BOG Seeds", notes="Mother side of Lime Bubble.")
add("lime-bubble", "Lime Bubble ♂♂", "seedline", "Golden Road Seed Co.", "sour-bubble", "black-lime-reserve", notes="Two males used together: a lanky Black Lime leaner with a sour stem rub and a compact Sour Bubble leaner with an incense rub, greasy with trichomes at the nodes. Every Run 2 plant caught pollen from both, so each seed is a coin toss for the dad. S. Dot (Sour Dubb × Orange Tahoe) was also seeded but made too few seeds to continue.")
add("skunk-venom", "Skunk Venom", "cut", "Humboldt Seed Co.", notes="Cali Octane × Venom OG. Unreleased unicorn tester hunted at Wild Leaf; picked up at the 2024 Emerald Cup. Sour citrus, burnt rubber, woody pine, chemical skunk; stout and squat.", terps="sour citrus, burnt rubber, pine, chemical skunk")
add("chem-4", "Chem 4 (SoCal cut)", "cut", notes="A friend's cut. Gassy; nap-inducing narcotic; wide Jurassic paddle leaves in early veg.")
add("albert-walker", "Albert Walker", "cut", notes="Sourced from Cloney Soprano; “99% sure this is the real Albert”. Greasy, mature citrus cologne with sulfur and gas; old-school wide-leaf unruly build.")
add("glitter-bomb", "Glitter Bomb", "cut", notes="Exclusive cut passed around the Oregon rec scene. Floral blueberry; first to frost at 2.5 weeks.")
add("blue-dream", "Blue Dream (Archive cut)", "cut", "Archive", notes="“100% dead-on Blue Dream.”")
add("guava-tart", "Guava Tart (PCG cut)", "cut", "Purple City Genetics", notes="Emerald Cup 2024 pickup. Fresh tennis balls and Pez candy.")
add("rickys-hashplant", "Ricky's Hashplant", "seedline", "BGS", notes="Tester from fem seed. Baby-poo lemons, garlicky pepper, serious pucker.")
add("sweet-stinky-cheese", "Sweet Stinky Cheese", "seedline", "Humboldt CSI", notes="From fem seed.")
add("notsos-headband", "Notso's Headband", "cut", notes="Headband cut from a friend. “Breeds like a champ.” The cut labelled “LA Sour” on the Run 2 roster turned out to be this same plant.")
add("trufflez-f2", "Trufflez F2", "seedline", notes="Father of Gushy Kush.")
add("tiger-mint-kush-f2", "Tiger Mint Kush F2", "seedline")
add("pure-michigan-f3", "Pure Michigan F3", "seedline", "3rd Coast Genetics (line)", notes="Pure Michigan is Oreoz × Mendobreath F2.")
add("tmk-x-pure-michigan", "Tiger Mint Kush F2 × Pure Michigan F3", "homebrew", "Soiltech (OverGrow)", "tiger-mint-kush-f2", "pure-michigan-f3", notes="The mother of Gushy Kush: second-best smoke of about 75 plants finished in Soiltech's swamp season; deep smokey meatiness.")
add("gushy-kush", "Gushy Kush ♂♂♂", "homebrew", "Soiltech (OverGrow)", "tmk-x-pure-michigan", "trufflez-f2", notes="Untested F1 from Soiltech's swamp season. Three males used, all nute-burned at transplant and recovered.")
add("solar-halo", "Solar Halo", "homebrew", "JonPott (OverGrow)", notes="Two mothers used: a stretcher/heavy feeder and a shorter easy-goer. Loud astringent pine-needle stem rub.")
add("tpk-x-pink-kush", "TPK × Ultimate Pink Kush", "homebrew", "Kyumonryu (OverGrow)", notes="Topanga Pure Kush × Ultimate Pink Kush. Two mothers used; proper kush terps, smooth sandalwood.")
add("banapinap-black", "BanaPinAp Black", "homebrew", "Trial-N-Error (OverGrow)", notes="Easy, strong, stout, above-average resin.")
add("jack-the-skunk", "Jack the Skunk", "homebrew", "Le_Rat (OverGrow)", notes="Two mothers used: one stretcher, one tamer.")
add("milky-blueberry-milk", "Milky Blueberry Milk", "homebrew", "BasementGardens (OverGrow)", notes="Piney stem rub; a stretcher that stacks.")
add("corndog-walker", "Corndog Walker", "homebrew", "hoss8455 (OverGrow)", notes="All three seeds came up female.")
add("lavender-frosting", "Lavender Frosting", "homebrew", "WeTokeChronic (OverGrow)")
add("alberta-breath", "Alberta Breath", "homebrew", "a friend in town", notes="Toracco × Sherbet Haze; Toracco is Pink Pixie × Godsbreath. Sativa look, great resin, loud orange and blueberry.")
add("lemon-tree", "Lemon Tree (Archive clone)", "cut", "Archive")
add("blueberry-cupcake", "Blueberry Cupcake", "cut", notes="Blueberry Muffin × Wedding Cake, an Oregon rec cut personally hunted by a friend. Viney and lanky, tests high, complex blueberry, throws preflowers under 18/6, true 8-weeker.")
add("kush-crasher", "Kush Crasher", "cut", notes="Oregon rec cut.")
add("marrakesh", "Marrakesh", "cut", notes="Oregon rec cut.")
add("freezer-jam", "Freezer Jam", "cut", notes="Oregon rec cut.")
add("ajs-sour-diesel", "AJ's Sour Diesel", "cut", "Archive", notes="Liked enough to run again for headstash.")
add("stardawg-corey", "Stardawg (Corey cut)", "cut", "Archive")
add("gary-payton", "Gary Payton", "cut")

# ------------------------------------------------------------------ Run 1 · Charcuterie · 2024
add("the-eucharist", "The Eucharist", "spacecraft", SC, "communion-s1", "charcuterie", 1, 2024, True, "released", "grape and lemon-drop candy, dryer sheets; tart skunky smoke, lavender floral taste", "Blue Dream-like structure, heavy feeder, PM resistant, zero herms. Keeper: The Eucharist #2, used as a mother in Run 2. The pine-line males are Eucharist siblings.")
add("tropical-wine", "Tropical Wine", "spacecraft", SC, "tropical-slushee", "charcuterie", 1, 2024, False, "released", "grape lemonade soda and gas", "Easy, non-fussy grower; green and purple phenos; yields well.")
add("zenyatta", "Zenyatta", "spacecraft", SC, "avalon-x-banner", "charcuterie", 1, 2024, False, "released", "", "Made for outdoor resilience. Untested indoors so far.")
add("thunder-egg", "Thunder Egg", "spacecraft", SC, "dirty-unicorn", "charcuterie", 1, 2024, False, "released", "floral, fruity, complex baked sweets", "Tiny seeds and few of them; handed out as a bonus with Crepe Krush.")
add("telecast-kush", "Telecast Kush", "spacecraft", SC, "tahoe-og-bagseed", "charcuterie", 1, 2024, False, "released", "", "Others report sticky buds with a foul-rot back end; some phenos keep mom's Jurassic leaves.")
add("crepe-krush", "Crepe Krush", "spacecraft", SC, "pure-krush", "charcuterie", 1, 2024, False, "released", "woody incense, marshmallow, creamy kush", "Progeny carry the paddle leaves.")
add("sugarplum-skunk", "Sugarplum Skunk", "spacecraft", SC, "island-sweet-skunk", "charcuterie", 1, 2024, True, "released", "sour carbonated citrus, floral menthol, greasy; zooming hang-glider high", "Finishes in 8.5 weeks. Ran on a rec facility R&D table. Males from this line sired Splooze, Not-So-Plum-Skunk and the CuCu crosses.")
add("charcuterie-f2", "Charcuterie F2", "spacecraft", SC, "charcuterie-4", "charcuterie", 1, 2024, False, "stock", "", "Breeding stock; a flip went into each box set.")
add("pine-line", "Pine line (Flagship Project #1)", "spacecraft", SC, "mutant-communion", "charcuterie", 1, 2024, True, "unreleased", "pine needle, cedar resin, menthol, wet moss", "Made quietly and never handed out. Two seeded testers came out dead-on pine needles. Two spade-leaf F1 males from this line carried Run 5; F2 made 2026 to hunt the mutant male.")

# ------------------------------------------------------------------ Run 2 · Lime Bubble · 2025
add("skunk-ooze", "Skunk Ooze (Skooze)", "spacecraft", SC, "skunk-venom", "lime-bubble", 2, 2025, True, "released", "deep floral chem fuel; a sour citrus-cleaner fuel pheno", "Three phenos: a green-bell-pepper dud, a sour citrus cleaner keeper, and the holy-grail floral chem fuel with insane resin. “Some of the strongest, tastiest, stickiest smoke I've ever had.” Mother of Splooze.")
add("chem-pop", "Chem Pop", "spacecraft", SC, "chem-4", "lime-bubble", 2, 2025, True, "released", "deep tasty chem", "Sleeper of the run: crazy frost, big nuggy yield, consistent across phenos. About 50 seeds left; reproduction planned.")
add("jerry-bears", "Jerry Bears", "spacecraft", SC, "albert-walker", "lime-bubble", 2, 2025, True, "released", "orange gummy candy (keeper pheno)", "The orange gummy candy pheno sits on the 2026 mother roster.")
add("disco-bubble", "Disco Bubble", "spacecraft", SC, "glitter-bomb", "lime-bubble", 2, 2025, False, "released", "floral blueberry with Lime Bubble sour", "Tester leaned Glitter Bomb; cured and pressed well overseas.")
add("sea-foam", "Sea Foam", "spacecraft", SC, "blue-dream", "lime-bubble", 2, 2025, False, "released", "", "A tester reports Blue Dream looks in the dried flower.")
add("honey-smack", "Honey Smack", "spacecraft", SC, "guava-tart", "lime-bubble", 2, 2025, False, "released")
add("moose-fruit", "Moose Fruit", "spacecraft", SC, "rickys-hashplant", "lime-bubble", 2, 2025, False, "released")
add("sage-derby", "Sage Derby", "spacecraft", SC, "sweet-stinky-cheese", "lime-bubble", 2, 2025, False, "released", "", "A tester has two ladies going.")
add("slimeline", "Slimeline", "spacecraft", SC, "notsos-headband", "lime-bubble", 2, 2025, False, "released")
add("lime-divine", "Lime Divine", "spacecraft", SC, "the-eucharist", "lime-bubble", 2, 2025, False, "released", "", "First second-generation SpaceCraft cross, from The Eucharist #2.")
add("lime-bubble-f2", "Lime Bubble F2", "spacecraft", SC, "lime-bubble", "lime-bubble", 2, 2025, False, "stock", "Irish Spring soap, citrus", "A few q-tipped lowers on the female Lime Bubbles.")

# ------------------------------------------------------------------ Run 3 · Gushy Kush · 2025
add("solar-halo-x-gk", "Solar Halo × Gushy Kush", "spacecraft", SC, "solar-halo", "gushy-kush", 3, 2025, False, "released", "wild tropical: afgoo with a pineapple-juice twist", "One of the two standouts of the run.")
add("tpk-pk-x-gk", "TPK×PK × Gushy Kush (Pure Pink Gushy)", "spacecraft", SC, "tpk-x-pink-kush", "gushy-kush", 3, 2025, True, "released", "zesty incense in flower; sweet syrupy chocolate cured", "The other standout. A male with an orange-spice-candy stem rub was kept and used on Lemon Tree.")
add("banapinap-black-x-gk", "BanaPinAp Black × Gushy Kush", "spacecraft", SC, "banapinap-black", "gushy-kush", 3, 2025, False, "released", "wild berry and gas, very strong nose", "Reminded Chris of Charcuterie but gassier; a line to hunt again.")
add("jack-the-skunk-x-gk", "Jack the Skunk × Gushy Kush", "spacecraft", SC, "jack-the-skunk", "gushy-kush", 3, 2025, False, "released", "sour rotten fruit, Blue Dream with a funky twist")
add("mbm-x-gk", "Milky Blueberry Milk × Gushy Kush", "spacecraft", SC, "milky-blueberry-milk", "gushy-kush", 3, 2025, False, "released", "lemon soda, pepper")
add("corndog-walker-x-gk", "Corndog Walker × Gushy Kush", "spacecraft", SC, "corndog-walker", "gushy-kush", 3, 2025, False, "released", "turkey gravy and cracked pepper")
add("lavender-frosting-x-gk", "Lavender Frosting × Gushy Kush", "spacecraft", SC, "lavender-frosting", "gushy-kush", 3, 2025, False, "released", "lavender dryer sheets and sugar sticks")
add("alberta-breath-x-gk", "Alberta Breath × Gushy Kush", "spacecraft", SC, "alberta-breath", "gushy-kush", 3, 2025, False, "released", "sour milk and lemons", "Modern haze build with a Trainwreck look. The friend has 8 ladies in testing.")
add("gushy-kush-f2", "Gushy Kush F2", "spacecraft", SC, "gushy-kush", "gushy-kush", 3, 2025, False, "stock", "sweet/sour bouquet, rancid gaminess, gasoline, syrup", "Open-pollination increase of Soiltech's line; breeder pucks went back to him.")

# ------------------------------------------------------------------ Run 4 · side chucks · 2025
add("splooze", "Splooze", "spacecraft", SC, "skunk-ooze", "sugarplum-skunk", 4, 2025, True, "released", "citrus candy with something sinister", "First all-SpaceCraft cross, F1 × F1: the citrus-cleaner Skooze pheno, grown outside, hit with a Sugarplum Skunk male. On the 2026 mother roster.")
add("lemon-tree-kushy", "Lemon Tree Kushy", "spacecraft", SC, "lemon-tree", "tpk-pk-x-gk", 4, 2025, True, "released", "", "Lemon Tree hit with the orange-spice Pure Pink Gushy male. Seed of the 2026 Citrus Throwdown stud hunt; on the 2026 mother roster.")
add("not-so-plum-skunk", "Not-So-Plum-Skunk", "homebrew", "a friend (SPS male)", "notsos-headband", "sugarplum-skunk", 4, 2025, False, "released", "orange peel, lime, potpourri spice; candy gas taste", "A friend's cross with a Sugarplum Skunk male. Mostly Headband leaners like old-school ECSD, plus the SPS-leaning “The Wave” keeper cut with wavy alternating nodes.")
add("gary-payton-x-sps", "Gary Payton × Sugarplum Skunk", "homebrew", "a friend (SPS male)", "gary-payton", "sugarplum-skunk", 4, 2025, False, "testing", "", "Flowering in November 2025. The same friend's CuCu male also hit Notso's Headband, Albert Walker, an SPS purple pheno and Chem 4.")

# ------------------------------------------------------------------ Run 5 · pine-line males · 2026
add("pinecake", "Pinecake", "spacecraft", SC, "blueberry-cupcake", "pine-line", 5, 2026, False, "testing", "blueberry pie with sinister funk", "Tester at week 7: big yielder, fast finisher like mom. “Really, really impressed.”")
add("janet-kush", "Janet Kush", "spacecraft", SC, "kush-crasher", "pine-line", 5, 2026, False, "testing", "strong kushy fuel", "One of the frostiest plants grown here; medium sturdy build; wash or squish candidate.")
add("peach-pagoda", "Peach Pagoda", "spacecraft", SC, "marrakesh", "pine-line", 5, 2026, False, "new")
add("pineberry-preserve", "Pineberry Preserve", "spacecraft", SC, "freezer-jam", "pine-line", 5, 2026, False, "new")
add("lumbergas", "Lumbergas", "spacecraft", SC, "ajs-sour-diesel", "pine-line", 5, 2026, False, "new")
add("stargod", "Stargod", "spacecraft", SC, "stardawg-corey", "pine-line", 5, 2026, False, "new")
add("sour-squeeze", "Sour Squeeze", "spacecraft", SC, "splooze", "pine-line", 5, 2026, False, "new", "", "Third-generation SpaceCraft: both parents are SpaceCraft lines.")
add("sticky-wok", "Sticky Wok", "spacecraft", SC, "jerry-bears", "pine-line", 5, 2026, False, "new", "", "From the orange gummy candy Jerry Bears pheno.")
add("pine-line-f2", "Pine line F2", "spacecraft", SC, "pine-line", "pine-line", 5, 2026, False, "stock", "grape candy and lemon pine; earthy incense pine", "Two stand-in females; where the mutant male will be found if it exists.")

# ------------------------------------------------------------------ Run 6 · outdoor · Pinecake male · 2026
add("frozen-lemon", "Frozen Lemon", "seedline", "In House Genetics")
add("deluxe-sugarcane", "Deluxe Sugarcane", "seedline", "In House Genetics")
add("blackout-lemonade", "Blackout Lemonade", "homebrew", "Soiltech (OverGrow)")
add("urgam-x-malana", "Urgam × Malana", "landrace", notes="Himalayan landrace cross.")
add("baby-yoda-bagseed", "Baby Yoda bagseed", "bagseed", notes="One seed found in a friend's half ounce of Baby Yoda; father unknown. Wicked smell, dark green waxy leaves.")
for mid, mname in [("frozen-lemon", "Frozen Lemon"), ("deluxe-sugarcane", "Deluxe Sugarcane"), ("blackout-lemonade", "Blackout Lemonade"), ("stardawg-corey", "Stardawg"), ("ajs-sour-diesel", "AJ's Sour Diesel"), ("freezer-jam", "Freezer Jam"), ("not-so-plum-skunk", "The Wave"), ("blueberry-cupcake", "Blueberry Cupcake"), ("urgam-x-malana", "Urgam × Malana"), ("marrakesh", "Marrakesh"), ("baby-yoda-bagseed", "Baby Yoda bagseed")]:
    add(mid + "-x-pinecake", mname + " × Pinecake", "spacecraft", SC, mid, "pinecake", 6, 2026, False, "seeding", "", "Outdoor 2026 run: plants over six feet, pollinated with a Pinecake male; seeds developing as of September 2026." + (" The Wave is the SPS-leaning keeper cut of Not-So-Plum-Skunk." if mid == "not-so-plum-skunk" else "") + (" A couple of lowers were hit, the rest grown for flower." if mid == "baby-yoda-bagseed" else ""))

# ------------------------------------------------------------------ deep ancestry (seedfinder research)
def link(id, mother="", father="", **fields):
    n = next(x for x in N if x["id"] == id)
    if mother: n["mother"] = mother
    if father: n["father"] = father
    n.update(fields)
import genetics_ancestors; genetics_ancestors.extend(add, link)

# ------------------------------------------------------------------ photos (assets/plants, see tools/convert_plants.py)
for pid, img in [("pine-line", "plant-001.jpg"), ("pinecake", "plant-004.jpg"), ("skunk-ooze", "plant-006.jpg"), ("blueberry-cupcake", "plant-008.jpg"), ("charcuterie", "plant-009.jpg"), ("chem-pop", "plant-011.jpg"), ("crepe-krush", "plant-012.jpg"), ("janet-kush", "plant-013.jpg"), ("pure-krush", "plant-014.jpg"), ("tropical-slushee", "plant-015.jpg")]:
    link(pid, image="/assets/plants/" + img)

ids = {n["id"] for n in N}
for f in os.listdir(OUT):
    if f.endswith(".json") and f[:-5] not in ids: os.remove(os.path.join(OUT, f)); print("removed", f)
for n in N:
    for k in ("mother", "father"):
        assert not n[k] or n[k] in ids, (n["id"], k, n[k])
    json.dump(n, open(os.path.join(OUT, n["id"] + ".json"), "w", encoding="utf-8", newline="\n"), indent=2, ensure_ascii=False)
print("wrote", len(N), "plants")

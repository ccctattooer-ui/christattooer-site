"""Deep ancestry for the outside plants on the SpaceCraft star chart, researched on seedfinder.eu (Sep 2026).
Called by seed_genetics.py: add(...) creates a plant, link(id, mother, father, **fields) fills in an existing one.
Where seedfinder marks a parent "probably" or the lineage is only reported, the note says so.
"""
SF = "https://seedfinder.eu/en/strain-info/"

def extend(add, link):
    # ---------------------------------------------------------- shared roots
    add("skunk-1", "Skunk #1", "seedline", "Sacred Seeds / Sensi Seeds", notes="(Afghanistan × Colombia) × Mexico. The root of every skunk and cheese line here.", seedfinder=SF + "Skunk_1/Sensi_Seeds/")
    add("afghani", "Afghani", "landrace", notes="Afghanistan indica landrace.")
    add("hindu-kush", "Hindu Kush", "landrace", notes="Indica landrace from the Hindu Kush mountains.")
    add("durban-poison", "Durban Poison", "landrace", notes="South African sativa landrace.", seedfinder=SF + "Durban_Poison/Unknown_or_Legendary/")
    add("haze", "Haze", "seedline", "Haze Brothers", notes="Original Californian Haze, mixed Colombian, Mexican, Thai and South Indian sativas.")
    add("og-kush", "OG Kush", "cut", notes="The Florida/California legend; seedfinder gives an Emerald Triangle unknown × Hindu Kush (Neville's).", seedfinder=SF + "OG_Kush/Unknown_or_Legendary/")
    add("triangle-kush", "Triangle Kush", "cut", "og-kush", "", notes="Florida OG Kush cut, same reported roots as OG Kush.", seedfinder=SF + "Triangle_Kush/Unknown_or_Legendary/")
    add("chemdawg", "Chemdawg", "bagseed", notes="The 1991 Grateful Dead lot bagseed legend; parent of the Chem 4, Chem D and Diesel lines.", seedfinder=SF + "Chemdawg/Unknown_or_Legendary/")
    add("chem-d", "Chem D", "cut", "chemdawg", "", notes="Chemdawg phenotype D.")
    add("gsc", "Girl Scout Cookies", "cut", "og-kush", "durban-poison", notes="Cookie Fam's clone; OG Kush (South Florida) × F1 Durban.", seedfinder=SF + "Girl_Scout_Cookies/Cookie_Fam/")
    add("snowman", "Snowman", "cut", "gsc", "", notes="A selected Girl Scout Cookies phenotype (Berner / Cookie Fam).")
    add("gelato", "Gelato", "cut", "sunset-sherbet", "thin-mint-cookies", notes="Sherbinskis: Sunset Sherbet × Thin Mint Cookies.", seedfinder=SF + "Gelato/Sherbinski/")
    add("sunset-sherbet", "Sunset Sherbet", "cut", "gsc", "pink-panties", seedfinder=SF + "Sunset_Sherbet/Sherbinski/")
    add("pink-panties", "Pink Panties", "seedline", notes="Blackberry Kush × Burmese Kush (reported).")
    add("thin-mint-cookies", "Thin Mint Cookies", "cut", "gsc", "", notes="A Girl Scout Cookies phenotype.")
    add("ogkb", "OG Kush Breath (OGKB)", "cut", "gsc", "", notes="A selected Girl Scout Cookies phenotype.")

    # ---------------------------------------------------------- Skunk Venom side
    add("dream-queen", "Dream Queen", "seedline", "Humboldt Seed Co.", "green-crack", "mazar-star", notes="Seedfinder's HSC entry: Green Crack × (Skunk #1 × Afghanistan 'Mazar Star').", seedfinder=SF + "Dream_Queen/Humboldt_Seed_Company/")
    add("green-crack", "Green Crack", "cut", "skunk-1", "", notes="Skunk #1 × unknown indica (reported).")
    add("mazar-star", "Skunk #1 × Afghanistan (Mazar Star)", "seedline", "skunk-1", "afghani")
    add("i369-x-papaya", "I-369 × Papaya", "seedline", "", "i369", "papaya-oni")
    add("i369", "I-369", "unknown", notes="Unnamed HSC breeding line.")
    add("papaya-oni", "Papaya (Oni Seed Co)", "seedline", "Oni Seed Co", notes="Descends from Nirvana's Papaya (Citral × Ice).")
    add("cali-octane", "Cali Octane", "seedline", "Humboldt Seed Co. / Foodoo Farm", "dream-queen", "i369-x-papaya", notes="HSC states Dream Queen × (I-369 × Papaya).", seedfinder=SF + "california-octane/humboldt-seed-company/genealogy")
    add("poison-og", "Poison OG", "cut", "og-kush", "", notes="An OG Kush S1 selection.")
    add("ghost-og-x-chem-d", "Ghost OG × Chem D IBL", "seedline")
    add("rare-dankness-1", "Rare Dankness #1", "seedline", "Rare Dankness", "triangle-kush", "ghost-og-x-chem-d", notes="Triangle Kush × (Triangle Kush × (Ghost OG × Chem D IBL)), BX2.")
    add("venom-og", "Venom OG", "seedline", "Rare Dankness", "poison-og", "rare-dankness-1", seedfinder=SF + "venom-og/rare-dankness-seeds/genealogy")
    link("skunk-venom", "cali-octane", "venom-og", notes="Cali Octane × Venom OG per the HSC label (seedfinder has no entry to confirm). Unreleased unicorn tester hunted at Wild Leaf; picked up at the 2024 Emerald Cup. Sour citrus, burnt rubber, woody pine, chemical skunk; stout and squat.")

    # ---------------------------------------------------------- Albert Walker
    add("afghan-skunk", "Afghan Skunk (probably)", "seedline", "", "afghani", "skunk-1", notes="Seedfinder's best guess for Albert Walker's origin, flagged 'probably'.")
    link("albert-walker", "afghan-skunk", "", notes="Sourced from Cloney Soprano; “99% sure this is the real Albert”. Pacific Northwest clone that circulated at Grateful Dead shows; genetics unknown, seedfinder guesses Afghan Skunk. Greasy, mature citrus cologne with sulfur and gas.", seedfinder=SF + "albert-walker/clone-only-strains/genealogy")

    # ---------------------------------------------------------- Glitter Bomb
    add("blueberry-headband", "Blueberry Headband", "seedline", "Emerald Triangle Seeds", notes="Blueberry × (OG Kush / Cali Sour D / Bubba Kush) per seedfinder.")
    add("ogkb-x-blueberry-headband", "OGKB × Blueberry Headband", "seedline", "", "ogkb", "blueberry-headband")
    add("cherry-pie", "Cherry Pie", "cut", "durban-poison", "granddaddy-purple", notes="Durban Poison × Granddaddy Purple (reported).", seedfinder=SF + "Cherry_Pie/Unknown_or_Legendary/")
    add("granddaddy-purple", "Granddaddy Purple", "cut", notes="Purple Urkle × Big Bud (reported).")
    add("grape-stomper", "Grape Stomper", "seedline", "Gage Green", notes="Purple Elephant × Chemdawg Sour Diesel (reported).", seedfinder=SF + "Grape_Stomper/Gage_Green_Genetics/")
    add("grape-pie", "Grape Pie", "seedline", "Cannarado", "cherry-pie", "grape-stomper", seedfinder=SF + "Grape_Pie/Cannarado_Genetics/")
    add("jet-fuel-gelato", "Jet Fuel Gelato", "seedline", "Compound Genetics", "jet-fuel", "gelato")
    add("jet-fuel", "Jet Fuel (G6)", "seedline", "303 Seeds", notes="Aspen OG × High Country Diesel.")
    add("grape-gasoline", "Grape Gasoline #10", "seedline", "Compound Genetics", "grape-pie", "jet-fuel-gelato")
    link("glitter-bomb", "ogkb-x-blueberry-headband", "grape-gasoline", breeder="Compound Genetics", notes="Compound Genetics' El Chivo #5: (OGKB × Blueberry Headband) × Grape Gasoline #10. The exclusive cut passed around the Oregon rec scene; floral blueberry, first to frost.", seedfinder=SF + "glitter-bomb/compound-genetics/genealogy")

    # ---------------------------------------------------------- Blue Dream
    add("blueberry-dj", "Blueberry (DJ Short)", "seedline", "DJ Short", notes="Temple Flo × HTAF: Purple Thai and Thai sativas over Afghani.", seedfinder=SF + "Blueberry/DJ_Short/")
    add("super-silver-haze", "Super Silver Haze (probably)", "seedline", "Mr. Nice / Green House", "haze", "skunk-1", notes="(Haze × Haze) × Skunk #1 / NL #5. Seedfinder flags it as the probable Haze side of Blue Dream.")
    link("blue-dream", "blueberry-dj", "super-silver-haze", notes="The Santa Cruz clone: DJ Short Blueberry × a Haze, probably Super Silver Haze. Archive's cut: “100% dead-on Blue Dream.”", seedfinder=SF + "blue-dream/clone-only-strains/genealogy")

    # ---------------------------------------------------------- Guava Tart
    add("guava-gelato", "Guava Gelato", "cut", "gelato", "", notes="Sherbinskis' Gelato #25 line.")
    add("grandi-guava", "Grandi Guava", "cut", "Grandiflora Genetics", "guava-gelato", "gelato")
    add("caribbean-cookies", "Caribbean Cookies (Guava Gelato × OGKB Bx1)", "seedline", "", "guava-gelato", "ogkb")
    link("guava-tart", "grandi-guava", "caribbean-cookies", notes="Purple City Genetics' clone-only: Grandi Guava × Caribbean Cookies. Emerald Cup 2024 pickup; fresh tennis balls and Pez candy.", seedfinder=SF + "guava-tart/purple-city-genetics/genealogy")

    # ---------------------------------------------------------- Ricky's Hash Plant
    add("jack-herer", "Jack Herer", "seedline", "Sensi Seeds", "haze", "skunk-1", notes="(NL #5 × Haze) × (Skunk #1 × Haze).")
    add("genius", "Genius", "cut", "jack-herer", "", notes="A Jack Herer phenotype (probably).")
    add("hash-plant-1989", "Hash Plant (Sensi, 1989 line)", "seedline", "Sensi Seeds", notes="Hash Plant × (Hash Plant × NL #1).")
    add("skelly-hashplant", "Skelly Hashplant", "cut", "hash-plant-1989", "")
    add("genius-x-skelly", "Genius × Skelly Hashplant", "seedline", "Brothers Grimm", "genius", "skelly-hashplant")
    add("g13", "G13 (Airborne cut)", "cut", notes="The legendary government-lab clone story; parents unknown.")
    add("airborne-g13-s1", "Airborne G13 S1", "seedline", "Scott Family Farms", "g13", "g13")
    link("rickys-hashplant", "genius-x-skelly", "airborne-g13-s1", breeder="Brothers Grimm Seeds", notes="MrSoul's Trailer Park Boys release (2024): (Genius × Skelly Hashplant) × Airborne G13 S1. Tester from fem seed; baby-poo lemons, garlicky pepper, serious pucker.", seedfinder=SF + "rickys-hash-plant/brothers-grimm/genealogy")

    # ---------------------------------------------------------- Sweet Stinky Cheese
    add("uk-cheese", "UK Cheese (Exodus cut)", "cut", "skunk-1", "", notes="A Skunk #1 selection from the UK, c. 1988.", seedfinder=SF + "Cheese/Unknown_or_Legendary/")
    add("sweet-16", "Sweet 16", "seedline", "CSI Humboldt", notes="(Mendo Purps × Killer Queen) × (Hawaiian × Afghani #1); used reversed.")
    link("sweet-stinky-cheese", "uk-cheese", "sweet-16", notes="CSI Humboldt feminized: UK Cheese × reversed Sweet 16.", seedfinder=SF + "sweet-stinky-cheese/humboldt-csi/genealogy")

    # ---------------------------------------------------------- Diesel family, Headband, Lemon Tree
    add("mass-super-skunk-x-nl", "Mass Super Skunk × Sensi NL", "seedline", "", "skunk-1", "")
    add("original-diesel", "Original Diesel", "cut", "chemdawg", "mass-super-skunk-x-nl", notes="Chemdawg × (Massachusetts Super Skunk × Sensi Northern Lights).")
    add("dnl", "DNL", "seedline", notes="(RFK Skunk × Hawaiian) × Northern Lights.")
    add("sour-diesel", "Sour Diesel", "cut", "original-diesel", "dnl", notes="East Coast Sour Diesel: Original Diesel × DNL.", seedfinder=SF + "Sour_Diesel/Unknown_or_Legendary/")
    link("ajs-sour-diesel", "sour-diesel", "", notes="AJ's cut, the benchmark East Coast Sour Diesel clone (New York, 1990s). Archive's cut. Liked enough to run again for headstash.", seedfinder=SF + "sour-diesel/unknown-or-legendary/genealogy")
    add("headband", "Headband", "cut", "sour-diesel", "og-kush", notes="Sour Diesel × OG Kush; the 707 cut is that crossed back to Sour Diesel.", seedfinder=SF + "707-headband/clone-only-strains/genealogy")
    link("notsos-headband", "headband", "", notes="Notsodog's Diesel-leaning Headband cut, from a friend. “Breeds like a champ.” The cut labelled “LA Sour” on the Run 2 roster turned out to be this same plant.")
    add("lemon-skunk", "Lemon Skunk", "seedline", "DNA Genetics", "skunk-1", "", notes="Las Vegas Lemon Skunk × unknown Skunk.")
    link("lemon-tree", "lemon-skunk", "sour-diesel", notes="The Santa Cruz clone: Lemon Skunk × Sour Diesel. Best Hybrid at the 2014 SF and Seattle High Times Cups. Archive's clone.", seedfinder=SF + "lemon-tree/unknown-or-legendary/genealogy")

    # ---------------------------------------------------------- Gushy Kush side
    add("cookies-and-cream", "Cookies & Cream", "seedline", "Exotic Genetix", "gsc", "", notes="Girl Scout Cookies × Starfighter F2.")
    add("secret-weapon", "Secret Weapon", "seedline", "In House Genetics", notes="White Fire Alien × WiFi × unknown pie.")
    add("oreoz", "Oreoz 1.0", "seedline", "3rd Coast Genetics", "cookies-and-cream", "secret-weapon")
    add("mendo-montage", "Mendo Montage", "seedline", "Gage Green", notes="Mendo Purps × Crystal Locomotive.")
    add("mendobreath-f2", "Mendobreath F2 (Studly Spewright)", "seedline", "Gage Green", "ogkb", "mendo-montage")
    link("pure-michigan-f3", "oreoz", "mendobreath-f2", notes="3rd Coast Genetics' Pure Michigan (Oreoz × Mendobreath F2), worked to F3 by Soiltech.", seedfinder=SF + "pure-michigan/3rd-coast-genetics/genealogy")

    # ---------------------------------------------------------- TPK × Pink Kush
    add("topanga-pure-kush", "Topanga Pure Kush (Topanga Canyon cut)", "cut", "hindu-kush", "", notes="Believed to descend from Hindu Kush (seedfinder: 'probably' Hindu Kush × Hindu Kush) or OG Kush.", seedfinder=SF + "topanga-pure-kush/greenpoint-seeds/genealogy")
    add("pink-kush", "Pink Kush", "cut", "og-kush", "", notes="BC-selected OG Kush phenotype (reported).")
    add("ultimate-pink-kush", "Ultimate Pink Kush", "seedline", "Reeferman Seeds", "pink-kush", "pink-kush", notes="Pink Kush S1.")
    link("tpk-x-pink-kush", "topanga-pure-kush", "ultimate-pink-kush")
    link("pure-krush", "topanga-pure-kush", "romulan")

    # ---------------------------------------------------------- Blueberry Cupcake, Kush Crasher, Wedding Cake family
    add("purple-panty-dropper", "Purple Panty Dropper", "seedline", notes="Matanuska Mist × Oregon Grape × Purple Haze, BX8.")
    add("razzleberry-kush", "Razzleberry Kush", "seedline", notes="Raspberry Kush × Purple Kush.")
    add("blueberry-muffin", "Blueberry Muffin", "seedline", "Humboldt Seed Co.", "purple-panty-dropper", "razzleberry-kush", seedfinder=SF + "blueberry-muffin/humboldt-seed-company/genealogy")
    add("animal-cookies", "Animal Cookies", "seedline", "BC Bud Depot", "gsc", "", notes="Girl Scout Cookies × Fire OG Bx3.")
    add("sinmint-cookies", "SinMint Cookies", "seedline", "Sin City Seeds", "gsc", "", notes="Forum Cookies × Blue Power.")
    add("animal-mints", "Animal Mints", "seedline", "Seed Junky", "animal-cookies", "sinmint-cookies")
    add("wedding-cake", "Wedding Cake (Triangle Mints #23)", "cut", "triangle-kush", "animal-mints", seedfinder=SF + "wedding-cake/seed-junky-genetics/genealogy")
    link("blueberry-cupcake", "blueberry-muffin", "wedding-cake", breeder="Humboldt Seed Co. / HendRx", notes="Blueberry Muffin × Wedding Cake, an Oregon rec cut personally hunted by a friend. Viney and lanky, tests high, complex blueberry, throws preflowers under 18/6, true 8-weeker.", seedfinder=SF + "blueberry-cupcake/humboldt-seed-company/genealogy")
    add("larry-og", "Larry OG", "cut", "og-kush", "", notes="Lemon Larry OG cut.")
    add("purple-punch", "Purple Punch", "seedline", "", "larry-og", "granddaddy-purple")
    add("wedding-crasher", "Wedding Crasher", "seedline", "Symbiotic Genetics", "wedding-cake", "purple-punch", seedfinder=SF + "wedding-crasher/symbiotic-genetics/genealogy")
    link("kush-crasher", "topanga-pure-kush", "wedding-crasher", notes="Oregon rec cut. Leafly gives Pure Kush × Wedding Crasher; not on seedfinder.")

    # ---------------------------------------------------------- Marrakesh, Freezer Jam
    add("barbara-bud", "Barbara Bud", "seedline", notes="Shishkaberry × Afghani.")
    add("lemon-tree-x-barbara-bud", "Lemon Tree × Barbara Bud", "seedline", "", "lemon-tree", "barbara-bud")
    add("skorange", "Skorange", "seedline", "skunk-1", "", notes="Skunk × Orange Juice Bud.")
    add("moroccan-peaches", "Moroccan Peaches", "seedline", "Purple City Genetics", "lemon-tree-x-barbara-bud", "skorange")
    add("zkittlez", "Zkittlez (The Original Z)", "cut", notes="Grape Ape × Grapefruit (reported).")
    add("runtz", "Runtz", "cut", "zkittlez", "gelato")
    add("thc-bomb", "THC Bomb", "seedline", "Bomb Seeds")
    add("canal-street-runtz", "Canal Street Runtz", "seedline", "", "runtz", "thc-bomb")
    link("marrakesh", "moroccan-peaches", "canal-street-runtz", breeder="Purple City Genetics", notes="Oregon rec cut of PCG's Marrakesh: Moroccan Peaches × Canal Street Runtz.", seedfinder=SF + "marrakesh/purple-city-genetics/genealogy")
    add("gmo", "GMO (Garlic Cookies)", "seedline", "Mamiko Seeds", "chem-d", "gsc", notes="Chem D × Girl Scout Cookies.")
    add("mimosa", "Mimosa", "seedline", "Symbiotic Genetics", "", "purple-punch", notes="Clementine × Purple Punch.")
    add("garlic-cocktail", "Garlic Cocktail", "seedline", "", "gmo", "mimosa")
    add("biscotti", "Biscotti", "seedline", "Cookie Fam", "", "gelato", notes="South Florida OG × Gelato #25.")
    add("the-menthol", "The Menthol", "seedline", "Compound Genetics", "", "gelato", notes="Gelato #45 × (White Diesel × (High Octane × Jet Fuel)).")
    add("cold-snap", "Cold Snap", "seedline", "Wyeast Farms", "biscotti", "the-menthol", seedfinder=SF + "cold-snap/wyeast-farms/genealogy")
    link("freezer-jam", "garlic-cocktail", "cold-snap", breeder="Wyeast Farms", notes="Oregon rec cut of Wyeast Farms' Freezer Jam: Garlic Cocktail × Cold Snap.")

    # ---------------------------------------------------------- Stardawg, Chem 4
    link("chem-4", "chemdawg", "", notes="Chemdawg phenotype #4, SoCal cut from a friend. Gassy; nap-inducing narcotic; wide Jurassic paddle leaves in early veg.", seedfinder=SF + "Chemdawg_4/Unknown_or_Legendary/")
    add("double-dawg", "Double Dawg", "seedline", "Top Dawg", "chem-d", "", notes="Chem D × (Chem D × Afghani #1).")
    add("tres-dawg", "Tres Dawg", "seedline", "Top Dawg", "chem-d", "double-dawg")
    link("stardawg-corey", "chem-4", "tres-dawg", breeder="Top Dawg Seeds", notes="The Corey Haim cut, selected from Top Dawg's Chem 4 × Tres Dawg. Archive's clone.", seedfinder=SF + "stardawg/top-dawg-seeds/genealogy")

    # ---------------------------------------------------------- Gary Payton, Alberta Breath
    add("the-y", "The Y", "cut", "Powerzzzup Genetics", notes="Cookies-family cut; seedfinder's Amnesia × Kali Mist mapping is doubtful.")
    link("gary-payton", "the-y", "snowman", breeder="Powerzzzup × Cookies", notes="Pheno #20 of The Y × Snowman.", seedfinder=SF + "gary-payton/unknown-or-legendary/genealogy")
    add("pink-pixie", "Pink Pixie", "unknown")
    add("godsbreath", "God's Breath", "seedline", notes="Peanut Butter Breath × Strawberry Pinecone (reported).")
    add("toracco", "Toracco", "homebrew", "a friend in town", "pink-pixie", "godsbreath")
    add("sherbet-haze", "Sherbet Haze", "cut", "", "sunset-sherbet", "haze", notes="Thought to be Sherbert × Haze; not on seedfinder.")
    link("alberta-breath", "toracco", "sherbet-haze")

    # ========================================================== batch A: the Charcuterie, Communion, Lime Bubble side
    # Romulan, Communion
    add("romulan", "Romulan", "cut", notes="British Columbia clone of unknown make-up; the Vancouver Island story runs Thai/Colombian/Mexican sativas with Afghan indica added in the early 1980s.", seedfinder=SF + "romulan/unknown-or-legendary")
    add("underdawg-og", "Underdawg OG", "cut", "og-kush", "sour-diesel", notes="Loompa's NY OG.")
    add("grapestomper-og", "Grapestomper OG", "seedline", "Gage Green", "grape-stomper", "underdawg-og", seedfinder=SF + "grape-stomper-x-og/gage-green-genetics")
    add("gso-x-durban", "Grapestomper OG × Durban Poison", "seedline", "Romulan Genetics", "grapestomper-og", "durban-poison", notes="Romulan Genetics hunted a Durban Poison from old seed and mated it to Grapestomper OG.")
    link("communion-s1", "gso-x-durban", "romulan", seedfinder=SF + "communion/romulan-genetics")
    link("mutant-communion", "gso-x-durban", "romulan")
    add("purple-elephant", "Purple Elephant", "cut", notes="JojoRizo's Purple Urkle hashplant.")
    add("chemdog-sour-diesel", "Chemdog Sour Diesel", "seedline", "Elite Seeds", "headband", "sour-diesel", notes="Said to really be Headband × Sour Diesel.")
    link("grape-stomper", "purple-elephant", "chemdog-sour-diesel", notes="Gage Green's Sour Grapes cut: Purple Elephant × Chemdog Sour Diesel.")
    # Charcuterie side
    add("tahoe-og", "Tahoe OG", "cut", "og-kush", "", notes="Lake Tahoe OG Kush phenotype, reportedly late 1990s.", seedfinder=SF + "tahoe-og-kush/the-cali-connection")
    add("gsc-forum-x-tahoe-bx", "GSC Forum cut × Tahoe OG bx", "seedline", "Cannarado", "gsc", "tahoe-og")
    add("doho", "DoHo", "seedline", "Cannarado", "thin-mint-cookies", "gsc-forum-x-tahoe-bx", notes="Cannarado's FAQ: Thin Mint × (GSC Forum × Tahoe OG bx), started in 2012.")
    add("grape-pie-x-doho", "Grape Pie × DoHo ♂", "seedline", "Cannarado", "grape-pie", "doho", notes="A male 'identical to the Grape Pie mom' used to backcross her.")
    link("grape-pie-bx", "grape-pie", "grape-pie-x-doho", seedfinder=SF + "grape-pie-bx/cannarado-genetics")
    link("cheesy-d", "uk-cheese", "chem-d")
    link("charcuterie", "cheesy-d", "grape-pie-bx", seedfinder=SF + "charcuterie/cannarado-genetics")
    link("charcuterie-4", "cheesy-d", "grape-pie-bx")
    # Tropical Slushee
    link("tropical-slushee", "snowman", "papaya-oni", seedfinder=SF + "tropical-slushee/cannarado-genetics")
    link("papaya-oni", notes="Oni Seed Co's cut, treated by seedfinder as a selection of Nirvana's Papaya (Citral × Ice).")
    # Avalon × Banner
    add("strawberry-diesel", "Strawberry Diesel", "seedline", "Reservoir Seeds", "", "sour-diesel", notes="Strawberry Cough × Sour Diesel IBL.")
    add("bruce-banner", "Banner (Bruce Banner cut)", "cut", "og-kush", "strawberry-diesel", notes="Dark Horse Genetics' Bruce Banner: Ghost OG × Strawberry Diesel; Next Generation's 27% THC cutting.", seedfinder=SF + "bruce-banner/dark-horse-genetics")
    add("afghani-x-hashplant", "Afghani × Hashplant (1996 male)", "seedline", "", "afghani", "hash-plant-1989")
    add("avalon", "Avalon", "seedline", "Next Generation", "blueberry-dj", "afghani-x-hashplant", notes="DJ Short Blueberry female × Afghani/Hashplant male, inbred since 1996.", seedfinder=SF + "avalon/next-generation-seed-company")
    link("avalon-x-banner", "bruce-banner", "avalon", notes="Next Generation: their Banner cutting as mother, resurrected Avalon as father. Outdoor project mother; shrugged off bud rot in a wet October; spicy, peppery, skunky, citronella.", seedfinder="https://nextgenerationseedcompany.com/product/avalon-x-banner/")
    # Dirty Unicorn
    add("ghost-og", "Ghost OG", "cut", "og-kush", "")
    add("grateful-breath", "Grateful Breath", "seedline", "Gage Green", notes="Cherry Pie Kush × Joseph OG.")
    add("sophisticated-lady", "Sophisticated Lady", "seedline", "Gage Green", "ghost-og", "grateful-breath")
    add("unicorn-poop", "Unicorn Poop", "seedline", "Thug Pug", "gmo", "sophisticated-lady", seedfinder=SF + "unicorn-poop/thugpug-genetics")
    link("dirty-unicorn", "unicorn-poop", "unicorn-poop", notes="Dirty Bird's S1 of their #2 pheno of Thug Pug's Unicorn Poop. A root-bound bonsai used as a spot filler.", seedfinder=SF + "dirty-unicorn/dirty-bird-genetics")
    # Island Sweet Skunk
    add("sweet-pink-grapefruit", "Sweet Pink Grapefruit", "cut")
    add("nl5-x-haze", "Northern Lights #5 × Haze", "seedline", "Sensi Seeds", "", "haze")
    add("sweet-skunk", "Sweet Skunk", "seedline", "Spice of Life", "sweet-pink-grapefruit", "nl5-x-haze")
    add("white-widow", "White Widow", "seedline", "Green House", notes="Brazil sativa × South Indian indica.")
    link("island-sweet-skunk", "sweet-skunk", "white-widow", notes="Federation / Next Generation from a Vancouver Island clone; seedfinder gives Sweet Skunk × White Widow as 'probably', lineage disputed. The stretcher pheno, 11–12 weeks, sour lemon pine foxtails.", seedfinder=SF + "island-sweet-skunk/federation-seed-company")
    # Tahoe OG bagseed
    link("tahoe-og-bagseed", "tahoe-og", "", notes="One of a few seeds in a batch of NorCal outdoor, ~2012–14, sold as Tahoe OG; the pollen parent is unknown. Lanky, low yield, extremely narcotic, zero herms. Pine-oil mops, lemongrass, onion.")
    # Lime Bubble
    add("black-lime", "Black Lime", "seedline", "Aficionado / Freeborn", notes="Composite of Woodman Canyon Oil Can, Lime Afghani, Northern Lights, Purple Kush and Chemdawg Special Reserve.", seedfinder=SF + "black-lime/aficionado-seed-collection")
    add("lime-1", "Lime 1", "seedline", "Freeborn Selections", "topanga-pure-kush", "black-lime", notes="Mean Gene: 'Lime 1 is the mother of Black Lime Reserve, she's Hollywood/Topanga Pure Kush × Black Lime'.")
    link("black-lime-reserve", "lime-1", "", notes="Freeborn Selections (Mean Gene, Mendocino); the Jodrey cut is Kevin Jodrey's Wonderland Nursery selection. Father side of Lime Bubble.")
    add("bubblegum", "Bubblegum (Indiana)", "cut", notes="The 1970s Indiana Bubble Gum that TH Seeds and Serious Seeds worked into seed.")
    add("bogbubble", "BOGBubble", "seedline", "BOG Seeds", "bubblegum", "bubblegum", notes="BOG's Double Gum / WL Bubblegum work.")
    link("sour-bubble", "bogbubble", "bogbubble", notes="BOG: 'it's all BOGBubble', the Sour Bubble clone cubed with backcross males; the '04 BxC-2 F2 is a later generation. Mother side of Lime Bubble.", seedfinder=SF + "sour-bubble/bog-seeds")
    # Chemdawg siblings
    link("chem-d", notes="Chemdawg phenotype D, popped in 2001 from the same Dog Bud seed lot; a sibling of Chem 91 and Chem 4.")
    link("chem-4", notes="The 2006 'reunion pheno', seed #4 of the last Dog Bud seeds: a sibling of Chem 91 and Chem D, not a descendant. SoCal cut from a friend; gassy, narcotic, wide Jurassic paddle leaves.")

import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.all_models import Disease, User, UserRole, AIModelMeta, ReviewStatus
from app.core.security import get_password_hash

DISEASE_SEEDS = [
    {
        "name": "Healthy",
        "scientific_name": "Oryza sativa (Normal)",
        "description": "The rice plant shows vigorous green foliage, uniform leaf color without necrotic lesions, and normal vegetative or reproductive growth.",
        "symptoms": json.dumps([
            "Uniform vibrant green leaves",
            "No discoloration, spots, or lesions",
            "Erect leaf posture and sturdy tillers"
        ]),
        "risk_factors": json.dumps([
            "Imbalanced nitrogen application may predispose to future infections",
            "Water stagnation or extreme drought"
        ]),
        "precautions": json.dumps([
            "Continue standard recommended irrigation cycles",
            "Maintain balanced N-P-K nutrient application based on soil testing",
            "Regularly monitor leaf tips and lower canopies"
        ]),
        "management": json.dumps([
            "Cultural: Keep field bunds clear of wild grasses",
            "Monitoring: Inspect crop twice weekly during panicle initiation",
            "Expert Consultation: Consult local Krishi Vigyan Kendra (KVK) for seasonal advisories"
        ]),
        "source": "ICAR-NRRI (National Rice Research Institute) Guidelines",
        "region": "All Rice Growing Zones in India",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Bacterial Leaf Blight",
        "scientific_name": "Xanthomonas oryzae pv. oryzae",
        "description": "A serious bacterial vascular disease causing systemic wilting (kresek) in seedlings and wavy yellow-white lesions from leaf tips downward.",
        "symptoms": json.dumps([
            "Water-soaked stripes starting from leaf margins near tips",
            "Lesions turn yellowish to bleached white with undulating, wavy margins",
            "Milky bacterial ooze droplets visible on young lesions during early morning humidity"
        ]),
        "risk_factors": json.dumps([
            "Continuous rainstorms and strong winds causing leaf abrasion",
            "Deep standing floodwater in lowlands",
            "High nitrogen levels without potassium balance"
        ]),
        "precautions": json.dumps([
            "Drain excess water from the field during severe weather",
            "Apply balanced fertilizer with split nitrogen and adequate potash (potassium helps cell wall strength)",
            "Avoid clipping seedling leaf tips during transplantation"
        ]),
        "management": json.dumps([
            "Cultural: Plow under crop stubbles immediately after harvest to speed decomposition",
            "Monitoring: Check field perimeter every 3 days during tillering stage",
            "Expert Consultation: Connect with district agricultural extension officer for regional bacteriological management advisories"
        ]),
        "source": "ICAR-IIRR Technical Bulletin on Rice Bacterial Pathogens",
        "region": "Northern, Eastern, and Southern Rice Belts",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Brown Spot",
        "scientific_name": "Bipolaris oryzae (Cochliobolus miyabeanus)",
        "description": "A fungal disease frequently associated with nutritional stress, silica deficiency, or poorly drained physiological soil conditions.",
        "symptoms": json.dumps([
            "Small circular to oval brown spots uniformly scattered across leaf blades",
            "Mature spots have gray-white centers with distinct yellow halos",
            "Infected seeds turn discolored and shriveled"
        ]),
        "risk_factors": json.dumps([
            "Nutrient-deficient soils, specifically nitrogen, potassium, and micronutrients like zinc and silica",
            "Drought-stressed upland conditions alternating with wet soil",
            "Use of uncertified farm-saved seed without treatment"
        ]),
        "precautions": json.dumps([
            "Conduct soil testing and correct nitrogen and potassium deficiencies",
            "Maintain adequate soil moisture without severe drought cycles",
            "Utilize certified treated disease-free seeds"
        ]),
        "management": json.dumps([
            "Cultural: Practice balanced fertilization with organic manure / compost",
            "Monitoring: Inspect older leaves first as brown spot symptoms initially appear on senescing tissue",
            "Expert Consultation: Obtain soil health card advice from your nearest Krishi Vigyan Kendra"
        ]),
        "source": "ICAR Central Rice Research Institute (CRRI)",
        "region": "Eastern and Rainfed Upland Belts",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Leaf Blast",
        "scientific_name": "Magnaporthe oryzae (Foliar Phase)",
        "description": "The foliar manifestation of rice blast fungus producing classic spindle or diamond-shaped lesions with grayish centers on leaf blades.",
        "symptoms": json.dumps([
            "Spindle-shaped elliptical spots with pointed ends, gray/whitish center and dark brown border",
            "Lesions expand rapidly and coalesce into large necrotic blighted areas on the leaf blade",
            "Severe infection leads to complete leaf drying and burning appearance of foliage"
        ]),
        "risk_factors": json.dumps([
            "Night temperatures around 19-23°C with relative humidity > 90%",
            "Prolonged dew deposition on leaf surfaces",
            "Excessive nitrogen application"
        ]),
        "precautions": json.dumps([
            "Avoid excessive or late application of chemical nitrogen fertilizers",
            "Maintain optimal plant spacing to allow leaf aeration and sunlight penetration",
            "Plant resistant varieties recommended by state agricultural university"
        ]),
        "management": json.dumps([
            "Cultural: Destroy infected straw and weeds on field bunds",
            "Monitoring: Scout seedling nurseries and active tillering stages early in the morning",
            "Expert Consultation: Consult local extension officer when foliar lesions cover > 5% of leaf area"
        ]),
        "source": "ICAR-NRRI Cuttack & IRRI Rice Knowledge Bank",
        "region": "Humid and Temperate Rice Zones",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Leaf Scald",
        "scientific_name": "Microdochium oryzae (Monographella albescens)",
        "description": "Fungal disease characterized by prominent zonate banding starting from leaf tips and margins resembling scalded or cooked tissue.",
        "symptoms": json.dumps([
            "Water-soaked oblong lesions developing from leaf tips and outer margins",
            "Concentric alternating light tan and dark reddish-brown bands creating a scalded pattern",
            "Affected leaf tips dry up and take on a bleached, shredded appearance"
        ]),
        "risk_factors": json.dumps([
            "High humidity, frequent rain showers, and warm temperatures (25-30°C)",
            "Dense canopy with poor air circulation",
            "High nitrogen levels and close planting"
        ]),
        "precautions": json.dumps([
            "Avoid excessive nitrogen application; apply potassium in split doses",
            "Space hills at recommended distance (e.g., 20 x 15 cm)",
            "Keep field bunds weed-free to lower micro-climate humidity"
        ]),
        "management": json.dumps([
            "Cultural: Practice crop rotation and clear stubble post-harvest",
            "Monitoring: Check upper canopy leaves after prolonged rainy spells",
            "Expert Consultation: Contact local KVK agronomist if scald bands advance down to flag leaves"
        ]),
        "source": "IRRI Diagnostic Guide & TNAU Agritech Portal",
        "region": "Tropical Rainfed and Irrigated Ecosystems",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Narrow Brown Spot",
        "scientific_name": "Cercospora janseana (Passalora janseana)",
        "description": "Fungal leaf disease producing short, narrow, linear reddish-brown lesions parallel to leaf veins, commonly appearing late in the season.",
        "symptoms": json.dumps([
            "Short, narrow, linear brown spots (2-10 mm long, 1-1.5 mm wide) oriented parallel to leaf veins",
            "Spots are uniform light to dark brown without gray centers, distinguishing them from Brown Spot",
            "Severe infections cause premature leaf senescence, lodging, and poor grain filling"
        ]),
        "risk_factors": json.dumps([
            "Nutrient-depleted soils, especially potassium deficiency",
            "Warm and humid late-season weather during heading and grain filling",
            "Susceptible late-maturing varieties"
        ]),
        "precautions": json.dumps([
            "Ensure balanced potassium (potash) nutrition according to soil test recommendations",
            "Avoid delayed sowing in late kharif or rabi cycles",
            "Select resistant cultivars known for tolerance to Cercospora"
        ]),
        "management": json.dumps([
            "Cultural: Remove infected residues after harvesting to reduce overwintering conidia",
            "Monitoring: Inspect flag leaf and penultimate leaves from panicle emergence onwards",
            "Expert Consultation: Seek guidance if linear lesions appear before 50% heading"
        ]),
        "source": "ICAR-IIRR Integrated Pest Management Manual",
        "region": "South and Central Indian Rice Ecosystems",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Neck Blast",
        "scientific_name": "Magnaporthe oryzae (Panicle Phase)",
        "description": "The most destructive phase of blast disease where the fungus attacks the neck node supporting the panicle, resulting in complete grain sterility or broken panicles.",
        "symptoms": json.dumps([
            "Brownish-black or grayish-brown necrotic lesion at the neck node of the panicle",
            "Panicle neck becomes brittle and snaps or lodges under the weight of grain",
            "Grains remain empty, chaffy, and whitish (whitehead effect)"
        ]),
        "risk_factors": json.dumps([
            "Foliar leaf blast present in the vegetative stage with spore splash during heading",
            "Intermittent rains, cloud cover, and heavy morning dew during 50% panicle emergence",
            "Over-fertilization with nitrogen near booting or heading"
        ]),
        "precautions": json.dumps([
            "Strictly avoid nitrogen top-dressing after boot leaf emergence",
            "Maintain proper water depth without excessive field inundation during flowering",
            "Adopt community-wide blast-resistant cultivars in endemic pockets"
        ]),
        "management": json.dumps([
            "Cultural: Rogue severely infected neck blast panicles to limit secondary airborne dispersal",
            "Monitoring: Inspect panicle emergence daily during heading stage in humid weather",
            "Expert Consultation: Report neck blast emergence immediately to local agricultural development officer (ADO)"
        ]),
        "source": "ICAR-National Rice Research Institute (NRRI)",
        "region": "High-Yielding Irrigated and Coastal Zones",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Rice Hispa",
        "scientific_name": "Dicladispa armigera",
        "description": "A destructive insect pest whose spiny adult beetles scrape upper leaf surfaces while the larvae mine between epidermal layers, producing characteristic white blistered streaks.",
        "symptoms": json.dumps([
            "Parallel white streaks on upper leaf surface scraped by adult spiny blue-black beetles",
            "White blotches or blister mines created by larvae feeding inside leaf tissue",
            "Damaged leaves wither, dry up, and the field takes on an overall scorched or whitish appearance"
        ]),
        "risk_factors": json.dumps([
            "Heavy continuous rain followed by bright sunny days during tillering",
            "Dense grassy weeds on bunds serving as alternate hosts",
            "High seedling density in nursery beds"
        ]),
        "precautions": json.dumps([
            "Clip and burn seedling leaf tips before transplanting to destroy hispa eggs and grubs",
            "Maintain clean field bunds and destroy wild host grasses like Leersia",
            "Avoid excessive plant density and heavy nitrogen application in pest-prone tracts"
        ]),
        "management": json.dumps([
            "Cultural: Sweep nets to collect and eliminate adult hispa beetles in early stages",
            "Monitoring: Count adults and damaged leaves per hill during active tillering",
            "Expert Consultation: Alert agricultural department if hispa damage exceeds 1 adult or 1 damaged leaf per hill"
        ]),
        "source": "Directorate of Plant Protection, Quarantine & Storage (DPPQS) & ICAR",
        "region": "Eastern, North-Eastern, and Southern India",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Sheath Blight",
        "scientific_name": "Rhizoctonia solani",
        "description": "Soil-borne and water-borne fungal disease characterized by greenish-gray oval lesions on leaf sheaths near the water line.",
        "symptoms": json.dumps([
            "Oval or irregular water-soaked spots on leaf sheaths just above water level",
            "Lesions turn grayish-white with irregular brown boundaries",
            "Infection progresses upward to flag leaves in dense canopies, forming 'banded' lesions"
        ]),
        "risk_factors": json.dumps([
            "Warm temperatures (28-32°C) and high relative humidity (85-100%)",
            "Heavy canopy density and high tillering varieties",
            "High nitrogen levels causing excessive vegetative growth"
        ]),
        "precautions": json.dumps([
            "Optimize seedling spacing to allow canopy aeration and sunlight penetration",
            "Avoid excess nitrogen fertilizer; split nitrogen into 3-4 doses",
            "Drain field water intermittently to lower soil moisture around sheath base"
        ]),
        "management": json.dumps([
            "Cultural: Remove weed hosts like Echinochloa on field bunds",
            "Field Management: Skim floating sclerotia during final puddling",
            "Expert Consultation: Check threshold with local agronomist if >20% hills exhibit sheath lesions"
        ]),
        "source": "ICAR-IIRR Integrated Pest Management Manual",
        "region": "Intensive Irrigated Rice Areas",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Tungro",
        "scientific_name": "Rice Tungro Bacilliform & Spherical Viruses",
        "description": "A viral disease complex transmitted by the green leafhopper (Nephotettix virescens) leading to severe stunting and orange-yellow discoloration.",
        "symptoms": json.dumps([
            "Stunted plants with significantly reduced tillering",
            "Leaves turn yellow to orange-yellow starting from leaf tips",
            "Young leaves often show mottled or interveinal chlorosis",
            "Delayed flowering and unfilled grains"
        ]),
        "risk_factors": json.dumps([
            "Presence of Green Leafhopper vector populations",
            "Staggered planting in adjacent fields harboring continuous insect vectors",
            "Susceptible varieties planted during high vector migration periods"
        ]),
        "precautions": json.dumps([
            "Practice synchronous planting within the farming village/community",
            "Eradicate volunteer rice plants and wild grass hosts during fallow periods",
            "Grow tungro-resistant rice varieties"
        ]),
        "management": json.dumps([
            "Cultural: Light traps to monitor leafhopper vector density",
            "Monitoring: Scout nursery beds and early tillering stage for green leafhoppers",
            "Expert Consultation: Report community-wide yellow stunting immediately to agricultural authorities"
        ]),
        "source": "Directorate of Rice Research (DRR) & ICAR Advisory",
        "region": "South and Coastal India",
        "status": ReviewStatus.APPROVED
    },
    {
        "name": "Unknown / Not Rice",
        "scientific_name": "Non-Rice Plant or Non-Crop Specimen",
        "description": "The image provided does not clearly show characteristic rice foliage or symptoms cannot be reliably distinguished by the AI preliminary classifier.",
        "symptoms": json.dumps([
            "Image lacks distinct rice leaf venation or structure",
            "Symptoms do not match known rice pathology profiles",
            "Subject may be blurred, occluded, or non-agricultural"
        ]),
        "risk_factors": json.dumps([
            "Poor camera focus, extreme shadows, or over-exposure",
            "Foreign object in focus instead of leaf blade"
        ]),
        "precautions": json.dumps([
            "Hold camera steady 15-25 cm from the rice leaf surface",
            "Ensure natural daylight without heavy backlighting",
            "Take photo against a plain background or clean soil"
        ]),
        "management": json.dumps([
            "Cultural: Re-take photo focusing sharply on symptomatic leaf areas",
            "Monitoring: Use the Ask Assistant tool or consult local KVK officer with a physical sample"
        ]),
        "source": "RiceGuard AI Verification Protocol",
        "region": "General",
        "status": ReviewStatus.APPROVED
    }
]

def seed_database(db: Session):
    for d_data in DISEASE_SEEDS:
        existing = db.query(Disease).filter(Disease.name == d_data["name"]).first()
        if not existing:
            disease = Disease(**d_data)
            db.add(disease)
        else:
            # Update existing with latest verified fields
            for key, val in d_data.items():
                setattr(existing, key, val)
    
    # Create demo admin and demo farmer if not present, or refresh their password hashes safely
    admin = db.query(User).filter(User.phone == "9876543210").first()
    admin_pwd_hash = get_password_hash("Admin@12345")
    if not admin:
        admin_user = User(
            name="Dr. Ramanathan (Agri Officer)",
            phone="9876543210",
            email="admin@riceguard.org",
            password_hash=admin_pwd_hash,
            role=UserRole.ADMIN,
            language="en",
            village="Mandya",
            district="Mandya",
            state="Karnataka"
        )
        db.add(admin_user)
    else:
        # Update existing admin password hash and role ensuring safe sync
        admin.password_hash = admin_pwd_hash
        admin.role = UserRole.ADMIN
        admin.email = "admin@riceguard.org"
        
    farmer = db.query(User).filter(User.phone == "9123456780").first()
    farmer_pwd_hash = get_password_hash("Farmer@12345")
    if not farmer:
        farmer_user = User(
            name="Ramesh Patel",
            phone="9123456780",
            email="ramesh@riceguard.org",
            password_hash=farmer_pwd_hash,
            role=UserRole.FARMER,
            language="en",
            village="Anand",
            district="Anand",
            state="Gujarat"
        )
        db.add(farmer_user)
    else:
        # Update existing farmer password hash ensuring safe sync
        farmer.password_hash = farmer_pwd_hash
        farmer.role = UserRole.FARMER
        farmer.email = "ramesh@riceguard.org"

    # Seed AI Model Meta
    model = db.query(AIModelMeta).filter(AIModelMeta.version == "rice-disease-v1").first()
    if not model:
        m_meta = AIModelMeta(
            name="RiceGuard Vision Transformer (Demo/Active)",
            version="rice-disease-v1",
            accuracy=0.948,
            val_accuracy=0.932,
            f1_score=0.936,
            precision=0.940,
            recall=0.933,
            status="active",
            is_active=True
        )
        db.add(m_meta)

    db.commit()

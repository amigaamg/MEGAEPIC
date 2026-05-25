export interface EducationArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
  category: string;
  condition: string;
  literacyLevel: 'basic' | 'intermediate' | 'advanced';
  readTimeMinutes: number;
  tags: string[];
  icon: string;
  author?: string;
  references?: string[];
}

const ARTICLES: EducationArticle[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // HYPERTENSION / CARDIOVASCULAR
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'htn-what-is-bp',
    title: 'Understanding Your Blood Pressure',
    summary: 'Learn what blood pressure numbers mean and why keeping them in a healthy range protects your heart, brain, and kidneys.',
    content: `Blood pressure is the force of blood pushing against the walls of your arteries as your heart pumps. Think of it like water pressure in a garden hose — when pressure is too high, it can damage the hose over time.

Your blood pressure reading has two numbers:
• SYSTOLIC (top number) — The pressure when your heart beats
• DIASTOLIC (bottom number) — The pressure when your heart rests between beats

WHAT THE NUMBERS MEAN:
• Normal: Below 120/80
• Elevated: 120-129 / below 80
• Stage 1 Hypertension: 130-139 / 80-89
• Stage 2 Hypertension: 140 or higher / 90 or higher
• Hypertensive Crisis: 180 or higher / 120 or higher — seek emergency care

WHY IT MATTERS:
High blood pressure is called the "silent killer" because it has no symptoms but slowly damages your blood vessels. Over time, it can cause:
• Heart attack and heart failure
• Stroke
• Kidney damage
• Vision loss
• Sexual problems

THE GOOD NEWS:
High blood pressure can be controlled! Simple changes make a big difference:
• Reduce salt to less than 1 teaspoon (5g) per day
• Eat more fruits and vegetables
• Walk for 30 minutes most days
• Take medications as prescribed
• Check your BP regularly at home`,
    keyPoints: [
      'Normal BP is below 120/80',
      'High BP has no symptoms — check regularly',
      'Salt reduction, exercise, and medications all work',
      'Uncontrolled BP damages heart, brain, kidneys',
      'Home monitoring helps you stay on track',
    ],
    category: 'Condition Basics',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['bp', 'blood pressure', 'hypertension', 'basics', 'understanding'],
    icon: '🫀',
    references: ['ACC/AHA 2017 Hypertension Guidelines', 'WHO Hypertension Fact Sheet'],
  },
  {
    id: 'htn-salt-restriction',
    title: 'Salt Restriction — Less Salt, Better Health',
    summary: 'Most Kenyans eat twice the recommended amount of salt. Cutting back is one of the most effective ways to lower blood pressure.',
    content: `WHY SALT MATTERS:
Salt (sodium) makes your body hold onto water. More water in your blood vessels = higher blood pressure. Reducing salt can lower your BP by 5-10 mmHg — as effective as some medications!

HOW MUCH IS TOO MUCH?
• Recommended: Less than 1 teaspoon (5g salt / 2000mg sodium) per day
• Average Kenyan intake: About 7-10g per day — double the limit!

HIDDEN SALT SOURCES (THE BIGGEST CULPRITS):
• Bread and chapati (baking soda/salt)
• Stock cubes (1 cube = 1g salt)
• Processed meats (sausages, bacon)
• Fried snacks (samosas, chips)
• Tomato sauce and soy sauce
• Packet soups and noodles
• Cheese

QUICK TIPS TO CUT SALT:
1. Remove the salt shaker from the table
2. Use herbs, garlic, ginger, lemon, and spices instead of salt
3. Rinse canned vegetables before cooking
4. Check food labels — aim for <400mg sodium per 100g
5. Cook fresh meals instead of processed foods
6. Ask for no added salt when eating out

HOW LONG UNTIL IT WORKS?
Your taste buds adapt in 2-4 weeks. After that, food will taste too salty if you eat the old way!

WARNING: If you take BP medications, reducing salt can make them work even better. Monitor your BP closely as you reduce salt.`,
    keyPoints: [
      'Limit salt to less than 1 teaspoon per day total',
      'Most salt comes from processed foods, not your shaker',
      'Use herbs and spices to flavor food instead of salt',
      'Taste buds adapt in 2-4 weeks',
      'Reducing salt can lower BP by 5-10 mmHg',
    ],
    category: 'Lifestyle',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['salt', 'sodium', 'diet', 'hypertension', 'lifestyle'],
    icon: '🧂',
    references: ['WHO Guideline: Sodium Intake', 'KDIGO Blood Pressure Guidelines'],
  },
  {
    id: 'htn-dash-diet',
    title: 'The DASH Diet — Eating to Lower Your Blood Pressure',
    summary: 'The DASH diet is proven to lower blood pressure as much as medication. It focuses on whole foods rich in nutrients that relax blood vessels.',
    content: `DASH stands for "Dietary Approaches to Stop Hypertension." It is the most scientifically proven diet for lowering blood pressure, backed by decades of research from the US National Institutes of Health.

HOW DASH LOWERS BP:
• High potassium helps relax blood vessel walls
• Low sodium reduces fluid retention
• High calcium and magnesium support healthy BP regulation
• Rich in fiber which supports heart health

WHAT TO EAT EVERY DAY:
Whole grains (6-8 servings): Brown rice, oats, whole wheat chapati, millet
Vegetables (4-5 servings): Sukuma wiki, spinach, carrots, tomatoes, peppers
Fruits (4-5 servings): Bananas, oranges, mangoes, pawpaw, apples
Low-fat dairy (2-3 servings): Mala, yogurt, fresh milk
Lean protein (2 or fewer): Fish, chicken without skin, beans, lentils
Healthy fats (2-3 servings): Cooking oil, avocado, nuts

WHAT TO LIMIT:
• Salt: Less than 1 teaspoon per day
• Sugar: Less than 3 tablespoons per day
• Saturated fats: Limit red meat, butter, coconut oil
• Alcohol: Men max 2 drinks/day, women max 1 drink/day

SAMPLE KENYAN DASH DAY:
• Breakfast: Oat porridge with banana, small yogurt
• Lunch: Brown rice, sukuma wiki, grilled fish, fresh orange
• Snack: Handful of groundnuts
• Dinner: Whole wheat chapati, bean stew, vegetable salad

START SLOWLY:
Week 1: Add one extra vegetable serving
Week 2: Switch to whole grains
Week 3: Reduce salt by half
Week 4: Add fruit as dessert`,
    keyPoints: [
      'DASH diet can lower BP as much as medication',
      'Eat more vegetables, fruits, whole grains, and low-fat dairy',
      'Limit salt, sugar, saturated fats, and alcohol',
      'Start with small changes — add don\'t subtract',
      'Combine with exercise for best results',
    ],
    category: 'Nutrition',
    condition: 'hypertension',
    literacyLevel: 'intermediate',
    readTimeMinutes: 7,
    tags: ['dash', 'diet', 'nutrition', 'hypertension', 'eating'],
    icon: '🥗',
    references: ['NEJM DASH Trial (Appel et al., 1997)', 'AHA Dietary Guidelines'],
  },
  {
    id: 'htn-home-monitoring',
    title: 'How to Measure Your Blood Pressure Correctly at Home',
    summary: 'Getting accurate home BP readings requires proper technique. Follow these steps to get reliable numbers your doctor can trust.',
    content: `Home blood pressure monitoring is essential for managing hypertension. But readings are only useful if done correctly. One wrong step can give a false reading 10-20 mmHg off!

BEFORE YOU MEASURE:
• Wait 30 minutes after eating, caffeine, or exercise
• Empty your bladder first (full bladder raises BP)
• Sit quietly for 5 minutes — no talking, no phone
• Do not smoke for 30 minutes before

CORRECT POSITIONING:
1. Sit in a chair with back support
2. Feet flat on floor, legs uncrossed
3. Rest arm on a table at heart level
4. The cuff should be on bare skin (not over clothes)
5. Cuff bottom edge 2cm above elbow crease

DURING MEASUREMENT:
• Do not talk
• Do not move your arm
• Stay relaxed, breathe normally

HOW OFTEN:
• Morning: Before breakfast, before medications
• Evening: Before dinner
• Take 2 readings, 1 minute apart
• Record both numbers with date and time

WHAT THE NUMBERS TELL YOU:
• Below 130/80 = Good control
• 130-139/80-89 = Needs attention
• 140+/90+ = Contact your doctor
• 180+/120+ = EMERGENCY — go to hospital

BRING YOUR LOG TO APPOINTMENTS:
Keep a written record or use a notebook. Your doctor needs to see trends over weeks, not just a single reading at the clinic.

COMMON MISTAKES:
✗ Taking BP right after walking into clinic
✗ Cuff too small (ask for large cuff if needed)
✗ Arm hanging down instead of resting at heart level
✗ Talking during measurement
✗ Full bladder raises BP by 10-15 mmHg`,
    keyPoints: [
      'Rest 5 minutes before measuring',
      'Sit with back supported, feet flat, arm at heart level',
      'Measure morning and evening',
      'Take 2 readings, 1 minute apart',
      'Record everything in a logbook',
    ],
    category: 'Self-Care',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['monitoring', 'BP', 'home', 'measurement'],
    icon: '🩺',
    references: ['AHA Home BP Monitoring Guidelines', 'ESH 2023 Hypertension Guidelines'],
  },
  {
    id: 'htn-emergency-signs',
    title: 'When to Seek Emergency Care for High Blood Pressure',
    summary: 'Learn the warning signs of a hypertensive emergency. Know when you need to go to the hospital immediately.',
    content: `Most of the time, high blood pressure has no symptoms. But when BP gets very high (180/120 or higher), it can cause organ damage. This is a hypertensive emergency — it can be life-threatening.

GO TO THE HOSPITAL IMMEDIATELY IF YOU HAVE:
• Blood pressure 180/120 or higher AND any of these symptoms:

• Severe headache (worst of your life)
• Chest pain or pressure
• Shortness of breath
• Vision changes (blurry vision, seeing spots)
• Numbness or weakness on one side of face/body
• Difficulty speaking
• Severe anxiety or confusion
• Nausea and vomiting
• Seizures

WHAT TO DO IF BP IS VERY HIGH BUT NO SYMPTOMS:
• If BP is 180/120 or higher but you feel fine
• Wait 5 minutes and re-check
• If still high, take your medication as prescribed
• Call your doctor within 24 hours
• If BP comes down, continue monitoring

DO NOT:
✗ Drive yourself to hospital if having symptoms
✗ Take extra doses of medication unless told
✗ Ignore symptoms because "you feel fine otherwise"
✗ Wait to see if symptoms go away on their own

KNOW YOUR NUMBERS:
• Normal: <120/80
• Monitor: Check at home
• Caution: 140-179/90-119 — contact doctor same day
• Emergency: 180+/120+ with symptoms — GO TO HOSPITAL

KEEP THIS INFORMATION HANDY:
Save emergency contacts in your phone. Tell family members what to watch for.`,
    keyPoints: [
      'BP 180/120+ with symptoms = medical emergency',
      'Symptoms: severe headache, chest pain, vision changes, numbness',
      'Call for help — do not drive yourself',
      'If no symptoms but BP very high, call your doctor',
      'Know emergency numbers and keep them visible',
    ],
    category: 'Safety',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['emergency', 'warning', 'symptoms', 'hypertension', 'danger'],
    icon: '🚨',
    references: ['ACC/AHA Hypertension Guidelines 2017', 'WHO HEARTS Technical Package'],
  },
  {
    id: 'htn-medication-adherence',
    title: 'Why You Must Take Your Blood Pressure Medications Every Day',
    summary: 'BP medications work only as long as you take them. Skipping doses puts you at risk even if you feel fine.',
    content: `HIGH BP HAS NO SYMPTOMS — THAT IS THE TRICK:
You feel fine, so it seems unnecessary to take medication. But high BP is damaging your blood vessels every single day. By the time you feel symptoms, damage may already be done.

HOW BP MEDICATIONS WORK:
• They don't "fix" high blood pressure permanently
• They CONTROL it — like glasses for your eyes
• You must take them every day for them to work
• When you stop, BP goes back up within 24-72 hours

REASONS PEOPLE STOP TAKING BP MEDS — AND THE TRUTH:
❌ "I feel fine now" → The medication is why you feel fine!
❌ "My BP is normal today" → The medication is why it's normal!
❌ "The medication makes me tired/dizzy" → Ask your doctor about a different one
❌ "I don't want to take pills forever" → Your health is worth it
❌ "I can't afford them" → Tell your doctor, there are affordable options

TIPS TO NEVER MISS A DOSE:
• Take at the same time daily (link to a habit — brushing teeth, breakfast)
• Use a pill organizer (weekly boxes available at pharmacies)
• Set a phone alarm
• Keep pills where you can see them
• Ask family to remind you
• Refill before you run out — keep 7 days extra on hand

SIDE EFFECTS:
If you have side effects, do NOT just stop. Side effects can often be managed:
• Dizziness → Take at bedtime, stay hydrated
• Cough (with ACE inhibitors) → Ask about ARB medication instead
• Swelling (with amlodipine) → Usually mild and may improve

MEDICATIONS AND SALT:
When you reduce salt, your BP medications work better. You may even need a lower dose — but only change if your doctor says so.

TRACK YOUR PILLS:
Keep a simple calendar. Check off each dose. Bring this to your appointments.`,
    keyPoints: [
      'BP medications control, not cure — take them daily',
      'Skipping doses allows silent damage to continue',
      'Contact your doctor about side effects — don\'t stop',
      'Use pill organizers, alarms, and routines',
      'Never run out — refill before empty',
    ],
    category: 'Medications',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['medication', 'adherence', 'compliance', 'hypertension'],
    icon: '💊',
    references: ['WHO Medication Adherence Guidelines', 'AHA Medication Adherence Statement'],
  },
  {
    id: 'htn-exercise',
    title: 'Exercise to Lower Your Blood Pressure — Simple, Effective, Safe',
    summary: 'Regular exercise lowers blood pressure as much as some medications. Walking 30 minutes a day can reduce your BP by 5-8 mmHg.',
    content: `Exercise is one of the most powerful tools for lowering blood pressure. It works almost as well as medication and has zero side effects!

HOW EXERCISE LOWERS BP:
• Strengthens your heart — it pumps with less effort
• Keeps arteries flexible and elastic
• Helps you maintain healthy weight
• Reduces stress hormones
• Improves insulin sensitivity

WHAT TYPE OF EXERCISE IS BEST?
AEROBIC (BEST FOR BP):
• Brisk walking — 30 minutes daily
• Cycling on flat ground
• Swimming
• Jogging
• Dancing
• Mowing the lawn or gardening

STRENGTH TRAINING (HELPS TOO):
• Bodyweight exercises: squats, pushups
• Light weight lifting
• Resistance bands
• 2-3 times per week

HOW MUCH DO YOU NEED?
• 150 minutes per week of moderate exercise (30 minutes, 5 days a week)
• OR 75 minutes of vigorous exercise
• Every minute counts — even 10-minute sessions help

SAFETY TIPS IF YOU HAVE HIGH BP:
• Start slowly — especially if you haven't exercised
• Warm up for 5 minutes before, cool down after
• Stop if you feel chest pain, severe breathlessness, or dizziness
• Avoid heavy weight lifting until BP is controlled
• Check with your doctor if BP is above 160/100

MAKE IT A HABIT:
• Walk with a friend or family member
• Park farther from the store
• Take stairs instead of lift
• Walk while on phone calls
• Dance while cooking

RESULTS YOU CAN EXPECT:
• 4 weeks: Feel more energetic
• 8 weeks: BP starts dropping (3-5 mmHg)
• 12 weeks: Full effect (5-8 mmHg drop)
• Keep going: Benefits continue as long as you stay active`,
    keyPoints: [
      '30 minutes walking daily reduces BP by 5-8 mmHg',
      'Aerobic exercise works best for BP',
      'Start slowly if you have not exercised in a while',
      'Stop immediately if chest pain or severe dizziness',
      'Make it part of your daily routine',
    ],
    category: 'Lifestyle',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['exercise', 'walking', 'physical activity', 'hypertension'],
    icon: '🏃',
    references: ['AHA Physical Activity Guidelines', 'WHO Physical Activity Recommendations'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // DIABETES
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'dm-understanding',
    title: 'Understanding Diabetes — Your Guide to Living Well',
    summary: 'Diabetes is a condition where your body cannot properly use sugar from food. Learn the basics of managing it for a long, healthy life.',
    content: `WHAT IS DIABETES?
When you eat, your body breaks down food into sugar (glucose) that enters your blood. The pancreas produces a hormone called insulin that helps sugar enter your cells to be used for energy.

In diabetes:
• Type 2: Your body doesn't use insulin properly (insulin resistance)
• Type 1: Your body doesn't produce insulin at all
• Over time, sugar builds up in your blood instead of going into cells

TARGET BLOOD SUGAR RANGES:
• Before meals: 4-7 mmol/L
• 2 hours after meals: Less than 10 mmol/L
• HbA1c (3-month average): Below 7% (53 mmol/mol)

WHY GOOD CONTROL MATTERS:
Uncontrolled diabetes can damage:
• Eyes (blindness)
• Kidneys (kidney failure)
• Nerves (numbness, pain in feet)
• Heart (heart attack)
• Blood vessels (stroke, poor wound healing)

THE GOOD NEWS:
With proper management, people with diabetes live long, healthy lives. The key is a team approach: You + Your Doctor + Healthy Habits.

YOUR DAILY CHECKLIST:
☐ Take medications as prescribed
☐ Check blood sugar (if advised)
☐ Eat balanced meals
☐ Move your body
☐ Check your feet
☐ Stay hydrated (water)

WARNING SIGNS TO WATCH FOR:
High blood sugar: Frequent urination, excessive thirst, blurry vision, fatigue
Low blood sugar (hypoglycemia): Sweating, shaking, confusion, hunger, dizziness — treat immediately with sugar

LOW BLOOD SUGAR EMERGENCY:
If blood sugar below 4 mmol/L or you have symptoms:
1. Take 15g fast-acting sugar (4 glucose tablets, ½ glass juice, or 3 teaspoons sugar)
2. Wait 15 minutes
3. Re-check blood sugar
4. If still low, repeat treatment
5. If still low after 2 rounds or unconscious — call ambulance`,
    keyPoints: [
      'Target fasting blood sugar: 4-7 mmol/L',
      'HbA1c target: below 7% (53 mmol/mol)',
      'Uncontrolled diabetes damages eyes, kidneys, nerves, heart',
      'Low blood sugar is an emergency — treat immediately',
      'Daily self-care is the foundation of diabetes management',
    ],
    category: 'Condition Basics',
    condition: 'diabetes',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['diabetes', 'type 2', 'type 1', 'basics', 'understanding'],
    icon: '🩸',
    references: ['ADA Standards of Care 2024', 'WHO Diabetes Fact Sheet'],
  },
  {
    id: 'dm-diet',
    title: 'Eating Well with Diabetes — A Simple Guide',
    summary: 'You don\'t need special "diabetic food." Learn to balance what you eat to keep blood sugar stable and enjoy your meals.',
    content: `Managing diabetes does NOT mean eating boring, bland food. The same healthy eating principles help everyone — with or without diabetes!

THE PLATE METHOD (EASIEST WAY TO BALANCE MEALS):
Divide your plate:
• ½ plate: Non-starchy vegetables (sukuma wiki, spinach, cabbage, tomatoes)
• ¼ plate: Protein (fish, chicken, lean meat, eggs, beans, lentils)
• ¼ plate: Carbohydrates (ugali, rice, chapati, potatoes, pasta)

Add fruit and dairy on the side.

CARBOHYDRATES AFFECT BLOOD SUGAR MOST:
Not all carbs are equal. Choose wisely:
PREFER (slow-release, low GI):
• Whole grains: brown rice, oats, millet, whole wheat
• Legumes: beans, lentils, green grams
• Vegetables: most vegetables
• Fruits with skin: apple, pear, orange, berries

LIMIT (fast-release, high GI):
• White ugali, white rice, white bread
• Chapati made with white flour
• Sugary drinks — soda, juice, sweetened tea
• Cakes, biscuits, sweets
• Mandazi, chapatis

SMART SWAPS:
• Ugali → Add some whole grain flour
• White rice → Brown rice or mix half and half
• Tea with sugar → Tea with less sugar or none
• Chapati → Whole wheat chapati
• Soda → Water with lemon or fresh juice (small glass)

TIMING OF MEALS:
• Eat at regular times — don't skip meals
• If on medication, eat after taking medication
• Bedtime snack may help prevent morning high sugar
• Space meals 4-5 hours apart

FIBER IS YOUR FRIEND:
Fiber slows down sugar absorption. Eat more:
• Vegetables at every meal
• Whole fruits rather than juice
• Beans and lentils several times a week
• Oats or millet porridge for breakfast`,
    keyPoints: [
      'Use the plate method: ½ veggies, ¼ protein, ¼ carbs',
      'Choose whole grains over refined flours',
      'Limit sugary drinks and sweets',
      'Eat at regular times — do not skip meals',
      'Fiber helps control blood sugar',
    ],
    category: 'Nutrition',
    condition: 'diabetes',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['diabetes', 'diet', 'food', 'nutrition', 'eating'],
    icon: '🍽️',
    references: ['ADA Nutrition Therapy Recommendations', 'Diabetes UK Eating Well Guide'],
  },
  {
    id: 'dm-foot-care',
    title: 'Foot Care for Diabetes — Protect Your Feet',
    summary: 'Diabetes can cause nerve damage and poor circulation in your feet. Daily foot checks prevent serious problems.',
    content: `WHY FEET MATTER IN DIABETES:
Diabetes can damage nerves in your feet (peripheral neuropathy) — you may not feel pain from a cut, blister, or infection. Poor circulation also means injuries heal slowly. A small foot problem can become a serious infection.

DAILY FOOT CHECKLIST:
Check your feet EVERY DAY:
☐ Look at tops, bottoms, and between toes
☐ Use a mirror or ask someone to help
☐ Look for: cuts, blisters, redness, swelling, calluses
☐ Check for: changes in skin color, temperature

WASH AND CARE:
• Wash feet daily with lukewarm water (test with elbow, not hand)
• Dry gently — especially between toes
• Apply moisturizer to dry skin (but NOT between toes)
• Cut toenails straight across — do not cut corners

SOCK AND SHOE RULES:
✓ Wear clean, dry socks every day
✓ Check inside shoes before wearing (for stones, sharp objects)
✓ Wear well-fitting shoes — not too tight, not too loose
✓ Never walk barefoot — even indoors
✓ Break in new shoes slowly

DO NOT:
✗ Use hot water bottles or heating pads on feet
✗ Soak feet for long periods
✗ Cut corns or calluses yourself
✗ Use sharp tools on your feet
✗ Wear tight socks or shoes

SEE A DOCTOR IMMEDIATELY IF:
• A cut or sore is not healing after 2 days
• You see redness, swelling, or pus
• You have black or discolored skin
• You have a fever with foot symptoms
• Your foot changes shape or color

FOOT CHECK AT EVERY DOCTOR VISIT:
Your doctor should examine your bare feet at every visit. Take off your shoes and socks before the doctor enters the room.`,
    keyPoints: [
      'Check your feet daily for cuts, blisters, or redness',
      'Wash with lukewarm water and dry carefully',
      'Never walk barefoot — even at home',
      'See a doctor immediately for any non-healing wound',
      'Have your feet checked at every medical visit',
    ],
    category: 'Self-Care',
    condition: 'diabetes',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['diabetes', 'foot care', 'neuropathy', 'prevention'],
    icon: '🦶',
    references: ['ADA Foot Care Guidelines', 'IWGDF Diabetic Foot Guidelines'],
  },
  {
    id: 'dm-hypoglycemia',
    title: 'Hypoglycemia — Recognizing and Treating Low Blood Sugar',
    summary: 'Low blood sugar (hypoglycemia) is a medical emergency. Learn the signs and the "15-15 Rule" to treat it quickly and safely.',
    content: `WHAT IS HYPOGLYCEMIA?
Hypoglycemia (low blood sugar) means your blood sugar has dropped below 4 mmol/L. It can happen if you:
• Skip a meal
• Take too much diabetes medication
• Exercise more than usual
• Drink alcohol without eating

SYMPTOMS — RECOGNIZE EARLY:
MILD TO MODERATE:
• Shakiness or trembling
• Sweating (cold sweat)
• Hunger
• Rapid heartbeat
• Anxiety or irritability
• Dizziness
• Pale skin
• Tingling around mouth

SEVERE (MEDICAL EMERGENCY):
• Confusion or difficulty concentrating
• Slurred speech
• Unsteady walking
• Seizures
• Loss of consciousness

THE 15-15 RULE (TREATMENT):
Step 1: Eat/Dink 15 grams of fast-acting sugar
• 4 glucose tablets (available at pharmacy)
• ½ cup (125ml) fruit juice
• 3 teaspoons sugar or honey dissolved in water
• 5 hard candies
• ½ can regular soda (not diet)

Step 2: Wait 15 minutes
Step 3: Check blood sugar
• If still below 4 mmol/L → Repeat Step 1
• If above 4 mmol/L → Eat a small snack (bread, biscuit with milk)

IF UNCONSCIOUS OR CANNOT SWALLOW:
• This is a MEDICAL EMERGENCY — call ambulance
• Do NOT put food or drink in mouth (choking risk)
• Someone may give glucagon injection if available
• Lay person on their side (recovery position)

PREVENTION:
• Do NOT skip meals
• Check blood sugar before driving
• Carry fast-acting sugar with you always
• Tell family and friends about symptoms and treatment
• Wear a medical alert ID
• Adjust medication dose before exercise (ask doctor)

ALCOHOL WARNING:
Alcohol can cause low blood sugar hours after drinking — especially on an empty stomach. If you drink, eat a meal first and limit to 1-2 drinks.`,
    keyPoints: [
      'Low blood sugar = below 4 mmol/L — treat immediately',
      'Follow the 15-15 Rule: 15g sugar, wait 15 min, recheck',
      'If unconscious, call ambulance — do NOT give oral food',
      'Always carry fast-acting sugar with you',
      'Never skip meals if on diabetes medication',
    ],
    category: 'Safety',
    condition: 'diabetes',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['diabetes', 'hypoglycemia', 'low blood sugar', 'emergency'],
    icon: '⚠️',
    references: ['ADA Hypoglycemia Guidelines', 'JBDS Hypoglycemia Guidelines'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // RESPIRATORY (ASTHMA / COPD)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'asthma-understanding',
    title: 'Understanding Asthma — Breathe Easy',
    summary: 'Asthma is a condition where your airways tighten and become inflamed. Learn how to control it and prevent attacks.',
    content: `WHAT IS ASTHMA?
Asthma is a long-term condition affecting the airways (bronchial tubes) that carry air in and out of your lungs. In asthma:
• Airways become inflamed and swollen
• Muscles around airways tighten (bronchoconstriction)
• Extra mucus is produced
• Airflow is reduced → difficulty breathing

COMMON TRIGGERS:
• Respiratory infections (flu, cold)
• Allergens: dust, pollen, pet dander, mold
• Smoke (tobacco, charcoal, wood)
• Cold air
• Exercise
• Strong smells (perfume, cleaning products)
• Stress or strong emotions

TYPES OF ASTHMA MEDICATIONS:
CONTROLLER (PREVENTER) — Take daily:
• Inhaled corticosteroids: Reduce inflammation in airways
• Take every day even when you feel fine
• Usually brown, orange, or red inhaler
• Takes 2-4 weeks to reach full effect

RELIEVER (RESCUE) — Use when you have symptoms:
• Short-acting bronchodilators: Quickly relax airway muscles
• Use only when needed
• Usually blue inhaler (salbutamol)
• If using more than 2 times per week, asthma is not controlled

ASTHMA ACTION PLAN (3 ZONES):
GREEN ZONE (Doing well): No symptoms → Take controller daily
YELLOW ZONE (Getting worse): Cough, wheeze, tight chest → Use reliever, increase controller
RED ZONE (Medical alert): Severe symptoms, reliever not working → Go to hospital

SIGNS OF ASTHMA ATTACK:
• Severe shortness of breath
• Cannot speak full sentences
• Reliever inhaler not helping
• Blue lips or fingernails
• Nostrils flaring
• Leaning forward to breathe

EMERGENCY ACTION:
1. Sit the person upright
2. Give 4 puffs of reliever inhaler (one at a time, 4 breaths each)
3. Wait 4 minutes
4. If no improvement, give 4 more puffs
5. Call ambulance if still not improving
6. Continue giving 4 puffs every 4 minutes until help arrives`,
    keyPoints: [
      'Take controller inhaler daily — even when you feel fine',
      'Use reliever only when you have symptoms',
      'If using reliever more than 2x/week, see your doctor',
      'Know your asthma action plan (green/yellow/red zones)',
      'In an attack: sit up, use reliever, call for help if needed',
    ],
    category: 'Condition Basics',
    condition: 'respiratory',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['asthma', 'respiratory', 'breathing', 'inhaler'],
    icon: '🫁',
    references: ['GINA 2024 Asthma Guidelines', 'WHO Asthma Fact Sheet'],
  },
  {
    id: 'asthma-inhaler-technique',
    title: 'Using Your Inhaler Correctly — Getting the Medicine Where It Needs to Go',
    summary: 'Most people use their inhaler incorrectly. Proper technique ensures the medicine reaches your lungs where it works.',
    content: `Using your inhaler correctly is the most important skill for managing asthma or COPD. Studies show that up to 80% of patients use their inhaler incorrectly, getting little to no benefit from their medication.

WHY TECHNIQUE MATTERS:
• If medicine stays in your mouth and throat, it cannot help your lungs
• Incorrect technique wastes expensive medication
• You may think your medication "doesn't work" when the real problem is technique
• Side effects (thrush, throat irritation) are more common with poor technique

PRESSURIZED METERED-DOSE INHALER (pMDI) STEPS:
1. Shake the inhaler well (5 seconds)
2. Remove cap and check mouthpiece is clean
3. Breathe out gently (away from inhaler)
4. Place mouthpiece between teeth, seal lips around it
5. Start breathing in SLOWLY and DEEPLY
6. Press the canister ONCE at the start of inhalation
7. Continue breathing in slowly for 5 seconds
8. Hold breath for 10 seconds (or as long as comfortable)
9. Breathe out slowly
10. Wait 30-60 seconds before next puff
11. Rinse mouth with water after steroid inhaler

DRY POWDER INHALER (DPI) STEPS:
1. Load dose (follow device instructions — each type is different)
2. Breathe out gently (away from device)
3. Place mouthpiece between lips
4. Inhale forcefully and DEEPLY (different from pMDI)
5. Hold breath for 10 seconds
6. Close device after use

USE A SPACER IF YOU HAVE ONE:
A spacer makes using an inhaler much easier and more effective:
• Put puff into spacer, then breathe in slowly
• Especially important for children and elderly
• Reduces mouth side effects
• Wash spacer once a month (let air dry, do not dry with cloth)

COMMON MISTAKES:
✗ Not shaking the inhaler
✗ Breathing in too fast (for pMDI)
✗ Breathing in too slow (for DPI)
✗ Not holding breath long enough
✗ Taking multiple puffs without waiting
✗ Not rinsing mouth after steroid use

CLEAN YOUR INHALER:
• Clean mouthpiece weekly with dry tissue
• Do not wash plastic inhaler with water
• Store at room temperature, away from direct sunlight`,
    keyPoints: [
      'Most people use inhalers incorrectly — technique matters',
      'pMDI: breathe in SLOWLY while pressing, hold 10 seconds',
      'DPI: breathe in forcefully and deeply',
      'Use a spacer for easier, more effective medication delivery',
      'Rinse mouth after steroid inhaler to prevent thrush',
    ],
    category: 'Self-Care',
    condition: 'respiratory',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['asthma', 'inhaler', 'technique', 'respiratory', 'medication'],
    icon: '💨',
    references: ['GINA 2024 Inhaler Technique', 'UK Inhaler Technique Guidelines'],
  },
  {
    id: 'copd-understanding',
    title: 'Understanding COPD — Living Well with Chronic Lung Disease',
    summary: 'COPD is a progressive lung disease, usually caused by smoking. Learn how to manage symptoms and maintain quality of life.',
    content: `WHAT IS COPD?
COPD (Chronic Obstructive Pulmonary Disease) is a lung condition that makes it hard to breathe. It includes two main conditions:
• Chronic bronchitis: Long-term inflammation of airways with excess mucus
• Emphysema: Damage to air sacs in the lungs

THE MAIN CAUSE:
Smoking is the cause of 80-90% of COPD cases. Other causes include:
• Biomass smoke (wood, charcoal cooking fires — common in Kenyan homes)
• Occupational dust and chemicals
• Air pollution

SYMPTOMS:
• Persistent cough (often called "smoker's cough")
• Sputum/phlegm production
• Shortness of breath (gets worse over time)
• Wheezing
• Chest tightness
• Frequent chest infections

TREATMENTS:
Medications:
• Bronchodilators (relax airway muscles) — similar to asthma inhalers
• Inhaled corticosteroids (reduce inflammation)
• Combination inhalers
• Oral medications in advanced disease

Pulmonary Rehabilitation:
A program of exercise and education proven to improve quality of life and reduce hospital stays. Ask your doctor if available.

Oxygen Therapy:
For advanced COPD with low blood oxygen. Used at home to improve survival and quality of life.

LIFESTYLE CHANGES THAT HELP:
✓ Quit smoking — the single most important step
✓ Avoid smoke, dust, and strong fumes
✓ Stay physically active within your limits
✓ Get vaccinated against flu and pneumonia
✓ Learn breathing techniques (pursed-lip breathing)
✓ Eat small, frequent meals (large meals make breathing harder)

BREATHING TECHNIQUE:
Pursed-lip breathing helps when you feel short of breath:
1. Breathe in slowly through your nose (count 2)
2. Pucker lips (like blowing out a candle)
3. Breathe out slowly through pursed lips (count 4)
4. This keeps airways open longer and helps you breathe out more air

WHEN TO SEEK HELP:
• Symptoms getting worse despite treatment
• Increased phlegm or change in color
• Fever
• Increased use of reliever inhaler
• Swelling in ankles or legs
• Blue lips or fingernails`,
    keyPoints: [
      'COPD is a chronic lung disease — quitting smoking is the most important step',
      'Use inhalers as prescribed to control symptoms',
      'Pursed-lip breathing helps during breathlessness',
      'Get vaccinated against flu and pneumonia',
      'Seek medical help if symptoms worsen suddenly',
    ],
    category: 'Condition Basics',
    condition: 'respiratory',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['COPD', 'respiratory', 'lung', 'breathing'],
    icon: '🫁',
    references: ['GOLD 2024 COPD Guidelines', 'WHO COPD Fact Sheet'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENAL / KIDNEY
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ckd-understanding',
    title: 'Understanding Chronic Kidney Disease — Protecting Your Kidneys',
    summary: 'Your kidneys filter waste from your blood. Learn how to slow kidney disease and stay healthy longer.',
    content: `WHAT DO KIDNEYS DO?
Your kidneys are two bean-shaped organs below your ribs that:
• Filter waste from your blood (like a water purification system)
• Remove extra fluid
• Control blood pressure
• Produce hormones for red blood cells
• Maintain healthy bones

WHAT IS CKD?
Chronic Kidney Disease (CKD) means your kidneys are damaged and cannot filter blood as well as they should. It is usually progressive but can be slowed with proper care.

COMMON CAUSES:
• Diabetes (leading cause — 40% of CKD)
• High blood pressure (second leading cause)
• Glomerulonephritis (kidney inflammation)
• Repeated kidney infections

STAGES OF CKD (YOUR DOCTOR WILL TELL YOU YOUR STAGE):
Stage 1: Kidney damage with normal function (eGFR 90+) — often no symptoms
Stage 2: Mild reduction (eGFR 60-89)
Stage 3: Moderate reduction (eGFR 30-59) — symptoms may start
Stage 4: Severe reduction (eGFR 15-29) — prepare for dialysis
Stage 5: Kidney failure (eGFR <15) — dialysis or transplant needed

HOW TO SLOW KIDNEY DISEASE:
1. Control blood pressure (target below 130/80)
2. Control blood sugar (if diabetic)
3. Take prescribed medications (ACE inhibitors/ARBs protect kidneys)
4. Limit salt (less than 5g per day)
5. Do NOT take NSAIDs (ibuprofen, diclofenac — they damage kidneys)
6. Stay hydrated but do not over-hydrate
7. Avoid alcohol and smoking
8. Get regular check-ups with blood and urine tests

DIET FOR KIDNEY HEALTH:
May need to limit these (ask your doctor or dietitian):
• Salt (all stages)
• Potassium (bananas, oranges, potatoes — in advanced stages)
• Phosphorus (soda, processed foods — in advanced stages)
• Protein (do not need to severely restrict unless advanced)

MEDICATIONS TO AVOID:
✗ NSAIDs (ibuprofen, diclofenac, naproxen)
✗ Herbal remedies (some contain kidney-toxic compounds)
✗ High-dose vitamin C supplements
✗ Always check with your doctor before any new medication

WHEN TO SEE A DOCTOR:
• Swelling in feet, ankles, or hands
• Foamy urine
• Fatigue
• Itchy skin
• Loss of appetite
• Nausea and vomiting
• Muscle cramps`,
    keyPoints: [
      'CKD is common in diabetes and hypertension patients',
      'Control BP and blood sugar to slow kidney damage',
      'Avoid NSAIDs (ibuprofen, diclofenac) — they damage kidneys',
      'Know your eGFR stage and follow your doctor\'s advice',
      'Get regular kidney function blood tests',
    ],
    category: 'Condition Basics',
    condition: 'renal',
    literacyLevel: 'intermediate',
    readTimeMinutes: 7,
    tags: ['kidney', 'CKD', 'renal', 'kidney disease'],
    icon: '🫘',
    references: ['KDIGO 2024 CKD Guidelines', 'NKF Kidney Disease Education'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // MENTAL HEALTH
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'mh-stress-management',
    title: 'Managing Stress — Practical Techniques for Better Health',
    summary: 'Chronic stress raises blood pressure, blood sugar, and harms overall health. Learn simple techniques to manage stress every day.',
    content: `WHAT IS STRESS?
Stress is your body's response to demands and pressures. Short-term stress can be helpful (motivation, focus), but long-term (chronic) stress damages your health.

HOW STRESS AFFECTS YOUR BODY:
• Raises blood pressure and heart rate
• Increases blood sugar
• Weakens immune system
• Causes poor sleep
• Leads to unhealthy habits (overeating, smoking, alcohol)
• Worsens anxiety and depression

PHYSICAL SIGNS OF STRESS:
• Headaches (especially tension headaches)
• Muscle tension (neck, shoulders, back)
• Fatigue
• Upset stomach
• Chest tightness
• Racing heart

EMOTIONAL SIGNS:
• Irritability
• Anxiety
• Feeling overwhelmed
• Difficulty concentrating
• Mood swings
• Loss of interest in things you enjoy

STRESS MANAGEMENT TECHNIQUES:

1. DEEP BREATHING (Do this anywhere, anytime):
• Breathe in through nose for 4 counts
• Hold for 4 counts
• Breathe out through mouth for 4 counts
• Repeat 5 times

2. PHYSICAL ACTIVITY:
• Even 10 minutes of walking reduces stress
• Stretching helps release muscle tension
• Consistent exercise is more effective than intense exercise

3. SLEEP HYGIENE:
• Go to bed and wake up at the same time daily
• Avoid phone/TV for 30 minutes before bed
• Keep bedroom dark, cool, and quiet
• Avoid caffeine after 2 PM

4. SOCIAL CONNECTION:
• Talk to someone you trust
• Share your feelings — don't bottle them up
• Join a support group if available
• Stay connected with family and friends

5. MINDFULNESS:
• Focus on the present moment
• Notice your thoughts without judging them
• Practice for 5-10 minutes daily

WHEN TO SEEK PROFESSIONAL HELP:
• Stress affects your ability to work or care for family
• You have thoughts of harming yourself
• You use alcohol or drugs to cope
• You feel hopeless or trapped
• Sleep problems persist for weeks`,
    keyPoints: [
      'Chronic stress harms heart, blood sugar, and immune system',
      'Deep breathing can calm your body in minutes',
      'Physical activity is one of the best stress relievers',
      'Talk to trusted friends and family — don\'t isolate yourself',
      'Seek professional help if stress becomes overwhelming',
    ],
    category: 'Lifestyle',
    condition: 'general',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['stress', 'mental health', 'anxiety', 'lifestyle'],
    icon: '🧘',
    references: ['WHO Mental Health Guidelines', 'APA Stress Management Resources'],
  },
  {
    id: 'mh-depression',
    title: 'Understanding Depression — You Are Not Alone',
    summary: 'Depression is a medical condition, not a sign of weakness. Treatment works and recovery is possible.',
    content: `WHAT IS DEPRESSION?
Depression is more than just sadness. It is a medical condition that affects how you think, feel, and function. Depression changes brain chemistry and is NOT something you can just "snap out of."

SYMPTOMS OF DEPRESSION (lasting more than 2 weeks):
• Persistent sadness, emptiness, or hopelessness
• Loss of interest in things you used to enjoy
• Changes in appetite (eating too much or too little)
• Sleep problems (insomnia or sleeping too much)
• Fatigue, low energy
• Difficulty concentrating or making decisions
• Feelings of worthlessness or guilt
• Thoughts of death or suicide
• Physical symptoms (headaches, body aches) with no clear cause

DEPRESSION IS COMMON:
• Affects 1 in 5 people at some point in life
• More common in people with chronic illnesses (diabetes, heart disease)
• Can affect anyone regardless of age, gender, or background

DEPRESSION IS TREATABLE:

TALK THERAPY (Counseling):
• Talking to a trained professional helps you understand and change patterns
• Available at many hospitals and health centers
• May be covered by NHIF

MEDICATION (Antidepressants):
• Correct brain chemistry imbalances
• Take 2-4 weeks to start working
• Do not stop suddenly — side effects can occur
• Work best combined with counseling

LIFESTYLE THAT HELPS:
• Regular exercise (as effective as medication for mild depression)
• Regular sleep schedule
• Healthy meals
• Social connection (even when you don't feel like it)
• Reducing alcohol

SUPPORTING SOMEONE WITH DEPRESSION:
• Listen without judgment
• Encourage them to seek help
• Offer to accompany them to appointments
• Be patient — recovery takes time
• Check in regularly

CRISIS — GET HELP NOW IF:
• You have thoughts of harming yourself
• You have a plan to end your life
• You feel you cannot go on

CONTACT:
• Go to your nearest hospital emergency room
• Call a suicide prevention helpline
• Tell someone you trust immediately`,
    keyPoints: [
      'Depression is a medical condition — not a character flaw',
      'Treatment works: therapy, medication, or both',
      'Exercise, sleep, and social connection all help',
      'Recovery takes time — be patient with yourself',
      'If you have thoughts of suicide, get help immediately',
    ],
    category: 'Mental Health',
    condition: 'general',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['depression', 'mental health', 'mood', 'wellness'],
    icon: '💙',
    references: ['WHO Depression Fact Sheet', 'APA Depression Treatment Guidelines'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // GENERAL HEALTH & MEDICATIONS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'gen-medication-safety',
    title: 'Medication Safety — What Every Patient Should Know',
    summary: 'Taking medications safely is essential. Learn the 5 Rights of medication safety and what to discuss with your doctor.',
    content: `THE 5 RIGHTS OF MEDICATION:
1. RIGHT PATIENT — Is this medication for you?
2. RIGHT MEDICATION — Is this the correct drug?
3. RIGHT DOSE — Is this the correct amount?
4. RIGHT TIME — Are you taking it at the right time?
5. RIGHT ROUTE — Are you taking it correctly (oral, inhaled, injection)?

KNOW YOUR MEDICATIONS:
For each medication you take, know:
• Name (generic and brand)
• What it is for
• How much to take (dose)
• When to take it (time of day, with/without food)
• Side effects to watch for
• What to do if you miss a dose

MEDICATION INTERACTIONS:
Some medications should not be taken together. Tell your doctor about ALL medications you take, including:
• Prescription medications from any doctor
• Over-the-counter medications (painkillers, cold medicine)
• Herbal remedies and supplements
• Traditional medicines

COMMON DANGEROUS INTERACTIONS:
• Warfarin + Aspirin or NSAIDs = Bleeding risk
• ACE inhibitors + Spironolactone = High potassium
• Statins + Some antibiotics = Muscle damage risk
• Metformin + Alcohol = Lactic acidosis risk

MISSED DOSE INSTRUCTIONS:
• If you miss a dose, take it as soon as you remember
• If it is almost time for the next dose, skip the missed dose
• Do NOT double the dose
• If unsure, ask your pharmacist or doctor

STORING MEDICATIONS:
• Keep in a cool, dry place (not bathroom)
• Away from direct sunlight
• Out of reach of children
• Check expiration dates regularly
• Do not share medications with others

WARNING SIGNS — CALL YOUR DOCTOR:
• Allergic reaction: rash, itching, swelling, difficulty breathing
• Severe side effects: severe dizziness, bleeding, vomiting
• New symptoms after starting a medication
• If you think medication is making you worse`,
    keyPoints: [
      'Know the 5 Rights: Right Patient, Drug, Dose, Time, Route',
      'Tell your doctor about ALL medications, including herbs',
      'Do not double a missed dose — contact your pharmacist',
      'Watch for drug interactions and side effects',
      'Store medications safely, away from children',
    ],
    category: 'Medications',
    condition: 'general',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['medication', 'safety', 'adherence', 'pharmacy'],
    icon: '💊',
    references: ['WHO Medication Safety Guidelines', 'ISMP Medication Safety'],
  },
  {
    id: 'gen-smoking-cessation',
    title: 'Quitting Smoking — The Best Thing You Can Do for Your Health',
    summary: 'Quitting smoking is the single most important step to improve your health. It is never too late to quit.',
    content: `WHY QUIT SMOKING?
Within 20 minutes of your last cigarette: Blood pressure and heart rate drop
Within 12 hours: Carbon monoxide levels in blood return to normal
Within 2 weeks: Circulation improves, lung function increases
Within 1 year: Heart attack risk drops by half
Within 5 years: Stroke risk equals that of a non-smoker
Within 10 years: Lung cancer risk drops by half

HEALTH BENEFITS OF QUITTING:
• Lower blood pressure and heart rate
• Better lung function — less coughing
• Lower risk of heart attack, stroke, and cancer
• Better wound healing after surgery
• Healthier skin and teeth
• Save money (average smoker spends thousands per year)
• Better sense of taste and smell
• No more exposing family to secondhand smoke

Quitting smoking reduces your risk of:
• Heart disease by 50%
• Lung cancer by 50%
• Stroke to equal non-smoker
• COPD progression slows significantly

HOW TO QUIT:

METHOD 1: COLD TURKEY
Stop completely on a chosen day. Most successful when combined with support.

METHOD 2: GRADUAL REDUCTION
Reduce number of cigarettes over 2-4 weeks, then stop.

METHOD 3: NICOTINE REPLACEMENT
• Nicotine patches (24-hour or 16-hour)
• Nicotine gum
• Nicotine lozenges
Available at pharmacies. Helps manage cravings.

METHOD 4: MEDICATION
• Bupropion (Zyban) — reduces cravings and withdrawal
• Varenicline (Champix) — blocks nicotine receptors
• Prescription required — ask your doctor

WITHDRAWAL SYMPTOMS (PASSES IN 2-4 WEEKS):
• Irritability
• Anxiety
• Difficulty concentrating
• Increased appetite
• Sleep disturbances
• Strong cravings

These symptoms are temporary. They are signs your body is healing.

CRAVINGS — THE 4 Ds:
1. Delay — Craving passes in 3-5 minutes
2. Deep breathe — Take 10 deep breaths
3. Drink water — Slowly drink a glass
4. Do something else — Distract yourself

SUPPORT IS AVAILABLE:
• Tell family and friends — ask for support
• Join a support group
• Talk to your doctor or counselor
• Remove cigarettes, ashtrays, and lighters from home`,
    keyPoints: [
      'Quitting is the single best step for your health',
      'Health benefits start within 20 minutes of quitting',
      'Withdrawal symptoms pass in 2-4 weeks',
      'Use the 4 Ds for cravings: Delay, Deep breathe, Drink, Do',
      'Support from family and healthcare providers increases success',
    ],
    category: 'Lifestyle',
    condition: 'general',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['smoking', 'tobacco', 'cessation', 'lifestyle', 'prevention'],
    icon: '🚭',
    references: ['WHO Tobacco Fact Sheet', 'CDC Smoking Cessation Guidelines'],
  },
  {
    id: 'gen-healthy-eating',
    title: 'Healthy Eating — A Practical Guide for Kenyan Families',
    summary: 'Eating well does not have to be expensive. Learn simple, affordable ways to improve your diet using local foods.',
    content: `THE BASICS OF HEALTHY EATING:
Eat a variety of foods from all food groups to get all the nutrients your body needs.

FOOD GROUPS (Eat from each every day):
1. STAPLES (energy): Ugali, rice, chapati, potatoes, bananas, bread
2. PROTEIN (body building): Fish, chicken, beef, eggs, beans, lentils, green grams
3. VEGETABLES (vitamins): Sukuma wiki, spinach, cabbage, carrots, tomatoes, terere
4. FRUITS (vitamins): Oranges, mangoes, bananas, pawpaw, apples, avocado
5. DAIRY (calcium): Milk, yogurt, mala, cheese
6. FATS (healthy): Cooking oil in moderation, avocado, nuts

SIMPLE HEALTHY SWAPS:
Instead of: → Choose:
White ugali → Add some millet or sorghum flour
White rice → Brown rice (available at most supermarkets)
Fried chapati → Whole wheat chapati, less oil
Sugary tea → Tea with less sugar or no sugar
Fried snacks → Fresh fruit
Soda → Water with lemon or fresh fruit slices

HOW MUCH TO EAT:
• Fill half your plate with vegetables
• One quarter with protein
• One quarter with carbohydrates
• Add fruit and dairy on the side

EAT REGULARLY:
• Do not skip meals (especially breakfast)
• Eat 3 main meals with healthy snacks if needed
• Stop eating when you feel comfortably full — not stuffed

WATER IS ESSENTIAL:
• Drink 6-8 glasses of water daily (more in hot weather)
• Water is the best drink — zero calories, no sugar
• Limit sugary drinks, soda, and packaged juices
• If you feel hungry, try drinking water first — thirst is often mistaken for hunger

REDUCE THESE:
• Sugar: Limit to 3 tablespoons per day (including sugar in tea, porridge)
• Salt: Less than 1 teaspoon per day total (in cooking and at table)
• Saturated fats: Limit fatty meat, butter, coconut oil
• Processed foods: Limit sausages, bacon, packet snacks

COOK HEALTHY:
• Roast, grill, or steam instead of deep frying
• Use less oil in cooking
• Add vegetables to stews, rice, and sauces
• Remove chicken skin before cooking`,
    keyPoints: [
      'Eat from all food groups daily — varied diet is best',
      'Fill half your plate with vegetables',
      'Choose water over sugary drinks',
      'Limit sugar (3 tbsp max), salt (1 tsp max), and fatty foods',
      'Cook with less oil, grill or steam instead of deep fry',
    ],
    category: 'Nutrition',
    condition: 'general',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['nutrition', 'diet', 'eating', 'healthy', 'food'],
    icon: '🥬',
    references: ['Kenya National Food Guidelines', 'WHO Healthy Diet Fact Sheet'],
  },
  {
    id: 'gen-sleep-hygiene',
    title: 'Sleep Hygiene — Better Sleep for Better Health',
    summary: 'Good sleep is essential for heart health, blood sugar control, and mental wellbeing. Learn how to sleep better naturally.',
    content: `WHY SLEEP MATTERS:
While you sleep, your body repairs itself, your brain processes information, and your heart rests. Poor sleep increases risk of:
• High blood pressure
• Diabetes (impairs blood sugar control)
• Heart disease
• Obesity
• Depression and anxiety
• Poor immune function

HOW MUCH SLEEP DO YOU NEED?
• Adults: 7-9 hours per night
• Teenagers: 8-10 hours
• Children: 9-12 hours (depending on age)

CREATE THE PERFECT SLEEP ENVIRONMENT:
✓ Dark room — cover lights from electronics, use curtains
✓ Cool room — 18-22°C is ideal
✓ Quiet — minimize noise, use earplugs if needed
✓ Comfortable bed — mattress and pillows that support you

SLEEP ROUTINE — GO TO BED AT THE SAME TIME DAILY:
Set a consistent sleep-wake schedule — even on weekends. This trains your body's internal clock.

WIND DOWN 30-60 MINUTES BEFORE BED:
• Dim lights
• No phone, TV, or laptop screens (blue light disrupts sleep)
• Read a book or magazine (not on phone)
• Take a warm bath or shower
• Gentle stretching
• Listen to calm music
• Deep breathing exercises

DO NOT BEFORE BED:
✗ Caffeine (coffee, tea, soda, chocolate) — avoid after 2 PM
✗ Heavy meals — eat dinner at least 3 hours before bed
✗ Alcohol — disrupts sleep quality (even if it helps you fall asleep)
✗ Intense exercise — finish at least 2 hours before bed
✗ Phone scrolling — blue light suppresses melatonin (sleep hormone)

IF YOU CANNOT SLEEP:
• Get out of bed after 20 minutes
• Do something relaxing in dim light
• Return to bed when you feel sleepy
• Do not watch the clock — it creates anxiety
• Do not lie in bed worrying

MORNING ROUTINE HELPS NIGHTTIME SLEEP:
• Wake at the same time daily
• Get sunlight exposure in the morning
• Do not hit snooze
• Eat breakfast
• Exercise during the day`,
    keyPoints: [
      'Adults need 7-9 hours of quality sleep per night',
      'Keep a consistent sleep schedule — even weekends',
      'No screens (phone/TV) for 30 minutes before bed',
      'Avoid caffeine after 2 PM, heavy meals before bed',
      'If you cannot sleep, get up and do something relaxing',
    ],
    category: 'Lifestyle',
    condition: 'general',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['sleep', 'hygiene', 'rest', 'health', 'wellness'],
    icon: '😴',
    references: ['AHA Sleep and Heart Health', 'CDC Sleep Guidelines'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // HIV
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'hiv-understanding',
    title: 'Understanding HIV — Treatment Makes It Possible to Live a Full Life',
    summary: 'HIV is a manageable condition. With proper treatment, people with HIV live as long as anyone else and can prevent transmission.',
    content: `WHAT IS HIV?
HIV (Human Immunodeficiency Virus) attacks the immune system, specifically CD4 cells (T-cells) that help fight infections. Without treatment, HIV weakens the immune system over time.

WHAT IS AIDS?
AIDS (Acquired Immunodeficiency Syndrome) is the most advanced stage of HIV infection, when the immune system is severely damaged. With modern treatment, most people with HIV never develop AIDS.

HOW HIV IS TRANSMITTED:
• Unprotected sex (vaginal, anal)
• Sharing needles or syringes
• From mother to child during pregnancy, birth, or breastfeeding
• Contaminated blood products (rare in Kenya now)

HIV IS NOT TRANSMITTED BY:
• Casual contact (hugging, handshaking)
• Sharing utensils or food
• Mosquito bites
• Toilet seats
• Coughing or sneezing

TREATMENT — ART (Antiretroviral Therapy):
ART is a combination of medications that stop the virus from multiplying. It is NOT a cure, but it:
• Reduces viral load to undetectable levels
• Protects your immune system
• Prevents progression to AIDS
• Prevents transmission to others (U=U: Undetectable = Untransmittable)

When viral load is undetectable, you CANNOT transmit HIV to your partner through sex.

TAKING ART:
• Take every day at the same time
• Do NOT skip doses (this can lead to drug resistance)
• Side effects are usually mild and improve over time
• If you miss a dose, take it as soon as you remember
• Regular blood tests monitor viral load and CD4 count

LIVING WELL WITH HIV:
• Take ART daily
• Attend regular clinic appointments
• Eat a balanced diet
• Exercise regularly
• Manage stress
• Use condoms to prevent other STIs
• Get vaccinated (flu, pneumonia, COVID-19)
• Do not smoke (higher risk of complications)
• Limit alcohol

FAMILY PLANNING:
People with HIV can have healthy children. With proper treatment during pregnancy, the risk of transmitting HIV to the baby is less than 1%. Discuss family planning with your doctor.

DISCLOSURE:
Who to tell is your personal decision. Telling your partner allows them to get tested and access prevention. Healthcare workers need to know to provide proper care.`,
    keyPoints: [
      'HIV is manageable with daily ART medication',
      'Undetectable = Untransmittable (U=U)',
      'Take ART every day — never skip doses',
      'With treatment, life expectancy is normal',
      'People with HIV can have healthy HIV-negative children',
    ],
    category: 'Condition Basics',
    condition: 'hiv',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['HIV', 'AIDS', 'ART', 'treatment', 'prevention'],
    icon: '🔴',
    references: ['WHO HIV Guidelines', 'Kenya NASCOP Guidelines'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // MATERNAL HEALTH
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'mat-danger-signs',
    title: 'Danger Signs in Pregnancy — When to Seek Help',
    summary: 'Know the warning signs that need immediate medical attention during pregnancy and after delivery.',
    content: `Most pregnancies progress normally, but some complications can develop quickly. Knowing the danger signs can save your life and your baby's life.

DURING PREGNANCY — GO TO HOSPITAL IMMEDIATELY IF:
• Vaginal bleeding (any amount)
• Severe abdominal pain
• Severe headache that does not go away
• Blurred vision or seeing spots
• Swelling of face and hands (especially sudden)
• Fever (temperature above 38°C)
• Pain when urinating
• Baby stops moving (less than 10 movements in 2 hours after 28 weeks)
• Water breaks (fluid leaking) before 37 weeks
• Severe vomiting (cannot keep food down)

DURING LABOR — GO TO HOSPITAL IMMEDIATELY IF:
• Contractions more than 4 in 1 hour (if before 37 weeks)
• Water breaks (gush or trickle of fluid)
• Heavy bleeding
• Severe pain
• Baby is in abnormal position (breech or transverse)

AFTER DELIVERY — GO TO HOSPITAL IMMEDIATELY IF:
• Heavy bleeding (soaking more than 1 pad per hour)
• Fever and chills
• Severe abdominal pain
• Foul-smelling vaginal discharge
• Severe headache or vision changes
• Pain, redness, or swelling in one leg (blood clot sign)
• Difficulty breathing or chest pain
• Thoughts of harming yourself or baby

ATTEND ALL ANTENATAL CLINIC VISITS:
• First visit: As soon as you know you are pregnant
• Then: Monthly until 28 weeks
• Every 2 weeks from 28-36 weeks
• Every week from 36 weeks until delivery
• Total: At least 8 visits

VACCINATION IN PREGNANCY:
• Tetanus toxoid (TT): 2 doses during pregnancy
• Flu vaccine: Recommended in any trimester
• COVID-19 vaccine: Safe and recommended

NUTRITION IN PREGNANCY:
• Take iron and folic acid daily
• Eat a variety of foods
• Drink plenty of water
• Rest when needed
• Avoid alcohol and smoking
• Limit caffeine`,
    keyPoints: [
      'Go to hospital immediately for bleeding, severe pain, or severe headache',
      'Monitor baby\'s movements daily after 28 weeks',
      'Attend at least 8 antenatal visits during pregnancy',
      'Take iron and folic acid daily',
      'Know the danger signs for after delivery too',
    ],
    category: 'Safety',
    condition: 'maternity',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['pregnancy', 'maternity', 'danger signs', 'emergency'],
    icon: '🤰',
    references: ['WHO Antenatal Care Guidelines', 'Kenya MOH Maternal Health Guidelines'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // CARDIOVASCULAR (STROKE / HEART ATTACK)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'cv-stroke-signs',
    title: 'Stroke — Act FAST to Save a Life',
    summary: 'Stroke is a medical emergency. Every minute counts. Learn the FAST signs and what to do if you or someone you know has a stroke.',
    content: `WHAT IS A STROKE?
A stroke happens when blood supply to part of the brain is cut off. Brain cells begin to die within minutes. Stroke is a leading cause of death and disability in Kenya.

THERE ARE TWO MAIN TYPES:
Ischemic stroke (80%): A blood clot blocks a vessel supplying the brain
Hemorrhagic stroke (20%): A blood vessel in the brain bursts and bleeds

THE FAST SIGNS — ACT IMMEDIATELY:
F — FACE: Ask the person to smile. Does one side of the face droop?
A — ARMS: Ask the person to raise both arms. Does one arm drift downward?
S — SPEECH: Ask the person to repeat a simple sentence. Is their speech slurred or strange?
T — TIME: If you see any of these signs, call an ambulance or go to the nearest hospital IMMEDIATELY.

OTHER STROKE SYMPTOMS:
Sudden numbness or weakness of face, arm, or leg (especially on one side)
Sudden confusion, trouble speaking or understanding
Sudden trouble seeing in one or both eyes
Sudden trouble walking, dizziness, loss of balance
Sudden severe headache with no known cause

WHY IS TIME CRITICAL?
For ischemic stroke, a clot-busting drug (tPA) can reduce disability — but it must be given within 4.5 hours of symptom onset. The sooner you get to hospital, the better the outcome.

RISK FACTORS YOU CAN CONTROL:
High blood pressure (the #1 risk factor)
Diabetes
Smoking
High cholesterol
Obesity
Physical inactivity
Atrial fibrillation (irregular heartbeat)

RISK FACTORS YOU CANNOT CHANGE:
Age (risk increases after 55)
Family history
Gender (men have higher risk, but more women die)
Previous stroke or TIA (mini-stroke)

PREVENTION:
Control blood pressure below 130/80
Control diabetes
Quit smoking
Exercise 30 minutes daily
Eat a heart-healthy diet (less salt, less fat, more vegetables)
Limit alcohol
Know your numbers: BP, blood sugar, cholesterol

REMEMBER: Time is brain. Act FAST.`,
    keyPoints: [
      'Use FAST: Face, Arms, Speech, Time',
      'Stroke is treatable — but only if you get help fast',
      'High blood pressure is the #1 preventable cause',
      'Call or go to hospital immediately — every minute matters',
      'Control BP, diabetes, and lifestyle to prevent stroke',
    ],
    category: 'Safety',
    condition: 'cardiovascular',
    literacyLevel: 'basic',
    readTimeMinutes: 7,
    tags: ['stroke', 'FAST', 'emergency', 'cardiovascular', 'brain'],
    icon: '🧠',
    references: ['Kenya MOH Stroke Guidelines', 'WHO Stroke Fact Sheet', 'KEMRI Stroke Surveillance'],
  },
  {
    id: 'cv-heart-attack',
    title: 'Recognizing a Heart Attack — Warning Signs That Save Lives',
    summary: 'Heart attacks are common and deadly, but recognizing the signs early and getting help fast can save your life.',
    content: `WHAT IS A HEART ATTACK?
A heart attack (myocardial infarction) happens when blood flow to part of the heart muscle is blocked. Without oxygen, heart muscle begins to die. Permanent damage starts within 30 minutes.

WARNING SIGNS — NOT ALL ARE "CHEST PAIN":
Many people, especially women, do NOT have classic chest pain. Watch for:

CHEST DISCOMFORT:
Pressure, squeezing, fullness, or pain in the center of the chest
Lasts more than a few minutes or goes away and comes back

OTHER SYMPTOMS:
Pain or discomfort in one or both arms, back, neck, jaw, or stomach
Shortness of breath (with or without chest discomfort)
Cold sweat
Nausea or vomiting
Lightheadedness or sudden dizziness
Unexplained fatigue (especially in women)
Indigestion or heartburn that does not go away

HEART ATTACK IN WOMEN — DIFFERENT SIGNS:
Women are more likely than men to have:
Shortness of breath without chest pain
Nausea and vomiting
Back or jaw pain
Extreme fatigue
Flu-like symptoms

WHAT TO DO — EVERY SECOND COUNTS:
Call emergency services or have someone drive you to hospital immediately
Chew and swallow one adult aspirin (300mg) if you are not allergic — it helps break up clots
Sit down and stay calm
Do NOT drive yourself
Do NOT wait to see if symptoms go away

WHAT NOT TO DO:
Do NOT take Viagra or similar medications (deadly with some heart meds)
Do NOT eat or drink heavily
Do NOT exert yourself
Do NOT ignore symptoms hoping they will pass

CARDIAC ARREST — DIFFERENT FROM HEART ATTACK:
Cardiac arrest: Heart stops beating suddenly, person collapses, no pulse, not breathing
Call emergency and start CPR immediately — push hard and fast in center of chest (100-120 compressions per minute)

HOW TO PREVENT A HEART ATTACK:
Control blood pressure and cholesterol
Do not smoke
Exercise regularly
Eat a heart-healthy diet
Maintain healthy weight
Limit alcohol
Manage stress
Take medications as prescribed

WARNING: If you have had a heart attack before, you are at higher risk for another one. Take your medications every day and do not skip.`,
    keyPoints: [
      'Chest pressure, arm/jaw pain, shortness of breath — call for help',
      'Women often have different signs: fatigue, nausea, back pain',
      'Chew aspirin (300mg) while waiting for help — if not allergic',
      'Do NOT drive yourself — get someone else to take you',
      'Every minute of delay costs heart muscle',
    ],
    category: 'Safety',
    condition: 'cardiovascular',
    literacyLevel: 'basic',
    readTimeMinutes: 8,
    tags: ['heart attack', 'MI', 'cardiovascular', 'emergency', 'chest pain'],
    icon: '❤️',
    references: ['WHO Cardiovascular Disease Guidelines', 'Kenya MOH Non-Communicable Diseases Guidelines', 'AHA Heart Attack Warning Signs'],
  },
  {
    id: 'cv-heart-healthy-diet',
    title: 'Heart-Healthy Eating — Protecting Your Heart Through Food',
    summary: 'The food you eat directly affects your heart health. Learn which foods protect your heart and which ones to avoid.',
    content: `WHY DIET MATTERS FOR YOUR HEART:
Your heart works 24 hours a day, every day. What you eat either protects it or damages it over time. Heart disease is the leading cause of death in Kenya among adults.

FOODS THAT PROTECT YOUR HEART — EAT THESE DAILY:

VEGETABLES (4-5 servings per day):
Sukuma wiki, spinach, cabbage, carrots, peppers, tomatoes, terere, managu
Fresh or cooked — eat a rainbow of colors

FRUITS (3-4 servings per day):
Bananas, oranges, mangoes, pawpaw, apples, avocado, passion fruit
Eat whole fruit instead of drinking juice (more fiber, less sugar)

WHOLE GRAINS (6-8 servings per day):
Brown rice, oats, millet, sorghum, whole wheat bread, whole wheat chapati
Fiber lowers cholesterol and keeps arteries healthy

HEALTHY PROTEIN:
Fish — especially oily fish (omena, tilapia, dagaa) — eat twice a week
Skinless chicken, lean beef in moderation
Beans, lentils, green grams, cowpeas — excellent sources of fiber and protein

HEALTHY FATS:
Use vegetable oils (sunflower, olive, canola) instead of saturated fats
Avocado — full of heart-healthy monounsaturated fat
Nuts and seeds (groundnuts, cashews, pumpkin seeds) — small handful daily
Limit coconut milk and oil (high in saturated fat)

FOODS TO LIMIT OR AVOID:

SALT: Less than 1 teaspoon per day total
Saturated fats: Fatty meat, butter, ghee, coconut oil, palm oil
Trans fats: Processed snacks, margarine, fried foods from vendors
Added sugar: Soda, sweetened juices, sweets, cakes, biscuits
Red meat: Limit beef and goat meat to 2-3 times per week
Processed meats: Sausages, bacon, ham — high in salt and preservatives

EATING PATTERNS THAT HELP:
Eat at regular times — do not skip meals
Control portion sizes — use a smaller plate
Cook at home more often (you control the ingredients)
Eat slowly and stop when comfortably full
Drink water as your main beverage

KENYAN HEART-HEALTHY SAMPLE MENU:
Breakfast: Oat or millet porridge with sliced banana, no sugar
Lunch: Brown rice, sukuma wiki, grilled tilapia, fresh orange
Snack: Handful of groundnuts, glass of water
Dinner: Whole wheat chapati, bean stew, vegetable salad

REMEMBER: Change one habit at a time. Start by adding one extra vegetable serving each day. Small steps lead to big results.`,
    keyPoints: [
      'Eat more vegetables, fruits, whole grains, and fish',
      'Limit salt, saturated fats, added sugar, and processed foods',
      'Use vegetable oils instead of saturated fats',
      'Cook at home to control what goes into your food',
      'Small changes over time create lasting heart-healthy habits',
    ],
    category: 'Nutrition',
    condition: 'cardiovascular',
    literacyLevel: 'intermediate',
    readTimeMinutes: 8,
    tags: ['heart', 'diet', 'nutrition', 'cardiovascular', 'eating'],
    icon: '🥗',
    references: ['AHA Dietary Guidelines', 'Kenya National Food and Nutrition Guidelines', 'WHO CVD Prevention Guidelines'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENAL (CKD) — ADDITIONAL
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ckd-diet',
    title: 'Eating Well with Chronic Kidney Disease',
    summary: 'Your diet changes as kidney disease progresses. Learn what to eat and what to limit at each stage to protect your kidneys.',
    content: `WHY DIET MATTERS FOR YOUR KIDNEYS:
Healthy kidneys filter waste and balance minerals in your blood. When kidneys are damaged, waste builds up and minerals get out of balance. The right diet reduces the workload on your kidneys.

IMPORTANT: Dietary needs change as CKD progresses. Work with your doctor or a dietitian to create a plan for your stage. General guidelines below.

SALT — LIMIT FOR ALL STAGES:
Limit to less than 5g (1 teaspoon) per day
Avoid high-salt foods: stock cubes, processed meats, packet soups, salted snacks
Use herbs, garlic, ginger, lemon for flavor instead
Too much salt raises blood pressure and causes fluid retention

PROTEIN — MODERATE INTAKE:
Early stages (1-3): Normal protein from quality sources
Advanced stages (4-5): May need to reduce protein — ask your doctor
Good sources: Fish, chicken, eggs, beans, lentils (in moderation)
Too much protein increases kidney workload

POTASSIUM — MAY NEED TO LIMIT IN ADVANCED STAGES:
High potassium foods to limit (if advised):
Bananas, oranges, oranges juice, mangoes
Potatoes, sweet potatoes, carrots
Beans, lentils, green grams
Tomatoes and tomato sauce
Spinach and sukuma wiki (cooking reduces potassium)
Low potassium alternatives: Apples, pawpaw, cucumber, cabbage, bell peppers

PHOSPHORUS — LIMIT IN ADVANCED STAGES:
Limit: Soda, processed foods, dairy products (milk, yogurt, mala)
Avoid: Organ meats (liver, kidney), sardines, nuts
Too much phosphorus weakens bones and damages blood vessels

FLUID — BALANCE CAREFULLY:
Early stages: Drink normally but do not over-hydrate
Advanced stages: Your doctor will tell you exactly how much to drink
Too much fluid causes swelling and shortness of breath
Too little fluid can damage kidneys further

FOODS TO AVOID WITH CKD:
Avoid NSAIDs (ibuprofen, diclofenac, naproxen) — they damage kidneys
Avoid herbal remedies unless approved by your doctor
Avoid high-dose vitamin C supplements
Avoid raw shellfish (infection risk)
Limit alcohol

DAILY TIPS:
Read food labels for sodium and phosphorus content
Cook vegetables in plenty of water and drain to reduce potassium if needed
Eat small, frequent meals if you feel nauseous
Track your weight daily — sudden gain means fluid retention
Keep a food diary for your clinic visits

REMEMBER: Everyone with CKD is different. Get personalized advice from your healthcare team.`,
    keyPoints: [
      'Limit salt to less than 1 teaspoon per day at all stages',
      'Protein, potassium, and phosphorus may need restriction in later stages',
      'Avoid NSAIDs (ibuprofen, diclofenac) — they poison kidneys',
      'Follow your doctor\'s specific dietary recommendations for your stage',
      'Track weight daily to monitor fluid balance',
    ],
    category: 'Nutrition',
    condition: 'renal',
    literacyLevel: 'intermediate',
    readTimeMinutes: 8,
    tags: ['kidney', 'CKD', 'diet', 'nutrition', 'renal', 'potassium'],
    icon: '🫘',
    references: ['KDIGO 2024 CKD Nutrition Guidelines', 'Kenya MOH CKD Guidelines', 'NKF Kidney Diet Recommendations'],
  },
  {
    id: 'ckd-dialysis',
    title: 'Understanding Dialysis — What to Expect',
    summary: 'When kidneys fail, dialysis does the work your kidneys can no longer do. Learn about the two types and how to prepare.',
    content: `WHAT IS DIALYSIS?
Dialysis is a treatment that does the work of healthy kidneys when they can no longer filter waste and excess fluid from your blood. It is not a cure for kidney failure, but it can keep you alive and feeling well.

WHEN IS DIALYSIS NEEDED?
When kidney function drops to about 10-15% (Stage 5 CKD, eGFR below 15)
Or earlier if you have severe symptoms: nausea, vomiting, fluid overload, high potassium, confusion

THERE ARE TWO MAIN TYPES:

TYPE 1: HEMODIALYSIS (HD)
Blood is removed from your body, passed through a machine (dialyzer) that cleans it, then returned to your body.
Where: Usually at a hospital or dialysis center
How often: 3 times per week, 3-5 hours each session
Access: A vascular access (fistula or graft) must be created surgically weeks ahead — this is a permanent connection between an artery and vein, usually in your arm
During treatment: You sit in a chair, can read or watch TV
After treatment: Some people feel tired or dizzy — rest is normal

TYPE 2: PERITONEAL DIALYSIS (PD)
A cleansing fluid is put into your abdomen through a catheter. The lining of your abdomen (peritoneum) filters waste, then the fluid is drained out.
Where: At home — you can do it yourself or have a helper
How often: Every day, 4-5 exchanges, each taking about 30-40 minutes
Access: A soft tube (catheter) placed in your abdomen
Training: You will be trained for 1-2 weeks
Advantage: More flexible schedule, fewer dietary restrictions

PREPARING FOR DIALYSIS — DON'T WAIT UNTIL IT IS URGENT:
See a kidney specialist when your eGFR drops below 20
Learn about both types of dialysis
Choose the type that fits your lifestyle
Get vascular access created early (for HD fistula, needs 2-3 months to mature)
Discuss with family — you will need support
Continue medications to slow kidney decline

LIFE ON DIALYSIS:
You will need to follow a special diet (limit salt, potassium, phosphorus, fluid)
Take medications as prescribed
Attend every dialysis session — missing even one can be dangerous
Some people work, travel, and exercise while on dialysis
Dialysis is not the end — it is a bridge to transplant or a long-term treatment

KIDNEY TRANSPLANT:
A kidney transplant offers the best quality of life for eligible patients
Living donors (family members) can donate one kidney and live normally
Discuss transplant options at your dialysis center or with a kidney doctor

WARNING: Dialysis is life-saving. Do not delay starting it out of fear. Many people feel dramatically better after their first sessions because toxins are cleared from their blood.`,
    keyPoints: [
      'Dialysis filters waste when kidneys fail — it keeps you alive',
      'Hemodialysis: 3x/week at a center (3-5 hours per session)',
      'Peritoneal dialysis: daily at home — flexible schedule',
      'Plan ahead — get vascular access made early',
      'Kidney transplant offers best outcomes — discuss with your doctor',
    ],
    category: 'Treatment',
    condition: 'renal',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['dialysis', 'kidney failure', 'hemodialysis', 'peritoneal dialysis', 'renal'],
    icon: '🩻',
    references: ['KDIGO 2024 Dialysis Guidelines', 'Kenya Renal Association Guidelines', 'NKF Dialysis Patient Education'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // HIV — ADDITIONAL
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'hiv-prevention',
    title: 'HIV Prevention — Options to Protect Yourself and Others',
    summary: 'There are many effective tools to prevent HIV. Learn about PrEP, PEP, condoms, and other prevention methods available in Kenya.',
    content: `HIV PREVENTION TODAY:
Preventing HIV is easier today than ever before. There are multiple effective options, and you can choose what works best for you. In Kenya, many prevention services are available free at public health facilities.

METHOD 1: CONDOMS (MALE AND FEMALE)
Effectiveness: 99% when used correctly and consistently
Where to get: Free at most health facilities and pharmacies
Available: Male and female condoms
How to use: Put on before any genital contact, use water-based lubricant
Advantage: Also prevents pregnancy and other STIs
TIP: Practice putting one on before you need it

METHOD 2: PrEP (Pre-Exposure Prophylaxis)
What it is: Daily medication that prevents HIV infection
Effectiveness: 99% if taken every day
Who should take it: People at higher risk of HIV exposure
Where to get: Available at many health facilities in Kenya (free)
How to take: One pill daily at the same time
How it works: The medication builds up in your body so HIV cannot establish infection
Do I still need condoms? Yes — PrEP does not prevent pregnancy or other STIs
Recent option: Event-driven PrEP (2-1-1 schedule) for men who have sex with men

METHOD 3: PEP (Post-Exposure Prophylaxis)
What it is: Emergency medication after possible HIV exposure
When to take: Within 72 hours of exposure — the sooner the better
Duration: 28 days of medication
Effectiveness: Over 80% if started within 72 hours, best within 24 hours
Where to get: Emergency departments and some health facilities
When to use: After condom break, sexual assault, needle-stick injury — act fast

METHOD 4: VOLUNTARY MEDICAL MALE CIRCUMCISION (VMMC)
Reduces male risk of getting HIV by approximately 60%
Available free at many health facilities in Kenya
Recommended for all uncircumcised men
Does NOT fully protect — still use condoms

METHOD 5: U=U (Undetectable = Untransmittable)
If a person with HIV takes ART daily and has undetectable viral load (below 1000 copies/ml), they CANNOT transmit HIV to their partner through sex
This is scientifically proven and endorsed by WHO, CDC, and Kenya NASCOP

METHOD 6: PREVENTING MOTHER-TO-CHILD TRANSMISSION (PMTCT)
All pregnant women with HIV should take ART throughout pregnancy
The baby receives ART for 4-12 weeks after birth
With proper treatment, transmission risk is less than 1%
Formula feeding eliminates breastfeeding transmission risk

GET TESTED:
Know your status — HIV testing is free at most health facilities
Couples testing helps both partners know and protect each other
Test regularly (every 3-6 months if at higher risk)
Testing is confidential

WARNING: HIV prevention methods work best when combined. There is no single perfect method. Use the approach that fits your life.`,
    keyPoints: [
      'Condoms prevent HIV, pregnancy, and STIs — use with lubricant',
      'PrEP is a daily pill that prevents HIV (99% effective when taken daily)',
      'PEP is emergency medication within 72 hours of exposure',
      'U=U: Undetectable viral load means no HIV transmission risk',
      'PMTCT: HIV-positive mothers can have HIV-negative babies',
    ],
    category: 'Prevention',
    condition: 'hiv',
    literacyLevel: 'basic',
    readTimeMinutes: 8,
    tags: ['HIV', 'prevention', 'PrEP', 'PEP', 'condoms', 'U=U'],
    icon: '🔴',
    references: ['Kenya NASCOP Guidelines', 'WHO HIV Prevention Guidelines', 'CDC PrEP Guidelines'],
  },
  {
    id: 'hiv-stigma',
    title: 'Overcoming HIV Stigma — You Are Not Your Diagnosis',
    summary: 'Stigma and discrimination remain barriers to HIV care. Learn how to cope with stigma and where to find support.',
    content: `WHAT IS HIV STIGMA?
Stigma is negative attitudes, beliefs, and behaviors directed at people living with HIV. It can come from others — and from yourself (internalized stigma). Stigma hurts just as much as the virus itself.

TYPES OF STIGMA:
Social stigma: Rejection, gossip, exclusion by family, friends, or community
Self-stigma: Feelings of shame, guilt, worthlessness about your status
Institutional stigma: Discrimination at work, school, or healthcare settings
Healthcare stigma: Some health workers may treat you differently

EFFECTS OF STIGMA:
People avoid testing — afraid of being seen at HIV clinic
People delay starting or staying on treatment
Higher rates of depression and anxiety
Worse health outcomes overall
Isolation and loneliness

THE TRUTH ABOUT HIV TODAY:
HIV is a manageable medical condition — like diabetes or hypertension
People with HIV can live as long as anyone else
With U=U (undetectable viral load), you cannot transmit HIV
Your status says nothing about your character
You deserve love, respect, and support

HOW TO COPE WITH STIGMA:

KNOW YOUR RIGHTS:
You have the right to confidentiality — your status cannot be shared without consent
You have the right to treatment without discrimination
You have the right to work and access services
In Kenya, the HIV and AIDS Prevention and Control Act protects your rights

CHOOSE WHO TO TELL CAREFULLY:
You do not have to tell everyone — disclosure is your choice
Start with someone you trust completely
Consider telling a family member or close friend who can support you
Disclosure often gets easier with practice
HIV support groups provide a safe space to talk

BUILD YOUR SUPPORT NETWORK:
Join a support group for people living with HIV
Connect with others online or in person
Peer counselors who are HIV-positive can help
Many health facilities have support groups — ask at your clinic

EDUCATE YOURSELF AND OTHERS:
Know the facts about HIV transmission — you cannot infect others through casual contact
Learn about U=U to address fears
When you feel confident, you may choose to educate others

FOCUS ON YOUR HEALTH:
Take your medications — good health is the best response to stigma
Keep your clinic appointments
Eat well, exercise, manage stress
Healthy people living with HIV prove the stigma wrong

SPEAK UP:
If healthcare workers treat you poorly, report to facility management
If you face discrimination at work, seek legal advice
Your voice helps break down stigma for everyone

REMEMBER: HIV does not define you. You are a mother, father, worker, friend, community member — and you happen to live with a manageable virus.`,
    keyPoints: [
      'Stigma is harmful but can be overcome with support and education',
      'You have legal rights to confidentiality and non-discrimination in Kenya',
      'Choose who to tell carefully — disclosure is your decision',
      'Support groups and peer counselors can help you cope',
      'Focus on your health — good health is the best response to stigma',
    ],
    category: 'Mental Health',
    condition: 'hiv',
    literacyLevel: 'basic',
    readTimeMinutes: 8,
    tags: ['HIV', 'stigma', 'discrimination', 'mental health', 'support'],
    icon: '🔴',
    references: ['Kenya HIV and AIDS Prevention and Control Act', 'UNAIDS Stigma Reduction Guidelines', 'WHO HIV Stigma Guidelines'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // MATERNITY — ADDITIONAL
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'mat-postnatal',
    title: 'Postnatal Care — Looking After Yourself After Childbirth',
    summary: 'The weeks after childbirth are critical for your health and your baby\'s health. Learn what to expect and when to seek help.',
    content: `WHY POSTNATAL CARE MATTERS:
The first 6 weeks after childbirth (postnatal period) are a time of major physical and emotional changes. Many maternal deaths occur during this period — regular check-ups save lives.

YOUR POSTNATAL VISITS:
First visit: Within 3 days of delivery (facility or home visit)
Second visit: 7-14 days after delivery
Third visit: 6 weeks after delivery
At each visit: Check blood pressure, temperature, bleeding, healing, and emotional wellbeing

NORMAL SYMPTOMS AFTER DELIVERY:
Vaginal bleeding (lochia): Lasts 2-6 weeks, starts bright red then becomes brown then yellow
Afterpains: Uterus cramping, especially during breastfeeding — these are normal
Perineal pain: Tear or episiotomy site may hurt for 1-2 weeks
Breast engorgement: Day 3-5 after delivery — painful but passes
Night sweats: Body eliminating extra pregnancy fluid
Hair loss: Normal — grows back
Mood swings: Baby blues affect 80% of women — weepiness, irritability (lasts 1-2 weeks)

WARNING SIGNS — GO TO HOSPITAL:
Heavy bleeding (soaking more than 1 pad per hour) or large clots
Fever above 38°C
Severe abdominal pain
Foul-smelling vaginal discharge
Severe headache or vision changes
Pain or swelling in one leg
Chest pain or difficulty breathing
Painful or burning urination
Perineal wound that is red, swollen, or oozing
Thoughts of harming yourself or baby

CARING FOR YOUR EPISIOTOMY OR C-SECTION WOUND:
Keep clean and dry
Wash with clean water and mild soap, pat dry
Change pads every 4-6 hours
Do not lift heavy objects (C-section: none > baby's weight for 6 weeks)
Report any signs of infection

BREASTFEEDING SUPPORT:
Breastfeed within 1 hour of birth
Feed on demand — every 2-3 hours, including at night
Proper latch: Baby's mouth covers nipple and part of areola, chin touches breast
If painful or cracked nipples — ask for help at the clinic
Express milk if breasts are too full
Drink plenty of water — breastfeeding causes thirst

FAMILY PLANNING AFTER DELIVERY:
You can get pregnant as soon as 6 weeks after birth — even if breastfeeding
Discuss family planning at your 6-week check-up
Options safe during breastfeeding: Progestin-only pills, implants, IUD, injectables
Condoms can be used immediately

EMOTIONAL HEALTH:
Baby blues (days 3-10): Weepiness, irritability — common and resolves on its own
Postpartum depression (lasting beyond 2 weeks): Deep sadness, loss of interest, trouble bonding with baby, changes in sleep/appetite — seek help, it is treatable
Support from partner and family is essential

NUTRITION FOR NEW MOTHERS:
Eat a variety of nutritious foods
Drink plenty of water (especially if breastfeeding)
Continue iron and folic acid supplements for at least 3 months
Breastfeeding requires about 500 extra calories per day

REMEMBER: A healthy mother means a healthy baby. Do not neglect your own care.`,
    keyPoints: [
      'Attend postnatal visits at 3 days, 7-14 days, and 6 weeks',
      'Go to hospital for heavy bleeding, fever, severe pain, or wound infection',
      'Baby blues (1-2 weeks) is normal — but lasting sadness needs help',
      'Breastfeed within 1 hour, feed on demand, get help if painful',
      'Discuss family planning — pregnancy can happen soon after delivery',
    ],
    category: 'Self-Care',
    condition: 'maternity',
    literacyLevel: 'basic',
    readTimeMinutes: 8,
    tags: ['postnatal', 'postpartum', 'maternity', 'new mother', 'recovery'],
    icon: '🤱',
    references: ['WHO Postnatal Care Guidelines', 'Kenya MOH Maternal and Newborn Health Guidelines', 'UNICEF Postnatal Care'],
  },
  {
    id: 'mat-breastfeeding',
    title: 'Breastfeeding — Best for Your Baby, Best for You',
    summary: 'Breastfeeding provides ideal nutrition for your baby and protects both of you from illness. Learn how to breastfeed successfully.',
    content: `WHY BREASTFEEDING MATTERS:
Breast milk is the perfect food for your baby. It contains every nutrient your baby needs in exactly the right amounts. No formula can match it.

BENEFITS FOR BABY:
Contains antibodies that protect against infections (diarrhea, pneumonia, ear infections)
Reduces risk of sudden infant death syndrome (SIDS)
Lower risk of allergies and asthma
Better brain development — breastfed babies score higher on intelligence tests
Protects against obesity and diabetes later in life
Reduces risk of childhood cancers

BENEFITS FOR MOTHER:
Helps uterus contract after delivery (reduces bleeding)
Burns extra calories — helps return to pre-pregnancy weight
Reduces risk of breast and ovarian cancer
Reduces risk of type 2 diabetes
Saves money (formula is expensive)
Delays return of fertility (not reliable as sole contraception)
Bonding with baby

EXCLUSIVE BREASTFEEDING:
For the first 6 months: Give only breast milk — no water, no juice, no formula, no other foods
Breast milk contains enough water for your baby — even in hot weather
Babies do not need extra water — it can cause diarrhea or poor weight gain

HOW OFTEN TO FEED:
Newborns: Every 2-3 hours (8-12 times per day)
Week 1-2: Frequent feeding is normal — establishes milk supply
After that: Baby sets own pattern
Feed on demand — watch for hunger cues: rooting, sucking motions, crying is late sign
Night feeds are important — prolactin (milk-making hormone) is highest at night

SIGNS OF GOOD LATCH:
Baby's chin touches the breast
Mouth is wide open, lips are flanged (like fish)
Baby takes both nipple and areola into mouth
You hear swallowing sounds
No pain for mother (some tenderness is normal first few days)
Breast feels softer after feeding

IF BREASTFEEDING IS PAINFUL:
Check latch — most pain is from poor latch
Cracked nipples: Express a little milk and rub on nipple after feeds, let air dry
Engorgement: Feed more often, express to soften before baby latches
Mastitis: Red, hot, painful area on breast with fever — see a doctor, continue feeding on affected side — antibiotics may be needed

EXPRESSING AND STORING BREAST MILK:
Hand express or use a pump — ask at clinic for guidance
Store in clean container
Room temperature: 4 hours
Refrigerator: 3 days
Freezer: 6 months
Thaw in refrigerator or warm water — do not microwave

BREASTFEEDING AND HIV:
Kenya guidelines: HIV-positive mothers should breastfeed exclusively for 6 months while taking ART
Mixed feeding (breast milk + other foods/liquids) increases HIV transmission risk
Stop breastfeeding when adequate replacement feeding is available
Discuss with your doctor for personalized advice

WHEN TO GET HELP:
Baby is not gaining weight
Baby has fewer than 6 wet diapers per day
Breastfeeding is extremely painful
You have fever or breast redness
You are worried about your milk supply`,
    keyPoints: [
      'Breast milk is the perfect food — exclusive breastfeeding for 6 months',
      'Feed on demand, 8-12 times per day — night feeds are important',
      'Good latch means no pain and baby swallows — get help if painful',
      'HIV-positive mothers can breastfeed while on ART — discuss with your doctor',
      'Seek help if baby not gaining weight, too few wet diapers, or fever',
    ],
    category: 'Self-Care',
    condition: 'maternity',
    literacyLevel: 'basic',
    readTimeMinutes: 9,
    tags: ['breastfeeding', 'maternity', 'baby', 'nutrition', 'newborn'],
    icon: '🤱',
    references: ['WHO Breastfeeding Guidelines', 'Kenya MOH Infant and Young Child Feeding Guidelines', 'UNICEF Breastfeeding Recommendations'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // MENTAL HEALTH (ANXIETY / BIPOLAR)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'mh-anxiety',
    title: 'Understanding Anxiety — When Worry Becomes Overwhelming',
    summary: 'Anxiety is more than normal worry. It is a treatable condition that affects millions. Learn the signs and how to get help.',
    content: `WHAT IS ANXIETY?
Anxiety is your body's natural response to danger — the "fight or flight" response. A little anxiety helps you perform. But when anxiety is excessive, persistent, and interferes with daily life, it becomes an anxiety disorder.

TYPES OF ANXIETY DISORDERS:
Generalized Anxiety Disorder (GAD): Constant, excessive worry about many things
Panic Disorder: Sudden, intense episodes of fear (panic attacks) with physical symptoms
Social Anxiety: Extreme fear of social situations and being judged
Phobias: Intense fear of specific things (needles, heights, etc.)
Obsessive-Compulsive Disorder (OCD): Unwanted thoughts (obsessions) and repetitive behaviors (compulsions)

SYMPTOMS OF ANXIETY:

PHYSICAL SYMPTOMS:
Racing heart, chest tightness, palpitations
Rapid breathing or feeling of choking
Sweating, trembling, shaking
Nausea, stomach upset, diarrhea
Dizziness, lightheadedness
Tense muscles, headaches
Fatigue, trouble sleeping

MENTAL SYMPTOMS:
Constant worrying — can't stop
Racing thoughts
Difficulty concentrating
Feeling on edge, restless
Irritability
Catastrophic thinking (expecting the worst)
Feeling of impending doom or danger
Avoiding situations that cause anxiety

PANIC ATTACK:
Sudden, intense fear that peaks within minutes
Heart pounding, chest pain, feeling of choking
Sweating, trembling, chills or hot flashes
Numbness or tingling
Feeling unreal, detached from yourself
Fear of losing control or dying

WHAT TO DO DURING A PANIC ATTACK:
Ground yourself — name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste
Breathe slowly — in for 4 counts, out for 6 counts
Remind yourself: This will pass, you are not dying, this is just anxiety
Splash cold water on your face
Call someone you trust

TREATMENT OPTIONS:
Therapy (CBT): Cognitive Behavioral Therapy is highly effective — teaches you to change thought patterns
Medication: SSRIs (antidepressants) help many people — prescribed by a doctor — take 2-4 weeks to work
Lifestyle: Regular exercise, adequate sleep, reducing caffeine and alcohol, mindfulness meditation
Combination: Therapy + medication works best for moderate to severe anxiety

LIFESTYLE CHANGES THAT HELP:
Exercise daily — 30 minutes of walking reduces anxiety significantly
Reduce caffeine — it mimics anxiety symptoms and triggers attacks
Sleep 7-9 hours — poor sleep worsens anxiety
Practice deep breathing — several times throughout the day
Limit alcohol — it worsens anxiety after the initial effect
Challenge anxious thoughts — ask yourself: Is this worry realistic? What is the evidence?

WHEN TO SEEK PROFESSIONAL HELP:
Anxiety interferes with work, school, or relationships
You avoid situations because of anxiety
You have panic attacks
You have been worrying excessively for more than 2 weeks
You use alcohol to cope with anxiety
You have thoughts of harming yourself

REMEMBER: Anxiety is not a character flaw. It is a medical condition that responds well to treatment.`,
    keyPoints: [
      'Anxiety disorders are common and treatable — you are not alone',
      'Panic attacks are scary but not dangerous — ground yourself and breathe',
      'Therapy (CBT) and medication both work well for anxiety',
      'Exercise, sleep, deep breathing, and cutting caffeine help daily',
      'Seek professional help if anxiety is interfering with your life',
    ],
    category: 'Mental Health',
    condition: 'mental-health',
    literacyLevel: 'basic',
    readTimeMinutes: 8,
    tags: ['anxiety', 'panic', 'mental health', 'worry', 'stress'],
    icon: '🧠',
    references: ['WHO Mental Health Gap Guidelines', 'APA Anxiety Treatment Guidelines', 'Kenya MOH Mental Health Policy'],
  },
  {
    id: 'mh-bipolar',
    title: 'Understanding Bipolar Disorder — Managing Mood Swings',
    summary: 'Bipolar disorder causes extreme mood swings from high (mania) to low (depression). With proper treatment, people with bipolar lead stable, productive lives.',
    content: `WHAT IS BIPOLAR DISORDER?
Bipolar disorder (formerly called manic-depressive illness) is a brain disorder that causes unusual shifts in mood, energy, activity levels, and concentration. These shifts are different from normal mood changes — they can affect sleep, energy, behavior, and judgment.

THERE ARE TWO MAIN PHASES:

MANIC PHASE (HIGH):
Lasts at least 1 week (or shorter if hospitalized)
Symptoms:
Extremely elevated or irritable mood
Increased energy, restlessness
Talking very fast, jumping between topics
Grandiose beliefs (feeling you have special powers or plans)
Little need for sleep (feeling rested after 3 hours)
Racing thoughts
Poor judgment — risky behavior (spending sprees, reckless driving, sexual risks)
Increased goal-directed activity
Sometimes psychosis (delusions or hallucinations)

HYPOMANIA: A milder form of mania that lasts at least 4 days. Person may feel great and be very productive, but judgment is still affected.

DEPRESSIVE PHASE (LOW):
Lasts at least 2 weeks
Same symptoms as major depression:
Deep sadness, emptiness, hopelessness
Loss of interest in everything
Fatigue, low energy
Sleep problems (insomnia or sleeping too much)
Changes in appetite
Difficulty concentrating
Suicidal thoughts

MIXED EPISODES:
Symptoms of mania and depression occur at the same time — high energy with deep despair — this is especially dangerous for suicide risk.

TYPES OF BIPOLAR DISORDER:
Bipolar I: Full manic episodes (often requiring hospitalization) plus depressive episodes
Bipolar II: Hypomanic episodes plus major depressive episodes (no full mania)
Cyclothymia: Milder mood swings lasting at least 2 years

TREATMENT — MEDICATION IS ESSENTIAL:
Bipolar disorder requires medication — therapy alone is usually not sufficient

Mood stabilizers (first-line treatment):
Lithium — most effective mood stabilizer, requires regular blood tests
Valproate — effective for mania, avoid in pregnancy
Carbamazepine, lamotrigine

Atypical antipsychotics:
Quetiapine, olanzapine, aripiprazole — especially for mania or mixed episodes

Antidepressants are used carefully — can trigger mania in some people

IMPORTANT: Do NOT stop medication suddenly — this can trigger severe relapse. Discuss any changes with your doctor.

LIFESTYLE MANAGEMENT:
Maintain a regular sleep schedule — disruption triggers episodes
Take medication every day without fail
Track your mood daily — identify early warning signs
Avoid alcohol and recreational drugs — they destabilize mood
Manage stress — learn relaxation techniques
Exercise regularly — moderates mood
Have a routine — regular meals, sleep, activities

TRIGGER WARNING — MANIA:
Suddenly needing much less sleep
Feeling unusually energetic or creative
Starting many new projects
Speaking faster than usual
Unusual irritability or aggression
Increased spending or risky behavior

If you or family notice these — contact your doctor immediately. Early intervention prevents full manic episodes.

FAMILY SUPPORT:
Family involvement is crucial — help monitor for mood changes
Attend family education sessions
Be patient — episodes are not the person's fault
Support medication adherence without nagging
Know emergency contact numbers

CRISIS — GET HELP NOW:
Suicidal thoughts or plans
Severe mania with dangerous behavior
Psychosis (hallucinations, delusions)
Stopping all medication and rapidly declining
Call emergency services or go to the nearest hospital

REMEMBER: Bipolar disorder is a lifelong condition, but with proper treatment, people live stable, successful, fulfilling lives.`,
    keyPoints: [
      'Bipolar disorder causes extreme mood swings (mania and depression)',
      'Medication (mood stabilizers) is essential — do not stop suddenly',
      'Regular sleep and routine help prevent episodes',
      'Track mood daily and recognize early warning signs',
      'Family support and early intervention prevent severe episodes',
    ],
    category: 'Mental Health',
    condition: 'mental-health',
    literacyLevel: 'intermediate',
    readTimeMinutes: 10,
    tags: ['bipolar', 'mania', 'depression', 'mental health', 'mood disorder'],
    icon: '🧠',
    references: ['WHO mhGAP Bipolar Guidelines', 'APA Bipolar Treatment Guidelines', 'Kenya MOH Mental Health Guidelines'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // PEDIATRIC
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ped-malaria',
    title: 'Malaria in Children — Recognition, Treatment, and Prevention',
    summary: 'Malaria kills a child every 2 minutes in Africa. Early recognition and treatment save lives. Learn how to protect your child.',
    content: `WHAT IS MALARIA?
Malaria is a life-threatening disease caused by parasites (Plasmodium) transmitted through the bite of infected female Anopheles mosquitoes. In Kenya, malaria is endemic in many regions, especially western Kenya, the Coast, and Lake Victoria region.

WHY CHILDREN ARE MOST AT RISK:
Children under 5 years have not yet developed immunity
Their immune systems are still developing
They cannot always communicate their symptoms
Malaria can progress very quickly in children — from mild to severe in hours

SIGNS OF MALARIA IN CHILDREN:
MILD MALARIA:
Fever (any fever in a malaria zone should be tested)
Chills and shivering
Sweating
Headache
Vomiting
Diarrhea
Body aches
Loss of appetite
Irritability, fussiness

SEVERE MALARIA — MEDICAL EMERGENCY (GO TO HOSPITAL IMMEDIATELY):
High fever that does not come down
Convulsions or seizures
Difficulty breathing or rapid breathing
Extreme weakness — child cannot sit or stand
Confusion or altered consciousness
Vomiting everything — cannot keep food or medicine down
Dark or cola-colored urine
Yellow eyes or skin (jaundice)
Pale palms or inner eyelids (anemia — child looks very pale)
Not urinating for more than 12 hours

DIAGNOSIS:
Malaria Rapid Diagnostic Test (RDT) — finger-prick test, result in 15 minutes
Blood smear (microscopy) — more accurate, results same day
Every fever in a malaria-endemic area should be tested — do not assume it is malaria

TREATMENT:
Uncomplicated malaria: Artemether-Lumefantrine (AL) — a 3-day course, take with fatty food (milk, chapati)
Severe malaria: Artesunate injection or rectal artesunate — hospital treatment
First dose as soon as possible after diagnosis — do not wait
Complete the full course even if the child feels better

WARNING: If the child vomits within 1 hour of taking medication, repeat the dose. If vomiting persists, go to hospital.

PREVENTION:

Insecticide-Treated Bed Nets (ITNs):
Sleep under a treated net every night, every child
Check nets for holes and retreat or replace as needed
Tuck net under mattress properly
Available free at antenatal clinics and child health clinics

Indoor Residual Spraying (IRS):
Government programs spray walls inside homes — allow spray teams access

Intermittent Preventive Treatment in Pregnancy (IPTp):
Pregnant women receive malaria preventive medication at antenatal visits

Chemoprevention:
Seasonal Malaria Chemoprevention (SMC) in Sahel regions of Kenya
Ask your health worker if available

Mosquito Control:
Clear standing water around home (mosquitoes breed in stagnant water)
Keep grass and bushes trimmed
Close windows and doors early evening

REMEMBER: Any fever in a child under 5 years could be malaria. Test immediately. Treat quickly. Prevent with bed nets.`,
    keyPoints: [
      'Any fever in a child could be malaria — test immediately',
      'Severe malaria signs: convulsions, difficulty breathing, extreme weakness',
      'Complete the full 3-day treatment course even if child feels better',
      'Sleep under insecticide-treated bed nets every night',
      'Malaria can progress rapidly in children — do not delay seeking care',
    ],
    category: 'Condition Basics',
    condition: 'pediatric',
    literacyLevel: 'basic',
    readTimeMinutes: 8,
    tags: ['malaria', 'children', 'pediatric', 'fever', 'prevention'],
    icon: '🧒',
    references: ['Kenya MOH Malaria Guidelines', 'WHO Malaria Guidelines', 'KEMRI Malaria Research Programme', 'AMREF Malaria Prevention'],
  },
  {
    id: 'ped-malnutrition',
    title: 'Child Malnutrition — Recognizing and Treating Poor Nutrition',
    summary: 'Malnutrition weakens a child\'s body and brain. Learn how to spot the signs and what to do to help your child grow healthy.',
    content: `WHAT IS MALNUTRITION?
Malnutrition means a child is not getting enough of the right nutrients. It includes:
Under-nutrition: Not enough food or not enough variety
Micronutrient deficiencies: Lacking specific vitamins and minerals (iron, vitamin A, zinc)
Over-nutrition: Too much of the wrong foods (increasing in Kenya — leads to obesity)

Malnutrition affects a child's growth, brain development, immune system, and even future earning potential.

TYPES OF MALNUTRITION:

ACUTE MALNUTRITION (Wasting):
Child loses weight rapidly due to illness or lack of food
Measured by mid-upper arm circumference (MUAC) and weight-for-height
Severe Acute Malnutrition (SAM) — high risk of death without treatment

CHRONIC MALNUTRITION (Stunting):
Child is too short for their age due to long-term poor nutrition
Affects brain development permanently
One in four Kenyan children under 5 is stunted

UNDERWEIGHT:
Child weighs less than expected for their age
Combines acute and chronic malnutrition

MICRONUTRIENT DEFICIENCIES:
Iron deficiency: Anemia — pale, tired, weak
Vitamin A deficiency: Night blindness, weak immunity
Zinc deficiency: Poor growth, frequent infections
Iodine deficiency: Affects brain development

SIGNS OF MALNUTRITION IN CHILDREN:

WARNING SIGNS:
Child stops growing or growing slowly
Weight loss or no weight gain
Loss of muscle — especially in arms, buttocks, thighs
Swelling in feet, legs, or face (edema)
Visible ribs and bones
Pale skin, palms, inner eyelids (anemia)
Dull, thinning, or discolored hair
Sunken eyes
Lethargy — child is unusually tired, not playful
Frequent infections (diarrhea, pneumonia)

MEASURING MALNUTRITION:
MUAC tape: Measures arm circumference at midpoint of upper arm
Green (normal): Above 12.5cm in children under 5
Yellow (moderate): 11.5-12.5cm — needs supplementary feeding
Red (severe): Below 11.5cm — needs urgent treatment
MUAC tapes are available at health facilities — ask your health worker

TREATMENT:

MILD TO MODERATE MALNUTRITION:
Nutrition counseling — improve variety and frequency of feeding
Provide energy-dense, nutrient-rich foods
Treat underlying conditions (diarrhea, worms, malaria)
Follow-up at health facility every 1-2 weeks

SEVERE ACUTE MALNUTRITION (SAM):
Treatment at a health facility or outpatient program
Ready-to-Use Therapeutic Food (RUTF) — Plumpy'Nut, Plumpy'Sup
Treat complications (infections, dehydration)
Stabilize and then continue care at home
Follow-up until child reaches healthy weight

FEEDING YOUR CHILD — DAILY:

Birth to 6 months: Exclusive breastfeeding (no other food or water)
6-8 months: Continue breastfeeding + introduce soft, mashed foods 2-3 times daily
9-11 months: Family foods mashed or chopped + continue breastfeeding
12-23 months: Family foods 3-4 meals + 1-2 snacks + continue breastfeeding
After 2 years: 3 meals + 2 snacks daily

NUTRIENT-RICH FOODS FOR CHILDREN:
Protein: Eggs, fish, chicken, beans, lentils, groundnut paste
Carbohydrates: Ugali, rice, millet, sweet potato, bananas
Vegetables: Sukuma wiki, carrots, pumpkin, spinach
Fruits: Pawpaw, mango, orange, avocado — ripe and mashed
Fats: Oil, avocado — add small amount to every meal

VITAMIN SUPPLEMENTS:
Vitamin A: Every 6 months from 6 months to 5 years — available at health facilities
Iron: Starting at 6 months — drops or tablets
Zinc: During diarrhea episodes — shortens duration
Deworming: Every 6 months from 1 year

REMEMBER: A well-nourished child learns better, fights infections better, and grows into a healthier adult.`,
    keyPoints: [
      'Measure MUAC regularly — below 12.5cm (under 5s) needs attention',
      'Breastfeed exclusively for 6 months, then add varied foods',
      'Signs: Poor growth, weight loss, swelling, pale skin, lethargy',
      'Severe malnutrition needs urgent treatment — go to hospital',
      'Vitamin A every 6 months, deworming every 6 months prevents deficiency',
    ],
    category: 'Condition Basics',
    condition: 'pediatric',
    literacyLevel: 'basic',
    readTimeMinutes: 9,
    tags: ['malnutrition', 'children', 'pediatric', 'nutrition', 'growth'],
    icon: '🧒',
    references: ['WHO Malnutrition Guidelines', 'Kenya MOH Nutrition Guidelines', 'UNICEF Child Nutrition Report', 'KEMRI Nutrition Research'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // ONCOLOGY
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'onc-cervical-cancer',
    title: 'Cervical Cancer — Prevention, Screening, and Treatment',
    summary: 'Cervical cancer is the leading cause of cancer death among Kenyan women. It is almost entirely preventable with vaccination and screening.',
    content: `WHAT IS CERVICAL CANCER?
Cervical cancer starts in the cervix — the lower part of the uterus that connects to the vagina. Nearly all cervical cancers are caused by Human Papillomavirus (HPV), a very common sexually transmitted infection.

THE FACTS:
Cervical cancer is the 2nd most common cancer in Kenyan women (after breast cancer)
Over 5,000 Kenyan women are diagnosed each year
Over 3,000 die from it each year — that is about 9 women per day
It is the leading cause of cancer deaths among Kenyan women aged 15-44
NEARLY 100% PREVENTABLE with vaccination and screening

WHAT CAUSES IT?
HPV (Human Papillomavirus): A common virus spread through sexual contact
Most sexually active people get HPV at some point — usually the body clears it
High-risk HPV types (especially HPV 16 and 18) cause 70% of cervical cancers
Persistent infection over years leads to precancerous changes and eventually cancer
Risk factors: early sexual debut, multiple partners, smoking, weak immune system (HIV)

SYMPTOMS — OFTEN THERE ARE NONE IN EARLY STAGES:
Abnormal vaginal bleeding (between periods, after sex, after menopause)
Heavier or longer periods than usual
Unusual vaginal discharge (watery, pink, or foul-smelling)
Pain during sex
Pelvic pain
Later stages: Leg swelling, back pain, weight loss, fatigue

SCREENING SAVES LIVES:
Screening finds precancerous changes BEFORE they become cancer

HPV DNA Test (recommended first choice):
Samples cervical cells and tests for high-risk HPV types
Do every 5 years from age 30 (or earlier if living with HIV)
Can be self-collected — women can collect their own sample

Visual Inspection with Acetic Acid (VIA):
The cervix is painted with vinegar solution — abnormal areas turn white
Low-cost, immediate results
Available at many Kenyan health facilities
Can be followed by same-day treatment (cryotherapy) if needed

Pap Smear:
Samples cervical cells examined under microscope
Every 3 years if normal

TREATMENT:
Precancerous lesions: Cryotherapy (freezing), LEEP (loop excision), or cone biopsy
Early cancer: Surgery (hysterectomy or radical hysterectomy)
Advanced cancer: Radiation therapy + chemotherapy (available at Kenyatta, Moi, and other referral hospitals)

HPV VACCINATION — PREVENTION:
HPV vaccine prevents infection with the most common cancer-causing HPV types
Kenya introduced HPV vaccine in 2019
Given to girls aged 9-14 years (before sexual debut)
Two doses, 6 months apart
Available free through the Kenya National Immunization Program
Boys can also be vaccinated to reduce transmission

WARNING: HPV vaccine does not treat existing HPV infection or cervical cancer. It prevents new infections. All women still need screening even after vaccination.

IF YOU ARE DIAGNOSED WITH CERVICAL CANCER:
This is not a death sentence — early-stage cervical cancer is highly curable
Treatment options are available in Kenya
Multidisciplinary team: Gynecologic oncologist, radiation oncologist, medical oncologist
Support groups available — ask at your hospital
Palliative care available for advanced disease

CERVICAL CANCER AND HIV:
Women living with HIV have higher risk of HPV infection and cervical cancer
They should be screened starting at age 25 (5 years earlier than HIV-negative women)
Screen every 3 years if HIV-positive
Follow up promptly if any abnormalities found

REMEMBER: Cervical cancer is preventable. Get vaccinated. Get screened. Talk to your daughters.`,
    keyPoints: [
      'Cervical cancer is nearly 100% preventable with HPV vaccine + screening',
      'HPV vaccine is available free for girls aged 9-14 in Kenya',
      'Screen every 5 years (HPV test) or every 3 years (VIA/Pap) from age 30',
      'Early cervical cancer is highly treatable — do not delay if you have symptoms',
      'Women with HIV need earlier and more frequent screening',
    ],
    category: 'Prevention',
    condition: 'oncology',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['cervical cancer', 'HPV', 'cancer', 'screening', 'vaccination', 'women'],
    icon: '🩸',
    references: ['Kenya MOH National Cancer Control Strategy', 'WHO Cervical Cancer Guidelines', 'AMPATH Cervical Cancer Program', 'KEMRI Cancer Research'],
  },
  {
    id: 'onc-breast-awareness',
    title: 'Breast Cancer Awareness — Early Detection Saves Lives',
    summary: 'Breast cancer is the most common cancer in Kenyan women. When found early, it can be treated successfully. Know your breasts and know the signs.',
    content: `WHAT IS BREAST CANCER?
Breast cancer is a disease where cells in the breast grow out of control. It can start in different parts of the breast and can spread to other parts of the body if not caught early.

THE FACTS:
Breast cancer is the most common cancer among Kenyan women
About 4,000 new cases are diagnosed each year in Kenya
Most women diagnosed are between 40-55 years old
Men can also get breast cancer — about 1% of cases
When found early (localized), 5-year survival rate is over 90%
When found late (metastatic), survival drops to about 25%

SIGNS TO WATCH FOR — KNOW WHAT IS NORMAL FOR YOU:
A lump or thickening in the breast or armpit — most breast cancers present as a painless lump
Change in breast size or shape
Dimpling of the skin (looks like an orange peel)
Nipple changes: Inverted (turned inward), discharge (especially bloody), rash, or scaling
Redness or swelling of the breast
Pain in the breast or nipple that does not go away

WARNING: Most breast lumps are NOT cancer (80% are benign cysts or fibroadenomas). But ANY new lump should be checked by a doctor.

RISK FACTORS YOU CANNOT CHANGE:
Being a woman (main risk factor)
Increasing age (risk increases after 40)
Family history (first-degree relative — mother, sister, daughter — with breast cancer)
Certain genetic mutations (BRCA1, BRCA2)
Early menstruation (before 12) and late menopause (after 55)
Dense breast tissue

RISK FACTORS YOU CAN CHANGE:
Alcohol consumption (risk increases with alcohol intake)
Being overweight after menopause
Physical inactivity
Hormone replacement therapy (long-term use)
Not breastfeeding (breastfeeding reduces risk)

EARLY DETECTION METHODS:

BREAST SELF-AWARENESS:
Know how your breasts normally look and feel
Check monthly — a few days after your period ends (when breasts are least tender)
Look in the mirror — arms at sides, then raised overhead
Feel — use the pads of your fingers in circular motion covering entire breast and armpit
Report any changes to your doctor

CLINICAL BREAST EXAMINATION (CBE):
A health worker examines your breasts
Should be done yearly from age 40 (or earlier if you have symptoms or risk factors)
Available at most health facilities in Kenya

MAMMOGRAPHY:
X-ray of the breast — can find cancer before a lump can be felt
Recommended every 2 years for women aged 40-74
Available at major hospitals in Kenya (Kenyatta, Moi, Aga Khan, private centers)
Cost can be a barrier — some NGOs offer free screening

BREAST ULTRASOUND:
Used for women under 40 (denser breasts, mammogram less effective)
Also used to evaluate lumps found on exam or mammogram

WHAT IF YOU FIND A LUMP?
DO NOT PANIC — most lumps are not cancer
See a doctor within 2 weeks
The doctor will examine you and may order imaging (ultrasound or mammogram)
If suspicious, a biopsy (taking a small piece of tissue) will be done
Results take 1-2 weeks

TREATMENT OPTIONS (AVAILABLE IN KENYA):
Surgery: Lumpectomy (remove only the tumor) or mastectomy (remove whole breast)
Radiation therapy: High-energy beams kill cancer cells
Chemotherapy: Drugs that kill cancer cells throughout the body
Hormone therapy: For cancers that are hormone-receptor-positive
Targeted therapy: For specific types (like HER2-positive)
Surgery and radiation are available at referral hospitals in Kenya

REDUCING YOUR RISK:
Breastfeed your babies for at least 6 months
Exercise for 30 minutes most days
Maintain a healthy weight
Limit alcohol to less than 1 drink per day
Avoid long-term hormone replacement therapy
Know your family history and discuss with your doctor

SUPPORT FOR BREAST CANCER PATIENTS:
Support groups — Faraja Cancer Support Trust, Kenya Network of Cancer Organizations
Treatment is available at Kenyatta National Hospital, Moi Teaching and Referral Hospital, and other accredited centers
NHIF covers some cancer treatment costs
Palliative care services are available

REMEMBER: Early detection saves lives. Know your breasts. Get screened. Do not delay if you notice changes.`,
    keyPoints: [
      'Know your breasts — look and feel monthly, report changes to your doctor',
      'Most breast lumps are not cancer — but all new lumps need checking',
      'Mammogram every 2 years from age 40 (or earlier with risk factors)',
      'When caught early, breast cancer survival is over 90%',
      'Breastfeeding, exercise, healthy weight reduce your risk',
    ],
    category: 'Prevention',
    condition: 'oncology',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['breast cancer', 'cancer', 'women', 'screening', 'early detection'],
    icon: '🩸',
    references: ['Kenya MOH National Cancer Control Strategy 2023-2027', 'WHO Breast Cancer Guidelines', 'Faraja Cancer Support Trust Resources', 'KEMRI Breast Cancer Research'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEXUAL HEALTH
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'sh-family-planning',
    title: 'Family Planning — Choosing What Is Right for You',
    summary: 'Family planning helps you decide if and when to have children. Many safe and effective methods are available in Kenya — most are free at public facilities.',
    content: `WHAT IS FAMILY PLANNING?
Family planning means having the number of children you want, when you want them. It helps you:
Space your pregnancies (WHO recommends at least 2 years between births)
Prevent unintended pregnancies
Protect your health (younger than 18 or older than 40 have higher risk pregnancies)
Plan your future — education, career, finances

FAMILY PLANNING METHODS:

SHORT-ACTING METHODS:

CONDOMS (Male and Female):
Effectiveness: 99% with perfect use, 85% with typical use
How it works: Physical barrier preventing sperm from reaching egg
Duration: Each use
Pros: Also prevents STIs, no hormones, no prescription needed
Cons: Must use correctly every time
Where to get: Free at health facilities, low cost at pharmacies

ORAL CONTRACEPTIVE PILLS:
Effectiveness: 99% with perfect use, 91% with typical use
How it works: Hormones prevent ovulation
Duration: Monthly
Pros: Very effective, regulates periods, reduces cramps
Cons: Must take daily at same time, does not prevent STIs
Where to get: Prescription at health facilities

LONG-ACTING METHODS:

INJECTABLES (Depo-Provera, Sayana Press):
Effectiveness: 99%
How it works: Progestin injection prevents ovulation
Duration: 2-3 months per injection
Pros: Private, only need injection every 2-3 months
Cons: Delayed return to fertility (up to 10 months), may cause weight gain and irregular bleeding
Where to get: Health facilities, community health workers

IMPLANTS (Implanon, Jadelle):
Effectiveness: 99.9%
How it works: Small rods placed under skin of upper arm release hormones
Duration: 3-5 years (depending on type)
Pros: Long-lasting, very effective, reversible
Cons: Irregular bleeding common, must be inserted/removed by trained provider
Where to get: Health facilities, free at public clinics

INTRAUTERINE CONTRACEPTIVE DEVICES (IUDs):
Copper IUD: 99.4% effective, lasts up to 12 years
Hormonal IUD: 99.8% effective, lasts up to 5 years
How it works: Device placed in uterus by doctor/nurse
Pros: Very long-lasting, set-and-forget, immediate return to fertility after removal
Cons: Insertion can be uncomfortable, may cause heavier periods (copper) or lighter (hormonal)
Where to get: Insertion at health facilities by trained provider

PERMANENT METHODS:

FEMALE STERILIZATION (Tubal Ligation):
Effectiveness: 99.5%
How it works: Tubes tied/blocked to prevent egg from reaching sperm
Pros: Permanent, no hormones, one-time procedure
Cons: Surgical procedure, very difficult to reverse
Where to get: Hospitals with surgical capacity

MALE STERILIZATION (Vasectomy):
Effectiveness: 99.9%
How it works: Tubes carrying sperm are cut/blocked
Pros: Permanent, simpler than female sterilization, one-time procedure
Cons: Surgical procedure, very difficult to reverse
Where to get: Hospitals

NATURAL METHODS:

LACTATIONAL AMENORRHEA METHOD (LAM):
Effectiveness: 98% if strict conditions met
Conditions: Baby under 6 months, exclusive breastfeeding, no periods yet
Duration: Up to 6 months after birth
Pros: No cost, no hormones
Cons: Only works for short time, must meet all conditions

EMERGENCY CONTRACEPTION (Morning-After Pill):
Take within 72 hours (up to 120 hours) of unprotected sex
Effectiveness: 85-95% depending on timing
Available at pharmacies, no prescription needed
Should NOT be used as regular contraception

CHOOSING A METHOD:
Consider: How long do you want to wait before next pregnancy?
Consider: Do you need STI protection? (condoms only)
Consider: Can you remember to take a pill daily?
Consider: Are you comfortable with a device inside you?
Consider: Do you want a permanent solution?
Consider: What does your partner prefer?

FAMILY PLANNING IN KENYA:
Most methods available free at public health facilities
Trained community health workers can provide information and some methods
Adolescents have the right to family planning services confidentially
Partners should discuss and decide together — but your health choices are yours

REMEMBER: The best method is the one you will use consistently and correctly.`,
    keyPoints: [
      'Family planning helps you choose if and when to have children',
      'Many methods available: pills, injectables, implants, IUDs, condoms, sterilization',
      'Most methods are free at public health facilities in Kenya',
      'Condoms are the only method that also prevents STIs',
      'The best method is the one you will use consistently and correctly',
    ],
    category: 'Prevention',
    condition: 'sexual-health',
    literacyLevel: 'basic',
    readTimeMinutes: 9,
    tags: ['family planning', 'contraception', 'sexual health', 'women', 'birth control'],
    icon: '🌍',
    references: ['Kenya MOH Family Planning Guidelines', 'WHO Family Planning Handbook', 'UNFPA Kenya Family Planning Report'],
  },
  {
    id: 'sh-stis',
    title: 'Sexually Transmitted Infections — Recognition, Treatment, and Prevention',
    summary: 'STIs are common and can cause serious health problems if untreated. Most are curable. Learn the signs and how to protect yourself.',
    content: `WHAT ARE STIs?
Sexually Transmitted Infections (STIs) are infections passed from one person to another through sexual contact (vaginal, anal, or oral). They are very common — millions of new infections occur every year in Kenya.

WHY STIs MATTER:
Many STIs have no symptoms — you can have one without knowing
Untreated STIs can cause serious complications: infertility, chronic pain, pregnancy problems
Some STIs increase the risk of getting or transmitting HIV
STIs are preventable and most are curable

COMMON STIs:

1. CHLAMYDIA (Bacterial — Curable)
Often NO symptoms
Symptoms if present: Abnormal discharge, pain when urinating, lower abdominal pain
Complications: Pelvic inflammatory disease (PID), infertility (both men and women)
Treatment: Antibiotics (doxycycline or azithromycin) — treat both partners

2. GONORRHEA (Bacterial — Curable)
Often NO symptoms
Symptoms: Yellow/green discharge, painful urination
Complications: PID, infertility, joint infections
Treatment: Antibiotics (ceftriaxone injection + azithromycin) — antibiotic resistance is growing

3. SYPHILIS (Bacterial — Curable)
First stage: Painless sore (chancre) at infection site — heals on its own (deceptive!)
Second stage: Rash, fever, swollen lymph nodes — also resolves
Late stage (years later): Brain, heart, nerve damage — permanent
Complications: Can pass to baby during pregnancy — causes stillbirth or severe birth defects
Treatment: Penicillin injection — very effective in early stages

4. TRICHOMONIASIS (Parasitic — Curable)
Symptoms: Frothy, yellow-green vaginal discharge with strong odor; itching; pain during urination
Many people have no symptoms
Treatment: Metronidazole or tinidazole (single dose)

5. HERPES (Viral — No Cure, But Manageable)
Symptoms: Painful blisters/sores on genitals or mouth, flu-like symptoms during first outbreak
Virus stays in body forever — outbreaks come and go
Treatment: Antiviral medication (acyclovir) reduces outbreak frequency and severity
Condoms reduce but do not fully prevent transmission

6. HPV / GENITAL WARTS (Viral — No Cure, But Manageable)
Warts: Flesh-colored bumps on genitals — can be treated (removed)
High-risk HPV: Can cause cervical cancer — preventable with vaccine
HPV vaccine prevents the most dangerous types

7. HIV (Viral — No Cure, But Manageable)
See the HIV education article for details
Prevention: Condoms, PrEP, U=U
Treatment: ART — keeps virus undetectable

8. HEPATITIS B (Viral — Preventable with Vaccine)
Symptoms: Jaundice, fatigue, dark urine, abdominal pain
Can become chronic (long-term) — leads to liver damage and cancer
Prevention: Vaccine (part of Kenya's routine immunization)
Treatment: Antiviral medication for chronic cases

WHEN TO GET TESTED:
After unprotected sex with a new partner
If you have symptoms (discharge, sores, pain)
If your partner has symptoms or an STI
During pregnancy (all pregnant women should be tested for syphilis and HIV)
Routinely as part of sexual health check-ups

WHERE TO GET TESTED IN KENYA:
Public health facilities — most STI testing and treatment is free or low cost
HIV testing is free at all public facilities
VCT (Voluntary Counseling and Testing) centers
Private clinics and hospitals
Some pharmacies offer STI testing

TREATMENT:
Bacterial STIs (chlamydia, gonorrhea, syphilis): Antibiotics — make sure both partners are treated
Viral STIs (herpes, HPV, HIV): Antiviral medications
DO NOT treat yourself — wrong treatment can make things worse
Complete the full course of antibiotics even if symptoms go away
Do not have sex until treatment is complete and symptoms have resolved

PREVENTION:
Consistent and correct condom use — the ONLY method that prevents STIs
Limit number of sexual partners
Mutual monogamy with a partner who has been tested
Communicate with your partner about STI testing
Get vaccinated for HPV and Hepatitis B
Regular STI testing if you have multiple partners

TALKING TO YOUR PARTNER ABOUT STIs:
It can be awkward — but it is necessary for both your health
Choose a good time and place — private, calm
Be direct: "I care about both of us — let's get tested together"
If you have an STI: "I found out I have an STI. It is treatable. I want to make sure you are okay too."
STIs are medical conditions — not judgments of character

MYTHS ABOUT STIs:
Myth: You can get an STI from toilet seats → Fact: Not possible
Myth: Only promiscuous people get STIs → Fact: One sexual encounter is enough
Myth: You can tell if someone has an STI → Fact: Most have no visible signs
Myth: Douching prevents STIs → Fact: Douching can make things worse
Myth: STIs go away on their own → Fact: Some do temporarily, but complications continue

REMEMBER: STIs are common. They are treatable. They are nothing to be ashamed of. Get tested, get treated, and protect yourself and your partners.`,
    keyPoints: [
      'Many STIs have no symptoms — get tested after unprotected sex',
      'Most bacterial STIs (chlamydia, gonorrhea, syphilis) are curable with antibiotics',
      'Viral STIs (herpes, HIV, HPV) are manageable with medication',
      'Condoms are the most effective way to prevent STIs',
      'STIs are medical conditions — no shame in testing and treatment',
    ],
    category: 'Prevention',
    condition: 'sexual-health',
    literacyLevel: 'intermediate',
    readTimeMinutes: 10,
    tags: ['STI', 'STD', 'sexual health', 'condoms', 'testing'],
    icon: '🌍',
    references: ['Kenya MOH STI Guidelines', 'WHO STI Prevention Guidelines', 'NASCOP STI Management Guidelines', 'KEMRI STI Research'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // IMMUNIZATION
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'imm-childhood',
    title: 'Childhood Immunization — Vaccines Save Lives',
    summary: 'Vaccines protect your child from dangerous diseases. Kenya offers free vaccines for all children. Learn what vaccines your child needs and when.',
    content: `WHY VACCINES MATTER:
Vaccines are one of the greatest achievements in medicine. They prevent 2-3 million deaths worldwide every year. Vaccines train your child's immune system to fight diseases without getting sick first. They protect not just your child but also the community (herd immunity).

HOW VACCINES WORK:
A vaccine contains a harmless version of a germ (killed or weakened)
Your child's immune system recognizes it and produces antibodies
If your child later meets the real germ, the immune system remembers and fights it off immediately
Your child does NOT get the disease from the vaccine

KENYA'S ROUTINE IMMUNIZATION SCHEDULE (FREE AT ALL PUBLIC FACILITIES):

AT BIRTH:
BCG — Protects against tuberculosis (TB) — given in left upper arm
Polio (OPV0) — Oral polio vaccine — drops in mouth

6 WEEKS:
Polio (OPV1) — oral drops
Pentavalent 1 — protects against 5 diseases: Diphtheria, Tetanus, Pertussis (whooping cough), Hepatitis B, Haemophilus influenzae type b (HiB) — injection
Pneumococcal (PCV 1) — protects against pneumonia, meningitis, ear infections — injection
Rotavirus 1 — protects against severe diarrhea — oral drops

10 WEEKS:
Polio (OPV2) — oral drops
Pentavalent 2 — injection
Pneumococcal (PCV 2) — injection
Rotavirus 2 — oral drops

14 WEEKS:
Polio (OPV3) — oral drops
Pentavalent 3 — injection
Pneumococcal (PCV 3) — injection
IPV (Inactivated Polio Vaccine) — injection

6 MONTHS:
Measles 1 + Rubella (MR 1) — injection
Yellow Fever — in endemic areas — injection

9 MONTHS:
Measles 2 + Rubella (MR 2) — injection

18 MONTHS:
DTP Booster — Diphtheria, Tetanus, Pertussis — injection
Measles + Rubella booster

ADDITIONAL VACCINES:

HPV Vaccine: For girls aged 9-14 years — 2 doses, 6 months apart — prevents cervical cancer
Tetanus Toxoid (TT): For pregnant women — 2 doses during pregnancy, protects mother and newborn
COVID-19 Vaccine: For children 12+ years and adults
Typhoid Vaccine: Recommended for high-risk areas
Hepatitis A Vaccine: Not routine but available
Cholera Vaccine: In outbreak areas

SIDE EFFECTS — NORMAL AND EXPECTED:
Mild fever (give paracetamol if uncomfortable)
Soreness, redness, swelling at injection site
Fussiness or sleepiness for 1-2 days
Loss of appetite briefly
These are SIGNS that the vaccine is working (immune response)

WHEN TO SEEK MEDICAL ATTENTION AFTER VACCINATION:
High fever (above 39°C) that does not come down with medication
Persistent crying for more than 3 hours
Seizures (very rare)
Severe allergic reaction (difficulty breathing, swelling of face) — extremely rare

FREQUENT CONCERNS:

"Is it safe to give multiple vaccines at once?" Yes, it is safe and well-studied. The immune system can handle them.

"Do vaccines cause autism?" NO. This has been thoroughly studied and disproven. The original study claiming a link was fraudulent and retracted.

"My child does not need vaccines because these diseases are rare." These diseases are rare BECAUSE of vaccines. If vaccination rates drop, they come back.

"Is natural immunity better than vaccine immunity?" Natural immunity is stronger but comes at the cost of suffering the disease — which can be severe and even fatal.

VACCINE STORAGE AND HANDLING:
Vaccines must be kept cold (2-8°C) — health workers use cold boxes and fridges
If vaccines are left in the sun or without ice packs, they lose potency
Always tell your health worker if you suspect vaccines were stored improperly

VIRTUAL REMINDERS:
Keep your child's vaccination card in a safe place
Bring it to every visit — the health worker records every vaccine
Set reminders for the next appointment
If you miss an appointment, go as soon as possible — the schedule can be adjusted
Your child can still catch up even if they are behind

REMEMBER: Vaccines are one of the safest, most effective ways to protect your child's health. Every vaccine on Kenya's schedule is recommended by the WHO and the Ministry of Health.`,
    keyPoints: [
      'Kenya offers all routine vaccines FREE at public health facilities',
      'Follow the schedule: BCG, Polio, Pentavalent, PCV, Rotavirus at birth to 14 weeks',
      'Measles + Rubella at 6 and 9 months; HPV for girls 9-14 years',
      'Vaccines are safe — side effects are mild and temporary',
      'Keep your child\'s vaccination card and bring it to every visit',
    ],
    category: 'Prevention',
    condition: 'immunization',
    literacyLevel: 'basic',
    readTimeMinutes: 9,
    tags: ['immunization', 'vaccines', 'children', 'prevention', 'pediatric'],
    icon: '💉',
    references: ['Kenya MOH National Immunization Guidelines', 'WHO Immunization Fact Sheet', 'UNICEF Kenya Immunization Report', 'KEMRI Vaccine Research'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // TUBERCULOSIS (TB)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'tb-understanding',
    title: 'Understanding Tuberculosis (TB) — It Is Curable',
    summary: 'TB is a serious but curable infection. With proper treatment, almost everyone recovers fully. Learn the signs and how treatment works.',
    content: `WHAT IS TB?
Tuberculosis (TB) is a bacterial infection caused by Mycobacterium tuberculosis. It usually affects the lungs (pulmonary TB) but can affect other parts of the body (extrapulmonary TB). TB is one of the top 10 causes of death in Kenya.

HOW TB SPREADS:
Through the air when a person with active TB coughs, sneezes, or talks
You need prolonged close contact to catch it (living in same house, working closely)
TB is NOT spread through: Handshakes, sharing food or utensils, toilet seats, sharing toothbrush
Only people with ACTIVE TB in the lungs are contagious

LATENT TB VS ACTIVE TB:
Latent TB: The bacteria are in your body but inactive — you have NO symptoms and you are NOT contagious
About 1 in 4 people worldwide have latent TB
Active TB: The bacteria are multiplying and causing symptoms — this is when you can spread it
Without treatment, 5-10% of people with latent TB will develop active TB

SIGNS AND SYMPTOMS OF ACTIVE TB:
Cough lasting more than 2 weeks (the most common symptom)
Coughing up phlegm or blood
Chest pain
Fever and chills
Night sweats (waking up drenched)
Unexplained weight loss
Loss of appetite
Fatigue — feeling tired all the time
Shortness of breath (with advanced disease)

DIAGNOSIS:
If you have coughed for more than 2 weeks — go to a health facility for TB testing
Sputum test: Cough up phlegm from deep in your lungs, examined under microscope or by GeneXpert machine
GeneXpert test: More accurate, detects TB and drug resistance — results in 2 hours
Chest X-ray: Shows lung damage from TB
In Kenya, TB testing is FREE at public health facilities

TREATMENT — TB IS CURABLE:

Standard treatment (drug-sensitive TB):
First 2 months: 4 drugs daily (isoniazid, rifampicin, pyrazinamide, ethambutol)
Next 4 months: 2 drugs daily (isoniazid, rifampicin)
Total: 6 months of treatment
Medications are taken under Directly Observed Therapy (DOT) — a health worker watches you take your medication

Drug-resistant TB (MDR-TB):
TB that does not respond to standard medications
Treatment is longer (9-20 months) with different drugs
More side effects but still curable
Specialized treatment centers manage MDR-TB

IMPORTANT RULES FOR TB TREATMENT:
Take EVERY dose — missing doses leads to drug resistance
Complete the FULL course — even when you feel better (TB takes months to fully kill)
Do NOT stop early — even if symptoms are gone, the bacteria may still be alive
Alcohol and TB medications do not mix — avoid alcohol entirely during treatment

SIDE EFFECTS OF TB MEDICATIONS — WATCH FOR THESE:
Rifampicin: Turns urine, sweat, and tears orange (harmless — expected)
Isoniazid: Numbness or tingling in hands/feet — take vitamin B6 (pyridoxine) to prevent
Rifampicin: May make birth control pills less effective — use extra contraception
All medications: Nausea, vomiting, rash, jaundice (yellow eyes/skin) — tell your doctor

LIVING WITH TB:
You will need to take medications for 6 months or longer
You are contagious for the first 2 weeks of treatment — stay home, cover your mouth when coughing
After 2 weeks of treatment, most people are no longer contagious
Eat well — TB drains your energy, good food helps recovery
Rest when you need to — your body is fighting a serious infection

TB AND HIV:
HIV and TB are linked — HIV weakens the immune system, making TB more likely
All people with TB should be tested for HIV
All people with HIV should be screened for TB
If you have both HIV and TB, treatment for both can work together — tell your doctor about all medications

TB PREVENTION:
BCG vaccine: Given at birth in Kenya — prevents severe TB in children
Infection control: Cover mouth when coughing, open windows for ventilation
Preventive therapy for latent TB: Isoniazid preventive therapy (IPT) for people with HIV and close contacts of TB patients
Testing family members: If you have active TB, your family should also be tested

TB IN KENYA:
Kenya has a high TB burden — about 140,000 cases per year
TB treatment is FREE at all public health facilities
Community health workers support TB patients in their homes
Kenya National TB Program (NTLD) coordinates TB services

REMEMBER: TB is curable. Complete your treatment. Protect your family.`,
    keyPoints: [
      'Cough lasting more than 2 weeks = get tested for TB (free at public facilities)',
      'TB is curable with 6 months of medication — take every dose',
      'You are contagious for first 2 weeks of treatment — cover your mouth, stay home',
      'Drug-resistant TB is harder to treat but still curable with longer therapy',
      'TB and HIV are closely linked — get tested for both',
    ],
    category: 'Condition Basics',
    condition: 'tb',
    literacyLevel: 'basic',
    readTimeMinutes: 9,
    tags: ['TB', 'tuberculosis', 'cough', 'infection', 'respiratory'],
    icon: '🫁',
    references: ['Kenya MOH National TB Guidelines', 'WHO TB Fact Sheet', 'KEMRI TB Research', 'NTLD Kenya TB Report'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SICKLE CELL
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'sc-understanding',
    title: 'Understanding Sickle Cell Disease — Living Well with SCD',
    summary: 'Sickle cell disease is a genetic blood disorder common in Kenya. With proper care, people with SCD can live full, productive lives.',
    content: `WHAT IS SICKLE CELL DISEASE?
Sickle cell disease (SCD) is a genetic blood disorder that affects hemoglobin — the protein in red blood cells that carries oxygen throughout the body. Normal red blood cells are round and flexible. In SCD, red blood cells become sickle-shaped (like a crescent moon), stiff, and sticky.

WHAT HAPPENS IN SCD?
Sickle cells die early (10-20 days vs 120 days for normal cells) — causing chronic anemia
Sickle cells get stuck in blood vessels — blocking blood flow and causing severe pain (crises)
Blocked blood flow can damage organs over time

Sickle cell disease is most common in areas where malaria is or was endemic — because carrying one copy of the sickle cell gene (sickle cell trait) provides some protection against severe malaria.

HOW IS IT INHERITED?
Sickle cell disease is passed from parents to children through genes:
If both parents have sickle cell trait (carriers), each child has:
25% chance of having SCD (two sickle genes)
50% chance of having sickle cell trait (one sickle gene, one normal)
25% chance of having normal hemoglobin (no sickle gene)
If one parent has SCD and the other has normal hemoglobin, all children will have sickle cell trait
Testing for sickle cell trait is available — ask about genetic counseling

SICKLE CELL IN KENYA:
About 1 in 20 Kenyans has sickle cell trait (carrier)
About 14,000 children are born with SCD each year in Kenya
SCD is more common in western Kenya and coastal regions
Newborn screening is available in some hospitals — early diagnosis saves lives

SYMPTOMS:

PAIN CRISES (Vaso-Occlusive Crises):
Sudden severe pain in any part of the body — bones, chest, abdomen, back
Pain comes in waves — can last hours to days
Triggered by: Cold, dehydration, infection, stress, high altitude, lack of oxygen

CHRONIC ANEMIA:
Fatigue, weakness, pale skin
Shortness of breath
Dizziness, rapid heartbeat
Jaundice (yellow eyes and skin) — from breakdown of red blood cells

OTHER COMPLICATIONS:
Acute chest syndrome: Chest pain, fever, cough, difficulty breathing — MEDICAL EMERGENCY
Stroke: Sudden weakness, difficulty speaking, seizures
Splenic sequestration: Sudden enlargement of spleen with severe anemia — EMERGENCY
Infections: SCD weakens the spleen, increasing infection risk
Delayed growth and puberty
Priapism: Painful prolonged erection — needs emergency treatment
Eye problems: Vision loss from blocked blood vessels
Kidney damage
Leg ulcers

TREATMENT AND MANAGEMENT:

HYDROXYUREA:
The most important medication for SCD — reduces pain crises by 50-70%
Also reduces need for blood transfusions
Take daily — dose adjusted by weight and blood counts
Available at some Kenyan hospitals

PAIN MANAGEMENT:
Mild pain: Paracetamol, ibuprofen (if kidneys are normal)
Moderate pain: Codeine or similar
Severe pain: Hospital treatment with stronger pain medication
DO NOT wait too long to get help for severe pain

BLOOD TRANSFUSIONS:
Given for severe anemia, acute chest syndrome, stroke, or before surgery
Regular transfusions for some patients
Risks: Iron overload, infections, antibody formation

ANTIBIOTICS:
Daily penicillin (from 2 months to 5 years) prevents life-threatening infections
Pneumococcal and flu vaccines are essential

FOLIC ACID:
Daily folic acid supplements help produce new red blood cells

HYDRATION:
Drink plenty of water — dehydration triggers pain crises
In hot weather, increase fluid intake
During illness, increase fluids

AVOID TRIGGERS:
Extreme cold or heat
Dehydration
High altitude (flying in unpressurized planes, mountain climbing)
Smoking and alcohol
Excessive physical exhaustion
Infections — get vaccinated and treat infections promptly

WHEN TO GO TO HOSPITAL — EMERGENCIES:
Fever above 38.5°C — infections can be severe
Severe pain that does not respond to home treatment
Chest pain or difficulty breathing
Sudden weakness, difficulty speaking, or confusion
Priapism (prolonged erection lasting more than 4 hours)
Severe headache
Enlarged abdomen with worsening anemia
Pale lips and fingernails with extreme fatigue

LIVING WELL WITH SCD:
Take medications daily (hydroxyurea, folic acid, penicillin if under 5)
Drink 8-10 glasses of water daily
Avoid extreme temperatures
Get all recommended vaccinations
Attend regular clinic appointments (every 3-6 months)
Stay active but rest when tired
Join a support group — SCD can be isolating, connecting with others helps
Plan for emergencies — know nearest hospital, keep emergency contacts ready

SCREENING AND GENETIC COUNSELING:
Newborn screening: Early diagnosis saves lives — ask about screening at your hospital
Prenatal screening: Available at some hospitals to check if fetus has SCD
Carrier testing: Adults can be tested to know their carrier status
Genetic counseling: Helps couples understand their risk of having a child with SCD

HOPE FOR THE FUTURE:
Bone marrow transplant (stem cell transplant) can cure SCD — available at some Kenyan hospitals (expensive, limited availability)
Gene therapy is being developed — offers hope for a cure in the future
Better medications are being tested
Early diagnosis and better care mean people with SCD are living longer, healthier lives than ever before

REMEMBER: Sickle cell disease is a challenging condition, but with proper medical care, hydration, and avoiding triggers, people with SCD can achieve their goals and live fulfilling lives.`,
    keyPoints: [
      'SCD is a genetic blood disorder causing sickle-shaped red blood cells, pain crises, and anemia',
      'Hydroxyurea reduces pain crises by 50-70% — the most important medication',
      'Drink plenty of water, avoid cold/heat extremes, and get vaccinated',
      'Symptoms requiring emergency care: fever, severe pain, chest pain, stroke signs',
      'Newborn screening, genetic counseling available — ask at your hospital',
    ],
    category: 'Condition Basics',
    condition: 'sickle-cell',
    literacyLevel: 'intermediate',
    readTimeMinutes: 10,
    tags: ['sickle cell', 'SCD', 'genetic', 'anemia', 'blood disorder'],
    icon: '🩸',
    references: ['Kenya MOH Sickle Cell Guidelines', 'WHO Sickle Cell Disease Guidelines', 'KEMRI Sickle Cell Program', 'AMPATH Sickle Cell Care'],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // RESPIRATORY — ADDITIONAL
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'resp-pneumonia',
    title: 'Pneumonia — A Serious Lung Infection You Can Prevent and Treat',
    summary: 'Pneumonia is a leading cause of death in children worldwide and a serious threat to older adults. Learn how to recognize it and get treatment fast.',
    content: `WHAT IS PNEUMONIA?
Pneumonia is an infection that inflames the air sacs in one or both lungs. The air sacs fill with fluid or pus, causing cough with phlegm, fever, chills, and difficulty breathing. Pneumonia can be caused by bacteria, viruses, or fungi.

Pneumonia is the single largest infectious cause of death in children worldwide. In Kenya, it kills more children under 5 than any other disease.

WHO IS MOST AT RISK?
Children under 5 years (especially under 2)
Adults over 65 years
People with chronic diseases (HIV, diabetes, heart disease, kidney disease)
Smokers
People with weakened immune systems
People with chronic lung disease (COPD, asthma)
People who are malnourished

SIGNS AND SYMPTOMS:

IN ADULTS:
Cough — may produce green, yellow, or bloody phlegm
Fever, shaking chills
Shortness of breath
Chest pain when breathing deeply or coughing (pleuritic pain)
Rapid breathing
Fatigue
Confusion (especially in older adults)
Nausea, vomiting, diarrhea

IN CHILDREN:
Fast or difficult breathing — chest draws in (chest indrawing)
Fever
Cough
Not feeding or drinking well
Lethargy — unusually sleepy or difficult to wake
Wheezing or grunting sounds
Vomiting
Blue lips or fingernails (severe — oxygen deficiency)

DANGER SIGNS IN CHILDREN — GO TO HOSPITAL IMMEDIATELY:
Chest indrawing (chest pulls in when breathing)
Stridor (noisy breathing when inhaling)
Not able to drink or breastfeed
Lethargic or unconscious
Convulsions
Central cyanosis (blue tongue or lips)
Severe malnutrition + pneumonia

DIAGNOSIS:
Doctor listens to lungs with stethoscope (crackling sounds)
Chest X-ray confirms pneumonia and shows severity
Blood tests check for infection and oxygen levels
Sputum test identifies the specific germ causing pneumonia

TREATMENT:
Bacterial pneumonia: Antibiotics — oral or intravenous depending on severity
Viral pneumonia: Supportive care — rest, fluids, fever control (antiviral medication for some viruses like influenza)
Severe pneumonia: Hospital admission for oxygen, IV antibiotics, close monitoring

Most people improve within 1-3 weeks with proper treatment.

WHEN TO GO TO HOSPITAL:
Difficulty breathing or chest pain
High fever that does not come down
Confusion
Vomiting — cannot keep medication or fluids down
Bluish lips or fingernails
Symptoms are getting worse despite treatment
Infection in a child under 3 months

PREVENTION:

VACCINATION:
Pneumococcal conjugate vaccine (PCV) — part of Kenya's routine child immunization at 6, 10, and 14 weeks
Pneumococcal polysaccharide vaccine (PPSV23) — for adults over 65 and people with chronic conditions
Flu vaccine — reduces risk of viral pneumonia — recommended yearly
Haemophilus influenzae type b (HiB) vaccine — part of pentavalent vaccine
COVID-19 vaccine — prevents COVID-19 pneumonia
Measles vaccine — measles can cause pneumonia

LIFESTYLE:
Do not smoke — smoking damages lung defenses
Breastfeed for the first 6 months — breast milk contains antibodies
Good nutrition — strengthens immune system
Wash hands regularly with soap and water
Cover coughs and sneezes
Avoid close contact with people who are sick
Keep living spaces well ventilated

TREAT PNEUMONIA IN HIV:
People with HIV are at much higher risk of pneumonia
Daily cotrimoxazole preventive therapy for people with HIV prevents pneumocystis pneumonia
Get tested for HIV if you have recurrent pneumonia
Early ART treatment reduces pneumonia risk

REMEMBER: Pneumonia is preventable, treatable, and if caught early, most people recover fully. Vaccination is the single most effective prevention.`,
    keyPoints: [
      'Pneumonia causes cough, fever, difficulty breathing — can be fatal if untreated',
      'Children under 5 and adults over 65 are at highest risk',
      'PCV vaccine (part of routine Kenya immunization) prevents the most common cause',
      'Go to hospital if: difficulty breathing, chest pain, confusion, high fever',
      'Most pneumonia is treatable with antibiotics if caught early',
    ],
    category: 'Condition Basics',
    condition: 'respiratory',
    literacyLevel: 'basic',
    readTimeMinutes: 8,
    tags: ['pneumonia', 'respiratory', 'infection', 'lung', 'children'],
    icon: '🫁',
    references: ['Kenya MOH Pneumonia Guidelines', 'WHO Pneumonia Fact Sheet', 'UNICEF Pneumonia Report', 'KEMRI Pneumonia Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — Heart Failure
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'cv-heart-failure',
    title: 'Heart Failure — Managing a Weak Heart',
    summary: 'Heart failure means your heart does not pump blood as well as it should. With proper treatment and lifestyle changes, you can live well for many years.',
    content: 'WHAT IS HEART FAILURE?\nHeart failure does NOT mean your heart has stopped or is about to stop. It means your heart muscle is too weak or stiff to pump blood effectively. Blood backs up in the lungs and body, causing fluid buildup (congestion). About 1 in 5 Kenyans over 40 may have some form of heart failure, especially those with high blood pressure.\n\nWHY DOES IT HAPPEN?\nThe most common causes of heart failure in Kenya are:\n• High blood pressure (hypertension) — the leading cause, as long-standing high BP forces the heart to work harder\n• Coronary artery disease — narrowed arteries reduce blood supply to heart muscle\n• Previous heart attack — damages heart muscle permanently\n• Diabetes — increases risk of heart disease\n• Heart valve problems — common after rheumatic fever\n• Alcohol abuse — can weaken heart muscle directly\n• Some viral infections — can inflame heart muscle\n\nWHAT ARE THE SYMPTOMS?\nCommon symptoms of heart failure:\n• Shortness of breath — especially during activity or when lying flat\n• Waking up at night gasping for air (paroxysmal nocturnal dyspnea)\n• Fatigue and weakness — feeling tired all the time\n• Swelling (edema) in feet, ankles, legs, or abdomen\n• Rapid or irregular heartbeat\n• Persistent cough or wheezing with white or pink frothy phlegm\n• Sudden weight gain (2-3 kg in a few days) from fluid retention\n• Loss of appetite, nausea\n• Difficulty concentrating or confusion\n\nHOW IS IT DIAGNOSED?\nYour doctor will take a history, listen to your heart and lungs, and may order:\n• Echocardiogram (heart ultrasound) — the key test, shows how well your heart pumps (ejection fraction)\n• Chest X-ray — checks for fluid in lungs and heart size\n• ECG — checks heart rhythm and heart attack evidence\n• Blood tests — including BNP (a hormone that rises in heart failure)\n• Six-minute walk test — measures exercise capacity\n\nHOW IS IT TREATED?\nHeart failure treatment has four main pillars:\n1. ACE inhibitors or ARBs — relax blood vessels, reduce workload on heart\n2. Beta-blockers — slow heart rate, protect heart muscle\n3. Diuretics (water pills like furosemide) — remove excess fluid, reduce swelling and breathlessness\n4. Mineralocorticoid receptor antagonists (spironolactone) — block harmful hormones\n\nAdditional treatments: SGLT2 inhibitors (dapagliflozin), hydralazine + nitrates (especially effective in people of African descent), and in severe cases, implanted devices (pacemakers, defibrillators).\n\nWHAT CAN I DO?\n• Take medications every day — never miss a dose\n• Weigh yourself daily — report gain of 2+ kg in a week to your doctor\n• Limit salt to less than 1 teaspoon per day — salt causes fluid retention\n• Limit fluids if your doctor advises (usually 1.5-2 litres per day)\n• Stay active — gentle walking as tolerated, but rest when needed\n• Elevate your legs when sitting to reduce swelling\n• Quit smoking and limit alcohol\n• Get vaccinated against flu and pneumonia\n\nWHEN TO SEE A DOCTOR?\nGo to hospital immediately if you have:\n• Sudden severe shortness of breath\n• Chest pain\n• Rapid weight gain (2+ kg in 2-3 days)\n• Fainting or near-fainting\n• Coughing up pink frothy phlegm\n• Confusion or extreme drowsiness\n\nKEY POINTS TO REMEMBER:\nHeart failure is a serious but manageable condition. With daily medications, salt restriction, and regular check-ups, many people live active, fulfilling lives. Work closely with your healthcare team and report changes early. In Kenya, heart failure clinics at Kenyatta and Moi Referral Hospitals provide specialized care.',
    keyPoints: [
      'Heart failure means the heart pumps weakly — it can be managed with daily medications',
      'Salt restriction is critical — limit to less than 1 teaspoon daily',
      'Weigh yourself every morning and report rapid gain (2kg+ per week)',
      'Take all medications daily — ACE inhibitors, beta-blockers, diuretics',
      'Seek emergency care for severe breathlessness, chest pain, or confusion',
    ],
    category: 'Condition Basics',
    condition: 'cardiovascular',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['heart failure', 'cardiovascular', 'CHF', 'fluid retention', 'shortness of breath'],
    icon: '❤️',
    references: ['Kenya MOH Cardiovascular Disease Guidelines', 'WHO Heart Failure Fact Sheet', 'KEMRI Heart Disease Research', 'AMPATH Cardiology Program'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — Atrial Fibrillation
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'cv-atrial-fibrillation',
    title: 'Atrial Fibrillation — When Your Heart Beats Out of Rhythm',
    summary: 'Atrial fibrillation (AFib) is a common heart rhythm problem that increases stroke risk. Learn how to recognize it and why treatment matters.',
    content: 'WHAT IS ATRIAL FIBRILLATION?\nAtrial fibrillation (AFib) is an irregular and often rapid heart rhythm. Normally, your heart beats in a steady rhythm — about 60-100 times per minute at rest. In AFib, the upper chambers of the heart (atria) quiver or "fibrillate" instead of beating effectively, causing an irregular and sometimes fast heartbeat.\n\nWHY DOES IT HAPPEN?\nAFib becomes more common with age. Risk factors include:\n• High blood pressure — the most common cause\n• Heart failure\n• Heart valve disease (especially mitral valve)\n• Coronary artery disease or previous heart attack\n• Diabetes\n• Overactive thyroid (hyperthyroidism)\n• Obesity\n• Sleep apnea\n• Excessive alcohol use (especially binge drinking)\n• Lung disease\n\nWHAT ARE THE SYMPTOMS?\nSome people have no symptoms. Others experience:\n• Heart palpitations — feeling like your heart is racing, fluttering, or skipping beats\n• Fatigue and weakness\n• Dizziness or lightheadedness\n• Shortness of breath — especially during activity\n• Chest discomfort or pressure\n• Reduced ability to exercise\n\nWHY IS AFib DANGEROUS?\nAFib significantly increases your risk of stroke. When the atria quiver instead of pumping, blood can pool and form clots. If a clot travels to the brain, it causes a stroke. AFib increases stroke risk by 4-5 times, and AFib-related strokes are often more severe.\n\nHOW IS IT DIAGNOSED?\n• ECG (electrocardiogram) — the standard test\n• Holter monitor — portable ECG worn for 24-48 hours\n• Event monitor — worn for weeks for intermittent episodes\n• Echocardiogram (heart ultrasound)\n• Blood tests — check thyroid, kidney function, electrolytes\n\nHOW IS IT TREATED?\nTreatment has three goals:\nSTROKE PREVENTION (most important):\n• Blood thinners (anticoagulants): Warfarin (requires regular blood tests), or newer options (rivaroxaban, apixaban)\nHEART RATE CONTROL:\n• Beta-blockers (atenolol, bisoprolol, carvedilol)\n• Calcium channel blockers (diltiazem, verapamil)\nRHYTHM CONTROL:\n• Antiarrhythmic medications\n• Cardioversion (electric shock to reset rhythm)\n• Catheter ablation (procedure to destroy abnormal electrical tissue)\n\nWHAT CAN I DO?\n• Take blood thinners exactly as prescribed — never miss a dose\n• Learn to check your pulse regularly\n• Control blood pressure and blood sugar\n• Limit or avoid alcohol\n• Quit smoking\n• Maintain a healthy weight\n\nWHEN TO SEE A DOCTOR?\n• If you feel your heart racing or fluttering for more than a few minutes\n• If you have chest pain, shortness of breath, or feel faint\n• Signs of stroke: sudden weakness, facial droop, difficulty speaking\n\nKEY POINTS TO REMEMBER:\nAFib is a common heart rhythm disorder that increases stroke risk 5-fold. Blood thinners reduce that risk dramatically. Most people with AFib live normal lives with proper treatment. Learn to check your pulse and report irregularities. In Kenya, cardiology clinics at major referral hospitals manage AFib.',
    keyPoints: [
      'AFib is an irregular heart rhythm that increases stroke risk 4-5 times',
      'Blood thinners (anticoagulants) are the most important treatment to prevent stroke',
      'Symptoms include palpitations, fatigue, shortness of breath, dizziness',
      'Limit alcohol, control blood pressure, maintain healthy weight',
      'AFib is manageable — most people live normal lives with treatment',
    ],
    category: 'Condition Basics',
    condition: 'cardiovascular',
    literacyLevel: 'intermediate',
    readTimeMinutes: 8,
    tags: ['AFib', 'arrhythmia', 'heart rhythm', 'stroke prevention', 'palpitations'],
    icon: '❤️',
    references: ['ESC 2024 AFib Guidelines', 'WHO Cardiovascular Disease Report', 'Kenya MOH Non-Communicable Disease Guidelines', 'KEMRI Heart Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — Cholesterol Management
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'cv-cholesterol',
    title: 'Cholesterol — Understanding and Managing Your Levels',
    summary: 'High cholesterol is a major risk factor for heart attack and stroke. Learn what your numbers mean and how to improve them through diet and medication.',
    content: 'WHAT IS CHOLESTEROL?\nCholesterol is a waxy, fat-like substance found in every cell of your body. Your body needs some cholesterol to make hormones, vitamin D, and substances that help digest food. However, too much cholesterol in your blood can build up inside your arteries (atherosclerosis), narrowing them and increasing risk of heart attack and stroke.\n\nTYPES OF CHOLESTEROL:\n• LDL (Low-Density Lipoprotein) — "BAD" cholesterol: Carries cholesterol to the body. Too much LDL causes plaque buildup. TARGET: Below 2.6 mmol/L (or below 1.8 if you have heart disease or diabetes).\n• HDL (High-Density Lipoprotein) — "GOOD" cholesterol: Carries excess cholesterol back to the liver. Higher HDL is protective. TARGET: Above 1.0 for men, above 1.3 for women.\n• Triglycerides — Another type of fat in blood. TARGET: Below 1.7 mmol/L.\n• Total cholesterol — All lipids combined. TARGET: Below 5.2 mmol/L.\n\nWHY DOES IT HAPPEN?\nFactors contributing to high cholesterol:\n• Diet high in saturated and trans fats: Fatty meats, ghee, coconut oil, processed snacks, fried foods\n• Lack of physical activity\n• Being overweight — especially excess belly fat\n• Smoking — lowers HDL and damages arteries\n• Alcohol — raises triglycerides\n• Genetics — some people inherit high cholesterol (familial hypercholesterolemia)\n• Diabetes and kidney disease\n\nWHAT ARE THE SYMPTOMS?\nHigh cholesterol has NO symptoms. You cannot feel it. A simple blood test (lipid profile) is the only way to know your levels.\n\nHOW IS IT TREATED?\nLIFESTYLE FIRST:\n• Eat heart-healthy foods: More vegetables, fruits, whole grains, beans, fish\n• Limit saturated fats: Replace fatty meat with lean protein; use sunflower or olive oil instead of coconut oil or ghee\n• Increase soluble fiber: Oats, beans, apples — fiber binds cholesterol and removes it\n• Exercise 30 minutes daily (brisk walking is excellent)\n• Lose excess weight — losing 5-10% improves cholesterol significantly\n• Quit smoking and limit alcohol\n\nMEDICATION (if lifestyle is not enough):\n• Statins (simvastatin, atorvastatin, rosuvastatin) — reduce LDL by 30-60%. These are safe and well-studied.\n• Ezetimibe — blocks cholesterol absorption\n\nWHAT CAN I DO?\n• Know your numbers — get tested at least once a year if you have risk factors\n• Take medications as prescribed — statins work best when taken daily, usually at bedtime\n• Read food labels — avoid foods with palm oil, hydrogenated oils, or high saturated fat\n• Cook with vegetable oils and limit fried foods\n• Eat fish at least twice a week — omena, dagaa, tilapia are affordable in Kenya\n\nWHEN TO SEE A DOCTOR?\n• Total cholesterol above 5.2 mmol/L\n• LDL above 2.6 (or above 1.8 with diabetes/heart disease)\n• If you have risk factors: diabetes, hypertension, smoking, family history\n\nKEY POINTS TO REMEMBER:\nHigh cholesterol has no symptoms but silently damages your arteries. A simple blood test reveals your levels. Diet and exercise are powerful first steps. Statins are safe and highly effective. In Kenya, cholesterol testing is available at most health facilities.',
    keyPoints: [
      'LDL ("bad") cholesterol target below 2.6 — HDL ("good") above 1.0 (men) or 1.3 (women)',
      'High cholesterol has no symptoms — get tested yearly if you have risk factors',
      'Diet: more vegetables, beans, fish, oats; less fatty meat, ghee, and fried foods',
      'Statins are safe and reduce LDL by 30-60% — take as prescribed',
      'Exercise 30 minutes daily to raise HDL and lower LDL',
    ],
    category: 'Prevention',
    condition: 'cardiovascular',
    literacyLevel: 'intermediate',
    readTimeMinutes: 8,
    tags: ['cholesterol', 'LDL', 'HDL', 'statins', 'heart health', 'lipids'],
    icon: '🩸',
    references: ['ESC/EAS 2024 Lipid Guidelines', 'Kenya MOH CVD Prevention Guidelines', 'KEMRI Cholesterol Research', 'WHO Cardiovascular Disease Guidelines'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — Exercise After Heart Attack
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'cv-exercise-after-mi',
    title: 'Exercise After a Heart Attack — Safe Return to Activity',
    summary: 'Returning to physical activity after a heart attack is essential for recovery. Learn how to exercise safely and rebuild your strength step by step.',
    content: 'WHY EXERCISE MATTERS AFTER A HEART ATTACK?\nAfter a heart attack (myocardial infarction), your heart muscle has been damaged. Rest is important initially, but regular physical activity is essential for recovery. Exercise strengthens your heart, improves circulation, reduces stress, and lowers the risk of a second heart attack. People who exercise after a heart attack have 30-40% lower risk of dying from heart disease.\n\nPHASE 1: IN HOSPITAL (Days 1-3)\nDuring your hospital stay, a physiotherapist will guide you:\n• Deep breathing exercises\n• Moving arms and legs while lying in bed\n• Sitting up and standing with assistance\n• Walking slowly to the bathroom\nThe goal is to prevent blood clots and maintain muscle strength.\n\nPHASE 2: EARLY RECOVERY (Weeks 1-4 after discharge)\n• Walking is the best activity — start with 5-10 minutes, 2-3 times daily\n• Walk on flat ground — avoid hills and stairs initially\n• Maintain a comfortable pace — you should be able to speak while walking\n• Stop immediately if you feel chest pain, extreme fatigue, or breathlessness\n• Avoid lifting heavy objects (more than 5 kg) for the first 4 weeks\n\nPHASE 3: GRADUAL BUILD-UP (Weeks 4-12)\n• Increase walking to 20-30 minutes, 5-6 days per week\n• Introduce light household chores\n• After 6-8 weeks with doctor approval: Gentle cycling on flat ground\n• Avoid competitive sports and heavy lifting\n\nPHASE 4: MAINTENANCE (After 12 weeks, with doctor clearance)\n• Walk 30-45 minutes daily\n• Brisk walking, cycling, swimming — all excellent\n• Light strength training with small weights (1-3 kg)\n\nWARNING SIGNS — STOP EXERCISE IMMEDIATELY:\n• Chest pain, pressure, or discomfort\n• Severe shortness of breath\n• Dizziness or lightheadedness\n• Racing heart or irregular heartbeat\n• Nausea or cold sweat\n\nWHAT CAN I DO?\n• Enroll in cardiac rehabilitation if available (ask at Kenyatta, Moi, or Aga Khan hospitals)\n• Always warm up for 5 minutes and cool down for 5 minutes\n• Exercise at the same time each day\n• Walk with a partner in case you need help\n• Keep your GTN spray or tablets with you during exercise\n\nKEY POINTS TO REMEMBER:\nStart with short, gentle walks and gradually increase. Stop immediately if you have chest pain, severe breathlessness, or dizziness. Walking is the safest and best exercise after a heart attack. With time and consistency, most people return to full activity. In Kenya, cardiac rehab is available at major referral hospitals.',
    keyPoints: [
      'Start with 5-10 minute walks, 2-3 times daily, on flat ground',
      'Stop immediately if chest pain, severe breathlessness, or dizziness',
      'Build up gradually over weeks — do not rush your recovery',
      'Enroll in cardiac rehabilitation if available — improves outcomes by 40%',
      'Exercise for life — consistency is key to preventing a second heart attack',
    ],
    category: 'Lifestyle',
    condition: 'cardiovascular',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['heart attack', 'exercise', 'cardiac rehab', 'recovery', 'MI rehabilitation'],
    icon: '🏃',
    references: ['ESC Cardiac Rehabilitation Guidelines', 'Kenya MOH Cardiac Rehabilitation Guidelines', 'AHA Exercise After Heart Attack', 'AMPATH Cardiology Program'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // DIABETES — Insulin Therapy
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'dm-insulin',
    title: 'Insulin Therapy — A Guide to Starting and Managing Insulin',
    summary: 'Many people with diabetes eventually need insulin. It is nothing to fear — insulin is the most effective treatment for controlling blood sugar.',
    content: 'WHAT IS INSULIN?\nInsulin is a hormone normally produced by your pancreas that helps sugar (glucose) enter your cells to be used for energy. In diabetes, either the body does not produce enough insulin (Type 1) or does not use it properly (Type 2).\n\nWHEN IS INSULIN NEEDED?\n• Type 1 diabetes: Always needs insulin — the body produces none at all\n• Type 2 diabetes: Needed when oral medications plus lifestyle are not enough to control blood sugar\n• Gestational diabetes: Sometimes needed during pregnancy\n• During illness or surgery: Temporary insulin may be needed\n\nINSULIN IS NOT A FAILURE:\nMany people feel they have "failed" when they need insulin. This is not true. Diabetes is a progressive condition — the pancreas produces less insulin over time. Needing insulin means you are treating your diabetes appropriately.\n\nTYPES OF INSULIN:\nRAPID-ACTING (NovoRapid, Humalog): Starts in 10-15 min, peaks at 1-2 hours — taken just before meals\nSHORT-ACTING (Actrapid): Starts in 30 min, peaks at 2-4 hours — taken 30 min before meals\nINTERMEDIATE-ACTING (NPH/Insulatard): Starts in 2-4 hours, peaks at 4-10 hours — once or twice daily\nLONG-ACTING (Lantus, Levemir): Starts in 2-4 hours, no pronounced peak, lasts 18-24 hours — once daily\n\nHOW TO INJECT:\n1. Choose injection site: Abdomen (fastest), thighs, upper arms, buttocks\n2. Rotate sites — do not inject in the same spot every time\n3. Clean skin with alcohol and let dry\n4. Pinch skin fold (if thin) or inject at 90 degrees (if using 4mm needles)\n5. Push plunger slowly, count to 10 before removing needle\n6. Dispose of needle in a sharps container\n\nSTORING INSULIN:\n• Unopened: Refrigerate (2-8°C) — do not freeze\n• Opened (in use): Room temperature (below 30°C) for 28 days\n• Do not leave in direct sunlight or hot car\n\nSIDE EFFECTS AND RISKS:\n• Hypoglycemia (low blood sugar) — the most common and dangerous — always carry fast-acting sugar\n• Weight gain — common when starting\n• Injection site reactions — rotate sites to prevent\n\nWHAT CAN I DO?\n• Check blood sugar at least 4 times daily when starting insulin\n• Record blood sugar levels and insulin doses\n• Always eat after taking rapid-acting insulin\n• Carry fast-acting sugar at all times\n• Wear medical identification saying you take insulin\n• Never drive if blood sugar is below 5 mmol/L\n\nINSULIN IN KENYA:\nNPH and Actrapid are most common and lowest cost at public hospitals. Lantus and NovoRapid are more expensive. NHIF covers some insulin under the Diabetes Management Package. Insulin is FREE for children with Type 1 diabetes at some public hospitals through NGO partnerships.\n\nKEY POINTS TO REMEMBER:\nInsulin is the most effective diabetes treatment — it is not a punishment or a sign of failure. Learn proper injection technique and rotate sites daily. Always carry fast-acting sugar for lows. Monitor blood sugar frequently. With proper insulin management, you can achieve excellent blood sugar control.',
    keyPoints: [
      'Insulin is needed when oral medications no longer control blood sugar — this is normal disease progression',
      'Types: rapid-acting (before meals), long-acting (once or twice daily background)',
      'Rotate injection sites to prevent lumps and ensure consistent absorption',
      'Hypoglycemia is the main risk — always carry fast-acting sugar',
      'Store unopened insulin in the fridge, opened insulin at room temperature for 28 days',
    ],
    category: 'Treatment',
    condition: 'diabetes',
    literacyLevel: 'intermediate',
    readTimeMinutes: 10,
    tags: ['insulin', 'diabetes', 'injection', 'blood sugar', 'Type 1 diabetes', 'Type 2 diabetes'],
    icon: '🩸',
    references: ['ADA Standards of Care 2024 — Insulin Therapy', 'Kenya MOH Diabetes Guidelines', 'WHO Diabetes Fact Sheet', 'Life For a Child Program Kenya'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // DIABETES — Gestational Diabetes
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'dm-gestational',
    title: 'Gestational Diabetes — Diabetes During Pregnancy',
    summary: 'Gestational diabetes develops during pregnancy and usually resolves after delivery. Proper management protects both mother and baby.',
    content: 'WHAT IS GESTATIONAL DIABETES?\nGestational diabetes mellitus (GDM) is diabetes first diagnosed during pregnancy. It usually develops in the second or third trimester when pregnancy hormones make the body less responsive to insulin. About 7-14% of pregnant women in Kenya develop GDM.\n\nWHY DOES IT HAPPEN?\nDuring pregnancy, the placenta produces hormones that help the baby grow but block the action of insulin. Most women produce extra insulin to compensate. When the body cannot keep up, blood sugar rises.\n\nRisk factors:\n• Overweight before pregnancy\n• Family history of diabetes\n• Previous GDM in a prior pregnancy\n• Previous baby weighing 4kg or more at birth\n• Age over 35 years\n• Polycystic ovary syndrome (PCOS)\n\nWHAT ARE THE SYMPTOMS?\nGDM often has NO symptoms. Screening is essential.\n\nHOW IS IT DIAGNOSED?\nScreening is done at 24-28 weeks of pregnancy with an oral glucose tolerance test (OGTT). Diagnosis:\n• Fasting: 5.3 mmol/L or higher\n• 1 hour: 10.0 mmol/L or higher\n• 2 hour: 8.5 mmol/L or higher\n\nEFFECTS ON THE BABY:\n• Macrosomia (large baby over 4kg) — difficult delivery, higher C-section risk\n• Hypoglycemia after birth — baby produces extra insulin in response to high maternal sugar\n• Higher risk of childhood obesity and Type 2 diabetes later\n\nHOW IS IT TREATED?\nBlood sugar monitoring:\n• Check 4 times daily: Fasting and 1-2 hours after each meal\n• Target fasting: Below 5.3 mmol/L\n• Target 1-hour after meals: Below 7.8 mmol/L\n\nHealthy eating:\n• 3 small meals and 2-3 snacks daily — do not skip meals\n• Include protein with every meal\n• Limit carbohydrates — choose whole grains\n• Avoid sugary drinks, sweets, fruit juice, soda\n\nPhysical activity:\n• Moderate exercise 30 minutes most days (walking is safe and excellent)\n• Exercise after meals helps lower blood sugar\n\nMedication (if lifestyle is not enough):\n• Metformin — oral medication, safe in pregnancy\n• Insulin — safe in pregnancy, does not cross the placenta\n\nAFTER BIRTH:\n• Blood sugar usually returns to normal within hours\n• Baby\'s blood sugar will be monitored after birth\n• Breastfeeding is encouraged\n• Get tested for diabetes 6-12 weeks after delivery (OGTT)\n• Test for diabetes every 1-3 years after that\n\nKEY POINTS TO REMEMBER:\nGDM is common and manageable. Monitor blood sugar 4 times daily. Treat with lifestyle first, then medication if needed. After delivery, blood sugar usually returns to normal, but you have a higher risk of future Type 2 diabetes. In Kenya, GDM screening is available at most antenatal clinics.',
    keyPoints: [
      'GDM develops during pregnancy due to hormone changes — screening at 24-28 weeks',
      'Check blood sugar 4 times daily: fasting and after each meal',
      'Treat with diet and exercise first — medication (metformin or insulin) if needed',
      'GDM usually resolves after delivery, but risk of future Type 2 diabetes is high',
      'Get tested for diabetes 6-12 weeks after delivery, then every 1-3 years',
    ],
    category: 'Condition Basics',
    condition: 'diabetes',
    literacyLevel: 'intermediate',
    readTimeMinutes: 8,
    tags: ['gestational diabetes', 'pregnancy', 'GDM', 'diabetes', 'maternal health'],
    icon: '🤰',
    references: ['Kenya MOH Gestational Diabetes Guidelines', 'ADA Gestational Diabetes Recommendations', 'WHO Diabetes in Pregnancy Guidelines', 'KEMRI Diabetes in Pregnancy Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // DIABETES — Diabetic Ketoacidosis (DKA)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'dm-dka',
    title: 'Diabetic Ketoacidosis (DKA) — A Diabetes Emergency',
    summary: 'DKA is a life-threatening complication caused by very high blood sugar and acid buildup. Early recognition saves lives.',
    content: 'WHAT IS DIABETIC KETOACIDOSIS (DKA)?\nDKA is a serious complication that occurs when your body does not have enough insulin. Without insulin, your cells cannot use sugar for energy, so your body breaks down fat instead. This produces acids called ketones that build up, making your blood dangerously acidic. DKA is a medical emergency.\n\nWHO GETS DKA?\n• Type 1 diabetes: Most common — can be the first sign of the disease\n• Type 2 diabetes: Less common, but can occur during severe illness\n\nWHAT TRIGGERS DKA?\n• Missed insulin doses (most common cause)\n• Infection: Pneumonia, UTI, malaria, gastroenteritis\n• Newly diagnosed Type 1 diabetes\n• Heart attack or stroke\n• Surgery or trauma\n• Alcohol or drug abuse\n\nWHAT ARE THE SYMPTOMS?\nEarly symptoms:\n• Very high blood sugar (above 16 mmol/L)\n• Excessive thirst and frequent urination\n• Nausea and vomiting\n• Abdominal pain (can be mistaken for appendicitis)\n\nLater symptoms (EMERGENCY):\n• Deep, rapid breathing (Kussmaul breathing — body trying to blow off acid)\n• Fruity-smelling breath (smell of ketones)\n• Confusion\n• Dry mouth and skin\n• Rapid heart rate\n• Loss of consciousness\n\nWHEN IS DKA AN EMERGENCY?\nDKA is ALWAYS an emergency. If you have diabetes and have high blood sugar with vomiting and abdominal pain, go to hospital immediately.\n\nHOW IS IT TREATED?\nDKA is treated in hospital:\n• IV fluids: Large volumes to correct dehydration (4-6 litres in first 24 hours)\n• Insulin: Continuous IV insulin to lower blood sugar and stop ketone production\n• Electrolyte replacement: Especially potassium\n• Treat the trigger: Antibiotics if infection is present\n\nMost people recover in 24-48 hours with proper treatment.\n\nPREVENTING DKA:\nOn sick days:\n• NEVER stop insulin — even if you are not eating\n• Check blood sugar every 4 hours\n• Check ketones if blood sugar is above 13 mmol/L\n• Drink plenty of sugar-free fluids\n• Contact your doctor or go to hospital if vomiting for more than 6 hours\n\nKEY POINTS TO REMEMBER:\nDKA is a life-threatening emergency caused by insulin deficiency. Symptoms: high blood sugar, vomiting, abdominal pain, deep rapid breathing, confusion. Never stop insulin even when sick. Go to hospital immediately if you suspect DKA. In Kenya, DKA treatment is available at all major hospitals.',
    keyPoints: [
      'DKA is an emergency: very high blood sugar, vomiting, abdominal pain, deep rapid breathing',
      'NEVER stop insulin even when sick — this is the most common cause of DKA',
      'Check ketones when blood sugar is above 13 mmol/L or during illness',
      'Go to hospital immediately if you have high blood sugar with vomiting',
      'DKA is treatable but can be fatal if ignored — do not wait',
    ],
    category: 'Safety',
    condition: 'diabetes',
    literacyLevel: 'intermediate',
    readTimeMinutes: 8,
    tags: ['DKA', 'ketoacidosis', 'diabetes emergency', 'ketones', 'insulin deficiency'],
    icon: '🚨',
    references: ['ADA DKA Management Guidelines', 'Joint British Diabetes Societies DKA Guidelines', 'Kenya MOH Diabetes Emergency Guidelines', 'ISPAD DKA Guidelines'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // DIABETES — Eye and Kidney Protection
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'dm-eye-kidney',
    title: 'Protecting Your Eyes and Kidneys from Diabetes Damage',
    summary: 'Diabetes is the leading cause of blindness and kidney failure. Yearly screening can detect damage early and prevent progression.',
    content: 'WHY EYES AND KIDNEYS?\nDiabetes damages small blood vessels throughout the body. The eyes and kidneys are especially vulnerable because they contain dense networks of tiny blood vessels. Damage happens silently over years — by the time you notice symptoms, significant damage may already be done.\n\nDIABETIC EYE DISEASE (RETINOPATHY):\nWHAT IS IT?\nHigh blood sugar damages tiny blood vessels in the retina (the light-sensitive tissue at the back of the eye). Damaged vessels can leak fluid or grow new fragile vessels that bleed into the eye.\n\nSTAGES:\n• Mild: Small swellings in blood vessels — usually no vision loss\n• Moderate to severe: More vessels blocked, areas of retina lose blood supply\n• Proliferative: New abnormal blood vessels grow — high risk of severe vision loss\n• Macular edema: Fluid in central vision area — can cause vision loss at any stage\n\nSYMPTOMS:\nEarly: NO symptoms\nLater: Blurry vision, floaters, difficulty reading, dark areas, sudden vision loss\n\nTREATMENT:\n• Good blood sugar control reduces development by 76%\n• Good blood pressure control reduces progression\n• Laser therapy: Seals leaking vessels\n• Anti-VEGF injections: Reduce swelling, improve vision — available at some Kenyan eye hospitals\n\nSCREENING:\n• Type 1 diabetes: First eye exam 5 years after diagnosis, then yearly\n• Type 2 diabetes: First eye exam at diagnosis, then yearly\n\nDIABETIC KIDNEY DISEASE (NEPHROPATHY):\nWHAT IS IT?\nDamage to the kidneys\' filtering units (glomeruli). High blood sugar and high blood pressure damage these filters over time.\n\nSTAGES:\n• Early: Small amounts of protein in urine (detectable only by lab test)\n• Moderate: More protein, kidney function declining\n• Advanced: Kidney failure — dialysis or transplant needed\n\nTREATMENT:\n• Strict blood sugar control\n• Strict blood pressure control (target below 130/80)\n• ACE inhibitors or ARBs — protect kidneys beyond BP-lowering effect\n• SGLT2 inhibitors — protect kidneys and heart\n• Limit salt, avoid NSAIDs (ibuprofen, diclofenac)\n\nSCREENING:\n• All people with diabetes: Check urine albumin and eGFR at least ONCE A YEAR\n\nWHERE TO GET SCREENED IN KENYA:\nEye exams: Kenyatta, Moi, Lion SightFirst Eye Hospital\nKidney tests: Available at most hospital laboratories\n\nKEY POINTS TO REMEMBER:\nDiabetes damages eyes and kidneys silently. Yearly screening catches damage early. Good blood sugar and BP control are the best protection. ACE inhibitors and SGLT2 inhibitors protect kidneys. Do not wait for symptoms — get checked every year.',
    keyPoints: [
      'Diabetes damages eyes and kidneys silently — yearly screening is essential',
      'Eye exam at diagnosis for Type 2 diabetes, then yearly — treatment can prevent blindness',
      'Kidney check (urine albumin + eGFR) once a year — medications protect kidneys',
      'Control HbA1c (below 7%) and BP (below 130/80) to prevent both complications',
      'Report foamy urine, vision changes, or foot swelling to your doctor immediately',
    ],
    category: 'Prevention',
    condition: 'diabetes',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['diabetic retinopathy', 'diabetic nephropathy', 'eye exam', 'kidney screening', 'diabetes complications'],
    icon: '👁️',
    references: ['ADA Standards of Care 2024 — Microvascular Complications', 'Kenya MOH Diabetes Complication Guidelines', 'WHO Prevention of Blindness Program', 'KEMRI Diabetic Kidney Disease Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // HYPERTENSION — Resistant Hypertension
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'htn-resistant',
    title: 'Resistant Hypertension — When Blood Pressure Will Not Come Down',
    summary: 'Some people need multiple medications and special approaches to control their blood pressure. Learn what to do when standard treatment is not enough.',
    content: 'WHAT IS RESISTANT HYPERTENSION?\nResistant hypertension is blood pressure that remains above target (usually above 130/80 mmHg) despite taking three or more different types of BP medications at optimal doses — including a diuretic. About 10-15% of people with hypertension have resistant hypertension.\n\nWHY DOES IT HAPPEN?\n• Not taking medications as prescribed — the most common cause\n• Too much salt in the diet\n• Obesity (especially central obesity)\n• Excessive alcohol\n• Other medications that raise BP: NSAIDs (ibuprofen, diclofenac), steroids, some cold medications, herbal supplements\n• Other conditions: Sleep apnea, kidney disease, thyroid disorders, primary aldosteronism (hormone problem)\n• Cigarette smoking\n• African ethnicity — people of African descent often need different medication combinations\n\nWHAT ARE THE SYMPTOMS?\nUsually no symptoms, but higher risk of heart damage, kidney damage, stroke, and heart failure.\n\nHOW IS IT DIAGNOSED?\nBefore diagnosing resistant hypertension, your doctor must rule out:\n• Is BP measured correctly? (proper technique, cuff size)\n• Is the patient taking all medications? (adherence check)\n• Are there interfering substances? (NSAIDs, alcohol, salt)\n• Is there another underlying condition? (sleep apnea, kidney disease)\n• Is this just white coat effect? (BP high only in clinic)\n\nHOW IS IT TREATED?\nMEDICATION OPTIMIZATION:\n• Maximize doses of current medications\n• Add medications from different classes\n• People of African descent respond better to calcium channel blockers and diuretics\n• Spironolactone is often effective as a fourth-line agent\n• Typically 3-5 medications are needed\n\nLIFESTYLE INTENSIFICATION:\n• Strict salt restriction: Less than 4g (half teaspoon) per day\n• Weight loss: Losing 5-10% reduces number of medications needed\n• DASH diet: Vegetables, fruits, low-fat dairy, whole grains\n• Exercise: 30-60 minutes daily\n• Limit alcohol to 1 drink or less per day\n• Treat sleep apnea with CPAP\n\nWHAT CAN I DO?\n• Do NOT stop medications — discuss with your doctor\n• Use a pill organizer and set phone alarms\n• Check BP at home and bring your logbook to appointments\n• Reduce salt drastically\n• Ask about spironolactone if not already taking it\n\nKEY POINTS TO REMEMBER:\nResistant hypertension requires a systematic approach: confirm adherence, remove interfering substances, treat underlying conditions, optimize medications. Spironolactone is often a powerful addition. Strict lifestyle modification is essential. In Kenya, specialist hypertension clinics are available at Kenyatta and Moi Hospitals.',
    keyPoints: [
      'Resistant hypertension = BP above target on 3+ medications including a diuretic',
      'Medication non-adherence and high salt intake are the most common causes',
      'Spironolactone is often effective as a fourth-line agent',
      'Rule out sleep apnea, kidney disease, and hormone problems',
      'Strict lifestyle: very low salt, DASH diet, weight loss, exercise daily',
    ],
    category: 'Treatment',
    condition: 'hypertension',
    literacyLevel: 'advanced',
    readTimeMinutes: 9,
    tags: ['resistant hypertension', 'BP control', 'spironolactone', 'secondary hypertension', 'medication adherence'],
    icon: '🫀',
    references: ['AHA 2024 Resistant Hypertension Guidelines', 'ESH 2023 Hypertension Guidelines', 'Kenya MOH Hypertension Guidelines', 'KEMRI Hypertension Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // HYPERTENSION — Pregnancy and Blood Pressure
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'htn-pregnancy',
    title: 'High Blood Pressure in Pregnancy — Risks and Management',
    summary: 'High blood pressure during pregnancy can be dangerous for both mother and baby. Learn the types, risks, and how to manage them.',
    content: 'WHAT IS HIGH BLOOD PRESSURE IN PREGNANCY?\nHigh blood pressure during pregnancy affects 5-10% of pregnancies. It can develop before pregnancy (chronic hypertension) or appear during pregnancy (gestational hypertension or pre-eclampsia). It is a leading cause of maternal and infant illness in Kenya.\n\nTYPES:\nCHRONIC HYPERTENSION:\n• BP high before pregnancy or before 20 weeks — these women have higher risk of pre-eclampsia\n\nGESTATIONAL HYPERTENSION:\n• BP develops after 20 weeks, no protein in urine — usually resolves after delivery\n\nPRE-ECLAMPSIA:\n• BP after 20 weeks with organ damage (most commonly protein in urine) — leading cause of maternal death\n\nECLAMPSIA:\n• Pre-eclampsia with seizures — life-threatening emergency\n\nRISK FACTORS:\n• First pregnancy\n• Previous pre-eclampsia\n• Chronic hypertension, diabetes, kidney disease\n• Obesity (BMI over 30)\n• Age over 40\n• Multiple pregnancy (twins)\n• Family history\n\nSYMPTOMS OF PRE-ECLAMPSIA:\n• Severe headache not helped by paracetamol\n• Blurred vision, seeing spots\n• Severe upper right abdominal pain\n• Sudden swelling of face, hands, feet\n• Sudden weight gain (2+ kg in a week)\n• Shortness of breath\n\nMANAGEMENT:\nMILD: Home BP monitoring, rest on left side, reduce salt, safe medications (methyldopa, labetalol, nifedipine). ACE inhibitors and ARBs are NOT safe in pregnancy.\nSEVERE: Hospital admission, IV medications, magnesium sulfate to prevent seizures, delivery planning.\n\nDELIVERY:\nThe only cure is delivery. Timing depends on severity and gestational age. After delivery, BP is monitored closely for 48 hours.\n\nLONG-TERM OUTLOOK:\nWomen who had pre-eclampsia have higher risk of chronic hypertension, heart disease, and stroke later. Yearly BP checks are recommended for life.\n\nKEY POINTS TO REMEMBER:\nHigh BP in pregnancy needs close monitoring. Attend every antenatal visit. Know pre-eclampsia warning signs. Safe BP medications in pregnancy include methyldopa, labetalol, nifedipine. Pre-eclampsia can develop after delivery too. Future heart health is important after pregnancy-related hypertension.',
    keyPoints: [
      'High BP in pregnancy affects 5-10% of women — attend every antenatal visit',
      'Pre-eclampsia warning signs: severe headache, vision changes, stomach pain, face/hand swelling',
      'Safe BP medications in pregnancy: methyldopa, labetalol, nifedipine',
      'Pre-eclampsia can develop after delivery — continue monitoring for 6 weeks',
      'Women who had pre-eclampsia have higher future risk of hypertension and heart disease',
    ],
    category: 'Condition Basics',
    condition: 'hypertension',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['pregnancy', 'pre-eclampsia', 'gestational hypertension', 'maternal health', 'BP in pregnancy'],
    icon: '🤰',
    references: ['WHO Pre-eclampsia and Eclampsia Guidelines', 'Kenya MOH Maternal Health Guidelines', 'ISSHP Hypertension in Pregnancy Guidelines', 'KEMRI Maternal Health Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // RESPIRATORY — Sleep Apnea
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'resp-sleep-apnea',
    title: 'Sleep Apnea — When Breathing Stops During Sleep',
    summary: 'Sleep apnea causes repeated pauses in breathing during sleep. It increases risk of high blood pressure, heart disease, and stroke. Treatment is effective.',
    content: 'WHAT IS SLEEP APNEA?\nSleep apnea is a sleep disorder where your breathing repeatedly stops and starts during sleep. The most common type is obstructive sleep apnea (OSA), where the throat muscles relax and block the airway. Each pause can last 10-30 seconds and can happen hundreds of times per night.\n\nWHY DOES IT HAPPEN?\nWhen you fall asleep, your throat muscles relax. In some people, the airway narrows or closes completely.\n\nRisk factors:\n• Obesity (especially neck fat) — the strongest risk factor\n• Large neck circumference (above 40 cm men, 35 cm women)\n• Narrow airway (large tonsils, large tongue, small jaw)\n• Male gender (2-3 times more common)\n• Age over 40\n• Family history\n• Smoking and alcohol before bed\n\nWHAT ARE THE SYMPTOMS?\nNIGHTTIME (noticed by partner):\n• Loud persistent snoring\n• Witnessed pauses in breathing\n• Gasping, snorting, or choking sounds\n• Restless sleep\n\nDAYTIME:\n• Excessive sleepiness — falling asleep while sitting, reading, or even driving\n• Morning headache\n• Dry mouth on waking\n• Difficulty concentrating\n• Irritability\n• Waking up unrefreshed after 7-9 hours of sleep\n\nWHY IS IT DANGEROUS?\nUntreated sleep apnea has serious consequences:\n• High blood pressure — nightly oxygen drops trigger stress hormones\n• Heart disease — increased risk of heart attack, atrial fibrillation, heart failure\n• Stroke — 2-3 times higher risk\n• Type 2 diabetes — worsens insulin resistance\n• Daytime sleepiness — 2-3 times higher risk of motor vehicle accidents\n\nHOW IS IT DIAGNOSED?\nSleep study (polysomnography) — the gold standard. Available at Kenyatta National Hospital Sleep Lab and Aga Khan University Hospital. Records brain waves, oxygen levels, heart rate, and breathing during sleep.\n\nSeverity (apnea-hypopnea index):\n• Mild: 5-15 events per hour\n• Moderate: 15-30 events per hour\n• Severe: More than 30 events per hour\n\nHOW IS IT TREATED?\nLIFESTYLE:\n• Weight loss — losing 10% of body weight can eliminate sleep apnea\n• Avoid alcohol and sedatives before bed\n• Sleep on your side (positional therapy)\n• Exercise improves airway muscle tone\n\nCPAP (Continuous Positive Airway Pressure):\nThe most effective treatment for moderate to severe sleep apnea. A machine delivers air through a mask to keep your airway open. Benefits are immediate: better sleep, more energy, lower blood pressure. CPAP machines are available in Kenya through private suppliers.\n\nORAL APPLIANCES:\nDental devices that reposition the jaw — effective for mild to moderate cases.\n\nSURGERY:\nFor people who cannot tolerate CPAP: tonsillectomy, nasal surgery, or bariatric surgery for weight loss.\n\nWHAT CAN I DO?\n• If you snore loudly and are tired during the day, talk to your doctor\n• Lose weight if overweight\n• Sleep on your side — sew a tennis ball into the back of your pajama top\n• Avoid alcohol 3-4 hours before bed\n• Use CPAP every night\n\nKEY POINTS TO REMEMBER:\nSleep apnea causes repeated breathing pauses during sleep, daytime fatigue, and increases risk of high blood pressure, heart disease, and stroke. Weight loss is highly effective. CPAP is the gold standard treatment with immediate benefits. In Kenya, sleep studies are available at major hospitals.',
    keyPoints: [
      'Sleep apnea causes repeated breathing pauses during sleep — it is not just snoring',
      'Symptoms: loud snoring, gasping at night, daytime sleepiness, morning headaches',
      'Untreated sleep apnea increases risk of high blood pressure, heart disease, and stroke',
      'CPAP therapy is the most effective treatment — weight loss can help significantly',
      'If you snore loudly and are tired all day, ask your doctor about a sleep study',
    ],
    category: 'Condition Basics',
    condition: 'respiratory',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['sleep apnea', 'snoring', 'CPAP', 'sleep disorder', 'OSA', 'daytime sleepiness'],
    icon: '😴',
    references: ['AASM Sleep Apnea Guidelines', 'WHO Sleep and Health Report', 'Kenya MOH Sleep Medicine Resources', 'KEMRI Sleep Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // RESPIRATORY — COPD Exacerbation Prevention
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'resp-copd-exacerbation',
    title: 'Preventing COPD Exacerbations — Staying Out of Hospital',
    summary: 'COPD exacerbations (flare-ups) can send you to hospital. Learn the early warning signs and how to prevent them.',
    content: 'WHAT IS A COPD EXACERBATION?\nA COPD exacerbation is a sudden worsening of COPD symptoms lasting 2 or more days. During an exacerbation, your airways become more inflamed, mucus increases, and breathing becomes much harder. Exacerbations are the leading cause of hospital admissions in people with COPD and accelerate lung function decline.\n\nCOMMON TRIGGERS:\n• Respiratory infections: Flu, colds, pneumonia — 50-70% of exacerbations\n• Air pollution: Smoke from wood/charcoal fires common in Kenyan homes\n• Allergens: Dust, pollen, mold\n• Cold air\n• Stopping COPD medications\n• Cigarette smoke or secondhand smoke\n\nWARNING SIGNS — RECOGNIZE EARLY:\n• Increased shortness of breath\n• Increased coughing\n• Change in sputum: More phlegm, or color change (clear to yellow/green)\n• Increased wheezing\n• Chest tightness\n• Fever\n• Difficulty sleeping cannot lie flat\n• Confusion (sign of low oxygen — severe)\n\nZONE SYSTEM FOR ACTION:\nGREEN ZONE (stable): Normal breathing, normal sputum — continue regular medications\nYELLOW ZONE (warning): Increased breathlessness, more/darker sputum — increase reliever inhaler, start rescue pack (antibiotics + steroids) if prescribed\nRED ZONE (emergency): Severe breathlessness, confusion, blue lips — go to hospital immediately\n\nPREVENTION:\n1. STOP SMOKING — the single most important step\n2. AVOID TRIGGERS: Cook in ventilated areas, avoid crowds during flu season, wear a mask in poor air quality\n3. TAKE DAILY INHALERS — never skip doses\n4. GET VACCINATED: Flu vaccine yearly, pneumococcal vaccine, COVID-19 vaccine\n5. PULMONARY REHABILITATION: Exercise and education program — available at Kenyatta and Moi Hospitals\n6. STAY ACTIVE: Gentle walking as tolerated\n7. DRINK PLENTY OF WATER: Helps thin mucus\n\nRESCUE PACK:\nYour doctor may prescribe antibiotics and steroids to keep at home. Start at first yellow zone signs. If no improvement in 48 hours, go to hospital.\n\nBREATHING TECHNIQUES:\nPursed-lip breathing: Breathe in through nose for 2 counts, purse lips and breathe out slowly for 4 counts. This keeps airways open longer.\n\nWHEN TO GO TO HOSPITAL:\n• Severe breathlessness not improving with rest\n• Confusion or drowsiness\n• Blue lips or fingernails\n• Coughing up blood\n• Fever not controlled\n• No improvement after 48 hours of rescue pack\n\nKEY POINTS TO REMEMBER:\nPrevent exacerbations by avoiding triggers: stop smoking, avoid wood/charcoal smoke, get vaccinated. Use maintenance inhalers daily. Recognize early warning signs and act early with rescue pack. In Kenya, COPD care is available at respiratory clinics in major hospitals.',
    keyPoints: [
      'Exacerbations are sudden worsening of COPD — prevent them by avoiding triggers',
      'Flu vaccine every year is the single best prevention — also get pneumonia vaccine',
      'Use your daily maintenance inhalers — never skip them',
      'Learn yellow zone signs: more cough, more sputum, color change — act early',
      'Stop smoking and avoid smoke from cooking fires (use ventilation or cleaner fuels)',
    ],
    category: 'Prevention',
    condition: 'respiratory',
    literacyLevel: 'intermediate',
    readTimeMinutes: 9,
    tags: ['COPD', 'exacerbation', 'prevention', 'respiratory', 'inhalers', 'flu vaccine'],
    icon: '🫁',
    references: ['GOLD 2024 COPD Guidelines', 'WHO COPD Management Guidelines', 'Kenya MOH Respiratory Disease Guidelines', 'KEMRI COPD Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // MENTAL HEALTH — PTSD
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'mh-ptsd',
    title: 'Post-Traumatic Stress Disorder (PTSD) — Healing After Trauma',
    summary: 'PTSD is a mental health condition triggered by a terrifying event. It is treatable, and recovery is possible with proper support.',
    content: 'WHAT IS PTSD?\nPost-Traumatic Stress Disorder (PTSD) is a mental health condition that develops after experiencing or witnessing a life-threatening or deeply traumatic event. In Kenya, many people experience trauma: road traffic accidents, violence, sexual assault, terrorism (Westgate, Garissa, Dusit attacks), natural disasters, or sudden loss of a loved one. While most people recover from trauma over time, PTSD is when symptoms persist and interfere with daily life.\n\nWHAT TYPES OF EVENTS CAN CAUSE PTSD?\n• Physical or sexual assault\n• Road traffic accidents (common in Kenya)\n• Domestic or gender-based violence\n• Witnessing violence or death\n• Terrorist attacks\n• Military combat\n• Natural disasters (floods, droughts)\n• Childhood abuse or neglect\n• Medical trauma\n• Sudden death of a loved one\n\nWHAT ARE THE SYMPTOMS?\n1. INTRUSIVE MEMORIES:\n• Unwanted distressing memories of the event\n• Flashbacks — feeling like you are reliving it\n• Nightmares\n• Intense distress when reminded of the trauma\n\n2. AVOIDANCE:\n• Avoiding reminders of the trauma\n• Avoiding talking or thinking about it\n• Social withdrawal and isolation\n\n3. NEGATIVE MOOD AND THINKING:\n• Negative thoughts about yourself, others, the world\n• Persistent fear, anger, guilt, shame\n• Loss of interest in things you used to enjoy\n• Feeling detached from others\n\n4. HYPERAROUSAL:\n• Easily startled (jumpiness)\n• Always on guard (hypervigilance)\n• Irritability, angry outbursts\n• Difficulty sleeping\n• Difficulty concentrating\n\nHOW IS IT DIAGNOSED?\nPTSD is diagnosed when symptoms last more than 1 month and cause significant distress or impairment. A mental health professional will take a detailed history.\n\nHOW IS IT TREATED?\nTRAUMA-FOCUSED THERAPY (First-line):\n• Trauma-Focused CBT — helps process traumatic memories\n• EMDR — uses eye movements to help the brain process trauma\n• Narrative Exposure Therapy — short-term therapy effective in low-resource settings\n\nMEDICATION:\n• Antidepressants (SSRIs): Sertraline or paroxetine — reduce all symptom clusters\n• Prazosin: Reduces nightmares\n\nSELF-HELP STRATEGIES:\n• Grounding: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste\n• Deep breathing: In for 4 counts, hold for 4, out for 6\n• Regular exercise — reduces hyperarousal\n• Sleep hygiene\n• Connect with trusted people — do not isolate\n\nSUPPORTING SOMEONE WITH PTSD:\n• Believe them — validate their experience\n• Do not pressure them to talk before ready\n• Encourage professional help — offer to accompany them\n• Be patient — recovery takes time\n\nPTSD IN KENYA:\nServices at Kenyatta, Mathari, Moi Hospitals. Counseling through Kenya Red Cross, LVCT Health, and other NGOs. Some services are low-cost or free.\n\nKEY POINTS TO REMEMBER:\nPTSD is a normal response to abnormal events — not a sign of weakness. Symptoms include intrusive memories, avoidance, negative mood, and hyperarousal. Therapy is highly effective. Recovery takes time and support. You are not alone.',
    keyPoints: [
      'PTSD develops after a traumatic event — symptoms include flashbacks, avoidance, hypervigilance',
      'PTSD is NOT a sign of weakness — it is a treatable medical condition',
      'Trauma-focused therapy (TF-CBT, EMDR, NET) is the most effective treatment',
      'Medication (SSRIs) can help, especially when combined with therapy',
      'Recovery takes time — support from family and professionals is essential',
    ],
    category: 'Mental Health',
    condition: 'mental-health',
    literacyLevel: 'intermediate',
    readTimeMinutes: 10,
    tags: ['PTSD', 'trauma', 'mental health', 'counseling', 'flashbacks', 'recovery'],
    icon: '🧠',
    references: ['WHO mhGAP PTSD Guidelines', 'APA PTSD Treatment Guidelines', 'Kenya MOH Mental Health Policy', 'LVCT Health Trauma Counseling Resources'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // MENTAL HEALTH — Schizophrenia
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'mh-schizophrenia',
    title: 'Understanding Schizophrenia — A Treatable Brain Disorder',
    summary: 'Schizophrenia is a serious mental illness where people lose touch with reality. With treatment, most people improve significantly.',
    content: 'WHAT IS SCHIZOPHRENIA?\nSchizophrenia is a chronic, severe mental disorder that affects how a person thinks, feels, and behaves. People with schizophrenia may seem like they have lost touch with reality. It affects about 1 in 100 people worldwide. It is NOT split personality or multiple personality disorder.\n\nWHY DOES IT HAPPEN?\nThe exact cause is not fully understood:\n• Genetics: Runs in families — having a parent or sibling with schizophrenia increases risk to about 10%\n• Brain chemistry: Imbalances in neurotransmitters (dopamine and glutamate)\n• Brain structure differences\n• Environmental: Stress, trauma, cannabis use in adolescence, viral infections during pregnancy\n• Typically develops between ages 16-30\n\nCOMMON MYTHS:\nMYTH: People with schizophrenia are violent\nTRUTH: Most are not violent. They are more likely to be victims than perpetrators.\n\nMYTH: Schizophrenia means split personality\nTRUTH: It involves psychosis (loss of contact with reality), not multiple identities.\n\nMYTH: Schizophrenia is untreatable\nTRUTH: It is highly treatable. Most people improve significantly with treatment.\n\nWHAT ARE THE SYMPTOMS?\nPOSITIVE SYMPTOMS (Added experiences):\n• Hallucinations: Hearing voices or seeing things that are not there — most commonly hearing voices\n• Delusions: Fixed false beliefs — being followed, special messages, special powers\n• Disorganized thinking: Speech that jumps between unrelated topics\n• Disorganized behavior: Unpredictable agitation or catatonia\n\nNEGATIVE SYMPTOMS (Reduced abilities):\n• Flat affect: Little emotional expression\n• Avolition: Lack of motivation\n• Alogia: Reduced speech\n• Anhedonia: Loss of pleasure\n• Social withdrawal\n\nCOGNITIVE SYMPTOMS:\n• Poor concentration\n• Memory problems\n• Difficulty planning\n\nPHASES:\n1. PRODROMAL: Withdrawal, decline in function, unusual thoughts — weeks to months before acute phase\n2. ACUTE: Active psychosis — hallucinations, delusions — usually needs hospital treatment\n3. RESIDUAL: Positive symptoms reduced, but negative symptoms may persist\n\nHOW IS IT DIAGNOSED?\nNo single test. A psychiatrist diagnoses based on clinical interview, symptoms lasting 6+ months, and ruling out other causes.\n\nHOW IS IT TREATED?\nMEDICATION (Antipsychotics) — The cornerstone:\nFirst-generation: Haloperidol, chlorpromazine — effective but more side effects\nSecond-generation: Risperidone, olanzapine, quetiapine, aripiprazole — fewer movement side effects\nMost people need medication indefinitely to prevent relapse. Long-acting injections are available every 2-4 weeks.\n\nPSYCHOSOCIAL:\n• CBT — helps with coping\n• Family therapy — reduces relapse\n• Social skills training\n• Vocational rehabilitation\n\nHOSPITAL: During acute episodes, usually 2-6 weeks. In Kenya: Mathari, Kenyatta, Moi Hospitals.\n\nWHAT CAN FAMILY DO?\n• Learn about the illness\n• Encourage medication adherence — main cause of relapse is stopping medication\n• Create a calm environment\n• Watch for early warning signs of relapse\n• Take care of your own mental health\n\nWHAT CAN THE PERSON DO?\n• Take medication daily — even when feeling well\n• Avoid alcohol and cannabis\n• Maintain regular sleep\n• Manage stress\n• Attend follow-up appointments\n• Recognize early warning signs\n\nKEY POINTS TO REMEMBER:\nSchizophrenia is a brain disorder affecting 1 in 100 people. Antipsychotic medication is essential. Stopping medication is the main cause of relapse. Family support improves outcomes. Recovery is possible — many people with schizophrenia live independently and work.',
    keyPoints: [
      'Schizophrenia causes hallucinations, delusions, and disorganized thinking',
      'Antipsychotic medication is essential — take daily even when feeling well',
      'Stopping medication is the most common cause of relapse',
      'Family support and education significantly improve recovery outcomes',
      'Recovery is possible — many people with schizophrenia work and live independently',
    ],
    category: 'Mental Health',
    condition: 'mental-health',
    literacyLevel: 'advanced',
    readTimeMinutes: 11,
    tags: ['schizophrenia', 'psychosis', 'hallucinations', 'delusions', 'antipsychotics', 'mental health'],
    icon: '🧠',
    references: ['WHO mhGAP Schizophrenia Guidelines', 'APA Schizophrenia Treatment Guidelines', 'Kenya MOH Mental Health Policy', 'Mathari Hospital Treatment Protocols'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // PEDIATRIC — Diarrhea in Children
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ped-diarrhea',
    title: 'Diarrhea in Children — Prevention and Home Treatment',
    summary: 'Diarrhea is a leading cause of death in children under 5 in Kenya. Most deaths are preventable with simple home treatment — ORS and zinc.',
    content: 'WHAT IS DIARRHEA?\nDiarrhea is the passage of 3 or more loose or watery stools in 24 hours. It is extremely common in children under 5. The danger is not the diarrhea itself but the loss of water and electrolytes (dehydration), which can be fatal if not treated.\n\nWHY DOES IT HAPPEN?\nMost diarrhea in Kenyan children is caused by:\n• Rotavirus (preventable by vaccine)\n• Other viruses (norovirus, adenovirus)\n• Bacteria — E. coli, Shigella, Vibrio cholerae, Salmonella\n• Parasites — Giardia, Amoeba\n• Poor hygiene and sanitation\n• Malnutrition — weakens immune system\n\nDANGER SIGNS — GO TO HOSPITAL IMMEDIATELY:\n• Any blood in stool (dysentery)\n• Vomiting — cannot keep any fluids down\n• Very frequent diarrhea (more than 6 watery stools in 24 hours)\n• Lethargy — unusually sleepy or difficult to wake\n• Sunken eyes\n• Dry mouth and tongue\n• Skin pinch goes back very slowly (more than 2 seconds)\n• No urine for 6 hours\n• Child under 6 months with diarrhea\n• Seizures or convulsions\n\nHOME TREATMENT — PLAN A (No signs of dehydration):\nORS: Mix 1 sachet with 1 litre clean water — give small sips frequently. Amount: 50-100ml after each loose stool for young children, 100-200ml for older children.\nZINC: Under 6 months: 10mg daily for 10-14 days. Over 6 months: 20mg daily for 10-14 days. Zinc reduces diarrhea severity and duration by 25%.\nContinue breastfeeding — breast milk contains antibodies and fluids.\nContinue feeding — do NOT stop food. Offer soft foods: porridge, mashed bananas, rice.\n\nPLAN B (Some dehydration): Health worker gives ORS under supervision.\nPLAN C (Severe dehydration): IV fluids at hospital.\n\nWHEN ANTIBIOTICS ARE NEEDED:\n• Blood in stool (dysentery)\n• Suspected cholera\n• Only a health worker determines this\n• Never use anti-diarrhea medications in children — they are dangerous\n\nPREVENTION:\n• Rotavirus vaccine — at 6 and 10 weeks — reduces severe rotavirus by 85-90%\n• Hand washing with soap — reduces diarrhea by 40-50%\n• Boil drinking water or use water treatment\n• Use a latrine\n• Exclusive breastfeeding for first 6 months\n• Vitamin A every 6 months\n\nKEY POINTS TO REMEMBER:\nORS and zinc are the most important treatments — start immediately. Continue feeding and breastfeeding. Go to hospital if blood in stool, cannot keep fluids down, or signs of severe dehydration. Rotavirus vaccine, hand washing, and safe water prevent diarrhea.',
    keyPoints: [
      'ORS and zinc are the most important treatments — start at the first sign of diarrhea',
      'Go to hospital if: blood in stool, vomiting everything, signs of severe dehydration',
      'Continue breastfeeding and feeding — do NOT stop food',
      'Rotavirus vaccine prevents the most common cause of severe diarrhea',
      'Wash hands with soap, boil drinking water, use a latrine',
    ],
    category: 'Condition Basics',
    condition: 'pediatric',
    literacyLevel: 'basic',
    readTimeMinutes: 9,
    tags: ['diarrhea', 'dehydration', 'ORS', 'zinc', 'children', 'rotavirus'],
    icon: '🧒',
    references: ['WHO Diarrhea Treatment Guidelines', 'Kenya MOH IMCI Guidelines', 'UNICEF Diarrhea Prevention Report', 'KEMRI Diarrhea Research'],
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // GENERAL HEALTH — ADDITIONAL: Communicating with Your Doctor
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'gen-communicating',
    title: 'Communicating with Your Doctor — Get the Most Out of Every Visit',
    summary: 'Good communication between you and your doctor leads to better health outcomes. Learn how to prepare for appointments and speak up about your concerns.',
    content: 'WHY COMMUNICATION MATTERS:\nYour doctor wants to help you, but they can only help with what they know. Good communication ensures your doctor understands your symptoms, concerns, and preferences. Studies show that patients who communicate well with their doctors have better health outcomes, higher satisfaction, and are more likely to take medications as prescribed.\n\nBEFORE YOUR APPOINTMENT — PREPARE:\n• Write down your questions before you go — don\'t trust yourself to remember them in the moment. Keep a list in your phone or on paper.\n• Bring your medication list: All medications, doses, and how often you take them. Include over-the-counter drugs, herbal remedies, and traditional medicines.\n• Bring your medical records: Previous test results, discharge summaries, referral letters.\n• Bring your BP log or blood sugar log (if you monitor at home).\n• Bring a family member or friend: They can help remember what the doctor says, ask questions you forget, and provide support.\n\nDURING THE APPOINTMENT:\nBE HONEST — YOUR DOCTOR IS NOT JUDGING YOU:\n• Tell your doctor if you have missed medications — it is important information, not a failure. Hiding it can lead to wrong treatment decisions.\n• Tell your doctor about any herbal or traditional medicines you take.\n• Tell your doctor about alcohol, smoking, or drug use — they need the full picture.\n• Tell your doctor if you cannot afford medications — there may be cheaper options.\n\nASK QUESTIONS — THE 3 KEY QUESTIONS:\nAsk these three questions at EVERY visit:\n1. "What is my main problem?" (Understanding your diagnosis)\n2. "What do I need to do?" (Understanding your treatment plan)\n3. "Why is it important for me to do this?" (Understanding why it matters)\n\nOTHER IMPORTANT QUESTIONS:\n• "What are the side effects of this medication?"\n• "How will I know if the treatment is working?"\n• "What symptoms should I watch for and when should I come back?"\n• "Is there a cheaper alternative?"\n• "Can I take traditional medicines with my prescribed medications?"\n• "What is the plan if this treatment does not work?"\n\nIF YOU DO NOT UNDERSTAND:\n• Say: "I do not understand. Can you explain it in a different way?" — This is normal and important. Doctors use complex language without realising it.\n• Ask the doctor to write down the main points.\n• Repeat back what you understood: "Let me make sure I understood correctly. I need to..." — This helps catch misunderstandings.\n• Ask about side effects: "What problems should I watch for?"\n• Ask about follow-up: "When should I come back? What symptoms mean I should come sooner?"\n\nAFTER YOUR APPOINTMENT:\n• Review what the doctor said while it is fresh in your mind\n• Take your medications as prescribed\n• Follow up on referrals and tests\n• Call the clinic if you have new questions or symptoms\n\nREMEMBER: Your doctor is your partner in health. Good communication is a two-way street. Speak up, ask questions, and make sure you understand.',
    keyPoints: [
      'Prepare for appointments: write down questions, bring medications list, bring a family member',
      'Be honest about medications you have missed, herbal remedies, alcohol, and smoking',
      'Ask: "What is my main problem? What do I need to do? Why is it important?"',
      'If you don\'t understand, speak up — your doctor wants you to understand',
      'You and your doctor are a team — good communication leads to better health',
    ],
    category: 'Self-Care',
    condition: 'general',
    literacyLevel: 'basic',
    readTimeMinutes: 8,
    tags: ['doctor communication', 'patient rights', 'healthcare', 'self-advocacy', 'appointments'],
    icon: '🗣️',
    references: ['WHO Patient Engagement Guidelines', 'Kenya MOH Patient Rights Charter', 'Agency for Healthcare Research and Quality Communication Tips'],
  },

  // ── ADDED: EXACT TOPIC MATCHES FOR DEPARTMENT DEFINITIONS ──

  {
    id: 'htn-understanding-bp-numbers',
    title: 'Understanding blood pressure numbers',
    summary: 'Know what systolic and diastolic numbers mean and why keeping them in a healthy range protects your heart, brain, and kidneys.',
    content: 'WHAT ARE BLOOD PRESSURE NUMBERS?\nYour blood pressure reading has two numbers:\n• SYSTOLIC (top number) — The pressure when your heart beats and pumps blood out\n• DIASTOLIC (bottom number) — The pressure when your heart rests between beats\n\nBoth numbers are important. A high reading in either number increases your health risks.\n\nWHAT DO THE NUMBERS MEAN?\nNORMAL: Below 120/80 — Your blood pressure is healthy. Keep doing what you are doing.\nELEVATED: 120-129 / below 80 — You are at risk. Time to make lifestyle changes.\nSTAGE 1 HYPERTENSION: 130-139 / 80-89 — Your doctor may recommend lifestyle changes and medication.\nSTAGE 2 HYPERTENSION: 140 or higher / 90 or higher — You need medication and lifestyle changes.\nHYPERTENSIVE CRISIS: Above 180 / above 120 — Emergency! Call a doctor immediately.\n\nWHY DOES IT MATTER?\nHigh blood pressure damages your arteries over time, like high water pressure damages a hose. This damage can lead to:\n• Heart attack\n• Stroke\n• Kidney failure\n• Vision loss\n• Sexual dysfunction\n\nThe good news: High blood pressure can be treated. Lifestyle changes and medications can bring it down and protect your organs.\n\nHOW IS IT MEASURED?\n• At the clinic: Your doctor or nurse will use a cuff around your arm. Sit quietly for 5 minutes before the reading.\n• At home: Use a validated automatic monitor. Measure at the same time each day. Keep a log to show your doctor.\n\nTIPS FOR ACCURATE READINGS:\n• Empty your bladder first\n• Sit with back supported, feet flat on floor\n• Rest arm on table at heart level\n• No talking during measurement\n• Take two readings 1 minute apart and average them\n\nREMEMBER: One high reading does not mean you have hypertension. Your doctor needs to see several readings over time to make a diagnosis.',
    keyPoints: [
      'Blood pressure has two numbers: systolic (top) and diastolic (bottom)',
      'Normal is below 120/80; Stage 2 hypertension is 140/90 or higher',
      'Above 180/120 is a hypertensive emergency — seek care immediately',
      'High blood pressure damages arteries and can lead to heart attack, stroke, kidney failure',
      'Lifestyle changes and medications can lower blood pressure and protect your health',
    ],
    category: 'Cardiovascular',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['blood pressure', 'hypertension', 'systolic', 'diastolic', 'bp numbers'],
    icon: '❤️',
  },
  {
    id: 'htn-physical-activity-guidelines',
    title: 'Physical activity guidelines',
    summary: 'Regular physical activity is one of the most effective ways to lower blood pressure, control weight, and improve overall health.',
    content: 'WHY PHYSICAL ACTIVITY MATTERS:\nRegular exercise is one of the most effective things you can do for your health. It lowers blood pressure, strengthens your heart, improves blood sugar, helps with weight loss, reduces stress, and improves sleep.\n\nHOW MUCH DO YOU NEED?\nThe World Health Organization recommends:\n• At least 150 minutes of moderate-intensity aerobic activity per week (about 30 minutes, 5 days per week)\nOR\n• At least 75 minutes of vigorous-intensity aerobic activity per week\nPLUS\n• Muscle-strengthening activities on 2 or more days per week\n\nWHAT COUNTS AS MODERATE INTENSITY?\nYou should be breathing harder than normal but still able to talk. Examples:\n• Brisk walking (5-6 km/hour)\n• Cycling on flat ground\n• Dancing\n• Gardening or mopping\n• Swimming\n\nWHAT COUNTS AS VIGOROUS INTENSITY?\nYou should be breathing very hard and unable to say more than a few words. Examples:\n• Running or jogging\n• Cycling fast or uphill\n• Football or netball\n• Swimming laps\n• Jumping rope\n\nGETTING STARTED:\n• Start slow: Even 10-minute sessions are beneficial. Build up gradually.\n• Pick activities you enjoy — you are more likely to stick with them.\n• Find a walking buddy or join a group.\n• Set a regular time each day — morning works well for many people.\n• Use a step counter: Aim for 6,000-10,000 steps per day.\n\nSAFETY TIPS:\n• If you have chest pain, severe shortness of breath, or dizziness during exercise, stop and rest. Tell your doctor.\n• Stay hydrated — drink water before, during, and after exercise.\n• Wear comfortable shoes and appropriate clothing.\n• Warm up for 5 minutes before exercise and cool down afterward.\n• If it is very hot, exercise in the early morning or late evening.\n\nREMEMBER: Any activity is better than none. Sitting for long periods is harmful — get up and move every 30 minutes.',
    keyPoints: [
      'Aim for 30 minutes of moderate activity 5 days per week',
      'Brisk walking is excellent exercise — free and accessible',
      'Start slowly and build up gradually',
      'Any activity is better than none — get up and move every 30 minutes',
      'Stop and consult your doctor if you experience chest pain or dizziness',
    ],
    category: 'Cardiovascular',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['exercise', 'physical activity', 'walking', 'fitness', 'heart health'],
    icon: '🏃',
  },
  {
    id: 'htn-alcohol-smoking-cessation',
    title: 'Alcohol & smoking cessation',
    summary: 'Reducing alcohol and quitting smoking are two of the most powerful changes you can make to lower blood pressure and improve your health.',
    content: 'WHY QUITTING SMOKING MATTERS:\nEvery cigarette you smoke raises your blood pressure for 15-30 minutes. Over time, smoking damages your artery walls, making them stiff and narrow. This forces your heart to work harder and increases your risk of heart attack, stroke, and kidney disease.\n\nBENEFITS OF QUITTING SMOKING:\n• Within 20 minutes: Blood pressure drops to normal\n• Within 24 hours: Risk of heart attack starts to decrease\n• Within 2-12 weeks: Circulation improves, lung function increases\n• Within 1 year: Risk of heart disease is cut in half\n• Within 5-15 years: Risk of stroke equals a non-smoker\n\nHOW TO QUIT SMOKING:\n• Pick a quit date and tell your family and friends\n• Remove all cigarettes, lighters, and ashtrays from your home\n• Identify your triggers (coffee, alcohol, stress) and plan alternatives\n• Use nicotine replacement therapy if available: patches, gum, or lozenges\n• Ask your doctor about medications that can help\n• Join a support group or call a quitline\n• Do not give up — most people try several times before succeeding\n\nWHY REDUCING ALCOHOL MATTERS:\nAlcohol raises blood pressure in several ways: it activates your nervous system, increases stress hormones, damages artery walls, and can interfere with blood pressure medications. Heavy drinking is directly linked to hypertension.\n\nALCOHOL GUIDELINES:\n• Men: No more than 2 standard drinks per day (maximum 14 per week)\n• Women: No more than 1 standard drink per day (maximum 7 per week)\n• One standard drink = 340ml beer, 140ml wine, or 40ml spirits\n• Binge drinking (4+ drinks in one session) is especially dangerous for blood pressure\n\nTIPS TO REDUCE ALCOHOL:\n• Set a limit before you start drinking and stick to it\n• Alternate alcoholic drinks with water or soda\n• Eat before and while drinking\n• Avoid drinking every day — have alcohol-free days\n• Choose low-alcohol or non-alcoholic options\n• Keep track of how much you drink in a week\n\nREMEMBER: Quitting smoking is the single best thing you can do for your health. Reducing alcohol also provides major benefits. Your doctor can help you with both.',
    keyPoints: [
      'Smoking raises blood pressure every time you smoke; quitting brings immediate benefits',
      'Within 24 hours of quitting, your risk of heart attack starts to decrease',
      'Limit alcohol: men no more than 2 drinks/day, women no more than 1 drink/day',
      'Identify your triggers and plan alternatives to smoking and drinking',
      'Ask your doctor for help quitting — medications and support are available',
    ],
    category: 'Cardiovascular',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['smoking', 'alcohol', 'cessation', 'quitting', 'lifestyle'],
    icon: '🚭',
  },
  {
    id: 'htn-recognising-emergency-symptoms',
    title: 'Recognising hypertensive emergency symptoms',
    summary: 'Very high blood pressure can cause a medical emergency. Know the warning signs and when to get help immediately.',
    content: 'WHAT IS A HYPERTENSIVE EMERGENCY?\nA hypertensive emergency occurs when blood pressure rises very high (usually above 180/120) AND is causing damage to organs. This is a life-threatening situation requiring immediate medical attention.\n\nWARNING SIGNS — GET HELP IMMEDIATELY:\nIf you have high blood pressure AND any of these symptoms, go to the nearest hospital or call for emergency help:\n• Severe headache — the worst headache you have ever had, especially if it starts suddenly\n• Blurred vision or vision changes — double vision, temporary vision loss, or seeing spots\n• Chest pain or pressure — especially if it radiates to your arm, jaw, or back\n• Shortness of breath — difficulty breathing or feeling like you cannot get enough air\n• Numbness or weakness — especially on one side of your face, arm, or leg\n• Difficulty speaking — slurred speech or trouble finding words\n• Severe anxiety or confusion — feeling very agitated or disoriented\n• Nausea or vomiting — especially with severe headache\n• Seizure\n• Blood in urine\n\nWHAT IS HYPERTENSIVE URGENCY?\nHypertensive urgency is when blood pressure is very high (above 180/120) but there are NO symptoms of organ damage. This still needs to be treated promptly, usually with medication adjustments, but is not immediately life-threatening.\n\nWHAT CAUSES HYPERTENSIVE EMERGENCY?\n• Missing blood pressure medications\n• Taking certain medications that raise blood pressure (NSAIDs, cold medicines, herbal remedies)\n• Using cocaine, amphetamines, or other stimulants\n• Kidney disease\n• Preeclampsia in pregnancy\n• Certain hormone disorders\n\nWHAT TO DO IF IT HAPPENS:\n1. Do NOT wait to see if it gets better — go to the hospital\n2. Do NOT drive yourself — ask someone else to drive or call an ambulance\n3. Tell the emergency staff: "I have high blood pressure and I have [symptoms]"\n4. Bring your medication list with you\n5. Do not take extra doses of your medication unless told to by a doctor\n\nHOW TO PREVENT IT:\n• Take your blood pressure medications exactly as prescribed — never skip doses\n• Monitor your blood pressure at home and keep a log\n• Avoid NSAIDs (ibuprofen, diclofenac) and cold medicines containing decongestants\n• Limit alcohol\n• Do not use recreational drugs\n• Keep your follow-up appointments',
    keyPoints: [
      'BP above 180/120 WITH symptoms is a hypertensive emergency — go to hospital immediately',
      'Warning signs: severe headache, blurred vision, chest pain, shortness of breath, numbness',
      'Do not wait to see if symptoms improve — get emergency help right away',
      'Do not drive yourself — ask someone else or call an ambulance',
      'Prevent emergencies by taking medications daily and monitoring your BP at home',
    ],
    category: 'Cardiovascular',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['hypertensive emergency', 'emergency', 'high blood pressure', 'warning signs', 'crisis'],
    icon: '🚨',
  },
  {
    id: 'htn-home-bp-monitoring',
    title: 'Home blood pressure monitoring',
    summary: 'Monitoring your blood pressure at home helps you and your doctor make better treatment decisions. Learn how to get accurate readings.',
    content: 'WHY MONITOR AT HOME?\nHome blood pressure monitoring gives you and your doctor a more complete picture of your blood pressure than occasional clinic readings alone. Many people have "white coat hypertension" (high readings at the clinic due to anxiety) or "masked hypertension" (normal at clinic but high at home). Home monitoring helps identify both.\n\nWHAT EQUIPMENT DO YOU NEED?\n• A validated automatic blood pressure monitor with an upper arm cuff (wrist monitors are less accurate)\n• Choose a monitor with the correct cuff size — measure your arm circumference and match it to the cuff size\n• Bring your monitor to your clinic at least once a year to check its accuracy\n\nHOW TO MEASURE CORRECTLY:\n1. Do not smoke, exercise, or drink caffeine for 30 minutes before measuring\n2. Empty your bladder (a full bladder raises BP)\n3. Sit quietly for 5 minutes in a chair with back support\n4. Rest your feet flat on the floor — do not cross your legs\n5. Place the cuff on your bare upper arm (not over clothing)\n6. Position the cuff at heart level — rest your arm on a table\n7. Place the bottom edge of the cuff 2-3 cm above your elbow crease\n8. Do not talk during the measurement\n9. Take two readings 1 minute apart and record both\n10. Take readings at the same time each day — morning before medications and evening\n\nWHAT NUMBERS TO TRACK:\nKeep a log with:\n• Date and time\n• Systolic and diastolic readings\n• Pulse rate\n• Any notes: before/after medication, how you are feeling\n\nTARGETS:\n• Most people: Below 135/85 at home\n• People with diabetes or kidney disease: Below 130/80\n• People over 80: Your doctor will set an individual target\n\nWHEN TO CALL YOUR DOCTOR:\n• Readings consistently above your target for several days\n• A single reading above 180/120 — especially if you have symptoms\n• Large changes between readings\n• Your monitor is giving error messages\n\nREMEMBER: One high reading is not a reason to panic. Look at trends over time. Share your log with your doctor at every visit.',
    keyPoints: [
      'Use a validated upper arm automatic monitor with correct cuff size',
      'Sit quietly for 5 minutes before measuring; feet flat, arm at heart level',
      'Take two readings 1 minute apart at the same time each day',
      'Keep a log with date, time, and both systolic and diastolic numbers',
      'Home target is below 135/85 for most people',
    ],
    category: 'Cardiovascular',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['blood pressure monitor', 'home monitoring', 'bp log', 'self-measurement', 'hypertension'],
    icon: '🩺',
  },
  {
    id: 'htn-medication-adherence',
    title: 'Medication adherence importance',
    summary: 'Taking your blood pressure medications as prescribed every day is the most important thing you can do to prevent heart attack, stroke, and kidney disease.',
    content: 'WHY MEDICATION ADHERENCE MATTERS:\nBlood pressure medications work only when you take them consistently. Missing even a few doses can cause your blood pressure to rise to dangerous levels. Studies show that patients who take their medications as prescribed have much lower rates of heart attack, stroke, and kidney failure.\n\nCOMMON REASONS PEOPLE STOP MEDICATIONS:\n1. "I feel fine so I do not need them" — High blood pressure has no symptoms. Feeling fine does not mean your BP is controlled. The damage is happening silently.\n2. "The side effects are too much" — Many side effects improve over time or can be managed. Tell your doctor — there are many alternatives.\n3. "I cannot afford the medications" — Tell your doctor. There may be cheaper generics, and some conditions qualify for government programmes.\n4. "I do not like taking pills" — You are protecting your future self. Think of it as an investment in your health.\n5. "I took my BP and it was normal so I stopped" — Your BP is normal BECAUSE of the medication. Stopping will cause it to rise again.\n\nTIPS FOR STAYING ON TRACK:\n• Link medication to a daily habit: Take it with breakfast or brushing your teeth\n• Use a pill organizer — fill it once a week\n• Set a daily alarm on your phone\n• Keep medications visible — near your toothbrush or coffee\n• Refill your prescription before you run out — keep a 1-week extra supply\n• Ask a family member to remind you\n• Use a medication tracking app\n\nWHAT TO DO IF YOU MISS A DOSE:\n• If you remember within a few hours, take it right away\n• If it is almost time for your next dose, skip the missed dose — do not double up\n• If you miss doses frequently, talk to your doctor about simplifying your regimen\n\nTALK TO YOUR DOCTOR:\nDo not stop or change your medication without talking to your doctor first. If you are having side effects, difficulty affording medications, or trouble remembering doses, your doctor can help. There are many options — the right one is the one you can take consistently.',
    keyPoints: [
      'Take medications every day as prescribed — even when you feel fine',
      'Missing doses allows BP to rise and damage your organs silently',
      'Use pill organizers, phone alarms, and daily habits to remember doses',
      'Tell your doctor about side effects, cost concerns, or difficulty remembering',
      'Never stop or change medications without talking to your doctor first',
    ],
    category: 'Cardiovascular',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['medication adherence', 'compliance', 'bp medications', 'daily routine', 'hypertension'],
    icon: '💊',
  },
  {
    id: 'htn-salt-restriction-dash',
    title: 'Salt restriction and DASH diet',
    summary: 'Reducing salt and following the DASH diet are proven ways to lower blood pressure naturally. Learn how to make these changes.',
    content: 'WHY SALT MATTERS:\nSalt (sodium) causes your body to hold onto water. More water in your blood vessels means higher pressure. Most Kenyans consume far more salt than recommended — much of it hidden in processed foods, bread, sauces, and restaurant meals.\n\nHOW MUCH SALT DO YOU NEED?\n• Recommended: Less than 5 grams (1 teaspoon) of salt per day\n• That includes ALL salt from all sources — cooking, table salt, and hidden salt in foods\n• People with high blood pressure, diabetes, or kidney disease may need even less (3-4 grams)\n\nHOW TO REDUCE SALT:\n• Remove the salt shaker from the table\n• Reduce salt in cooking — use herbs, spices, garlic, ginger, lemon, or vinegar instead\n• Avoid processed foods: Sausages, bacon, ham, canned soups, instant noodles, salty snacks\n• Read food labels — look for sodium content (aim for less than 400mg per serving)\n• Choose fresh or frozen vegetables over canned\n• Rinse canned beans and vegetables before cooking\n• Limit sauces: Soy sauce, ketchup, stock cubes are very high in salt\n• When eating out, ask for food prepared without added salt\n\nINTRODUCING THE DASH DIET:\nDASH stands for "Dietary Approaches to Stop Hypertension." It is not a restrictive diet — it is a way of eating proven in research studies to lower blood pressure significantly.\n\nDASH DIET PRINCIPLES:\nEAT MORE:\n• Vegetables and fruits: 4-5 servings each per day\n• Whole grains: Brown rice, oats, whole wheat bread, millet, sorghum\n• Beans, lentils, and peas: Dried or canned (rinsed)\n• Low-fat or fat-free dairy: Milk, yogurt, mala (fermented milk)\n• Fish and poultry: Grilled or baked, not fried\n• Nuts and seeds: Unsalted\n• Healthy oils: Olive, sunflower, canola\n\nLIMIT:\n• Red meat: Beef, goat, lamb — eat only occasionally\n• Sugary foods and drinks: Soda, sweets, cakes\n• Full-fat dairy\n• Coconut oil and ghee\n• Fried foods\n\nSAMPLE DAY ON DASH:\nBREAKFAST: Oatmeal with sliced banana and low-fat milk\nLUNCH: Brown rice with grilled fish, sukuma wiki, and tomato-onion salad\nSNACK: An apple and a handful of unsalted groundnuts\nDINNER: Whole wheat chapati with beans and vegetable stew\n\nREMEMBER: Start with small changes. Replace one salty habit at a time. Every reduction helps.',
    keyPoints: [
      'Limit salt to less than 5 grams (1 teaspoon) per day from all sources',
      'Cook with herbs, spices, garlic, ginger, and lemon instead of salt',
      'Avoid processed foods — they contain hidden salt',
      'The DASH diet emphasizes vegetables, fruits, whole grains, and lean protein',
      'Start with small changes — every reduction in salt helps lower blood pressure',
    ],
    category: 'Cardiovascular',
    condition: 'hypertension',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['salt restriction', 'DASH diet', 'sodium', 'nutrition', 'heart-healthy eating'],
    icon: '🥗',
  },
  {
    id: 'dm-carbohydrate-counting',
    title: 'Carbohydrate counting and glycaemic index',
    summary: 'Carbohydrates affect your blood sugar the most. Learning to count carbs and choose low-glycaemic foods helps you control diabetes.',
    content: 'WHAT ARE CARBOHYDRATES?\nCarbohydrates are one of the three main nutrients in food (along with protein and fat). They are the body\'s main source of energy. Carbohydrates are broken down into glucose (sugar) during digestion, which raises blood sugar.\n\nTYPES OF CARBOHYDRATES:\n• SIMPLE CARBS: Sugar, honey, soda, sweets, fruit juice — these raise blood sugar quickly\n• COMPLEX CARBS: Whole grains, beans, vegetables — these raise blood sugar more slowly\n• FIBRE: Found in vegetables, fruits, whole grains, beans — fibre slows down digestion and helps control blood sugar\n\nWHICH FOODS CONTAIN CARBOHYDRATES?\n• Grains: Ugali, rice, chapati, bread, pasta, oatmeal, millet, sorghum\n• Starchy vegetables: Potatoes, maize, cassava, arrowroot, green bananas\n• Fruits: All fruits contain natural sugars\n• Beans and lentils\n• Milk and yoghurt\n• Sugary foods: Soda, juice, cakes, biscuits, sweets, honey\n\nNON-CARB FOODS:\n• Meat, fish, and eggs (no carbs)\n• Oils and fats (no carbs)\n• Green vegetables (very low carbs)\n• Cheese (very low carbs)\n\nWHAT IS THE GLYCAEMIC INDEX (GI)?\nGlycaemic Index measures how quickly a food raises blood sugar:\n• LOW GI (55 or less): Raises blood sugar slowly — beans, lentils, whole grains, most vegetables, apples, oranges\n• MEDIUM GI (56-69): Moderate effect — brown rice, whole wheat bread, sweet potato\n• HIGH GI (70 or more): Raises blood sugar quickly — white rice, white bread, ugali made from refined maize, potatoes, watermelon, soda\n\nTIPS FOR BLOOD SUGAR CONTROL:\n• Choose whole grains over refined — brown rice instead of white, whole wheat chapati instead of white\n• Eat carbohydrates with protein or fat — this slows down digestion: add beans to rice, egg with bread\n• Eat vegetables first at meals — fibre slows sugar absorption\n• Watch portion sizes — even healthy carbs raise blood sugar if you eat too much\n• Spread carbs throughout the day — do not eat them all at one meal\n• Choose fruit instead of fruit juice — whole fruit has fibre, juice is mostly sugar water\n• Limit sugary drinks entirely — they are the fastest way to raise blood sugar\n\nREMEMBER: You do not need to eliminate carbohydrates. You need to choose the right types and control portions. Your dietitian or diabetes educator can help you determine how many carbs per meal are right for you.',
    keyPoints: [
      'Carbohydrates raise blood sugar the most — focus on choosing the right types',
      'Low GI foods (beans, whole grains, vegetables) raise blood sugar slowly',
      'Eat carbs with protein or fat to slow glucose absorption',
      'Watch portion sizes — even healthy carbs affect blood sugar in large amounts',
      'Avoid sugary drinks entirely — they raise blood sugar rapidly',
    ],
    category: 'Endocrinology',
    condition: 'type_2_diabetes',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['carbohydrates', 'glycaemic index', 'blood sugar', 'diabetes', 'nutrition'],
    icon: '🥔',
  },
  {
    id: 'dm-sick-day-rules',
    title: 'Sick day rules for diabetics',
    summary: 'Illness can cause dangerous blood sugar swings in people with diabetes. Follow these sick day rules to stay safe when you are unwell.',
    content: 'WHY SICK DAYS ARE DANGEROUS:\nWhen you are sick, your body releases stress hormones that raise blood sugar — even if you are not eating. This can lead to very high blood sugar (hyperglycaemia) and diabetic ketoacidosis (DKA), especially in Type 1 diabetes. Illness can also cause low blood sugar if you are vomiting and cannot keep food down.\n\nSICK DAY RULES — THE BASICS:\n1. NEVER STOP YOUR DIABETES MEDICATIONS — This is the most important rule. Even if you cannot eat, continue your insulin or diabetes medications. You may need even more insulin during illness. Contact your doctor for dose adjustments.\n2. CHECK BLOOD SUGAR MORE OFTEN — Check every 2-4 hours (or more often if very ill). Illness can cause rapid changes.\n3. CHECK FOR KETONES — If you have Type 1 diabetes, check urine or blood ketones every 4-6 hours. Ketones indicate your body is breaking down fat for energy, which can lead to DKA.\n4. STAY HYDRATED — Drink at least 250ml (one glass) of water or sugar-free fluid every hour. If you are vomiting, take small sips frequently.\n5. TRY TO EAT — If you can eat, continue your usual meals. If you cannot eat solid foods, try:\n  • Regular soda or fruit juice (150ml every hour if blood sugar is low)\n  • Crackers or toast\n  • Soup\n  • Yoghurt\n  • Porridge\n6. KNOW WHEN TO CALL YOUR DOCTOR:\n  • Blood sugar consistently above 250 mg/dL (14 mmol/L) despite taking medication\n  • Moderate or large ketones\n  • Vomiting for more than 4 hours — cannot keep fluids down\n  • Diarrhoea for more than 6 hours\n  • Fever above 38.5°C for more than 24 hours\n  • Blood sugar below 70 mg/dL (3.9 mmol/L) and cannot raise it\n  • You are unsure what to do\n  • You are getting worse instead of better\n\nCREATE A SICK DAY KIT:\nPrepare a small box or bag in advance containing:\n• Your diabetes medication list and doses\n• Blood glucose test strips and lancets\n• Ketone test strips\n• Glucose tablets or a small bottle of regular soda (for low blood sugar)\n• Your doctor\'s phone number\n• A list of emergency contacts\n\nREMEMBER: Have a plan BEFORE you get sick. Talk to your doctor about what you should do and get written sick day guidelines. Keep them somewhere easy to find.',
    keyPoints: [
      'NEVER stop your diabetes medications when sick — you may need more, not less',
      'Check blood sugar every 2-4 hours during illness',
      'Drink at least one glass of sugar-free fluid every hour',
      'Check for ketones if you have Type 1 diabetes',
      'Prepare a sick day kit in advance with supplies and emergency contacts',
    ],
    category: 'Endocrinology',
    condition: 'type_2_diabetes',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['sick day rules', 'diabetes', 'illness', 'ketones', 'emergency'],
    icon: '🤒',
  },
  {
    id: 'dm-healthy-eating-plate',
    title: 'Healthy eating plate method',
    summary: 'The plate method makes healthy eating simple: fill half your plate with vegetables, a quarter with protein, and a quarter with carbohydrates.',
    content: 'WHAT IS THE PLATE METHOD?\nThe plate method is a simple way to build balanced meals without counting calories or weighing food. Use a standard dinner plate (about 23cm / 9 inches across) and divide it into three sections.\n\nHOW TO FILL YOUR PLATE:\n½ PLATE — NON-STARCHY VEGETABLES (FILL FIRST)\n  • Sukuma wiki, spinach, cabbage, broccoli, cauliflower\n  • Carrots, bell peppers, tomatoes, onions\n  • Salad greens, cucumber\n  • These vegetables are low in calories and carbohydrates\n  • They provide fibre, vitamins, and minerals\n  • Eat a variety of colours\n\n¼ PLATE — LEAN PROTEIN\n  • Fish (tilapia, omena, sardines) — grilled or baked\n  • Skinless chicken — grilled or boiled\n  • Eggs\n  • Beans, lentils, cowpeas, green grams\n  • Lean beef or goat (small portions, occasional)\n  • Protein keeps you full and helps maintain muscle\n\n¼ PLATE — CARBOHYDRATES (STARCH)\n  • Ugali, brown or white rice (small portion)\n  • Chapati, whole wheat bread\n  • Potatoes, sweet potatoes, green bananas, cassava\n  • Oats, millet, sorghum\n  • Choose whole grains when possible\n  • Portion size: About the size of your closed fist\n\nADD: A serving of fruit and low-fat milk/yoghurt on the side\n\nPLATE METHOD FOR DIFFERENT MEALS:\nLUNCH EXAMPLE:\n½ plate: Sukuma wiki with tomato and onion\n¼ plate: Grilled tilapia\n¼ plate: Brown rice (fist-sized portion)\nSide: An orange and a glass of low-fat milk\n\nDINNER EXAMPLE:\n½ plate: Mixed vegetable salad with lemon dressing\n¼ plate: Boiled beans with onion and tomato\n¼ plate: Whole wheat chapati\nSide: A small bowl of fresh fruit salad\n\nBENEFITS OF THE PLATE METHOD:\n• No counting or measuring required\n• Automatically controls portions\n• Ensures balanced nutrition\n• Flexible — works for any cuisine\n• Easy to teach and remember\n\nTIPS FOR SUCCESS:\n• Fill your plate in order: vegetables first, then protein, then carbohydrates\n• Use a smaller plate to reduce portions\n• Add vegetables to every meal — fresh, frozen, or cooked\n• Drink water with your meal\n• Eat slowly — it takes 20 minutes for your brain to feel full\n\nREMEMBER: The plate method works for the whole family, not just people with diabetes. It is a healthy way of eating for everyone.',
    keyPoints: [
      'Fill half your plate with non-starchy vegetables, a quarter with lean protein, a quarter with carbohydrates',
      'The plate method automatically controls portions without counting calories',
      'Choose whole grains and a variety of colourful vegetables',
      'Add fruit and low-fat dairy on the side',
      'Fill vegetables first, then protein, then carbohydrates — in that order',
    ],
    category: 'Endocrinology',
    condition: 'type_2_diabetes',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['plate method', 'healthy eating', 'portion control', 'diabetes', 'nutrition'],
    icon: '🍽️',
  },
  {
    id: 'ckd-diet-protein-potassium',
    title: 'Dietary protein and potassium restriction',
    summary: 'In chronic kidney disease, managing protein and potassium intake helps protect your remaining kidney function and prevents complications.',
    content: 'WHY DIET MATTERS IN CKD:\nWhen your kidneys are not working well, they cannot filter waste products from your blood effectively. What you eat directly affects the workload on your kidneys. Dietary changes can slow the progression of kidney disease and prevent complications.\n\nPROTEIN:\nWHY LIMIT PROTEIN?\nWhen your body breaks down protein, it produces waste products (urea) that your kidneys must filter. Too much protein makes your kidneys work harder. However, you still need some protein to maintain muscle.\n\nHOW MUCH PROTEIN?\n• Early CKD (stages 1-2): 0.8 grams per kilogram of body weight per day\n• Later CKD (stages 3-5): 0.6-0.8 grams per kilogram per day\n• On dialysis: Higher protein intake (1.0-1.2 g/kg) because dialysis removes amino acids\n\nEXAMPLE: For a 70 kg person with stage 3 CKD: about 50-55 grams protein per day\n\nHIGH PROTEIN FOODS (LIMIT):\n• Meat, chicken, fish\n• Eggs\n• Milk, cheese, yoghurt\n• Beans, lentils, nuts\n• Soy products\n\nPOTASSIUM:\nWHY LIMIT POTASSIUM?\nToo much potassium in the blood (hyperkalaemia) can cause dangerous heart rhythm problems, including cardiac arrest. Kidneys normally remove excess potassium, but damaged kidneys cannot keep up.\n\nHIGH POTASSIUM FOODS (LIMIT OR AVOID):\n• Bananas and plantains\n• Oranges and orange juice\n• Potatoes and sweet potatoes\n• Avocados\n• Tomatoes and tomato products\n• Spinach and sukuma wiki (in large amounts)\n• Beans and lentils\n• Nuts and seeds\n• Coconut water\n• Salt substitutes containing potassium\n\nLOW POTASSIUM FOODS (BETTER CHOICES):\n• Apples\n• Grapes\n• Pineapple\n• Watermelon\n• Cabbage\n• Green beans\n• Carrots\n• Cucumber\n• Rice\n• Pasta\n\nTIPS FOR MANAGING POTASSIUM:\n• Avoid eating large amounts of any high-potassium food at one sitting\n• Leach vegetables: Peel, cut into small pieces, boil in water, drain water — this removes some potassium\n• Do not drink the cooking water from vegetables\n• Limit fruit juice and coconut water\n• Take medications as prescribed — some bind potassium in the gut\n\nIMPORTANT: Work with a dietitian who specialises in kidney disease. Dietary needs change as CKD progresses. What is right for someone with stage 2 CKD may be wrong for someone on dialysis.',
    keyPoints: [
      'Protein produces waste that damaged kidneys struggle to filter — moderate your intake',
      'Potassium can build up to dangerous levels in CKD — limit bananas, oranges, potatoes, tomatoes',
      'Choose low-potassium fruits and vegetables: apples, cabbage, carrots, cucumber',
      'Leach vegetables by boiling and discarding the water to reduce potassium',
      'Work with a kidney dietitian — dietary needs change as CKD progresses',
    ],
    category: 'Nephrology',
    condition: 'ckd',
    literacyLevel: 'intermediate',
    readTimeMinutes: 6,
    tags: ['CKD', 'kidney disease', 'protein restriction', 'potassium restriction', 'diet'],
    icon: '🫘',
  },
  {
    id: 'hiv-medication-adherence',
    title: 'Medication adherence (ART) — why every dose matters',
    summary: 'Taking your HIV medications every day at the right time keeps the virus suppressed and protects your health and your partner\'s health.',
    content: 'WHY ADHERENCE MATTERS:\nAntiretroviral therapy (ART) works by keeping the amount of HIV in your blood very low (undetectable). When ART is working well:\n• Your immune system stays strong (CD4 count stays healthy)\n• You will not develop AIDS\n• You cannot transmit HIV to your partner (Undetectable = Untransmittable, U=U)\n• You can live a normal, healthy lifespan\n\nBut ART only works if you take it consistently. Skipping doses allows the virus to multiply and damage your immune system.\n\nTHE 95% RULE:\nFor ART to work effectively, you need to take at least 95% of your doses correctly. This means:\n• If you take once-daily medication: Missing no more than 1 dose per month\n• If you take twice-daily: Missing no more than 2 doses per month\n\nWHAT HAPPENS IF YOU MISS DOSES?\n• Virus levels (viral load) rise\n• CD4 count drops — immune system weakens\n• You become at risk for opportunistic infections\n• You can transmit HIV to partners\n• The virus can become resistant to your medications — requiring stronger drugs with more side effects\n\nTIPS FOR TAKING MEDICATION EVERY DAY:\n• Link to a daily habit: Take with breakfast or when you brush your teeth\n• Use a pill organizer: Fill it once a week — this helps you see if you have taken your dose\n• Set a daily alarm on your phone\n• Keep a backup dose in your bag or at work\n• Ask a family member or friend to remind you\n• Join a support group — community helps\n• Use a medication tracking app\n\nMANAGING SIDE EFFECTS:\nSome people experience side effects when starting ART. These usually improve within 2-4 weeks. Common side effects:\n• Nausea: Take medication with food\n• Dizziness: Take at bedtime\n• Headache: Drink plenty of water\n• Diarrhoea: Avoid spicy and greasy foods\n\nTell your doctor about any side effects — do not just stop taking the medication. There are alternatives.\n\nSTORING YOUR MEDICATION:\n• Keep in a cool, dry place away from direct sunlight\n• Do not keep in the bathroom (heat and humidity damage the medication)\n• Check expiry dates\n• Keep in the original container\n• Do not share with anyone\n\nREMEMBER: Taking ART daily is not a burden — it is your power. It gives you control over HIV and allows you to live a full, healthy life.',
    keyPoints: [
      'Take at least 95% of doses — missing no more than 1 dose per month for once-daily ART',
      'Undetectable = Untransmittable (U=U): You cannot pass HIV to your partner',
      'Missing doses leads to viral resistance, requiring stronger medications',
      'Link medication to a daily habit and use phone alarms or pill organizers',
      'Tell your doctor about side effects — do not stop taking medication on your own',
    ],
    category: 'Infectious Disease',
    condition: 'hiv',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['HIV', 'ART', 'adherence', 'antiretroviral', 'U=U'],
    icon: '💊',
  },
  {
    id: 'hiv-nutrition-art',
    title: 'Nutrition during HIV treatment',
    summary: 'Good nutrition helps your body fight infection, maintain muscle, and absorb HIV medications more effectively.',
    content: 'WHY NUTRITION MATTERS WITH HIV:\nHIV and ART can affect your body\'s nutritional needs and how it processes food. Good nutrition helps:\n• Strengthen your immune system\n• Maintain muscle and weight\n• Help medications work better\n• Reduce side effects\n• Give you energy for daily activities\n\nEAT A BALANCED DIET:\nEAT MORE:\n• Fruits and vegetables: At least 5 servings per day (Vitamin A, C, antioxidants)\n• Protein: Fish, chicken, eggs, beans, lentils — helps maintain muscle and immunity\n• Whole grains: Brown rice, oats, millet, whole wheat bread — provide energy and fibre\n• Healthy fats: Unsaturated oils, avocado, nuts — help absorb certain vitamins\n• Dairy: Milk, yoghurt, mala — calcium and protein\n\nSPECIFIC NUTRIENTS IMPORTANT WITH HIV:\n• ZINC: Helps immune function — found in meat, poultry, beans, nuts, whole grains\n• SELENIUM: Supports immune system — found in fish, eggs, Brazil nuts, brown rice\n• IRON: Prevents anaemia — found in red meat, dark green vegetables, beans, fortified foods\n• VITAMIN B COMPLEX: Energy production — found in whole grains, meat, eggs, green vegetables\n• VITAMIN D AND CALCIUM: Bone health (some ART affects bone density)\n\nFOOD SAFETY — VERY IMPORTANT:\nBecause HIV weakens the immune system, you are at higher risk of foodborne illness:\n• Wash hands with soap before eating and cooking\n• Wash fruits and vegetables thoroughly with clean water\n• Cook meat, fish, and eggs thoroughly\n• Avoid raw or undercooked eggs, meat, and seafood\n• Avoid unpasteurised milk\n• Drink only treated water (boiled or filtered)\n• Avoid street food unless you are certain it is prepared hygienically\n• Refrigerate leftovers promptly\n\nMANAGING SIDE EFFECTS THROUGH FOOD:\n• NAUSEA: Eat small frequent meals; avoid greasy, spicy, or strong-smelling foods\n• DIARRHOEA: Eat bananas, rice, apple sauce, toast; drink plenty of fluids\n• LOSS OF APPETITE: Eat whatever appeals to you; try liquid meals like soup, porridge, smoothies\n• WEIGHT LOSS: Add extra oil, nut butter, avocado, or milk powder to meals\n• DRY MOUTH: Drink water frequently; suck on ice chips or sugar-free candy\n\nREMEMBER: A healthy diet is not a replacement for ART — but it makes ART work better. Eat a variety of foods from all food groups.',
    keyPoints: [
      'Good nutrition strengthens immunity and helps ART work better',
      'Eat a variety of fruits, vegetables, protein, whole grains, and healthy fats',
      'Food safety is critical — HIV increases risk of foodborne illness',
      'Adjust your diet to manage ART side effects like nausea and diarrhoea',
      'Nutrition supports ART — it does not replace it',
    ],
    category: 'Infectious Disease',
    condition: 'hiv',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['HIV', 'nutrition', 'diet', 'food safety', 'ART side effects'],
    icon: '🥗',
  },
  {
    id: 'ckd-fluid-management',
    title: 'Fluid management in CKD',
    summary: 'As kidney function declines, your body may not be able to remove excess fluid. Learn how to balance your fluid intake to prevent swelling and breathing problems.',
    content: 'WHY FLUID MANAGEMENT MATTERS:\nHealthy kidneys remove excess fluid from the body. When kidneys are damaged, fluid can build up, causing:\n• Swelling in the legs, ankles, and feet (oedema)\n• Shortness of breath (fluid in the lungs)\n• High blood pressure\n• Overloading the heart\n• Rapid weight gain\n\nWHO NEEDS FLUID RESTRICTION?\nNot everyone with kidney disease needs fluid restriction. It is usually needed for:\n• Stage 4-5 CKD\n• People on dialysis\n• People with significant oedema or shortness of breath\n• People on fluid restriction prescribed by their doctor\n\nHOW MUCH FLUID IS ALLOWED?\nFluid allowance varies by person. Common allowances:\n• Not on dialysis (low urine output): 1.0-1.5 litres per day\n• Haemodialysis: 500-1000 ml per day PLUS the amount of urine you produce in 24 hours\n• Peritoneal dialysis: Usually less restriction, but follow your doctor\'s advice\n\nYour doctor or dietitian will give you a specific target. Measure carefully.\n\nWHAT COUNTS AS FLUID?\nALL liquids count:\n• Water, tea, coffee, soda, juice\n• Milk, yoghurt, ice cream, soup\n• Watery foods: Watermelon, oranges, grapes, cucumbers\n• Ice cubes\n• Gelatin desserts\n• Sauces and gravies\n\nTIPS FOR MANAGING FLUID:\n• Use a marked water bottle to track your intake\n• Divide daily allowance into portions: e.g., 250ml per meal plus small drinks between meals\n• Use small cups and glasses\n• Quench thirst with: Ice chips (count as half volume), sucking on lemon, sugar-free candy, or chewing gum\n• Rinse mouth with water but do not swallow\n• Avoid salty foods — salt makes you thirsty\n• Keep a fluid diary\n• Freeze some of your allowance as ice cubes to make it last longer\n\nMONITOR YOUR FLUID STATUS:\nWeigh yourself daily (at the same time, after emptying bladder, in similar clothing):\n• A weight gain of 1 kg = approximately 1 litre of retained fluid\n• Between dialysis sessions: weight gain should be less than 3-5% of your dry weight\n• Report rapid weight gain, increased swelling, or shortness of breath to your doctor\n\nREMEMBER: Fluid management is one of the most challenging parts of kidney disease. It takes practice. Be patient with yourself and ask your healthcare team for help.',
    keyPoints: [
      'Damaged kidneys cannot remove excess fluid, causing swelling and breathing problems',
      'Fluid restriction is typically 1-1.5 litres per day for advanced CKD',
      'All liquids count — including watery foods like soup, yoghurt, and watermelon',
      'Weigh yourself daily — 1 kg weight gain = about 1 litre of retained fluid',
      'Avoid salty foods to reduce thirst; use ice chips and sugar-free candy to manage thirst',
    ],
    category: 'Nephrology',
    condition: 'ckd',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['CKD', 'fluid restriction', 'dialysis', 'oedema', 'weight monitoring'],
    icon: '💧',
  },
  {
    id: 'heart-daily-weight-monitoring',
    title: 'Daily weight monitoring',
    summary: 'Weighing yourself daily is the best way to detect fluid buildup early in heart failure. Sudden weight gain means you need to adjust your treatment.',
    content: 'WHY DAILY WEIGHING MATTERS:\nIn heart failure, your heart cannot pump blood effectively, and fluid builds up in your body. This fluid causes weight gain before you feel symptoms like swelling or shortness of breath. Weighing yourself every day lets you spot fluid buildup early — before it becomes an emergency.\n\nHOW TO WEIGH YOURSELF CORRECTLY:\n• Same time every day: First thing in the morning, after urinating, before eating or drinking\n• Same scale: Use the same scale every day\n• Same clothing: Weigh yourself in similar clothing (or without clothing)\n• Same location: Place the scale on a hard, flat surface (not carpet)\n• Record it: Write down your weight every day in a log or notebook\n\nWHAT IS A CONCERNING CHANGE?\n• Gain of 1-2 kg in 1 day: This is a warning sign — call your doctor\n• Gain of 2-3 kg in 1 week: This is significant — you may need medication adjustment\n• Gain of 3+ kg in 1 week: This is an emergency — contact your doctor immediately\n\nYour doctor will give you specific weight targets. Know:\n• Your "dry weight" (weight when no excess fluid)\n• Your 1-day weight gain limit\n• Your 1-week weight gain limit\n\nWHAT A SUDDEN WEIGHT GAIN MEANS:\n• Your body is retaining fluid\n• Your heart failure is worsening\n• You may need to adjust your diuretic (water pill) dose\n• You may need to restrict salt and fluid more strictly\n\nOTHER SIGNS OF FLUID BUILDUP:\nCheck for these every day along with your weight:\n• Swollen ankles, feet, or legs — press with your finger; if the dent stays, that is pitting oedema\n• Shortness of breath — especially when lying flat or with mild activity\n• Needing more pillows to sleep (orthopnoea)\n• Waking up gasping for air at night (paroxysmal nocturnal dyspnoea)\n• Coughing, especially at night\n• Rapid weight gain\n• Abdominal swelling or bloating\n• Loss of appetite or feeling full quickly\n\nWHEN TO CALL YOUR DOCTOR:\n• Weight gain of more than 1 kg in 24 hours\n• Increased swelling in feet, ankles, or abdomen\n• Worsening shortness of breath\n• Needing to sleep sitting up\n• Persistent cough or wheezing\n• Fatigue that does not improve with rest\n\nREMEMBER: Daily weight is the EARLIEST sign of fluid buildup — it shows up before you feel bad. Do not skip weighing even when you feel well.',
    keyPoints: [
      'Weigh every morning after urinating but before eating — same time, same scale, same clothing',
      'Gain of 1-2 kg in 1 day is a warning sign — call your doctor',
      'Sudden weight gain means fluid buildup — your heart failure may be worsening',
      'Check for other signs: swollen feet, shortness of breath, needing more pillows',
      'Daily weight catches fluid buildup early — before you feel symptoms',
    ],
    category: 'Cardiovascular',
    condition: 'heart_failure',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['heart failure', 'daily weight', 'fluid monitoring', 'oedema', 'congestive heart failure'],
    icon: '⚖️',
  },
  {
    id: 'asthma-action-plan',
    title: 'Asthma action plan usage',
    summary: 'An asthma action plan helps you know exactly what to do when your asthma gets worse. It tells you when to increase medication and when to seek emergency care.',
    content: 'WHAT IS AN ASTHMA ACTION PLAN?\nAn asthma action plan is a written document created by your doctor that tells you exactly what to do at different stages of your asthma. It uses a traffic light system (GREEN, YELLOW, RED) to help you know what to do.\n\nGREEN ZONE — DOING WELL:\n• No cough, wheeze, chest tightness, or shortness of breath\n• You can do your normal activities without symptoms\n• Peak flow: 80-100% of your personal best\n• ACTION: Take your regular preventer medication as prescribed. This keeps the inflammation in your airways under control.\n\nYELLOW ZONE — WORSENING:\n• You have some symptoms: cough, wheeze, chest tightness at night or with activity\n• Asthma is interfering with sleep, work, or school\n• Peak flow: 50-79% of your personal best\n• ACTION:\n  • Take your reliever inhaler (blue) — 2 puffs every 4 hours as needed\n  • Increase your preventer inhaler as instructed by your doctor\n  • Check peak flow again after 30 minutes\n  • If peak flow improves and stays above 80% for 4 hours, you can return to Green Zone\n  • If symptoms persist for more than 24 hours despite treatment, call your doctor\n\nRED ZONE — MEDICAL EMERGENCY:\n• Severe symptoms even at rest\n• Difficulty walking or talking due to shortness of breath\n• Peak flow: Below 50% of personal best\n• Reliever medication not lasting 4 hours\n• Lips or fingernails turning blue\n• Nostrils flaring or chest sucking in\n• ACTION:\n  • Take your reliever inhaler immediately — 4 puffs, repeat after 20 minutes if no improvement\n  • Take oral steroids if prescribed\n  • Call an ambulance or go to the nearest hospital\n  • Do NOT drive yourself\n\nHOW TO GET AN ASTHMA ACTION PLAN:\nAsk your doctor to write one for you. Bring it to every appointment for review. Keep a copy somewhere visible at home and take a photo on your phone.\n\nTIPS FOR USING YOUR PLAN:\n• Review it with your doctor at least once a year\n• Update it if your medications change\n• Share it with family members and school or work colleagues\n• Have a copy in your bag or wallet\n• Keep your peak flow meter and peak flow diary up to date\n\nREMEMBER: An asthma action plan is not a one-time thing. It needs to be reviewed and updated regularly. If you have been to the emergency room for asthma in the past year, especially ask your doctor to review your plan.\n\nKEY MEDICATIONS IN YOUR PLAN:\n• PREVENTER (controller) — Usually brown, red, or orange: Take daily to reduce airway inflammation\n• RELIEVER (rescue) — Usually blue: Take when you have symptoms\n• ORAL STEROIDS — For severe attacks: Keep a supply at home if prescribed',
    keyPoints: [
      'GREEN zone: No symptoms — take regular preventer medication',
      'YELLOW zone: Symptoms starting — use reliever inhaler and increase preventer',
      'RED zone: Severe symptoms — take reliever immediately and go to hospital',
      'Review and update your action plan with your doctor at least once a year',
      'Keep a copy of your plan at home, on your phone, and share it with family',
    ],
    category: 'Respiratory',
    condition: 'asthma',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['asthma action plan', 'asthma', 'peak flow', 'inhaler', 'emergency plan'],
    icon: '📋',
  },
  {
    id: 'asthma-peak-flow-monitoring',
    title: 'Peak flow monitoring',
    summary: 'Peak flow monitoring measures how well your lungs are working. It can detect worsening asthma before you feel symptoms.',
    content: 'WHAT IS PEAK FLOW?\nPeak flow is a measurement of how fast you can blow air out of your lungs. It tells you how open your airways are. When asthma is getting worse, your airways narrow, and your peak flow drops — even before you start feeling symptoms.\n\nWHY MONITOR PEAK FLOW?\n• Detects early warning signs of an asthma attack, often before you feel symptoms\n• Helps you and your doctor decide if your treatment is working\n• Provides objective information during asthma attacks — numbers are more reliable than guessing\n• Helps identify triggers by tracking changes in peak flow after exposure\n\nHOW TO USE A PEAK FLOW METER:\n1. Move the indicator to the bottom of the numbered scale\n2. Stand up (sitting is also acceptable)\n3. Take a deep breath in, filling your lungs completely\n4. Close your lips tightly around the mouthpiece — do not bite\n5. Blow out as hard and fast as you can — a short, sharp blast\n6. Write down the number on the indicator\n7. Repeat steps 1-6 two more times\n8. Record the HIGHEST of the three numbers — not the average\n\nWHEN TO MEASURE:\n• Every morning: Before taking your asthma medication\n• Every evening: At the same time each day\n• During symptoms: To assess severity\n• After taking reliever medication: To check if it is working\n\nFINDING YOUR PERSONAL BEST:\nYour "personal best" is the highest peak flow reading you achieve when your asthma is well controlled. To find it:\n• Measure peak flow twice daily for 2-3 weeks\n• Record the highest number during this period\n• Your doctor will use this number to set your zones in your asthma action plan\n\nUNDERSTANDING YOUR ZONES:\n• GREEN ZONE (80-100% of personal best): Asthma is well controlled — continue usual medications\n• YELLOW ZONE (50-79% of personal best): Asthma is worsening — follow action plan, increase medications\n• RED ZONE (below 50%): Medical emergency — take reliever and seek emergency care\n\nKEEP A PEAK FLOW DIARY:\nRecord:\n• Date and time\n• Peak flow reading\n• Any symptoms you had\n• Any triggers you were exposed to\n• Medications you took\n\nBring your diary to every doctor\'s appointment.\n\nTIPS FOR ACCURATE READINGS:\n• Clean your peak flow meter monthly with warm soapy water and let it air dry\n• Replace your meter every 12 months or as recommended\n• If your readings suddenly drop a lot, check that the meter is not dirty or damaged\n• Do not share your peak flow meter with others\n\nREMEMBER: Peak flow monitoring gives you objective information about your asthma. It is especially useful for people who do not notice their symptoms getting worse until it is too late.',
    keyPoints: [
      'Peak flow measures how fast you can blow air out — it detects airway narrowing early',
      'Measure every morning before medication, at evening, and during symptoms',
      'Your personal best is your highest reading when asthma is well controlled',
      'Green: 80-100%, Yellow: 50-79%, Red: below 50% of personal best',
      'Keep a diary with peak flow readings, symptoms, triggers, and medications',
    ],
    category: 'Respiratory',
    condition: 'asthma',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['peak flow', 'asthma', 'lung function', 'monitoring', 'asthma action plan'],
    icon: '💨',
  },
  {
    id: 'asthma-understanding-triggers',
    title: 'Understanding asthma triggers',
    summary: 'Avoiding your asthma triggers is one of the most effective ways to prevent asthma attacks. Learn to identify and manage common triggers.',
    content: 'WHAT ARE ASTHMA TRIGGERS?\nAsthma triggers are things that irritate your airways and cause asthma symptoms. Everyone with asthma has different triggers. Identifying and avoiding YOUR triggers is a key part of asthma management.\n\nCOMMON ASTHMA TRIGGERS:\n\n1. ALLERGENS:\n• Dust mites: Found in bedding, mattresses, carpets, and stuffed toys\n  • Solution: Encase mattresses and pillows in dust-proof covers, wash bedding weekly in hot water, remove carpets from bedroom\n• Pollen: From grass, trees, and flowers — worse during certain seasons\n  • Solution: Keep windows closed during high pollen seasons, shower after being outdoors\n• Mould: Found in damp areas like bathrooms and kitchens\n  • Solution: Fix leaks, use exhaust fans, clean mould with bleach solution\n• Pet dander: From cats, dogs, and other animals\n  • Solution: Keep pets out of the bedroom, bathe pets weekly, vacuum frequently\n• Cockroaches: Their droppings can trigger asthma\n  • Solution: Keep food sealed, clean crumbs, use roach traps, do not leave garbage exposed\n\n2. RESPIRATORY INFECTIONS:\n• Colds, flu, COVID-19, sinus infections\n  • Solution: Wash hands frequently, get flu vaccine, avoid people who are sick\n\n3. IRRITANTS:\n• Tobacco smoke: One of the most common and dangerous triggers\n  • Solution: Do not smoke, ask others not to smoke near you, avoid smoky places\n• Cooking smoke: From open fires, charcoal, or wood stoves\n  • Solution: Cook in well-ventilated area, use extractor fan, position yourself away from smoke\n• Strong smells: Perfume, cleaning products, paint, incense, air fresheners\n  • Solution: Choose unscented products, use natural cleaning agents, avoid areas being painted\n• Air pollution: Traffic fumes, industrial smoke\n  • Solution: Stay indoors on high pollution days, wear a mask when exposed\n\n4. WEATHER:\n• Cold air: Can trigger airway narrowing\n  • Solution: Cover nose and mouth with a scarf in cold weather, breathe through nose\n• Humidity: Very humid or very dry air can trigger symptoms\n• Thunderstorms: Can trigger severe asthma attacks in some people\n\n5. EXERCISE:\n• Exercise-induced asthma: Symptoms during or after physical activity\n  • Solution: Warm up before exercise, use reliever inhaler 15 minutes before, cool down after\n\n6. STRONG EMOTIONS:\n• Stress, anxiety, excitement, or laughter can trigger symptoms\n  • Solution: Relaxation techniques, deep breathing, counselling if needed\n\n7. MEDICATIONS:\n• Aspirin, ibuprofen, and some other painkillers can trigger asthma in some people\n  • Solution: Tell your doctor about your asthma before taking any new medication\n\nHOW TO IDENTIFY YOUR TRIGGERS:\n• Keep a symptom diary: Record when and where symptoms occur, what you were doing, and what you were exposed to\n• Look for patterns: Do symptoms happen at certain times of day, in certain places, or after certain activities?\n• Allergy testing: Your doctor can refer you for skin prick tests or blood tests\n\nREMEMBER: Avoiding triggers does not mean staying indoors all the time. Identify your most important triggers and develop strategies to manage them. Your doctor can help you create a plan.',
    keyPoints: [
      'Common triggers: dust mites, pollen, mould, pet dander, smoke, cold air, exercise, stress',
      'Keep a symptom diary to identify your personal triggers',
      'Use mattress covers, wash bedding in hot water, and remove bedroom carpets',
      'Avoid tobacco smoke and cooking smoke — two of the most common triggers',
      'Know your triggers and have a plan to avoid or manage each one',
    ],
    category: 'Respiratory',
    condition: 'asthma',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['asthma triggers', 'asthma', 'allergens', 'dust mites', 'smoke'],
    icon: '🌿',
  },
  {
    id: 'dm-self-monitoring-blood-glucose',
    title: 'Self-monitoring of blood glucose',
    summary: 'Checking your blood sugar at home gives you real-time information to make decisions about food, activity, and medication.',
    content: 'WHY MONITOR BLOOD SUGAR?\nSelf-monitoring of blood glucose (SMBG) helps you:\n• See how food, activity, medications, and stress affect your blood sugar\n• Detect high and low blood sugar before they become emergencies\n• Make day-to-day decisions about insulin doses and food choices\n• Give your doctor the information needed to adjust your treatment\n\nWHO SHOULD MONITOR?\n• All people with Type 1 diabetes — check multiple times per day\n• People with Type 2 diabetes on insulin — check as recommended by your doctor\n• People with Type 2 diabetes on oral medications — may need to check less often\n• During illness or pregnancy with diabetes — more frequent checking\n\nWHEN TO CHECK:\nCommon testing times:\n• Fasting (before breakfast): Shows how well your body managed overnight\n• Before meals: Helps decide pre-meal insulin dose\n• 2 hours after meals: Shows how the meal affected your blood sugar\n• Before bed: Ensures it is safe to sleep (target 6-10 mmol/L)\n• Before driving: Always check if you are at risk of hypoglycaemia\n• During illness: Check every 2-4 hours\n• When you feel symptoms of low or high blood sugar\n\nTARGET BLOOD SUGAR RANGES:\n• Fasting (before meals): 4-7 mmol/L\n• 2 hours after meals: Less than 10 mmol/L (or less than 8 if strict control needed)\n• Before bed: 6-10 mmol/L\n\nYour doctor may set different targets based on your age, how long you have had diabetes, and other health conditions.\n\nHOW TO TEST CORRECTLY:\n1. Wash hands with warm soapy water — hand sanitizer can give false readings\n2. Dry hands completely\n3. Use a new lancet each time (reusing is more painful and can cause infection)\n4. Prick the side of your fingertip (less painful than the pad)\n5. Gently squeeze from base of finger to form a small drop of blood\n6. Touch the test strip to the blood drop — do not smear\n7. Record the result immediately in your log or app\n8. Dispose of lancet safely\n\nRECORD YOUR READINGS:\nWrite down:\n• Date and time\n• Blood sugar level\n• What you ate (for post-meal readings)\n• Medication dose taken\n• Any notes: exercise, stress, illness, symptoms\n\nCARING FOR YOUR METER AND STRIPS:\n• Store strips in their original container with the lid tightly closed\n• Do not expose strips to heat, humidity, or direct sunlight\n• Check expiry dates on strips\n• Clean your meter as per manufacturer instructions\n• Bring your meter to clinic visits\n\nREMEMBER: Blood sugar numbers are information, not judgment. They tell you what is happening so you can make good decisions. Do not get discouraged by high numbers — use them to learn and improve.',
    keyPoints: [
      'Check at recommended times: fasting, before meals, after meals, before bed, during illness',
      'Target fasting blood sugar: 4-7 mmol/L; after meals: less than 10 mmol/L',
      'Wash hands with warm soapy water before testing — hand sanitizer can give false readings',
      'Record all readings with notes about food, activity, and symptoms',
      'Blood sugar numbers are information — use them to make better decisions, not to feel discouraged',
    ],
    category: 'Endocrinology',
    condition: 'type_2_diabetes',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['blood glucose', 'self-monitoring', 'diabetes', 'testing', 'SMBG'],
    icon: '🩸',
  },
  {
    id: 'thyroid-medication-adherence',
    title: 'Medication adherence (levothyroxine)',
    summary: 'Taking your thyroid medication correctly every day is essential for maintaining normal metabolism and preventing complications.',
    content: 'WHY ADHERENCE MATTERS:\nLevothyroxine replaces the thyroid hormone your body cannot make enough of. Taking it correctly keeps your metabolism normal and prevents symptoms of hypothyroidism. Missing doses can cause symptoms to return and can affect your heart, energy, weight, and mood.\n\nHOW TO TAKE LEVOTHYROXINE CORRECTLY:\n• Take at the same time every day — usually first thing in the morning\n• Take on an EMPTY stomach — at least 30-60 minutes before eating or drinking anything except water\n• Take with a FULL GLASS of plain water (not tea, coffee, milk, or juice)\n• Do NOT take with: Calcium supplements, iron supplements, antacids, or high-fibre foods — these block absorption\n  • Wait at least 4 hours after levothyroxine before taking these\n• Swallow the tablet whole — do not crush, chew, or cut\n\nCOMMON INTERFERING SUBSTANCES:\nSeparate these from your thyroid medication by AT LEAST 4 hours:\n• Calcium carbonate (found in some antacids and supplements)\n• Iron supplements\n• Magnesium\n• Soya products\n• High-fibre foods (bran, whole grains)\n• Grapefruit juice\n• Some cholesterol medications (bile acid sequestrants)\n\nWHAT IF YOU MISS A DOSE?\n• If you remember the same day: Take it as soon as possible\n• If you remember the next day: Skip the missed dose — take only today\'s dose\n• Never double up — this can cause side effects\n• If you miss doses frequently, set a daily phone alarm\n\nMONITORING:\n• Your doctor will check your TSH (thyroid-stimulating hormone) level every 6-12 months\n• TSH should stay within the normal range (usually 0.5-4.5 mIU/L)\n• If TSH is too high: Your dose may need to be increased\n• If TSH is too low: Your dose may need to be decreased\n• Always get tested before adjusting your dose\n\nSIDE EFFECTS OF TOO MUCH MEDICATION:\nIf your dose is too high (hyperthyroid symptoms):\n• Rapid or irregular heartbeat\n• Anxiety, irritability\n• Tremor (shaking hands)\n• Weight loss\n• Heat intolerance, sweating\n• Insomnia\n\nSIDE EFFECTS OF TOO LITTLE MEDICATION:\nIf your dose is too low (hypothyroid symptoms):\n• Fatigue, sluggishness\n• Weight gain\n• Cold intolerance\n• Constipation\n• Dry skin and hair\n• Depression, brain fog\n\nIMPORTANT PRECAUTIONS:\n• Never change your dose without consulting your doctor\n• Tell your doctor about all other medications and supplements you take\n• If you become pregnant, your dose may need to increase — tell your doctor immediately\n• Some medications (oestrogen, certain seizure medications) can affect how much levothyroxine you need\n\nREMEMBER: Levothyroxine is a hormone your body needs to function normally. Taking it daily is not optional — it is essential for your health.',
    keyPoints: [
      'Take levothyroxine every morning on an empty stomach with a full glass of water',
      'Wait at least 30-60 minutes before eating or drinking anything besides water',
      'Separate calcium, iron, antacids, and high-fibre foods by at least 4 hours',
      'Never double up if you miss a dose — skip the missed dose and take the next one on time',
      'Get TSH checked every 6-12 months to ensure your dose is correct',
    ],
    category: 'Endocrinology',
    condition: 'thyroid',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['thyroid', 'levothyroxine', 'hypothyroidism', 'medication adherence', 'TSH'],
    icon: '💊',
  },
  {
    id: 'thyroid-recognising-hypo-hyper',
    title: 'Recognising hypo/hyper symptoms',
    summary: 'Thyroid disorders cause symptoms by slowing down (hypo) or speeding up (hyper) your body\'s metabolism. Learn to recognise the signs.',
    content: 'UNDERSTANDING THYROID FUNCTION:\nThe thyroid gland in your neck produces hormones that control your body\'s metabolism. When it makes too little hormone, everything slows down (hypothyroidism). When it makes too much, everything speeds up (hyperthyroidism).\n\nHYPOTHYROIDISM (Underactive Thyroid):\nCAUSES: Hashimoto\'s disease (autoimmune), iodine deficiency, post-surgical, post-radioactive iodine treatment\n\nSYMPTOMS:\n• Fatigue, sluggishness, feeling tired all the time\n• Weight gain despite normal eating\n• Feeling cold when others are comfortable\n• Constipation\n• Dry, coarse skin and hair\n• Hair loss\n• Brain fog — difficulty concentrating or remembering\n• Depression or low mood\n• Slow heart rate\n• Muscle aches and stiffness\n• Heavy or irregular menstrual periods\n• Puffy face, especially around eyes\n• Hoarse voice\n• Enlarged thyroid (goitre)\n\nWHEN TO SEEK HELP:\nIf you have several of these symptoms, especially fatigue + weight gain + cold intolerance, ask your doctor for a TSH blood test.\n\nHYPERTHYROIDISM (Overactive Thyroid):\nCAUSES: Graves\' disease (autoimmune), toxic nodules, thyroiditis\n\nSYMPTOMS:\n• Rapid or irregular heartbeat (palpitations)\n• Weight loss despite normal or increased appetite\n• Heat intolerance — sweating more than others\n• Anxiety, nervousness, irritability\n• Tremor (shaking hands)\n• Frequent bowel movements or diarrhoea\n• Insomnia — difficulty sleeping\n• Fatigue (despite feeling "wired")\n• Bulging eyes (exophthalmos, specific to Graves\' disease)\n• Increased sweating\n• Thin, warm, moist skin\n• Hair thinning\n• Light or absent menstrual periods\n• Enlarged thyroid (goitre)\n\nWHEN TO SEEK HELP:\nIf you have several of these symptoms, especially rapid heart rate + weight loss + heat intolerance, ask for a TSH blood test. Untreated hyperthyroidism can cause serious heart problems.\n\nTHYROID STORM (Rare Emergency):\nVery severe, untreated hyperthyroidism can cause "thyroid storm" — a life-threatening condition:\n• Very high fever (above 38.5°C)\n• Extremely rapid heart rate (above 140 bpm)\n• Agitation, confusion, delirium\n• Nausea, vomiting, diarrhoea\n• Yellowing of skin (jaundice)\n\nGO TO HOSPITAL IMMEDIATELY if you have these symptoms.\n\nMYXEDEMA COMA (Rare Emergency):\nSevere, untreated hypothyroidism can cause myxedema coma:\n• Extreme cold intolerance\n• Severe lethargy progressing to unconsciousness\n• Slow heart rate and breathing\n• Low blood pressure\n• Hypothermia (very low body temperature)\n\nGO TO HOSPITAL IMMEDIATELY if a person with known hypothyroidism becomes severely lethargic or unconscious.\n\nDIAGNOSIS:\nThyroid disorders are diagnosed with simple blood tests:\n• TSH: Most sensitive test — high TSH = hypothyroidism, low TSH = hyperthyroidism\n• Free T4: Confirms the diagnosis\n• Free T3: Sometimes needed\n\nTREATMENT:\n• Hypothyroidism: Levothyroxine (synthetic T4) daily\n• Hyperthyroidism: Anti-thyroid medications (methimazole, propylthiouracil), radioactive iodine, or surgery\n\nREMEMBER: Thyroid disorders are very treatable. If you recognise these symptoms, get tested and start treatment.',
    keyPoints: [
      'Hypothyroidism slows metabolism: fatigue, weight gain, cold intolerance, constipation, dry skin',
      'Hyperthyroidism speeds metabolism: rapid heart rate, weight loss, heat intolerance, anxiety, tremor',
      'Simple TSH blood test can diagnose both conditions',
      'Hypothyroidism is treated with daily levothyroxine; hyperthyroidism with anti-thyroid medication',
      'Thyroid storm and myxedema coma are rare emergencies requiring immediate hospital care',
    ],
    category: 'Endocrinology',
    condition: 'thyroid',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['thyroid', 'hypothyroidism', 'hyperthyroidism', 'TSH', 'symptoms'],
    icon: '🔬',
  },
  {
    id: 'ckd-avoiding-nephrotoxic-medications',
    title: 'Avoiding nephrotoxic medications (NSAIDs)',
    summary: 'Some common medications can damage your kidneys. Learn which medications to avoid with CKD and what safer alternatives are available.',
    content: 'WHY THIS MATTERS:\nWhen you have chronic kidney disease (CKD), your kidneys are already damaged and cannot filter toxins as effectively. Certain medications are directly toxic to the kidneys (nephrotoxic) and can cause further damage, sometimes permanently.\n\nTHE MOST DANGEROUS: NSAIDs\nNSAIDs (Non-Steroidal Anti-Inflammatory Drugs) are the most common cause of medication-related kidney damage. They include:\n• Ibuprofen (Brufen, Advil, Motrin)\n• Diclofenac (Voltaren, Cataflam)\n• Naproxen (Aleve, Naprosyn)\n• Indomethacin (Indocin)\n• Ketorolac (Toradol)\n• Mefenamic acid (Ponstan)\n• Piroxicam (Feldene)\n• Celecoxib (Celebrex)\n\nNSAIDs harm the kidneys by reducing blood flow to the kidneys. In healthy people, this is usually temporary and reversible. In people with CKD, the damage can be rapid and permanent.\n\nOTHER MEDICATIONS TO AVOID OR USE WITH CAUTION:\n1. Certain antibiotics:\n   • Gentamicin and other aminoglycosides\n   • Vancomycin (with high doses)\n   • Some cephalosporins\n\n2. Certain blood pressure medications:\n   • ACE inhibitors (Lisinopril, Enalapril) and ARBs — these are actually PROTECTIVE for CKD but can cause problems if you are dehydrated, have high potassium, or have certain kidney conditions\n   • Never stop these without talking to your doctor\n\n3. Herbal remedies and supplements:\n   • Some traditional/herbal medicines contain unknown substances toxic to kidneys\n   • High doses of vitamin C can increase kidney stone risk\n   • Creatine supplements\n   • Weight loss supplements containing stimulants\n\n4. Contrast dye (for CT scans, angiograms):\n   • The dye used in some imaging tests can damage kidneys\n   • Tell your doctor about your CKD before any procedure with contrast\n\n5. Certain diabetes medications:\n   • Metformin: Usually safe in early CKD but should be stopped when GFR falls below 30 (your doctor will monitor)\n\nSAFE PAIN RELIEF OPTIONS:\n• Paracetamol / Acetaminophen (Panadol, Tylenol) — SAFE for kidneys at recommended doses\n  • Maximum: 3,000-4,000 mg per day (for a 70kg adult)\n  • Do not exceed: can cause liver damage\n• Topical pain relievers: Creams, gels, patches containing lidocaine or capsaicin\n• Non-pharmacological: Heat/ice, physiotherapy, acupuncture, gentle exercise\n\nALWAYS:\n• Tell every doctor, pharmacist, and dentist that you have kidney disease\n• Read medication labels carefully — look for "ibuprofen" or "NSAID" warnings\n• Ask before taking any new medication, including over-the-counter and herbal\n• Keep a current medication list and share it with all healthcare providers\n\nREMEMBER: The most dangerous medications for your kidneys are also the most common — NSAIDs like ibuprofen and diclofenac. Use paracetamol instead for pain. When in doubt, ask.',
    keyPoints: [
      'NSAIDs (ibuprofen, diclofenac, naproxen) are the most common cause of medication-related kidney damage',
      'Use paracetamol instead of NSAIDs for pain relief — it is safe for kidneys',
      'Tell every doctor, pharmacist, and dentist that you have CKD',
      'Traditional/herbal remedies and supplements may be toxic to kidneys — ask your doctor first',
      'Remind your doctor about your CKD before any CT scan with contrast dye',
    ],
    category: 'Nephrology',
    condition: 'ckd',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['CKD', 'nephrotoxic', 'NSAIDs', 'medication safety', 'kidney protection'],
    icon: '⚠️',
  },
  {
    id: 'copd-understanding',
    title: 'Understanding COPD',
    summary: 'Chronic Obstructive Pulmonary Disease (COPD) is a long-term lung condition that makes breathing difficult. Learn how to manage it and live well.',
    content: 'WHAT IS COPD?\nCOPD (Chronic Obstructive Pulmonary Disease) is a progressive lung disease that makes it hard to breathe. It includes two main conditions:\n• CHRONIC BRONCHITIS: Inflammation of the airways, producing mucus and cough\n• EMPHYSEMA: Damage to the air sacs in the lungs, reducing oxygen exchange\n\nMost people with COPD have both conditions.\n\nWHAT CAUSES COPD?\n• Smoking (most common cause) — including second-hand smoke\n• Biomass fuel exposure — cooking with wood, charcoal, or kerosene in poorly ventilated kitchens\n• Occupational exposure — dust, chemicals, fumes\n• Genetic factors (rare) — alpha-1 antitrypsin deficiency\n• Repeated respiratory infections in childhood\n\nSYMPTOMS:\n• Chronic cough — often with mucus (sputum)\n• Shortness of breath — especially with activity\n• Wheezing\n• Chest tightness\n• Frequent respiratory infections\n• Fatigue\n• Unintended weight loss (in advanced disease)\n\nSYMPTOMS USUALLY WORSEN OVER TIME, especially if you continue smoking or are exposed to smoke.\n\nDIAGNOSIS:\nCOPD is diagnosed with:\n• Spirometry: A breathing test that measures how much air you can exhale and how fast. This is the most important test for COPD.\n• Chest X-ray or CT scan\n• Blood tests\n\nGOLD STAGES OF COPD:\n• GOLD 1 (MILD): FEV1 ≥ 80% predicted — may not notice symptoms\n• GOLD 2 (MODERATE): FEV1 50-79% — short of breath with activity\n• GOLD 3 (SEVERE): FEV1 30-49% — short of breath with daily activities\n• GOLD 4 (VERY SEVERE): FEV1 < 30% — short of breath at rest, frequent exacerbations\n\nTREATMENT:\nCOPD cannot be cured, but it can be treated.\n\nMEDICATIONS:\n• Bronchodilators: Relax airway muscles (inhalers)\n  • Short-acting: For immediate relief\n  • Long-acting: For daily control\n• Inhaled corticosteroids: Reduce airway inflammation\n• Combination inhalers: Both bronchodilator and steroid\n• Oral medications: Sometimes needed for advanced disease\n• Antibiotics: For bacterial exacerbations\n• Oxygen therapy: For low oxygen levels at rest\n\nPULMONARY REHABILITATION:\nA programme that includes exercise training, education, and breathing techniques. It is one of the most effective treatments for COPD.\n\nREMEMBER: The most important thing you can do for COPD is STOP SMOKING and avoid smoke exposure. Nothing else comes close.',
    keyPoints: [
      'COPD includes chronic bronchitis and emphysema — both make breathing difficult',
      'Smoking and biomass fuel smoke are the most common causes',
      'Spirometry is the main diagnostic test — it measures lung function',
      'Treatment includes inhalers, pulmonary rehabilitation, and oxygen for advanced disease',
      'Stopping smoking is the single most effective treatment for COPD',
    ],
    category: 'Respiratory',
    condition: 'copd',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['COPD', 'chronic bronchitis', 'emphysema', 'lung disease', 'breathing'],
    icon: '🫁',
  },
  {
    id: 'copd-inhaler-technique',
    title: 'Inhaler technique',
    summary: 'Using your inhaler correctly ensures the medication reaches your lungs where it is needed. Most people do not use their inhalers properly.',
    content: 'WHICH INHALER DO YOU USE?\nThere are two main types of inhalers: MDI (pressurised metered-dose inhaler) and DPI (dry powder inhaler). Each requires a different technique.\n\nMDI (PRESSURISED INHALER) — The type with a canister:\n1. Shake the inhaler well (3-5 shakes)\n2. Remove the cap and check the mouthpiece is clean\n3. Stand or sit up straight — do not slouch\n4. Breathe out gently, away from the inhaler\n5. Place the mouthpiece between your teeth and seal your lips around it\n6. Start breathing in SLOWLY and DEEPLY through your mouth\n7. As you start to inhale, press the canister down ONCE\n8. Continue breathing in slowly for 3-5 seconds\n9. Hold your breath for 10 seconds (count to 10)\n10. Breathe out slowly\n11. Wait 30-60 seconds before taking another puff\n\nUSING A SPACER WITH MDI:\nA spacer is a tube that attaches to your inhaler. It makes using an MDI much easier and more effective. Recommended for everyone, especially children and elderly.\n1. Attach the spacer to your inhaler\n2. Shake the inhaler + spacer together\n3. Breathe out gently\n4. Place the spacer mouthpiece in your mouth\n5. Press the canister once to spray medication into the spacer\n6. Within 1-2 seconds, breathe in slowly and deeply through your mouth\n7. Hold your breath for 10 seconds\n8. Breathe out slowly\n\nDPI (DRY POWDER INHALER) — Different types work differently:\n\nDISKUS (ACCUHALER):\n1. Hold the device horizontally\n2. Slide the lever until you hear a click (this loads the dose)\n3. Breathe out gently, away from the device\n4. Place the mouthpiece between your lips\n5. Breathe in QUICKLY AND DEEPLY — you need a fast inhalation to pull the powder into your lungs\n6. Hold your breath for 10 seconds\n7. Close the device until next use\n\nHANDIHALER:\n1. Open the cap and pull up the mouthpiece\n2. Place a capsule in the chamber\n3. Close the mouthpiece (you will hear a click)\n4. Press the side buttons ONCE to pierce the capsule\n5. Breathe out gently\n6. Place mouthpiece between lips\n7. Breathe in QUICKLY AND DEEPLY — you will hear the capsule rattling\n8. Hold breath for 10 seconds\n9. Open to check capsule is empty; if not, repeat\n\nCOMMON MISTAKES:\n• Not shaking the inhaler (MDI)\n• Breathing in too fast (MDI) or too slowly (DPI)\n• Not holding breath long enough\n• Not waiting between puffs\n• Forgetting to prime a new inhaler\n• Using inhaler past expiry date\n\nCLEANING YOUR INHALER:\n• MDI: Clean the mouthpiece weekly by rinsing with warm water and air drying\n• Spacer: Wash monthly in warm soapy water — let it drip dry (do not wipe inside)\n• DPI: Wipe mouthpiece with a dry cloth — do not use water\n\nKNOW WHEN YOUR INHALER IS EMPTY:\n• MDI: Check the canister — float it in water to see how full it is, or count doses\n• DPI: Most have a dose counter — replace when it reaches zero\n\nREMEMBER: Every time you visit your doctor, bring your inhaler and demonstrate your technique. Many people think they are using it correctly but are not. Your doctor can spot mistakes and help you improve.',
    keyPoints: [
      'MDI: Shake, breathe out, inhale slowly and deeply while pressing the canister, hold breath for 10 seconds',
      'Use a spacer with MDI for better medication delivery — especially for children',
      'DPI: Inhale quickly and deeply to pull the powder into your lungs',
      'Common mistakes: shaking incorrectly, wrong breathing speed, not holding breath, not waiting between puffs',
      'Bring your inhaler to every doctor visit and demonstrate your technique',
    ],
    category: 'Respiratory',
    condition: 'copd',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['inhaler', 'MDI', 'DPI', 'spacer', 'COPD'],
    icon: '💨',
  },
  {
    id: 'copd- exacerbation-action-plan',
    title: 'Exacerbation action plan',
    summary: 'A COPD exacerbation is a sudden worsening of symptoms. Having a plan helps you recognise it early and take action to prevent hospitalisation.',
    content: 'WHAT IS A COPD EXACERBATION?\nAn exacerbation (or "flare-up") is a sudden worsening of your COPD symptoms that lasts for several days. Exacerbations are serious — they speed up the decline in lung function and increase your risk of hospitalisation and death.\n\nSIGNS OF AN EXACERBATION:\nThe classic signs are:\n• MORE shortness of breath than usual\n• MORE sputum (mucus) than usual\n• CHANGE in sputum colour — from clear/white to yellow/green\n\nOther signs:\n• Increased coughing\n• Wheezing\n• Feeling more tired than usual\n• Trouble sleeping\n• Swelling in ankles or legs\n• Fever\n• Confusion or drowsiness (in severe cases)\n\nCOMMON TRIGGERS:\n• Respiratory infections: Colds, flu, COVID-19, pneumonia\n• Air pollution or smoke exposure\n• Stopping medications\n• Cold weather\n• Allergens\n\nYOUR ACTION PLAN:\n\nGREEN ZONE (STABLE):\n• Your usual symptoms are under control\n• Take your regular maintenance medications every day\n• Stay active, eat well, stay hydrated\n• Get your annual flu vaccine and COVID-19 vaccine\n\nYELLOW ZONE (EARLY WORSENING):\n• You notice the first signs of an exacerbation\n• INCREASE your reliever inhaler — use every 4 hours or as directed\n• START oral steroids if prescribed as part of your action plan\n• INCREASE fluid intake\n• REST — do not push yourself\n• MONITOR your sputum colour\n• CALL your doctor or clinic for advice\n\nIf symptoms do not improve within 48 hours, go to clinic.\n\nRED ZONE (EMERGENCY):\n• Severe shortness of breath even at rest\n• Cannot complete a sentence without gasping\n• Chest pain\n• Confusion or drowsiness\n• Lips or fingernails turning blue\n• Reliever inhaler not helping\n• Using accessory muscles to breathe (muscles in neck and shoulders)\n\nGO TO THE NEAREST HOSPITAL or CALL AN AMBULANCE.\n\nHOW TO PREVENT EXACERBATIONS:\n• Take your maintenance inhalers every day — even when you feel well\n• Avoid smoke and air pollution\n• Wash hands frequently\n• Avoid people who are sick\n• Get vaccinated: Flu vaccine yearly, pneumococcal vaccine, COVID-19\n• Stay active — pulmonary rehabilitation helps\n• Recognise early warning signs and act quickly\n• Keep rescue medication (oral steroids and antibiotics) at home if prescribed\n\nWHEN TO FOLLOW UP AFTER AN EXACERBATION:\nAfter you recover from an exacerbation, see your doctor within 2-4 weeks to:\n• Review your medications\n• Check your lung function\n• Update your action plan\n• Ensure you have fully recovered\n\nREMEMBER: The best treatment for an exacerbation is PREVENTION. The second best is EARLY treatment. Do not wait until you are very sick to get help.',
    keyPoints: [
      'Exacerbation signs: more shortness of breath, more sputum, change in sputum colour to yellow/green',
      'Green zone (stable): Take daily maintenance medications, stay active, get vaccinated',
      'Yellow zone (worsening): Increase reliever inhaler, start steroids if prescribed, call your doctor',
      'Red zone (emergency): Severe breathlessness, confusion, blue lips — go to hospital immediately',
      'The best treatment for exacerbation is prevention; the second best is early treatment',
    ],
    category: 'Respiratory',
    condition: 'copd',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['COPD', 'exacerbation', 'action plan', 'flare-up', 'breathing'],
    icon: '⚠️',
  },
  {
    id: 'tb-dot-adherence',
    title: 'DOT & treatment adherence',
    summary: 'TB treatment takes 6-12 months. Taking every dose under observation (DOT) ensures you are cured and prevents drug-resistant TB.',
    content: 'WHY COMPLETING TB TREATMENT IS CRITICAL:\nTuberculosis (TB) is curable, but it requires taking the full course of medication exactly as prescribed. Stopping early or missing doses allows TB bacteria to survive and become resistant to the medications.\n\nTREATMENT DURATION:\n• Drug-sensitive TB: Usually 6 months\n  • Intensive phase: 2 months (4 medications daily)\n  • Continuation phase: 4 months (2 medications daily)\n• Drug-resistant TB (MDR-TB): 9-24 months with different medications\n\nWHAT IS DOT (DIRECTLY OBSERVED THERAPY)?\nDOT means a healthcare worker or trained community volunteer watches you swallow your TB medications every day. This ensures:\n• You take the right dose at the right time\n• You complete the full course\n• You get support if you have side effects\n• Treatment failure is detected early\n\nWHY DOT IS IMPORTANT:\n• Without DOT, about 30-50% of patients do not complete treatment\n• Incomplete treatment leads to drug-resistant TB (MDR-TB, XDR-TB)\n• Drug-resistant TB is much harder and more expensive to treat\n• DOT helps you get cured the first time\n\nWHAT HAPPENS IF YOU MISS DOSES?\n• TB bacteria can become resistant to your medications\n• You may need to extend your treatment or switch to stronger medications\n• You remain infectious longer — you can spread TB to family and community\n• MDR-TB treatment has more side effects and lower cure rates\n\nMANAGING SIDE EFFECTS:\nCommon side effects and what to do:\n• Orange/red urine (rifampicin): Normal — do not worry\n• Nausea: Take medication with food (if allowed by your doctor)\n• Skin rash: Tell your doctor immediately\n• Yellow eyes or skin (jaundice): Tell your doctor immediately\n• Blurred vision: Tell your doctor immediately (ethambutol side effect)\n• Joint pain: Tell your doctor — pyridoxine (vitamin B6) helps\n• Tingling in hands/feet: Tell your doctor — pyridoxine helps\n\nNUTRITION DURING TB TREATMENT:\n• Eat a high-protein, high-energy diet — TB increases your calorie needs\n• Take your pyridoxine (vitamin B6) daily as prescribed\n• Drink plenty of water\n• Rest when you feel tired\n\nFOLLOW-UP SPUTUM TESTS:\nYour progress is monitored with sputum tests:\n• At 2 months: Check if bacteria are still present\n• At 5 months: Check progress\n• At end of treatment: Confirm cure\n\nIF YOU FEEL BETTER, DO NOT STOP:\nMany patients feel better after 2-4 weeks of treatment and want to stop. This is dangerous. The TB bacteria may still be alive in your body. You must take ALL doses to fully eliminate them.\n\nREMEMBER: TB is curable. Completing your treatment is not just for you — it protects your family and community from drug-resistant TB.',
    keyPoints: [
      'TB treatment takes 6 months (drug-sensitive) — take EVERY dose, do not stop early',
      'DOT means a healthcare worker watches you take your medication every day',
      'Missing doses leads to drug-resistant TB (MDR-TB), which is much harder to treat',
      'Report side effects to your doctor — orange urine is normal, jaundice or vision changes are not',
      'Feeling better does not mean you are cured — take ALL doses to prevent relapse',
    ],
    category: 'Infectious Disease',
    condition: 'tb',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['TB', 'tuberculosis', 'DOT', 'adherence', 'MDR-TB'],
    icon: '✅',
  },
  {
    id: 'tb-infection-control-home',
    title: 'Infection control at home',
    summary: 'TB is spread through the air when an infected person coughs or sneezes. Learn how to protect your family and household contacts.',
    content: 'HOW TB SPREADS:\nTB is spread through the air when a person with active TB of the lungs:\n• Coughs\n• Sneezes\n• Speaks\n• Sings\n• Laughs\n\nThe bacteria (droplet nuclei) can stay suspended in the air for hours, especially in enclosed spaces. People nearby can breathe in the bacteria and become infected.\n\nHOW TO PROTECT YOUR FAMILY:\n\nVENTILATION — THE MOST IMPORTANT MEASURE:\n• Open windows and doors as much as possible to let fresh air in\n• TB bacteria are killed by sunlight (UV light) and fresh air\n• If possible, sleep in a separate, well-ventilated room\n• Spend time outdoors whenever possible\n• Use fans to push air out of the room\n\nCOUGH ETIQUETTE:\n• Cover your mouth and nose when coughing or sneezing — use a tissue or the inside of your elbow\n• Wear a surgical mask when you are around other people, especially in the first 2-4 weeks of treatment\n• Cough away from other people — turn your head\n• Dispose of used tissues in a covered bin\n• Wash hands after coughing or sneezing\n\nSEPARATION:\n• Avoid close contact with others during the first 2-4 weeks of effective treatment\n• Sleep in a separate room if possible\n• Avoid crowded places: Public transport, markets, churches, social gatherings\n• Avoid close contact with children, elderly, and people with weak immune systems\n• Do not kiss anyone\n\nFOR HOW LONG?\nAfter starting effective treatment:\n• Most people become non-infectious within 2-4 weeks\n• Your doctor will tell you when it is safe to be around others\n• Regular sputum tests confirm when you are no longer infectious\n\nHOUSEHOLD CONTACTS:\nYour family members and close contacts should:\n• Be screened for TB at your local clinic — they may need preventative treatment\n• Watch for symptoms: Persistent cough, fever, night sweats, weight loss\n• Get tested even if they feel fine\n• Children under 5 and people with HIV need special attention\n\nCLEANING AND HYGIENE:\n• Avoid sharing utensils, cups, or toothbrushes\n• Wash dishes with soap and hot water\n• Wash your clothes, towels, and bedding regularly\n• Clean surfaces with regular household cleaners\n• TB bacteria can survive on surfaces for days, but are easily killed by sunlight, heat, and disinfectants\n\nSELF-CARE WHILE INFECTIOUS:\n• Take all your TB medications as prescribed\n• Rest as much as possible\n• Eat nutritious food to support recovery\n• Stay positive — you will get better\n• Inform your employer — most workplaces offer sick leave for TB\n\nREMEMBER: TB is curable. After 2-4 weeks of effective treatment, you are usually no longer infectious. Your family is safe if you follow these measures. Get them tested for their own protection.',
    keyPoints: [
      'TB spreads through the air when you cough or sneeze — cover your mouth and wear a mask',
      'Open windows and doors to let in sunlight and fresh air — UV light kills TB bacteria',
      'Sleep in a separate room and avoid crowded places for the first 2-4 weeks of treatment',
      'Family members should be screened for TB, especially children under 5',
      'Most people become non-infectious within 2-4 weeks of starting effective treatment',
    ],
    category: 'Infectious Disease',
    condition: 'tb',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['TB', 'infection control', 'transmission', 'household contacts', 'cough etiquette'],
    icon: '🏠',
  },
  {
    id: 'tb-nutrition-during-treatment',
    title: 'Nutrition during TB treatment',
    summary: 'TB increases your body\'s energy needs. Good nutrition helps you recover faster and handle medication side effects better.',
    content: 'WHY NUTRITION MATTERS IN TB:\nTB is a disease that consumes your body\'s energy. It causes weight loss, muscle wasting, and weakness. Good nutrition helps:\n• Boost your immune system to fight the bacteria\n• Rebuild muscle and strength\n• Help medications work more effectively\n• Reduce side effects of medications\n• Speed up recovery\n\nYOUR BODY NEEDS MORE DURING TB:\n• Calories: 25-35% more than usual — you are fighting an infection\n• Protein: Essential for repairing tissues and building immunity\n• Vitamins and minerals: Especially A, B6, C, D, E, zinc, selenium, iron\n\nWHAT TO EAT:\nHIGH-PROTEIN FOODS:\n• Fish (tilapia, omena, sardines)\n• Chicken and eggs\n• Meat (beef, goat, liver)\n• Beans, lentils, cowpeas, green grams\n• Milk, yoghurt, mala\n• Groundnuts and other nuts\n• Soya products\n\nHIGH-ENERGY FOODS:\n• Ugali, rice, chapati, bread\n• Potatoes, sweet potatoes, cassava, green bananas\n• Oats, millet, sorghum\n• Cooking oil, ghee, margarine (add extra to meals)\n• Avocados\n• Banana and plantain\n\nVITAMIN-RICH FOODS:\n• Vitamin A: Orange and yellow fruits/vegetables, dark green leaves, liver, eggs\n• Vitamin C: Oranges, mangoes, pawpaw, tomatoes, sukuma wiki\n• Vitamin B6: Liver, fish, potatoes, bananas, whole grains\n• Vitamin D: Sunlight, eggs, liver, oily fish\n• Zinc: Meat, liver, eggs, fish, beans, nuts\n• Selenium: Fish, eggs, Brazil nuts, brown rice\n• Iron: Red meat, liver, dark green vegetables, beans\n\nSPECIAL NOTE — VITAMIN B6 (PYRIDOXINE):\nTB medication (isoniazid) can cause vitamin B6 deficiency, leading to nerve damage (tingling in hands and feet). Your doctor should prescribe pyridoxine supplements. If not, ask for them. Also eat B6-rich foods: fish, potatoes, bananas, chicken, sunflower seeds.\n\nEATING TIPS DURING TB:\n• Eat small, frequent meals (5-6 times per day) if you have poor appetite\n• Add extra oil, nut butter, or milk powder to porridge\n• Drink milk, soup, or porridge between meals\n• Eat protein at every meal\n• If chewing is difficult: Mashed foods, porridge, soup, scrambled eggs\n• Drink plenty of water (8-10 glasses per day)\n\nFOODS TO LIMIT:\n• Alcohol — interferes with TB medications and can damage the liver\n• Very spicy or oily foods — may worsen nausea\n• Too much tea or coffee — can reduce iron absorption\n\nREMEMBER: Eating well is not optional during TB treatment — it is part of your cure. If you have trouble eating, tell your doctor or ask to see a nutritionist.',
    keyPoints: [
      'Your body needs 25-35% more calories during TB treatment — eat high-protein, high-energy foods',
      'Vitamin B6 is essential — TB drugs can cause deficiency; eat fish, potatoes, bananas, or take supplements',
      'Eat small, frequent meals if appetite is poor — add extra oil or nut butter to meals',
      'Avoid alcohol — it interferes with TB medications and can damage the liver',
      'Good nutrition is part of your TB treatment — it helps you recover faster',
    ],
    category: 'Infectious Disease',
    condition: 'tb',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['TB', 'nutrition', 'vitamin B6', 'diet', 'recovery'],
    icon: '🥘',
  },
  {
    id: 'tb-understanding-transmission',
    title: 'Understanding TB transmission',
    summary: 'TB is an airborne disease that spreads through the air. Learn how it is transmitted, who is at risk, and how to prevent spread.',
    content: 'WHAT IS TB?\nTuberculosis (TB) is a bacterial infection caused by Mycobacterium tuberculosis. It most commonly affects the lungs (pulmonary TB), but can also affect other parts of the body (extrapulmonary TB).\n\nHOW TB IS TRANSMITTED:\nTB spreads through the air when a person with active TB of the lungs or throat:\n• Coughs\n• Sneezes\n• Speaks loudly\n• Sings\n• Laughs\n\nWhen they do these things, tiny droplets containing TB bacteria are released into the air. These droplets (called droplet nuclei) are so small they can stay suspended in the air for hours.\n\nA person nearby can breathe in these droplets. If the bacteria reach the person\'s lungs, they can become infected.\n\nTB IS NOT SPREAD BY:\n• Shaking hands\n• Sharing food or utensils\n• Touching toilet seats\n• Sharing clothing or bedding\n• Kissing\n\nWHO IS AT HIGHEST RISK?\n• Close contacts of people with active TB: Family members, coworkers\n• People with weakened immune systems: HIV, diabetes, malnutrition, cancer, organ transplant\n• Children under 5 years old\n• Elderly people\n• People living in crowded or poorly ventilated conditions\n• People who smoke or drink heavily\n• Healthcare workers\n\nLATENT VS ACTIVE TB:\nLATENT TB INFECTION:\n• You have TB bacteria in your body, but they are inactive (sleeping)\n• You have NO symptoms\n• You CANNOT spread TB to others\n• You may develop active TB later if your immune system weakens\n• Treatment can prevent latent TB from becoming active\n\nACTIVE TB DISEASE:\n• The TB bacteria are active and multiplying\n• You HAVE symptoms: Persistent cough, fever, night sweats, weight loss\n• You CAN spread TB to others\n• You need treatment to be cured\n\nSYMPTOMS OF ACTIVE TB:\n• Cough lasting more than 2-3 weeks (may produce sputum, sometimes blood)\n• Fever and chills\n• Night sweats\n• Unexplained weight loss\n• Chest pain\n• Fatigue and weakness\n• Loss of appetite\n\nDIAGNOSIS OF TB:\n• GeneXpert: Rapid test that detects TB bacteria and drug resistance\n• Sputum smear microscopy: Looks for TB bacteria in sputum\n• Chest X-ray: Shows abnormalities in the lungs\n• Culture: Grows TB bacteria in the laboratory (takes weeks)\n• Tuberculin skin test (TST): Shows if you have been exposed to TB\n\nPREVENTION:\n• Cover your mouth when coughing\n• Wear a mask if you have active TB\n• Ensure good ventilation\n• Complete TB treatment to stop transmission\n• Vaccinate infants with BCG vaccine (offers partial protection)\n• Screen and treat latent TB in high-risk groups\n\nREMEMBER: TB is curable. Early diagnosis and complete treatment stop transmission and cure the patient. Do not fear TB — respect it and treat it.',
    keyPoints: [
      'TB spreads through the air when a person with active TB coughs, sneezes, or speaks',
      'TB is NOT spread by shaking hands, sharing food, or touching surfaces',
      'Latent TB: bacteria are sleeping, no symptoms, NOT contagious',
      'Active TB: bacteria are multiplying, causes cough, fever, night sweats, weight loss, IS contagious',
      'TB is curable — early diagnosis and completing all doses stops transmission',
    ],
    category: 'Infectious Disease',
    condition: 'tb',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['TB', 'tuberculosis', 'transmission', 'airborne', 'latent TB'],
    icon: '🦠',
  },
  {
    id: 'ckd-when-to-expect-dialysis',
    title: 'When to expect dialysis',
    summary: 'As kidney disease progresses, you may need dialysis. Learn about the signs that indicate it is time to start and what to expect.',
    content: 'WHY DIALYSIS?\nDialysis is a treatment that does the work of your kidneys when they can no longer filter waste products and excess fluid from your blood. It is not a cure for kidney disease, but it can help you live longer and feel better.\n\nWHEN IS DIALYSIS NEEDED?\nDialysis is usually started when your kidney function drops to about 10-15% of normal. Your doctor will monitor several factors to decide when to start:\n\n1. EGFR (ESTIMATED GLOMERULAR FILTRATION RATE):\n• Normal: Above 90\n• Stage 4 CKD: 15-29\n• Stage 5 CKD / kidney failure: Below 15\n• Dialysis is typically considered when eGFR falls below 15 AND you have symptoms\n\n2. SYMPTOMS OF KIDNEY FAILURE:\n• Nausea, vomiting, loss of appetite\n• Fatigue, weakness\n• Swelling (oedema) in legs, feet, or around eyes\n• Shortness of breath (fluid in lungs)\n• Confusion or difficulty concentrating\n• Severe itching\n• Metallic taste in mouth\n• Muscle cramps, especially at night\n\n3. LAB FINDINGS:\n• Potassium dangerously high (hyperkalaemia)\n• Acidosis (too much acid in the blood)\n• Fluid overload not controlled by medications\n• Severe anaemia not responding to treatment\n\nPLANNING FOR DIALYSIS:\nDo not wait until you are very sick to start dialysis — it is better to start electively. Your doctor should discuss dialysis options when your eGFR falls below 30.\n\nTYPES OF DIALYSIS:\nHAEMODIALYSIS (HD):\n• Blood is removed from your body, filtered through a machine, and returned\n• Usually done 3 times per week, 3-4 hours per session\n• Requires vascular access (fistula, graft, or catheter)\n• Done at a dialysis centre\n\nPERITONEAL DIALYSIS (PD):\n• Uses the lining of your abdomen (peritoneum) as a natural filter\n• Fluid is put into your abdomen through a catheter, absorbs waste, then drained\n• Done daily at home — usually while you sleep\n• More flexible schedule, but requires discipline\n\nDIALYSIS ACCESS:\nYou need an access point for dialysis. Planning ahead is critical:\n• AV Fistula (best option): Surgery to connect an artery and vein in your arm. Takes 2-4 months to mature. Should be created when eGFR falls below 20-25.\n• AV Graft: A synthetic tube connecting artery and vein. Can be used in 2-4 weeks.\n• Catheter (temporary): A tube inserted into a large vein in your neck or chest. Used for emergencies or when other access is not ready. Has higher infection risk.\n\nLIFESTYLE ON DIALYSIS:\n• Dietary restrictions: Potassium, phosphorus, sodium, and fluid limits\n• Medications: Continue as prescribed\n• Work: Many people continue working with adjustments\n• Travel: Possible with planning — dialysis centres exist worldwide\n• Transportation: Most centres provide transport assistance\n\nKIDNEY TRANSPLANT:\nDialysis is often a bridge to kidney transplant. If you are a candidate for transplant, your doctor will refer you to a transplant centre for evaluation.\n\nREMEMBER: Starting dialysis is not the end of life — it is a treatment that allows you to continue living. Many people on dialysis work, travel, and enjoy life.',
    keyPoints: [
      'Dialysis is typically started when eGFR falls below 15 and you have symptoms of kidney failure',
      'Discuss dialysis options with your doctor when eGFR drops below 30',
      'Plan access early: AV fistula takes 2-4 months to mature after surgery',
      'Haemodialysis: done at centre 3 times/week; Peritoneal dialysis: done at home daily',
      'Dialysis is not the end — it is a treatment that lets you continue living your life',
    ],
    category: 'Nephrology',
    condition: 'ckd',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['dialysis', 'CKD', 'kidney failure', 'haemodialysis', 'peritoneal dialysis', 'transplant'],
    icon: '💧',
  },
  {
    id: 'stroke-secondary-prevention',
    title: 'Secondary prevention medications',
    summary: 'After a stroke, medications prevent a second stroke. Taking them every day is critical for your long-term health.',
    content: 'WHY MEDICATIONS ARE NEEDED:\nAfter a stroke or TIA (mini-stroke), your risk of having another stroke is high. Medications reduce this risk by:\n• Preventing blood clots from forming\n• Controlling blood pressure\n• Lowering cholesterol\n• Managing underlying conditions like diabetes\n\nTYPICAL MEDICATIONS AFTER STROKE:\n\n1. ANTIPLATELET AGENTS (PREVENT CLOTS):\n• Aspirin: Usually a low daily dose (75-150 mg)\n• Clopidogrel (Plavix): Alternative or added to aspirin for some patients\n• Dipyridamole: Sometimes added to aspirin\n\nThese medications make your blood less "sticky," preventing clots from forming in narrowed arteries.\n\n2. BLOOD PRESSURE MEDICATIONS:\n• ACE inhibitors (Lisinopril, Enalapril, Ramipril)\n• ARBs (Losartan, Valsartan)\n• Calcium channel blockers (Amlodipine, Nifedipine)\n• Diuretics (Hydrochlorothiazide)\n\nBlood pressure control is the MOST IMPORTANT thing you can do to prevent another stroke. Target: Below 130/80.\n\n3. CHOLESTEROL MEDICATIONS:\n• Statins (Atorvastatin, Simvastatin, Rosuvastatin)\n\nStatins lower cholesterol and also reduce inflammation in blood vessels. They are recommended for almost all stroke survivors.\n\n4. ANTICOAGULANTS (FOR CERTAIN STROKE TYPES):\n• Warfarin\n• Apixaban (Eliquis), Rivaroxaban (Xarelto), Dabigatran (Pradaxa)\n\nThese are used if your stroke was caused by atrial fibrillation or a blood clot from the heart. They are stronger than aspirin and require careful monitoring.\n\nLIFESTYLE MEDICINE:\nMedications are not enough. You also need:\n• Healthy diet: Low salt, low fat, plenty of fruits and vegetables\n• Regular exercise: As recommended by your physiotherapist\n• No smoking\n• Limited alcohol (preferably none)\n• Weight control\n• Diabetes control (if applicable)\n\nTIPS FOR STAYING ON MEDICATIONS:\n• Take medications at the same time each day\n• Use a pill organizer\n• Set phone alarms\n• Keep a medication list in your wallet\n• Never stop medications without talking to your doctor — even if you feel fine\n• If you have side effects, tell your doctor — there are alternatives\n\nWARNING SIGNS — CALL YOUR DOCTOR:\n• Bleeding: Unusual bruising, bleeding gums, blood in urine or stool\n• Severe headache\n• New weakness or numbness\n• Difficulty speaking\n• Dizziness or fainting\n\nREMEMBER: These medications are not optional — they are proven to save lives. Most stroke survivors need to take them for the rest of their lives.',
    keyPoints: [
      'After a stroke, medications prevent a second stroke — take them every day',
      'Blood pressure control is the single most important thing for stroke prevention',
      'Typical medications: antiplatelet (aspirin), BP meds, statin, possibly anticoagulants',
      'Medications work alongside lifestyle changes — healthy diet, exercise, no smoking',
      'Never stop medications without talking to your doctor — even if you feel fine',
    ],
    category: 'Neurology',
    condition: 'stroke_rehab',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['stroke', 'secondary prevention', 'medications', 'aspirin', 'blood pressure'],
    icon: '💊',
  },
  {
    id: 'heart-understanding-failure',
    title: 'Understanding heart failure',
    summary: 'Heart failure means your heart is not pumping as well as it should. Learn what it is, how to manage it, and how to live well.',
    content: 'WHAT IS HEART FAILURE?\nHeart failure does NOT mean your heart has stopped or is about to stop. It means your heart is not pumping blood as effectively as it should. Blood and fluid can back up in your lungs, legs, and abdomen, causing symptoms.\n\nThere are two main types:\n• HEART FAILURE WITH REDUCED EJECTION FRACTION (HFrEF): The heart muscle is weak and does not squeeze well\n• HEART FAILURE WITH PRESERVED EJECTION FRACTION (HFpEF): The heart muscle is stiff and does not relax properly between beats\n\nSYMPTOMS:\n• Shortness of breath — during activity, when lying flat, or waking you up at night\n• Fatigue and weakness\n• Swelling in feet, ankles, legs, or abdomen\n• Rapid or irregular heartbeat\n• Persistent cough or wheezing with white or pink-tinged mucus\n• Increased need to urinate at night\n• Sudden weight gain from fluid retention\n• Loss of appetite or nausea\n\nWHAT CAUSES HEART FAILURE?\n• Coronary artery disease (narrowed arteries)\n• Heart attack (damage to heart muscle)\n• High blood pressure (long-standing)\n• Diabetes\n• Heart valve disease\n• Cardiomyopathy (diseased heart muscle)\n• Alcohol abuse\n• Certain chemotherapy drugs\n• Viral infections affecting the heart\n\nDIAGNOSIS:\n• Echocardiogram (ultrasound of the heart) — measures ejection fraction\n• Blood tests: BNP or NT-proBNP (markers of heart failure)\n• ECG (electrocardiogram)\n• Chest X-ray\n\nTREATMENT:\n\nMEDICATIONS:\n• Diuretics (water pills): Remove excess fluid, reduce swelling and breathlessness\n• ACE inhibitors / ARBs: Relax blood vessels, make it easier for the heart to pump\n• Beta-blockers: Slow heart rate, reduce workload on the heart\n• Mineralocorticoid receptor antagonists (MRAs): Remove fluid and protect the heart\n• SGLT2 inhibitors (dapagliflozin, empagliflozin): New class of medications that improve survival\n\nLIFESTYLE:\n• Low-salt diet: Limit salt to 3-4 grams per day\n• Fluid restriction: May need to limit fluids to 1.5-2 litres per day\n• Daily weight monitoring: Catch fluid buildup early\n• Regular gentle exercise: As recommended by your doctor\n• No smoking\n• Limited alcohol\n\nDEVICES AND SURGERY:\n• Pacemaker or ICD (implantable cardioverter-defibrillator): For certain types of heart failure\n• Coronary artery bypass: If heart failure is caused by blocked arteries\n• Heart transplant: In severe cases\n\nLIVING WITH HEART FAILURE:\n• Take medications every day — even when you feel well\n• Weigh yourself daily and record the number\n• Follow your low-salt diet\n• Stay active within your limits\n• Get vaccinated against flu and pneumonia\n• Know the signs of worsening and when to call your doctor\n\nWHEN TO SEEK EMERGENCY CARE:\n• Severe shortness of breath at rest\n• Chest pain\n• Rapid weight gain of 2-3 kg in 2-3 days\n• Fainting or near-fainting\n• Coughing up pink or bloody mucus\n\nREMEMBER: Many people with heart failure live full, active lives. The key is following your treatment plan, monitoring your symptoms, and working closely with your healthcare team.',
    keyPoints: [
      'Heart failure means the heart is not pumping as well as it should — it has NOT stopped',
      'Symptoms: shortness of breath, fatigue, swelling in feet/legs, rapid weight gain from fluid',
      'Treatment includes diuretics, ACE inhibitors, beta-blockers, and lifestyle changes',
      'Weigh yourself daily and follow a low-salt diet to manage fluid buildup',
      'Many people with heart failure live full, active lives with proper treatment',
    ],
    category: 'Cardiovascular',
    condition: 'heart_failure',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['heart failure', 'CHF', 'congestive heart failure', 'ejection fraction', 'cardiac'],
    icon: '❤️',
  },
  {
    id: 'heart-low-sodium-diet',
    title: 'Low sodium diet',
    summary: 'Reducing sodium (salt) is essential for managing heart failure. Less salt means less fluid retention, less swelling, and easier breathing.',
    content: 'WHY LOW SODIUM?\nIn heart failure, your body holds onto sodium and water. Eating less sodium helps your body release excess fluid, reducing:\n• Swelling in feet, ankles, and legs\n• Shortness of breath\n• Fatigue\n• Need for diuretics (water pills)\n\nHOW MUCH SODIUM?\n• Aim for less than 2,000-2,400 mg per day (about 1 teaspoon of salt)\n• Some people with severe heart failure need less than 1,500 mg\n• Your doctor will give you a specific target\n\nHIGH-SODIUM FOODS TO AVOID:\nPROCESSED FOODS:\n• Sausages, bacon, ham, corned beef\n• Canned soups and stews\n• Instant noodles\n• Stock cubes (bouillon)\n• Packaged sauces and gravies\n• Processed cheese\n• Salty snacks: Potato chips, crackers, salted nuts\n• Pickled foods: Pickles, olives\n• Most restaurant and fast food\n\nCONDIMENTS AND SEASONINGS:\n• Soy sauce, teriyaki sauce\n• Ketchup, mustard\n• Salad dressings\n• Seasoning blends (many contain salt)\n• Fish sauce\n\nBEVERAGES:\n• Sports drinks\n• Vegetable juice (commercial)\n• Some bottled waters (check label)\n\nREADING FOOD LABELS:\n• Look for "sodium" on the nutrition label\n• Aim for foods with less than 140 mg sodium per serving\n• "Low sodium" means less than 140 mg per serving\n• "Reduced sodium" means 25% less than regular version\n• Sodium content can vary significantly between brands of the same food\n\nLOW-SODIUM ALTERNATIVES:\nINSTEAD OF SALT, USE:\n• Herbs: Basil, oregano, rosemary, thyme, coriander, parsley, dill\n• Spices: Black pepper, cumin, turmeric, paprika, chilli, ginger, garlic\n• Citrus: Lemon juice, lime juice — brightens flavours\n• Vinegar: White, apple cider, balsamic\n• Onion and garlic (fresh or powder, not salt blends)\n• No-salt seasoning blends\n\nCOOKING TIPS:\n• Do not add salt during cooking — add at the table if needed\n• Rinse canned vegetables and beans to remove sodium\n• Cook rice and pasta without salt\n• Make your own stocks and broths\n• Use fresh or frozen vegetables instead of canned\n• Season with fresh herbs and spices\n\nEATING OUT:\n• Ask for food prepared without added salt\n• Choose grilled, baked, or steamed (not fried)\n• Ask for sauces and dressings on the side\n• Avoid soups and broths (very salty)\n• Avoid buffets — you cannot control how food is prepared\n\nREMEMBER: A low-sodium diet is one of the most effective treatments for heart failure. It takes 2-4 weeks to adjust to less salt — after that, high-salt foods will taste too salty.',
    keyPoints: [
      'Limit sodium to less than 2,000-2,400 mg per day (about 1 teaspoon of salt)',
      'Avoid processed foods, canned soups, sausages, stock cubes, and salty snacks',
      'Season food with herbs, spices, lemon, vinegar, garlic, and onion instead of salt',
      'Read food labels — look for sodium content per serving',
      'It takes 2-4 weeks to adjust to less salt — after that, your taste buds adapt',
    ],
    category: 'Cardiovascular',
    condition: 'heart_failure',
    literacyLevel: 'basic',
    readTimeMinutes: 5,
    tags: ['heart failure', 'low sodium', 'salt restriction', 'diet', 'fluid retention'],
    icon: '🧂',
  },
  {
    id: 'heart-recognising-worsening-symptoms',
    title: 'Recognising worsening symptoms',
    summary: 'Heart failure can worsen gradually. Learning to recognise the early signs of deterioration allows you to get treatment before a crisis.',
    content: 'WHY RECOGNISING WORSENING MATTERS:\nHeart failure is a chronic condition that can worsen over time or flare up suddenly. Catching worsening early means your doctor can adjust treatment at home — preventing hospitalisation.\n\nEARLY WARNING SIGNS:\n1. WEIGHT GAIN:\n• Gain of 1-2 kg in 1-2 days is the EARLIEST sign of fluid buildup\n• This happens before you feel symptoms\n• WEIGH YOURSELF EVERY DAY\n\n2. INCREASED SWELLING:\n• Feet, ankles, or legs look larger than usual\n• Rings, shoes, or clothes feel tighter\n• Press your finger into your ankle — if the dent stays (pitting oedema), fluid is building up\n• Swelling in the abdomen — feels bloated, clothes tight at waist\n\n3. SHORTNESS OF BREATH:\n• You get short of breath more easily during usual activities\n• You need more pillows to sleep comfortably (orthopnoea)\n• You wake up gasping for air at night (paroxysmal nocturnal dyspnoea)\n• You feel breathless when resting\n\n4. COUGHING OR WHEEZING:\n• A new or worsening cough, especially at night\n• Coughing up white or pink-tinged mucus\n• Wheezing sounds when breathing\n\n5. FATIGUE:\n• Feeling more tired than usual\n• Difficulty doing tasks you normally do\n• Needing to rest more often\n\n6. OTHER SIGNS:\n• Loss of appetite or nausea\n• Confusion or difficulty concentrating\n• Rapid heart rate or palpitations\n• Decreased urine output (going to the toilet less often)\n• Feeling dizzy or lightheaded\n\nWHAT TO DO IF YOU NOTICE WORSENING:\n\nIF MILD WORSENING (one or two signs):\n• Call your doctor or clinic within 24 hours\n• Check your weight\n• Check your blood pressure\n• Review your salt intake\n• You may need a temporary increase in diuretic dose\n\nIF MODERATE WORSENING (several signs):\n• Call your doctor or clinic immediately\n• Do not wait to see if it gets better\n• You may need to start or increase diuretics\n• You may need blood tests\n\nIF SEVERE (see below):\n• Go to the hospital\n\nWHEN TO GO TO HOSPITAL:\n• Severe shortness of breath at rest\n• Cannot lie flat — must sleep sitting up\n• Confusion or drowsiness\n• Chest pain\n• Coughing up blood or pink frothy mucus\n• Fainting or near-fainting\n• Weight gain of 3+ kg in 1 week\n\nHOW TO PREVENT WORSENING:\n• Take medications every day — skipping doses is the most common cause of worsening\n• Follow your low-sodium diet\n• Weigh yourself daily and record the number\n• Stay active as your doctor recommends\n• Get vaccinated against flu and pneumonia\n• Avoid NSAIDs (ibuprofen, diclofenac)\n• Limit alcohol\n• Keep all medical appointments\n\nREMEMBER: Heart failure is a condition that requires daily management. The earlier you recognise worsening, the easier it is to treat. If in doubt, call your doctor.',
    keyPoints: [
      'Daily weight gain of 1-2 kg is the earliest sign of worsening heart failure',
      'Early signs: increased swelling, shortness of breath, coughing, fatigue',
      'Call your doctor if you notice mild worsening — do not wait',
      'Go to hospital for severe symptoms: breathlessness at rest, confusion, chest pain, fainting',
      'Prevent worsening: take medications daily, follow a low-sodium diet, weigh yourself daily',
    ],
    category: 'Cardiovascular',
    condition: 'heart_failure',
    literacyLevel: 'basic',
    readTimeMinutes: 6,
    tags: ['heart failure', 'worsening', 'symptoms', 'early warning', 'decompensation'],
    icon: '⚠️',
  },
];

export default ARTICLES;

export function getArticle(id: string): EducationArticle | undefined {
  return ARTICLES.find(a => a.id === id);
}

export function getArticlesByCondition(condition: string): EducationArticle[] {
  return ARTICLES.filter(a => a.condition === condition || a.condition === 'general');
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'your', 'of', 'in', 'a', 'an', 'to', 'at', 'on', 'with',
  'from', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'but', 'or', 'if', 'while', 'when', 'how', 'what',
  'why', 'where', 'this', 'that', 'these', 'those', 'not', 'no', 'can', 'will',
  'just', 'very', 'too', 'so', 'also', 'about', 'all', 'its', 'it', 'i', 'my',
  'me', 'we', 'you', 'he', 'she', 'they', 'them', 'their', 'our', 'more', 'than',
  'some', 'any', 'each', 'every', 'both', 'up', 'down', 'out', 'off', 'over',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'get', 'got', 'getting', 'make', 'made', 'making', 'take', 'took', 'taking',
  'need', 'needs', 'needed', 'use', 'used', 'using', 'help', 'helps', 'helped',
  'like', 'keep', 'keeping', 'start', 'starts', 'started',
]);

function extractKeywords(query: string): string[] {
  return query.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function scoreArticle(article: EducationArticle, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const titleLower = article.title.toLowerCase();
  const contentLower = article.content.toLowerCase();
  const tagsLower = article.tags.map(t => t.toLowerCase());
  const categoryLower = article.category.toLowerCase();
  const summaryLower = article.summary.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (titleLower.includes(kw)) score += 5;
    else if (summaryLower.includes(kw)) score += 3;
    else if (categoryLower.includes(kw)) score += 2;
    else if (tagsLower.some(t => t.includes(kw))) score += 2;
    else if (contentLower.includes(kw)) score += 1;
  }
  return score;
}

export function searchArticles(query: string): EducationArticle[] {
  const q = query.toLowerCase().trim();

  // First try exact substring match (original behavior, fast path)
  const exact = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.content.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q)) ||
    a.category.toLowerCase().includes(q)
  );
  if (exact.length > 0) return exact;

  // Fallback: keyword-based scoring
  const keywords = extractKeywords(q);
  if (keywords.length === 0) return [];

  const scored = ARTICLES.map(a => ({ article: a, score: scoreArticle(a, keywords) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(x => x.article);
}

export function getArticlesByCategory(category: string): EducationArticle[] {
  return ARTICLES.filter(a => a.category === category);
}

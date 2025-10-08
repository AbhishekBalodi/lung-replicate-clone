import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronRight, 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Calendar,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import pftHero from "@/assets/services/pft-hero.jpg";
import bronchoscopyHero from "@/assets/services/bronchoscopy-hero.jpg";
import sleepStudyHero from "@/assets/services/sleep-study-hero.jpg";
import allergyTestingHero from "@/assets/services/allergy-testing-hero.jpg";
import smokingCessationHero from "@/assets/services/smoking-cessation-hero.jpg";
import oxygenTherapyHero from "@/assets/services/oxygen-therapy-hero.jpg";
import lungRehabHero from "@/assets/services/lung-rehab-hero.jpg";
import criticalCareHero from "@/assets/services/critical-care-hero.jpg";

const ServiceDetail = () => {
  const { slug } = useParams();

  const serviceDetails: Record<string, any> = {
    "pulmonary-function-test": {
      title: "Pulmonary Function Test (PFT) in Delhi – Accurate Lung Function Diagnosis",
      heroImage: pftHero,
      introduction: "A Pulmonary Function Test (PFT) is a comprehensive diagnostic evaluation that measures how well your lungs work. At our Delhi clinic, we use state-of-the-art spirometry equipment to assess lung capacity, airflow, and gas exchange. This non-invasive test is crucial for diagnosing and monitoring various respiratory conditions including asthma, COPD, and interstitial lung diseases. PFTs provide objective data that helps our pulmonologists create personalized treatment plans tailored to your specific lung health needs.",
      whyNeeded: "PFTs are essential diagnostic tools recommended for patients experiencing chronic cough, shortness of breath, or wheezing. They are crucial for diagnosing conditions like asthma, chronic obstructive pulmonary disease (COPD), pulmonary fibrosis, and other restrictive lung diseases. Pre-operative assessments often require PFTs to evaluate surgical risks, especially for patients with existing respiratory conditions. Occupational health screenings use PFTs to monitor workers exposed to dust, chemicals, or other respiratory hazards. Athletes and individuals with unexplained exercise intolerance also benefit from PFT evaluation to optimize their breathing capacity and performance.",
      howItWorks: "The Pulmonary Function Test is a simple, painless procedure performed in our comfortable testing room. First, our trained respiratory therapist will explain the procedure and take your medical history. You'll be seated comfortably and fitted with a nose clip to ensure all breathing occurs through your mouth. The test involves breathing into a mouthpiece connected to a spirometer - a device that measures air volume and flow. You'll perform several breathing maneuvers including normal breathing, forced exhalation, and maximal inhalation. The entire test takes approximately 30-45 minutes. Some tests may include measurements before and after inhaling a bronchodilator medication to assess reversibility of airway obstruction. Results are immediately processed and reviewed by our pulmonologist who will discuss findings and recommendations with you.",
      whyChooseUs: "Our Delhi clinic is equipped with the latest spirometry technology that meets international standards for accuracy and reliability. Our certified respiratory therapists have extensive experience in conducting PFTs on patients of all ages, ensuring comfortable and accurate testing. Located in the heart of Delhi with easy access from major metro lines and parking facilities, we offer convenient appointment scheduling including same-day and weekend slots. Our pulmonologists are highly qualified specialists with years of experience in interpreting PFT results and creating effective treatment strategies. We provide detailed, easy-to-understand reports with personalized explanations and follow-up care recommendations.",
      faqs: [
        {
          question: "How should I prepare for a PFT?",
          answer: "Avoid heavy meals 2 hours before the test. Do not smoke for at least 4 hours prior. Wear loose, comfortable clothing. Continue regular medications unless specifically instructed otherwise by your doctor. Avoid vigorous exercise on the test day."
        },
        {
          question: "Is the test painful or uncomfortable?",
          answer: "No, PFT is completely non-invasive and painless. Some patients may feel slightly lightheaded from deep breathing maneuvers, but this passes quickly. Our staff ensures you're comfortable throughout the procedure."
        },
        {
          question: "How long does it take to get results?",
          answer: "Preliminary results are available immediately after testing. A detailed report with interpretation by our pulmonologist is typically provided within 24-48 hours. Urgent cases can receive same-day reports."
        },
        {
          question: "Will my insurance cover this test?",
          answer: "Most health insurance plans cover PFTs when medically necessary. We accept all major insurance providers and can help verify your coverage. Self-pay options are also available at competitive rates."
        }
      ]
    },
    "bronchoscopy": {
      title: "Bronchoscopy in Delhi – Advanced Airway Examination & Diagnosis",
      heroImage: bronchoscopyHero,
      introduction: "Bronchoscopy is an advanced diagnostic and therapeutic procedure that allows our pulmonologists to directly visualize your airways and lungs using a flexible bronchoscope. This minimally invasive technique is performed at our state-of-the-art endoscopy suite in Delhi, equipped with high-definition imaging technology. Bronchoscopy enables accurate diagnosis of lung conditions, collection of tissue samples for biopsy, and treatment of various airway abnormalities. Our experienced team ensures patient comfort and safety throughout the procedure with appropriate sedation and monitoring.",
      whyNeeded: "Bronchoscopy is recommended when imaging studies like X-rays or CT scans reveal abnormalities requiring further investigation. It's essential for diagnosing persistent cough, unexplained chest infections, coughing up blood (hemoptysis), or suspicious lung masses. The procedure allows collection of tissue samples (biopsy) from lung lesions, lymph nodes, or airway walls for accurate cancer diagnosis and staging. Bronchoscopy helps identify causes of chronic lung infections including tuberculosis, fungal infections, or pneumonia. It's also therapeutic - used to remove foreign objects, clear mucus plugs, treat airway bleeding, place stents in narrowed airways, or deliver localized medications directly to affected lung areas.",
      howItWorks: "The bronchoscopy procedure begins with pre-procedure preparation including fasting for at least 6 hours and medication review. Upon arrival at our endoscopy suite, you'll change into a hospital gown and IV access will be established. You'll receive sedation medications to keep you comfortable and relaxed - most patients don't remember the procedure. Local anesthetic spray numbs your throat to suppress the gag reflex. The bronchoscope, a thin flexible tube with a camera, is gently inserted through your nose or mouth, down your throat, and into your airways. Our pulmonologist navigates through the trachea and bronchi, examining the airway lining and collecting samples as needed. The entire procedure typically takes 30-60 minutes. Afterward, you'll rest in our recovery area for 2-3 hours until sedation wears off. You must have someone drive you home as driving is not permitted for 24 hours post-procedure.",
      whyChooseUs: "Our Delhi bronchoscopy center features the latest Olympus video bronchoscopy system with high-definition imaging and advanced biopsy tools. Our pulmonologists are fellowship-trained in interventional pulmonology with extensive experience performing thousands of bronchoscopies safely. We maintain strict infection control protocols and sterilization standards exceeding international guidelines. Located centrally in Delhi with dedicated parking and accessibility from metro stations, our facility offers comfortable pre-procedure and recovery areas. We provide comprehensive pre-procedure counseling, transparent pricing, and detailed post-procedure instructions. Our pathology partnerships ensure rapid biopsy results, typically within 3-5 days, with urgent cases expedited within 48 hours.",
      faqs: [
        {
          question: "Is bronchoscopy safe?",
          answer: "Yes, bronchoscopy is generally very safe when performed by experienced specialists. Complications are rare and include minor bleeding, temporary fever, or sore throat. Our team monitors you closely throughout the procedure to ensure safety."
        },
        {
          question: "Will I be asleep during the procedure?",
          answer: "You'll receive moderate sedation (twilight anesthesia) which makes you drowsy and comfortable but not fully unconscious. Most patients don't remember the procedure. General anesthesia is available for complex cases."
        },
        {
          question: "What should I expect after bronchoscopy?",
          answer: "You may experience mild throat soreness, hoarseness, or cough for 1-2 days. These symptoms resolve on their own. Avoid eating or drinking for 2 hours until throat numbness wears off. Rest for the remainder of the day."
        },
        {
          question: "When will I get my biopsy results?",
          answer: "Preliminary findings are discussed immediately after you recover. Detailed biopsy reports typically take 3-5 days. Our pulmonologist will schedule a follow-up consultation to discuss results and treatment recommendations."
        }
      ]
    },
    "sleep-study": {
      title: "Sleep Study (Polysomnography) in Delhi – Diagnose Sleep Disorders Accurately",
      heroImage: sleepStudyHero,
      introduction: "A sleep study, or polysomnography, is a comprehensive overnight evaluation that monitors your brain waves, oxygen levels, heart rate, breathing patterns, and body movements during sleep. Our accredited sleep center in Delhi provides comfortable, hotel-like rooms equipped with advanced monitoring technology to diagnose sleep disorders including sleep apnea, insomnia, restless leg syndrome, and narcolepsy. This non-invasive test is essential for identifying sleep-related breathing problems that can impact your overall health, increase cardiovascular risks, and affect daily functioning. Our sleep specialists analyze the data to provide accurate diagnosis and effective treatment recommendations.",
      whyNeeded: "Sleep studies are crucial for patients experiencing loud snoring, witnessed breathing pauses during sleep, or excessive daytime sleepiness despite adequate sleep hours. Untreated sleep apnea significantly increases risks of hypertension, heart disease, stroke, and diabetes. The test is recommended for individuals with morning headaches, difficulty concentrating, mood changes, or falling asleep while driving. Patients with existing heart conditions, obesity, or resistant hypertension should be screened for sleep disorders. Sleep studies help evaluate treatment effectiveness for patients already using CPAP machines or other therapies. Early diagnosis and treatment improve quality of life, reduce accident risks, and prevent serious cardiovascular complications.",
      howItWorks: "Your sleep study begins in the evening at our comfortable sleep laboratory designed to feel like a hotel room rather than a hospital. You'll arrive around 8-9 PM and be greeted by our sleep technologist who will explain the procedure. After changing into comfortable sleepwear, small sensors (electrodes) are painlessly attached to your scalp, face, chest, and legs using gentle adhesive. These monitor brain activity, eye movements, muscle tone, heart rhythm, and leg movements. Elastic belts around your chest and abdomen measure breathing effort, while a small sensor on your finger monitors oxygen levels. A nasal cannula tracks airflow. Despite the equipment, most patients sleep reasonably well. You'll sleep in a private room with comfortable bedding, adjustable lighting, and temperature control. Our technologist monitors you throughout the night from a separate control room and can assist if needed. You'll wake around 6-7 AM, sensors are removed, and you're free to leave. The entire process takes approximately 10-11 hours from arrival to departure.",
      whyChooseUs: "Our Delhi sleep center is fully accredited by the Indian Board of Sleep Medicine with state-of-the-art polysomnography equipment. Our sleep technologists are certified professionals trained in pediatric and adult sleep studies. Each private bedroom features comfortable mattresses, en-suite bathrooms, climate control, and entertainment options to help you relax before sleep. We're conveniently located with ample parking and nearby accommodations for accompanying family members. Our sleep medicine specialists have decades of combined experience interpreting thousands of sleep studies. We provide comprehensive reports within 5-7 days and offer follow-up consultations to discuss results and treatment options including CPAP therapy, oral appliances, or surgical interventions. We also provide CPAP trial and fitting services.",
      faqs: [
        {
          question: "Will I be able to sleep with all the wires?",
          answer: "Most patients sleep adequately despite initial concerns about the sensors. The wires are long enough to allow normal movement and position changes. Our sleep technologists ensure you're comfortable before lights out."
        },
        {
          question: "Can I take my regular medications?",
          answer: "Yes, continue all regular medications unless specifically instructed otherwise. However, avoid sleep medications, alcohol, and caffeine after 2 PM on study day as these can affect results."
        },
        {
          question: "What if I need to use the bathroom during the night?",
          answer: "Simply call the technologist using the intercom system in your room. They'll temporarily disconnect the sensors, allowing you to use your private bathroom, then reconnect them when you return to bed."
        },
        {
          question: "How is sleep apnea treated if diagnosed?",
          answer: "Treatment depends on severity and type. Options include CPAP therapy (continuous positive airway pressure), oral appliances, lifestyle modifications like weight loss, positional therapy, or surgical procedures. We provide comprehensive treatment solutions."
        }
      ]
    },
    "allergy-testing": {
      title: "Allergy Testing in Delhi – Identify Asthma & Respiratory Triggers",
      heroImage: allergyTestingHero,
      introduction: "Allergy testing is a precise diagnostic procedure that identifies specific allergens triggering your asthma, allergic rhinitis, or other respiratory symptoms. Our Delhi allergy clinic offers comprehensive skin prick testing and blood tests (specific IgE) to detect sensitivities to environmental allergens including pollen, dust mites, mold, pet dander, and certain foods. Understanding your specific triggers enables our allergists to create personalized avoidance strategies and treatment plans including immunotherapy (allergy shots) when appropriate. Early identification and management of allergies significantly improve asthma control, reduce symptoms, and enhance quality of life.",
      whyNeeded: "Allergy testing is essential for individuals with poorly controlled asthma despite medications, frequent respiratory infections, chronic nasal congestion, or seasonal breathing difficulties. Many asthma patients have allergic triggers that, when identified and avoided, dramatically improve symptom control and reduce medication requirements. Testing helps distinguish between allergic and non-allergic asthma, guiding appropriate treatment selection. Patients planning immunotherapy must undergo testing to identify specific allergens for vaccine preparation. Children with recurrent wheezing, eczema, or food allergies benefit from comprehensive testing to prevent respiratory complications. Adults experiencing new-onset breathing problems, chronic sinus issues, or work-related respiratory symptoms should be evaluated for occupational allergen exposure.",
      howItWorks: "Skin prick testing is our primary allergy testing method, performed on your forearm or back. The procedure begins with cleaning the test area with alcohol. Our allergist places small drops of common allergen extracts on your skin in a grid pattern, then gently pricks the skin surface with a sterile lancet - this doesn't draw blood and causes minimal discomfort. Testing typically includes 30-50 different allergens covering pollens (trees, grasses, weeds), indoor allergens (dust mites, mold, cockroach, pet dander), and sometimes foods. You'll wait 15-20 minutes while reactions develop. Positive reactions appear as small raised bumps (wheals) with surrounding redness, similar to mosquito bites. Our allergist measures each reaction and interprets results immediately. Blood testing (specific IgE) is used when skin testing isn't possible due to certain medications, skin conditions, or patient age. Results from blood tests take 3-5 days. After testing, we review results, explain your specific sensitivities, and develop a comprehensive management plan.",
      whyChooseUs: "Our Delhi allergy center uses FDA-approved, standardized allergen extracts ensuring reliable and reproducible results. Our allergists are board-certified with specialized training in respiratory allergies and immunology. We test for region-specific allergens relevant to Delhi's environment including local pollens, molds, and pollutants. Located centrally with extended hours including weekend appointments, we accommodate busy schedules. We provide detailed written reports explaining each allergen, cross-reactivity patterns, and practical avoidance strategies. Our comprehensive approach includes environmental control counseling, medication optimization, and access to immunotherapy programs. We coordinate closely with your pulmonologist or primary physician to ensure integrated care. Follow-up support and re-testing when needed are part of our long-term allergy management commitment.",
      faqs: [
        {
          question: "Should I stop my allergy medications before testing?",
          answer: "Yes, antihistamines must be stopped 3-7 days before skin testing as they interfere with results. Continue asthma inhalers, nasal sprays, and other medications. We'll provide specific instructions when scheduling your appointment."
        },
        {
          question: "Is allergy testing safe for children?",
          answer: "Yes, skin prick testing is safe for children as young as 6 months. The procedure causes minimal discomfort - less than a vaccination. Results help guide early intervention to prevent asthma development."
        },
        {
          question: "Can testing cause an allergic reaction?",
          answer: "Severe reactions are extremely rare. You may experience localized itching and redness at test sites, which resolves within hours. Our allergists are equipped to handle any reaction, though significant issues are exceptionally uncommon."
        },
        {
          question: "What is immunotherapy and am I a candidate?",
          answer: "Immunotherapy (allergy shots or sublingual tablets) gradually desensitizes you to specific allergens, providing long-term relief. Candidates include those with significant symptoms, multiple allergen sensitivities, or inadequate response to medications. We'll discuss eligibility based on your test results."
        }
      ]
    },
    "smoking-cessation": {
      title: "Smoking Cessation Programs in Delhi – Expert Support to Quit Smoking",
      heroImage: smokingCessationHero,
      introduction: "Our comprehensive smoking cessation program in Delhi combines evidence-based medical treatments with behavioral counseling to help you successfully quit smoking permanently. Led by pulmonologists and certified tobacco treatment specialists, our program addresses both physical nicotine addiction and psychological dependence. We offer personalized quit plans incorporating nicotine replacement therapy, prescription medications like varenicline or bupropion, and ongoing counseling support. Quitting smoking is the single most important step you can take to improve lung health, reduce cancer risk, and extend your life expectancy. Our success-focused approach has helped thousands of Delhi residents become smoke-free.",
      whyNeeded: "Smoking is the leading preventable cause of death, responsible for 90% of lung cancer cases and significantly increasing risks of COPD, heart disease, stroke, and numerous other conditions. Smokers experience twice the risk of sudden cardiac death compared to non-smokers. Every cigarette damages airways, reduces lung function, and accelerates aging of lung tissue. Patients with existing respiratory conditions like asthma or COPD experience dramatic improvement when they quit. Smokers planning surgery face higher complication risks including poor wound healing and respiratory infections - quitting even 4 weeks before surgery reduces these risks. Secondhand smoke exposure harms family members, particularly children who develop more respiratory infections and asthma. Quitting at any age provides immediate and long-term health benefits. Within 20 minutes of quitting, heart rate normalizes; within weeks, lung function improves; within a year, heart disease risk drops by 50%.",
      howItWorks: "Your smoking cessation journey begins with a comprehensive assessment appointment where our specialist evaluates your smoking history, previous quit attempts, triggers, and readiness to quit. We measure your carbon monoxide level and lung function to establish baseline health status. Together, we develop a personalized quit plan setting a quit date and selecting appropriate cessation aids. Nicotine replacement options include patches, gum, lozenges, inhalers, or nasal spray. Prescription medications like varenicline (Champix) or bupropion significantly increase quit success by reducing cravings and withdrawal symptoms. Behavioral counseling addresses psychological dependence, stress management, and trigger avoidance strategies. We schedule frequent follow-up visits - weekly initially, then monthly - providing accountability and support. Counseling sessions teach coping mechanisms for high-risk situations like social events or stress. We monitor withdrawal symptoms, adjust medications as needed, and celebrate milestones. Our program typically spans 12 weeks with optional extended support. Relapses are addressed constructively as learning opportunities rather than failures.",
      whyChooseUs: "Our Delhi smoking cessation center employs pulmonologists who understand the serious lung health consequences of smoking and are passionate about helping patients quit. Our certified tobacco treatment specialists have extensive training in addiction medicine and behavioral change techniques. We offer flexible scheduling including evening appointments to accommodate working professionals. Our program combines medical management with psychological support - addressing both addiction components simultaneously increases success rates to 40-50% compared to 5-7% with willpower alone. We accept insurance coverage for cessation medications and counseling. Group support sessions connect you with others on the same journey, providing peer encouragement and shared experiences. We provide ongoing support even after program completion - you can contact us anytime you need help staying smoke-free. Our relapse prevention strategies prepare you for long-term success.",
      faqs: [
        {
          question: "Will I gain weight when I quit smoking?",
          answer: "Some people gain 5-10 pounds initially as metabolism adjusts and taste/smell improve. We provide nutritional counseling and exercise recommendations to minimize weight gain. The health benefits of quitting far outweigh minor weight changes."
        },
        {
          question: "How bad will withdrawal symptoms be?",
          answer: "Withdrawal varies by individual but typically includes irritability, anxiety, difficulty concentrating, and strong cravings for 2-4 weeks. Our medications and nicotine replacement significantly reduce these symptoms. Most people find withdrawal manageable with proper support."
        },
        {
          question: "What if I've tried to quit before and failed?",
          answer: "Most successful quitters tried multiple times before achieving long-term abstinence. Each attempt is a learning experience. Our comprehensive program addresses gaps from previous attempts and provides tools you may not have used before."
        },
        {
          question: "Are cessation medications safe?",
          answer: "Yes, FDA-approved cessation medications are safe and effective. We screen for contraindications and monitor for side effects. The risks from continued smoking far exceed any medication risks. We'll find the safest, most effective option for you."
        }
      ]
    },
    "oxygen-therapy": {
      title: "Oxygen Therapy in Delhi – Home & Hospital Oxygen Treatment Services",
      heroImage: oxygenTherapyHero,
      introduction: "Oxygen therapy provides supplemental oxygen to patients whose blood oxygen levels are too low due to chronic lung diseases. Our Delhi pulmonary center offers comprehensive oxygen therapy assessment, prescription, and management for conditions including COPD, pulmonary fibrosis, severe asthma, and heart failure. We evaluate your oxygen needs through pulse oximetry and arterial blood gas testing, prescribe appropriate delivery systems (nasal cannula, masks, portable concentrators), and coordinate home oxygen setup with reliable suppliers. Proper oxygen therapy improves energy levels, reduces shortness of breath, enhances sleep quality, and decreases strain on your heart and other organs.",
      whyNeeded: "Oxygen therapy becomes necessary when chronic lung diseases impair the lungs' ability to absorb adequate oxygen from air. Low blood oxygen levels (hypoxemia) cause fatigue, confusion, rapid heartbeat, and bluish discoloration of lips or fingertips. Without correction, chronic hypoxemia damages organs requiring high oxygen supply including the heart, brain, and kidneys. COPD patients with chronic low oxygen levels benefit from long-term oxygen therapy which studies show extends life expectancy and improves quality of life. Patients with interstitial lung diseases, pulmonary hypertension, or severe heart failure often require supplemental oxygen during activity or sleep. Post-COVID patients with persistent lung damage may need temporary oxygen support during recovery. Oxygen therapy during exercise allows patients with lung disease to maintain physical activity and prevent deconditioning. Proper oxygen supplementation reduces hospitalizations and emergency visits.",
      howItWorks: "Oxygen therapy assessment begins with measuring your oxygen saturation using a pulse oximeter placed on your finger - normal levels are 95-100%. If levels are borderline or low, we perform an arterial blood gas test which involves drawing blood from your wrist artery to precisely measure oxygen, carbon dioxide, and blood pH. We may conduct a six-minute walk test to assess if oxygen levels drop during activity. Based on results, our pulmonologist determines if oxygen therapy is medically necessary and prescribes the appropriate flow rate (liters per minute) and usage schedule - continuous, during activity, or only during sleep. We arrange home oxygen equipment including stationary concentrators for home use, portable oxygen concentrators for mobility, or compressed oxygen cylinders for backup. Our respiratory therapist educates you on equipment operation, safety precautions, and maintenance. We schedule follow-up visits to reassess oxygen needs, check equipment function, and adjust prescription as your condition changes. Many patients eventually wean off oxygen as their condition stabilizes with treatment.",
      whyChooseUs: "Our Delhi pulmonary center has extensive experience managing oxygen therapy for hundreds of patients with various lung conditions. We partner with reliable oxygen suppliers offering 24/7 delivery and service support throughout Delhi NCR. Our pulmonologists stay current with oxygen prescription guidelines ensuring you receive appropriate therapy - neither over-treated causing complications nor under-treated risking organ damage. We provide comprehensive education on oxygen safety including fire hazards, travel considerations, and insurance coverage navigation. Our respiratory therapists are available by phone to troubleshoot equipment issues, adjust settings, or answer questions. We coordinate with your insurance provider to ensure coverage and minimize out-of-pocket costs. For active patients, we recommend lightweight portable concentrators enabling continued work and social activities. We monitor your oxygen needs long-term, adjusting prescriptions as your lung function improves or declines.",
      faqs: [
        {
          question: "Will I need oxygen therapy forever?",
          answer: "Not necessarily. Some patients require temporary oxygen during acute illness or exacerbations and discontinue once recovered. Others with progressive diseases like COPD or pulmonary fibrosis may need long-term therapy. We regularly reassess your needs."
        },
        {
          question: "Can I travel with oxygen?",
          answer: "Yes! Portable oxygen concentrators are FAA-approved for air travel. We provide documentation for airlines. For road trips, we help arrange oxygen delivery to your destination. Advance planning ensures uninterrupted therapy while traveling."
        },
        {
          question: "Is oxygen therapy dangerous or addictive?",
          answer: "Oxygen is not addictive. When prescribed appropriately, it's very safe. Fire safety is important - keep oxygen away from flames, cigarettes, and heat sources. Our therapists teach safety precautions. Properly used oxygen therapy significantly improves health."
        },
        {
          question: "Will insurance cover home oxygen?",
          answer: "Most insurance plans including government schemes cover home oxygen when medically necessary. Coverage typically requires documented hypoxemia through blood gas or oximetry testing. We provide necessary documentation and work with suppliers to verify coverage."
        }
      ]
    },
    "lung-rehabilitation": {
      title: "Lung Rehabilitation Programs in Delhi – Improve Breathing & Quality of Life",
      heroImage: lungRehabHero,
      introduction: "Pulmonary rehabilitation is a comprehensive supervised program combining exercise training, education, and behavioral intervention designed to improve physical and emotional well-being of people with chronic lung diseases. Our Delhi rehabilitation center offers personalized programs led by respiratory therapists, physiotherapists, and pulmonologists. The program includes cardiovascular and strength training exercises, breathing techniques, nutritional counseling, and disease self-management education. Pulmonary rehabilitation is considered essential treatment for COPD, pulmonary fibrosis, and pre/post-lung transplant patients. Research consistently demonstrates that rehabilitation reduces symptoms, improves exercise capacity, decreases hospitalizations, and enhances quality of life significantly.",
      whyNeeded: "Chronic lung diseases create a vicious cycle - breathlessness leads to activity avoidance, causing muscle deconditioning, which worsens breathlessness with minimal exertion. Pulmonary rehabilitation breaks this cycle. It's strongly recommended for COPD patients of all severity levels, significantly reducing hospital readmissions and improving survival. Post-hospitalization rehabilitation helps recover strength and prevent future exacerbations. Patients with interstitial lung diseases, bronchiectasis, pulmonary hypertension, or asthma with persistent symptoms benefit substantially. Pre-operative rehabilitation optimizes surgical outcomes for lung volume reduction surgery or transplant candidates. Even patients using oxygen therapy gain improved exercise tolerance and independence through rehabilitation. The program addresses psychological aspects including anxiety and depression common in chronic lung disease. Education components teach proper medication use, breathing techniques, energy conservation, and recognition of warning signs requiring medical attention.",
      howItWorks: "Your rehabilitation journey begins with comprehensive assessment including medical history review, current symptoms evaluation, medication review, exercise tolerance testing (six-minute walk test), lung function measurement, and quality of life questionnaires. Based on assessment, our team develops an individualized program tailored to your specific condition, limitations, and goals. Programs typically run 2-3 sessions per week for 8-12 weeks, with each session lasting 2-3 hours. Exercise training starts at your current fitness level and gradually progresses. Aerobic exercises include treadmill walking, stationary cycling, or arm ergometry - strengthening uses light weights and resistance bands. Our therapists teach proper breathing techniques including pursed-lip breathing, diaphragmatic breathing, and active exhalation cycles to improve breathing efficiency. Education sessions cover lung disease pathophysiology, medication management, nutrition, travel planning, oxygen use, and smoking cessation. Group discussions provide peer support and shared experience. We incorporate stress management and relaxation techniques. Progress is monitored through repeated exercise tests and symptom questionnaires. Upon completion, we develop a home maintenance exercise program and schedule periodic follow-up visits.",
      whyChooseUs: "Our Delhi pulmonary rehabilitation center is equipped with hospital-grade exercise equipment, emergency medical resources, and oxygen supplementation for safe exercise training. Our multidisciplinary team includes pulmonologists, certified respiratory therapists, physiotherapists, dietitians, and psychologists providing comprehensive care. We maintain low patient-to-therapist ratios ensuring personalized attention and proper supervision. Our facility offers flexible scheduling with morning and afternoon sessions accommodating various schedules. Located centrally with wheelchair accessibility and family waiting areas. We provide transportation assistance for patients with mobility challenges. Our program follows evidence-based guidelines recommended by international respiratory societies. Success metrics show our graduates achieve average 50-meter improvement in six-minute walk distance and significant symptom reduction. We offer ongoing support through maintenance programs and alumni groups. Insurance coverage assistance is provided to maximize accessibility.",
      faqs: [
        {
          question: "Am I too old or sick for pulmonary rehabilitation?",
          answer: "No! Rehabilitation benefits patients of all ages and disease severity levels. Our program is tailored to your individual capacity starting from your baseline, however limited. Even severely impaired patients show meaningful improvement."
        },
        {
          question: "Will insurance cover pulmonary rehabilitation?",
          answer: "Many insurance plans cover pulmonary rehabilitation for COPD and other chronic lung diseases when prescribed by a physician. We verify coverage before enrollment and provide necessary documentation for reimbursement."
        },
        {
          question: "What should I wear and bring to sessions?",
          answer: "Wear comfortable athletic clothing and supportive athletic shoes. Bring a water bottle, any prescribed inhalers or oxygen equipment, and a small towel. We provide exercise equipment and monitoring devices."
        },
        {
          question: "Can I continue rehabilitation after the program ends?",
          answer: "Absolutely! We provide a personalized home exercise program and encourage continued activity. Maintenance programs and refresher sessions are available. We recommend gym or community exercise programs to sustain benefits long-term."
        }
      ]
    },
    "critical-care": {
      title: "Critical Care & ICU Support in Delhi – Advanced Respiratory Emergency Care",
      heroImage: criticalCareHero,
      introduction: "Our Critical Care and ICU services provide life-saving treatment for patients with severe respiratory failure, acute respiratory distress syndrome (ARDS), severe pneumonia, massive hemoptysis, and other life-threatening pulmonary emergencies. Our Delhi hospital features a state-of-the-art 20-bed ICU equipped with advanced ventilators, continuous monitoring systems, bronchoscopy capabilities, and emergency interventions. Our intensivist-led team including pulmonologists, critical care nurses, and respiratory therapists provides 24/7 specialized care using evidence-based protocols. We manage mechanical ventilation, non-invasive ventilation, extracorporeal support, and complex medication infusions for critically ill respiratory patients.",
      whyNeeded: "Respiratory failure is a medical emergency requiring immediate intensive care intervention. Conditions necessitating ICU admission include severe COVID-19 pneumonia with hypoxemia, acute exacerbations of COPD not responding to emergency treatment, status asthmaticus (severe asthma attack), massive pulmonary embolism, acute respiratory distress syndrome from sepsis or pneumonia, aspiration pneumonia with respiratory compromise, and post-operative respiratory complications. Patients with neuromuscular diseases affecting breathing muscles, severe chest trauma, or acute pulmonary edema from heart failure may require ventilatory support. Early ICU admission with aggressive treatment prevents progression to multi-organ failure and death. Our ICU provides invasive monitoring including arterial lines and central venous catheters, rapid response to deterioration, ventilator management by specialists, and immediate access to diagnostic imaging and bronchoscopy. Family-centered care includes regular updates, ICU visitation, and emotional support.",
      howItWorks: "ICU admission occurs through emergency department, hospital transfer, or direct admission for elective high-risk procedures. Upon arrival, our team performs rapid assessment including vital signs, arterial blood gas analysis, chest imaging, and laboratory tests. Patients typically have continuous cardiac monitoring, pulse oximetry, and frequent vital sign checks. Depending on severity, respiratory support ranges from high-flow nasal oxygen and non-invasive positive pressure ventilation (BiPAP) to mechanical ventilation through an endotracheal tube. Our ventilator protocols use lung-protective strategies minimizing ventilator-induced injury. Sedation and analgesia keep intubated patients comfortable. We perform daily assessments for extubation readiness with spontaneous breathing trials. Comprehensive ICU care includes infection prevention protocols, early mobilization when stable, nutritional support, deep vein thrombosis prophylaxis, and aggressive management of complications. Families receive twice-daily updates from attending physicians. As patients stabilize, we transition to step-down units before general ward transfer. Our ICU rehabilitation team begins early mobilization and breathing exercises to prevent ICU-acquired weakness.",
      whyChooseUs: "Our Delhi critical care unit maintains ICU-to-patient ratios meeting international standards with trained critical care nurses monitoring 2-3 patients each. Our intensivists are board-certified in critical care medicine with additional pulmonary fellowship training. We use Hamilton and Drager ventilators offering advanced modes including APRV, PRVC, and high-frequency oscillation for ARDS management. Our ICU pharmacy provides 24/7 access to critical medications including continuous infusions. We have in-house diagnostic capabilities including portable X-ray, ultrasound, echocardiography, and bronchoscopy available round-the-clock. Infection rates in our ICU are below national averages due to strict protocols. Our multidisciplinary approach involves daily rounds with pulmonologists, intensivists, infectious disease specialists, and pharmacists optimizing treatment plans. Family amenities include dedicated waiting areas, overnight accommodations for out-of-town families, and chaplain services. Transparent communication ensures families understand their loved one's condition and treatment plan.",
      faqs: [
        {
          question: "Can family members visit ICU patients?",
          answer: "Yes, we have structured visitation hours typically twice daily for 30-minute periods. Flexible visitation is arranged for critically ill patients. Visitors must follow infection control measures including hand hygiene and protective equipment when required."
        },
        {
          question: "How long do patients typically stay in ICU?",
          answer: "ICU length of stay varies widely depending on condition severity. Uncomplicated pneumonia may require 3-5 days while severe ARDS or multi-organ failure may extend to weeks. Our goal is safe, timely transfer to lower acuity care."
        },
        {
          question: "What happens when a patient is on a ventilator?",
          answer: "Mechanically ventilated patients receive sedation to tolerate the breathing tube comfortably. The ventilator delivers oxygen-rich breaths at prescribed volumes and rates. We minimize sedation when possible and perform daily assessments to determine if patients can breathe independently."
        },
        {
          question: "Does insurance cover ICU care?",
          answer: "Most health insurance policies cover medically necessary ICU care. ICU charges include room, nursing, monitoring, ventilator, and physician services. We work with insurance companies to verify coverage and provide itemized billing. Financial counselors assist with insurance questions."
        }
      ]
    }
  };

  const service = slug ? serviceDetails[slug] : null;

  if (!service) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Service not found</h1>
          <Link to="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-20">
        {/* Hero Section with Background Image */}
        <section 
          className="relative h-[400px] md:h-[500px] bg-cover bg-center"
          style={{ backgroundImage: `url(${service.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6">
                <Link to="/" className="text-white/80 hover:text-white transition-colors font-livvic text-sm">Home</Link>
                <ChevronRight className="h-4 w-4 text-white/60" />
                <Link to="/services" className="text-white/80 hover:text-white transition-colors font-livvic text-sm">Services</Link>
                <ChevronRight className="h-4 w-4 text-white/60" />
                <span className="text-white font-livvic text-sm">Current Service</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-lexend max-w-4xl leading-tight">
                {service.title}
              </h1>
              
              <Link to="/services">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-lung-blue">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Services
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-lexend">What is This Service?</h2>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {service.introduction}
              </p>
            </Card>
          </div>
        </section>

        {/* Why It's Needed Section */}
        <section className="py-12 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-lung-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-lexend">Why This Service is Needed</h2>
                </div>
              </div>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {service.whyNeeded}
              </p>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 font-lexend">How It Works</h2>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {service.howItWorks}
              </p>
            </Card>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-12 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-lung-blue/10 to-lung-blue-dark/10 border-lung-blue/20">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 font-lexend">Why Choose Us in Delhi</h2>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {service.whyChooseUs}
              </p>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-lexend">Frequently Asked Questions</h2>
              <p className="text-muted-foreground font-livvic">Common questions about this service</p>
            </div>
            
            <div className="space-y-6">
              {service.faqs.map((faq: any, index: number) => (
                <Card key={index} className="p-6 hover:shadow-medium transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-lung-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="h-5 w-5 text-lung-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2 font-lexend">{faq.question}</h3>
                      <p className="text-muted-foreground font-livvic leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-lung-blue to-lung-blue-dark">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-lexend">Ready to Get Started?</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 font-livvic">
              Book your appointment today and take the first step toward better respiratory health
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/book-appointment">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Button>
              </Link>
              
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-lung-blue">
                <Phone className="mr-2 h-5 w-5" />
                Call: +91 98765 43210
              </Button>
              
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-lung-blue">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp Us
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
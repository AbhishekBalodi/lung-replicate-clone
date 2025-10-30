import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import lungCancerScreeningHero from "@/assets/services/lung-cancer-screening-hero.jpg";

const ServiceDetail = () => {
  const { slug } = useParams();

  const serviceDetails: Record<string, any> = {
"cpap-bipap-therapy": {
  title: "CPAP & BiPAP Therapy in Delhi",
  heroImage: lungCancerScreeningHero,
  introduction: "Content coming soon.",
  whyNeeded: "TBD",
  howItWorks: "TBD",
  whyChooseUs: "Experienced pulmonologist, safe and effective care.",
  faqs: [
    { question: "Is it safe?", answer: "Yes, performed by specialists." }
  ]
},

"abg-analysis": {
  title: "Arterial Blood Gas (ABG) Analysis in Delhi",
  heroImage: bronchoscopyHero,
  introduction: "Content coming soon.",
  whyNeeded: "TBD",
  howItWorks: "TBD",
  whyChooseUs: "Experienced pulmonologist, safe and effective care.",
  faqs: [
    { question: "Is it safe?", answer: "Yes, performed by specialists." }
  ]
},

"pleuroscopy": {
  title: "Pleuroscopy in Delhi",
  heroImage: bronchoscopyHero,
  introduction: "Content coming soon.",
  whyNeeded: "TBD",
  howItWorks: "TBD",
  whyChooseUs: "Experienced pulmonologist, safe and effective care.",
  faqs: [
    { question: "Is it safe?", answer: "Yes, performed by specialists." }
  ]
},

"ict-insertion": {
  title: "Intercostal Chest Tube (ICT) Insertion in Delhi",
  heroImage: bronchoscopyHero,
  introduction: "Content coming soon.",
  whyNeeded: "TBD",
  howItWorks: "TBD",
  whyChooseUs: "Experienced pulmonologist, safe and effective care.",
  faqs: [
    { question: "Is it safe?", answer: "Yes, performed by specialists." }
  ]
},

"pleural-aspiration": {
  title: "Pleural Aspiration in Delhi",
  heroImage: bronchoscopyHero,
  introduction: "Content coming soon.",
  whyNeeded: "TBD",
  howItWorks: "TBD",
  whyChooseUs: "Experienced pulmonologist, safe and effective care.",
  faqs: [
    { question: "Is it safe?", answer: "Yes, performed by specialists." }
  ]
},

"spirometry": {
  title: "Spirometry in Delhi",
  heroImage: pftHero,
  introduction: "Content coming soon.",
  whyNeeded: "TBD",
  howItWorks: "TBD",
  whyChooseUs: "Experienced pulmonologist, safe and effective care.",
  faqs: [
    { question: "Is it safe?", answer: "Yes, performed by specialists." }
  ]
},

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
      title: "Sleep Study Test in Delhi – Diagnose Sleep Apnea & Breathing Disorders",
      heroImage: sleepStudyHero,
      introduction: "If you are experiencing loud snoring, disturbed sleep, or excessive daytime fatigue, you may have a sleep disorder such as sleep apnea. In Delhi, rising stress levels, obesity, and urban lifestyle factors have led to an increase in sleep-related breathing disorders. A Sleep Study (Polysomnography) is the gold standard test to diagnose and treat such conditions. A sleep study is a non-invasive test that records your body's functions while you sleep. It monitors breathing patterns, oxygen levels in the blood, brain activity (EEG), heart rate (ECG), snoring, and body movements. The test is usually conducted overnight in a sleep lab or at home using portable devices.",
      whyNeeded: "You may require a sleep study if you suffer from loud snoring with choking or gasping, morning headaches or fatigue, daytime sleepiness and poor concentration, high blood pressure resistant to medication, or restless sleep with frequent waking up. Common conditions diagnosed with a sleep study include Obstructive Sleep Apnea (OSA), Central Sleep Apnea, Insomnia and Restless Leg Syndrome, and Narcolepsy. Benefits include accurate diagnosis of sleep disorders, helps in tailoring treatment (e.g., CPAP therapy), prevents long-term risks like heart disease, stroke, and diabetes, and improves energy levels, memory, and overall quality of life.",
      howItWorks: "Your sleep study begins in the evening at our comfortable sleep laboratory designed to feel like a hotel room rather than a hospital. You'll arrive around 8-9 PM and be greeted by our sleep technologist who will explain the procedure. After changing into comfortable sleepwear, small sensors (electrodes) are painlessly attached to your scalp, face, chest, and legs using gentle adhesive. These monitor brain activity, eye movements, muscle tone, heart rhythm, and leg movements. Elastic belts around your chest and abdomen measure breathing effort, while a small sensor on your finger monitors oxygen levels. A nasal cannula tracks airflow. Despite the equipment, most patients sleep reasonably well. You'll sleep in a private room with comfortable bedding, adjustable lighting, and temperature control. The entire process takes approximately 6-8 hours, usually one night. You'll wake around 6-7 AM, sensors are removed, and you're free to leave.",
      whyChooseUs: "Our Delhi sleep center is supervised by an experienced pulmonologist and sleep medicine expert. We provide a comfortable, hygienic sleep lab environment with affordable home sleep study options available. Our sleep medicine specialists provide detailed reports and follow-up consultation. We're conveniently located with ample parking and provide comprehensive reports within 5-7 days with follow-up consultations to discuss results and treatment options including CPAP therapy, oral appliances, or surgical interventions. We also provide CPAP trial and fitting services.",
      faqs: [
        {
          question: "Is a sleep study uncomfortable?",
          answer: "No, it's painless. Most patients adjust within a few minutes. The wires are long enough to allow normal movement and position changes. Our sleep technologists ensure you're comfortable before lights out."
        },
        {
          question: "Can a sleep study be done at home?",
          answer: "Yes, we provide home-based sleep study kits in Delhi."
        },
        {
          question: "How long does a sleep study take?",
          answer: "Usually one night (6–8 hours)."
        },
        {
          question: "What if I need to use the bathroom during the night?",
          answer: "Simply call the technologist using the intercom system in your room. They'll temporarily disconnect the sensors, allowing you to use your private bathroom, then reconnect them when you return to bed."
        }
      ]
    },
    "allergy-testing": {
      title: "Allergy Testing for Asthma & Respiratory Diseases in Delhi",
      heroImage: allergyTestingHero,
      introduction: "Allergies are one of the leading causes of asthma, chronic cough, and breathing difficulties in Delhi. With high levels of pollution, dust, and pollen, many residents suffer from respiratory allergies without even knowing their exact triggers. Allergy testing helps identify these triggers so that your doctor can design an effective treatment plan. Allergy testing involves exposing your skin or blood samples to suspected allergens and monitoring the body's reaction. Common tests include Skin Prick Test (SPT) which checks for immediate allergic reactions, Blood tests (IgE levels) that measure immune system response, and Patch tests used for skin-related allergies.",
      whyNeeded: "If you suffer from seasonal or year-round sneezing, runny nose, or itchy eyes, frequent asthma attacks or wheezing, chronic cough and throat irritation, skin rashes or eczema, or shortness of breath triggered by certain environments, allergy testing may be essential. Common allergens in Delhi include airborne dust and pollution particles, pollen during spring and monsoon, pet dander (cats, dogs), mold spores from damp areas, cigarette smoke, and food items (milk, nuts, seafood). Benefits include pinpointing exact allergens causing your symptoms, helping create an allergen-avoidance strategy, guiding treatment like antihistamines, inhalers, or immunotherapy, and improving quality of life by preventing flare-ups.",
      howItWorks: "Skin prick testing is our primary allergy testing method, performed on your forearm or back. The procedure begins with cleaning the test area with alcohol. Our allergist places small drops of common allergen extracts on your skin in a grid pattern, then gently pricks the skin surface with a sterile lancet - this doesn't draw blood and causes minimal discomfort. Testing typically includes 30-50 different allergens covering pollens (trees, grasses, weeds), indoor allergens (dust mites, mold, cockroach, pet dander), and sometimes foods. You'll wait 15-20 minutes while reactions develop. Positive reactions appear as small raised bumps (wheals) with surrounding redness, similar to mosquito bites. Most allergy tests take 20–40 minutes. Our allergist measures each reaction and interprets results immediately. Blood testing (specific IgE) is used when skin testing isn't possible due to certain medications, skin conditions, or patient age. Results from blood tests take 3-5 days.",
      whyChooseUs: "Our Delhi allergy center is supervised by experienced chest physician and allergy specialist. We offer a wide range of allergy tests available under one roof with affordable, accurate, and safe testing procedures. Our allergists use FDA-approved, standardized allergen extracts ensuring reliable and reproducible results. We test for region-specific allergens relevant to Delhi's environment including local pollens, molds, and pollutants. We provide detailed counseling and personalized treatment plans with written reports explaining each allergen, cross-reactivity patterns, and practical avoidance strategies. We coordinate closely with your pulmonologist or primary physician to ensure integrated care.",
      faqs: [
        {
          question: "Is allergy testing painful?",
          answer: "Skin prick tests may cause mild itching, but they are not painful."
        },
        {
          question: "How long does the test take?",
          answer: "Most allergy tests take 20–40 minutes."
        },
        {
          question: "Can allergies be cured?",
          answer: "Allergies cannot be completely cured but can be well controlled with treatment."
        },
        {
          question: "Should I stop my allergy medications before testing?",
          answer: "Yes, antihistamines must be stopped 3-7 days before skin testing as they interfere with results. Continue asthma inhalers, nasal sprays, and other medications. We'll provide specific instructions when scheduling your appointment."
        }
      ]
    },
    "smoking-cessation": {
      title: "Quit Smoking with Our Smoking Cessation Program in Delhi",
      heroImage: smokingCessationHero,
      introduction: "Smoking is one of the leading causes of lung cancer, COPD, heart disease, and respiratory problems in India. In Delhi, where pollution already strains the lungs, smoking makes conditions far worse. Quitting smoking may be difficult, but with the right support, it is possible. Our Smoking Cessation Program in Delhi is designed to help individuals quit smoking permanently and regain their health. Smoking damages nearly every organ in the body, especially the lungs, leading to COPD and asthma flare-ups, lung cancer, heart disease and high blood pressure, weak immune system, and reduced life expectancy. By quitting smoking, patients experience improved lung function, better stamina and energy levels, reduced risk of cancer and chronic diseases, healthier skin and improved immunity.",
      whyNeeded: "Smoking is the leading preventable cause of death, responsible for 90% of lung cancer cases and significantly increasing risks of COPD, heart disease, stroke, and numerous other conditions. Every cigarette damages airways, reduces lung function, and accelerates aging of lung tissue. Patients with existing respiratory conditions like asthma or COPD experience dramatic improvement when they quit. Secondhand smoke exposure harms family members, particularly children who develop more respiratory infections and asthma. Quitting at any age provides immediate and long-term health benefits. Within 20 minutes of quitting, heart rate normalizes; within weeks, lung function improves; within a year, heart disease risk drops by 50%.",
      howItWorks: "Our program works through: Personalized Consultation – Understanding your smoking history and triggers; Nicotine Replacement Therapy (NRT) – Patches, gums, or lozenges; Medications (if required) – To reduce cravings; Counseling and Behavioral Therapy – To manage stress and withdrawal symptoms; Support and Follow-ups – Continuous motivation to prevent relapse. Your smoking cessation journey begins with a comprehensive assessment appointment where our specialist evaluates your smoking history, previous quit attempts, triggers, and readiness to quit. Together, we develop a personalized quit plan setting a quit date and selecting appropriate cessation aids. We schedule frequent follow-up visits - weekly initially, then monthly - providing accountability and support. The program typically spans 12 weeks with optional extended support.",
      whyChooseUs: "Our Delhi smoking cessation center is supervised by experienced chest physician and pulmonologist who understand the serious lung health consequences of smoking. We offer a combination of medical and psychological support with practical lifestyle guidance for long-term success. Our program has a high success rate with patients across Delhi NCR. We employ certified tobacco treatment specialists with extensive training in addiction medicine and behavioral change techniques. We offer flexible scheduling including evening appointments to accommodate working professionals. We provide ongoing support even after program completion - you can contact us anytime you need help staying smoke-free.",
      faqs: [
        {
          question: "How long does it take to quit smoking?",
          answer: "It varies per person. With support, most patients quit within 12 weeks."
        },
        {
          question: "Will I gain weight after quitting?",
          answer: "Some people may, but diet and exercise advice are part of our program. The health benefits of quitting far outweigh minor weight changes."
        },
        {
          question: "Can I quit smoking without medicines?",
          answer: "Yes, some patients succeed with counseling and behavioral therapy alone."
        },
        {
          question: "What if I've tried to quit before and failed?",
          answer: "Most successful quitters tried multiple times before achieving long-term abstinence. Each attempt is a learning experience. Our comprehensive program addresses gaps from previous attempts and provides tools you may not have used before."
        }
      ]
    },
    "oxygen-therapy": {
      title: "Oxygen Therapy in Delhi – Advanced Care for Breathing Support",
      heroImage: oxygenTherapyHero,
      introduction: "Oxygen is essential for survival, but for people with lung diseases such as COPD, interstitial lung disease, pneumonia, and pulmonary fibrosis, the body may not get enough oxygen naturally. In such cases, oxygen therapy becomes a life-saving treatment. At our clinic in Delhi, we provide safe and effective oxygen therapy under the supervision of an experienced chest physician. Oxygen therapy involves giving extra oxygen through a mask, nasal cannula, or machine to maintain healthy oxygen levels in the body. It ensures that vital organs such as the heart, brain, and muscles get enough oxygen to function properly.",
      whyNeeded: "You may need oxygen therapy if you suffer from COPD (Chronic Obstructive Pulmonary Disease), Interstitial Lung Disease (ILD), Severe asthma or bronchitis, Pneumonia or lung infections, Pulmonary fibrosis, or Heart failure-related breathing problems. Benefits include improving oxygen supply to the body, reducing breathlessness and fatigue, helping patients sleep better and live more actively, supporting recovery during and after hospitalization, and preventing complications like heart strain and brain fog.",
      howItWorks: "Oxygen therapy assessment begins with measuring your oxygen saturation using a pulse oximeter placed on your finger - normal levels are 95-100%. If levels are borderline or low, we perform an arterial blood gas test which involves drawing blood from your wrist artery to precisely measure oxygen, carbon dioxide, and blood pH. We may conduct a six-minute walk test to assess if oxygen levels drop during activity. Based on results, our pulmonologist determines if oxygen therapy is medically necessary and prescribes the appropriate flow rate (liters per minute) and usage schedule - continuous, during activity, or only during sleep. We arrange home oxygen equipment including stationary concentrators for home use, portable oxygen concentrators for mobility, or compressed oxygen cylinders for backup.",
      whyChooseUs: "Our Delhi pulmonary center is supervised by experienced pulmonologist and critical care expert. We offer state-of-the-art oxygen concentrators and cylinders available with affordable and reliable oxygen support plans. Home oxygen therapy setup is available in Delhi NCR. We have extensive experience managing oxygen therapy for hundreds of patients with various lung conditions. We partner with reliable oxygen suppliers offering 24/7 delivery and service support throughout Delhi NCR. Our respiratory therapists are available by phone to troubleshoot equipment issues, adjust settings, or answer questions. We coordinate with your insurance provider to ensure coverage and minimize out-of-pocket costs.",
      faqs: [
        {
          question: "Is oxygen therapy addictive?",
          answer: "No, it is not addictive. It is a medical treatment prescribed when necessary."
        },
        {
          question: "Can I travel with oxygen therapy?",
          answer: "Yes, portable concentrators are available for travel."
        },
        {
          question: "How long do I need oxygen therapy?",
          answer: "The duration depends on your lung condition; some patients need it short-term, others long-term. Not necessarily forever. Some patients require temporary oxygen during acute illness or exacerbations and discontinue once recovered."
        },
        {
          question: "Will insurance cover home oxygen?",
          answer: "Most insurance plans including government schemes cover home oxygen when medically necessary. Coverage typically requires documented hypoxemia through blood gas or oximetry testing. We provide necessary documentation and work with suppliers to verify coverage."
        }
      ]
    },
    "lung-rehabilitation": {
      title: "Pulmonary Rehabilitation Program in Delhi – Regain Your Breathing Strength",
      heroImage: lungRehabHero,
      introduction: "For people with chronic lung diseases, everyday activities like walking, climbing stairs, or even talking can feel exhausting. Pulmonary Rehabilitation (PR) is a medically supervised program that helps patients improve breathing, stamina, and overall quality of life. Our Pulmonary Rehabilitation Program in Delhi is designed by experienced chest physicians and physiotherapists for long-term lung health. Pulmonary Rehabilitation is a structured program that combines exercise training, breathing techniques, nutritional guidance, education on lung health, and psychological counseling. It is not just about managing symptoms but empowering patients to live more actively.",
      whyNeeded: "You may benefit if you have Chronic Obstructive Pulmonary Disease (COPD), Asthma (severe or uncontrolled), Interstitial Lung Disease (ILD), Pulmonary fibrosis, Post-Tuberculosis lung damage, or Post-COVID lung complications. Benefits include reduced breathlessness and fatigue, increased exercise tolerance, better control over cough and phlegm, fewer hospital admissions, improved mental health and confidence, and enhanced overall quality of life. Chronic lung diseases create a vicious cycle - breathlessness leads to activity avoidance, causing muscle deconditioning, which worsens breathlessness with minimal exertion. Pulmonary rehabilitation breaks this cycle.",
      howItWorks: "Our program includes Initial Assessment – Breathing tests, fitness check, oxygen levels; Exercise Training – Treadmill, cycling, stretching, muscle strengthening; Breathing Exercises – Diaphragmatic breathing, pursed-lip breathing; Lifestyle Counseling – Quit smoking, manage pollution exposure in Delhi; and Home Rehab Plan – Simple exercises and breathing practices for daily use. Your rehabilitation journey begins with comprehensive assessment including medical history review, current symptoms evaluation, medication review, exercise tolerance testing (six-minute walk test), lung function measurement, and quality of life questionnaires. Programs typically run 2-3 sessions per week for 6-8 weeks with multiple weekly sessions, with each session lasting 2-3 hours. Progress is monitored through repeated exercise tests and symptom questionnaires.",
      whyChooseUs: "Our Delhi pulmonary rehabilitation center is supervised by experienced pulmonologists and physiotherapists. We provide customized plans for each patient with focus on long-term breathing improvement. We offer affordable packages for Delhi NCR patients. We maintain low patient-to-therapist ratios ensuring personalized attention and proper supervision. Our facility offers flexible scheduling with morning and afternoon sessions accommodating various schedules. Success metrics show our graduates achieve average 50-meter improvement in six-minute walk distance and significant symptom reduction.",
      faqs: [
        {
          question: "How long does a pulmonary rehab program last?",
          answer: "Most programs last 6–8 weeks with multiple weekly sessions."
        },
        {
          question: "Will I need pulmonary rehab lifelong?",
          answer: "No, but continuing exercises at home is encouraged."
        },
        {
          question: "Can elderly patients join?",
          answer: "Yes, pulmonary rehab is highly beneficial for senior citizens with lung problems. Our program is tailored to individual capacity starting from baseline, however limited."
        },
        {
          question: "Will insurance cover pulmonary rehabilitation?",
          answer: "Many insurance plans cover pulmonary rehabilitation for COPD and other chronic lung diseases when prescribed by a physician. We verify coverage before enrollment and provide necessary documentation for reimbursement."
        }
      ]
    },
    "critical-care": {
      title: "Critical Care & ICU Services in Delhi – Advanced Respiratory Support",
      heroImage: criticalCareHero,
      introduction: "Severe lung diseases and respiratory failures often require critical care and ICU management. Our clinic in Delhi is equipped with state-of-the-art ICU facilities to handle life-threatening respiratory emergencies with expert precision. Patients may need ICU or Critical Care for Severe pneumonia or influenza, ARDS (Acute Respiratory Distress Syndrome), Respiratory failure due to COPD/asthma attack, Severe interstitial lung disease flare-ups, Post-surgical breathing complications, or Drug-resistant tuberculosis with complications.",
      whyNeeded: "Respiratory failure is a medical emergency requiring immediate intensive care intervention. Conditions necessitating ICU admission include severe COVID-19 pneumonia with hypoxemia, acute exacerbations of COPD not responding to emergency treatment, status asthmaticus (severe asthma attack), massive pulmonary embolism, acute respiratory distress syndrome from sepsis or pneumonia, aspiration pneumonia with respiratory compromise, and post-operative respiratory complications. Early ICU admission with aggressive treatment prevents progression to multi-organ failure and death.",
      howItWorks: "Our ICU and Critical Care Services in Delhi include Non-invasive ventilation (BiPAP, CPAP), Invasive ventilation (mechanical ventilator support), Oxygen therapy and high-flow nasal cannula (HFNC), Continuous monitoring of heart, lungs, and oxygen levels, Emergency bronchoscopy and airway clearance procedures, and Sepsis and multi-organ failure management. ICU admission occurs through emergency department, hospital transfer, or direct admission for elective high-risk procedures. Upon arrival, our team performs rapid assessment including vital signs, arterial blood gas analysis, chest imaging, and laboratory tests. Patients typically have continuous cardiac monitoring, pulse oximetry, and frequent vital sign checks.",
      whyChooseUs: "Our ICU in Delhi has Experienced pulmonologist and critical care specialist, 24/7 emergency response team, Modern ventilators and monitoring systems, Patient-centric care with family updates, and Strict infection control protocols. Our critical care unit maintains ICU-to-patient ratios meeting international standards. We use Hamilton and Drager ventilators offering advanced modes. Our ICU pharmacy provides 24/7 access to critical medications. Benefits include Early intervention to save lives, Reduced complications in chronic lung disease patients, Support for both short-term emergencies and long-term ICU care, and Comprehensive post-ICU recovery plans (rehabilitation and follow-up).",
      faqs: [
        {
          question: "Is ICU admission always long-term?",
          answer: "No, some patients need only a few days of intensive monitoring. ICU length of stay varies widely depending on condition severity."
        },
        {
          question: "Is ICU care very expensive?",
          answer: "Costs depend on the duration and treatment required, but we ensure affordable ICU packages in Delhi."
        },
        {
          question: "Can family members visit ICU patients?",
          answer: "Yes, we follow strict but compassionate visiting policies. We have structured visitation hours typically twice daily for 30-minute periods. Flexible visitation is arranged for critically ill patients."
        },
        {
          question: "What happens when a patient is on a ventilator?",
          answer: "Mechanically ventilated patients receive sedation to tolerate the breathing tube comfortably. The ventilator delivers oxygen-rich breaths at prescribed volumes and rates. We minimize sedation when possible and perform daily assessments to determine if patients can breathe independently."
        }
      ]
    },
    "lung-cancer-screening": {
      title: "Lung Cancer Screening in Delhi – Early Detection Saves Lives",
      heroImage: lungCancerScreeningHero,
      introduction: "Lung cancer is one of the leading causes of cancer-related deaths worldwide. In Delhi, where air pollution, smoking, and occupational hazards are prevalent, early detection is crucial. Our clinic provides advanced lung cancer screening and early diagnosis in Delhi to improve survival rates. Early detection allows for detection of cancer in early, treatable stages, evaluation of risk factors including smoking, pollution exposure, and occupational hazards, reducing complications and improving quality of life.",
      whyNeeded: "Adults over 40 with a history of smoking, individuals exposed to second-hand smoke or industrial chemicals, patients with chronic lung disease or unexplained symptoms, and high-risk individuals with family history of lung cancer should get screened. Lung cancer screening is important because it can detect cancer in early, treatable stages, evaluate risk factors, reduce complications, and improve quality of life.",
      howItWorks: "Screening Methods include: Low-Dose CT Scan (LDCT) which detects small lung nodules, Chest X-ray for initial assessment of lung abnormalities, Sputum cytology that examines cells for cancer signs, and Follow-up biopsies if abnormalities are detected. The screening process is safe with Low-Dose CT scans having minimal radiation exposure. High-risk patients are advised annual screening. Benefits include early detection leading to higher survival rates, reduced need for aggressive treatment if caught early, peace of mind for high-risk patients, and enabling lifestyle and environmental interventions.",
      whyChooseUs: "Our Lung Cancer Screening Clinic in Delhi is supervised by experienced pulmonologists and chest physicians with state-of-the-art imaging and diagnostic facilities. We provide personalized follow-up plans for high-risk individuals and offer affordable and accessible screening packages. Located centrally with easy access, we maintain strict quality standards for all screening procedures.",
      faqs: [
        {
          question: "Is lung cancer screening safe?",
          answer: "Yes, low-dose CT scans have minimal radiation exposure and are safe."
        },
        {
          question: "How often should I be screened?",
          answer: "High-risk patients are advised annual screening."
        },
        {
          question: "Does screening prevent lung cancer?",
          answer: "Screening doesn't prevent cancer but allows early detection and treatment, which significantly improves survival rates."
        },
        {
          question: "Who should get lung cancer screening?",
          answer: "Adults over 40 with a history of smoking, those exposed to second-hand smoke or industrial chemicals, patients with chronic lung disease, and individuals with family history of lung cancer should consider screening."
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
                <Link to="/" className="text-white/80 hover:text-white transition-colors font-lexend text-sm">Home</Link>
                <ChevronRight className="h-4 w-4 text-white/60" />
                <Link to="/services" className="text-white/80 hover:text-white transition-colors font-lexend text-sm">Services</Link>
                <ChevronRight className="h-4 w-4 text-white/60" />
                <span className="text-white font-lexend text-sm">Current Service</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-lexend max-w-4xl leading-tight">
                {service.title}
              </h1>
              
              <Link to="/services">
                <Button className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-lung-blue transition-colors">
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
              <p className="text-muted-foreground font-lexend leading-relaxed text-lg">
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
              <p className="text-muted-foreground font-lexend leading-relaxed text-lg">
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
              <p className="text-muted-foreground font-lexend leading-relaxed text-lg">
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
              <p className="text-muted-foreground font-lexend leading-relaxed text-lg">
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
              <p className="text-muted-foreground font-lexend">Common questions about this service</p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {service.faqs.map((faq: any, index: number) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border rounded-lg overflow-hidden bg-card"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 bg-lung-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-lung-blue" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground font-lexend">{faq.question}</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="pl-14">
                      <p className="text-muted-foreground font-lexend leading-relaxed">{faq.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-lung-blue to-lung-blue-dark">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-lexend">Ready to Get Started?</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 font-lexend">
              Book your appointment today and take the first step toward better respiratory health
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/book-appointment">
                <Button size="lg" className="w-full sm:w-auto bg-lung-green hover:bg-lung-green-light text-white rounded-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Make Appointment
                </Button>
              </Link>
              
              <a href="tel:+919876543210">
                <Button size="lg" className="w-full sm:w-auto bg-transparent text-white border-2 border-white hover:bg-white hover:text-lung-blue transition-colors">
                  <Phone className="mr-2 h-5 w-5" />
                  Call: +91 98765 43210
                </Button>
              </a>
              
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto bg-transparent text-white border-2 border-white hover:bg-white hover:text-lung-blue transition-colors">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
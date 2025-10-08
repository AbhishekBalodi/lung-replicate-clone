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
  AlertCircle,
  Activity,
  Stethoscope,
  HelpCircle
} from "lucide-react";
import copdHero from "@/assets/conditions/copd-hero.jpg";
import asthmaHero from "@/assets/conditions/asthma-hero.jpg";
import tbHero from "@/assets/conditions/tb-hero.jpg";
import pneumoniaHero from "@/assets/conditions/pneumonia-hero.jpg";
import ildHero from "@/assets/conditions/ild-hero.jpg";
import sarcoidosisHero from "@/assets/conditions/sarcoidosis-hero.jpg";
import pleuralHero from "@/assets/conditions/pleural-hero.jpg";
import fluHero from "@/assets/conditions/flu-hero.jpg";

const ConditionDetail = () => {
  const { slug } = useParams();

  const conditionDetails: Record<string, any> = {
    "copd-treatment": {
      title: "COPD Treatment in Delhi – Expert Care for Chronic Obstructive Pulmonary Disease",
      heroImage: copdHero,
      introduction: "Chronic Obstructive Pulmonary Disease (COPD) is a progressive lung condition causing breathing difficulties that worsen over time. In Delhi, where air pollution significantly impacts respiratory health, COPD has become increasingly prevalent. Our specialized COPD treatment center offers comprehensive care combining advanced medical therapies, pulmonary rehabilitation, and lifestyle interventions. With experienced pulmonologists and state-of-the-art facilities, we help COPD patients manage symptoms effectively, slow disease progression, and maintain quality of life despite this chronic condition.",
      causes: "COPD primarily develops from long-term exposure to lung irritants. Cigarette smoking is the leading cause, responsible for 80-90% of cases in Delhi. However, air pollution, occupational dust exposure, and indoor cooking smoke also contribute significantly. Genetic factors like Alpha-1 antitrypsin deficiency can predispose individuals to COPD. Repeated respiratory infections during childhood increase risk. In Delhi's high-pollution environment, even non-smokers develop COPD from prolonged exposure to vehicular emissions, industrial pollutants, and seasonal smog. Biomass fuel burning for cooking in rural migrants adds to the risk. Early smoking initiation and passive smoking exposure compound the problem.",
      symptoms: [
        "Persistent cough with mucus production (smoker's cough)",
        "Progressive shortness of breath, especially during physical activities",
        "Wheezing or whistling sound when breathing",
        "Chest tightness and discomfort",
        "Frequent respiratory infections",
        "Fatigue and lack of energy",
        "Unintended weight loss in advanced stages",
        "Swelling in ankles, feet, or legs (in severe cases)",
        "Bluish discoloration of lips or fingernails (cyanosis)"
      ],
      diagnosis: "COPD diagnosis begins with detailed medical history including smoking habits, occupational exposures, and symptom duration. Physical examination reveals prolonged expiration, wheezing, and reduced breath sounds. Spirometry is the gold standard diagnostic test - measuring forced expiratory volume (FEV1) and forced vital capacity (FVC). A post-bronchodilator FEV1/FVC ratio below 0.70 confirms COPD. Chest X-ray identifies hyperinflation and rules out other conditions. High-resolution CT scans detect emphysema and evaluate disease extent. Arterial blood gas analysis measures oxygen and carbon dioxide levels. Alpha-1 antitrypsin testing is performed in younger patients or those with family history. Additional tests include complete blood count, ECG, and echocardiography to assess complications.",
      treatment: "COPD treatment aims to slow progression, relieve symptoms, and prevent complications. Smoking cessation is paramount - our program offers nicotine replacement, medications, and behavioral support. Bronchodilators (short and long-acting) form the treatment backbone, improving airflow and reducing breathlessness. Inhaled corticosteroids combined with bronchodilators reduce exacerbations. Phosphodiesterase-4 inhibitors and mucolytics help specific patient groups. Pulmonary rehabilitation programs significantly improve exercise capacity and quality of life through supervised exercise, breathing techniques, and education. Oxygen therapy is prescribed when blood oxygen drops below threshold levels. Vaccination against influenza and pneumococcus prevents dangerous infections. For advanced emphysema, surgical options include lung volume reduction surgery or transplantation. We provide regular monitoring, medication adjustments, and aggressive exacerbation management to maintain stability.",
      whyChooseUs: "Our Delhi COPD center is staffed by pulmonologists with specialized training in obstructive airway diseases. We offer comprehensive spirometry and advanced lung function testing using internationally calibrated equipment. Our pulmonary rehabilitation facility features supervised exercise programs, breathing therapy sessions, and patient education classes tailored to Delhi's environmental challenges. We understand pollution's role in COPD exacerbations and provide practical strategies for managing symptoms during high-pollution days. Located centrally with easy metro access and parking, we accommodate busy schedules with evening and weekend appointments. Our multidisciplinary team includes respiratory therapists, dietitians, and counselors ensuring holistic care. We coordinate smoking cessation programs with proven success rates and provide long-term follow-up to monitor disease progression and adjust treatments promptly.",
      faqs: [
        {
          question: "Can COPD be cured?",
          answer: "COPD cannot be completely cured as lung damage is irreversible, but progression can be slowed significantly with proper treatment, smoking cessation, and lifestyle modifications. Many patients maintain good quality of life for decades with appropriate management."
        },
        {
          question: "How does Delhi's air pollution affect COPD?",
          answer: "Delhi's pollution triggers COPD exacerbations causing increased symptoms, emergency visits, and hospitalizations. During high-pollution days, we recommend staying indoors with air purifiers, wearing N95 masks outdoors, and following prescribed medication regimens strictly."
        },
        {
          question: "When should I go to emergency for COPD symptoms?",
          answer: "Seek immediate emergency care if you experience severe breathlessness at rest, chest pain, confusion, bluish lips or fingernails, rapid heart rate above 120 bpm, or if usual medications don't provide relief. These indicate serious exacerbation requiring urgent treatment."
        },
        {
          question: "Is exercise safe with COPD?",
          answer: "Yes! Exercise is crucial for COPD management. Our supervised pulmonary rehabilitation program teaches safe exercise techniques, proper breathing patterns, and gradually builds endurance. Regular physical activity improves symptoms, reduces hospitalizations, and enhances quality of life."
        }
      ]
    },
    "asthma-treatment": {
      title: "Asthma Specialist in Delhi – Expert Asthma Treatment & Care",
      heroImage: asthmaHero,
      introduction: "Asthma is a chronic respiratory condition characterized by airway inflammation and narrowing, causing recurring breathing difficulties. Delhi's high pollution levels, allergens, and seasonal variations make asthma management particularly challenging. Our specialized asthma clinic provides comprehensive evaluation, personalized treatment plans, and ongoing monitoring to help patients achieve optimal control. With board-certified pulmonologists experienced in managing both allergic and non-allergic asthma, we employ the latest diagnostic tools and treatment protocols. Our goal is enabling asthma patients to lead active, symptom-free lives through effective medication management and trigger avoidance strategies.",
      causes: "Asthma results from complex interactions between genetic predisposition and environmental triggers. Family history significantly increases asthma risk - children with asthmatic parents have 3-6 times higher likelihood of developing the condition. In Delhi, environmental factors play crucial roles: air pollution containing PM2.5 particles, vehicular emissions, and industrial pollutants trigger inflammation. Common allergens include dust mites, pollen (especially during spring), mold spores, pet dander, and cockroach droppings. Viral respiratory infections in early childhood increase asthma susceptibility. Occupational exposures to chemicals, dust, or fumes cause work-related asthma. Lifestyle factors like obesity, stress, and physical inactivity contribute. Maternal smoking during pregnancy and early childhood exposure to tobacco smoke heighten risk substantially.",
      symptoms: [
        "Recurring episodes of wheezing (whistling sound when breathing)",
        "Shortness of breath, especially during exercise or at night",
        "Chest tightness or pressure",
        "Persistent cough, particularly at night or early morning",
        "Difficulty breathing that worsens with cold air or exercise",
        "Symptoms triggered by allergens, pollution, or respiratory infections",
        "Prolonged recovery time after respiratory infections",
        "Sleep disturbances due to breathing difficulties",
        "Reduced ability to participate in physical activities"
      ],
      diagnosis: "Asthma diagnosis combines clinical assessment with objective testing. We take detailed history documenting symptom patterns, triggers, family history, and environmental exposures. Physical examination during attacks reveals wheezing, prolonged expiration, and increased respiratory effort. Spirometry measures lung function - reversible airflow obstruction confirmed by 12% improvement in FEV1 after bronchodilator administration indicates asthma. Peak flow monitoring tracks daily variability, with morning values 20% lower suggesting poor control. Fractional exhaled nitric oxide (FeNO) testing measures airway inflammation. Allergy testing (skin prick or specific IgE blood tests) identifies triggers. Chest X-rays rule out other conditions. For difficult cases, bronchial provocation testing with methacholine confirms airway hyperresponsiveness. We assess severity and control levels guiding treatment intensity.",
      treatment: "Asthma treatment follows a stepwise approach based on severity and control. Quick-relief medications include short-acting beta-agonists (SABAs) like salbutamol for immediate symptom relief. Long-term controller medications prevent symptoms: inhaled corticosteroids (ICS) are first-line anti-inflammatory treatment. For inadequate control, we add long-acting beta-agonists (LABAs), leukotriene modifiers, or increase ICS dose. Severe asthma may require biologics - omalizumab for allergic asthma, mepolizumab or benralizumab for eosinophilic asthma. Oral corticosteroids treat acute exacerbations. We develop personalized asthma action plans detailing daily medications, trigger avoidance, and emergency management. Regular follow-ups ensure optimal control with minimal medication. Environmental modifications include air purifiers, allergen-proof bedding, and pollution day activity adjustments. Patient education covers proper inhaler technique, symptom recognition, and when to seek emergency care.",
      whyChooseUs: "Our Delhi asthma center is led by pulmonologists who are also trained allergists, providing comprehensive care for allergic asthma. We offer advanced diagnostics including FeNO testing, comprehensive allergy panels specific to Delhi allergens, and detailed lung function assessment. Our clinic features dedicated asthma educators who teach proper inhaler technique - studies show 70% of patients use inhalers incorrectly, reducing effectiveness. We provide personalized trigger identification and avoidance strategies considering Delhi's seasonal pollution patterns. For severe asthma, we have experience administering biologic therapies with careful monitoring. Located in central Delhi with extended hours, we accommodate emergencies and urgent consultations. Our integrated approach includes dietary counseling for weight management and stress reduction techniques. We maintain detailed electronic records tracking control levels, medication adjustments, and exacerbation patterns to optimize long-term outcomes.",
      faqs: [
        {
          question: "Can asthma be cured permanently?",
          answer: "Asthma cannot be permanently cured, but it can be effectively controlled to the point where patients live symptom-free lives. Some children outgrow asthma, though it may recur in adulthood. With proper treatment, most patients achieve excellent control maintaining normal activities without limitations."
        },
        {
          question: "Are asthma inhalers safe for long-term use?",
          answer: "Yes, inhaled corticosteroids and bronchodilators are safe for long-term daily use. Inhaled medications deliver medicine directly to airways in tiny doses, minimizing systemic side effects. Regular controller medication use prevents exacerbations and preserves lung function better than intermittent treatment."
        },
        {
          question: "How can I manage asthma during Delhi's pollution peaks?",
          answer: "During high pollution days, stay indoors with air purifiers running, avoid outdoor exercise, wear N95 masks if going outside, increase controller medication if prescribed by doctor, and keep rescue inhalers readily accessible. Monitor air quality indexes and plan activities accordingly."
        },
        {
          question: "When should I upgrade from regular asthma treatment?",
          answer: "Consider advanced treatment if you use rescue inhalers more than twice weekly, wake at night with symptoms, have limited activity due to asthma, or experience frequent exacerbations requiring oral steroids or emergency visits. These indicate inadequate control requiring treatment escalation."
        }
      ]
    },
    "tb-treatment": {
      title: "Tuberculosis (TB) Treatment in Delhi – Complete TB Care & DOTS Therapy",
      heroImage: tbHero,
      introduction: "Tuberculosis remains a significant public health concern in Delhi, requiring specialized diagnosis and treatment. TB is caused by Mycobacterium tuberculosis bacteria, primarily affecting lungs but can involve other organs. Our TB treatment center follows WHO-recommended Directly Observed Treatment Short-course (DOTS) protocols ensuring complete cure and preventing drug resistance. With experienced pulmonologists, modern diagnostic facilities including GeneXpert testing, and comprehensive patient support, we provide evidence-based TB care. Early diagnosis and complete treatment are crucial for patient recovery and community protection, as untreated TB spreads through airborne transmission.",
      causes: "TB spreads when infectious individuals cough, sneeze, or speak, releasing bacteria-containing droplets into air. Close household contact with active TB patients poses highest transmission risk. Weakened immune systems increase susceptibility - HIV/AIDS, diabetes, malnutrition, chronic kidney disease, and immunosuppressive medications significantly elevate TB risk. Delhi's dense population, crowded living conditions, and inadequate ventilation facilitate transmission. Poverty, poor nutrition, and lack of healthcare access contribute to Delhi's TB burden. Smoking damages lung defenses increasing infection risk. Alcohol abuse and substance use disorders compromise immune function and treatment adherence. Occupational exposure in healthcare settings, prisons, or shelters increases risk. Genetic factors influence individual susceptibility, though environmental factors predominate.",
      symptoms: [
        "Persistent cough lasting more than 3 weeks",
        "Coughing up blood or blood-tinged sputum (hemoptysis)",
        "Chest pain, especially when breathing or coughing deeply",
        "Unintentional weight loss and loss of appetite",
        "Night sweats, often drenching clothes and bedding",
        "Prolonged fever, typically low-grade and worse in evenings",
        "Severe fatigue and weakness",
        "Shortness of breath (in advanced disease)",
        "Extrapulmonary symptoms if TB affects other organs"
      ],
      diagnosis: "TB diagnosis requires multiple approaches for accuracy. Sputum microscopy examining three samples for acid-fast bacilli (AFB) is traditional but less sensitive. GeneXpert MTB/RIF testing provides rapid diagnosis within hours, detecting TB bacteria and rifampicin resistance simultaneously - this molecular test is our first-line diagnostic tool. Sputum culture on special media confirms TB and tests drug sensitivity but takes 6-8 weeks. Chest X-ray reveals characteristic upper lobe infiltrates, cavitation, or miliary patterns. In children or extrapulmonary TB, we use tuberculin skin test (TST) or interferon-gamma release assays (IGRAs). Biopsy and culture of affected tissues diagnose non-pulmonary TB. Complete blood count shows elevated inflammatory markers. HIV testing is essential as co-infection requires modified treatment. We assess baseline liver and kidney function before starting therapy.",
      treatment: "Standard TB treatment involves 6-month multidrug regimen following DOTS protocol. Intensive phase (first 2 months) uses four drugs: rifampicin, isoniazid, pyrazinamide, and ethambutol taken daily. Continuation phase (remaining 4 months) uses rifampicin and isoniazid. Our healthcare workers directly observe medication intake ensuring adherence - critical for cure and preventing resistance. We provide medications free through government programs and monitor side effects closely. Drug-resistant TB requires longer treatment (18-24 months) with second-line medications. Regular sputum testing at 2, 4, and 6 months monitors treatment response. We supplement treatment with nutritional support, counseling, and contact tracing. Family members undergo screening and receive preventive therapy if needed. Patient education emphasizes completing full course even after symptoms resolve. We manage side effects including hepatotoxicity, peripheral neuropathy, and visual changes through monitoring and supplementation.",
      whyChooseUs: "Our Delhi TB center is certified DOTS provider with trained healthcare workers ensuring supervised treatment. We offer same-day GeneXpert testing providing rapid diagnosis and resistance detection. Our pulmonologists have extensive experience managing complex cases including drug-resistant TB, HIV-TB co-infection, and extrapulmonary TB. We provide comprehensive services under one roof: diagnosis, treatment initiation, regular monitoring, and contact screening. Free medications are available through government programs, and we assist with paperwork and approvals. Our counselors address stigma and provide psychological support crucial for treatment completion. We coordinate with employers and schools to facilitate continued treatment without discrimination. Located centrally with multiple metro access points, we offer flexible appointment timings. Our electronic tracking system sends medication reminders and monitors adherence. For treatment success, we address underlying conditions like diabetes and provide nutritional supplementation when needed.",
      faqs: [
        {
          question: "How long does TB treatment take?",
          answer: "Standard drug-sensitive TB requires 6 months of treatment - 2 months intensive phase with four drugs, followed by 4 months continuation phase with two drugs. Drug-resistant TB requires 18-24 months. It's crucial to complete the entire course even if you feel better after a few weeks."
        },
        {
          question: "Is TB contagious throughout treatment?",
          answer: "TB patients are most contagious before treatment starts. After 2-3 weeks of proper medication, most patients are no longer infectious. However, continue precautions like covering mouth when coughing and ensuring good ventilation until sputum tests confirm non-infectious status."
        },
        {
          question: "What are common side effects of TB medications?",
          answer: "Common side effects include nausea, loss of appetite, mild abdominal discomfort, and orange-colored urine (harmless). Serious side effects requiring immediate attention include yellowing of eyes/skin, persistent nausea/vomiting, numbness/tingling in hands/feet, or vision changes. We monitor liver function regularly."
        },
        {
          question: "Can I work or study during TB treatment?",
          answer: "Yes! Once you've completed 2-3 weeks of treatment and sputum tests show you're non-infectious, you can safely return to work or school. TB should not cause employment or educational discrimination. We provide documentation for employers/institutions as needed."
        }
      ]
    },
    "pneumonia-treatment": {
      title: "Pneumonia Treatment in Delhi – Fast Diagnosis & Effective Recovery",
      heroImage: pneumoniaHero,
      introduction: "Pneumonia is an acute lung infection causing inflammation of air sacs, which may fill with fluid or pus. In Delhi, pneumonia accounts for significant respiratory illness, particularly during winter months and pollution peaks. Our pneumonia treatment center provides rapid diagnosis, appropriate antibiotics, supportive care, and hospitalization when necessary. With 24/7 emergency services and experienced pulmonologists, we ensure timely intervention preventing complications. Pneumonia severity ranges from mild (outpatient treatment) to life-threatening (ICU care). Early recognition and treatment significantly improve outcomes, especially in children, elderly, and those with chronic conditions.",
      causes: "Pneumonia results from infection by bacteria, viruses, or fungi. Streptococcus pneumoniae (pneumococcus) is the most common bacterial cause in Delhi. Other bacterial pathogens include Haemophilus influenzae, Mycoplasma pneumoniae, and Legionella. Viral pneumonia from influenza, respiratory syncytial virus (RSV), or SARS-CoV-2 (COVID-19) is increasingly recognized. Fungal pneumonia affects immunocompromised individuals. Risk factors include age extremes (children under 2, adults over 65), chronic diseases (COPD, diabetes, heart disease), weakened immunity (HIV, chemotherapy, steroids), smoking, alcohol abuse, and recent viral infections. Delhi's pollution weakens respiratory defenses increasing susceptibility. Aspiration pneumonia occurs when food, drink, or vomit enters lungs. Hospital-acquired pneumonia develops in hospitalized patients, often involving antibiotic-resistant bacteria.",
      symptoms: [
        "High fever, often sudden onset with chills and rigors",
        "Productive cough with yellow, green, or blood-tinged mucus",
        "Sharp chest pain worsening with deep breathing or coughing",
        "Shortness of breath and rapid breathing",
        "Fatigue and weakness",
        "Nausea, vomiting, or diarrhea (in some cases)",
        "Confusion or altered mental status (especially in elderly)",
        "Profuse sweating and clammy skin",
        "Rapid heart rate"
      ],
      diagnosis: "Pneumonia diagnosis begins with clinical assessment - fever, cough, and chest pain raise suspicion. Physical examination reveals crackles, decreased breath sounds, or bronchial breathing on affected side. Chest X-ray is essential, showing infiltrates, consolidation, or effusion confirming diagnosis and assessing extent. Complete blood count demonstrates elevated white cells (bacterial) or low counts (viral/severe). C-reactive protein (CRP) and procalcitonin levels help distinguish bacterial from viral causes guiding antibiotic decisions. Sputum culture identifies causative organism and antibiotic sensitivities, though results take 2-3 days. Blood cultures for hospitalized patients detect bacteremia. Pulse oximetry measures oxygen saturation - levels below 90% indicate severe pneumonia. Arterial blood gas analysis assesses respiratory failure in ICU patients. For unclear cases or suspected complications, CT scan provides detailed imaging. Rapid antigen tests detect specific pathogens like influenza or COVID-19.",
      treatment: "Pneumonia treatment depends on severity and causative organism. Outpatient treatment for mild bacterial pneumonia uses oral antibiotics - amoxicillin-clavulanate or respiratory fluoroquinolones for 5-7 days. Hospitalized patients receive IV antibiotics - ceftriaxone plus azithromycin is common empiric therapy. Severe pneumonia requires ICU care with broad-spectrum antibiotics adjusted based on cultures. Viral pneumonia receives supportive care; influenza-specific antivirals (oseltamivir) if diagnosed early. Fungal pneumonia requires antifungals. Supportive measures include oxygen therapy maintaining saturation above 90%, IV fluids for hydration, fever control with acetaminophen, and chest physiotherapy to clear secretions. Hospitalized patients receive venous thromboembolism prophylaxis. We monitor response through clinical improvement, fever resolution, and oxygen requirements. Complications like empyema, lung abscess, or respiratory failure require specialized interventions. Follow-up chest X-ray 4-6 weeks post-treatment confirms complete resolution. Vaccination against pneumococcus and influenza prevents future episodes.",
      whyChooseUs: "Our Delhi pneumonia treatment center operates 24/7 emergency services with immediate access to chest X-ray, laboratory testing, and oxygen therapy. Our pulmonologists rapidly assess severity using validated scoring systems determining appropriate care setting - outpatient, ward, or ICU. We stock comprehensive antibiotics including reserves for resistant organisms. Our microbiology laboratory provides rapid pathogen identification and antibiotic sensitivity testing guiding targeted therapy. For severe cases, our ICU features advanced ventilators, continuous monitoring, and experienced intensivists. We follow evidence-based protocols ensuring optimal outcomes while minimizing antibiotic overuse. Hospitalized patients receive multidisciplinary care including respiratory therapists, nutritionists, and physical therapists accelerating recovery. Our discharge planning includes medication reconciliation, inhaler training if needed, and follow-up scheduling. We provide pneumococcal and influenza vaccinations preventing recurrence. Insurance coordination and medical certificates for employers are provided promptly.",
      faqs: [
        {
          question: "How long does pneumonia recovery take?",
          answer: "Mild pneumonia treated as outpatient typically improves within 3-5 days with complete recovery in 1-2 weeks. Severe pneumonia requiring hospitalization needs 7-10 days for significant improvement with full recovery taking 4-6 weeks. Elderly and those with chronic diseases recover more slowly. Fatigue may persist for several weeks."
        },
        {
          question: "When should pneumonia patients go to hospital?",
          answer: "Seek immediate hospitalization if you experience severe shortness of breath, confusion, very high fever (above 103°F), chest pain, inability to eat or drink, coughing up blood, or if oxygen saturation drops below 90%. High-risk individuals (elderly, chronic disease patients) should have lower threshold for hospitalization."
        },
        {
          question: "Can you get pneumonia multiple times?",
          answer: "Yes, pneumonia can recur, especially in high-risk individuals. Each episode involves different organisms or reinfection after immunity wanes. Recurrent pneumonia warrants investigation for underlying conditions like COPD, bronchiectasis, or immune deficiency. Vaccination significantly reduces recurrence risk."
        },
        {
          question: "Is pneumonia contagious?",
          answer: "Pneumonia-causing organisms are contagious and spread through respiratory droplets, but not everyone exposed develops pneumonia. Bacterial pneumonia is less contagious than viral. Practice good hygiene - cover coughs, wash hands frequently, avoid close contact when sick. Most patients are less contagious after 24-48 hours of antibiotics."
        }
      ]
    },
    "ild-treatment": {
      title: "Interstitial Lung Disease (ILD) Specialist in Delhi – Expert ILD Management",
      heroImage: ildHero,
      introduction: "Interstitial Lung Disease encompasses over 200 disorders causing progressive scarring (fibrosis) of lung tissue between air sacs. ILD makes breathing increasingly difficult and impairs oxygen transfer to bloodstream. In Delhi, our specialized ILD center provides comprehensive evaluation using high-resolution CT scanning, lung biopsy when needed, and multidisciplinary case review. Early diagnosis is challenging as symptoms resemble other lung conditions. Our pulmonologists have fellowship training in interstitial lung diseases and experience managing idiopathic pulmonary fibrosis, sarcoidosis, hypersensitivity pneumonitis, and connective tissue disease-related ILD. Treatment focuses on slowing progression, managing symptoms, and maintaining quality of life.",
      causes: "ILD causes vary widely. Occupational and environmental exposures include asbestos, silica dust, coal dust, metal dusts, organic antigens (bird droppings, mold spores) causing hypersensitivity pneumonitis. Medications can trigger ILD - certain antibiotics, chemotherapy agents, heart medications, and anti-inflammatory drugs. Autoimmune diseases like rheumatoid arthritis, scleroderma, lupus, and dermatomyositis frequently involve lungs. Radiation therapy to chest for cancer treatment causes radiation pneumonitis. Infections including COVID-19 can result in persistent lung fibrosis. Idiopathic pulmonary fibrosis (IPF) has unknown cause, typically affects those over 60, with possible genetic and environmental contributions. Smoking significantly increases ILD risk and worsens progression. In Delhi, chronic pollution exposure may contribute to some ILD cases. Family history suggests genetic predisposition in certain ILD types.",
      symptoms: [
        "Progressive shortness of breath, initially with exertion then at rest",
        "Persistent dry, non-productive cough",
        "Fatigue and generalized weakness",
        "Unexplained weight loss",
        "Chest discomfort or tightness",
        "Clubbing of fingertips (in advanced disease)",
        "Fine crackles heard on lung examination (Velcro-like sound)",
        "Rapid, shallow breathing",
        "Decreased exercise tolerance and endurance"
      ],
      diagnosis: "ILD diagnosis requires systematic approach combining multiple modalities. High-resolution CT (HRCT) scan is crucial, revealing characteristic patterns - ground-glass opacities, honeycombing, traction bronchiectasis, or nodules suggesting specific ILD types. Pulmonary function tests show restrictive pattern with reduced lung volumes and impaired diffusion capacity (DLCO). Six-minute walk test assesses functional capacity and oxygen desaturation. Bronchoscopy with bronchoalveolar lavage analyzes cellular composition and cultures rule out infections. Transbronchial or surgical lung biopsy provides tissue for histopathological diagnosis when imaging is inconclusive. Blood tests screen for autoimmune diseases - ANA, rheumatoid factor, anti-CCP antibodies. Serum precipitins detect hypersensitivity pneumonitis. Echocardiography assesses pulmonary hypertension - a serious complication. Our multidisciplinary ILD board reviews cases including pulmonologists, radiologists, and pathologists ensuring accurate diagnosis guiding optimal treatment.",
      treatment: "ILD treatment varies by specific diagnosis. Idiopathic pulmonary fibrosis uses anti-fibrotic drugs - nintedanib or pirfenidone slow disease progression. Inflammatory ILDs including hypersensitivity pneumonitis respond to corticosteroids and immunosuppressants (mycophenolate, azathioprine, cyclophosphamide). Sarcoidosis treatment balances benefits against steroid side effects. Connective tissue disease-related ILD requires collaboration with rheumatologists optimizing immunosuppression. Supportive care is universal: supplemental oxygen maintains saturation above 88%, pulmonary rehabilitation improves exercise tolerance and quality of life. Vaccination against influenza and pneumococcus prevents dangerous infections. Gastroesophageal reflux treatment may slow progression. Antifibrotic drugs and immunosuppressants require careful monitoring for side effects. Advanced disease may necessitate lung transplant evaluation. We provide palliative care addressing breathlessness, anxiety, and end-of-life planning when appropriate. Patient education about disease course, medication adherence, and recognizing exacerbations is essential. Support groups connect patients sharing similar experiences.",
      whyChooseUs: "Our Delhi ILD center is one of few facilities with dedicated interstitial lung disease expertise. Our pulmonologists have completed ILD fellowships and manage large patient volumes ensuring experience with rare subtypes. We house high-resolution CT scanners with ILD-specific protocols and radiologists specialized in pattern recognition. Our multidisciplinary ILD board meets bi-weekly reviewing complex cases achieving diagnostic accuracy exceeding 85%. We perform bronchoscopy with advanced techniques including cryobiopsy providing larger tissue samples without surgery. Access to anti-fibrotic medications with insurance approval assistance expedites treatment initiation. Our pulmonary rehabilitation program is tailored for ILD patients focusing on breathing techniques, oxygen titration, and energy conservation. We participate in clinical trials offering cutting-edge therapies. Comprehensive care includes rheumatology, gastroenterology, and cardiology consultations addressing associated conditions. Lung transplant evaluation and coordination with transplant centers when appropriate. Our patient support services provide education, support groups, and assistance navigating complex treatments.",
      faqs: [
        {
          question: "Can ILD be cured?",
          answer: "Most ILDs cannot be cured, but treatment can slow progression and manage symptoms. Some inflammatory ILDs like hypersensitivity pneumonitis may improve or stabilize with allergen avoidance and treatment. Idiopathic pulmonary fibrosis is progressive, but anti-fibrotic drugs significantly slow decline. Lung transplantation is potential cure for advanced disease in eligible patients."
        },
        {
          question: "How fast does ILD progress?",
          answer: "ILD progression varies widely depending on type and individual factors. Some ILDs remain stable for years while others progress rapidly. Idiopathic pulmonary fibrosis typically progresses over 3-5 years. Regular monitoring through lung function tests and six-minute walk tests tracks progression guiding treatment adjustments."
        },
        {
          question: "When should I consider lung transplant evaluation?",
          answer: "Lung transplant evaluation is appropriate when ILD progresses despite maximal medical therapy, with severe lung function impairment (FVC <60%, DLCO <40%), frequent hospitalizations, or deteriorating functional status. Evaluation should occur before becoming too sick for surgery. We guide patients through this complex decision and referral process."
        },
        {
          question: "Can I exercise with ILD?",
          answer: "Yes, exercise is beneficial for ILD patients improving strength, endurance, and quality of life. Our pulmonary rehabilitation program provides supervised exercise with appropriate oxygen supplementation. Activities are tailored to individual capacity and gradually progressed. Regular exercise slows functional decline and reduces breathlessness with daily activities."
        }
      ]
    },
    "sarcoidosis-treatment": {
      title: "Sarcoidosis Treatment in Delhi – Expert Care for Rare Lung Disease",
      heroImage: sarcoidosisHero,
      introduction: "Sarcoidosis is a multi-system inflammatory disease characterized by formation of granulomas (clusters of inflammatory cells) in various organs, most commonly lungs and lymph nodes. Though cause remains unknown, sarcoidosis affects young adults typically between 20-40 years. In Delhi, our sarcoidosis clinic provides expert diagnosis, treatment, and long-term monitoring. Sarcoidosis presentation varies widely - some patients are asymptomatic with incidental findings, others have severe symptoms requiring aggressive treatment. Our pulmonologists work with ophthalmologists, cardiologists, and neurologists managing extra-pulmonary manifestations. Many sarcoidosis cases resolve spontaneously, but persistent or progressive disease requires immunosuppressive therapy to prevent organ damage.",
      causes: "Sarcoidosis cause remains unknown. Current theories suggest abnormal immune response to environmental triggers in genetically susceptible individuals. Potential triggers include bacteria, viruses, dust, chemicals, or organic antigens. Genetic factors are evident - familial clustering occurs, and certain HLA types increase risk. Sarcoidosis is more common in specific populations suggesting genetic-environmental interactions. Immune system dysregulation leads to excessive granuloma formation. Unlike infection-related granulomas, sarcoidosis granulomas are non-caseating (no necrosis). Environmental factors possibly relevant to Delhi include air pollution, occupational exposures, or infectious agents. Notably, sarcoidosis rarely occurs in smokers - paradoxically, smoking appears protective. Research continues investigating microbial antigens, autoimmune mechanisms, and genetic markers hoping to unravel this mysterious disease.",
      symptoms: [
        "Persistent dry cough",
        "Shortness of breath, especially with exertion",
        "Chest discomfort or pain",
        "Extreme fatigue and lack of energy",
        "Night sweats and low-grade fever",
        "Unintended weight loss",
        "Skin lesions or rashes (erythema nodosum, lupus pernio)",
        "Red, painful eyes or blurred vision (uveitis)",
        "Swollen lymph nodes, particularly in neck and chest",
        "Joint pain and swelling (Löfgren's syndrome)",
        "Heart palpitations or dizziness (cardiac involvement)",
        "Neurological symptoms like headache, facial weakness (neurosarcoidosis)"
      ],
      diagnosis: "Sarcoidosis diagnosis requires excluding other granulomatous diseases including tuberculosis, fungal infections, and malignancy. Chest X-ray often reveals bilateral hilar lymphadenopathy with or without lung infiltrates. High-resolution CT provides detailed assessment of lymph nodes, lung parenchyma, and fibrosis. Pulmonary function tests may show restrictive pattern or isolated reduced diffusion capacity. Bronchoscopy with bronchoalveolar lavage typically demonstrates lymphocytic inflammation with elevated CD4/CD8 ratio. Endobronchial ultrasound-guided transbronchial needle aspiration (EBUS-TBNA) samples mediastinal lymph nodes revealing non-caseating granulomas confirming diagnosis. Biopsy is crucial - granulomas without necrosis distinguish sarcoidosis from TB. Blood tests show elevated ACE levels and hypercalcemia in some cases. Ophthalmologic examination screens for uveitis. ECG and echocardiography detect cardiac involvement. PET scan identifies active disease sites guiding treatment decisions and monitoring response.",
      treatment: "Many sarcoidosis patients (30-50%) experience spontaneous remission without treatment and require only observation. Treatment indications include symptomatic lung disease, declining lung function, cardiac or neurological involvement, progressive eye disease, or hypercalcemia. Corticosteroids are first-line therapy - prednisone starting at higher doses then tapering over months. Treatment duration typically 12-24 months, though some require longer. Monitoring includes symptom assessment, lung function tests, and chest imaging every 3-6 months. Steroid-sparing agents for those requiring prolonged treatment or experiencing side effects include methotrexate, azathioprine, mycophenolate, or leflunomide. Severe refractory sarcoidosis may need anti-TNF biologics like infliximab. Hydroxychloroquine helps skin and joint manifestations. Symptomatic treatment addresses cough, pain, and fatigue. Vitamin D supplementation is avoided due to hypercalcemia risk. We monitor for treatment complications including infections, diabetes, osteoporosis, and adrenal suppression. Lifestyle modifications include avoiding excessive sun exposure and calcium-rich foods. Long-term follow-up is essential as relapses occur in 30% after stopping treatment.",
      whyChooseUs: "Our Delhi sarcoidosis center has pulmonologists experienced managing this complex, unpredictable disease. We perform EBUS-TBNA providing tissue diagnosis without surgical procedures, with on-site cytopathology ensuring adequate samples. Our multidisciplinary sarcoidosis clinic includes pulmonology, ophthalmology, cardiology, neurology, and dermatology ensuring comprehensive evaluation and management. We utilize PET-CT scanning for unclear cases or monitoring treatment response. Experience with steroid-sparing immunosuppressants and biologic therapies helps patients requiring long-term treatment while minimizing steroid toxicity. Our treatment protocols balance disease control against side effects, avoiding over-treatment in mild cases while aggressively managing severe manifestations. We provide bone density screening, diabetes monitoring, and infection prophylaxis during immunosuppression. Patient education about disease variability, treatment expectations, and relapse recognition empowers informed decision-making. Support group connections with other sarcoidosis patients provide psychological support. Long-term follow-up protocols ensure early detection of relapses or treatment complications. Research participation opportunities access novel therapies and contribute to understanding this enigmatic disease.",
      faqs: [
        {
          question: "Will sarcoidosis go away on its own?",
          answer: "Yes, in 30-50% of cases, sarcoidosis resolves spontaneously within 2-3 years without treatment, particularly Löfgren's syndrome (acute onset with fever, arthritis, and erythema nodosum). However, chronic sarcoidosis persisting beyond 2 years rarely remits spontaneously and typically requires treatment. Regular monitoring determines if treatment is necessary."
        },
        {
          question: "How long do I need to take steroids for sarcoidosis?",
          answer: "Treatment duration varies individually based on disease severity and response. Typical courses last 12-24 months with gradual tapering. Some patients relapse during tapering requiring prolonged treatment. Steroid-sparing agents allow lower steroid doses minimizing side effects. Never stop steroids abruptly - gradual withdrawal prevents adrenal crisis."
        },
        {
          question: "Can sarcoidosis affect organs besides lungs?",
          answer: "Yes, sarcoidosis is multi-system disease potentially affecting any organ. Besides lungs (90%), commonly involves eyes (25%), skin (25%), liver, heart (5%), nervous system (5-15%), kidneys, and bones. Cardiac and neurosarcoidosis are most serious requiring aggressive treatment. Comprehensive evaluation assesses extra-pulmonary involvement guiding management."
        },
        {
          question: "Is sarcoidosis life-threatening?",
          answer: "Most sarcoidosis patients have good prognosis living normal lifespans. However, 5-10% develop severe disease with significant morbidity or mortality. Cardiac sarcoidosis causes life-threatening arrhythmias or heart failure. Advanced pulmonary fibrosis leads to respiratory failure. Neurosarcoidosis causes serious neurological deficits. Early diagnosis and appropriate treatment prevent serious complications in most cases."
        }
      ]
    },
    "pleural-diseases": {
      title: "Pleural Diseases Treatment in Delhi – Effusion & Pneumothorax Care",
      heroImage: pleuralHero,
      introduction: "Pleural diseases affect the pleura, thin membranes surrounding lungs and lining chest cavity. Common pleural conditions include pleural effusion (fluid accumulation), pneumothorax (air in pleural space causing lung collapse), empyema (infected fluid), and pleurisy (inflammation causing chest pain). Our Delhi pleural disease center provides expert diagnosis through ultrasound-guided procedures and comprehensive treatment including thoracentesis, chest tube insertion, and pleurodesis when needed. Pleural diseases cause significant breathing difficulty and chest pain requiring prompt intervention. Our pulmonologists have extensive experience performing pleural procedures safely, analyzing pleural fluid to determine causes, and managing complex cases including malignant effusions and recurrent pneumothorax.",
      causes: "Pleural effusion causes include heart failure (most common), pneumonia/parapneumonic effusion, malignancy (lung cancer, breast cancer, lymphoma), pulmonary embolism, tuberculosis, cirrhosis, kidney disease, and autoimmune conditions. Transudative effusions result from increased hydrostatic pressure or decreased oncotic pressure (heart failure, cirrhosis). Exudative effusions stem from increased capillary permeability (infection, malignancy, inflammation). Pneumothorax occurs spontaneously in tall, thin young adults (primary spontaneous), or secondary to underlying lung disease (COPD, asthma, cystic fibrosis, TB), chest trauma, or medical procedures. Empyema develops when pneumonia spreads to pleural space or follows chest surgery/trauma. Pleurisy results from viral infections, pneumonia, pulmonary embolism, or autoimmune diseases. In Delhi, TB remains an important cause of exudative effusions and empyema requiring high diagnostic suspicion.",
      symptoms: [
        "Sharp, stabbing chest pain worsening with deep breathing or coughing",
        "Shortness of breath and difficulty breathing deeply",
        "Dry cough",
        "Feeling of chest tightness or pressure",
        "Pain that may radiate to shoulder or back",
        "Rapid, shallow breathing (tachypnea)",
        "Fever (with infectious causes like empyema)",
        "Decreased breath sounds on affected side",
        "Asymmetric chest movement (pneumothorax)",
        "Sudden onset of symptoms (spontaneous pneumothorax)"
      ],
      diagnosis: "Pleural disease diagnosis begins with careful history and physical examination. Chest X-ray reveals fluid levels (effusion) or lung collapse with absent lung markings (pneumothorax). Lateral decubitus X-rays detect small effusions. Chest ultrasound accurately identifies and quantifies fluid, guiding safe thoracentesis. CT scan provides detailed evaluation of pleural abnormalities, underlying lung disease, and chest wall involvement. Thoracentesis (pleural fluid removal) is both diagnostic and therapeutic. Fluid analysis includes appearance, protein, LDH, glucose, pH, cell count, cytology, and cultures. Light's criteria distinguish transudates from exudates guiding cause identification. Pleural fluid cytology detects malignant cells. TB testing includes AFB smear, culture, and GeneXpert. Pleural biopsy through closed needle technique or thoracoscopy provides tissue diagnosis when fluid analysis is inconclusive. Blood tests include complete count, kidney/liver function, and cardiac markers. Echocardiography assesses heart failure.",
      treatment: "Treatment depends on underlying cause and severity. Small asymptomatic effusions from heart failure or cirrhosis are managed medically with diuretics and treating underlying condition. Larger symptomatic effusions require thoracentesis removing up to 1.5 liters providing immediate relief. Parapneumonic effusions need antibiotics; complicated effusions or empyema require chest tube drainage. Malignant effusions causing repeated fluid reaccumulation benefit from pleurodesis - instilling talc or other agents creating pleural symphysis preventing re-accumulation. Recurrent malignant effusions may need tunneled pleural catheter allowing home drainage. Small pneumothorax (<20%) in stable patients can be observed with supplemental oxygen accelerating air reabsorption. Larger or symptomatic pneumothorax requires chest tube insertion re-expanding lung. Recurrent pneumothorax warrants video-assisted thoracoscopic surgery (VATS) with pleurodesis or wedge resection preventing future episodes. TB-related pleural disease receives standard anti-TB therapy. Pleurisy treatment focuses on underlying cause plus NSAIDs for pain. We perform procedures under ultrasound guidance maximizing safety and success. Post-procedure chest X-rays confirm proper tube placement and lung re-expansion.",
      whyChooseUs: "Our Delhi pleural disease center performs over 500 pleural procedures annually, providing extensive experience with complex cases. We utilize bedside ultrasound for all procedures significantly reducing complication rates compared to landmark-based techniques. Our pulmonologists are trained in advanced pleural procedures including medical thoracoscopy, indwelling pleural catheter insertion, and ultrasound-guided pleural biopsy. We have dedicated pleural procedure suite equipped with monitoring, ultrasound machines, and resuscitation equipment ensuring patient safety. Comprehensive pleural fluid analysis performed in-house includes microbiological, biochemical, and cytological studies with rapid results. For malignant effusions, our oncology collaboration ensures integrated cancer care and palliative support. TB expertise ensures appropriate diagnosis and treatment of tuberculous pleuritis common in Delhi. Our chest tube management protocols minimize pain and infection while promoting rapid lung re-expansion. For recurrent issues, we offer definitive treatments including VATS and pleurodesis. Post-procedure follow-up includes chest X-rays, symptom monitoring, and underlying condition management. Patient education covers warning signs requiring emergency care.",
      faqs: [
        {
          question: "Is thoracentesis (fluid removal) painful?",
          answer: "Thoracentesis involves local anesthesia making the procedure minimally uncomfortable. You may feel pressure during needle insertion and fluid drainage but not significant pain. The procedure takes 10-15 minutes. Most patients report immediate breathing relief outweighing any discomfort. Post-procedure soreness is mild and resolves quickly."
        },
        {
          question: "Will pleural effusion come back after drainage?",
          answer: "Recurrence depends on underlying cause. Effusions from treated pneumonia rarely recur. Heart failure or cirrhosis effusions may recur requiring ongoing medical management. Malignant effusions frequently reaccumulate - pleurodesis or indwelling catheter prevents repeated procedures. Treating underlying cause is key to preventing recurrence."
        },
        {
          question: "How long does chest tube stay in for pneumothorax?",
          answer: "Chest tube duration varies by pneumothorax size and air leak persistence. Simple pneumothorax typically requires 2-4 days until lung fully re-expands and air leak stops. Complex cases with persistent air leaks may need 5-7 days or longer. We remove tubes once lung is expanded and air leak resolved, confirmed by chest X-ray."
        },
        {
          question: "Can I fly with history of pneumothorax?",
          answer: "After treated pneumothorax, wait at least 2 weeks before flying. Airline cabin pressure changes can precipitate re-collapse. For recurrent pneumothorax, undergo definitive surgical treatment (pleurodesis) before flying. Always discuss air travel plans with your pulmonologist who can assess individual risk and provide medical clearance when appropriate."
        }
      ]
    },
    "flu-treatment": {
      title: "Influenza Treatment in Delhi – Advanced Care for Seasonal Flu",
      heroImage: fluHero,
      introduction: "Influenza is a highly contagious viral respiratory infection causing significant illness annually, particularly during Delhi's winter months. While often called 'flu', true influenza is more severe than common cold, causing high fever, body aches, and potential serious complications including pneumonia. Our flu treatment center provides rapid diagnosis through PCR testing, antiviral medications when appropriate, and comprehensive supportive care. High-risk groups including elderly, young children, pregnant women, and those with chronic diseases require special attention. Prompt recognition and treatment within 48 hours of symptom onset maximize antiviral effectiveness. Prevention through annual vaccination remains most effective strategy reducing infection risk and severity.",
      causes: "Influenza results from infection by influenza viruses - types A, B, and C. Type A causes most seasonal epidemics and pandemics due to frequent genetic changes. Influenza spreads through respiratory droplets when infected individuals cough, sneeze, or talk. Virus can survive on surfaces for hours, transmitted by touching contaminated objects then touching face. Peak transmission occurs in winter months (November-February in Delhi) when people congregate indoors with poor ventilation. Infected individuals are contagious 1 day before symptoms appear and 5-7 days after onset - children and immunocompromised may shed virus longer. Crowded environments like schools, offices, and public transport facilitate spread. Risk factors for complications include age extremes (under 5, over 65), pregnancy, chronic diseases (asthma, COPD, diabetes, heart disease, kidney disease), immunosuppression, obesity, and conditions affecting breathing or secretion clearance. Annual flu vaccines protect against predicted circulating strains.",
      symptoms: [
        "Sudden onset high fever (usually 101-104°F)",
        "Severe body aches and muscle pain (myalgia)",
        "Extreme fatigue and weakness",
        "Dry cough (may become productive)",
        "Sore throat and hoarseness",
        "Headache, often severe",
        "Chills and sweats",
        "Runny or stuffy nose",
        "Loss of appetite",
        "Occasionally nausea, vomiting, or diarrhea (more common in children)"
      ],
      diagnosis: "Influenza diagnosis is often clinical during flu season - sudden fever, cough, body aches strongly suggest flu. However, confirmation requires laboratory testing especially for high-risk patients or hospitalized cases. Rapid influenza diagnostic tests (RIDTs) provide results in 15-30 minutes but have limited sensitivity. Reverse transcriptase polymerase chain reaction (RT-PCR) is gold standard, highly sensitive and specific, identifying flu type and subtype within hours - we use this as primary diagnostic tool. Nasopharyngeal swabs collect specimen. Testing is most useful within first 3-4 days of symptoms. Chest X-ray for patients with breathing difficulty identifies bacterial pneumonia complicating influenza. Complete blood count typically shows normal or low white cells. Pulse oximetry monitors oxygen levels - desaturation indicates severe disease. For hospitalized patients, blood cultures rule out bacterial co-infection. Distinguishing flu from COVID-19 requires specific testing as symptoms overlap significantly.",
      treatment: "Antiviral medications are most effective when started within 48 hours of symptom onset. Oseltamivir (Tamiflu) oral treatment for 5 days reduces illness duration, severity, and complications. High-risk patients and those with severe disease benefit most from antivirals. Alternative antivirals include zanamivir inhaled, peramivir IV, or baloxavir single-dose oral. Supportive care includes rest, adequate hydration, and fever reducers (acetaminophen or ibuprofen - avoid aspirin in children due to Reye's syndrome risk). Cough suppressants and decongestants provide symptom relief. Most otherwise healthy individuals recover at home within 3-7 days. Hospitalization is needed for severe cases with respiratory distress, dehydration, confusion, or complications. Oxygen therapy, IV fluids, and respiratory support are provided as needed. Secondary bacterial pneumonia requires antibiotics. Mechanical ventilation for respiratory failure. Prevention is key - annual flu vaccination before flu season provides 40-60% protection and significantly reduces severe disease even when vaccine-virus mismatch occurs. Hand hygiene, respiratory etiquette, and avoiding sick contacts reduce transmission.",
      whyChooseUs: "Our Delhi flu treatment center offers same-day appointments during flu season with immediate RT-PCR testing providing accurate diagnosis within hours. This rapid turnaround enables timely antiviral initiation optimizing effectiveness. We stock adequate antivirals including alternatives for resistant strains or drug intolerances. Our pulmonologists distinguish uncomplicated flu from pneumonia or other serious complications requiring different management. For high-risk patients, we provide close monitoring and early intervention preventing hospitalization. Our emergency services handle severe cases with respiratory support capabilities. We administer annual flu vaccinations using quadrivalent vaccines protecting against four influenza strains. Special vaccination clinics accommodate large numbers during pre-flu season months (September-November). We provide vaccination education addressing common misconceptions and emphasizing importance for high-risk groups. Post-flu recovery assessment ensures complete resolution without persistent lung damage. We coordinate with employers and schools providing documentation for sick leave and return-to-work guidance. Public health reporting of influenza cases aids surveillance helping predict and prepare for seasonal peaks.",
      faqs: [
        {
          question: "What's the difference between flu and common cold?",
          answer: "Flu causes sudden onset high fever, severe body aches, extreme fatigue, and typically more severe symptoms. Colds develop gradually with milder symptoms - runny nose, sneezing, sore throat - rarely high fever or severe body aches. Flu carries higher complication risks requiring medical attention, while colds are usually self-limited."
        },
        {
          question: "Should I get flu vaccine every year?",
          answer: "Yes! Annual vaccination is essential because influenza viruses constantly change and vaccine-induced immunity wanes over time. Each year's vaccine targets predicted circulating strains. Vaccination is especially important for high-risk groups, healthcare workers, and those in close contact with vulnerable individuals. Get vaccinated before flu season begins (September-November)."
        },
        {
          question: "When should I see a doctor for flu?",
          answer: "High-risk individuals should seek care within 48 hours of symptom onset for antiviral consideration. Anyone with severe symptoms - difficulty breathing, chest pain, persistent high fever, confusion, severe weakness, or worsening after initial improvement - needs immediate medical evaluation. Otherwise healthy adults may manage mild flu at home with supportive care."
        },
        {
          question: "Can antibiotics treat flu?",
          answer: "No, antibiotics don't work against viral infections like flu. Antibiotics are only needed if bacterial pneumonia or other bacterial complications develop. Overusing antibiotics contributes to resistance and causes unnecessary side effects. Antiviral medications (oseltamivir, zanamivir) specifically target influenza virus and should be used instead."
        }
      ]
    }
  };

  const condition = slug ? conditionDetails[slug] : null;

  if (!condition) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Condition not found</h1>
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
          style={{ backgroundImage: `url(${condition.heroImage})` }}
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
                <span className="text-white font-livvic text-sm">Current Condition</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-lexend max-w-4xl leading-tight">
                {condition.title}
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

        {/* Introduction */}
        <section className="py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-lexend">About This Condition</h2>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {condition.introduction}
              </p>
            </Card>
          </div>
        </section>

        {/* Causes & Risk Factors */}
        <section className="py-12 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-lung-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground font-lexend">Causes & Risk Factors</h2>
              </div>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {condition.causes}
              </p>
            </Card>
          </div>
        </section>

        {/* Symptoms */}
        <section className="py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-lung-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground font-lexend">Common Symptoms</h2>
              </div>
              <ul className="space-y-3">
                {condition.symptoms.map((symptom: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <ChevronRight className="h-5 w-5 text-lung-blue mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground font-livvic text-lg">{symptom}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Diagnosis & Tests */}
        <section className="py-12 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-lung-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground font-lexend">Diagnosis & Tests</h2>
              </div>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {condition.diagnosis}
              </p>
            </Card>
          </div>
        </section>

        {/* Treatment Options */}
        <section className="py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 font-lexend">Treatment Options</h2>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {condition.treatment}
              </p>
            </Card>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-lung-blue/10 to-lung-blue-dark/10 border-lung-blue/20">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 font-lexend">Why Choose Our Delhi Clinic</h2>
              <p className="text-muted-foreground font-livvic leading-relaxed text-lg">
                {condition.whyChooseUs}
              </p>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-lexend">Frequently Asked Questions</h2>
              <p className="text-muted-foreground font-livvic">Common questions about this condition</p>
            </div>
            
            <div className="space-y-6">
              {condition.faqs.map((faq: any, index: number) => (
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-lexend">Get Expert Care Today</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 font-livvic">
              Don't wait - early diagnosis and treatment lead to better outcomes
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/book-appointment">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Consultation
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

export default ConditionDetail;
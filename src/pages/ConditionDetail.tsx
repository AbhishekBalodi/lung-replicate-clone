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
import sleepApneaHero from "@/assets/conditions/sleep-apnea-hero.jpg";
import influenzaHero from "@/assets/conditions/influenza-hero.jpg";

const ConditionDetail = () => {
  const { slug } = useParams();

  const conditionDetails: Record<string, any> = {
    "copd-treatment": {
      title: "COPD Treatment in Delhi – Expert Care for Chronic Lung Disease",
      heroImage: copdHero,
      introduction: "Chronic Obstructive Pulmonary Disease (COPD) is a long-term lung condition that makes it difficult to breathe. In Delhi, where air pollution, smoking, and occupational hazards are common, COPD cases are rising every year. Without proper treatment, COPD can worsen over time and severely affect quality of life.",
      causes: "Long-term smoking (active or passive), Delhi's high levels of air pollution and smog, Long-term exposure to dust, chemicals, or workplace smoke, History of asthma or frequent lung infections, and Genetic deficiency (rare cases) are the major causes and risk factors for COPD.",
      symptoms: [
        "Persistent cough with mucus (chronic bronchitis)",
        "Shortness of breath, especially during physical activity",
        "Wheezing and chest tightness",
        "Frequent respiratory infections",
        "Fatigue and reduced stamina"
      ],
      diagnosis: "Our clinic uses advanced diagnostic tests for accurate COPD detection: Pulmonary Function Test (PFT) to check lung function, Chest X-ray or CT scan to see lung damage, Blood tests to check oxygen levels, and Six-minute walk test to evaluate breathing during exertion.",
      treatment: "Although COPD cannot be fully cured, it can be effectively managed with the right treatment: Inhalers and medications to relax airway muscles, Oxygen therapy for severe cases, Pulmonary rehabilitation programs for exercise and lifestyle training, Vaccinations (influenza, pneumonia) to prevent infections, and Smoking cessation support to stop further damage.",
      whyChooseUs: "Expert chest physician and pulmonologist with years of experience, Tailored treatment plans based on patient condition, Advanced facilities for PFT, bronchoscopy, and oxygen therapy, and Holistic care including rehab and lifestyle modification.",
      faqs: [
        {
          question: "Can COPD be cured?",
          answer: "No, but with the right treatment, patients can manage symptoms and live active lives."
        },
        {
          question: "Is Delhi's pollution making COPD worse?",
          answer: "Yes, poor air quality is a major trigger for COPD patients in Delhi."
        },
        {
          question: "Can exercise help in COPD?",
          answer: "Yes, supervised pulmonary rehab exercises improve lung function and stamina."
        },
        {
          question: "When should I see a doctor for COPD symptoms?",
          answer: "If you experience persistent cough with mucus, shortness of breath during daily activities, or frequent respiratory infections, consult a pulmonologist immediately."
        }
      ]
    },
    "asthma-treatment": {
      title: "Asthma Specialist in Delhi – Expert Care for Breathing Disorders",
      heroImage: asthmaHero,
      introduction: "Asthma is a chronic respiratory condition that causes inflammation and narrowing of the airways, leading to breathing difficulties. In Delhi, asthma is becoming increasingly common due to pollution, dust, and seasonal changes. If not treated properly, asthma can disrupt daily life and even cause emergencies.",
      causes: "Delhi air pollution (PM2.5, smog, vehicle smoke), Seasonal pollen and dust mites, Indoor smoke from cooking or incense, Viral infections (flu, cold), Strong odors, perfumes, or chemicals, and Family history of asthma or allergies are the major causes and triggers of asthma.",
      symptoms: [
        "Wheezing (whistling sound while breathing)",
        "Shortness of breath",
        "Chronic cough, especially at night or early morning",
        "Chest tightness or pain",
        "Fatigue during physical activities"
      ],
      diagnosis: "Our clinic uses advanced diagnostic tools: Pulmonary Function Test (PFT) to check lung function, Allergy Testing to identify asthma triggers, and Chest X-rays and blood tests to rule out infections.",
      treatment: "Asthma has no permanent cure, but with the right treatment, it can be well controlled. We provide: Inhaler-based medications (relievers and controllers), Allergy management to reduce triggers, Lifestyle counseling – avoiding pollutants and allergens, Emergency care for asthma attacks, and Pulmonary rehabilitation programs for long-term control.",
      whyChooseUs: "15+ years of experience in treating asthma patients, Focused care on pollution-related asthma triggers in Delhi, Patient education on inhaler technique and lifestyle management, and Easily accessible clinic with appointment flexibility.",
      faqs: [
        {
          question: "Can asthma be cured permanently?",
          answer: "Asthma cannot be cured, but it can be effectively controlled with proper treatment."
        },
        {
          question: "Does pollution in Delhi make asthma worse?",
          answer: "Yes, air pollution significantly increases asthma attacks, especially in winter."
        },
        {
          question: "Can children outgrow asthma?",
          answer: "Some children may improve as they grow older, but symptoms can return later in life."
        },
        {
          question: "Are asthma inhalers safe for long-term use?",
          answer: "Yes, inhaled medications are safe for daily use and are the most effective way to control asthma symptoms."
        }
      ]
    },
    "tb-treatment": {
      title: "Tuberculosis (TB) Specialist in Delhi – Expert Diagnosis & Complete Care",
      heroImage: tbHero,
      introduction: "Tuberculosis (TB) is an infectious disease caused by the bacteria Mycobacterium tuberculosis. It usually affects the lungs but can also spread to other parts of the body. Delhi continues to be one of the high-burden areas for TB due to dense population, pollution, and limited awareness. With early diagnosis and proper treatment, TB can be completely cured.",
      causes: "Direct contact with an infected person (airborne transmission), Weakened immune system (HIV, diabetes, malnutrition), Overcrowded living conditions (common in Delhi slums and urban areas), Smoking or alcohol abuse, and Poorly ventilated environments are the major causes and risk factors for TB.",
      symptoms: [
        "Persistent cough for more than 2 weeks",
        "Blood in sputum (hemoptysis)",
        "Unexplained weight loss",
        "Night sweats and fever",
        "Fatigue and chest pain"
      ],
      diagnosis: "Our clinic uses WHO-approved diagnostic methods: Sputum test (GeneXpert/CBNAAT) to detect TB bacteria, Chest X-ray / CT Scan to check lung damage, Mantoux/skin test for screening TB infection, and Blood tests to confirm active infection. Types of TB include Pulmonary TB (Affects the lungs), Extrapulmonary TB (Affects lymph nodes, bones, kidneys, or brain), and Drug-resistant TB (MDR-TB/XDR-TB) which is more difficult to treat.",
      treatment: "TB treatment involves a strict 6–9 month course of antibiotics. Our clinic provides: DOTS therapy (Directly Observed Treatment Short-course), Drug-resistant TB management (MDR/XDR), Nutritional counseling for recovery, and Supportive care for patients with HIV or diabetes.",
      whyChooseUs: "Experienced TB specialist in Delhi, Strict adherence to national TB program guidelines, Comprehensive care including counseling and monitoring, and Affordable treatment with patient follow-up.",
      faqs: [
        {
          question: "Can TB be completely cured?",
          answer: "Yes, with proper and timely treatment, TB can be cured."
        },
        {
          question: "Is TB contagious?",
          answer: "Yes, pulmonary TB is contagious. Proper treatment reduces risk quickly."
        },
        {
          question: "Can TB come back after treatment?",
          answer: "Yes, if the treatment is not completed or in case of weak immunity."
        },
        {
          question: "How long does TB treatment take?",
          answer: "Standard drug-sensitive TB requires 6-9 months of treatment. Drug-resistant TB may require 18-24 months."
        }
      ]
    },
    "pneumonia-treatment": {
      title: "Pneumonia Specialist in Delhi – Early Diagnosis & Advanced Treatment",
      heroImage: pneumoniaHero,
      introduction: "Pneumonia is a lung infection that causes inflammation in the air sacs (alveoli), which may fill with pus or fluid. It can be caused by bacteria, viruses, or fungi. In Delhi, pneumonia cases rise during winters and pollution-heavy months due to weakened immunity and poor air quality. Early treatment is essential to prevent complications.",
      causes: "Bacterial infections (Streptococcus pneumoniae, Mycoplasma pneumoniae), Viral infections (Influenza, COVID-19), Fungal pneumonia in immunocompromised patients, and Aspiration pneumonia due to swallowing problems. Risk Factors include Children below 5 years, Adults above 60 years, Patients with COPD, asthma, TB, diabetes, or weak immunity, Smokers and alcoholics, and People exposed to Delhi's air pollution and winter smog.",
      symptoms: [
        "Fever with chills",
        "Persistent cough with yellow/green sputum",
        "Chest pain while breathing or coughing",
        "Shortness of breath",
        "Fatigue and weakness"
      ],
      diagnosis: "At our Delhi clinic, we use: Chest X-ray and CT scans, Blood tests and sputum cultures, and Pulse oximetry to check oxygen levels.",
      treatment: "Antibiotics (for bacterial pneumonia), Antivirals/antifungals (depending on cause), Oxygen therapy for low oxygen levels, IV fluids and hospitalization in severe cases, and Pulmonary rehabilitation after recovery for long-term lung health.",
      whyChooseUs: "Experienced pneumonia specialist in Delhi, Quick diagnosis and personalized treatment plans, Affordable care with follow-up monitoring, and Home care guidance for faster recovery.",
      faqs: [
        {
          question: "Can pneumonia be prevented?",
          answer: "Yes, through flu vaccines, pneumonia vaccines, and lifestyle precautions."
        },
        {
          question: "Is pneumonia contagious?",
          answer: "Yes, bacterial and viral pneumonia can spread through coughing or sneezing."
        },
        {
          question: "Can pneumonia cause long-term lung damage?",
          answer: "Severe pneumonia may cause scarring, but early treatment prevents complications."
        },
        {
          question: "How long does pneumonia recovery take?",
          answer: "Mild pneumonia treated as outpatient typically improves within 1-2 weeks. Severe cases may take 4-6 weeks for complete recovery."
        }
      ]
    },
    "sarcoidosis-treatment": {
      title: "Sarcoidosis Specialist in Delhi – Advanced Lung & Multi-Organ Care",
      heroImage: sarcoidosisHero,
      introduction: "Sarcoidosis is a rare inflammatory disease where clusters of immune cells (granulomas) form in organs, commonly the lungs and lymph nodes. In Delhi, exposure to pollution, dust, and environmental triggers may exacerbate lung sarcoidosis symptoms. Early diagnosis and expert care can prevent long-term organ damage.",
      causes: "Exact cause unknown; possibly an immune response to environmental or infectious triggers, Genetic predisposition, Exposure to dust, mold, chemicals, and Commonly affects adults aged 20–50.",
      symptoms: [
        "Persistent dry cough and shortness of breath",
        "Fatigue, fever, and weight loss",
        "Skin rashes or lesions",
        "Swollen lymph nodes",
        "Chest pain and occasional heart/liver involvement"
      ],
      diagnosis: "Accurate diagnosis requires multiple tests: Chest X-ray and CT scan to detect lung involvement, Pulmonary function tests (PFTs) to assess breathing capacity, Blood tests to check for inflammation markers, and Biopsy of affected tissue to confirm granulomas.",
      treatment: "Corticosteroids to reduce inflammation, Immunosuppressive medications for severe cases, Symptomatic management (oxygen therapy, pulmonary rehab), and Regular monitoring to prevent organ damage. While some cases resolve spontaneously, others require long-term management.",
      whyChooseUs: "Expert pulmonologist and multi-organ care specialists, Advanced imaging and biopsy facilities, Personalized treatment plans with follow-up monitoring, and Supportive care to manage fatigue, cough, and organ involvement.",
      faqs: [
        {
          question: "Can sarcoidosis be cured?",
          answer: "While some cases resolve spontaneously, others require long-term management."
        },
        {
          question: "Is sarcoidosis contagious?",
          answer: "No, sarcoidosis is not infectious or contagious."
        },
        {
          question: "Can sarcoidosis affect other organs?",
          answer: "Yes, it can affect the heart, liver, eyes, and skin."
        },
        {
          question: "How long do I need to take steroids for sarcoidosis?",
          answer: "Treatment duration varies individually based on disease severity and response. Typical courses last 12-24 months with gradual tapering."
        }
      ]
    },
    "pleural-diseases": {
      title: "Expert Treatment for Pleural Diseases in Delhi – Effusion & Pneumothorax",
      heroImage: pleuralHero,
      introduction: "Pleural diseases affect the thin membrane (pleura) surrounding the lungs and chest cavity. Conditions like pleural effusion (fluid accumulation) and pneumothorax (air in the pleural space) can cause severe breathing difficulties if untreated. In Delhi, high pollution, chronic lung infections, and post-TB complications make pleural disease management increasingly important.",
      causes: "Lung infections (pneumonia, TB), Chronic lung diseases (COPD, interstitial lung disease), Trauma or injury to the chest, Post-surgical complications, and Cancer affecting the lungs or pleura. Pleural Effusion is excess fluid builds up in the pleural space, compressing the lungs. Pneumothorax is air leaks into the pleural space, causing lung collapse partially or completely.",
      symptoms: [
        "Shortness of breath or difficulty breathing",
        "Sharp chest pain, especially on inspiration",
        "Persistent cough",
        "Rapid heart rate and fatigue",
        "Swelling in legs or abdomen (in effusion due to heart/liver issues)"
      ],
      diagnosis: "Our clinic provides advanced diagnostics for pleural diseases, including: Chest X-ray and CT scan to detect fluid or air, Ultrasound-guided pleural fluid analysis, Thoracentesis for fluid drainage and testing, and Pleural biopsy for suspected malignancy or infection.",
      treatment: "Pleural Effusion: Fluid drainage (thoracentesis), medications, treatment of underlying cause. Pneumothorax: Observation for small cases, chest tube insertion, or surgery for recurrent cases. Oxygen therapy and supportive care as required, and Pulmonary rehabilitation for recovery.",
      whyChooseUs: "Supervised by experienced chest physician and pulmonologist, Advanced imaging and pleural intervention facilities, Safe, minimally invasive procedures, and Post-treatment care and rehabilitation.",
      faqs: [
        {
          question: "Are pleural effusion and pneumothorax dangerous?",
          answer: "Yes, if untreated, both can lead to respiratory failure."
        },
        {
          question: "How long is recovery?",
          answer: "Recovery depends on underlying cause; most patients improve in 1–4 weeks post-procedure."
        },
        {
          question: "Can pleural diseases recur?",
          answer: "Yes, especially if underlying conditions like COPD or TB persist."
        },
        {
          question: "Is thoracentesis (fluid removal) painful?",
          answer: "Thoracentesis involves local anesthesia making the procedure minimally uncomfortable. Most patients report immediate breathing relief."
        }
      ]
    },
    "flu-treatment": {
      title: "Influenza (Flu) Specialist in Delhi – Fast Recovery & Prevention",
      heroImage: influenzaHero,
      introduction: "Influenza (flu) is a contagious viral infection affecting the respiratory system. In Delhi, flu outbreaks are common during winter and monsoon seasons. While most cases resolve in 1–2 weeks, severe influenza can lead to pneumonia, hospitalization, or worsening of chronic lung conditions. Early treatment is key to preventing complications.",
      causes: "Influenza viruses spread through droplets when an infected person coughs or sneezes. High-risk groups include children, elderly, pregnant women, and patients with chronic lung disease. Exposure to crowded areas and poor hygiene increases risk. Low immunity or recent viral infections also contribute.",
      symptoms: [
        "Fever, chills, and body aches",
        "Cough, sore throat, and runny nose",
        "Fatigue and weakness",
        "Headache and congestion",
        "Nausea or vomiting (in children)"
      ],
      diagnosis: "Rapid influenza diagnostic tests (RIDT), Clinical evaluation by a chest physician / pulmonologist, and Blood tests for severe or complicated cases.",
      treatment: "Antiviral medications (oseltamivir, zanamivir) within 48 hours of symptom onset, Supportive care: rest, hydration, fever control, Oxygen therapy in severe cases with respiratory distress, and Vaccination to prevent future infections.",
      whyChooseUs: "Expert management of seasonal flu and complications, Quick diagnosis and personalized treatment plans, Care for high-risk groups like COPD and asthma patients, and Guidance on flu prevention and vaccination.",
      faqs: [
        {
          question: "How long does the flu last?",
          answer: "Most healthy adults recover in 1–2 weeks with rest and treatment."
        },
        {
          question: "Can influenza lead to pneumonia?",
          answer: "Yes, especially in elderly, children, and patients with chronic lung disease."
        },
        {
          question: "Is flu vaccination necessary every year?",
          answer: "Yes, annual vaccination is recommended to protect against new flu strains."
        },
        {
          question: "What's the difference between flu and common cold?",
          answer: "Flu causes sudden onset high fever, severe body aches, and extreme fatigue. Colds develop gradually with milder symptoms."
        }
      ]
    },
    "sleep-apnea": {
      title: "Sleep Apnea Treatment in Delhi – Restore Healthy Sleep",
      heroImage: sleepApneaHero,
      introduction: "Sleep apnea is a common but serious sleep disorder where breathing repeatedly stops and starts during sleep. In Delhi, increasing stress, obesity, and pollution have contributed to rising cases. Untreated sleep apnea can lead to heart problems, high blood pressure, daytime fatigue, and reduced productivity. Our clinic provides expert sleep apnea diagnosis and treatment in Delhi.",
      causes: "Sleep apnea has two main types: Obstructive Sleep Apnea (OSA) caused by blocked airway during sleep, and Central Sleep Apnea where brain fails to send proper signals to breathing muscles.",
      symptoms: [
        "Loud, persistent snoring",
        "Pauses in breathing during sleep",
        "Excessive daytime sleepiness",
        "Morning headaches",
        "Difficulty concentrating or mood changes"
      ],
      diagnosis: "Our sleep study (polysomnography) evaluates: Breathing patterns and oxygen levels, Brain activity and heart rate, Snoring and body movements, and Sleep stages and disturbances.",
      treatment: "CPAP therapy (Continuous Positive Airway Pressure), Oral appliances to keep the airway open, Lifestyle modifications – weight loss, exercise, avoid alcohol/smoking, and Surgery (rare) for severe structural blockages.",
      whyChooseUs: "Experienced pulmonologist and sleep medicine specialist, Advanced diagnostic equipment, Personalized treatment plans for long-term results, and Convenient clinic with home sleep study options.",
      faqs: [
        {
          question: "Can sleep apnea be cured?",
          answer: "With proper management, symptoms can be controlled effectively."
        },
        {
          question: "Is CPAP therapy uncomfortable?",
          answer: "Most patients adapt quickly, and it significantly improves sleep quality."
        },
        {
          question: "Can children have sleep apnea?",
          answer: "Yes, pediatric sleep apnea is treated with specialized interventions."
        },
        {
          question: "Will I need CPAP therapy lifelong?",
          answer: "Many patients require long-term CPAP, but weight loss and lifestyle changes can sometimes reduce or eliminate the need."
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
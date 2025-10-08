import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, ArrowLeft } from "lucide-react";

const ConditionDetail = () => {
  const { slug } = useParams();

  const conditionDetails: Record<string, any> = {
    "copd-treatment": {
      title: "COPD Treatment in Delhi",
      description: "Helping patients breathe easier with advanced therapies for Chronic Obstructive Pulmonary Disease.",
      fullDescription: "Chronic Obstructive Pulmonary Disease (COPD) is a progressive lung disease that makes breathing difficult. Our comprehensive COPD treatment program combines medication, pulmonary rehabilitation, oxygen therapy, and lifestyle modifications to help you manage symptoms and improve quality of life.",
      symptoms: [
        "Shortness of breath during daily activities",
        "Chronic cough with mucus",
        "Wheezing",
        "Chest tightness",
        "Frequent respiratory infections"
      ],
      treatments: [
        "Bronchodilator medications",
        "Inhaled corticosteroids",
        "Pulmonary rehabilitation programs",
        "Oxygen therapy",
        "Smoking cessation support",
        "Breathing exercises and techniques"
      ],
      prevention: "The best way to prevent COPD is to never smoke or to quit smoking. Avoiding lung irritants and getting regular exercise also helps maintain lung health."
    },
    "asthma-treatment": {
      title: "Asthma Specialist in Delhi",
      description: "Individualized care for chronic and seasonal asthma with proven treatment protocols.",
      fullDescription: "Asthma is a chronic condition that causes inflammation and narrowing of the airways. Our asthma specialists provide personalized treatment plans including medications, trigger identification, and management strategies to help you live symptom-free.",
      symptoms: [
        "Wheezing or whistling sound when breathing",
        "Shortness of breath",
        "Chest tightness or pain",
        "Trouble sleeping due to breathing problems",
        "Coughing or wheezing attacks triggered by allergens"
      ],
      treatments: [
        "Quick-relief inhalers (bronchodilators)",
        "Long-term control medications",
        "Allergy medications",
        "Biologics for severe asthma",
        "Asthma action plan development",
        "Trigger avoidance strategies"
      ],
      prevention: "Identify and avoid asthma triggers, take medications as prescribed, monitor your breathing, and get regular checkups with your asthma specialist."
    },
    "tb-treatment": {
      title: "Tuberculosis (TB) Treatment in Delhi",
      description: "Evidence-based, complete TB care with DOTS therapy and comprehensive monitoring.",
      fullDescription: "Tuberculosis is a bacterial infection that primarily affects the lungs. Our TB treatment program follows WHO guidelines with Directly Observed Treatment Short-course (DOTS) therapy, ensuring complete cure and preventing drug resistance.",
      symptoms: [
        "Persistent cough lasting more than 3 weeks",
        "Coughing up blood or mucus",
        "Chest pain when breathing or coughing",
        "Unexplained weight loss",
        "Night sweats and fever",
        "Fatigue and loss of appetite"
      ],
      treatments: [
        "6-9 month course of antibiotics",
        "DOTS therapy with direct supervision",
        "Regular sputum tests to monitor progress",
        "Nutritional support",
        "Contact tracing and screening",
        "Drug-resistant TB management when needed"
      ],
      prevention: "Complete the full course of TB medication even if you feel better. BCG vaccination provides some protection. Avoid close contact with active TB patients during their infectious period."
    },
    "pneumonia-treatment": {
      title: "Pneumonia Treatment in Delhi",
      description: "Fast diagnosis and effective recovery plans for bacterial, viral, and fungal pneumonia.",
      fullDescription: "Pneumonia is an infection that inflames the air sacs in one or both lungs. Our rapid diagnosis and treatment approach helps prevent complications and ensures quick recovery through targeted antibiotics and supportive care.",
      symptoms: [
        "High fever and chills",
        "Cough with phlegm or pus",
        "Shortness of breath",
        "Chest pain when breathing or coughing",
        "Fatigue and weakness",
        "Nausea, vomiting, or diarrhea"
      ],
      treatments: [
        "Antibiotics for bacterial pneumonia",
        "Antiviral medications for viral pneumonia",
        "Antifungal therapy when needed",
        "Oxygen therapy if required",
        "IV fluids and medications",
        "Hospitalization for severe cases"
      ],
      prevention: "Get vaccinated against pneumonia (pneumococcal and flu vaccines). Practice good hygiene, don't smoke, and maintain a healthy immune system through proper nutrition and exercise."
    },
    "ild-treatment": {
      title: "Interstitial Lung Disease (ILD) Specialist in Delhi",
      description: "Comprehensive management of ILD with advanced diagnostic and treatment approaches.",
      fullDescription: "Interstitial Lung Disease encompasses over 200 disorders causing progressive scarring of lung tissue. Our ILD specialists use advanced diagnostics including high-resolution CT scans and lung biopsies to provide accurate diagnosis and personalized treatment.",
      symptoms: [
        "Progressive shortness of breath",
        "Dry, persistent cough",
        "Fatigue and weakness",
        "Weight loss",
        "Clubbing of fingers",
        "Chest discomfort"
      ],
      treatments: [
        "Anti-fibrotic medications",
        "Immunosuppressive therapy",
        "Oxygen therapy",
        "Pulmonary rehabilitation",
        "Lung transplant evaluation when appropriate",
        "Management of complications"
      ],
      prevention: "While many causes of ILD are unknown, avoiding environmental triggers, occupational exposures, and smoking can reduce risk. Early diagnosis and treatment can slow disease progression."
    },
    "sarcoidosis-treatment": {
      title: "Sarcoidosis Treatment in Delhi",
      description: "Specialized care for this rare lung condition with expert diagnosis and management.",
      fullDescription: "Sarcoidosis is a rare disease characterized by growth of tiny collections of inflammatory cells in various organs, most commonly the lungs. Our specialists provide expert diagnosis and treatment to manage this complex condition.",
      symptoms: [
        "Persistent dry cough",
        "Shortness of breath",
        "Chest pain",
        "Fatigue and weakness",
        "Fever and night sweats",
        "Skin rashes or lesions",
        "Eye inflammation"
      ],
      treatments: [
        "Corticosteroids to reduce inflammation",
        "Immunosuppressive medications",
        "Regular monitoring with imaging and lung function tests",
        "Treatment of specific organ involvement",
        "Symptom management",
        "Lifestyle modifications"
      ],
      prevention: "The exact cause of sarcoidosis is unknown, making prevention difficult. Regular follow-up and early treatment of flare-ups can prevent complications."
    },
    "pleural-diseases": {
      title: "Pleural Diseases (Effusion, Pneumothorax)",
      description: "Accurate diagnosis and expert treatment for pleural effusion, pneumothorax, and other pleural conditions.",
      fullDescription: "Pleural diseases affect the pleura, the thin tissue covering the lungs and chest cavity. We diagnose and treat conditions like pleural effusion (fluid buildup), pneumothorax (collapsed lung), and pleurisy with advanced techniques.",
      symptoms: [
        "Sharp chest pain that worsens with breathing",
        "Shortness of breath",
        "Dry cough",
        "Fever (in some cases)",
        "Rapid breathing",
        "Decreased breath sounds on affected side"
      ],
      treatments: [
        "Thoracentesis (fluid drainage)",
        "Chest tube insertion",
        "Pleurodesis to prevent recurrence",
        "Treatment of underlying cause",
        "Pain management",
        "Surgery for complicated cases"
      ],
      prevention: "Prompt treatment of pneumonia and chest infections can prevent some pleural diseases. Avoid smoking and seek immediate care for chest trauma."
    },
    "flu-treatment": {
      title: "Influenza / Seasonal Flu Treatment",
      description: "Advanced treatment to prevent complications from influenza virus infections.",
      fullDescription: "Influenza is a contagious respiratory illness that can cause mild to severe illness. Our rapid diagnosis and treatment approach helps prevent complications, especially in high-risk patients with existing lung conditions.",
      symptoms: [
        "Sudden onset of fever",
        "Body aches and headache",
        "Extreme fatigue",
        "Dry cough",
        "Sore throat",
        "Runny or stuffy nose",
        "Chills and sweats"
      ],
      treatments: [
        "Antiviral medications (most effective within 48 hours)",
        "Fever and pain relievers",
        "Rest and hydration",
        "Breathing treatments if needed",
        "Hospitalization for severe cases",
        "Prevention of secondary bacterial infections"
      ],
      prevention: "Annual flu vaccination is the best prevention. Practice good hygiene including frequent handwashing. Avoid close contact with sick people and stay home when you're ill."
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
      <div className="pt-32">
        {/* Breadcrumb */}
        <section className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" className="text-white/80 hover:text-white transition-colors font-livvic">Home</Link>
              <ChevronRight className="h-4 w-4 text-white/60" />
              <Link to="/services" className="text-white/80 hover:text-white transition-colors font-livvic">Services</Link>
              <ChevronRight className="h-4 w-4 text-white/60" />
              <span className="text-white font-livvic">{condition.title}</span>
            </div>
            <Link to="/services">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-lung-blue">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Button>
            </Link>
          </div>
        </section>

        {/* Condition Details */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-lexend">{condition.title}</h1>
            <p className="text-xl text-muted-foreground mb-8 font-livvic">{condition.description}</p>
            
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 font-lexend">About This Condition</h2>
              <p className="text-muted-foreground mb-6 font-livvic leading-relaxed">{condition.fullDescription}</p>
              
              <h3 className="text-xl font-bold text-foreground mb-4 font-lexend">Common Symptoms</h3>
              <ul className="space-y-2 mb-6">
                {condition.symptoms.map((symptom: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-lung-blue mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground font-livvic">{symptom}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-bold text-foreground mb-4 font-lexend">Treatment Options</h3>
              <ul className="space-y-2 mb-6">
                {condition.treatments.map((treatment: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-lung-blue mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground font-livvic">{treatment}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-bold text-foreground mb-4 font-lexend">Prevention & Management</h3>
              <p className="text-muted-foreground font-livvic leading-relaxed">{condition.prevention}</p>
            </Card>

            <div className="text-center">
              <Link to="/book-appointment">
                <Button size="lg" className="bg-lung-blue hover:bg-lung-blue-dark">
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ConditionDetail;
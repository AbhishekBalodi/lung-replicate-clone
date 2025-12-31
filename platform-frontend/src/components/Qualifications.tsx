import { GraduationCap, Award } from "lucide-react";
import { Card } from "./ui/card";
import { getDevTenantCode } from '@/components/DevTenantSwitcher';
import { useCustomAuth } from '@/contexts/CustomAuthContext';

const Qualifications = () => {
  const { tenantInfo } = useCustomAuth();
  const displayName = tenantInfo?.name || 'Dr. Paramjeet Singh Mann';
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-lung-blue/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-lexend">
            About {displayName}
          </h2>
          <p className="text-muted-foreground text-lg font-livvic max-w-3xl mx-auto">
            Over 40 years of distinguished service in respiratory medicine with prestigious qualifications from WHO-listed institutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 bg-lung-green/5 border-lung-green/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-lung-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-lung-green" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2 font-lexend">MD (Tuberculosis & Chest Diseases)</h3>
                <p className="text-lung-green font-medium mb-2">Vallabhbhai Patel Chest Institute, Delhi University</p>
                <p className="text-sm text-muted-foreground font-livvic">1988 | WHO Listed & MCI Recognized | Top Rank in University</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-lung-blue/5 border-lung-blue/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-lung-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-lung-blue" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2 font-lexend">FCCP Fellowship</h3>
                <p className="text-lung-blue font-medium mb-2">American College of Chest Physicians</p>
                <p className="text-sm text-muted-foreground font-livvic">2009 | USA | Fellowship Recognition</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-lung-green/5 border-lung-green/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-lung-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-lung-green" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2 font-lexend">Diploma (TB & Chest Diseases)</h3>
                <p className="text-lung-green font-medium mb-2">Vallabhbhai Patel Chest Institute, Delhi University</p>
                <p className="text-sm text-muted-foreground font-livvic">1985 | WHO Listed & MCI Recognized</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-lung-blue/5 border-lung-blue/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-lung-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-lung-blue" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2 font-lexend">MBBS</h3>
                <p className="text-lung-blue font-medium mb-2">Maulana Azad Medical College, Delhi University</p>
                <p className="text-sm text-muted-foreground font-livvic">1981 | WHO Listed & MCI Recognized</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-8 w-8 text-yellow-600" />
            <h3 className="text-2xl font-bold text-foreground font-lexend">Prestigious Awards & Honors</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-yellow-100 rounded-lg p-6">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <p className="font-bold text-foreground mb-2 font-livvic text-center">FCCP Fellowship (2009)</p>
              <p className="text-sm text-muted-foreground font-livvic text-center">American College of Chest Physicians, USA</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-6">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <p className="font-bold text-foreground mb-2 font-livvic text-center">Best Doctor Award (1998)</p>
              <p className="text-sm text-muted-foreground font-livvic text-center">South Sharquia Region, Sultanate of Oman</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-6">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <p className="font-bold text-foreground mb-2 font-livvic text-center">Rajshiri Dr. Ram Kishore Memorial Medal (1988)</p>
              <p className="text-sm text-muted-foreground font-livvic text-center">Top Candidate in MD, Delhi University</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Qualifications;
